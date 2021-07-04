const socket = io();
socket.on('init', (message) => console.log(message));

socket.emit('sendMessage', { message: "Hello" });

socket.on('messages', (message) => console.log(message));