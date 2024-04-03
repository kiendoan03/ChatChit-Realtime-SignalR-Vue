import { createRouter, createWebHistory } from 'vue-router'
import ChatLobbyView from '../views/ChatLobbyView.vue'
import ChatRoomView from '../views/ChatRoomView.vue'
import ChatPrivateView from '../views/ChatPrivateView.vue'

const router = createRouter({
    history: createWebHistory(
        import.meta.env.BASE_URL),
    routes: [{
            path: '/chatLobby',
            name: 'lobby',
            component: ChatLobbyView
        },
        {
            path: '/chatRoom/:id',
            name: 'chatRoom',
            component: ChatRoomView
        },
        {
            path: '/chatPrivate/:id',
            name: 'chatPrivate',
            component: ChatPrivateView
        }

    ]
})

export default router