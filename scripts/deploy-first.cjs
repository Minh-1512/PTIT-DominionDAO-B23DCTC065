const hre=require('hardhat');
const fs=require('node:fs');
async function main(){
 const chainId=Number((await hre.ethers.provider.getNetwork()).chainId);
 const deployed=await(await hre.ethers.getContractFactory('FirstSmartContract')).deploy();await deployed.waitForDeployment();
 const tx=await deployed.setBalance(500000000);await tx.wait();
 const result=await deployed.getBalance();if(result!==500000000n)throw Error('Unexpected balance');
 const proof={chainId,address:await deployed.getAddress(),deploymentHash:deployed.deploymentTransaction().hash,setBalanceHash:tx.hash,getBalance:result.toString()};
 fs.mkdirSync('evidence',{recursive:true});fs.writeFileSync(`evidence/first-hardhat-${chainId}.json`,JSON.stringify(proof,null,2));console.log(JSON.stringify(proof,null,2));
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
