export interface User {
  id: string;
  email: string;
  name: string;
  subscriptionStatus: 'active' | 'inactive' | 'past_due' | 'canceled';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  date: string;
  exercises: Exercise[];
  durationMinutes: number;
}

export interface BodyMeasurement {
  id: string;
  userId: string;
  date: string;
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
}

export interface Streak {
  userId: string;
  currentStreak: number;
  lastWorkoutDate: string;
}
