export const calculateAngle = (x1, y1, x2, y2) => {
    return Math.atan2(x1 - x2, y2 - y1) + 1.5708;
};
