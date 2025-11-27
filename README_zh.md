简体中文 | [English](/README.md)

# 🎨 Cookie管理小工具 (Cookie Manager)

<div align="center">
  <img src="/public/example.png" alt="Cookie Manager Extension" width="400"/>
  <br>
  <br>
</div>

---

一款功能强大的浏览器扩展，用于管理网站Cookie，支持新增、编辑、删除、清空以及批量导入Cookie功能。

## 功能特点

- 🍪 **Cookie管理**：查看、添加、编辑和删除任何网站的Cookie
- ⚡ **批量导入**：支持通过JSON格式批量导入多个Cookie
- 🌍 **国际化支持**：支持中英文切换（默认英文）
- 🔍 **搜索功能**：通过名称快速查找Cookie
- 🌐 **域名支持**：跨不同域名和子域名管理Cookie
- ⚡ **批量操作**：一键清空所有Cookie
- 🎨 **现代UI**：简洁直观的卡片式弹出界面
- 🔒 **高级选项**：支持Secure、HttpOnly和SameSite属性
- 📅 **过期控制**：为Cookie设置自定义过期时间
- 🔄 **实时更新**：即时刷新Cookie列表

## 安装方法

### Chrome/Edge浏览器
1. 下载或克隆此仓库
2. 打开Chrome/Edge浏览器，访问 `chrome://extensions/` 或 `edge://extensions/`
3. 在右上角启用"开发者模式"
4. 点击"加载已解压的扩展程序"，选择扩展目录
5. 扩展图标将出现在浏览器工具栏中

### Firefox浏览器
1. 下载或克隆此仓库
2. 打开Firefox浏览器，访问 `about:debugging`
3. 点击"此Firefox" → "临时载入附加组件"
4. 从扩展目录中选择 `manifest.json` 文件
5. 扩展将被临时加载

## 使用方法

1. **打开扩展**：点击浏览器工具栏中的Cookie图标
2. **查看Cookie**：弹出窗口将显示当前网站的所有Cookie
3. **切换语言**：点击顶部的"中文 / EN"按钮切换语言
4. **搜索Cookie**：使用搜索框按名称过滤Cookie
5. **添加新Cookie**：点击"+ 新增Cookie"按钮并填写详细信息
6. **批量导入**：点击"批量导入"按钮，输入JSON数据 (格式: `[{"name":"c1","value":"v1"},...]`)
7. **编辑Cookie**：点击任何现有Cookie以修改其属性
8. **删除Cookie**：点击Cookie旁边的删除按钮
9. **清空所有**：使用"清空所有"按钮删除当前站点的所有Cookie
10. **刷新**：点击"刷新"更新Cookie列表

## Cookie属性

添加或编辑Cookie时，可以配置以下属性：

- **名称**：Cookie标识符（必填）
- **值**：Cookie数据（必填）
- **域名**：Cookie域名范围
- **路径**：Cookie有效的URL路径
- **过期时间**：过期日期和时间
- **Secure**：仅通过HTTPS传输
- **HttpOnly**：防止客户端访问
- **SameSite**：CSRF保护级别（无/Lax/严格）
- **会话Cookie**：创建仅会话的Cookie

## 权限要求

扩展需要以下权限：

- `cookies`：访问和修改浏览器Cookie
- `activeTab`：访问当前标签页信息
- `storage`：存储扩展设置（如语言偏好）
- `*://*/*`：访问所有网站的Cookie

## 开发信息

### 文件结构
```
cookie-manager-extension/
├── manifest.json          # 扩展清单文件
├── background.js          # 后台服务工作线程
├── popup.html            # 弹出界面
├── popup.css             # 弹出样式
├── popup.js              # 弹出功能
├── icon16.png            # 16x16扩展图标
├── icon48.png            # 48x48扩展图标
└── icon128.png           # 128x128扩展图标
```

### 使用技术
- HTML5、CSS3、JavaScript (ES6+)
- Chrome扩展清单V3
- 浏览器Cookie API

## 浏览器支持

- ✅ Chrome（清单V3）
- ✅ Edge（清单V3）
- ⚠️ Firefox（清单V2/V3 - 可能需要调整）

## 隐私与安全

- 所有Cookie操作都在您的浏览器本地执行
- 不会向外部服务器发送任何数据
- 扩展仅访问您访问的网站Cookie
- 遵循浏览器扩展安全最佳实践

## 贡献指南

1. Fork此仓库
2. 创建功能分支（`git checkout -b feature/amazing-feature`）
3. 提交更改（`git commit -m '添加一些 amazing 功能'`）
4. 推送到分支（`git push origin feature/amazing-feature`）
5. 打开拉取请求

## 许可证

此项目采用MIT许可证 - 详见[LICENSE](LICENSE)文件。

## 支持

如果您遇到任何问题或有疑问，请在GitHub上打开问题。

---

**注意**：此扩展专为开发人员和高级用户设计，用于测试和开发目的管理Cookie。在生产网站上修改Cookie时请务必谨慎。
