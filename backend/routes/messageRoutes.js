import express from 'express';
import {
  getConversation,
  sendMessage,
  getMessages,
  getUserConversations,
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/conversations', getUserConversations);
router.get('/:userId/conversation', getConversation);
router.get('/:conversationId/messages', getMessages);
router.post('/send', sendMessage);

export default router;