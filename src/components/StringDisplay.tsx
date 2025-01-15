import { FC, useEffect, useState } from "react";
import { StringDisplayProps } from "../types/CourseTypes";

const StringDisplay:FC<StringDisplayProps> = ({ courses, coursesOnGrid }) => {
    const [str, setStr] = useState('');

    useEffect(() => {
        let newStr = '';
        Object.entries(coursesOnGrid).forEach(([pos, courseCode]) => {
            if (pos !== '3F.1' && pos.includes('.1'))
                newStr += '@@';
                console.log(pos)
            if (!courseCode) return;
            console.log(courses[courseCode].name);
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
            if (courses[courseCode].preq?.length)
                newStr += 'p' + courses[courseCode].preq.join('');
            if (courses[courseCode].color)
                newStr += '#' + courses[courseCode].color;
            newStr += '$$';
        });
        setStr(newStr);
    }
    , [coursesOnGrid, courses]);
    
    return (
        <section>
            <p className="">{str}</p>
        </section>
    );
};

export default StringDisplay;