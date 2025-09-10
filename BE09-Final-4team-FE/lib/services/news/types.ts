export interface NewsArticle {
  id: number;
  categoryId: number;
  categoryName: string;
  press: string;
  title: string;
  content: string;
  reporter: string;
  date: string;
  link: string; 
  createdAt: string;
}

export interface DashboardNews {
  title: string;
  source: string;
  time: string;
  url: string;
}