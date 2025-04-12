import { PubKey } from "@/types/fabric";
import { env } from "./common";
import axios from "axios";
import { EncryptionMetadata } from "@/types/fabric";

export async function importPubKey(pubkey: PubKey) {
    const response = await axios.post(`${env.API_URL}/encryption/pubkey/import`, pubkey);
    if (response.status !== 201) {
        throw new Error('Failed to create asset');
    }
    return response.data;
}

export async function getPubKey(org: string) {
    const response = await axios.get(`${env.API_URL}/encryption/pubkey/find/${org}`);
    return response.data;
}

export async function getAllPubKeys() {
    const response = await axios.get(`${env.API_URL}/encryption/pubkey/get-all`);
    return response.data;
}

export async function createEncryptionMetadata(metadata: EncryptionMetadata) {
    const response = await axios.post(`${env.API_URL}/encryption/metadata/create`, metadata);
    return response.data;
}


export async function getAllEncryptionMetadata() {
    const response = await axios.get(`${env.API_URL}/encryption/metadata/get-all`);
    return response.data;
}