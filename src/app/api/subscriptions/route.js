export const viewAllPremiumUsers = async (accessToken) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/corporate/premium-users`, {
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
      //console.log(await res.json());
      return await res.json();
    } catch (error) {
      console.log("There was a problem fetching all Promotion Request", error);
      throw error;
    }
  };