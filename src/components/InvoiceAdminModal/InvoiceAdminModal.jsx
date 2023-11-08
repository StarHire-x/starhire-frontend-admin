import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import HumanIcon from "../../../public/icon.png";
import styles from "./invoiceAdminModal.module.css";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import Enums from "@/common/enums/enums";
import { Tag } from "primereact/tag";
import { Chart } from "primereact/chart";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { getRecrutierJobApplicationStatistics } from "@/app/api/auth/user/route";
import { fetchData } from "next-auth/client/_utils";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { useRouter } from "next/navigation";
import { TabMenu } from "primereact/tabmenu";
import { getCorporatesInvoicesStatistics } from "@/app/api/invoice/route";

const InvoiceAdminModal = ({ accessToken }) => {
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  const [overallStats, setOverallStats] = useState({});
  const [invoices, setInvoices] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("All Corporate");
  const [filterOptions, setFilterOptions] = useState([{
    label: 'All Corporate', value: 'All Corporate'
  }]);

  useEffect(() => {
    const documentStyle = getComputedStyle(document.documentElement);
    const data = {
      labels: ["Not Paid", "Indicated Paid", "Confirm Paid"],
      datasets: [
        {
          data: [540, 325, 702],
          backgroundColor: [
            documentStyle.getPropertyValue("--blue-500"),
            documentStyle.getPropertyValue("--yellow-500"),
            documentStyle.getPropertyValue("--green-500"),
          ],
          hoverBackgroundColor: [
            documentStyle.getPropertyValue("--blue-400"),
            documentStyle.getPropertyValue("--yellow-400"),
            documentStyle.getPropertyValue("--green-400"),
          ],
        },
      ],
    };
    const options = {
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
          },
        },
      },
    };

    setChartData(data);
    setChartOptions(options);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const information = await getCorporatesInvoicesStatistics(accessToken);

            let corporateOptions = information.formattedResponse.map((label) => ({
                label: label.companyName,
                value: label.corporateId,
            }));

            setFilterOptions([...corporateOptions]);
            
            if (selectedFilter) {
              await filterData(information);
            }
        } catch (error) {
            console.error("An error occurred while fetching the data", error);
        }
    };

    const filterData = async (information) => {
        console.log(selectedFilter);
        if(selectedFilter === 'All Corporate') {
            const allData = information.formattedResponse.map((item) => item.invoices)
            setInvoices(allData)
            setOverallStats(information.overallStatistics);
        } else {
            const filteredData = information.formattedResponse.filter(
              (item) => item.corporateId === selectedFilter
            );
            console.log(filteredData);
            setInvoices(filteredData.invoices);
            setOverallStats(filteredData.statistics);
        }
    };
    fetchData();
  }, [accessToken, selectedFilter]);

  const cardHeader = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: "10px 10px 10px 10px" }}>Invoice Analytics</h2>
        <Dropdown
          style={{ margin: "10px 10px 10px 10px" }}
          value={selectedFilter}
          options={filterOptions}
          onChange={(e) => setSelectedFilter(e.value)}
          placeholder="Select Corporate"
        />
      </div>
    );
  };


  return (
    <div className={styles.mainContainer}>
      <Card className={styles.customCardGraph} header={cardHeader}>
        <div className={styles.layout}>
          <div className={styles.cardColumnLeft}>
            <Card className={styles.customCard}>
              <div className={styles.cardLayout}>
                <h1>${overallStats.notPaidSum}</h1>
                <br />
                <p>{overallStats.notPaidCount} Invoices Not Paid</p>
              </div>
            </Card>
            <Card className={styles.customCard}>
              <div className={styles.cardLayout}>
                <h1>${overallStats.indicatedPaidSum}</h1>
                <br />
                <p>{overallStats.indicatedPaidCount} Indicated Paid Invoices</p>
              </div>
            </Card>
            <Card className={styles.customCard}>
              <div className={styles.cardLayout}>
                <h1>${overallStats.confirmedPaidSum}</h1>
                <br />
                <p>{overallStats.confirmedPaidCount} Invoices Paid</p>
              </div>
            </Card>
          </div>
          <div className={styles.cardColumnRight}>
            <Chart
              type="pie"
              data={chartData}
              options={chartOptions}
              className="w-full md:w-30rem"
            />
            <DataTable
              //   header={header}
              value={invoices}
              showGridlines
              //   filters={filters}
              globalFilterFields={[
                "jobApplicationId",
                "jobSeekerName",
                "corporateName",
                "jobListingTitle",
              ]}
              tableStyle={{ minWidth: "50rem" }}
              rows={4}
              paginator
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              emptyMessage="No job assignments found."
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            >
              <Column
                field="invoiceId"
                header="Id"
                style={{ textAlign: "center", verticalAlign: "middle" }}
                sortable
              ></Column>
              <Column
                field="corporateId"
                header="Company"
                sortable
                // body={jobSeekerBodyTemplate}
              ></Column>
              <Column
                field="jobListingTitle"
                header="Job Listing"
                sortable
              ></Column>
              <Column
                field="jobApplicationStatus"
                header="Status"
                sortable
                // body={statusBodyTemplate}
              ></Column>
              <Column
                exportable={false}
                style={{ minWidth: "1rem" }}
                header="Actions"
                // body={viewDetailsBodyTemplate}
              ></Column>
            </DataTable>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InvoiceAdminModal;