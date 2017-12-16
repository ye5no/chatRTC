import Sequelize from 'sequelize';
import sql from '../utils/mysql-connection';

const name = 'seats';
const schema = {
  seatID: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  reserv: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  color: {
    type: Sequelize.STRING,
    defaultValue: '#FFFFFF',
  },
};

export default sql.define(name, schema);
