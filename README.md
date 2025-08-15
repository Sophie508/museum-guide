Museum Guide

一个基于 Next.js 的博物馆导览应用。

### 数据同步与清洗

项目中使用的藏品清单文件为：`public/inventoryDataBase.json`。

- 清洗行分隔新数据（将 `newdata.json` 转换为统一结构）：

```bash
pnpm run transform:newdata
```

- 合并新数据并覆盖公开文件：

```bash
pnpm run merge:inventory
```

转换与合并脚本：
- `scripts/transform-newdata.mjs`
- `scripts/merge-inventory.mjs`

生成的中间文件：
- `data/newInventoryData.json`

### 开发

```bash
pnpm i
pnpm dev
```

### 发布（打标签）

为当前代码创建一个带注释的版本标签并推送：

```bash
git tag -a v0.1.0 -m "Release v0.1.0: merge new collection data; add transform/merge scripts"
git push origin v0.1.0
```

随后可在 GitHub Releases 页面基于该标签创建 Release，并粘贴上述说明。

### 变更记录（Changelog）

#### v0.1.0
- 合并新的藏品数据到 `public/inventoryDataBase.json`
- 新增数据清洗与合并脚本：`transform-newdata.mjs`, `merge-inventory.mjs`
- 新增 `package.json` 脚本：`transform:newdata`, `merge:inventory`


