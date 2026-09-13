import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  role: { 
    type: String, 
    enum: ['system', 'user', 'assistant', 'tool'], 
    required: true 
  },
  content: { type: String, required: true },
  toolCalls: [{
    name: { type: String },
    arguments: { type: mongoose.Schema.Types.Mixed }
  }]
}, { timestamps: true });

const YuriAiSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  activeWorkoutId: { type: String, index: true },
  messages: [MessageSchema],
  stateSnapshot: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

export const YuriAiSessionModel = mongoose.model('YuriAiSession', YuriAiSessionSchema);
