const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['lost', 'found'], 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  location: { 
    type: String 
  },
  image: { 
    type: String 
  },
  status: { 
    type: String, 
    enum: ['open', 'claimed', 'pending'],  // ✅ Added 'pending' status
    default: 'open' 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  verificationQuestions: [{
    type: String
  }],
  reward: { 
    type: String 
  },
  timeLost: { 
    type: String 
  },
  timeFound: { 
    type: String 
  }
}, { 
  timestamps: true 
});

// ✅ Index for better query performance
itemSchema.index({ type: 1, status: 1, createdAt: -1 });
itemSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Item', itemSchema);
