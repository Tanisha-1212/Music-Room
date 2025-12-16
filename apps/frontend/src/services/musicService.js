import api from './api.js';

export const musicAPI = {

    searchMusic: (query, limit = 10) => api.get('/music/search', { params: { q: query, limit } }),

    getMusicDetails : (videoId) => api.get(`/music/details/${videoId}`)
}