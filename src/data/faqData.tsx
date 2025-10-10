type FAQItem = {
    question: string;
    answer: string;
};

type FAQ = FAQItem[];

export const courseFaqData: FAQ = [
    {
        question: "If I take a gap year after my second year to do an internship, should I put my courses on Magellan as next year or the year after?",
        answer: "Put your courses in Magellan as if you were going to take a usual PEY after third year. This is in case your internship falls through - you will still be able to shift your courses for preregistration before January 30 of your work year."
    },
    {
        question: "Can I change my courses on Magellan after January 30?",
        answer: "Only your courses for the following year (both fall and winter) are preregistered, the rest is for planning purposes. You can change your other courses later."
    },
    {
        question: "What does it mean when a course can only count towards 2 things?",
        answer: "For a course, it can only count towards 1 minor and your stream requirement, or 2 minors. For example, if you want ECE345 to count to both AI and Robotics, it will not be considered as your stream 6 kernel."
    },
    {
        question: "Do courses marked as EXT count towards minor requirements?",
        answer: "Yes, that is the only thing they count towards (they still show up on your transcript, but don't count for GPA)."
    },
    {
        question: "For MIE509, what does 'or an Introductory Machine Learning, or equivalent' in the prerequisites mean?",
        answer: "It means any introductory ML or AI course is an appropriate prereq, such as APS360 or ECE421."
    },
]

export const siteFaqData: FAQ = [
    {
        question: "What is ECE Pathmaker?",
        answer: "ECE Pathmaker is a UI-based drag-and-drop course planner for UofT electrical and computer engineering students. As an unofficial companion tool to UofT ECE's Magellan, it simplifies the planning process before finalizing your pre-registration."
    },
    {
        question: "How do I use this?",
        answer: "On the Maker page, drag courses onto the grid, which contains slots for your third and fourth years. All the courses from Magellan are available, and you can also add custom courses using the custom courses form. Save your progress by copying the layout string generated and pasting in the loading area at a later time."
    },
    {
        question: "Why did you make this?",
        answer: "The current course planning tool for UofT ECE students is Magellan, which is useful but makes it difficult to visualize and organize your courses, is slow to evaluate graduation conditions, and has errors. ECE Pathmaker improves upon these with a modern UI. That being said, you will still have to use Magellan to 'lock in' your courses for pre-registration."
    },
    {
        question: "Who is this for?",
        answer: "ECE Pathmaker is tailored for UofT Electrical and Computer Engineering students. Courses' prerequisites assume that you have taken the typical first- and second-year courses (still works if you transferred from TrackOne)."
    },
    {
        question: "What are the XX slots for?",
        answer: "The fifth row is for extra courses taken in the first two years or from overloading. A course there will be considered as an early prerequisite, and any course on XX slots have their prerequisites waived."
    },
    {
        question: "What does signing in do?",
        answer: "When you sign in using your Google account, your grid, saved layouts, custom courses, and light/dark theme preference are saved so you can access your changes on any device."
    },
    {
        question: "How do I update a course (e.g. change the colour)?",
        answer: "Click on a Maker course card, click on the pencil in the top right, then update its details in the form."
    },
    {
        question: "Why is the grid red when I try to drag a course onto it?",
        answer: "Invalid slots are red, and you will know why (invalid term (i.e. only offered in the fall but you are dragging it onto a winter term slot or vice versa) or missing prerequisites) when you try to drop onto the slot. An icon in the top right corner of each card appears if it is fall-only (leaf) or winter-only (snowflake). You can click on the course card to see prerequisites."
    },
    {
        question: "What does it mean by 'not a real course'?",
        answer: "Capstone courses are full year courses, but the grid implements half term slots. To account for this, the capstone courses are split into two half-term courses. The 'not a real course' text is a reminder that the course is the second half of the capstone course."
    },
    {
        question: "Does this check for minors or certificates?",
        answer: "Minor/certificate check is not yet implemented, although I am considering adding it in the future."
    },
    {
        question: "Anything else that I should know when course planning?",
        answer: "While ECE Pathmaker checks most major requirements, some things are not checked. Ensure that you have your natural sciences, free elective & technical elective (easy), PEY / 600h technical XP (not part of course planning but required for graduation), CEAB credits (likely fulfilled if you fulfilled the other requirements), no exclusion violation (if you take certain courses, you may not take another similar one), within 1.5 credit ArtSci -300/-400 limit. You will see possible issues after entering your courses into Magellan. Lastly, remember that this tool is unofficial and although I have done plenty of testing, it may contain errors."
    },
    {
        question: "Does this tool work on mobile?",
        answer: "Yes! The site is responsive and works on mobile devices. I suggest zooming out by pinching to be able to see the whole width of the grid, otherwise the site must be scrolled horizontally. To prevent unwanted movement, I designed it so that you must hold a tile momentarily before dragging."
    },
    {
        question: "How do I report a bug or suggest a feature?",
        answer: "Create an issue on the GitHub repo or fill out the Google Form, both linked in the footer."
    },
];