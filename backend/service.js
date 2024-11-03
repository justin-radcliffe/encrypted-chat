const clients = [];
let nextClient = 0;

/* Add a client to the list of clients */
export const clientJoin = () => {
  return {
    messenger: clients.push(++nextClient) < 3,
    id: nextClient,
  };
};
