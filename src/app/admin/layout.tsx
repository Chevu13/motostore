import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  return (
    <div className="min-h-screen flex bg-[#0A0A0F]">
      <AdminSidebar adminEmail={session.email} />
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
