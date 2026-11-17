import { screen } from "@testing-library/react";

// A requirement row like "CS: ✅ (3/4)", matched by the row's aria-label (the
// visible row shows the progress and tick apart from the label).
export const getRow = (pattern: RegExp) =>
    screen.getByText(
        (_, el) =>
            el?.tagName === "LI" && pattern.test(el.getAttribute("aria-label") ?? "")
    );
