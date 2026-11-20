// src/utils/image.js
// Utilitários para tratar imagens enviadas pelo usuário (ex.: mascote personalizado).

export const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Valida tipo e tamanho. Retorna string de erro ou null se estiver ok.
export function validateImage(file) {
  if (!file) return 'Nenhum arquivo selecionado.';
  if (!ACCEPTED_TYPES.includes(file.type)) return 'Formato inválido. Use PNG, JPG, WEBP ou SVG.';
  if (file.size > MAX_FILE_SIZE) return 'Imagem muito grande (máx. 5 MB).';
  return null;
}

// Lê um File e devolve uma data URL (base64).
export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
    reader.readAsDataURL(file);
  });
}

// Carrega uma data URL / URL em um HTMLImageElement.
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Imagem inválida.'));
    img.src = src;
  });
}

// Redimensiona (mantendo proporção) e comprime. Retorna data URL.
// Ideal para salvar o mascote sem estourar o limite do banco/localStorage.
export async function resizeImage(file, { maxSize = 256, quality = 0.85, type = 'image/webp' } = {}) {
  const error = validateImage(file);
  if (error) throw new Error(error);

  const dataUrl = await fileToDataURL(file);
  // SVG é vetorial, não precisa redimensionar.
  if (file.type === 'image/svg+xml') return dataUrl;

  const img = await loadImage(dataUrl);
  const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d').drawImage(img, 0, 0, w, h);

  return canvas.toDataURL(type, quality);
}

// Recorte quadrado centralizado (bom para avatar/mascote circular).
export async function cropSquare(file, { size = 256, quality = 0.85, type = 'image/webp' } = {}) {
  const error = validateImage(file);
  if (error) throw new Error(error);

  const img = await loadImage(await fileToDataURL(file));
  const side = Math.min(img.width, img.height);
  const sx = (img.width - side) / 2;
  const sy = (img.height - side) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  canvas.getContext('2d').drawImage(img, sx, sy, side, side, 0, 0, size, size);

  return canvas.toDataURL(type, quality);
}

// Transforma o SVG string do store.js (mascotes) em data URL usável em <img src>.
export const svgToDataURL = (svg) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

// Usado pelo useFinance.saveMascot: valida, recorta quadrado, comprime e devolve data URL
// pequena o bastante para caber num documento do Firestore (limite de 1 MB).
export async function fileToDataUrl(file, opts) {
  const error = validateImage(file);
  if (error) throw new Error(error);
  if (file.type === 'image/svg+xml') return fileToDataURL(file);
  return cropSquare(file, { size: 256, quality: 0.85, type: 'image/webp', ...opts });
}