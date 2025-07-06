"use client";

import React, { useState, useActionState } from "react";
import Image from "./Image";
import NewImage from "next/image";
import { createPost } from "@/action";
import ImageEditor from "./ImageEditor";
import { useUser } from "@clerk/nextjs";

const Share = () => {
    const { user } = useUser();
    const [media, setMedia] = useState<File | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [settings, setSettings] = useState<{
        type: "original" | "wide" | "square";
        sensitive: boolean;
    }>({
        type:"original",
        sensitive: false,
    });

    const [state, formAction, isPending] = useActionState(
        async (prevState: { success: boolean; error: string | null }, formData: FormData) => {
            try {
                await createPost(formData);
                setMedia(null); // Clear media after successful post
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

    return (
        <form className="p-4 flex gap-4" action={formAction}>
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
                {user?.imageUrl ? (
                    <NewImage src={user.imageUrl} alt="User profile" width={100} height={100} className="w-full h-full object-cover" />
                ) : (
                    <Image path="general/footballMe.jpg" alt="" w={100} h={100} tr={true} />
                )}
            </div>
            <div className="flex-1 flex flex-col gap-4">
                <input 
                    type="text" 
                    name="desc" 
                    placeholder="What is happening?!" 
                    className="bg-transparent outline-none placeholder:text-textGray text-xl"
                    disabled={isPending}
                />
                
                {state.error && (
                    <div className="text-red-500 text-sm">{state.error}</div>
                )}
                
                {media?.type.includes("image") && previewURL && (
                    <div className="relative rounded-xl overflow-hidden">
                        <NewImage 
                            src={previewURL} 
                            alt="" 
                            width={600} 
                            height={600} 
                            className={`w-full ${settings.type === "original" ? "h-full object-contain" : settings.type === "square" ? "aspect-square object-cover" : "aspect-video object-cover"}`} 
                        />
                        <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white py-1 px-4 rounded-full font-bold text-sm cursor-pointer" onClick={()=>setIsEditorOpen(true)}>Edit</div>
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white h-8 w-8 flex items-center justify-center rounded-full cursor-pointer font-bold text-sm" onClick={() => setMedia(null)}>X</div>
                    </div>
                )}
                {media?.type.includes("video") && previewURL && (
                    <div className="relative">
                        <video src={previewURL} controls />
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white h-8 w-8 flex items-center justify-center rounded-full cursor-pointer font-bold text-sm" onClick={() => setMedia(null)}>X</div>
                    </div>
                )}
                {isEditorOpen && previewURL && <ImageEditor onClose={()=>setIsEditorOpen(false)} previewURL={previewURL} settings={settings} setSettings={setSettings} />}
                
                <input type="file" name="file" onChange={handleMediaChange} className="hidden" id="file" accept="image/*,video/*" />
                <input type="hidden" name="isSensitive" value={settings.sensitive ? "true" : "false"} />
                
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex gap-4 flex-wrap">
                        <label htmlFor="file">
                            <Image path="icons/image.svg" alt="" w={20} h={20} className="cursor-pointer" />
                        </label>
                        <Image path="icons/gif.svg" alt="" w={20} h={20} className="cursor-pointer" />
                        <Image path="icons/poll.svg" alt="" w={20} h={20} className="cursor-pointer" />
                        <Image path="icons/emoji.svg" alt="" w={20} h={20} className="cursor-pointer" />
                        <Image path="icons/schedule.svg" alt="" w={20} h={20} className="cursor-pointer" />
                        <Image path="icons/location.svg" alt="" w={20} h={20} className="cursor-pointer" />
                    </div>
                    <button 
                        type="submit"
                        disabled={isPending}
                        className="bg-white text-black font-bold rounded-full py-2 px-4 disabled:opacity-50"
                    >
                        {isPending ? "Posting..." : "Post"}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default Share;