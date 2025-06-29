"use client";
import { IKVideo } from "imagekitio-next";

const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;

type VideoType = {
    path: string;
    className?: string;
};

const Video = ({ path, className }: VideoType) => {
    return (
        <IKVideo 
            urlEndpoint={urlEndpoint} 
            path={path} 
            className={className} 
            transformation={[
                { width: 1920, height: 1080, quality: 90 },
                { raw: "l-text,i-alibucci,fs-100,co-white,l-end" },
            ]} 
            controls 
        />
    );
};

export default Video;