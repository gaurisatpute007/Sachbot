import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { getDashboardStats, getDashboardAlerts, getDashboardTrends } from '../lib/api'
import { StatCard, AlertCard, VerdictBadge, RiskBadge, Spinner } from '../components/ui'
import { RefreshCw } from 'lucide-react'

const BAR_COLORS = ['#1D9E75','#0F6E56','#5DCAA5','#9FE1CB','#c5f0e0','#e1f5ee']
const PIE_COLORS = ['#D85A30','#BA7517','#1D9E75','#888780','#3266ad','#533AB7']

export default function Dashboard() {
  const [stats, setStats]   = useState(null)
  const [alerts, setAlerts] = useState([])
  const [trends, setTrends] = useState(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const [s, a, t] = await Promise.all([getDashboardStats(), getDashboardAlerts(), getDashboardTrends()])
      setStats(s); setAlerts(a.alerts); setTrends(t)
    } catch {}
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const timeAgo = iso => {
    const mins = Math.floor((Date.now() - new Date(iso)) / 60000)
    return mins < 60 ? `${mins}m ago` : `${Math.floor(mins/60)}h ago`
  }

  if (loading) return <Spinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">NGO dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Community-level misinformation monitoring and early warnings.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 px-3 py-2 rounded-xl transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Claims checked today" value={stats.total_today}    delta="↑ 34 vs yesterday"    deltaType="bad" />
          <StatCard label="High-risk claims"      value={stats.high_risk}     delta="Spike in 2 districts" deltaType="bad" />
          <StatCard label="Pending review"        value={stats.pending_review} delta="Needs attention"     deltaType="neutral" />
          <StatCard label="Confirmed false"        value={stats.false_claims}  delta="Out of total"        deltaType="neutral" />
        </div>
      )}

      {alerts.length > 0 && (
        <div className="mb-6">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Early warning alerts</div>
          <div className="space-y-2">{alerts.map((a, i) => <AlertCard key={i} alert={a} />)}</div>
        </div>
      )}

      {trends && (
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="text-sm font-medium text-gray-700 mb-4">Claims by district</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trends.by_district} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={60} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" radius={[0,4,4,0]}>
                  {trends.by_district.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="text-sm font-medium text-gray-700 mb-4">Claims by category</div>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={trends.by_category} dataKey="count" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={2}>
                    {trends.by_category.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 flex-1">
                {trends.by_category.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {item.name}<span className="ml-auto text-gray-400">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {trends?.recent_claims && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <div className="text-sm font-medium text-gray-700">Recent verified claims</div>
          </div>
          <div className="divide-y divide-gray-50">
            {trends.recent_claims.map(c => (
              <div key={c.id} className="px-5 py-3.5 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-800 truncate">{c.text}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{c.language} · {c.district} · {timeAgo(c.timestamp)} · {c.forwards} forwards</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <RiskBadge risk={c.risk} />
                  <VerdictBadge verdict={c.verdict} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
