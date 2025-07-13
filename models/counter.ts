// models/Counter.ts
import mongoose, { Schema, Document } from 'mongoose';

interface ICounter extends Document {
  modelName: string;
  count: number;
}

const CounterSchema = new Schema<ICounter>({
  modelName: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
});

export default mongoose.models.Counter || mongoose.model<ICounter>('Counter', CounterSchema);
