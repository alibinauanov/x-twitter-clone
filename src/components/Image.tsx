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

const Image = ({ path, w, h, alt, tr, className }: ImageType) => {
    // If path is a full URL (starts with http), use IKImage for ImageKit URLs, NextImage for others
    if (/^https?:\/\//.test(path)) {
        if (urlEndpoint && path.startsWith(urlEndpoint)) {
            // ImageKit URL
            return (
                <IKImage
                    urlEndpoint={urlEndpoint}
                    path={path.replace(urlEndpoint, "")}
                    {...(tr
                        ? { transformation: [{ width: `${w}`, height: `${h}` }] }
                        : { width: w, height: h })}
                    lqip={{ active: true, quality: 20 }}
                    alt={alt || ""}
                    className={className}
                />
            );
        } else {
            // Other remote image
            return (
                <NextImage
                    src={path}
                    width={w}
                    height={h}
                    alt={alt || ""}
                    className={className}
                />
            );
        }
    }
    // Local image from public folder
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
};

export default Image;