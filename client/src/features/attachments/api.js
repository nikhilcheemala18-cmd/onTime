import api from '../../lib/axios.js'

export async function listAttachments(cardId) {
  const { data } = await api.get('/api/attachments', { params: { cardId } })
  return data.data
}

export async function uploadAttachment({ cardId, file, onUploadProgress }) {
  const formData = new FormData()
  formData.append('cardId', cardId)
  formData.append('file', file)

  const { data } = await api.post('/api/attachments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  })

  return data.data
}

export function getAttachmentDownloadUrl(attachmentId) {
  const baseUrl = import.meta.env?.VITE_API_URL || 'http://localhost:5000'
  return `${baseUrl}/api/attachments/${attachmentId}/download`
}

export async function downloadAttachment(attachment) {
  const { data } = await api.get(`/api/attachments/${attachment._id}/download`, {
    responseType: 'blob',
  })
  const url = window.URL.createObjectURL(data)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = attachment.originalName
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  window.URL.revokeObjectURL(url)
}

export async function deleteAttachment(id) {
  await api.delete(`/api/attachments/${id}`)
}
