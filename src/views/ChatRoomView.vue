<script setup>
import ChatRoom from '../components/ChatRoomComponent.vue'
</script>

<template>
  <main>
    <h3 class="text-dark">{{this.room.roomName}}</h3>
    <ChatRoom/>
  </main>
</template>

<script>
import axios from 'axios';
    export default {
        name: 'ChatRoomView',
        data() {
            return {
                connection: null,
                room:{
                    id: '',
                    roomName: '',
                    admin: '',
                },
            }
        },
        mounted() {
        this.getRoom(this.$route.params.id);
        },
        watch: {
            '$route.params.id': function(newId) {
                this.getRoom(newId);
            }
        },
        methods:{
            getRoom(roomId){
                axios.get('https://localhost:7014/api/rooms/'+roomId)
                .then(res => {
                    this.room = res.data;
                })
            }
        }
    }

</script>
