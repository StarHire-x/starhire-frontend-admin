// export const getAllCorporates = async (accessToken) => {
//   try {
//     const res = await fetch(
//       `${process.env.NEXT_PUBLIC_BASE_URL}/corporate/all`,
//       {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${accessToken}`,
//         },
//         cache: "no-store",
//       }
//     );
//     if (!res.ok) {
//       const errorData = await res.json();
//       console.log(errorData);
//       throw new Error(errorData.message);
//     }
//     return await res.json();
//   } catch (error) {
//     console.log("There was a problem fetching the corporate users", error);
//     throw error;
//   }
// };

// export const update = async (request, id, accessToken) => {
//   try {
//     const res = await fetch(
//       `${process.env.NEXT_PUBLIC_BASE_URL}/forum-categories/${id}`,
//       {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${accessToken}`,
//         },
//         body: JSON.stringify(request),
//       }
//     );

//     if (!res.ok) {
//       const errorData = await res.json();
//       throw new Error(errorData.message);
//     }
//   } catch (error) {
//     console.log("There was a problem updating the forum category", error);
//     throw error;
//   }
// };

// export const add = async (request, accessToken) => {
//   try {
//     const res = await fetch(
//       `${process.env.NEXT_PUBLIC_BASE_URL}/forum-categories`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${accessToken}`,
//         },
//         body: JSON.stringify(request),
//       }
//     );
//     if (!res.ok) {
//       const errorData = await res.json();
//       throw new Error(errorData.message);
//     }
//   } catch (error) {
//     console.log(error.message);
//     throw error;
//   }
// };
