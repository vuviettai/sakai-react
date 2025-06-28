'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import router, { useRouter } from 'next/router';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { FileUpload } from 'primereact/fileupload';
import { Asset } from '@/types/fabric';
import { decryptAsset } from '@/services/fabric/asset';
import { Toast } from 'primereact/toast';
import { getPrivKey } from '@/services/fabric/encryption';
import { useSearchParams } from 'next/navigation';

const FormViewAsset = ({ params }: { params: { id: string } }) => {
    const toast = useRef<Toast>(null);
    const searchParams = useSearchParams();
    const keyId = searchParams.get('keyId');
    const [privateKey, setPrivateKey] = useState<string>('');
    // Add form state
    const [formData, setFormData] = useState<Asset>({
        id: '',
        title: '',
        value: 0,
        destinationOrg: 'org2.example.com',
        keyId: '',
        description: '',
        attachment: '',
        status: '',
        createdAt: '',
        updatedAt: ''
    });
    useEffect(() => {
        if (keyId) {
            decryptAsset(params.id, keyId).then(asset => {
                setFormData(asset);
            });
        }
    }, [params.id, keyId]);
    useEffect(() => {
        if (keyId || formData.keyId) {
            getPrivKey(keyId || formData.keyId).then(privateKey => {
                setPrivateKey(privateKey);
            });
        }
    }, [keyId, formData.keyId]);

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12 md:col-6">
                <div className="card p-fluid">
                    <h5>Decrypt asset</h5>
                    <div className="field grid">
                        <label htmlFor="id" className="col-12 mb-2 md:col-3 md:mb-0">ID</label>
                        <div className="col-12 mb-2 md:col-9 md:mb-0">
                            <InputText
                                id="id"
                                value={formData.id}
                                disabled
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
                                disabled
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
                                disabled
                                className="mr-2"
                            />
                        </div>
                    </div>
                    <div className="field grid">
                        <label htmlFor="keyId" className="col-12 mb-2 md:col-3 md:mb-0">Key ID</label>
                        <div className="col-12 mb-2 md:col-9 md:mb-0">
                            <InputTextarea
                                id="keyId"
                                value={formData.keyId}
                                disabled
                                rows={4}
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
                                disabled
                                rows={4}
                                className="mr-2"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-12 md:col-6">
                <h5>Private key</h5>
                <InputTextarea id="privateKey" value={privateKey}
                    rows={15}
                    className="col-12 mb-2 md:col-12 md:mb-0"
                />
            </div>
        </div >
    );
};

export default FormViewAsset;
