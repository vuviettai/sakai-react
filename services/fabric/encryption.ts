import { PubKey } from "@/types/fabric";
import { env } from "./common";
import axios from "axios";

export async function importPubKey(pubkey: PubKey) {
    const response = await axios.post(`${env.API_URL}/encryption/import-pubkey`, pubkey);
    if (response.status !== 201) {
        throw new Error('Failed to create asset');
    }
    return response.data;
}

export async function getPubKey(org: string) {
    const response = await axios.get(`${env.API_URL}/encryption/get-pubkey/${org}`);
    return response.data;
}
