<template>
  <div>
    <!-- Chat container -->
    <div class="chat-container" ref="chatContainer"></div>
    
    <!-- Typing container -->
    <div class="typing-container">
      <div class="typing-content">
        <div class="typing-textarea">
          <!-- Bind chatInputValue model to the textarea and adjustChatInput & handleKeyDown methods to respective events -->
          <textarea 
            ref="chatInput"
            v-model="chatInputValue" 
            @input="adjustChatInput" 
            @keydown="handleKeyDown" 
            spellcheck="false" 
            placeholder="Enter a prompt here" 
            required
          ></textarea>
          <!-- Bind handleOutgoingChat method to the click event of the send button -->
          <span @click="handleOutgoingChat">➡️</span>
        </div>
        <div class="typing-controls">
          <span @click="deleteChats" ref="themeButton" >🗑</span>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  data() {
    return {
      chatInputValue: '',
      initialInputHeight: 0,
      API_KEY: '{{VUE_APP_API_KEY}}',
    };
  },
  mounted() {
    this.loadDataFromLocalstorage();
    this.initialInputHeight = this.$refs.chatInput.scrollHeight;
  },
  methods: {
    loadDataFromLocalstorage() {
      const defaultText = `<div class="default-text"><h1>ChatGPT Clone</h1><p>Start a conversation and explore the power of AI.<br> Your chat history will be displayed here.</p></div>`;
      this.$refs.chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
      this.$refs.chatContainer.scrollTo(0, this.$refs.chatContainer.scrollHeight);
    },
    async getChatResponse(incomingChatDiv) {
      const API_URL = "https://api.openai.com/v1/completions";
      const pElement = document.createElement("p");
      console.log(`Bearer ${this.API_KEY}`)
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          model: "text-davinci-003",
          prompt: this.chatInputValue,
          max_tokens: 2048,
          temperature: 0.2,
          n: 1,
          stop: null
        })
      };

      try {
        const response = await (await fetch(API_URL, requestOptions)).json();
        pElement.textContent = response.choices[0].text.trim();
      } catch (error) {
        pElement.classList.add("error");
        pElement.textContent = "Oops! Something went wrong while retrieving the response. Please try again.";
      }

      incomingChatDiv.querySelector(".typing-animation").remove();
      incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
      localStorage.setItem("all-chats", this.$refs.chatContainer.innerHTML);
      this.$refs.chatContainer.scrollTo(0, this.$refs.chatContainer.scrollHeight);
    },
    handleOutgoingChat() {
      if(!this.chatInputValue) return;

      const userImage = require('@/assets/user.jpg');
      const html = `<div class="chat-content"><div class="chat-details"><img src="${userImage}" alt="user-img"><p>${this.chatInputValue}</p></div></div>`;

      const outgoingChatDiv = this.createChatElement(html, "outgoing");
      this.$refs.chatContainer.querySelector(".default-text")?.remove();
      this.$refs.chatContainer.appendChild(outgoingChatDiv);
      this.$refs.chatContainer.scrollTo(0, this.$refs.chatContainer.scrollHeight);
      setTimeout(this.showTypingAnimation, 500);
    },
    createChatElement(content, className) {
      const chatDiv = document.createElement("div");
      chatDiv.classList.add("chat", className);
      chatDiv.innerHTML = content;
      return chatDiv;
    },
    showTypingAnimation() {
      const chatbotImage = require('@/assets/chatbot.jpg');
      const html = `<div class="chat-content"><div class="chat-details"><img src="${chatbotImage}" alt="chatbot-img"><div class="typing-animation"><div class="typing-dot" style="--delay: 0.2s"></div><div class="typing-dot" style="--delay: 0.3s"></div><div class="typing-dot" style="--delay: 0.4s"></div></div></div><span onclick="this.copyResponse" class="material-symbols-rounded">📋</span></div>`;

      const incomingChatDiv = this.createChatElement(html, "incoming");
      this.$refs.chatContainer.appendChild(incomingChatDiv);
      this.$refs.chatContainer.scrollTo(0, this.$refs.chatContainer.scrollHeight);
      this.getChatResponse(incomingChatDiv);
    },
    toggleTheme() {
      document.body.classList.toggle("light-mode");
      localStorage.setItem("themeColor", this.$refs.themeButton.innerText);
      this.$refs.themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
    },
    deleteChats() {
      if(confirm("Are you sure you want to delete all the chats?")) {
        localStorage.removeItem("all-chats");
        this.loadDataFromLocalstorage();
      }
    },
    adjustChatInput() {
      this.$refs.chatInput.style.height =  `${this.initialInputHeight}px`;
      this.$refs.chatInput.style.height = `${this.$refs.chatInput.scrollHeight}px`;
    },
    handleKeyDown(e) {
      if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        this.handleOutgoingChat();
      }
    },
    copyResponse(event) {
      const reponseTextElement = event.target.parentElement.querySelector("p");
      navigator.clipboard.writeText(reponseTextElement.textContent);
      event.target.textContent = "done";
      setTimeout(() => event.target.textContent = "📋", 1000);
    }
  }
};
</script>


<style>
/* Import Google font - Poppins */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Poppins", sans-serif;
}
:root {
  --text-color: #FFFFFF;
  --icon-color: #ACACBE;
  --icon-hover-bg: #5b5e71;
  --placeholder-color: #dcdcdc;
  --outgoing-chat-bg: #343541;
  --incoming-chat-bg: #444654;
  --outgoing-chat-border: #343541;
  --incoming-chat-border: #444654;
}
.light-mode {
  --text-color: #343541;
  --icon-color: #a9a9bc;
  --icon-hover-bg: #f1f1f3;
  --placeholder-color: #6c6c6c;
  --outgoing-chat-bg: #FFFFFF;
  --incoming-chat-bg: #F7F7F8;
  --outgoing-chat-border: #FFFFFF;
  --incoming-chat-border: #D9D9E3;
}
body {
  background: var(--outgoing-chat-bg);
}

