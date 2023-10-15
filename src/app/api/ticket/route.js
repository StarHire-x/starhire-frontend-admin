export const viewAllTickets = async (accessToken) => {
  try {
    const res = await fetch(`http://localhost:8080/ticket`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.log(errorData);
      throw new Error(errorData.message);
    }
    return await res.json();
  } catch (error) {
    console.log('There was a problem fetching all tickets', error);
    throw error;
  }
};

export const viewOneTicket = async (ticketId, accessToken) => {
  try {
    const res = await fetch(`http://localhost:8080/ticket/${ticketId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.log(errorData);
      throw new Error(errorData.message);
    }
    return await res.json();
  } catch (error) {
    console.log('There was a problem fetching single ticket', error);
    throw error;
  }
};

export const resolveTicket = async (ticketId, accessToken) => {
  try {
    const res = await fetch(
      `http://localhost:8080/ticket/resolve/${ticketId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      console.log(errorData);
      throw new Error(errorData.message);
    }

    return await res.json();
  } catch (error) {
    console.log('There was a problem resolving the ticket', error);
    throw error;
  }
};
