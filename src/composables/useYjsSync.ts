// src/composables/useYjsSync.ts
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import type { Awareness } from 'y-protocols/awareness'

export type ConnectionState = 'connecting' | 'connected' | 'disconnected'

export interface YjsSyncAdapter {
    doc: Y.Doc
    provider: WebsocketProvider
    awareness: Awareness
    connectionState: { value: ConnectionState }
    destroy: () => void
}

export interface CreateYjsSyncOptions {
    url: string
    roomName: string
    doc?: Y.Doc
    onStateChange?: (state: ConnectionState) => void
}

/**
 * 纯命令式 Yjs WebSocket 生命周期工厂函数
 * 不含任何 Vue/Pinia 依赖，由调用方负责生命周期管理
 */
export function createYjsSync(options: CreateYjsSyncOptions): YjsSyncAdapter {
    const { url, roomName, doc: externalDoc, onStateChange } = options

    const doc = externalDoc ?? new Y.Doc()
    const provider = new WebsocketProvider(url, roomName, doc)
    const connectionState = { value: 'connecting' as ConnectionState }

    provider.on('status', ({ status }: { status: string }) => {
        let newState: ConnectionState = 'disconnected'
        if (status === 'connected') newState = 'connected'
        else if (status === 'connecting') newState = 'connecting'

        connectionState.value = newState
        onStateChange?.(newState)
    })

    return {
        doc,
        provider,
        awareness: provider.awareness,
        connectionState,
        destroy: () => {
            provider.destroy()
            if (!externalDoc) doc.destroy()
        },
    }
}