'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { FileUpload } from 'primereact/fileupload';
import { Asset } from '@/types/fabric';
import { createAsset, createBatch } from '@/services/fabric/asset';
import { Toast } from 'primereact/toast';
import { getAllPubKeys } from '@/services/fabric/encryption';
import { PubKey } from '@/types/fabric';

interface DropdownItem {
    name: string;
    code: string;
}

const FormCreateAsset = () => {
    const toast = useRef<Toast>(null);
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dropdownItem, setDropdownItem] = useState<DropdownItem | null>(null);
    const [publicKeys, setPublicKeys] = useState<PubKey[]>([]);
    const [counter, setCounter] = useState(1);
    const [selectedPublicKey, setSelectedPublicKey] = useState<PubKey | null>(null);
    // Add form state
    const [formData, setFormData] = useState<Asset>({
        id: '',
        title: '',
        value: 0,
        destinationOrg: 'org2.example.com',
        keyId: '',
        description: '',
        attachment: '',
        status: '',
        createdAt: '',
        updatedAt: ''
    });

    const dropdownItems: DropdownItem[] = useMemo(
        () => [
            { name: 'Org 1', code: 'org1.example.com' },
            { name: 'Org 2', code: 'org2.example.com' },
        ],
        []
    );

    useEffect(() => {
        setDropdownItem(dropdownItems[0]);
        // Fetch all public keys when component mounts
        getAllPubKeys().then(keys => {
            setPublicKeys(keys);
        });
    }, [dropdownItems]);

    const setAttachment = async (file: File) => {
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        setFormData(prev => ({ ...prev, attachment: base64 }));
    }

    const onChangeOrganization = async (e: any) => {
        setFormData(prev => ({ ...prev, destinationOrg: e.target.value }));
    }

    const onPublicKeyChange = (e: any) => {
        setFormData(prev => ({ ...prev, keyId: e.value.keyId }));
        setSelectedPublicKey(e.value);
    }

    const decodeBase64 = (base64String: string | undefined) => {
        if (!base64String) return '';
        try {
            return atob(base64String);
        } catch (error) {
            console.error('Error decoding base64:', error);
            return base64String;
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        if (isSubmitting) return; // Prevent double submit

        setIsSubmitting(true);
        try {
            if (formData.id === '') {
                throw new Error('ID is required');
            }
            if (counter == 1) {
                const response = await createAsset(formData);
                if (response.status !== 200) {
                    throw new Error('Failed to create asset');
                }
                toast.current?.show({ severity: 'success', summary: 'Success', detail: `Asset created successfully in transaction ${response.data}` });
                router.push('/assets/list');
            } else if (counter > 1) {
                const response = await createBatch(formData, counter);
                if (response.status !== 200) {
                    throw new Error('Failed to update asset');
                }
                toast.current?.show({ severity: 'success', summary: 'Success', detail: `Asset updated successfully in transaction ${response.data}` });
            }
            // Reset form after successful submission
            setFormData({
                id: '',
                title: '',
                value: 0,
                destinationOrg: '',
                keyId: '',
                description: '',
                attachment: '',
                status: '',
                createdAt: '',
                updatedAt: ''
            });

        } catch (error) {
            console.error('Error creating asset:', error);
            // You might want to add error notification here
            toast.current?.show({ severity: 'error', summary: 'Error', detail: `Failed to create asset` });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12 md:col-6">
                <div className="card p-fluid">
                    <h5>Create new asset</h5>
                    <div className="field grid">
                        <label htmlFor="counter" className="col-12 mb-2 md:col-3 md:mb-0">Counter</label>
                        <div className="col-12 mb-2 md:col-9 md:mb-0">
                            <InputNumber
                                id="counter"
                                value={counter}
                                onChange={(e) => setCounter(e.value as number)}
                                className="mr-2"
                            />
                        </div>
                    </div>

                    <div className="field grid">
                        <label htmlFor="destinationOrg" className="col-12 mb-2 md:col-3 md:mb-0">Destination Org</label>
                        <div className="col-12 mb-2 md:col-9 md:mb-0">
                            <Dropdown
                                id="destinationOrg"
                                value={formData.destinationOrg}
                                onChange={onChangeOrganization}
                                options={dropdownItems}
                                optionLabel="name"
                                optionValue="code"
                            />
                        </div>
                    </div>

                    <div className="field grid">
                        <label htmlFor="publicKey" className="col-12 mb-2 md:col-3 md:mb-0">Public Key</label>
                        <div className="col-12 mb-2 md:col-9 md:mb-0">
                            <Dropdown
                                id="publicKey"
                                value={selectedPublicKey}
                                onChange={onPublicKeyChange}
                                optionLabel="keyId"
                                options={publicKeys.filter(key => key.organization === formData.destinationOrg)}
                                placeholder="Select a public key"
                                className="mr-2"
                            />
                        </div>
                    </div>

                    <div className="field grid">
                        <label htmlFor="id" className="col-12 mb-2 md:col-3 md:mb-0">ID</label>
                        <div className="col-12 mb-2 md:col-9 md:mb-0">
                            <InputText
                                id="id"
                                value={formData.id}
                                onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                                className="mr-2"
                            />
                        </div>
                    </div>
                    <div className="field grid">
                        <label htmlFor="title" className="col-12 mb-2 md:col-3 md:mb-0">Title</label>
                        <div className="col-12 mb-2 md:col-9 md:mb-0">
                            <InputText
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                className="mr-2"
                            />
                        </div>
                    </div>
                    <div className="field grid">
                        <label htmlFor="value" className="col-12 mb-2 md:col-3 md:mb-0">Value</label>
                        <div className="col-12 mb-2 md:col-9 md:mb-0">
                            <InputNumber
                                id="value"
                                value={formData.value}
                                onValueChange={(e) => setFormData(prev => ({ ...prev, value: e.value as number }))}
                                className="mr-2"
                            />
                        </div>
                    </div>
                    <div className="field grid">
                        <label htmlFor="description" className="col-12 mb-2 md:col-3 md:mb-0">Description</label>
                        <div className="col-12 mb-2 md:col-9 md:mb-0">
                            <InputTextarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                rows={4}
                                className="mr-2"
                            />
                        </div>
                    </div>
                    {/* <div className="field grid">
                        <label htmlFor="attachment" className="col-12 mb-2 md:col-3 md:mb-0">Attachment</label>
                        <div className="col-12 mb-2 md:col-9 md:mb-0">
                            <FileUpload
                                id="attachment"
                                onSelect={(e) => setAttachment(e.files[0])}
                                className="mr-2"
                            />
                        </div>
                    </div> */}
                    <div className="field grid">
                        <label htmlFor="empty" className="col-12 mb-2 md:col-3 md:mb-0"></label>
                        <div className="col-12 mb-2 md:col-9 md:mb-0">
                            <Button label="Submit" onClick={handleSubmit} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-12 md:col-6">
                <h5>Public key</h5>
                <div className="field grid">
                    <InputTextarea
                        id="publickey"
                        value={decodeBase64(selectedPublicKey?.publicKey)}
                        rows={10}
                        className="col-12 mb-2 md:col-11 md:mb-0"
                    />
                </div>
            </div>
        </div >
    );
};

export default FormCreateAsset;
