// 天气元数据定义与优先级权重算法
export interface WeatherMeta {
  code: number
  label: string
  iconName: 'Sun' | 'CloudSun' | 'Cloud' | 'CloudRain' | 'CloudDrizzle' | 'CloudLightning' | 'CloudSnow' | 'CloudFog'
  emoji: string
  priority: number // 显著度/恶劣程度权重 (0 - 100)
  umbrellaAdvice: boolean // 是否需要雨具建议
  advice: string // 贴心提醒
}

export interface WeatherLocation {
  name: string
  lat: number
  lon: number
  isAuto?: boolean
  isManual?: boolean
  admin1?: string
  country?: string
  displaySubtext?: string
}

export interface WeatherCurrent {
  temp: number
  apparentTemp: number
  weatherCode: number
  humidity: number
  windSpeed: number
  isDay: boolean
  time: string
}

export interface WeatherDaily {
  tempMax: number
  tempMin: number
  weatherCode: number
  apparentTempMax: number
  apparentTempMin: number
}

export interface CharacteristicWeather {
  code: number
  label: string
  displayLabel: string // 例如 "多云转小雨" 或 "今日有雨"
  priority: number
  emoji: string
  iconName: WeatherMeta['iconName']
  advice: string
  umbrellaAdvice: boolean
  isElevated: boolean // 当日特征是否明显高于当前天气状态
  peakHour?: number // 预计出现时段
}

export interface WeatherSummary {
  location: WeatherLocation
  current: WeatherCurrent
  daily: WeatherDaily
  characteristic: CharacteristicWeather
  lastUpdated: number
  status: 'loading' | 'success' | 'error'
  errorMessage?: string
}

// 预设常用城市兜底选项
export const PRESET_CITIES: WeatherLocation[] = [
  { name: '北京', lat: 39.9042, lon: 116.4074, isAuto: false, isManual: true },
  { name: '上海', lat: 31.2304, lon: 121.4737, isAuto: false, isManual: true },
  { name: '广州', lat: 23.1291, lon: 113.2644, isAuto: false, isManual: true },
  { name: '深圳', lat: 22.5431, lon: 114.0579, isAuto: false, isManual: true },
  { name: '杭州', lat: 30.2741, lon: 120.1551, isAuto: false, isManual: true },
  { name: '成都', lat: 30.5728, lon: 104.0668, isAuto: false, isManual: true },
  { name: '武汉', lat: 30.5928, lon: 114.3055, isAuto: false, isManual: true },
  { name: '南京', lat: 32.0603, lon: 118.7969, isAuto: false, isManual: true },
  { name: '西安', lat: 34.3416, lon: 108.9398, isAuto: false, isManual: true },
  { name: '重庆', lat: 29.5630, lon: 106.5516, isAuto: false, isManual: true },
]

export const DEFAULT_LOCATION: WeatherLocation = PRESET_CITIES[1] // 上海默认

/**
 * WMO Weather Code 映射与优先级权重表
 * 优先级规则参考：
 * 雷暴/冰雹 (80-89) > 暴雨/大雨/冻雨 (70-79) > 中雨/小雨/阵雨 (60-69) > 大雪/中雪/小雪 (50-59) > 雾/霾 (40-49) > 阴天 (30-39) > 多云 (20-29) > 晴天 (10-19)
 */
