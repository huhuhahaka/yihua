<!-- src/components/OnlineUsers.vue -->
<template>
    <!-- 直接依赖 store 的初始化状态，未连接时不渲染 -->
    <div v-if="collabStore.isInitialized" class="border p-2 rounded text-xs space-y-1 ">
        <div class="font-bold">在线用户 ({{ userStore.onlineCount }}):</div>
        <div class="flex flex-wrap gap-2">
      <span
          v-for="user in userStore.onlineUsers"
          :key="user.clientId"
          class="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded"
      >
        <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: user.color }"></span>
        {{ user.name }}
        <span class="text-gray-400">
          ({{ user.clientId === collabStore.awareness?.clientID ? '我' : user.clientId }})
        </span>
      </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import {useCollaborationStore} from '@/stores/collaboration'
import {useUserInfoStore} from '@/stores/userInfoStore'

const collabStore = useCollaborationStore()
const userStore = useUserInfoStore()
</script>
