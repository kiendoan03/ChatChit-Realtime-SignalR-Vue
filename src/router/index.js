import { createRouter, createWebHistory } from 'vue-router'
import ChatLobbyView from '../views/ChatLobbyView.vue'
import ChatRoomView from '../views/ChatRoomView.vue'

const router = createRouter({
    history: createWebHistory(
        import.meta.env.BASE_URL),
    routes: [{
            path: '/',
            name: 'lobby',
            component: ChatLobbyView
        },
        {
            path: '/chatRoom/:id',
            name: 'chatRoom',
            component: ChatRoomView
        }
    ]
})

export default router