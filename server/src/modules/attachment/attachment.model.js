import mongoose from 'mongoose'

const attachmentSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: [true, 'Attachment filename is required'],
      trim: true,
    },
    originalName: {
      type: String,
      required: [true, 'Attachment original name is required'],
      trim: true,
    },
    mimeType: {
      type: String,
      required: [true, 'Attachment MIME type is required'],
      trim: true,
    },
    size: {
      type: Number,
      required: [true, 'Attachment size is required'],
      min: [1, 'Attachment size must be at least 1 byte'],
    },
    url: {
      type: String,
      required: [true, 'Attachment URL is required'],
      trim: true,
    },
    card: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
      required: [true, 'Attachment card is required'],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Attachment uploader is required'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

attachmentSchema.index({ card: 1, createdAt: 1 })

export const Attachment = mongoose.model('Attachment', attachmentSchema)
