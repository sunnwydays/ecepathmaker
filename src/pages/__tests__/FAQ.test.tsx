import { fireEvent, render, screen } from '@testing-library/react';
import { courseFaqData, siteFaqData } from '../../utils/dataImports';
import { FAQ } from '../../utils/pageImports';

describe('FAQ', () => {
    beforeEach(() => {
        render(<FAQ />);
    });

    it('renders all site and course FAQ questions', () => {
        [...siteFaqData, ...courseFaqData].forEach((faqItem) => {
            expect(screen.getByText(faqItem.question)).toBeInTheDocument();
        });
    });

    it('toggles a question open and closed', () => {
        const button = screen.getByRole('button', { name: siteFaqData[0].question });
        expect(button).toHaveAttribute('aria-expanded', 'false');
        fireEvent.click(button);
        expect(button).toHaveAttribute('aria-expanded', 'true');
        fireEvent.click(button);
        expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('filters questions by search', () => {
        fireEvent.change(screen.getByPlaceholderText(/search questions/i), {
            target: { value: 'signing in' },
        });
        expect(screen.getByRole('button', { name: /what does signing in do/i })).toBeInTheDocument();
        expect(screen.queryByText('Who is this for?')).not.toBeInTheDocument();
    });

    it('shows an empty state when nothing matches', () => {
        fireEvent.change(screen.getByPlaceholderText(/search questions/i), {
            target: { value: 'zzzz-no-match' },
        });
        expect(screen.getByText(/no questions match/i)).toBeInTheDocument();
    });
});
