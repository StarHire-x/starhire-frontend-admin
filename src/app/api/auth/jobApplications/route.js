export const viewAllJobApplicationsByJobListingId = async (
  jobListingId,
  accessToken
) => {
  try {
    const res = await fetch(
      `http://localhost:8080/job-application/job-listing/${jobListingId}`,
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
    console.log("There was a problem fetching the job applications", error);
    throw error;
  }
};

export const updateJobApplicationStatus = async (request, id, accessToken) => {
  try {
    const res = await fetch(`http://localhost:8080/job-application/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(request),
    });

    if (res.ok) {
      return;
    } else {
      throw new Error(errorData.message || "An error occurred");
    }
  } catch (error) {
    console.log("There was a problem updating the job application", error);
    throw error;
  }
};
