export function VerdictBadge({ verdict }) {
  const labels = { FALSE: 'False', MISLEADING: 'Misleading', TRUE: 'Verified', UNVERIFIED: 'Unverified' }
  return <span className={`verdict-${verdict} text-xs px-2.5 py-1 rounded-full`}>{labels[verdict] || verdict}</span>
}

export function RiskBadge({ risk }) {
  const styles = { high: 'bg-danger-light text-danger-dark', medium: 'bg-warn-light text-warn-dark', low: 'bg-brand-xlight text-brand-dark' }
  return <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${styles[risk] || styles.low}`}>{risk} risk</span>
}

export function Card({ children, className = '' }) {
  return <div className={`bg-white rounded-2xl border border-gray-100 ${className}`}>{children}</div>
}

export function StatCard({ label, value, delta, deltaType = 'neutral' }) {
  return (
    <Card className="p-5">
      <div className="text-2xl font-semibold text-gray-900">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
      {delta && <div className={`text-xs mt-2 ${deltaType === 'bad' ? 'text-danger' : deltaType === 'good' ? 'text-brand' : 'text-gray-400'}`}>{delta}</div>}
    </Card>
  )
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export function AlertCard({ alert }) {
  const border = alert.severity === 'high' ? 'border-l-danger' : 'border-l-warn'
  return (
    <div className={`bg-white rounded-xl border border-gray-100 border-l-4 ${border} p-4`}>
      <div className="text-sm font-medium text-gray-800">{alert.title}</div>
      <div className="text-xs text-gray-500 mt-1">{alert.body}</div>
    </div>
  )
}
