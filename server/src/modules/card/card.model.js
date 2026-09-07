import mongoose from 'mongoose'

const cardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Card title is required'],
      trim: true,
      minlength: [1, 'Card title must be at least 1 character'],
      maxlength: [200, 'Card title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    list: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'List',
      required: [true, 'Card list is required'],
    },
    position: {
      type: Number,
      required: [true, 'Card position is required'],
      min: [0, 'Card position cannot be negative'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Card creator is required'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

cardSchema.index({ list: 1, position: 1 })

export const Card = mongoose.model('Card', cardSchema)
