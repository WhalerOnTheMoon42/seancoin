const crypto = require('crypto');

//all inpouts into inpouts array
const cryptoHash = (...inputs) => {
  const hash = crypto.createHash('sha256');

  hash.update(inputs.map(input => JSON.stringify(input)).sort().join(' '));

  return hash.digest('hex');
};

module.exports = cryptoHash;
