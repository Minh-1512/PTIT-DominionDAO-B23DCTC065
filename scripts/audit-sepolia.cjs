const {JsonRpcProvider,Contract,formatEther,isAddress}=require('ethers');
const fs=require('node:fs');
async function main(){const address=process.argv[2];if(!isAddress(address))throw Error('Use node scripts/audit-sepolia.cjs CONTRACT_ADDRESS');
 const provider=new JsonRpcProvider(process.env.SEPOLIA_RPC_URL||'https://ethereum-sepolia-rpc.publicnode.com');if((await provider.getNetwork()).chainId!==11155111n)throw Error('Wrong network');
 const {abi}=JSON.parse(fs.readFileSync('artifacts/contracts/DominionDAO.sol/DominionDAO.json','utf8'));
 if(await provider.getCode(address)==='0x')throw Error('Contract not found');const dao=new Contract(address,abi,provider);
 const proposals=await dao.getProposals();const data={checkedAt:new Date().toISOString(),chainId:11155111,address,balanceETH:formatEther(await dao.daoBalance()),proposals:[]};
 for(const p of proposals)data.proposals.push({id:p.id.toString(),title:p.title,description:p.description,amountETH:formatEther(p.amount),duration:p.duration.toString(),paid:p.paid,beneficiary:p.beneficiary,proposer:p.proposer,upvotes:p.upvotes.toString(),downvotes:p.downvotes.toString(),votes:JSON.parse(JSON.stringify(await dao.getVotesOf(p.id),(_,v)=>typeof v==='bigint'?v.toString():v)),beneficiaryCurrentETH:formatEther(await provider.getBalance(p.beneficiary))});
 fs.mkdirSync('evidence',{recursive:true});fs.writeFileSync('evidence/sepolia-state.json',JSON.stringify(data,null,2));console.log(JSON.stringify(data,null,2));provider.destroy();}
 main().catch(e=>{console.error(e.message);process.exitCode=1});
