import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'fallback-secret-change-in-production-min32',
)

export async function signAdminToken(adminId: string, email: string): Promise<string> {
  return await new SignJWT({ adminId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(JWT_SECRET)
}

export async function verifyAdminToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as { adminId: string; email: string }
  } catch {
    return null
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (!token) return null
  return await verifyAdminToken(token)
}

export async function requireAdminSession() {
  const session = await getAdminSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}
