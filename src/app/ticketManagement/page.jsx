'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import { viewAllTickets, resolveTicket } from '../api/ticket/route';
import Image from 'next/image';
import HumanIcon from '../../../public/icon.png';
import Enums from '@/common/enums/enums';
import styles from './page.module.css';

export default function TicketManagement() {
  const session = useSession();

  const router = useRouter();

  const params = useSearchParams();
  const id = params.get('ticketId');

  const userIdRef =
    session.status === 'authenticated' &&
    session.data &&
    session.data.user.userId;

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

  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [ticketStatuses] = useState([
    'General',
    'Account',
    'Jobs',
    'Events',
    'Forum',
    'SubscriptionBilling',
  ]);

  const resolvedBodyTemplate = (rowData) => {
    return <span>{rowData.isResolved ? 'Yes' : 'No'}</span>;
  };

  const handleResolveTicket = (ticketId) => {
    setSelectedTicketId(ticketId); // Store the ticketId temporarily
    setConfirmDialogVisible(true); // Show the confirmation dialog
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
      setConfirmDialogVisible(false); // Close the dialog after resolution
    }
  };

  const resolveButtonBodyTemplate = (rowData) => {
    if (!rowData.isResolved) {
      return (
        <Button rounded onClick={() => handleResolveTicket(rowData.ticketId)}>
          Resolve
        </Button>
      );
    } else {
      return <span>Resolved</span>;
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

  useEffect(() => {
    viewAllTickets(accessToken)
      .then((data) => {
        console.log('Received tickets:', data);
        setTickets(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching tickets:', error);
        setLoading(false);
      });
  }, [refreshData, accessToken]);

  if (loading) {
    return <h2>Loading tickets...</h2>;
  }

  return (
    <div className={styles.pageContainer}>
      <h2>Tickets</h2>
      <DataTable
        className={`${styles.dataTableHeader} ${styles.dataTableRow}`}
        value={tickets}
      >
        <Column field="ticketId" header="Ticket ID"></Column>
        <Column field="ticketName" header="Problem Title"></Column>
        <Column field="ticketDescription" header="Problem Description"></Column>
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
        {/* New column for Resolve button */}
      </DataTable>

      <Dialog
        visible={confirmDialogVisible}
        header="Confirm Ticket Resolution"
        modal
        className="p-fluid"
        onHide={() => setConfirmDialogVisible(false)}
        footer={
          <>
            <button onClick={() => setConfirmDialogVisible(false)}>No</button>
            <button onClick={confirmResolveTicket}>Yes</button>
          </>
        }
      >
        Are you sure you want to resolve this ticket?
      </Dialog>
    </div>
  );
}
