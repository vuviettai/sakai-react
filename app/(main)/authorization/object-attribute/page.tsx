'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { ObjectAttribute } from '@/types/fabric';
import { addObjectAttributes } from '@/services/fabric/authorization';
interface DropdownItem {
    name: string;
    code: string;
}

const FormObjectAttribute = () => {
    const [dropdownItem, setDropdownItem] = useState<DropdownItem | null>(null);
    const dropdownItems: DropdownItem[] = useMemo(
        () => [
            { name: 'Demo', code: 'demo' },
        ],
        []
    );

    useEffect(() => {
        setDropdownItem(dropdownItems[0]);
    }, [dropdownItems]);
    // Add form state
    const [formData, setFormData] = useState<ObjectAttribute>({ namespace: 'demo', objectName: '', action: '', attributes: [] });
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
        const response = await addObjectAttributes(formData);
        if (response.status !== 201) {
            throw new Error('Failed to create asset');
        }
    }

    return (
        <div className="grid">
            <div className="col-12 md:col-6">
                <div className="card p-fluid">
                    <h5>Create object attributes</h5>
                    <div className="field grid">
                        <label htmlFor="namespace" className="col-12 mb-2 md:col-3 md:mb-0">Namespace</label>
                        <div className="col-12 md:col-9">
                            <Dropdown id="namespace"
                                value={formData.namespace}
                                options={dropdownItems}
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
                        <label htmlFor="action" className="col-12 mb-2 md:col-3 md:mb-0">
                            Action
                        </label>
                        <div className="col-12 md:col-9">
                            <InputText id="action" type="text" value={formData.action} onChange={(e) => setFormData(prev => ({ ...prev, action: e.target.value }))} />
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
