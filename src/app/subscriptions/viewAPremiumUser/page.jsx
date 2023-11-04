"use client"
import React, { useEffect, useState, useRef } from "react";
import { Card } from "primereact/card";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { getCorporateNextBillingCycleBySubID } from "@/app/api/subscriptions/route";
import { viewAllPremiumUsers } from "@/app/api/subscriptions/route"

const SubscriptionCard = () => {
    const session = useSession();
    const router = useRouter();
    const [premiumUsers, setPremiumUsers] = useState([]);
    const [premiumUsersBillingCycle, setPremiumUsersBillingCycle] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const accessToken =
      session.status === "authenticated" &&
      session.data &&
      session.data.user.accessToken;

    const currentUserId =
      session.status === "authenticated" && session.data.user.userId;

    const params = useSearchParams();
    const id = params.get("id");
    const subId = params.get("subId");

    function convertToSingaporeDate(utcDateString) {
        const utcDate = new Date(utcDateString);
    
        const options = {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short',
          timeZone: 'Asia/Singapore',
        };
        return utcDate.toLocaleString('en-SG', options);
      } 

      useEffect(() => {
        if (accessToken) {
          viewAllPremiumUsers(accessToken)
            .then((data) => {
                if (Array.isArray(data)) {
                  setPremiumUsers(data)
                } else {
                  console.error("Data is not an array:", data);
                  setPremiumUsers(data.data)
                }
                setIsLoading(false);
              })
            .catch((error) => {
              console.error("Error fetching Promotion Request:", error);
              setIsLoading(false);
            });
        }
      }, [accessToken]);
      


      useEffect(() => {
      if (session.status === "unauthenticated") {
        router.push("/login");
      }
      if (accessToken) {
        getCorporateNextBillingCycleBySubID(subId, accessToken)
          .then((data) => {
            setPremiumUsersBillingCycle(data);
            setIsLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching Information:", error);
            setIsLoading(false);
          });
      }
    }, [accessToken]);


      
      

  const cardHeader = (
    <div>
      <h2>Subscription Information</h2>
    </div>
  );

  /*
  const cardFooter = (
    <div>
      <p>Next Billing Cycle: 2023-12-01</p>
    </div>
  );
  */


  return (
    <Card title={cardHeader} className="p-shadow-2" style={{ width: "300px" }}>
      <div>
        <p>
          <strong> Next Billing Cycle Start Date: </strong>{" "}
          {convertToSingaporeDate(
            premiumUsersBillingCycle?.nextBillingCycleStart
          )}
        </p>
        <strong> Next Billing Cycle End Date: </strong>{" "}
        {convertToSingaporeDate(premiumUsersBillingCycle?.nextBillingCycleEnd)}
      </div>
    </Card>
  );
};

export default SubscriptionCard;
