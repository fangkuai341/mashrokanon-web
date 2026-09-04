# 后端接口文档

适用版本：`forest-memorial-api` 当前实现

## 1. 基本信息

- 基础地址：`http://localhost:8080`
- 响应格式统一为：

```json
{
  "success": true,
  "data": {}
}
```

- 失败时统一为：

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误说明"
  }
}
```

## 2. 通用约定

### 2.1 状态码

- `200`：成功
- `201`：创建成功
- `400`：参数校验失败
- `401`：未登录或登录失效
- `403`：无权限或胶囊未到开启时间
- `404`：资源不存在
- `429`：请求过于频繁
- `500`：服务器错误

### 2.2 常见错误码

- `VALIDATION_ERROR`：请求参数不合法
- `UNAUTHORIZED`：需要管理员登录
- `INVALID_TOKEN`：登录状态已失效
- `INVALID_CREDENTIALS`：账号或密码错误
- `NOT_FOUND`：资源不存在
- `RATE_LIMITED`：请求过于频繁
- `CAPSULE_LOCKED`：未到开启时间
- `INTERNAL_ERROR`：服务器内部错误

## 3. 公共接口

### 3.1 健康检查

`GET /health`

响应：

```json
{
  "ok": true
}
```

---

### 3.2 首页摘要

`GET /api/home/summary`

响应：

```json
{
  "success": true,
  "data": {
    "stats": [
      { "value": "2019–2026", "label": "七年森林旅程" },
      { "value": "216万+", "label": "粉丝记忆" },
      { "value": "9", "label": "时间轴事件" },
      { "value": "100+", "label": "留言与胶囊" }
    ],
    "notice": "非官方粉丝纪念站，内容均以尊重与纪念为前提。"
  }
}
```

---

### 3.3 时间轴列表

`GET /api/timeline`

查询参数：
- `year`：年份，默认 `all`

响应：

```json
{
  "success": true,
  "data": {
    "year": "all",
    "items": [
      {
        "date": "2019-04-30",
        "title": "初配信",
        "zh": "...",
        "ja": "...",
        "tags": ["里程碑"],
        "link": "https://www.bilibili.com/video/...",
        "featured": true
      }
    ]
  }
}
```

说明：
- 时间轴数据来自 `TimelineEvent` 表，仅展示管理员录入或投稿审核通过后入库的事件
- `link`：出处外链（B 站切片 / 原文），可为 `null`

---

### 3.4 贡献榜

`GET /api/rank`

响应：

```json
{
  "success": true,
  "data": {
    "items": [
      { "name": "守林人 · 小K", "count": 8 },
      { "name": "白菜考古队", "count": 5 }
    ]
  }
}
```

---

### 3.5 投稿提交

「足迹时间轴」共建投稿：提交的内容即一条**拟新增的时间轴事件**，字段对应 `TimelineEvent` 表；提交后进入 `pending` 待审状态，站长审核通过后才写入时间轴并公开展示。

请求体：

```json
{
  "date": "2021-06-01",
  "title": "生日回读信环节",
  "zh": "举例说明：生日直播读粉丝来信。",
  "ja": "誕生日配信でファンレターを読む。",
  "tags": ["生日", "名场面"],
  "source": "https://www.bilibili.com/video/xxx",
  "name": "旅人昵称"
}
```

字段说明（对应 `CommunitySubmission` 表 / 时间轴事件字段）：
- `date`：事件日期，必填，格式 `YYYY-MM-DD`，对应时间轴 `date`
- `title`：事件标题，必填，最长 `80` 字
- `zh`：中文描述，必填，最长 `3000` 字
- `ja`：日文描述，可选，最长 `3000` 字
- `tags`：标签数组，可选，每项最长 `20` 字，最多 `10` 个
- `source`：素材链接 / 出处，可选，最长 `300` 字；审核通过后写入时间轴的 `link` 字段
- `name`：投稿署名，可选，最长 `40` 字；为空视为 `匿名`，计入贡献榜

成功响应：

```json
{
  "success": true,
  "data": {
    "id": "cmt...",
    "date": "2021-06-01T00:00:00.000Z",
    "title": "生日回读信环节",
    "zh": "举例说明：生日直播读粉丝来信。",
    "ja": "誕生日配信でファンレターを読む。",
    "tagsJson": ["生日", "名场面"],
    "source": "https://www.bilibili.com/video/xxx",
    "submitter": "旅人昵称",
    "status": "pending",
    "reason": null,
    "reviewedById": null,
    "reviewedAt": null
  }
}
```

失败响应：

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "提交过于频繁"
  }
}
```

