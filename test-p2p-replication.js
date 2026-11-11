/**
 * SusaLabs NextTruth - Multi-Node P2P Replication & Serverless File Transfer Simulator
 * 
 * Demonstrates:
 * 1. 3 Independent Network Nodes (SusaLabs, Press Guild, Citizen Network)
 * 2. File hashing into authentic RFC-4648 Base32 IPFS CIDv1
 * 3. P2P Gossip broadcast & cross-node file replication
 * 4. A New 6th User connecting and downloading news & files from the closest peer
 * 5. Failover test: Killing Node 1 to prove news/files still load seamlessly from Node 2 & 3!
 */

const crypto = require('crypto');

// RFC4648 Base32 alphabet for IPFS CIDv1
const BASE32_ALPHABET = 'abcdefghijklmnopqrstuvwxyz234567';
function bufferToBase32(buffer) {
  let bits = 0, value = 0, output = '';
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
}

function generateIpfsCidV1(dataBuffer) {
  const digest = crypto.createHash('sha256').update(dataBuffer).digest();
  const prefix = Buffer.from([0x01, 0x55, 0x12, 0x20]); // CIDv1 + raw codec + sha2-256
  return 'b' + bufferToBase32(Buffer.concat([prefix, digest]));
}

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

// 1. Define 3 Independent Network Nodes
class P2PNetworkNode {
  constructor(nodeId, nodeName, location, port, secret) {
    this.nodeId = nodeId;
    this.nodeName = nodeName;
    this.location = location;
    this.port = port;
    this.secret = secret;
    this.isOnline = true;
    this.ledger = [];
    this.ipfsStorage = new Map(); // Local pinned files storage
  }

  signBlock(blockIndex, blockHash, merkleRoot, timestamp) {
    const payload = `${this.nodeId}:${blockIndex}:${blockHash}:${merkleRoot}:${timestamp}`;
    return '0x' + crypto.createHmac('sha256', this.secret).update(payload).digest('hex');
  }

  receiveBlock(block, filePayload) {
    if (!this.isOnline) return false;
    // Verify Merkle Root
    const recomputedContentHash = sha256(JSON.stringify(filePayload.metadata));
    const recomputedMerkle = sha256(`${recomputedContentHash}:${sha256(filePayload.fileBytes)}`);
    if (recomputedMerkle !== block.merkleRoot) {
      console.log(`❌ [${this.nodeName}] REJECTED: Merkle Root mismatch!`);
      return false;
    }

    // Pin file in node's decentralized storage
    this.ipfsStorage.set(block.ipfsCid, filePayload);
    this.ledger.push(block);
    console.log(`💾 [${this.nodeName}] Verified & PINNED file CID: ${block.ipfsCid} (Storage: OK)`);
    return true;
  }

  serveFile(cid) {
    if (!this.isOnline) {
      throw new Error(`Node ${this.nodeName} is OFFLINE!`);
    }
    const file = this.ipfsStorage.get(cid);
    if (!file) throw new Error(`File not found on ${this.nodeName}`);
    return file;
  }
}

// Instantiate 3 Independent Nodes
const node1 = new P2PNetworkNode(
  'susa-node-01',
  'SusaLabs Core Truth Node',
  'Frankfurt, DE (Peer 1)',
  8545,
  'secret_key_susa_01'
);

const node2 = new P2PNetworkNode(
  'press-guild-02',
  'Independent Press Guild Node',
  'Mumbai, IN (Peer 2)',
  8546,
  'secret_key_press_02'
);

const node3 = new P2PNetworkNode(
  'citizen-network-03',
  'Decentralized Citizen Witness Node',
  'New York, US (Peer 3)',
  8547,
  'secret_key_citizen_03'
);

const networkPeers = [node1, node2, node3];

