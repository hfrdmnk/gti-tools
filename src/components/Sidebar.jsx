import { NavLink, useLocation } from 'react-router-dom'
import { tools } from '../tools'

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-56 flex flex-col border-r border-border bg-surface">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <NavLink to="/" className="block">
          <h1 className="font-mono text-sm font-medium tracking-tight">
            <span className="text-accent">GTI</span>
            <span className="text-text-muted">/</span>
            <span className="text-text-primary">tools</span>
          </h1>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <div className="text-2xs text-text-muted uppercase tracking-widest mb-2 px-2">
          Simulationen
        </div>

        <ul className="space-y-0.5">
          {tools.map(tool => {
            const isActive = location.pathname === tool.path
            return (
              <li key={tool.id}>
                <NavLink
                  to={tool.path}
                  className={`
                    flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors
                    ${isActive
                      ? 'bg-accent-muted text-accent'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-tertiary'
                    }
                  `}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-accent' : 'bg-transparent'}`} />
                  <span className="truncate">{tool.name}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-2xs text-text-muted font-mono">
          v0.1.0
        </p>
      </div>
    </aside>
  )
}
