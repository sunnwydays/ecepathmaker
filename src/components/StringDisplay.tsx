import { FC, useEffect, useState } from "react";
import { StringDisplayProps } from "../types/CourseTypes";

const StringDisplay:FC<StringDisplayProps> = ({ courses, coursesOnGrid }) => {
    const [str, setStr] = useState('');

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
        <section className="mt-4">
            <p className="p-2 border-2 border-neutral2 rounded-md bg-green1 bg-opacity-30">{str}</p>
        </section>
    );
};

export default StringDisplay;