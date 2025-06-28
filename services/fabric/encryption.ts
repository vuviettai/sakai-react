import { PrivKey, PubKey } from "@/types/fabric";
import { env } from "./common";
import axios from "axios";
import { EncryptionMetadata } from "@/types/fabric";

export async function importPubKey(pubkey: PubKey) {
    const response = await axios.post(`${env.API_URL}/api/encryption/pubkey/import`, pubkey);
    return response;
}

// export async function getOrgPubKeys(org: string): Promise<PubKey[]> {
//     const response = await axios.get(`${env.API_URL}/api/encryption/pubkey?org=${org}`);
//     return response.data as PubKey[];
// }

export async function getAllPubKeys(): Promise<PubKey[]> {
    const response = await axios.get(`${env.API_URL}/api/encryption/pubkeys`);
    return response.data as PubKey[];
}

export async function importPrivKey(privkey: PrivKey) {
    const response = await axios.post(`${env.API_URL}/api/encryption/privkey/import`, privkey);
    return response;
}
export async function getPrivKey(keyId: string) {
    const response = await axios.get(`${env.API_URL}/api/encryption/privkey/${keyId}`);
    return response.data;
}
export async function createEncryptionMetadata(metadata: EncryptionMetadata) {
    if (metadata.namespace === '' || metadata.objectName === '') {
        throw new Error('Namespace and object name are required');
    }
    if (metadata.joinedFields === '' && metadata.separatedFields === '') {
        throw new Error('Joined fields and separated fields are required');
    }
    const response = await axios.post(`${env.API_URL}/api/encryption/metadata/create`, metadata);
    return response;
}


export async function getAllEncryptionMetadata() {
    const response = await axios.get(`${env.API_URL}/api/encryption/metadata/get-all`);
    return response.data;
}