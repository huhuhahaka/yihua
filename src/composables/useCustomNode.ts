// src/composables/useCustomNode.ts
import { Graph } from '@antv/x6'

let isRegistered = false

export function useCustomNode() {
    if (isRegistered) return
    isRegistered = true

    Graph.registerNode('event-storming-node', {
        inherit: 'rect',
        width: 100,
        height: 100,
        markup: [
            { tagName: 'rect', selector: 'body' },
            // 标题：事件风暴分类标签
            { tagName: 'text', selector: 'label' },
            // 👈 新增的可编辑文本区域
            { tagName: 'text', selector: 'content' },
        ],
        attrs: {
            body: {
                fill: '#ffffff',
                stroke: '#333',
                strokeWidth: 1,
            },
            label: {
                fontSize: 10,
                textAnchor: 'start',
                textVerticalAnchor: 'top',
                refX: 3,
                refY: 3,
            },
            content: {
                textAnchor: 'middle',
                textVerticalAnchor: 'middle',
                refX: '50%',
                refY: '50%',
                text: '',
            },
        },
        // 👈 直接在节点定义中挂载 node-editor 工具
        tools: [
            {
                name: 'node-editor',
                args: {
                    // 字符串路径形式（官方支持），指向自定义的 content 文本元素
                    getText: 'content/text',
                    setText: 'content/text',
                    attrs: {
                        backgroundColor: 'transparent',
                    },
                },
            },
        ],
    })
}
