import { useState } from "react";

const LoadLayout = () => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        if (name === 'code') setErrors(prev => ({...prev, code: validateCourseCode(value)}));
        if (name === 'preq') setErrors(prev => ({...prev, preq: validatePrerequisites(value)}));
    };

    const [invalid, setInvalid] = useState(false);

    return (
        <section>
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
                {errors.code ? 
                    <p className="mt-6 max-w-xl text-comp3">String is invalid</p> :
                    <p className="mt-6 max-w-xl">Copy the string above and paste it somewhere to save for later or paste your previously copied string to load it</p>
                }
            </form>
        </section>
    );
};

export default LoadLayout;