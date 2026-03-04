# Topic Scorer — SkillPulses Course Prioritization Tool

A command-line tool that evaluates and scores course topic ideas so the SkillPulses content team can prioritize which topics to develop next.

## How the Scoring Works

Each topic is evaluated on four metrics (each scored 1–10):

| Metric | What it measures |
|---|---|
| **Demand Score** | How many people are searching for or discussing the topic. Keywords like *AI*, *automation*, *business*, *python* boost this score. |
| **Monetization Score** | Likelihood the topic leads to a paid course. Keywords like *business*, *marketing*, *analytics*, *automation* boost this score. |
| **Competition Score** | How saturated the space is. Generic keywords like *basics*, *introduction*, *fundamentals* increase this score. |
| **Fit Score** | How well the topic fits SkillPulses' AI-focused platform. Keywords like *AI*, *LLM*, *chatbot*, *productivity* boost this score. |

**Priority Score formula:**

```
Priority Score = Demand + Monetization + Fit − Competition
```

Higher priority scores indicate topics that should be developed first.

## How to Run the Program

### Prerequisites

- Python 3.10+
- pytest (for running tests)

### Running the scorer

From the `workbench/` directory:

```bash
python tools/topic_scorer/run.py data/topics.csv
```

This reads `data/topics.csv` and writes `data/scored_topics.csv`.

You can specify a custom output path:

```bash
python tools/topic_scorer/run.py data/topics.csv -o results/my_scores.csv
```

### Input CSV format

The input CSV must have two columns:

```csv
topic,category
AI Tools for Small Business,Business
Prompt Engineering Basics,AI
```

### Running tests

From the `workbench/` directory:

```bash
python -m pytest tests/ -v
```

## How to Modify Scoring Rules

All keyword lists live at the top of `tools/topic_scorer/scorer.py`:

- `HIGH_DEMAND_KEYWORDS` — keywords that boost the demand score
- `MEDIUM_DEMAND_KEYWORDS` — keywords that moderately boost demand
- `HIGH_MONETIZATION_KEYWORDS` — keywords that boost monetization
- `HIGH_COMPETITION_KEYWORDS` — keywords that increase competition (generic topics)
- `HIGH_FIT_KEYWORDS` — keywords that boost SkillPulses fit

To adjust scoring, edit the keyword lists or change the multipliers inside each `score_*` function. Every score is clamped to the 1–10 range by the `_clamp` helper.

## Logs

Runtime logs are written to `data/logs/topic_scorer.log`.
