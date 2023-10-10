export const getAllForumCategories = async (accessToken) => {
  try {
    const res = await fetch(`http://localhost:8080/forum-categories`, {
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
    console.log("There was a problem fetching the forum categories", error);
    throw error;
  }
};

export const updateForumCategory = async (request, id, accessToken) => {
  try {
    const res = await fetch(`http://localhost:8080/forum-categories/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(request),
    });

    if (res.ok) {
      return;
    } else {
      throw new Error(errorData.message || "An error occurred");
    }
  } catch (error) {
    console.log("There was a problem updating the forum category", error);
    throw error;
  }
};
