import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define a service using a base URL and expected endpoints
export const esssApi = createApi({
  reducerPath: "esssApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:8000/api/" }),
  endpoints: (builder) => ({
    getModuleById: builder.query({
      query: (id) => `course/find//${id}`,
    }),

    getModulesBySubcourseId: builder.query({
      query: (subcourseId) => `module/getModules/${subcourseId}`,
    }),

    getSubcourseById: builder.query({
      query: (id) => `subCourse/find/${id}`,
    }),

    getSubcoursesByCourseId: builder.query({
      query: (courseId) => `subCourse/getSubCourses/${courseId}`,
    }),

    getAllCourse: builder.query({
      query: () => "course/getAllCourses",
    }),

    getCourseById: builder.query({
      query: (id) => `course/find/${id}`,
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetModuleByIdQuery,
  useGetAllCourseQuery,
  useGetCourseByIdQuery,
  useGetModulesBySubcourseIdQuery,
  useGetSubcoursesByCourseIdQuery,
  useGetSubcourseByIdQuery,
} = esssApi;
