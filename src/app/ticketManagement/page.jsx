'use client';
import React, { useState, useEffect } from 'react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import { viewAllTickets, resolveTicket } from '../api/ticket/route';
import Enums from '@/common/enums/enums';
import styles from './page.module.css';

export default function TicketManagement() {
  const session = useSession();

  const router = useRouter();

  const params = useSearchParams();
  const id = params.get('ticketId');

  const accessToken =
    session.status === 'authenticated' &&
    session.data &&
    session.data.user.accessToken;

  if (session.status === 'unauthenticated') {
    router?.push('/login');
  }

  const [tickets, setTickets] = useState([]);
  const [refreshData, setRefreshData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    // role: {
    //   operator: FilterOperator.OR,
    //   constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
    // },
    ticketStatus: {
      operator: FilterOperator.OR,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
    },
  });

  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [ticketStatuses] = useState([
    'General',
    'Account',
    'Jobs',
    'Events',
    'Forum',
    'SubscriptionBilling',
  ]);

  const getStatus = (status) => {
    switch (status) {
      case 'General':
        return 'warning';
      case 'Account':
        return 'warning';
      case 'Jobs':
        return 'info';
      case 'Events':
        return 'info';
      case 'Forum':
        return 'info';
      case 'SubscriptionBilling':
        return 'warning';
    }
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };

    _filters['global'].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const getSeverity = (isResolved) => {
    return isResolved ? 'success' : 'danger';
  };

  const statusBodyTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.ticketCategory}
        severity={getStatus(rowData.ticketCategory)}
      />
    );
  };

  const statusFilterTemplate = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={ticketStatuses}
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

  const resolvedBodyTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.isResolved ? 'Yes' : 'No'}
        severity={getSeverity(rowData.isResolved)}
        style={{ fontSize: '0.8em' }}
      />
    );
  };

  const handleResolveTicket = (ticketId) => {
    setSelectedTicketId(ticketId); // Store the ticketId temporarily
    setConfirmDialogVisible(true);
  };

  const confirmResolveTicket = async () => {
    if (!selectedTicketId) return;

    try {
      setLoading(true);
      await resolveTicket(selectedTicketId, accessToken);
      setRefreshData(!refreshData);
    } catch (error) {
      console.error('Error resolving the ticket:', error);
    } finally {
      setLoading(false);
      setConfirmDialogVisible(false);
    }
  };

  const resolveButtonBodyTemplate = (rowData) => {
    if (!rowData.isResolved) {
      return (
        <React.Fragment>
          <Button
            label="Resolve"
            rounded
            size="small"
            className="mr-2"
            onClick={() => {
              handleResolveTicket(rowData.ticketId);
            }}
          />
          <Button
            label="View Details"
            rounded
            size="small"
            className="mr-2"
            onClick={() => {
              // saveStatusChange(rowData);
            }}
          />
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <span style={{ fontSize: '24px' }}>✔️</span>
          <Button
            label="View Details"
            rounded
            size="small"
            className="mr-2"
            onClick={() => {
              // saveStatusChange(rowData);
            }}
          />
        </React.Fragment>
      );
    }
  };

  // const usernameBodyTemplate = (rowData) => {
  //   let user;

  //   if (rowData.administrator) {
  //     user = rowData.administrator;
  //   } else if (rowData.corporate) {
  //     user = rowData.corporate;
  //   } else if (rowData.recruiter) {
  //     user = rowData.recruiter;
  //   } else if (rowData.jobSeeker) {
  //     user = rowData.jobSeeker;
  //   }

  //   const userName = user?.userName;
  //   const avatar = user?.profilePictureUrl;

  //   return (
  //     <div className={styles.imageContainer}>
  //       {avatar !== '' ? (
  //         <img
  //           alt={avatar}
  //           src={avatar}
  //           className={styles.avatarImageContainer}
  //         />
  //       ) : (
  //         <Image
  //           src={HumanIcon}
  //           alt="Icon"
  //           className={styles.avatarImageContainer}
  //         />
  //       )}
  //       <span>{userName}</span>
  //     </div>
  //   );
  // };

  const emailBodyTemplate = (rowData) => {
    let user;

    if (rowData.administrator) {
      user = rowData.administrator;
    } else if (rowData.corporate) {
      user = rowData.corporate;
    } else if (rowData.recruiter) {
      user = rowData.recruiter;
    } else if (rowData.jobSeeker) {
      user = rowData.jobSeeker;
    }

    return <span>{user?.email}</span>;
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
        <h2 className="m-0">Tickets</h2>
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

  useEffect(() => {
    if (accessToken) {
      viewAllTickets(accessToken)
        .then((data) => {
          setTickets(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching tickets:', error);
          setLoading(false);
        });
    }
  }, [accessToken]);

  const header = renderHeader();

  // if (
  //   session.status === 'authenticated' &&
  //   session.data.user.role !== Enums.ADMIN
  // ) {
  //   router?.push('/dashboard');
  // }

  // if (
  //   session.status === 'authenticated' &&
  //   session.data.user.role === Enums.ADMIN
  // ) {
  return (
    <div className={styles.ticketCard}>
      {loading ? (
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
            value={tickets}
            paginator
            header={header}
            rows={10}
            rowsPerPageOptions={[10, 25, 50]}
            globalFilter={globalFilterValue}
            emptyMessage="No tickets currently"
          >
            <Column field="ticketId" header="Ticket ID" sortable></Column>
            <Column
              field="submissionDate"
              header="Submission Date"
              body={(rowData) => formatDate(rowData.submissionDate)}
              sortable
            ></Column>
            <Column
              field="ticketCategory"
              header="Category"
              body={statusBodyTemplate}
              filter
              filterElement={statusFilterTemplate}
              sortable
            ></Column>
            <Column field="ticketName" header="Problem Title"></Column>
            {/* <Column
                field="ticketDescription"
                header="Problem Description"
              ></Column> */}
            <Column
              field="isResolved"
              header="Resolved?"
              sortable
              body={resolvedBodyTemplate}
            ></Column>
            {/* <Column
          field="user.userName"
          header="User Name"
          sortable
          body={usernameBodyTemplate}
        ></Column> */}
            <Column
              field="user.email"
              header="Contact Email"
              body={emailBodyTemplate}
            ></Column>
            <Column
              rounded
              size="small"
              className="mr-2"
              body={resolveButtonBodyTemplate}
            ></Column>{' '}
          </DataTable>

          <Dialog
            visible={confirmDialogVisible}
            header="Confirm Ticket Resolution"
            style={{ width: '32rem' }}
            className="p-fluid"
            onHide={() => setConfirmDialogVisible(false)}
            footer={
              <div className={styles.ticketButtonContainer}>
                <Button
                  label="No"
                  icon="pi pi-times"
                  onClick={() => setConfirmDialogVisible(false)}
                />
                <Button
                  label="Yes"
                  icon="pi pi-check"
                  onClick={confirmResolveTicket}
                />
              </div>
            }
          >
            Are you sure you want to resolve this ticket?
          </Dialog>
        </>
      )}
    </div>
  );
}
//}
