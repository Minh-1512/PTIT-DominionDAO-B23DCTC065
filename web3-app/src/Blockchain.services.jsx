import Web3 from 'web3';
export const ZeroAddress='0x0000000000000000000000000000000000000000';
export const isAddress=Web3.utils.isAddress;
export const parseEther=value=>BigInt(Web3.utils.toWei(value.toString(),'ether'));
export const formatEther=value=>Web3.utils.fromWei(value.toString(),'ether');
export class WalletProvider {
 constructor(ethereum){this.web3=new Web3(ethereum);this.ethereum=ethereum;}
 async getNetwork(){return {chainId:BigInt(await this.web3.eth.getChainId())};}
 async getCode(address){return this.web3.eth.getCode(address);}
 async getSigner(){const accounts=await this.ethereum.request({method:'eth_accounts'});if(!accounts.length)throw Error('Kết nối MetaMask trước.');return {web3:this.web3,address:accounts[0],getAddress:async()=>accounts[0]};}
}
const numeric=['id','amount','duration','upvotes','downvotes'];
const proposal=p=>({...p,...Object.fromEntries(numeric.map(k=>[k,BigInt(p[k])]))});
const transaction=promi=>new Promise((resolve,reject)=>{
 let minedResolve,minedReject;const mined=new Promise((res,rej)=>{minedResolve=res;minedReject=rej;});mined.catch(()=>{});
 promi.once('transactionHash',hash=>resolve({hash,wait:()=>mined}));
 promi.once('receipt',receipt=>{minedResolve(receipt);resolve({hash:receipt.transactionHash,wait:async()=>receipt});});
 promi.once('error',e=>{minedReject(e);reject(e);});
});
export class DaoContract {
 constructor(address,abi,signer){this.contract=new signer.web3.eth.Contract(abi,address);this.account=signer.address;}
 getProposals=async()=> (await this.contract.methods.getProposals().call()).map(proposal);
 daoBalance=async()=>BigInt(await this.contract.methods.daoBalance().call());
 getBalance=async()=>BigInt(await this.contract.methods.getBalance().call({from:this.account}));
 isStakeholder=()=>this.contract.methods.isStakeholder().call({from:this.account});
 getVotesOf=id=>this.contract.methods.getVotesOf(id.toString()).call();
 contribute=({value})=>transaction(this.contract.methods.contribute().send({from:this.account,value:value.toString()}));
 createProposal=(title,description,beneficiary,amount)=>transaction(this.contract.methods.createProposal(title,description,beneficiary,amount.toString()).send({from:this.account}));
 performVote=(id,support)=>transaction(this.contract.methods.performVote(id.toString(),support).send({from:this.account}));
 payBeneficiary=id=>transaction(this.contract.methods.payBeneficiary(id.toString()).send({from:this.account}));
}
