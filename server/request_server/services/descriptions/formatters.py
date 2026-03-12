"""Markup format converters for ticket system descriptions.

Descriptions are built in standard Markdown. Each ticket system adapter
uses a formatter to convert to its native format before sending.
"""

from __future__ import annotations

import re
from abc import ABC, abstractmethod


class MarkupFormatter(ABC):
    """Converts internal Markdown to a ticket system's native format."""

    @abstractmethod
    def convert(self, markdown: str) -> str:
        """Convert markdown text to the target format."""
        ...


class MarkdownPassthroughFormatter(MarkupFormatter):
    """Returns markdown as-is. For systems that accept markdown natively."""

    def convert(self, markdown: str) -> str:
        return markdown


class JiraMarkupFormatter(MarkupFormatter):
    """Converts Markdown to Jira wiki markup.

    Handles headings, bold, italic, links, images, code blocks,
    horizontal rules, blockquotes/warning panels, and ordered/unordered lists.
    """

    def convert(self, markdown: str) -> str:
        lines = markdown.split("\n")
        result: list[str] = []
        i = 0

        while i < len(lines):
            line = lines[i]

            # Fenced code blocks (``` or ```text -> {code} or {noformat})
            if line.startswith("```"):
                lang = line[3:].strip()
                block_lines: list[str] = []
                i += 1
                while i < len(lines) and not lines[i].startswith("```"):
                    block_lines.append(lines[i])
                    i += 1
                content = "\n".join(block_lines)
                if lang == "text":
                    result.append(f"{{noformat}}{content}{{noformat}}")
                else:
                    result.append(f"{{code}}{content}{{code}}")
                i += 1  # skip closing ```
                continue

            # Warning panel (blockquote with WARNING)
            if line.startswith("> **WARNING:**"):
                panel_lines = [line[2:]]  # strip "> "
                i += 1
                while i < len(lines) and lines[i].startswith("> "):
                    panel_lines.append(lines[i][2:])
                    i += 1
                panel_content = "\n".join(panel_lines)
                panel_content = self._convert_inline(panel_content)
                result.append(f"{{panel:bgColor=#ffffcc}}\n{panel_content}\n{{panel}}")
                continue

            # Headings (## -> h2.)
            heading_match = re.match(r"^(#{1,6})\s+(.+)$", line)
            if heading_match:
                level = len(heading_match.group(1))
                text = heading_match.group(2)
                result.append(f"h{level}. {text}")
                i += 1
                continue

            # Horizontal rule
            if line.strip() == "---":
                result.append("----")
                i += 1
                continue

            # HTML img tag -> Jira image
            img_match = re.match(
                r'^<img\s+src="([^"]+)"\s+width="(\d+)"\s+height="(\d+)"\s*/?>$',
                line.strip(),
            )
            if img_match:
                url, width, height = img_match.groups()
                result.append(f"!{url}|width={width},height={height}!")
                i += 1
                continue

            # Markdown image ![alt](url) -> Jira image
            img_md_match = re.match(r"^!\[([^\]]*)\]\(([^)]+)\)$", line.strip())
            if img_md_match:
                url = img_md_match.group(2)
                result.append(f"!{url}!")
                i += 1
                continue

            # Unordered list items (* item)
            if line.startswith("- "):
                result.append(f"* {self._convert_inline(line[2:])}")
                i += 1
                continue

            # Ordered list items (1. item -> # item)
            ordered_match = re.match(r"^\d+\.\s+(.+)$", line)
            if ordered_match:
                result.append(f"# {self._convert_inline(ordered_match.group(1))}")
                i += 1
                continue

            # Regular line - convert inline formatting
            result.append(self._convert_inline(line))
            i += 1

        return "\n".join(result)

    def _convert_inline(self, text: str) -> str:
        """Convert inline Markdown formatting to Jira wiki markup."""
        # Bold: **text** -> *text*
        text = re.sub(r"\*\*([^*]+)\*\*", r"*\1*", text)

        # Italic: _text_ -> _text_ (same in Jira)
        # No conversion needed

        # Links: [text](url) -> [text|url]
        text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r"[\1|\2]", text)

        # Inline code: `text` -> {{text}}
        text = re.sub(r"`([^`]+)`", r"{{\1}}", text)

        # User mentions: @username -> [~username] (but not emails like user@domain)
        text = re.sub(r"(?<!\S)@(\w+)", r"[~\1]", text)

        return text
