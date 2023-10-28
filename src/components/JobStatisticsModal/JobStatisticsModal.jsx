import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import HumanIcon from "../../../public/icon.png";
import styles from "./jobStatisticsModal.module.css";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import Enums from "@/common/enums/enums";
import { Chart } from "primereact/chart";
import { Dropdown } from "primereact/dropdown";
import { getCorporateJobListingBreakdown, getCorporateJobListingStatistics } from "@/app/api/auth/user/route";

const JobStatisticsModal = ({ accessToken }) => {
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  const [chartData1, setChartData1] = useState({});
  const [chartOptions1, setChartOptions1] = useState({});
  const [selectedFilter1, setSelectedFilter1] = useState("total");
  const [corporatePercentage, setCorporatePercentage] = useState({});
  const [filterOptions1, setFilterOptions1] = useState([
    { label: "All corporates", value: "total" },
  ]);

  useEffect(() => {
    const documentStyle = getComputedStyle(document.documentElement);

    const fetchBreakdown = async () => {
      const breakdownInfo = await getCorporateJobListingStatistics(accessToken);

      const textColor = documentStyle.getPropertyValue("--text-color");
      const textColorSecondary = documentStyle.getPropertyValue(
        "--text-color-secondary"
      );

      console.log(breakdownInfo);

      let corporateOptions = breakdownInfo.labels.map((label) => ({
        label: label,
        value: label,
      }));

      // Update the filter options.
      setFilterOptions1([
        { label: "All corporates", value: "total" },
        ...corporateOptions,
      ]);

      const surfaceBorder = documentStyle.getPropertyValue("--surface-border");
      const data = {
        labels: breakdownInfo.labels,
        datasets: [
          {
            label: "Number of job listing",
            backgroundColor: documentStyle.getPropertyValue("--pink-500"),
            borderColor: documentStyle.getPropertyValue("--pink-500"),
            data: breakdownInfo.values,
          },
        ],
      };
      const options = {
        indexAxis: "y",
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
          legend: {
            labels: {
              fontColor: textColor,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: textColorSecondary,
              font: {
                weight: 500,
              },
            },
            grid: {
              display: false,
              drawBorder: false,
            },
          },
          y: {
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false,
            },
          },
        },
      };

      setChartData(data);
      setChartOptions(options);
    };

    fetchBreakdown();
  }, [accessToken]);

  useEffect(() => {
    const documentStyle = getComputedStyle(document.documentElement);

    const fetchBreakdown = async () => {
      const breakdownInfo = await getCorporateJobListingBreakdown(accessToken);

      const approvedData = breakdownInfo[selectedFilter1].approved;
      const rejectedData = breakdownInfo[selectedFilter1].rejected;
      const unverifiedData = breakdownInfo[selectedFilter1].unverified;
      const archivedData = breakdownInfo[selectedFilter1].archived;

      const sum = approvedData + rejectedData + unverifiedData + archivedData;
      const total = breakdownInfo["total"].approved + breakdownInfo["total"].rejected + breakdownInfo["total"].unverified + breakdownInfo["total"].archived;

      const approvedDataPercentage =
        sum > 0 ? Number(((approvedData / sum) * 100).toFixed(2)) : 0;
      const rejectedDataPercentage =
        sum > 0 ? Number(((rejectedData / sum) * 100).toFixed(2)) : 0;
      const unverifiedDataPercentage =
        sum > 0 ? Number(((unverifiedData / sum) * 100).toFixed(2)) : 0;
      const archivedDataPercentage =
        sum > 0 ? Number(((archivedData / sum) * 100).toFixed(2)) : 0;
      const proportion =
        total > 0 ? Number(((sum / total) * 100).toFixed(2)) : 0;

      setCorporatePercentage({
        approved: approvedDataPercentage,
        rejected: rejectedDataPercentage,
        unverified: unverifiedDataPercentage,
        archived: archivedDataPercentage,
        proportion: proportion,
      });
      const data = {
        labels: ["Approved", "Rejected", "Unverified", "Archived"],
        datasets: [
          {
            data: [approvedData, rejectedData, unverifiedData, archivedData],
            backgroundColor: [
              documentStyle.getPropertyValue("--blue-500"),
              documentStyle.getPropertyValue("--red-500"),
              documentStyle.getPropertyValue("--orange-500"),
              documentStyle.getPropertyValue("--gray-500"),
            ],
            hoverBackgroundColor: [
              documentStyle.getPropertyValue("--blue-400"),
              documentStyle.getPropertyValue("--red-400"),
              documentStyle.getPropertyValue("--orange-400"),
              documentStyle.getPropertyValue("--gray-400"),
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

      setChartData1(data);
      setChartOptions1(options);
    };

    fetchBreakdown();
  }, [accessToken, selectedFilter1]);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.graphContainer}>
        <Card className={styles.customCardGraph}>
          <div className={styles.headerGraph}>
            <h3 className="montserrat">Total Job Listing Analysis</h3>
            <br />
          </div>
          <Chart type="bar" data={chartData} options={chartOptions} />
        </Card>
        <Card className={styles.customCardGraph1}>
          <div className={styles.headerGraph1}>
            <h3 className="montserrat">Job Listings Status</h3>
            <Dropdown
              value={selectedFilter1}
              options={filterOptions1}
              onChange={(e) => setSelectedFilter1(e.value)}
              placeholder="Select a corporate"
            />
          </div>
          <div className={styles.filterContainer1}>
            <Chart
              type="pie"
              data={chartData1}
              options={chartOptions1}
              className={styles.doughnutChart}
            />
            <br />
            <div className={styles.filterColumn}>
              <h3 className="montserrat">
                Proportion: {corporatePercentage.proportion}%
              </h3>
              <br />
              <h3 className="montserrat">
                Approved: {corporatePercentage.approved}%
              </h3>
              <br />
              <h3 className="montserrat">
                Rejected: {corporatePercentage.rejected}%
              </h3>
              <br />
              <h3 className="montserrat">
                Unverified: {corporatePercentage.unverified}%
              </h3>
              <br />
              <h3 className="montserrat">
                Archived: {corporatePercentage.archived}%
              </h3>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default JobStatisticsModal;
