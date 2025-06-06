import { Avatar } from '@mui/material';
import './messenger.css';

export default function ConversationList({ conversations, setCurrentChat }) {
  return (
    <div className="conversationList">
      {conversations.map((c) => (
        <div
          className="conversation"
          key={c._id}
          onClick={() => setCurrentChat(c)}
        >
          <Avatar src={c.participants[0]?.profilePicture} />
          <div className="conversationInfo">
            <span>{c.participants[0]?.username}</span>
            <p>{c.lastMessage?.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}