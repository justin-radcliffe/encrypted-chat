const clients = [];
let nextClient = 0;

export const clientJoin = () => {
  return {
    messenger: clients.push(++nextClient) < 3,
    id: nextClient,
  };
};
