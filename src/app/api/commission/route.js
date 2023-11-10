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

export const getAllYetCommissionedSuccessfulJobAppsByRecruiterId = async (
  userId,
  accessToken
) => {
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
    console.log(
      "There was a problem fetching the yet commissioned successful job apps",
      error
    );
    throw error;
  }
};

export const createCommission = async (request, accessToken) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/commission`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message);
    }
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

export const getAllCommissionsByRecruiterIdAndAdminId = async (
  recruiterId,
  adminId,
  accessToken
) => {
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
    console.log(
      "There was a problem fetching the commissions by recruiter id and admin id",
      error
    );
    throw error;
  }
};

export const getAllCommissionsByRecruiterId = async (
  recruiterId,
  accessToken
) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/commission/recruiter/${recruiterId}`,
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
    console.log(
      "There was a problem fetching the commissions by recruiter id",
      error
    );
    throw error;
  }
};

export const deleteCommission = async (id, accessToken) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/commission/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
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

export const getRecruiterCommissionsStatistics = async (accessToken) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/commission/allRecruiter`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );
    const response = await res.json();
    if (response.statusCode === 200) {
      return response.data;
    } else {
      return NextResponse.json(
        { error: response.message },
        { status: response.statusCode }
      );
    }
  } catch (error) {
    console.log("There was a problem fetching the data", error.message);
  }
};

export const updateCommissionStatus = async (
  request,
  commissionId,
  accessToken
) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/commission/${commissionId}`,
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
    console.log("There was a problem updating the commission status", error);
    throw error;
  }
};
