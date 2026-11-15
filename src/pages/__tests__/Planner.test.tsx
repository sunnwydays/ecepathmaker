import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Planner } from '../../utils/pageImports';
import { Layout } from '../../utils/componentImports';
import { MemoryRouter } from 'react-router-dom';

const renderPage = () =>
    render(
        <MemoryRouter initialEntries={['/plan']}>
            <Layout>
                <Planner/>
            </Layout>
        </MemoryRouter>
    );

const prompt = () =>
    (screen.getByTestId('planner-prompt') as HTMLTextAreaElement).value;

const loadPlan = (text: string) => {
    fireEvent.change(screen.getByTestId('plan-input'), { target: { value: text } });
    fireEvent.click(screen.getByTestId('load-plan'));
};

describe('Planner page', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('shows a prompt with the curriculum and a known course', () => {
        renderPage();
        expect(prompt()).toContain('Admitted before Fall 2026 (6 areas)');
        expect(prompt()).toContain('ECE302 | Probability and Applications');
    });

    it('updates the prompt when the form changes', () => {
        renderPage();
        expect(prompt()).not.toContain('Must take');
        fireEvent.click(screen.getByTestId('interest-5'));
        fireEvent.change(screen.getByTestId('must-take'), {
            target: { value: 'ECE345' },
        });
        expect(prompt()).toContain('- Interested in: Area 5 (Computer Hardware');
        expect(prompt()).toContain('- Must take: ECE345');
    });

    it('changes the groups and requirements with the curriculum', () => {
        renderPage();
        expect(screen.getByTestId('interest-6')).toBeInTheDocument();
        expect(screen.queryByTestId('interest-A')).not.toBeInTheDocument();
        fireEvent.click(screen.getByTestId('interest-5'));

        fireEvent.change(screen.getByTestId('curriculum-picker'), {
            target: { value: 'ele-2026' },
        });

        expect(screen.getByTestId('interest-A')).toBeInTheDocument();
        expect(screen.queryByTestId('interest-6')).not.toBeInTheDocument();
        expect(prompt()).toContain('Admitted Fall 2026+ · Electrical');
        expect(prompt()).toContain('Technical electives');
        expect(prompt()).not.toContain('Interested in');
    });

    it('copies the prompt', async () => {
        const writeText = jest.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', {
            value: { writeText },
            configurable: true,
        });
        renderPage();
        fireEvent.click(screen.getByTestId('copy-prompt'));
        await waitFor(() => expect(writeText).toHaveBeenCalledWith(prompt()));
        expect(await screen.findByText('Copied!')).toBeInTheDocument();
    });

    it('loads a pasted plan onto the grid', () => {
        renderPage();
        loadPlan('3F: ECE302, ECE345');
        expect(screen.getByText(/Loaded 2 courses/)).toBeInTheDocument();
        expect(screen.getByText('Check it in the Maker')).toHaveAttribute('href', '/');
        const grid = JSON.parse(localStorage.getItem('coursesOnGrid')!);
        expect(grid['3F.1']).toBe('ECE302');
        expect(grid['3F.2']).toBe('ECE345');
    });

    it('warns about an unknown code', () => {
        renderPage();
        loadPlan('3F: ECE302, ZZZ999');
        expect(screen.getByText(/Loaded 1 course\./)).toBeInTheDocument();
        expect(screen.getByText(/ZZZ999 is not in your course list/)).toBeInTheDocument();
    });

    it('shows an error and leaves the grid alone when there is no plan', () => {
        renderPage();
        const before = localStorage.getItem('coursesOnGrid');
        loadPlan('Take some electives and enjoy.');
        expect(screen.getByText(/No plan found/)).toBeInTheDocument();
        expect(localStorage.getItem('coursesOnGrid')).toBe(before);
    });

    it('disables loading while the plan box is empty', () => {
        renderPage();
        expect(screen.getByTestId('load-plan')).toBeDisabled();
    });

    it('has an AI Planner link to /plan in the navbar', () => {
        renderPage();
        expect(screen.getByRole('link', { name: 'AI Planner' })).toHaveAttribute(
            'href',
            '/plan'
        );
    });
});
