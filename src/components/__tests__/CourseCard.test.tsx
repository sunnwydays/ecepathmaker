import { render, screen } from '@testing-library/react';
import CourseCard from '../CourseCard';
import { CourseCardProps } from '../../types/CourseTypes';

describe('CourseCard', () => {
    const courseDetails: CourseCardProps = {
        code: 'ECE452',
        name: 'I made this up',
        preq: ['ECE345'],
        stream1: true,
        onlyF: true,
        isCS: true,
    };

    it('renders course details correctly', () => {
        render(<CourseCard {...courseDetails} />);
        
        // Check course code and name
        expect(screen.getByTestId('course-code')).toHaveTextContent('ECE452');
        expect(screen.getByText(/I made this up/)).toBeInTheDocument();
        
        // Check stream 1 indicator
        expect(screen.getByText("Streams: 1")).toBeInTheDocument();
        
        // Check prerequisite
        expect(screen.getByText('Prerequisites: ECE345')).toBeInTheDocument();
        
        // Check CS indicator
        expect(screen.getByText(/CS/)).toBeInTheDocument();
        
        // Check Fall-only indicator
        expect(screen.getByText(/Fall/i)).toBeInTheDocument();

        // Check background colour
        const cardContainer = screen.getByRole('article');
        expect(cardContainer).toHaveClass('bg-neutral1');
    });
});