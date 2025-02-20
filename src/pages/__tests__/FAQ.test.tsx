import { render, screen } from '@testing-library/react';
import { siteFaqData } from '../../utils/dataImports';
import { FAQ } from '../../utils/pageImports';

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