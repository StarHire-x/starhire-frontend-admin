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
