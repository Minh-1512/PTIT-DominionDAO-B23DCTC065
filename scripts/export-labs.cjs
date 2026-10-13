const fs=require('node:fs');
const {execFileSync}=require('node:child_process');
for(const name of ['FirstSmartContract','DominionDAO','TetherToken']) {
 const artifact=JSON.parse(fs.readFileSync(`artifacts/contracts/${name}.sol/${name}.json`,'utf8'));
 fs.writeFileSync(`web/public/labs/${name}.json`,JSON.stringify({contractName:name,abi:artifact.abi,bytecode:artifact.bytecode},null,2));
 const flattened=execFileSync(process.execPath,['node_modules/hardhat/internal/cli/cli.js','flatten',`contracts/${name}.sol`],{encoding:'utf8'});
 fs.writeFileSync(`remix/${name}.sol`,flattened);
 fs.copyFileSync(`remix/${name}.sol`,`web/public/labs/${name}.sol`);
}
console.log('Exported ABI, bytecode and standalone Remix sources for 3 contracts.');
