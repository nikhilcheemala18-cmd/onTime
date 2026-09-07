import mongoose from 'mongoose'

const listSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'List name is required'],
      trim: true,
      minlength: [1, 'List name must be at least 1 character'],
      maxlength: [100, 'List name cannot exceed 100 characters'],
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: [true, 'List board is required'],
    },
    position: {
      type: Number,
      required: [true, 'List position is required'],
      min: [0, 'List position cannot be negative'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'List creator is required'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

listSchema.index({ board: 1, position: 1 })

export const List = mongoose.model('List', listSchema)
