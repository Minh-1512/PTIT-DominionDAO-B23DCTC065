require('dotenv').config();
require('@nomicfoundation/hardhat-ethers');
const { subtask } = require('hardhat/config');
const { TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD } = require('hardhat/builtin-tasks/task-names');
subtask(TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD).setAction(async ({ solcVersion }, hre, runSuper) => {
  if (solcVersion === '0.8.24') return { compilerPath: require.resolve('solc/soljson.js'), isSolcJs: true, version: solcVersion, longVersion: require('solc').version() };
  return runSuper();
});
module.exports = { solidity: { version: '0.8.24', settings: { optimizer: { enabled: true, runs: 200 }, evmVersion: 'paris' } }, networks: { hardhat: { initialDate: require('fs').existsSync('./local-session/snapshot.json') ? new Date((require('./local-session/snapshot.json').blocks[0].timestamp - 1) * 1000).toISOString() : undefined }, localhost: { url: 'http://127.0.0.1:8545', chainId: 31337, gas: 'auto' }, sepolia: { url: process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com', chainId: 11155111, accounts: process.env.SEPOLIA_PRIVATE_KEY ? [process.env.SEPOLIA_PRIVATE_KEY] : [] } } };


