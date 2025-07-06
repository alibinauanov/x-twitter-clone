import Image from "@/components/Image";

const PostInfo = () => {
    try {
        return (
            <div className="cursor-pointer w-4 h-4 relative">
                <Image path="icons/infoMore.svg" alt="" w={16} h={16} />
            </div>
        );
    } catch (error) {
        console.error('Error in PostInfo:', error);
        return (
            <div className="cursor-pointer w-4 h-4 relative">
                <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
            </div>
        );
    }
};

export default PostInfo;