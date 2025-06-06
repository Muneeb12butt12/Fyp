import { Avatar, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import './messenger.css';

export default function ChatBox({
  messages,
  newMessage,
  setNewMessage,
  sendMessage,
  currentChat,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div className="chatBoxTop">
      <div className="chatHeader">
        <Avatar src={currentChat.participants[0]?.profilePicture} />
        <span>{currentChat.participants[0]?.username}</span>
      </div>
      <div className="messageContainer">
        {messages.map((m) => (
          <div
            key={m._id}
            className={m.sender === currentUser._id ? 'message own' : 'message'}
          >
            <div className="messageTop">
              <Avatar src={m.sender?.profilePicture} />
              <p className="messageText">{m.text}</p>
            </div>
            <div className="messageBottom">
              {new Date(m.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
      <form className="chatInput" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Write a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <IconButton type="submit">
          <SendIcon />
        </IconButton>
      </form>
    </div>
  );
}