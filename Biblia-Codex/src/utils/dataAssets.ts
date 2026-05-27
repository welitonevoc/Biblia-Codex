export function getDataUrl(filename: string): string {
  const cleanName = filename.split('/').pop() || filename;
  return `${import.meta.env.BASE_URL}data/${cleanName}`;
}
