import { z} from 'zod';

const emailRegx = /^[^\s@]+@[^\s@]+\.(com|org)$/;
const passwordRegx = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

export const authSchema = z.object({
  email: z.string().min(1, 'Email is required').regex(emailRegx, "Invalid email format. Must contain '@' and end with '.com' or '.org'"),
  password: z.string().min(6, 'Password must be at least 6 characters').regex(passwordRegx, 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character')
});

export type registerResponse = {
  id: string;
  email: string;
  token: string;
};

export type loginResponse = {
  id: string;
  email: string;
  token: string;
};

export type registerRequest = z.infer<typeof authSchema>;
export type loginRequest = z.infer<typeof authSchema>;
