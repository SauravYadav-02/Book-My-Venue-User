import axios from "axios";

const BASE_URL = "http://localhost:3000/blogs";

export interface Comment {
  _id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface Blog {
  _id: string;
  vendorId: {
    _id: string;
    fullName: string;
    businessName?: string;
  } | null;
  title: string;
  content: string;
  tags: string[];
  coverImage: string | null;
  images: string[];
  videoUrl: string | null;
  status: "pending" | "approved" | "rejected" | "suspended";
  adminNote?: string;
  deleted: boolean;
  likes: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedBlogs {
  data: Blog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 1. Get all approved blogs (Paginated with search / tags)
export const getBlogs = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  tag?: string;
}): Promise<PaginatedBlogs> => {
  const res = await axios.get<PaginatedBlogs>(BASE_URL, { params });
  return res.data;
};

// 2. Get single approved blog
export const getBlogById = async (id: string): Promise<Blog> => {
  const res = await axios.get<Blog>(`${BASE_URL}/${id}`);
  return res.data;
};

// 3. Toggle Like
export const toggleLike = async (
  blogId: string,
  userId: string
): Promise<{ liked: boolean; likeCount: number }> => {
  const res = await axios.post<{ liked: boolean; likeCount: number }>(
    `${BASE_URL}/${blogId}/like`,
    {},
    {
      headers: { userid: userId },
    }
  );
  return res.data;
};

// 4. Add Comment
export const addComment = async (
  blogId: string,
  userId: string,
  text: string,
  userName?: string
): Promise<Comment> => {
  const res = await axios.post<Comment>(
    `${BASE_URL}/${blogId}/comment`,
    { text, userName },
    {
      headers: { userid: userId },
    }
  );
  return res.data;
};

// 5. Delete Comment
export const deleteComment = async (
  blogId: string,
  commentId: string,
  userId: string
): Promise<{ success: boolean }> => {
  const res = await axios.delete<{ success: boolean }>(
    `${BASE_URL}/${blogId}/comment/${commentId}`,
    {
      headers: { userid: userId },
    }
  );
  return res.data;
};
