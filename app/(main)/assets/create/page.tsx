'use client';

import axios from 'axios';
import React, { useState, useEffect, useMemo } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { FileUpload } from 'primereact/fileupload';
import { Asset } from '@/types/fabric';

interface DropdownItem {
    name: string;
    code: string;
}

const FormCreateAsset = () => {
    const [dropdownItem, setDropdownItem] = useState<DropdownItem | null>(null);
    const dropdownItems: DropdownItem[] = useMemo(
        () => [
            { name: 'Org 1', code: 'Org1' },
            { name: 'Org 2', code: 'Org2' },
        ],
        []
    );

    useEffect(() => {
        setDropdownItem(dropdownItems[0]);
    }, [dropdownItems]);

    // Add form state
    const [formData, setFormData] = useState<Asset>({
        id: '',
        title: '',
        name: '',
        size: 0,
        value: 0,
        destinationOrg: '',
        description: '',
        attachment: ''
    });
    const setAttachment = async (file: File) => {
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        setFormData(prev => ({ ...prev, attachment: base64 }));
    }
    // Handle form submission
    const handleSubmit = async () => {
        try {
            // const formDataToSend = new FormData();
            // Object.entries(formData).forEach(([key, value]) => {
            //     if (value !== null) {
            //         if (key !== 'attachment') {
            //             formDataToSend.append(key, value as string);
            //         } else {
            //             formDataToSend.append(key, value as File);
            //         }
            //     }
            // });

            // const response = await fetch('/api/fabric/assets', {
            //     method: 'POST',
            //     body: JSON.stringify(formData)
            // });
            const response = await axios.post('/api/fabric/assets', formData);
            if (response.status !== 201) {
                throw new Error('Failed to create asset');
            }

            // Reset form after successful submission
            setFormData({
                id: '',
                title: '',
                name: '',
                size: 0,
                value: 0,
                destinationOrg: '',
                description: '',
                attachment: ''
            });

            // You might want to add success notification here
            alert('Asset created successfully');

        } catch (error) {
            console.error('Error creating asset:', error);
            // You might want to add error notification here
            alert('Failed to create asset');
        }
    };

    return (
        <div className="grid">
            <div className="col-12 md:col-6">
                <div className="card p-fluid">
                    <h5>Create new asset</h5>
                    <div className="field">
                        <label htmlFor="destinationOrg" className="col-12 mb-2 md:col-2 md:mb-0">Destination Organization</label>
                        <Dropdown
                            id="destinationOrg"
                            value={formData.destinationOrg}
                            onChange={(e) => setFormData(prev => ({ ...prev, destinationOrg: e.target.value }))}
                            options={dropdownItems}
                            optionLabel="name"
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="id" className="col-12 mb-2 md:col-2 md:mb-0">ID</label>
                        <InputText
                            id="id"
                            value={formData.id}
                            onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                            className="col-12 mb-2 md:col-10 md:mb-0"
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="title" className="col-12 mb-2 md:col-2 md:mb-0">Title</label>
                        <InputText
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className="col-12 mb-2 md:col-10 md:mb-0"
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="name" className="col-12 mb-2 md:col-2 md:mb-0">Name</label>
                        <InputText
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="col-12 mb-2 md:col-10 md:mb-0"
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="size" className="col-12 mb-2 md:col-2 md:mb-0">Size</label>
                        <InputNumber
                            id="size"
                            value={formData.size}
                            onValueChange={(e) => setFormData(prev => ({ ...prev, size: e.value as number }))}
                            className="col-12 mb-2 md:col-10 md:mb-0"
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="value" className="col-12 mb-2 md:col-2 md:mb-0">Value</label>
                        <InputNumber
                            id="value"
                            value={formData.value}
                            onValueChange={(e) => setFormData(prev => ({ ...prev, value: e.value as number }))}
                            className="col-12 mb-2 md:col-10 md:mb-0"
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="description" className="col-12 mb-2 md:col-2 md:mb-0">Description</label>
                        <InputTextarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={4}
                            className="col-12 mb-2 md:col-10 md:mb-0"
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="attachment" className="col-12 mb-2 md:col-2 md:mb-0">Attachment</label>
                        <FileUpload
                            id="attachment"
                            onSelect={(e) => setAttachment(e.files[0])}
                            className="col-12 mb-2 md:col-10 md:mb-0"
                        />
                    </div>
                    <div className="field">
                        <Button label="Submit" onClick={handleSubmit} />
                    </div>
                </div>

                {/* <div className="card p-fluid">
                    <h5>Vertical Grid</h5>
                    <div className="formgrid grid">
                        <div className="field col">
                            <label htmlFor="name2">Name</label>
                            <InputText id="name2" type="text" />
                        </div>
                        <div className="field col">
                            <label htmlFor="email2">Email</label>
                            <InputText id="email2" type="text" />
                        </div>
                    </div>
                </div> */}
            </div>

            {/* <div className="col-12 md:col-6">
                <div className="card p-fluid">
                    <h5>Horizontal</h5>
                    <div className="field grid">
                        <label htmlFor="name3" className="col-12 mb-2 md:col-2 md:mb-0">
                            Name
                        </label>
                        <div className="col-12 md:col-10">
                            <InputText id="name3" type="text" />
                        </div>
                    </div>
                    <div className="field grid">
                        <label htmlFor="email3" className="col-12 mb-2 md:col-2 md:mb-0">
                            Email
                        </label>
                        <div className="col-12 md:col-10">
                            <InputText id="email3" type="text" />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h5>Inline</h5>
                    <div className="formgroup-inline">
                        <div className="field">
                            <label htmlFor="firstname1" className="p-sr-only">
                                Firstname
                            </label>
                            <InputText id="firstname1" type="text" placeholder="Firstname" />
                        </div>
                        <div className="field">
                            <label htmlFor="lastname1" className="p-sr-only">
                                Lastname
                            </label>
                            <InputText id="lastname1" type="text" placeholder="Lastname" />
                        </div>
                        <Button label="Submit"></Button>
                    </div>
                </div>

                <div className="card">
                    <h5>Help Text</h5>
                    <div className="field p-fluid">
                        <label htmlFor="username">Username</label>
                        <InputText id="username" type="text" />
                        <small>Enter your username to reset your password.</small>
                    </div>
                </div>
            </div>

            <div className="col-12">
                <div className="card">
                    <h5>Advanced</h5>
                    <div className="p-fluid formgrid grid">
                        <div className="field col-12 md:col-6">
                            <label htmlFor="firstname2">Firstname</label>
                            <InputText id="firstname2" type="text" />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="lastname2">Lastname</label>
                            <InputText id="lastname2" type="text" />
                        </div>
                        <div className="field col-12">
                            <label htmlFor="address">Address</label>
                            <InputTextarea id="address" rows={4} />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="city">City</label>
                            <InputText id="city" type="text" />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="state">State</label>
                            <Dropdown id="state" value={dropdownItem} onChange={(e) => setDropdownItem(e.value)} options={dropdownItems} optionLabel="name" placeholder="Select One"></Dropdown>
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="zip">Zip</label>
                            <InputText id="zip" type="text" />
                        </div>
                    </div>
                </div>
            </div> */}
        </div>
    );
};

export default FormCreateAsset;
