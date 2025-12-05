import { url as API_URL } from './configuration';

//export const url = "https://leoniel.site/api";
//export const image = 'https://leoniel.site/storage/uploads/products/';

export const checkout = async (token, body) => {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = { ok: false, message: 'No response from server' };
    }

    return { ok: response.ok, status: response.status, ...data };
  } catch (err) {
    return { ok: false, message: err.message };
  }
};


export const getOrders = async (token) => {
  const res = await fetch(`${API_URL}/orders`, {
    mode: 'cors',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  try {
    const data = await res.json();
    if (data && typeof data === 'object' && !Array.isArray(data)) return { ok: res.ok, status: res.status, ...data }
    return { ok: res.ok, status: res.status, data }
  } catch (err) {
    const text = await res.text().catch(() => null)
    if (res.ok) return { ok: true, status: res.status }
    return { ok: false, status: res.status, message: `Invalid JSON: ${text ?? 'no body'}` }
  }
};

export const getOrderDetails = async (token, id) => {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    mode: 'cors',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  try {
    const data = await res.json();
    if (data && typeof data === 'object' && !Array.isArray(data)) return { ok: res.ok, status: res.status, ...data }
    return { ok: res.ok, status: res.status, data }
  } catch (err) {
    const text = await res.text().catch(() => null)
    if (res.ok) return { ok: true, status: res.status }
    return { ok: false, status: res.status, message: `Invalid JSON: ${text ?? 'no body'}` }
  }
};

export async function updateOrderStatus(id, status, token) {
  try {
    const res = await fetch(`${API_URL}/orders/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    return await res.json();
  } catch (err) {
    return { ok: false, message: err.message };
  }
};

