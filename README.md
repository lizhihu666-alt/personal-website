# Leo Hu · 个人作品集

跨境项目经理 & 产品运营 Leo Hu（胡利致）的个人网站。首页是「职业 / 生活」二选一的入口，进入后分别是：

- **职业页（Work）**：滚动叙事式的成果、方法论、精选项目、经历与联系方式
- **生活页（Life）**：兴趣、摄影、旅行与生活

线上地址：https://leo-hu-portfolio.vercel.app

## 技术栈

- React 19 + TypeScript + Vite 6
- Tailwind CSS 4
- GSAP（ScrollTrigger、SplitText、MorphSVG）+ Lenis 平滑滚动
- three.js / ogl / vgpu：线条动画与首页背景特效

## 本地运行

需要 Node.js 18+。

```bash
npm install
npm run dev
```

默认在 http://localhost:3000 打开。

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建，输出到 `dist/` |
| `npm run preview` | 本地预览生产构建 |
| `npm run lint` | TypeScript 类型检查（`tsc --noEmit`） |

## 目录结构

```
src/
  App.tsx            加载页、模式切换、Lenis 初始化
  components/
    home/            首页双入口
    work/            职业页各板块
    life/            生活页
    effects/         加载页、AeroShards 等特效
    navigation/      顶栏与阅读进度
  data/              简历与项目内容
  utils/             GSAP 注册等工具
```

## 部署

推送到 `main` 后由 Vercel 自动构建部署，无需额外环境变量。
