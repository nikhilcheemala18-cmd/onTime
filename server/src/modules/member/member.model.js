import mongoose from 'mongoose'

export const workspaceRoles = ['owner', 'admin', 'member']

const workspaceMemberSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Workspace member user is required'],
    },
    role: {
      type: String,
      enum: workspaceRoles,
      required: [true, 'Workspace member role is required'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

workspaceMemberSchema.index({ workspace: 1, user: 1 }, { unique: true })

export const WorkspaceMember = mongoose.model(
  'WorkspaceMember',
  workspaceMemberSchema,
)
