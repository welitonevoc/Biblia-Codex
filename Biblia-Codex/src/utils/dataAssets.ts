/**
 * This utility maps data filenames to their bundled URLs.
 * Since the data files were moved to node_modules, we use Vite's glob import
 * to ensure they are correctly processed and available during both dev and production.
 */

// Import all files in the data directory as URLs
const dataAssets = import.meta.glob('/node_modules/@biblia-codex/data/*', { 
  query: '?url', 
  eager: true 
}) as Record<string, { default: string }>;

/**
 * Returns the correct URL for a data file given its original filename.
 */
export function getDataUrl(filename: string): string {
  // filename might be "/Merrill.json.gz" or "Merrill.json.gz"
  const cleanName = filename.startsWith('/') ? filename.substring(1) : filename;
  
  // The glob keys look like "/node_modules/@biblia-codex/data/Merrill.json.gz"
  const assetKey = `/node_modules/@biblia-codex/data/${cleanName}`;
  const asset = dataAssets[assetKey];
  
  if (asset) {
    return asset.default;
  }
  
  // Fallback to original path if not found (might still be in public)
  return filename;
}
