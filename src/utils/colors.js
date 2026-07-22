const GOLDEN_ANGLE = 137.508

export function hslColor(index) {
  const hue = (index * GOLDEN_ANGLE) % 360
  return `hsl(${hue.toFixed(1)}, 60%, 55%)`
}

export function buildSeries(data, maxSeries = 12) {
  if (!data || data.length === 0) return []

  const allKeys = new Set()
  for (const d of data) {
    for (const k of Object.keys(d)) {
      if (k !== 'month') allKeys.add(k)
    }
  }

  let keys = Array.from(allKeys)

  if (keys.length > maxSeries) {
    const last = data[data.length - 1]
    keys.sort((a, b) => (Number(last[b]) || 0) - (Number(last[a]) || 0))
    const top = keys.slice(0, maxSeries - 1)
    const rest = keys.slice(maxSeries - 1)

    for (const d of data) {
      let sum = 0
      for (const k of rest) sum += Number(d[k]) || 0
      d['Autres'] = (d['Autres'] || 0) + sum
      for (const k of rest) delete d[k]
    }

    keys = [...top, 'Autres']
  }

  return keys.sort().map((key, i) => ({
    key, name: key, color: hslColor(i),
  }))
}
