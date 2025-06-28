import { Asset } from "@/types/fabric";
import { env } from "./common";
import axios from "axios";

export const createAsset = async (asset: Asset) => {
    const response = await axios.post(`${env.API_URL}/api/assets/create`, asset);
    return response;
}

export const createBatch = async (asset: Asset, counter: number) => {
    const response = await axios.post(`${env.API_URL}/api/assets/create/batch/${counter}`, asset);
    return response;
}

export const getAllAssets = async () => {
    const response = await fetch(`${env.API_URL}/api/assets/list`);
    return response.json();
}
export const paginateAssets = async (pageSize: number, bookmark: string = "") => {
    const response = await fetch(`${env.API_URL}/api/assets/paginate?pageSize=${pageSize}&bookmark=${bookmark}`);
    return response.json();
}
export const signAsset = async (id: string) => {
    try {
        const response = await axios.post(`${env.API_URL}/api/assets/sign/${id}`);
        return response;
    } catch (error: any) {
        console.error(error);
        return error.response;
    }
}
export const readAsset = async (id: string) => {
    const response = await axios.get(`${env.API_URL}/api/assets/get/${id}`);
    return response.data;
}

export const decryptAsset = async (id: string, keyId: string) => {
    const response = await axios.get(`${env.API_URL}/api/assets/decrypt/${id}?keyId=${keyId}`);
    return response.data;
}