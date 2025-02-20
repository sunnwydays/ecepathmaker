import { FC, useEffect, useState } from 'react';
import { siteFaqData, courseFaqData } from "../data/faqData";
import FAQCard from "../components/info/FAQCard";

const FAQ: FC = () => {
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 400) {
                setShowButton(true);
            } else {
                setShowButton(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToSection = (elementId: string) => {
        const element = document.getElementById(elementId);
        element?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div>
            <div className="bg-neutral1 p-8 rounded-md text-center shadow-sm">
                <h2 className="text-2xl font-bold">FAQs</h2>
                <ul className="space-y-2 mt-4">
                    <li>
                        <button 
                            onClick={() => scrollToSection('site-faqs')}
                            className="text-green3 hover:opacity-50 transition-all"
                        >
                            Using Pathmaker
                        </button>
                    </li>
                    <li>
                        <button 
                            onClick={() => scrollToSection('course-faqs')}
                            className="text-green3 hover:opacity-50 transition-all"
                        >
                            Course Selection
                        </button>
                    </li>
                </ul>
            </div>

            <h2 className="mb-8 pt-8 text-2xl font-medium" id="site-faqs">
                FAQs on using Pathmaker
            </h2>
            <div className="flex flex-col gap-4">
                {siteFaqData.map((faq, index) => (
                    <FAQCard 
                        key={index}
                        question={faq.question} 
                        answer={faq.answer} 
                    />
                ))}
            </div>
            <hr className="mt-12 stroke-2"/>
            
            <h2 className="mb-4 pt-12 text-2xl font-medium" id="course-faqs">
                FAQs on Course Selection
            </h2>
            <p className='mb-8'>
                I asked the ECE undergrad office in SF basement (SFB540)
                about the following questions. Here are the answers.
            </p>
            <div className="flex flex-col gap-4">
                {courseFaqData.map((faq, index) => (
                    <FAQCard 
                        key={index}
                        question={faq.question} 
                        answer={faq.answer} 
                    />
                ))}
            </div>
            {showButton && (
                <button
                    onClick={scrollToTop}
                    className="
                        fixed bottom-8 right-8 bg-green2 text-white p-4 
                        rounded-full shadow-lg 
                        hover:bg-opacity-80 transition-all
                    "
                    aria-label="Back to top"
                >
                    ↑
                </button>
            )}
        </div>
    );
};

export default FAQ;