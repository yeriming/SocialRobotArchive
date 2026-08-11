from __future__ import annotations

import unittest

from crawler.news.filters.social_robot_filter import screen_article
from crawler.news.security.response_guard import validate_response_headers
from crawler.news.security.url_validator import validate_allowed_url


class TestNewsSecurityAndFilter(unittest.TestCase):
    def test_allowlisted_url(self) -> None:
        ok, _ = validate_allowed_url("https://www.irobotnews.com/rss/allArticle.xml")
        self.assertTrue(ok)

    def test_blocked_url(self) -> None:
        ok, reason = validate_allowed_url("http://127.0.0.1/admin")
        self.assertFalse(ok)
        self.assertIn("host_not_allowlisted", reason)

    def test_response_guard_content_type(self) -> None:
        result = validate_response_headers({"Content-Type": "application/rss+xml"})
        self.assertTrue(result.allowed)

    def test_response_guard_large_payload(self) -> None:
        result = validate_response_headers(
            {"Content-Type": "application/xml", "Content-Length": "999999999"}
        )
        self.assertFalse(result.allowed)

    def test_filter_include(self) -> None:
        result = screen_article(
            "A pediatric social robot interaction trial in hospital settings",
            has_robot_link=False,
            has_manufacturer_link=False,
        )
        self.assertEqual(result.status, "INCLUDE")

    def test_filter_exclude(self) -> None:
        result = screen_article(
            "Factory automation robot arm boosts warehouse logistics",
            has_robot_link=False,
            has_manufacturer_link=False,
        )
        self.assertEqual(result.status, "EXCLUDE")

    def test_filter_review(self) -> None:
        result = screen_article("New robot platform announced", False, False)
        self.assertEqual(result.status, "REVIEW")


if __name__ == "__main__":
    unittest.main()
