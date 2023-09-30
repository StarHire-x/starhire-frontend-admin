


import React from 'react';
import { useRouter } from 'next/router';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import Link from 'next/link';
import Enums from '@/common/enums/enums';



export default function JobListingsTable({ jobListings, router }) {

  const dataTableStyles = {
    border: '1px solid #ddd',
    borderRadius: '5px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    padding: '10px',
  };

  const headerStyles = {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    padding: '8px',
  };

  const containerStyles = {
    height: '100vh', 
    overflowY: 'auto', 
  };

  // Function to format date in "day-month-year" format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  
  const handleViewDetails = (rowData) => {
    alert(rowData);
  };

  return (
    <div style={containerStyles}>
      <DataTable
        value={jobListings}
        style={dataTableStyles}
        headerStyle={headerStyles}
      >
        <Column field="jobListingId" header="Listing ID"></Column>
        <Column field="title" header="Title"></Column>
        <Column
          field="corporate.userName" 
          header="Corporate Name"
        />
        <Column field="jobLocation" header="Job Location"></Column>
        <Column
          field="listingDate"
          header="List Date"
          body={(rowData) => formatDate(rowData.listingDate)} // Format the date
        ></Column>

        {/*}
        <Column
          field="jobStartDate"
          header="Job Start Date"
          body={(rowData) => formatDate(rowData.listingDate)} // Format the date
        ></Column>
        */}

        <Column
          field="jobListingStatus"
          header="Job Listing Status"
          body={(rowData) => (
            <span
              style={{
                color: rowData.jobListingStatus === Enums.ACTIVE ? "green" : "red",
              }}
            >
              {rowData.jobListingStatus}
            </span>
          )}
        ></Column>

        <Column
          body={(rowData) => (
            <Button
              label="View More Details"
            />
            /*
            <Link href="/dashboard">
              <Button
                label="View More Details"
                onClick={() => handleViewDetails(rowData.corporate.userName)}
              />
            </Link>
            */
          )}
        ></Column>
      </DataTable>
    </div>
  );
}
