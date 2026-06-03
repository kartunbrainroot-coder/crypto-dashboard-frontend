'use client'
import { useState, useEffect, useCallback } from 'react'
import { fetcher, triggerPipeline, triggerCollection } from './lib/api'
import styles from './page.module.css'

type Signal = {
  id: number
  symbol: string
  name: string
  direction: string
  timeframe: string
  confidence: number
  entry_price: number
  target_price: number
  stop_loss: number
  risk_reward: number
  ai_thesis: string
  ai_reasoning: string
  key_catalysts: string[]
  risk_factors: string[]
  opportunity_score: number
  generated_at: string
}

type Opportunity = {
  coin_id: string
  symbol: string
  total_score: number
  market_score: number
  derivatives_score: number
  sentiment_score: number
  narrative_score: number
  smartmoney_score: number
  newsintel_score: number
  dominance_score: number
}

type PipelineStatus = {
  status: string
  last_cycle: { id: number; status: string; started_at: string; completed_at: string; coins_analyzed: number; signals_generated: number } | null
  total_active_signals: number
  collector_running: boolean
  analysis_running: boolean
}

export default function Dashboard() {
  const [tab, setTab] = useState<'signals' | 'opportunities' | 'status'>('signals')
  const [signals, setSignals] = useState<Signal[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null)
  const [filterDir, setFilterDir] = useState<string>('ALL')
  const [filterTf, setFilterTf] = useState<string>('ALL')
  const [triggering, setTriggering] = useState(false)
  const [triggerMsg, setTriggerMsg] = useState('')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [s, o, p] = await Promise.all([
        fetcher('/api/signals?limit=50'),
        fetcher('/api/top-opp?limit=20'),
        fetcher('/api/pipeline/status'),
      ])
      setSignals(s)
      setOpportunities(o)
      setPipelineStatus(p)
      setLastUpdate(new Date())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])
  useEffect(() => {
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [loadData])

  const handleTrigger = async () => {
    setTriggering(true)
    setTriggerMsg('')
    try {
      const res = await triggerPipeline()
      setTriggerMsg(res.message || 'Pipeline triggered!')
    } catch {
      setTriggerMsg('Error triggering pipeline')
    } finally {
      setTriggering(false)
      setTimeout(() => setTriggerMsg(''), 5000)
    }
  }

  const handleCollect = async () => {
    try {
      await triggerCollection()
      setTriggerMsg('Collection started!')
      setTimeout(() => setTriggerMsg(''), 3000)
    } catch { }
  }

  const filteredSignals = signals.filter(s => {
    if (filterDir !== 'ALL' && s.direction !== filterDir) return false
    if (filterTf !== 'ALL' && s.timeframe !== filterTf) return false
    return true
  })

  const dirColor = (d: string) => d === 'LONG' ? 'var(--long)' : d === 'SHORT' ? 'var(--short)' : 'var(--neutral)'
  const tfColor = (t: string) => t === 'SCALP' ? 'var(--scalp)' : t === 'INTRADAY' ? 'var(--intraday)' : 'var(--swing)'

  return (
    <div className={styles.root}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <span className={styles.logoDot} />
            <span>MIE</span>
          </div>
          <h1 className={styles.title}>Market Intelligence Engine</h1>
        </div>
        <div className={styles.headerRight}>
          {lastUpdate && (
            <span className={styles.lastUpdate}>
              Updated {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button className={styles.btnSecondary} onClick={handleCollect}>Collect</button>
          <button className={styles.btnPrimary} onClick={handleTrigger} disabled={triggering}>
            {triggering ? 'Running...' : '▶ Run Analysis'}
          </button>
        </div>
      </header>

      {triggerMsg && <div className={styles.triggerMsg}>{triggerMsg}</div>}

      {/* Stats bar */}
      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Active Signals</span>
          <span className={styles.statValue} style={{ color: 'var(--accent)' }}>
            {pipelineStatus?.total_active_signals ?? '—'}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Pipeline</span>
          <span className={styles.statValue} style={{ color: pipelineStatus?.last_cycle?.status === 'completed' ? 'var(--long)' : 'var(--neutral)' }}>
            {pipelineStatus?.last_cycle?.status ?? 'No cycle'}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Coins Analyzed</span>
          <span className={styles.statValue}>{pipelineStatus?.last_cycle?.coins_analyzed ?? '—'}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Signals Generated</span>
          <span className={styles.statValue}>{pipelineStatus?.last_cycle?.signals_generated ?? '—'}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>LONG</span>
          <span className={styles.statValue} style={{ color: 'var(--long)' }}>
            {signals.filter(s => s.direction === 'LONG').length}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>SHORT</span>
          <span className={styles.statValue} style={{ color: 'var(--short)' }}>
            {signals.filter(s => s.direction === 'SHORT').length}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {(['signals', 'opportunities', 'status'] as const).map(t => (
          <button key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>Connecting to API...</span>
          </div>
        ) : tab === 'signals' ? (
          <div>
            {/* Filters */}
            <div className={styles.filters}>
              <span className={styles.filterLabel}>Direction:</span>
              {['ALL', 'LONG', 'SHORT'].map(d => (
                <button key={d} className={`${styles.filterBtn} ${filterDir === d ? styles.filterActive : ''}`}
                  style={filterDir === d && d !== 'ALL' ? { color: dirColor(d), borderColor: dirColor(d) } : {}}
                  onClick={() => setFilterDir(d)}>{d}</button>
              ))}
              <span className={styles.filterLabel} style={{ marginLeft: 16 }}>Timeframe:</span>
              {['ALL', 'SCALP', 'INTRADAY', 'SWING'].map(t => (
                <button key={t} className={`${styles.filterBtn} ${filterTf === t ? styles.filterActive : ''}`}
                  style={filterTf === t && t !== 'ALL' ? { color: tfColor(t), borderColor: tfColor(t) } : {}}
                  onClick={() => setFilterTf(t)}>{t}</button>
              ))}
              <span className={styles.count}>{filteredSignals.length} signals</span>
            </div>

            {filteredSignals.length === 0 ? (
              <div className={styles.empty}>
                No signals yet. Run analysis first via the button above.
              </div>
            ) : (
              <div className={styles.signalGrid}>
                {filteredSignals.map(signal => (
                  <div key={signal.id} className={styles.signalCard} onClick={() => setSelectedSignal(signal)}>
                    <div className={styles.signalTop}>
                      <span className={styles.signalSymbol}>{signal.symbol}</span>
                      <span className={styles.signalDir} style={{ color: dirColor(signal.direction), borderColor: dirColor(signal.direction) }}>
                        {signal.direction}
                      </span>
                      <span className={styles.signalTf} style={{ color: tfColor(signal.timeframe) }}>
                        {signal.timeframe}
                      </span>
                    </div>
                    <div className={styles.signalName}>{signal.name}</div>
                    <div className={styles.signalPrices}>
                      <div><span className={styles.priceLabel}>Entry</span><span className={styles.priceVal}>${signal.entry_price?.toFixed(4)}</span></div>
                      <div><span className={styles.priceLabel}>Target</span><span className={styles.priceVal} style={{ color: 'var(--long)' }}>${signal.target_price?.toFixed(4)}</span></div>
                      <div><span className={styles.priceLabel}>Stop</span><span className={styles.priceVal} style={{ color: 'var(--short)' }}>${signal.stop_loss?.toFixed(4)}</span></div>
                    </div>
                    <div className={styles.signalMeta}>
                      <div className={styles.confBar}>
                        <div className={styles.confFill} style={{ width: `${signal.confidence}%`, background: dirColor(signal.direction) }} />
                      </div>
                      <span className={styles.confText}>{signal.confidence?.toFixed(0)}% conf</span>
                      <span className={styles.rrText}>R:R {signal.risk_reward?.toFixed(1)}</span>
                    </div>
                    {signal.ai_thesis && (
                      <p className={styles.signalThesis}>{signal.ai_thesis.slice(0, 100)}...</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : tab === 'opportunities' ? (
          <div>
            {opportunities.length === 0 ? (
              <div className={styles.empty}>No opportunity data yet. Run analysis first.</div>
            ) : (
              <div className={styles.oppTable}>
                <div className={styles.oppHeader}>
                  <span>Symbol</span>
                  <span>Total</span>
                  <span>Market</span>
                  <span>Derivatives</span>
                  <span>Sentiment</span>
                  <span>Narrative</span>
                  <span>SmartMoney</span>
                  <span>NewsIntel</span>
                  <span>Dominance</span>
                </div>
                {opportunities.map((opp, i) => (
                  <div key={opp.coin_id} className={styles.oppRow}>
                    <span className={styles.oppRank}>
                      <span className={styles.oppNum}>#{i + 1}</span>
                      <span className={styles.oppSymbol}>{opp.symbol}</span>
                    </span>
                    <span className={styles.oppScore} style={{ color: opp.total_score > 70 ? 'var(--long)' : opp.total_score > 50 ? 'var(--accent)' : 'var(--muted)' }}>
                      {opp.total_score?.toFixed(1)}
                    </span>
                    {[opp.market_score, opp.derivatives_score, opp.sentiment_score, opp.narrative_score, opp.smartmoney_score, opp.newsintel_score, opp.dominance_score].map((sc, j) => (
                      <span key={j} className={styles.oppSubScore}>
                        <span className={styles.miniBar}>
                          <span className={styles.miniBarFill} style={{ width: `${sc}%` }} />
                        </span>
                        {sc?.toFixed(0)}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className={styles.statusPanel}>
            <div className={styles.statusGrid}>
              <div className={styles.statusCard}>
                <h3>Pipeline</h3>
                <div className={styles.statusItem}><span>Status</span><span style={{ color: pipelineStatus?.status === 'healthy' ? 'var(--long)' : 'var(--short)' }}>{pipelineStatus?.status}</span></div>
                <div className={styles.statusItem}><span>Analysis Running</span><span>{pipelineStatus?.analysis_running ? '🟡 Yes' : '⚫ No'}</span></div>
                <div className={styles.statusItem}><span>Collector Running</span><span>{pipelineStatus?.collector_running ? '🟢 Yes' : '⚫ No'}</span></div>
              </div>
              {pipelineStatus?.last_cycle && (
                <div className={styles.statusCard}>
                  <h3>Last Cycle</h3>
                  <div className={styles.statusItem}><span>ID</span><span>#{pipelineStatus.last_cycle.id}</span></div>
                  <div className={styles.statusItem}><span>Status</span><span style={{ color: pipelineStatus.last_cycle.status === 'completed' ? 'var(--long)' : 'var(--short)' }}>{pipelineStatus.last_cycle.status}</span></div>
                  <div className={styles.statusItem}><span>Coins Analyzed</span><span>{pipelineStatus.last_cycle.coins_analyzed}</span></div>
                  <div className={styles.statusItem}><span>Signals Generated</span><span>{pipelineStatus.last_cycle.signals_generated}</span></div>
                  <div className={styles.statusItem}><span>Started</span><span>{new Date(pipelineStatus.last_cycle.started_at).toLocaleString()}</span></div>
                </div>
              )}
              <div className={styles.statusCard}>
                <h3>Manual Controls</h3>
                <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>
                  Trigger pipeline manually outside the 2-hour schedule.
                </p>
                <button className={styles.btnPrimary} onClick={handleTrigger} disabled={triggering} style={{ width: '100%', marginBottom: 8 }}>
                  {triggering ? 'Running...' : '▶ Run Full Analysis'}
                </button>
                <button className={styles.btnSecondary} onClick={handleCollect} style={{ width: '100%' }}>
                  ↻ Collect Coins Now
                </button>
                {triggerMsg && <p style={{ color: 'var(--accent)', marginTop: 12, fontSize: 13 }}>{triggerMsg}</p>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Signal Detail Modal */}
      {selectedSignal && (
        <div className={styles.modalOverlay} onClick={() => setSelectedSignal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.modalSymbol}>{selectedSignal.symbol}</span>
                <span className={styles.signalDir} style={{ color: dirColor(selectedSignal.direction), borderColor: dirColor(selectedSignal.direction), marginLeft: 12 }}>
                  {selectedSignal.direction}
                </span>
                <span className={styles.signalTf} style={{ color: tfColor(selectedSignal.timeframe), marginLeft: 8 }}>
                  {selectedSignal.timeframe}
                </span>
              </div>
              <button className={styles.modalClose} onClick={() => setSelectedSignal(null)}>✕</button>
            </div>

            <div className={styles.modalPrices}>
              <div className={styles.modalPrice}><span>Entry</span><strong>${selectedSignal.entry_price?.toFixed(6)}</strong></div>
              <div className={styles.modalPrice}><span>Target</span><strong style={{ color: 'var(--long)' }}>${selectedSignal.target_price?.toFixed(6)}</strong></div>
              <div className={styles.modalPrice}><span>Stop Loss</span><strong style={{ color: 'var(--short)' }}>${selectedSignal.stop_loss?.toFixed(6)}</strong></div>
              <div className={styles.modalPrice}><span>R:R Ratio</span><strong style={{ color: 'var(--accent)' }}>{selectedSignal.risk_reward?.toFixed(2)}</strong></div>
              <div className={styles.modalPrice}><span>Confidence</span><strong>{selectedSignal.confidence?.toFixed(1)}%</strong></div>
              <div className={styles.modalPrice}><span>Opp. Score</span><strong>{selectedSignal.opportunity_score?.toFixed(1)}</strong></div>
            </div>

            {selectedSignal.ai_thesis && (
              <div className={styles.modalSection}>
                <h4>AI Thesis</h4>
                <p>{selectedSignal.ai_thesis}</p>
              </div>
            )}

            {selectedSignal.ai_reasoning && (
              <div className={styles.modalSection}>
                <h4>Reasoning</h4>
                <p>{selectedSignal.ai_reasoning}</p>
              </div>
            )}

            <div className={styles.modalCols}>
              {selectedSignal.key_catalysts?.length > 0 && (
                <div className={styles.modalSection}>
                  <h4>Key Catalysts</h4>
                  <ul>
                    {selectedSignal.key_catalysts.map((c, i) => <li key={i}>✦ {c}</li>)}
                  </ul>
                </div>
              )}
              {selectedSignal.risk_factors?.length > 0 && (
                <div className={styles.modalSection}>
                  <h4>Risk Factors</h4>
                  <ul>
                    {selectedSignal.risk_factors.map((r, i) => <li key={i} style={{ color: 'var(--short)' }}>⚠ {r}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
