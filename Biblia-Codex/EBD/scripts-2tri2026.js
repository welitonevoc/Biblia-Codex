/**
 * EBD Magazine - JavaScript Otimizado
 * 2º Trimestre 2026 - Performance Optimized
 */

// =====================================================
// STATE MANAGEMENT
// =====================================================
const state = {
    currentPage: 0,
    totalPages: 0,
    fontSize: 100,
    sidebarOpen: false,
    bookmarks: JSON.parse(localStorage.getItem('ebd-bookmarks') || '[]'),
    highlights: JSON.parse(localStorage.getItem('ebd-highlights') || '{}')
};

// =====================================================
// PAGE NAVIGATION
// =====================================================
function showPage(pageIndex) {
    const pages = document.querySelectorAll('.magazine-page');
    const totalPages = pages.length;
    
    if (pageIndex < 0 || pageIndex >= totalPages) return;
    
    const currentPage = document.querySelector('.magazine-page:not(.hidden-center):not(.hidden-left):not(.hidden-right)');
    const targetPage = document.getElementById(`page-${pageIndex}`);
    
    if (!targetPage) return;
    
    // Determine direction
    const direction = pageIndex > state.currentPage ? 1 : -1;
    
    // Animate current page out
    if (currentPage) {
        currentPage.classList.add(direction > 0 ? 'hidden-left' : 'hidden-right');
        currentPage.classList.remove('hidden-center');
    }
    
    // Animate target page in
    targetPage.classList.remove('hidden-left', 'hidden-right', 'hidden-center');
    targetPage.style.opacity = '0';
    targetPage.style.transform = `translateX(${direction * 100}%)`;
    
    requestAnimationFrame(() => {
        targetPage.style.transition = 'transform 0.4s ease-out, opacity 0.4s ease-out';
        targetPage.style.transform = 'translateX(0)';
        targetPage.style.opacity = '1';
    });
    
    state.currentPage = pageIndex;
    updateNavigation();
    updateBookmarkIcon();
    closeSidebar();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateNavigation() {
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    
    if (btnPrev) btnPrev.disabled = state.currentPage === 0;
    if (btnNext) btnNext.disabled = state.currentPage === state.totalPages - 1;
}

// =====================================================
// SIDEBAR MANAGEMENT
// =====================================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    
    state.sidebarOpen = !state.sidebarOpen;
    sidebar.style.transform = state.sidebarOpen ? 'translateX(0)' : 'translateX(-100%)';
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        state.sidebarOpen = false;
        sidebar.style.transform = 'translateX(-100%)';
    }
}

// =====================================================
// FONT SIZE CONTROL
// =====================================================
function changeFontSize(delta) {
    state.fontSize = Math.max(80, Math.min(150, state.fontSize + delta));
    document.documentElement.style.setProperty('--reader-font-size', `${state.fontSize}%`);
    localStorage.setItem('ebd-font-size', state.fontSize);
}

// =====================================================
// BOOKMARK SYSTEM
// =====================================================
function toggleBookmark() {
    const pageId = `page-${state.currentPage}`;
    const index = state.bookmarks.indexOf(pageId);
    
    if (index > -1) {
        state.bookmarks.splice(index, 1);
    } else {
        state.bookmarks.push(pageId);
    }
    
    localStorage.setItem('ebd-bookmarks', JSON.stringify(state.bookmarks));
    updateBookmarkIcon();
    renderBookmarks();
}

function updateBookmarkIcon() {
    const icon = document.getElementById('bookmark-icon');
    if (!icon) return;
    
    const pageId = `page-${state.currentPage}`;
    const isBookmarked = state.bookmarks.includes(pageId);
    
    icon.style.fill = isBookmarked ? 'var(--verde-text)' : 'none';
}

function renderBookmarks() {
    const container = document.getElementById('bookmarks-list');
    if (!container) return;
    
    if (state.bookmarks.length === 0) {
        container.innerHTML = '<span class="text-xs italic" style="color: var(--verde-text);">Nenhum marcador...</span>';
        return;
    }
    
    container.innerHTML = state.bookmarks.map(pageId => {
        const pageIndex = parseInt(pageId.replace('page-', ''));
        const button = document.querySelector(`button[onclick="showPage(${pageIndex})"]`);
        const title = button ? button.textContent.trim() : `Página ${pageIndex + 1}`;
        
        return `<button onclick="showPage(${pageIndex}); toggleBookmark();" 
                         class="text-xs px-3 py-2 rounded font-medium transition-all">
                    ${title}
                </button>`;
    }).join('');
}

