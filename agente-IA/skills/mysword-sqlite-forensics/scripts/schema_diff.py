#!/usr/bin/env python3
"""Compare SQLite schemas and row counts for two databases."""

from __future__ import annotations

import sqlite3
import sys
from pathlib import Path


def load_schema(db_path: Path) -> dict[str, dict[str, object]]:
    conn = sqlite3.connect(str(db_path))
    try:
        tables = [
            row[0]
            for row in conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
            )
        ]
        result: dict[str, dict[str, object]] = {}
        for table in tables:
            columns = [
                {
                    "name": row[1],
                    "type": row[2],
                    "notnull": bool(row[3]),
                    "default": row[4],
                    "pk": bool(row[5]),
                }
                for row in conn.execute(f"PRAGMA table_info('{table}')")
            ]
            row_count = conn.execute(f"SELECT COUNT(*) FROM '{table}'").fetchone()[0]
            result[table] = {"columns": columns, "row_count": row_count}
        return result
    finally:
        conn.close()


def format_column(column: dict[str, object]) -> str:
    bits = [str(column["name"]), str(column["type"] or "")]
    if column["pk"]:
        bits.append("PK")
    if column["notnull"]:
        bits.append("NOT NULL")
    if column["default"] is not None:
        bits.append(f"DEFAULT={column['default']}")
    return " ".join(part for part in bits if part)


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: schema_diff.py <left.db> <right.db>", file=sys.stderr)
        return 2

    left = Path(sys.argv[1])
    right = Path(sys.argv[2])
    if not left.exists() or not right.exists():
        print("Both database files must exist.", file=sys.stderr)
        return 2

    left_schema = load_schema(left)
    right_schema = load_schema(right)

    left_tables = set(left_schema)
    right_tables = set(right_schema)

    print(f"Left : {left}")
    print(f"Right: {right}")
    print()

    only_left = sorted(left_tables - right_tables)
    only_right = sorted(right_tables - left_tables)
    shared = sorted(left_tables & right_tables)

    if only_left:
        print("Tables only in left:")
        for table in only_left:
            print(f"  - {table}")
        print()

    if only_right:
        print("Tables only in right:")
        for table in only_right:
            print(f"  - {table}")
        print()

    for table in shared:
        left_info = left_schema[table]
        right_info = right_schema[table]
        left_cols = {col["name"]: col for col in left_info["columns"]}  # type: ignore[index]
        right_cols = {col["name"]: col for col in right_info["columns"]}  # type: ignore[index]
        left_names = set(left_cols)
        right_names = set(right_cols)
        changed = False

        if left_info["row_count"] != right_info["row_count"]:
            if not changed:
                print(f"Table: {table}")
                changed = True
            print(f"  Row count: {left_info['row_count']} -> {right_info['row_count']}")

        for name in sorted(left_names - right_names):
            if not changed:
                print(f"Table: {table}")
                changed = True
            print(f"  Column only in left : {format_column(left_cols[name])}")

        for name in sorted(right_names - left_names):
            if not changed:
                print(f"Table: {table}")
                changed = True
            print(f"  Column only in right: {format_column(right_cols[name])}")

        for name in sorted(left_names & right_names):
            left_desc = format_column(left_cols[name])
            right_desc = format_column(right_cols[name])
            if left_desc != right_desc:
                if not changed:
                    print(f"Table: {table}")
                    changed = True
                print(f"  Column changed     : {left_desc} -> {right_desc}")

        if changed:
            print()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
