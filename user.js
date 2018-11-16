const getUserFromEnedis = accessToken => {
  const url = 'https://gw.hml.enedis.fr/v3/customers/identity';
  const options = {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  };
  return axios.get(url, options);
};
