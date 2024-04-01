import { createRouter, createWebHistory } from 'vue-router'
import ChatLobbyView from '../views/ChatLobbyView.vue'
import ChatPrivateView from '../views/ChatPrivateView.vue'

const router = createRouter({
    history: createWebHistory(
        import.meta.env.BASE_URL),
    routes: [{
            path: '/',
            name: 'lobby',
            component: ChatLobbyView
        },
        {
            path: '/chat/:id',
            name: 'chat',
            component: ChatPrivateView
        },
    ]
})

export default router