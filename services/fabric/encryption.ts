import { Contract } from "@hyperledger/fabric-gateway";
import { createContractClient, org1Config, org2Config } from "./common";

const FUNC_IMPORT_PUBLIC_KEY = 'ImportPublicKey';

export async function importPubKey(org: string, base64PubKey: string) {
    console.log('\n--> Submit Transaction: Import pubkey for current organization');
    const config = org === 'org1' ? org1Config : org2Config;
    const { grpcClient, gateway } = await createContractClient(config);
    try {
        const network = gateway.getNetwork(config.channelName);
        const contract = network.getContract(config.chaincodeDemo);
        const response = await _importPubKey(contract, base64PubKey);
        console.log('*** Transaction committed successfully');
        console.log(response);
    } finally {
        gateway.close();
        grpcClient.close();
    }
    return base64PubKey;
}

async function _importPubKey(contract: Contract, base64PubKey: string) {
    const response = await contract.submitTransaction(
        FUNC_IMPORT_PUBLIC_KEY,
        base64PubKey
    );
    return response;
}