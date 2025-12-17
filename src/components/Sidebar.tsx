import type { Page } from '../types'
import { iconMap } from '../constants'

type Props = {
  currentUser: string
  page: Page
  setPage: (p: Page) => void
  onSearch: () => void
  onLogout: () => void
}

export function Sidebar({ currentUser, page, setPage, onSearch, onLogout }: Props) {
  return (
    <aside className="sidebar">
      <div className="avatar" onClick={() => setPage('profile')} title="个人页">
        {currentUser.slice(0, 1).toUpperCase()}
      </div>
      {(['todo', 'count', 'settings'] as Page[]).map((key) => (
        <div
          key={key}
          className={`nav-item ${page === key ? 'active' : ''}`}
          onClick={() => setPage(key)}
          title={key === 'todo' ? '待办' : key === 'count' ? '统计' : '设置'}
        >
          <img src={iconMap[key === 'count' ? 'count' : key === 'settings' ? 'settings' : 'todo']} alt={key} />
        </div>
      ))}
      <div
        className={`nav-item ${false ? 'active' : ''}`}
        onClick={onSearch}
        title="搜索"
      >
        <img src={iconMap.search} alt="search" />
      </div>
      <div className="nav-item" onClick={onLogout} title="退出">
        ⎋
      </div>
    </aside>
  )
}


