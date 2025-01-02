import { render, screen } from '@testing-library/react';
import CourseCard from '../CourseCard';

describe('CourseCard', () => {
    const courseDetails = {
        code: 'ECE452',
        name: 'I made this up',
        preq: ['ECE345'],
        stream1: true,
        stream2: false,
        stream3: false,
        stream4: false,
        stream5: false,
        stream6: false,
        stream1Kernel: false,
        stream2Kernel: false,
        stream3Kernel: false,
        stream4Kernel: false,
        stream5Kernel: false,
        stream6Kernel: false,
        onlyF: true,
        onlyS: false,
        isCS: true,
        isHSS: false,
        isArtSci: false,
    };

    it('renders course details correctly', () => {
        render(<CourseCard {...courseDetails} />);
        
        // Check course code and name
        expect(screen.getByText('ECE452')).toBeInTheDocument();
        expect(screen.getByText('I made this up')).toBeInTheDocument();
        
        // Check stream 1 indicator
        expect(screen.getByText(/Stream 1/i)).toBeInTheDocument();
        
        // Check prerequisite
        expect(screen.getByText('ECE345')).toBeInTheDocument();
        
        // Check CS indicator
        expect(screen.getByText('CS')).toBeInTheDocument();
        
        // Check Fall-only indicator
        expect(screen.getByText(/Fall Term Only/i)).toBeInTheDocument();

        const cardContainer = screen.getByRole('article');
        expect(cardContainer).toHaveClass('bg-neutral1');
    });
});