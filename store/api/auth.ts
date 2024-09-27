import { loginRequest, loginResponse, registerRequest, registerResponse } from "@/types/auth/type";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:8000/api/" }),

  endpoints: (builder) => ({
    registerUser: builder.mutation<registerResponse, registerRequest>({
      query: (data) => ({
        url: "auth/register",
        method: "POST",
        body: data,
      }),
    }),

    loginUser: builder.mutation<loginResponse, loginRequest>({
      query: (data) => ({
        url: "auth/signin",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useRegisterUserMutation, useLoginUserMutation } = authApi;
