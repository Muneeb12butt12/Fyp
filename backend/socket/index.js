import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

const configureSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.userId}`);
    socket.join(socket.userId);

    // Message handling
    socket.on('sendMessage', async (messageData) => {
      try {
        const { conversationId, text } = messageData;
        
        const message = await Message.create({
          conversation: conversationId,
          sender: socket.userId,
          text
        });

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
          updatedAt: new Date()
        });

        const conversation = await Conversation.findById(conversationId);
        conversation.participants.forEach(participant => {
          io.to(participant.toString()).emit('newMessage', message);
        });
      } catch (error) {
        console.error('Socket message error:', error);
      }
    });

    // Typing indicators
    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(conversationId).emit('typing', { 
        userId: socket.userId, 
        isTyping 
      });
    });

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userId}`);
    });
  });
};

export default configureSocket;