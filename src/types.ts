export type Role = 'trainer' | 'admin';

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
