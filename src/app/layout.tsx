import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import QueryProvider from '@/components/QueryProvider';
import { SocketProvider } from '@/contexts/SocketContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

export default function RootLayout({
  children,
  // modal
}: Readonly<{
  children: React.ReactNode;
  // modal: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <QueryProvider>
            <SocketProvider>
              <NotificationProvider>
                <AuthenticatedLayout>
                  {children}
                  {/* {modal} */}
                </AuthenticatedLayout>
              </NotificationProvider>
            </SocketProvider>
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
