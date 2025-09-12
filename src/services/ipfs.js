import { create } from 'ipfs-http-client';

const PINATA_API_KEY = '853da84c9d4c58df296b';
const PINATA_SECRET = '376ca38295825a80431f9445bb37612429da583db1bc87b3c340a00ba45b04fa';

const INFURA_CONFIG = {
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: 'Basic ' + btoa(
      (import.meta.env.VITE_INFURA_IPFS_PROJECT_ID || '') + ':' + 
      (import.meta.env.VITE_INFURA_IPFS_SECRET || '')
    )
  }
};

const ipfs = create(INFURA_CONFIG);

export class IPFSService {
  static async uploadComment(comment) {
    const commentData = {
      ...comment,
      timestamp: Date.now(),
      version: '1.0'
    };

    try {
      const formData = new FormData();
      const blob = new Blob([JSON.stringify(commentData)], { type: 'application/json' });
      formData.append('file', blob, 'comment.json');
      
      const pinataMetadata = JSON.stringify({
        name: `comment_${Date.now()}`,
        keyvalues: {
          proposalId: comment.proposalId?.toString() || 'unknown'
        }
      });
      formData.append('pinataMetadata', pinataMetadata);
      
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET
        },
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.IpfsHash;
      } else {
        throw new Error(`Pinata upload failed: ${response.status}`);
      }
    } catch (pinataError) {
      try {
        const result = await ipfs.add(JSON.stringify(commentData));
        return result.path;
      } catch (infuraError) {
        return this.fallbackStorage(comment);
      }
    }
  }

  static async getComment(hash) {
    try {
      if (hash.startsWith('local_')) {
        return this.getFallbackComment(hash);
      }

      try {
        const response = await fetch(`https://gateway.pinata.cloud/ipfs/${hash}`);
        if (response.ok) {
          const data = await response.text();
          return JSON.parse(data);
        }
      } catch (pinataError) {}

      try {
        const chunks = [];
        for await (const chunk of ipfs.cat(hash)) {
          chunks.push(chunk);
        }
        const data = Buffer.concat(chunks).toString();
        return JSON.parse(data);
      } catch (infuraError) {}

      try {
        const response = await fetch(`https://ipfs.io/ipfs/${hash}`);
        if (response.ok) {
          const data = await response.text();
          return JSON.parse(data);
        }
      } catch (publicError) {}

      return null;
    } catch (error) {
      return null;
    }
  }

  static async getComments(hashes) {
    try {
      const comments = await Promise.all(
        hashes.map(hash => this.getComment(hash))
      );
      return comments.filter(comment => comment !== null);
    } catch (error) {
      return [];
    }
  }

  static fallbackStorage(comment) {
    try {
      const hash = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const commentData = {
        ...comment,
        timestamp: Date.now(),
        version: '1.0'
      };
      
      localStorage.setItem(`ipfs_fallback_${hash}`, JSON.stringify(commentData));
      return hash;
    } catch (error) {
      return `error_${Date.now()}`;
    }
  }

  static getFallbackComment(hash) {
    try {
      const data = localStorage.getItem(`ipfs_fallback_${hash}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  }

  static isValidHash(hash) {
    if (hash.startsWith('local_')) return true;
    return /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|b[A-Za-z2-7]{58}|B[A-Z2-7]{58}|z[1-9A-HJ-NP-Za-km-z]{48}|F[0-9A-F]{50})$/.test(hash);
  }
}

export default IPFSService;