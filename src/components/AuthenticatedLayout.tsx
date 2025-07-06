'use client';

import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import LeftBar from '@/components/LeftBar';
import RightBar from '@/components/RightBar';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();

  // Check if we're on auth pages
  const isAuthPage = pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up');
  
  // For auth pages or when user is not loaded yet, render without sidebar
  if (isAuthPage || !isLoaded) {
    return <div className="min-h-screen bg-black text-white">{children}</div>;
  }

  // If user is not authenticated and not on auth page, render without sidebar
  if (!user) {
    return <div className="min-h-screen bg-black text-white">{children}</div>;
  }

  return (
    <div className="max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl xxl:max-w-screen-xxl mx-auto flex justify-between bg-black text-white">
      <div className="px-2 xsm:px-4 xxl:px-8">
        <LeftBar />
      </div>
      <div className="flex-1 lg:min-w-[600px] border-x-[1px] border-borderGray">
        {children}
      </div>
      <div className="hidden lg:flex ml-4 md:ml-8 flex-1">
        <RightBar />
      </div>
    </div>
  );
};

export default AuthenticatedLayout;
