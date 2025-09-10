import apiClient from '../common/api-client'
import { NewsArticle } from './types'

export const newsApi = {
  getRecentNewsForDashboard: async (): Promise<NewsArticle[]> => {
    const response = await apiClient.get<NewsArticle[]>('/api/news')
    const allNews = response.data

    if (allNews.length <= 3) {
      return allNews
    }

    const shuffled = allNews.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 3)
  },

  getAllNews: async (): Promise<NewsArticle[]> => {
    const response = await apiClient.get<NewsArticle[]>('/api/news')
    return response.data
  }
}