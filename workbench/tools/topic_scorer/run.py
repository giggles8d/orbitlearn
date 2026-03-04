#!/usr/bin/env python3
"""CLI entry point for the topic_scorer tool.

Usage:
    python tools/topic_scorer/run.py data/topics.csv
"""

from __future__ import annotations

import argparse
import csv
import logging
import os
import sys
from pathlib import Path

# Ensure the workbench root is importable when running as a script.
_WORKBENCH_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(_WORKBENCH_ROOT))

from tools.topic_scorer.scorer import score_topic  # noqa: E402

OUTPUT_COLUMNS = [
    "topic",
    "category",
    "demand_score",
    "monetization_score",
    "competition_score",
    "fit_score",
    "priority_score",
]


# ---------------------------------------------------------------------------
# Logging setup
# ---------------------------------------------------------------------------

def _setup_logging() -> logging.Logger:
    """Configure logging to file and console."""
    log_dir = _WORKBENCH_ROOT / "data" / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / "topic_scorer.log"

    logger = logging.getLogger("topic_scorer")
    logger.setLevel(logging.DEBUG)

    # File handler
    fh = logging.FileHandler(log_file)
    fh.setLevel(logging.DEBUG)
    fh.setFormatter(
        logging.Formatter("%(asctime)s  %(levelname)-8s  %(message)s")
    )
    logger.addHandler(fh)

    # Console handler
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)
    ch.setFormatter(logging.Formatter("%(levelname)-8s  %(message)s"))
    logger.addHandler(ch)

    return logger


# ---------------------------------------------------------------------------
# Core pipeline
# ---------------------------------------------------------------------------

def read_topics(csv_path: str) -> list[dict]:
    """Read the input CSV and return a list of row dicts."""
    with open(csv_path, newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        rows = list(reader)
    return rows


def score_all(rows: list[dict], logger: logging.Logger) -> list[dict]:
    """Score every topic row and return enriched dicts."""
    results: list[dict] = []
    for row in rows:
        topic = row["topic"].strip()
        category = row["category"].strip()
        scored = score_topic(topic, category)
        logger.debug(
            "Scored %-40s  D=%d  M=%d  C=%d  F=%d  P=%d",
            topic,
            scored["demand_score"],
            scored["monetization_score"],
            scored["competition_score"],
            scored["fit_score"],
            scored["priority_score"],
        )
        results.append(scored)
    return results


def write_output(results: list[dict], output_path: str) -> None:
    """Write scored results to a CSV file."""
    with open(output_path, "w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=OUTPUT_COLUMNS)
        writer.writeheader()
        writer.writerows(results)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Score course topics for SkillPulses.",
    )
    parser.add_argument(
        "input_csv",
        help="Path to the input topics CSV file.",
    )
    parser.add_argument(
        "-o", "--output",
        default=None,
        help="Path to the output scored CSV file (default: data/scored_topics.csv).",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = parse_args(argv)
    logger = _setup_logging()

    input_path = args.input_csv
    output_path = args.output or os.path.join(
        os.path.dirname(input_path), "scored_topics.csv"
    )

    logger.info("Reading topics from %s", input_path)
    rows = read_topics(input_path)
    logger.info("Loaded %d topics", len(rows))

    results = score_all(rows, logger)

    write_output(results, output_path)
    logger.info("Wrote scored output to %s", output_path)


if __name__ == "__main__":
    main()
