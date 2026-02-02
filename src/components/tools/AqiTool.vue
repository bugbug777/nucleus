<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RefreshCw, MapPin, Wind } from 'lucide-vue-next'
import { fetchAqiData, type AqiData } from '@/lib/aqi'
import { TAIWAN_STATIONS } from '@/lib/taiwan_stations'

const props = defineProps<{
  id: string
  isDetached: boolean
}>()

const aqiData = ref<AqiData | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const selectedStationUid = ref<string>('auto')

const token = import.meta.env.VITE_WAQI_TOKEN

const getBrowserLocation = (): Promise<{ lat: number, lng: number } | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      () => {
        resolve(null)
      },
      { timeout: 5000 }
    )
  })
}

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    if (!token) {
      error.value = 'API Token Missing. Please check your .env file.'
      loading.value = false
      return
    }
    
    const isAuto = selectedStationUid.value === 'auto'
    const uid = isAuto ? undefined : parseInt(selectedStationUid.value)
    
    let geo = undefined
    if (isAuto) {
      geo = await getBrowserLocation() || undefined
    }
    
    aqiData.value = await fetchAqiData(token, uid, geo)
  } catch (e) {
    error.value = 'Failed to load air quality data'
  } finally {
    loading.value = false
  }
}

watch(selectedStationUid, fetchData)

const status = computed(() => {
  if (!aqiData.value) return null
  const aqi = aqiData.value.aqi
  if (aqi <= 50) return { label: 'Good', label_zh: '良好', color: 'bg-green-500', text: 'text-green-500' }
  if (aqi <= 100) return { label: 'Moderate', label_zh: '普通', color: 'bg-yellow-500', text: 'text-yellow-500' }
  if (aqi <= 150) return { label: 'Unhealthy (Sensitive)', label_zh: '對敏感族群不健康', color: 'bg-orange-500', text: 'text-orange-500' }
  if (aqi <= 200) return { label: 'Unhealthy', label_zh: '不健康', color: 'bg-red-500', text: 'text-red-500' }
  if (aqi <= 300) return { label: 'Very Unhealthy', label_zh: '非常不健康', color: 'bg-purple-600', text: 'text-purple-600' }
  return { label: 'Hazardous', label_zh: '危害', color: 'bg-rose-900', text: 'text-rose-900' }
})

const displayStationName = computed(() => {
  if (selectedStationUid.value !== 'auto') {
    return TAIWAN_STATIONS.find(s => s.uid.toString() === selectedStationUid.value)?.name || '未知站點'
  }
  
  if (aqiData.value) {
    const cityName = aqiData.value.city.name
    // Extract name inside parentheses if available (common for Chinese station names in WAQI)
    const match = cityName.match(/\(([^)]+)\)/)
    if (match) return `${match[1]} (自動定位)`
    
    // Fallback: use first part of comma-separated string or full name
    return `${cityName.split(',')[0]} (自動定位)`
  }
  
  return '自動定位 (偵測中...)'
})

onMounted(fetchData)
</script>

