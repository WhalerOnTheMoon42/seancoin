const hextToBinary = require('hex-to-binary');
const {GENESIS_DATA, MINE_RATE} = require('../config')
const { cryptoHash } = require('../util');

class Block {
  constructor({ data, timestamp, hash, lastHash, nonce, difficulty }){
      this.data = data;
      this.timestamp = timestamp;
      this.hash = hash;
      this.lastHash = lastHash;
      this.nonce = nonce;
      this.difficulty = difficulty;
  }
  static genesis() {
    return new this(GENESIS_DATA);
  }
  static mineBlock({ lastBlock, data}) {
    let hash, timestamp;
    const lastHash = lastBlock.hash;
    let { difficulty } = lastBlock;
    let nonce = 0;
    hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);

    do {
      nonce++;
      timestamp = Date.now();
      difficulty = Block.adjustDifficulty({ originalBlock: lastBlock, timestamp });
      hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
    } while (hextToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty));

    return new this({
      timestamp,
      lastHash,
      data,
      difficulty,
      nonce,
      hash
    });
  }

  static adjustDifficulty({ originalBlock, timestamp }) {
    const { difficulty } = originalBlock;

    if (difficulty < 1) return 1;

    if ((timestamp - originalBlock.timestamp) > MINE_RATE ) return difficulty - 1;
    return difficulty + 1;
  }
}

module.exports = Block;
