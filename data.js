import axios from 'axios';
import jwt from 'jsonwebtoken';

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

export const getConsumptionLoadCurve = (req, res) => {};

export const getConsumptionMaxPower = (req, res) => {};

export const getDailyConsumption = (req, res) => {};

export const getDailyProduction = (req, res) => {};
