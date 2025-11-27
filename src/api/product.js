import {url, image} from "./configuration";

export const index = async () => {

    const response = await fetch(`${url}/products`, {
        method:'GET',
        headers:{
            Accept: "application/json",
        },
    })

    return await response.json()
}

export const store = async (body,token) => {

    const response = await fetch(`${url}/products`, {
        method:'POST',
        headers:{
            Accept: "application/json",
            Authorization: `Bearer ${token}`
        },
        body
    })

    return await response.json()
}

export const destroy = async (id, token) => {
    const response = await fetch(`${url}/products/${id}?_method=DELETE`, {
        method: "POST",
        headers: {
            Accept:  'application/json',
            Authorization: `Bearer ${token}`
        }
    })

    return await response.json()
}

export const update = async (body, id, token) => {
    const response = await fetch(`${url}/products/${id}?_method=PATCH`, {
        method:'POST',
        headers:{
            Accept: "application/json",
            Authorization: `Bearer ${token}`
        },
        body
    })

    return await response.json()
}