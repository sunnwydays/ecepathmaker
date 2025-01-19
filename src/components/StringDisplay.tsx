import { FC, useEffect, useState } from "react";
import { StringDisplayProps } from "../types/CourseTypes";

const StringDisplay:FC<StringDisplayProps> = ({ courses, coursesOnGrid }) => {
    const [str, setStr] = useState('');
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(str);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    useEffect(() => {
        let newStr = '';
        Object.entries(coursesOnGrid).forEach(([pos, courseCode]) => {
            if (pos !== '3F.1' && pos.includes('.1'))
                newStr += '@@';
            if (!courseCode) return;
            const course = courses[courseCode];
            newStr += courseCode + course.name + "**";
            if (course.streams) newStr += course.streams.join('');
            if (course.kernel) newStr += 'k';
            if (course.onlyF) newStr += 'f';
            else if (course.onlyS) newStr += 's';
            if (course.isHSS) newStr += 'h';
            else if (course.isCS) newStr += 'c';
            if (course.isSciMath) newStr += 'm';
            if (course.isArtSci) newStr += 'a';
            if (course.color) newStr += '#' + course.color;
            if (course.preq?.length) {
                newStr += 'p';
                course.preq.forEach((preq, index) => {
                    if (Array.isArray(preq)){
                        newStr += preq.join('|');
                    } else {
                        newStr += preq;
                    }
                    if (course.preq && index < course.preq.length - 1) {
                        newStr += ',';
                    }
                });
            }
            if (pos[3] != '5') newStr += '$$';
        });
        setStr(newStr);
    }
    , [coursesOnGrid, courses]);
    
    return (
        <section className="flex flex-col">
            <p className="p-2 border-2 border-green3 border-opacity-70 rounded-md bg-green1 bg-opacity-50 break-all select-all">
                {str}
            </p>
            <button
                onClick={handleCopy}
                className={`
                    bg-green2 text-white px-4 py-2 rounded
                    hover:bg-green3 transition-all
                    mt-4
                    ${copied && 'opacity-80'}
                `}
            >
                {copied ? 'Copied!' : 'Copy'}
            </button>
        </section>
    );
};

export default StringDisplay;