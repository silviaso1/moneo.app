
export const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril',
  'Maio', 'Junho', 'Julho', 'Agosto',
  'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const shortMonths = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

// EXPRESSÕES DOS MASCOTES

const faces = {
  normal: (f) => `
    <circle cx="40" cy="48" r="3.5" fill="${f}"/>
    <circle cx="60" cy="48" r="3.5" fill="${f}"/>
    <path d="M46 59 Q50 62 54 59" fill="none" stroke="${f}" stroke-width="2.5" stroke-linecap="round"/>
  `,
  happy: (f) => `
    <path d="M35 49 Q40 42 45 49 M55 49 Q60 42 65 49" fill="none" stroke="${f}" stroke-width="3" stroke-linecap="round"/>
    <path d="M40 59 Q50 72 60 59" fill="none" stroke="${f}" stroke-width="3" stroke-linecap="round"/>
  `,
  sad: (f) => `
    <circle cx="40" cy="49" r="3.5" fill="${f}"/>
    <circle cx="60" cy="49" r="3.5" fill="${f}"/>
    <path d="M42 67 Q50 57 58 67" fill="none" stroke="${f}" stroke-width="3" stroke-linecap="round"/>
    <path d="M65 54 Q68 60 65 63 Q62 60 65 54" fill="#70BFFF"/>
  `,
  angry: (f) => `
    <path d="M34 43 L45 47 M66 43 L55 47" stroke="${f}" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="40" cy="51" r="3.5" fill="${f}"/>
    <circle cx="60" cy="51" r="3.5" fill="${f}"/>
    <path d="M44 65 Q50 59 56 65" fill="none" stroke="${f}" stroke-width="3" stroke-linecap="round"/>
  `
};

// DESENHOS DOS MASCOTES ORIGINAIS

const characters = {
  skunk: (c) => `
    <circle cx="50" cy="55" r="34" fill="${c}"/>
    <ellipse cx="27" cy="27" rx="11" ry="17" transform="rotate(-25 27 27)" fill="${c}"/>
    <ellipse cx="73" cy="27" rx="11" ry="17" transform="rotate(25 73 27)" fill="${c}"/>
    <path d="M43 23 Q50 10 57 23 L54 39 L46 39 Z" fill="#fff" opacity=".9"/>
  `,
  fantom: (c) => `
    <path d="M18 73 L18 48 C18 22 32 12 50 12 C68 12 82 22 82 48 L82 78 L70 70 L60 80 L50 70 L39 80 L29 70 L18 78 Z" fill="${c}"/>
    <circle cx="28" cy="28" r="8" fill="${c}"/>
    <circle cx="72" cy="28" r="8" fill="${c}"/>
    <ellipse cx="50" cy="86" rx="13" ry="3" fill="#000" opacity=".08"/>
  `,
  mochi: (c) => `
    <ellipse cx="50" cy="56" rx="36" ry="31" fill="${c}"/>
    <ellipse cx="25" cy="29" rx="13" ry="16" fill="${c}"/>
    <ellipse cx="75" cy="29" rx="13" ry="16" fill="${c}"/>
    <ellipse cx="25" cy="29" rx="6" ry="9" fill="#FFB5C5"/>
    <ellipse cx="75" cy="29" rx="6" ry="9" fill="#FFB5C5"/>
    <ellipse cx="50" cy="68" rx="17" ry="11" fill="#fff" opacity=".25"/>
  `,
  nyx: (c) => `
    <path d="M16 43 L8 12 L37 28 Q50 17 63 28 L92 12 L84 43 Q89 64 75 78 Q50 96 25 78 Q11 64 16 43 Z" fill="${c}"/>
    <path d="M16 43 L8 12 L37 28 Z M84 43 L92 12 L63 28 Z" fill="#B79CFF" opacity=".6"/>
    <path d="M50 28 L50 37" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5"/>
  `,
  blob: (c) => `
    <path d="M50 17 C62 12 69 25 77 28 C91 37 85 52 83 62 C82 80 68 88 50 87 C32 88 18 80 17 62 C15 52 9 37 23 28 C31 25 38 12 50 17 Z" fill="${c}"/>
    <path d="M26 28 Q15 12 22 8 Q33 8 36 25 M74 28 Q85 12 78 8 Q67 8 64 25" fill="${c}"/>
    <circle cx="31" cy="35" r="3" fill="#fff" opacity=".5"/>
    <circle cx="69" cy="35" r="3" fill="#fff" opacity=".5"/>
  `,
  pingu: (c) => `
    <ellipse cx="50" cy="53" rx="34" ry="40" fill="${c}"/>
    <ellipse cx="50" cy="61" rx="23" ry="28" fill="#fff"/>
    <ellipse cx="23" cy="60" rx="9" ry="17" transform="rotate(20 23 60)" fill="${c}"/>
    <ellipse cx="77" cy="60" rx="9" ry="17" transform="rotate(-20 77 60)" fill="${c}"/>
    <path d="M44 57 L50 63 L56 57 Q50 52 44 57" fill="#FFB52E"/>
    <ellipse cx="50" cy="87" rx="13" ry="5" fill="#FFB52E"/>
  `
};

// GERADOR DOS MASCOTES ORIGINAIS

