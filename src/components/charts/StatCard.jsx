export default function StatCard({ label, value, icon: Icon, color = 'bg-primary-500', trend, trendLabel }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? '--'}</p>
          <p className="text-sm text-gray-500 truncate">{label}</p>
          {trend !== undefined && (
            <p className={`text-xs mt-0.5 ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend > 0 ? '+' : ''}{trend}{trendLabel ? ` ${trendLabel}` : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
