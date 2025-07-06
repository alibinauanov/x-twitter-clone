"use client";

import { useNotifications } from "@/contexts/NotificationContext";
import Image from "@/components/Image";
import Link from "next/link";

const NotificationsPage = () => {
    const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotifications();

    return (
        <div className="">
            <div className="flex items-center justify-between p-4 border-b border-borderGray sticky top-0 backdrop-blur-md bg-[#00000084] z-10">
                <h1 className="text-xl font-bold">Notifications</h1>
                <div className="flex gap-2">
                    {notifications.length > 0 && (
                        <>
                            <button 
                                onClick={markAllAsRead}
                                className="text-sm text-iconBlue hover:underline"
                            >
                                Mark all read
                            </button>
                            <button 
                                onClick={clearNotifications}
                                className="text-sm text-red-400 hover:underline"
                            >
                                Clear all
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="">
                {notifications.length === 0 ? (
                    <div className="text-center py-12 text-textGray">
                        <div className="mb-4">
                            <Image path="icons/notification.svg" alt="No notifications" w={48} h={48} className="mx-auto opacity-50" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">No notifications yet</h2>
                        <p>When someone likes, comments, or follows you, you&apos;ll see it here.</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-4 border-b border-borderGray hover:bg-[#0a0a0a] cursor-pointer transition-colors ${
                                !notification.read ? 'bg-[#0d1419] border-l-4 border-l-iconBlue' : ''
                            }`}
                            onClick={() => markAsRead(notification.id)}
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-iconBlue">
                                    {notification.type === 'like' && (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                            <path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/>
                                        </svg>
                                    )}
                                    {notification.type === 'comment' && (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                            <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/>
                                        </svg>
                                    )}
                                    {notification.type === 'follow' && (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                            <path d="M17.863 13.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44zM12 2C9.791 2 8 3.79 8 6s1.791 4 4 4 4-1.79 4-4-1.791-4-4-4z"/>
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className={`${!notification.read ? 'font-semibold' : ''}`}>
                                        {notification.message}
                                    </p>
                                    <p className="text-textGray text-sm mt-1">
                                        {new Date(notification.timestamp).toLocaleString()}
                                    </p>
                                    {notification.postId && (
                                        <Link 
                                            href={`/post/${notification.postId}`}
                                            className="text-iconBlue text-sm hover:underline mt-2 inline-block"
                                        >
                                            View post
                                        </Link>
                                    )}
                                </div>
                                {!notification.read && (
                                    <div className="w-2 h-2 bg-iconBlue rounded-full flex-shrink-0 mt-2"></div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
