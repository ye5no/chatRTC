import fs from 'fs';

export default (app) => {
  const stack = fs.readdirSync(__dirname + '/stack').sort();
  stack.forEach((file) => {
    require('./stack/' + file).init(app);
  });
};
