import Image from "next/image";
import Link from "next/link";

const menuList = [
    {
        id: 1,
        name: "Homepage",
        link: "/",
        icon: "home.svg",
    },
    {
        id: 2,
        name: "Explore",
        link: "/",
        icon: "explore.svg",
    },
    {
        id: 3,
        name: "Notifications",
        link: "/",
        icon: "notification.svg",
    },
    {
        id: 4,
        name: "Messages",
        link: "/",
        icon: "message.svg",
    },
    {
        id: 5,
        name: "Bookmarks",
        link: "/",
        icon: "bookmark.svg",
    },
    {
        id: 6,
        name: "Jobs",
        link: "/",
        icon: "job.svg",
    },
    {
        id: 7,
        name: "Communities",
        link: "/",
        icon: "community.svg",
    },
    {
        id: 8,
        name: "Premium",
        link: "/",
        icon: "logo.svg",
    },
    {
        id: 9,
        name: "Profile",
        link: "/",
        icon: "profile.svg",
    },
    {
        id: 10,
        name: "More",
        link: "/",
        icon: "more.svg",
    }
]

const LeftBar = () => {
    return (
        <div className="h-screen sticky top-0 flex flex-col justify-between pt-2 pb-8 w-20 lg:w-64 ml-16 lg:ml-32">
            <div className="flex flex-col gap-4 text-lg items-start xxl:items-start">
                <Link href="/" className="p-2 rounded-full hover:bg-[#181818]">
                    <Image src="icons/logo.svg" alt="Logo" width={24} height={24} />
                </Link>

                <div className="flex flex-col gap-2 w-full">
                    {menuList.map((item) => (
                        <Link
                            href={item.link}
                            className="p-2 rounded-full hover:bg-[#181818] flex items-center gap-4 w-full"
                            key={item.id}
                        >
                                <Image
                                    src={`icons/${item.icon}`}
                                    alt={item.name}
                                    width={24}
                                    height={24}
                                />
                                <span className="hidden lg:inline">{item.name}</span>
                        </Link>
                    ))}
                </div>

                <Link href="/" className="bg-white text-black rounded-full w-12 h-12 flex items-center justify-center lg:hidden ml-0">
                    <Image src="icons/post.svg" alt="new post" width={24} height={24} />
                </Link>
                <Link href="/" className="hidden lg:flex bg-white text-black rounded-full font-bold py-2 px-30 w-60 items-center justify-center ml-0">
                    Post
                </Link>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 relative rounded-full overflow-hidden">
                        <Image src="/general/footballMe.jpg" alt="alibucci" fill />
                    </div>
                    <div className="hidden lg:flex flex-col">
                        <span className="font-bold">alibucci</span>
                        <span className="text-sm text-textGray">@alibucci</span>
                    </div>
                </div>
                <div className="hidden lg:block cursor-pointer font-bold px-10">...</div>
            </div>
        </div>
    )
}

export default LeftBar;