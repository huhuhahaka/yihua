// composables/useGraph.ts
import {
    Graph, Snapline, Transform, Clipboard,
    History, Selection, Scroller, Export
} from "@antv/x6";

/**
 * 初始化 X6 画布
 * @param container 主画布容器
 * @returns Graph 实例
 */
export const useGraph = (container: HTMLElement): Graph => {
    const graph = new Graph({
        container: container,
        autoResize: true,
        background: {color: '#F2F7FA'},
        grid: true,
        panning: false,
        mousewheel: {enabled: true, modifiers: ['ctrl', 'meta'], global: true},
    });

    // 插件注册
    graph.use(new History({enabled: true}));
    graph.use(new Snapline({enabled: true}));
    graph.use(new Scroller({enabled: true, pannable: true}));
    graph.use(new Clipboard({enabled: true, useLocalStorage: true}));
    graph.use(new Selection({
        enabled: true,
        rubberband: true,
        showNodeSelectionBox: true,
        modifiers: 'shift'
    }));
    graph.use(new Transform({
        resizing: {enabled: true, minWidth: 100, minHeight: 100},
        rotating: {enabled: true, grid: 15}
    }));
    graph.use(new Export());

    return graph;
};
