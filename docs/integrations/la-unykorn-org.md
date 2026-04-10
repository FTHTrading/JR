# LA Integration Blueprint

## Endpoint Status

- Public site: https://la.unykorn.org/
- Current status: live (HTTP 200)
- Hosting signal: Vercel

## What LA Already Does Well

- Strong family-crisis positioning and urgency language
- Clear disclaimer boundary: not a law firm, no legal advice
- Structured intake entrypoint at /intake
- Clear value narrative around timeline, evidence, and packetization
- Affordable access model with hardship option

## Strategic Role Split

### LA (Front Door)

- Public brand and trust surface
- Demand capture and free review intake
- Consumer education and urgency conversion
- Family-first messaging and hotline calls to action

### JR (Ops Brain)

- Triage scoring and case normalization
- Timeline and evidence index generation
- Missing-document detection
- Packet build for advocate and attorney handoff
- Red-tier escalation governance and audit quality gates

## Operational Flow

```mermaid
flowchart LR
    A[LA Public Intake] --> B[JR Intake Queue]
    B --> C{Urgency Tier}
    C -->|Green| D[Standard Packet 24h]
    C -->|Amber| E[Priority Packet Same Day]
    C -->|Red| F[Rapid Packet 2-6h + Human Review]
    D --> G[Advocate/Attorney Handoff]
    E --> G
    F --> H[Licensed Counsel Review]
    H --> G

    style A fill:#E3FAFC,stroke:#0B7285,stroke-width:2px
    style B fill:#E7F5FF,stroke:#1C7ED6,stroke-width:2px
    style C fill:#FFF3BF,stroke:#F08C00,stroke-width:2px
    style D fill:#EBFBEE,stroke:#2B8A3E,stroke-width:2px
    style E fill:#FFF9DB,stroke:#E67700,stroke-width:2px
    style F fill:#FFF5F5,stroke:#C92A2A,stroke-width:2px
    style H fill:#FFE3E3,stroke:#A61E4D,stroke-width:2px
    style G fill:#F4FCE3,stroke:#5C940D,stroke-width:2px
```

## Immediate Integration Checklist

1. Mirror LA intake fields into JR intake form schema.
2. Define routing contract: LA submission ID -> JR lead ID.
3. Configure first-response SLA by tier.
4. Enable red-tier mandatory human legal review before final output.
5. Add packet completion status back to LA client-facing status page.

## Data Contract (Minimum)

- lead_source: la.unykorn.org
- lead_external_id: LA form submission id
- person_name
- contact_email
- contact_phone
- state
- county
- case_type
- narrative_raw
- deadlines_raw
- urgency_precheck
- consent_acknowledged

## Suggested KPIs

- Time to first response
- Intake to packet completion time
- Red-tier counsel review rate
- Intake to retained counsel conversion rate
- Family satisfaction score after first packet delivery

## Risk Controls

- No definitive legal advice in JR-generated outputs
- Automatic disclaimer insertion on all outbound packet summaries
- Counsel sign-off required for red-tier release
- Full source traceability for every factual claim
