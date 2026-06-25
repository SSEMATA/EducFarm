/**
 * Add cache-busting parameter to avatar URLs
 * This ensures that avatar changes are reflected immediately across all devices
 */
export function addCacheBuster(avatarUrl) {
  if (!avatarUrl) return '';
  
  // Remove existing cache-buster if present
  const baseUrl = avatarUrl.split('?v=')[0];
  
  // Add new cache-buster with current timestamp
  const timestamp = Math.floor(Date.now() / 1000);
  return `${baseUrl}?v=${timestamp}`;
}

/**
 * Ensure avatar URL has a recent cache-buster
 * Used when displaying cached user data
 */
export function ensureFreshAvatar(avatarUrl) {
  if (!avatarUrl) return '';
  
  const baseUrl = avatarUrl.split('?v=')[0];
  // Always refresh with current timestamp when displaying
  const timestamp = Math.floor(Date.now() / 1000);
  return `${baseUrl}?v=${timestamp}`;
}
