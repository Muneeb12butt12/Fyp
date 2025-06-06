import { useEffect, useState } from 'react';
import useMessenger from '../../hooks/useMessenger';
import ConversationList from './ConversationList';
import ChatBox from './ChatBox';
import LoginModal from '../auth/LoginModal';
import { FiMessageSquare, FiUser, FiSearch, FiMoreVertical, FiPaperclip, FiMic, FiSend } from 'react-icons/fi';

export default function Messenger() {
  const {
    isAuthenticated,
    conversations,
    currentChat,
    messages,
    newMessage,
    setNewMessage,
    setCurrentChat,
    getConversations,
    getMessages,
    sendMessage,
    error
  } = useMessenger();

  const [showLogin, setShowLogin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      getConversations();
      setShowLogin(false);
    } else {
      setShowLogin(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (currentChat) {
      getMessages(currentChat._id);
    }
  }, [currentChat]);

  const handleLoginSuccess = () => {
    setShowLogin(false);
    getConversations();
  };

  const handleSendMessage = async () => {
    try {
      await sendMessage();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.participants.some(p => 
      p.username.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {showLogin && (
        <LoginModal 
          onSuccess={handleLoginSuccess}
          onClose={() => setShowLogin(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${currentChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-96 bg-white border-r border-gray-200`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800">Messages</h1>
          <div className="flex space-x-2">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <FiMessageSquare className="text-gray-600" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <FiUser className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search messages"
              className="w-full py-2 pl-10 pr-4 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            conversations={filteredConversations}
            setCurrentChat={setCurrentChat}
            currentChat={currentChat}
          />
        </div>
      </div>

      {/* Chat Area */}
      {currentChat ? (
        <div className="flex flex-col flex-1 bg-gray-50">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {currentChat.participants[0].username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">{currentChat.participants[0].username}</h2>
                <p className="text-xs text-gray-500">Online</p>
              </div>
            </div>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <FiMoreVertical className="text-gray-600" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            <ChatBox
              messages={messages}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              sendMessage={handleSendMessage}
              currentChat={currentChat}
            />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <FiPaperclip className="text-gray-600" />
              </button>
              <input
                type="text"
                placeholder="Type a message"
                className="flex-1 py-2 px-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              {newMessage ? (
                <button 
                  className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
                  onClick={handleSendMessage}
                >
                  <FiSend />
                </button>
              ) : (
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <FiMic className="text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-col flex-1 items-center justify-center bg-gray-50 p-8">
          <div className="max-w-md text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-200 flex items-center justify-center">
              <FiMessageSquare className="text-gray-400 text-4xl" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              {conversations.length > 0 
                ? "Select a conversation"
                : "No conversations yet"}
            </h2>
            <p className="text-gray-500 mb-6">
              {conversations.length > 0
                ? "Choose a chat from the sidebar to start messaging"
                : "Your conversations will appear here once you start chatting"}
            </p>
            {conversations.length === 0 && (
              <button className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition">
                Start New Conversation
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
          <span>{error}</span>
          <button 
            className="ml-4 underline"
            onClick={() => setShowLogin(true)}
          >
            Login
          </button>
        </div>
      )}
    </div>
  );
}