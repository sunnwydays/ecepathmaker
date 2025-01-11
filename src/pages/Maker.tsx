import { useState } from 'react';
import { CourseList } from '../types/CourseTypes';
import CourseGrid from '../components/CourseGrid';
import CourseForm from '../components/CourseForm';
import LoadLayout from '../components/LoadLayout';

const Maker = () => {
    const mockCourses: CourseList = {
        'ECE456': {
            name: 'Test Course',
            preq: ['ECE345'],
            stream1: true,
            onlyF: true,
            isCS: true,
            color: 'abcabc'
        },
        'APS310': {
            name: 'Test Course',
            stream3: true,
        },
        'APS311': {
            name: 'Test Course',
            stream3: true,
        },
        'APS312': {
            name: 'Test Course',
            stream3: true,
        },
        'APS313': {
            name: 'Test Course',
            stream3: true,
        },
        'AuS310': {
            name: 'Test Course',
            stream3: true,
        },
        'AhS310': {
            name: 'Test Course',
            stream3: true,
        },
        'Ahe310': {
            name: 'Test Course',
            stream3: true,
        },
    };
    
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