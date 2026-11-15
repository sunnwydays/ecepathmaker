import { FC, ReactNode } from "react";
import { ChevronDown, Link as LinkIcon } from "lucide-react";
import type { FAQItem } from "../../data/faqData";

export interface FAQCardProps {
    id: string;
    item: FAQItem;
    open: boolean;
    onToggle: () => void;
    highlight?: string;
}

/** Wraps case-insensitive matches of `term` in a <mark> */
const highlightText = (text: string, term?: string): ReactNode => {
    const query = term?.trim();
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "ig"));
    return parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-green1 dark:bg-green3 dark:text-gray-50 rounded-sm px-0.5">
                {part}
            </mark>
        ) : (
            part
        )
    );
};

const FAQCard: FC<FAQCardProps> = ({ id, item, open, onToggle, highlight }) => {
    const panelId = `${id}-panel`;

    const copyLink = () => {
        const url = `${window.location.origin}${window.location.pathname}#${id}`;
        window.history.replaceState(null, "", `#${id}`);
        navigator.clipboard?.writeText(url).catch(() => {});
    };

    return (
        <div
            id={id}
            className={`
                group scroll-mt-32 rounded-lg border transition-colors
                ${open
                    ? "border-green2 bg-white dark:bg-gray-600 shadow-sm"
                    : "border-neutral2 dark:border-gray-500 bg-white/60 dark:bg-gray-600/50 hover:border-green2"}
            `}
        >
            <h3 className="flex items-start">
                <button
                    type="button"
                    onClick={onToggle}
                    aria-expanded={open}
                    aria-controls={panelId}
                    className="flex flex-1 items-start gap-3 px-5 py-4 text-left font-medium"
                >
                    <ChevronDown
                        aria-hidden
                        className={`mt-0.5 size-5 shrink-0 text-green3 dark:text-green1 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    />
                    <span>{highlightText(item.question, highlight)}</span>
                </button>
                <button
                    type="button"
                    onClick={copyLink}
                    title="Copy link to this question"
                    aria-label="Copy link to this question"
                    className="
                        mr-3 mt-3 rounded-md p-1.5 text-neutral3
                        opacity-0 group-hover:opacity-100 focus:opacity-100
                        hover:text-green3 dark:hover:text-green1 transition-opacity
                    "
                >
                    <LinkIcon className="size-4" />
                </button>
            </h3>
            <div
                id={panelId}
                role="region"
                aria-hidden={!open}
                className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
                <div className="overflow-hidden">
                    <div className="pl-[3.25rem] pr-6 pb-5 leading-7 text-gray-700 dark:text-gray-200">
                        <p>{highlightText(item.answer, highlight)}</p>
                        {item.bullets && (
                            <ul className="mt-3 space-y-1.5">
                                {item.bullets.map((bullet) => (
                                    <li key={bullet} className="flex gap-2">
                                        <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-green2" />
                                        <span>{highlightText(bullet, highlight)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {item.footnote && (
                            <p className="mt-3 text-sm text-gray-500 dark:text-gray-300">
                                {highlightText(item.footnote, highlight)}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQCard;
