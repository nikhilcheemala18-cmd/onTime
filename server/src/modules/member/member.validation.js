import { z } from 'zod'

export const memberRoles = ['owner', 'admin', 'member']
export const assignableMemberRoles = ['admin', 'member']

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Id must be a valid ObjectId')

const assignableRoleSchema = z
  .enum(assignableMemberRoles)
  .optional()
  .default('member')

export const workspaceMemberParamSchema = z.object({
  workspaceId: objectIdSchema,
})

export const workspaceMemberIdParamSchema = z.object({
  workspaceId: objectIdSchema,
  memberId: objectIdSchema,
})

export const addMemberSchema = z.object({
  userId: objectIdSchema,
  role: assignableRoleSchema,
})

export const updateMemberRoleSchema = z.object({
  role: z.enum(assignableMemberRoles),
})
