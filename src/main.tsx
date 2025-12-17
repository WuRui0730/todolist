/**
 * 文件功能：应用入口
 * React 应用的挂载点，负责渲染根组件 App 并挂载到 DOM 节点。
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