// =====================================================
// MODAL SYSTEM
// =====================================================
function togglePopup(ref, text) {
    const modal = document.getElementById('modalVersiculo');
    const overlay = document.getElementById('overlay-biblico');
    const title = document.getElementById('modalTitulo');
    const content = document.getElementById('modalTexto');
    
    if (!modal || !overlay) return;
    
    title.textContent = ref || 'REFERÊNCIA';
    content.innerHTML = text || '';
    
    modal.style.display = 'flex';
    overlay.style.display = 'block';
}

function fecharModal() {
    const modal = document.getElementById('modalVersiculo');
    const overlay = document.getElementById('overlay-biblico');
    
    if (modal) modal.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
    const overlay = document.getElementById('overlay-biblico');
    if (e.target === overlay) {
        fecharModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        fecharModal();
        closeSidebar();
    }
});

// =====================================================
// HIGHLIGHT SYSTEM (Marca-Texto)
// =====================================================
let selectedText = null;
let colorMenuVisible = false;

function initHighlightSystem() {
    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('mousedown', handleClickOutside);
}

function handleTextSelection(e) {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text.length < 3) return;
    
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    selectedText = {
        text,
        range,
        x: rect.left + rect.width / 2,
        y: rect.top - 50
    };
    
    showColorMenu(selectedText.x, selectedText.y);
}

function showColorMenu(x, y) {
    const menu = document.getElementById('color-menu');
    if (!menu) return;
    
    menu.style.display = 'flex';
    menu.style.left = `${x - 75}px`;
    menu.style.top = `${y}px`;
    colorMenuVisible = true;
}

function hideColorMenu() {
    const menu = document.getElementById('color-menu');
    if (menu) {
        menu.style.display = 'none';
        colorMenuVisible = false;
    }
}

function handleClickOutside(e) {
    const menu = document.getElementById('color-menu');
    if (menu && !menu.contains(e.target) && !window.getSelection().toString()) {
        hideColorMenu();
    }
}

function applyHighlight(color) {
    if (!selectedText) return;
    
    const range = selectedText.range;
    const span = document.createElement('span');
    span.className = `highlight hl-${color}`;
    span.textContent = selectedText.text;
    
    range.deleteContents();
    range.insertNode(span);
    
    saveHighlight(selectedText.text, color);
    hideColorMenu();
    window.getSelection().removeAllRanges();
}

function saveHighlight(text, color) {
    const pageId = `page-${state.currentPage}`;
    if (!state.highlights[pageId]) {
        state.highlights[pageId] = [];
    }
    state.highlights[pageId].push({ text, color });
    localStorage.setItem('ebd-highlights', JSON.stringify(state.highlights));
}

// =====================================================
// INITIALIZATION
// =====================================================
function initializeApp() {
    // Load saved font size
    const savedFontSize = localStorage.getItem('ebd-font-size');
    if (savedFontSize) {
        state.fontSize = parseInt(savedFontSize);
        document.documentElement.style.setProperty('--reader-font-size', `${state.fontSize}%`);
    }
    
    // Count total pages
    const pages = document.querySelectorAll('.magazine-page');
    state.totalPages = pages.length;
    
    // Initialize first page
    if (pages.length > 0) {
        pages[0].classList.remove('hidden-center', 'hidden-left', 'hidden-right');
    }
    
    // Render bookmarks
    renderBookmarks();
    updateBookmarkIcon();
    updateNavigation();
    
    // Initialize highlight system
    initHighlightSystem();
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && state.currentPage > 0) {
            showPage(state.currentPage - 1);
        } else if (e.key === 'ArrowRight' && state.currentPage < state.totalPages - 1) {
            showPage(state.currentPage + 1);
        }
    });
    
    console.log(`✅ EBD Magazine initialized - ${state.totalPages} pages loaded`);
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Export for inline use
window.showPage = showPage;
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
window.changeFontSize = changeFontSize;
window.toggleBookmark = toggleBookmark;
window.togglePopup = togglePopup;
window.fecharModal = fecharModal;
window.applyHighlight = applyHighlight;
window.hideColorMenu = hideColorMenu;
