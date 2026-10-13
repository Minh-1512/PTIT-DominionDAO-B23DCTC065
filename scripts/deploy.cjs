const hre = require('hardhat');
const fs = require('node:fs');
async function main() {
  const dao = await (await hre.ethers.getContractFactory('DominionDAO')).deploy();
  await dao.waitForDeployment();
  const address = await dao.getAddress();
  const chainId = Number((await hre.ethers.provider.getNetwork()).chainId);
  const { abi } = await hre.artifacts.readArtifact('DominionDAO');
  fs.mkdirSync('deployments', { recursive: true });
  if (chainId === 31337) fs.writeFileSync('web/src/contract.json', JSON.stringify({ address, chainId, abi }, null, 2));
  else fs.writeFileSync('deployments/sepolia-web-config.json', JSON.stringify({ address, chainId, abi }, null, 2));
  fs.mkdirSync('deployments', { recursive: true });
  fs.writeFileSync(`deployments/${chainId}.json`, JSON.stringify({ address, chainId, transaction: dao.deploymentTransaction().hash }, null, 2));
  console.log(`DominionDAO: ${address}\nChain ID: ${chainId}\nDa luu cau hinh theo mang. Sepolia: nhap dia chi vao practice.html.`);
}
main().catch(e => { console.error(e); process.exitCode = 1; });
