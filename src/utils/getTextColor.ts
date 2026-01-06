export const getTextColor = (color: string | undefined): string => {
    const hexColor = color ? `${color}` : 'E0E0E0';
    
    const rgb = parseInt(hexColor, 16); // Convert hex to RGB
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >>  8) & 0xff;
    const b = (rgb >>  0) & 0xff;
    // Calculate brightness
    return (r * 299 + g * 587 + b * 114) / 1000 > 128 ? 'text-black' : 'text-white';
};