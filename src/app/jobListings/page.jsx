"use client"

import React, { useState, useEffect } from 'react';
import DataScrollerCom from '@/components/DataScrollerCom/DataScrollerCom';

export default function JobListings() {
    const [jobListings, setJobListings] = useState([]);

    useEffect(() => {
        fetch(`http://localhost:8080/job-listing`)
            .then((response) => response.json())
            .then((data) => {
                setJobListings(data); 
                console.log(data);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }, []);

    return (
        <div className="card">
            <DataScrollerCom jobListings={jobListings} /> 
        </div>
    );
}
