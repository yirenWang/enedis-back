import axios from 'axios';

export const getUserFromEnedis = (accessToken, usagePointId) => {
  const url = `https://gw.hml.api.enedis.fr/v3/customers/identity?usage_point_id=${usagePointId}`;
  const options = {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  };
  // data is in the form of [{"customer": { "customer_id": "3000000", "identity": {"natural_person": {title, firstname, lastname} } } } ]
  return axios.get(url, options).then(res => res.data[0].customer);
};
