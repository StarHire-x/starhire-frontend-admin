export const getUsers = async () => {
    try {
        const res = await fetch(
          `http://localhost:8080/users`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
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
}