import { Data, User } from './index';

export const createDataForUser = (userId, graphData, unit, type) => {
  const data = graphData.map(e => ({
    unit,
    timestamp,
    value,
    userId,
    type,
  }));
  return Data.bulkCreate(data);
};

export const deleteDataForUserByType = (userId, type) => {
  return Data.destroy({ where: { type, userId } });
};

export const getDataForUserByType = (userId, type) => {
  return Data.findAll({ where: { userId, type } });
};
