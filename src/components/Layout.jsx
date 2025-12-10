import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  )
}
