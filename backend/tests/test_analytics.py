import pytest
from app.services.analytics_service import calculate_attendance_percentage

def test_attendance_percentage_valid():
    # 45 attended out of 50 held = 90.0%
    result = calculate_attendance_percentage(45, 50)
    assert result == 90.0

def test_attendance_percentage_zero_classes_held_returns_none():
    # MANDATORY RULE from PRD and Knowledge.MD:
    # If Total Classes Held = 0 or no record exists, return "not available" (None), NEVER 0%.
    result = calculate_attendance_percentage(0, 0)
    assert result is None

def test_attendance_percentage_negative_or_missing_returns_none():
    assert calculate_attendance_percentage(None, 50) is None
    assert calculate_attendance_percentage(40, None) is None
    assert calculate_attendance_percentage(10, -5) is None

def test_attendance_percentage_attended_capped_at_held():
    # Classes attended cannot exceed held
    result = calculate_attendance_percentage(60, 50)
    assert result == 100.0
