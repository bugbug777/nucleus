import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Tool {
    id: string
    name: string
    component: string
    active: boolean
    detached: boolean
}

export const useCoreStore = defineStore('core', () => {
    const tools = ref<Tool[]>([
        {
            id: 'aqi',
            name: 'Air Quality Index',
            component: 'AqiTool',
            active: true,
            detached: false
        }
    ])

    const toggleToolDetached = (id: string) => {
        const tool = tools.value.find(t => t.id === id)
        if (tool) {
            tool.detached = !tool.detached
        }
    }

    return {
        tools,
        toggleToolDetached
    }
})
