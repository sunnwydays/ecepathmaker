type FAQItem = {
    question: string;
    answer: string;
};

type FAQ = FAQItem[];

const faqData: FAQ = [
    {
        question: "What is ECE Pathmaker?",
        answer: "ECE Pathmaker is an unofficial alternative to UofT's electrical and computer engineering Magellan. It provides a UI-based drag-and-drop course planner for UofT ECE students."
    },
    {
        question: "How do I use this?",
        answer: "On the Maker page, drag courses from the right panel into the grid, which contains slots for your third and fourth years. All the courses from Magellan are available in this site, and you can also add custom courses using the custom courses form. To come back to it later, save your progress by copying the layout string generated and pasting in the loading area at another time."
    },
    {
        question: "Why did you make this?",
        answer: "The current course planning tool for UofT ECE students is Magellan, which is useful but remains outdated with room for improvement. Magellan makes it difficult to visualize and organize your courses, slow to evaluate your graduation conditions, and lacks a modern UI. ECE Pathmaker improves upon all of these. That being said, you will still have to use Magellan to 'lock in' your courses for pre-registration."
    },
    {
        question: "Who is this for?",
        answer: "ECE Pathmaker is tailored for UofT Electrical and Computer Engineering students. Courses' prerequisites assume that you have taken the typical first and second-year courses (still works if you transferred from TrackOne)."
    },
    {
        question: "What are the XX slots for?",
        answer: "The fifth row is for any extra course that you took in your first two years or from overloading. A course there will be considered as a prerequisite, and any course with prerequisites on XX slots have their prerequisites waived."
    },
    {
        question: "Anything else that I should know when course planning?",
        answer: "While ECE Pathmaker checks most of the major requirements, some things are not checked. You will have to ensure that you have your free elective & technical elective (easy), PEY / 600h technical XP (not part of course planning but required for graduation), CEAB credits (most likely fulfilled if you fulfilled the other requirements), no exclusion violation (if you take certain courses, you may not take another similar one), within 1.5 credit ArtSci -300/-400 limit. You should be able to view any issue once you enter your courses into Magellan. Lastly, remember that this tool is unofficial and although I have done plenty of testing, it may contain errors."
    },
    {
        question: "Why is the grid red when I try to drag a course onto it?",
        answer: "Invalid slots will be red, and you will know why (invalid term (i.e. only offered in the fall but you are dragging it onto a winter term slot) or missing prerequisites) when you try to drop onto the slot. An icon in the top right corner will appear if it is fall-only (leaf) or winter-only (snowflake). You can click on the course card to see prerequisites."
    },
    {
        question: "Does this check for minors or certificates?",
        answer: "Minor/certificate check is not yet implemented, although I am considering adding it in the future."
    },
    {
        question: "Does this tool work on mobile?",
        answer: "Yes! The site is responsive and works on mobile devices. To maintain the grid width, the site must be scrolled horizontally, but the functionality remains. For a better mobile experience, you must hold a tile momentarily before dragging it, which prevents unwanted movement."
    },
    {
        question: "How do I report a bug or suggest a feature?",
        answer: "Create an issue on the GitHub repo or fill out the Google Form, both linked in the footer."
    },
];

export default faqData;