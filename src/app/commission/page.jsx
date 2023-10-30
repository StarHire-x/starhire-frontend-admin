"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import styles from "./commission.module.css";
import { Dialog } from "primereact/dialog";
import ManageCommissionRateModal from "./components/ManageCommissionRate/ManageCommissionRate";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Enums from "@/common/enums/enums";
import ViewRecruitersTable from "./components/ViewRecruitersTable/ViewRecruitersTable";
import { getAllCommissionRates } from "../api/commission/route";

const CommissionPage = () => {
  const session = useSession();
  const router = useRouter();

  const currentUserRole =
    session.status === "authenticated" &&
    session.data &&
    session.data.user.role;

  if (session.status === "unauthenticated") {
    router?.push("/login");
  }

  if (session.status === "authenticated" && currentUserRole !== Enums.ADMIN) {
    router.push("/dashboard");
  }

  const accessToken =
    session.status === "authenticated" &&
    session.data &&
    session.data.user.accessToken;

  const [
    manageCommissionRateModalVisibility,
    setManageCommissionRateModalVisibility,
  ] = useState(false);

  const [commissionRateObj, setCommissionRateObj] = useState({});

  useEffect(() => {
    if (accessToken) {
      getAllCommissionRates(accessToken).then((response) => {
        if (response.length > 0) {
          setCommissionRateObj(response[0]);
        }
      });
    }
  }, [accessToken]);

  return (
    <>
      <div className={styles.commissionHeaderContainer}>
        <h2>Commission</h2>
        <Button
          size="small"
          label="Manage Commission Rate"
          onClick={() => setManageCommissionRateModalVisibility(true)}
        />
        <Dialog
          header="Manage Commission Rate"
          visible={manageCommissionRateModalVisibility}
          onHide={() => setManageCommissionRateModalVisibility(false)}
        >
          <ManageCommissionRateModal
            accessToken={accessToken}
            commissionRateObj={commissionRateObj}
            setCommissionRateObj={setCommissionRateObj}
          />
        </Dialog>
      </div>
      <ViewRecruitersTable
        router={router}
        accessToken={accessToken}
      />
    </>
  );
};

export default CommissionPage;
