<!-- src/components/ConnectionStatus.vue -->
<template>
    <p v-if="collabStore.connectionState !== 'disconnected'"
       class="text-sm flex items-center gap-1"
       :class="statusColorClass"
    >
        <span class="inline-block w-2 h-2 rounded-full" :class="dotColorClass"></span>
        状态: {{ statusText }}
    </p>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCollaborationStore } from '@/stores/collaboration'

const collabStore = useCollaborationStore()

// 将状态映射为中文
const statusText = computed(() => {
    switch (collabStore.connectionState) {
        case 'connecting':
            return '连接中...'
        case 'connected':
            return '已连接'
        default:
            return '已断开'
    }
})

// 根据状态返回不同的文字颜色
const statusColorClass = computed(() => {
    switch (collabStore.connectionState) {
        case 'connecting':
            return 'text-yellow-500'
        case 'connected':
            return 'text-green-500'
        default:
            return 'text-gray-500'
    }
})

// 小圆点的颜色
const dotColorClass = computed(() => {
    switch (collabStore.connectionState) {
        case 'connecting':
            return 'bg-yellow-500 animate-pulse' // 连接中加个闪烁动画
        case 'connected':
            return 'bg-green-500'
        default:
            return 'bg-gray-500'
    }
})
</script>
