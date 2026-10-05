export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type SceneWeather = 'clear' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'thunder'

export function somersetSeason(date: Date): Season {
  const month = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', month: 'numeric' }).format(date))
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}

export function classifyWeather(code: number): { weather: SceneWeather; label: string } {
  if (code === 45 || code === 48) return { weather: 'fog', label: 'fog on the moor' }
  if (code >= 95 && code <= 99) return { weather: 'thunder', label: 'thunderstorms' }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { weather: 'snow', label: 'snow' }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { weather: 'rain', label: 'rain' }
  if (code === 2 || code === 3) return { weather: 'cloudy', label: 'cloudy skies' }
  if (code === 1) return { weather: 'clear', label: 'mostly clear' }
  return { weather: 'clear', label: 'clear skies' }
}

export function windMotion(speed: number, direction: number, gusts = speed) {
  const safeSpeed = Math.max(0, Number.isFinite(speed) ? speed : 0)
  const safeGusts = Math.max(safeSpeed, Number.isFinite(gusts) ? gusts : safeSpeed)
  const strength = Math.min(1, Math.max(safeSpeed, safeGusts * 0.7) / 45)
  const hasDirection = Number.isFinite(direction)
  const from = hasDirection ? ((direction % 360) + 360) % 360 : 0
  // Meteorological direction names where the air comes FROM; west wind travels right.
  const eastward = -Math.sin(from * Math.PI / 180)
  return {
    active: safeSpeed >= 7 || safeGusts >= 16,
    strength,
    eastward,
    drift: Math.round(eastward * strength * 110),
    from: hasDirection ? ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(from / 45) % 8] : null,
  }
}

export function rainDropCount(code: number, precipitation: number): number {
  if (!((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99))) return 0
  const rate = Math.max(0, Number.isFinite(precipitation) ? precipitation : 0)
  const codeWeight = [55, 65, 67, 82, 95, 96, 97, 99].includes(code) ? 1 : 0
  return Math.min(64, Math.max(22, Math.round(22 + rate * 10 + codeWeight * 18)))
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

export function solarLighting(now: number, sunrise: number, sunset: number) {
  if (![now, sunrise, sunset].every(Number.isFinite) || sunset <= sunrise) return null
  const hour = 60 * 60
  const progress = clamp01((now - sunrise) / (sunset - sunrise))
  const sunUp = now >= sunrise && now < sunset
  const dawn = clamp01(1 - Math.abs(now - sunrise) / (1.4 * hour))
  const dusk = clamp01(1 - Math.abs(now - sunset) / (1.4 * hour))
  const night = now < sunrise ? clamp01((sunrise - now) / hour) : now >= sunset ? clamp01((now - sunset) / hour) : 0
  const sunHeight = Math.sin(Math.PI * progress)
  const afternoon = sunUp ? clamp01((progress - 0.45) / 0.55) : 0
  let phase = 'night'
  if (Math.abs(now - sunrise) < 30 * 60) phase = 'sunrise'
  else if (Math.abs(now - sunset) < 30 * 60) phase = 'sunset'
  else if (sunUp) phase = progress < 0.38 ? 'morning' : progress < 0.66 ? 'midday' : 'afternoon'
  else if (dawn > 0) phase = 'dawn'
  else if (dusk > 0) phase = 'dusk'
  return {
    phase,
    lightsOn: now < sunrise || now >= sunset,
    night,
    dawn,
    dusk,
    afternoon,
    brightness: 1 + (sunUp ? sunHeight * 0.04 : 0) - night * 0.23,
    sunX: 27 + progress * 47,
    sunY: 52 - sunHeight * 37,
    sunOpacity: sunUp ? 0.68 + sunHeight * 0.17 : 0,
  }
}

// The foreground in all four plates is registered to the same curve.
// Returns the fraction of scene height measured up from its bottom edge.
export function meadowGround(x: number): number {
  const stops: [number, number][] = [[0, 0.072], [0.14, 0.09], [0.3, 0.073], [0.46, 0.082], [0.62, 0.071], [0.77, 0.096], [1, 0.075]]
  const clamped = Math.max(0, Math.min(1, x))
  for (let i = 1; i < stops.length; i++) {
    if (clamped <= stops[i][0]) {
      const [x0, y0] = stops[i - 1]
      const [x1, y1] = stops[i]
      const t = (clamped - x0) / (x1 - x0)
      return y0 + (y1 - y0) * t
    }
  }
  return stops[stops.length - 1][1]
}
