import { render, screen } from '@testing-library/react';
import faqData from "../../data/faqData";
import FAQ from '../FAQ';

describe('FAQ', () => {
    beforeEach(() => {
        render(<FAQ />);
    });

    it('renders all FAQ questions', () => {
        faqData.forEach((faqItem) => {
            expect(screen.getByText(faqItem.question)).toBeInTheDocument();
        });
    });
});