# Product Plan: Brand-Aware AI Google Review Assistant

**Working name:** ReviewCanvas (name can change)  
**Product promise:** Help real customers express their own experience clearly and quickly, then take them to the business's Google review form—without filtering feedback, inventing claims, or posting on their behalf.

## 1. The product idea

A business creates a branded QR code for each location. A customer scans it and lands on a fast, mobile-first page. The page helps them turn a few things they actually experienced into an optional, editable review draft. The customer then chooses whether to open Google, reviews/edits the draft, chooses their own stars on Google, and submits it themselves.

The AI can adapt the *writing prompts* to the customer's intended rating and the business category, but it must not decide the rating, write unsupported claims, or change the route based on the rating. Every customer gets the same Google review destination and the same ability to leave an honest review—including a critical one.

### Important product distinction

The business's brand profile can shape the helper's tone, terminology, language, and visual design. It should **not** turn a customer review into business advertising. The review must remain in the customer's voice and reflect only details the customer confirms.

## 2. Recommended customer journey

1. **Scan:** Customer scans a location-specific QR code on a receipt, table card, package, or follow-up message.
2. **Identify the business:** Landing page shows the correct business/location, logo, and a simple request: “Share an honest account of your experience.”
3. **Choose how to write:** Customer can select an intended star rating (1–5) *for draft guidance only*, or skip this step. This is not represented as their Google rating and is not sent to Google.
4. **Add real details:** Offer a few optional, business-specific prompts, such as “What stood out?”, “What could have been better?”, or selectable service attributes. The customer can skip any prompt. No account or personal information should be required.
5. **Generate options:** AI offers a few short, editable draft variants using only the customer's selected facts. For a low rating, it helps state the problem clearly and respectfully; for a high rating, it helps describe what went well. It must not add details or pressure the customer to change their score.
6. **Review and edit:** Customer can edit, copy, discard, or start again. Clearly label AI text as a **draft suggestion** and remind the customer to keep only what is true to their experience.
7. **Go to Google:** One consistent button opens the location's Google review form. The customer chooses their own Google stars, reviews or rewrites the text, and submits it directly to Google.
8. **Optional close:** Show a neutral thank-you. Do not reward reviews, request proof of posting, or send low-rating customers to a private complaint channel instead.

**Fallback:** If the customer does not want AI help, offer a direct “Write a review on Google” button immediately.

## 3. Innovation that is useful and defensible

- **Fact-first drafting:** The AI asks for two or three concrete details before drafting; it does not generate generic praise or make up events.
- **Five-star-neutral writing support:** Each intended rating has a balanced writing mode, including constructive language for 1–3 stars. No score is treated as a failed conversion.
- **Brand-aware, customer-voiced:** Businesses configure their service names, supported languages, reading level, and visual identity. The AI avoids marketing slogans and keeps the review in first-person customer language.
- **Adaptive prompts by industry:** A restaurant can ask about food, service, and atmosphere; a clinic might ask about communication and scheduling; a repair business could ask about timeliness and workmanship. Prompts are optional and not used to screen customers.
- **Multilingual drafting:** Customer chooses the language; drafts can be translated or simplified while remaining editable. The customer selects the language they want to publish.
- **Privacy-light by design:** Do not require name, email, phone, order number, Google login, or proof of purchase just to draft. Default to deleting session text after a short period; collect aggregate product analytics only with suitable notice and consent.
- **Learning loop for the business:** Dashboard summarizes recurring themes in the business's own feedback and review data. It should highlight operational improvements, not coach staff to solicit only positive reviews.

## 4. Google policy and integration guardrails

This product should be built around these constraints:

- **No review gating:** Never show Google only to people who selected 4–5 stars, and never divert 1–3-star customers to a private feedback form instead. All customers must receive the same public-review opportunity and Google destination.
- **No incentives:** Do not offer discounts, gifts, contest entries, loyalty points, or other benefits for posting, changing, or removing a review.
- **No posting for the customer:** Do not use a bot, API, or automation to create, edit, or submit a customer's Google review. The customer must choose their stars, own the text, and submit it in Google's interface.
- **No preselected Google stars:** Any in-app star selector is a writing aid only. It must not claim to be the Google rating, send the selected rating to Google, or prevent the customer from changing their mind on Google.
- **No fabricated content:** The AI can only use details the customer supplies or affirmatively selects. Avoid fabricated first-person experiences, repetitive bulk templates, keyword stuffing, and promotional language.
- **Business Profile API scope:** Official API docs describe listing/retrieving reviews and replying to them; they do not document an API operation for submitting a customer review. Use Google's review link/form for customer submission.
- **Owner authorization for replies:** Any reply made through the Business Profile API needs the business owner's authorization. Do not auto-publish replies. Draft replies for owner review and require an explicit publish action for each reply.
- **API access is gated:** Google currently asks API applicants to manage a verified, active Business Profile for 60+ days and have a website for the listed business, then apply for access. Approval is not guaranteed and should be an early project milestone.
- **Use OAuth, not passwords:** Let the authorized business owner connect their Google account with OAuth. Never collect or store Google passwords. Be clear about what the tool reads and changes.

## 5. Google integration: what “integrate” means

This is normally an **external SaaS connected to Business Profile**, not an app installed inside the Google Business Profile dashboard.

### Phase 1 — QR and review link (no GBP API dependency)

- Business owner enters the public Google review link for each location, or follows instructions to obtain it from Business Profile.
- The product creates a branded QR code that points to the assistant landing page.
- After the writing helper, the customer is sent to the official Google review form.
- This version can be tested while Google API access is pending.

