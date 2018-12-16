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

import { getUserFromEnedis, getMyData } from './user';

// Heroku gères les variables d'environement donc le '.env' est utilisé que pour le processus de développement
if (process.env !== 'PRODUCTION') dotenv.config();

// Create express application
const app = express();

// Catch errors
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('invalid token...');
  }
});

// When a user wishes to connect
const login = (req, res) => {
  // verify that the state exists, else send an error
  if (!req.query.state) return res.send(httpStatus.NOT_ACCEPTABLE);

  req.session.state = req.query.state;
  // Redirect user to login page on enedis
  const redirectUrl =
    'https://gw.hml.api.enedis.fr/group/espace-particuliers/consentement-linky/oauth2/authorize' +
    '?' +
    `client_id=${process.env.CLIENT_ID}` +
    `&state=${req.state}` +
    `&duration=${process.env.DURATION}` + // duration est la durée du consentement que vous souhaitez obtenir : cette durée est à renseigner au format ISO 8601 (exemple : « P6M » pour une durée de 6 mois),
    '&response_type=code' +
    `&redirect_uri=${process.env.REDIRECT_URI}`;
  console.log('Redirect URL : ' + redirectUrl);
  return res.redirect(redirectUrl);
};

// This function catches the redirection of enedis after login
const redirect = (req, res) => {
  // verify that the state is correct
  if (req.session.sstate !== req.query.state) {
    res.send(httpStatus.FORBIDDEN);
  }

  const usagePointId = req.query.usage_point_id;
  const postData = querystring.stringify({
    code: req.query.code,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    grant_type: 'authorization_code',
  });

  const url = `https://gw.hml.api.enedis.fr/v1/oauth2/token?redirect_uri=${
    process.env.REDIRECT_URI
  }`;

  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };
  axios
    .post(url, postData, options)
    .then(res => {
      if (res.status === 200) return res.data;
      throw new Error(res.status);
    })
    .then(data => {
      const expiresAt = new Date(
        parseInt(data.expires_in, 10) * 1000 + parseInt(data.issued_at, 10),
      );
      getUserFromEnedis(data.access_token, usagePointId).then(client => {
        return findOrCreateUser(
          client.identity.natural_person.firstname,
          client.identity.natural_person.lastname,
          client.customer_id,
          data.access_token,
          data.refresh_token,
          usagePointId,
          expiresAt,
        ).spread((user, created) => {
          updateUser(user, {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            usagePointId,
            expiresAt,
          });
          res.redirect(
            `enedis-third-party-app://auth_complete?user=${jwt.sign(
              { id: user.id, usagePointId: user.usagePointId },
              process.env.JWT_SECRET,
            )}`,
          );
        });
      });
    })
    .catch(err => console.log(err));
};

app.get('/', (req, res) => res.send('Welcome to the Enedis example app!'));
app.get('/login', login);
app.get('/redirect', redirect);
app.get('/me', jwtMiddleWare({ secret: process.env.JWT_SECRET }), getMyData);
app.get('/deleteme', jwtMiddleWare({ secret: process.env.JWT_SECRET }), deleteMyData);
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

// Listen to port specified by the .env or 3001
app.listen(process.env.PORT || 3001, () => console.log('Enedis example app'));
