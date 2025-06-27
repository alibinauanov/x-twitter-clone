"use client";

import { IKImage } from "imagekitio-next";
import NextImage from "next/image";

type ImageType = {
    path: string;
    w?: number;
    h?: number;
    alt?: string;
    className?: string;
    tr?: boolean;
};

const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;

const Image = ({ path, w, h, alt, className, tr }: ImageType) => {
    // Use NextImage for local images (path starts with "/" or does not start with http)
    const isLocal = path.startsWith("/") || !/^https?:\/\//.test(path);
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
    // For remote images via ImageKit
    return (
        <IKImage
            urlEndpoint={urlEndpoint}
            path={path}
            {...(tr ? { transformation:[{ width: `${w}`, height: `${h}` }]} : {width: w, height: h})}
            alt={alt}
            className={className}
        />
    );
};

export default Image;