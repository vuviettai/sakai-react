'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation'
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { SubjectAttribute } from '@/types/fabric';
import { getCurrentIdentity } from '@/services/fabric/identity';
import { addSubjectAttributes } from '@/services/fabric/authorization';
import { Toast } from 'primereact/toast';
import { InputTextarea } from 'primereact/inputtextarea';
interface DropdownItem {
    name: string;
    code: string;
}

const FormIdentityAttribute = () => {
    const router = useRouter()
    const toast = useRef<Toast>(null);
    const [dropdownItem, setDropdownItem] = useState<DropdownItem | null>(null);
    const dropdownItems: DropdownItem[] = useMemo(
        () => [
            { name: 'Org 1', code: 'org1.example.com' },
            { name: 'Org 2', code: 'org2.example.com' },
        ],
        []
    );

    useEffect(() => {
        setDropdownItem(dropdownItems[0]);
    }, [dropdownItems]);

    useEffect(() => {
        getCurrentIdentity().then(identity => {
            setFormData({ id: identity, attributes: [] });
        });
    }, []);
    // Add form state
    const [formData, setFormData] = useState<SubjectAttribute>({ id: '', attributes: [] });
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
    const handleSubmit = async () => {
        const response = await addSubjectAttributes(formData);
        if (response.status !== 200) {
            throw new Error('Failed to create subject attribute');
        }
        toast.current?.show({
            severity: 'success', summary: 'Success',
            detail: `Subject attribute created successfully in transaction ${response.data}`
        });
        router.push('/authorization/identity-attribute/list');
    }

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12 md:col-6">
                <div className="card p-fluid">
                    <h5>Create identity attributes</h5>
                    <div className="field grid">
                        <label htmlFor="id" className="col-12 mb-2 md:col-3 md:mb-0">Identity</label>
                        <div className="col-12 md:col-9">
                            <InputTextarea id="namespace" value={formData.id}
                                rows={4}
                                onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))} />
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

export default FormIdentityAttribute;
