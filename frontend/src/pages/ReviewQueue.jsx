import { useEffect, useState } from 'react'
import { getQueue, resolveQueueItem } from '../lib/api'
import { RiskBadge, Spinner } from '../components/ui'
import { CheckCircle, XCircle, HelpCircle, Clock, MessageSquare } from 'lucide-react'

const ACTIONS = [
  { verdict: 'FALSE',      label: 'Mark false',      icon: XCircle,     style: 'text-danger border-danger/30 hover:bg-danger-light' },
  { verdict: 'TRUE',       label: 'Mark verified',   icon: CheckCircle, style: 'text-brand border-brand/30 hover:bg-brand-xlight' },
  { verdict: 'UNVERIFIED', label: 'Needs more info', icon: HelpCircle,  style: 'text-gray-500 border-gray-200 hover:bg-gray-50' },
]

function QueueCard({ item, onResolve }) {
  const [resolving, setResolving] = useState(false)
  const [note, setNote] = useState('')
  const [showNote, setShowNote] = useState(false)
  const [resolved, setResolved] = useState(false)

  async function handle(verdict) {
    setResolving(true)
    await onResolve(item.id, verdict, note)
    setResolved(true)
  }

  if (resolved) return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 opacity-40">
      <div className="text-sm text-gray-500 text-center py-2">✓ Resolved</div>
    </div>
  )

  const borderColor = item.risk === 'high' ? 'border-l-danger' : item.risk === 'medium' ? 'border-l-warn' : 'border-l-brand-light'

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${borderColor} overflow-hidden`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="text-sm font-medium text-gray-800 flex-1">{item.text}</div>
          <RiskBadge risk={item.risk} />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mb-3">
          <span>🌐 {item.language}</span>
          <span>📍 {item.district}</span>
          <span><Clock size={10} className="inline mr-0.5" />{item.received_mins_ago}m ago</span>
          <span>📤 {item.forwards} forwards</span>
          <span>🤖 AI confidence: {item.ai_confidence}%</span>
        </div>
        <div className="bg-gray-50 rounded-xl px-3 py-2.5 text-xs text-gray-500 mb-4">
          <span className="font-medium text-gray-600">AI note: </span>{item.ai_note}
        </div>
        {showNote && (
          <textarea value={note} onChange={e => setNote(e.target.value)}
            placeholder="Add reviewer note (optional)…" rows={2}
            className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 mb-3 outline-none resize-none focus:border-brand" />
        )}
        <div className="flex items-center gap-2 flex-wrap">
          {ACTIONS.map(a => (
            <button key={a.verdict} onClick={() => handle(a.verdict)} disabled={resolving}
              className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border font-medium transition-colors disabled:opacity-40 ${a.style}`}>
              <a.icon size={13} />{a.label}
            </button>
          ))}
          <button onClick={() => setShowNote(!showNote)}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 ml-auto">
            <MessageSquare size={13} />Note
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ReviewQueue() {
  const [queue, setQueue]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getQueue().then(d => { setQueue(d.queue); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  async function handleResolve(id, verdict, note) {
    try { await resolveQueueItem(id, verdict, note) } catch {}
    setQueue(q => q.filter(item => item.id !== id))
  }

  if (loading) return <Spinner />

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Human review queue</h1>
        <p className="text-sm text-gray-500 mt-1">
          Sensitive or low-confidence claims escalated for manual review.
          {queue.length > 0 && <span className="ml-2 bg-warn-light text-warn-dark text-xs px-2 py-0.5 rounded-full">{queue.length} pending</span>}
        </p>
      </div>
      {queue.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="text-4xl mb-3">✅</div>
          <div className="text-sm font-medium text-gray-700">All caught up</div>
          <div className="text-xs text-gray-400 mt-1">No claims pending review right now.</div>
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map(item => <QueueCard key={item.id} item={item} onResolve={handleResolve} />)}
        </div>
      )}
    </div>
  )
}
