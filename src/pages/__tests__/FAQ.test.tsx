import { render, screen } from '@testing-library/react';
import { siteFaqData } from "../../data/faqData";
import FAQ from '../FAQ';

describe('FAQ', () => {
    beforeEach(() => {
        render(<FAQ />);
    });

    it('renders all site FAQ questions', () => {
        siteFaqData.forEach((faqItem) => {
            expect(screen.getByText(faqItem.question)).toBeInTheDocument();
        });
    });
});