限制：
- 新投稿默认 `status = pending`，进入后台审核队列
- 同一客户端每分钟最多提交 5 次
- 参数校验失败返回 `400 VALIDATION_ERROR`

---

## 4. 记忆墙接口

### 4.1 获取留言列表

`GET /api/memory-letters`

查询参数：
- `tag`：标签筛选，支持 `思念`、`感谢`、`祝福`、`故事`、`其他`
- `sort`：`new` 或 `hot`
- `limit`：返回数量，默认 `20`，最大 `50`
- `offset`：偏移量，默认 `0`

只返回 `approved` 的留言。

响应：

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clx...",
        "nickname": "匿名旅人",
        "content": "辛苦了，白菜。",
        "tag": "感谢",
        "status": "approved",
        "isAnonymous": true,
        "lightsCount": 12,
        "createdAt": "2026-05-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

### 4.2 创建留言

`POST /api/memory-letters`

请求体：

```json
{
  "nickname": "旅人",
  "content": "谢谢你",
  "tag": "感谢",
  "isAnonymous": false
}
```

字段说明：
- `nickname`：昵称，可空；匿名时会自动改写为 `匿名旅人`
- `content`：留言内容，最长 `500` 字
- `tag`：标签，必填
- `isAnonymous`：是否匿名，默认 `false`

成功响应：

```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "nickname": "旅人",
    "content": "谢谢你",
    "tag": "感谢",
    "status": "pending"
  }
}
```

说明：
- 新留言默认进入 `pending`
- 留言需要后端审核后才会出现在公共列表
- 同一客户端每分钟最多提交 5 次

---

### 4.3 给留言点灯

`POST /api/memory-letters/:id/light`

路径参数：
- `id`：留言 ID

成功响应：

```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "lightsCount": 13
  }
}
```

限制：
- 仅已通过审核的留言可点灯
- 同一客户端对同一留言每分钟最多 20 次

---

## 5. 时光胶囊接口

### 5.1 获取公开胶囊列表

`GET /api/capsules`

只返回已解锁且允许公开的胶囊。

响应：

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clx...",
        "title": "致一年后的自己",
        "unlockAt": "2027-05-01T00:00:00.000Z",
        "status": "unlocked",
        "isPublicAfterUnlock": true,
        "content": "一年后的我，你还好吗？",
        "openedAt": "2027-05-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

### 5.2 获取胶囊详情

`GET /api/capsules/:id`

路径参数：
- `id`：胶囊 ID

说明：
- 未到开启时间时，`content` 为 `null`
- 到期且已解锁后，返回解密后的正文

---

### 5.3 创建胶囊

`POST /api/capsules`

请求体：

```json
{
  "title": "致未来",
  "contentEncrypted": "base64(iv|tag|密文)",
  "key": "base64 密钥（可选）",
  "unlockAt": "2027-05-01T00:00:00.000Z",
  "email": "you@example.com",
  "isPublicAfterUnlock": false
}
```

字段说明：
- `title`：标题，最长 `30` 字
- `contentEncrypted`：在浏览器端加密后的正文（AES-256-GCM，格式 `base64(iv(12) | tag(16) | ciphertext)`），最长 `5000` 字符
- `key`：解密这把胶囊的随机密钥（base64，24~512 字符），可选
  - 传入 `key`：站点用主密钥包裹后保存（`keyEncrypted`），到期后站点可代为解密
  - 不传 `key`：站点不保存密钥，正文对站点也不可读；到期开启时必须通过 `unlock` 接口回传这把密钥
