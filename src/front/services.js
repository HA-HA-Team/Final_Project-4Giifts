const base_url= import.meta.env.VITE_BACKEND_URL

export const createUser = async (newUser) => {
  try {
    const request = await fetch(
      `${base_url}/api/signup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      }
    );
    if (!request.ok) {
      const errorData = await request.json();
      throw new Error(errorData.detail);
    }

    return request;
  } catch (error) {
    throw error;
  }
};

export const checkLogin = async (user) => {
  try {
    const request = await fetch(
      `${base_url}/api/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      }
    );
    if (!request.ok) {
      const errorData = await request.json();
      throw new Error(errorData.detail);
    }
    console.log(request);
    return request;
  } catch (error) {
    throw error;
  }
};

export const getPrivateData = async () => {
  const token = sessionStorage.getItem("token");

  const response = await fetch(
    `${base_url}/api/private`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    }
  );

  return response;
};