const buildCharacter = (id, color) => {
  const drawing = characters[id];
  const faceColor = ['#FFFFFF', '#1A1A1A'].includes(color.toUpperCase())
    ? '#FFFFFF'
    : '#252525';

  return Object.fromEntries(
    Object.keys(faces).map((mood) => [
      mood,
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
        ${drawing(color)}
        ${faces[mood](faceColor)}
      </svg>`
    ])
  );
};

// EXPRESSÕES DOS PERSONAGENS DE ANIME EM PNG

const buildAnimeCharacter = (id) => {
  const basePath = `/assets/temaAnime/${id}`;

  return {
    normal: `${basePath}/normal.png`,
    happy: `${basePath}/feliz.png`,
    angry: `${basePath}/bravo.png`,
    sad: `${basePath}/triste.png`
  };
};

// CATÁLOGO DE ANIMES

export const animeCatalog = {
  'jujutsu-kaisen': {
    id: 'jujutsu-kaisen',
    name: 'Jujutsu Kaisen',
    characters: {
      gojo: {
        name: 'Satoru Gojo',
        description: 'Cabelo branco e olhos azuis.'
      },
      geto: {
        name: 'Suguru Geto',
        description: 'Cabelo preto e olhos escuros.'
      }
    }
  }
};

// REGISTRO DOS MASCOTES

export const mascotPacks = {
  skunk: {
    name: 'Skunk',
    description: 'O fiscal das suas finanças.',
    defaultColor: '#1A1A1A',
    category: 'original',
    set: buildCharacter('skunk', '#1A1A1A')
  },

  fantom: {
    name: 'Fantom',
    description: 'O observador silencioso.',
    defaultColor: '#D8D8E8',
    category: 'original',
    set: buildCharacter('fantom', '#D8D8E8')
  },

  mochi: {
    name: 'Mochi',
    description: 'O otimista do grupo.',
    defaultColor: '#7EE0B5',
    category: 'original',
    set: buildCharacter('mochi', '#7EE0B5')
  },

  nyx: {
    name: 'Nyx',
    description: 'O morcego noturno.',
    defaultColor: '#B79CFF',
    category: 'original',
    set: buildCharacter('nyx', '#B79CFF')
  },

  blob: {
    name: 'Blob',
    description: 'O distraído do grupo.',
    defaultColor: '#FFA6D0',
    category: 'original',
    set: buildCharacter('blob', '#FFA6D0')
  },

  pingu: {
    name: 'Pingu',
    description: 'O organizado do grupo.',
    defaultColor: '#333333',
    category: 'original',
    set: buildCharacter('pingu', '#333333')
  },

  gojo: {
    name: 'Satoru Gojo',
    description: 'Cabelo branco, olhos azuis.',
    defaultColor: '#D9D7E8',
    category: 'anime',
    anime: 'jujutsu-kaisen',
    set: buildAnimeCharacter('gojo')
  },

  geto: {
    name: 'Suguru Geto',
    description: 'Cabelo preto, olhos castanhos.',
    defaultColor: '#171923',
    category: 'anime',
    anime: 'jujutsu-kaisen',
    set: buildAnimeCharacter('geto')
  }
};

// RETORNA O MASCOTE E A COR SELECIONADOS

export const getPack = (id = 'skunk', color) => {
  const packId = typeof id === 'string' ? id : 'skunk';

  if (packId.startsWith('anime-')) {
    const character = mascotPacks[packId.slice(6)];

    if (character?.category === 'anime') {
      return character.set;
    }
  }

  const character = mascotPacks[packId] || mascotPacks.skunk;

  if (character.category === 'anime' || !color) {
    return character.set;
  }

  return buildCharacter(
    packId in characters ? packId : 'skunk',
    color
  );
};

// MASCOTES PARA COMPATIBILIDADE COM CÓDIGOS ANTIGOS

export const mascots = mascotPacks.skunk.set;

export const speechBubbles = {
  normal: 'Mês novo, limite cheio. Respira antes de abrir o iFood.',
  happy: 'Boa! Tá sobrando dinheiro. O Skunk aprova.',
  sad: 'Estourou o limite... Vou fingir que não vi. Mentira, vi sim.',
  angry: 'Mercado ESTOUROU. Eu avisei. Tá, não avisei, mas pensei.'
};

// ESTADO INICIAL

export const initialState = {
  currentMonth: 10,
  limit: 984,
  spent: 0,
  income: 0,
  transactions: [],
  investments: [],

  accounts: [
    { id: 1, name: 'Nubank', balance: 2450.0, color: '#8A05BE' },
    { id: 2, name: 'Itaú', balance: 1200.5, color: '#EC7000' },
    { id: 3, name: 'Carteira', balance: 150.0, color: '#000000' },
    { id: 4, name: 'Inter', balance: 500.0, color: '#FF7A00' }
  ],

  mascotPack: 'skunk',
  mascotColor: '#1A1A1A',

  animeTheme: false,
  animeId: 'jujutsu-kaisen',
  animeCharacter: 'gojo',

  followCursor: true,
  hideSaved: false,
  hideTotalBalance: false,
  showAllAccounts: false
};

// CATEGORIAS

export const defaultCategories = [
  {
    id: 'mercado',
    name: 'Mercado e alimentação',
    icon: 'ShoppingCart',
    limit: 400,
    order: 0
  },
  {
    id: 'restaurantes',
    name: 'Restaurantes e delivery',
    icon: 'Utensils',
    limit: 200,
    order: 1
  },
  {
    id: 'transporte',
    name: 'Transporte',
    icon: 'Car',
    limit: 200,
    order: 2
  },
  {
    id: 'lazer',
    name: 'Lazer, compras e pessoal',
    icon: 'PartyPopper',
    limit: 100,
    order: 3
  },
  {
    id: 'saude',
    name: 'Saúde e imprevistos',
    icon: 'HeartPulse',
    limit: 84.06,
    order: 4
  }
];
