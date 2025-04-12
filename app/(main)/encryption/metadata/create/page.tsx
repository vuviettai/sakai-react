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
    const [dropdownItem, setDropdownItem] = useState<DropdownItem | null>(null);
    const namespaceOptions: DropdownItem[] = useMemo(
        () => [
            { name: 'Demo', code: 'demo' },
        ],
        []
    );
    const assetFields: DropdownItem[] = useMemo(
        () => [
            { name: 'id', code: 'id' },
            { name: 'title', code: 'title' },
            { name: 'name', code: 'name' },
            { name: 'size', code: 'size' },
            { name: 'value', code: 'value' },
            { name: 'description', code: 'description' },
            { name: 'attachment', code: 'attachment' },
        ],
        []
    );
    useEffect(() => {
        setDropdownItem(namespaceOptions[0]);
    }, [namespaceOptions]);
    // Add form state
    const [formData, setFormData] = useState<EncryptionMetadata>({
        key: '', namespace: 'demo',
        objectName: 'Asset', joinedFields: [], separatedFields: ["attachment"]
    });

    const handleSubmit = async () => {
        const response = await createEncryptionMetadata(formData);
        if (response.status !== 200) {
            throw new Error('Failed to create encryption metadata');
        }
        toast.current?.show({
            severity: 'success', summary: 'Success',
            detail: `Encryption metadata created successfully in transaction ${response.data}`
        });
        router.push('/encryption/metadata/list');
    }

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12 md:col-6">
                <div className="card p-fluid">
                    <h5>Create object attributes</h5>
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
                            <InputText id="objectName" type="text" value={formData.objectName} onChange={(e) => setFormData(prev => ({ ...prev, objectName: e.target.value }))} />
                        </div>
                    </div>
                    <div className="field grid">
                        <label htmlFor="encryptionFields" className="col-12 mb-2 md:col-3 md:mb-0">
                            Encrypted fields
                        </label>
                        <div className="col-12 md:col-9">
                            <MultiSelect id="encryptionFields" value={formData.separatedFields} onChange={(e) => setFormData(prev => ({ ...prev, separatedFields: e.value }))} options={assetFields}
                                optionLabel="name"
                                optionValue="code"
                                placeholder="Select Fields" maxSelectedLabels={3} className="w-full md:w-20rem" />
                        </div>
                    </div>

                    <div className="field grid">
                        <Button label="Submit" onClick={handleSubmit} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MetadataCreate;
