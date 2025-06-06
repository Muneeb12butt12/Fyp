import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { NotFoundError, BadRequestError } from '../errors/index.js';

// Start or get existing conversation
const getConversation = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user._id;

    let conversation = await Conversation.findOne({
      participants: { $all: [currentUser, userId] },
    }).populate('participants', 'username profilePicture');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUser, userId],
      });
      await conversation.populate('participants', 'username profilePicture');
    }

    res.json(conversation);
  } catch (err) {
    next(err);
  }
};

// Send message
const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, text } = req.body;
    const senderId = req.user._id;

    if (!conversationId || !text) {
      throw new BadRequestError('Conversation ID and text are required');
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      text,
    });

    // Update conversation's last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
    });

    // Populate sender details
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username profilePicture')
      .populate('conversation');

    // Emit socket event
    const io = req.app.get('io');
    io.to(conversationId).emit('newMessage', populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (err) {
    next(err);
  }
};

// Get messages for a conversation
const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'username profilePicture')
      .sort('createdAt');

    res.json(messages);
  } catch (err) {
    next(err);
  }
};

// Get user's conversations
const getUserConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'username profilePicture')
      .populate('lastMessage')
      .sort('-updatedAt');

    res.json(conversations);
  } catch (err) {
    next(err);
  }
};

export { getConversation, sendMessage, getMessages, getUserConversations };