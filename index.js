import express from 'express';
import https from 'https';
import httpStatus from 'http-status';
import querystring from 'querystring';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

if (process.env !== 'PRODUCTION') dotenv.config();
const app = express();

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
      res.redirect(
        `enedis-third-party-app://auth_complete?user=${jwt.sign(user, process.env.JWT_SECRET)}`,
      );
    })
    .catch(err => console.log(err));
};

app.get('/', (req, res) => res.send('Welcome to the Enedis example app!'));
app.get('/login', login);
app.get('/redirect', redirect);
app.listen(process.env.PORT || 3001, () => console.log('Enedis example app'));
