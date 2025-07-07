"use client";

import { usePost } from "@/hooks/useUser";
import { useUser as useClerkUser } from "@clerk/nextjs";
import Image from "@/components/Image";
import NextImage from "next/image";
import PostInteraction from "@/components/PostInteraction";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const StatusPage = () => {
    const params = useParams();
    const postId = params?.postId as string;
    const { data: post, isLoading, error } = usePost(postId);
    const { user } = useClerkUser();
    const [comment, setComment] = useState("");
    const [commentError, setCommentError] = useState("");
    const queryClient = useQueryClient();

    // Comment mutation
    const commentMutation = useMutation({
        mutationFn: async (commentText: string) => {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postId: parseInt(postId),
                    desc: commentText,
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to post comment');
            }
            
            return response.json();
        },
        onSuccess: () => {
            // Refresh the post data to show new comment
            queryClient.invalidateQueries({ queryKey: ['post', postId] });
            setComment(""); // Clear the input
            setCommentError(""); // Clear any previous errors
        },
        onError: (error: Error) => {
            setCommentError(error.message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (comment.trim() && !commentMutation.isPending) {
            commentMutation.mutate(comment.trim());
        }
    };

    if (isLoading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4">Error loading post</div>;
    if (!post) return <div className="p-4">Post not found</div>;

    return (
        <div className="bg-black text-white min-h-screen">
            <div className="flex items-center gap-8 sticky top-0 backdrop-blur-md p-4 z-10 bg-[#00000084]">
                <Link href="/">
                    <Image path="icons/back.svg" alt="back" w={24} h={24} />
                </Link>
                <h1 className="font-bold text-lg">Post</h1>
            </div>
            
            {/* Main Post */}
            <div className="border-b border-borderGray p-4">
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        <Image 
                            path={post.user.img || "general/footballMe.jpg"} 
                            alt={post.user.username} 
                            w={48} 
                            h={48} 
                            tr={true} 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center gap-2">
                            <Link href={`/${post.user.username}`} className="font-bold hover:underline">
                                {post.user.displayName || post.user.username}
                            </Link>
                            <Link href={`/${post.user.username}`} className="text-textGray text-sm hover:underline">
                                @{post.user.username}
                            </Link>
                        </div>
                        <div className="mt-2">
                            <p className="text-white mb-3">{post.desc}</p>
                            {post.img && post.img.trim() && (
                                <div className="mb-3 rounded-xl overflow-hidden border border-borderGray max-w-full">
                                    <NextImage 
                                        src={post.img} 
                                        alt="Post image" 
                                        width={600}
                                        height={400}
                                        className="w-full h-auto object-cover max-h-96"
                                        priority
                                    />
                                </div>
                            )}
                            {post.video && post.video.trim() && (
                                <div className="mb-3 rounded-xl overflow-hidden border border-borderGray">
                                    <video className="w-full h-auto max-h-96" controls>
                                        <source src={post.video} type="video/mp4" />
                                    </video>
                                </div>
                            )}
                            <div className="text-textGray text-sm mb-3">
                                {new Date(post.createdAt).toLocaleString()}
                            </div>
                            <PostInteraction post={post} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            <div className="border-b border-borderGray p-4">
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        <Image 
                            path={user?.imageUrl || "general/footballMe.jpg"} 
                            alt="Your profile" 
                            w={40} 
                            h={40} 
                            tr={true} 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1">
                        <input 
                            type="text" 
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full bg-transparent outline-none p-2 text-xl" 
                            placeholder="Post your reply" 
                            disabled={commentMutation.isPending}
                        />
                        {commentError && (
                            <p className="text-red-500 text-sm mt-1">{commentError}</p>
                        )}
                    </div>
                    <button 
                        type="submit"
                        disabled={!comment.trim() || commentMutation.isPending}
                        className="py-2 px-4 font-bold bg-white text-black rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {commentMutation.isPending ? "Posting..." : "Reply"}
                    </button>
                </form>
            </div>

            {/* Comments List */}
            <div className="">
                {post.directComments && post.directComments.length > 0 ? (
                    post.directComments.map((comment) => (
                        <div key={comment.id} className="border-b border-borderGray p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                    <Image 
                                        path={comment.user.img || "general/footballMe.jpg"} 
                                        alt={comment.user.username} 
                                        w={40} 
                                        h={40} 
                                        tr={true} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Link href={`/${comment.user.username}`} className="font-bold hover:underline">
                                            {comment.user.displayName || comment.user.username}
                                        </Link>
                                        <Link href={`/${comment.user.username}`} className="text-textGray text-sm hover:underline">
                                            @{comment.user.username}
                                        </Link>
                                        <span className="text-textGray text-sm">
                                            · {new Date(comment.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-white">{comment.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-gray-400">
                        <p className="text-lg mb-2">No replies yet</p>
                        <p className="text-sm">Be the first to reply to this post!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatusPage;