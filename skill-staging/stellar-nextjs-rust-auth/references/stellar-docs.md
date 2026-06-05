# Stellar Docs Reference

Use this file as a navigation index for Stellar development work involving a `Next.js` frontend and a `Rust` backend.

## Best Starting Points

- Build overview: `https://developers.stellar.org/docs/build`
- App development overview: `https://developers.stellar.org/docs/build/apps/overview`
- Smart contracts overview: `https://developers.stellar.org/docs/build/smart-contracts/overview`
- Stellar fundamentals: `https://developers.stellar.org/docs/learn/fundamentals`
- Data and APIs: `https://developers.stellar.org/docs/data/apis`
- Tools overview: `https://developers.stellar.org/docs/tools`
- Networks: `https://developers.stellar.org/docs/networks`

## For This Stack

### Next.js frontend + Rust backend app shape

Read first:

- Applications overview: `https://developers.stellar.org/docs/build/apps/overview`
- Application design considerations: `https://developers.stellar.org/docs/build/apps/application-design-considerations`
- Dapp development guide: `https://developers.stellar.org/docs/build/guides/dapps`
- Dapp frontend tutorial: `https://developers.stellar.org/docs/build/apps/dapp-frontend`

### Google auth plus protected backend

Stellar docs do not define Google OAuth itself. Use the app architecture and auth docs to decide where Stellar-sensitive operations live:

- Contract authorization: `https://developers.stellar.org/docs/build/guides/auth`
- Transactions: `https://developers.stellar.org/docs/build/guides/transactions`
- Stellar basics: `https://developers.stellar.org/docs/build/guides/basics`

Rule:

- Google handles user identity.
- Backend enforces protected access.
- Wallet signing and blockchain actions remain separate concerns.

### Rust backend and Soroban or RPC integration

Read first:

- Smart contracts getting started: `https://developers.stellar.org/docs/build/smart-contracts/getting-started`
- Example contracts: `https://developers.stellar.org/docs/build/smart-contracts/example-contracts`
- RPC guide: `https://developers.stellar.org/docs/build/guides/rpc`
- Data APIs RPC: `https://developers.stellar.org/docs/data/apis/rpc`
- RPC providers: `https://developers.stellar.org/docs/data/apis/rpc/providers`

Also useful:

- Contract events: `https://developers.stellar.org/docs/build/guides/events`
- Contract storage: `https://developers.stellar.org/docs/build/guides/storage`
- Contract testing: `https://developers.stellar.org/docs/build/guides/testing`
- Type conversions: `https://developers.stellar.org/docs/build/guides/conversions`

### Wallet and frontend signing flows

- Freighter guide: `https://developers.stellar.org/docs/build/guides/freighter`
- Wallet SDK tutorial: `https://developers.stellar.org/docs/build/apps/wallet/overview`
- Passkey dapp tutorial: `https://developers.stellar.org/docs/build/apps/guestbook/overview`

### Tokens and assets

- Tokens overview: `https://developers.stellar.org/docs/tokens`
- Asset anatomy: `https://developers.stellar.org/docs/tokens/anatomy-of-an-asset`
- Tokens quickstart: `https://developers.stellar.org/docs/tokens/quickstart`
- Stellar asset contract: `https://developers.stellar.org/docs/tokens/stellar-asset-contract`
- Token interface: `https://developers.stellar.org/docs/tokens/token-interface`
- Issue an asset: `https://developers.stellar.org/docs/tokens/how-to-issue-an-asset`
- Publish asset info: `https://developers.stellar.org/docs/tokens/publishing-asset-info`

Rule:

- Be explicit whether the feature uses classic Stellar assets or contract tokens.

### Network and transaction constraints

- Transactions fundamentals: `https://developers.stellar.org/docs/learn/fundamentals/transactions`
- Fees and metering fundamentals: `https://developers.stellar.org/docs/learn/fundamentals/fees-resource-limits-metering`
- Resource limits and fees: `https://developers.stellar.org/docs/networks/resource-limits-fees`
- Networks overview: `https://developers.stellar.org/docs/networks`

### Security and production readiness

- Security best practices: `https://developers.stellar.org/docs/build/security-docs`
- Contract conventions: `https://developers.stellar.org/docs/build/guides/conventions`
- Contract accounts: `https://developers.stellar.org/docs/build/guides/contract-accounts`
- State archival: `https://developers.stellar.org/docs/build/guides/archival`

## Full Navigation Map

### Build

- Overview: `https://developers.stellar.org/docs/build`
- Smart contracts intro: `https://developers.stellar.org/docs/build/smart-contracts/overview`
- Smart contracts getting started: `https://developers.stellar.org/docs/build/smart-contracts/getting-started`
- Example contracts: `https://developers.stellar.org/docs/build/smart-contracts/example-contracts`
- Build apps overview: `https://developers.stellar.org/docs/build/apps/overview`
- App design considerations: `https://developers.stellar.org/docs/build/apps/application-design-considerations`
- Wallet SDK tutorial: `https://developers.stellar.org/docs/build/apps/wallet/overview`
- JavaScript payment app tutorial: `https://developers.stellar.org/docs/build/apps/example-application-tutorial/overview`
- Swift payment app tutorial: `https://developers.stellar.org/docs/build/apps/swift-payment-app`
- Network ingestion tutorial: `https://developers.stellar.org/docs/build/apps/ingest-sdk/overview`
- Passkey dapp tutorial: `https://developers.stellar.org/docs/build/apps/guestbook/overview`
- Dapp frontend tutorial: `https://developers.stellar.org/docs/build/apps/dapp-frontend`

