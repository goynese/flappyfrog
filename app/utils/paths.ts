export function getPublicPath(assetPath: string): string {
  const basePath = process.env.NODE_ENV === 'production' ? '/your-repo-name' : '';
  return `${basePath}${assetPath}`;
} 