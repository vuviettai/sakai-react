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
interface DropdownItem {
    name: string;
    code: string;
}

const FormImportPubKey = () => {
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
    // Add form state
    const [formData, setFormData] = useState<PubKey>({ org: 'org2.example.com', pubkey: '' });
    const setPubkey = async (file: File) => {
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        setFormData(prev => ({ ...prev, pubkey: base64 }));
    }
    const handleSubmit = async () => {
        try {
            const response = await importPubKey(formData);
            if (response.status !== 201) {
                throw new Error('Failed to create asset');
            }
            toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Pubkey imported successfully' });
            setFormData({ org: 'org2.example.com', pubkey: '' });
            router.push('/encryption/pubkey/list');

        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="grid">
            <Toast ref={toast} />            <div className="col-12 md:col-6">
                <div className="card p-fluid">
                    <h5>Import pubkey</h5>
                    <div className="field grid">
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
                    </div>
                    <div className="field grid">
                        <label htmlFor="name3" className="col-12 mb-2 md:col-3 md:mb-0">
                            Pubkey
                        </label>
                        <div className="col-12 mb-2 md:col-9 md:mb-0">
                            <FileUpload
                                id="pubkey"
                                onSelect={(e) => setPubkey(e.files[0])}
                                className="mr-2"
                            />
                        </div>
                    </div>
                    <div className="field grid">
                        <label htmlFor="submit" className="col-12 mb-2 md:col-3 md:mb-0"></label>
                        <div className="col-12 md:col-9">
                            <Button label="Submit" onClick={handleSubmit} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormImportPubKey;
