import { Contract } from '@hyperledger/fabric-gateway';
import * as grpc from '@grpc/grpc-js';
export type Environment = {
    API_URL: string;
}
export type FabricConfig = {
    org: string;
    username: string;
    channelName: string;
    chaincodeSecurity: string;
    chaincodeDemo: string;
    mspId: string;
    cryptoPath: string;
    keyDirectoryPath: string;
    certDirectoryPath: string;
    tlsCertPath: string;
    peerEndpoint: string;
    peerHostAlias: string;
};

export interface ContractClient {
    grpcClient: grpc.Client;
    gateway: Gateway
}
export interface Attribute {
    key: string;
    value: string;
}
export interface ObjectAttribute {
    key: string?;
    namespace: string;
    objectName: string;
    action: string;
    attributes: Attribute[];
}
export interface SubjectAttribute {
    id: string;
    attributes: Attribute[];
}
export interface PubKey {
    keyId: string;
    organization: string;
    publicKey: string;
}
export interface PrivKey {
    keyId: string;
    privkey: string;
}

export interface EncryptionMetadata {
    key: string;
    namespace: string;
    objectName: string;
    joinedFields: string;
    separatedFields: string;
}
export interface Asset {
    id: string;
    title: string;
    value: number;
    destinationOrg: string; //Organization name
    keyId: string;
    description: string;
    attachment: string; //Base64 encoded string
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface FileUpload {
    file: File;
    counter: number;
}