export function getWeatherMeta(code: number): WeatherMeta {
  switch (code) {
    // 雷暴与冰雹
    case 99:
      return { code, label: '强雷暴伴冰雹', iconName: 'CloudLightning', emoji: '⛈️', priority: 89, umbrellaAdvice: true, advice: '强对流伴冰雹，请减少外出避险' }
    case 96:
      return { code, label: '雷暴伴冰雹', iconName: 'CloudLightning', emoji: '⛈️', priority: 85, umbrellaAdvice: true, advice: '雷雨伴有冰雹，注意户外安全' }
    case 95:
      return { code, label: '雷暴', iconName: 'CloudLightning', emoji: '⛈️', priority: 80, umbrellaAdvice: true, advice: '今日有雷雨天气，注意防雷防风' }

    // 暴雨 / 大雨 / 冻雨 / 暴烈阵雨
    case 65:
      return { code, label: '大雨/暴雨', iconName: 'CloudRain', emoji: '🌧️', priority: 75, umbrellaAdvice: true, advice: '雨势较强，外出请备好雨具并防滑' }
    case 82:
      return { code, label: '暴烈阵雨', iconName: 'CloudRain', emoji: '🌧️', priority: 74, umbrellaAdvice: true, advice: '短时阵雨凶猛，请备伞避雨' }
    case 66:
    case 67:
      return { code, label: '冻雨', iconName: 'CloudRain', emoji: '🌧️', priority: 73, umbrellaAdvice: true, advice: '地面易结薄冰，出行特别注意防滑' }

    // 中雨 / 小雨 / 阵雨 / 毛毛雨
    case 63:
      return { code, label: '中雨', iconName: 'CloudRain', emoji: '🌧️', priority: 65, umbrellaAdvice: true, advice: '今日有中雨，出门记得带伞 ☔' }
    case 81:
      return { code, label: '中阵雨', iconName: 'CloudRain', emoji: '🌦️', priority: 64, umbrellaAdvice: true, advice: '时有阵雨飘落，出门随身备伞 ☔' }
    case 56:
    case 57:
      return { code, label: '冻毛毛雨', iconName: 'CloudDrizzle', emoji: '🌦️', priority: 63, umbrellaAdvice: true, advice: '湿冷细雨，注意保暖防滑' }
    case 61:
      return { code, label: '小雨', iconName: 'CloudRain', emoji: '🌧️', priority: 62, umbrellaAdvice: true, advice: '今日有小雨，出行记得备伞 ☔' }
    case 80:
      return { code, label: '阵雨', iconName: 'CloudDrizzle', emoji: '🌦️', priority: 61, umbrellaAdvice: true, advice: '局部有阵雨，建议备伞出行 ☔' }
    case 55:
      return { code, label: '稠密毛毛雨', iconName: 'CloudDrizzle', emoji: '🌦️', priority: 60, umbrellaAdvice: true, advice: '细雨微湿，外出建议带伞' }
    case 51:
    case 53:
      return { code, label: '毛毛雨', iconName: 'CloudDrizzle', emoji: '🌦️', priority: 59, umbrellaAdvice: true, advice: '零星细雨，空气湿润' }

    // 雪 / 阵雪
    case 75:
      return { code, label: '大雪', iconName: 'CloudSnow', emoji: '❄️', priority: 58, umbrellaAdvice: true, advice: '大雪纷飞，外出防寒防滑' }
    case 86:
      return { code, label: '强阵雪', iconName: 'CloudSnow', emoji: '🌨️', priority: 57, umbrellaAdvice: true, advice: '阵雪明显，注意交通路况' }
    case 73:
      return { code, label: '中雪', iconName: 'CloudSnow', emoji: '🌨️', priority: 54, umbrellaAdvice: true, advice: '雪势渐增，添衣防寒' }
    case 85:
      return { code, label: '阵雪', iconName: 'CloudSnow', emoji: '🌨️', priority: 53, umbrellaAdvice: true, advice: '偶有飞雪，气温寒冷' }
    case 71:
      return { code, label: '小雪', iconName: 'CloudSnow', emoji: '🌨️', priority: 52, umbrellaAdvice: true, advice: '零星小雪，天冷注意保暖' }
    case 77:
      return { code, label: '雪粒/冰粒', iconName: 'CloudSnow', emoji: '🌨️', priority: 50, umbrellaAdvice: true, advice: '地面有雪粒，出行小心慢行' }

    // 雾 / 霾
    case 48:
      return { code, label: '浓雾/霾', iconName: 'CloudFog', emoji: '🌫️', priority: 42, umbrellaAdvice: false, advice: '能见度低，外出防护注意慢行' }
    case 45:
      return { code, label: '有雾', iconName: 'CloudFog', emoji: '🌫️', priority: 40, umbrellaAdvice: false, advice: '空气湿度大，注意交通视线' }

    // 阴天
    case 3:
      return { code, label: '阴天', iconName: 'Cloud', emoji: '☁️', priority: 30, umbrellaAdvice: false, advice: '天空阴沉，气温平稳' }

    // 多云
    case 2:
      return { code, label: '多云', iconName: 'CloudSun', emoji: '⛅', priority: 20, umbrellaAdvice: false, advice: '云量适中，体感适宜' }

    // 晴朗
    case 1:
      return { code, label: '大部晴朗', iconName: 'Sun', emoji: '🌤️', priority: 15, umbrellaAdvice: false, advice: '晴好少云，适宜户外活动' }
    case 0:
    default:
      return { code, label: '晴', iconName: 'Sun', emoji: '☀️', priority: 10, umbrellaAdvice: false, advice: '阳光晴好，适度补充水分' }
  }
}

