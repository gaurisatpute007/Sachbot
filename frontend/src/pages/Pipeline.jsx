import { useState } from 'react'
import { verifyClaim, getPipeline } from '../lib/api'
import { VerdictBadge, Card, Spinner } from '../components/ui'
import { CheckCircle, Circle, Loader, ArrowRight } from 'lucide-react'

const STEP_KEYS  = ['receive','extract','language','search','ai_reason','human','respond']
const STEP_ICONS = { receive:'📩', extract:'🔍', language:'🌐', search:'📚', ai_reason:'🤖', human:'👤', respond:'✅' }
const STEP_LABELS= { receive:'Message received', extract:'Claim extracted', language:'Language detected',
                     search:'Sources searched', ai_reason:'AI reasoning complete', human:'Human review', respond:'Response sent' }

export default function Pipeline() {
  const [claim, setClaim] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeStep, setActiveStep] = useState(-1)

  async function run() {
    if (!claim.trim() || loading) return
    setLoading(true); setResult(null); setActiveStep(0)
    try {
      const data = await verifyClaim(claim)
      const id = data.result?.id
      let step = 0
      const iv = setInterval(() => { step++; setActiveStep(step); if (step >= 6) clearInterval(iv) }, 600)
      setTimeout(async () => {
        clearInterval(iv); setActiveStep(7)
        if (id) { const p = await getPipeline(id); setResult(p) }
        else { setResult({ claim: data.result, pipeline: [] }) }
        setLoading(false)
      }, 4200)
    } catch { setLoading(false) }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Claim extraction pipeline</h1>
        <p className="text-sm text-gray-500 mt-1">See how SachBot processes a forwarded message step by step.</p>
      </div>

      <Card className="p-6 mb-6">
        <label className="text-sm font-medium text-gray-700 block mb-2">Paste a forwarded message to trace</label>
        <textarea value={claim} onChange={e => setClaim(e.target.value)} rows={3}
          placeholder="Paste any WhatsApp forward here…"
          className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 outline-none resize-none focus:border-brand transition-colors" />
        <button onClick={run} disabled={loading || !claim.trim()}
          className="mt-3 flex items-center gap-2 bg-brand text-white text-sm font-medium px-5 py-2.5 rounded-xl disabled:opacity-50 hover:bg-brand-dark transition-colors">
          {loading ? <Loader size={15} className="animate-spin" /> : <ArrowRight size={15} />}
          {loading ? 'Processing…' : 'Run pipeline'}
        </button>
      </Card>

      {(loading || result) && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="text-sm font-medium text-gray-700 mb-5">Processing steps</div>
            <div className="space-y-4">
              {STEP_KEYS.map((step, i) => {
                const done = activeStep > i; const active = activeStep === i
                return (
                  <div key={step} className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      {done   ? <CheckCircle size={18} className="text-brand" /> :
                       active ? <Loader size={18} className="text-brand animate-spin" /> :
                                <Circle size={18} className="text-gray-200" />}
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${done || active ? 'text-gray-800' : 'text-gray-300'}`}>
                        {STEP_ICONS[step]} {STEP_LABELS[step]}
                      </div>
                      {result?.pipeline?.[i]?.detail && done && (
                        <div className="text-xs text-gray-400 mt-0.5">{result.pipeline[i].detail}</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {result?.claim && (
            <Card className="p-6">
              <div className="text-sm font-medium text-gray-700 mb-4">Analysis result</div>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Extracted claim</div>
                  <div className="text-sm text-gray-800 bg-gray-50 rounded-xl px-3 py-2.5">{result.claim.claim || result.claim.text}</div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div><div className="text-xs text-gray-400 mb-1">Verdict</div><VerdictBadge verdict={result.claim.verdict} /></div>
                  <div><div className="text-xs text-gray-400 mb-1">Confidence</div><span className="text-sm font-medium text-gray-700">{result.claim.confidence}%</span></div>
                  <div><div className="text-xs text-gray-400 mb-1">Language</div><span className="text-sm text-gray-600">{result.claim.language}</span></div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Category</div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{result.claim.category}</span>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Explanation</div>
                  <div className="text-sm text-gray-700 leading-relaxed">{result.claim.explanation}</div>
                </div>
                {result.claim.status === 'pending' && (
                  <div className="bg-warn-light rounded-xl px-3 py-2.5 text-xs text-warn-dark">
                    ⚠️ Low confidence — sent to human review queue
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {!loading && !result && (
        <Card className="p-10 text-center">
          <div className="text-4xl mb-3">🔬</div>
          <div className="text-sm text-gray-500">Enter a claim above to see the full extraction pipeline in action.</div>
        </Card>
      )}
    </div>
  )
}
