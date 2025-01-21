type FAQItem = {
    question: string;
    answer: string;
};

type FAQ = FAQItem[];

const faqData: FAQ = [
    {
        question: "What is this?",
        answer: "This is a tool to help you plan your courses and see if you will graduate. It is based on the requirements for the Computer Engineering program at UofT."
    },
    {
        question: "How do I use this?",
        answer: "Drag courses from the right panel into the grid. The grid represents different terms in your academic journey. You can also add custom courses using the form below."
    },
];

export default faqData;