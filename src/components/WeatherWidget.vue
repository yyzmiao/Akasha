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
  X
} from 'lucide-vue-next'
import {
  fetchWeather,
  detectLocation,
  PRESET_CITIES,
  type WeatherSummary,
  type WeatherLocation
} from '../utils/weather'

const weather = ref<WeatherSummary | null>(null)
const isLoading = ref(false)
const isPopoverOpen = ref(false)
const widgetRef = ref<HTMLElement | null>(null)

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

// 加载天气数据
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

// 重新定位并刷新
async function handleRedetectLocation() {
  isLoading.value = true
  try {
    const loc = await detectLocation()
    const data = await fetchWeather(loc, true)
    weather.value = data
  } catch (e) {
    console.error('Redetect location failed', e)
  } finally {
    isLoading.value = false
  }
}

// 切换预设城市
async function handleSelectCity(city: WeatherLocation) {
  isLoading.value = true
  try {
    const data = await fetchWeather(city, true)
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
  }
}

onMounted(async () => {
  // 首次挂载立即尝试从缓存恢复并更新
  await loadWeatherData()
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="relative" ref="widgetRef">
    <!-- Navbar 紧凑微件按钮 -->
    <button
      @click="isPopoverOpen = !isPopoverOpen"
      class="group flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer select-none"
      :title="weather ? `${weather.location.name} · ${weather.characteristic.displayLabel} ${weather.current.temp}°C (点击查看详情)` : '获取天气中...'"
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
        <!-- 顶部：城市名、定位与操作 -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div class="flex items-center gap-1.5">
            <MapPin class="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span class="font-semibold text-sm tracking-tight text-slate-900 dark:text-white">
              {{ weather.location.name }}
            </span>
            <span
              class="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
            >
              {{ weather.location.isAuto ? '定位' : '已选' }}
            </span>
          </div>

          <div class="flex items-center gap-1">
            <!-- 刷新按钮 -->
            <button
              @click="loadWeatherData(true)"
              class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="刷新天气"
            >
              <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isLoading }" />
            </button>

            <!-- 关闭按钮 -->
            <button
              @click="isPopoverOpen = false"
              class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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

        <!-- 快速切换城市 -->
        <div class="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[11px] font-medium text-slate-400">切换城市</span>
            <button
              @click="handleRedetectLocation"
              class="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <MapPin class="w-3 h-3" />
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
    </transition>
  </div>
</template>
