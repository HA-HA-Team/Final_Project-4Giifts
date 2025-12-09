const base_url = import.meta.env.VITE_BACKEND_URL;

export const createUser = async (newUser) => {
  const request = await fetch(`${base_url}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newUser),
  });

  return request;
};

export const checkLogin = async (user) => {
  const response = await fetch(`${base_url}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  return response;
};

export const getPrivateData = async () => {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${base_url}/api/private`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });

  return response;
};
