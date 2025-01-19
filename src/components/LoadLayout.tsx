import { FC, useEffect, useRef, useState } from "react";
import { isValidString, parseString } from "../utils/parseString";
import { LoadLayoutProps } from "../types/CourseTypes";
import Announcement from "./Announcement";

enum Load {
    NONE,
    SUCCESS,
    ERROR,
}

const LoadLayout:FC<LoadLayoutProps> = ({ courses, coursesUsed, setCourses, setCoursesOnGrid, setCoursesUsed }) => {
    const [str, setStr] = useState('')
    const [load, setLoad] = useState(Load.NONE);
    const timeoutRef = useRef<NodeJS.Timeout>();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStr(e.target.value);
    }
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!str.length) return 
        if (!isValidString(str)) {
            setLoad(Load.ERROR);
            return;
        }

        const result = parseString(str);

        setCoursesOnGrid(result.coursesOnGrid);
        setCourses({...courses, ...result.courses});
        Object.keys(coursesUsed).forEach(key => {
            coursesUsed[key] = '';
        });
        setCoursesUsed({...coursesUsed, ...result.coursesUsed});
        setLoad(Load.SUCCESS);
        setStr('');
    }

    useEffect(() => {
        if (load !== Load.NONE) {
            timeoutRef.current = setTimeout(() => {
                setLoad(Load.NONE);
            }, 2000);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [load]);

    return (
        <section>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="space-y-2">
                    <input 
                        type="text" 
                        value={str}
                        placeholder="Layout string"
                        className="w-full p-2 border rounded"
                        onChange={handleInputChange}
                        data-testid="string-input"
                    />
                </div>
                <button 
                    type="submit"
                    className="
                        bg-green2 text-white px-4 py-2 rounded
                        hover:bg-green3 transition-all
                    "
                    data-testid="load-layout"
                >
                    Load layout
                </button>
            </form>
            {load === Load.SUCCESS && <Announcement success>Layout loaded!</Announcement>}
            {load === Load.ERROR && <Announcement>Invalid layout!</Announcement>}
        </section>
    );
};

export default LoadLayout;