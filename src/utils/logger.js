// Simple console logger wrapper
const logger = {
  info: (...args) => console.log('\x1b[36m[INFO]\x1b[0m', new Date().toISOString(), ...args),
  warn: (...args) => console.warn('\x1b[33m[WARN]\x1b[0m', new Date().toISOString(), ...args),
  error: (...args) => console.error('\x1b[31m[ERROR]\x1b[0m', new Date().toISOString(), ...args),
};

module.exports = logger;
