"use client"

import React, { useState, useEffect } from 'react';
import JobListingsDataScroller from '@/components/JobListingsDataScroller/jobListingsDataScroller';
import JobListingsTable from '@/components/JobListingsTable/jobListingsTable';
import { useRouter } from "next/router";
        

export default function JobListings() {
    //const router = useRouter();
    const [jobListings, setJobListings] = useState([]);


    useEffect(() => {
        fetch(`http://localhost:8080/job-listing`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                setJobListings(data);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }, []);

    return (
        <div className="card">
            <JobListingsTable jobListings={jobListings} /> 
        </div>

    );
}
