import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import HumanIcon from '../../../public/icon.png';
import styles from './invoiceAdminModal.module.css';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Chart } from 'primereact/chart';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { getRecrutierJobApplicationStatistics } from '@/app/api/auth/user/route';
import { fetchData } from 'next-auth/client/_utils';
import { getCorporatesInvoicesStatistics } from '@/app/api/invoice/route';

const InvoiceAdminModal = ({ accessToken }) => {
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  const [overallStats, setOverallStats] = useState({});
  const [invoices, setInvoices] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('All Corporates');
  const [filterOptions, setFilterOptions] = useState([
    {
      label: 'All Corporates',
      value: 'All Corporates',
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const information = await getCorporatesInvoicesStatistics(accessToken);

        let corporateOptions = information.formattedResponse.map((label) => ({
          label: label.companyName,
          value: label.corporateId,
        }));

        setFilterOptions([
          {
            label: 'All Corporates',
            value: 'All Corporates',
          },
          ...corporateOptions,
        ]);

        if (selectedFilter) {
          await filterData(information);
        }
      } catch (error) {
        console.error('An error occurred while fetching the data', error);
      }
    };
    const filterData = async (information) => {
      if (selectedFilter === 'All Corporates') {
        // Flatten the array of invoice arrays
        const allData = information.formattedResponse.flatMap(
          (item) => item.invoices
        );
        setInvoices(allData);
        setOverallStats(information.overallStatistics);
      } else {
        // Use the filter to find the right corporate data
        const filteredData = information.formattedResponse.find(
          (item) => item.corporateId === selectedFilter
        );

        // Make sure filteredData exists before trying to access its properties
        if (filteredData) {
          setInvoices(filteredData.invoices || []);
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
        <h2 style={{ margin: '10px 10px 10px 10px' }}>Invoice Analytics</h2>
        <Dropdown
          style={{ margin: '10px 10px 10px 10px' }}
          value={selectedFilter}
          options={filterOptions}
          onChange={(e) => setSelectedFilter(e.value)}
          placeholder="Select Corporate"
        />
      </div>
    );
  };

  const corporateBodyTemplate = (rowData) => {
    const userName = rowData.companyName;
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

  const invoiceDateBodyTemplate = (rowData) => {
    return formatDate(rowData.invoiceDate);
  };

  const dueDateBodyTemplate = (rowData) => {
    return formatDate(rowData.dueDate);
  };

  const fileButtonTemplate = (rowData) => {
    return (
      <Button
        type="button"
        icon="pi pi-file-pdf"
        onClick={(e) => {
          e.stopPropagation();
          window.open(rowData.invoiceLink, '_blank');
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
        value={rowData.invoiceStatus}
        severity={getStatus(rowData.invoiceStatus)}
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
                  {overallStats.notPaidCount} Invoice Not Paid
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
                  {overallStats.indicatedPaidCount} Invoice Indicated Paid
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
                  {overallStats.confirmedPaidCount} Invoice Confirm Paid
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
              value={invoices}
              showGridlines
              tableStyle={{ minWidth: '50rem' }}
              rows={5}
              paginator
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              emptyMessage="No invoice found."
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            >
              <Column
                field="invoiceId"
                header="Id"
                style={{
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  width: '10px',
                }}
                sortable
              ></Column>
              <Column
                field="corporateId"
                header="Company"
                sortable
                style={{
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  width: '200px',
                }}
                body={corporateBodyTemplate}
              ></Column>
              <Column
                field="invoiceDate"
                header="Invoice Date"
                style={{
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  width: '120px',
                }}
                body={invoiceDateBodyTemplate}
                sortable
              ></Column>
              <Column
                field="dueDate"
                header="Due Date"
                style={{
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  width: '120px',
                }}
                body={dueDateBodyTemplate}
                sortable
              ></Column>
              <Column
                field="invoiceStatus"
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
                field="invoiceLink"
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

export default InvoiceAdminModal;
