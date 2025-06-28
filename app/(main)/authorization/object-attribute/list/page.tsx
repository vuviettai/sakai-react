'use client';
import { getAllObjectAttributes } from '@/services/fabric/authorization';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable, DataTableExpandedRows, DataTableFilterMeta } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import React, { useEffect, useState } from 'react';
import type { Demo } from '@/types';
import { ObjectAttribute } from '@/types/fabric';

const ListObjectAttributes = () => {
    const [items, setItems] = useState<ObjectAttribute[]>([]);
    const [filters1, setFilters1] = useState<DataTableFilterMeta>({});
    const [loading1, setLoading1] = useState(true);
    const [globalFilterValue1, setGlobalFilterValue1] = useState('');
    const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows>({});

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

    useEffect(() => {
        getAllObjectAttributes().then((data) => {
            console.log('*** Data:', data);
            data.forEach((item: ObjectAttribute) => {
                item.key = `${item.namespace}-${item.objectName}-${item.action}`;
            });
            setItems(data);
            setLoading1(false);
        });

        initFilters1();
    }, []);

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

    const rowExpansionTemplate = (data: ObjectAttribute) => {
        return (
            <div className="p-3">
                <h5>Attributes</h5>
                <DataTable value={data.attributes} responsiveLayout="scroll">
                    <Column field="key" header="Key" sortable></Column>
                    <Column field="value" header="Value" sortable></Column>
                </DataTable>
            </div>
        );
    };

    const header1 = renderHeader1();

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <h5>Identity Attributes</h5>
                    <DataTable
                        value={items}
                        paginator
                        className="p-datatable-gridlines"
                        showGridlines
                        rows={10}
                        dataKey="key"
                        filters={filters1}
                        filterDisplay="menu"
                        loading={loading1}
                        responsiveLayout="scroll"
                        emptyMessage="No object attributes found."
                        header={header1}
                        expandedRows={expandedRows}
                        onRowToggle={(e) => {
                            if (Array.isArray(e.data)) {
                                setExpandedRows({});
                            } else {
                                setExpandedRows(e.data);
                            }
                        }}
                        rowExpansionTemplate={rowExpansionTemplate}
                    >
                        <Column expander style={{ width: '3rem' }} />
                        <Column field="namespace" header="Namespace" filter filterPlaceholder="Search by namespace" style={{ minWidth: '12rem' }} />
                        <Column field="objectName" header="Object Name" filter filterPlaceholder="Search by object name" style={{ minWidth: '12rem' }} />
                        <Column field="action" header="Action" filter filterPlaceholder="Search by action" style={{ minWidth: '12rem' }} />
                    </DataTable>
                </div>
            </div>
        </div>
    );
};

export default ListObjectAttributes;
