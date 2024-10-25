require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');
const http = require('http');
const { Server } = require('socket.io');
const Chat = require('../models/Chat');

const app = express();
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// OpenAI GPT setup
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// GPT-powered chatbot response
const generateBotResponse = async (userMessage) => {
  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `User: ${userMessage}\nBot:`,
      max_tokens: 100,
      temperature: 0.7,
    });
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error('GPT Error:', error);
    return "I'm having trouble understanding that right now.";
  }
};

// Socket.io for real-time chat
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('userMessage', async (message) => {
    const botMessage = await generateBotResponse(message);

    // Save chat history to MongoDB
    const chatLog = new Chat({ userMessage: message, botMessage });
    await chatLog.save();

    // Send bot response back to the user
    socket.emit('botMessage', botMessage);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
