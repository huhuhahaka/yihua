<!-- src/components/RemoteCursors.vue -->
<template>
    <div class="fixed inset-0 pointer-events-none z-[9999]">
        <div v-for="user in userStore.onlineUsers" :key="user.clientId">
            <!-- 过滤自己，且要求有坐标 -->
            <div
                v-if="user.cursor && user.clientId !== collabStore.awareness?.clientID"
                class="absolute transition-all duration-75 ease-out"
                :style="{ left: user.cursor.x + 'px', top: user.cursor.y + 'px' }"
            >
                <!-- SVG 模拟鼠标指针 -->
<!--                <svg width="20" height="20" viewBox="0 0 16 16" :fill="user.color" xmlns="http://www.w3.org/2000/svg">-->
<!--                    <path d="M0 0 L16 16 L16 8 L0 0 Z" stroke="white" stroke-width="0.5" />-->
<!--                </svg>-->
                <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: user.color }"></div>
                <span
                    class="absolute left-3 top-3 text-xs text-white px-1.5 py-0.5 rounded whitespace-nowrap shadow"
                    :style="{ backgroundColor: user.color }"
                >
          {{ user.name }}
        </span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useUserInfoStore } from '@/stores/userInfoStore'
import { useCollaborationStore } from '@/stores/collaboration'

const userStore = useUserInfoStore()
const collabStore = useCollaborationStore()
</script>
