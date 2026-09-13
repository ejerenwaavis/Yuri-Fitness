export interface UserProfile {
  age?: number;
  sex?: 'male' | 'female' | 'other';
  height?: number; // cm
  weight?: number; // kg
  level?: 'beginner' | 'intermediate' | 'advanced';
  goal?: 'hypertrophy' | 'strength' | 'fat_loss' | 'endurance';
  daysAvailable?: number;
  sessionLength?: number; // minutes
  equipment?: string[];
  injuries?: string[];
  dietPrefs?: string[];
  onboardingCompleted?: boolean;
}

export interface User {
  id: string;
  _id?: string;
  email: string;
  name: string;
  role?: 'user' | 'admin';
  avatar?: string;
  profile?: UserProfile;
  subscriptionStatus: 'free' | 'pro' | 'active' | 'inactive';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface ExerciseCatalogItem {
  id?: string;
  _id?: string;
  name: string;
  muscleGroups: string[];
  secondaryMuscles?: string[];
  equipment: string[];
  mediaUrl: string; // video/gif
  formCues: string[];
  substitutionTags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface LoggedSet {
  reps: number;
  weight: number;
  completed?: boolean;
}

export interface SessionExercise {
  exerciseId?: string;
  name: string;
  targetSets: number;
  targetReps: number;
  targetWeight: number;
  loggedSets: LoggedSet[];
  rpe?: string; // 😫😐🙂💪🔥
  mediaUrl?: string;
  formCues?: string[];
  equipment?: string;
  sets?: number;
  reps?: number;
  weight?: number;
}

export interface WorkoutSession {
  id?: string;
  _id?: string;
  userId: string;
  date: string;
  durationMinutes: number;
  completed: boolean;
  source: 'generated' | 'ai-edited' | 'manual';
  exercises: SessionExercise[];
  rpe?: string; // Overall workout RPE
  createdAt?: string;
}

export interface ProgressMetric {
  id?: string;
  _id?: string;
  userId: string;
  date: string;
  weight?: number;
  height?: number;
  bmi?: number;
  unit?: 'cm' | 'in';
  neck?: number;
  shoulders?: number;
  chest?: number;
  biceps?: number;
  waist?: number;
  hips?: number;
  upperLeg?: number;
  measurements?: Record<string, number>;
  photoUrls?: string[]; // [front, side, back]
  createdAt?: string;
}

export interface YuriAiMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: Array<{
    name: string;
    arguments: Record<string, any>;
  }>;
  createdAt?: string;
}

export interface YuriAiSession {
  id?: string;
  _id?: string;
  userId: string;
  activeWorkoutId?: string;
  messages: YuriAiMessage[];
  stateSnapshot?: any;
  createdAt?: string;
}

// Backwards compatibility aliases
export type BodyMeasurement = ProgressMetric;
export interface Exercise {
  id?: string;
  _id?: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
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
