import { render, screen, fireEvent } from '@testing-library/react';
import Maker from '../Maker';

const mockCourse = {
    code: 'ECe456',
    name: 'Test Course',
    preq: ['ECE345'],
    stream1: true,
    onlyF: true,
    isCS: true,
};

describe('Maker', () => {
    beforeEach(() => {
        // Render the Maker component before each test
        render(<Maker />);
    });

    it('adds custom courses to the course list', () => {
        // Simulate user input
        const codeInput = screen.getByTestId('code-input')
        fireEvent.change(codeInput, { target: { value: mockCourse.code } });

        const nameInput = screen.getByPlaceholderText('Course Name');
        fireEvent.change(nameInput, { target: { value: mockCourse.name } });

        const preqInput = screen.getByTestId('preq-input');
        fireEvent.change(preqInput, { target: { value: mockCourse.preq.join(',') } });

        const stream1Select = screen.getByTestId('stream-1');
        fireEvent.click(stream1Select);

        const onlyFSelect = screen.getByTestId('only-f');
        fireEvent.click(onlyFSelect);

        const csSelect = screen.getByTestId('cs');
        fireEvent.click(csSelect);

        // Submit the form
        const form = screen.getByTestId('course-form');
        fireEvent.submit(form);

        expect(screen.getByText(/ECE456/)).toBeInTheDocument();
        expect(screen.getByText(/Test Course/)).toBeInTheDocument();
        // expect(screen.getByText(/ECE345/)).toBeInTheDocument();
        // expect(screen.getByText(/\(F\)/)).toBeInTheDocument();
    });

    // it('evaluates successful graduation', () => {
    //     // need to drag and drop
    //     expect(screen.getByText("This pathway is good for graduation (assuming you fulfill your 600 hours technical XP or PEY)"));
    // });
});
