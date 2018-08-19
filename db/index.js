const Sequelize = require('sequelize');

export const sequelize = new Sequelize(process.env.DATABASE_URL);

export const User = sequelize.define('user', {
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
});

User.hasMany(Data);
Data.belongsTo(User);

sequelize.sync({ force: true }).then(() =>
  User.create({
    id: 'fakeId',
    firstname: 'jeff',
    lastname: 'montagne',
    accessToken: 'zn78Tnv1eX8oF1QWaScizSRgi4p5BN0bzc1VNKe7Fag6UT8WDgf8H1',
    refreshToken: '4oHAV25sUCrE7xLu255ZlwmuU3xmosyG30SC7aituduYZ8',
    expiresAt: new Date('2018-09-09'),
  }),
);
