export type Role = 'user' | 'admin';

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  bio: string;
  avatarUrl: string | null;
  role: Role;
  createdAt: string;
}

export interface ListingContact {
  fullName: string;
  phone: string;
  email: string;
  avatarUrl: string | null;
}
