import { useState, useRef, useEffect } from 'react'
import { Send, CheckCheck, AlertTriangle, Info, ShieldCheck, HelpCircle } from 'lucide-react'
import { verifyClaim } from '../lib/api'

const SAMPLES = [
  { label: '🧅 Onion price panic',  text: 'Onion prices will rise 400% due to a new export ban. Share this before midnight!' },
  { label: '💰 Fake govt scheme',   text: 'New government scheme gives ₹10,000 to every BPL family. Register on this WhatsApp link.' },
  { label: '🧪 Health misinformation', text: 'Scientists confirmed turmeric water cures COVID-19 completely.' },
  { label: '📹 Old video claim',    text: 'Old video of 2019 communal violence being circulated as a recent incident in Karnataka.' },
]

const VERDICT_META = {
  FALSE:      { icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger-light', label: 'False' },
  MISLEADING: { icon: Info,          color: 'text-warn',   bg: 'bg-warn-light',   label: 'Misleading' },
  TRUE:       { icon: ShieldCheck,   color: 'text-brand',  bg: 'bg-brand-xlight', label: 'Verified True' },
  UNVERIFIED: { icon: HelpCircle,    color: 'text-gray-500', bg: 'bg-gray-100',   label: 'Unverified' },
}

function WaMessage({ msg }) {
  if (msg.role === 'user') return (
    <div className="flex justify-end">
      <div className="max-w-[80%] bg-[#DCF8C6] rounded-2xl rounded-br-sm px-4 py-2.5 text-sm text-gray-800">
        <div className="text-xs text-gray-400 mb-1">Forwarded</div>
        {msg.text}
        <div className="text-right text-[10px] text-gray-400 mt-1">{msg.time}</div>
      </div>
    </div>
  )
  if (msg.role === 'typing') return (
    <div className="flex gap-1.5 items-center bg-white rounded-2xl rounded-bl-sm px-4 py-3 w-16">
      {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
    </div>
  )
  const meta = VERDICT_META[msg.verdict] || VERDICT_META.UNVERIFIED
  const Icon = meta.icon
  return (
    <div className="flex justify-start">
      <div className="max-w-[88%] bg-white rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 overflow-hidden">
        <div className={`${meta.bg} px-4 py-2.5 flex items-center gap-2`}>
          <Icon size={15} className={meta.color} />
          <span className={`text-sm font-medium ${meta.color}`}>{meta.label}</span>
          <span className="ml-auto text-xs text-gray-400">{msg.confidence}% confidence</span>
        </div>
        <div className="px-4 py-3">
          <p className="text-sm text-gray-700 leading-relaxed">{msg.explanation}</p>
          {msg.sources?.length > 0 && <div className="mt-2 text-xs text-gray-400">Sources: {msg.sources.join(', ')}</div>}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {msg.safe_to_share === false && <span className="text-xs bg-danger-light text-danger-dark px-2 py-0.5 rounded-full">⛔ Do not share</span>}
            {msg.safe_to_share === true  && <span className="text-xs bg-safe-light  text-safe-dark  px-2 py-0.5 rounded-full">✅ Safe to share</span>}
            {msg.status === 'pending'    && <span className="text-xs bg-warn-light   text-warn-dark  px-2 py-0.5 rounded-full">🔍 Sent to review queue</span>}
          </div>
        </div>
        <div className="px-4 py-2 border-t border-gray-50 text-right text-[10px] text-gray-400">{msg.time}</div>
      </div>
    </div>
  )
}

export default function CitizenBot() {
  const [messages, setMessages] = useState([{
    role: 'bot', verdict: 'TRUE', confidence: 100,
    explanation: "Hello! I'm SachBot 🤖  Forward me any WhatsApp message you've received and I'll check it instantly.",
    time: 'now', safe_to_share: null,
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [district, setDistrict] = useState('Mumbai')
  const bottomRef = useRef(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const now = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  async function send(text) {
    if (!text.trim() || loading) return
    setInput('')
    setLoading(true)
    setMessages(m => [...m, { role: 'user', text, time: now() }, { role: 'typing' }])
    try {
      const data = await verifyClaim(text, district)
      setMessages(m => [...m.filter(x => x.role !== 'typing'), { role: 'bot', ...data.result, time: now() }])
    } catch (err) {
      setMessages(m => [...m.filter(x => x.role !== 'typing'), {
        role: 'bot', verdict: 'UNVERIFIED', confidence: 0, time: now(),
        explanation: err?.response?.data?.detail || err?.message || 'Could not reach the server. Make sure the backend is running on port 8000.',
      }])
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Citizen verification bot</h1>
        <p className="text-sm text-gray-500 mt-1">Forward any WhatsApp message to check if it's true, misleading, or false.</p>
      </div>
      <div className="grid md:grid-cols-[1fr_300px] gap-6 items-start">
        {/* Phone */}
        <div className="flex justify-center">
          <div className="w-[340px] bg-[#0a0a0a] rounded-[2.5rem] p-2 shadow-xl">
            <div className="bg-white rounded-[2rem] overflow-hidden">
              <div className="bg-brand px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-dark flex items-center justify-center text-brand-light text-sm font-medium">SB</div>
                <div>
                  <div className="text-white font-medium text-sm">SachBot</div>
                  <div className="text-brand-light text-xs">Fact verification assistant</div>
                </div>
                <CheckCheck size={16} className="text-brand-light ml-auto" />
              </div>
              <div className="bg-[#ECE5DD] h-[420px] overflow-y-auto p-3 space-y-3">
                {messages.map((m, i) => <WaMessage key={i} msg={m} />)}
                <div ref={bottomRef} />
              </div>
              <div className="bg-[#F0F0F0] px-3 py-2.5 flex items-center gap-2">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(input)}
                  placeholder="Type a claim to check…"
                  className="flex-1 bg-white text-sm text-gray-800 rounded-full px-4 py-2 outline-none" disabled={loading} />
                <button onClick={() => send(input)} disabled={loading || !input.trim()}
                  className="w-9 h-9 bg-brand rounded-full flex items-center justify-center text-white disabled:opacity-40 shrink-0">
                  <Send size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="text-sm font-medium text-gray-700 mb-3">Your district</div>
            <select value={district} onChange={e => setDistrict(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 outline-none">
              {['Mumbai','Thane','Pune','Nashik','Nagpur','Aurangabad'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="text-sm font-medium text-gray-700 mb-3">Try a sample claim</div>
            <div className="space-y-2">
              {SAMPLES.map(s => (
                <button key={s.label} onClick={() => send(s.text)}
                  className="w-full text-left text-xs px-3 py-2.5 rounded-xl border border-gray-100 hover:border-brand hover:bg-brand-xlight text-gray-600 hover:text-brand-dark transition-colors">
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-brand-xlight rounded-2xl p-5">
            <div className="text-xs font-medium text-brand-dark mb-2">How it works</div>
            {['Forward any claim','AI extracts the core statement','Cross-checks known sources','Returns verdict + explanation'].map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-brand-dark mt-1.5">
                <span className="shrink-0 w-4 h-4 rounded-full bg-brand text-white flex items-center justify-center text-[10px]">{i+1}</span>
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
