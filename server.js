require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Groq = require('groq-sdk');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('chat message', async (msg) => {
    console.log('Message received:', msg);

    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: msg }],
      });

      socket.emit(
        'chat message',
        completion.choices[0].message.content
      );
    } catch (error) {
      console.error('Groq Error:', error.message);
      socket.emit('chat message', 'AI error. Please try again.');
    }
  });
});

server.listen(3000, () =>
  console.log('Server running on http://localhost:3000')
);
