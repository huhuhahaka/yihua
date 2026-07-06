<script setup lang="ts">
import {onMounted, onUnmounted, ref} from 'vue';
import {Graph} from "@antv/x6";

import OnlineUsers from '@/components/OnlineUsers.vue'
import RemoteCursors from '@/components/RemoteCursors.vue'
import ConnectionStatus from '@/components/ConnectionStatus.vue'

import {useGraph} from "@/composables/useGraph.ts";
import {useStencil} from '@/composables/useStencil.ts'
import {useMiniMap} from "@/composables/useMiniMap.ts";
import {useCursorSync} from '@/composables/useCursorSync'
import {useKeyboard} from "@/composables/useKeyboard.ts";

// 👇 引入协同 Store 和同步逻辑
import {useCollaborationStore} from '@/stores/collaboration'
import {useGraphSync} from '@/composables/useGraphSync'

useCursorSync(true)
const collaborationStore = useCollaborationStore()

const stencilContainerRef = ref<HTMLElement>();
const containerRef = ref<HTMLElement>();
const minimapRef = ref<HTMLElement>();

let graph: Graph | null = null;
let resizeObserver: ResizeObserver | null = null

let destroySync: (() => void) | null = null

onMounted(() => {
    const container = containerRef.value;
    const stencilContainer = stencilContainerRef.value;
    const minimapContainer = minimapRef.value;

    if (!container || !stencilContainer || !minimapContainer) return;

    resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
            const {width, height} = entry.contentRect;

            if (width > 0 && height > 0) {
                graph = useGraph(container);
                useStencil(graph, stencilContainer);
                useMiniMap(graph, minimapContainer);
                useKeyboard(graph, {global: true});

                if (collaborationStore.doc) {
                    destroySync = useGraphSync(graph, collaborationStore.doc)
                } else {
                    console.warn('未检测到协同连接，画布以单机模式运行')
                }

                graph.on('resize', ({width, height}) => {
                    console.log('画布实时尺寸:', width, height)
                })

                resizeObserver?.disconnect();
            }
        }
    })

    resizeObserver.observe(container)
});

onUnmounted(() => {
    destroySync?.() // 👈 清理 Yjs 与 X6 的事件监听，防止内存泄漏
    graph?.dispose();
    graph = null;
});
</script>


<template>

    <div class="min-h-screen w-full relative">
        <a-layout style="height: 100vh;">
            <a-layout-header class="!h-auto !p-0 !leading-normal !bg-transparent">
                <OnlineUsers/>
            </a-layout-header>

            <a-layout-content>
                <a-splitter>
                    <a-splitter-panel defaultSize="2" collapsible style="position: relative;">
                        <div ref="stencilContainerRef" style="width: 100%; height: 100%;"></div>
                    </a-splitter-panel>

                    <a-splitter-panel defaultSize="6" collapsible>
                        <div style="width: 100%; height: 100%;">
                            <div ref="containerRef" style="width: 100%; height: 100%;"></div>
                        </div>
                    </a-splitter-panel>

                    <a-splitter-panel defaultSize="2" collapsible>
                        <div ref="minimapRef" style="width: 100%; height: 100%;"></div>
                    </a-splitter-panel>
                </a-splitter>
            </a-layout-content>

            <a-layout-footer>
                <ConnectionStatus/>
            </a-layout-footer>
        </a-layout>

        <RemoteCursors/>
    </div>

</template>


<style scoped>

</style>
