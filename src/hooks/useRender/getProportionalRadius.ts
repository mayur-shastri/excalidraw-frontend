export const getProportionalRadius = (width: number, height: number, base: number = 12) => {
    // Use the smaller dimension to scale the radius, clamp to avoid too large radius
    const minDim = Math.min(width, height);
    return Math.max(2, Math.min(base, minDim / 4));
};