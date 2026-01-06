import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Courses } from '../../utils/pageImports';
import { Layout } from '../../utils/componentImports';

describe('Courses page', () => {
    beforeEach(() => {
        render(
            <Layout>
                <Courses/>
            </Layout>
        );
    });

    it('filters by category correctly', () => {
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
        const user = userEvent.setup()
        const inputBox = screen.getByPlaceholderText('Search by code or name');
        await user.type(inputBox, 'electronics');

        // cant do ECE302: Probability and Applications because it is <span>ECE302</span><...
        expect(screen.getByText(/Analog Electronics/)).toBeInTheDocument();
        expect(screen.getByText(/Digital Electronics/)).toBeInTheDocument();
        expect(screen.queryByText(/Probability and Applications/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Random Processes/)).not.toBeInTheDocument();
    });

    it('shows no results message for garbage search', () => {
        const searchInput = screen.getByPlaceholderText('Search by code or name');
        fireEvent.change(searchInput, { target: { value: 'xxxxx' } });
        
        expect(screen.queryByText(/Other labels:/i)).not.toBeInTheDocument();
    });

    it('resets filters correctly', () => {
        const resetButton = screen.getByTestId('reset-filters');
        fireEvent.click(resetButton);
        
        expect(screen.getAllByText(/APS360/).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/ECE302/).length).toBeGreaterThan(0);
    });
});