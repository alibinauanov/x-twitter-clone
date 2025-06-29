"use client";

import NextImage from "next/image";

type ImageType = {
    path: string;
    w?: number;
    h?: number;
    alt?: string;
    className?: string;
};

const Image = ({ path, w, h, alt, className }: ImageType) => {
    // Treat any path that does NOT start with http as a local image
    const isLocal = !/^https?:\/\//.test(path);
    if (isLocal) {
        // For local images in public folder
        const src = path.startsWith("/") ? path : `/${path}`;
        return (
            <NextImage
                src={src}
                width={w}
                height={h}
                alt={alt || ""}
                className={className}
            />
        );
    }
    // Always use NextImage for full URLs (remote images)
    return (
        <NextImage
            src={path}
            width={w}
            height={h}
            alt={alt || ""}
            className={className}
        />
    );
};

export default Image;