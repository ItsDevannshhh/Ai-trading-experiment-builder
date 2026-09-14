# TradeLab — AI Trading Experiment Builder

TradeLab is a small AI-native prototype for turning natural-language trading hypotheses into structured, testable experiments.

Instead of treating the LLM as a generic trading chatbot, TradeLab uses AI specifically as an **experiment interpreter**:

> Natural-language hypothesis → Structured experiment → Missing information → Clarification → Final experiment

The prototype focuses on one part of a larger AI-native trading research workflow: **understanding and structuring the user's research question before it reaches a backtesting engine.**

---

## What It Does

A user can enter a question such as:

> "Does buying NIFTY after a 1% fall work better during high-volatility periods?"

TradeLab extracts:

* **Instrument**
* **Timeframe**
* **Entry condition**
* **Exit condition**
* **Holding period**
* **Filters / variables**
* **Research question / intent**

It then validates whether the experiment contains enough information to be considered ready.

If important information is missing or ambiguous, TradeLab asks the user for clarification rather than silently inventing an assumption.

### Example

```text
Instrument: NIFTY
Timeframe: Daily
Entry: NIFTY falls ≥ 1%
Filter: High volatility
Exit: Not specified
Holding period: Not specified
```

The system can then identify that the holding period needs clarification.

---

## Product Flow

```text
User hypothesis
      ↓
AI interpretation
      ↓
Structured experiment
      ↓
Application validation
      ↓
 ┌───────────────┐
 │               │
Incomplete     Ready
 │               │
Clarification    ↓
 │          Backtest-ready
 ↓             definition
Updated experiment
      ↓
   Revalidate
```

The application deliberately separates **interpretation** from **validation**:

* The **LLM** understands the natural-language request.
* The **application** determines whether the resulting experiment is actually complete.
* **Zod** validates structured AI output at runtime.

This prevents the model from being the sole authority on whether an experiment is ready.

---

## Key Product Decisions

### 1. AI is an interpreter, not a trading advisor

TradeLab does not attempt to predict prices, recommend trades, or determine whether a strategy is profitable.

The AI's responsibility is to translate natural language into a structured research experiment.

This keeps the prototype focused on the assignment and creates a clean boundary for eventually connecting a backtesting engine.

### 2. Missing information is not silently assumed

Important experiment parameters such as holding period are not invented when the user hasn't provided them.

For example:

> "Does buying NIFTY after a 1% fall have an edge?"

does not automatically become a 5-day strategy.

Instead, TradeLab asks the user for the missing information.

### 3. Ambiguity is treated separately from missing fields

A field can exist while still being ambiguous.

For example:

> "Buy NIFTY during high volatility."

The system can preserve "high volatility" as a filter while identifying that its meaning may require clarification.

This distinction allows the application to represent:

* missing information
* ambiguous information
* assumptions
* confidence

separately.

### 4. Research outcome ≠ exit condition

A research question such as:

> "Does NIFTY recover the next day after falling 2%?"

contains a research outcome and a holding period, but does not necessarily specify an explicit exit condition.

TradeLab therefore does not incorrectly convert the research question into an exit rule.

### 5. Readiness is deterministic

The final readiness decision is handled by application code.

An experiment is considered ready when required information is present and there are no unresolved blocking ambiguities.

This makes the system more predictable and extensible than relying on an LLM-generated `"ready"` flag.

---

## Architecture

The project uses a feature-first structure:

```text
app/
├── api/
│   └── experiments/
│       ├── analyze/
│       └── clarify/
│
components/
└── ui/

features/
├── ai/
│   ├── prompts/
│   ├── schemas/
│   ├── server/
│   └── types/
│
└── experiments/
    ├── api/
    ├── components/
    ├── schemas/
    ├── types/
    └── utils/

lib/
providers/
```

### Request flow

```text
React UI
   ↓
Experiment API client
   ↓
Next.js API route
   ↓
AI experiment parser
   ↓
Structured output
   ↓
Zod validation
   ↓
Experiment readiness validator
   ↓
UI
```

Clarification follows a similar path:

```text
Missing / ambiguous experiment
          ↓
Clarification UI
          ↓
AI clarification parser
          ↓
Structured clarification
          ↓
Apply clarification
          ↓
Experiment validation
          ↓
Ready / next clarification
```

---

## Technology Stack

* **Next.js** — application framework and API routes
* **React** — UI
* **TypeScript** — type safety
* **Tailwind CSS** — styling
* **shadcn/ui** — UI primitives
* **TanStack Query** — client-side mutation/server-state handling
* **Zod** — runtime schema validation
* **Vercel AI SDK** — structured LLM generation
* **OpenAI-compatible LLM API** — natural-language interpretation
* **Remix Icon** — interface icons
* **Vercel** — deployment

---

## AI Implementation

