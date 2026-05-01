/**
 * This utility maps data filenames to their bundled URLs.
 * Files are copied to public/data/ during build preparation.
 */

/**
 * Returns the correct URL for a data file given its original filename.
 * Looks in /data/ (public folder) for the file.
 */
export function getDataUrl(filename: string): string {
  // Clean the filename - remove any path prefixes
  const cleanName = filename.split('/').pop() || filename;
  
  // Return the path to the data folder in public
  return `/data/${cleanName}`;
}
