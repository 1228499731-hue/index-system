# 新案例可行性研究

## 结论摘要

第一优先级来源提供了足够完整的数学数据。其 Mathematica Source Notebook 已成功取得，包含两套希腊十字形到正方形的四块平面摆动式剖分：Lemon 构造和 Loyd 构造。

两套构造均已独立重写为不依赖 Mathematica 的 JavaScript 研究模型，并通过核心数学测试。推荐优先实现 **Loyd's Greek Cross to Square**，原因是四块全等、三个铰链均位于清楚可辨认的顶点、全部终端转角均为 `π`，更适合教学和交互候选点设计。

Loyd 构造现已转换为正式案例配置并注册到案例菜单，沿用三阶段教学流程；SVG 动画使用独立 JavaScript 刚体变换，未嵌入原始 Wolfram 动画。Lemon 构造继续保留为已验证研究模型，暂不加入菜单。

## 候选一：Two Hinged Dissections of a Greek Cross to a Square

### 1. 数学来源及引用

- Izidor Hafner and Greg N. Frederickson (2011), “Two Hinged Dissections of a Greek Cross to a Square”, Wolfram Demonstrations Project：
  <https://demonstrations.wolfram.com/TwoHingedDissectionsOfAGreekCrossToASquare/>
- Wolfram Demonstrations Project 使用条款：
  <https://www.wolfram.com/legal/terms/wolfram-demonstrations-project.html>
- Demonstration 引用的原始书目：Greg N. Frederickson, *Hinged Dissections: Swinging & Twisting*, Cambridge University Press, 2002。

### 2. 原始源码是否成功取得

成功。

Wolfram 页面元数据公开了 Source Notebook 的下载地址。本次取得的文件信息为：

```text
格式：Wolfram Notebook，ASCII 文本，未编码隐藏
大小：554868 bytes
SHA-256：e07cdd6ef17956e7fff468bcef3a9acbb324f29a14ae08b8968a2f184e91f354
```

Notebook 中的 `Manipulate` 源码与页面公开的 “Copy Manipulate to Clipboard” 内容一致。没有把原始动画、快照或 notebook 嵌入项目；项目中的 JavaScript 文件是对多边形和刚体旋转关系的独立实现。

### 3. 顶点与铰链数据完整程度

#### Lemon 构造

源码直接给出四个刚体的全部顶点：

```text
heptagon = [(0,0),(1,-1/2),(1,0),(2,0),(2,1),(1,1),(1,2)]
hexagon  = [(0,0),(1,2),(0,2),(0,1),(-1,1),(-1,1/2)]
trapezoid= [(0,0),(0,-1),(1,-1),(1,-1/2)]
triangle = [(0,0),(-1,1/2),(-1,0)]
```

铰链没有以独立邻接表声明，但可以由嵌套 `Rotate` 的共同旋转中心无歧义地恢复：

```text
hexagon —(1,2)— heptagon —(1,-1/2)— trapezoid —(0,0)— triangle
```

因此是四刚体、三铰链的开链，而不是闭环。

#### Loyd 构造

源码先定义一个六边形块，再绕原点旋转 `0, π/2, π, 3π/2` 生成四个全等刚体。独立实现将这些坐标展开为四组精确半整数坐标。

基础块为：

```text
[(0,0),(-1/2,-1),(-1/2,-3/2),(1/2,-3/2),(1/2,-1/2),(1,-1/2)]
```

铰链拓扑为：

```text
pieceB —(1,-1/2)— pieceA —(-1/2,-1)— pieceD —(-1,1/2)— pieceC
```

同样是四刚体、三铰链的开链。

结论：两套构造的顶点数据完整；铰链关系虽不是单独的数据表，但能够由每个刚体的旋转中心和嵌套层次完整恢复。

### 4. 初始构型、目标构型和运动参数

两个源码控制量均为：

```text
k  ∈ [0,1]  // move 1
k1 ∈ [0,1]  // move 2
```

`k = k1 = 0` 是希腊十字形，`k = k1 = 1` 是正方形。

#### Lemon 刚体变换

```text
heptagon:  固定
hexagon:   绕 (1,2) 旋转 -(3π/2)k
triangle:  先绕 (0,0) 旋转 (π/2)k
trapezoid 与 triangle 组成的子链：再绕 (1,-1/2) 旋转 πk1
```

终态正方形顶点为：

```text
[(0,0),(2,-1),(3,1),(1,2)]
```

边长为 `√5`，面积为 `5`。

#### Loyd 刚体变换

```text
pieceA: 固定
pieceB: 绕 (1,-1/2) 旋转 -πk
pieceC: 先绕 (-1,1/2) 旋转 πk
pieceD 与 pieceC 组成的子链：再绕 (-1/2,-1) 旋转 πk1
```

终态正方形顶点为：

```text
[(0,0),(2,-1),(1,-3),(-1,-2)]
```

边长同样为 `√5`，面积为 `5`。

原 notebook 提供两个独立滑块，没有规定唯一的时间轴。研究模型采用可复现的顺序路径：

```text
0 ≤ t ≤ 1/2: k = 2t, k1 = 0
1/2 ≤ t ≤ 1: k = 1,  k1 = 2t - 1
```

该路径在 `t = 1/2` 位置连续；每段都是旋转矩阵中正弦、余弦的连续函数。

### 5. 是否属于平面摆动式机构

是。

源码只使用二维 `Rotate`，没有 `ReflectionTransform`、三维旋转、翻面状态或镜像矩阵。每个分块只进行绕铰点的二维刚体旋转，因此应标记为 `planar-swing`，不能作为 twist-hinged 案例处理。

### 6. JavaScript 独立复现难度

整体难度：低到中等。

