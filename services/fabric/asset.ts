/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Contract } from '@hyperledger/fabric-gateway';
import { TextDecoder } from 'util';
import { org1Config, createContractClient } from '@services/fabric/common';
import { displayInputParameters } from '@services/fabric/common';
import { Asset } from '@/types/fabric';
const utf8Decoder = new TextDecoder();
const assetId = `asset${String(Date.now())}`;
const FUNC_CREATE_ASSET = 'CreateAsset';
const FUNC_TRANSFER_ASSET = 'TransferAsset';
const FUNC_READ_ASSET = 'ReadAsset';
const FUNC_GET_LIST_ASSETS = 'GetListAssets';
const FUNC_UPDATE_ASSET = 'UpdateAsset';

async function main(): Promise<void> {
    displayInputParameters(org1Config);
    const { grpcClient, gateway } = await createContractClient(org1Config);
    try {
        // Get a network instance representing the channel where the smart contract is deployed.
        const network = gateway.getNetwork(org1Config.channelName);

        // Get the smart contract from the network.
        const contract = network.getContract(org1Config.chaincodeSecurity);
        // Initialize a set of asset data on the ledger using the chaincode 'InitLedger' function.
        await initLedger(contract);

        // Return all the current assets on the ledger.
        await _getAllAssets(contract);

        // Create a new asset on the ledger.
        // await createAsset(contract);

        // Update an existing asset asynchronously.
        await transferAssetAsync(contract);

        // Get the asset details by assetID.
        await readAssetByID(contract);

        // Update an asset which does not exist.
        await updateNonExistentAsset(contract)
    } catch (error) {
        console.error('Error:', error);
    } finally {
        gateway.close();
        grpcClient.close();
    }
}

main().catch((error: unknown) => {
    console.error('******** FAILED to run the application:', error);
    process.exitCode = 1;
});


/**
 * This type of transaction would typically only be run once by an application the first time it was started after its
 * initial deployment. A new version of the chaincode deployed later would likely not need to run an "init" function.
 */
async function initLedger(contract: Contract): Promise<void> {
    console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of assets on the ledger');

    await contract.submitTransaction('InitLedger');

    console.log('*** Transaction committed successfully');
}
export async function getAllAssets(): Promise<Asset[]> {
    const { grpcClient, gateway } = await createContractClient(org1Config);
    let listAssets: Asset[] = [];
    try {
        const network = gateway.getNetwork(org1Config.channelName);
        const contract = network.getContract(org1Config.chaincodeDemo);
        listAssets = await _getAllAssets(contract);
    } finally {
        gateway.close();
        grpcClient.close();
    }
    return listAssets;
}
/**
 * Evaluate a transaction to query ledger state.
 */
async function _getAllAssets(contract: Contract): Promise<Asset[]> {
    console.log('\n--> Evaluate Transaction: GetAllAssets, function returns all the current assets on the ledger');

    const resultBytes = await contract.evaluateTransaction('GetAllAssets');

    const resultJson = utf8Decoder.decode(resultBytes);
    const result: unknown = JSON.parse(resultJson);
    console.log('*** Result:', result);
    return result as Asset[];
}

/**
 * Submit a transaction synchronously, blocking until it has been committed to the ledger.
 */
export async function createAsset(asset: Asset): Promise<void> {
    console.log('\n--> Submit Transaction: CreateAsset, creates new asset');
    const { grpcClient, gateway } = await createContractClient(org1Config);
    try {
        const network = gateway.getNetwork(org1Config.channelName);
        const contract = network.getContract(org1Config.chaincodeDemo);
        const response = await _createAsset(contract, asset);
        console.log('*** Transaction committed successfully');
        console.log(response);
    } finally {
        gateway.close();
        grpcClient.close();
    }
}
async function _createAsset(contract: Contract, asset: Asset): Promise<void> {
    const response = await contract.submitTransaction(
        FUNC_CREATE_ASSET,
        asset.id,
        asset.title,
        asset.name,
        String(asset.size),
        String(asset.value),
        asset.description,
        asset.attachment,
    );
    console.log(response);
}
/**
 * Submit transaction asynchronously, allowing the application to process the smart contract response (e.g. update a UI)
 * while waiting for the commit notification.
 */
async function transferAssetAsync(contract: Contract): Promise<void> {
    console.log('\n--> Async Submit Transaction: TransferAsset, updates existing asset owner');

    const commit = await contract.submitAsync('TransferAsset', {
        arguments: [assetId, 'Saptha'],
    });
    const oldOwner = utf8Decoder.decode(commit.getResult());

    console.log(`*** Successfully submitted transaction to transfer ownership from ${oldOwner} to Saptha`);
    console.log('*** Waiting for transaction commit');

    const status = await commit.getStatus();
    if (!status.successful) {
        throw new Error(`Transaction ${status.transactionId} failed to commit with status code ${String(status.code)}`);
    }

    console.log('*** Transaction committed successfully');
}

async function readAssetByID(contract: Contract): Promise<void> {
    console.log('\n--> Evaluate Transaction: ReadAsset, function returns asset attributes');

    const resultBytes = await contract.evaluateTransaction('ReadAsset', assetId);

    const resultJson = utf8Decoder.decode(resultBytes);
    const result: unknown = JSON.parse(resultJson);
    console.log('*** Result:', result);
}

/**
 * submitTransaction() will throw an error containing details of any error responses from the smart contract.
 */
async function updateNonExistentAsset(contract: Contract): Promise<void> {
    console.log('\n--> Submit Transaction: UpdateAsset asset70, asset70 does not exist and should return an error');

    try {
        await contract.submitTransaction(
            'UpdateAsset',
            'asset70',
            'blue',
            '5',
            'Tomoko',
            '300',
        );
        console.log('******** FAILED to return an error');
    } catch (error) {
        console.log('*** Successfully caught the error: \n', error);
    }
}
