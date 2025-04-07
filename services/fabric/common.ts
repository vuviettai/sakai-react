import * as path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as crypto from 'crypto';
import { FabricConfig, ContractClient } from '@/types/fabric';
import { connect, Contract, hash, Identity, Signer, signers } from '@hyperledger/fabric-gateway';
import { promises as fs } from 'fs';

const channelName = envOrDefault('CHANNEL_NAME', 'mychannel');
const chaincodeSecurity = envOrDefault('CHAINCODE_SECURITY_NAME', 'security');
const chaincodeDemo = envOrDefault('CHAINCODE_DEMO_NAME', 'demo');

export const org1Config = getFabricConfig('Org1');
export const org2Config = getFabricConfig('Org2');

function getFabricConfig(org: string): FabricConfig {
    const PREFIX = org.toUpperCase();
    const mspId = envOrDefault(`${PREFIX}_MSP`, `${org}MSP`);

    // Path to crypto materials.
    const cryptoPath = envOrDefault(`${PREFIX}_CRYPTO_PATH`, path.resolve(__dirname, '..', '..', '..', 'test-network', 'organizations', 'peerOrganizations', `${org}.example.com`));

    // Path to user private key directory.
    const keyDirectoryPath = envOrDefault(`${PREFIX}_KEY_DIRECTORY_PATH`, path.resolve(cryptoPath, 'users', `User1@${org}.example.com`, 'msp', 'keystore'));

    // Path to user certificate directory.
    const certDirectoryPath = envOrDefault(`${PREFIX}_CERT_DIRECTORY_PATH`, path.resolve(cryptoPath, 'users', `User1@${org}.example.com`, 'msp', 'signcerts'));

    // Path to peer tls certificate.
    const tlsCertPath = envOrDefault(`${PREFIX}_TLS_CERT_PATH`, path.resolve(cryptoPath, 'peers', `peer0.${org}.example.com`, 'tls', 'ca.crt'));

    // Gateway peer endpoint.
    const peerEndpoint = envOrDefault(`${PREFIX}_PEER_ENDPOINT`, 'localhost:7051');

    // Gateway peer SSL host name override.
    const peerHostAlias = envOrDefault(`${PREFIX}_PEER_HOST_ALIAS`, `peer0.${org}.example.com`);
    return {
        org,
        channelName,
        chaincodeSecurity,
        chaincodeDemo,
        mspId,
        cryptoPath,
        keyDirectoryPath,
        certDirectoryPath,
        tlsCertPath,
        peerEndpoint,
        peerHostAlias,
    };
}

export async function createContractClient(fabricConfig: FabricConfig): Promise<ContractClient> {
    // The gRPC client connection should be shared by all Gateway connections to this endpoint.
    const grpcClient = await newGrpcConnection(fabricConfig);

    const gateway = connect({
        client: grpcClient,
        identity: await newIdentity(fabricConfig),
        signer: await newSigner(fabricConfig.keyDirectoryPath),
        hash: hash.sha256,
        // Default timeouts for different gRPC calls
        evaluateOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        endorseOptions: () => {
            return { deadline: Date.now() + 15000 }; // 15 seconds
        },
        submitOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        commitStatusOptions: () => {
            return { deadline: Date.now() + 60000 }; // 1 minute
        },
    });
    return {
        grpcClient,
        gateway,
    };
}

async function newGrpcConnection(fabricConfig: FabricConfig): Promise<grpc.Client> {
    const tlsRootCert = await fs.readFile(fabricConfig.tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(fabricConfig.peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': fabricConfig.peerHostAlias,
    });
}

async function newIdentity(fabricConfig: FabricConfig): Promise<Identity> {
    const certPath = await getFirstDirFileName(fabricConfig.certDirectoryPath);
    const credentials = await fs.readFile(certPath);
    return { mspId: fabricConfig.mspId, credentials: new Uint8Array(credentials) };
}

async function getFirstDirFileName(dirPath: string): Promise<string> {
    const files = await fs.readdir(dirPath);
    const file = files[0];
    if (!file) {
        throw new Error(`No files in directory: ${dirPath}`);
    }
    return path.join(dirPath, file);
}
async function newSigner(keyDirectoryPath: string): Promise<Signer> {
    const keyPath = await getFirstDirFileName(keyDirectoryPath);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}
/**
 * envOrDefault() will return the value of an environment variable, or a default value if the variable is undefined.
 */
function envOrDefault(key: string, defaultValue: string): string {
    return process.env[key] || defaultValue;
}

/**
 * displayInputParameters() will print the global scope parameters used by the main driver routine.
 */
export function displayInputParameters(fabricConfig: FabricConfig): void {
    console.log(`Org:       ${fabricConfig.org}`);
    console.log(`channelName:       ${fabricConfig.channelName}`);
    console.log(`chaincodeSecurity: ${fabricConfig.chaincodeSecurity}`);
    console.log(`chaincodeDemo:     ${fabricConfig.chaincodeDemo}`);
    console.log(`mspId:             ${fabricConfig.mspId}`);
    console.log(`cryptoPath:        ${fabricConfig.cryptoPath}`);
    console.log(`keyDirectoryPath:  ${fabricConfig.keyDirectoryPath}`);
    console.log(`certDirectoryPath: ${fabricConfig.certDirectoryPath}`);
    console.log(`tlsCertPath:       ${fabricConfig.tlsCertPath}`);
    console.log(`peerEndpoint:      ${fabricConfig.peerEndpoint}`);
    console.log(`peerHostAlias:     ${fabricConfig.peerHostAlias}`);
}