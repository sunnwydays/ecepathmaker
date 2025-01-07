import { useState } from 'react';
import { HexColorPicker, HexColorInput } from "react-colorful";
import { CourseList } from '../types/CourseTypes';
import CourseGrid from '../components/CourseGrid';
// import { parseString } from '../components/parseString';

const Maker = () => {
    // const {courses, positions} = parseString(course);
    // const [customCourse, setCustomCourse] = useState('');

    // const handleCourseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setCustomCourse(e.target.value);
    //     // parse string
    //     parseString(e.target.value);
    // }

    const mockCourses: CourseList = {
        'ECE456': {
            name: 'Test Course',
            preq: ['ECE345'],
            stream1: true,
            onlyF: true,
            isCS: true,
        },
        'APS310': {
            name: 'Test Course',
            stream3: true,
        },
    };

    const [color, setColor] = useState("F7F7F7");
    const [errors, setErrors] = useState({
        code: false,
        preq: false,
    });
    const errorMessages = {
        code: 'Must be 3 letters followed by 3 numbers',
        preq: 'Must be comma-separated course codes',
    };

    const validateCourseCode = (code: string) => {
        return /^[A-Z]{3}\d{3}$/.test(code);
    };

    const validatePrerequisites = (preq: string) => {
        if (!preq) return true;
        const prereqs = preq.split(',').map(p => p.trim());
        return prereqs.every(p => validateCourseCode(p));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        if (name === 'code') setErrors(prev => ({...prev, code: validateCourseCode(value)}));
        if (name === 'preq') setErrors(prev => ({...prev, preq: validatePrerequisites(value)}));
    };
    
    return (
        <div>
            <CourseGrid courses={mockCourses} />
            <section className="grid md:grid-cols-2 grid-cols-1 gap-8">
                <div>
                    <h2 className="mt-12 mb-8 text-2xl font-semibold">Add more courses</h2>
                    <form onSubmit={e=>e.preventDefault()} className="flex flex-col gap-4 max-w-xl">
                        {/* Course Identifier Section */}
                        <div className="space-y-2">
                            <input 
                                type="text" 
                                placeholder="Course Code (e.g. ECE444)"
                                className="w-full p-2 border rounded"
                                onChange={handleInputChange}
                                data-testid="course-input"
                            />
                            {errors.code && <p className="text-comp3 text-sm">{errorMessages.code}</p>}
                            <input 
                                type="text" 
                                placeholder="Course Name"
                                className="w-full p-2 border rounded"
                            />
                            <input 
                                type="text" 
                                placeholder="Prerequisites (e.g. ECE444,ECE345)"
                                className="w-full p-2 border rounded"
                                onChange={handleInputChange}
                            />
                            {errors.preq && <p className="text-comp3 text-sm">{errorMessages.preq}</p>}
                            <HexColorPicker color={color} onChange={setColor} />
                            <div className="flex gap-2">
                                <HexColorInput color={color} onChange={setColor} placeholder="Colour (e.g. F7F7F7)" className="w-full p-2 border rounded span" />
                                <button 
                                    className="bg-neutral3 text-white px-4 py-2 rounded hover:bg-neutral2 transition-all"
                                    onClick={() => setColor('F7F7F7')}
                                >
                                    reset
                                </button>
                            </div>
                        </div>

                        {/* Stream Flags */}
                        <div className="space-y-2">
                            <h3 className="font-medium">Streams</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {[1,2,3,4,5,6].map(num => (
                                    <label key={num} className="flex items-center gap-2">
                                        <input type="checkbox" data-testid={`stream-${num}`} />
                                        <span>Stream {num}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Term Availability */}
                        <div className="space-y-2">
                            <h3 className="font-medium">Term Availability</h3>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input 
                                        type="radio" 
                                        name="term" 
                                        value="F"
                                        data-testid="only-f"
                                    />
                                    <span>Fall Only</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input 
                                        type="radio" 
                                        name="term" 
                                        value="S"
                                        data-testid="only-s"
                                    />
                                    <span>Winter Only</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input 
                                        type="radio" 
                                        name="term" 
                                        value="B"
                                        defaultChecked
                                    />
                                    <span>Both Terms</span>
                                </label>
                            </div>
                        </div>

                        {/* Course Type Flags */}
                        <div className="space-y-2">
                            <h3 className="font-medium">Course Type</h3>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" data-testid="cs" />
                                    <span>CS</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" data-testid="hss" />
                                    <span>HSS</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" data-testid="artsci" />
                                    <span>ArtSci</span>
                                </label>
                            </div>
                        </div>

                        <button 
                            type="submit"
                            className="bg-green2 text-white px-4 py-2 rounded hover:bg-green3 transition-all"
                        >
                            Add Course
                        </button>
                    </form>
                </div>
                <div>
                    <h2 className="mt-12 mb-8 text-2xl font-semibold">Save/load layout</h2>
                    <form onSubmit={e=>e.preventDefault()} className="flex flex-col gap-4 max-w-xl">
                        <div className="space-y-2">
                            <input 
                                type="text" 
                                placeholder="Layout string"
                                className="w-full p-2 border rounded"
                                onChange={handleInputChange}
                                data-testid="string-input"
                            />
                        </div>
                        <button 
                            type="submit"
                            className="bg-green2 text-white px-4 py-2 rounded hover:bg-green3 transition-all"
                        >
                            Load layout
                        </button>
                        <p className="mt-6 max-w-xl">Copy the string above and paste it somewhere to save for later or paste your previously copied string to load it</p>
                    </form>
                </div>
            </section>
        </div>
    )
}

export default Maker;