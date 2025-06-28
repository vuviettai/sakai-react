import { PubKey } from "@/types/fabric";
import { env } from "./common";
import axios from "axios";

export async function getCurrentIdentity() {
    const response = await axios.get(`${env.API_URL}/api/authorization/currentIdentity`);
    if (response.status !== 200) {
        throw new Error('Failed to get current identity');
    }
    return response.data;
}
