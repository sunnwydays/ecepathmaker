import { useState, FC } from "react";
import { CourseGridProps } from "../types/CourseTypes";

const Filter: FC<CourseGridProps> = ({ courses, coursesOnGrid, coursesUsed, setCoursesOnGrid, setCoursesUsed }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // const createMap = (options: string[] | number[]) => {
    //     return options.reduce((acc, option) => {
    //         acc[option] = false;
    //         return acc;
    //     }, {});
    // };
    
        
    // also search by code and name
    const termOptions = ["F", "S"];
    // colour - use react colourful
    const streamOptions = [1, 2, 3, 4, 5, 6];
    const typeOptions = ["CS", "HSS", "ArtSci", "Eng"];
        
    // const [selectedTerm, setSelectedTerm] = useState(createMap(termOptions));

    return (
        <div>
            filter
        </div>
    )
};

export default Filter;