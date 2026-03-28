"""CLI entry points for maintenance tasks."""

import asyncio
import logging
import sys


def run_retention() -> None:
    """Delete request records older than the configured retention period."""
    logging.basicConfig(level=logging.INFO)
    from request_server.services.retention import cleanup_expired_requests

    deleted = asyncio.run(cleanup_expired_requests())
    sys.exit(0 if deleted >= 0 else 1)
