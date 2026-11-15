import { screen } from "@testing-library/react";

// A requirement row like "CS: ✅ (3/4)". The tick is its own element (it
// animates when it flips) and the info button adds a screen-reader "Info", so
// match the row's whole text rather than one text node.
export const getRow = (pattern: RegExp) =>
    screen.getByText(
        (_, el) =>
            el?.tagName === "LI" &&
            pattern.test((el.textContent ?? "").replace(/Info/g, ""))
    );
