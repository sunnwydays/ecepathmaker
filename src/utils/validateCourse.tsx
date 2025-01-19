export const validateCourseCode = (code: string) => {
    return /^[A-Z]{3}\d{3}$/i.test(code);
};

export const validateCourseName = (name: string) => {
    return !name.includes('**');
};

export const validatePrerequisites = (preq: string) => {
    if (!preq) return true;
    
    const andGroups = preq.split(',');
    return andGroups.every(group => {
        const orCourses = group.split('|').map(p => p.trim());
        return orCourses.every(code => validateCourseCode(code));
    });
};