"use client";

import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import timeGridPlugin from "@fullcalendar/timegrid";
import Layout from "./components/layout";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getAllEventListings } from "@/app/api/events/route"

export default function CalendarPage() {
  const session = useSession();
  const router = useRouter();

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [eventClicked, setEventClicked] = useState(false);
  const [warningDialogVisible, setWarningDialogVisible] = useState(false);
  const [selectedMeetingLink, setSelectedMeetingLink] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [displayEventDialog, setDisplayEventDialog] = useState(false);

  const [events, setEvents] = useState(null);

  const calendarRef = useRef(null);

  const showEventDialog = () => {
    setDisplayEventDialog(true);
  };

  const hideEventDialog = () => {
    setDisplayEventDialog(false);
  };

  const redirectToEvent = () => {
    router.push(`/events/viewAnEvent?id=${selectedEvent.eventId}`)
  }

  const closeWarningDialog = () => {
    setWarningDialogVisible(false);
  };

  const viewEventDetails = (event) => {
    setSelectedEvent(event); // Set the selected event
    setDisplayEventDialog(true); // Open the event details dialog
    console.log(event.eventId);
    //redirectToEvent(event.eventId)
  };

  const accessToken =
    session.status === "authenticated" &&
    session.data &&
    session.data.user.accessToken;

  if (session.status === "unauthenticated") {
    router?.push("/login");
  }

  function renderEventContent(eventInfo) {
    const startTime = eventInfo.event.start;
    const endTime = eventInfo.event.end;

    const formattedStartTime = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(startTime);

    const formattedEndTime = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(endTime);

    const eventListingStatus = eventInfo.event.extendedProps.eventListingStatus;

    return (
      <div
        style={{
          padding: "2px",
          borderRadius: "4px",
          color: eventListingStatus === "Upcoming" ? "green" : "red",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontSize: "10px",
        }}
      >
        <b className="fc-event-title-container">
          {formattedStartTime}-{formattedEndTime} {eventInfo.event.title}
        </b>
      </div>
    );
  } 

  useEffect(() => {
    if (session.status === "authenticated") {
      getAllEventListings(accessToken)
        .then((data) => {
          const formattedEvents = data.map((event) => ({
            title: event.eventName,
            start: event.eventDate, 
            end: event.eventDate, 
            eventListingStatus: event.eventListingStatus,
            eventId: event.eventListingId
          }));

          setEvents(formattedEvents);
        })
        .catch((error) => {
          console.error("Error fetching events:", error);
        });
    }
  }, [accessToken]);

  const viewAnEvent = () => {
    setWarningDialogVisible((false));
  }
    

  const closeEventDetails = () => {
    setSelectedEvent(null); 
  };
  

  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.on("eventClick", (info) => {
        const event = info.event.extendedProps;
        viewEventDetails(event); // Call viewEventDetails to show event details
      });
    }
  }, []);


  return (
    <Layout>
      <div className="calendar-container">
        <FullCalendar
          ref={calendarRef}
          plugins={[
            resourceTimelinePlugin,
            dayGridPlugin,
            interactionPlugin,
            timeGridPlugin,
          ]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "resourceTimelineWeek,dayGridMonth,timeGridWeek",
          }}
          initialView="resourceTimelineWeek"
          nowIndicator={true}
          editable={true}
          selectable={true}
          selectMirror={true}
          schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
          resources={[
            { id: "a", title: "Auditorium A" },
            { id: "b", title: "Auditorium B", eventColor: "green" },
            { id: "c", title: "Auditorium C", eventColor: "orange" },
          ]}
          events={events}
          eventContent={renderEventContent}
        />
      </div>

      <Dialog
        header="See more details?"
        visible={displayEventDialog}
        style={{ width: "30vw" }}
        onHide={hideEventDialog}
        modal
        footer={
          <div>
            <Button label="OK" onClick={redirectToEvent}  />
          </div>
        }
      >
        <p>See more details of this event.</p>
      </Dialog>
    </Layout>
  );
}