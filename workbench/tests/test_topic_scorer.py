"""Tests for the topic_scorer tool."""

from __future__ import annotations

import csv
import os
import sys
import tempfile
from pathlib import Path

import pytest

# Make workbench importable
_WORKBENCH_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(_WORKBENCH_ROOT))

from tools.topic_scorer.scorer import (
    compute_priority,
    score_competition,
    score_demand,
    score_fit,
    score_monetization,
    score_topic,
)
from tools.topic_scorer.run import main as run_main


# -------------------------------------------------------------------
# 1. Priority score formula
# -------------------------------------------------------------------

class TestPriorityFormula:
    """Verify priority = demand + monetization + fit - competition."""

    def test_basic_formula(self):
        assert compute_priority(7, 8, 3, 9) == 7 + 8 + 9 - 3

    def test_all_ones(self):
        assert compute_priority(1, 1, 1, 1) == 1 + 1 + 1 - 1

    def test_high_competition_yields_lower_priority(self):
        high_comp = compute_priority(5, 5, 10, 5)
        low_comp = compute_priority(5, 5, 1, 5)
        assert low_comp > high_comp

    def test_score_topic_uses_formula(self):
        result = score_topic("AI Chatbots", "AI")
        expected = (
            result["demand_score"]
            + result["monetization_score"]
            + result["fit_score"]
            - result["competition_score"]
        )
        assert result["priority_score"] == expected


# -------------------------------------------------------------------
# 2. Output file creation
# -------------------------------------------------------------------

class TestOutputFileCreation:
    """Verify the tool writes a properly formatted scored CSV."""

    def test_output_file_is_created(self, tmp_path):
        # Write a small input CSV
        input_csv = tmp_path / "topics.csv"
        input_csv.write_text(
            "topic,category\nAI Tools for Business,Business\n"
        )
        output_csv = tmp_path / "scored_topics.csv"

        run_main([str(input_csv), "-o", str(output_csv)])

        assert output_csv.exists()

    def test_output_has_correct_columns(self, tmp_path):
        input_csv = tmp_path / "topics.csv"
        input_csv.write_text(
            "topic,category\nAI Tools for Business,Business\n"
        )
        output_csv = tmp_path / "scored_topics.csv"

        run_main([str(input_csv), "-o", str(output_csv)])

        with open(output_csv, newline="", encoding="utf-8") as fh:
            reader = csv.DictReader(fh)
            assert set(reader.fieldnames) == {
                "topic",
                "category",
                "demand_score",
                "monetization_score",
                "competition_score",
                "fit_score",
                "priority_score",
            }

    def test_output_row_count_matches_input(self, tmp_path):
        input_csv = tmp_path / "topics.csv"
        input_csv.write_text(
            "topic,category\nTopic A,AI\nTopic B,Business\nTopic C,Productivity\n"
        )
        output_csv = tmp_path / "scored_topics.csv"

        run_main([str(input_csv), "-o", str(output_csv)])

        with open(output_csv, newline="", encoding="utf-8") as fh:
            rows = list(csv.DictReader(fh))
        assert len(rows) == 3


# -------------------------------------------------------------------
# 3. Score range validation (1–10)
# -------------------------------------------------------------------

SAMPLE_TOPICS = [
    ("AI Tools for Small Business", "Business"),
    ("Prompt Engineering Basics", "AI"),
    ("Automating Excel with Python", "Productivity"),
    ("Introduction to Machine Learning", "AI"),
    ("Generic Topic", "Uncategorized"),
]


class TestScoreRanges:
    """Every individual score must be an integer in [1, 10]."""

    @pytest.mark.parametrize("topic,category", SAMPLE_TOPICS)
    def test_demand_in_range(self, topic, category):
        s = score_demand(topic, category)
        assert isinstance(s, int)
        assert 1 <= s <= 10

    @pytest.mark.parametrize("topic,category", SAMPLE_TOPICS)
    def test_monetization_in_range(self, topic, category):
        s = score_monetization(topic, category)
        assert isinstance(s, int)
        assert 1 <= s <= 10

    @pytest.mark.parametrize("topic,category", SAMPLE_TOPICS)
    def test_competition_in_range(self, topic, category):
        s = score_competition(topic, category)
        assert isinstance(s, int)
        assert 1 <= s <= 10

    @pytest.mark.parametrize("topic,category", SAMPLE_TOPICS)
    def test_fit_in_range(self, topic, category):
        s = score_fit(topic, category)
        assert isinstance(s, int)
        assert 1 <= s <= 10
