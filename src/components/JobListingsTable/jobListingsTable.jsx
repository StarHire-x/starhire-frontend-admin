import React from 'react';
import { useRouter } from 'next/router';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import Link from 'next/link';



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

  // Navigate to another page when the button is clicked
  const handleViewDetails = (rowData) => {
    alert(rowData);
    router.push(`/dashboard`); 
  };

  return (
    <div style={containerStyles}>
      <DataTable
        value={jobListings}
        style={dataTableStyles}
        headerStyle={headerStyles}
      >
        <Column field="jobListingId" header="Job Listing ID"></Column>
        <Column field="title" header="Title"></Column>
        <Column field="description" header="Description"></Column>
        <Column field="jobLocation" header="Job Location"></Column>
        <Column
          field="listingDate"
          header="Listing Date"
          body={(rowData) => formatDate(rowData.listingDate)} // Format the date
        ></Column>
        <Column field="averageSalary" header="Average Salary"></Column>
        <Column
          field="jobStartDate"
          header="Listing Date"
          body={(rowData) => formatDate(rowData.listingDate)} // Format the date
        ></Column>

        <Column
          field="jobListingStatus"
          header="Job Listing Status"
          body={(rowData) => (
            <span
              style={{
                color: rowData.jobListingStatus === "Active" ? "green" : "red",
              }}
            >
              {rowData.jobListingStatus}
            </span>
          )}
        ></Column>

        <Column
          body={(rowData) => (
            <Link href="/dashboard">
              <Button
                label="View More Details"
                onClick={() => handleViewDetails(rowData.jobListingId)}
              />
            </Link>
          )}
        ></Column>
      </DataTable>
    </div>
  );
}
