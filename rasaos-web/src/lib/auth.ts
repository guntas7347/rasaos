/**
 * Authentication utility functions for managing JWT cookies.
 */

const TOKEN_KEY = "admin_token";

/**
 * Sets the JWT token in a cookie that expires in 7 days.
 */
export function setAuthCookie(token: string) {
  const expires = new Date();
  expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
  document.cookie = `${TOKEN_KEY}=${token};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

/**
 * Retrieves the JWT token from the cookie.
 */
export function getAuthCookie(): string | null {
  const nameEQ = `${TOKEN_KEY}=`;
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

/**
 * Deletes the JWT token cookie.
 */
export function removeAuthCookie() {
  document.cookie = `${TOKEN_KEY}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
}
