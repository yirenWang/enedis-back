import express from 'express';
import https from 'https';
import httpStatus from 'http-status';
import querystring from 'querystring';
import axios from 'axios';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import jwtMiddleWare from 'express-jwt';

import { findOrCreateUser, updateUser } from './db/user';

import {
  getConsumptionLoadCurve,
  getConsumptionMaxPower,
  getDailyConsumption,
  getDailyProduction,
  refreshData,
} from './data';

if (process.env !== 'PRODUCTION') dotenv.config();

const app = express();

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('invalid token...');
  }
});

const login = (req, res) => {
  req.state = (Math.random() + 1).toString(36).substring(7);
  const redirectUrl =
    'https://gw.prd.api.enedis.fr/v1/oauth2/authorize' +
    '?' +
    'client_id=' +
    process.env.CLIENT_ID +
    '&response_type=code' +
    '&' +
    'redirect_uri=' +
    process.env.REDIRECT_URI +
    '&' +
    'state=' +
    req.state +
    '&' +
    'user_type=external';
  console.log(redirectUrl);
  return res.redirect(redirectUrl);
};

const redirect = (req, res) => {
  // if (req.state !== req.query.state) {
  //   res.send(httpStatus.FORBIDDEN);
  // }

  const postData = querystring.stringify({
    code: req.query.code,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    grant_type: 'authorization_code',
  });

  const url = `https://gw.prd.api.enedis.fr/v1/oauth2/token?redirect_uri=${
    process.env.REDIRECT_URI
  }`;
  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
      Host: process.env.HOST,
      'Cache-Control': 'no-cache',
    },
  };

  axios
    .post(url, postData, options)
    .then(res => {
      if (res.status === 200) return res.data;
      throw new Error(res.status);
    })
    .then(data => {
      // log accessToken
      console.log(data);
      // create fake user with random id
      // FIXME get from enedis asap (id, firstname, lastname)
      const id = 'fakeId';
      // find or create user
      const expiresAt = new Date(
        parseInt(data.expires_in, 10) * 1000 + parseInt(data.issued_at, 10),
      );
      return findOrCreateUser(
        'jeff',
        'montagne',
        id,
        data.access_token,
        data.refresh_token,
        expiresAt,
      ).spread((user, created) => {
        updateUser(user, {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt,
        });
        console.log(jwt.sign({ id: user.id }, process.env.JWT_SECRET));
        res.redirect(
          `enedis-third-party-app://auth_complete?user=${jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
          )}`,
        );
      });
    })
    .catch(err => console.log(err));
};

app.get('/', (req, res) => res.send('Welcome to the Enedis example app!'));
app.get('/login', login);
app.get('/redirect', redirect);

app.get(
  '/metering/consumption_load_curve',
  jwtMiddleWare({ secret: process.env.JWT_SECRET }),
  getConsumptionLoadCurve,
);
app.get(
  '/metering/consumption_max_power',
  jwtMiddleWare({ secret: process.env.JWT_SECRET }),
  getConsumptionMaxPower,
);
app.get(
  '/metering/daily_consumption',
  jwtMiddleWare({ secret: process.env.JWT_SECRET }),
  getDailyConsumption,
);
app.get(
  '/metering/daily_production',
  jwtMiddleWare({ secret: process.env.JWT_SECRET }),
  getDailyProduction,
);

app.get(
  '/metering/refresh/consumption_load_curve',
  jwtMiddleWare({ secret: process.env.JWT_SECRET }),
  (req, res) => {
    refreshData(req, res, 'consumption_load_curve');
  },
);
app.get(
  '/metering/refresh/consumption_max_power',
  jwtMiddleWare({ secret: process.env.JWT_SECRET }),
  (req, res) => {
    refreshData(req, res, 'consumption_max_power');
  },
);
app.get(
  '/metering/refresh/daily_consumption',
  jwtMiddleWare({ secret: process.env.JWT_SECRET }),
  (req, res) => {
    refreshData(req, res, 'daily_consumption');
  },
);
app.get(
  '/metering/refresh/daily_production',
  jwtMiddleWare({ secret: process.env.JWT_SECRET }),
  (req, res) => {
    refreshData(req, res, 'daily_production');
  },
);

app.listen(process.env.PORT || 3001, () => console.log('Enedis example app'));
