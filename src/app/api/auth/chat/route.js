export const getAllUserChats = async (userId) => {
  try {
    const res = await fetch(`http://localhost:8080/chat/user-chats/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message);
    }
    return await res.json();
  } catch (error) {
    console.log("There was a problem fetching the chats", error);
    throw error;
  }
};

export const getOneUserChat = async (chatId) => {
  try {
    const res = await fetch(`http://localhost:8080/chat/${chatId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
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
    console.log("There was a problem fetching chat messages for this chat", error);
    throw error;
  }
};

export const createNewChatByRecruiter = async (newChat) => {
  try {
    const res = await fetch(`http://localhost:8080/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newChat),
      cache: "no-store",
    });
    if (!res.ok) {
      const errorData = await res.json();
      console.log(errorData);
      throw new Error(errorData.message);
    }
    return await res.json();
  } catch (error) {
    console.log("There was a problem creating this chat", error);
    throw error;
  }
};
