import { FC, ReactNode, useEffect, useState } from "react";

interface AnnouncementProps {
    children: ReactNode;
    success?: boolean;
    /** How long the parent keeps this mounted; the exit starts just before. */
    duration?: number;
    action?: { label: string; onClick: () => void };
}

const EXIT_MS = 150;

const Announcement: FC<AnnouncementProps> = ({
    children,
    success,
    duration = 2000,
    action,
}) => {
    const [leaving, setLeaving] = useState(false);

    // A new message while this is still up restarts the clock
    const message = typeof children === "string" ? children : "";
    useEffect(() => {
        setLeaving(false);
        const timer = setTimeout(() => setLeaving(true), Math.max(duration - EXIT_MS, 0));
        return () => clearTimeout(timer);
    }, [message, duration]);

    return (
        <div
            role="status"
            aria-live="polite"
            className="
                fixed top-6 left-1/2 transform -translate-x-1/2
                flex items-center justify-center
                z-50
            "
        >
            <div className={`
                w-64
                px-4 py-2
                text-white
                ${success ? 'bg-green2' : 'bg-comp2'}
                rounded-lg shadow-md
                text-center
                flex items-center justify-center gap-3
                ${leaving
                    ? 'animate-out fade-out slide-out-to-top-2 fill-mode-forwards duration-150 ease-in'
                    : 'animate-in fade-in slide-in-from-top-2 duration-150 ease-out'}
            `}>
                <span>{children}</span>
                {action && (
                    <button
                        type="button"
                        onClick={action.onClick}
                        className="font-medium underline hover:no-underline"
                    >
                        {action.label}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Announcement;
