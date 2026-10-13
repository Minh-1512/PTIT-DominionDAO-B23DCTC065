const fs = require('node:fs');
const path = require('node:path');
const { JsonRpcProvider, Transaction, Signature, Contract, formatEther } = require('ethers');
const provider = new JsonRpcProvider('http://127.0.0.1:8545', 31337, { staticNetwork: true });
const snapshot = path.join(__dirname, '..', 'local-session', 'snapshot.json');
async function summary() {
  const c = require('../web/src/contract.json');
  const dao = new Contract(c.address, c.abi, provider);
  return { address: c.address, balance: (await dao.daoBalance()).toString(), proposals: JSON.parse(JSON.stringify(await dao.getProposals(), (_, v) => typeof v === 'bigint' ? v.toString() : v)), recipientBalance: (await provider.getBalance('0x90F79bf6EB2c4f870365E785982E1f101E93b906')).toString() };
}
async function save() {
  const end = Number(BigInt(await provider.send('eth_blockNumber', [])));
  const blocks = [];
  for (let n = 1; n <= end; n++) {
    const b = await provider.send('eth_getBlockByNumber', ['0x' + n.toString(16), true]);
    const txs = b.transactions.map(t => {
      const type = Number(BigInt(t.type || '0x0'));
      const tx = Transaction.from({ type, to: t.to, nonce: Number(BigInt(t.nonce)), gasLimit: BigInt(t.gas), data: t.input, value: BigInt(t.value), chainId: BigInt(t.chainId || '0x7a69'), signature: Signature.from({ r: t.r, s: t.s, v: Number(BigInt(t.v)) }), ...(type === 2 ? { maxFeePerGas: BigInt(t.maxFeePerGas), maxPriorityFeePerGas: BigInt(t.maxPriorityFeePerGas), accessList: t.accessList || [] } : { gasPrice: BigInt(t.gasPrice), ...(type === 1 ? { accessList: t.accessList || [] } : {}) }) });
      if (tx.hash.toLowerCase() !== t.hash.toLowerCase()) throw Error('Transaction signature mismatch');
      return { raw: tx.serialized, hash: t.hash };
    });
    blocks.push({ timestamp: Number(BigInt(b.timestamp)), txs });
  }
  const state = { version: 1, chainId: 31337, savedAt: new Date().toISOString(), blocks, summary: await summary() };
  fs.mkdirSync(path.dirname(snapshot), { recursive: true });
  const temporary = snapshot + '.tmp';
  fs.writeFileSync(temporary, JSON.stringify(state, null, 2));
  fs.renameSync(temporary, snapshot);
  console.log(`Saved ${blocks.length} blocks. DAO ${formatEther(BigInt(state.summary.balance))} ETH.`);
}
async function restore() {
  if (!fs.existsSync(snapshot)) throw Error('No saved session');
  const state = JSON.parse(fs.readFileSync(snapshot, 'utf8'));
  if (Number(BigInt(await provider.send('eth_blockNumber', []))) !== 0) throw Error('Restore requires a fresh local chain; existing chain was not changed.');
  for (const b of state.blocks) {
    await provider.send('evm_setNextBlockTimestamp', [b.timestamp]);
    if (b.txs.length > 1) throw Error('Multiple transactions per block are not supported');
    if (!b.txs.length) await provider.send('evm_mine', []);
    else {
      const hash = await provider.send('eth_sendRawTransaction', [b.txs[0].raw]);
      const receipt = await provider.send('eth_getTransactionReceipt', [hash]);
      if (!receipt || receipt.status !== '0x1') throw Error(`Replay failed: ${hash}`);
      if (hash !== b.txs[0].hash) throw Error('Transaction hash mismatch');
    }
  }
  const actual = await summary();
  if (JSON.stringify(actual) !== JSON.stringify(state.summary)) throw Error('Restored state does not match saved session');
  console.log('Restored all transactions, DAO balance, proposals and recipient balance.');
}
const action = process.argv[2];
(action === 'save' ? save() : action === 'restore' ? restore() : Promise.reject(Error('Use save or restore'))).then(() => provider.destroy()).catch(e => { console.error(e.message); provider.destroy(); process.exitCode = 1; });
