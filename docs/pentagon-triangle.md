# 正五边形到等边三角形：暂缓记录

## 已确认信息

- Smithsonian 收藏的 A. Harry Wheeler 模型（约 1932）明确是正五边形到等边三角形的 **6 块**剖分，由四个三角形和两个四边形组成。
- Greg N. Frederickson 的 *The Heptagon to the Square, and Other Wild Twists* Figure 23 给出另一种正五边形到等边三角形的 **twist-hinged** 构造；作者页面提供动画并明确称其为翻转式铰接。
- 两个来源并非已证实为同一套几何与铰链拓扑，因此不能混用。

## 缺失数据与尝试

已检索 Smithsonian 对象记录、Frederickson 的作者页面、论文书目信息以及 Cornell 对专著图示的转述。公开材料足以确认构造存在和块数，但没有同时给出：

1. 每块的精确顶点坐标或完整尺规关系；
2. 双构型中每个铰链在两侧刚体的局部坐标；
3. Figure 23 翻转轴、正反面状态及连续运动参数；
4. 可用于独立复现的源代码。

Frederickson 页面还声明动画版权受限，未经明确许可不得复制。项目不会嵌入该动画，也不会从 GIF 或截图测量后冒充精确数学坐标。

## 当前决定

案例继续保持 `geometry-pending`。下一步需要取得 Frederickson 2007 论文 Figure 23 的完整正文/尺寸说明、专著相关页，或作者提供的明确构造参数；在面积、双端覆盖、刚体、铰链与连续路径测试全部通过前不得接入正式 UI。

## 来源

- Frederickson 动画与构造说明：<https://www.cs.purdue.edu/homes/gnf/book2/mi_anims.html>
- Smithsonian Wheeler 实物模型：<https://www.si.edu/object/nmah_1075262>
