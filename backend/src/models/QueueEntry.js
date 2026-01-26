
import mongoose from 'mongoose';

const queueEntrySchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  establishmentId: { type: String, required: true },
  status: {
    type: String,
    enum: ['waiting', 'called', 'served'],
    default: 'waiting'
  },
  position: Number,
  calledAt: Date,
  servedAt: Date
}, {
  timestamps: true 
});


export default mongoose.model('QueueEntry', queueEntrySchema);
