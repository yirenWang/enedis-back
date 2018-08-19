import axios from 'axios';
import querystring from 'querystring';
import { getUserByEnedisId } from './db/user';
import { getDataForUserByType } from './db/data';
import _ from 'lodash';

const jwtSecret = process.env.JWT_SECRET;

const getUserAccessToken = id => {
  return getUserByEnedisId(id).then(user => {
    if (user.expiredAt < new Date()) {
      // get new accessToken
    }
    return user.accessToken;
  });
};

const formatDataFromEnedis = data => {
  const graphData = data.usage_point.map(({ meter_reading }) => {
    const { start, end, reading_type } = meter_reading;
    const d = {};

    d.metadata = {
      start,
      end,
      unit: reading_type.unit,
    };

    d.graph_data = meter_reading.interval_block.map(point => {
      const timestamp = new Date(start);
      timestamp.setSeconds(
        timestamp.getSeconds() + reading_type.interval_length * (point.reading_number - 1),
      );
      return { timestamp, value: point.value };
    });
    return d;
  });

  return graphData;
};

const createDateStrings = () => {
  const end = new Date();
  end.setDate(end.getDate() - 5);
  return { start: new Date().toISOString(), end: end.toISOString() };
};

const getDataFromEnedis = (URLType, req, res) => {
  const url =
    `https://gw.prd.api.enedis.fr/v3/metering_data/${URLType}` +
    '?' +
    `start=${createDateStrings().start}` +
    '&' +
    `end=${createDateStrings().end}`;

  getUserAccessToken(req.user.id).then(accessToken => {
    const options = {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${process.env.ACCESS_TOKEN || accessToken}`,
      },
    };

    axios
      .get(url, options)
      .then(r => {
        if (r.status === 200) return r.data;
      })
      .then(data => {
        const graphData = formatDataFromEnedis(data);
        // Save data to database
        createDataForUser(
          req.user.id,
          graphData.graph_data,
          data.metadata.reading_type.unit,
          _.camelCase(URLType),
        );
        res.send(graphData);
      })
      .catch(err => {
        if (err.response && err.response.status === 403)
          return res.send({ message: 'Le client est inconnu ou non habilité' });
        res.send(err);
      });
  });
};

const formatDataFromDB = data => {
  const graph_data = data.map(d => ({
    timestamp: d.timestamp,
    value: d.value,
  }));
  const metadata = {
    start: data[0].timestamp,
    end: data[data.length - 1].timestamp,
    unit: data[0].unit,
  };
  return { graph_data, metadata };
};

export const getConsumptionLoadCurve = (req, res) => {
  // Is data in bdd
  getDataForUserByType(req.user.id, 'ConsumptionLoadCurve').then(data => {
    if (data.length === 0) {
      // Data is not in bdd
      getDataFromEnedis('consumption_load_curve', req, res);
    } else {
      res.send(formatDataFromDB(data));
    }
  });
};

export const getConsumptionMaxPower = (req, res) => {
  // Is data in bdd
  getDataForUserByType(req.user.id, 'ConsumptionMaxPower').then(data => {
    if (data.length === 0) {
      // Data is not in bdd
      getDataFromEnedis('consumption_max_power', req, res);
    } else {
      res.send(formatDataFromDB(data));
    }
  });
};

export const getDailyConsumption = (req, res) => {
  // Is data in bdd
  getDataForUserByType(req.user.id, 'DailyConsumption').then(data => {
    if (data.length === 0) {
      // Data is not in bdd
      getDataFromEnedis('daily_consumption', req, res);
    } else {
      res.send(formatDataFromDB(data));
    }
  });
};

export const getDailyProduction = (req, res) => {
  // Is data in bdd
  getDataForUserByType(req.user.id, 'DailyProduction').then(data => {
    if (data.length === 0) {
      // Data is not in bdd
      getDataFromEnedis('daily_production', req, res);
    } else {
      res.send(formatDataFromDB(data));
    }
  });
};
