import { asyncHandler } from '../../utils/asyncHandler.js'
import {
  addWorkspaceMember,
  getMyWorkspaceMembership,
  listWorkspaceMembers,
  removeWorkspaceMember,
  updateWorkspaceMemberRole,
} from './member.service.js'

export const add = asyncHandler(async (req, res) => {
  const member = await addWorkspaceMember(
    req.user.id,
    req.params.workspaceId,
    req.body,
  )

  res.status(201).json({
    success: true,
    data: member,
  })
})

export const list = asyncHandler(async (req, res) => {
  const members = await listWorkspaceMembers(req.user.id, req.params.workspaceId)

  res.status(200).json({
    success: true,
    data: members,
  })
})

export const me = asyncHandler(async (req, res) => {
  const member = await getMyWorkspaceMembership(req.user.id, req.params.workspaceId)

  res.status(200).json({
    success: true,
    data: member,
  })
})

export const updateRole = asyncHandler(async (req, res) => {
  const member = await updateWorkspaceMemberRole(
    req.user.id,
    req.params.workspaceId,
    req.params.memberId,
    req.body,
  )

  res.status(200).json({
    success: true,
    data: member,
  })
})

export const remove = asyncHandler(async (req, res) => {
  await removeWorkspaceMember(
    req.user.id,
    req.params.workspaceId,
    req.params.memberId,
  )

  res.status(204).send()
})
