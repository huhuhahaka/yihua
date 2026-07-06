// useKeyboard.ts（X6 3.x）
import {Graph, Keyboard} from '@antv/x6'

const ZOOM_STEP = 0.2;

export interface UseKeyboardOptions {
    global?: boolean
    // 可按 3.x Keyboard 文档继续扩展
}

export const useKeyboard = (
    graph: Graph,
    options?: UseKeyboardOptions,
) => {
    const keyboard = new Keyboard({
        enabled: true,
        global: options?.global ?? false,
        // 其它配置...
    })

    graph.use(keyboard)

    // 绑定默认快捷键（和上面 2.x 的 bindDefaultKeys 一样）
    bindDefaultKeys(graph)

    return keyboard
}

// bindDefaultKeys 和上面实现相同，可直接复制过来
const bindDefaultKeys = (graph: Graph) => {
    graph.bindKey('mod+s', () => {
        // TODO: 2026/7/3 后续可添加 git 提交步骤 或 导出步骤
        return false;
    });
    graph.bindKey('mod+c', () => {
        const s = graph.getSelectedCells();
        if (s.length) graph.copy(s);
        return false;
    });
    graph.bindKey('mod+x', () => {
        const s = graph.getSelectedCells();
        if (s.length) graph.cut(s);
        return false;
    });
    graph.bindKey('mod+v', () => {
        graph.paste({offset: {dx: 20, dy: 20}});
        return false;
    });
    graph.bindKey('mod+z', () => {
        if (graph.canUndo()) graph.undo();
        return false;
    });
    graph.bindKey('mod+shift+z', () => {
        if (graph.canRedo()) graph.redo();
        return false;
    });
    graph.bindKey(['mod+a'], () => {
        const cells = graph.getCells()
        graph.select(cells)

        return false;
    });
    graph.bindKey(['delete', 'backspace'], () => {
        const cells = graph.getSelectedCells();
        if (cells.length) {
            graph.model.removeCells(cells);
        }
        return false;
    });
    graph.bindKey('esc', () => {
        graph.cleanSelection();
        return false;
    });

    // 放大
    graph.bindKey(['mod+]'], () => {
        const currentZoom = graph.zoom();
        const newZoom = Math.min(3, currentZoom + ZOOM_STEP);
        graph.zoomTo(newZoom);
        return false;
    });

    // 缩小
    graph.bindKey(['mod+['], () => {
        const currentZoom = graph.zoom();
        const newZoom = Math.max(0.2, currentZoom - ZOOM_STEP);
        graph.zoomTo(newZoom);
        return false;
    });

    // 恢复原始比例
    graph.bindKey(['mod+0'], () => {
        // 将画布中元素缩小或者放大一定级别，让画布正好容纳所有元素，可以通过 maxScale 配置最大缩放级别
        graph.zoomToFit({ maxScale: 1 });
        // 将画布中元素居中展示
        graph.centerContent();

        return false;
    });

}
