export const forgetPassword = async (email, role) => {
  try {
    const res = await fetch(
      `http://localhost:8080/users/find?email=${email}&role=${role}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );
    
    const responseBody = await res.json();
    if(responseBody.statusCode === 200) {
      const token = Math.random().toString(36).substring(2, 15);
      localStorage.setItem("passwordResetToken", token);
      const passwordResetExpire = Date.now() + 3600000;
      localStorage.setItem(
        "passwordResetExpire",
        passwordResetExpire.toString()
      );
      const resetEmail = responseBody.data.email;
      localStorage.setItem("resetEmail", resetEmail);
      localStorage.setItem("role", responseBody.data.role);
      localStorage.setItem("userId", responseBody.data.userId);

      const input = {
        tokenId: token,
        emailAddress: resetEmail,
        role: responseBody.data.role,
      };
      return await sendEmail(input);
    } else {
      throw new Error("No such user present!");
    }
  } catch (err) {
    throw new Error("No such user present!!!");
  }
};

export const sendEmail = async (request) => {
  try {
    const res = await fetch("http://localhost:8080/email/reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (res.ok) {
      const result = await res.json(); // assuming server responds with json
      return result;
    } else {
      // Return or throw an error if the response from the server is not 2xx
      throw new Error(`Server responded with status: ${res.status}`);
    }
  } catch (err) {
    throw new Error(`Error in sending email: ${err.message}`);
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
    return await res.json();
  } catch (error) {
    console.log("There was a problem fetching the users", error);
    throw error;
  }
};