/* Chats container styling */
.chat-container {
  overflow-y: auto;
  max-height: 100vh;
  padding-bottom: 150px;
}
:where(.chat-container, textarea)::-webkit-scrollbar {
  width: 6px;
}
:where(.chat-container, textarea)::-webkit-scrollbar-track {
  background: var(--incoming-chat-bg);
  border-radius: 25px;
}
:where(.chat-container, textarea)::-webkit-scrollbar-thumb {
  background: var(--icon-color);
  border-radius: 25px;
}
.default-text {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 70vh;
  padding: 0 10px;
  text-align: center;
  color: var(--text-color);
}
.default-text h1 {
  font-size: 3.3rem;
}
.default-text p {
  margin-top: 10px;
  font-size: 1.1rem;
}
.chat-container .chat {
  padding: 25px 10px;
  display: flex;
  justify-content: center;
  color: var(--text-color);
}
.chat-container .chat.outgoing {
  background: var(--outgoing-chat-bg);
  border: 1px solid var(--outgoing-chat-border);
}
.chat-container .chat.incoming {
  background: var(--incoming-chat-bg);
  border: 1px solid var(--incoming-chat-border);
}
.chat .chat-content {
  display: flex;
  max-width: 1200px;
  width: 100%;
  align-items: flex-start;
  justify-content: space-between;
}
span.material-symbols-rounded {
  user-select: none;
  cursor: pointer;
}
.chat .chat-content span {
  cursor: pointer;
  font-size: 1.3rem;
  color: var(--icon-color);
  visibility: hidden;
}
.chat:hover .chat-content:not(:has(.typing-animation), :has(.error)) span {
  visibility: visible;
}
.chat .chat-details {
  display: flex;
  align-items: center;
}
.chat .chat-details img {
  width: 35px;
  height: 35px;
  align-self: flex-start;
  object-fit: cover;
  border-radius: 2px;
}
.chat .chat-details p {
  white-space: pre-wrap;
  font-size: 1.05rem;
  padding: 0 50px 0 25px;
  color: var(--text-color);
  word-break: break-word;
}
.chat .chat-details p.error {
  color: #e55865;
}
.chat .typing-animation {
  padding-left: 25px;
  display: inline-flex;
}
.typing-animation .typing-dot {
  height: 7px;
  width: 7px;
  border-radius: 50%;
  margin: 0 3px;
  opacity: 0.7;
  background: var(--text-color);
  animation: animateDots 1.5s var(--delay) ease-in-out infinite;
}
.typing-animation .typing-dot:first-child {
  margin-left: 0;
}
@keyframes animateDots {
  0%,44% {
    transform: translateY(0px);
  }
  28% {
    opacity: 0.4;
    transform: translateY(-6px);
  }
  44% {
    opacity: 0.2;
  }
}

/* Typing container styling */
.typing-container {
  position: fixed;
  bottom: 0;
  width: 100%;
  display: flex;
  padding: 20px 10px;
  justify-content: center;
  background: var(--outgoing-chat-bg);
  border-top: 1px solid var(--incoming-chat-border);
}
.typing-container .typing-content {
  display: flex;
  max-width: 950px;
  width: 100%;
  align-items: flex-end;
}
.typing-container .typing-textarea {
  width: 100%;
  display: flex;
  position: relative;
}
.typing-textarea textarea {
  resize: none;
  height: 55px;
  width: 100%;
  border: none;
  padding: 15px 45px 15px 20px;
  color: var(--text-color);
  font-size: 1rem;
  border-radius: 4px;
  max-height: 250px;
  overflow-y: auto;
  background: var(--incoming-chat-bg);
  outline: 1px solid var(--incoming-chat-border);
}
.typing-textarea textarea::placeholder {
  color: var(--placeholder-color);
}
.typing-content span {
  width: 55px;
  height: 55px;
  display: flex;
  border-radius: 4px;
  font-size: 1.35rem;
  align-items: center;
  justify-content: center;
  color: var(--icon-color);
}
.typing-textarea span {
  position: absolute;
  right: 0;
  bottom: 0;
  visibility: hidden;
}
.typing-textarea textarea:valid ~ span {
  visibility: visible;
}
.typing-controls {
  display: flex;
}
.typing-controls span {
  margin-left: 7px;
  font-size: 1.4rem;
  background: var(--incoming-chat-bg);
  outline: 1px solid var(--incoming-chat-border);
}
.typing-controls span:hover {
  background: var(--icon-hover-bg);
}

/* Reponsive Media Query */
@media screen and (max-width: 600px) {
  .default-text h1 {
    font-size: 2.3rem;
  }
  :where(.default-text p, textarea, .chat p) {
    font-size: 0.95rem!important;
  }
  .chat-container .chat {
    padding: 20px 10px;
  }
  .chat-container .chat img {
    height: 32px;
    width: 32px;
  }
  .chat-container .chat p {
    padding: 0 20px;
  }
  .chat .chat-content:not(:has(.typing-animation), :has(.error)) span {
    visibility: visible;
  }
  .typing-container {
    padding: 15px 10px;
  }
  .typing-textarea textarea {
    height: 45px;
    padding: 10px 40px 10px 10px;
  }
  .typing-content span {
    height: 45px;
    width: 45px;
    margin-left: 5px;
  }
  span.material-symbols-rounded {
    font-size: 1.25rem!important;
  }
}
</style>
