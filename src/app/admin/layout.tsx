// app/(admin)/layout.tsx

import { AdminSidebar } from '@/components/admin/AdminSidebar'


import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import BottomBarAdmin from '@/components/admin/BottomAdmin'
import { PushNotificationProvider } from '@/components/admin/PushNotificationProvider'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (session?.user.role !== 'ADMIN') {
    return <div className="p-6 text-2xl text-red-900 text-center">
      Access Denied. You do not have permission to view this page.
    </div>
  }
  return (
    <div className="sm:flex block ">
       <PushNotificationProvider >

      <AdminSidebar />
      <div className="flex flex-1 flex-col">

        <main className="p-0">{children}</main>

        <BottomBarAdmin />
        
      </div>

       </PushNotificationProvider>
    </div>
  )
}