# Risk Tiering

## Tier Definitions

- Green: Low-risk administrative and informational outputs.
- Amber: Potentially sensitive outputs requiring policy constraints and stronger validation.
- Red: Legal, regulatory, contractual, or high-liability outputs requiring human approval.
- **Sovereign / International (Red+)**: All international arbitration, BIT, and sovereign matters. Treated as Red tier with additional EDD controls, 4-hour SLA, and mandatory senior counsel review before any client communication.

## Control Matrix

| Tier | Automation | Required Review | Release Rule |
|---|---|---|---|
| Green | Full draft allowed | Optional peer review | Can release with audit log |
| Amber | Constrained draft | Required policy review | Release after reviewer check |
| Red | Draft only | Required legal reviewer | Release only after legal sign-off |
| Sovereign / International (Red+) | Draft only | Senior international counsel + compliance officer | Release after counsel sign-off + EDD confirmation + Polygon anchor |

## Escalation Triggers

- Mentions of litigation, claims, subpoenas, sanctions, or regulatory filing.
- Jurisdiction-specific legal interpretation requests.
- Any request that asks for definitive legal advice.

### International / Sovereign Escalation Triggers (Red+)

The following triggers automatically escalate any matter to **Sovereign / International (Red+)** tier regardless of case type selected:

| Trigger | Reason |
|---|---|
| Case type = `international_arbitration`, `icsid_bit`, `sovereign_asset_recovery`, `cross_border_regulatory`, `sovereign_debt`, `treaty_dispute`, `cross_border_crypto_fraud` | Inherent multi-jurisdiction complexity |
| Counterparty is a government entity, ministry, central bank, sovereign wealth fund, or state-owned enterprise | PEP exposure; sovereign immunity considerations |
| Claim value ≥ $10M USD (or equivalent) | Enhanced due diligence; source of funds verification required |
| Matter involves asset freeze (Mareva injunction, OFAC block, MLAT, ADGM freeze) | Cross-border enforcement complexity |
| Any FATF high-risk or monitored jurisdiction counterparty | Heightened AML/CFT obligations |
| Matter involves crypto assets ≥ $500K | VASP AML + blockchain forensic review required |
| Sanctions hit on any party screening (OFAC SDN, UN List, EU List, OFSI, CBUAE) | Immediate suspension + compliance licence-to-transact review |
| ICC, LCIA, UNCITRAL, ICSID, PCA arbitration referenced | Full international arbitration counsel routing |

## Sovereign / International (Red+) Mandatory Controls

1. **EDD (Enhanced Due Diligence)**: PEP screening, source of funds, beneficial ownership to natural person level
2. **FATF Risk Assessment**: Country risk + product risk + client risk composite score
3. **Polygon Anchor Priority**: HIGH — on-chain hash within 1 hour of intake submission
4. **Response SLA**: 4 hours (vs. 24 hours for standard Red)
5. **Counsel Routing**: Senior international arbitration counsel + compliance officer
6. **Communication Hold**: No substantive response to client until counsel sign-off
7. **KYC/AML Refresh**: Triggered at every major procedural milestone (filing, hearing, award)

