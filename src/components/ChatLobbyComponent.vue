<script setup>

import { QChatMessage } from 'quasar'
import { QIcon } from 'quasar'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(fas)


</script>

<template >
  <div ref="scrollContainer" class="q-pa-md row scroll text-dark" style="height:36.69vmax;"  >
    <div  v-for="(message, index) in messages" :key="message.id" style="width: 100%;">
      <q-chat-message 
        name="Me"
        avatar="https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg"
        :size= "messageSize[index]"
        sent
        :stamp="[message.sendAt]"
        v-if="message.sender === this.user "
      >
      <div>
        <span v-for="(element, index) in message.content">
          <span v-if="typeof element === 'string'">{{ element }}</span>
          <img v-else-if="element.type === 'emoji'" :src="element.src" style="margin-left: 0.5vh; margin-right: 0.5vh;" class="emoji">
        </span>
      </div>
      
      
      </q-chat-message>
       <!--  -->
      <q-chat-message v-else
        :name="[message.sender]"
        avatar="https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg"
        :size = "messageSize[index]"
        :stamp="[message.sendAt]" 
      >
        <div>
          <span v-for="(element, index) in message.content">
            <span v-if="typeof element === 'string'">{{ element }}</span>
            <img v-else-if="element.type === 'emoji'" :src="element.src" style="margin-left: 0.5vh; margin-right: 0.5vh;" class="emoji">
          </span>
        </div>
      </q-chat-message>
      <!-- -->
    </div>
  </div>
  <div class="q-pa-md row justify-center" >
    <!-- <input type="text" v-model="user" placeholder="Type your name..."> -->
    <q-input filled bottom-slots v-model="text"  @keyup.enter="sendMessage" style="width: 100%;"  label="Type your message" :dense="dense">
        <template v-slot:before>
          <q-avatar>
            <img src="https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg">
          </q-avatar>
        </template>

        <template v-slot:append>
          <div v-if="text !== ''" name="close" @click="text = ''" class="cursor-pointer">
            <font-awesome-icon :icon="['fas', 'xmark']" />
          </div>
        </template>

        <template v-slot:after>
          <div round dense flat @click="sendMessage" class="cursor-pointer">
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
    name: 'ChatLobbyComponent',
  data() {
    return {
      connection: null,
      messages: [],
      text: "",
      user: "",
      userId: "",
      // now: Date.now(),
      messageSize: [], 
    };
   
  },
  created() {
    this.initSignalRConnection();
  },
  mounted() {
    this.getUser();
  },
  methods: {
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.scrollContainer;
        container.scrollTop = container.scrollHeight;
      });
    },
    initSignalRConnection() {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl("https://localhost:7014/chatHub")
        .build();

      this.connection.start().then(() => {
        console.log("Connected to SignalR Hub");
        this.listenForMessages();
        this.getHistory();
        this.listenForChatHistory();
      }).catch((error) => {
        console.error("Error connecting to SignalR Hub: ", error);
      });
    },
    getHistory() {
      this.connection.invoke("GetChatHistoryLobby")
      .catch((error) => {
        console.error("Error getting chat history: ", error);
      });
    },
    listenForChatHistory() {
      this.connection.on("ReceiveChatHistoryLobby", (messages) => {
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

          // Thêm tin nhắn vào mảng messages với nội dung đã được phân tích
          this.messages.push({
            sender: message.fromUser,
            content: messageElements,
            id: message.id,
            sendAt: elapsedTime
          });
        });

        this.calculateMessageSize();
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
      } else if (minutesElapsed > 0){
          return `${minutesElapsed} minutes ago`;
      } else if (secondsElapsed == 0){
          return `Just now`;
      } else if (secondsElapsed == 1){
          return `${secondsElapsed} second ago`;
      } else if (secondsElapsed > 1){
          return `${secondsElapsed} seconds ago`;
      } else {
          return `${secondsElapsed} seconds ago`;
      } 
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
     //còn lỗi chỉnh kích thước tin nhắn phần gửi đi này!!!!!
    listenForMessages() {
      this.connection.on("ReceiveMessage", (message) => {
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
          
        this.messages.push( {sender: message.fromUser, content: messageElements, sendAt: elapsedTime} );
        this.scrollToBottom();
        this.calculateMessageSize();
      });
    },
    sendMessage() {
      if (this.text.trim() !== "") {
        this.connection.invoke("SendMessage", this.userId, this.text)
          .then(() => {
            console.log("Message sent successfully");
            this.text = ""; // Clear input field after sending message
          })
          .catch((error) => {
            console.error("Error sending message: ", error);
          });
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