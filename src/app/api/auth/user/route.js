import { NextResponse } from "next/server";

export const createUser = async (userData) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "An error occurred");
    }
    return await response;
  } catch (error) {
    console.log("Encountered a problem when creating a new user", error);
    throw error;
  }
};

export const getUsersForChat = async (userId, accessToken) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/users/can-create-chat/${userId}`,
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
      throw new Error(errorData.message || "An error occurred");
    }
    // console.log(await res.json());
    return await res.json();
  } catch (error) {
    console.log("There was a problem fetching the users", error);
    throw error;
  }
};

export const getUsers = async (accessToken) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "An error occurred");
    }
    // console.log(await res.json());
    return await res.json();
  } catch (error) {
    console.log("There was a problem fetching the users", error);
    throw error;
  }
};

export const getAllJobSeekersWithSimilarityScore = async (
  accessToken,
  jobListingId
) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/job-seeker/similarity/${jobListingId}`,
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
      throw new Error(errorData.message || "An error occurred");
    }
    return await res.json();
  } catch (error) {
    console.log("There was a problem fetching the users", error);
    throw error;
  }
};

export const updateUser = async (request, id, accessToken) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(request),
    });

    const responseBody = await res.json();

    if (responseBody.statusCode === 200) {
      return responseBody;
    } else {
      throw new Error(errorData.message || "An error occurred");
    }
    return await res.json();
  } catch (error) {
    console.log("There was a problem fetching the users", error);
    throw error;
  }
};

export const deleteUser = async (request, id, accessToken) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/users/${id}?role=${request}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    console.log(res);
    if (res.ok) {
      return;
    } else {
      throw new Error(errorData.message || "An error occurred");
    }
    return await res.json();
  } catch (error) {
    console.log("There was a problem fetching the users", error);
    throw error;
  }
};

export const getUserByEmailRole = async (email, role) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/users/find?email=${email}&role=${role}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );
    const responseBody = await res.json();

    if (responseBody.statusCode === 404) {
      throw new Error(responseBody.message || "An error occurred");
    }
    return await responseBody;
  } catch (error) {
    console.log("There was a problem fetching the users", error);
    throw error;
  }
};

export const getUserByUserId = async (userId, role, accessToken) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/users/search?userId=${userId}&role=${role}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );
    const responseBody = await res.json();

    if (responseBody.statusCode === 404) {
      throw new Error(responseBody.message || "An error occurred");
    }
    return await responseBody;
  } catch (error) {
    console.log("There was a problem fetching the users", error);
    throw error;
  }
};

export const getAllCorporates = async (accessToken) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/corporate/all`,
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
    console.log("There was a problem fetching the corporate users", error);
    throw error;
  }
};

export const getCorporateDetails = async (userId, accessToken) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/corporate/${userId}`,
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
      return response;
    } else {
      return NextResponse.json(
        { error: response.message },
        { status: response.statusCode }
      );
    }
  } catch (error) {
    console.log("There was a problem fetching the users", error.message);
  }
};

export const getUserStatistics = async (accessToken) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/users/getStats`,
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
    console.log("There was a problem fetching the users", error.message);
  }
};

export const getUserBreakdown = async (accessToken) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/users/getBreakdown`,
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
    console.log("There was a problem fetching the users", error.message);
  }
};

export const getCorporateJobListingStatistics = async (accessToken) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/corporate/getStats`,
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
    console.log("There was a problem fetching the corproate job listings", error.message);
  }
};

export const getCorporateJobListingBreakdown = async (accessToken) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/corporate/getBreakdown`,
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
    console.log("There was a problem fetching the users", error.message);
  }
};
