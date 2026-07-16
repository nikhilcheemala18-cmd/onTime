import mongoose from 'mongoose'

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
      minlength: [3, 'Workspace name must be at least 3 characters'],
      maxlength: [80, 'Workspace name cannot exceed 80 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Workspace description cannot exceed 500 characters'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Workspace owner is required'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

workspaceSchema.index({ owner: 1, createdAt: -1 })

export const Workspace = mongoose.model('Workspace', workspaceSchema)
