'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation'
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { PrivKey } from '@/types/fabric';
import { importPrivKey } from '@/services/fabric/encryption';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { env } from '@/services/fabric/common';
interface DropdownItem {
    name: string;
    code: string;
}
const uploadUrl = `${env.API_URL}/api/encryption/privkey/upload`;
const FormImportPubKey = () => {
    const router = useRouter()
    const toast = useRef<Toast>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Add form state
    const [formData, setFormData] = useState<PrivKey>({ keyId: '', privkey: '' });
    const setPrivKey = async (file: File) => {
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        setFormData(prev => ({ ...prev, privkey: base64 }));
    }
    const uploadKey = async (file: File) => {
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        setFormData(prev => ({ ...prev, privkey: base64 }));
        if (isSubmitting) return; // Prevent double submit

        setIsSubmitting(true);
        try {
            const response = await importPrivKey(formData);
            if (response.status !== 200) {
                throw new Error('Failed to import privkey');
            }
            toast.current?.show({ severity: 'success', summary: 'Success', detail: `Privkey imported successfully in transaction ${response.data}` });
            setFormData({ keyId: '', privkey: '' });
            router.push('/encryption/pubkey/list');

        } catch (error) {
            console.error(error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: `Failed to import private key` });
        } finally {
            setIsSubmitting(false);
        }
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
    const onUpload = () => {
        setUploading(true);
    }
    const onError = () => {
        setUploading(false);
    }

    return (
        <div className="grid">
            <Toast ref={toast} />            <div className="col-12 md:col-6">
                <div className="card p-fluid">
                    <h5>Import private key</h5>
                    <p className="m-0">
                        Public key được tạo ra từ Private key và lưu trong vùng dữ liệu chia sẻ được của channel.
                        Khi tổ chức 1 gửi dữ liệu cần mã hoá cho tổ chức 2 thì tổ chức 1 sử dụng Public key của tổ chức 2
                        Private key được lưu trong vùng dữ liệu riêng của tổ chức, và được sử dụng khi muốn giải mã dữ liệu do tổ chức khác gửi tới.
                    </p>
                    <div className="field grid">
                        <label htmlFor="org" className="col-12 mb-2 md:col-3 md:mb-0">Key ID</label>
                        <div className="col-12 md:col-9">
                            <InputText
                                id="privkey"
                                value={formData.keyId}
                                onChange={(e) => setFormData(prev => ({ ...prev, keyId: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="field grid">
                        <label htmlFor="name3" className="col-12 mb-2 md:col-3 md:mb-0">
                            Privkey
                        </label>
                        <div className="col-12 mb-2 md:col-9 md:mb-0">
                            <FileUpload
                                id="privkey"
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
                                onSelect={(e) => setPrivKey(e.files[0])}
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
