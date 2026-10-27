#!/usr/bin/env python3
"""Write the registry digests the VPS must pull."""

import json
import os
import sys


def required(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        print(f"Missing {name}", file=sys.stderr)
        raise SystemExit(1)
    return value


def main() -> int:
    release_tag = os.environ.get("RELEASE_TAG", "").strip()
    document = {
        "backend": required("BACKEND_REF"),
        "frontend": required("FRONTEND_REF"),
        "backendImageId": required("BACKEND_ID"),
        "frontendImageId": required("FRONTEND_ID"),
        "gitSha": required("GIT_SHA"),
        "releaseTag": release_tag or None,
    }
    with open("release-digests.json", "w", encoding="utf-8") as handle:
        json.dump(document, handle, indent=2)
        handle.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
