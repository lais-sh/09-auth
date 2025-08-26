export interface User {
  id: string;
  email: string;
  username: string;

  avatarUrl?: string | null;

  avatar?: string | null;

  createdAt?: string;
  updatedAt?: string;
}
