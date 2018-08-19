import axios from 'axios';
import querystring from 'querystring';
import { getUserByEnedisId } from './db/user';
import { getDataForUserByType, createDataForUser } from './db/data';
import _ from 'lodash';

const jwtSecret = process.env.JWT_SECRET;

const getUserAccessToken = id => {
  console.log(id);
  return getUserByEnedisId(id).then(user => {
    if (user) {
      if (user.expiredAt < new Date()) {
        // get new accessToken
      }
      return user.accessToken;
    }
    throw new Error('User not found');
  });
};

// gives
// [ {metadata, graph_data}, ... ]
const formatDataFromEnedis = data => {
  const graphData = data.usage_point.map(({ meter_reading }) => {
    const { start, end, reading_type, usage_point_id } = meter_reading;
    const d = {};

    d.metadata = {
      start,
      end,
      unit: reading_type.unit,
      usagePointId: usage_point_id,
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
  const start = new Date();
  start.setDate(start.getDate() - 5);
  return { end: new Date().toISOString(), start: start.toISOString() };
};

const getDataFromEnedis = (URLType, req, res) => {
  const url =
    `https://gw.prd.api.enedis.fr/v3/metering_data/${URLType}` +
    '?' +
    `start=${createDateStrings().start}` +
    '&' +
    `end=${createDateStrings().end}`;

  getUserAccessToken(req.user.id)
    .then(accessToken => {
      const options = {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken || process.env.ACCESS_TOKEN}`,
        },
      };

      return axios.get(url, options);
    })
    .then(r => {
      if (r.status === 200) return r.data;
    })
    .then(data => {
      const graphData = formatDataFromEnedis(data); // [ {metadata, graph_data}, ... ]
      // Save data to database
      graphData.forEach(d => {
        createDataForUser(
          req.user.id,
          d.graph_data,
          d.metadata.unit,
          _.camelCase(URLType),
          d.metadata.usagePointId,
        );
      });
      res.send(graphData);
    })
    .catch(err => {
      if (err.response && err.response.status === 403)
        return res.send({ message: 'Le client est inconnu ou non habilité' });
      console.log(err);
      res.send(err);
    });
};

// in the format [{timestamp, value, type, unit, usagePointId}]
// grouped by usagePointId
const formatDataFromDB = data => {
  // { usagePointId: [],  ... }
  const tmp = {};
  data.forEach(e => {
    tmp[e.usagePointId] = tmp[e.usagePointId] || [];
    tmp[e.usagePointId].push({
      timestamp: d.timestamp,
      value: d.value,
    });
  });
  // [{usagePointId: , data: [] }, ... ]
  const graph_data = Object.keys(tmp).map(id => ({
    usagePointId: id,
    data: tmp[id],
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
    console.log('data from data base', data);
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
