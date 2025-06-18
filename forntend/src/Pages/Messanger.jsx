import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiPaperclip, FiMic, FiSmile, FiShoppingBag } from 'react-icons/fi';
import { IoMdSend, IoIosArrowBack } from 'react-icons/io';
import { RiMessengerLine } from 'react-icons/ri';

const MessengerApp = () => {
  const [userType, setUserType] = useState('buyer'); // 'buyer' or 'seller'
  const [activeConversation, setActiveConversation] = useState(0);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef(null);

  // Mock data for products
  const products = [
    {
      id: 1,
      name: 'Wireless Headphones',
      price: 89.99,
      image: 'https://via.placeholder.com/80',
      status: 'In Stock'
    },
    {
      id: 2,
      name: 'Smart Watch',
      price: 199.99,
      image: 'https://via.placeholder.com/80',
      status: 'Low Stock'
    },
    {
      id: 3,
      name: 'Bluetooth Speaker',
      price: 59.99,
      image: 'https://via.placeholder.com/80',
      status: 'Out of Stock'
    }
  ];

  // Mock conversations data
  const [conversations, setConversations] = useState([
    {
      id: 0,
      product: products[0],
      orderId: 'ORD-12345',
      buyer: {
        id: 1,
        name: 'Alex Johnson',
        avatar: 'AJ',
        status: 'online'
      },
      seller: {
        id: 101,
        name: 'TechGadgets',
        avatar: 'TG',
        status: 'online'
      },
      messages: [
        { 
          text: 'Hi, I have a question about the wireless headphones', 
          time: '2:25 PM', 
          sent: false,
          sender: userType === 'seller' ? 'buyer' : 'seller'
        },
        { 
          text: "Sure! What would you like to know?", 
          time: '2:26 PM', 
          sent: true,
          sender: userType
        },
        { 
          text: "Are they noise-cancelling?", 
          time: '2:28 PM', 
          sent: false,
          sender: userType === 'seller' ? 'buyer' : 'seller'
        },
        { 
          text: "Yes, they have active noise cancellation technology", 
          time: '2:30 PM', 
          sent: true,
          sender: userType
        },
      ],
    },
    {
      id: 1,
      product: products[1],
      orderId: 'ORD-67890',
      buyer: {
        id: 2,
        name: 'Sarah Williams',
        avatar: 'SW',
        status: 'offline'
      },
      seller: {
        id: 101,
        name: 'TechGadgets',
        avatar: 'TG',
        status: 'online'
      },
      messages: [
        { 
          text: 'When will the smart watch be back in stock?', 
          time: '10:15 AM', 
          sent: false,
          sender: userType === 'seller' ? 'buyer' : 'seller'
        },
        { 
          text: "We expect new stock next week", 
          time: '10:20 AM', 
          sent: true,
          sender: userType
        },
      ],
    },
    {
      id: 2,
      product: products[2],
      orderId: 'ORD-54321',
      buyer: {
        id: 3,
        name: 'Michael Brown',
        avatar: 'MB',
        status: 'online'
      },
      seller: {
        id: 101,
        name: 'TechGadgets',
        avatar: 'TG',
        status: 'offline'
      },
      messages: [
        { 
          text: 'Is the bluetooth speaker waterproof?', 
          time: 'Yesterday', 
          sent: false,
          sender: userType === 'seller' ? 'buyer' : 'seller'
        },
      ],
    },
  ]);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [activeConversation, conversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (message.trim() === '') return;
    
    const updatedConversations = [...conversations];
    updatedConversations[activeConversation].messages.push({
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sent: true,
      sender: userType
    });
    
    setConversations(updatedConversations);
    setMessage('');
    
    // Simulate reply after 1-3 seconds
    if (Math.random() > 0.3) { // 70% chance of reply
      setIsTyping(true);
      setTimeout(() => {
        const replies = [
          "I can help with that!",
          "Thanks for your question!",
          "Let me check that for you.",
          "The product details say...",
          "Yes, that's correct.",
          "We offer a 1-year warranty on that.",
          "Would you like me to check stock availability?"
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        
        const updatedWithReply = [...updatedConversations];
        updatedWithReply[activeConversation].messages.push({
          text: randomReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sent: false,
          sender: userType === 'seller' ? 'buyer' : 'seller'
        });
        
        setConversations(updatedWithReply);
        setIsTyping(false);
      }, 1000 + Math.random() * 2000);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const otherParty = userType === 'seller' ? conv.buyer : conv.seller;
    return (
      otherParty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.orderId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const formatTime = (timeStr) => {
    if (timeStr === 'Yesterday') return timeStr;
    
    const now = new Date();
    const time = new Date();
    const [hours, minutes] = timeStr.split(/[: ]/);
    let h = parseInt(hours);
    const isPM = timeStr.includes('PM');
    
    if (isPM && h < 12) h += 12;
    if (!isPM && h === 12) h = 0;
    
    time.setHours(h, parseInt(minutes));
    
    const diffDays = Math.floor((now - time) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays > 1) return `${diffDays} days ago`;
    
    return timeStr;
  };

  const getOtherParty = (conversation) => {
    return userType === 'seller' ? conversation.buyer : conversation.seller;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${showSidebar ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-96 bg-white border-r border-gray-200`}>
        {/* User Type Switch */}
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-3 font-medium ${userType === 'buyer' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setUserType('buyer')}
          >
            Buyer Mode
          </button>
          <button
            className={`flex-1 py-3 font-medium ${userType === 'seller' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setUserType('seller')}
          >
            Seller Mode
          </button>
        </div>
        
        {/* Search */}
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>
        
        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation, index) => (
            <div
              key={conversation.id}
              className={`flex items-start p-3 cursor-pointer hover:bg-gray-50 ${activeConversation === index ? 'bg-blue-50' : ''}`}
              onClick={() => {
                setActiveConversation(index);
                if (window.innerWidth < 768) setShowSidebar(false);
              }}
            >
              <div className={`relative flex items-center justify-center w-12 h-12 rounded-full 
                ${getOtherParty(conversation).status === 'online' ? 'bg-blue-100' : 'bg-gray-200'} 
                text-gray-700 font-medium`}>
                {getOtherParty(conversation).avatar}
                {getOtherParty(conversation).status === 'online' && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex justify-between">
                  <p className="font-medium truncate">{getOtherParty(conversation).name}</p>
                  <p className="text-xs text-gray-500">
                    {formatTime(conversation.messages[conversation.messages.length - 1].time)}
                  </p>
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {conversation.product.name} • {conversation.orderId}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {conversation.messages[conversation.messages.length - 1].text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Chat Area */}
      <div className={`${!showSidebar ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-white`}>
        {filteredConversations.length > 0 ? (
          <>
            {/* Chat Header */}
            <div className="flex justify-between items-center p-3 border-b border-gray-200">
              <div className="flex items-center">
                <button 
                  className="md:hidden p-2 mr-2 text-gray-600 hover:bg-gray-100 rounded-full"
                  onClick={() => setShowSidebar(true)}
                >
                  <IoIosArrowBack />
                </button>
                <div className="relative">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full 
                    ${getOtherParty(conversations[activeConversation]).status === 'online' ? 'bg-blue-100' : 'bg-gray-200'} 
                    text-gray-700 font-medium`}>
                    {getOtherParty(conversations[activeConversation]).avatar}
                    {getOtherParty(conversations[activeConversation]).status === 'online' && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="font-medium">{getOtherParty(conversations[activeConversation]).name}</p>
                  <p className="text-xs text-gray-500">
                    {getOtherParty(conversations[activeConversation]).status === 'online' ? 'Online' : 'Offline'}
                    {isTyping && <span className="text-blue-500 ml-1">typing...</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {conversations[activeConversation].orderId}
                </span>
              </div>
            </div>
            
            {/* Product Info */}
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center">
                <img 
                  src={conversations[activeConversation].product.image} 
                  alt={conversations[activeConversation].product.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="ml-3">
                  <p className="font-medium">{conversations[activeConversation].product.name}</p>
                  <p className="text-lg font-bold">${conversations[activeConversation].product.price}</p>
                  <p className="text-sm text-gray-500">
                    Status: <span className={`font-medium ${
                      conversations[activeConversation].product.status === 'In Stock' ? 'text-green-600' :
                      conversations[activeConversation].product.status === 'Low Stock' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {conversations[activeConversation].product.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              <div className="space-y-3">
                {conversations[activeConversation].messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === userType ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.sender === userType ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none shadow'}`}
                    >
                      <p>{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.sender === userType ? 'text-blue-100' : 'text-gray-500'} text-right`}>
                        {msg.time}
                        {msg.sender === userType && (
                          <span className="ml-1">✓✓</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-800 rounded-lg rounded-tl-none shadow px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {/* Message Input */}
            <div className="p-3 border-t border-gray-200 bg-white">
              <div className="flex items-center">
                <button className="p-2 text-gray-500 hover:text-blue-600 rounded-full">
                  <FiPaperclip />
                </button>
                <button className="p-2 text-gray-500 hover:text-blue-600 rounded-full">
                  <FiSmile />
                </button>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 mx-2 p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                {message ? (
                  <button
                    onClick={handleSendMessage}
                    className="p-2 text-white bg-blue-500 hover:bg-blue-600 rounded-full"
                  >
                    <IoMdSend />
                  </button>
                ) : (
                  <button className="p-2 text-gray-500 hover:text-blue-600 rounded-full">
                    <FiMic />
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <RiMessengerLine className="text-5xl text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-700">No conversations found</h3>
            <p className="text-gray-500 mt-2">
              {searchTerm ? 'Try a different search term' : 'Start a new conversation'}
            </p>
            {userType === 'buyer' && (
              <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center">
                <FiShoppingBag className="mr-2" />
                Browse Products
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessengerApp;