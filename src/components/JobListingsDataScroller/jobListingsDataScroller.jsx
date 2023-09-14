"use client";
import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { DataScroller } from 'primereact/datascroller';
import { Rating } from 'primereact/rating';
import { Tag } from 'primereact/tag';
import JobListings from '@/app/jobListings/page';



export default function JobListingsDataScroller( { jobListings }) {


    const itemTemplate = (jobListings ) => {
        return (
          <div className="col-12">
            <div className="flex flex-column xl:flex-row xl:align-items-start p-4 gap-4">


              <div className="flex flex-column lg:flex-row justify-content-between align-items-center xl:align-items-start lg:flex-1 gap-4">
                <div className="flex flex-column align-items-center lg:align-items-start gap-3">
                  <div className="flex flex-column gap-1">
                    <div className="text-2xl font-bold text-900">
                      {jobListings.title}
                    </div>
                    <div className="text-700">{jobListings.title}</div>
                  </div>
                  <div className="flex flex-column gap-2">
                  
                    <span className="flex align-items-center gap-2">
                      <i className="pi pi-tag product-category-icon"></i>
                      <span className="font-semibold">{jobListings.title}</span>
                    </span>
                  </div>
                </div>
                <div className="flex flex-row lg:flex-column align-items-center lg:align-items-end gap-4 lg:gap-2">
                  <span className="text-2xl font-semibold">
                    ${jobListings.title}
                  </span>
                  <Button
                    icon="pi pi-shopping-cart"
                    label="View More Information"
                  ></Button>
                </div>
              </div>
            </div>
          </div>
        );
    };

    return (
        <div className="card">
            <DataScroller value={jobListings} itemTemplate={itemTemplate} rows={5} inline scrollHeight="500px" header="Scroll Down to see more Job Listings" />
        </div>
    )
}