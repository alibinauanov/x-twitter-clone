"use client";

import { useRecommendations, useFollowMutation, User } from "@/hooks/useUser";
import { useSocket } from "@/contexts/SocketContext";
import { useUser } from "@clerk/nextjs";
import Image from "./Image";
import Link from "next/link";

const Recommendations = () => {
    const { data: recommendations, isLoading } = useRecommendations();
    const followMutation = useFollowMutation();
    const { socket } = useSocket();
    const { user } = useUser();

    const handleFollow = (targetUser: User) => {
        followMutation.mutate(targetUser.id, {
            onSuccess: () => {
                // Emit real-time notification
                if (socket && user) {
                    socket.emit('follow-user', {
                        userId: targetUser.id,
                        followedByUser: user.firstName || user.username || 'Someone'
                    });
                }
            }
        });
    };

    if (isLoading) return <div className="p-4">Loading...</div>;
    if (!recommendations || recommendations.length === 0) return null;

    return (
        <div className="p-4 rounded-2xl border-[1px] border-borderGray flex flex-col gap-4">
            <h2 className="text-xl font-bold">Who to follow</h2>
            {recommendations.map((recommendedUser) => (
                <div key={recommendedUser.id} className="flex items-center justify-between">
                    <Link href={`/${recommendedUser.username}`} className="flex items-center gap-2 flex-1">
                        <div className="relative rounded-full overflow-hidden w-10 h-10">
                            <Image 
                                path={recommendedUser.img || "general/footballMe.jpg"} 
                                alt={recommendedUser.username} 
                                w={100} 
                                h={100} 
                                tr={true} 
                            />
                        </div>
                        <div className="">
                            <h1 className="hover:underline">{recommendedUser.displayName || recommendedUser.username}</h1>
                            <span className="text-textGray text-sm">@{recommendedUser.username}</span>
                            {Array.isArray(recommendedUser.followers) && recommendedUser.followers.length > 0 && (
                                <div className="text-textGray text-xs">
                                    Followed by {recommendedUser.followers.map((f: { follower: { displayName?: string; username: string } }) => f.follower.displayName || f.follower.username).join(', ')}
                                </div>
                            )}
                        </div>
                    </Link>
                    <button
                        onClick={() => handleFollow(recommendedUser)}
                        disabled={followMutation.isPending}
                        className="py-1 px-4 font-semibold bg-white text-black rounded-full hover:bg-gray-200 disabled:opacity-50"
                    >
                        {followMutation.isPending ? "..." : "Follow"}
                    </button>
                </div>
            ))}
            <Link href="/explore" className="text-iconBlue hover:underline">
                Show More
            </Link>
        </div>
    );
};

export default Recommendations;
