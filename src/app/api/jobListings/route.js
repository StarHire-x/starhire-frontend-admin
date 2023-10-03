export const viewAllJobListings = async (accessToken) => {
  try {
    const res = await fetch(`http://localhost:8080/job-listing`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.log(errorData);
      throw new Error(errorData.message);
    }
    return await res.json();
  } catch (error) {
    console.log("There was a problem fetching all job listings", error);
    throw error;
  }
};

export const viewOneJobListing = async (jobListingId, accessToken) => {
  try {
    const res = await fetch(
      `http://localhost:8080/job-listing/${jobListingId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      console.log(errorData);
      throw new Error(errorData.message);
    }
    return await res.json();
  } catch (error) {
    console.log("There was a problem fetching single job listing", error);
    throw error;
  }
};

export const updateJobListing = async (accessToken, request, id) => {
  try {
    const res = await fetch(`http://localhost:8080/job-listing/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.log(errorData);
      throw new Error(errorData.message);
    }
    return await res.json();
  } catch (error) {
    console.log("There was a problem updating job listing", error);
    throw error;
  }
};

export const assignJobListing = async ( jobSeekerId, jobListingId, recruiterId, accessToken) => {
  try {
    const res = await fetch(
      `http://localhost:8080/job-listing/assignJobListing/${jobSeekerId}/${jobListingId}/${recruiterId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.log(errorData);
      throw new Error(errorData.message);
    }
    return await res.json();
  } catch (error) {
    console.log("There was a problem assigning job listing to job seekers and assigning job listing to job seekers", error);
    throw error;
  }
};

export const informJobListingStatus = async (jobListingId, accessToken) => {
  try {
    const res = await fetch(`http://localhost:8080/email/inform-status/${jobListingId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      /*
      body: JSON.stringify({
        jobListingId: jobListingId, 
      }),
      */

    });

    if (!res.ok) {
      const errorData = await res.json();
      console.log(errorData);
      throw new Error(errorData.message);
    }

    return await res.json();
  } catch (error) {
    console.log("There was a problem", error);
    throw error;
  }
};
