export type registerRequest = {
  email: string;
  password: string;
};

export type loginRequest = {
  email: string;
  password: string;
};

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
