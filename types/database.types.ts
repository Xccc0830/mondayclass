import type {
  ActivityLevel,
  DietaryRestriction,
  FitnessGoal,
  Sex,
} from "@/types/profile";

type HealthProfileRow = {
  user_id: string;
  height_cm: number;
  weight_kg: number;
  body_fat_percent: number;
  age: number;
  sex: Sex;
  activity_level: ActivityLevel;
  fitness_goal: FitnessGoal;
  preferred_exercise_type: string | null;
  dietary_restrictions: DietaryRestriction[];
  dietary_other: string | null;
  daily_calorie_target: number | null;
  daily_carbohydrate_target: number | null;
  daily_protein_target: number | null;
  daily_fat_target: number | null;
  created_at: string;
  updated_at: string;
};

type HealthProfileInsert = Omit<HealthProfileRow, "created_at" | "updated_at">;

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          role: "student" | "trainer" | "admin";
          created_at: string;
        };
        Insert: {
          user_id: string;
          role: "student" | "trainer" | "admin";
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      health_profiles: {
        Row: HealthProfileRow;
        Insert: HealthProfileInsert;
        Update: Partial<HealthProfileInsert>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
