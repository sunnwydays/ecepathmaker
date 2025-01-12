import { useState } from 'react';
import CourseGrid from '../components/CourseGrid';
import CourseForm from '../components/CourseForm';
import LoadLayout from '../components/LoadLayout';

import mockCourses from '../components/mockCourses';

const Maker = () => {
    return (
        <div>
            <CourseGrid courses={mockCourses} />
            <div className="grid md:grid-cols-2 grid-cols-1 gap-8">
                <CourseForm />
                <LoadLayout />
            </div>
        </div>
    )
}

export default Maker;