'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation'
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { EncryptionMetadata } from '@/types/fabric';
import { Toast } from 'primereact/toast';
import { createEncryptionMetadata } from '@/services/fabric/encryption';
import { MultiSelect } from 'primereact/multiselect';
interface DropdownItem {
    name: string;
    code: string;
}

const MetadataCreate = () => {
    const router = useRouter()
    const toast = useRef<Toast>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dropdownItem, setDropdownItem] = useState<DropdownItem | null>(null);
    const namespaceOptions: DropdownItem[] = useMemo(
        () => [
            { name: 'Demo', code: 'demo' },
        ],
        []
    );
    const objectNameOptions: DropdownItem[] = useMemo(
        () => [
            { name: 'Asset', code: 'asset' },
        ],
        []
    );
    const assetFields: DropdownItem[] = useMemo(
        () => [
            { name: 'Title', code: 'Title' },
            { name: 'Name', code: 'Name' },
            { name: 'Size', code: 'Size' },
            { name: 'Value', code: 'Value' },
            { name: 'Description', code: 'Description' },
            { name: 'Attachment', code: 'Attachment' },
        ],
        []
    );
    useEffect(() => {
        setDropdownItem(namespaceOptions[0]);
    }, [namespaceOptions]);
    // Add form state
    const [encryptionFields, setEncryptionFields] = useState<string[]>(["Description"]);
    const [formData, setFormData] = useState<EncryptionMetadata>({
        key: '', namespace: 'demo',
        objectName: 'asset', joinedFields: "", separatedFields: "Description"
    });
    const handleEncryptionFieldsChange = (fields: string[]) => {
        setEncryptionFields(fields);
        setFormData(prev => ({ ...prev, separatedFields: fields.join(',') }));
    }
    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        if (isSubmitting) return; // Prevent double submit

        setIsSubmitting(true);
        try {
            if (formData.namespace === '' || formData.objectName === '') {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: `Namespace and object name are required` });
                return;
            }
            const response = await createEncryptionMetadata(formData);
            if (response.status !== 200) {
                throw new Error('Failed to create encryption metadata');
            }
            toast.current?.show({
                severity: 'success', summary: 'Success',
                detail: `Encryption metadata created successfully in transaction ${response.data}`
            });
            router.push('/encryption/metadata/list');
        } catch (error) {
            console.error(error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: `Failed to create encryption metadata` });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12 md:col-6">
                <div className="card p-fluid">
                    <h5>Create encryption metadata</h5>
                    <div className="field grid">
                        <label htmlFor="namespace" className="col-12 mb-2 md:col-3 md:mb-0">Namespace</label>
                        <div className="col-12 md:col-9">
                            <Dropdown id="namespace"
                                value={formData.namespace}
                                options={namespaceOptions}
                                optionLabel="name"
                                optionValue="code"
                                onChange={(e) => setFormData(prev => ({ ...prev, namespace: e.value }))} />
                        </div>
                    </div>
                    <div className="field grid">
                        <label htmlFor="objectName" className="col-12 mb-2 md:col-3 md:mb-0">
                            Object name
                        </label>
                        <div className="col-12 md:col-9">
                            <Dropdown id="objectName"
                                value={formData.objectName}
                                options={objectNameOptions}
                                optionLabel="name"
                                optionValue="code"
                                onChange={(e) => setFormData(prev => ({ ...prev, objectName: e.value }))} />
                        </div>
                    </div>
                    <div className="field grid">
                        <label htmlFor="encryptionFields" className="col-12 mb-2 md:col-3 md:mb-0">
                            Encrypted fields
                        </label>
                        <div className="col-12 md:col-9">
                            <MultiSelect id="encryptionFields" value={encryptionFields} onChange={(e) => handleEncryptionFieldsChange(e.value)}
                                options={assetFields}
                                optionLabel="name"
                                optionValue="code"
                                placeholder="Select Fields" maxSelectedLabels={3} />
                        </div>
                    </div>

                    <div className="field grid">
                        <label htmlFor="joinedFields" className="col-12 mb-2 md:col-3 md:mb-0"></label>
                        <div className="col-12 md:col-9">
                            <Button label="Submit" onClick={handleSubmit} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MetadataCreate;
