import axios from 'axios';

export const getUserFromEnedis = (accessToken, usagePointId) => {
  const url = `https://gw.hml.enedis.fr/v3/customers/identity?usage_point_id=${usagePointId}`;
  const options = {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  };
  return axios.get(url, options);
};
