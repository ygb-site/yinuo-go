/**
 * 棋子颜色常量与代码定义 (Stone Color Codes)
 * 0: 空 None, 1: 黑 Black, 2: 白 White
 */
export const StoneColorCode = {
    NONE: 0,
    BLACK: 1,
    WHITE: 2
};
/**
 * 颜色转换与对手推导工具
 */
export function getOpponent(color) {
    return color === 'B' ? 'W' : 'B';
}
