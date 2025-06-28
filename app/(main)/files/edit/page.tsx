'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from 'primereact/card';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { env } from '@/services/fabric/common';

const fileUrl = `${env.API_URL}/api/files/demo`;

export default function FileEditPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const toast = useRef<Toast>(null);
    const filePath = searchParams.get('path');

    const fetchFileContent = async () => {
        try {
            const response = await fetch(`${fileUrl}/content?filePath=${encodeURIComponent(filePath || '')}`);
            if (!response.ok) {
                throw new Error('Failed to fetch file content');
            }
            const text = await response.text();
            setContent(text);
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to load file content',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (filePath) {
            fetchFileContent();
        }
    }, [filePath]);

    const handleSave = async () => {
        try {
            setSaving(true);
            const response = await fetch(`${fileUrl}/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    filePath,
                    content
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save file');
            }

            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'File saved successfully',
                life: 3000
            });

            // Navigate back to file list after successful save
            router.push('/files/list');
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to save file',
                life: 3000
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        router.push('/files/list');
    };

    return (
        <div className="grid">
            <div className="col-12">
                <Card title={`Edit File: ${filePath}`}>
                    <Toast ref={toast} />
                    <div className="flex flex-column gap-4">
                        <InputTextarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={10}
                            className="w-full"
                            autoResize
                            disabled={loading}
                        />
                        <div className="flex justify-content-end gap-2">
                            <Button
                                label="Cancel"
                                icon="pi pi-times"
                                className="p-button-text"
                                onClick={handleCancel}
                                disabled={loading || saving}
                            />
                            <Button
                                label="Save"
                                icon="pi pi-save"
                                onClick={handleSave}
                                loading={saving}
                                disabled={loading}
                            />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
} 