export interface AuthFormState {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: {
    email?: string;
    username?: string;
    password?: string;
  };
}

export const initialAuthFormState: AuthFormState = {
  status: "idle",
  message: "",
};