<template>
  <div class="h-full flex flex-col">
    <div v-if="loading && !aqiData" class="space-y-4">
      <div class="flex justify-between items-start">
        <Skeleton class="h-4 w-32 bg-white/5" />
        <Skeleton class="h-4 w-16 bg-white/5" />
      </div>
      <div class="flex items-center gap-4 py-2">
        <Skeleton class="h-16 w-16 rounded-lg bg-white/5" />
        <div class="space-y-2">
          <Skeleton class="h-6 w-24 bg-white/5" />
          <Skeleton class="h-4 w-32 bg-white/5" />
        </div>
      </div>
      <div class="grid grid-cols-3 gap-2">
        <Skeleton class="h-12 w-full bg-white/5" />
        <Skeleton class="h-12 w-full bg-white/5" />
        <Skeleton class="h-12 w-full bg-white/5" />
      </div>
    </div>

    <div v-else-if="error" class="flex-1 flex flex-col items-center justify-center text-center space-y-4">
      <div class="p-3 rounded-full bg-red-500/10 text-red-400">
        <Wind class="w-6 h-6" />
      </div>
      <p class="text-sm text-gray-400">{{ error }}</p>
      <Button variant="outline" size="sm" @click="fetchData" class="border-white/10 hover:bg-white/5">
        Try Again
      </Button>
    </div>

    <div v-else-if="aqiData" class="flex-1 flex flex-col justify-between">
      <div class="space-y-6">
        <!-- Location Selection & Time -->
        <div class="flex justify-between items-center">
          <div class="flex-1 mr-4">
            <Select v-model="selectedStationUid">
              <SelectTrigger class="w-full h-7 bg-white/5 border-white/10 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:bg-white/10 transition-colors">
                <div class="flex items-center truncate">
                  <MapPin class="w-3 h-3 mr-1.5 shrink-0" />
                  <span class="truncate">{{ displayStationName }}</span>
                </div>
              </SelectTrigger>
              <SelectContent class="bg-black/90 border-white/10 text-white backdrop-blur-xl max-h-[300px]">
                <SelectGroup>
                  <SelectLabel class="text-[9px] uppercase tracking-widest text-gray-500 font-black px-2 py-1.5">偵測地點</SelectLabel>
                  <SelectItem value="auto" class="text-xs focus:bg-white/10 focus:text-white cursor-pointer py-2">
                    {{ displayStationName }}
                  </SelectItem>
                  <SelectItem v-for="station in TAIWAN_STATIONS" :key="station.uid" :value="station.uid.toString()" class="text-xs focus:bg-white/10 focus:text-white cursor-pointer py-2">
                    {{ station.name }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div class="text-gray-500 text-[10px] font-medium whitespace-nowrap">
            {{ aqiData.time.s.split(' ')[1] }}
          </div>
        </div>

        <!-- Main Visual -->
        <div class="flex items-center gap-5 relative group">
          <div v-if="loading" class="absolute inset-0 bg-black/20 backdrop-blur-[1px] rounded-2xl z-10 flex items-center justify-center">
             <RefreshCw class="w-5 h-5 animate-spin text-white/50" />
          </div>
          <div :class="['w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-black/20 transition-all duration-500', status?.color]">
            {{ aqiData.aqi }}
          </div>
          <div>
            <Badge variant="outline" :class="['mb-1 border-none shadow-none font-bold uppercase text-[10px] px-0', status?.text]">
              {{ status?.label_zh || status?.label }}
            </Badge>
            <div class="text-xs text-gray-400 font-medium">空氣品質指數</div>
          </div>
        </div>

        <!-- Metrics -->
        <div class="grid grid-cols-3 gap-3">
          <div class="bg-white/5 rounded-xl p-2 text-center border border-white/5 hover:border-white/10 transition-colors">
            <div class="text-[9px] text-gray-500 font-bold uppercase mb-1">PM2.5</div>
            <div class="text-sm font-semibold tracking-tight">{{ aqiData.iaqi.pm25?.v || 'N/A' }}</div>
          </div>
          <div class="bg-white/5 rounded-xl p-2 text-center border border-white/5 hover:border-white/10 transition-colors">
            <div class="text-[9px] text-gray-500 font-bold uppercase mb-1">PM10</div>
            <div class="text-sm font-semibold tracking-tight">{{ aqiData.iaqi.pm10?.v || 'N/A' }}</div>
          </div>
          <div class="bg-white/5 rounded-xl p-2 text-center border border-white/5 hover:border-white/10 transition-colors">
            <div class="text-[9px] text-gray-500 font-bold uppercase mb-1">Temp</div>
            <div class="text-sm font-semibold tracking-tight">{{ aqiData.iaqi.t?.v || '--' }}°C</div>
          </div>
        </div>
      </div>

      <!-- Action -->
      <div class="mt-6 flex justify-between items-center">
        <button @click="fetchData" :disabled="loading" class="text-[10px] font-bold text-nucleus-accent hover:opacity-80 transition-opacity flex items-center gap-1 uppercase tracking-widest disabled:opacity-50">
          <RefreshCw :class="['w-3 h-3', loading ? 'animate-spin' : '']" /> 重整數據
        </button>
        <div class="flex items-center gap-2">
           <span v-if="selectedStationUid !== 'auto'" class="text-[9px] text-gray-600 font-mono uppercase">UID: {{ aqiData.city.name.includes('@') ? aqiData.city.name.split('@')[1] : selectedStationUid }}</span>
           <span class="text-[9px] text-gray-600 font-mono" title="Location data is used only for proximity calculations via WAQI API and is not stored.">ID: {{ id }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
