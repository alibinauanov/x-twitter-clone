"use client";

// import Image from "next/image";
import Image from "@/components/Image";
import Link from "next/link";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { useNotifications } from "@/contexts/NotificationContext";
import NextImage from "next/image";
import { useState } from "react";

const LeftBar = () => {
    const { user } = useUser();
    const { unreadCount } = useNotifications();
    const [showDropdown, setShowDropdown] = useState(false);
    
    const menuList = [
        {
            id: 1,
            name: "Homepage",
            link: "/",
            icon: "home.svg",
        },
        {
            id: 2,
            name: "Explore",
            link: "/",
            icon: "explore.svg",
        },
        {
            id: 3,
            name: "Notifications",
            link: "/notifications",
            icon: "notification.svg",
        },
        {
            id: 4,
            name: "Messages",
            link: "/",
            icon: "message.svg",
        },
        {
            id: 5,
            name: "Jobs",
            link: "/",
            icon: "job.svg",
        },
        {
            id: 6,
            name: "Communities",
            link: "/",
            icon: "community.svg",
        },
        {
            id: 7,
            name: "Premium",
            link: "/",
            icon: "logo.svg",
        },
        {
            id: 8,
            name: "Profile",
            link: `/${user?.username || 'profile'}`,
            icon: "profile.svg",
        },
        {
            id: 9,
            name: "More",
            link: "/",
            icon: "more.svg",
        }
    ];
    
    return (
        <div className="h-screen sticky top-0 flex flex-col justify-between pt-2 pb-6 w-16 sm:w-20 lg:w-64 ml-2 sm:ml-4 lg:ml-12">
            <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4 text-base sm:text-lg items-start">
                <Link href="/" className="p-2 rounded-full hover:bg-[#181818]">
                    <Image path="general/logo.png" alt="Logo" w={48} h={48} />
                </Link>

                <div className="flex flex-col gap-1 sm:gap-2 w-full">
                    {menuList.map((item) => (
                        <Link
                            href={item.link}
                            className="p-2 rounded-full hover:bg-[#181818] flex items-center gap-2 sm:gap-3 lg:gap-4 w-full relative"
                            key={item.id}
                        >
                                <Image
                                    path={`icons/${item.icon}`}
                                    alt={item.name}
                                    w={24}
                                    h={24}
                                />
                                <span className="hidden lg:inline">{item.name}</span>
                                {item.name === "Notifications" && unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center lg:relative lg:top-0 lg:right-0 lg:ml-auto">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                        </Link>
                    ))}
                </div>

                <Link href="/compose/post" className="bg-white text-black rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center lg:hidden ml-0">
                    <Image path="icons/post.svg" alt="new post" w={24} h={24} />
                </Link>
                <Link href="/compose/post" className="hidden lg:flex bg-white text-black rounded-full font-bold py-2 px-8 w-full max-w-[180px] items-center justify-center ml-0">
                    Post
                </Link>
            </div>

            <div className="flex flex-col gap-2 relative">
                <div className="flex items-center justify-between w-full">
                    <Link href={`/${user?.username || 'profile'}`} className="flex items-center gap-1 sm:gap-2 flex-1">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 aspect-square relative rounded-full overflow-hidden">
                            {user?.imageUrl ? (
                                <NextImage src={user.imageUrl} alt="Profile" width={100} height={100} className="w-full h-full object-cover" />
                            ) : (
                                <Image path="/general/footballMe.jpg" alt="Profile" w={100} h={100} tr={true} />
                            )}
                        </div>
                        <div className="hidden lg:flex flex-col">
                            <span className="font-bold">{user?.firstName || user?.username || 'User'}</span>
                            <span className="text-sm text-textGray">@{user?.username || 'username'}</span>
                        </div>
                    </Link>
                    <div 
                        className="hidden lg:block cursor-pointer font-bold px-4 py-2 hover:bg-[#181818] rounded-full transition-colors"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        ...
                    </div>
                </div>
                
                {showDropdown && (
                    <div className="absolute bottom-full mb-2 right-0 bg-black border border-borderGray rounded-lg shadow-lg p-2 min-w-[120px]">
                        <SignOutButton>
                            <button className="w-full text-left px-3 py-2 text-sm hover:bg-[#181818] rounded-lg transition-colors text-red-400">
                                Sign out
                            </button>
                        </SignOutButton>
                    </div>
                )}
            </div>
        </div>
    )
}

export default LeftBar;