/**
 * 核心算法：提取“最具特征天气”
 * 根据全天 24 小时或当日剩余时段的气象码，结合特征显著度权重（雷暴 > 暴雨 > 中雨/小雨 > 雪 > 雾 > 阴 > 多云 > 晴），
 * 提取出全天最具代表性的天气状态。
 */
export function extractCharacteristicWeather(
  hourlyCodes: number[],
  currentCode: number,
  currentHour: number = new Date().getHours()
): CharacteristicWeather {
  const currentMeta = getWeatherMeta(currentCode)

  if (!hourlyCodes || hourlyCodes.length === 0) {
    return {
      code: currentMeta.code,
      label: currentMeta.label,
      displayLabel: currentMeta.label,
      priority: currentMeta.priority,
      emoji: currentMeta.emoji,
      iconName: currentMeta.iconName,
      advice: currentMeta.advice,
      umbrellaAdvice: currentMeta.umbrellaAdvice,
      isElevated: false
    }
  }

  // 1. 优先考察当天从当前时刻起到午夜的时段（若已到深夜 22~23 点，则同时考察全天）
  const remainingHoursCodes = hourlyCodes.slice(currentHour)
  const candidateCodes = remainingHoursCodes.length > 2 ? remainingHoursCodes : hourlyCodes

  // 2. 找到候选时段中最高权重的天气
  let maxMeta = currentMeta
  let peakIndex = currentHour

  candidateCodes.forEach((code, idx) => {
    const meta = getWeatherMeta(code)
    if (meta.priority > maxMeta.priority) {
      maxMeta = meta
      peakIndex = (remainingHoursCodes.length > 2 ? currentHour : 0) + idx
    }
  })

  // 3. 判断特征是否显著高于当前天气（如当前晴/多云，但后续有中雨或雷暴）
  const isElevated = maxMeta.priority > currentMeta.priority && maxMeta.priority >= 50

  // 4. 生成人性化展示标签
  let displayLabel = currentMeta.label
  if (isElevated) {
    if (maxMeta.umbrellaAdvice && !currentMeta.umbrellaAdvice) {
      displayLabel = `${currentMeta.label}转${maxMeta.label.replace('/暴雨', '')}`
    } else {
      displayLabel = maxMeta.label
    }
  }

  return {
    code: maxMeta.code,
    label: maxMeta.label,
    displayLabel,
    priority: maxMeta.priority,
    emoji: maxMeta.emoji,
    iconName: isElevated ? maxMeta.iconName : currentMeta.iconName,
    advice: maxMeta.advice,
    umbrellaAdvice: maxMeta.umbrellaAdvice || currentMeta.umbrellaAdvice,
    isElevated,
    peakHour: peakIndex
  }
}

// 本地存储 Key
const CACHE_KEY = 'akasha_weather_cache_v1'
const LOCATION_KEY = 'akasha_weather_location_v1'
const CACHE_DURATION_MS = 60 * 60 * 1000 // 1 小时缓存

/**
 * 检查是否存在已持久化的地理位置
 */
export function hasStoredLocation(): boolean {
  try {
    return Boolean(localStorage.getItem(LOCATION_KEY))
  } catch {
    return false
  }
}

/**
 * 读取保存的自定义位置
 */
export function getStoredLocation(): WeatherLocation {
  try {
    const raw = localStorage.getItem(LOCATION_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed.lat === 'number' && typeof parsed.lon === 'number') {
        return {
          ...parsed,
          isAuto: parsed.isAuto ?? false,
          isManual: parsed.isManual ?? (!parsed.isAuto)
        }
      }
    }
  } catch (e) {
    console.warn('Failed to read stored weather location', e)
  }
  return DEFAULT_LOCATION
}

/**
 * 保存自定义位置
 */
export function setStoredLocation(loc: WeatherLocation): void {
  try {
    localStorage.setItem(LOCATION_KEY, JSON.stringify(loc))
  } catch (e) {
    console.warn('Failed to set stored weather location', e)
  }
}

/**
 * 获取本地缓存的天气数据（若未过期）
 */
export function getCachedWeather(): WeatherSummary | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const item = JSON.parse(raw)
    if (item && item.lastUpdated && Date.now() - item.lastUpdated < CACHE_DURATION_MS) {
      return item as WeatherSummary
    }
  } catch (e) {
    console.warn('Failed to parse weather cache', e)
  }
  return null
}

/**
 * 写入本地天气缓存
 */
