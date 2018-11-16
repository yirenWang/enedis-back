import axios from 'axios';

export const getUserFromEnedis = (accessToken, usagePointId) => {
  const url = `https://gw.hml.api.enedis.fr/v3/customers/contact_data?usage_point_id=${usagePointId}`;
  const options = {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  };
  return axios.get(url, options);
};
