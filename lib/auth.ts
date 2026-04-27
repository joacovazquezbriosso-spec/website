export const COOKIE_NAME = 'admin-session'

export function isValidSession(cookieValue: string | undefined): boolean {
  return cookieValue === process.env.ADMIN_SESSION_TOKEN
}
