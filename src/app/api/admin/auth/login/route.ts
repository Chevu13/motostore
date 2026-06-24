import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signAdminToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email i lozinka su obavezni' }, { status: 400 })
    }

    const admin = await prisma.adminUser.findUnique({ where: { email } })
    if (!admin || !admin.isActive) {
      return NextResponse.json({ error: 'Neispravni podaci za prijavu' }, { status: 401 })
    }

    const passwordValid = await bcrypt.compare(password, admin.password)
    if (!passwordValid) {
      return NextResponse.json({ error: 'Neispravni podaci za prijavu' }, { status: 401 })
    }

    const token = await signAdminToken(admin.id, admin.email)

    const response = NextResponse.json({ success: true, email: admin.email })
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Greška pri prijavi' }, { status: 500 })
  }
}
