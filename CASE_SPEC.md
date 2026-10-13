# 统一案例数据规范

## 顶层字段

```js
{
  id: "稳定且唯一的字符串",
  status: "implemented | planned | geometry-pending",
  name: "菜单名称",
  shortName: "可选短名称",
  motionType: "planar-swing | flip-assisted",
  viewport: { width, height, centerX, baseY, scale },
  attribution: { text, url }, // 使用外部构造时必填
  geometry: { ... },
  challenges: { cuts, hinges },
  motion: { ... },
  teaching: { ... }
}
```

只有 `status: "implemented"` 且通过 `validateCaseDefinition` 的案例可以进入教学流程。

## geometry

- `points`：数学坐标字典，键是稳定点 ID。
- `sourceOutline`：源图形轮廓的点 ID 数组。
- `targetShape`：目标形状语义名称。
- `pieces`：动态拼块数组，每项包含 `id`、`pointIds` 和 `color`。
- `labels`：可选标签数组，包含 `pointId`、`text`、`dx`、`dy`。

点坐标必须是有限数值；拼块至少包含三个点，面积不得为零。拼块面积和必须等于源图形面积。

## challenges.cuts

```js
{
  requiredCount: 3,
  answerIds: ["JE", "DL", "KM"],
  candidates: [{ id: "JE", start: "J", end: "E", labelT: 0.5 }],
  hints: ["逐级提示"]
}
```

答案由 ID 集合定义，数组顺序没有意义。候选显示编号可随机变化，但候选 ID 不得变化。
`labelT` 可选，表示编号在割线上的相对位置，范围建议为 `[0,1]`，默认 `0.5`。多条候选线相交时应错开编号，并由渲染器保证编号点击层位于宽线点击层之上。

## challenges.hinges

```js
{
  requiredCount: 3,
  answerIds: ["D", "E", "K"],
  candidates: [{ id: "D", pointId: "D" }],
  chain: [{ id: "D", pieces: ["piece1", "piece2"] }],
  hints: ["逐级提示"]
}
```

`chain` 描述真实机械连接，而不是仅用于界面答题。后续验证应确保链连通，且每个连接点在相邻拼块的局部几何中存在。

## motion

平面摆动式案例至少包含：

- `solver`：注册过的求解器名称。
- `durationMs`：单程动画时长。
- `hingeIds`：实际显示并跟随运动的铰链。
- `hingeMap`：可选；当求解器内部铰链 ID 与案例点 ID 不同时，显式声明 `{ 求解器ID: 案例ID }` 映射。

翻转式案例还必须在未来版本加入面朝向、翻转事件、反射轴或三维过渡定义。在这些字段和数学证明完成前，状态必须保持 `geometry-pending`。

运动求解器接收案例、屏幕坐标和 `[0,1]` 进度，返回：

```js
{
  geometry: { [pieceId]: [{ x, y }, ...] },
  hinges: { [hingeId]: { x, y } }
}
```

## teaching

`teaching` 提供 `sourceName`、`targetName`、`preview`、副标题、三个阶段标签，以及各阶段的标题、说明、计数标签、提示和完成文案。`sourceName` 用于还原按钮和动态状态文案；`preview` 的 `source`、`target` 控制顶部形状图标。可使用的 HTML 仅来自仓库内受信任的静态案例配置。
