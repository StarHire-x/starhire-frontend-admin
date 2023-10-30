export const getAllCommissionRates = async (accessToken) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/commission-rate`,
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
    console.log("There was a problem fetching the commission rates", error);
    throw error;
  }
};

export const updateCommissionRate = async (request, id, accessToken) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/commission-rate/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(request),
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message);
    }
  } catch (error) {
    console.log("There was a problem updating the forum category", error);
    throw error;
  }
};


export const getAllYetCommissionedSuccessfulJobAppsByRecruiterId = async (userId, accessToken) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/job-application/yet-commission/${userId}`,
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
    console.log("There was a problem fetching the yet commissioned successful job apps", error);
    throw error;
  }
};


export const createCommission = async (request, accessToken) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/commission`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(request),
      }
    );
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message);
    }
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

export const getAllCommissionsByRecruiterIdAndAdminId= async (recruiterId, adminId, accessToken) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/commission/recruiter/${recruiterId}/admin/${adminId}`,
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
    console.log("There was a problem fetching the commissions by recruiter id and admin id", error);
    throw error;
  }
};