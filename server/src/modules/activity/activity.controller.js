import { asyncHandler } from '../../utils/asyncHandler.js'
import { getActivityById, listActivities } from './activity.service.js'

export const list = asyncHandler(async (req, res) => {
  const activities = await listActivities(req.user.id, req.query)

  res.status(200).json({
    success: true,
    data: activities,
  })
})

export const getById = asyncHandler(async (req, res) => {
  const activity = await getActivityById(req.user.id, req.params.id)

  res.status(200).json({
    success: true,
    data: activity,
  })
})
