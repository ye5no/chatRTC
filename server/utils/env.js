const ENV = process.env.NODE_ENV || 'development';
let IS_DEV = ENV === 'development';
let IS_PROD = ENV === 'production';
let IS_TEST = ENV === 'test';

if (!IS_DEV && !IS_PROD && !IS_TEST) {
  IS_DEV = true;
  process.env.NODE_ENV = 'development';
}

export {
  IS_DEV,
  IS_PROD,
  IS_TEST,
};

export default ENV;
