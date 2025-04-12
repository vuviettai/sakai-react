import { Asset } from "@/types/fabric";
import { env } from "./common";
import axios from "axios";

export const createAsset = async (asset: Asset) => {
    const response = await axios.post(`${env.API_URL}/assets/create`, asset);
    if (response.status !== 201) {
        throw new Error('Failed to create asset');
    }
    return response.data;
}
export const getAllAssets = async () => {
    const response = await fetch(`${env.API_URL}/assets/list`);
    return response.json();
}