### Phase 2 — Google account connection (after approval)

- OAuth connection lets an authorized owner select and manage locations.
- Import review data for a reviews dashboard, subject to Google's API terms and data-retention rules.
- Prepare suggested owner replies and let an authorized user explicitly approve and publish each one.
- Provide disconnection, access revocation, and deletion controls.

### Phase 3 — Multi-location operations

- Location-level QR codes, brand/language settings, user roles, reply approvals, and roll-up analytics.
- Agency support with explicit authorization per client and transparent notices for account changes.
- Keep API content storage within Google's permitted limits; design data handling only after legal/policy review.

## 6. Two implementation approaches

| Approach | Tradeoffs | Cost | Setup complexity |
|---|---|---|---|
| **Lean pilot: branded QR + hosted review helper + Google review link** | Fastest validation; no GBP API approval required; businesses provide their review link manually. No synchronized reviews or reply dashboard at first. | Low to moderate; hosting, QR/branding, and AI usage. | Low |
| **Connected platform: OAuth + approved Business Profile API + review dashboard** | More valuable for multi-location operators; can retrieve reviews and support owner-approved replies. Depends on Google's API approval, OAuth verification/security work, and ongoing policy compliance. Still cannot submit customer reviews. | Moderate to high; engineering, cloud, AI, security, and support costs. | High |

**Recommendation:** Pilot the lean version first, but design the data model and consent flow so API connection can be added later. Apply for Business Profile API access early in parallel because approval prerequisites can affect the schedule.

## 7. MVP scope (first 6–8 weeks, estimate)

### Include

- Business onboarding: name, category, logo/colors, language, service vocabulary, and Google review link.
- QR code generation per location, with editable landing-page URL.
- Responsive customer page with direct Google option, optional star-guided draft, factual prompt chips, and 2–3 editable drafts.
- AI safeguards: no unsupported facts, no promotional review copy, no pressure to raise a score, and clear customer control.
- Basic dashboard: QR scans, helper starts, Google-link clicks, language usage, and aggregate prompt themes where privacy-safe.
- Admin controls: edit brand/location details, pause a QR, export/delete settings, and set data-retention preferences.
- Manual review-link verification checklist and policy-compliant usage terms.

### Do not include in MVP

- Automated customer review posting or Google-star prefill.
- Rating-based routing or private recovery path for unhappy customers.
- Incentives or “review completed” verification.
- Auto-replies to Google reviews.
- Scraping Google Maps or unofficial review-data collection.

## 8. Suggested system design

- **Customer frontend:** Mobile-first web page opened from a QR scan; no install required.
- **Business admin:** Multi-tenant dashboard for locations, brand settings, review links, QR codes, permissions, and analytics.
- **Backend:** Secure API for tenant/location configuration, signed QR/session identifiers, draft requests, analytics, and later OAuth/API integration.
- **AI layer:** Structured generation request with category, language, customer-selected rating intent (optional), selected factual details, and strict “use only these facts” instructions. Apply output checks before display; customer edits remain authoritative.
- **Storage:** Store business configuration and minimal operational data. Avoid storing raw customer drafts unless the customer explicitly opts in for a clear purpose. Set deletion/retention rules before launch.
- **Google:** Official review URL for customer action. Approved Business Profile API only for supported owner-side features, such as review retrieval and owner-authorized replies.
- **Security:** Tenant isolation, encrypted secrets/tokens, least-privilege access, audit trail for account changes and reply publishing, rate limits, and a way to revoke OAuth access.

## 9. Success measures

Measure usefulness and trust—not just the number of five-star reviews:

- QR scan → helper start rate.
- Helper start → outbound Google click rate, reported in aggregate and **not segmented into different review destinations by rating**.
- Draft acceptance/edit rate and time-to-complete.
- Customer abandonment and accessibility/language usage.
- Draft factuality and policy-safety audit rate.
- Business retention and reported reduction in staff effort.
- Review sentiment balance and recurring operational themes, without treating critical reviews as failures.

Do not promise a target increase in positive ratings. The product's claim should be that it reduces friction for customers who choose to share honest feedback.

## 10. Launch checklist

1. Confirm the brand name, target vertical, initial market, and privacy requirements.
2. Build and pilot the QR landing page with a small number of willing businesses.
3. Test every star path to confirm identical access to Google and no sentiment-based routing.
4. Test AI outputs for fabricated details, coercive wording, and promotional tone.
5. Obtain policy/legal review for the operating market and data flows.
6. Apply for Google Business Profile API access as early as eligibility allows; do not make API approval a dependency for the QR pilot.
7. If approved, complete OAuth consent/security work, test access revocation, and require explicit owner approval for every public reply.
8. Launch with clear terms: the tool is independent software and is not endorsed by Google.

## Official references

- [Google: Create a review link or QR code](https://support.google.com/business/answer/16816815?hl=en)
- [Google: Tips to get more reviews](https://support.google.com/business/answer/3474122?hl=en)
- [Google Business Profile API: Work with review data](https://developers.google.com/my-business/content/review-data)
- [Google Business Profile API: Third-party and other policies](https://developers.google.com/my-business/content/policies)
- [Google Business Profile API: Prerequisites and access request](https://developers.google.com/my-business/content/prereqs)
- [Google Maps user-generated content policies](https://support.google.com/contributionpolicy/answer/7400114?hl=en)

*Prepared 29 September 2026. Google API eligibility and policies can change; re-check the official documentation before implementation.*
