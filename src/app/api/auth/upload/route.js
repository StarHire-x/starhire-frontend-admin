export const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`http://localhost:8080/upload`, {
        method: "POST",
        body: formData, // You don't need the content-type header, browsers will automatically recognize the multipart form data
        cache: "no-store",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || "An error occurred during the file upload."
        );
      }
      const responseJson = await res.json();
      return responseJson;
    } catch (error) {
      console.log("There was a problem uploading the file", error);
      throw error;
    }
}