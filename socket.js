const socket = io();

const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const threadForm = document.getElementById('thread-form');
const threadTitleInput = document.getElementById('thread-title');
const threadContentInput = document.getElementById('thread-content');
const messagesList = document.getElementById('messages');

messageForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = messageInput.value;
  socket.emit('chat message', message);
  messageInput.value = '';
});

threadForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = threadTitleInput.value;
  const content = threadContentInput.value;
  socket.emit('new thread', { title, content });
  threadTitleInput.value = '';
  threadContentInput.value = '';
});

socket.on('chat message', (message) => {
  const messageItem = document.createElement('li');
  messageItem.textContent = message;
  messagesList.appendChild(messageItem);
});

socket.on('new thread', (thread) => {
  const threadItem = document.createElement('li');
  threadItem.innerHTML = `
    <h2>${thread.title}</h2>
    <p>${thread.content}</p>
    <button class="reply-button">Reply</button>
    <ul class="replies"></ul>
  `;
  messagesList.appendChild(threadItem);
});

messagesList.addEventListener('click', (event) => {
  if (event.target.classList.contains('reply-button')) {
    const threadElement = event.target.parentElement;
    const threadId = threadElement.getAttribute('data-id');
    const replyForm = document.createElement('form');
    replyForm.innerHTML = `
      <input type="text" placeholder="Type your reply...">
      <button>Reply</button>
    `;
    const repliesList = threadElement.querySelector('.replies');
    repliesList.appendChild(replyForm);
    replyForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const replyInput = replyForm.querySelector('input');
      const replyContent = replyInput.value;
      socket.emit('new reply', { threadId, replyContent });
      replyInput.value = '';
    });
  }
});

socket.on('new reply', (reply) => {
  const threadElement = messagesList.querySelector(`[data-id="${reply.threadId}"]`);
  if (threadElement) {
    const repliesList = threadElement.querySelector('.replies');
    const replyItem = document.createElement('li');
    replyItem.textContent = reply.content;
    repliesList.appendChild(replyItem);
  }
});

socket.on('connect_error', (error) => {
  console.error('Connection failed:', error);
});

socket.on('connect_timeout', (timeout) => {
  console.error('Connection timed out:', timeout);
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});

socket.on('disconnect', (reason) => {
  console.error('Disconnected:', reason);
});
