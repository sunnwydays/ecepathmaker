import { FC } from "react";

interface AnnouncementProps {
    children: React.ReactNode;
    success?: boolean;
}

const Announcement: FC<AnnouncementProps> = (props) => {
    return (
        <div className="
            fixed top-6 left-1/2 transform -translate-x-1/2
            flex items-center justify-center
            z-50
        ">
            <div className={`
                w-64
                px-4 py-2 
                text-white 
                ${props.success ? 'bg-green2' : 'bg-comp2'}
                rounded-md shadow-md
                text-center
                animate-bounce
            `}>
                {props.children}
            </div>
        </div>
    );
};

export default Announcement;