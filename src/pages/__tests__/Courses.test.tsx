import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Courses } from '../../utils/pageImports';
import { Layout } from '../../utils/componentImports';
import { MemoryRouter, useLocation } from 'react-router-dom';
import mockCourses from '../../data/mockCourses';

const Location = () => <span data-testid="location">{useLocation().search}</span>;

const renderPage = (url = '/courses') =>
    render(
        <MemoryRouter initialEntries={[url]}>
            <Layout>
                <Courses/>
                <Location/>
            </Layout>
        </MemoryRouter>
    );

const getRow = (code: string) =>
    document.querySelector(`[data-code="${code}"]`) as HTMLElement;

const rowCodes = () =>
    screen.queryAllByTestId('course-row').map((row) => row.getAttribute('data-code'));

describe('Courses page', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('filters by category correctly', () => {
        renderPage();
        // stream 5
        const stream5Select = screen.getByTestId('filter-stream-5');
        fireEvent.click(stream5Select);

        // available in the winter by disabling fall
        const fallSelect = screen.getByTestId('filter-fall');
        fireEvent.click(fallSelect);

        expect(screen.getByText(/Probability and Applications/)).toBeInTheDocument();
        expect(screen.queryByText(/ECE335/)).not.toBeInTheDocument();
    });

    it('searches by course name correctly', async () => {
        renderPage();
        const user = userEvent.setup()
        const inputBox = screen.getByPlaceholderText('Search by code or name');
        await user.type(inputBox, 'electronics');

        expect(screen.getByText(/Analog Electronics/)).toBeInTheDocument();
        expect(screen.getByText(/Digital Electronics/)).toBeInTheDocument();
        expect(screen.queryByText(/Probability and Applications/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Random Processes/)).not.toBeInTheDocument();
    });

    it('does not add a course to the grid when pressing enter', async () => {
        renderPage();
        const user = userEvent.setup()
        const inputBox = screen.getByPlaceholderText('Search by code or name');
        await user.type(inputBox, 'APS360{enter}');

        expect(screen.queryByText(/Added APS360/)).not.toBeInTheDocument();
        expect((inputBox as HTMLInputElement).value).toBe('APS360');
    });

    it('shows no results message for garbage search', () => {
        renderPage();
        const searchInput = screen.getByPlaceholderText('Search by code or name');
        fireEvent.change(searchInput, { target: { value: 'xxxxx' } });

        expect(screen.getByText(/No courses match the current filter/)).toBeInTheDocument();
        expect(screen.queryAllByTestId('course-row')).toHaveLength(0);
    });

    it('resets filters correctly', () => {
        renderPage();
        const searchInput = screen.getByPlaceholderText('Search by code or name');
        fireEvent.change(searchInput, { target: { value: 'xxxxx' } });
        fireEvent.click(screen.getByTestId('reset-filters'));

        expect(rowCodes()).toContain('APS360');
        expect(rowCodes()).toContain('ECE302');
    });

    it('updates the result count', () => {
        renderPage();
        const total = Object.keys(mockCourses).length;
        expect(screen.getByTestId('result-count')).toHaveTextContent(`${total} of ${total} courses`);

        fireEvent.change(screen.getByPlaceholderText('Search by code or name'), {
            target: { value: 'ECE302' },
        });
        expect(screen.getByTestId('result-count')).toHaveTextContent(`1 of ${total} courses`);
    });

    it('sorts by code', () => {
        renderPage();
        fireEvent.change(screen.getByTestId('sort-select'), { target: { value: 'code' } });
        const codes = rowCodes() as string[];
        expect(codes).toEqual([...codes].sort((a, b) => a.localeCompare(b)));
    });

    it('shows a custom course saved in localStorage', () => {
        localStorage.setItem(
            'courses',
            JSON.stringify({ ...mockCourses, ECE999: { name: 'Made Up Course' } })
        );
        renderPage();
        expect(rowCodes()).toContain('ECE999');
    });

    it('shows a course on the grid and can hide it', () => {
        const used = Object.fromEntries(Object.keys(mockCourses).map((code) => [code, '']));
        localStorage.setItem('courses', JSON.stringify(mockCourses));
        localStorage.setItem('coursesUsed', JSON.stringify({ ...used, ECE302: '3F.1' }));
        renderPage();
        const row = getRow('ECE302');
        expect(within(row).getByText(/In 3F/)).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('hide-on-grid'));
        expect(rowCodes()).not.toContain('ECE302');
    });

    it('shows details when a row is clicked and follows a prerequisite', () => {
        renderPage();
        fireEvent.click(getRow('ECE464'));
        expect(screen.getByTestId('detail-code')).toHaveTextContent('ECE464');

        const detail = screen.getByTestId('course-detail');
        const preqCode = mockCourses.ECE464.preq?.flat()[0] as string;
        fireEvent.click(within(detail).getAllByRole('button', { name: preqCode })[0]);
        expect(screen.getByTestId('detail-code')).toHaveTextContent(preqCode);
    });

    it('lists what a course unlocks', () => {
        renderPage();
        fireEvent.click(getRow('ECE302'));
        const detail = screen.getByTestId('course-detail');
        expect(within(detail).getByRole('heading', { name: 'Unlocks' })).toBeInTheDocument();
        expect(within(detail).getByRole('button', { name: 'ECE435' })).toBeInTheDocument();
    });

    it('changes the group pills with the curriculum', () => {
        renderPage();
        const before = screen.getAllByTestId('group-pill').map((p) => p.textContent);
        fireEvent.change(screen.getByTestId('curriculum-picker'), { target: { value: 'ele-2026' } });
        const after = screen.getAllByTestId('group-pill').map((p) => p.textContent);
        expect(after).not.toEqual(before);
    });

    it('opens with the course in the URL selected', () => {
        renderPage('/courses?c=ECE302');
        expect(screen.getByTestId('detail-code')).toHaveTextContent('ECE302');
        expect(getRow('ECE302')).toHaveAttribute('aria-current', 'true');
    });

    it('shows a note for an unknown code in the URL', () => {
        renderPage('/courses?c=ECE999');
        expect(screen.getByText('ECE999 is not in the course list')).toBeInTheDocument();
        expect(screen.getByTestId('group-overview')).toBeInTheDocument();
        expect(screen.queryByTestId('course-detail')).not.toBeInTheDocument();
    });

    it('updates the URL when a course is selected', () => {
        renderPage();
        expect(screen.getByTestId('location')).toHaveTextContent('');
        fireEvent.click(getRow('ECE464'));
        expect(screen.getByTestId('location')).toHaveTextContent('?c=ECE464');
        fireEvent.click(screen.getByRole('button', { name: 'Back to all courses' }));
        expect(screen.getByTestId('group-overview')).toBeInTheDocument();
    });

    it('shows the overview of groups when nothing is selected and selects from a chip', () => {
        renderPage();
        const overview = screen.getByTestId('group-overview');
        expect(within(overview).getByRole('heading', { name: /Group 1/ })).toBeInTheDocument();
        fireEvent.click(within(overview).getAllByRole('button', { name: /^ECE302/ })[0]);
        expect(screen.getByTestId('detail-code')).toHaveTextContent('ECE302');
    });

    it('names the earliest term a course can be taken in the details', () => {
        renderPage('/courses?c=ECE330');
        expect(within(screen.getByTestId('course-detail')).getByText(/Can take from 3S/)).toBeInTheDocument();
    });

    it('adds a course to the grid with the button, only when it can be taken', () => {
        renderPage('/courses?c=ECE464');
        expect(screen.queryByRole('button', { name: 'Add to Grid' })).not.toBeInTheDocument();

        fireEvent.click(getRow('ECE302'));
        fireEvent.click(screen.getByRole('button', { name: 'Add to Grid' }));
        expect(screen.queryByRole('button', { name: 'Add to Grid' })).not.toBeInTheDocument();
        expect(within(screen.getByTestId('course-detail')).getByText(/In 3F on your grid/)).toBeInTheDocument();
        expect(within(getRow('ECE302')).getByText(/In 3F/)).toBeInTheDocument();
    });
});
