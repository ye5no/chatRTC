import config from 'config';

const IP = process.env.IP || config.get('ip');
const PORT = process.env.PORT || config.get('port');
const JWT = config.get('jwt');
const DIR = config.get('dir');
const SQL = config.get('sql');

export {
  IP,
  PORT,
  JWT,
  DIR,
  SQL,
};
