# UNYKORN Advocacy — Global Jurisdiction Coverage

> **Version**: 2026-04-10  
> **Platform**: UNYKORN JR Ops / Rita AI intake engine  
> **Polygon Anchoring**: CaseAnchor contract — on-chain evidence hash at intake  
> **Apostle Chain**: chain 7332 — x402 rails for agent fee settlement

---

## 1. Overview

UNYKORN Advocacy handles matters across two tiers: **Domestic (US)** and **International / Sovereign**.  
All matters are risk-tiered (Green / Amber / Red) at intake with escalation controls appropriate to the regulatory complexity of each jurisdiction.

---

## 2. Domestic Coverage (United States)

### Family Safety & Child Welfare
- **Scope**: Protective orders (GPO/TPO/EPO), DFCS/CPS advocacy, custody emergencies, child welfare investigations
- **Key statutes**: O.C.G.A. § 19-13-1 (GA Family Violence Act); FL Stat. § 741.28 (FL domestic violence); VAWA (federal)
- **AML Note**: Low inherent ML risk — no financial instrument involved
- **Risk Tier Default**: Amber (protection order involves court filing)
- **Polygon anchor**: Case intake hash on-chain within 24 hours of submission

### Criminal Defense
- **Scope**: Post-conviction review, appeal support, sentence challenge, Brady material requests, habeas petitions
- **Key statutes**: 28 U.S.C. § 2254 (federal habeas); FL Fla. R. App. P. 9.030 (5th DCA appeals); GA O.C.G.A. § 5-6-34
- **Risk Tier Default**: Red (always requires licensed attorney sign-off)

### Housing (Tenant/Landlord)
- **Scope**: Habitability defense, eviction defense, wrongful foreclosure, TRO filings, landlord recovery of unpaid rent
- **Key statutes**: GA O.C.G.A. § 44-7-13 (habitability); FL Stat. § 83.46 (FL residential LL/T); PTFA (federal tenant protection)
- **Risk Tier Default**: Amber → Red if TRO/injunction required

### Civil Rights
- **Scope**: § 1983 claims, ADA, Title VI/VII, police misconduct, housing discrimination (FHA)
- **Key statutes**: 42 U.S.C. § 1983; 42 U.S.C. § 12101 (ADA); 42 U.S.C. § 3601 (FHA)
- **Risk Tier Default**: Red (§ 1983 has government defendant complexity)

### Post-Conviction
- **Scope**: Sentence reduction motions, rule 3.800 motions, newly discovered evidence, actual innocence claims
- **Risk Tier Default**: Red

---

## 3. International / Sovereign Coverage

### 3.1 International Arbitration (ICC / LCIA / UNCITRAL)

| Forum | Rules | Typical Claim Size | Seat Options |
|---|---|---|---|
| ICC | ICC Rules 2021 | $10M – $3B+ | Paris; London; Singapore; Geneva; NYC |
| LCIA | LCIA Arbitration Rules 2020 | $5M – $1B+ | London (default) |
| UNCITRAL | Model Law 1985 / 2006 amendments | Any size (ad hoc) | Party-designated (SICC, PCA, etc.) |
| PCA | PCA Arbitration Rules 2012 | Sovereign/investm ent | The Hague |

**Compliance Overlays**:
- FATF 40 Recommendations — universal AML floor
- New York Convention 1958 — enforcement in 170+ states
- EDD (Enhanced Due Diligence) required for sovereign or institutional claimants (UBO to natural person)

**Rita Alert Protocol**: Any ICC/LCIA/UNCITRAL intake → automatic Red tier → international arbitration counsel notification

---

### 3.2 ICSID / Bilateral Investment Treaty (BIT) Disputes

| Element | Standard |
|---|---|
| Jurisdiction basis | ICSID Convention Art. 25 — investment + contracting state nationality |
| Key investor protections | FET (Fair and Equitable Treatment), Full Protection and Security, Non-Discrimination, Expropriation |
| Common BIT frameworks | US Model BIT 2012; UK Model BIT; Swiss Model BIT; UNCTAD BIT database (3,300+ BITs) |
| Enforcement | ICSID Convention Art. 54 — binding on all contracting states |
| Sovereign immunity | US FSIA; UN Convention on Jurisdictional Immunities 2004 — post-award enforcement challenge |

**Compliance Overlays**:
- Vienna Convention on the Law of Treaties Arts. 31-32 (treaty interpretation)
- ILC Articles on State Responsibility (attribution of state conduct)
- ICSID Arbitration Rules 2022

**Rita Alert Protocol**: BIT/ICSID intake → Red tier immediately → senior international arbitration review within 24 hours

---

### 3.3 Sovereign Asset Recovery

| Mechanism | Jurisdiction | Key Framework |
|---|---|---|
| Mareva injunction | England & Wales, Hong Kong, Cayman BVI, Singapore | Worldwide freezing order — no prior notice if dissipation risk |
| ADGM asset freeze | Abu Dhabi Global Market | ADGM Courts Procedure Rules 2016 |
| MLAT request | All FATF member states | Mutual Legal Assistance Treaties — bilateral + multilateral |
| UNCAC recovery | 187 states party | UN Convention Against Corruption Arts. 51-59 (asset recovery chapter) |
| AML asset forfeiture | US: 18 U.S.C. § 981; UK: POCA 2002 Pt 5; SG: CDSA | Civil / non-conviction forfeiture |

**Compliance Overlays**:
- FATF R.38 — mutual legal assistance and international cooperation for asset recovery
- UNCAC Arts. 51-59 — international cooperation for asset recovery
- Basel AML Index — country risk scoring for recovery feasibility

**Rita Alert Protocol**: Cross-border asset claim >$1M → Red tier → international litigation counsel review

---

