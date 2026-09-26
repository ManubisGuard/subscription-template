# ManubisGuard 订阅模板

面向 **ManubisGuard Panel** 的现代响应式订阅页面模板。

界面采用与 ManubisGuard Panel 相同的 Cyber Pulse 视觉系统，包括深色基础、玻璃质感、紫色主色、Mint/Cyan 辅色、环境光和细网格。

## 功能

- 深色、浅色和系统主题
- English、فارسی、中文、Русский
- 流量统计
- 订阅与配置链接
- 一键复制与 QR Code
- WireGuard 配置下载
- 应用导入与下载
- 公告和支持链接
- 响应式 Single-file HTML

## 安装

```sh
curl -fsSL https://raw.githubusercontent.com/ManubisGuard/subscription-template/main/install.sh | sudo bash -s -- --lang zh
```

安装文件：

```text
/var/lib/manubisguard/templates/subscription/index.html
```

Panel 配置：

```text
/opt/manubisguard-panel/.env
```

```dotenv
CUSTOM_TEMPLATES_DIRECTORY="/var/lib/manubisguard/templates/"
SUBSCRIPTION_PAGE_TEMPLATE="subscription/index.html"
```

重启：

```sh
sudo manubis restart
```

## 源码构建

```sh
git clone https://github.com/ManubisGuard/subscription-template.git
cd subscription-template
bun install
bun run build
```

输出文件为 `dist/index.html`。

## 设计系统

ManubisGuard Cyber Pulse：`#05060B`、`#6667FD`、`#66F0D1`、`#9B5CFF`，玻璃表面、环境渐变、Cyber Grid 和柔和 Glow。

## 仓库

https://github.com/ManubisGuard/subscription-template
https://github.com/ManubisGuard/ManubisGuard-Panel
