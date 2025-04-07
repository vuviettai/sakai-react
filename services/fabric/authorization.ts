import { Contract } from "@hyperledger/fabric-gateway";
import { createContractClient, org1Config, org2Config } from "./common";
import { ObjectAttribute } from "@/types/fabric";
const FUNC_ADD_OBJECT_ATTRIBUTES = 'AddObjectAttributes';
const FUNC_GET_OBJECT_ATTRIBUTES = 'GetObjectAttributes';

export async function addObjectAttributes(objectAttribute: ObjectAttribute) {
    console.log('\n--> Submit Transaction: add object attributes');
    const config = org1Config;
    const { grpcClient, gateway } = await createContractClient(config);
    try {
        const network = gateway.getNetwork(config.channelName);
        const contract = network.getContract(config.chaincodeSecurity);
        const response = await _addObjectAttributes(contract, objectAttribute);
        console.log('*** Transaction committed successfully');
        console.log(response);
    } finally {
        gateway.close();
        grpcClient.close();
    }
    return objectAttribute;
}

async function _addObjectAttributes(contract: Contract, objectAttribute: ObjectAttribute): Promise<Uint8Array> {
    const response = await contract.submitTransaction(
        FUNC_ADD_OBJECT_ATTRIBUTES,
        objectAttribute.namespace,
        objectAttribute.objectName,
        objectAttribute.action,
        JSON.stringify(objectAttribute.attributes)
    );
    return response;
}