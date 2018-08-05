import express from 'express';
import https from 'https';
import httpStatus from 'http-status';
import querystring from 'querystring';
import axios from 'axios';
import jwt from 'jsonwebtoken';

import { clientId, redirectUri, clientSecret, port, host, jwtSecret } from './config';

const app = express();

const login = (req, res) => {
  req.state = (Math.random() + 1).toString(36).substring(7);
  const redirectUrl =
    'https://gw.prd.api.enedis.fr/v1/oauth2/authorize' +
    '?' +
    'client_id=' +
    clientId +
    '&response_type=code' +
    '&' +
    'redirect_uri=' +
    redirectUri +
    '&' +
    'state=' +
    req.state +
    '&' +
    'user_type=external';

  return res.redirect(redirectUrl);
};

const redirect = (req, res) => {
  // if (req.state !== req.query.state) {
  //   res.send(httpStatus.FORBIDDEN);
  // }

  const postData = querystring.stringify({
    code: req.query.code,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'authorization_code',
  });

  const url = `https://gw.prd.api.enedis.fr/v1/oauth2/token?redirect_uri=${redirectUri}`;
  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
      Host: host,
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
      console.log(data.access_token);
      // create fake user
      const user = {
        name: 'toto',
        id: 'tata',
        accessToken: data.access_token,
      };
      res.redirect(`enedis-third-party-app://auth_complete?user=${jwt.sign(user, jwtSecret)}`);
    })
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
    .catch(err => console.log(err));
};

const getUser = (req, res) => {
  const data = {
    firstname: 'Toto',
    lastname: 'Dupont Dupont',
    contact_data: {
      phone: '06 00 00 00 00',
      email: 'toto@dupont.com',
    },
  };
  res.send(data);
};

app.get('/', (req, res) => res.send('Welcome to the Enedis example app!'));
app.get('/login', login);
app.get('/redirect', redirect);
app.get('/me', getUser);
app.listen(port, () => console.log('Enedis example app'));
