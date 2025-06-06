import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useMessenger from '../hooks/useMessenger';
import ConversationList from '../components/messenger/ConversationList';
import ChatBox from '../components/messenger/ChatBox';
import MessengerSidebar from '../components/messenger/MessengerSidebar';
import { FiMessageSquare, FiPlus, FiSearch } from 'react-icons/fi';

export default function MessengerPage() {
  const navigate = useNavigate();
  const {
    conversations,
    currentChat,
    messages,
    newMessage,
    setNewMessage,
    setCurrentChat,
    getConversations,
    getMessages,
    sendMessage,
    onlineUsers,
    typingStatus,
  } = useMessenger();

  // Check authentication
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/signin');
    }
  }, [navigate]);

  // Load conversations on mount
  useEffect(() => {
    getConversations();
  }, []);

  // Load messages when chat changes
  useEffect(() => {
    if (currentChat) {
      getMessages(currentChat._id);
    }
  }, [currentChat]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <MessengerSidebar />

      {/* Conversations Panel */}
      <div className="flex flex-col w-full md:w-80 border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
            <button className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition">
              <FiPlus size={18} />
            </button>
          </div>
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <ConversationList 
          conversations={conversations}
          currentChat={currentChat}
          setCurrentChat={setCurrentChat}
          onlineUsers={onlineUsers}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <ChatBox
            messages={messages}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            sendMessage={sendMessage}
            currentChat={currentChat}
            typingStatus={typingStatus}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-6">
              <FiMessageSquare className="text-gray-400 text-4xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Select a conversation</h3>
            <p className="text-gray-500 mb-6">Or start a new one</p>
            <button className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition">
              New Message
            </button>
          </div>
        )}
      </div>
    </div>
  );
}