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
      return await res.json();
    } catch (error) {
      console.log("There was a problem fetching all Promotion Request", error);
      throw error;
    }
  };

  export const getCorporateNextBillingCycleBySubID = async (id, accessToken) => {
    try {
      console.log("I AM HERE");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/payment/billing-cycle-details/${id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          cache: 'no-store',
        }
      );
  
      const response = await res.json();
      console.log(response);
      if (response.statusCode === 200) {
        console.log(response.data);
        return await response.data;
      } else {
        throw new Error(response.message || 'An error occurred');
      }
    } catch (error) {
      console.log('There was a problem fetching the Bill cycle', error);
      throw error;
    }
  };