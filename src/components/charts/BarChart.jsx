const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#fb923c', '#fbbf24']

export default function SimpleBarChart({ data, xKey = 'name', yKey = 'value', title, height = 300 }) {
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

  const values = data.map(d => Number(d[yKey]) || 0)
  const maxVal = Math.max(...values, 1)
  const barWidth = Math.max(20, Math.min(60, 600 / data.length - 8))

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      {title && <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{title}</h3>}
      <div className="flex items-end justify-around gap-1" style={{ height: height - 60 }}>
        {data.map((d, i) => {
          const val = Number(d[yKey]) || 0
          const pct = (val / maxVal) * 100
          return (
            <div key={i} className="flex flex-col items-center" style={{ width: barWidth }}>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{val}</span>
              <div
                style={{
                  width: '100%',
                  height: `${Math.max(pct, 2)}%`,
                  backgroundColor: COLORS[i % COLORS.length],
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.3s',
                }}
              />
              <span className="text-[10px] text-gray-500 mt-1 truncate text-center max-w-full">
                {d[xKey]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
