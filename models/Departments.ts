// src/models/Department.ts
import{ Schema, model, models } from 'mongoose';

const DepartmentSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
});

const Department = models.Department || model('Department', DepartmentSchema);

export default Department;
