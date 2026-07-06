<script setup lang="ts">
import {ref, onMounted, watch} from 'vue'
import {useRouter} from 'vue-router'
import {useCollaborationStore} from '@/stores/collaboration'
import {useUserInfoStore} from '@/stores/userInfoStore'

const store = useCollaborationStore()
const userStore = useUserInfoStore()
const router = useRouter()

// 1. 本地状态管理
const url = ref('wss://yihua-websocket.up.railway.app')
const roomName = ref('test')
const userName = ref(`用户_${Math.floor(Math.random() * 1000)}`)
const isConnecting = ref(false) // 新增：连接中状态，防止重复点击

// 2. 生命周期：从 LocalStorage 加载上次的配置
onMounted(() => {
    const savedUrl = localStorage.getItem('ws_url')
    const savedRoom = localStorage.getItem('ws_room')
    const savedName = localStorage.getItem('ws_username')

    if (savedUrl) url.value = savedUrl
    if (savedRoom) roomName.value = savedRoom
    if (savedName) userName.value = savedName
})

// 3. 自动保存配置到 LocalStorage
watch([url, roomName, userName], ([newUrl, newRoom, newName]) => {
    localStorage.setItem('ws_url', newUrl)
    localStorage.setItem('ws_room', newRoom)
    localStorage.setItem('ws_username', newName)
})

function toggle() {
    if (store.isInitialized) {
        // --- 断开连接逻辑 ---
        store.disconnect()
    } else {
        // --- 连接逻辑 ---
        if (!url.value || !roomName.value || !userName.value) return

        isConnecting.value = true // 锁定按钮

        // 设置本地用户信息
        userStore.setLocalUser({name: userName.value, color: getRandomColor()})

        // 发起连接
        store.connect(url.value, roomName.value)

        // 监听连接结果
        const stopWatcher = watch(
            () => store.connectionState,
            (newState) => {
                if (newState === 'connected') {
                    // 成功：跳转并清理
                    router.push({name: 'Workbench'})
                    cleanup()
                } else if (newState === 'disconnected') {
                    // 失败：提示错误并重置状态
                    // 这里的 alert 仅作演示，建议使用更友好的消息提示组件 (如 Arco Design Message)
                    alert('连接房间失败，请检查 WebSocket URL 或网络连接')
                    cleanup()

                    // 确保如果连接失败，store 状态已重置，防止 UI 卡死
                    if (store.isInitialized) {
                        store.disconnect()
                    }
                }
                // 注意：不要在这里处理 'connecting' 状态，否则会导致重复触发
            }
        )

        // 清理函数
        const cleanup = () => {
            stopWatcher()
            isConnecting.value = false // 解锁按钮
        }
    }
}

// 辅助函数：生成随机颜色
function getRandomColor() {
    const letters = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }
    return color
}
</script>

<template>
    <div class="min-h-screen flex items-center justify-center relative bg-white text-gray-900">
        <!-- 扁平化：去除阴影，使用边框代替，去掉大圆角 -->
        <div class="p-8 bg-white border border-gray-300 max-w-md w-full space-y-5">

            <!-- 最上面的自定义图标位置 -->
            <div class="flex justify-center mb-6">
                <div class="flex items-center justify-center">
                    <img src="/logo.png" alt="协作空间图标" class="w-32 h-32 object-contain">
                </div>
            </div>

            <!-- 连接配置区 -->
            <div class="space-y-1">
                <label class="text-xs font-medium text-gray-600 uppercase tracking-wider">WebSocket 地址</label>
                <!-- 扁平化：去除圆角，聚焦时只改变边框颜色，无阴影 -->
                <input
                    v-model.trim="url"
                    placeholder="wss://..."
                    :disabled="store.isInitialized"
                    class="w-full border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
            </div>

            <div class="space-y-1">
                <label class="text-xs font-medium text-gray-600 uppercase tracking-wider">房间名称</label>
                <input
                    v-model.trim="roomName"
                    placeholder="输入房间名"
                    :disabled="store.isInitialized"
                    class="w-full border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
            </div>

            <div class="space-y-1">
                <label class="text-xs font-medium text-gray-600 uppercase tracking-wider">你的昵称</label>
                <input
                    v-model.trim="userName"
                    placeholder="输入昵称"
                    :disabled="store.isInitialized"
                    class="w-full border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
            </div>

            <!-- 操作按钮 -->
            <!-- 扁平化：纯色背景，无阴影，无圆角，简单的 hover 变深 -->
            <button
                @click="toggle"
                :disabled="!url || !roomName || !userName || isConnecting"
                class="w-full bg-blue-600 text-white px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors duration-200
                       disabled:bg-gray-300 disabled:cursor-not-allowed
                       hover:bg-blue-700"
            >
                <span v-if="isConnecting">连接中...</span>
                <span v-else>{{ store.isInitialized ? '断开连接' : '进入房间' }}</span>
            </button>
        </div>
    </div>
</template>

