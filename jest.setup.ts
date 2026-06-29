import "@testing-library/jest-dom";
import type { ReactNode } from "react";

jest.mock('lucide-react');

// react-helmet-async needs a HelmetProvider in the tree; stub it out for tests
jest.mock('react-helmet-async', () => ({
    Helmet: () => null,
    HelmetProvider: ({ children }: { children: ReactNode }) => children,
}));