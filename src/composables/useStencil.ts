// src/composables/useStencil.ts
import { Stencil } from '@antv/x6'
import type { Graph } from '@antv/x6'
import { useCustomNode } from './useCustomNode'

const EVENT_STORMING_NODES = [
    { label: '事件', color: 'orange' },
    { label: '命令', color: 'lightblue' },
    { label: '角色/参与者', color: 'yellow' },
    { label: '策略/规则', color: 'MediumOrchid' },
    { label: '聚合', color: 'lightyellow' },
    { label: '外部系统', color: 'pink' },
    { label: '读模型', color: 'lightgreen' },
]

export function useStencil(graph: Graph, container: HTMLElement): Stencil {
    // 👈 确保自定义节点已注册
    useCustomNode()

    const stencil = new Stencil({
        title: '模版',
        target: graph,
        stencilGraphHeight: 0,
        stencilGraphWidth: 200,
        collapsable: true,
        layoutOptions: { columns: 2, columnWidth: 120, rowHeight: 120, dx: 10, dy: 10 },
        groups: [{ title: '事件风暴', name: 'event-storming' }],
    })

    const buildNodes = (configs: { label: string; color: string }[]) =>
        configs.map((config) =>
            graph.createNode({
                shape: 'event-storming-node', // 👈 使用自定义节点
                attrs: {
                    body: { fill: config.color, stroke: '#333', strokeWidth: 1 },
                    label: { text: config.label }, // 标题
                    content: { text: '' },         // 可编辑区初始为空
                },
            }),
        )

    stencil.load(buildNodes(EVENT_STORMING_NODES), 'event-storming')
    container.appendChild(stencil.container)
    return stencil
}
