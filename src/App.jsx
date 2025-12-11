import { Routes, Route, Link } from 'react-router-dom'
import Layout from './components/Layout'
import { tools } from './tools'

function Home() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-tight mb-2">GTI Tools</h1>
          <p className="text-text-secondary text-lg">
            Visualisierungen für Grundlagen der Technischen Informatik
          </p>
        </div>

        <div className="grid gap-3">
          {tools.map(tool => (
            <Link
              key={tool.id}
              to={tool.path}
              className="group block p-4 bg-surface-secondary border border-border rounded-lg hover:border-accent transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-medium text-text-primary group-hover:text-accent transition-colors">
                    {tool.name}
                  </h2>
                  <p className="text-sm text-text-muted mt-1">{tool.description}</p>
                </div>
                <span className="text-text-muted group-hover:text-accent transition-colors">→</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-2xs text-text-muted uppercase tracking-widest">
            Wähle ein Tool aus der Sidebar
          </p>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        {tools.map(tool => (
          <Route key={tool.id} path={tool.path} element={<tool.component />} />
        ))}
      </Routes>
    </Layout>
  )
}
