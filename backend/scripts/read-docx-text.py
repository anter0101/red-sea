import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"


def main() -> None:
    with zipfile.ZipFile(r"d:\antoor\Red Sea.docx") as z:
        xml = z.read("word/document.xml").decode("utf-8")
    root = ET.fromstring(xml)
    parts: list[str] = []
    for t in root.iter(f"{{{W_NS}}}t"):
        if t.text:
            parts.append(t.text)
        if t.tail:
            parts.append(t.tail)
    full = "".join(parts)
    out = []
    for line in re.split(r"[\r\n]+", full):
        line = line.strip()
        if line:
            out.append(line)
    Path(r"d:\antoor\red-sea\_docx_extracted_text.txt").write_text(
        "\n".join(out), encoding="utf-8"
    )


if __name__ == "__main__":
    main()
