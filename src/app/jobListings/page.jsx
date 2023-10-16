'use client';
import React, { useState, useEffect } from 'react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { viewAllJobListings } from '@/app/api/jobListings/route';
import Enums from '@/common/enums/enums';
import styles from './jobListings.module.css';

export default function JobListings() {
  const session = useSession();

  const router = useRouter();

  const accessToken =
    session.status === 'authenticated' &&
    session.data &&
    session.data.user.accessToken;

  const currentUserId =
    session.status === 'authenticated' && session.data.user.userId;

  if (session.status === 'unauthenticated') {
    router?.push('/login');
  }

  const [refreshData, setRefreshData] = useState(false);
  const [jobListings, setJobListings] = useState([]);
  const [userDialog, setUserDialog] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    // role: {
    //   operator: FilterOperator.OR,
    //   constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
    // },
    jobListingStatus: {
      operator: FilterOperator.OR,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
    },
  });

  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [jobListingStatuses] = useState([
    'Approved',
    'Unverified',
    'Rejected',
    'Archived',
  ]);

  const getStatus = (status) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Unverified':
        return 'danger';
      case 'Rejected':
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

  const statusBodyTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.jobListingStatus}
        severity={getStatus(rowData.jobListingStatus)}
      />
    );
  };

  const statusFilterTemplate = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={jobListingStatuses}
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
    return (
      <React.Fragment>
        <Button
          label="View Details"
          rounded
          size="small"
          className="mr-2"
          onClick={() => {
            saveStatusChange(rowData);
          }}
        />
      </React.Fragment>
    );
  };

  const handleViewSubmissionsClick = (jobListingId) => {
    router.push(`/jobApplications?id=${jobListingId}`);
    // `/jobListings/viewJobListingRecruiter?id=${id}`;
  };

  const getNumberOfRequiredAttentionJobApplicationsByJobListingByCurrentRecruiter =
    (jobListing) => {
      return jobListing?.jobApplications.filter(
        (jobApp) =>
          jobApp.jobApplicationStatus === Enums.SUBMITTED &&
          jobApp?.recruiter.userId === currentUserId
      ).length;
    };

  const actionRecruiterBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <div className={styles.buttonContainer}>
          <Button
            label="View Job Applications"
            rounded
            className="p-button-warning"
            size="small"
            onClick={() => handleViewSubmissionsClick(rowData?.jobListingId)}
          >
            <Badge
              severity="danger"
              value={getNumberOfRequiredAttentionJobApplicationsByJobListingByCurrentRecruiter(
                rowData
              )}
            />
          </Button>
          <div className={styles.spacer}></div>
          <Button
            label="View Details"
            rounded
            className="mr-2"
            size="small"
            onClick={() => {
              saveStatusChange(rowData);
            }}
          />
        </div>
      </React.Fragment>
    );
  };

  const hideDialog = () => {
    setUserDialog(false);
  };

  const createLink = (id) => {
    const link = `/jobListings/viewJobListingAdmin?id=${id}`;
    return link;
  };

  const createRecruiterLink = (id) => {
    const link = `/jobListings/viewJobListingRecruiter?id=${id}`;
    return link;
  };

  const sortJobListingsByNumberOfProcessingJobApps = (jobListings) => {
    return jobListings.sort(
      (x, y) =>
        getNumberOfRequiredAttentionJobApplicationsByJobListingByCurrentRecruiter(
          y
        ) -
        getNumberOfRequiredAttentionJobApplicationsByJobListingByCurrentRecruiter(
          x
        )
    );
  };

  const saveStatusChange = async (rowData) => {
    const jobListingId = rowData.jobListingId;
    if (session.data.user.role === Enums.ADMIN) {
      try {
        // Use router.push to navigate to another page with a query parameter
        let link = createLink(jobListingId);
        router.push(link);
      } catch (error) {
        console.error('Error changing status:', error);
      }
    } else {
      try {
        let link = createRecruiterLink(jobListingId);
        router.push(link);
      } catch (error) {
        console.error('Error changing status:', error);
      }
    }
  };

  const renderHeader = () => {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 className="m-0">Job Listings</h2>
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Keyword Search"
          />
        </span>
      </div>
    );
  };

  // Function to format date in "day-month-year" format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const userDialogFooter = (
    <React.Fragment>
      <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
      <Button label="Yes" icon="pi pi-check" onClick={saveStatusChange} />
    </React.Fragment>
  );

  useEffect(() => {
    if (accessToken) {
      viewAllJobListings(accessToken)
        .then((data) => {
          if (session.data.user.role === Enums.RECRUITER) {
            const activeJobListing = data.filter(
              (jobListing) => jobListing.jobListingStatus === 'Approved'
            );
            setJobListings(activeJobListing);
          } else {
            setJobListings(data);
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching job listings:', error);
          setIsLoading(false);
        });
    }
  }, [accessToken]);

  /* Old implementation, dont delete for now
  useEffect(() => {
    fetch(`http://localhost:8080/job-listing`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setJobListings(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      });
  }, [accessToken]);
  */

  const header = renderHeader();

  if (
    session.status === 'authenticated' &&
    session.data.user.role !== Enums.ADMIN &&
    session.data.user.role !== Enums.RECRUITER
  ) {
    router?.push('/dashboard');
  }

  if (
    session.status === 'authenticated' &&
    (session.data.user.role === Enums.ADMIN ||
      session.data.user.role === Enums.RECRUITER)
  ) {
    return (
      <div className={styles.card}>
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
            <DataTable
              value={sortJobListingsByNumberOfProcessingJobApps(jobListings)}
              paginator
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
                'jobListingId',
                'title',
                'corporate.userName',
                'jobLocation',
                'listingDate',
                'jobListingStatus',
              ]}
              emptyMessage="No Job Listings found."
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            >
              <Column
                field="jobListingId"
                header="Listing ID"
                sortable
              ></Column>
              <Column field="title" header="Title" sortable></Column>
              <Column
                field="corporate.userName"
                header="Company Name"
                sortable
              />
              <Column field="jobLocation" header="Job Location"></Column>
              <Column
                field="listingDate"
                header="List Date"
                body={(rowData) => formatDate(rowData.listingDate)}
                sortable
              ></Column>
              {session.data.user.role === Enums.ADMIN ? (
                <Column
                  field="jobListingStatus"
                  header="Job Listing Status"
                  body={statusBodyTemplate}
                  filter
                  filterElement={statusFilterTemplate}
                  sortable
                ></Column>
              ) : (
                <Column
                  field="jobListingStatus"
                  header="Job Listing Status"
                  body={statusBodyTemplate}
                ></Column>
              )}
              {session.data.user.role === Enums.ADMIN ? (
                <Column body={actionAdminBodyTemplate} />
              ) : (
                <Column body={actionRecruiterBodyTemplate} />
              )}
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
          </>
        )}
      </div>
    );
  }
}
