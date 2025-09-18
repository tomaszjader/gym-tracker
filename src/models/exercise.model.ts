export interface Exercise {
  id: string;
  name: string;
  category?: string;
}

export interface WorkoutEntry {
  id: string;
  exerciseId: string;
  exerciseName: string;
  repetitions: number;
  weight: number;
  date: Date;
}

export interface WorkoutSession {
  id: string;
  date: Date;
  entries: WorkoutEntry[];
}