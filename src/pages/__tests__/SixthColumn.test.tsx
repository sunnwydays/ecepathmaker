import { render, screen, fireEvent, within, cleanup } from '@testing-library/react';
import { Maker } from '../../utils/pageImports';
import { Layout } from '../../utils/componentImports';
import { MemoryRouter } from 'react-router-dom';

const renderMaker = () =>
    render(
        <MemoryRouter><Layout>
            <Maker />
        </Layout></MemoryRouter>
    );

const loadString = (str: string) => {
    fireEvent.change(screen.getByPlaceholderText('Layout string'), { target: { value: str } });
    fireEvent.click(screen.getByTestId('load-layout'));
};

const grid = () => screen.getByTestId('grid');
const slotCount = () => grid().children.length;

// Six courses in 3F, so the sixth is in the 3F.6 slot
const SIX_IN_3F =
    'AAA111One%%$$BBB222Two%%$$CCC333Three%%$$DDD444Four%%$$EEE555Five%%$$FFF666Six%%';

describe('Sixth column', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('is hidden by default and the toggle shows and hides it', () => {
        renderMaker();
        expect(slotCount()).toBe(25);
        expect(grid()).toHaveClass('grid-cols-5');
        expect(screen.getByTestId('toggle-sixth')).toHaveAttribute('aria-checked', 'false');

        fireEvent.click(screen.getByTestId('toggle-sixth'));
        expect(slotCount()).toBe(30);
        expect(grid()).toHaveClass('grid-cols-6');
        expect(screen.getByTestId('toggle-sixth')).toHaveAttribute('aria-checked', 'true');
        expect(within(grid()).getByText('3F.6')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('toggle-sixth'));
        expect(slotCount()).toBe(25);
    });

    it('stays after a reload', () => {
        renderMaker();
        fireEvent.click(screen.getByTestId('toggle-sixth'));
        expect(localStorage.getItem('showSixth')).toBe('true');
        cleanup();
        renderMaker();
        expect(slotCount()).toBe(30);
        fireEvent.click(screen.getByTestId('toggle-sixth'));
        expect(localStorage.getItem('showSixth')).toBe('false');
        cleanup();
        renderMaker();
        expect(slotCount()).toBe(25);
    });

    it('shows itself when a layout has a sixth course, and refuses to hide while filled', () => {
        renderMaker();
        loadString(SIX_IN_3F);
        expect(slotCount()).toBe(30);
        expect(within(grid()).getByText('FFF666')).toBeInTheDocument();
        // The toggle was never switched on
        expect(localStorage.getItem('showSixth')).toBe('false');

        fireEvent.click(screen.getByTestId('toggle-sixth'));
        expect(screen.getByText('Move the courses out of the 6th column first')).toBeInTheDocument();
        expect(slotCount()).toBe(30);
    });

    it('goes back to five columns when a layout without a sixth course is loaded', () => {
        renderMaker();
        loadString(SIX_IN_3F);
        loadString('AAA111One%%');
        expect(slotCount()).toBe(25);
    });

    it('keeps the sixth course in the saved layout and the stored grid', () => {
        renderMaker();
        loadString(SIX_IN_3F);
        expect(JSON.parse(localStorage.getItem('coursesOnGrid')!)['3F.6']).toBe('FFF666');
        cleanup();
        renderMaker();
        expect(within(grid()).getByText('FFF666')).toBeInTheDocument();
    });

    it('loads a grid stored before the sixth column existed', () => {
        const old: Record<string, string> = {};
        ['3F', '3S', '4F', '4S', 'XX'].forEach((t) =>
            [1, 2, 3, 4, 5].forEach((n) => (old[`${t}.${n}`] = ''))
        );
        old['3F.1'] = 'ECE335';
        localStorage.setItem('coursesOnGrid', JSON.stringify(old));
        renderMaker();
        expect(slotCount()).toBe(25);
        fireEvent.click(screen.getByTestId('toggle-sixth'));
        expect(slotCount()).toBe(30);
    });

    it('makes grid cards compact only while the column is visible', () => {
        renderMaker();
        loadString('AAA111One%%');
        const card = () => within(grid()).getByText('AAA111').closest('article') as HTMLElement;
        const bucketCard = () =>
            within(screen.getByTestId('bucket')).getByText('ECE335').closest('article') as HTMLElement;
        expect(card()).toHaveClass('size-32');

        fireEvent.click(screen.getByTestId('toggle-sixth'));
        expect(card()).toHaveClass('size-[6.5rem]');
        expect(bucketCard()).toHaveClass('size-32');

        fireEvent.click(screen.getByTestId('toggle-sixth'));
        expect(card()).toHaveClass('size-32');
    });
});

describe('Grid row order', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('shows the XX row first and the terms after it in order', () => {
        renderMaker();
        const labels = Array.from(grid().children).map((c) => c.textContent);
        expect(labels.slice(0, 5)).toEqual(['XX.1', 'XX.2', 'XX.3', 'XX.4', 'XX.5']);
        expect(labels.slice(5, 10)).toEqual(['3F.1', '3F.2', '3F.3', '3F.4', '3F.5']);
        expect(labels.slice(20)).toEqual(['4S.1', '4S.2', '4S.3', '4S.4', '4S.5']);
    });

    it('still writes XX last in the layout string', () => {
        renderMaker();
        loadString('AAA111One%%@@@@@@@@BBB222Two%%');
        expect(within(grid()).getAllByText(/^(AAA111|BBB222)$/)[0]).toHaveTextContent('BBB222');
    });
});

describe('Sixth column toggle while filled', () => {
    it('looks disabled but still shows the message on click', () => {
        localStorage.clear();
        renderMaker();
        const toggle = () => screen.getByTestId('toggle-sixth');
        expect(toggle()).toHaveAttribute('aria-disabled', 'false');
        loadString(SIX_IN_3F);
        expect(toggle()).toHaveAttribute('aria-disabled', 'true');
        expect(toggle()).toHaveClass('opacity-50');
        fireEvent.click(toggle());
        expect(screen.getByText('Move the courses out of the 6th column first')).toBeInTheDocument();
    });
});
