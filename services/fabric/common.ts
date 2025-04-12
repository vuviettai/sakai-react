import { Environment } from "@/types/fabric";

export const env: Environment = {
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001'
}
