
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.query('CREATE EXTENSION postgis;'),

  down: (queryInterface, Sequelize) => {
  },
};
