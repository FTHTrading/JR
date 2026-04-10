# Risk Tiering

## Tier Definitions

- Green: Low-risk administrative and informational outputs.
- Amber: Potentially sensitive outputs requiring policy constraints and stronger validation.
- Red: Legal, regulatory, contractual, or high-liability outputs requiring human approval.

## Control Matrix

| Tier | Automation | Required Review | Release Rule |
|---|---|---|---|
| Green | Full draft allowed | Optional peer review | Can release with audit log |
| Amber | Constrained draft | Required policy review | Release after reviewer check |
| Red | Draft only | Required legal reviewer | Release only after legal sign-off |

## Escalation Triggers

- Mentions of litigation, claims, subpoenas, sanctions, or regulatory filing.
- Jurisdiction-specific legal interpretation requests.
- Any request that asks for definitive legal advice.
