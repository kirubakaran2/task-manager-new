// src/models/Location.ts
import { Schema, model, models } from 'mongoose';

const LocationSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
});

const Location = models.Location || model('Location', LocationSchema);

export default Location;
