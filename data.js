import axios from 'axios';
import querystring from 'querystring';

const jwtSecret = process.env.JWT_SECRET;

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
      if (r.status === 200) return r.data;
    })
    .then(data => {
      const graphData = data.usage_point.map(({ meter_reading }) => {
        const d = {};
        const { start, end, reading_type } = meter_reading;
        d.metadata = {
          start,
          end,
          reading_type,
        };

        d.graph_data = meter_reading.interval_block.map(point => {
          const timeStamp = new Date(start);
          timeStamp.setSeconds(
            timeStamp.getSeconds() + reading_type.interval_length * point.reading_number,
          );
          return { x: timeStamp, y: point.value };
        });
        return d;
      });

      res.send(graphData);
    })
    .catch(err => {
      if (err.response && err.response.status === 403)
        return res.send({ message: 'Le client est inconnu ou non habilité' });
      res.send(err);
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
