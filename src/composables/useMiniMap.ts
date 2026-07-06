// composables/useMiniMap.ts
import { Graph } from "@antv/x6";
import { MiniMap } from "@antv/x6";

/**
 * 初始化 MiniMap 插件并注册到 Graph
 * @param graph X6 Graph 实例
 * @param container MiniMap 挂载的 DOM 容器
 * @returns MiniMap 实例 (如果后续需要操作 MiniMap 可以使用)
 */
export const useMiniMap = (graph: Graph, container: HTMLElement) => {
    const minimap = new MiniMap({
        container: container,
        // 这里可以添加 MiniMap 的特定配置
        // width: 200,
        // height: 160,
        // padding: 10
    });

    // 直接在函数内部进行注册
    graph.use(minimap);

    return minimap;
};
