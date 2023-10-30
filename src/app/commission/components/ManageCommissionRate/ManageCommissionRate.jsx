import { Card } from "primereact/card";
import styles from "./ManageCommissionRate.module.css";
import { InputNumber } from "primereact/inputnumber";
import { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import {
  getAllCommissionRates,
  updateCommissionRate,
} from "@/app/api/commission/route";
import { Toast } from "primereact/toast";

const ManageCommissionRateModal = ({ accessToken }) => {
  const [commissionRateObj, setCommissionRateObj] = useState({});
  const toast = useRef(null);

  const handleUpdateCommissionRate = async () => {
    console.log("Commission Rate obj: " + JSON.stringify(commissionRateObj));

    try {
      await updateCommissionRate(
        commissionRateObj,
        commissionRateObj.commissionRateId,
        accessToken
      );
      await toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Successfully updated the commission rate!",
        life: 5000,
      });
    } catch (err) {
      // update commission rate here
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update the commission rate!",
        life: 5000,
      });
    }
  };

  useEffect(() => {
    getAllCommissionRates(accessToken).then((response) => {
      if (response.length > 0) {
        setCommissionRateObj(response[0]);
      }
    });
  }, [accessToken]);

  return (
    <>
      <Toast ref={toast} />
      <Card>
        <div className={styles.manageCommissionRateContainer}>
          <p className={styles.commissionRateNote}>
            Note that this commission rate is standardized for all recruiter&apos;s
            commissions.
          </p>

          <div className={styles.commissionRateInput}>
            <label
              htmlFor="commissionRate"
              className={styles.commissionRateLabel}
            >
              Commission Rate in (%):
            </label>
            <InputNumber
              inputId="commissionRate"
              value={commissionRateObj?.commissionRate}
              onValueChange={(e) =>
                setCommissionRateObj({
                  commissionRateId: commissionRateObj.commissionRateId,
                  commissionRate: e.value,
                })
              }
              maxFractionDigits={2}
            />
          </div>
          <div className={styles.commissionSaveBtnContainer}>
            <Button label="Save" onClick={() => handleUpdateCommissionRate()} />
          </div>
        </div>
      </Card>
    </>
  );
};

export default ManageCommissionRateModal;
