import api from "./api";

export const registerUser = (formData) =>
  api.post("/users/register", formData);

export const loginUser = (credentials) =>
  api.post("/users/login", credentials);

export const getCurrentUser = () =>
  api.get("/users/getUser");

export const logoutUser = () =>
  api.post("/users/logout");

export const refreshAccessToken = () =>
  api.post("/users/refresh-token");

export const changePassword = (data) =>
  api.post("/users/change-password", data);

export const updateAccount = (data) =>
  api.post("/users/update", data);

export const updateAvatar = (formData) =>
  api.post("/users/update_avatar", formData);
