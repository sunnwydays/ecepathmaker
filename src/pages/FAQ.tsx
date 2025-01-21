import { FC } from 'react';
import faqData from "../data/faqData";
import FAQCard from "../components/FAQCard";

const FAQ: FC = () => {
    return (
        <div>
            <h2 className="mb-8 text-2xl font-medium">FAQs + How to use Pathmaker</h2>
            <div className="flex flex-col gap-4">
                {faqData.map((faq, index) => (
                    <FAQCard 
                        key={index}
                        question={faq.question} 
                        answer={faq.answer} 
                    />
                ))}
            </div>
        </div>
    );
};

export default FAQ;