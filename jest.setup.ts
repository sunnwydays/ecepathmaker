import "@testing-library/jest-dom";
import type { ReactNode } from "react";

// Stub every icon as a component that renders nothing
jest.mock('lucide-react', () => new Proxy(
    { __esModule: true },
    { get: (target, prop) => (prop in target ? target[prop as keyof typeof target] : () => null) },
));

// react-helmet-async needs a HelmetProvider in the tree; stub it out for tests
jest.mock('react-helmet-async', () => ({
    Helmet: () => null,
    HelmetProvider: ({ children }: { children: ReactNode }) => children,
}));