### 3.4 Cross-Border Regulatory Enforcement Defense

| Regulator | Jurisdiction | Key Framework |
|---|---|---|
| ESMA | European Union | MiCA (Reg 2023/1114), MAR (596/2014), AMLD6 |
| FCA | United Kingdom | FSMA 2000, MLR 2017, POCA 2002 |
| MAS | Singapore | PSA 2019, PS(A)A 2021, SFA |
| FSA | Japan | Payment Services Act 2009 (revised 2020), FIEA |
| CIMA | Cayman Islands | SIBA, VASPA 2020, PCA 2019 |
| FSC BVI | British Virgin Islands | SIBA 2010, VASP Act 2022 |
| FINMA | Switzerland | Banking Act, FinSA 2020, AMLA |
| CBUAE / FSRA | UAE / ADGM | UAE AML Decree-Law 20/2018; FSRA MKT Rules |
| SEC / FinCEN / OFAC | United States | Securities Act 1933, BSA, OFAC sanctions |

**Rita Alert Protocol**: Multi-regulator enforcement → Red tier → escalated to compliance + legal counsel panel

---

### 3.5 Sovereign Debt Restructuring

| Element | Standard |
|---|---|
| Primary forums | IMF Debt Sustainability Analysis; Paris Club; London Club; SDRM |
| Holdout creditor tactics | NML Capital v. Argentina pari passu litigation; Elliott v. Peru |
| CAC provisions | Collective Action Clauses — majority binding on all bondholders |
| EU Sovereign Debt | ESM Treaty 2012; ECB OMT programme; ESM Financial Assistance Instrument |
| HIPC / MDRI | IMF-World Bank debt relief initiatives for low-income countries |

**Rita Alert Protocol**: Sovereign debt restructuring intake → Red tier → senior partner + IMF-trained advisor review

---

### 3.6 Treaty Disputes / Public International Law

| Treaty Type | Forum | Key Instruments |
|---|---|---|
| Trade disputes | WTO DSB | WTO Dispute Settlement Understanding (DSU) 1994 |
| Human rights | ICJ, ECtHR, IACHR | ECHR; ACHR; ICCPR |
| Maritime | ITLOS, UNCLOS Annex VII arbitration | UNCLOS 1982 |
| Tax treaties | Competent authority MAP | OECD Model Tax Convention Art. 25; MLI |
| Investment | ICSID, PCA, SCC | ICSID Convention; NAFTA/CUSMA Ch. 14; ECT |

---

### 3.7 Cross-Border Crypto-Asset Fraud Recovery

| Mechanism | Jurisdiction | Framework |
|---|---|---|
| FBI IC3 referral | United States | FBI Internet Crime Complaint Center |
| Interpol / Europol | Multi-state | Project HAECHI; APWG |
| VASP cooperation | FATF member states | FATF R.15 — VASP AML obligations; Travel Rule |
| Blockchain forensics | On-chain (all) | Chainalysis, Elliptic, TRM Labs methodologies |
| Civil claim + TRO | US / UK / Singapore | 18 U.S.C. § 1030 (CFAA); Tort of conversion; Singapore Penal Code s.420 |
| Cross-chain bridge tracing | TRON / ETH / BSC / Polygon | Chain-specific forensics — UNYKORN forensic agent network |

---

## 4. Enhanced Due Diligence Triggers

All international/sovereign intakes with the following characteristics trigger full EDD:

| Trigger | Action |
|---|---|
| Sovereign or government entity as party | PEP (Politically Exposed Person) screening — all instructing officials |
| Claim value >$10M | Independent source of funds verification |
| Claim value >$100M | Big Four auditor confirmation of asset origin |
| Counterparty in FATF high-risk jurisdiction | Enhanced CDD + ongoing monitoring |
| Crypto assets involved >$500K | VASP AML screening + blockchain forensic review |
| BIT / ICSID matter | Sovereign immunity analysis; UN Convention 2004 review |
| OFAC-listed counterparty | Immediate licence-to-transact review; matter suspended pending compliance |
| Multi-jurisdiction asset freeze needed | Mareva feasibility analysis; multi-forum coordination plan |

---

## 5. Polygon On-Chain Anchor — Jurisdiction Metadata

All matters — domestic and international — are anchored on Polygon (chain 137) via CaseAnchor contract.

For international/sovereign matters, the anchor metadata includes:
```json
{
  "caseId": "UC-XXXXXX",
  "caseType": "international_arbitration",
  "forum": "ICC | LCIA | UNCITRAL | ICSID | PCA",
  "seat": "London | Singapore | Paris | Washington DC",
  "governingLaw": "English | Swiss | Singapore | ICSID Convention",
  "complianceFrameworks": ["FATF R.15", "MiCA", "MAS PSA", "ICSID Art.25"],
  "claimValue": "USD 000000000",
  "sovereignParty": true,
  "eddCompleted": true,
  "pepScreeningDate": "2026-XX-XX",
  "anchorHash": "0x...",
  "anchorBlock": 0
}
```

---

## 6. Rita AI — International Intake Routing

When a client selects an international/sovereign case type, Rita applies the following routing logic:

```
caseType ∈ {international_arbitration, icsid_bit, sovereign_asset_recovery,
            cross_border_regulatory, sovereign_debt, treaty_dispute,
            cross_border_crypto_fraud}
  → risk_tier = RED
  → routing = international_arbitration_counsel
  → edd_required = true
  → polygon_anchor_priority = HIGH
  → response_sla = 4 hours (vs. 24 hours domestic)
```

All Red-tier international matters require human legal sign-off before any substantive communication is sent to the client.

---

*This document is maintained by UNYKORN JR Ops compliance team. It does not constitute legal advice in any jurisdiction. Last updated: 2026-04-10.*
