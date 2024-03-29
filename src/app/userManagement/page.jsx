'use client';
import React, { useState, useEffect, useRef } from 'react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import {
  updateUser,
  getUsers,
  deleteUser,
  getUserByUserId,
} from '../api/auth/user/route';
import { assignJobListing, viewOneJobListing } from '../api/jobListings/route';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import HumanIcon from '../../../public/icon.png';
import styles from './page.module.css';
import Enums from '@/common/enums/enums';

export default function AccountManagement() {
  const session = useSession();

  const router = useRouter();

  const params = useSearchParams();
  const id = params.get('jobListingId');

  const userIdRef =
    session.status === 'authenticated' &&
    session.data &&
    session.data.user.userId;

  const accessToken =
    session.status === 'authenticated' &&
    session.data &&
    session.data.user.accessToken;

  const currentUserRole =
    session.status === 'authenticated' &&
    session.data &&
    session.data.user.role;

  if (session.status === 'unauthenticated') {
    router?.push('/login');
  }

  const [refreshData, setRefreshData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userDialog, setUserDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [viewUserDialog, setViewUserDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [jobListing, setJobListing] = useState({});
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    role: {
      operator: FilterOperator.OR,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
    },
    status: {
      operator: FilterOperator.OR,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
    },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [statuses] = useState([Enums.ACTIVE, Enums.INACTIVE]);
  const dt = useRef(null);

  const getStatus = (status) => {
    switch (status) {
      case Enums.ACTIVE:
        return 'success';
      case Enums.INACTIVE:
        return 'danger';
    }
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };

    _filters['global'].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const showUserDialog = (rowData) => {
    setUserDialog(true);
  };

  const showDeleteDialog = (rowData) => {
    setDeleteDialog(true);
  };

  const showViewUserDialog = (rowData) => {
    setViewUserDialog(true);
  };

  const statusBodyTemplate = (rowData) => {
    return <Tag value={rowData.status} severity={getStatus(rowData.status)} />;
  };

  const statusFilterTemplate = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={statuses}
        onChange={(e) => options.filterCallback(e.value, options.index)}
        itemTemplate={statusItemTemplate}
        placeholder="Select One"
        className="p-column-filter"
        showClear
      />
    );
  };

  const statusItemTemplate = (option) => {
    return <Tag value={option} severity={getStatus(option)} />;
  };

  const actionAdminBodyTemplate = (rowData) => {
    // If session.status.user.userId matches rowData.userId, return null or an empty fragment.
    if (userIdRef === rowData.userId) {
      return (
        <React.Fragment>
          <Button
            icon="pi pi-search"
            rounded
            outlined
            className={styles.buttonIcon}
            onClick={() => {
              setSelectedRowData(rowData);
              // showViewUserDialog(rowData);
            }}
          />
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <Button
            icon="pi pi-pencil"
            rounded
            outlined
            className={styles.buttonIcon}
            onClick={() => {
              setSelectedRowData(rowData);
              showUserDialog(rowData);
            }}
          />
          {/* <Button
            icon="pi pi-trash"
            rounded
            outlined
            className="mr-2"
            onClick={() => {
              setSelectedRowData(rowData);
              showDeleteDialog(rowData);
            }}
          /> */}
          <Button
            icon="pi pi-search"
            rounded
            outlined
            className={styles.buttonIcon}
            onClick={() => {
              setSelectedRowData(rowData);
              setViewUserDialog(rowData);
            }}
          />
        </React.Fragment>
      );
    }
  };

  const hideDialog = () => {
    setUserDialog(false);
  };

  const hideDeleteDialog = () => {
    setDeleteDialog(false);
  };

  const hideViewDialog = () => {
    setViewUserDialog(false);
  };

  const statusRoleTemplate = (rowData) => {
    return <Tag value={rowData?.role?.replaceAll('_', ' ')} />;
  };

  const saveStatusChange = async () => {
    try {
      const toggledStatus =
        selectedRowData.status === Enums.ACTIVE ? Enums.INACTIVE : Enums.ACTIVE;
      const request = {
        role: selectedRowData.role,
        status: toggledStatus,
      };
      const response = await updateUser(
        request,
        selectedRowData.userId,
        accessToken
      );
      console.log('Status changed successfully:', response);
      setRefreshData((prev) => !prev);
    } catch (error) {
      console.error('Error changing status:', error);
    }
    setSelectedRowData();
    setUserDialog(false);
  };

  const deleteUserFromRow = async () => {
    try {
      const request = {
        role: selectedRowData.role,
      };
      const response = await deleteUser(
        selectedRowData.role,
        selectedRowData.userId,
        accessToken
      );
      console.log('User is deleted', response);
      setRefreshData((prev) => !prev);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
    setSelectedRowData();
    setDeleteDialog(false);
  };

  const userDialogFooter = (
    <React.Fragment>
      <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
      <Button label="Yes" icon="pi pi-check" onClick={saveStatusChange} />
    </React.Fragment>
  );

  const deleteUserDialogFooter = (
    <React.Fragment>
      <Button
        label="Cancel"
        icon="pi pi-times"
        outlined
        onClick={hideDeleteDialog}
      />
      <Button label="Yes" icon="pi pi-check" onClick={deleteUserFromRow} />
    </React.Fragment>
  );

  const exportCSV = () => {
    dt.current.exportCSV();
  };

  const usernameBodyTemplate = (rowData) => {
    const userName = rowData.userName;
    const avatar = rowData.profilePictureUrl;

    return (
      <div className={styles.imageContainer}>
        {avatar !== '' ? (
          <img
            alt={avatar}
            src={avatar}
            className={styles.avatarImageContainer}
          />
        ) : (
          <Image
            src={HumanIcon}
            alt="Icon"
            className={styles.avatarImageContainer}
          />
        )}
        <span>{userName}</span>
      </div>
    );
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderAdminHeader = () => {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 className="m-0">Users</h2>
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Keyword Search"
          />
        </span>
        <Button
          label="Export CSV"
          icon="pi pi-upload"
          className="p-button-help"
          onClick={exportCSV}
        />
      </div>
    );
  };

  useEffect(() => {
    if (accessToken) {
      viewOneJobListing(id, accessToken)
        .then((data) => {
          setJobListing(data);
        })
        .catch((error) => {
          console.error('Error fetching job listings:', error);
        });
    }
  }, [accessToken, id]);

  useEffect(() => {
    getUsers(accessToken)
      .then((user) => {
        setUser(user.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching user:', error);
        setIsLoading(false);
      });
  }, [refreshData, accessToken, jobListing]);

  const header = () => {
    return renderAdminHeader();
  };

  if (
    session.status === 'authenticated' &&
    session.data.user.role !== Enums.ADMIN
  ) {
    router?.push('/dashboard');
  }

  if (
    session.status === 'authenticated' &&
    session.data.user.role === Enums.ADMIN
  ) {
    return (
      <>
        {isLoading ? (
          <ProgressSpinner
            style={{
              display: 'flex',
              height: '100vh',
              'justify-content': 'center',
              'align-items': 'center',
            }}
          />
        ) : (
          <>
            <div className="card">
              <DataTable
                value={user}
                paginator
                ref={dt}
                header={header}
                rows={10}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                rowsPerPageOptions={[10, 25, 50]}
                dataKey="id"
                selectionMode="checkbox"
                selection={selectedUsers}
                onSelectionChange={(e) => setSelectedUsers(e.value)}
                filters={filters}
                filterDisplay="menu"
                globalFilterFields={[
                  'userName',
                  'email',
                  'contactNo',
                  'status',
                  'role',
                ]}
                emptyMessage="No users found."
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
              >
                <Column
                  field="userName"
                  header="User Name"
                  sortable
                  body={usernameBodyTemplate}
                ></Column>
                <Column field="email" header="Email" sortable></Column>
                <Column field="contactNo" header="Contact No" sortable></Column>
                {session.data.user.role === Enums.ADMIN && (
                  <Column
                    field="status"
                    header="Status"
                    sortable
                    body={statusBodyTemplate}
                    filter
                    filterElement={statusFilterTemplate}
                  ></Column>
                )}
                <Column
                  field="role"
                  header="Role"
                  body={statusRoleTemplate}
                  sortable
                ></Column>

                <Column
                  body={actionAdminBodyTemplate}
                  exportable={false}
                  style={{ minWidth: '12rem' }}
                ></Column>

                <Column
                  field="createdAt"
                  header="Created Date"
                  body={(rowData) => formatDate(rowData.createdAt)}
                  sortable
                ></Column>
              </DataTable>
              <Dialog
                visible={userDialog}
                style={{ width: '32rem' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header="Change Status"
                className="p-fluid"
                footer={userDialogFooter}
                onHide={hideDialog}
              >
                <h3>{selectedRowData && selectedRowData.userName}</h3>
              </Dialog>

              <Dialog
                visible={deleteDialog}
                style={{ width: '32rem' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header="Delete user"
                className="p-fluid"
                footer={deleteUserDialogFooter}
                onHide={hideDeleteDialog}
              >
                <h1>{selectedRowData && selectedRowData.userName}</h1>
              </Dialog>

              <Dialog
                visible={viewUserDialog}
                style={{ width: '32rem' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header="User Details"
                modal
                className="p-fluid"
                onHide={hideViewDialog}
              >
                <div className={styles.centerContent}>
                  {selectedRowData?.profilePictureUrl && (
                    <img
                      src={selectedRowData.profilePictureUrl}
                      alt="User Profile"
                      className={styles.avatar}
                    />
                  )}
                  {selectedRowData?.userId && (
                    <div className={styles.inlineField}>
                      <label htmlFor="userId" className="font-bold">
                        User Id:
                      </label>
                      <p>{selectedRowData?.userId}</p>
                    </div>
                  )}
                  {selectedRowData?.userName && (
                    <div className={styles.inlineField}>
                      <label htmlFor="userName" className="font-bold">
                        Username:
                      </label>
                      <p>{selectedRowData?.userName}</p>
                    </div>
                  )}
                  {selectedRowData?.email && (
                    <div className={styles.inlineField}>
                      <label htmlFor="email" className="font-bold">
                        Email:
                      </label>
                      <p>{selectedRowData?.email}</p>
                    </div>
                  )}
                  {selectedRowData?.fullName && (
                    <div className={styles.inlineField}>
                      <label htmlFor="fullName" className="font-bold">
                        Full Name:
                      </label>
                      <p>{selectedRowData?.fullName}</p>
                    </div>
                  )}

                  {/* Corporate specific stuff */}
                  {selectedRowData?.companyName && (
                    <div className={styles.inlineField}>
                      <label htmlFor="companyName" className="font-bold">
                        Company Name:
                      </label>
                      <p>{selectedRowData?.companyName}</p>
                    </div>
                  )}
                  {selectedRowData?.companyRegistrationId && (
                    <div className={styles.inlineField}>
                      <label
                        htmlFor="companyRegistrationId"
                        className="font-bold"
                      >
                        Company Registration Id:
                      </label>
                      <p>{selectedRowData?.companyRegistrationId}</p>
                    </div>
                  )}
                  {selectedRowData?.companyAddress && (
                    <div className={styles.inlineField}>
                      <label htmlFor="companyAddress" className="font-bold">
                        Company Address:
                      </label>
                      <p>{selectedRowData?.companyAddress}</p>
                    </div>
                  )}

                  {/* Job seeker specific stuff */}
                  {selectedRowData?.dateOfBirth && (
                    <div className={styles.inlineField}>
                      <label htmlFor="dateOfBirth" className="font-bold">
                        Date of Birth:
                      </label>
                      <p>{formatDate(selectedRowData?.dateOfBirth)}</p>
                    </div>
                  )}
                  {selectedRowData?.homeAddress && (
                    <div className={styles.inlineField}>
                      <label htmlFor="homeAddress" className="font-bold">
                        Home Address:
                      </label>
                      <p>{selectedRowData?.homeAddress}</p>
                    </div>
                  )}

                  {selectedRowData?.contactNo && (
                    <div className={styles.inlineField}>
                      <label htmlFor="contactNo" className="font-bold">
                        Contact No:
                      </label>
                      <p>{selectedRowData?.contactNo}</p>
                    </div>
                  )}
                  {selectedRowData?.status && (
                    <div className={styles.inlineField}>
                      <label htmlFor="status" className="font-bold">
                        Status:
                      </label>
                      <p>{selectedRowData?.status}</p>
                    </div>
                  )}
                  {selectedRowData?.status && (
                    <div className={styles.inlineField}>
                      <label htmlFor="notificationMode" className="font-bold">
                        Notification Mode:
                      </label>
                      <p>{selectedRowData?.notificationMode}</p>
                    </div>
                  )}
                  {selectedRowData?.role && (
                    <div className={styles.inlineField}>
                      <label htmlFor="role" className="font-bold">
                        Role:
                      </label>
                      <p>{selectedRowData?.role}</p>
                    </div>
                  )}
                  {selectedRowData?.createdAt && (
                    <div className={styles.inlineField}>
                      <label htmlFor="createdAt" className="font-bold">
                        Created At:
                      </label>
                      <p>{formatDate(selectedRowData?.createdAt)}</p>
                    </div>
                  )}
                </div>
              </Dialog>
            </div>
          </>
        )}
      </>
    );
  }
}
