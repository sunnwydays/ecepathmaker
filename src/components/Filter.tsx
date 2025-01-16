import { useState, FC } from "react";
import { CourseList } from "../types/CourseTypes";

interface FilterState {
    searchTerm: string;
    streams: number[];
    term: string;
    isCS: boolean;
    isHSS: boolean;
    isArtSci: boolean;
    isEng: boolean;
}

const Filter: FC<{ courseCode: string, courses: CourseList }> = ({ courseCode, courses }) => {
    const [filters, setFilters] = useState<FilterState>({
        searchTerm: '',
        streams: [],
        term: 'B',
        isCS: false,
        isHSS: false,
        isArtSci: false,
        isEng: false
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked } = e.target;
        
        setFilters(prev => {
            switch (name) {
                case 'searchTerm':
                    return { ...prev, searchTerm: value };
                case 'streams': {
                    const streamNum = parseInt(value);
                    const streams = prev.streams.includes(streamNum)
                        ? prev.streams.filter(s => s !== streamNum)
                        : [...prev.streams, streamNum];
                    return { ...prev, streams };
                }
                case 'term':
                    return { ...prev, term: prev.term === value ? '' : value };
                case 'isCS':
                case 'isHSS':
                case 'isArtSci':
                case 'isEng':
                    return {...prev, [name]: checked};
                default:
                    return prev;
            }
        });
    };

    const resetFilters = () => {
        setFilters({
            searchTerm: '',
            streams: [],
            term: 'B',
            isCS: false,
            isHSS: false,
            isArtSci: false,
            isEng: false
        });
    };


    return (
        <div className="p-4 bg-white rounded shadow text-center">
            <form className="flex flex-col gap-4 max-w-xl">
                <h2 className="font-semibold text-xl">Filter Courses</h2>
                <button 
                    type="button"
                    onClick={resetFilters}
                    className="text-sm text-gray-500 hover:text-gray-700"
                >
                    Reset Filters
                </button>
                <div className="space-y-2">
                    <input 
                        name="searchTerm"
                        type="text" 
                        value={filters.searchTerm}
                        placeholder="Search by code or name"
                        className="w-full p-2 border rounded"
                        onChange={handleInputChange}
                    />
                </div>


                <h3 className="font-medium">Streams</h3>
                <div className="grid grid-cols-3 gap-2">
                    {[1,2,3,4,5,6].map(num => (
                        <label key={num} className="flex items-center gap-2">
                            <input 
                                name="streams"
                                type="checkbox" 
                                value={num}
                                onChange={handleInputChange}
                                checked={filters.streams?.includes(num)}
                            />
                            <span>{num}</span>
                        </label>
                    ))}
                </div>

                <div className="space-y-2">
                    <h3 className="font-medium">Term Availability</h3>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                            <input 
                                type="radio" 
                                name="term" 
                                value="F"
                                onChange={handleInputChange}
                                checked={filters.term === 'F'}
                            />
                            <span>Fall Only</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input 
                                type="radio" 
                                name="term" 
                                value="S"
                                onChange={handleInputChange}
                                checked={filters.term === 'S'}
                            />
                            <span>Winter Only</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input 
                                type="radio" 
                                name="term" 
                                value="B"
                                onChange={handleInputChange}
                                checked={filters.term === 'B'}
                            />
                            <span>Both Terms</span>
                        </label>
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="font-medium">Course Type</h3>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                            <input 
                                name="isCS"
                                type="checkbox" 
                                onChange={handleInputChange}
                                value="CS"
                                checked={filters.isCS}
                            />
                            <span>CS</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input 
                                name="isHSS"
                                type="checkbox" 
                                onChange={handleInputChange}
                                value="HSS"
                                checked={filters.isHSS}
                            />
                            <span>HSS</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input 
                                name="isArtSci"
                                type="checkbox" 
                                onChange={handleInputChange}
                                value="ArtSci"
                                checked={filters.isArtSci}
                            />
                            <span>ArtSci</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input 
                                name="isEng"
                                type="checkbox" 
                                onChange={handleInputChange}
                                value="Eng"
                                checked={filters.isEng}
                            />
                            <span>Engineering</span>
                        </label>
                    </div>
                </div>
            </form>
        </div>
    )
};

export default Filter;