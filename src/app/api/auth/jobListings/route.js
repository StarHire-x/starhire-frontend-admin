
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
  } catch(error) {
    console.log(
      "There was a problem fetching chat messages for this chat",
      error
    );
    throw error;
  }
};

  
  