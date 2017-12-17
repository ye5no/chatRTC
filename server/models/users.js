import crypto from 'crypto';
import Sequelize from 'sequelize';
import sql from 'mysql-connection.js';

const name = 'users';
const schema = {
  userID: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: Sequelize.STRING,
    defaultValue: '',
    validate: {
      is: /^([-_a-z0-9]+\.)*[-_a-z0-9]+@([-a-z0-9]+\.)+[-a-z0-9]+$|^$/,
    },
  },
  jwtSecret: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  password: {
    type: Sequelize.VIRTUAL,
    validate: {
      is: /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,20}/g,
    },
    set: function(password) {
      this.setDataValue('password', password);
      let salt = Math.random() + '';
      this.setDataValue('salt', salt);
      this.setDataValue('hashedPassword', crypto.createHmac('sha256', this.salt).update(password).digest('hex'));
    },
  },
  hashedPassword: {
    type: Sequelize.STRING,
  },
  salt: {
    type: Sequelize.STRING,
  },
};

export default sql.define(name, schema);
