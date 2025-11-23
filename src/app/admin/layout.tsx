import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import BottomBarAdmin from '@/components/admin/BottomAdmin';
import { PushNotificationProvider } from '@/components/admin/PushNotificationProvider';
import { ScrollArea } from "@/components/ui/scroll-area"; // Optional: For smoother scroll

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions);

  // 1. Secure Redirect if not logged in
  if (!session) {
    redirect('/auth/login');
  }

  // 2. Role Check
  if (session?.user.role !== 'ADMIN') {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 text-red-600 gap-4">
        <h1 className="text-6xl font-extrabold">403</h1>
        <p className="text-xl font-medium">Access Denied. This area is restricted to Administrators.</p>
        <a href="/" className="text-blue-600 hover:underline">Go back home</a>
      </div>
    );
  }

  return (
    <PushNotificationProvider>
      {/* Main Wrapper: 
        - Mobile: flex-col (Header Top -> Content Bottom)
        - Desktop: flex-row (Sidebar Left -> Content Right)
        - h-screen & overflow-hidden: Prevents body scroll, enables internal scrolling
      */}
      <div className="flex flex-col md:flex-row h-screen w-full bg-slate-50 overflow-hidden">
        
        {/* Sidebar Component (Handles Mobile Header & Desktop Sidebar) */}
        <AdminSidebar />

        {/* Content Area Wrapper */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          
          {/* Main Scrollable Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth scrollbar-hide">
             {/* - pb-24: Extra padding on bottom for Mobile BottomBar
                - md:pb-0: No extra padding needed on Desktop
                - w-full: Ensures content takes full width
             */}
            <div className="w-full min-h-full pb-24 md:pb-6 p-0 md:p-0">
              {children}
            </div>
          </main>

          {/* Mobile Bottom Bar (Fixed Position handled inside component) */}
          <BottomBarAdmin />
          
        </div>
      </div>
    </PushNotificationProvider>
  );
}