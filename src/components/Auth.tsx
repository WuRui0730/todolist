/**
 * 文件功能：认证面板组件
 * 提供用户登录和注册的表单界面，处理用户输入和模式切换。
 */
import type { Dispatch, SetStateAction } from 'react'
import type { User } from '../types'

type Props = {
  mode: 'login' | 'register'
  authForm: { username: string; password: string; confirm: string }
  setAuthForm: Dispatch<
    SetStateAction<{
      username: string
      password: string
      confirm: string
    }>
  >
  authError: string
  onLogin: () => void
  onRegister: () => void
  users: User[]
}

//身份认证系统 - 登录/注册界面组件
/**
 * 认证面板组件
 * 处理用户登录和注册逻辑
 */
export function AuthPanel({ mode, authForm, setAuthForm, authError, onLogin, onRegister }: Props) {
  return (
    <div className="auth">
      <div className="auth-card">
        <div className="auth-title">{mode === 'login' ? '登录' : '注册新账号'}</div>
        <div className="input-row">
          <label>账号</label>
          <input
            className="input"
            value={authForm.username}
            onChange={(e) => setAuthForm((f) => ({ ...f, username: e.target.value }))}
            placeholder="手机号/邮箱均可"
          />
        </div>
        <div className="input-row">
          <label>密码</label>
          <input
            className="input"
            type="password"
            value={authForm.password}
            onChange={(e) => setAuthForm((f) => ({ ...f, password: e.target.value }))}
            placeholder="输入密码"
          />
        </div>
        {mode === 'register' && (
          <div className="input-row">
            <label>确认密码</label>
            <input
              className="input"
              type="password"
              value={authForm.confirm}
              onChange={(e) => setAuthForm((f) => ({ ...f, confirm: e.target.value }))}
              placeholder="再次输入密码"
            />
          </div>
        )}
        {authError && <div className="error">{authError}</div>}
        <button className="btn" onClick={mode === 'login' ? onLogin : onRegister}>
          {mode === 'login' ? '登录' : '注册'}
        </button>
        </div>
    </div>
  )
}