The LLM is constrained to return a structured experiment rather than free-form text.

The extraction schema contains fields such as:

```ts
{
  instrument,
  timeframe,
  entryCondition,
  exitCondition,
  holdingPeriod,
  filters,
  researchQuestion,
  ambiguities,
  assumptions,
  confidence
}
```

The model is explicitly instructed to:

* extract only information supported by the user's question
* avoid inventing important parameters
* identify ambiguity
* preserve research intent
* distinguish research outcomes from exit conditions
* return structured data

The result is then validated with Zod before being used by the application.

---

## Clarification System

TradeLab asks **one clarification question at a time**.

The current priority is:

1. Missing required information
2. Unresolved ambiguity

The clarification system can also recognize when the user's answer refers to a different experiment field.

For example, if the UI asks:

> "How long would you like to hold the position?"

and the user responds:

> "Sell when it reaches 2% profit."

TradeLab recognizes that the answer is actually an **exit condition** rather than a holding period and asks the user whether to apply that interpretation.

This prevents blindly applying an AI interpretation to the wrong field.

---

## Backtest-Ready Representation

The prototype does not implement a full backtesting engine.

Instead, once structured, the experiment can be represented as a compact backtest definition:

```json
{
  "instrument": "NIFTY",
  "timeframe": "daily",
  "entryCondition": "NIFTY falls ≥ 1%",
  "exitCondition": null,
  "holdingPeriod": {
    "value": 5,
    "unit": "days"
  },
  "filters": [
    "high volatility"
  ]
}
```

The UI provides a JSON view and copy action to demonstrate how this structured representation could eventually be passed to a backtesting service.

This intentionally keeps the scope aligned with the assignment.

---

## UI / UX

The interface is designed around the idea of a focused AI research workspace rather than a generic chatbot.

Key UX principles:

* One primary interaction: enter a research hypothesis
* Structured experiment output
* Clear distinction between ready, missing, and ambiguous information
* One clarification question at a time
* Inline editing of interpreted fields
* Technical JSON representation for future backtesting
* Responsive layout
* Light and dark themes
* Accessible validation and error states

The visual system uses:

* **Merriweather** for editorial/display typography
* **Inter** for interface and body text
* **JetBrains Mono** for technical JSON content

---

## AI Tools Used

AI coding tools were used extensively during development.

### ChatGPT

Used for:

* architecture planning
* product reasoning
* schema design
* validation logic
* AI prompt design
* edge-case analysis
* UX decisions
* code review
* debugging guidance
* README and submission preparation

### AI Coding Agent

Used for:

* implementing repetitive component changes
* UI refinement
* accessibility improvements
* styling iterations
* running lint/type checks
* production verification

### Personally Designed / Reviewed

The core product decisions were intentionally designed and reviewed, including:

* narrowing the product to an AI experiment builder
* experiment schema
* distinction between missing and ambiguous information
* deterministic readiness validation
* clarification priority
* separation of LLM interpretation from application validation
* research outcome vs. exit-condition semantics
* backtest-ready representation
* overall feature-first architecture
* UX flow and product scope

AI-generated code was reviewed and modified throughout development rather than being accepted blindly.

---

## What I Would Improve With More Time

The prototype intentionally stops before becoming a full trading platform.

With more time, I would extend the architecture toward:

### 1. Backtesting engine

Pass the structured experiment into a backtesting service and return:

* returns
* win rate
* drawdown
* sample size
* benchmark comparison
* statistical significance

### 2. Market data layer

Introduce a reliable historical market-data provider and normalize data before running experiments.

### 3. Experiment history

Persist experiments so users can compare previous hypotheses and results.

### 4. Result explanation

After backtesting, use AI to explain the result in plain language while grounding the explanation in actual computed statistics.

### 5. Experiment iteration

Allow users to modify parameters and rerun experiments while maintaining the experiment lineage.

### 6. Stronger semantic validation

Add domain-specific validation for instruments, dates, trading calendars, and conditions before handing experiments to a backtesting engine.

---

## Scope

This prototype intentionally focuses on:

> **Understand → Structure → Clarify → Validate**

rather than attempting to build:

> **Understand → Structure → Backtest → Analyze → Trade**

The larger workflow is the eventual product direction, but keeping this prototype narrow allows the core AI interaction and ambiguity handling to be demonstrated clearly.

---

## Running Locally

### Requirements

* Node.js
* pnpm
* An OpenAI-compatible API key

### Install

```bash
pnpm install
```

### Environment

Create `.env.local`:

```env
AI_API_KEY=your_api_key
AI_API_BASE_URL=your_api_base_url
```

### Development

```bash
pnpm dev
```

Then open:

```text
http://localhost:3000
```

### Production build

```bash
pnpm build
```

---

## Author

**Devansh Yaduvanshi**

Built as an AI Trading Research Assistant mini prototype.
