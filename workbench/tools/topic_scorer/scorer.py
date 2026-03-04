"""Keyword-based scoring heuristics for course topic evaluation."""

from __future__ import annotations

# ---------------------------------------------------------------------------
# Keyword pools – edit these to tune the heuristics
# ---------------------------------------------------------------------------

HIGH_DEMAND_KEYWORDS = [
    "ai", "automation", "business", "machine learning", "data",
    "chatbot", "llm", "marketing", "analytics", "python",
]

MEDIUM_DEMAND_KEYWORDS = [
    "productivity", "remote", "excel", "reports", "visualization",
]

HIGH_MONETIZATION_KEYWORDS = [
    "business", "marketing", "analytics", "automation", "ai",
    "enterprise", "saas", "consulting",
]

HIGH_COMPETITION_KEYWORDS = [
    "basics", "introduction", "fundamentals", "beginner", "101",
    "getting started",
]

HIGH_FIT_KEYWORDS = [
    "ai", "automation", "llm", "chatbot", "machine learning",
    "prompt", "python", "productivity", "data",
]

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _clamp(value: int, low: int = 1, high: int = 10) -> int:
    """Clamp *value* to the [low, high] range."""
    return max(low, min(high, value))


def _keyword_hits(text: str, keywords: list[str]) -> int:
    """Return how many *keywords* appear in *text* (case-insensitive)."""
    text_lower = text.lower()
    return sum(1 for kw in keywords if kw in text_lower)


# ---------------------------------------------------------------------------
# Individual scoring functions
# ---------------------------------------------------------------------------


def score_demand(topic: str, category: str) -> int:
    """Score how many people are searching for / discussing the topic."""
    combined = f"{topic} {category}"
    hits = _keyword_hits(combined, HIGH_DEMAND_KEYWORDS)
    hits += _keyword_hits(combined, MEDIUM_DEMAND_KEYWORDS) * 0.5
    base = 3 + int(hits * 2)
    return _clamp(base)


def score_monetization(topic: str, category: str) -> int:
    """Score the likelihood the topic leads to a paid course."""
    combined = f"{topic} {category}"
    hits = _keyword_hits(combined, HIGH_MONETIZATION_KEYWORDS)
    base = 3 + int(hits * 2.5)
    return _clamp(base)


def score_competition(topic: str, category: str) -> int:
    """Score how saturated the topic already is with existing courses."""
    combined = f"{topic} {category}"
    hits = _keyword_hits(combined, HIGH_COMPETITION_KEYWORDS)
    base = 3 + hits * 3
    return _clamp(base)


def score_fit(topic: str, category: str) -> int:
    """Score how well the topic fits SkillPulses (AI-focused platform)."""
    combined = f"{topic} {category}"
    hits = _keyword_hits(combined, HIGH_FIT_KEYWORDS)
    base = 2 + int(hits * 2)
    return _clamp(base)


# ---------------------------------------------------------------------------
# Composite score
# ---------------------------------------------------------------------------


def compute_priority(
    demand: int,
    monetization: int,
    competition: int,
    fit: int,
) -> int:
    """Priority = demand + monetization + fit − competition."""
    return demand + monetization + fit - competition


def score_topic(topic: str, category: str) -> dict:
    """Return all scores for a single topic as a dict."""
    demand = score_demand(topic, category)
    monetization = score_monetization(topic, category)
    competition = score_competition(topic, category)
    fit = score_fit(topic, category)
    priority = compute_priority(demand, monetization, competition, fit)

    return {
        "topic": topic,
        "category": category,
        "demand_score": demand,
        "monetization_score": monetization,
        "competition_score": competition,
        "fit_score": fit,
        "priority_score": priority,
    }
