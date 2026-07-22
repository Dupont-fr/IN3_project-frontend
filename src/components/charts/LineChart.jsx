import { useState } from 'react'

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6']

export default function SimpleLineChart({ data, xKey = 'month', yKey = 'count', series, title, height = 300 }) {
  const [tooltip, setTooltip] = useState(null)

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

  const isMulti = series && series.length > 0
  const w = 600
  const h = height - 60
  const pad = { top: 20, right: 20, bottom: 65, left: 45 }
  const plotW = w - pad.left - pad.right
  const plotH = h - pad.top - pad.bottom

  const activeSeries = isMulti
    ? series
    : [{ key: yKey, color: COLORS[0] }]

  const allValues = isMulti
    ? data.flatMap(d => activeSeries.map(s => Number(d[s.key]) || 0))
    : data.map(d => Number(d[yKey]) || 0)

  const maxVal = Math.max(...allValues, 1)
  const labels = data.map(d => d[xKey])

  const xScale = (i) => pad.left + (i / Math.max(data.length - 1, 1)) * plotW
  const yScale = (v) => pad.top + plotH - (v / maxVal) * plotH

  const seriesLines = activeSeries.map((s) => {
    const points = data.map((d, i) => ({
      x: xScale(i),
      y: yScale(Number(d[s.key]) || 0),
      val: Number(d[s.key]) || 0,
    }))
    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
    return { ...s, points, path }
  })

  const yTicks = 5
  const yStep = maxVal / yTicks
  const yTicksArr = Array.from({ length: yTicks + 1 }, (_, i) => Math.round(yStep * i))

  const labelSkip = labels.length > 6 ? Math.ceil(labels.length / 6) : 1

  const handleMouseMove = (e) => {
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const scaleX = w / rect.width
    const mouseSvgX = (e.clientX - rect.left) * scaleX

    const idx = Math.round((mouseSvgX - pad.left) / plotW * (data.length - 1))
    const clampedIdx = Math.max(0, Math.min(data.length - 1, idx))

    const vals = {}
    for (const s of activeSeries) {
      vals[s.name || s.key] = Number(data[clampedIdx][s.key]) || 0
    }

    setTooltip({
      svgX: xScale(clampedIdx),
      clientX: e.clientX,
      clientY: e.clientY - 10,
      index: clampedIdx,
      label: data[clampedIdx][xKey],
      values: vals,
    })
  }

  const handleMouseLeave = () => setTooltip(null)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 relative">
      {title && <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{title}</h3>}
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full cursor-crosshair"
        style={{ height }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {yTicksArr.map((tick, i) => {
          const y = yScale(tick)
          return (
            <g key={i}>
              <line x1={pad.left} y1={y} x2={w - pad.right} y2={y} stroke="#e5e7eb" strokeWidth="1" />
              <text x={pad.left - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#9ca3af">
                {tick}
              </text>
            </g>
          )
        })}
        {seriesLines.map((sl, si) => (
          <g key={si}>
            <path d={sl.path} fill="none" stroke={sl.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            {sl.points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="3" fill={sl.color} />
            ))}
          </g>
        ))}
        {labels.map((label, i) =>
          i % labelSkip === 0 ? (
            <text
              key={i}
              x={xScale(i)}
              y={h - 8}
              textAnchor="middle"
              fontSize="11"
              fill="#6b7280"
            >
              {label}
            </text>
          ) : null
        )}
        {tooltip && (
          <line
            x1={tooltip.svgX}
            y1={pad.top}
            x2={tooltip.svgX}
            y2={pad.top + plotH}
            stroke="#6366f1"
            strokeWidth="1"
            strokeDasharray="4,3"
          />
        )}
      </svg>

      {tooltip && (
        <div
          className="absolute z-10 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none whitespace-nowrap"
          style={{
            left: Math.min(tooltip.clientX, window.innerWidth - 200),
            top: Math.max(tooltip.clientY - 10, 0),
            transform: 'translateY(-100%)',
          }}
        >
          <div className="font-semibold mb-1 text-gray-300">{tooltip.label}</div>
          {Object.entries(tooltip.values).map(([name, val], i) => (
            <div key={i} className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: activeSeries.find(s => (s.name || s.key) === name)?.color || '#ccc' }}
              />
              <span>{name}: <strong>{val}</strong></span>
            </div>
          ))}
        </div>
      )}

      {isMulti && (
        <div className="flex flex-wrap gap-4 mt-3 justify-center">
          {activeSeries.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-xs text-gray-600 dark:text-gray-400">{s.name || s.key}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