- `unlockAt`：解锁时间，ISO 时间字符串
- `email`：提醒邮箱，可选
- `isPublicAfterUnlock`：解锁后是否公开展示；为 `true` 时必须同时提供 `key`，否则返回 `400 KEY_REQUIRED`

成功响应：

```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "title": "致未来",
    "unlockAt": "2027-05-01T00:00:00.000Z",
    "status": "sealed",
    "isPublicAfterUnlock": false,
    "content": null,
    "openedAt": null,
    "hasKey": true
  }
}
```

限制：
- 同一客户端每分钟最多创建 3 次
- 正文以密文形式存储；站点只能解密「保存了密钥」的胶囊

---

### 5.4 解锁胶囊

`POST /api/capsules/:id/unlock`

请求体（可选）：

```json
{
  "key": "保存密钥时弹窗展示的密钥"
}
```

说明：
- 仅当当前时间晚于 `unlockAt` 才能解锁，未到时间返回 `403`
- 若胶囊未保存密钥（创建时未传 `key`），必须回传正确的 `key` 才能解锁：
  - 未传密钥返回 `400 KEY_REQUIRED`
  - 密钥错误返回 `400 INVALID_KEY`

成功响应：

```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "title": "致未来",
    "unlockAt": "2027-05-01T00:00:00.000Z",
    "status": "unlocked",
    "isPublicAfterUnlock": false,
    "content": "你好",
    "openedAt": "2027-05-01T00:00:00.000Z",
    "hasKey": true
  }
}
```

---

### 5.5 公开胶囊

`POST /api/capsules/:id/publish`

说明：
- 目前实现为公开标记接口
- 成功后会把胶囊标记为允许公开

---

## 6. 后台接口

### 6.1 管理员登录

`POST /api/admin/login`

请求体：

```json
{
  "username": "admin",
  "password": "your-password"
}
```

成功响应：

```json
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "admin": {
      "id": "clx...",
      "username": "admin",
      "nickname": "守林人",
      "role": "super_admin"
    }
  }
}
```

---

### 6.2 获取当前管理员信息

`GET /api/admin/me`

请求头：

```http
Authorization: Bearer <token>
```

成功响应：

```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "username": "admin",
    "role": "super_admin",
    "nickname": "守林人"
  }
}
```

---

### 6.3 获取待审留言

`GET /api/admin/memory-letters`

请求头：

```http
Authorization: Bearer <token>
```

说明：
- 返回所有 `pending` 留言

---

### 6.4 审核通过留言

`POST /api/admin/memory-letters/:id/approve`

请求头：

```http
Authorization: Bearer <token>
```

成功后留言状态变为 `approved`，并写入审核日志。

---

### 6.5 拒绝留言

`POST /api/admin/memory-letters/:id/reject`

请求体：

```json
{
  "reason": "内容不符合规范"
}
```

请求头：

```http
Authorization: Bearer <token>
```

成功后留言状态变为 `rejected`，并写入审核日志。

---

### 6.6 投稿审核列表

`GET /api/admin/submissions`

请求头：

```http
Authorization: Bearer <token>
```

查询参数：
- `status`：`pending`（默认）| `approved` | `rejected`

响应 `data.items` 为投稿数组，含 `date`（`YYYY-MM-DD`）、`title`、`zh`、`ja`、`tags`、`source`、`submitter`、`status`、`reason`。

---

### 6.7 审核通过投稿

`POST /api/admin/submissions/:id/approve`

请求头：

```http
Authorization: Bearer <token>
```

