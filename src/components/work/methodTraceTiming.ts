// 所有「方格子转场」共用的节奏，单位是屏高（1 = 一个窗口高度的滚动距离）。
// 单独放一个小文件：右侧阅读进度条在主包里要用到，如果从 WorkMethodTrace 导入，
// 会把整个 three.js 一起拖进首页的首包。

// 转场前的停留：内容完整露出之后，要再往下滚这么多，才开始变色（留给观众看完内容）。
export const PIXEL_HOLD_VH = 0.7;
// 方块铺开把画面盖成下一个板块颜色所用的滚动距离（决定转场的快慢）。
export const PIXEL_COVER_VH = 0.6;

// 方法板块自己的节奏：线条进入、汇合、文字显现各占的屏数，之后接上面统一的停留和铺方块。
export const METHOD_ENTER_VH = 0.49;
export const METHOD_FUSE_VH = 0.735;
export const METHOD_TEXT_VH = 0.93;
// 收尾不再铺方块：文字显现、停留之后，方法钉住不动，「关于」从下方整块滑上来盖住它
// （和开场 → 成果同一种做法），这一段占 1 屏。
export const METHOD_SLIDE_VH = 1;
export const METHOD_TOTAL_VH = METHOD_TEXT_VH + PIXEL_HOLD_VH + METHOD_SLIDE_VH;

// 方法板块钉住区间内，各阶段结束的位置（0~1）。右侧阅读进度条用 TEXT_REVEAL_END 判断
// 「文字已完全显现」的滚动位置。
export const METHOD_ENTER_END = METHOD_ENTER_VH / METHOD_TOTAL_VH;
export const METHOD_FUSE_END = METHOD_FUSE_VH / METHOD_TOTAL_VH;
export const METHOD_TEXT_REVEAL_END = METHOD_TEXT_VH / METHOD_TOTAL_VH;
export const METHOD_HOLD_END = (METHOD_TEXT_VH + PIXEL_HOLD_VH) / METHOD_TOTAL_VH;
