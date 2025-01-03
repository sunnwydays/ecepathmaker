import { render, screen } from '@testing-library/react';
import Courses from '../Courses';

describe('CourseCard', () => {
    it('renders the courses component', () => {
        render(<Courses />);
        expect(screen.getByText('Courses')).toBeInTheDocument();
    });
});