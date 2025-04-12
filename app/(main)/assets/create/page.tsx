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
import { createAsset } from '@/services/fabric/asset';

interface DropdownItem {
    name: string;
    code: string;
}

const FormCreateAsset = () => {
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

    // Add form state
    const [formData, setFormData] = useState<Asset>({
        id: '',
        title: '',
        name: '',
        size: 0,
        value: 0,
        destinationOrg: 'org2.example.com',
        description: '',
        attachment: '',
        status: '',
        createdAt: '',
        updatedAt: ''
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

            const response = await createAsset(formData);
            // Reset form after successful submission
            setFormData({
                id: '',
                title: '',
                name: '',
                size: 0,
                value: 0,
                destinationOrg: '',
                description: '',
                attachment: '',
                status: '',
                createdAt: '',
                updatedAt: ''
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
                    <div className="field grid">
                        <label htmlFor="destinationOrg" className="col-12 mb-2 md:col-3 md:mb-0">Destination Org</label>
                        <div className="col-12 mb-2 md:col-9 md:mb-0">
                            <Dropdown
                                id="destinationOrg"
                                value={formData.destinationOrg}
                                onChange={(e) => setFormData(prev => ({ ...prev, destinationOrg: e.target.value }))}
                                options={dropdownItems}
                                optionLabel="name"
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
                        <label htmlFor="name" className="col-12 mb-2 md:col-3 md:mb-0">Name</label>
                        <div className="col-12 mb-2 md:col-9 md:mb-0">
                            <InputText
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="mr-2"
                            />
                        </div>
                    </div>
                    <div className="field grid">
                        <label htmlFor="size" className="col-12 mb-2 md:col-3 md:mb-0">Size</label>
                        <div className="col-12 mb-2 md:col-9 md:mb-0">
                            <InputNumber
                                id="size"
                                value={formData.size}
                                onValueChange={(e) => setFormData(prev => ({ ...prev, size: e.value as number }))}
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
                    <div className="field grid">
                        <label htmlFor="attachment" className="col-12 mb-2 md:col-3 md:mb-0">Attachment</label>
                        <div className="col-12 mb-2 md:col-9 md:mb-0">
                            <FileUpload
                                id="attachment"
                                onSelect={(e) => setAttachment(e.files[0])}
                                className="mr-2"
                            />
                        </div>
                    </div>
                    <div className="field">
                        <Button label="Submit" onClick={handleSubmit} />
                    </div>
                </div>
            </div>
        </div >
    );
};

export default FormCreateAsset;
