import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Helper to get full URL for images
export const getImageUrl = (path: string | undefined) => {
  if (!path) return undefined;
  if (path.startsWith('data:') || path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
};

export type Chapter = {
  id: string;
  book_id: string;
  title: string;
  content: string;
  order_index: number;
  created_at: string;
  updated_at: string;
};

export type Book = {
  id: string;
  title: string;
  subtitle?: string;
  cover_image?: string;
  created_at: string;
  updated_at: string;
  chapters?: Chapter[];
};

export const booksApi = {
  list: () => api.get<Book[]>('/books').then((res) => res.data),
  get: (id: string) => api.get<Book & { chapters: Chapter[] }>(`/books/${id}`).then((res) => res.data),
  create: (title: string) => api.post<Book>('/books', { title }).then((res) => res.data),
  update: (id: string, data: { title?: string; subtitle?: string; cover_image?: string }) => 
    api.patch<Book>(`/books/${id}`, data).then((res) => res.data),
  updateCover: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('cover', file);
    return api.patch<Book>(`/books/${id}/cover`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data);
  },
  delete: (id: string) => api.delete(`/books/${id}`),
};

export const chaptersApi = {
  get: (id: string) => api.get<Chapter>(`/chapters/${id}`).then((res) => res.data),
  create: (bookId: string, title: string, orderIndex: number) =>
    api.post<Chapter>('/chapters', { bookId, title, orderIndex }).then((res) => res.data),
  update: (id: string, data: { title?: string; content?: string; orderIndex?: number }) =>
    api.patch<Chapter>(`/chapters/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/chapters/${id}`),
};
