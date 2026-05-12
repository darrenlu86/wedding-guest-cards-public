# DownloadButton Component

下载卡片按钮组件,使用 html2canvas 将卡片截图并下载为 PNG 图片。

## 功能特性

- ✅ 高解析度截图 (scale: 2)
- ✅ 自动命名文件 (wedding-card-{guestName}.png)
- ✅ Loading 状态显示
- ✅ 成功/错误消息提示
- ✅ 响应式设计
- ✅ 完整的错误处理

## 使用方法

```tsx
import DownloadButton from '@/components/DownloadButton';

function MyPage() {
  return (
    <div>
      {/* 卡片元素需要有一个 ID */}
      <div id="guest-card">
        {/* 卡片内容 */}
      </div>

      {/* 下载按钮 */}
      <DownloadButton
        guestName="王小明"
        cardElementId="guest-card"
      />
    </div>
  );
}
```

## Props

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| guestName | string | 是 | 宾客姓名,用于生成文件名 |
| cardElementId | string | 是 | 要截图的卡片元素的 ID |

## 消息状态

组件会显示以下消息:

- **成功**: "下载成功" (绿色边框,3秒后自动消失)
- **错误**: "下载失败,请稍后再试" (红色边框,3秒后自动消失)
- **找不到元素**: "找不到卡片元素,请稍后再试" (红色边框,3秒后自动消失)

## 测试

组件包含完整的测试套件:

```bash
npm test -- tests/components/DownloadButton.test.tsx
```

测试覆盖:
- ✅ 按钮渲染
- ✅ 下载图标显示
- ✅ html2canvas 调用
- ✅ 文件命名
- ✅ Loading 状态
- ✅ 错误处理
- ✅ 成功消息
- ✅ 消息自动清除

## 技术细节

### html2canvas 配置

```javascript
{
  scale: 2,           // 2倍分辨率,确保图片清晰
  useCORS: true,      // 支持跨域图片
  backgroundColor: null, // 透明背景
  logging: false      // 关闭控制台日志
}
```

### 文件下载流程

1. 使用 html2canvas 截取指定元素
2. 将 canvas 转换为 PNG blob
3. 创建临时下载链接
4. 触发浏览器下载
5. 清理临时资源

## 样式类

使用全局样式类:
- `btn-primary` - 主按钮样式
- `glass-pink` - 玻璃拟态粉色背景
- `animate-scaleIn` - 缩放进入动画

## 依赖

- html2canvas: ^1.4.1
- @types/html2canvas: ^1.0.0 (开发依赖)

## 注意事项

1. 确保要截图的元素有正确的 ID
2. 如果卡片包含外部图片,确保服务器支持 CORS
3. 某些浏览器可能会阻止自动下载,需要用户交互
4. 下载的图片质量取决于卡片元素的样式和内容
