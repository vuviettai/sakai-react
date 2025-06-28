'use client';
import { getAllAssets, paginateAssets } from '@/services/fabric/asset';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column, ColumnFilterApplyTemplateOptions, ColumnFilterClearTemplateOptions, ColumnFilterElementTemplateOptions } from 'primereact/column';
import { DataTable, DataTableExpandedRows, DataTableFilterMeta, DataTableStateEvent } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Demo } from '@/types';
import { Asset } from '@/types/fabric';
import { signAsset } from '@/services/fabric/asset';
import { Toast } from 'primereact/toast';
import { useRouter } from 'next/navigation';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { getAllPubKeys } from '@/services/fabric/encryption';
import { PubKey } from '@/types/fabric';

const ListAsset = () => {
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const [first, setFirst] = useState<number>(0)
    const [rows, setRows] = useState<number>(100)
    const [totalRecords, setTotalRecords] = useState<number>(0)
    const [bookmarks, setBookmarks] = useState<Map<number, string>>(new Map([[0, ""]]))
    const [assets, setAssets] = useState<Asset[]>([]);
    const [filters1, setFilters1] = useState<DataTableFilterMeta>({});
    const [loading1, setLoading1] = useState(true);
    const [globalFilterValue1, setGlobalFilterValue1] = useState('');
    const [showKeyDialog, setShowKeyDialog] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [publicKeys, setPublicKeys] = useState<PubKey[]>([]);
    const [selectedKey, setSelectedKey] = useState<PubKey | null>(null);

    const statuses = ['unqualified', 'qualified', 'new', 'negotiation', 'renewal', 'proposal'];

    const clearFilter1 = () => {
        initFilters1();
    };

    const onGlobalFilterChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters1 = { ...filters1 };
        (_filters1['global'] as any).value = value;

        setFilters1(_filters1);
        setGlobalFilterValue1(value);
    };

    const renderHeader1 = () => {
        return (
            <div className="flex justify-content-between">
                <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined onClick={clearFilter1} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilterValue1} onChange={onGlobalFilterChange1} placeholder="Keyword Search" />
                </span>
            </div>
        );
    };
    const setResponseData = useCallback((data: any) => {
        console.log('*** Data:', data);
        setAssets(data.Assets);
        const page = first / rows
        bookmarks.set(page + 1, data.Bookmark)
        setBookmarks(bookmarks)
        setTotalRecords(data.TotalRecords)
    }, [bookmarks, first, rows]);

    useEffect(() => {
        const page = first / rows
        const bookmark = bookmarks.get(page);
        paginateAssets(rows, bookmark).then((data) => {
            setResponseData(data)
            setLoading1(false);
        });

        initFilters1();
    }, [bookmarks, first, rows, setResponseData]);

    useEffect(() => {
        // Fetch public keys when component mounts
        getAllPubKeys().then(keys => {
            setPublicKeys(keys);
        });
    }, []);

    const onPage = async (event: DataTableStateEvent) => {
        console.log(event)
        setLoading1(true)
        setRows(event.rows)
        setFirst(event.first)

        const reqPage = event.page || 0
        console.log(reqPage)
        const bookmark = bookmarks.get(reqPage)
        const response = await paginateAssets(rows, bookmark);
        console.log("Response: ", response);
        setResponseData(response)
        setLoading1(false);
    }

    const formatDate = (value: Date) => {
        return value.toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const initFilters1 = () => {
        setFilters1({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            name: {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }]
            },
            'country.name': {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }]
            },
            representative: { value: null, matchMode: FilterMatchMode.IN },
            date: {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }]
            },
            balance: {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }]
            },
            status: {
                operator: FilterOperator.OR,
                constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }]
            },
            activity: { value: null, matchMode: FilterMatchMode.BETWEEN },
            verified: { value: null, matchMode: FilterMatchMode.EQUALS }
        });
        setGlobalFilterValue1('');
    };

    const handleDownload = async (rowData: Asset) => {

        console.log('*** Download:', rowData);
        // Convert base64 to blob
        const byteCharacters = atob(rowData.attachment);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray]);

        // Create download link and trigger download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = rowData.id || 'download.b64'; // Use asset name if available
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const handleSign = async (rowData: Asset) => {
        console.log('*** Sign:', rowData);
        try {
            const res = await signAsset(rowData.id);
            console.log('*** Res:', res);
            if (res.status === 200) {
                getAllAssets().then((data) => {
                    console.log('*** Data:', data);
                    setAssets(data);
                    setLoading1(false);
                });
                toast.current?.show({ severity: 'success', summary: 'Success', detail: `Asset signed successfully` });
            } else if (res.status === 403) {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: `Failed to sign asset` });
            }
        } catch (error) {
            console.error('*** Error:', error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: `Failed to sign asset` });
        }
    };

    const handleDecrypt = async (rowData: Asset) => {
        setSelectedAsset(rowData);
        setShowKeyDialog(true);
    };

    const handleKeySelect = () => {
        if (selectedAsset && selectedKey) {
            setShowKeyDialog(false);
            router.push(`/assets/view/${selectedAsset.id}?keyId=${selectedKey.keyId}`);
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Please select a key' });
        }
    };

    const renderKeyDialog = () => {
        return (
            <Dialog
                header="Select Decryption Key"
                visible={showKeyDialog}
                style={{ width: '50vw' }}
                onHide={() => setShowKeyDialog(false)}
                footer={
                    <div>
                        <Button label="Cancel" icon="pi pi-times" onClick={() => setShowKeyDialog(false)} className="p-button-text" />
                        <Button label="Decrypt" icon="pi pi-check" onClick={handleKeySelect} autoFocus />
                    </div>
                }
            >
                <div className="p-fluid">
                    <div className="field">
                        <label htmlFor="keySelect">Select Key</label>
                        <Dropdown
                            id="keySelect"
                            value={selectedKey}
                            onChange={(e) => setSelectedKey(e.value)}
                            options={publicKeys}
                            optionLabel="keyId"
                            placeholder="Select a key"
                            className="w-full"
                        />
                    </div>
                </div>
            </Dialog>
        );
    };

    const actionBodyTemplate = (rowData: Asset) => {
        return (
            <div>
                {/* <Button icon="pi pi-download" onClick={() => { handleDownload(rowData) }} className="mr-1" /> */}
                <Button label="Sign" icon="pi pi-pencil" onClick={() => { handleSign(rowData) }} className="mr-1" />
                <Button icon="pi pi-eye" onClick={() => { handleDecrypt(rowData) }} />
            </div>
        );
    };

    const header1 = renderHeader1();

    return (
        <div className="grid">
            <Toast ref={toast} />
            {renderKeyDialog()}
            <div className="col-12">
                <div className="card">
                    <h5>Filter Menu</h5>
                    <DataTable
                        value={assets}
                        className="p-datatable-gridlines"
                        showGridlines
                        rows={rows}
                        first={first}
                        dataKey="id"
                        filters={filters1}
                        filterDisplay="menu"
                        loading={loading1}
                        lazy
                        paginator
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        rowsPerPageOptions={[25, 50, 100]}
                        onPage={onPage}
                        totalRecords={totalRecords}
                        responsiveLayout="scroll"
                        emptyMessage="No assets found."
                        header={header1}
                    >
                        <Column header="Actions" style={{ minWidth: '12rem' }} body={actionBodyTemplate} />
                        <Column field="id" header="ID" filter filterPlaceholder="Search by id" style={{ minWidth: '10rem' }} />
                        <Column field="title" header="Title" filter filterPlaceholder="Search by title" style={{ minWidth: '10rem' }} />
                        <Column field="value" header="Value" filter filterPlaceholder="Search by value" style={{ minWidth: '3rem' }} />
                        <Column field="status" header="Status" filter filterPlaceholder="Search by status" style={{ minWidth: '8rem' }} />
                        <Column field="description" header="Description" filter filterPlaceholder="Search by description" style={{ width: '30rem' }} />
                        {/* 
                        <Column header="Country" filterField="country.name" style={{ minWidth: '12rem' }} body={countryBodyTemplate} filter filterPlaceholder="Search by country" filterClear={filterClearTemplate} filterApply={filterApplyTemplate} />
                        <Column
                            header="Agent"
                            filterField="representative"
                            showFilterMatchModes={false}
                            filterMenuStyle={{ width: '14rem' }}
                            style={{ minWidth: '14rem' }}
                            body={representativeBodyTemplate}
                            filter
                            filterElement={representativeFilterTemplate}
                        />
                        <Column header="Date" filterField="date" dataType="date" style={{ minWidth: '10rem' }} body={dateBodyTemplate} filter filterElement={dateFilterTemplate} />
                        <Column header="Balance" filterField="balance" dataType="numeric" style={{ minWidth: '10rem' }} body={balanceBodyTemplate} filter filterElement={balanceFilterTemplate} />
                        <Column field="status" header="Status" filterMenuStyle={{ width: '14rem' }} style={{ minWidth: '12rem' }} body={statusBodyTemplate} filter filterElement={statusFilterTemplate} />
                        <Column field="activity" header="Activity" showFilterMatchModes={false} style={{ minWidth: '12rem' }} body={activityBodyTemplate} filter filterElement={activityFilterTemplate} />
                        <Column field="verified" header="Verified" dataType="boolean" bodyClassName="text-center" style={{ minWidth: '8rem' }} body={verifiedBodyTemplate} filter filterElement={verifiedFilterTemplate} />
                        */}
                    </DataTable>
                </div>
            </div>
        </div >
    );
};

export default ListAsset;
