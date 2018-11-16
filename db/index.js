const Sequelize = require('sequelize');

export const sequelize = new Sequelize(process.env.DATABASE_URL);

export const User = sequelize.define('user', {
  usagePointId: Sequelize.STRING,
  firstname: Sequelize.STRING,
  lastname: Sequelize.STRING,
  id: { type: Sequelize.STRING, primaryKey: true },
  accessToken: Sequelize.STRING,
  refreshToken: Sequelize.STRING,
  expiresAt: Sequelize.DATE,
});

/**
 * type: ConsumptionLoadCurve, ConsumptionMaxPower, DailyConsumption, DailyProduction
 */
export const Data = sequelize.define('data', {
  type: Sequelize.STRING,
  timestamp: Sequelize.DATE,
  value: Sequelize.FLOAT,
  unit: Sequelize.STRING,
  usagePointId: Sequelize.STRING,
});

User.hasMany(Data);
Data.belongsTo(User);

sequelize.sync({ force: true });
