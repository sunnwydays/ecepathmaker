// Shared class strings, taken from the FAQ page. Each one is a complete
// literal so Tailwind can see it. Compose with extra classes as needed.

/** Text input and select */
export const input =
  "rounded-lg border border-neutral3 bg-white px-3 py-2.5 " +
  "dark:border-gray-500 dark:bg-gray-800 dark:text-gray-50 dark:placeholder-gray-400 " +
  "focus:outline-none focus:ring-2 focus:ring-green2";

/** Filled destructive button */
export const buttonDanger =
  "rounded-lg bg-comp2 px-4 py-2 text-sm font-medium text-white " +
  "hover:bg-comp3 dark:bg-comp3 dark:hover:bg-comp4 " +
  "transition-[background-color,transform] duration-200 ease-out active:scale-95";

/** Filled button */
export const buttonPrimary =
  "rounded-lg bg-green2 px-4 py-2 text-sm font-medium text-white " +
  "hover:bg-green3 dark:bg-green3 dark:hover:bg-green4 " +
  "transition-[background-color,transform] duration-200 ease-out active:scale-95";

/** Outlined button */
export const buttonSecondary =
  "rounded-lg border border-neutral3 px-4 py-2 text-sm font-medium " +
  "hover:bg-neutral1 dark:border-gray-500 dark:hover:bg-gray-600 " +
  "transition-[background-color,transform] duration-200 ease-out active:scale-95";

/** Border and corners of a panel, for surfaces that keep their own fill */
export const panelEdge =
  "rounded-xl border border-neutral2 dark:border-gray-500 transition-colors duration-150";

/** Bordered surface */
export const panel = `${panelEdge} bg-white dark:bg-gray-600`;

/** Small uppercase label */
export const eyebrow =
  "text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400";

/** Text link */
export const textLink = "text-green3 hover:underline dark:text-green1";

/** Dashed box for "nothing here" */
export const emptyState =
  "rounded-xl border border-dashed border-neutral3 px-6 py-12 text-center dark:border-gray-500";

/** Pill for navbar and drawer links; add the active or idle classes below */
export const navPill = "rounded-lg px-3 py-1.5 transition-colors duration-200";
export const navPillActive =
  "bg-green1/40 font-medium text-green4 dark:bg-green4/50 dark:text-green1";
export const navPillIdle = "hover:bg-neutral1 dark:hover:bg-gray-600";

/** Square icon-only button */
export const iconButton =
  "flex items-center rounded-lg p-2 transition-colors duration-200 hover:bg-neutral1 dark:hover:bg-gray-600";
