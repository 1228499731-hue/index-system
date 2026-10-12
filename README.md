# 几何变形魔法

原生 HTML、CSS、JavaScript 和 SVG 实现的铰链剖分教学软件。当前已实现经典杜德尼“等边三角形 → 正方形”案例，其他案例显示为待数学验证。

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

测试覆盖案例结构、答案验证、几何面积、刚体不变量、铰点连续性、轨迹回归和状态隔离。