export function setCachedWeather(summary: WeatherSummary): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(summary))
  } catch (e) {
    console.warn('Failed to write weather cache', e)
  }
}

/**
 * 尝试通过浏览器原生 Geolocation 或免费 IP 定位获取地理坐标
 */
export async function detectLocation(): Promise<WeatherLocation> {
  // 1. 优先尝试浏览器原生 Geolocation (设置 4 秒超时防挂起)
  if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 4000,
          enableHighAccuracy: false,
          maximumAge: 10 * 60 * 1000 // 允许 10 分钟内的位置缓存
        })
      })

      const lat = parseFloat(pos.coords.latitude.toFixed(4))
      const lon = parseFloat(pos.coords.longitude.toFixed(4))

      // 匹配最近的预设大城市名字，或者默认标注 "本地定位"
      const matchedCity = findClosestCity(lat, lon)
      return {
        name: matchedCity ? `${matchedCity.name}附近` : '本地',
        lat,
        lon,
        isAuto: true,
        isManual: false
      }
    } catch {
      // 用户拒绝授权或超时，平滑进入 IP 定位兜底
    }
  }

  // 2. IP 粗略定位兜底 (使用免费且支持 CORS 的 ipwho.is)
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 3500)
    const res = await fetch('https://ipwho.is/', { signal: controller.signal })
    clearTimeout(timer)
    if (res.ok) {
      const data = await res.json()
      if (data && data.success && data.latitude && data.longitude) {
        return {
          name: data.city || '本地',
          lat: parseFloat(data.latitude.toFixed(4)),
          lon: parseFloat(data.longitude.toFixed(4)),
          isAuto: true,
          isManual: false
        }
      }
    }
  } catch {
    // 网络受限或拦截，平滑降级
  }

  // 3. 终极兜底：已存储的位置或默认城市
  return getStoredLocation()
}

/**
 * 计算两点间距离并找到最近的预设城市
 */
function findClosestCity(lat: number, lon: number): WeatherLocation | null {
  let closest: WeatherLocation | null = null
  let minDistance = Infinity

  for (const city of PRESET_CITIES) {
    const d = Math.hypot(city.lat - lat, city.lon - lon)
    if (d < minDistance) {
      minDistance = d
      closest = city
    }
  }

  // 如果距离预设城市较近（约 1.5 度以内，大致对应 150km），则显示该城市名
  if (minDistance < 1.5) {
    return closest
  }
  return null
}

// 国际主要大都市与常用缩写别名映射表 (优化跨语种搜索命中率)
const CITY_ALIASES: Record<string, string> = {
  '东京': 'Tokyo',
  '伦敦': 'London',
  '纽约': 'New York',
  '巴黎': 'Paris',
  '悉尼': 'Sydney',
  '首尔': 'Seoul',
  '新加坡': 'Singapore',
  '香港': 'Hong Kong',
  '澳门': 'Macau',
  '台北': 'Taipei',
  '曼谷': 'Bangkok',
  '旧金山': 'San Francisco',
  '洛杉矶': 'Los Angeles',
  '芝加哥': 'Chicago',
  '多伦多': 'Toronto',
  '柏林': 'Berlin',
  '莫斯科': 'Moscow',
  '迪拜': 'Dubai'
}

/**
 * 免 Key 城市地理编码搜索能力 (基于 Open-Meteo Geocoding API)
 * 支持中文城市名（如“苏州”、“大连”、“青岛”），自动智能补全行政级别与人口权重排序
 */