### Guides

- Contract authorization: `https://developers.stellar.org/docs/build/guides/auth`
- Contract conventions: `https://developers.stellar.org/docs/build/guides/conventions`
- Contract accounts: `https://developers.stellar.org/docs/build/guides/contract-accounts`
- Contract events: `https://developers.stellar.org/docs/build/guides/events`
- Contract storage: `https://developers.stellar.org/docs/build/guides/storage`
- Contract testing: `https://developers.stellar.org/docs/build/guides/testing`
- Dapp development: `https://developers.stellar.org/docs/build/guides/dapps`
- Fees and metering: `https://developers.stellar.org/docs/build/guides/fees`
- Freighter wallet: `https://developers.stellar.org/docs/build/guides/freighter`
- Stellar basics: `https://developers.stellar.org/docs/build/guides/basics`
- RPC: `https://developers.stellar.org/docs/build/guides/rpc`
- State archival: `https://developers.stellar.org/docs/build/guides/archival`
- Stellar asset contract tokens: `https://developers.stellar.org/docs/build/guides/tokens`
- Transactions: `https://developers.stellar.org/docs/build/guides/transactions`
- Type conversions: `https://developers.stellar.org/docs/build/guides/conversions`

### Learn

- Fundamentals: `https://developers.stellar.org/docs/learn/fundamentals`
- Stellar stack: `https://developers.stellar.org/docs/learn/fundamentals/stellar-stack`
- Lumens: `https://developers.stellar.org/docs/learn/fundamentals/lumens`
- SCP: `https://developers.stellar.org/docs/learn/fundamentals/stellar-consensus-protocol`
- Data structures: `https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures`
- Operations and transactions: `https://developers.stellar.org/docs/learn/fundamentals/transactions`
- Fees and metering: `https://developers.stellar.org/docs/learn/fundamentals/fees-resource-limits-metering`
- SEPs: `https://developers.stellar.org/docs/learn/fundamentals/stellar-ecosystem-proposals`
- Smart contracts fundamentals: `https://developers.stellar.org/docs/learn/fundamentals/contract-development`
- Data format: `https://developers.stellar.org/docs/learn/fundamentals/data-format`
- Anchors: `https://developers.stellar.org/docs/learn/fundamentals/anchors`
- SDEX and liquidity pools: `https://developers.stellar.org/docs/learn/fundamentals/liquidity-on-stellar-sdex-liquidity-pools`
- Glossary: `https://developers.stellar.org/docs/learn/glossary`
- Migrate from another chain: `https://developers.stellar.org/docs/learn/migrate`
- Interactive learning: `https://developers.stellar.org/docs/learn/interactive`

### Tokens

- Tokens overview: `https://developers.stellar.org/docs/tokens`
- Quickstart: `https://developers.stellar.org/docs/tokens/quickstart`
- Asset design and access: `https://developers.stellar.org/docs/tokens/control-asset-access`

### Data

- Data overview: `https://developers.stellar.org/docs/data`
- Analytics overview: `https://developers.stellar.org/docs/data/analytics`
- Hubble: `https://developers.stellar.org/docs/data/analytics/hubble`
- Analytics providers: `https://developers.stellar.org/docs/data/analytics/analytics-providers`
- API overview: `https://developers.stellar.org/docs/data/apis`
- Horizon: `https://developers.stellar.org/docs/data/apis/horizon`
- Horizon providers: `https://developers.stellar.org/docs/data/apis/horizon/providers`
- Migrate Horizon to RPC: `https://developers.stellar.org/docs/data/apis/migrate-from-horizon-to-rpc`
- Indexers: `https://developers.stellar.org/docs/data/indexers`
- Oracles: `https://developers.stellar.org/docs/data/oracles`

### Tools

- SDKs: `https://developers.stellar.org/docs/tools/sdks`
- Stellar CLI: `https://developers.stellar.org/docs/tools/cli`
- Lab: `https://developers.stellar.org/docs/tools/lab`
- Quickstart: `https://developers.stellar.org/docs/tools/quickstart`
- OpenZeppelin relayer: `https://developers.stellar.org/docs/tools/openzeppelin-relayer`
- OpenZeppelin contracts: `https://developers.stellar.org/docs/tools/openzeppelin-contracts`
- Scaffold Stellar: `https://developers.stellar.org/docs/tools/scaffold-stellar`
- Building with AI: `https://developers.stellar.org/docs/build/building-with-ai`

### Networks and validators

- Networks overview: `https://developers.stellar.org/docs/networks`
- Software versions: `https://developers.stellar.org/docs/networks/software-versions`
- Validators intro: `https://developers.stellar.org/docs/validators`
- Admin guide: `https://developers.stellar.org/docs/validators/admin-guide`

## Community and auxiliary resources

- Docs repo: `https://github.com/stellar/stellar-docs`
- Developer Discord: `https://discord.gg/stellardev`
- Developer blog: `https://www.stellar.org/developers-blog`
- Stellar Quest: `https://quest.stellar.org/`
- Soroban Quest: `https://fastcheapandoutofcontrol.com/tutorial`
- YouTube: `https://www.youtube.com/@StellarDevelopmentFoundation`
- Explorer: `https://stellar.expert/`
- Lab: `https://lab.stellar.org/`
- Status: `https://status.stellar.org/`
- Dashboard: `https://dashboard.stellar.org/`
