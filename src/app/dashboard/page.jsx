'use client';
import React from 'react';
import styles from './page.module.css';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ProgressSpinner } from 'primereact/progressspinner';
import UserStatisticsModal from '@/components/UserStatisticsModal/UserStatisticsModal';
import JobStatisticsModal from '@/components/JobStatisticsModal/JobStatisticsModal';
import JobAssignmentModal from '@/components/JobAssignmentModal/JobAssignmentModal';
import JobApplicationModal from '@/components/JobApplicationModal/JobApplicationModal';
import InvoiceAdminModal from '@/components/InvoiceAdminModal/InvoiceAdminModal';
import CommissionAdminModal from '@/components/CommissionAdminModal/CommissionAdminModal';
import CommissionStatisticsModal from '@/components/CommissionStatisticsModal/CommissionStatisticsModal';

const Dashboard = () => {
  const session = useSession();

  const router = useRouter();

  const accessToken =
    session.status === 'authenticated' &&
    session.data &&
    session.data.user.accessToken;

  const role =
    session.status === 'authenticated' &&
    session.data &&
    session.data.user.role;

  const userId =
    session.status === 'authenticated' &&
    session.data &&
    session.data.user.userId;

  if (session.status === 'loading') {
    return <ProgressSpinner />;
  }

  if (session.status === 'unauthenticated') {
    router?.push('/login');
  }

  if (session.status === 'authenticated') {
    return (
      <>
        <div>
          <h2 className={styles.header}>
            Welcome Back {session.data.user.name}!
          </h2>
          {role === 'Administrator' && (
            <>
              <UserStatisticsModal accessToken={accessToken} />
              <JobStatisticsModal accessToken={accessToken} />
              <InvoiceAdminModal accessToken={accessToken} />
              <CommissionAdminModal accessToken={accessToken} />
            </>
          )}
          {role === 'Recruiter' && (
            <>
              <JobAssignmentModal accessToken={accessToken} userId={userId} />
              <JobApplicationModal accessToken={accessToken} userId={userId} />
              <CommissionStatisticsModal
                accessToken={accessToken}
                userId={userId}
              />
            </>
          )}
        </div>
      </>
    );
  }
};

export default Dashboard;
