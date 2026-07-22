import { useState, useRef } from 'react'
import { buildSeries } from '../../utils/colors'

function movingAverage(values, period = 3) {
  return values.map((_, i) => {
    if (i < period - 1) return null
    let sum = 0
    for (let j = i - period + 1; j <= i; j++) sum += values[j]
    return sum / period
  })
}

export default function TradingChart({ data, series, title, height = 420 }) {
  const [tooltip, setTooltip] = useState(null)
  const svgRef = useRef(null)

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        {title && <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{title}</h3>}
        <div className="flex items-center justify-center" style={{ height: height - 40 }}>
          <span className="text-sm text-gray-400">Aucune donnée disponible</span>
        </div>
      </div>
    )
  }

  const w = 800
  const chartH = height - 100
  const volumeH = 60
  const pad = { top: 20, right: 20, bottom: 50, left: 50 }
  const plotW = w - pad.left - pad.right
  const plotH = chartH - pad.top - pad.bottom

  const activeSeries = series && series.length > 0 ? series : buildSeries(data)

  const totals = data.map(d => activeSeries.reduce((s, ser) => s + (Number(d[ser.key]) || 0), 0))
  const ma = movingAverage(totals, 3)

  const maxVal = Math.max(...totals, 1)
  const labels = data.map(d => d.month)

  const xScale = (i) => pad.left + (i / Math.max(data.length - 1, 1)) * plotW
  const yScale = (v) => pad.top + plotH - (v / maxVal) * plotH

  const deltas = data.map((_, i) => i === 0 ? totals[0] : totals[i] - totals[i - 1])
  const maxDelta = Math.max(...deltas.map(Math.abs), 1)
  const volYScale = (v) => chartH + 5 + volumeH - (v / maxDelta) * (volumeH - 10)

  const seriesPaths = activeSeries.map((s) => {
    const pts = data.map((d, i) => ({
      x: xScale(i),
      y: yScale(Number(d[s.key]) || 0),
    }))
    const area = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
      + ` L${pts[pts.length - 1].x.toFixed(1)},${pad.top + plotH}`
      + ` L${pts[0].x.toFixed(1)},${pad.top + plotH} Z`
    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
    return { ...s, pts, area, line }
  })

  const maPoints = ma.map((v, i) => v !== null ? { x: xScale(i), y: yScale(v) } : null).filter(Boolean)
  const maPath = maPoints.length > 1
    ? maPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
    : ''

  const handleMove = (e) => {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const scaleX = w / rect.width
    const svgX = (e.clientX - rect.left) * scaleX
    const idx = Math.round((svgX - pad.left) / plotW * (data.length - 1))
    const i = Math.max(0, Math.min(data.length - 1, idx))

    const vals = {}
    for (const s of activeSeries) {
      vals[s.name] = Number(data[i][s.key]) || 0
    }

    setTooltip({
      x: xScale(i),
      cx: e.clientX,
      cy: e.clientY - 12,
      index: i,
      label: labels[i],
      values: vals,
      total: totals[i],
      delta: deltas[i],
      ma: ma[i],
    })
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 relative">
      {title && <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{title}</h3>}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${w} ${height - 40}`}
        className="w-full cursor-crosshair select-none"
        style={{ height: height - 40 }}
        onMouseMove={handleMove}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          {activeSeries.map((s, i) => (
            <linearGradient key={i} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0.02" />
            </linearGradient>
          ))}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {Array.from({ length: 5 }, (_, i) => {
          const y = pad.top + (i / 4) * plotH
          return (
            <g key={`g-${i}`}>
              <line x1={pad.left} y1={y} x2={w - pad.right} y2={y} stroke="#e5e7eb" strokeOpacity="0.4" strokeWidth="0.5" />
              <text x={pad.left - 8} y={y + 3} textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="Inter, sans-serif">
                {Math.round(maxVal - (i / 4) * maxVal)}
              </text>
            </g>
          )
        })}

        {data.map((_, i) => {
          const x = xScale(i)
          return i > 0 ? (
            <line key={`v-${i}`} x1={x} y1={pad.top} x2={x} y2={pad.top + plotH} stroke="#e5e7eb" strokeOpacity="0.2" strokeWidth="0.5" />
          ) : null
        })}

        {seriesPaths.map((sl, si) => (
          <g key={`series-${si}`}>
            <path d={sl.area} fill={`url(#grad-${si})`} />
            <path d={sl.line} fill="none" stroke={sl.color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
          </g>
        ))}

        {maPath && (
          <path
            d={maPath}
            fill="none"
            stroke="#f97316"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            filter="url(#glow)"
          />
        )}

        {/* Volume bars */}
        {deltas.map((d, i) => {
          const x = xScale(i)
          const barW = Math.max(2, plotW / data.length * 0.6)
          const h = Math.max(1, (d / maxDelta) * (volumeH - 10))
          return (
            <rect
              key={`vol-${i}`}
              x={x - barW / 2}
              y={chartH + 5 + (volumeH - 10 - h)}
              width={barW}
              height={h}
              rx="1"
              fill={d >= 0 ? '#10b981' : '#ef4444'}
              fillOpacity="0.6"
            />
          )
        })}

        {labels.map((l, i) => (
          <text
            key={`lb-${i}`}
            x={xScale(i)}
            y={height - 50}
            textAnchor="middle"
            fontSize="9"
            fill="#9ca3af"
            fontFamily="Inter, sans-serif"
          >
            {l}
          </text>
        ))}

        {tooltip && (
          <line
            x1={tooltip.x}
            y1={pad.top}
            x2={tooltip.x}
            y2={pad.top + plotH}
            stroke="#6366f1"
            strokeWidth="0.5"
            strokeDasharray="3,2"
          />
        )}
      </svg>

      {tooltip && (
        <div
          className="absolute z-10 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none whitespace-nowrap"
          style={{
            left: Math.min(tooltip.cx, window.innerWidth - 220),
            top: Math.max(tooltip.cy - 8, 0),
            transform: 'translateY(-100%)',
          }}
        >
          <div className="font-semibold mb-1 text-gray-300">{tooltip.label}</div>
          {Object.entries(tooltip.values).map(([name, val], i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: activeSeries[i]?.color || '#ccc' }} />
              <span>{name}: <strong>{val}</strong></span>
            </div>
          ))}
          <div className="mt-1 pt-1 border-t border-gray-600 flex items-center gap-2 text-gray-300">
            <span>Total: <strong className="text-white">{tooltip.total}</strong></span>
            <span className={`${tooltip.delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {tooltip.delta >= 0 ? '+' : ''}{tooltip.delta}
            </span>
          </div>
          {tooltip.ma !== null && (
            <div className="text-gray-300">
              MM3: <strong className="text-orange-400">{tooltip.ma.toFixed(1)}</strong>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-4 mt-3 justify-center">
        {activeSeries.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-xs text-gray-600 dark:text-gray-400">{s.name}</span>
          </div>
        ))}
        {maPoints.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded" style={{ backgroundColor: '#f97316' }} />
            <span className="text-xs text-gray-600 dark:text-gray-400">MM3</span>
          </div>
        )}
      </div>
    </div>
  )
}
