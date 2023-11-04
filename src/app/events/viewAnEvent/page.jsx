'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card } from 'primereact/card';
import styles from './viewAnEvent.module.css';
import Image from 'next/image';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { useRouter } from 'next/navigation';
import { Dropdown } from '@/components/Dropdown/Dropdown';
import { Checkbox } from 'primereact/checkbox';
import moment from 'moment';
import HumanIcon from '../../../../public/icon.png';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';
import { Message } from 'primereact/message'; 
import { getAEventListing } from "@/app/api/events/route";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const ViewJobApplicationDetails = () => {
  const session = useSession();
  const router = useRouter();

  if (session.status === 'unauthenticated') {
    router?.push('/login');
  }

  const accessToken =
    session.status === 'authenticated' &&
    session.data &&
    session.data.user.accessToken;

  const currentUserId =
    session.status === 'authenticated' && session.data.user.userId;

  const currentUserName =
    session.status === 'authenticated' && session.data.user.name;
  console.log(session);

  const params = useSearchParams();
  const eventId = params.get('id');

  const [isLoading, setIsLoading] = useState(false);
  const [event, setEvent] = useState(null);
  const [eventRegistrations, setEventRegistrations] = useState(null);
  const [corporate, setCorporate] = useState(null);

  const convertTimestampToDate = (timestamp) => {
    return moment(timestamp).format('DD/MM/YYYY');
  };

  const handleOnBackClick = () => {
    router.back();
  };

  useEffect(() => {
    if (accessToken) {
        getAEventListing(eventId, accessToken)
        .then((details) => {
          setEvent(details);
          setCorporate(details.corporate)
          seteventRegistrations(details.eventRegistrations)
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching job listings:', error);
          setIsLoading(false);
        });
    }
  }, [accessToken]);

  return (
    <>
      {isLoading && (
        <div className="card flex justify-content-center">
          <ProgressSpinner
            style={{
              display: "flex",
              height: "100vh",
              "justify-content": "center",
              "align-items": "center",
            }}
          />
        </div>
      )}
      {!isLoading && (
        <div className={styles.container}>
          <div className={styles.jobSeekerDetails}>
            {event && event.profilePictureUrl != "" ? (
              <img src={event.image} alt="user" className={styles.avatar} />
            ) : (
              <Image
                src={HumanIcon}
                alt="Profile Picture"
                className={styles.avatar}
              />
            )}
            <Card className={styles.jobSeekerCard} title="Event Details">
              <p className={styles.text}>
                <b>Listing ID: </b>
                {event?.eventListingId}
              </p>
              <p className={styles.text}>
                <b>Event Name: </b>
                {event?.eventName}
              </p>
              <p className={styles.text}>
                <b>Location: </b>
                {event?.location}
              </p>
              <p className={styles.text}>
                <b>Listed on: </b>
                {convertTimestampToDate(event?.listingDate)}
              </p>
              <p className={styles.text}>
                <b>Start Date: </b>
                {convertTimestampToDate(event?.eventDate)}
              </p>
              <p className={styles.text}>
                <b>Details: </b>
                {event?.details}
              </p>
              <></>
            </Card>

            <Card className={styles.jobSeekerCard} title="Event Details">
              <p className={styles.text}>
                <b>Corporate User ID: </b>
                {corporate?.userId}
              </p>
              <p className={styles.text}>
                <b>Corporate name: </b>
                {corporate?.companyName}
              </p>
              <p className={styles.text}>
                <b>Email Address: </b>
                {event?.email}
              </p>

              <p
                className={`${styles.text} ${
                  corporate?.status === "Active"
                    ? styles.greenText
                    : styles.redText
                }`}
              >
                <b>Status: </b>
                {corporate?.status}
              </p>

              <p
                className={`${styles.text} ${
                  corporate?.corporatePromotionStatus === "Premium"
                    ? styles.goldText
                    : styles.redText
                }`}
              >
                <b>User type: </b>
                {corporate?.corporatePromotionStatus}
              </p>

              <p className={styles.text}>
                <b>Registration ID: </b>
                {corporate?.companyRegistrationId}
              </p>
              <></>
            </Card>
          </div>

          <DataTable value={eventRegistrations}>
            <Column field="eventName" header="Vin" />
          </DataTable>

          <div className={styles.jobSeekerApplication}></div>
          <div className={styles.buttons}>
            <Button
              label="Back"
              className={styles.backButton}
              icon="pi pi-chevron-left"
              rounded
              severity="primary"
              onClick={() => handleOnBackClick()}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ViewJobApplicationDetails;