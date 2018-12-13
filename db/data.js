import { Data, User } from './index';

export const createDataForUser = (userId, data, unit, type, usagePointId) => {
  const DBdata = data.map(e => ({
    unit,
    timestamp: e.timestamp,
    value: e.value,
    userId,
    type,
    usagePointId,
  }));
  return Data.bulkCreate(DBdata);
};

export const deleteDataForUser = userId => {
  return Data.destroy({ where: { userId } });
};

export const getDataForUserByType = (userId, type) => {
  return Data.findAll({
    where: { userId, type },
    order: [['timestamp', 'DESC']],
  });
};
