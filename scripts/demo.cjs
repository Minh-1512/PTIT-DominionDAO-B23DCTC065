const { ethers, network } = require('hardhat');
async function main() {
 const [a,b,c,recipient] = await ethers.getSigners();
 const dao = await (await ethers.getContractFactory('DominionDAO')).deploy();
 await dao.waitForDeployment();
 for (const s of [a,b,c]) await (await dao.connect(s).contribute({value:ethers.parseEther('0.01')})).wait();
 await (await dao.createProposal('Ho tro ban A','Demo 3 co dong',recipient.address,ethers.parseEther('0.005'))).wait();
 await (await dao.performVote(0,true)).wait(); await (await dao.connect(b).performVote(0,true)).wait(); await (await dao.connect(c).performVote(0,false)).wait();
 await network.provider.send('evm_increaseTime',[301]); await network.provider.send('evm_mine');
 const before = await ethers.provider.getBalance(recipient.address);
 await (await dao.payBeneficiary(0)).wait();
 const received = (await ethers.provider.getBalance(recipient.address))-before;
 console.log('3 co dong da gop 0.03 ETH; ket qua vote 2-1; tang thoi gian local 301 giay.');
 console.log('A nhan:',ethers.formatEther(received),'ETH; quy con:',ethers.formatEther(await dao.daoBalance()),'ETH');
 if(received !== ethers.parseEther('0.005')) throw Error('Sai so tien');
}
main().catch(e=>{console.error(e);process.exitCode=1});
