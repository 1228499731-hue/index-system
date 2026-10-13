# 几何变形魔法

原生 HTML、CSS、JavaScript 和 SVG 实现的铰链剖分教学软件。当前已实现并验证五个案例：杜德尼“等边三角形 → 正方形”、Loyd“希腊十字形 → 正方形”、“正六边形 → 正方形”、“正六边形 → 等边三角形”和“等边三角形 → 两个正六边形”；其余案例继续显示为待数学验证。

## 运行

ES Modules 需要通过本地 HTTP 服务加载，不能直接双击 `index.html`：

```bash
python3 -m http.server 8000
```

然后访问 `http://localhost:8000/`。

## 测试

需要 Node.js 20 或更高版本：

```bash
npm test
```

也可直接运行：

```bash
node --test
```

测试覆盖案例结构、答案验证、初末覆盖、几何面积、刚体不变量、铰点连续性、无正面积重叠、运动连续性、轨迹回归和状态隔离。

Loyd 案例依据 Izidor Hafner 与 Greg N. Frederickson 的 Wolfram Demonstrations 构造独立实现，来源材料采用 CC BY-NC-SA 3.0；详细来源、许可与验证记录见 `docs/new-case-feasibility.md`。
