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
            newStr += courseCode 
                    + courses[courseCode].name
                    + "**";
            if (courses[courseCode].streams) 
                newStr += courses[courseCode].streams.join('');
            if (courses[courseCode].onlyF)
                newStr += 'f';
            else if (courses[courseCode].onlyS)
                newStr += 's';
            if (courses[courseCode].isHSS)
                newStr += 'h';
            else if (courses[courseCode].isCS)
                newStr += 'c';
            if (courses[courseCode].isArtSci)
                newStr += 'a';
            if (courses[courseCode].preq?.length) {
                for (let i = 0; i < courses[courseCode].preq.length; i++)
                    newStr += 'p' + courses[courseCode].preq[i];
            }
            if (courses[courseCode].color)
                newStr += '#' + courses[courseCode].color;
            newStr += '$$';
        });
        setStr(newStr);
    }
    , [coursesOnGrid, courses]);
    
    return (
        <section className="mt-4 flex flex-col">
            <p className="p-2 border-2 border-green3 border-opacity-70 rounded-md bg-green1 bg-opacity-50">{str}</p>
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