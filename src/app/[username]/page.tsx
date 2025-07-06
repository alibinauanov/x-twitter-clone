"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useUser, useFollowMutation } from "@/hooks/useUser";
import { useUser as useClerkUser } from "@clerk/nextjs";
import Post from "@/components/Post";
import EditProfileModal from "@/components/EditProfileModal";

export default function UserPage() {
  const params = useParams();
  const username = params?.username as string;
  
  // State for EditProfileModal
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  
  // Fetch real user data
  const { user: clerkUser } = useClerkUser();
  const { data: user, isLoading, error } = useUser(username);
  const followMutation = useFollowMutation();

  const handleFollow = () => {
    if (user) {
      followMutation.mutate(user.id);
    }
  };

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading @{username}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Profile not found</h1>
          <p className="text-gray-400 mb-4">Sorry, this user doesn&apos;t exist.</p>
          <Link href="/" className="text-blue-400 hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">User not found</h1>
          <p className="text-gray-400 mb-4">This user doesn&apos;t exist.</p>
          <Link href="/" className="text-blue-400 hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = clerkUser?.username === username;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 backdrop-blur-md bg-black/80 border-b border-gray-800 z-10">
        <div className="flex items-center px-4 py-3">
          <Link href="/" className="p-2 rounded-full hover:bg-gray-900 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
          <div className="ml-8">
            <h1 className="text-xl font-bold">{user?.displayName || user?.username || 'Unknown User'}</h1>
            <p className="text-sm text-gray-400">{user?._count?.posts || 0} posts</p>
          </div>
        </div>
      </div>

      {/* Cover Photo */}
      <div className="relative">
        <div className="w-full h-48 sm:h-64 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 relative overflow-hidden">
          {user?.cover && (
            <Image 
              src={user.cover} 
              alt="Cover photo" 
              fill
              className="object-cover"
            />
          )}
        </div>
        
        {/* Profile Picture */}
        <div className="absolute -bottom-12 sm:-bottom-16 left-4">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-black bg-gray-600 flex items-center justify-center text-2xl sm:text-4xl font-bold overflow-hidden">
            {user?.img ? (
              <Image 
                src={user.img} 
                alt={user?.displayName || user?.username || 'User'} 
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white">
                {(user?.displayName || user?.username || 'U').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Profile Actions */}
      <div className="flex justify-end p-4 pt-4 sm:pt-6">
        <div className="flex gap-2">
          <button className="p-2 rounded-full border border-gray-600 hover:bg-gray-900 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          
          {!isOwnProfile && (
            <>
              <button className="p-2 rounded-full border border-gray-600 hover:bg-gray-900 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>
              <button 
                onClick={handleFollow}
                disabled={followMutation.isPending}
                className={`px-4 sm:px-6 py-2 text-sm sm:text-base font-bold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  user?.isFollowing 
                    ? "bg-transparent border border-gray-500 text-white hover:bg-red-500 hover:border-red-500 hover:text-white group" 
                    : "bg-white text-black hover:bg-gray-200"
                }`}
              >
                {followMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    <span>...</span>
                  </div>
                ) : (
                  <span className={user?.isFollowing ? "group-hover:hidden" : ""}>
                    {user?.isFollowing ? "Following" : "Follow"}
                  </span>
                )}
                {user?.isFollowing && !followMutation.isPending && (
                  <span className="hidden group-hover:inline">Unfollow</span>
                )}
              </button>
            </>
          )}
          
          {isOwnProfile && (
            <button 
              onClick={() => setIsEditProfileModalOpen(true)}
              className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-transparent border border-gray-500 text-white font-bold rounded-full hover:bg-gray-800 transition-colors"
            >
              Edit profile
            </button>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-4 pb-4">
        <div className="mb-3 mt-2 sm:mt-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold">{user?.displayName || user?.username || 'Unknown User'}</h1>
            {/* Verification badge - shown for users with >100 followers or website */}
            {(user?._count?.followers > 100 || user?.website) && (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <p className="text-sm sm:text-base text-gray-400">@{user?.username || 'unknown'}</p>
        </div>

        {user?.bio && <p className="text-white mb-3">{user.bio}</p>}
        {user?.job && <p className="text-gray-300 mb-3 font-medium">{user.job}</p>}

        <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-3">
          {user?.location && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{user.location}</span>
            </div>
          )}
          {user?.website && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <Link href={user.website} className="text-blue-400 hover:underline">
                {user.website}
              </Link>
            </div>
          )}
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown'}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 sm:gap-5 text-sm">
          <div className="hover:underline cursor-pointer">
            <span className="font-bold text-white">{user?._count?.followings?.toLocaleString() || 0}</span>
            <span className="text-gray-400 ml-1">Following</span>
          </div>
          <div className="hover:underline cursor-pointer">
            <span className="font-bold text-white">{user?._count?.followers?.toLocaleString() || 0}</span>
            <span className="text-gray-400 ml-1">Followers</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 sticky top-16 bg-black/95 backdrop-blur-md z-10">
        <div className="flex">
          <button className="flex-1 py-3 sm:py-4 text-center text-sm sm:text-base font-semibold border-b-2 border-blue-500 text-white">
            Posts
          </button>
          <button className="flex-1 py-3 sm:py-4 text-center text-sm sm:text-base font-semibold text-gray-400 hover:text-white transition-colors">
            Replies
          </button>
          <button className="flex-1 py-3 sm:py-4 text-center text-sm sm:text-base font-semibold text-gray-400 hover:text-white transition-colors">
            Media
          </button>
          <button className="flex-1 py-3 sm:py-4 text-center text-sm sm:text-base font-semibold text-gray-400 hover:text-white transition-colors">
            Likes
          </button>
        </div>
      </div>

      {/* Posts Section */}
      <div className="">
        {!user?.posts || user.posts.length === 0 ? (
          <div className="text-center py-12 px-4 text-gray-400">
            <div className="max-w-md mx-auto">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m0 0V6a2 2 0 012-2h6a2 2 0 012 2v2" />
              </svg>
              <h3 className="text-lg font-semibold mb-2 text-white">No posts yet</h3>
              <p className="text-sm">
                {isOwnProfile 
                  ? "Share your thoughts with the world!" 
                  : `@${user?.username || 'user'} hasn't posted anything yet.`}
              </p>
              {isOwnProfile && (
                <Link href="/compose/post" className="inline-block mt-4 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
                  Create your first post
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {user.posts.map((post) => (
              <Post key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        currentUser={user}
      />
    </div>
  );
}