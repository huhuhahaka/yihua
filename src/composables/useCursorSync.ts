// src/composables/useCursorSync.ts
import {onMounted, onUnmounted} from 'vue'
import {useCollaborationStore} from '@/stores/collaboration'
import {useUserInfoStore} from '@/stores/userInfoStore'

export function useCursorSync(autoBindGlobal = true) {
    const collabStore = useCollaborationStore()
    const userStore = useUserInfoStore()

    let rafId: number | null = null
    let lastX = 0
    let lastY = 0

    // 带有 requestAnimationFrame 节流的处理函数
    const handleMouseMove = (e: MouseEvent) => {
        lastX = e.clientX
        lastY = e.clientY

        // 如果已经有一个动画帧在等待，就不重复触发
        if (rafId !== null) return

        rafId = requestAnimationFrame(() => {
            if (collabStore.isInitialized) {
                userStore.updateCursor(lastX, lastY)
            }
            rafId = null
        })
    }

    if (autoBindGlobal) {
        onMounted(() => {
            window.addEventListener('mousemove', handleMouseMove)
        })

        onUnmounted(() => {
            window.removeEventListener('mousemove', handleMouseMove)
            if (rafId !== null) {
                cancelAnimationFrame(rafId)
            }
        })
    }

    return {
        // 如果不想全局自动绑定，可以拿到这个函数去模板里手动 @mousemove="handleMouseMove"
        handleMouseMove
    }
}
