<script setup>

import { QChatMessage } from 'quasar'
import { QIcon } from 'quasar'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(fas)


</script>

<template >
  <div ref="scrollContainer" class="q-pa-md row scroll text-dark" style="height:33.4vmax;"  >
    <div class="" v-for="message in messages" :key="message.id" style="width: 100%;">
      <q-chat-message 
        name="Me"
        avatar="https://cdn.quasar.dev/img/avatar4.jpg"
        :text="[message.content]"
        sent
        :stamp="[message.sendAt]"
        v-if="message.sender === this.user"
      />
       <!--  -->
      <q-chat-message v-else
        :name="[message.sender]"
        avatar="https://cdn.quasar.dev/img/avatar3.jpg"
        :text="[message.content]"
        :stamp="[message.sendAt]" 
      />
      <!-- <q-chat-message
        name="Jane"
        avatar="https://cdn.quasar.dev/img/avatar5.jpg"
        bg-color="primary"
      >
        <q-spinner-dots size="2rem" />
      </q-chat-message> -->
      <!-- -->
    </div>
  </div>
  <div class="q-pa-md row justify-center" >
    <!-- <input type="text" v-model="user" placeholder="Type your name..."> -->
    <q-input filled bottom-slots v-model="text"  @keyup.enter="sendMessageToRoom(this.room.id )" style="width: 100%;"  label="Type your message" :dense="dense">
        <template v-slot:before>
          <q-avatar>
            <img src="https://cdn.quasar.dev/img/avatar5.jpg">
          </q-avatar>
        </template>

        <template v-slot:append>
          <div v-if="text !== ''" name="close" @click="text = ''" class="cursor-pointer">
            <font-awesome-icon :icon="['fas', 'xmark']" />
          </div>
        </template>

        <template v-slot:after>
          <div round dense flat @click="sendMessageToRoom(this.room.id )" class="cursor-pointer">
            <font-awesome-icon :icon="['fas', 'paper-plane']" />
          </div>
        </template>
    </q-input>
    <!-- <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type your message..."> -->
    <!-- <button type="button" @click="sendMessage">Send</button> -->
  </div>
  
</template>

<script>
  import * as signalR from "@aspnet/signalr";

