import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserProvider, Contract, formatEther, parseEther, isAddress, ZeroAddress } from 'ethers';
import localConfig from './contract.json';
const remoteMode = new URLSearchParams(window.location.search).get('network') === 'sepolia';
let remoteConfig;
try { remoteConfig = JSON.parse(localStorage.getItem('ptit-sepolia-config') || 'null'); } catch {}
const config = remoteMode ? (remoteConfig || { address: '', chainId: 11155111, abi: localConfig.abi }) : localConfig;
import './style.css';

const short = a => a ? `${a.slice(0,6)}…${a.slice(-4)}` : '';
const eth = n => formatEther(n ?? 0n);
const state = (p, now) => p.paid ? 'Đã thanh toán' : now < Number(p.duration) ? 'Đang bỏ phiếu' : p.upvotes > p.downvotes ? 'Thông qua' : 'Không thông qua';
function App() {
  const [wallet, setWallet] = useState(null), [account, setAccount] = useState('');
  const [data, setData] = useState({ proposals: [], balance: 0n, contribution: 0n, stakeholder: false, votes: {} });
  const [message, setMessage] = useState(''), [busy, setBusy] = useState(false), [now, setNow] = useState(Date.now()/1000);
  const [amount, setAmount] = useState('0.01'), [filter, setFilter] = useState('all'), [selected, setSelected] = useState(null), [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', beneficiary: '', amount: '0.005' });
  const explorer = config.chainId === 11155111 ? 'https://sepolia.etherscan.io' : '';
  async function refresh(c) {
    const [proposals, balance, contribution, stakeholder] = await Promise.all([c.getProposals(), c.daoBalance(), c.getBalance(), c.isStakeholder()]);
    const votes = Object.fromEntries(await Promise.all(proposals.map(async p => [p.id.toString(), await c.getVotesOf(p.id)])));
    setData({ proposals: [...proposals].reverse(), balance, contribution, stakeholder, votes });
  }
  async function connect(request = true) {
    try {
      if (!window.ethereum) throw Error('Vui lòng cài MetaMask để kết nối ví.');
      const accounts = await window.ethereum.request({ method: request ? 'eth_requestAccounts' : 'eth_accounts' });
      if (!accounts.length) return;
      const provider = new BrowserProvider(window.ethereum);
      if (Number((await provider.getNetwork()).chainId) !== config.chainId) throw Error(`Hãy chuyển MetaMask sang ${config.chainId === 31337 ? 'Localhost 8545' : 'Sepolia'} (Chain ID ${config.chainId}).`);
      if (!config.address) throw Error('Chưa deploy contract. Xem README để triển khai trước.');
      if (await provider.getCode(config.address) === '0x') throw Error('Không tìm thấy contract trên mạng này. Hãy deploy lại và tải lại trang.');
      const signer = await provider.getSigner();
      const c = new Contract(config.address, config.abi, signer);
      setAccount(await signer.getAddress()); setWallet(c); await refresh(c); setMessage('Đã kết nối ví.');
    } catch(e) { setWallet(null); setAccount(''); setMessage(e.shortMessage || e.message); }
  }
  useEffect(() => {
    connect(false);
    const reset = () => { setWallet(null); setAccount(''); setData({ proposals: [], balance: 0n, contribution: 0n, stakeholder: false, votes: {} }); connect(false); };
    window.ethereum?.on('accountsChanged', reset); window.ethereum?.on('chainChanged', reset);
    return () => { window.ethereum?.removeListener('accountsChanged', reset); window.ethereum?.removeListener('chainChanged', reset); };
  }, []);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()/1000), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { if (!wallet) return; const t = setInterval(() => refresh(wallet).catch(e => setMessage(e.shortMessage || e.message)), 5000); return () => clearInterval(t); }, [wallet]);
  async function send(action, success) {
    setBusy(true); setMessage('Hãy xác nhận giao dịch trong MetaMask…');
    try { const tx = await action(); setMessage(`Đang chờ xác nhận: ${tx.hash}`); await tx.wait(); await refresh(wallet); setMessage(`${success} · Giao dịch: ${tx.hash}`); return true; }
    catch(e) { setMessage(e.reason || e.shortMessage || e.message); return false; }
    finally { setBusy(false); }
  }
  function positive(value) { const n = parseEther(value); if (n <= 0n) throw Error('Số ETH phải lớn hơn 0.'); return n; }
  async function contribute(e) { e.preventDefault(); try { const value = positive(amount); await send(() => wallet.contribute({ value }), 'Đóng góp thành công'); } catch(e) { setMessage(e.message); } }
  async function create(e) {
    e.preventDefault();
    try {
      if (!form.title.trim() || !form.description.trim()) throw Error('Nhập tiêu đề và mô tả.');
      if (!isAddress(form.beneficiary) || form.beneficiary === ZeroAddress) throw Error('Địa chỉ người nhận không hợp lệ.');
      const value = positive(form.amount); if (value > data.balance) throw Error('Số tiền vượt số dư quỹ.');
      if (await send(() => wallet.createProposal(form.title.trim(), form.description.trim(), form.beneficiary, value), 'Tạo đề xuất thành công')) setModal(false);
    } catch(e) { setMessage(e.message); }
  }
  const proposals = data.proposals.filter(p => filter === 'all' || (filter === 'open' ? now < Number(p.duration) && !p.paid : now >= Number(p.duration) || p.paid));
  const detail = data.proposals.find(p => p.id.toString() === selected);
  return <main>
    <header><a className="brand" href="#">◈ Dominion<span>DAO</span></a><a href="/practice.html">Thực hành Remix và Sepolia</a><span className="network">{config.chainId === 31337 ? 'Mạng thực hành local' : 'Ethereum Sepolia'}</span><button disabled={busy} onClick={() => connect()}>{account ? short(account) : 'Kết nối MetaMask'}</button></header>
    <section className="hero"><div><small>PTIT / THỰC HÀNH BLOCKCHAIN</small><h1>Cùng góp quỹ.<br/>Cùng quyết định.</h1><p>Đóng góp ETH, đề xuất ý tưởng và biểu quyết minh bạch trên blockchain.</p><p className="muted">Thời gian biểu quyết: 5 phút · Mức cổ đông: 0,01 ETH</p></div><div className="treasury"><small>SỐ DƯ QUỸ DAO</small><h2>{eth(data.balance)} <span>ETH</span></h2><p>{data.proposals.length} đề xuất · {data.proposals.filter(p=>p.paid).length} đã thanh toán</p><code>{config.address || 'Chưa triển khai contract'}</code>{explorer && config.address && <a href={`${explorer}/address/${config.address}`} target="_blank" rel="noreferrer">Xem contract ↗</a>}</div></section>
    <div role="status" className="notice">{message || 'Kết nối ví để xem dữ liệu và bắt đầu thực hành.'}</div>
    <section className="contribute"><div><h3>Trở thành cổ đông</h3><p>Bạn đã góp {eth(data.contribution)} ETH · {data.stakeholder ? '✓ Cổ đông' : 'Chưa đủ điều kiện cổ đông'}</p></div><form onSubmit={contribute}><input aria-label="Số ETH đóng góp" type="number" min="0.000001" step="any" required value={amount} onChange={e=>setAmount(e.target.value)}/><button disabled={!wallet || busy}>Đóng góp ETH</button></form></section>
    <section><div className="sectionhead"><h2>Đề xuất của cộng đồng</h2>{data.stakeholder && <button disabled={busy} onClick={()=>setModal(true)}>+ Tạo đề xuất</button>}</div><nav>{[['all','Tất cả'],['open','Đang mở'],['closed','Đã đóng']].map(([v,label])=><button className={filter===v?'active':'ghost'} onClick={()=>setFilter(v)} key={v}>{label}</button>)}</nav>
    <div className="grid">{proposals.map(p => { const open = now < Number(p.duration); const voted = (data.votes[p.id.toString()]||[]).some(v=>v.voter.toLowerCase()===account.toLowerCase()); return <article key={p.id.toString()}><div className="row"><small>ĐỀ XUẤT #{p.id.toString()}</small><span className="badge">{state(p,now)}</span></div><h3>{p.title}</h3><p className="description">{p.description}</p><h2>{eth(p.amount)} <span>ETH</span></h2><p>Người tạo: {short(p.proposer)}<br/>Người nhận: {short(p.beneficiary)}</p><p>{open ? `Còn ${Math.max(0,Math.ceil(Number(p.duration)-now))} giây` : 'Đã hết thời gian bỏ phiếu'}</p><div className="row"><span>Đồng ý {p.upvotes.toString()} / Từ chối {p.downvotes.toString()}</span><button className="ghost" onClick={()=>setSelected(p.id.toString())}>Chi tiết</button></div>{data.stakeholder && open && <div className="actions"><button disabled={busy||voted} onClick={()=>send(()=>wallet.performVote(p.id,true),'Bỏ phiếu đồng ý thành công')}>{voted?'Đã bỏ phiếu':'Đồng ý'}</button><button className="ghost" disabled={busy||voted} onClick={()=>send(()=>wallet.performVote(p.id,false),'Bỏ phiếu từ chối thành công')}>Từ chối</button></div>}{data.stakeholder && !open && !p.paid && p.upvotes>p.downvotes && <button disabled={busy||p.amount>data.balance} onClick={()=>send(()=>wallet.payBeneficiary(p.id),`Payout thành công! ${eth(p.amount)} ETH đã gửi đến ${p.beneficiary}`)}>Thanh toán {eth(p.amount)} ETH</button>}</article>; })}</div>{!proposals.length && <div className="empty">{wallet ? 'Chưa có đề xuất trong danh sách này.' : 'Kết nối MetaMask để tải đề xuất từ contract.'}</div>}</section>
    {modal && <div className="overlay"><section className="dialog" role="dialog" aria-modal="true" aria-label="Tạo đề xuất"><div className="row"><h2>Tạo đề xuất</h2><button className="ghost" onClick={()=>setModal(false)}>Đóng</button></div><form onSubmit={create}>{[['title','Tiêu đề'],['description','Mô tả'],['beneficiary','Địa chỉ ví người nhận'],['amount','Số ETH yêu cầu']].map(([key,label])=><label key={key}>{label}{key==='description'?<textarea required value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/>:<input required value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/>}</label>)}<button disabled={busy}>Xác nhận tạo đề xuất</button></form></section></div>}
    {detail && <div className="overlay"><section className="dialog" role="dialog" aria-modal="true" aria-label="Chi tiết đề xuất"><div className="row"><h2>{detail.title}</h2><button className="ghost" onClick={()=>setSelected(null)}>Đóng</button></div><p>{detail.description}</p><p>Người nhận: <code>{detail.beneficiary}</code></p><p>{eth(detail.amount)} ETH · {state(detail,now)}</p><h3>Lịch sử biểu quyết</h3>{(data.votes[selected]||[]).map(v=><p key={v.voter}><code>{v.voter}</code><br/>{v.choosen?'Đồng ý':'Từ chối'} · {new Date(Number(v.timestamp)*1000).toLocaleString('vi-VN')}</p>)}{!data.votes[selected]?.length&&<p>Chưa có phiếu.</p>}</section></div>}
    <footer>DominionDAO · Bài thực hành Smart Contract & React · Dùng ETH thử nghiệm</footer>
  </main>;
}
createRoot(document.getElementById('root')).render(<App/>);
