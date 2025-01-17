
import { HexColorPicker, HexColorInput } from "react-colorful";
import { FC, useState } from "react";
import { CourseCardPropsWithoutCode, CourseFormProps } from "../types/CourseTypes";

const CourseForm:FC<CourseFormProps> = ({ setCourses, setCoursesUsed }) => {
    const [colorWithHash, setColorWithHash] = useState("");
    const [courseCode, setCourseCode] = useState("");
    const [preqString, setPreqString] = useState("");

    const [courseInfo, setCourseInfo] = useState<CourseCardPropsWithoutCode>({
        name: "",
        preq: [],
        streams: [],
        color: "E0E0E0",
        isCS: false,
        isHSS: false,
        isSciMath: false,
        isArtSci: false,
        onlyF: false,
        onlyS: false,
    });

    const [errors, setErrors] = useState({
        code: false,
        name: false,
        preq: false,
    });
    const errorMessages = {
        code: 'Must be 3 letters followed by 3 numbers',
        name: 'Course name cannot contain "**"',
        preq: 'Must be comma (and)- or pipe (or)-separated course codes',
    };

    const validateCourseCode = (code: string) => {
        return /^[A-Z]{3}\d{3}$/i.test(code);
    };

    const validateCourseName = (name: string) => {
        return !name.includes('**');
    };

    const validatePrerequisites = (preq: string) => {
        if (!preq) return true;
        
        const andGroups = preq.split(',');
        return andGroups.every(group => {
            const orCourses = group.split('|').map(p => p.trim());
            return orCourses.every(code => validateCourseCode(code));
        });
    };
    
    const parsePrerequisites = (preqString: string): (string | string[])[] => {
        if (!preqString) return [];
        
        // Split into AND groups
        return preqString.split(',').map(group => {
            // Check if group has OR conditions
            if (group.includes('|')) {
                return group.split('|')
                    .map(code => code.trim().toUpperCase())
                    .filter(code => code.length > 0);
            }
            // Single prerequisite
            const code = group.trim().toUpperCase();
            return code.length > 0 ? code : [];
        }).filter(group => 
            Array.isArray(group) ? group.length > 0 : group.length > 0
        );
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        switch (name) {
            case 'code':
                setErrors(prev => ({...prev, code: false}));
                setCourseCode(value);
                break;
            case 'name':
                setErrors(prev => ({...prev, name: false}));
                setCourseInfo(prev => ({...prev, name: value}));
                break;
            case 'preq':
                setErrors(prev => ({...prev, preq: false}));
                setPreqString(value);
                setCourseInfo(prev => ({...prev, preq: parsePrerequisites(value)}));
                break;
            case 'streams': {
                const streamNum = parseInt(value);
                if (courseInfo.streams?.includes(streamNum)) {
                    setCourseInfo(prev => ({...prev, streams: courseInfo.streams?.filter(s => s !== streamNum)}));
                } else {
                    setCourseInfo(prev => ({...prev, streams: [...(courseInfo.streams || []), streamNum]}));
                }
                break;
            }
            case 'term':
                setCourseInfo(prev => ({
                    ...prev, 
                    onlyF: value === 'F',
                    onlyS: value === 'S',
                }));
                break;
            case 'isCS':
                if (courseInfo.isCS) {
                    setCourseInfo(prev => ({...prev, isCS: false, isHSS: false}));
                } else {
                    setCourseInfo(prev => ({...prev, isCS: true}));
                }
                break;
            case 'isHSS':
                if (courseInfo.isHSS) {
                    setCourseInfo(prev => ({...prev, isHSS: false}));
                } else {
                    setCourseInfo(prev => ({...prev, isCS: true, isHSS: true}));
                }
                break;
            case 'isSciMath':
            case 'isArtSci':
                setCourseInfo(prev => ({...prev, [name]: !courseInfo[name]}));
                break;
            default:
                break;
        }
    };

    const handleColorChange = (color: string) => {
        setColorWithHash(color);
        const colorWithoutHash = color.replace('#', '');
        setCourseInfo(prev => ({...prev, color: colorWithoutHash}));
    }

    const resetColor = () => {
        setColorWithHash('#E0E0E0');
        setCourseInfo(prev => ({...prev, color: 'E0E0E0'}));
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateCourseCode(courseCode) || !validateCourseName(courseInfo.name) || !validatePrerequisites(preqString)) {
            setErrors(prev => ({
                ...prev,
                code: !validateCourseCode(courseCode),
                name: !validateCourseName(courseInfo.name),
                preq: !validatePrerequisites(preqString),
            }));
            return;
        }

        setCourses(prev => ({...prev, [courseCode.toUpperCase()]: courseInfo}));
        setCoursesUsed(prev => ({...prev, [courseCode.toUpperCase()]: ''}));
        
        setCourseCode('');
        setPreqString('');
        setColorWithHash('#E0E0E0');
        setCourseInfo({
            name: "",
            preq: [],
            streams: [],
            color: 'E0E0E0',
            isCS: false,
            isHSS: false,
            isSciMath: false,
            isArtSci: false,
            onlyF: false,
            onlyS: false,
        });
    }

    return (
        <section>
            <h2 className="mt-12 mb-8 text-2xl font-semibold">Add more courses</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl" data-testid="course-form">
                {/* Course Identifier Section */}
                <div className="space-y-2">
                    <input 
                        name="code"
                        type="text" 
                        value={courseCode}
                        placeholder="Course Code (e.g. ECE444)*"
                        className="w-full p-2 border rounded"
                        onChange={handleInputChange}
                        data-testid="code-input"
                    />
                    {errors.code && <p className="text-comp3 text-sm">{errorMessages.code}</p>}
                    <input 
                        name="name"
                        type="text" 
                        value={courseInfo.name}
                        placeholder="Course Name"
                        className="w-full p-2 border rounded"
                        onChange={handleInputChange}
                    />
                    {errors.name && <p className="text-comp3 text-sm">{errorMessages.name}</p>}
                    <input 
                        name="preq"
                        type="text" 
                        value={preqString}
                        placeholder="Prerequisites (e.g. ECE444,ECE345|ECE346)"
                        className="w-full p-2 border rounded"
                        onChange={handleInputChange}
                        data-testid="preq-input"
                    />
                    {errors.preq && <p className="text-comp3 text-sm">{errorMessages.preq}</p>}
                    <HexColorPicker color={colorWithHash} onChange={handleColorChange} />
                    <div className="flex gap-2">
                        <HexColorInput color={colorWithHash} onChange={handleColorChange} placeholder="Colour (e.g. E0E0E0)" className="w-full p-2 border rounded span" />
                        <button 
                            className="bg-neutral3 text-white px-4 py-2 rounded hover:bg-neutral2 transition-all"
                            onClick={resetColor}
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
                                <input 
                                    name="streams"
                                    type="checkbox" 
                                    value={num}
                                    data-testid={`stream-${num}`}
                                    onChange={handleInputChange}
                                    checked={courseInfo.streams?.includes(num)}
                                />
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
                                onChange={handleInputChange}
                                checked={courseInfo.onlyF}
                            />
                            <span>Fall Only</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input 
                                type="radio" 
                                name="term" 
                                value="S"
                                data-testid="only-s"
                                onChange={handleInputChange}
                                checked={courseInfo.onlyS}
                            />
                            <span>Winter Only</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input 
                                type="radio" 
                                name="term" 
                                value="B"
                                onChange={handleInputChange}
                                checked={!courseInfo.onlyF && !courseInfo.onlyS}
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
                            <input 
                                name="isCS"
                                type="checkbox" 
                                data-testid="cs" 
                                onChange={handleInputChange}
                                value="CS"
                                checked={courseInfo.isCS}
                            />
                            <span>CS</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input 
                                name="isHSS"
                                type="checkbox" 
                                data-testid="hss" 
                                onChange={handleInputChange}
                                value="HSS"
                                checked={courseInfo.isHSS}
                            />
                            <span>HSS</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input 
                                name="isArtSci"
                                type="checkbox" 
                                data-testid="artsci" 
                                onChange={handleInputChange}
                                value="ArtSci"
                                checked={courseInfo.isArtSci}
                            />
                            <span>ArtSci</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input 
                                name="isSciMath"
                                type="checkbox" 
                                data-testid="scimath" 
                                onChange={handleInputChange}
                                value="SciMath"
                                checked={courseInfo.isSciMath}
                            />
                            <span>Sci/Math</span>
                        </label>
                    </div>
                </div>

                <button 
                    type="submit"
                    className="
                        bg-green2 text-white px-4 py-2 rounded 
                        hover:bg-green3 transition-all
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green2
                    "
                    // disabled={???}
                >
                    Add Course
                </button>
            </form>
        </section>
    );
};

export default CourseForm;