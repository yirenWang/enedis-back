import { User } from './index';

const getUserByEnedisId = enedisId => {
  return User.findById(enedisId);
};

export const findOrCreateUser = (
  firstname,
  lastname,
  enedisId,
  accessToken,
  refreshToken,
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
    },
  });
};

export const updateUser = (user, newData) => {
  const { firstname, lastname, accessToken } = newData;
  return user.update({ accessToken, firstname, lastname });
};
