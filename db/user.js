import { User } from './index';

export const getUserByEnedisId = enedisId => {
  return User.findById(enedisId);
};

export const findOrCreateUser = (
  firstname,
  lastname,
  enedisId,
  accessToken,
  refreshToken,
  usagePointId,
  expiresAt,
) => {
  return User.findOrCreate({
    where: { id: enedisId },
    defaults: {
      firstname,
      lastname,
      accessToken,
      refreshToken,
      expiresAt,
      usagePointId,
    },
  });
};

export const updateUser = (user, newData) => {
  const { firstname, lastname, accessToken, usagePointId } = newData;
  return user.update({ accessToken, firstname, lastname, usagePointId });
};
