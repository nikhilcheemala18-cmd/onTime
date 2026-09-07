import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      minlength: [1, 'Comment content must be at least 1 character'],
      maxlength: [2000, 'Comment content cannot exceed 2000 characters'],
    },
    card: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
      required: [true, 'Comment card is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Comment creator is required'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

commentSchema.index({ card: 1, createdAt: 1 })

export const Comment = mongoose.model('Comment', commentSchema)
