import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
  },
  { timestamps: true }
);

// Compound index for unique participant pairs
conversationSchema.index({ participants: 1 }, { unique: true });

// Auto-populate lastMessage
conversationSchema.pre('save', async function (next) {
  if (!this.lastMessage) {
    const lastMsg = await mongoose.model('Message')
      .findOne({ conversation: this._id })
      .sort('-createdAt');
    this.lastMessage = lastMsg?._id;
  }
  next();
});

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;