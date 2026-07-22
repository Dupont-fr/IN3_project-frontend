const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#fb923c', '#fbbf24', '#34d399']

export default function SimplePieChart({ data, title, height = 300 }) {
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

  const total = data.reduce((s, d) => s + (d.value || 0), 0)
  const cx = 120
  const cy = height / 2 - 10
  const r = Math.min(cx - 20, cy - 20, 80)
  const innerR = r * 0.5

  let cumul = 0
  const slices = data.map((d, i) => {
    const val = d.value || 0
    const pct = total > 0 ? (val / total) * 100 : 0
    const angle1 = (cumul / total) * 360
    cumul += val
    const angle2 = (cumul / total) * 360
    return { ...d, pct, angle1, angle2, color: COLORS[i % COLORS.length] }
  })

  function polar(cx, cy, r, deg) {
    const rad = ((deg - 90) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  function arcPath(cx, cy, r1, r2, a1, a2) {
    const start1 = polar(cx, cy, r1, a1)
    const end1 = polar(cx, cy, r1, a2)
    const start2 = polar(cx, cy, r2, a2)
    const end2 = polar(cx, cy, r2, a1)
    const largeArc = a2 - a1 > 180 ? '1' : '0'
    return `M${start1.x.toFixed(1)},${start1.y.toFixed(1)}
            A${r1},${r1} 0 ${largeArc} 1 ${end1.x.toFixed(1)},${end1.y.toFixed(1)}
            L${start2.x.toFixed(1)},${start2.y.toFixed(1)}
            A${r2},${r2} 0 ${largeArc} 0 ${end2.x.toFixed(1)},${end2.y.toFixed(1)} Z`
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      {title && <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{title}</h3>}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <svg width="240" height={height - 20}>
          {slices.map((s, i) => {
            if (s.angle2 - s.angle1 >= 360) {
              return (
                <circle key={i} cx={cx} cy={cy} r={r} fill={s.color} />
              )
            }
            return (
              <path key={i} d={arcPath(cx, cy, r, innerR, s.angle1, s.angle2)} fill={s.color} stroke="#fff" strokeWidth="1" />
            )
          })}
          {total > 0 && (
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="bold" fill="#374151">
              {total}
            </text>
          )}
        </svg>
        <div className="space-y-1.5">
          {slices.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span
                className="w-3 h-3 rounded-sm inline-block shrink-0"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-gray-600 dark:text-gray-400">{s.name}</span>
              <span className="font-medium text-gray-900 dark:text-white ml-auto">{s.val ?? s.value}</span>
              <span className="text-gray-400">({s.pct.toFixed(1)}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
