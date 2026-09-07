import mongoose from 'mongoose'

const boardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Board title is required'],
      trim: true,
      minlength: [3, 'Board title must be at least 3 characters'],
      maxlength: [100, 'Board title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Board description cannot exceed 500 characters'],
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Board workspace is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Board creator is required'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

boardSchema.index({ workspace: 1, createdAt: -1 })

export const Board = mongoose.model('Board', boardSchema)
