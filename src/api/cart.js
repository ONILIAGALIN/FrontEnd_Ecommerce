//export const url = "http://localhost:8000/api"
import { url } from "./configuration";
// Images are stored in `public/storage/uploads/products/` on the Laravel backend
export const image = 'http://localhost:8000/storage/uploads/products/'

export const store = async (body, token) => {
    try {
        console.debug('cart.store: sending request', { url: `${url}/carts`, tokenMask: token ? `${String(token).slice(0,8)}...` : null, isJSON: typeof body === 'object' && !(body instanceof FormData), bodyPreview: (typeof body === 'object' && !(body instanceof FormData)) ? body : 'FormData' })
        const response = await fetch(`${url}/carts`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body) 
        });

        try {
            const data = await response.json();
            if (data && typeof data === 'object' && !Array.isArray(data)) {
                return { ok: response.ok, status: response.status, ...data };
            }
            return { ok: response.ok, status: response.status, data };
        } catch (err) {
            const text = await response.text().catch(() => null);
            return { ok: false, message: `Invalid JSON response from server: ${text ?? 'no body'}` };
        }
    } catch (err) {
        console.error('cart.store failed:', err)
        return { ok: false, message: err?.message ?? 'Network error (failed to fetch)' };
    }
};

export const update = async (body, id, token) => {
    try {
        const response = await fetch(`${url}/carts/${id}?_method=PATCH`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

    try {
        const data = await response.json();
            if (data && typeof data === 'object' && !Array.isArray(data)) {
                return { ok: response.ok, status: response.status, ...data };
            }
            return { ok: response.ok, status: response.status, data };
            } catch (err) {
                const text = await response.text().catch(() => null);
                return { ok: false, message: `Invalid JSON response from server: ${text ?? 'no body'}` };
            }
            } catch (err) {
                return { ok: false, message: err?.message ?? 'Network error (failed to fetch)' };
            }
};

export const index = async (token) => {
    try {
        const response = await fetch(`${url}/carts`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        try {
            const data = await response.json();
            if (data && typeof data === 'object' && !Array.isArray(data)) {
                return { ok: response.ok, status: response.status, ...data };
            }
            return { ok: response.ok, status: response.status, data };
        } catch (err) {
            const text = await response.text().catch(() => null);
            return { ok: response.ok, status: response.status, message: `Invalid JSON: ${text ?? 'no body'}` };
        }
    } catch (err) {
        console.error('cart.index failed:', err);
        return { ok: false, message: err?.message ?? 'Network error (failed to fetch)' };
    }
};

export const destroy = async (id, token) => {
    try {
        const response = await fetch(`${url}/carts/${id}?_method=DELETE`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        try {
            const data = await response.json();
            if (data && typeof data === 'object' && !Array.isArray(data)) {
                return { ok: response.ok, status: response.status, ...data };
            }
            return { ok: response.ok, status: response.status, data };
        } catch (err) {
            const text = await response.text().catch(() => null);
            return { ok: response.ok, status: response.status, message: `Invalid JSON: ${text ?? 'no body'}` };
        }
    } catch (err) {
        console.error('cart.destroy failed:', err);
        return { ok: false, message: err?.message ?? 'Network error (failed to fetch)' };
    }
};
