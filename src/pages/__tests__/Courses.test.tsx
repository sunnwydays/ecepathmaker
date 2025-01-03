import { render, screen, fireEvent } from '@testing-library/react';
import Courses from "../Courses";

describe('Courses page', () => {
    beforeEach(() => {
        render(<Courses/>);
    });

    it('filters by category correctly', () => {
        // stream 5
        const stream5Select = screen.getByTestId('stream-5');
        fireEvent.click(stream5Select);

        // available in the fall
        const fallSelect = screen.getByTestId('fall-select');
        fireEvent.click(fallSelect);

        expect(screen.getByText(/ECE302/)).toBeInTheDocument();
        expect(screen.queryByText(/APS360/)).not.toBeInTheDocument();
    });

    it('searches by course name correctly', () => {
        const inputBox = screen.getByPlaceholderText('Intro to Electronics');
        fireEvent.change(inputBox, { target: { value: 'electronics' } });

        expect(screen.getByText("ECE331: Analog Electronics")).toBeInTheDocument();
        expect(screen.getByText("ECE334: Digital Electronics")).toBeInTheDocument();
        expect(screen.queryByText(/ECE302/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Random Processes/)).not.toBeInTheDocument();
    });

    it('shows no results message for garbage search', () => {
        const searchInput = screen.getByPlaceholderText('Intro to Electronics');
        fireEvent.change(searchInput, { target: { value: 'xxxxx' } });
        
        expect(screen.getByText(/No matching courses in database/i)).toBeInTheDocument();
    });

    it('resets filters correctly', () => {
        const resetButton = screen.getByTestId('reset-filters');
        fireEvent.click(resetButton);
        
        expect(screen.getByText(/APS360/)).toBeInTheDocument();
        expect(screen.getByText(/ECE302/)).toBeInTheDocument();
    });
});