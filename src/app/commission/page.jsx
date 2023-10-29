"use client";
import { Button } from "primereact/button";
import styles from "./commission.module.css";
import { Dialog } from "primereact/dialog";
import ManageCommissionRateModal from "./components/ManageCommissionRate/ManageCommissionRate";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const CommissionPage = () => {
  const session = useSession();
  const router = useRouter();
  if (session.status === "unauthenticated") {
    router?.push("/login");
  }

  const accessToken =
    session.status === "authenticated" &&
    session.data &&
    session.data.user.accessToken;

  const [
    manageCommissionRateModalVisibility,
    setManageCommissionRateModalVisibility,
  ] = useState(false);

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
          <ManageCommissionRateModal accessToken={accessToken} />
        </Dialog>
      </div>
    </>
  );
};

export default CommissionPage;
