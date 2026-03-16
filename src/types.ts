export type UserRole = 'student' | 'teacher' | 'admin';

export interface UserProfile {
  id: string;
  auth_id: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  birth_date?: string;
  birth_place?: string;
  profile_image?: string;
  address?: string;
  school_year?: string;
  subjects?: string[];
  subscription_price?: number;
  account_status: 'pending' | 'active' | 'suspended';
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface Post {
  id: string;
  author_id: string;
  content: string;
  image_url?: string;
  video_url?: string;
  created_at: string;
  author?: UserProfile;
}

export interface LiveClass {
  id: string;
  teacher_id: string;
  title: string;
  description?: string;
  is_public: boolean;
  max_students: number;
  current_students: number;
  start_time: string;
  status: 'upcoming' | 'live' | 'ended';
  private_link?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  student_id: string;
  teacher_id: string;
  subject_id: string;
  status: 'active' | 'expired';
  created_at: string;
}
