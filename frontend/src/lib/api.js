import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const verifyClaim       = (text, district = 'Unknown') => api.post('/verify/check', { text, district }).then(r => r.data)
export const getPipeline       = (id)                          => api.get(`/verify/pipeline/${id}`).then(r => r.data)
export const getDashboardStats = ()                            => api.get('/dashboard/stats').then(r => r.data)
export const getDashboardAlerts= ()                            => api.get('/dashboard/alerts').then(r => r.data)
export const getDashboardTrends= ()                            => api.get('/dashboard/trends').then(r => r.data)
export const getQueue          = ()                            => api.get('/queue').then(r => r.data)
export const resolveQueueItem  = (id, verdict, note = '')      => api.post(`/queue/${id}/resolve`, { verdict, reviewer_note: note }).then(r => r.data)
