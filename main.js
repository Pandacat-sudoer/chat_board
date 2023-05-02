const socket = io();

const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const threadForm = document.getElementById('thread-form');
const threadTitleInput = document.getElementById('thread-title');
const threadContentInput = document.getElementById('thread-content');
const messagesList = document.getElementById('messages');

messageForm.addEventListener('submit', e => {
    e.preventDefault();
    const message = messageInput.value;
    socket.emit('chat message', message);
    messageInput.value = '';
});

threadForm.addEventListener('submit', e => {
    e.preventDefault();
    const title = threadTitleInput.value;
    const content = threadContentInput.value;
    socket.emit('new thread', { title, content });
    threadTitleInput.value = '';
    threadContentInput.value = '';
});

socket.on('chat message', message => {
    const li = document.createElement('li');
    li.textContent = message;
    messagesList.appendChild(li);
});

socket.on('new thread', thread => {
    const li = document.createElement('li');
    li.innerHTML = `
        <h2>${thread.title}</h2>
        <p>${thread.content}</p>
        <button class="reply-button">Reply</button>
        <ul class="replies"></ul>
    `;
    messagesList.appendChild(li);
});

messagesList.addEventListener('click', e => {
    if (e.target.classList.contains('reply-button')) {
        const threadElement = e.target.parentElement;
        const threadId = threadElement.getAttribute('data-id');
        const replyForm = document.createElement('form');
        replyForm.innerHTML = `
            <input type="text" placeholder="Type your reply...">
            <button>Reply</button>
        `;
        const repliesList = threadElement.querySelector('.replies');
        repliesList.appendChild(replyForm);
        replyForm.addEventListener('submit', e => {
            e.preventDefault();
            const replyInput = replyForm.querySelector('input');
            const replyContent = replyInput.value;
            socket.emit('new reply', { threadId, replyContent });
            replyInput.value = '';
        });
    }
});

socket.on('new reply', reply => {
    const threadElement = messagesList.querySelector(`[data-id="${reply.threadId}"]`);
    if (threadElement) {
        const repliesList = threadElement.querySelector('.replies');
        const li = document.createElement('li');
        li.textContent = reply.content;
        repliesList.appendChild(li);
    }
});
