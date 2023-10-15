'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { ProgressSpinner } from 'primereact/progressspinner';
import { viewAllTickets } from '../api/ticket/route';
import Image from 'next/image';
import HumanIcon from '../../../public/icon.png';
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

  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [ticketStatuses] = useState([
    'General',
    'Account',
    'Jobs',
    'Events',
    'Forum',
    'SubscriptionBilling',
  ]);

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
    <>
      <h2>Tickets</h2>
      <DataTable value={tickets}>
        <Column field="ticketId" header="Ticket ID"></Column>
        <Column field="ticketName" header="Problem Title"></Column>
        <Column field="ticketDescription" header="Problem Description"></Column>
        {/* <Column
          field="user.userName"
          header="User Name"
          sortable
          body={usernameBodyTemplate}
        ></Column> */}
        <Column
          field="user.email"
          header="Email"
          sortable
          body={emailBodyTemplate}
        ></Column>
      </DataTable>
    </>
  );
}
