// src/stores/collaboration.ts
import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import * as Y from 'yjs'
// ✅ Store 只从 barrel export 引用，不直接依赖具体文件名
import { createYjsSync } from '@/composables'
import type { YjsSyncAdapter, ConnectionState } from '@/composables'
import type { Awareness } from 'y-protocols/awareness'

// Vite HMR 保护：热更新时销毁旧连接，防止 WebSocket 泄漏
let _adapter: YjsSyncAdapter | null = null
if (import.meta.hot) {
    import.meta.hot.dispose(() => {
        _adapter?.destroy()
        _adapter = null
    })
}

export const useCollaborationStore = defineStore('collaboration', () => {
    // ✅ 仅状态进入 Vue 响应式系统
    const connectionState = ref<ConnectionState>('disconnected')
    const isInitialized = ref(false)

    // ✅ Yjs 实例用 shallowRef，绝不被深度代理
    const doc = shallowRef<Y.Doc | null>(null)
    const awareness = shallowRef<Awareness | null>(null)

    // ---------- 核心方法 ----------
    function connect(url: string, roomName: string) {
        if (_adapter) return

        _adapter = createYjsSync({
            url,
            roomName,
            onStateChange: (state) => {
                connectionState.value = state
            },
        })

        doc.value = _adapter.doc
        awareness.value = _adapter.awareness
        isInitialized.value = true
    }

    function disconnect() {
        _adapter?.destroy()
        _adapter = null
        doc.value = null
        awareness.value = null
        connectionState.value = 'disconnected'
        isInitialized.value = false
    }

    // ---------- 业务语义封装 ----------
    function setLocalUser(user: { name: string; color: string }) {
        _adapter?.awareness.setLocalStateField('user', user)
    }

    function getText(name: string): Y.Text | null {
        return _adapter?.doc.getText(name) ?? null
    }

    function getMap<T = unknown>(name: string): Y.Map<T> | null {
        return _adapter?.doc.getMap(name) ?? null
    }

    return {
        connectionState,
        isInitialized,
        doc,
        awareness,
        connect,
        disconnect,
        setLocalUser,
        getText,
        getMap,
    }
})