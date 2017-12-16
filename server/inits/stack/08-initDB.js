import Users from '../../models/users';
import Seats from '../../models/seats';
import {MAX_SEATS} from '../../config.js';

const syncDB = async (model) => {
  try {
    await model.sync({alter: true});
    console.log(`${model.name} sync complete!`);
    if (model.name == 'seats') {
      const seats = await Seats.findAll();
      if (seats[0]==null) {
        for (let i=0; i<MAX_SEATS; i++) await Seats.create({});
        console.log(`Init Seats complete!`);
      }
    }
  } catch (e) {
    console.error(e);
    throw (e);
  }
};

exports.init = () => {
  syncDB(Users);
  syncDB(Seats);
};
