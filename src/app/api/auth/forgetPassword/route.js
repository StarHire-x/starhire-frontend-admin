const fetchUserData = async (email, role) => {
  const url = `http://localhost:8080/users/find?email=${email}&role=${role}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  const responseBody = await response.json();

  if (responseBody.statusCode === 404) {
    throw new Error(responseBody.message || "An error occurred");
  }
  return responseBody;
};

export const forgetPassword = async (email, role) => {
  try {
    const userData = await fetchUserData(email, role);

    const token = Math.random().toString(36).substring(2, 15);
    localStorage.setItem("passwordResetToken", token);

    const passwordResetExpire = Date.now() + 3600000;
    localStorage.setItem("passwordResetExpire", passwordResetExpire.toString());

    localStorage.setItem("resetEmail", userData.email);
    localStorage.setItem("role", userData.role);
    localStorage.setItem("userId", userData.userId);

    const input = {
      tokenId: token,
      emailAddress: userData.email,
      role: userData.role,
    };

    return await sendEmail(input);
  } catch (error) {
    throw new Error(error.message || "An unexpected error occurred");
  }
};

export const sendEmail = async (request) => {
  try {
    const res = await fetch(`http://localhost:8080/email/reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const errorMessage = `Error: ${res.status} - ${res.statusText}`;
      throw new Error(errorMessage);
    }
    return res.json();
  } catch (err) {
    return new Error(error.message || "An unexpected error occurred");
  }
};

export const updateUserPassword = async (request, id) => {
  try {
    const res = await fetch(`http://localhost:8080/users/reset/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (res.ok) {
      return;
    } else {
      throw new Error(errorData.message || "An error occurred");
    }
  } catch (error) {
    console.log("There was a problem fetching the users", error);
    throw error;
  }
};
