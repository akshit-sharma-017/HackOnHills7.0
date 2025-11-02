import React, { useEffect, useState } from 'react';
import { Aptos } from '@aptos-labs/ts-sdk';
declare global { interface Window { aptos?: any; } }

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [cid, setCid] = useState<string | null>(null);
  const [onChainDocs, setOnChainDocs] = useState<string[]>([]);
  const aptos = new Aptos();
  const apiKey = 'bf95d156636f75162e83';
  const apiSecret = 'c838c64023202e11cf9cba5ed9439bee70ad43455bf361352aaa69fb7927f67b';

  const connectWallet = async () => {
    if (window.aptos) {
      try {
        const response = await window.aptos.connect();
        setAccount(response.address);
      } catch (err) { alert('User rejected connection or wallet error.'); }
    } else { alert('Petra Wallet extension not installed!'); }
  };
  const disconnectWallet = async () => {
    setAccount(null); if (window.aptos) { try { await window.aptos.disconnect(); } catch {} }
  };
  useEffect(() => {
    if (window.aptos) { window.aptos.account()
      .then((a: any) => setAccount(a.address))
      .catch(() => {});
    }
  }, []);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) { setFile(e.target.files[0]); }
  };
  const uploadToPinata = async () => {
    if (!file) return alert('No file selected!');
    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
    const data = new FormData(); data.append('file', file);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'pinata_api_key': apiKey, 'pinata_secret_api_key': apiSecret },
        body: data,
      });
      if (!response.ok) { alert('Pinata upload failed'); return; }
      const result = await response.json();
      setCid(result.IpfsHash); alert('File uploaded! CID: ' + result.IpfsHash);
    } catch (err) { alert('Pinata upload failed: ' + err); }
  };
  async function storeCidOnAptos() {
    if (!cid || !account) return alert('No CID or wallet not connected!');
    try {
      const functionId = '0x44e19c63aad50f2dfa3da9e9bb1bf05b1f94bd4a522d166309a432d4de6cd3c8::vault::add_document';
      const payload = { type: 'entry_function_payload', function: functionId, arguments: [cid], type_arguments: [] };
      const txHash = await window.aptos.signAndSubmitTransaction(payload);
      alert('Stored on-chain! Tx Hash: ' + txHash.hash);
    } catch (err) { alert('Aptos transaction failed: ' + err); }
  }
  async function fetchOnChainCids() {
    if (!account) return;
    try {
      const resourceType = "0x44e19c63aad50f2dfa3da9e9bb1bf05b1f94bd4a522d166309a432d4de6cd3c8::vault::UserDocuments";
      const resp = await aptos.getAccountResource({ accountAddress: account, resourceType });
      setOnChainDocs(resp.data.docs || []);
    } catch (err) { alert('Failed to fetch on-chain documents'); }
  }
  // Styling
  const neon = "#21C3FC";   const neutral = "#222436";
  const pageStyle: React.CSSProperties = {
    minHeight: '100vh', background: 'linear-gradient(135deg, #181A25 0%, #232640 100%)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    fontFamily: 'Montserrat, Arial, sans-serif', paddingBottom: 48
  };
  const cardStyle: React.CSSProperties = {
    background: `linear-gradient(120deg, ${neutral}  96%, #232850 100%)`,
    borderRadius: 26, padding: '38px 25px', marginTop: 70, minWidth: 335, maxWidth: 570,
    color:'#F5F6FA', boxShadow: `0 4px 32px 0 #12132944, 0 0 0 1.6px ${neon}22`,
    marginBottom:40
  };
  const inputOuter: React.CSSProperties = {
    background: '#1e202b', borderRadius: 18, padding: 14, marginTop: 18, marginBottom:28, boxShadow: `0 1px 14px #222A3366`
  };
  const infoStyle: React.CSSProperties = {
    background: '#222436', borderRadius: 18, padding: 24, marginTop: 32, marginBottom:38, maxWidth: 550, color: '#F8F8FE',
    fontWeight:'500', fontSize:'1.11rem', borderLeft: `3.5px solid ${neon}`,
    boxShadow: "0 1.6px 12px #181A25"
  };
  const teamStyle: React.CSSProperties = {
    background: neutral, borderRadius: 13, padding: 18, marginTop: 18, marginBottom:38, maxWidth: 510, color: neon,
    fontWeight: 600, textAlign: 'center', fontSize: '1.08rem', border: `2px solid ${neon}33`
  };
  const buttonStyle: React.CSSProperties = {
    border: 'none', padding: '13px 26px', margin: '10px 0', borderRadius: '11px', fontSize: '1.06rem',
    fontWeight: 700, cursor: 'pointer', background: `linear-gradient(90deg, #222436 48%, ${neon} 130%)`,
    color: '#F6F9FB', transition: 'all .16s', outline: 'none', borderBottom: `2px solid ${neon}`,
    letterSpacing: 0.6, boxShadow: '0 2px 10px #21C3FC22', marginRight:14, marginBottom:14
  };
  const buttonHoverStyle: React.CSSProperties = {
    background: `linear-gradient(90deg, #232850 80%, #21C3FC 140%)`,
    color: "#21C3FC", transform: 'scale(1.054)', boxShadow: '0 4px 24px #21C3FC55'
  };
  const listStyle = {marginTop:18, marginBottom:24, paddingLeft:25, color:'#cdeefd', lineHeight:'1.8', fontSize:'1.02rem'};
  const testimonialCard: React.CSSProperties = {
    background:'#293153', borderRadius:16, color:'#fff', boxShadow:'0 2px 15px #21C3FC18', padding:'19px 25px',
    marginTop:28, marginBottom:28, maxWidth:390, borderLeft:`3px solid ${neon}`
  };
  const sectionTitle = {
    color: neon, marginBottom: 18, marginTop:10, fontWeight: 700, letterSpacing: 1, fontSize:'1.45rem'
  };

  const [hover, setHover] = useState(-1);

  const gap32 = { height:32 }, gap28 = { height:28 };

  const ShinyButton = ({children, ...props}: any) => (
    <button
      style={{...buttonStyle, ...(hover === props.idx ? buttonHoverStyle : {})}}
      onMouseEnter={() => setHover(props.idx)}
      onMouseLeave={() => setHover(-1)}
      {...props}
    >{children}</button>
  );

  return (
    <div style={pageStyle}>
      {/* Main Section */}
      <div style={cardStyle}>
        <h1 style={{textAlign: 'center', color: neon, letterSpacing: 2, fontWeight: 900, fontSize: "2.1rem"}}>Aptos Document Vault</h1>
        <div style={gap32}></div>
        {account ? (
          <>
            <div style={{marginBottom: 10, color: neon, fontWeight:600, fontSize:'1.07rem'}}>Connected: <span style={{color:"#89bbfe"}}>{account}</span></div>
            <div style={{marginBottom:28}}>
              <ShinyButton idx={0} onClick={disconnectWallet}>Disconnect Wallet</ShinyButton>
            </div>
          </>
        ) : (
          <ShinyButton idx={0} onClick={connectWallet}>Connect Petra Wallet</ShinyButton>
        )}

        <div style={gap32}></div>
        {account && (
          <div style={inputOuter}>
            <input type="file" onChange={handleFileChange} style={{marginRight:13,borderRadius:6,background:"#232640",color:"#fafbfc",marginBottom:13, padding:'12px'}} />
            <ShinyButton idx={1} onClick={uploadToPinata} disabled={!file}>Upload to Pinata</ShinyButton>
            <div style={gap28}></div>
            {cid && (
              <div style={{margin:'18px 0', color:'#bfbff6'}}>
                <p style={{margin:0, fontSize:'1.02rem'}}>IPFS CID: <b style={{color:neon}}>{cid}</b></p>
                <a href={`https://ipfs.io/ipfs/${cid}`} target="_blank" rel="noopener noreferrer" style={{
                  color:neon, textDecoration:'underline', marginRight:13, fontWeight:"bold"
                }}>View on IPFS</a>
                <div style={gap28}></div>
                <ShinyButton idx={2} onClick={storeCidOnAptos}>Store CID on Aptos Blockchain</ShinyButton>
              </div>
            )}
          </div>
        )}

        {account && (
          <div style={{marginTop:32}}>
            <ShinyButton idx={3} onClick={fetchOnChainCids}>Show On-Chain Docs</ShinyButton>
            <ul style={{marginTop:20, listStyle:'none', padding:0, marginBottom:20}}>
              {onChainDocs.map((cid, i) => (
                <li key={i} style={{
                  background:'#232850', borderRadius:7, marginBottom:14, padding:'11px 12px',
                  fontSize:'1rem', color:neon, fontWeight:700
                }}>
                  <a href={`https://ipfs.io/ipfs/${cid}`} target="_blank" rel="noopener noreferrer" style={{
                    color:neon, fontWeight:700, fontSize:'1.05rem', letterSpacing:0.4
                  }}>{cid}</a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Feature cards below main input */}
        <div style={gap32}></div>
        <div style={{display:'flex', gap:'36px', justifyContent:'center', flexWrap:'wrap', margin:'40px 0'}}>
          <div style={{...testimonialCard, minWidth:230}}>
            <b style={{color: neon}}>Secure Uploads</b><br/>
            Files go straight to IPFS. CID is stored on Aptos for high integrity.
          </div>
          <div style={{...testimonialCard, minWidth:230}}>
            <b style={{color: neon}}>Fast Wallet Connect</b><br/>
            Petra integration for instant board blockchain access.
          </div>
          <div style={{...testimonialCard, minWidth:230}}>
            <b style={{color: neon}}>Browse Onchain Docs</b><br/>
            See all saved CIDs easily and view live IPFS links.
          </div>
        </div>
      </div>
      {/* Why Aptos Section */}
      <div style={infoStyle}>
        <h2 style={sectionTitle}>Why Aptos?</h2>
        <div style={gap28}></div>
        <ul style={listStyle}>
          <li>High-throughput, fast finality</li>
          <li>Move smart contracts: safe & upgradable</li>
          <li>Enterprise-grade reliability and performance</li>
          <li>Decentralized—no single point of control</li>
          <li>Open access for dApps, tokens, and users</li>
          <li>Thriving developer and user ecosystem</li>
        </ul>
        <div style={gap32}></div>
        {/* Add cards for ecosystem resources */}
        <div style={{display:'flex', gap:'30px', flexWrap:'wrap', margin:'30px 0'}}>
          <div style={testimonialCard}>
            <b style={{color: neon}}>Explore the Aptos Explorer</b><br/>
            Find your transactions, modules—track everything.
          </div>
          <div style={testimonialCard}>
            <b style={{color: neon}}>Learn Move Language</b><br/>
            Write secure, robust smart contracts for the Aptos blockchain.
          </div>
        </div>
      </div>
      <div style={gap28}></div>
      {/* Why Decentralization Section */}
      <div style={infoStyle}>
        <h2 style={sectionTitle}>Why Decentralization?</h2>
        <div style={gap28}></div>
        <ul style={listStyle}>
          <li>User data and assets are always owner-controlled</li>
          <li>No lock-in, no downtime, audit and verify everything</li>
          <li>Networks run by communities—not corporations</li>
          <li>No censorship, hacker-resistant, and open by design</li>
          <li>Ultimate transparency for any project</li>
        </ul>
        <div style={gap28}></div>
        {/* Add more knowledge cards */}
        <div style={{display:'flex', gap:'30px', flexWrap:'wrap', margin:'30px 0'}}>
          <div style={testimonialCard}>
            <b style={{color: neon}}>Open Access</b><br/>
            Anyone can use, contribute, and improve decentralized services.
          </div>
          <div style={testimonialCard}>
            <b style={{color: neon}}>Security and Trust</b><br/>
            Trust the math, not the people—decentralization verifies for you.
          </div>
        </div>
      </div>
      <div style={gap28}></div>
      <div style={teamStyle}>
        <h3 style={{marginTop:0, color: neon, marginBottom:16, fontSize:'1.2rem'}}>Meet the Team</h3>
        <span>
          Vansh Thakur &nbsp;|&nbsp; Vinit Kumar &nbsp;|&nbsp; Vidur Chaudhary &nbsp;|&nbsp; Akshit Sharma
        </span>
        <div style={gap28}></div>
        <div style={{display:'flex', gap:'18px', justifyContent:'center', margin:'10px 0'}}>
          <div style={testimonialCard}>🧑‍💻 Full Stack — Vansh</div>
          <div style={testimonialCard}>🧑‍💻 Smart Contracts — Vidur</div>
          <div style={testimonialCard}>🧑‍💻 Frontend — Akshit</div>
          <div style={testimonialCard}>🧑‍💻 Blockchain Ops — Vinit</div>
        </div>
      </div>
      <div style={gap28}></div>
      <div style={{width:'100%', textAlign:'center', margin:'50px 0', color: neon, fontWeight:500, fontSize:'1.05rem'}}>
        Powered by Aptos, IPFS (Pinata), and HackOnHills7.0
      </div>
    </div>
  );
}
export default App;
