"use client";
import styles from "./ViewSuccessfulJobAppsPage.module.css";

import React, { useEffect, useState, useRef } from "react";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Dialog } from "primereact/dialog";
import { useSession } from "next-auth/react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Enums from "@/common/enums/enums";
import { InputText } from "primereact/inputtext";
import { getCorporateDetails } from "../../api/auth/user/route";
import moment from "moment";
import { createInvoice } from "@/app/api/invoice/route";
import { Toast } from "primereact/toast";
import { getAllYetCommissionedSuccessfulJobAppsByRecruiterId } from "@/app/api/commission/route";

const ViewSuccessfulJobAppsPage = () => {
  const session = useSession();
  const router = useRouter();
  const toast = useRef(null);

  const currentUserRole =
    session.status === "authenticated" &&
    session.data &&
    session.data.user.role;

  if (session.status === "unauthenticated") {
    router.push("/login");
  }

  if (session.status === "authenticated" && currentUserRole !== Enums.ADMIN) {
    router.push("/dashboard");
  }

  const accessToken =
    session.status === "authenticated" &&
    session.data &&
    session.data.user.accessToken;

  const currentUserId =
    session.status === "authenticated" && session.data.user.userId;

  const dt = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshData, setRefreshData] = useState(false);

  const params = useSearchParams();
  const recruiterId = params.get("recruiterId");

  // fetch yet-commissioned successful job apps
  useEffect(() => {
    if (accessToken) {
      const fetchYetCommissionedSuccessfulJobApps = async () => {
        try {
          const yetCommissionedSuccessfulJobApps = await getAllYetCommissionedSuccessfulJobAppsByRecruiterId(recruiterId, accessToken);
          console.log(yetCommissionedSuccessfulJobApps);
          // setCorporate(corporate.data);
          // setJobListings(corporate.data.jobListings);
        } catch (error) {
          console.log(error);
        }
      };
      fetchYetCommissionedSuccessfulJobApps();
    }
  }, [accessToken]);
};

export default ViewSuccessfulJobAppsPage;
