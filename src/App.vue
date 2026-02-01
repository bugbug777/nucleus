<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { useCoreStore } from '@/stores/core'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Maximize2, Minimize2, X, Plus } from 'lucide-vue-next'

const coreStore = useCoreStore()

// Dynamic component mapping
const components: Record<string, any> = {
  AqiTool: defineAsyncComponent(() => import('@/components/tools/AqiTool.vue'))
}
</script>

<template>
  <TooltipProvider>
    <div class="min-h-screen bg-nucleus-bg text-white p-6 font-sans">
      <!-- Header -->
      <header class="max-w-7xl mx-auto mb-10 flex justify-between items-center">
        <div>
          <h1 class="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-nucleus-accent to-purple-400">
            Nucleus Core
          </h1>
          <p class="text-gray-400 mt-2 font-medium tracking-wide">Personal Management Environment</p>
        </div>
        <div class="flex gap-4">
          <Button variant="outline" class="bg-nucleus-card border-white/10 hover:bg-white/5 text-white">
            <Plus class="w-4 h-4 mr-2" /> Add Tool
          </Button>
        </div>
      </header>

      <!-- Main Grid -->
      <main class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="tool in coreStore.tools" :key="tool.id" 
             :class="[
               'bg-nucleus-card/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl transition-all duration-500 group relative',
               tool.detached ? 'fixed z-50 shadow-nucleus-accent/20' : 'relative'
             ]">
          <!-- Tool Header/Controls -->
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg font-semibold tracking-tight">{{ tool.name }}</h2>
            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button variant="ghost" size="icon" class="h-8 w-8 text-gray-400 hover:text-nucleus-accent" @click="coreStore.toggleToolDetached(tool.id)">
                    <component :is="tool.detached ? Minimize2 : Maximize2" class="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{{ tool.detached ? 'Attach to Grid' : 'Detach Window' }}</TooltipContent>
              </Tooltip>
              <Button variant="ghost" size="icon" class="h-8 w-8 text-gray-400 hover:text-red-400">
                <X class="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <!-- Tool Body -->
          <div class="min-h-[160px]">
            <component 
              :is="components[tool.component]" 
              :id="tool.id"
              :is-detached="tool.detached"
            />
          </div>
        </div>
      </main>

      <!-- Footer Info -->
      <footer class="fixed bottom-6 right-6">
        <div class="text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-nucleus-card/80 backdrop-blur px-4 py-1.5 rounded-full border border-white/5">
          Nucleus v1.0.0-alpha
        </div>
      </footer>
    </div>
  </TooltipProvider>
</template>

<style>
body {
  margin: 0;
  background-color: #0f172a;
  overflow-x: hidden;
}

/* Custom glow effect for detached tools */
.shadow-nucleus-accent\/20 {
  box-shadow: 0 0 40px -10px rgba(56, 189, 248, 0.2);
}
</style>
