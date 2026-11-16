import type { ProfileErrors } from "@/lib/domain/profile-validation";

export interface ProfileActionState {
  success: boolean;
  message: string | null;
  errors: ProfileErrors;
}

export const initialProfileActionState: ProfileActionState = {
  success: false,
  message: null,
  errors: {},
};
