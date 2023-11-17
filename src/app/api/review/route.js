import { NextResponse } from "next/server";

export const getReviews = async (userId, role, accessToken) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/review/retrieve/${userId}/${role}`,
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
        console.log(
          "Encountered the following error when retrieving review" +
            response.message
        );
        return NextResponse.json(
          { error: response.message },
          { status: response.statusCode }
        );
      }
    } catch (error) {
      console.log(
        "Encountered an unexpected problem when retrieving review",
        error.message
      );
    }
  };