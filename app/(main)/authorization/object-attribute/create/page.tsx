'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation'
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { ObjectAttribute } from '@/types/fabric';
import { addObjectAttributes } from '@/services/fabric/authorization';
import { Toast } from 'primereact/toast';
interface DropdownItem {
    name: string;
    code: string;
}

const FormObjectAttribute = () => {
    const router = useRouter()
    const toast = useRef<Toast>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
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
    const actionOptions: DropdownItem[] = useMemo(
        () => [
            { name: 'SignAsset', code: 'SignAsset' },
        ],
        []
    );
    // Add form state
    const [formData, setFormData] = useState<ObjectAttribute>({ key: '', namespace: 'demo', objectName: 'asset', action: 'SignAsset', attributes: [] });
    // Add handlers for attributes
    const addAttribute = () => {
        setFormData(prev => ({
            ...prev,
            attributes: [...prev.attributes, { key: '', value: '' }]
        }));
    };

    const removeAttribute = (index: number) => {
        setFormData(prev => ({
            ...prev,
            attributes: prev.attributes.filter((_, i) => i !== index)
        }));
    };

    const updateAttribute = (index: number, field: 'key' | 'value', value: string) => {
        setFormData(prev => ({
            ...prev,
            attributes: prev.attributes.map((attr, i) =>
                i === index ? { ...attr, [field]: value } : attr
            )
        }));
    };
    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        if (isSubmitting) return; // Prevent double submit

        setIsSubmitting(true);
        try {
            const response = await addObjectAttributes(formData);
            if (response.status !== 200) {
                throw new Error('Failed to create object attributes');
            }
            toast.current?.show({
                severity: 'success', summary: 'Success',
                detail: `Object attribute created successfully in transaction ${response.data}`
            });
            router.push('/authorization/object-attribute/list');
        } catch (error) {
            console.error(error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: `Failed to create object attributes` });
        } finally {
            setIsSubmitting(false);
        }
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
                            <Dropdown id="objectName"
                                value={formData.objectName}
                                options={objectNameOptions}
                                optionLabel="name"
                                optionValue="code"
                                onChange={(e) => setFormData(prev => ({ ...prev, objectName: e.value }))} />
                        </div>
                    </div>
                    <div className="field grid">
                        <label htmlFor="action" className="col-12 mb-2 md:col-3 md:mb-0">
                            Action
                        </label>
                        <div className="col-12 md:col-9">
                            <Dropdown id="action"
                                value={formData.action}
                                options={actionOptions}
                                optionLabel="name"
                                optionValue="code"
                                onChange={(e) => setFormData(prev => ({ ...prev, action: e.value }))} />
                        </div>
                    </div>
                    <div className="field">
                        <label className="mb-2">Attributes</label>
                        {formData.attributes.map((attr, index) => (
                            <div key={index} className="field grid align-items-center">
                                <div className="col-5">
                                    <InputText
                                        placeholder="Key"
                                        value={attr.key}
                                        onChange={(e) => updateAttribute(index, 'key', e.target.value)}
                                    />
                                </div>
                                <div className="col-5">
                                    <InputText
                                        placeholder="Value"
                                        value={attr.value}
                                        onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                                    />
                                </div>
                                <div className="col-2">
                                    <Button
                                        icon="pi pi-trash"
                                        onClick={() => removeAttribute(index)}
                                        className="p-button-danger p-button-text"
                                    />
                                </div>
                            </div>
                        ))}
                        <Button
                            label="Add Attribute"
                            icon="pi pi-plus"
                            onClick={addAttribute}
                            className="p-button-text"
                            type="button"
                        />
                    </div>
                    <div className="field grid">
                        <Button label="Submit" onClick={handleSubmit} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormObjectAttribute;
