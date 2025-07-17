import { FC } from "react";

export interface FAQCardProps {
    question: string;
    answer: string;
}

const FAQCard: FC<FAQCardProps> = ({ question, answer }) => {

    return (
        <div className="border border-neutral3 rounded-md">
            <h3 className="text-lg font-medium px-6 py-4 bg-green1 bg-opacity-50 dark:bg-green2 dark:bg-opacity-50">{question}</h3>
            <p className="p-6 border-t-2 border-neutral-300 bg-neutral1 dark:bg-gray-600">{answer}</p>
        </div>
    );
}

export default FAQCard;