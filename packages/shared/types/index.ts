export interface User {
  id: string;
  email: string;
  name: string;
  role?: 'user' | 'admin';
  avatar?: string;
  height?: number;
  weight?: number;
  subscriptionStatus: 'active' | 'inactive' | 'past_due' | 'canceled';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface Exercise {
  id?: string;
  _id?: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

export interface WorkoutSession {
  id?: string;
  _id?: string;
  userId: string;
  date: string;
  exercises: Exercise[];
  durationMinutes: number;
  createdAt?: string;
}

export interface BodyMeasurement {
  id?: string;
  _id?: string;
  userId: string;
  date: string;
  height?: number;
  weight?: number;
  neck?: number;
  shoulders?: number;
  biceps?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  upperLeg?: number;
  lowerLeg?: number;
  unit: 'cm' | 'in';
  bmi?: number;
  createdAt?: string;
}

export interface Streak {
  userId: string;
  currentStreak: number;
  lastWorkoutDate: string;
}

export interface ExerciseInstruction {
  id?: string;
  _id?: string;
  name: string;
  category: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  cloudinaryPublicId?: string;
  targetMuscles?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  createdAt?: string;
}
