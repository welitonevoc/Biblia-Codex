import {
  BookOpen, Palette, Cloud, Search,
  PenTool, Globe, Volume2, Calendar,
  Download, Shield, Mail,
  MessageSquare, Smartphone, RefreshCw, FileText,
  Zap, Layers, ChevronDown,
  HelpCircle, Send, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo, useCallback } from 'react';
import { useAppContext } from '../../app/AppContext';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  items: FAQItem[];
}

const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: 'primeiros-passos',
    title: 'Primeiros Passos',
    icon: Zap,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    items: [
      {
        question: 'O que é o Codex?',
        answer: 'O Codex é um aplicativo de Bíblia digital completo e moderno, projetado para estudo profundo da Palavra de Deus. Ele oferece leitura bíblica, ferramentas de estudo com IA, dicionários, comentários, mapas, planos de leitura, devocionais, e muito mais — tudo em uma interface elegante e personalizável.'
      },
      {
        question: 'Como começar a usar o app?',
        answer: 'Ao abrir o app pela primeira vez, você verá a tela Início com acesso rápido a todos os recursos. Toque no ícone da Bíblia na dock flutuante para começar a ler. Use o menu inferior ou o menu hambúrguer (três linhas) para acessar todas as funcionalidades. Recomendamos explorar a seção de Configurações para personalizar o app ao seu gosto.'
      },
      {
        question: 'O app é gratuito?',
        answer: 'Sim, o Codex é gratuito para uso com recursos essenciais de leitura e estudo. Alguns recursos avançados, como a IA de estudo e sincronização em nuvem, podem requerer uma conta Firebase. Verifique as configurações do app para mais detalhes sobre os recursos disponíveis.'
      },
      {
        question: 'Em quais idiomas o app está disponível?',
        answer: 'O Codex está disponível em Português (padrão) e Inglês. Para alterar o idioma, vá em Configurações > Idioma. A Bíblia pode conter múltiplas traduções dependendo dos módulos instalados.'
      },
      {
        question: 'Posso usar o app offline?',
        answer: 'Sim! Uma vez que os módulos bíblicos e recursos de estudo sejam baixados, você pode usá-los sem conexão com a internet. Apenas recursos como IA, sincronização e atualizações requerem conexão. O app indica quando você está offline.'
      },
    ],
  },
  {
    id: 'leitura',
    title: 'Leitura Bíblica',
    icon: BookOpen,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    items: [
      {
        question: 'Como navegar entre livros e capítulos?',
        answer: 'Toque no nome do livro no topo da tela de leitura para abrir o menu de navegação bíblica. Você pode selecionar qualquer livro do Antigo ou Novo Testamento e depois escolher o capítulo desejado. Use também o BookJump Menu para pular rapidamente entre livros com gestos.'
      },
      {
        question: 'Como alterar a tradução da Bíblia?',
        answer: 'Vá em Configurações > Aparência > Tradução ou use o seletor de tradução na tela de leitura. O app suporta múltiplas traduções que podem ser baixadas na seção Módulos. Cada tradução é carregada como um módulo separado.'
      },
      {
        question: 'Como aumentar ou diminuir o tamanho da fonte?',
        answer: 'Na tela de leitura, use os botões de tamanho de fonte (A+ e A-) na barra de ferramentas. Você também pode ajustar nas Configurações > Aparência > Tamanho da Fonte. O app lembra sua preferência para todas as leituras futuras.'
      },
      {
        question: 'O que são os títulos TS1, TS2, TS3 e TS4?',
        answer: 'São estilos de formatação para títulos e seções dentro do texto bíblico. TS1 é o título principal (maior e em negrito), TS2 é subtítulo com borda lateral, TS3 é título em itálico com cor de destaque, e TS4 é título em maiúsculas com espaçamento. Eles ajudam a organizar visualmente o texto.'
      },
      {
        question: 'Como ativar o modo de leitura focada?',
        answer: 'Toque no ícone de olho (modo foco) na barra de ferramentas da leitura. Isso oculta distrações e destaca apenas o texto bíblico. Para sair, toque novamente no ícone ou deslize para cima.'
      },
      {
        question: 'Como funciona o modo noturno durante a leitura?',
        answer: 'O Codex possui temas claros e escuros. Toque no ícone de lua na dock ou vá em Configurações > Aparência > Tema. Temas como "Midnight Navy", "Obsidian Gold" e "Pure Dark" são ideais para leitura noturna. Você também pode configurar para seguir o tema do sistema automaticamente.'
      },
    ],
  },
  {
    id: 'personalizacao',
    title: 'Personalização',
    icon: Palette,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    items: [
      {
        question: 'Quantos temas estão disponíveis?',
        answer: 'O Codex oferece 9 presets de temas: Pure Light, Pure Dark, Paper Sepia, Royal Majesty, Midnight Navy, Ethereal Light, Obsidian Gold, Emerald Sanctum e Crimson Vignette. Cada tema combina cores de fundo, texto, acento e borda de forma harmoniosa.'
      },
      {
        question: 'Como mudar a geometria dos componentes?',
        answer: 'Vá em Configurações > Aparência > Geometria UI. Existem 14 modos: Sharp, Soft, Pill, Minimal, Geometric, Premium, Circle, Soft-Square, Glass, Neon, Brutal, Elegant, Cyber e Vintage. Cada modo altera bordas, sombras e estilos dos botões, cards e inputs.'
      },
      {
        question: 'Posso escolher a fonte do texto bíblico?',
        answer: 'Sim! O app inclui várias fontes: Manrope (sans-serif moderna), Libre Baskerville (serif clássica), Cormorant Garamond (display elegante), EB Garamond, Playfair Display, Lora, Inter, Space Grotesk e outras. Altere em Configurações > Aparência > Fonte do Texto.'
      },
      {
        question: 'O que são os efeitos de partículas e brilho?',
        answer: 'São efeitos visuais opcionais. "Enable Glow" adiciona um brilho sutil aos elementos ativos. "Enable Particles" adiciona uma textura de ruído visual ao fundo. Ambos podem ser ativados/desativados em Configurações > Aparência > Efeitos Visuais para melhorar a experiência visual.'
      },
      {
        question: 'Como alterar o estilo de navegação?',
        answer: 'O Codex suporta múltiplos estilos de navegação: Bottom Dock (dock flutuante inferior — padrão), Sidebar (barra lateral para desktop), Hamburger Menu (menu deslizante), Top Bar e mais. Altere em Configurações > Navegação > Estilo de Navegação.'
      },
      {
        question: 'Posso desativar as animações de transição?',
        answer: 'Sim. Vá em Configurações > Navegação > Animações. Você pode ativar ou desativar as animações de fade/slide entre páginas. Desativar pode melhorar a performance em dispositivos mais antigos.'
      },
    ],
  },
  {
    id: 'estudo',
    title: 'Ferramentas de Estudo',
    icon: Layers,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    items: [
      {
        question: 'Como usar o Assistente de IA?',
        answer: 'Toque no ícone de IA na dock flutuante ou no menu. O assistente usa Google Gemini para responder perguntas sobre a Bíblia, explicar versículos, fornecer contexto histórico e teológico. Digite sua pergunta e a IA fornecerá uma resposta detalhada. Nota: requer conexão com internet.'
      },
      {
        question: 'Como acessar o Dicionário Bíblico?',
        answer: 'Vá em Ferramentas de Estudo > Dicionário ou toque no ícone de dicionário. Pesquise por qualquer termo bíblico para obter definições detalhadas. O dicionário funciona offline uma vez carregado. Você também pode tocar em palavras destacadas no texto bíblico para ver a definição diretamente.'
      },
      {
        question: 'Como ver referências cruzadas?',
        answer: 'Durante a leitura, versículos com referências cruzadas possuem indicadores visuais. Toque no ícone de referências cruzadas (xrefs) na barra de ferramentas ou no painel de estudo. As referências mostram versículos relacionados em outras partes da Bíblia.'
      },
      {
        question: 'Como usar os Comentários?',
        answer: 'Abra o painel de estudo durante a leitura e selecione a aba de Comentários. Os comentários fornecem interpretações e explicações detalhadas de versículos e passagens. Use o comentário inferior (bottom sheet) para acesso rápido enquanto lê.'
      },
      {
        question: 'O que é o Painel de Estudo?',
        answer: 'O Painel de Estudo é um painel lateral que reúne múltiplas ferramentas de estudo em um só lugar: dicionário, comentários, referências cruzadas e notas. Acesse tocando no ícone de estudo na dock ou deslizando da direita para a esquerda durante a leitura.'
      },
      {
        question: 'Como funciona a Escola Bíblica Dominical (EBD)?',
        answer: 'A seção EBD oferece acesso a revistas e lições da Escola Bíblica Dominical. Vá em EBD no menu para navegar pelas lições disponíveis. O Magazine Reader permite ler as revistas de forma organizada por trimestre e lição.'
      },
      {
        question: 'O que é a Enciclopédia Bíblica?',
        answer: 'A Enciclopédia Bíblica contém artigos detalhados sobre pessoas, lugares, eventos e conceitos da Bíblia. Acesse em Ferramentas de Estudo > Enciclopédia. Use a busca para encontrar artigos específicos ou navegue por categorias.'
      },
      {
        question: 'Como usar os Mapas Bíblicos?',
        answer: 'Vá em Ferramentas de Estudo > Mapas para visualizar mapas interativos de locais bíblicos. Explore cidades, rotas de viagem, regiões e territórios mencionados na Bíblia. Toque em lugares para ver informações detalhadas.'
      },
    ],
  },
  {
    id: 'notas-favoritos',
    title: 'Notas e Favoritos',
    icon: PenTool,
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    items: [
      {
        question: 'Como criar uma nota?',
        answer: 'Durante a leitura, toque e segure em qualquer versículo para abrir o menu de ações. Selecione "Adicionar Nota" e digite seu conteúdo. Você também pode acessar Notas pela dock ou menu para ver e editar todas as suas notas organizadas.'
      },
      {
        question: 'Como organizar minhas notas?',
        answer: 'Suas notas são organizadas automaticamente por data. Use o Editor de Notas para editar, formatar texto enriquecido e adicionar tags. Você pode buscar notas por palavra-chave usando a busca na seção de Notas.'
      },
      {
        question: 'Como marcar um versículo como favorito?',
        answer: 'Toque no ícone de marcador (bookmark) ao lado de qualquer versículo ou use o botão de favoritos no menu de ações do versículo. Seus favoritos ficam acessíveis na seção Favoritos da dock/menu.'
      },
      {
        question: 'Como gerenciar meus favoritos?',
        answer: 'Acesse a seção Favoritos para ver todos os versículos marcados. Você pode navegar por livro/capítulo, buscar por texto e remover favoritos que não precisa mais. Os favoritos são salvos localmente e podem ser sincronizados.'
      },
      {
        question: 'Como usar as Tags para organizar conteúdo?',
        answer: 'Tags permitem categorizar notas, favoritos e destaques com rótulos personalizados. Vá em Tags no menu para criar, editar e gerenciar suas tags. Aplique tags a qualquer item para encontrá-los rapidamente depois.'
      },
      {
        question: 'O que são os Destaques (Highlights)?',
        answer: 'Destaques permitem marcar versículos com cores diferentes para identificar categorias (ex: promessas, profecias, ensinamentos). Toque e segure um versículo e selecione uma cor de destaque. Cada cor pode ter um significado pessoal.'
      },
    ],
  },
  {
    id: 'audio',
    title: 'Áudio e Voz',
    icon: Volume2,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    items: [
      {
        question: 'Como ouvir a Bíblia em áudio?',
        answer: 'Toque no ícone de áudio na dock flutuante ou no menu para abrir o Audio Player. Selecione o livro e capítulo desejado. O player oferece controles de play/pause, avançar/retroceder, velocidade de reprodução e controle de volume.'
      },
      {
        question: 'Como funciona o Text-to-Speech (TTS)?',
        answer: 'O recurso TTS usa a API nativa do dispositivo para ler o texto bíblico em voz alta. Ative pelo ícone de microfone/áudio na tela de leitura. Você pode ajustar a velocidade e o idioma da voz nas configurações do TTS.'
      },
      {
        question: 'Posso ajustar a velocidade do áudio?',
        answer: 'Sim! No Audio Player, use o controle de velocidade para ajustar de 0.5x (mais lento) a 2x (mais rápido). Isso funciona tanto para áudio gravado quanto para TTS. O app lembra sua última configuração de velocidade.'
      },
    ],
  },
  {
    id: 'planos-devocional',
    title: 'Planos e Devocional',
    icon: Calendar,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    items: [
      {
        question: 'O que são os Planos de Leitura?',
        answer: 'Planos de Leitura são roteiros organizados para ler a Bíblia de forma sistemática. Exemplos: Bíblia em 1 ano, Novo Testamento em 90 dias, Planos temáticos. Vá em Planos de Leitura no menu para ver os disponíveis e iniciar um.'
      },
      {
        question: 'Como acompanhar meu progresso nos planos?',
        answer: 'Ao iniciar um plano, o app rastreia automaticamente seu progresso. Você verá uma barra de progresso e a leitura do dia. Marque cada dia como concluído e retome de onde parou a qualquer momento.'
      },
      {
        question: 'O que é o Devocional Diário?',
        answer: 'O Devocional oferece uma reflexão diária com versículo do dia, meditação e oração. Acesse pelo ícone de devocional na dock. Cada dia traz um novo conteúdo para inspirar sua caminhada espiritual.'
      },
      {
        question: 'Posso criar meu próprio plano de leitura?',
        answer: 'Atualmente, o Codex oferece planos de leitura pré-configurados. Planos personalizados podem ser adicionados em atualizações futuras. Fique atento às novidades!'
      },
    ],
  },
  {
    id: 'busca',
    title: 'Busca e Pesquisa',
    icon: Search,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    items: [
      {
        question: 'Como buscar versículos na Bíblia?',
        answer: 'Toque no ícone de busca na dock ou no menu. Digite qualquer palavra, frase ou referência (ex: "João 3:16"). A busca retorna resultados de todo o texto bíblico com contexto. Use aspas para busca exata: "fé sem obras".'
      },
      {
        question: 'Posso filtrar resultados de busca?',
        answer: 'Sim! Após realizar uma busca, você pode filtrar por livro, testamento (AT/NT) ou tipo de resultado. A busca também destaca os termos encontrados nos versículos para fácil identificação.'
      },
      {
        question: 'Como buscar em notas e favoritos?',
        answer: 'Dentro das seções de Notas e Favoritos, use o campo de busca no topo para encontrar itens específicos. A busca funciona no conteúdo das notas e no texto dos versículos favoritados.'
      },
    ],
  },
  {
    id: 'modulos',
    title: 'Módulos e Downloads',
    icon: Download,
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
    items: [
      {
        question: 'O que são Módulos?',
        answer: 'Módulos são pacotes de conteúdo adicional que expandem as funcionalidades do app: traduções da Bíblia, dicionários, comentários, léxicos, mapas e muito mais. Cada módulo é instalado separadamente para manter o app leve.'
      },
      {
        question: 'Como instalar novos módulos?',
        answer: 'Vá em Configurações > Módulos ou acesse a seção Módulos no menu. Navegue pelo catálogo de módulos disponíveis e toque em "Instalar" ou "Baixar" nos que deseja adicionar. Módulos baixados ficam disponíveis offline.'
      },
      {
        question: 'Como gerenciar módulos instalados?',
        answer: 'Na seção Módulos, você pode ver todos os módulos instalados, verificar espaço utilizado, atualizar módulos desatualizados e remover módulos que não precisa mais. Toque no módulo para ver detalhes.'
      },
      {
        question: 'Os módulos ocupam muito espaço?',
        answer: 'O espaço varia conforme o módulo. Traduções básicas são pequenas (alguns MB), enquanto comentários e enciclopédias podem ser maiores. O app mostra o tamanho de cada módulo antes de instalar. Gerencie o espaço na seção de Módulos.'
      },
    ],
  },
  {
    id: 'conta-sincronizacao',
    title: 'Conta e Sincronização',
    icon: Cloud,
    color: 'text-sky-500',
    bgColor: 'bg-sky-500/10',
    items: [
      {
        question: 'Preciso criar uma conta para usar o app?',
        answer: 'Não. O Codex funciona completamente sem conta para leitura e estudo local. Porém, criar uma conta Firebase permite sincronizar seus dados entre dispositivos, fazer backup na nuvem e acessar recursos avançados.'
      },
      {
        question: 'Como criar uma conta?',
        answer: 'Vá em Configurações > Perfil > Criar Conta. Você pode se registrar com e-mail e senha. Após a criação, seus dados começarão a ser sincronizados automaticamente.'
      },
      {
        question: 'O que é sincronizado na nuvem?',
        answer: 'Com uma conta, são sincronizados: notas, favoritos, destaques, tags, progresso de planos de leitura, configurações de personalização e último versículo lido. Tudo é criptografado e seguro.'
      },
      {
        question: 'Como fazer backup dos meus dados?',
        answer: 'Vá em Configurações > Conta > Backup. Você pode criar um backup manual a qualquer momento. O backup inclui todas as suas notas, favoritos, destaques e configurações. Também é possível exportar dados em formato compatível.'
      },
      {
        question: 'Como usar o app em múltiplos dispositivos?',
        answer: 'Faça login com a mesma conta Firebase em todos os dispositivos. Os dados serão sincronizados automaticamente. Notas, favoritos e configurações estarão disponíveis em todos os seus aparelhos.'
      },
      {
        question: 'Como recuperar minha conta?',
        answer: 'Se esqueceu sua senha, vá para a tela de login e selecione "Esqueci minha senha". Um e-mail de recuperação será enviado. Se precisa de mais ajuda, entre em contato com o suporte.'
      },
      {
        question: 'Meus dados estão seguros?',
        answer: 'Sim. O Codex usa Firebase com autenticação segura e dados criptografados. Não compartilhamos seus dados com terceiros. Leia nossa política de privacidade em Configurações > Sobre > Privacidade para mais detalhes.'
      },
    ],
  },
  {
    id: 'exportacao',
    title: 'Exportação e Compartilhamento',
    icon: FileText,
    color: 'text-lime-500',
    bgColor: 'bg-lime-500/10',
    items: [
      {
        question: 'Como exportar versículos como imagem?',
        answer: 'Toque e segure um versículo e selecione "Gerar Card". O Verse Card Generator cria uma imagem estilizada do versículo que você pode salvar e compartilhar nas redes sociais. Personalize o tema e estilo do card.'
      },
      {
        question: 'Posso exportar minhas notas?',
        answer: 'Sim! Na seção de Notas, você pode exportar suas notas em formato PDF ou DOCX. Use os botões de exportação no topo da página de Notas. Isso é útil para estudo offline ou compartilhamento.'
      },
      {
        question: 'Como compartilhar um versículo?',
        answer: 'Toque e segure o versículo e selecione "Compartilhar". O versículo será copiado para a área de transferência ou você pode compartilhar diretamente via apps instalados no seu dispositivo (WhatsApp, Telegram, etc.).'
      },
    ],
  },
  {
    id: 'permissoes',
    title: 'Permissões e Configurações',
    icon: Shield,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    items: [
      {
        question: 'Quais permissões o app precisa?',
        answer: 'O Codex pede permissões mínimas: armazenamento (para backup/exportação), internet (para IA, sincronização e downloads) e notificações (para devocionais e planos de leitura). Nenhuma permissão desnecessária é solicitada.'
      },
      {
        question: 'Como gerenciar notificações?',
        answer: 'Vá em Configurações > Notificações para ativar/desativar lembretes de leitura, devocional diário e planos. Você pode configurar horários personalizados para os lembretes.'
      },
      {
        question: 'Como redefinir todas as configurações?',
        answer: 'Vá em Configurações > Geral > Redefinir Configurações. Isso restaurará todas as opções ao padrão original. Seus dados pessoais (notas, favoritos) não serão apagados.'
      },
    ],
  },
  {
    id: 'problemas',
    title: 'Problemas Comuns',
    icon: RefreshCw,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    items: [
      {
        question: 'O app está lento, o que fazer?',
        answer: 'Tente estas soluções: 1) Feche e reabra o app. 2) Limpe o cache em Configurações > Geral > Limpar Cache. 3) Desative animações em Configurações > Navegação. 4) Remova módulos não utilizados. 5) Verifique se há atualizações disponíveis.'
      },
      {
        question: 'A IA não está respondendo, o que fazer?',
        answer: 'Verifique sua conexão com a internet. A IA requer conexão para funcionar. Se o problema persistir: 1) Verifique se a chave API está configurada corretamente. 2) Tente novamente em alguns instantes. 3) Verifique se o serviço Google Gemini está disponível.'
      },
      {
        question: 'Meus dados não estão sincronizando',
        answer: 'Verifique: 1) Você está conectado à internet. 2) Está logado na sua conta Firebase. 3) As permissões de sincronização estão ativadas em Configurações > Conta. 4) Tente forçar sincronização manual. Se persistir, faça logout e login novamente.'
      },
      {
        question: 'O áudio não está funcionando',
        answer: 'Verifique: 1) O volume do dispositivo não está no mudo. 2) O módulo de áudio está instalado. 3) Para TTS, verifique se o idioma de voz está configurado nas configurações do sistema. 4) Teste com outro capítulo.'
      },
      {
        question: 'Como resolver erros de carregamento?',
        answer: '1) Verifique sua conexão com a internet. 2) Reinicie o app. 3) Limpe o cache do app. 4) Verifique se o módulo correspondente está instalado. 5) Se o erro persistir, reinstale o módulo ou entre em contato com o suporte.'
      },
      {
        question: 'O app travou ou fechou sozinho',
        answer: '1) Reinicie o app. 2) Verifique se há atualizações disponíveis. 3) Limpe o cache. 4) Reinicie o dispositivo. 5) Se o problema continuar, entre em contato com o suporte informando o modelo do dispositivo e a versão do app.'
      },
    ],
  },
];