export default {
    name: 'ChatRoomComponent',
  data() {
    return {
      connection: null,
      messages: [],
      text: "",
      user: "",
      userId: "",
      room: {
        id: '',
        roomName: '',
        admin: '',
      },
      now: Date.now(),
      // initSignalR : false
      // isListeningForMessages: false,
    };
   
  },
  created() {
    this.initSignalRConnection(this.$route.params.id);
  },
  mounted() {
    this.getUser();
    this.room.id = this.$route.params.id;
  },
  watch: {
            '$route.params.id': function(newId, oldId ) {
              if (newId !== oldId){
                this.room.id ='';
                this.room.id = newId; 
                this.messages = [];
                // if (this.isListeningForMessages) {
                  this.disconnectSignalRConnection();
                //   this.isListeningForMessages = false;
                // }
                this.initSignalRConnection(newId);
                this.sendMessageToRoom(newId);
              }
            }
        },
  methods: {
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.scrollContainer;
        container.scrollTop = container.scrollHeight;
      });
    },
    initSignalRConnection(roomId) {
      this.disconnectSignalRConnection(); 
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl("https://localhost:7014/chatHub")
        .build();

      this.connection.start().then(() => {
        console.log("Connected to SignalR Hub");
        this.listenForMessages(roomId);
        this.getHistoryChatRoom(roomId);
        this.listenForHistoryChatRoom();
      }).catch((error) => {
        console.error("Error connecting to SignalR Hub: ", error);
      });
    },
    disconnectSignalRConnection() {
      if (this.connection && this.connection.state && this.connection.state === signalR.HubConnectionState.Connected) {
        console.log("Disconnecting from SignalR Hub");
        this.connection.stop().then(() => {
          console.log("Disconnected from SignalR Hub");
        }).catch((error) => {
          console.error("Error disconnecting from SignalR Hub: ", error);
        });
      } else {
        console.log("SignalR connection is not established or already disconnected");
      }
    },
    listenForMessages(roomId) {
      // if (!this.isListeningForMessages) {
      //   this.isListeningForMessages = true;
        if (this.connection) {
          this.connection.off("ReceiveMessageRoom" + roomId);
          this.connection.on("ReceiveMessageRoom" + roomId, (message) => {
            if (this.room.id === roomId) {
              // Kiểm tra xem tin nhắn đã tồn tại trong mảng hay chưa trước khi thêm vào
              if (!this.messages.some(msg => msg.sender === message.fromUser && msg.content === message.content && msg.id === message.id)) {
                const elapsedTime = this.calculateElapsedTime(message.sendAt);
                this.messages.push({ sender: message.fromUser, content: message.content, id: message.id, sendAt: elapsedTime});
                console.log(message);
                this.scrollToBottom();
              }
            }
          });
        // }
      }
    },
    sendMessageToRoom(roomId) {
        try {
            if (this.text.trim() !== "") {
                console.log("Sending message to room...");
                this.connection.invoke("SendToRoom", this.userId,roomId, this.text)
                    .then(() => {
                        console.log("Message sent successfully");
                        this.text = ""; // Clear input field after sending message
                    })
                    .catch((error) => {
                        console.error("Error sending message: ", error);
                        // Xử lý lỗi ở đây
                    });
            }
        } catch (error) {
            console.error("Error sending message: ", error);
            // Xử lý lỗi ở đây
        }
    },
    getHistoryChatRoom(roomId){
        this.connection.invoke("GetHistoryChatRoom", roomId)
        .catch((error) => {
            console.error("Error getting chat history: ", error);
        });
    },
    listenForHistoryChatRoom(){
        this.connection.on("ReceiveChatHistoryRoom", (messages) => {
            // Cập nhật dữ liệu lịch sử chat
            messages.forEach(message => {
              const elapsedTime = this.calculateElapsedTime(message.sendAt);
              this.messages.push( {sender:message.fromUser,content:message.content, sendAt: elapsedTime} );
            });
            this.scrollToBottom();
        }); 
    },
    calculateElapsedTime(sentAt) {
      const now = new Date(); // Thời gian hiện tại
      const sentTime = new Date(sentAt); // Thời gian gửi tin nhắn
      const elapsed = now - sentTime; // Thời gian trôi qua (đơn vị: mili giây)

      // Chuyển đổi thời gian trôi qua thành đơn vị phù hợp (ví dụ: phút, giờ, ngày)
      const secondsElapsed = Math.floor(elapsed / 1000); // 1000 mili giây = 1 giây
      const minutesElapsed = Math.floor(elapsed / 60000); // 60000 mili giây = 1 phút
      const hoursElapsed = Math.floor(elapsed / 3600000); // 3600000 mili giây = 1 giờ
      const daysElapsed = Math.floor(elapsed / 86400000); // 86400000 mili giây = 1 ngày
      const yearsElapsed = Math.floor(elapsed / 31536000000); // 31536000000 mili giây = 1 năm

      // Trả về thời gian trôi qua dưới dạng chuỗi để hiển thị cho người dùng
      if (yearsElapsed > 0) {
          return `${yearsElapsed} years ago`;
      } else if (daysElapsed > 0) {
          return `${daysElapsed} days ago`;
      } else if (hoursElapsed > 0) {
          return `${hoursElapsed} hours ago`;
      } else  if (minutesElapsed > 0){
          return `${minutesElapsed} minutes ago`;
      } else if (secondsElapsed == 0){
          return `Just now`;
      } else if (secondsElapsed == 1){
          return `${secondsElapsed} second ago`;
      } else if (secondsElapsed > 1){
          return `${secondsElapsed} seconds ago`;
      } 
    },
    getUser() {
      if (localStorage.getItem('token')){
        this.user = localStorage.getItem('displayName');
        this.userId = localStorage.getItem('userId');
        console.log(this.user);
        console.log(this.userId);
      }
    }
  }
};
</script>

<style scoped>

</style>
