'use client';

import { DataTable, DataTableFilterMeta, DataTableStateEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { useCallback, useEffect, useState } from 'react';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { env } from '@/services/fabric/common';
import { useRouter } from 'next/navigation';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';

interface FileInfo {
    filePath: string;
    contentType: string;
    size: number;
    uploadDate: string;
}

interface FileCheckInfo {
    status: number;
    message: string;
    lastAccessed?: string;
    accessCount?: number;
    contentSource?: string;
    currentHash?: string;
    originHash?: string;
    contentType?: string;
}

const listUrl = `${env.API_URL}/api/files/paginate`;
const downloadUrl = `${env.API_URL}/fileserver/files/demo/download`;
const checkUrl = `${env.API_URL}/fileserver/files/demo/check`;

export default function FileListPage() {
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const [first, setFirst] = useState<number>(0)
    const [rows, setRows] = useState<number>(100)
    const [totalRecords, setTotalRecords] = useState<number>(0)
    const [bookmarks, setBookmarks] = useState<Map<number, string>>(new Map([[0, ""]]))
    const [files, setFiles] = useState<FileInfo[]>([]);
    const [filters1, setFilters1] = useState<DataTableFilterMeta>({});
    const [loading1, setLoading1] = useState(true);
    const [globalFilterValue1, setGlobalFilterValue1] = useState('');
    const [loading, setLoading] = useState(true);
    const [showViewDialog, setShowViewDialog] = useState(false);
    const [fileCheckInfo, setFileCheckInfo] = useState<FileCheckInfo | null>(null);
    const [selectedFile, setSelectedFile] = useState<{ path: string; type: string } | null>(null);

    const fetchFiles = useCallback(async (page: number) => {
        const bookmark = bookmarks.get(page);
        try {
            const response = await fetch(`${listUrl}?pageSize=${rows}&bookmark=${bookmark}`);
            const data = await response.json();
            if (data.Files) {
                setFiles(data.Files);
                const page = first / rows
                bookmarks.set(page + 1, data.Bookmark)
                setBookmarks(bookmarks)
            }
            setTotalRecords(data.TotalRecords)
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch files' });
        } finally {
            setLoading(false);
        }
    }, [bookmarks, first, rows]);

    useEffect(() => {
        fetchFiles(0);
    }, [fetchFiles]);

    const onPage = async (event: DataTableStateEvent) => {
        console.log(event)
        setLoading1(true)
        setRows(event.rows)
        setFirst(event.first)

        const reqPage = event.page || 0
        console.log(reqPage)
        await fetchFiles(reqPage);
        setLoading1(false);
    }

    const downloadFile = async (filePath: string, contentType: string) => {
        window.location.href = `${downloadUrl}?filePath=${encodeURIComponent(filePath)}&contentType=${encodeURIComponent(contentType)}&download=true`;
    }

    const downloadFile2 = async (filePath: string, contentType: string) => {
        try {
            const response = await fetch(`${downloadUrl}?filePath=${encodeURIComponent(filePath)}&contentType=${encodeURIComponent(contentType)}&download=true`);
            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Extract filename from filePath
            const filename = filePath.split('/').pop() || 'download';
            link.setAttribute('download', filename);

            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to download file' });
        }
    };

    const viewFile2 = async (filePath: string, contentType: string) => {
        window.open(`${downloadUrl}?filePath=${encodeURIComponent(filePath)}&contentType=${encodeURIComponent(contentType)}&decrypt=true`, '_blank');
    }

    const viewFile = async (filePath: string, contentType: string) => {
        try {
            // Show loading state
            setLoading(true);

            // Fetch file check information
            const response = await fetch(`${downloadUrl}?filePath=${encodeURIComponent(filePath)}&contentType=${encodeURIComponent(contentType)}&decrypt=true`);
            if (!response.ok) throw new Error('Failed to check file');

            // Get all available headers
            const checkInfo: FileCheckInfo = {
                status: response.status,
                message: "",
                contentType: response.headers.get('Content-Type') || undefined,
                contentSource: response.headers.get('Content-Source') || undefined,
                currentHash: response.headers.get('Current-Hash') || undefined,
                originHash: response.headers.get('Origin-Hash') || undefined
            };
            if (checkInfo.currentHash != checkInfo.originHash) {
                checkInfo.message = "File has been modified";
            } else {
                checkInfo.message = "File is unchanged";
            }
            setFileCheckInfo(checkInfo);
            setSelectedFile({ path: filePath, type: contentType });
            setShowViewDialog(true);
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to check file status' });
        } finally {
            setLoading(false);
        }
    };

    const handleViewConfirm = () => {
        if (selectedFile) {
            window.open(
                `${downloadUrl}?filePath=${encodeURIComponent(selectedFile.path)}&contentType=${encodeURIComponent(selectedFile.type)}&decrypt=true`,
                '_blank'
            );
        }
        setShowViewDialog(false);
    };

    const actionTemplate = (rowData: FileInfo) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-eye"
                    className="p-button-rounded p-button-info"
                    onClick={() => viewFile(rowData.filePath, rowData.contentType)}
                />
                <Button
                    icon="pi pi-download"
                    className="p-button-rounded p-button-success"
                    onClick={() => downloadFile(rowData.filePath, rowData.contentType)}
                />
                {rowData.contentType === 'text/plain' && (
                    <Button
                        icon="pi pi-pencil"
                        className="p-button-rounded p-button-info"
                        onClick={() => router.push(`/files/edit?path=${encodeURIComponent(rowData.filePath)}`)}
                    />
                )}
            </div>
        );
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (value: Date) => {
        return value ? new Date(value).toLocaleString() : '';
    };

    const renderViewDialogFooter = () => {
        return (
            <div>
                <Button label="Cancel" icon="pi pi-times" onClick={() => setShowViewDialog(false)} className="p-button-text" />
                <Button label="View File" icon="pi pi-check" onClick={handleViewConfirm} autoFocus />
            </div>
        );
    };

    return (
        <div className="grid">
            <div className="col-12">
                <Card title="Uploaded Files">
                    <Toast ref={toast} />
                    <DataTable
                        size="small"
                        value={files}
                        className="p-datatable-gridlines"
                        showGridlines
                        loading={loading}
                        paginator
                        rows={rows}
                        first={first}
                        dataKey="filePath"
                        filters={filters1}
                        filterDisplay="menu"
                        lazy
                        rowsPerPageOptions={[25, 50, 100]}
                        onPage={onPage}
                        totalRecords={totalRecords}
                        responsiveLayout="scroll"
                        emptyMessage="No files found."
                    >
                        <Column body={actionTemplate} style={{ minWidth: '7rem' }}></Column>
                        <Column field="filePath" header="File Path" sortable></Column>
                        <Column field="size" header="Size" sortable body={(rowData) => formatFileSize(rowData.size)}></Column>
                        <Column field="contentType" header="Type" sortable></Column>
                        <Column field="uploadDate" header="Upload Date" sortable body={(rowData) => formatDate(rowData.uploadDate)}></Column>
                    </DataTable>

                    <Dialog
                        visible={showViewDialog}
                        style={{ width: '600px' }}
                        header="File Information"
                        modal
                        footer={renderViewDialogFooter()}
                        onHide={() => setShowViewDialog(false)}
                    >
                        {fileCheckInfo && (
                            <div className="flex flex-column gap-3">
                                <div className="flex align-items-center gap-2">
                                    <i className="pi pi-info-circle text-primary" style={{ fontSize: '1.5rem' }}></i>
                                    <span className="font-bold">Status: {fileCheckInfo.message}</span>
                                </div>
                                {fileCheckInfo.contentType && (
                                    <div className="flex align-items-center gap-2">
                                        <i className="pi pi-file"></i>
                                        <span>Type: {fileCheckInfo.contentType}</span>
                                    </div>
                                )}
                                {fileCheckInfo.contentSource && (
                                    <div className="flex align-items-center gap-2">
                                        <i className="pi pi-globe"></i>
                                        <span>Source: {fileCheckInfo.contentSource}</span>
                                    </div>
                                )}
                                {fileCheckInfo.currentHash && (
                                    <div className="flex align-items-center gap-2">
                                        <i className="pi pi-lock"></i>
                                        <span>Current Hash: {fileCheckInfo.currentHash}</span>
                                    </div>
                                )}
                                {fileCheckInfo.originHash && (
                                    <div className="flex align-items-center gap-2">
                                        <i className="pi pi-lock"></i>
                                        <span>Origin Hash: {fileCheckInfo.originHash}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </Dialog>
                </Card>
            </div>
        </div>
    );
} 