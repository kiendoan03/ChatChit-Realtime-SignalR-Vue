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
    <div class="" v-for="(message, index) in messages" :key="message.id" style="width: 100%;">
      <q-chat-message 
        name="Me"
        :size = "messageSize[index]"
        sent
        :stamp="[message.sendAt]"
        v-if="message.sender === this.user"
      >
        <template v-slot:avatar >
            <q-avatar color="pink-3" text-color="white"  class="q-message-avatar q-message-avatar--sent">
              {{ generateAvatarFromName(this.user) }}
            </q-avatar>
          </template>
        <div>
          <template v-for="(element, index) in message.content">
            <span v-if="typeof element === 'string'">{{ element }}</span>
            <img v-else-if="element.type === 'emoji'" :src="element.src" style="margin-left: 0.5vh; margin-right: 0.5vh;" class="emoji">
          </template>
        </div>
      </q-chat-message>
       <!--  -->
      <q-chat-message v-else
        :name="[message.sender]"
        :size = "messageSize[index]"
        :stamp="[message.sendAt]" 
      >
      <template v-slot:avatar >
          <q-avatar color="primary" text-color="white"   class="q-message-avatar q-message-avatar--received">
            {{ generateAvatarFromName(message.sender) }}
          </q-avatar>
      </template>
        <div>
          <template v-for="(element, index) in message.content">
            <span v-if="typeof element === 'string'">{{ element }}</span>
            <img v-else-if="element.type === 'emoji'" :src="element.src" style="margin-left: 0.5vh; margin-right: 0.5vh;" class="emoji">
          </template>
        </div>
      </q-chat-message>

    </div>
  </div>
  <div class="q-pa-md row justify-center" >
    <!-- <input type="text" v-model="user" placeholder="Type your name..."> -->
    <q-input filled bottom-slots v-model="text"  @keyup.enter="sendMessageToRoom(this.room.id )" style="width: 100%;"  label="Type your message" :dense="dense">
        <template v-slot:before>
          <q-avatar color="pink-3" text-color="white">
            {{ generateAvatarFromName(this.user) }}
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
      messageSize: [], 
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
                this.disconnectSignalRConnection();
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
    generateAvatarFromName(name) {
        const words = name.split(' ');
        let avatar = '';
        words.forEach(word => {
            if (word.length > 0) {
                avatar += word[0];
            }
        });
        return avatar.toUpperCase();
    },
    listenForMessages(roomId) {
        if (this.connection) {
          this.connection.off("ReceiveMessageRoom" + roomId);
          this.connection.on("ReceiveMessageRoom" + roomId, (message) => {
            if (this.room.id === roomId) {
              // Kiểm tra xem tin nhắn đã tồn tại trong mảng hay chưa trước khi thêm vào
              if (!this.messages.some(msg => msg.sender === message.fromUser && msg.content === message.content && msg.id === message.id)) {
                const elapsedTime = this.calculateElapsedTime(message.sendAt);
                let messageContent = message.content;

                const messageElements = []; // Mảng để chứa các phần tử của tin nhắn

                // Kiểm tra nếu tin nhắn chứa hình ảnh
                const imageRegex = /<img.*?class="emoji".*?src="(.*?)".*?>/g;
                let match;
                let lastIndex = 0;

                while ((match = imageRegex.exec(messageContent)) !== null) {
                  // Thêm văn bản trước hình ảnh (nếu có)
                  if (match.index > lastIndex) {
                    messageElements.push(messageContent.substring(lastIndex, match.index));
                  }
                  // Thêm hình ảnh
                  messageElements.push({ type: 'emoji', src: match[1] });
                  lastIndex = imageRegex.lastIndex;
                }
                // Thêm văn bản cuối cùng (nếu có)
                if (lastIndex < messageContent.length) {
                  messageElements.push(messageContent.substring(lastIndex));
                }
                this.messages.push({ sender: message.fromUser, content: messageElements, id: message.id, sendAt: elapsedTime});
                console.log(message);
                this.scrollToBottom();
                this.calculateMessageSize();
              }
            }
          });
      }
    },
    sendMessageToRoom(roomId) {
        try {
            if (this.text.trim() !== "") {
                console.log("Sending message to room...");
                this.connection.invoke("SendToRoom", this.userId,roomId, this.text)
                    .then(() => {
                        console.log("Message sent successfully");
                        this.text = ""; 
                    })
                    .catch((error) => {
                        console.error("Error sending message: ", error);
                    });
            }
        } catch (error) {
            console.error("Error sending message: ", error);
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
            messages.forEach(message => {
              const elapsedTime = this.calculateElapsedTime(message.sendAt);
              let messageContent = message.content;

              const messageElements = []; // Mảng để chứa các phần tử của tin nhắn

              // Kiểm tra nếu tin nhắn chứa hình ảnh
              const imageRegex = /<img.*?class="emoji".*?src="(.*?)".*?>/g;
              let match;
              let lastIndex = 0;

              while ((match = imageRegex.exec(messageContent)) !== null) {
                // Thêm văn bản trước hình ảnh (nếu có)
                if (match.index > lastIndex) {
                  messageElements.push(messageContent.substring(lastIndex, match.index));
                }
                // Thêm hình ảnh
                messageElements.push({ type: 'emoji', src: match[1] });
                lastIndex = imageRegex.lastIndex;
              }

              // Thêm văn bản cuối cùng (nếu có)
              if (lastIndex < messageContent.length) {
                messageElements.push(messageContent.substring(lastIndex));
              }

              this.messages.push({
                sender: message.fromUser,
                content: messageElements,
                id: message.id,
                sendAt: elapsedTime
              });
            });
            this.scrollToBottom();
            this.calculateMessageSize();
        }); 
        console.log(this.messages);
    },
    calculateMessageSize() {
      this.messages.forEach(message => {
        let size = 1; 
        message.content.forEach(item => {
          if (typeof item === 'string') {
            const itemLength = item.length;
            if (itemLength < 50) {
              size = 1.5; 
            } else if (itemLength < 100) {
              size = 3; 
            } else {
              size = 5; 
            }
          } else if (item && item.type === 'emoji') {
              size = 1.5;
          }
        });
        // Thêm kích thước vào mảng messageSize
        this.messageSize.push(size);
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
