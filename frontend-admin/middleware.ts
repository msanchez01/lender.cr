import { auth } from '@/lib/auth'

export default auth

export const config = {
  matcher: ['/((?!login|api|_next|_vercel|.*\\..*).*)'],
}
