import { FC, useState } from "react";
import { isValidString, parseString } from "./parseString";
import { LoadLayoutProps } from "../types/CourseTypes";

const LoadLayout:FC<LoadLayoutProps> = ({ courses, coursesOnGrid, coursesUsed, setCourses, setCoursesOnGrid, setCoursesUsed }) => {
    const [str, setStr] = useState('')

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setStr(val);
    }
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!str.length || !isValidString(str)) return;

        const result = parseString(str);

        setCoursesOnGrid(result.coursesOnGrid);
        setCourses({...courses, ...result.courses});
        Object.keys(coursesUsed).forEach(key => {
            coursesUsed[key] = '';
        });
        setCoursesUsed({...coursesUsed, ...result.coursesUsed});
    }

    return (
        <section>
            <h2 className="mt-12 mb-8 text-2xl font-semibold">Save/load layout</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
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
                >
                    Load layout
                </button>
                <p className="mt-6 max-w-xl">Paste your previously copied string above to load it. If nothing happens, your string is invalid.</p>
            </form>
        </section>
    );
};

export default LoadLayout;