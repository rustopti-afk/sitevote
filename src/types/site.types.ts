export type SiteStatus = "ACTIVE" | "PENDING" | "REJECTED" | "ARCHIVED";

export type UserRole = "USER" | "MODERATOR" | "ADMIN";

export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon?: string;
  order: number;
}

export interface Site {
  id: string;
  name: string;
  slug: string;
  url: string;
  description?: string;
  thumbnail?: string;
  categoryId?: string;
  category?: Category;
  status: SiteStatus;
  voteCount: number;
  viewCount: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  hasVoted?: boolean;
  rank?: number;
}

export interface Vote {
  id: string;
  userId: string;
  siteId: string;
  createdAt: string;
  site?: Site;
}

export interface SiteFilters {
  search?: string;
  categoryId?: string;
  sortBy?: "votes" | "newest" | "name";
  page?: number;
  pageSize?: number;
}
