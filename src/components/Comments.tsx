"use client";

import { useState, useActionState } from "react";
import { useUser } from "@clerk/nextjs";
import { addComment } from "@/action";
import Image from "./Image";
import NextImage from "next/image";

interface CommentsProps {
  postId: number;
}

const Comments = ({ postId }: CommentsProps) => {
    const { user } = useUser();
    const [comment, setComment] = useState("");
    
    const [state, formAction, isPending] = useActionState(
        async (prevState: { success: boolean; error: string | null }, formData: FormData) => {
            try {
                await addComment(formData);
                setComment("");
                return { success: true, error: null };
            } catch (error) {
                return { 
                    success: false, 
                    error: error instanceof Error ? error.message : "Failed to add comment" 
                };
            }
        },
        { success: false, error: null }
    );

    return (
        <div className="border-b border-borderGray">
            <form action={formAction} className="flex items-center justify-between gap-4 p-4">
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    {user?.imageUrl ? (
                        <NextImage 
                            src={user.imageUrl} 
                            alt="Your profile" 
                            width={40} 
                            height={40} 
                            className="w-full h-full object-cover" 
                        />
                    ) : (
                        <Image path="general/footballMe.jpg" alt="" w={40} h={40} tr={true} />
                    )}
                </div>
                <input 
                    type="text" 
                    name="desc"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="flex-1 bg-transparent outline-none p-2 text-xl placeholder:text-textGray" 
                    placeholder="Post your reply"
                    disabled={isPending}
                    maxLength={280}
                />
                <input type="hidden" name="postId" value={postId} />
                <button 
                    type="submit"
                    disabled={isPending || !comment.trim()}
                    className="py-2 px-4 font-bold bg-white text-black rounded-full disabled:opacity-50"
                >
                    {isPending ? "..." : "Reply"}
                </button>
            </form>
            {state.error && (
                <div className="text-red-500 text-sm px-4 pb-2">{state.error}</div>
            )}
        </div>
    );
};

export default Comments;