说明：
- 仅 `pending` 状态的投稿可操作；已处理的投稿返回 `400 ALREADY_REVIEWED`
- 通过后自动把投稿写入 `TimelineEvent`（`featured=false`，`source` 作为 `link`），投稿置为 `approved`，公开展示
- 若该日期下已存在相同标题的事件，返回 `409 DUPLICATE_TIMELINE_EVENT`，不会重复入库
- 写入审计日志，`targetType = submission`，`action = approve`

---

### 6.8 驳回投稿

`POST /api/admin/submissions/:id/reject`

请求体：

```json
{
  "reason": "无法溯源，暂不采纳"
}
```

请求头：

```http
Authorization: Bearer <token>
```

成功后投稿状态变为 `rejected`，并写入审核日志。

---

### 6.9 胶囊列表（后台）

`GET /api/admin/capsules`

请求头：

```http
Authorization: Bearer <token>
```

查询参数：
- `status`：可选，`sealed` | `unlocked` | `hidden`

响应 `data.items` 为胶囊数组，每项包含：

```json
{
  "id": "clx...",
  "title": "致未来",
  "contentEncrypted": "base64(iv|tag|密文)",
  "key": "base64 明文密钥（未保存时为 null）",
  "hasKey": true,
  "email": "you@example.com",
  "unlockAt": "2027-05-01T00:00:00.000Z",
  "isPublicAfterUnlock": false,
  "status": "sealed",
  "openedAt": null,
  "createdAt": "2026-09-01T00:00:00.000Z"
}
```

说明：
- `key` 仅在站点保存过密钥时返回（供后台展示与复制）；是否到期由调用方用 `unlockAt` 判断

---

### 6.10 解密预览胶囊内容（后台）

`POST /api/admin/capsules/:id/preview`

请求头：

```http
Authorization: Bearer <token>
```

说明：
- 用站点保存的密钥解密正文，供站长审核
- 未保存密钥返回 `400 NO_STORED_KEY`；解密失败返回 `400 DECRYPT_FAILED`

成功响应：

```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "content": "解密后的正文"
  }
}
```

---

### 6.11 展示到网站（后台）

`POST /api/admin/capsules/:id/publish`

请求头：

```http
Authorization: Bearer <token>
```

说明：
- 将胶囊置为 `unlocked` 且 `isPublicAfterUnlock = true`，使其出现在前台 `GET /api/capsules` 列表中
- 未保存密钥返回 `400 NO_STORED_KEY`；未到开启时间返回 `400 CAPSULE_LOCKED`
- 成功后写入审计日志（`action: publish`）

---

## 7. 站点数据模型简述

### 7.1 留言

主要字段：
- `id`
- `nickname`
- `content`
- `tag`
- `status`
- `isAnonymous`
- `lightsCount`
- `createdAt`

### 7.2 胶囊

主要字段：
- `id`
- `title`
- `contentEncrypted`（VARCHAR(5000)，浏览器端 AES-256-GCM 密文）
- `keyEncrypted`（VARCHAR(500) 可空，站点保存密钥时为主密钥包裹后的密文；为空表示站点未保存密钥）
- `unlockAt`
- `email`
- `isPublicAfterUnlock`
- `status`
- `openedAt`

### 7.3 审核与日志

主要表：
- `adminuser`
- `auditlog`
- `sitesetting`
- `capsuleevent`

## 8. 前端对接建议

- 首页调用 `/api/home/summary`
- 时间轴调用 `/api/timeline`
- 记忆墙调用 `/api/memory-letters`、`POST /api/memory-letters`、`POST /api/memory-letters/:id/light`
- 时光胶囊调用 `/api/capsules`、`GET /api/capsules/:id`、`POST /api/capsules/:id/unlock`
- 投稿中心调用 `/api/rank` 和 `/api/submissions`
- 后台登录调用 `/api/admin/login`
- 管理审核调用 `/api/admin/memory-letters` 及审核接口

## 9. 备注

当前接口为 MVP 实现，后续还会扩展：
- 双语内容字段完善
- 胶囊邮件提醒与解锁仪式页
- 更多后台内容管理接口
- 投稿通过前的敏感词过滤与防刷校验
