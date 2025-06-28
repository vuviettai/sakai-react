'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation'
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import axios from 'axios';
import { PubKey } from '@/types/fabric';
import { importPubKey } from '@/services/fabric/encryption';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { env } from '@/services/fabric/common';
interface DropdownItem {
    name: string;
    code: string;
}
const uploadUrl = `${env.API_URL}/api/encryption/pubkey/upload`;
const FormImportPubKey = () => {
    const router = useRouter()
    const toast = useRef<Toast>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
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
    const [formData, setFormData] = useState<PubKey>({ organization: 'org2.example.com', keyId: 'pubkey', publicKey: '' });
    const setPubkey = async (file: File) => {
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        setFormData(prev => ({ ...prev, publicKey: base64 }));
    }

    const uploadKey = async (file: File) => {
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        setFormData(prev => ({ ...prev, publicKey: base64 }));
        if (isSubmitting) return; // Prevent double submit

        setIsSubmitting(true);
        try {
            const response = await importPubKey(formData);
            if (response.status !== 200) {
                throw new Error('Failed to import pubkey');
            }
            toast.current?.show({ severity: 'success', summary: 'Success', detail: `Pubkey imported successfully in transaction ${response.data}` });
            setFormData({ organization: 'org2.example.com', keyId: 'pubkey', publicKey: '' });
            router.push('/encryption/pubkey/list');

        } catch (error) {
            console.error(error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: `Failed to import pubkey` });
        } finally {
            setIsSubmitting(false);
        }
    }
    const onUpload = () => {
        setUploading(true);
    }
    const onError = () => {
        setUploading(false);
    }
    const customUpload = async (event: any) => {
        const files = event.files;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const response = await uploadKey(file);
                console.log('Upload successful:', response);
            } catch (error) {
                console.error('Upload failed:', error);
            }
        }
    }

    return (
        <div className="grid">
            <Toast ref={toast} />            <div className="col-12 md:col-6">
                <div className="card p-fluid">
                    <h5>Import pubkey</h5>
                    {/* <div className="field grid">
                        <label htmlFor="org" className="col-12 mb-2 md:col-3 md:mb-0">Organization</label>
                        <div className="col-12 md:col-9">
                            <Dropdown
                                id="org"
                                value={formData.org}
                                onChange={(e) => setFormData(prev => ({ ...prev, org: e.target.value }))}
                                options={dropdownItems}
                                optionValue="code"
                                optionLabel="name"
                            />
                        </div>
                    </div> */}
                    <div className="field grid">
                        <label htmlFor="name3" className="col-12 mb-2 md:col-3 md:mb-0">
                            Pubkey
                        </label>
                        <div className="col-12 mb-2 md:col-9 md:mb-0">
                            <FileUpload
                                id="pubkey"
                                name="file"
                                url={uploadUrl}
                                accept="*/*"
                                maxFileSize={1024 * 1024}
                                onUpload={onUpload}
                                onError={onError}
                                emptyTemplate={<p className="m-0">Drag and drop files to here to upload.</p>}
                                customUpload
                                uploadHandler={customUpload}
                                disabled={uploading}
                                onSelect={(e) => {
                                    setPubkey(e.files[0]);
                                    if (e.files.length === 1) {
                                        setPubkey(e.files[0]);
                                    } else if (e.files.length === 2) {
                                        // Combine content of both files
                                        // Promise.all(e.files.map(file => file.arrayBuffer()))
                                        //     .then(buffers => {
                                        //         const combinedBuffer = new Uint8Array([...new Uint8Array(buffers[0]), ...new Uint8Array(buffers[1])]);
                                        //         const base64 = Buffer.from(combinedBuffer).toString('base64');
                                        //         setFormData(prev => ({ ...prev, pubkey: base64 }));
                                        //     });
                                    }
                                }}
                                className="mr-2"
                            />
                        </div>
                    </div>
                    {/* <div className="field grid">
                        <label htmlFor="submit" className="col-12 mb-2 md:col-3 md:mb-0"></label>
                        <div className="col-12 md:col-9">
                            <Button label="Submit" onClick={handleSubmit} />
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default FormImportPubKey;
