import { render, screen, fireEvent, within } from '@testing-library/react';
import { Maker } from '../../utils/pageImports';
import { Layout } from '../../utils/componentImports';
import { getRow } from '../../test-utils/getRow';
import { MemoryRouter } from 'react-router-dom';

const loadString = (str: string) => {
    fireEvent.change(screen.getByPlaceholderText('Layout string'), { target: { value: str } });
    fireEvent.click(screen.getByTestId('load-layout'));
};

const storedCourse = (code: string) => JSON.parse(localStorage.getItem('courses')!)[code];

describe('Extra (EXT) courses on the grid', () => {
    beforeEach(() => {
        localStorage.clear();
        // jsdom has no scrollIntoView, which the edit button calls
        Element.prototype.scrollIntoView = jest.fn();
        render(
            <MemoryRouter><Layout>
                <Maker />
            </Layout></MemoryRouter>
        );
        loadString('CST000Complementary%%c$$ABC123Other%%');
    });

    const grid = () => screen.getByTestId('grid');
    const expand = (code: string) => fireEvent.click(within(grid()).getByText(code));

    it('shows no badge or toggle until the card is marked', () => {
        expect(within(grid()).queryByTestId('ext-badge')).not.toBeInTheDocument();
        expect(within(grid()).queryByTestId('toggle-ext')).not.toBeInTheDocument();
        expand('CST000');
        expect(within(grid()).getByTestId('toggle-ext')).toBeInTheDocument();
    });

    it('toggling changes a requirement and the course limit count', () => {
        loadString('ECE472Engineering Economics%%$$ABC123Other%%');
        expect(getRow(/Economics: ✅/)).toBeInTheDocument();
        expect(getRow(/Course limit: ✅ \(2\/20\)/)).toBeInTheDocument();
        expand('ECE472');
        fireEvent.click(within(grid()).getByTestId('toggle-ext'));
        expect(within(grid()).getByTestId('ext-badge')).toBeInTheDocument();
        expect(getRow(/Economics: ❌/)).toBeInTheDocument();
        expect(getRow(/Course limit: ✅ \(1\/20\)/)).toBeInTheDocument();

        fireEvent.click(within(grid()).getByTestId('toggle-ext'));
        expect(within(grid()).queryByTestId('ext-badge')).not.toBeInTheDocument();
        expect(getRow(/Economics: ✅/)).toBeInTheDocument();
        // Unmarking deletes the key instead of storing false
        expect('isExtra' in storedCourse('ECE472')).toBe(false);
    });

    it('is saved in the course list and keeps the course in the layout', () => {
        expand('CST000');
        fireEvent.click(within(grid()).getByTestId('toggle-ext'));
        expect(storedCourse('CST000').isExtra).toBe(true);
    });

    it('is kept when the course is edited', () => {
        expand('CST000');
        fireEvent.click(within(grid()).getByTestId('toggle-ext'));
        fireEvent.click(within(grid()).getByText('✏️'));
        fireEvent.click(screen.getByText('Add/Update Course'));
        expect(within(grid()).getByTestId('ext-badge')).toBeInTheDocument();
        expect(storedCourse('CST000').isExtra).toBe(true);
    });

    it('is cleared when the grid is cleared', () => {
        expand('CST000');
        fireEvent.click(within(grid()).getByTestId('toggle-ext'));
        fireEvent.click(screen.getByTestId('clear-grid'));
        expect('isExtra' in storedCourse('CST000')).toBe(false);
    });

    it('does not stay on a course that is missing from a loaded layout', () => {
        expand('CST000');
        fireEvent.click(within(grid()).getByTestId('toggle-ext'));
        loadString('ABC123Other%%');
        expect('isExtra' in storedCourse('CST000')).toBe(false);
        // and a layout string can carry the flag
        loadString('CST000Complementary%%cx');
        expect(within(grid()).getByTestId('ext-badge')).toBeInTheDocument();
    });

    it('is not offered on cards in the course list', () => {
        const bucket = screen.getByTestId('bucket');
        fireEvent.click(within(bucket).getByText('ECE335'));
        expect(within(bucket).queryByTestId('toggle-ext')).not.toBeInTheDocument();
    });
});
