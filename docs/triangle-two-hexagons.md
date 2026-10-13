# 等边三角形到两个正六边形：数学与实现说明

## 来源与许可

模型来自 Izidor Hafner 与 Greg N. Frederickson 的 Wolfram Demonstrations Project 案例 *Hinged Dissection of an Equilateral Triangle into Two Hexagons*（2011）。页面公开 Source Notebook，内容采用 CC BY-NC-SA；本项目仅独立转写其数学坐标和刚体旋转，不嵌入原动画。

原始页面：<https://demonstrations.wolfram.com/HingedDissectionOfAnEquilateralTriangleIntoTwoHexagons/>

## 几何模型

取源等边三角形顶点 `(-1,0)`、`(1,0)`、`(0,√3)`，边长为 `2`、面积为 `√3`。它被分成 6 块：四个三角形、一个四边形和一个凹六边形。终态为两个全等正六边形，每个边长 `1/√3`、面积 `√3/2`，总面积仍为 `√3`。

5 个铰链构成一棵树：

```text
triangle1 —A— triangle3 —D— delta
                    |
                    C
                    |
                 hexagon —F— triangle4 —I— triangle2
```

## 运动学

源码的两个参数被改写成连续的顺序教学路径：

1. 前半程：`delta` 绕 D 转 `π`；`triangle2` 绕 I 转 `5π/3`。
2. 后半程：`triangle1` 绕 A 转 `-4π/3`；右侧 `triangle4 + triangle2` 子链绕 F 转 `4π/3`。

两段均使用 smoothstep 调速；每个拼块始终只接受二维刚体变换。中点两段共享同一构型，因此路径连续。

## 验证结果

- 面积守恒：通过；
- 初态并集覆盖等边三角形：通过；
- 终态两个分组分别覆盖两个正六边形：通过；
- 101 个采样时刻刚体边长与面积不变：通过；
- 101 个采样时刻 5 组铰点重合：通过；
- 1001 个采样时刻连续性检查：通过；
- 1001 个采样时刻全部拼块两两重叠检查：最大正面积约 `6.7e-16`，视为数值舍入，路径按容差无碰撞。

研究模型位于 `src/cases/research/triangle-two-hexagons.js`，正式案例位于 `src/cases/triangle-two-hexagons.js`，测试位于 `tests/triangle-two-hexagons-*.test.js`。
