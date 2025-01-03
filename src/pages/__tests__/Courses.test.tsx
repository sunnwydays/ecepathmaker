import { render, screen } from '@testing-library/react';
import Courses from "../Courses";

describe('Courses page', () => {
    it('filters by category correctly', () => {
        render(<Courses/>);
        const inputBox = screen.getAllByPlaceholderText('')
    })
});

describe('Courses page', () => {
    it('searches by detail correctly', () => {
        render(<Courses/>);
        const inputBox = screen.getAllByPlaceholderText('')
    })
});