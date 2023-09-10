export const getUserChats = async (userId) => {
  try {
    const res = await fetch("http://localhost:8080/chat", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message);
    }
    return await res.json();
  } catch (error) {
    console.log("There was a problem fetching the users", error);
    throw error;
  }
};
