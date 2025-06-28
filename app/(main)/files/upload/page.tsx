'use client';

import { FileUpload } from 'primereact/fileupload';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { useRef, useState } from 'react';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { env } from '@/services/fabric/common';
import axios from 'axios';
import { ProgressBar } from 'primereact/progressbar';
import { InputText } from 'primereact/inputtext';

const CHUNK_SIZE = 8 * 1024 * 1024; // 8MB per chunk
const uploadUrl = `${env.API_URL}/fileserver/files/demo/upload`;

function getFileIdentifier(file: File) {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    return `${file.name}-${timestamp}-${randomStr}`;
}

export default function FileUploadPage() {
    const toast = useRef<Toast>(null);
    const [batchCount, setBatchCount] = useState<number>(1);
    const fileUploadRef = useRef<FileUpload>(null);
    const [progress, setProgress] = useState(0);
    const [uploadTime, setUploadTime] = useState(0);
    const [uploading, setUploading] = useState(false);

    const onUpload = () => {
        toast.current?.show({ severity: 'info', summary: 'Success', detail: 'File uploaded successfully' });
        setProgress(0);
        setUploading(false);
    };

    const onError = () => {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'File upload failed' });
        setProgress(0);
        setUploading(false);
    };

    const uploadFile = async (file: File, counter: number) => {
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        const identifier = getFileIdentifier(file);
        setUploading(true);
        let uploadedSize = 0;
        const start = Date.now();
        for (let chunkNumber = 0; chunkNumber < totalChunks; chunkNumber++) {
            const start = chunkNumber * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, file.size);
            const chunk = file.slice(start, end);

            const formData = new FormData();
            formData.append('file', chunk);
            formData.append('counter', String(counter));
            formData.append('resumableFilename', file.name);
            formData.append('resumableType', file.type);
            formData.append('resumableRelativePath', "/demo/");
            formData.append('resumableIdentifier', identifier);
            formData.append('resumableChunkNumber', String(chunkNumber + 1));
            formData.append('resumableTotalChunks', String(totalChunks));
            formData.append('resumableChunkSize', String(CHUNK_SIZE));
            formData.append('resumableTotalSize', String(file.size));
            formData.append('resumableCurrentChunkSize', String(chunk.size));
            formData.append('parent_dir', "/demo/");
            uploadedSize += chunk.size;
            try {
                await axios.post(uploadUrl, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                setProgress(Math.round((uploadedSize / file.size) * 100));
            } catch (error) {
                console.error(`Chunk ${chunkNumber + 1} failed`, error);
                // Optional: retry logic
                return;
            }
        }
        const elapsed = Date.now() - start;
        setUploadTime(elapsed);
        console.log(`Upload complete in ${elapsed}ms`);
    };

    const customUpload = async (event: any) => {
        const files = event.files;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const response = await uploadFile(file, batchCount);
                console.log('Upload successful:', response);
                onUpload();
            } catch (error) {
                console.error('Upload failed:', error);
                onError();
            }
        }
    };

    return (
        <div className="grid">
            <div className="col-6">
                <Card title="Upload File">
                    <Toast ref={toast} />
                    <div className="field grid">
                        <label htmlFor="batchCount" className="col-3 mb-2">Batch Upload Count</label>
                        <div className="col-9">
                            <InputNumber
                                id="batchCount"
                                value={batchCount}
                                onValueChange={(e) => setBatchCount(e.value || 1)}
                                min={1}
                                max={100}
                                showButtons
                                buttonLayout="horizontal"
                                decrementButtonClassName="p-button-secondary"
                                incrementButtonClassName="p-button-secondary"
                                incrementButtonIcon="pi pi-plus"
                                decrementButtonIcon="pi pi-minus"
                                defaultValue={1}
                                className="w-full"
                            />
                        </div>
                    </div>
                    <div className="field grid">
                        <label htmlFor="uploadTime" className="col-3 mb-2">Upload Time(ms)</label>
                        <div className="col-9">
                            <InputText id="uploadTime" value={uploadTime.toString()} disabled className="w-full" />
                        </div>
                    </div>
                    <div className="flex flex-column gap-3">
                        <FileUpload
                            ref={fileUploadRef}
                            name="file"
                            url={uploadUrl}
                            accept="*/*"
                            maxFileSize={128 * 1024 * 1024}
                            onUpload={onUpload}
                            onError={onError}
                            emptyTemplate={<p className="m-0">Drag and drop files to here to upload.</p>}
                            customUpload
                            uploadHandler={customUpload}
                            disabled={uploading}
                        />
                        {uploading && (
                            <div className="field">
                                <label className="block mb-2">Upload Progress</label>
                                <ProgressBar value={progress} showValue />
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
} 