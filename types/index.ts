export interface User {
  id: string;
  email: string;
  name?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  role: "USER" | "ADMIN";
  createdAt: Date;
  updatedAt: Date;
}

export interface StandardResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