export async function searchCities(keyword: string): Promise<WeatherLocation[]> {
  const trimmed = keyword.trim()
  if (!trimmed) return []

  try {
    const isChinese = /[\u4e00-\u9fa5]/.test(trimmed)
    const needsCitySuffix = isChinese && !trimmed.endsWith('市') && !trimmed.endsWith('区') && !trimmed.endsWith('县')
    const alias = CITY_ALIASES[trimmed]

    const fetchApi = async (name: string) => {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=6&language=zh&format=json`
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 4000)
      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timer)
      if (!res.ok) return []
      const data = await res.json()
      return data.results || []
    }

    const queries: Promise<any[]>[] = [fetchApi(trimmed).catch(() => [])]
    if (needsCitySuffix) {
      queries.push(fetchApi(trimmed + '市').catch(() => []))
    }
    if (alias) {
      queries.push(fetchApi(alias).catch(() => []))
    }

    const resultsArray = await Promise.all(queries)
    const combined = resultsArray.flat()

    // 去重并按人口降序排列 (人口多的重点城市排在前面)
    const map = new Map<number | string, any>()
    for (const item of combined) {
      if (!map.has(item.id)) {
        map.set(item.id, item)
      }
    }
    const list = Array.from(map.values())
    list.sort((a, b) => (b.population || 0) - (a.population || 0))

    return list.slice(0, 6).map((item): WeatherLocation => {
      const countryStr = item.country || ''
      const adminStr = item.admin1 || ''
      const details = [adminStr, countryStr && countryStr !== '中国' ? countryStr : ''].filter(Boolean).join(' · ')

      return {
        name: item.name,
        lat: parseFloat(Number(item.latitude).toFixed(4)),
        lon: parseFloat(Number(item.longitude).toFixed(4)),
        isAuto: false,
        isManual: true,
        admin1: adminStr,
        country: countryStr,
        displaySubtext: details || undefined
      }
    })
  } catch (err) {
    console.warn('City geocoding search failed', err)
    return []
  }
}

/**
 * 请求 Open-Meteo 天气接口并整合最具特征天气
 */
export async function fetchWeather(
  location?: WeatherLocation,
  forceRefresh: boolean = false
): Promise<WeatherSummary> {
  const targetLoc = location || getStoredLocation()

  // 检查非强制刷新下的本地缓存
  if (!forceRefresh) {
    const cached = getCachedWeather()
    if (cached && Math.abs(cached.location.lat - targetLoc.lat) < 0.1 && Math.abs(cached.location.lon - targetLoc.lon) < 0.1) {
      return cached
    }
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${targetLoc.lat}&longitude=${targetLoc.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,is_day,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min&timezone=auto&forecast_days=1`

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 6000)
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)

    if (!response.ok) {
      throw new Error(`Weather API HTTP ${response.status}`)
    }

    const data = await response.json()
    const current = {
      temp: Math.round(data.current?.temperature_2m ?? 20),
      apparentTemp: Math.round(data.current?.apparent_temperature ?? 20),
      weatherCode: data.current?.weather_code ?? 0,
      humidity: data.current?.relative_humidity_2m ?? 50,
      windSpeed: Math.round(data.current?.wind_speed_10m ?? 0),
      isDay: Boolean(data.current?.is_day ?? 1),
      time: data.current?.time ?? ''
    }

    const daily = {
      tempMax: Math.round(data.daily?.temperature_2m_max?.[0] ?? current.temp),
      tempMin: Math.round(data.daily?.temperature_2m_min?.[0] ?? current.temp),
      weatherCode: data.daily?.weather_code?.[0] ?? current.weatherCode,
      apparentTempMax: Math.round(data.daily?.apparent_temperature_max?.[0] ?? current.apparentTemp),
      apparentTempMin: Math.round(data.daily?.apparent_temperature_min?.[0] ?? current.apparentTemp)
    }

    const hourlyCodes: number[] = data.hourly?.weather_code || []
    const characteristic = extractCharacteristicWeather(hourlyCodes, current.weatherCode)

    const summary: WeatherSummary = {
      location: targetLoc,
      current,
      daily,
      characteristic,
      lastUpdated: Date.now(),
      status: 'success'
    }

    // 缓存数据
    setCachedWeather(summary)
    setStoredLocation(targetLoc)

    return summary
  } catch (err: any) {
    console.warn('Weather fetch failed, attempting cached fallback', err)
    // 降级使用旧缓存（即使过期）
    const staleCache = getCachedWeather()
    if (staleCache) {
      return {
        ...staleCache,
        status: 'success'
      }
    }

    // 终极安全占位，确保组件绝不白屏崩溃
    const defaultMeta = getWeatherMeta(0)
    return {
      location: targetLoc,
      current: {
        temp: 22,
        apparentTemp: 22,
        weatherCode: 0,
        humidity: 50,
        windSpeed: 8,
        isDay: true,
        time: ''
      },
      daily: {
        tempMax: 26,
        tempMin: 18,
        weatherCode: 0,
        apparentTempMax: 26,
        apparentTempMin: 18
      },
      characteristic: {
        code: 0,
        label: '晴',
        displayLabel: '晴',
        priority: 10,
        emoji: '☀️',
        iconName: 'Sun',
        advice: '天气良好',
        umbrellaAdvice: false,
        isElevated: false
      },
      lastUpdated: Date.now(),
      status: 'error',
      errorMessage: err?.message || '获取天气失败'
    }
  }
}
