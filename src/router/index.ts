// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import Workbench from '@/views/Workbench.vue' // 根据你的实际路径调整
import YjsConnectPage from '@/views/YjsConnectPage.vue' // 根据你的实际路径调整

const routes = [
    // ... 其他路由
    {
        path: '/',
        name: 'Home',
        component: YjsConnectPage
    },
    {
        path: '/workbench',
        name: 'Workbench', // 确保这里的 name 和代码里 router.push({ name: 'Workbench' }) 一致
        component: Workbench
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
