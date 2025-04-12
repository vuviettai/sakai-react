import { IdentityAttribute, ObjectAttribute } from "@/types/fabric";
import axios from "axios";
import { env } from "./common";

export const addObjectAttributes = async (objectAttribute: ObjectAttribute) => {
    const response = await axios.post(`${env.API_URL}/authorization/add-object-attributes`, objectAttribute);
    return response.data;
}

export const getObjectAttributes = async (objectAttribute: ObjectAttribute) => {
    const params = new URLSearchParams();
    if (objectAttribute.namespace) {
        params.set('namespace', objectAttribute.namespace);
    }
    if (objectAttribute.objectName) {
        params.set('objectName', objectAttribute.objectName);
    }
    if (objectAttribute.action) {
        params.set('action', objectAttribute.action);
    }
    const response = await axios.get(`${env.API_URL}/authorization/get-object-attributes?${params.toString()}`);
    return response.data;
}

export const deleteObjectAttributes = async (objectAttribute: ObjectAttribute) => {
    const params = new URLSearchParams();
    if (objectAttribute.namespace) {
        params.set('namespace', objectAttribute.namespace);
    }
    if (objectAttribute.objectName) {
        params.set('objectName', objectAttribute.objectName);
    }
    if (objectAttribute.action) {
        params.set('action', objectAttribute.action);
    }
    const response = await axios.delete(`${env.API_URL}/authorization/delete-object-attributes?${params.toString()}`);
    return response.data;
}

export const updateObjectAttributes = async (objectAttribute: ObjectAttribute) => {
    const response = await axios.put(`${env.API_URL}/authorization/update-object-attributes`, objectAttribute);
    return response.data;
}


export const addIdentityAttributes = async (identityAttribute: IdentityAttribute) => {
    const response = await axios.post(`${env.API_URL}/authorization/add-identity-attributes`, identityAttribute);
    return response.data;
}


export const getIdentityAttributes = async (identity: string) => {
    const params = new URLSearchParams();
    params.set('id', identity);
    const response = await axios.get(`${env.API_URL}/authorization/get-identity-attributes?${params.toString()}`);
    return response.data;
}

export const updateIdentityAttributes = async (identityAttribute: IdentityAttribute) => {
    const response = await axios.put(`${env.API_URL}/authorization/update-identity-attributes`, identityAttribute);
    return response.data;
}

export const deleteIdentityAttributes = async (identity: string) => {
    const response = await axios.delete(`${env.API_URL}/authorization/delete-identity-attributes`, { params: { id: identity } });
    return response.data;
}


