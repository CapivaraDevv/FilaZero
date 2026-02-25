
import mongoose from 'mongoose';

const queueEntrySchema = new mongoose.Schema({
  establishmentId: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  position: { type: Number, required: true},
  status: {
    type: String,
    enum: ['waiting', 'called', 'served'],
    default: 'waiting'
  },
  qrCode: {type: String, default: null},
  createdAt: { type: Date, default: Date.now},
  updatedAt: { type: Date, default: Date.now},
  calledAt: { type: Date },
  servedAt: { type: Date }
});


export default mongoose.model('QueueEntry', queueEntrySchema);
