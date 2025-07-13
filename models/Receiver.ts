import { Schema, model, models } from 'mongoose';

const ReceiverSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
});

const Receiver = models.Receiver || model('Receiver', ReceiverSchema);
export default Receiver;
