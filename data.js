import axios from 'axios';
import querystring from 'querystring';

const jwtSecret = process.env.JWT_SECRET;
/*
    .then(data => {
      // get user
      return axios.get('https://gw.hml.api.enedis.fr/v3/customers', {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${data.access_token}`,
      });
    })
    .then(res => {
      if (res.status === 200) return res.data;
      throw new Error(res.status);
    })
    .then(data => console.log(data)) */

export const getConsumptionLoadCurve = (req, res) => {
  const url =
    `https://gw.prd.api.enedis.fr/v3/metering_data/consumption_load_curve` +
    '?' +
    `start=${req.query.start}` +
    '&' +
    `end=${req.query.end}`;

  const options = {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.ACCESS_TOKEN || req.user.accessToken}`,
    },
  };

  axios
    .get(url, options)
    .then(r => {
      console.log(r);
      if (r.status === 200) return res.send(r.data);
    })
    .catch(err => {
      if (err.response.status === 403)
        return res.send({ message: 'Le client est inconnu ou non habilité' });
      res.send({ status: err.response.status, message: err.response.statusText });
    });
};

export const getConsumptionMaxPower = (req, res) => {
  const url =
    `https://gw.prd.api.enedis.fr/v3/metering_data/consumption_max_power` +
    '?' +
    `start=${req.query.start}` +
    '&' +
    `end=${req.query.end}`;

  const options = {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.ACCESS_TOKEN || req.user.accessToken}`,
    },
  };

  axios
    .get(url, options)
    .then(r => {
      console.log(r);
      if (r.status === 200) return res.send(r.data);
    })
    .catch(err => {
      if (err.response.status === 403)
        return res.send({ message: 'Le client est inconnu ou non habilité' });
      res.send({ status: err.response.status, message: err.response.statusText });
    });
};

export const getDailyConsumption = (req, res) => {
  const url =
    `https://gw.prd.api.enedis.fr/v3/metering_data/daily_consumption` +
    '?' +
    `start=${req.query.start}` +
    '&' +
    `end=${req.query.end}`;

  const options = {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.ACCESS_TOKEN || req.user.accessToken}`,
    },
  };

  axios
    .get(url, options)
    .then(r => {
      console.log(r);
      if (r.status === 200) return res.send(r.data);
    })
    .catch(err => {
      if (err.response.status === 403)
        return res.send({ message: 'Le client est inconnu ou non habilité' });
      res.send({ status: err.response.status, message: err.response.statusText });
    });
};

export const getDailyProduction = (req, res) => {
  const url =
    `https://gw.prd.api.enedis.fr/v3/metering_data/daily_production` +
    '?' +
    `start=${req.query.start}` +
    '&' +
    `end=${req.query.end}`;

  const options = {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.ACCESS_TOKEN || req.user.accessToken}`,
    },
  };

  axios
    .get(url, options)
    .then(r => {
      console.log(r);
      if (r.status === 200) return res.send(r.data);
    })
    .catch(err => {
      if (err.response.status === 403)
        return res.send({ message: 'Le client est inconnu ou non habilité' });
      res.send({ status: err.response.status, message: err.response.statusText });
    });
};
