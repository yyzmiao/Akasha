<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudSnow,
  CloudFog,
  Umbrella,
  MapPin,
  RefreshCw,
  Droplets,
  Wind,
  Search,
  Loader2,
  LocateFixed,
  X
} from 'lucide-vue-next'
import {
  fetchWeather,
  detectLocation,
  searchCities,
  hasStoredLocation,
  PRESET_CITIES,
  type WeatherSummary,
  type WeatherLocation
} from '../utils/weather'

const weather = ref<WeatherSummary | null>(null)
const isLoading = ref(false)
const isPopoverOpen = ref(false)
const widgetRef = ref<HTMLElement | null>(null)

// 城市搜索状态
const searchKeyword = ref('')
const searchResults = ref<WeatherLocation[]>([])
const isSearching = ref(false)
const hasSearched = ref(false)
let searchTimer: any = null

function clearSearch() {
  searchKeyword.value = ''
  searchResults.value = []
  isSearching.value = false
  hasSearched.value = false
  if (searchTimer) {
    clearTimeout(searchTimer)
    searchTimer = null
  }
}

function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  const kw = searchKeyword.value.trim()
  if (!kw) {
    searchResults.value = []
    isSearching.value = false
    hasSearched.value = false
    return
  }
  isSearching.value = true
  searchTimer = setTimeout(() => {
    executeSearch(kw)
  }, 300)
}

