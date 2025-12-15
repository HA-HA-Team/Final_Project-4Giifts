const base_url = import.meta.env.VITE_BACKEND_URL;

export const createUser = async (newUser) => {
  const request = await fetch(`${base_url}/api/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newUser),
  });
  if (!request.ok) {
    const errorData = await request.json();
    throw new Error(errorData.detail);
  }

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

export const createContact = async (contactData) => {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${base_url}/api/contacts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(contactData),
  });
  return response;
};

export const updateContact = async (contactId, contactData) => {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${base_url}/api/contacto/${contactId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(contactData),
  });
  return response;
};

export const getUserContacts = async () => {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${base_url}/api/contacts`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
  return response;
};

export const getGiftHistory = async (contactId) => {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${base_url}/api/history/${contactId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
  return response;
};

export const clearGiftHistory = async (contactId) => {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${base_url}/api/history/${contactId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
  return response;
};

export const toggleFavorite = async (productId, contactId) => {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${base_url}/api/favorites`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ product_id: productId, contact_id: contactId }),
  });
  return response;
};

export const getContactFavorites = async (contactId) => {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${base_url}/api/favorites/${contactId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
  return response;
};

export const deleteFavorite = async (favId) => {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${base_url}/api/favorite/${favId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
  return response;
};

const authHeaders = () => {
  const token = sessionStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const getReminders = async () => {
  return fetch(`${base_url}/api/reminders`, {
    headers: authHeaders(),
  });
};

export const createReminder = async (data) => {
  return fetch(`${base_url}/api/reminders`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
};

export const deleteReminder = async (id) => {
  const res = await fetch(`${base_url}/api/reminders/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Error eliminando reminder");
  }

  return res;
};
 /* a ver si con este comentario solucionamos el problema */