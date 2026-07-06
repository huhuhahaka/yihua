// src/stores/userInfoStore.ts
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useCollaborationStore } from './collaboration'

export interface UserInfo {
    name: string
    color: string
}

export interface OnlineUser extends UserInfo {
    clientId: number
    cursor?: { x: number; y: number }
    draggingNodeId?: string | null
}

export const useUserInfoStore = defineStore('userInfo', () => {
    const collabStore = useCollaborationStore()

    // ✅ 本地用户信息（UI 展示及初次同步使用）
    const localUser = ref<UserInfo>({
        name: '匿名用户',
        color: '#1890ff', // 默认颜色，实际可从接口或 localStorage 获取
    })

    // ✅ 在线用户列表镜像（Awareness 的响应式副本）
    const onlineUsers = ref<OnlineUser[]>([])
    const onlineCount = computed(() => onlineUsers.value.length)

    // 内部保留事件回调引用，以便精确解绑
    let awarenessChangeHandler: (() => void) | null = null

    /**
     * 设置本地用户信息，并同步到 Collaboration Store -> Yjs Awareness
     */
    function setLocalUser(user: UserInfo) {
        localUser.value = user
        collabStore.setLocalUser(user)
    }

    /**
     * 更新本地鼠标光标位置 (供 X6 画布 blank:mousemove 调用)
     */
    function updateCursor(x: number, y: number) {
        if (collabStore.awareness) {
            collabStore.awareness.setLocalStateField('cursor', { x, y })
        }
    }

    /**
     * 更新当前正在拖拽的 X6 节点 ID (供 X6 画布 node:mousedown / node:mouseup 调用)
     */
    function updateDraggingNode(nodeId: string | null) {
        if (collabStore.awareness) {
            collabStore.awareness.setLocalStateField('draggingNodeId', nodeId)
        }
    }

    /**
     * 核心：根据 Awareness 状态同步本地在线用户列表
     */
    function syncOnlineUsers() {
        const awareness = collabStore.awareness
        if (!awareness) {
            onlineUsers.value = []
            return
        }

        const users: OnlineUser[] = []
        awareness.getStates().forEach((state, clientId) => {
            // 只有包含 user 字段的才认为是有效在线用户
            if (state.user) {
                users.push({
                    clientId,
                    ...state.user,
                    cursor: state.cursor,
                    draggingNodeId: state.draggingNodeId || null,
                })
            }
        })
        onlineUsers.value = users
    }

    // ✅ 自动响应生命周期：当 collaboration store 中的 awareness 发生变化时（连接/断开），自动绑定/解绑监听
    watch(
        () => collabStore.awareness,
        (newAwareness, oldAwareness) => {
            // 1. 如果存在旧的 awareness，先解绑
            if (oldAwareness && awarenessChangeHandler) {
                oldAwareness.off('change', awarenessChangeHandler)
                awarenessChangeHandler = null
            }

            // 2. 如果有新的 awareness，绑定监听并初始化本地状态
            if (newAwareness) {
                awarenessChangeHandler = syncOnlineUsers
                newAwareness.on('change', awarenessChangeHandler)

                // 将本地用户信息写入新的 awareness 实例
                collabStore.setLocalUser(localUser.value)

                // 立即手动触发一次同步
                syncOnlineUsers()
            } else {
                onlineUsers.value = []
            }
        },
        { immediate: true }
    )

    return {
        localUser,
        onlineUsers,
        onlineCount,
        setLocalUser,
        updateCursor,
        updateDraggingNode,
    }
})
