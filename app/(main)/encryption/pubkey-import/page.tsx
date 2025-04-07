'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import axios from 'axios';
import { PubKey } from '@/types/fabric';
interface DropdownItem {
    name: string;
    code: string;
}

const FormImportPubKey = () => {
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
    const [formData, setFormData] = useState<PubKey>({ org: '', pubkey: '' });
    const handleSubmit = async () => {
        const response = await axios.post('/api/fabric/encryption', formData);
        if (response.status !== 201) {
            throw new Error('Failed to create asset');
        }
    }

    return (
        <div className="grid">
            <div className="col-12 md:col-6">
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
                                optionLabel="name"
                            />
                        </div>
                    </div>
                    <div className="field grid">
                        <label htmlFor="name3" className="col-12 mb-2 md:col-3 md:mb-0">
                            Pubkey
                        </label>
                        <div className="col-12 md:col-9">
                            <InputText id="name3" type="text" value={formData.pubkey} onChange={(e) => setFormData(prev => ({ ...prev, pubkey: e.target.value }))} />
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

export default FormImportPubKey;
