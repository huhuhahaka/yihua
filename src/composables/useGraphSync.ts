// src/composables/useGraphSync.ts
import type { Graph, Node, Edge } from '@antv/x6'
import * as Y from 'yjs'

export function useGraphSync(graph: Graph, doc: Y.Doc) {
    const nodesMap = doc.getMap<any>('x6_nodes')
    const edgesMap = doc.getMap<any>('x6_edges')

    let isApplyingRemoteChanges = false

    // 1. 初始同步：加载远端已有数据
    isApplyingRemoteChanges = true
    nodesMap.forEach((nodeData) => {
        if (!graph.getCellById(nodeData.id)) {
            graph.addNode(nodeData)
        }
    })
    edgesMap.forEach((edgeData) => {
        if (!graph.getCellById(edgeData.id)) {
            graph.addEdge(edgeData)
        }
    })
    isApplyingRemoteChanges = false

    // 2. X6 -> Yjs
    const onNodeAdded = ({ node }: { node: Node }) => {
        if (isApplyingRemoteChanges || nodesMap.has(node.id)) return
        nodesMap.set(node.id, node.toJSON())
    }

    const onNodeRemoved = ({ node }: { node: Node }) => {
        if (isApplyingRemoteChanges) return
        nodesMap.delete(node.id)
    }

    const onNodeChangePosition = ({ node }: { node: Node }) => {
        if (isApplyingRemoteChanges || !nodesMap.has(node.id)) return
        const data = nodesMap.get(node.id)
        const pos = node.position()
        data.position = { x: pos.x, y: pos.y }
        nodesMap.set(node.id, data)
    }

    // 👈 文本编辑（content/text）也会触发 change:attrs
    const onNodeChangeAttrs = ({ node }: { node: Node }) => {
        if (isApplyingRemoteChanges || !nodesMap.has(node.id)) return
        const data = nodesMap.get(node.id)
        data.attrs = node.getAttrs()
        nodesMap.set(node.id, data)
    }

    const onEdgeAdded = ({ edge }: { edge: Edge }) => {
        if (isApplyingRemoteChanges || edgesMap.has(edge.id)) return
        edgesMap.set(edge.id, edge.toJSON())
    }

    const onEdgeRemoved = ({ edge }: { edge: Edge }) => {
        if (isApplyingRemoteChanges) return
        edgesMap.delete(edge.id)
    }

    graph.on('node:added', onNodeAdded)
    graph.on('node:removed', onNodeRemoved)
    graph.on('node:change:position', onNodeChangePosition)
    graph.on('node:change:attrs', onNodeChangeAttrs)
    graph.on('edge:added', onEdgeAdded)
    graph.on('edge:removed', onEdgeRemoved)

    // 3. Yjs -> X6
    const handleNodesChange = (event: Y.YMapEvent<any>) => {
        if (isApplyingRemoteChanges) return
        isApplyingRemoteChanges = true

        event.changes.keys.forEach((change, nodeId) => {
            const cell = graph.getCellById(nodeId) as Node | undefined
            switch (change.action) {
                case 'add': {
                    const newNodeData = nodesMap.get(nodeId)
                    if (newNodeData && !cell) {
                        graph.addNode(newNodeData)
                    }
                    break
                }
                case 'delete': {
                    if (cell) cell.remove()
                    break
                }
                case 'update': {
                    const updatedData = nodesMap.get(nodeId)
                    if (cell && updatedData) {
                        if (updatedData.position) {
                            cell.position(updatedData.position.x, updatedData.position.y)
                        }
                        if (updatedData.attrs) {
                            // 👈 整体 attrs 覆盖，包含 content 文本变化
                            cell.setAttrs(updatedData.attrs)
                        }
                    }
                    break
                }
            }
        })

        isApplyingRemoteChanges = false
    }

    const handleEdgesChange = (event: Y.YMapEvent<any>) => {
        if (isApplyingRemoteChanges) return
        isApplyingRemoteChanges = true

        event.changes.keys.forEach((change, edgeId) => {
            const cell = graph.getCellById(edgeId) as Edge | undefined
            switch (change.action) {
                case 'add': {
                    const newEdgeData = edgesMap.get(edgeId)
                    if (newEdgeData && !cell) {
                        graph.addEdge(newEdgeData)
                    }
                    break
                }
                case 'delete': {
                    if (cell) cell.remove()
                    break
                }
            }
        })

        isApplyingRemoteChanges = false
    }

    nodesMap.observe(handleNodesChange)
    edgesMap.observe(handleEdgesChange)

    // 4. 清理
    return () => {
        graph.off('node:added', onNodeAdded)
        graph.off('node:removed', onNodeRemoved)
        graph.off('node:change:position', onNodeChangePosition)
        graph.off('node:change:attrs', onNodeChangeAttrs)
        graph.off('edge:added', onEdgeAdded)
        graph.off('edge:removed', onEdgeRemoved)

        nodesMap.unobserve(handleNodesChange)
        edgesMap.unobserve(handleEdgesChange)
    }
}
