"use client";

import { useState, useActionState } from "react";
import { useUser } from "@clerk/nextjs";
import { createPost } from "@/action";
import Image from "@/components/Image";
import NextImage from "next/image";
import { useRouter } from "next/navigation";

const CreatePostPage = () => {
    const { user } = useUser();
    const router = useRouter();
    const [media, setMedia] = useState<File | null>(null);
    const [desc, setDesc] = useState("");
    
    const [state, formAction, isPending] = useActionState(
        async (prevState: { success: boolean; error: string | null }, formData: FormData) => {
            try {
                await createPost(formData);
                setMedia(null);
                setDesc("");
                router.push("/");
                return { success: true, error: null };
            } catch (error) {
                return { 
                    success: false, 
                    error: error instanceof Error ? error.message : "Failed to create post" 
                };
            }
        },
        { success: false, error: null }
    );

    const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setMedia(e.target.files[0]);
        }
    };

    const previewURL = media ? URL.createObjectURL(media) : null;
    
    const closeModal = () => {
        router.back();
    };

    return (
        <div className="absolute w-screen h-screen top-0 left-0 z-20 bg-[#293139a6] flex justify-center">
            <div className="py-4 px-8 rounded-xl bg-black w-[600px] h-max mt-12">
                <div className="flex items-center justify-between ">
                    <div className="cursor-pointer" onClick={closeModal}>X</div>
                    <div className="text-iconBlue font-bold">Drafts</div>
                </div>
                
                <form action={formAction} className="py-8 flex gap-4 flex-col">
                    <div className="flex gap-4">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden">
                            {user?.imageUrl ? (
                                <NextImage 
                                    src={user.imageUrl} 
                                    alt="User profile" 
                                    width={40} 
                                    height={40} 
                                    className="w-full h-full object-cover" 
                                />
                            ) : (
                                <Image path="general/footballMe.jpg" alt="" w={40} h={40} tr={true} />
                            )}
                        </div>
                        <textarea
                            name="desc"
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            placeholder="What is happening?!"
                            className="flex-1 bg-transparent outline-none text-lg resize-none border-none min-h-[60px]"
                            disabled={isPending}
                            maxLength={280}
                        />
                    </div>
                    
                    {state.error && (
                        <div className="text-red-500 text-sm">{state.error}</div>
                    )}
                    
                    {media?.type.includes("image") && previewURL && (
                        <div className="relative rounded-xl overflow-hidden border border-borderGray">
                            <NextImage 
                                src={previewURL} 
                                alt="" 
                                width={600} 
                                height={400} 
                                className="w-full h-auto object-cover max-h-96" 
                            />
                            <button
                                type="button"
                                onClick={() => setMedia(null)}
                                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white h-8 w-8 flex items-center justify-center rounded-full cursor-pointer font-bold text-sm hover:bg-opacity-75"
                            >
                                ×
                            </button>
                        </div>
                    )}
                    
                    {media?.type.includes("video") && previewURL && (
                        <div className="relative rounded-xl overflow-hidden border border-borderGray">
                            <video src={previewURL} controls className="w-full h-auto max-h-96" />
                            <button
                                type="button"
                                onClick={() => setMedia(null)}
                                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white h-8 w-8 flex items-center justify-center rounded-full cursor-pointer font-bold text-sm hover:bg-opacity-75"
                            >
                                ×
                            </button>
                        </div>
                    )}
                    
                    <input type="file" name="file" onChange={handleMediaChange} className="hidden" id="file" accept="image/*,video/*" />
                    
                    <div className="flex items-center justify-between gap-4 flex-wrap border-t border-borderGray pt-4">
                        <div className="flex gap-4 flex-wrap">
                            <label htmlFor="file" className="cursor-pointer">
                                <Image path="icons/image.svg" alt="" w={20} h={20} />
                            </label>
                            <Image path="icons/gif.svg" alt="" w={20} h={20} className="cursor-pointer" />
                            <Image path="icons/poll.svg" alt="" w={20} h={20} className="cursor-pointer" />
                            <Image path="icons/emoji.svg" alt="" w={20} h={20} className="cursor-pointer" />
                            <Image path="icons/schedule.svg" alt="" w={20} h={20} className="cursor-pointer" />
                            <Image path="icons/location.svg" alt="" w={20} h={20} className="cursor-pointer" />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-textGray">
                                {desc.length}/280
                            </div>
                            <button 
                                type="submit"
                                disabled={isPending || !desc.trim()}
                                className="py-2 px-5 text-black bg-white rounded-full font-bold disabled:opacity-50"
                            >
                                {isPending ? "Posting..." : "Post"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePostPage;