- 顶点均为整数或半整数，不需要拟合图像。
- 所有终端转角都是 `π/2`、`π` 或 `3π/2` 的整数倍。
- 铰链拓扑是简单的四块开链。
- 二维变换可直接使用 `p' = R(θ)(p-h)+h`。
- 需要保留嵌套刚体层次；对下游刚体不能只移动顶点而忽略父级旋转。
- 两个独立控制量需要映射为单一教学动画进度；当前顺序路径已经验证可用，但并非来源声称的唯一运动路径。

独立研究实现位于：

- `src/cases/research/greek-cross-square.js`
- `src/geometry/coverage.js`
- `tests/greek-cross-square-research.test.js`

Loyd 的正式配置位于 `src/cases/greek-cross-square-loyd.js`，研究模块仍作为数学真值与测试依据保留。

### 7. 几何验证结果

覆盖验证不是只比较面积。验证流程为：

1. 对每个简单多边形作耳切三角剖分。
2. 使用凸多边形裁剪计算三角形交面积。
3. 分别计算分块落在目标外部的面积。
4. 计算所有分块对之间的正面积重叠。
5. 同时验证分块面积和与目标面积相等。

#### Lemon 构造

| 验证项 | 结果 |
| --- | --- |
| 初态面积：分块 / 十字形 | `5 / 5`，通过 |
| 终态面积：分块 / 正方形 | `5 / 5`，通过 |
| 初态覆盖、无越界、无正面积重叠 | 通过 |
| 终态覆盖、无越界、无正面积重叠 | 通过 |
| 101 个时刻的边长和面积刚性 | 通过 |
| 101 个时刻的 3 组铰点重合 | 通过 |
| 101 个时刻的分块无正面积重叠 | 通过 |
| 1001 个时刻的位移连续性检查 | 通过 |

#### Loyd 构造

| 验证项 | 结果 |
| --- | --- |
| 初态面积：分块 / 十字形 | `5 / 5`，通过 |
| 终态面积：分块 / 正方形 | `5 / 5`，通过 |
| 初态覆盖、无越界、无正面积重叠 | 通过 |
| 终态覆盖、无越界、无正面积重叠 | 通过 |
| 101 个时刻的边长和面积刚性 | 通过 |
| 101 个时刻的 3 组铰点重合 | 通过 |
| 101 个时刻的分块无正面积重叠 | 通过 |
| 1001 个时刻的位移连续性检查 | 通过 |

数值测试容差为 `1e-7`。离散采样只是数值证据；连续性同时来自上述分段旋转公式及两段在 `t=1/2` 的共同构型。

### 8. 已确认的问题和许可要求

#### 技术问题

- 原来源没有单独声明铰链邻接表，需要从旋转层次恢复；当前恢复结果已通过铰点重合测试。
- 原来源使用两个可独立拖动的参数，正式产品需要明确采用顺序路径还是其他经过验证的联合路径。
- Lemon 构造的第一块名称 `heptagon` 只是源码变量名；它是七顶点拼块，不是正七边形。
- 当前只验证数学层，不包含候选割线、错误选项、教学文案或 SVG 布局。

#### 许可

页面明确标记为 **CC BY-NC-SA**；Wolfram 的正式条款指定为 **Creative Commons Attribution–NonCommercial–ShareAlike 3.0 Unported**。

因此允许非商业复制和改编，但至少必须：

1. 署名 Izidor Hafner 和 Greg N. Frederickson。
2. 标明作品标题、原始页面链接和 CC BY-NC-SA 3.0 链接。
3. 明确说明 JavaScript 版本做过修改和独立重写。
4. 改编内容以相同许可证发布。
5. 不用于商业目的；商业使用需要另行取得许可。

建议在正式案例文件、界面“资料来源”区域和项目许可证说明中同时保留署名。不能把 Wolfram 动画直接嵌入后再修改其功能；本项目应继续使用独立 JavaScript 几何模型。

## 第二优先级候选

### A. Hinged Dissection of an Equilateral Triangle into Two Hexagons

页面确认存在公开 Source Notebook，作者为 Izidor Hafner 和 Greg N. Frederickson，许可同为 CC BY-NC-SA：
<https://demonstrations.wolfram.com/HingedDissectionOfAnEquilateralTriangleIntoTwoHexagons/>

由于第一优先级已经取得完整坐标并通过核心验证，按照任务给定的优先级条件，本轮没有继续下载和分析该 notebook 的数学模型。其状态仍为“待研究”，不能视为已验证案例。

### B. Hinged Dissections of a Hexagram and a Hexagon

页面同样确认存在公开 Source Notebook，作者为 Izidor Hafner 和 Greg N. Frederickson，许可为 CC BY-NC-SA：
<https://demonstrations.wolfram.com/HingedDissectionsOfAHexagramAndAHexagon/>

本轮未进入源码与几何验证阶段，状态为“待研究”。

## 推荐优先实现的案例

推荐：**Loyd's Greek Cross to Square**。

推荐理由：

1. 四块全等，数据量和教学认知负担较低。
2. 三个铰链形成简单开链，适合现有平面摆动模型扩展。
3. 顶点与铰链全部是整数或半整数坐标。
4. 运动只含两个 `π` 转动阶段，动画参数化直接。
5. 初态覆盖、终态覆盖、面积、刚性、铰链、无重叠和连续性检查均已通过。

正式接入已经完成：案例配置、具有几何意义的候选割线与铰点、通用 `planar-swing` 求解、动态教学文案、案例切换与重置均已实现。自动化核心数学测试与浏览器三阶段流程均已实际运行通过，界面及仓库文档保留作者、来源与 CC BY-NC-SA 3.0 署名。

许可文本：<https://creativecommons.org/licenses/by-nc-sa/3.0/>

