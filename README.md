# NextTruth Dispatch | Powered by SusaLabs

> **A Next-Generation Investigative & Ground News Platform with DLT Anti-Censorship Architecture**

NextTruth Dispatch connects citizen eyewitnesses, staff journalists, and readers into a transparent, decentralized ground reporting network. Built with **SusaLabs DLT (Distributed Ledger Technology)** to protect legitimate investigative journalism from political coercion, database tampering, and unauthorized suppression.

---

## Monorepo Architecture

```
/nexttruth-news
│
├── /frontend                --> Modern Editorial Web Portal (React 19, Vite, TypeScript, Tailwind CSS)
│                                 • Precision recreation of editorial Dribbble aesthetic
│                                 • SusaLabs brand identity & emblem
│                                 • Top Hero & 4 Stacked News Cards
│                                 • Weekly Top News 3-column card grid
│                                 • Tech & Media deep dives
│                                 • Ground & Eyewitness reports
│                                 • Live video feeds & community engagement
│                                 • Interactive SusaLabs DLT Truth Ledger Explorer & tamper check
│                                 • Built-in Audio Narration player (1x, 1.5x, 2x)
│                                 • Citizen submission desk & Chief Editor verification desk
│                                 • Whistleblower intake desk with zero-knowledge metadata stripping
│
├── /backend                 --> Unified REST API & DLT Node (Express, TypeScript, MongoDB)
│                                 • Dual client support: Web Frontend + Mobile App
│                                 • SHA-256 cryptographic content fingerprinting
│                                 • Multi-node Byzantine consensus simulation (3 validator nodes)
│                                 • Anti-tamper verification & auto-sealing upon editorial approval
│                                 • Whistleblower support & newsletter management
│
└── /news-app                --> React Native (Expo) Mobile Application
                                  • iOS & Android ground reporter client
                                  • Real-time camera & audio capture for citizen reporters
                                  • Integrated SusaLabs DLT verification seals
```

---

## Quickstart Guide

### 1. Run the Backend API
```bash
cd backend
npm install
npm run dev
# Server running on: http://localhost:5000
# DLT Truth Ledger: http://localhost:5000/api/dlt/ledger
```

### 2. Run the Web Frontend
```bash
cd frontend
npm install
npm run dev
# Web Portal live on: http://localhost:5173
```

### 3. Run the Mobile App
```bash
cd news-app
npm install
npx expo start
```

---

## DLT Anti-Censorship & Safety Architecture

When investigative reports expose powerful political or commercial actors, traditional databases and cloud servers can be targeted for deletion, subpoenas, or unauthorized alteration.

NextTruth solves this with the **SusaLabs DLT Protocol**:
1. **Cryptographic Fingerprint (SHA-256):** Every published article and citizen dispatch is cryptographically hashed with its metadata, author credentials, and eyewitness attachments.
2. **Chained Merkle Tree:** Blocks are permanently linked to the previous block hash in an append-only chain.
3. **Multi-Node Byzantine Consensus:** Three independent nodes (SusaLabs Core Truth Node, Independent Press Guild Node, Citizen Witness Network) sign every block.
4. **Instant Tamper Detection:** Any modified word or field in the database immediately triggers a public `CRITICAL TAMPER ALERT`, proving the original authentic story from the immutable ledger snapshot.

---

## License & Credits
- **Brand & Engineering:** SusaLabs Intelligence & NextTruth Editorial Guild
- **Design Inspiration:** Modern Editorial Grid UI (Dribbble Reference)
