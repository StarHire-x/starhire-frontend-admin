import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export const hashing = async (password) => {
  return await bcrypt.hash(password, 5);
};

export const registerUser = async (request) => {
  try {
    const res = await fetch("${process.env.NEXT_PUBLIC_BASE_URL}/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(
        { error: errorData.message },
        { status: errorData.statusCode }
      );
      // throw new Error(errorData.message);
    }
    return await res;
  } catch (error) {
    console.log("There was a problem fetching the users", error);
    // throw error;
  }
};
