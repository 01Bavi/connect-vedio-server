require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const http = require('http');
// const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const mongoURL = process.env.MONGO_URI;
const PORT = process.env.PORT||5000;

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors()); // Enable CORS
app.use(express.json()); 
app.use('/api/users', userRoutes); // Your API route

// mongoose.set('strictQuery', false);
mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('DB connected successfully'))
  .catch((err) => console.error(err));

  const users = [];

  wss.on('connection', (ws) => {
    console.log('New websocket connection');

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        const user = findUser(data.username);

        switch (data.type) {
            case "store_user":
                if (user != null) return;
                const newUser = { conn: ws,username: data.username};
                users.push(newUser);
                console.log(`User stored: ${newUser.username}`);
                break;

            case "store_offer":
                if (user == null) return;
                user.offer = data.offer;
                break;

            case "store_candidate":
                if (user == null) return;
                if (!user.candidates) user.candidates = [];
                user.candidates.push(data.candidate);
                break;

            case "send_answer":
                if (user == null) return;
                sendData({ type: 'answer', answer: data.answer }, user.conn);
                break;

            case "send_candidate":
                if (user == null) return;
                sendData({ type: 'candidate', candidate: data.candidate }, user.conn);
                break;

            case "join_call":
                if (user == null) return;
                sendData({ type: "offer", offer: user.offer }, ws);
                user.candidates.forEach(candidate => {
                    sendData({ type: 'candidate', candidate: candidate }, ws);
                });
                break;
        }
    });

    ws.on('close', () => {
      users.forEach((user, index) => {
        if (user.conn === ws) users.splice(index, 1);
      });
        console.log('Client disconnected');
    });
});

// Helper function to send data via WebSocket
function sendData(data, conn) {
    conn.send(JSON.stringify(data));
}

// Helper function to find user by username
function findUser(username) {
    return users.find(user => user.username === username);
}

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

