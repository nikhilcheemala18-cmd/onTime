import mongoose from 'mongoose'

const activitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, 'Activity action is required'],
      trim: true,
    },
    entityType: {
      type: String,
      required: [true, 'Activity entity type is required'],
      trim: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Activity entity id is required'],
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Activity workspace is required'],
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Activity performer is required'],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

activitySchema.index({ workspace: 1, createdAt: -1 })
activitySchema.index({ workspace: 1, entityType: 1, createdAt: -1 })

export const Activity = mongoose.model('Activity', activitySchema)
