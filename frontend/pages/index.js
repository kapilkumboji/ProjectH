import { useState, useEffect } from 'react';
import io from 'socket.io-client';

export default function Home() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socket = io('http://localhost:5000');  // Connect to the Express backend
    setSocket(socket);

    socket.on('botMessage', (message) => {
      setChatHistory((prev) => [...prev, { user: false, text: message }]);
    });

    return () => socket.disconnect();
  }, []);

  const sendMessage = () => {
    if (message.trim() && socket) {
      setChatHistory((prev) => [...prev, { user: true, text: message }]);
      socket.emit('userMessage', message);
      setMessage('');
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-history">
        {chatHistory.map((chat, index) => (
          <div key={index} className={chat.user ? 'user-message' : 'bot-message'}>
            {chat.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>

      <style jsx>{`
        .chat-container {
          width: 500px;
          margin: 0 auto;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
        }
        .chat-history {
          height: 400px;
          overflow-y: auto;
          margin-bottom: 20px;
        }
        .user-message {
          text-align: right;
          color: blue;
        }
        .bot-message {
          text-align: left;
          color: green;
        }
        .chat-input {
          display: flex;
        }
        input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        button {
          padding: 10px;
          margin-left: 10px;
          background-color: blue;
          color: white;
          border: none;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
