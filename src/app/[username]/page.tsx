import Feed from "@/components/Feed";
import Image from "@/components/Image";
import Link from "next/link";

const UserPage = () => {
    return (
        <div className="">
            <div className="flex items-center gap-8 sticky top-0 backdrop-blur-md p-4 z-10 bg-[#00000084]">
                <Link href="/">
                    <Image path="icons/back.svg" alt="back" w={24} h={24} />
                </Link>
                <h1 className="font-bold text-lg">Alibi Nauanov</h1>
            </div>
            <div className="">
                <div className="relative w-full">
                    <div className="w-full aspect-[3/1] relative">
                        <Image path="general/post.jpeg" alt="" w={600} h={100} tr={true} />
                    </div>
                    <div className="w-1/5 aspect-square rounded-full overflow-hidden border-4 border-black bg-gray-300 absolute left-4 -translate-y-1/2">
                        <Image path="general/footballMe.jpg" alt="" w={150} h={150} tr={true} />
                    </div>
                </div>
                <div className="flex w-full items-center justify-end gap-2 p-2">
                    <div className="w-9 h-9 flex items-center justify-center rounded-full border-[1px] border-gray-500 cursor-pointer">
                        <Image path="icons/more.svg" alt="more" w={20} h={20} />
                    </div>
                    <div className="w-9 h-9 flex items-center justify-center rounded-full border-[1px] border-gray-500 cursor-pointer">
                        <Image path="icons/explore.svg" alt="more" w={20} h={20} />
                    </div>
                    <div className="w-9 h-9 flex items-center justify-center rounded-full border-[1px] border-gray-500 cursor-pointer">
                        <Image path="icons/message.svg" alt="more" w={20} h={20} />
                    </div>
                    <button className="py-2 px-4 bg-white text-black font-bold rounded-full">Follow</button>
                </div>
                <div className="p-4 flex flex-col gap-2">
                    <div className="">
                        <h1 className="text-2xl font-bold">Alibi Nauanov</h1>
                        <span className="text-textGray text-sm">@alibucci</span>
                    </div>
                    <Link className="text-iconBlue" href="https://alibucci.vercel.app/">alibucci.vercel.app/</Link>
                    <div className="flex gap-4 text-textGray text-[15px]">
                        <div className="flex items-center gap-2">
                            <Image path="icons/userLocation.svg" alt="location" w={20} h={20} />
                            <span>Almaty, Kazakhstan</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Image path="icons/date.svg" alt="date" w={20} h={20} />
                            <span>Joined May 2021</span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <span className="font-bold">100</span>
                            <span className="text-textGray text-[15px]">Followers</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold">100</span>
                            <span className="text-textGray text-[15px]">Followings</span>
                        </div>
                    </div>
                </div>
            </div>
            <Feed />
        </div>
    );
};

export default UserPage;