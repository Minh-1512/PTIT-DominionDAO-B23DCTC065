const assert = require('node:assert/strict');
const { ethers, network } = require('hardhat');
describe('DominionDAO - luong bai thuc hanh', function () {
  let dao, a, b, c, recipient;
  const value = ethers.parseEther;
  beforeEach(async () => { [a,b,c,recipient] = await ethers.getSigners(); dao = await (await ethers.getContractFactory('DominionDAO')).deploy(); await dao.waitForDeployment(); });
  async function fund() { for (const s of [a,b,c]) await (await dao.connect(s).contribute({value:value('0.01')})).wait(); }
  async function propose() { await (await dao.createProposal('Ho tro ban A','Bai thuc hanh PTIT',recipient.address,value('0.005'))).wait(); }
  async function expire() { await network.provider.send('evm_increaseTime',[301]); await network.provider.send('evm_mine'); }
  it('cong don dong gop va cap co dong tu 0.01 ETH', async () => { await assert.rejects(dao.contribute({value:0})); await dao.contribute({value:value('0.004')}); assert.equal(await dao.isStakeholder(),false); await dao.contribute({value:value('0.006')}); assert.equal(await dao.isStakeholder(),true); assert.equal(await dao.getBalance(),value('0.01')); });
  it('3 nguoi gop, tao, vote, doi 5 phut, nhan dung tien va cam tra hai lan', async () => { await fund(); await propose(); await dao.performVote(0,true); await dao.connect(b).performVote(0,true); await dao.connect(c).performVote(0,false); await assert.rejects(dao.payBeneficiary(0),/Voting still open/); await expire(); const before = await ethers.provider.getBalance(recipient.address); await (await dao.payBeneficiary(0)).wait(); assert.equal((await ethers.provider.getBalance(recipient.address))-before,value('0.005')); assert.equal(await dao.daoBalance(),value('0.025')); assert.equal((await dao.getProposal(0)).paid,true); await assert.rejects(dao.payBeneficiary(0)); });
  it('chan nguoi khong co quyen, de xuat sai, vote trung va vote tre', async () => { await assert.rejects(dao.createProposal('x','x',recipient.address,1)); await fund(); await assert.rejects(dao.createProposal('x','x',ethers.ZeroAddress,1)); await assert.rejects(dao.createProposal('x','x',recipient.address,value('1'))); await assert.rejects(dao.createProposal('','x',recipient.address,1)); await propose(); await assert.rejects(dao.performVote(99,true)); await assert.rejects(dao.connect(recipient).performVote(0,true)); await dao.performVote(0,true); await assert.rejects(dao.performVote(0,false),/Double voting/); await expire(); await assert.rejects(dao.connect(b).performVote(0,true),/expired/); });
  it('khong thanh toan de xuat hoa hoac bi tu choi', async () => { await fund(); await propose(); await dao.performVote(0,true); await dao.connect(b).performVote(0,false); await expire(); await assert.rejects(dao.payBeneficiary(0),/Insufficient votes/); });
});