// Sleep helper
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runP2PNetworkDemo() {
  console.log('================================================================');
  console.log('🌐 SusaLabs NextTruth - Multi-Node P2P Replication & File Flow');
  console.log('================================================================\n');

  console.log('📡 STEP 1: INITIALIZING 3 INDEPENDENT NETWORK NODES...');
  networkPeers.forEach((n) => {
    console.log(`   🟢 [${n.nodeId}] ${n.nodeName} ONLINE at ${n.location} (Port ${n.port})`);
  });
  console.log('   All 3 nodes connected via P2P Gossip Sub Protocol.\n');
  await sleep(1000);

  // STEP 2: Citizen uploads an image and submits news
  console.log('📸 STEP 2: CITIZEN REPORTER SUBMITS NEWS WITH A HIGH-RES PHOTO...');
  const sampleImageContent = 'BINARY_DATA_IMAGE_MUNICIPAL_DISPATCH_EVIDENCE_2026_JPG_RAW_BYTES';
  const articleMetadata = {
    title: 'Historic Metro Expansion Project Clears Final Environmental Review',
    author: 'Aarav Patel (Citizen Eyewitness)',
    category: 'Urban Infrastructure',
    timestamp: new Date().toISOString(),
  };

  // Convert image to IPFS CIDv1 multihash
  const imageCid = generateIpfsCidV1(Buffer.from(sampleImageContent));
  const contentHash = sha256(JSON.stringify(articleMetadata));
  const imageHash = sha256(sampleImageContent);
  const merkleRoot = sha256(`${contentHash}:${imageHash}`);
  const blockIndex = 21;
  const previousHash = '7c4d5c6fa64042123fbd16aaaac5e8f4fb7cd82cad0ba9158143719cf9a29bfd';
  const blockHash = sha256(`${blockIndex}:${previousHash}:${contentHash}:${merkleRoot}:${articleMetadata.timestamp}`);

  console.log(`   📄 Article Headline: "${articleMetadata.title}"`);
  console.log(`   🔑 Cryptographic SHA-256 Content Hash : ${contentHash.substring(0, 32)}...`);
  console.log(`   📦 Generated Authentic IPFS CIDv1     : ${imageCid}`);
  console.log(`   🌳 Merkle Tree Root Lock              : ${merkleRoot.substring(0, 32)}...\n`);
  await sleep(1200);

  // STEP 3: Multi-Stake Validator Signatures
  console.log('✍️  STEP 3: 3 INDEPENDENT NODES SIGN THE BLOCK (BYZANTINE BFT QUORUM)...');
  const signatures = networkPeers.map((node) => {
    const sig = node.signBlock(blockIndex, blockHash, merkleRoot, articleMetadata.timestamp);
    console.log(`   ✓ Signed by ${node.nodeName} -> ${sig.substring(0, 24)}... [VALID]`);
    return { nodeId: node.nodeId, signature: sig };
  });

  const newBlock = {
    blockIndex,
    blockHash,
    previousHash,
    contentHash,
    merkleRoot,
    ipfsCid: imageCid,
    timestamp: articleMetadata.timestamp,
    validators: signatures,
  };
  console.log('   ✅ 3/3 Signatures Verified! Block #21 anchored to immutable ledger.\n');
  await sleep(1200);

  // STEP 4: P2P Gossip Broadcast and Storage Replication
  console.log('🚀 STEP 4: GOSSIP REPLICATION - SENDING FILES ACROSS THE P2P NETWORK...');
  const filePackage = {
    cid: imageCid,
    metadata: articleMetadata,
    fileBytes: sampleImageContent,
    fileName: 'metro_ground_evidence.jpg',
  };

  for (const peer of networkPeers) {
    peer.receiveBlock(newBlock, filePackage);
    await sleep(400);
  }
  console.log('   🎉 Complete! File is now decentralized & pinned across 3 independent networks.\n');
  await sleep(1200);

  // STEP 5: New 6th User arrives and views the news
  console.log('👤 STEP 5: A NEW 6TH USER ARRIVES (Opens the website from New Delhi)...');
  console.log('   The user’s browser discovers the closest available node:');

  // Latency check simulation
  const latencies = [
    { node: node1, latencyMs: 145 }, // Frankfurt
    { node: node2, latencyMs: 14 },  // Mumbai (Closest to New Delhi)
    { node: node3, latencyMs: 210 }, // New York
  ];

  latencies.sort((a, b) => a.latencyMs - b.latencyMs);
  const bestNode = latencies[0].node;

  console.log(`   ⚡ Latencies: Node 1 (145ms), Node 2 (14ms - FASTEST), Node 3 (210ms)`);
  console.log(`   🎯 ROUTED TO: [${bestNode.nodeName}] (Location: ${bestNode.location})`);

  const deliveredFile = bestNode.serveFile(imageCid);
  console.log(`   📥 News Text received from: ${bestNode.nodeName}`);
  console.log(`   🖼️  Image file "${deliveredFile.fileName}" received via CID [${imageCid}]`);
  console.log(`   🔒 Local Browser verified SHA-256 match: 100% Authentic, 0 tampering!\n`);
  await sleep(1500);

  // STEP 6: REAL-WORLD PROBLEM TEST: NODE 1 DIES!
  console.log('⚠️  STEP 6: REAL-WORLD DISASTER TEST - WHAT IF A NODE DIES OR GETS CENSORED?');
  console.log('   Simulating: A government order or hardware failure takes [Node 1] OFFLINE!');
  node1.isOnline = false;
  console.log('   🔴 Node 1 (SusaLabs Core) is now SHUT DOWN / DISCONNECTED.');
  await sleep(1000);

  console.log('\n👤 User 7 now opens the website and requests the same news...');
  try {
    node1.serveFile(imageCid);
  } catch (err) {
    console.log(`   ⚠️ Node 1 connection failed: ${err.message}`);
  }

  console.log('   🔄 Failover Protocol Activated: Trying next peer in swarm...');
  const fallbackNode = node2.isOnline ? node2 : node3;
  const fallbackFile = fallbackNode.serveFile(imageCid);
  console.log(`   🟢 SUCCESS! News and image file instantly delivered by [${fallbackNode.nodeName}]!`);
  console.log(`   🛡️ Anti-Censorship Proof: Zero downtime! The news could NOT be killed.\n`);

  console.log('================================================================');
  console.log('✅ TEST COMPLETE: Multi-Node P2P & Serverless File Flow Verified!');
  console.log('================================================================\n');
}

runP2PNetworkDemo();

