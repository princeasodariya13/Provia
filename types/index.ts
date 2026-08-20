export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StandardResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