async function executeSearch(kw: string) {
  isSearching.value = true
  try {
    const list = await searchCities(kw)
    searchResults.value = list
    hasSearched.value = true
  } catch (e) {
    console.error('Failed to search cities', e)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

function onSearchEnter() {
  if (searchTimer) clearTimeout(searchTimer)
  const kw = searchKeyword.value.trim()
  if (kw) {
    executeSearch(kw)
  }
}

// 根据 iconName 动态选择对应的 Lucide 图标组件
const weatherIconComponent = computed(() => {
  const name = weather.value?.characteristic.iconName || 'Sun'
  switch (name) {
    case 'CloudLightning': return CloudLightning
    case 'CloudRain': return CloudRain
    case 'CloudDrizzle': return CloudDrizzle
    case 'CloudSnow': return CloudSnow
    case 'CloudFog': return CloudFog
    case 'Cloud': return Cloud
    case 'CloudSun': return CloudSun
    case 'Sun':
    default:
      return Sun
  }
})

// 根据天气类型给图标搭配适度的自然主题色彩
const iconColorClass = computed(() => {
  const name = weather.value?.characteristic.iconName || 'Sun'
  switch (name) {
    case 'CloudLightning': return 'text-purple-500 dark:text-purple-400'
    case 'CloudRain': return 'text-blue-500 dark:text-blue-400'
    case 'CloudDrizzle': return 'text-sky-500 dark:text-sky-400'
    case 'CloudSnow': return 'text-cyan-500 dark:text-cyan-300'
    case 'CloudFog': return 'text-slate-400 dark:text-slate-400'
    case 'Cloud': return 'text-slate-500 dark:text-slate-400'
    case 'CloudSun': return 'text-amber-500 dark:text-amber-400'
    case 'Sun':
    default:
      return 'text-amber-500 dark:text-amber-400'
  }
})

// 加载天气数据 (优先读取手动保存的常驻城市)
async function loadWeatherData(force: boolean = false) {
  isLoading.value = true
  try {
    const data = await fetchWeather(undefined, force)
    weather.value = data
  } catch (e) {
    console.error('Failed to load weather', e)
  } finally {
    isLoading.value = false
  }
}

// 重新自动定位并刷新 (仅在用户主动触发时调用)
async function handleRedetectLocation() {
  clearSearch()
  isLoading.value = true
  try {
    const loc = await detectLocation()
    loc.isAuto = true
    loc.isManual = false
    const data = await fetchWeather(loc, true)
    weather.value = data
  } catch (e) {
    console.error('Redetect location failed', e)
  } finally {
    isLoading.value = false
  }
}

// 手动切换/锁定城市 (支持搜索结果或预设城市)
async function handleSelectCity(city: WeatherLocation) {
  clearSearch()
  isLoading.value = true
  try {
    const manualCity: WeatherLocation = {
      ...city,
      isAuto: false,
      isManual: true
    }
    const data = await fetchWeather(manualCity, true)
    weather.value = data
  } catch (e) {
    console.error('Select city failed', e)
  } finally {
    isLoading.value = false
  }
}

// 点击外部关闭弹窗
function handleClickOutside(event: MouseEvent) {
  if (widgetRef.value && !widgetRef.value.contains(event.target as Node)) {
    isPopoverOpen.value = false
    clearSearch()
  }
}

onMounted(async () => {
  // 首次访问若无任何持久化记录，尝试自动定位一次；若已有记录则坚决尊重锁定城市
  if (!hasStoredLocation()) {
    try {
      const loc = await detectLocation()
      const data = await fetchWeather(loc, false)
      weather.value = data
    } catch {
      await loadWeatherData()
    }
  } else {
    await loadWeatherData()
  }
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (searchTimer) clearTimeout(searchTimer)
  window.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="relative" ref="widgetRef">
    <!-- Navbar 紧凑微件按钮 -->
    <button
      @click="isPopoverOpen = !isPopoverOpen"
      class="group flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer select-none"
      :title="weather ? `${weather.location.name} [${weather.location.isAuto ? '定位' : '手动'}] · ${weather.characteristic.displayLabel} ${weather.current.temp}°C (点击查看详情)` : '获取天气中...'"
    >
      <!-- 天气图标 -->
      <div class="relative flex items-center justify-center">
        <component
          :is="weatherIconComponent"
          class="w-4 h-4 transition-transform group-hover:scale-110"
          :class="iconColorClass"
        />
        <!-- 降水/带伞提醒小徽标 -->
        <span
          v-if="weather?.characteristic.umbrellaAdvice"
          class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-900 animate-pulse"
          title="今日有雨，建议备伞"
        ></span>
      </div>

      <!-- 天气描述 (小屏隐藏，sm 及以上展示) -->
      <span
        v-if="weather"
        class="hidden sm:inline font-normal text-slate-600 dark:text-slate-300 max-w-[80px] truncate"
      >
        {{ weather.characteristic.displayLabel }}
      </span>

      <!-- 实时温度 -->
      <span v-if="weather" class="font-semibold tabular-nums text-slate-800 dark:text-slate-100">
        {{ weather.current.temp }}°C
      </span>

      <!-- 加载中占位 -->
      <span v-else class="text-[11px] text-slate-400 animate-pulse">
        天气...
      </span>
    </button>

    <!-- 弹出的悬停/点击天气详情卡片 -->
    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="transform scale-95 opacity-0 -translate-y-1"
      enter-to-class="transform scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform scale-100 opacity-100 translate-y-0"
      leave-to-class="transform scale-95 opacity-0 -translate-y-1"
    >
      <div
        v-if="isPopoverOpen && weather"
        class="fixed inset-x-3 top-13 sm:absolute sm:inset-auto sm:left-0 sm:top-full sm:mt-2 sm:w-80 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-900/10 dark:shadow-black/40 z-50 text-slate-800 dark:text-slate-200 transition-colors"
      >
        <!-- 顶部：城市名、定位/手动与操作 -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div class="flex items-center gap-1.5 truncate mr-2">
            <MapPin class="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span class="font-semibold text-sm tracking-tight text-slate-900 dark:text-white truncate" :title="weather.location.name">
              {{ weather.location.name }}
            </span>
            <span
              class="text-[10px] px-1.5 py-0.2 rounded-full font-medium shrink-0 transition-colors"
              :class="weather.location.isAuto
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                : 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/40'"
            >
              {{ weather.location.isAuto ? '定位' : '手动' }}
            </span>
          </div>

          <div class="flex items-center gap-0.5 shrink-0">
            <!-- 重新自动定位按钮 -->
            <button
              @click="handleRedetectLocation"
              class="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="重新自动定位 (IP/GPS)"
            >
              <LocateFixed class="w-3.5 h-3.5" />
            </button>

            <!-- 刷新按钮 -->
            <button
              @click="loadWeatherData(true)"
              class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="刷新天气"
            >
              <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isLoading }" />
            </button>

            <!-- 关闭按钮 -->
            <button
              @click="isPopoverOpen = false"
              class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- 中部：实时大温度与天气现象 -->
        <div class="py-3 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <component
              :is="weatherIconComponent"
              class="w-10 h-10"
              :class="iconColorClass"
            />
            <div>
              <div class="flex items-baseline gap-1">
                <span class="text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
                  {{ weather.current.temp }}°
                </span>
                <span class="text-xs text-slate-400 font-medium">C</span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                体感 {{ weather.current.apparentTemp }}°C
              </p>
            </div>
          </div>

          <div class="text-right">
            <span class="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {{ weather.characteristic.displayLabel }}
            </span>
            <p class="text-[11px] text-slate-400 mt-1 tabular-nums">
              {{ weather.daily.tempMin }}° ~ {{ weather.daily.tempMax }}°C
            </p>
          </div>
        </div>

        <!-- 核心算法标识：今日特征天气提示栏 -->
        <div
          v-if="weather.characteristic.isElevated || weather.characteristic.umbrellaAdvice"
          class="mb-3 px-3 py-2 rounded-xl text-xs flex items-start gap-2 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/50 text-blue-800 dark:text-blue-200"
        >
          <Umbrella class="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <div class="leading-relaxed">
            <span class="font-semibold">气象提示：</span>
            <span>{{ weather.characteristic.advice }}</span>
            <span v-if="weather.characteristic.peakHour" class="opacity-80 ml-1 text-[11px]">
              (重点时段 ~{{ weather.characteristic.peakHour }}:00)
            </span>
          </div>
        </div>

        <div
          v-else
          class="mb-3 px-3 py-2 rounded-xl text-xs flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300"
        >
          <span class="text-base">{{ weather.characteristic.emoji }}</span>
          <span class="leading-relaxed">{{ weather.characteristic.advice }}</span>
        </div>

        <!-- 详细指标网格 -->
        <div class="grid grid-cols-2 gap-2 text-xs py-2 border-t border-slate-100 dark:border-slate-800/80">
          <div class="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
            <Droplets class="w-3.5 h-3.5 text-sky-500" />
            <div>
              <div class="text-[10px] text-slate-400">空气湿度</div>
              <div class="font-semibold text-slate-700 dark:text-slate-200">{{ weather.current.humidity }}%</div>
            </div>
          </div>

          <div class="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
            <Wind class="w-3.5 h-3.5 text-teal-500" />
            <div>
              <div class="text-[10px] text-slate-400">风速</div>
              <div class="font-semibold text-slate-700 dark:text-slate-200">{{ weather.current.windSpeed }} km/h</div>
            </div>
          </div>
        </div>

        <!-- 城市搜索与快捷切换 -->
        <div class="mt-2 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
          <!-- 城市搜索输入框与下拉结果 -->
          <div class="relative">
            <div class="relative flex items-center">
              <Search class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <input
                v-model="searchKeyword"
                @input="onSearchInput"
                @keydown.enter.prevent="onSearchEnter"
                type="text"
                placeholder="搜索任意城市 (如: 苏州、大连、青岛...)"
                class="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <Loader2 v-if="isSearching" class="w-3.5 h-3.5 text-blue-500 animate-spin absolute right-2.5" />
              <button
                v-else-if="searchKeyword"
                @click="clearSearch"
                class="absolute right-2 p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="清空搜索"
              >
                <X class="w-3 h-3" />
              </button>
            </div>

            <!-- 搜索匹配结果下拉面板 -->
            <div
              v-if="searchKeyword.trim() && (searchResults.length > 0 || hasSearched || isSearching)"
              class="absolute left-0 right-0 top-full mt-1.5 max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl z-20 divide-y divide-slate-100 dark:divide-slate-800/60 no-scrollbar"
            >
              <div v-if="isSearching && searchResults.length === 0" class="py-3 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                <Loader2 class="w-3.5 h-3.5 animate-spin text-blue-500" />
                <span>正在检索城市...</span>
              </div>
              <div v-else-if="hasSearched && searchResults.length === 0" class="py-3 text-center text-xs text-slate-400">
                未找到匹配城市，请尝试输入完整地名
              </div>
              <button
                v-for="res in searchResults"
                :key="res.lat + ',' + res.lon + res.name"
                @click="handleSelectCity(res)"
                class="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-blue-50/80 dark:hover:bg-slate-800/80 transition-colors cursor-pointer group"
              >
                <div class="flex items-center gap-1.5 truncate">
                  <MapPin class="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 shrink-0 transition-colors" />
                  <span class="font-medium text-xs text-slate-800 dark:text-slate-200">{{ res.name }}</span>
                  <span v-if="res.displaySubtext" class="text-[10px] text-slate-400 truncate">
                    ({{ res.displaySubtext }})
                  </span>
                </div>
                <span class="text-[10px] text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 shrink-0 font-medium transition-opacity">
                  选择锁定
                </span>
              </button>
            </div>
          </div>

          <!-- 热门城市快捷点选 -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[11px] font-medium text-slate-400">热门城市</span>
              <button
                @click="handleRedetectLocation"
                class="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                title="重新根据网络/GPS进行自动定位"
              >
                <LocateFixed class="w-3 h-3" />
                重新自动定位
              </button>
            </div>

            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="city in PRESET_CITIES"
                :key="city.name"
                @click="handleSelectCity(city)"
                class="px-2 py-0.5 rounded-md text-[11px] transition-colors cursor-pointer"
                :class="[
                  weather.location.name.includes(city.name)
                    ? 'bg-blue-600 text-white font-medium shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                ]"
              >
                {{ city.name }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
