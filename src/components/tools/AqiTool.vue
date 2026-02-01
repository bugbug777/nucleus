<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { RefreshCw, MapPin, Wind } from 'lucide-vue-next'
import { fetchAqiData, type AqiData } from '@/lib/aqi'

const props = defineProps<{
  id: string
  isDetached: boolean
}>()

const aqiData = ref<AqiData | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const token = import.meta.env.VITE_WAQI_TOKEN || 'demo'

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    aqiData.value = await fetchAqiData(token)
  } catch (e) {
    error.value = 'Failed to load air quality data'
  } finally {
    loading.value = false
  }
}

const status = computed(() => {
  if (!aqiData.value) return null
  const aqi = aqiData.value.aqi
  if (aqi <= 50) return { label: 'Good', color: 'bg-green-500', text: 'text-green-500' }
  if (aqi <= 100) return { label: 'Moderate', color: 'bg-yellow-500', text: 'text-yellow-500' }
  if (aqi <= 150) return { label: 'Unhealthy (Sensitive)', color: 'bg-orange-500', text: 'text-orange-500' }
  if (aqi <= 200) return { label: 'Unhealthy', color: 'bg-red-500', text: 'text-red-500' }
  if (aqi <= 300) return { label: 'Very Unhealthy', color: 'bg-purple-600', text: 'text-purple-600' }
  return { label: 'Hazardous', color: 'bg-rose-900', text: 'text-rose-900' }
})

onMounted(fetchData)
</script>

<template>
  <div class="h-full flex flex-col">
    <div v-if="loading" class="space-y-4">
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
        <!-- Location & Time -->
        <div class="flex justify-between items-start">
          <div class="flex items-center text-gray-400 text-[10px] font-bold uppercase tracking-wider">
            <MapPin class="w-3 h-3 mr-1" />
            {{ aqiData.city.name.split(',')[0] }}
          </div>
          <div class="text-gray-500 text-[10px] font-medium">
            {{ aqiData.time.s.split(' ')[1] }}
          </div>
        </div>

        <!-- Main Visual -->
        <div class="flex items-center gap-5">
          <div :class="['w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-black/20', status?.color]">
            {{ aqiData.aqi }}
          </div>
          <div>
            <Badge variant="outline" :class="['mb-1 border-none shadow-none font-bold uppercase text-[10px] px-0', status?.text]">
              {{ status?.label }}
            </Badge>
            <div class="text-xs text-gray-400 font-medium">Air Quality Index</div>
          </div>
        </div>

        <!-- Metrics -->
        <div class="grid grid-cols-3 gap-3">
          <div class="bg-white/5 rounded-xl p-2 text-center border border-white/5">
            <div class="text-[9px] text-gray-500 font-bold uppercase mb-1">PM2.5</div>
            <div class="text-sm font-semibold tracking-tight">{{ aqiData.iaqi.pm25?.v || 'N/A' }}</div>
          </div>
          <div class="bg-white/5 rounded-xl p-2 text-center border border-white/5">
            <div class="text-[9px] text-gray-500 font-bold uppercase mb-1">PM10</div>
            <div class="text-sm font-semibold tracking-tight">{{ aqiData.iaqi.pm10?.v || 'N/A' }}</div>
          </div>
          <div class="bg-white/5 rounded-xl p-2 text-center border border-white/5">
            <div class="text-[9px] text-gray-500 font-bold uppercase mb-1">Temp</div>
            <div class="text-sm font-semibold tracking-tight">{{ aqiData.iaqi.t?.v || '--' }}°C</div>
          </div>
        </div>
      </div>

      <!-- Action -->
      <div class="mt-6 flex justify-between items-center">
        <button @click="fetchData" class="text-[10px] font-bold text-nucleus-accent hover:opacity-80 transition-opacity flex items-center gap-1 uppercase tracking-widest">
          <RefreshCw class="w-3 h-3" /> Refresh
        </button>
        <span class="text-[9px] text-gray-600 font-mono">ID: {{ id }}</span>
      </div>
    </div>
  </div>
</template>
