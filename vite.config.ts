import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

import {AntdvNextResolver} from '@antdv-next/auto-import-resolver'
import Components from 'unplugin-vue-components/vite'

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
    plugins: [
        vue(),
        tailwindcss(),
        Components({
            resolvers: [AntdvNextResolver()],
            dts: true,
        }),
    ],
    resolve: {
        alias: {
            // ✅ 关键：必须用 resolve() 生成绝对路径
            '@': resolve(__dirname, 'src'),
        },
    },

    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    //
    // 1. prevent Vite from obscuring rust errors
    clearScreen: false,
    // 2. tauri expects a fixed port, fail if that port is not available
    server: {
        port: 1420,
        strictPort: true,
        host: host || false,
        hmr: host
            ? {
                protocol: "ws",
                host,
                port: 1421,
            }
            : undefined,
        watch: {
            // 3. tell Vite to ignore watching `src-tauri`
            ignored: ["**/src-tauri/**"],
        },
    },
}));