const QUICK_ACTIONS = [
  { icon: Mail, label: 'E-mail', description: 'suporte@codex.app', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  { icon: MessageSquare, label: 'Comunidade', description: 'Discord & Fórum', color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  { icon: Smartphone, label: 'Android', description: 'Capacitor App', color: 'text-green-500', bgColor: 'bg-green-500/10' },
  { icon: Globe, label: 'Web', description: 'PWA Online', color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
];

export const HelpPage: React.FC = () => {
  const { setActiveTab } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const toggleItem = useCallback((categoryId: string, index: number) => {
    const key = `${categoryId}-${index}`;
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return activeCategory
        ? FAQ_CATEGORIES.filter(c => c.id === activeCategory)
        : FAQ_CATEGORIES;
    }

    const query = searchQuery.toLowerCase();
    return FAQ_CATEGORIES
      .map(category => ({
        ...category,
        items: category.items.filter(
          item =>
            item.question.toLowerCase().includes(query) ||
            item.answer.toLowerCase().includes(query)
        ),
      }))
      .filter(category => category.items.length > 0);
  }, [searchQuery, activeCategory]);

  const totalQuestions = FAQ_CATEGORIES.reduce((sum, cat) => sum + cat.items.length, 0);

  return (
    <div className="h-full overflow-y-auto bg-bible-bg">
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <button
          onClick={() => setActiveTab('settings')}
          className="flex items-center gap-2 text-bible-accent hover:opacity-80 transition-opacity mb-6"
        >
          <ChevronDown className="w-4 h-4 rotate-90" />
          <span className="ui-text text-sm font-medium">Voltar para Configurações</span>
        </button>

        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 mb-10"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-bible-accent/10 rounded-2xl">
                <HelpCircle className="w-7 h-7 text-bible-accent" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
                  Central de Suporte
                </h1>
                <p className="text-bible-text-muted text-sm mt-1">
                  {FAQ_CATEGORIES.length} categorias · {totalQuestions} perguntas respondidas
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-bible-text-subtle" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar nas perguntas e respostas..."
              className="w-full bg-bible-surface border border-bible-border rounded-2xl py-4 pl-12 pr-4 ui-text focus:outline-none focus:ring-2 focus:ring-bible-accent/30 focus:border-bible-accent/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-bible-text-subtle hover:text-bible-text"
              >
                ✕
              </button>
            )}
          </div>

          {!searchQuery && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  !activeCategory
                    ? 'bg-bible-accent text-white'
                    : 'bg-bible-surface text-bible-text-muted hover:bg-bible-surface-strong'
                }`}
              >
                Todas
              </button>
              {FAQ_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                    activeCategory === cat.id
                      ? 'bg-bible-accent text-white'
                      : 'bg-bible-surface text-bible-text-muted hover:bg-bible-surface-strong'
                  }`}
                >
                  <cat.icon className="w-3.5 h-3.5" />
                  {cat.title}
                </button>
              ))}
            </div>
          )}
        </motion.header>

        {searchQuery && filteredCategories.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 space-y-4"
          >
            <Search className="w-12 h-12 text-bible-text-subtle mx-auto opacity-40" />
            <h3 className="text-lg font-semibold text-bible-text">Nenhum resultado encontrado</h3>
            <p className="text-bible-text-muted text-sm">
              Tente buscar com termos diferentes ou navegue pelas categorias
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-6 py-2.5 bg-bible-accent text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Limpar busca
            </button>
          </motion.div>
        )}

        <div className="space-y-10">
          {filteredCategories.map((category, catIdx) => (
            <motion.section
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIdx * 0.05 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2.5 ${category.bgColor} rounded-xl`}>
                  <category.icon className={`w-5 h-5 ${category.color}`} />
                </div>
                <h2 className="text-xl font-bold">{category.title}</h2>
                <span className="text-bible-text-subtle text-sm ml-auto">
                  {category.items.length} perguntas
                </span>
              </div>

              <div className="space-y-3">
                {category.items.map((item, itemIdx) => {
                  const key = `${category.id}-${itemIdx}`;
                  const isExpanded = expandedItems.has(key);

                  return (
                    <motion.div
                      key={key}
                      className="premium-card cursor-pointer group"
                      onClick={() => toggleItem(category.id, itemIdx)}
                      whileHover={{ scale: 1.005 }}
                      whileTap={{ scale: 0.995 }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-semibold text-bible-text flex-1">
                          {item.question}
                        </h3>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex-shrink-0 mt-1"
                        >
                          <ChevronDown className="w-5 h-5 text-bible-text-subtle" />
                        </motion.div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 mt-4 border-t border-bible-border">
                              <p className="text-bible-text-muted leading-relaxed">
                                {item.answer}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          ))}
        </div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 pt-10 border-t border-bible-border space-y-8"
        >
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Ainda precisa de ajuda?</h2>
            <p className="text-bible-text-muted text-sm">
              Nossos canais de suporte estão disponíveis para você
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {QUICK_ACTIONS.map((action, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-between p-5 rounded-2xl border border-bible-border hover:bg-bible-surface-strong transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 ${action.bgColor} rounded-xl`}>
                    <action.icon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{action.label}</p>
                    <p className="text-bible-text-subtle text-xs">{action.description}</p>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-bible-text-subtle -rotate-90 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            ))}
          </div>

          <div className="premium-card bg-bible-accent/5 border-bible-accent/20">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-bible-accent/10 rounded-xl">
                <Send className="w-5 h-5 text-bible-accent" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold">Envie sua dúvida</h3>
                <p className="text-bible-text-muted text-sm">
                  Não encontrou o que procurava? Envie sua pergunta diretamente para nossa equipe de suporte.
                </p>
                <div className="flex gap-3 pt-2">
                  <button className="px-5 py-2.5 bg-bible-accent text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Enviar E-mail
                  </button>
                  <button className="px-5 py-2.5 border border-bible-border rounded-xl text-sm font-medium hover:bg-bible-surface-strong transition-all flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Discord
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <footer className="mt-16 pt-10 border-t border-bible-border flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-bible-text-subtle">
            <Star className="w-4 h-4 text-bible-accent" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Obrigado por usar o Codex
            </span>
          </div>
          <p className="text-bible-text-subtle text-xs">
            Versão 1.0.0 · Feito com dedicação para a glória de Deus
          </p>
        </footer>
      </div>
    </div>
  );
};
