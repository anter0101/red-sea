#!/usr/bin/env python3
"""Fail when a Trivy image report contains a high or critical vulnerability."""

import json
import sys
from collections import Counter


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: fail-on-high-image-cves.py REPORT.json ...", file=sys.stderr)
        return 2

    counts: Counter[str] = Counter()
    samples: list[str] = []
    for path in sys.argv[1:]:
        with open(path, encoding="utf-8") as handle:
            report = json.load(handle)
        for result in report.get("Results") or []:
            for vuln in result.get("Vulnerabilities") or []:
                severity = str(vuln.get("Severity") or "UNKNOWN")
                counts[severity] += 1
                if severity in {"HIGH", "CRITICAL"} and len(samples) < 40:
                    samples.append(
                        f"{path}: {vuln.get('VulnerabilityID')} {vuln.get('PkgName')} "
                        f"{vuln.get('InstalledVersion')} {severity}"
                    )

    order = ("CRITICAL", "HIGH", "MEDIUM", "LOW", "UNKNOWN")
    summary = ", ".join(f"{name}={counts[name]}" for name in order if counts[name])
    print(f"Vulnerability counts: {summary or 'none'}")
    for line in samples:
        print(line)
    if counts["CRITICAL"] or counts["HIGH"]:
        print("Critical or high CVEs fail the release. Medium findings stay in the uploaded report.")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
