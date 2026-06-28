import { NavLink, Outlet } from 'react-router-dom'
import { MessageSquare, LayoutDashboard, ListChecks, GitBranch, Menu, X } from 'lucide-react'
import { useState } from 'react'

const nav = [
  { to: '/',          label: 'Citizen Bot',     icon: MessageSquare },
  { to: '/pipeline',  label: 'Claim Pipeline',  icon: GitBranch },
  { to: '/dashboard', label: 'NGO Dashboard',   icon: LayoutDashboard },
  { to: '/queue',     label: 'Review Queue',    icon: ListChecks },
]

export default function Layout() {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-gray-100 flex flex-col transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex`}>
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center text-white font-semibold text-sm">S</div>
            <div>
              <div className="font-semibold text-sm text-gray-900">SachBot</div>
              <div className="text-xs text-gray-400">Misinformation detection</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-brand-xlight text-brand-dark font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}>
              <Icon size={16} />{label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="text-xs text-gray-400">The Trial Blazers</div>
          <div className="text-xs text-gray-300">Harish · Gauri · Gokul</div>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/20 md:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-20">
          <button onClick={() => setOpen(!open)} className="p-1.5 rounded-lg hover:bg-gray-100">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
          <span className="font-semibold text-sm text-gray-800">SachBot</span>
        </header>
        <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
