export interface User {
  id: string;
  email: string;
  username: string;

  avatarUrl: string | null;

  avatar: string;

  createdAt?: string;
  updatedAt?: string;
}
