import React, { useEffect, useState } from 'react';
import { Aptos } from '@aptos-labs/ts-sdk';

declare global {
  interface Window {
    aptos?: any;
  }
}

function App() {
  // Wallet
  const [account, setAccount] = useState<string | null>(null);
  // File and IPFS
  const [file, setFile] = useState<File | null>(null);
  const [cid, setCid] = useState<string | null>(null);
  // On-chain docs
  const [onChainDocs, setOnChainDocs] = useState<string[]>([]);

  // Aptos client
  const aptos = new Aptos();

  // Pinata keys
  const apiKey = 'bf95d156636f75162e83';
  const apiSecret = 'c838c64023202e11cf9cba5ed9439bee70ad43455bf361352aaa69fb7927f67b';

  // Wallet connect/disconnect
  const connectWallet = async () => {
    if (window.aptos) {
      try {
        const response = await window.aptos.connect();
        setAccount(response.address);
      } catch (err) {
        alert('User rejected connection or wallet error.');
      }
    } else {
      alert('Petra Wallet extension not installed!');
    }
  };

  const disconnectWallet = async () => {
    setAccount(null);
    if (window.aptos) {
      try {
        await window.aptos.disconnect();
      } catch {}
    }
  };

  useEffect(() => {
    if (window.aptos) {
      window.aptos.account()
        .then((a: any) => setAccount(a.address))
        .catch(() => {});
    }
  }, []);

  // File input handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Upload file to Pinata (IPFS)
  const uploadToPinata = async () => {
    if (!file) return alert('No file selected!');
    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
    const data = new FormData();
    data.append('file', file);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'pinata_api_key': apiKey,
          'pinata_secret_api_key': apiSecret,
        },
        body: data,
      });
      if (!response.ok) {
        alert('Pinata upload failed');
        return;
      }
      const result = await response.json();
      setCid(result.IpfsHash);
      alert('File uploaded! CID: ' + result.IpfsHash);
    } catch (err) {
      alert('Pinata upload failed: ' + err);
    }
  };

  // Store CID on Aptos blockchain — NO gas parameter, let Petra handle it
  async function storeCidOnAptos() {
    if (!cid || !account) return alert('No CID or wallet not connected!');
    try {
      const functionId = '0x44e19c63aad50f2dfa3da9e9bb1bf05b1f94bd4a522d166309a432d4de6cd3c8::vault::add_document';
      const payload = {
        type: 'entry_function_payload',
        function: functionId,
        arguments: [cid],
        type_arguments: []
      };
      // Fallback: NO gas config or options object
      const txHash = await window.aptos.signAndSubmitTransaction(payload);
      alert('Stored on-chain! Tx Hash: ' + txHash.hash);
    } catch (err) {
      alert('Aptos transaction failed: ' + err);
    }
  }

  // Fetch on-chain docs from your Move resource
  async function fetchOnChainCids() {
    if (!account) return;
    try {
      const resourceType =
        "0x44e19c63aad50f2dfa3da9e9bb1bf05b1f94bd4a522d166309a432d4de6cd3c8::vault::UserDocuments";
      const resp = await aptos.getAccountResource({
        accountAddress: account,
        resourceType,
      });
      setOnChainDocs(resp.data.docs || []);
    } catch (err) {
      alert('Failed to fetch on-chain documents');
    }
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Aptos Document Vault DApp</h1>
      {account ? (
        <>
          <div>Connected: <b>{account}</b></div>
          <button onClick={disconnectWallet}>Disconnect Wallet</button>
        </>
      ) : (
        <button onClick={connectWallet}>Connect Petra Wallet</button>
      )}

      {account && (
        <div>
          <input type="file" onChange={handleFileChange} />
          <button onClick={uploadToPinata} disabled={!file}>Upload to Pinata</button>
          {cid && (
            <div>
              <p>IPFS CID: <b>{cid}</b></p>
              <a href={`https://ipfs.io/ipfs/${cid}`} target="_blank" rel="noopener noreferrer">
                View on IPFS
              </a>
              <br />
              <button onClick={storeCidOnAptos}>Store CID on Aptos Blockchain</button>
            </div>
          )}
        </div>
      )}

      {account && (
        <>
          <button onClick={fetchOnChainCids}>Show On-Chain Docs</button>
          <ul>
            {onChainDocs.map((cid, i) => (
              <li key={i}>
                <a href={`https://ipfs.io/ipfs/${cid}`} target="_blank" rel="noopener noreferrer">
                  {cid}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;
