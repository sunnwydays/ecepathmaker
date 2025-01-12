import { CourseList } from "../types/CourseTypes";

const mockCourses: CourseList = {
    'ECE456': {
        name: 'Database Systems',
        preq: ['ECE345'],
        streams: [1, 4],
        onlyF: true,
        isCS: true,
        color: 'abcabc'
    },
    'APS310': {
        name: 'Social Impact of Technology',
        streams: [3],
        isCS: true,
        isHSS: true,
        color: 'f5d7db'
    },
    'ECE344': {
        name: 'Operating Systems',
        preq: ['ECE244'],
        streams: [1],
    },
    'ECE361': {
        name: 'Computer Networks',
        preq: ['ECE244'],
        streams: [1, 2],
        isCS: true,
    },
    'ECE421': {
        name: 'Machine Learning',
        preq: ['ECE324', 'ECE421'],
        streams: [1, 4],
        onlyF: true,
        isCS: true,
        color: 'b5c7d9'
    }
};

export default mockCourses;