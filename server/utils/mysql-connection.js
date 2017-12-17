import Sequelize from 'sequelize';
import {SQL} from 'config.js';

export default new Sequelize(SQL.database, SQL.username, SQL.password, SQL.options);
