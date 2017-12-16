import Users from '../../models/users';

const syncDB = async (model) => {
  try {
    await model.sync({alter: true});
    console.log(`${model.name} sync complete!`);
  } catch (e) {
    console.error(e);
    throw (e);
  }
};

exports.init = () => {
  syncDB(Users);
};
