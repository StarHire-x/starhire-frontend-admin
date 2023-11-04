export const getAllEventListings = async (
    accessToken
  ) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/event-listing`,
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

  export const getAEventListing = async (
    eventId,
    accessToken
  ) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/event-listing/${eventId}`,
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