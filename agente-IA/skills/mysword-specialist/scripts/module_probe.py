#!/usr/bin/env python3
"""
Inspect a MySword/MyBible/SQLite module file without external dependencies.

Usage:
    python module_probe.py path/to/module.mybible
    python module_probe.py path/to/file.SQLite3 --sample 3 --json
"""

import argparse
import json
import sqlite3
from pathlib import Path


def detect_from_name(path: Path) -> dict:
    name = path.name.lower()
    kind = "unknown"
    family = "unknown"

    if ".bbl." in name:
        kind = "bible"
    elif ".cmt." in name:
        kind = "commentary"
    elif ".dct." in name:
        kind = "dictionary"
    elif ".bok." in name:
        kind = "book"
    elif ".jor." in name:
        kind = "journal"

    if name.endswith(".sqlite3") or "module.sqlite3" in name:
        family = "mybible-like"
    elif name.endswith(".mybible") or "module.mybible" in name:
        family = "mysword-like"
    elif name.endswith(".mysword"):
        family = "mysword-like"

    return {"probable_kind": kind, "probable_family": family}


def fetch_tables(conn: sqlite3.Connection) -> list[str]:
    rows = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    ).fetchall()
    return [row[0] for row in rows]


def table_columns(conn: sqlite3.Connection, table: str) -> list[dict]:
    rows = conn.execute(f"PRAGMA table_info([{table}])").fetchall()
    return [
        {
            "cid": row[0],
            "name": row[1],
            "type": row[2],
            "notnull": bool(row[3]),
            "default": row[4],
            "pk": bool(row[5]),
        }
        for row in rows
    ]


def table_count(conn: sqlite3.Connection, table: str) -> int:
    return conn.execute(f"SELECT COUNT(*) FROM [{table}]").fetchone()[0]


def sample_rows(conn: sqlite3.Connection, table: str, limit: int) -> list[dict]:
    cursor = conn.execute(f"SELECT * FROM [{table}] LIMIT ?", (limit,))
    columns = [desc[0] for desc in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


def inspect_database(path: Path, sample: int) -> dict:
    with sqlite3.connect(path) as conn:
        conn.row_factory = sqlite3.Row
        tables = fetch_tables(conn)
        details = None
        if "Details" in tables:
            row = conn.execute("SELECT * FROM [Details] LIMIT 1").fetchone()
            if row is not None:
                details = dict(row)

        report_tables = []
        for table in tables:
            report_tables.append(
                {
                    "name": table,
                    "row_count": table_count(conn, table),
                    "columns": table_columns(conn, table),
                    "sample_rows": sample_rows(conn, table, sample),
                }
            )

    report = {
        "file": str(path),
        "name_detection": detect_from_name(path),
        "details": details,
        "tables": report_tables,
    }
    return report


def render_text(report: dict) -> str:
    lines = []
    lines.append(f"File: {report['file']}")
    lines.append(f"Probable family: {report['name_detection']['probable_family']}")
    lines.append(f"Probable kind: {report['name_detection']['probable_kind']}")
    lines.append("")

    if report["details"]:
        lines.append("Details:")
        for key, value in report["details"].items():
            lines.append(f"  - {key}: {value}")
        lines.append("")

    lines.append(f"Tables: {len(report['tables'])}")
    for table in report["tables"]:
        lines.append(f"- {table['name']} ({table['row_count']} rows)")
        column_names = ", ".join(col["name"] for col in table["columns"])
        lines.append(f"  columns: {column_names}")
        if table["sample_rows"]:
            lines.append("  sample:")
            for row in table["sample_rows"]:
                preview = json.dumps(row, ensure_ascii=False)[:300]
                lines.append(f"    {preview}")
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description="Inspect a MySword/MyBible SQLite module")
    parser.add_argument("file", help="Path to a SQLite-backed module file")
    parser.add_argument("--sample", type=int, default=3, help="Sample rows per table")
    parser.add_argument("--json", action="store_true", help="Output JSON")
    args = parser.parse_args()

    path = Path(args.file).expanduser().resolve()
    if not path.exists():
        raise SystemExit(f"File not found: {path}")

    report = inspect_database(path, args.sample)
    if args.json:
        print(json.dumps(report, indent=2, ensure_ascii=False))
    else:
        print(render_text(report))


if __name__ == "__main__":
    main()
