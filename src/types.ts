export type Role = 'trainer' | 'admin' | 'student';

export interface User {
  id: number;
  email: string;
  role: Role;
}

export interface Specialty {
  id: number;
  name: string;
}

export interface PricingPackage {
  id: number;
  trainerId: number;
  name: string;
  description: string;
  sessions: number;
  price: number;
  isPopular: boolean;
}

export interface PreviousWork {
  id: number;
  trainerId: number;
  photo: string;
  studentName: string;
  goal: string;
  duration: string;
  description: string;
  displayOrder: number;
  isVisible: boolean;
}

export interface Review {
  id: number;
  trainerId: number;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Certification {
  id: number;
  trainerId: number;
  name: string;
  issuer: string;
  year: number | null;
}

export interface TrainerSummary {
  id: number;
  userId: number;
  name: string;
  tagline: string;
  profilePhoto: string;
  coverPhoto: string;
  location: string;
  isRemote: boolean;
  yearsExperience: number;
  availability: string[];
  isPublished: boolean;
  isVerified: boolean;
  responseTime: string;
  createdAt: string;
  specialties: Specialty[];
  rating: number;
  reviewCount: number;
  startingPrice: number;
  packageCount: number;
}

export interface Trainer extends TrainerSummary {
  bio: string;
  packages: PricingPackage[];
  previousWork: PreviousWork[];
  reviews: Review[];
  certifications: Certification[];
}

export interface TrainersResponse {
  trainers: TrainerSummary[];
  total: number;
}

export interface AuthResponse {
  token: string;
  user: User;
  trainerId: number | null;
}

export interface StudentProfile {
  id: number;
  userId: number;
  name: string;
  email: string;
  enrolledAt: string;
}

export interface TrainingSession {
  id: number;
  trainerId: number;
  studentId: number;
  studentName: string;
  title: string;
  scheduledAt: string;
  durationMin: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  notes: string;
  createdAt: string;
  pendingChangeRequest?: SessionChangeRequest;
}

export interface SessionChangeRequest {
  id: number;
  sessionId: number;
  requestedBy: 'trainer' | 'student';
  proposedAt: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Message {
  id: number;
  trainerId: number;
  studentId: number;
  sender: 'trainer' | 'student';
  content: string;
  createdAt: string;
}

export interface SessionRequest {
  id: number;
  trainerId: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  packageId: number | null;
  packageName: string | null;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface StudentAuthResponse {
  token: string;
  user: User;
  studentId: number;
}
