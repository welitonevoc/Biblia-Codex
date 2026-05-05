import { db, auth } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  WriteBatch, 
  writeBatch,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { storage } from '../StorageService';
import { Bookmark, Note } from '../types';
import { useUserStore } from '../stores/userStore';

class SyncService {
  private isSyncing = false;

  /**
   * Sincroniza todos os dados (Marcadores, Notas e Perfil do Usuário)
   */
  async syncAll(): Promise<{ success: boolean; message: string }> {
    if (this.isSyncing) return { success: false, message: 'Já está sincronizando...' };
    if (!auth?.currentUser) return { success: false, message: 'Usuário não logado.' };
    if (!db) return { success: false, message: 'Firebase não configurado.' };

    this.isSyncing = true;
    try {
      const userId = auth.currentUser.uid;
      
      await Promise.all([
        this.syncCollection<Bookmark>('bookmarks', userId),
        this.syncCollection<Note>('notes', userId),
        this.syncUserProfile(userId)
      ]);

      return { success: true, message: 'Sincronização concluída com sucesso!' };
    } catch (error: any) {
      console.error('Erro na sincronização:', error);
      return { success: false, message: `Erro: ${error.message}` };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sincroniza o perfil do usuário (gamificação)
   */
  private async syncUserProfile(userId: string) {
    if (!db) return;

    try {
      const userStore = useUserStore.getState();
      const localData = userStore.toFirestore();
      const cloudPath = `users/${userId}/profile/data`;
      
      const cloudDoc = await getDoc(doc(db, cloudPath));
      const cloudData = cloudDoc.exists() ? cloudDoc.data() : null;
      
      const localUpdated = localData.updatedAt || 0;
      const cloudUpdated = cloudData?.updatedAt?.toMillis?.() || cloudData?.updatedAt || 0;
      
      if (localUpdated >= cloudUpdated) {
        await setDoc(doc(db, cloudPath), {
          ...localData,
          syncAt: Timestamp.now()
        }, { merge: true });
        console.log('[SyncService] Perfil uploaded para Firestore');
      } else if (cloudUpdated > localUpdated) {
        userStore.loadFromFirestore(cloudData);
        console.log('[SyncService] Perfil downloaded do Firestore');
      }
    } catch (error) {
      console.log('[SyncService] Profile sync skipped:', error);
    }
  }

  /**
   * Sincroniza uma coleção específica (Marcadores ou Notas)
   * Estratégia: Mesclagem baseada em updatedAt (quem for mais novo vence)
   */
  private async syncCollection<T extends { id: string; updatedAt: number }>(
    collectionName: string,
    userId: string
  ) {
    if (!db) return;

    // 1. Obter dados locais
    const localItems = collectionName === 'bookmarks' 
      ? await storage.getBookmarks() 
      : await storage.getNotes();
    
    const localMap = new Map<string, T>(localItems.map(item => [item.id, item as unknown as T]));

    // 2. Obter dados da nuvem
    const cloudPath = `users/${userId}/${collectionName}`;
    const cloudSnap = await getDocs(collection(db, cloudPath));
    const cloudItems = cloudSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as T));
    
    const batch = writeBatch(db);
    let hasChanges = false;

    // 3. Comparar local -> nuvem (Upload)
    for (const local of localItems as unknown as T[]) {
      const cloud = cloudItems.find(c => c.id === local.id);
      if (!cloud || local.updatedAt > (cloud.updatedAt || 0)) {
        const docRef = doc(db, cloudPath, local.id);
        batch.set(docRef, { ...local, syncAt: Timestamp.now() }, { merge: true });
        hasChanges = true;
      }
    }

    // 4. Comparar nuvem -> local (Download)
    for (const cloud of cloudItems) {
      const local = localMap.get(cloud.id);
      if (!local || cloud.updatedAt > (local.updatedAt || 0)) {
        if (collectionName === 'bookmarks') {
          await (storage as any)._saveBookmarkRaw(cloud as unknown as Bookmark);
        } else {
          await (storage as any)._saveNoteRaw(cloud as unknown as Note);
        }
      }
    }

    if (hasChanges) {
      await batch.commit();
    }
  }

  /**
   * Push único para alteração imediata (opcional, para real-time)
   */
  async pushItem(type: 'bookmarks' | 'notes', item: any) {
    if (!auth?.currentUser || !db) return;
    try {
      const userId = auth.currentUser.uid;
      const docRef = doc(db, `users/${userId}/${type}`, item.id);
      await setDoc(docRef, { ...item, syncAt: Timestamp.now() }, { merge: true });
    } catch (e) {
      console.error('Falha no push individual:', e);
    }
  }
}

export const syncService = new SyncService();
