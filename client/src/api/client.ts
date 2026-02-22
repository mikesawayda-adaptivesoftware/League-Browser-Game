import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/',
  headers: { 'Content-Type': 'application/json' },
});

export const puzzle = {
  daily: (game: string) => apiClient.get(`/api/puzzle/${game}/daily`).then(r => r.data),
  random: (game: string) => apiClient.get(`/api/puzzle/${game}/random`).then(r => r.data),
};

export const results = {
  submit: (data: {
    gameMode: string;
    puzzleId: string;
    isDaily: boolean;
    attempts: number;
    score: number;
  }) => apiClient.post('/api/result', data).then(r => r.data),
};

export const leaderboard = {
  get: (game: string, options?: { limit?: number; daily?: boolean }) =>
    apiClient
      .get(`/api/leaderboard/${game}`, { params: { limit: options?.limit, daily: options?.daily } })
      .then(r => r.data),
};

export const user = {
  stats: () => apiClient.get('/api/user/stats').then(r => r.data),
};
