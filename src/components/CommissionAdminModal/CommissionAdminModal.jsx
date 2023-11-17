import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import HumanIcon from '../../../public/icon.png';
import styles from './commissionAdminModal.module.css';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Chart } from 'primereact/chart';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { getRecrutierJobApplicationStatistics } from '@/app/api/auth/user/route';
import { fetchData } from 'next-auth/client/_utils';
import { getRecruiterCommissionsStatistics } from '@/app/api/commission/route';

const CommissionAdminModal = ({ accessToken }) => {
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  const [overallStats, setOverallStats] = useState({});
  const [commissions, setCommissions] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('All Recruiters');
  const [filterOptions, setFilterOptions] = useState([
    {
      label: 'All Recruiters',
      value: 'All Recruiters',
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const information = await getRecruiterCommissionsStatistics(
          accessToken
        );

        let recruiterOptions = information.formattedResponse.map((label) => ({
          label: label.recruiterName,
          value: label.recruiterId,
        }));

        setFilterOptions([
          {
            label: 'All Recruiters',
            value: 'All Recruiters',
          },
          ...recruiterOptions,
        ]);

        if (selectedFilter) {
          await filterData(information);
        }
      } catch (error) {
        console.error('An error occurred while fetching the data', error);
      }
    };
    const filterData = async (information) => {
      if (selectedFilter === 'All Recruiters') {
        // Flatten the array of commissions arrays
        const allData = information.formattedResponse.flatMap(
          (item) => item.commissions
        );
        setCommissions(allData);
        setOverallStats(information.overallStatistics);
      } else {
        // Use the filter to find the right recruiter data
        const filteredData = information.formattedResponse.find(
          (item) => item.recruiterId === selectedFilter
        );

        console.log(filteredData);

        // Make sure filteredData exists before trying to access its properties
        if (filteredData) {
          setCommissions(filteredData.commissions || []);
          setOverallStats(filteredData.statistics);
        }
      }
    };

    fetchData();
  }, [accessToken, selectedFilter]);

  useEffect(() => {
    const documentStyle = getComputedStyle(document.documentElement);
    const data = {
      labels: ['Not Paid', 'Indicated Paid', 'Confirm Paid'],
      datasets: [
        {
          data: [
            overallStats.notPaidCount,
            overallStats.indicatedPaidCount,
            overallStats.confirmedPaidCount,
          ],
          backgroundColor: [
            documentStyle.getPropertyValue('--red-500'),
            documentStyle.getPropertyValue('--yellow-500'),
            documentStyle.getPropertyValue('--green-500'),
          ],
          hoverBackgroundColor: [
            documentStyle.getPropertyValue('--red-400'),
            documentStyle.getPropertyValue('--yellow-400'),
            documentStyle.getPropertyValue('--green-400'),
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
  }, [overallStats]);

  const cardHeader = () => {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 style={{ margin: '10px 10px 10px 10px' }}>Commission Analytics</h2>
        <Dropdown
          style={{ margin: '10px 10px 10px 10px' }}
          value={selectedFilter}
          options={filterOptions}
          onChange={(e) => setSelectedFilter(e.value)}
          placeholder="Select Recruiter"
        />
      </div>
    );
  };

  const recruiterBodyTemplate = (rowData) => {
    const userName = rowData.recruiterName;
    const avatar = rowData.profilePictureUrl;

    return (
      <div className={styles.imageContainer}>
        {avatar !== '' ? (
          <img
            alt={avatar}
            src={avatar}
            className={styles.avatarImageContainer}
          />
        ) : (
          <Image
            src={HumanIcon}
            alt="Icon"
            className={styles.avatarImageContainer}
          />
        )}
        <span>{userName}</span>
      </div>
    );
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };

  const commissionDateBodyTemplate = (rowData) => {
    return formatDate(rowData.commissionDate);
  };

  const amountTemplate = (rowData) => {
    return `$${rowData.commissionAmount.toFixed(2)}`;
  };

  const fileButtonTemplate = (rowData) => {
    return (
      <Button
        type="button"
        icon="pi pi-file-pdf"
        onClick={(e) => {
          e.stopPropagation();
          window.open(rowData.paymentDocumentURL, '_blank');
        }}
        className="p-button-rounded p-button-danger"
        aria-label="Open PDF"
      />
    );
  };

  const getStatus = (status) => {
    switch (status) {
      case 'Confirmed_Paid':
        return 'success';
      case 'Not_Paid':
        return 'danger';
      case 'Indicated_Paid':
        return 'info';
    }
  };

  const statusBodyTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.commissionStatus}
        severity={getStatus(rowData.commissionStatus)}
      />
    );
  };

  const chartDataNotEmpty =
    overallStats.confirmedPaidCount +
      overallStats.indicatedPaidCount +
      overallStats.notPaidCount !==
    0;

  return (
    <div className={styles.mainContainer}>
      <Card className={styles.customCardGraph} header={cardHeader}>
        <div className={styles.layout}>
          <div className={styles.cardColumnLeft}>
            <Card className={styles.customCard}>
              <div className={styles.cardLayout}>
                <h1 style={{ color: 'red' }}>${overallStats.notPaidSum}</h1>
                <br />
                <p style={{ color: 'red' }}>
                  {overallStats.notPaidCount} Commission Not Paid
                </p>
              </div>
            </Card>
            <Card className={styles.customCard}>
              <div className={styles.cardLayout}>
                <h1 style={{ color: 'orange' }}>
                  ${overallStats.indicatedPaidSum}
                </h1>
                <br />
                <p style={{ color: 'orange' }}>
                  {overallStats.indicatedPaidCount} Commission Indicated Paid
                </p>
              </div>
            </Card>
            <Card className={styles.customCard}>
              <div className={styles.cardLayout}>
                <h1 style={{ color: 'green' }}>
                  ${overallStats.confirmedPaidSum}
                </h1>
                <br />
                <p style={{ color: 'green' }}>
                  {overallStats.confirmedPaidCount} Commission Confirm Paid
                </p>
              </div>
            </Card>
          </div>
          <div className={styles.cardColumnRight}>
            <div>
              {chartDataNotEmpty && (
                <Chart
                  type="pie"
                  data={chartData}
                  options={chartOptions}
                  className="w-full md:w-30rem"
                />
              )}
              {!chartDataNotEmpty && (
                <h1 style={{ textAlign: 'justify' }}>No data available</h1>
              )}
            </div>
            <DataTable
              value={commissions}
              showGridlines
              tableStyle={{ minWidth: '50rem' }}
              rows={5}
              paginator
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              emptyMessage="No commission found."
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            >
              <Column
                field="commissionId"
                header="Id"
                style={{
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  width: '10px',
                }}
                sortable
              ></Column>
              <Column
                field="recruiterId"
                header="Recruiter"
                sortable
                style={{
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  width: '200px',
                }}
                body={recruiterBodyTemplate}
              ></Column>
              <Column
                field="commissionDate"
                header="Date"
                style={{
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  width: '100px',
                }}
                body={commissionDateBodyTemplate}
                sortable
              ></Column>
              <Column
                field="commissionAmount"
                header="Amount"
                style={{
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  width: '100px',
                }}
                body={amountTemplate}
                sortable
              ></Column>
              <Column
                field="commissionRate"
                header="Rate (%)"
                style={{
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  width: '10px',
                }}
                sortable
              ></Column>
              <Column
                field="commissionStatus"
                header="Status"
                style={{
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  width: '10px',
                }}
                sortable
                body={statusBodyTemplate}
              ></Column>
              <Column
                field="paymentDocumentURL"
                header="File"
                style={{
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  width: '10px',
                }}
                body={fileButtonTemplate}
              ></Column>
            </DataTable>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CommissionAdminModal;
