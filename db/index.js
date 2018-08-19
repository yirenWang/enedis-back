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
  usagePointId: Sequelize.STRING,
});

User.hasMany(Data);
Data.belongsTo(User);

sequelize.sync({ force: true }).then(() =>
  User.create({
    id: 'fakeId',
    firstname: 'jeff',
    lastname: 'montagne',
    accessToken: 'Buvc2tKY25z6FjycyJagQoxxgDBPO7CTbFTOWf1rxoJiE5ZViB0avp',
    refreshToken: '4oHAV25sUCrE7xLu255ZlwmuU3xmosyG30SC7aituduYZ8',
    expiresAt: new Date('2018-09-09'),
  }),
);
