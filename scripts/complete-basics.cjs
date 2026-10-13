const hre = require('hardhat');
const fs = require('node:fs');
const assert = require('node:assert/strict');
async function main() {
 const [owner, receiver, spender] = await hre.ethers.getSigners();
 const chainId = Number((await hre.ethers.provider.getNetwork()).chainId);
 const first = await (await hre.ethers.getContractFactory('FirstSmartContract')).deploy();
 await first.waitForDeployment();
 const initial = await first.getBalance();
 const set = await first.setBalance(500000000); const receipt = await set.wait();
 const result = await first.getBalance(); assert.equal(result, 500000000n);
 const token = await (await hre.ethers.getContractFactory('TetherToken')).deploy(1000000n * 10n**6n, 'Tether USD Practice', 'USDT', 6);
 await token.waitForDeployment();
 await (await token.transfer(receiver.address, 100n*10n**6n)).wait();
 await (await token.approve(spender.address, 20n*10n**6n)).wait();
 await (await token.connect(spender).transferFrom(owner.address, receiver.address, 20n*10n**6n)).wait();
 assert.equal(await token.balanceOf(receiver.address),120n*10n**6n);
 assert.equal(await token.allowance(owner.address,spender.address),0n);
 const proof={network:hre.network.name,chainId,recordedAt:new Date().toISOString(),first:{address:await first.getAddress(),deploymentHash:first.deploymentTransaction().hash,setBalanceHash:set.hash,block:receipt.blockNumber,initial:initial.toString(),result:result.toString()},token:{address:await token.getAddress(),deploymentHash:token.deploymentTransaction().hash,name:await token.name(),symbol:await token.symbol(),decimals:(await token.decimals()).toString(),supply:(await token.totalSupply()).toString(),receiver:receiver.address,receivedBaseUnits:(await token.balanceOf(receiver.address)).toString(),allowanceAfterSpend:(await token.allowance(owner.address,spender.address)).toString()}};
 fs.writeFileSync(`evidence/first-token-${chainId}.json`,JSON.stringify(proof,null,2));
 console.log(JSON.stringify(proof,null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1});
