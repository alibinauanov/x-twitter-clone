'use client';

import Image from "@/components/Image";
import PostInfo from "./PostInfo";
import PostInteraction from "./PostInteraction";
import Video from "./Video";
import Link from "next/link";
import { Post as PostType } from "@/hooks/usePosts";
import NextImage from "next/image";

interface PostProps {
  post: PostType;
  type?: "status" | "comment";
}

const Post = ({ post, type }: PostProps) => {
  // Guard against null or undefined post
  if (!post) {
    return null;
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  return (
    <div className="p-4 border-y-[1px] border-borderGray hover:bg-[#0a0a0a] cursor-pointer transition-colors">
      <div className={`flex gap-4 ${type === "status" && "flex-col"}`}>
        <div className={`${type === "status" && "hidden"} relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0`}>
          {post.user?.img ? (
            <NextImage 
              src={post.user.img} 
              alt={post.user?.displayName || post.user?.username || 'User'} 
              width={40} 
              height={40} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <Image path="general/footballMe.jpg" alt="" w={40} h={40} tr={true} />
          )}
        </div>
        
        <div className="flex-1 flex flex-col gap-2">
          <div className="w-full flex justify-between">
            <Link href={`/${post.user?.username || 'unknown'}`} className="flex gap-4">
              <div className={`${type !== "status" && "hidden"} relative w-10 h-10 rounded-full overflow-hidden`}>
                {post.user?.img ? (
                  <NextImage 
                    src={post.user.img} 
                    alt={post.user?.displayName || post.user?.username || 'User'} 
                    width={40} 
                    height={40} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <Image path="general/footballMe.jpg" alt="" w={40} h={40} tr={true} />
                )}
              </div>
              <div className={`flex items-center gap-2 flex-wrap ${type === "status" && "flex-col gap-0 !items-start"}`}>
                <h1 className="text-md font-bold hover:underline">
                  {post.user?.displayName || post.user?.username || 'Unknown User'}
                </h1>
                <span className={`text-textGray ${type === "status" && "text-sm"}`}>
                  @{post.user?.username || 'unknown'}
                </span>
                {type !== "status" && (
                  <span className="text-textGray">
                    {formatTimeAgo(post.createdAt) || ''}
                  </span>
                )}
              </div>
            </Link>
            <PostInfo />
          </div>
          
          <Link href={`/${post.user?.username || 'unknown'}/status/${post.id}`} className="text-textGray">
            <p className={`${type === "status" && "text-lg"} whitespace-pre-wrap`}>
              {post.desc || ''}
            </p>
          </Link>
          
          {/* Media content */}
          {post.img && post.img.trim() && (
            <div className="rounded-xl overflow-hidden border border-borderGray">
              <NextImage 
                src={post.img} 
                alt="Post image" 
                width={600} 
                height={400} 
                className="w-full h-auto object-cover max-h-96"
                loading="lazy"
              />
            </div>
          )}
          
          {post.video && post.video.trim() && (
            <div className="rounded-xl overflow-hidden border border-borderGray">
              <Video path={post.video} />
            </div>
          )}
          
          {type === "status" && (
            <span className="text-textGray text-sm">
              {new Date(post.createdAt).toLocaleString() || ''}
            </span>
          )}
          
          <PostInteraction post={post} />
        </div>
      </div>
    </div>
  );
};

export default Post;