// Grid cell sizes. With the sixth column visible every cell shrinks so the
// grid keeps its width: 5 x 8rem + 4 x 0.5rem gap = 42rem, and
// 6 x 6.5rem + 5 x 0.5rem gap = 41.5rem.
export const CELL = { size: "size-32", hover: "size-36" };
export const CELL_COMPACT = { size: "size-[6.5rem]", hover: "size-[7.25rem]" };

export const cellSize = (compact?: boolean) => (compact ? CELL_COMPACT : CELL);
