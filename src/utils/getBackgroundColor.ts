// Based on ECE Iris
const streamToColor: Record<number, string> = {
    1: "#fa7274",
    2: "#ff956b",
    3: "#ffdd46",
    4: "#79d675",
    5: "#5db6ff",
    6: "#ab8eee",
};

const sciMathColor = "#f36aba";
const hssColor = "#d4a5a5";
const csColor = "#a89c64";
const defaultColor = "#e0e0e0";

export const getBackgroundColor = (
    color: string | undefined, 
    stream?: number | undefined, 
    isSciMath?: boolean | undefined,
    isCS?: boolean | undefined,
    isHSS?: boolean | undefined,
): string => {
    if (color) return color.startsWith('#') ? color : `#${color}`;
    if (stream) return streamToColor[stream];
    if (isSciMath) return sciMathColor;
    if (isHSS) return hssColor;
    if (isCS) return csColor;
    return defaultColor;
};