# -*- coding: utf-8 -*-
"""Extract XI Maths MCQs from Word docs → js/questions.js"""

from __future__ import annotations

import glob
import json
import os
import re
import sys
import xml.etree.ElementTree as ET
from zipfile import ZipFile

sys.path.insert(0, os.path.dirname(__file__))
from answer_key import ANSWERS

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
M = "{http://schemas.openxmlformats.org/officeDocument/2006/math}"

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT_JS = os.path.join(ROOT, "js", "questions.js")
OUT_JSON = os.path.join(ROOT, "js", "questions.json")
DUMP = os.path.join(ROOT, "_extracted")


def local(tag: str) -> str:
    return tag.split("}")[-1] if "}" in tag else tag


def omml_to_text(el: ET.Element) -> str:
    tag = local(el.tag)

    if tag == "t":
        return el.text or ""
    if tag == "r":
        return "".join(omml_to_text(c) for c in el)

    if tag == "sSub":
        base = sub = ""
        for c in el:
            lt = local(c.tag)
            if lt == "e":
                base = omml_to_text(c)
            elif lt == "sub":
                sub = omml_to_text(c)
        return f"{base}_{{{sub}}}" if sub else base

    if tag == "sSup":
        base = sup = ""
        for c in el:
            lt = local(c.tag)
            if lt == "e":
                base = omml_to_text(c)
            elif lt == "sup":
                sup = omml_to_text(c)
        return f"{base}^{{{sup}}}" if sup else base

    if tag == "sSubSup":
        base = sub = supl = ""
        for c in el:
            lt = local(c.tag)
            if lt == "e":
                base = omml_to_text(c)
            elif lt == "sub":
                sub = omml_to_text(c)
            elif lt == "sup":
                supl = omml_to_text(c)
        return f"{base}_{{{sub}}}^{{{supl}}}"

    if tag == "f":
        num = den = ""
        for c in el:
            lt = local(c.tag)
            if lt == "num":
                num = omml_to_text(c)
            elif lt == "den":
                den = omml_to_text(c)
        return f"({num})/({den})"

    if tag == "rad":
        deg = expr = ""
        for c in el:
            lt = local(c.tag)
            if lt == "deg":
                deg = omml_to_text(c).strip()
            elif lt == "e":
                expr = omml_to_text(c)
        if deg and deg not in ("2", ""):
            return f"√[{deg}]({expr})"
        return f"√({expr})"

    if tag == "nary":
        char = "Σ"
        sub = supl = expr = ""
        for c in el.iter():
            if local(c.tag) == "chr":
                for k, v in c.attrib.items():
                    if local(k) == "val":
                        char = v
        for c in el:
            lt = local(c.tag)
            if lt == "sub":
                sub = omml_to_text(c)
            elif lt == "sup":
                supl = omml_to_text(c)
            elif lt == "e":
                expr = omml_to_text(c)
        lim = ""
        if sub or supl:
            lim = f"_{{{sub}}}^{{{supl}}}"
        return f"{char}{lim}{expr}"

    if tag == "d":
        inner = "".join(omml_to_text(c) for c in el if local(c.tag) == "e")
        if not inner:
            inner = "".join(omml_to_text(c) for c in el)
        return f"({inner})"

    if tag == "func":
        name = arg = ""
        for c in el:
            lt = local(c.tag)
            if lt == "fName":
                name = omml_to_text(c)
            elif lt == "e":
                arg = omml_to_text(c)
        return f"{name}({arg})"

    if tag == "acc":
        base = "".join(omml_to_text(c) for c in el if local(c.tag) == "e")
        return f"{base}̄"

    if tag in (
        "oMath",
        "oMathPara",
        "e",
        "num",
        "den",
        "sub",
        "sup",
        "deg",
        "fName",
        "limLow",
        "limUpp",
        "box",
        "eqArr",
        "m",
        "mr",
        "e",
    ):
        return "".join(omml_to_text(c) for c in el)

    if tag.endswith("Pr") or tag in ("ctrlPr",):
        return ""

    return "".join(omml_to_text(c) for c in el)


def para_to_text(p: ET.Element) -> str:
    chunks: list[str] = []
    for child in p:
        tag = local(child.tag)
        if tag == "r":
            for t in child.iter(f"{W}t"):
                chunks.append(t.text or "")
        elif tag in ("oMath", "oMathPara"):
            chunks.append(omml_to_text(child))
        elif tag == "hyperlink":
            chunks.append(para_to_text(child))
    return re.sub(r"[ \t]+", " ", "".join(chunks)).strip()


def extract_doc(path: str) -> list[str]:
    with ZipFile(path) as z:
        root = ET.fromstring(z.read("word/document.xml"))
    body = root.find(f"{W}body")
    if body is None:
        return []
    lines = []
    for p in body.findall(f"{W}p"):
        t = para_to_text(p)
        if t:
            lines.append(t)
    return lines


OPTION_RE = re.compile(
    r"\(A\)\s*(.*?)\s*\(B\)\s*(.*?)\s*\(C\)\s*(.*?)\s*\(D\)\s*(.*?)\s*$",
    re.DOTALL | re.IGNORECASE,
)


def subject_from_filename(name: str) -> str:
    chapter_map = {
        "1": "Complex Numbers",
        "2": "Matrices & Determinants",
        "3": "Vectors",
        "4": "Sequences & Series",
        "5": "Algebra / Polynomials",
    }
    m = re.search(r"EX(\d+)", name, re.I)
    key = m.group(1)[0] if m else "1"
    topic = chapter_map.get(key, "Mathematics")
    label = re.search(r"EX(.+?)(?:\.docx)?$", name, re.I)
    lab = label.group(1).strip() if label else "?"
    return f"XI Maths - Ex {lab} - {topic}"


def stem_file(name: str) -> str:
    return name.replace(".docx", "")


def clean_opt(o: str) -> str:
    o = re.sub(r"\s+", " ", o).strip()
    o = re.split(r"(?=\n\s*\d+\s*[\.\)])", o)[0].strip()
    return o


def parse_inline_mcqs(text: str, source: str) -> list[dict]:
    """Parse numbered/unnumbered MCQs; merge stems with following option lines."""
    subject = subject_from_filename(source)
    qs: list[dict] = []
    lines = [ln.strip() for ln in text.split("\n") if ln.strip()]

    # Merge: "1. stem" + next line "(A)..(D)" → one block
    # Do NOT merge "Choose the correct option" headers into the next MCQ.
    merged: list[str] = []
    i = 0
    while i < len(lines):
        cur = lines[i]
        is_header = bool(re.match(r"(?i)^q?\d*\.?\s*choose the correct", cur))
        if (
            not is_header
            and not OPTION_RE.search(cur)
            and i + 1 < len(lines)
            and OPTION_RE.search(lines[i + 1])
        ):
            merged.append(cur + " " + lines[i + 1])
            i += 2
            continue
        # Sometimes options span 4 lines as (A) (B) (C) (D)
        if (
            not is_header
            and not OPTION_RE.search(cur)
            and i + 4 < len(lines)
            and all(re.match(r"^\([A-D]\)", lines[i + k], re.I) for k in range(1, 5))
        ):
            merged.append(cur + " " + " ".join(lines[i + 1 : i + 5]))
            i += 5
            continue
        merged.append(cur)
        i += 1

    blob = "\n".join(merged)
    # Split on numbered questions
    chunks = re.split(r"(?m)(?=^\s*\d+\s*[\.\)])", blob)
    # Keep unnumbered lines that still contain full option sets (e.g. Ex 3.4)
    for ln in merged:
        if OPTION_RE.search(ln) and not re.match(r"^\s*\d+\s*[\.\)]", ln):
            if ln not in chunks:
                chunks.append(ln)

    seen_opts: set[tuple] = set()
    seen_stem: set[str] = set()
    auto_num = 0
    for part in chunks:
        part = part.strip()
        if not part or re.match(r"(?i)^q?\d*\.?\s*choose the correct", part):
            continue
        om = OPTION_RE.search(part)
        if not om:
            continue
        head = part[: om.start()].strip()
        mnum = re.match(r"^(\d+)\s*[\.\)]\s*(.*)$", head, re.DOTALL)
        if mnum:
            num = int(mnum.group(1))
            stem = mnum.group(2).strip()
        else:
            auto_num += 1
            num = auto_num
            stem = re.sub(r"^[a-z][\.\)]\s*", "", head, flags=re.I).strip()

        stem = re.sub(r"\s+", " ", stem).strip(" :.-")
        opts = [clean_opt(om.group(i)) for i in range(1, 5)]
        if any(len(o) == 0 for o in opts):
            continue
        # Drop option-only fragments (no real stem)
        if len(stem) < 8 or stem.lower().startswith("select the correct"):
            continue

        opt_key = tuple(o.lower() for o in opts)
        stem_key = stem.lower()[:80]
        if opt_key in seen_opts or stem_key in seen_stem:
            continue
        seen_opts.add(opt_key)
        seen_stem.add(stem_key)

        qs.append(
            {
                "source": source,
                "stem_key": stem_file(source),
                "qnum": num,
                "subject": subject,
                "question": stem,
                "options": opts,
            }
        )
    return qs


def parse_list_style(lines: list[str], source: str) -> list[dict]:
    subject = subject_from_filename(source)
    cleaned = [ln.strip() for ln in lines if ln.strip()]
    qs = []
    i = 0
    while i < len(cleaned):
        if re.match(r"(?i)^q?\d*\.?\s*choose", cleaned[i]):
            i += 1
            continue
        if OPTION_RE.search(cleaned[i]):
            i += 1
            continue
        if i + 4 >= len(cleaned):
            break
        qline = cleaned[i]
        opts = cleaned[i + 1 : i + 5]
        if any(OPTION_RE.search(o) for o in opts):
            i += 1
            continue
        if any(re.match(r"^\d+\s*[\.\)]", o) for o in opts):
            i += 1
            continue
        # four option lines
        if all(3 <= len(o) < 180 for o in opts) or all(len(o) < 180 for o in opts):
            # avoid treating mid-question fragments: require qline longer or ends with ?/=
            if len(qline) >= 12 or qline.endswith("?") or qline.endswith("=") or qline.endswith(":"):
                qs.append(
                    {
                        "source": source,
                        "stem_key": stem_file(source),
                        "qnum": len(qs) + 1,
                        "subject": subject,
                        "question": qline,
                        "options": opts,
                    }
                )
                i += 5
                continue
        i += 1
    return qs


def heuristic_answer(q: dict) -> int | None:
    stem = q["question"].lower()
    opts = [o.strip() for o in q["options"]]
    ol = [o.lower() for o in opts]

    def find(*needles: str) -> int | None:
        for i, o in enumerate(ol):
            for n in needles:
                if n.lower() in o:
                    return i
        return None

    def exact(*vals: str) -> int | None:
        for i, o in enumerate(ol):
            if o in [v.lower() for v in vals] or opts[i] in vals:
                return i
        return None

    # Broad conceptual patterns
    rules = [
        (("euler" in stem and "notation" in stem) or ("imaginary unit" in stem), lambda: find("euler")),
        ("x,y" in stem.replace(" ", "") and "where" in stem, lambda: exact("R") or find("r")),
        ("im(z)" in stem.replace(" ", "") and "3+4i" in stem.replace(" ", ""), lambda: exact("4")),
        ("i+i^{2}" in stem.replace(" ", "") or "i+i2" in stem.replace(" ", ""), lambda: exact("0")),
        ("subset of" in stem and "real numbers" in stem, lambda: find("complex")),
        ("denoted by" in stem and "complex" in stem, lambda: exact("C")),
        ("along y-axis" in stem, lambda: find("imaginary")),
        ("real part of complex number is zero" in stem, lambda: find("pure imag")),
        ("mirror image about" in stem, lambda: find("x-axis")),
        ("modulus" in stem and "distance" in stem, lambda: find("origin")),
        ("consistent" in stem and "at least" in " ".join(ol), lambda: find("at least one")),
        ("no solution is called" in stem, lambda: find("inconsistent")),
        ("sylvester" in " ".join(ol) and "matrix" in stem, lambda: find("sylvester")),
        ("identity matrix" in stem and "diagonal" in stem, lambda: exact("1")),
        ("rectangular" in " ".join(ol) and "not equal" in stem, lambda: find("rectangular")),
        ("one column" in " ".join(ol) and "column if" in stem, lambda: find("one column")),
        ("additive inverse" in " ".join(ol) and "(-a)" in stem.replace(" ", ""), lambda: find("additive inverse")),
        ("rank of a matrix" in " ".join(ol) and "non-zero rows" in stem, lambda: find("rank")),
        ("trivial solution" in stem and "homogenous" in stem, lambda: find("(0, 0, 0)") or find("0, 0, 0")),
        ("k1=k2=k3=0" in " ".join(ol).replace(" ", "") or ("homogenous linear" in stem and "called" in stem), lambda: find("k₁=k₂=k₃=0") or find("k1=k2=k3=0")),
        ("in-consistent" in stem or ("inconsistent system" in stem), lambda: find("no solution")),
        ("order of ab" in stem.replace(" ", ""), lambda: find("m x p") or find("m × p")),
        ("sequence is also called" in stem, lambda: find("progression")),
        ("fixed number" in stem and "preceding" in stem, lambda: find("arithmetic")),
        ("5050" in " ".join(ol), lambda: find("5050")),
        ("reciprocal" in stem and "h.p" in stem, lambda: find("a.p") or find("ap")),
        ("harmonic sequence can be" in stem, lambda: exact("0")),
        ("greek letter" in stem, lambda: find("sum")),
        ("first muslim" in stem, lambda: find("muhammad bin musa") or find("musa")),
        ("letters to represent" in stem, lambda: find("descartes")),
        ("zero polynomial has degree" in stem, lambda: find("no degree")),
        ("p(x) + p(-x)" in stem.replace(" ", ""), lambda: exact("6")),
        ("degree of the constant" in stem, lambda: exact("0")),
        ("linear divisor" in stem and "remainder" in stem, lambda: find("f(a)")),
        ("zeros of zero polynomial" in stem, lambda: find("not defined")),
        ("principal argument" in stem and "called" in stem, lambda: find("principal")),
        ("real part is drawn" in stem, lambda: find("x-axis")),
        ("imaginary part is drawn" in stem, lambda: find("y-axis")),
        ("argand" in " ".join(ol), lambda: find("argand")),
        ("every real number is also" in stem, lambda: find("complex")),
        ("impedance" in stem and "resistance" in stem, lambda: find("impedance")),
        ("electromotive" in stem, lambda: find("voltage")),
        ("sum of first 100" in stem, lambda: find("5050")),
        ("|3a|" in stem.replace(" ", "").lower() or ("|3a| =" in stem.lower().replace(" ", "")), lambda: find("54")),
        ("a·(b×a)" in stem.replace(" ", "") or "a. (b×a)" in stem or "(b×a) is equal" in stem, lambda: exact("0")),
        ("called coplanar if" in stem, lambda: exact("0")),
        ("mutually perpendicular unit vectors" in stem, lambda: find("√(3)") or find("√3")),
        ("|a×b|=|a·b|" in stem.replace(" ", "") or ("(a×b)=(a.b)" in stem.replace(" ", "")), lambda: find("π)/(4") or find("(π)/(4)")),
    ]

    for cond, fn in rules:
        if cond:
            ans = fn()
            if ans is not None:
                return ans
    return None


def resolve_answer(q: dict) -> tuple[int, bool]:
    key = (q["stem_key"], q["qnum"])
    if key in ANSWERS:
        return ANSWERS[key], True
    h = heuristic_answer(q)
    if h is not None:
        return h, True
    return 0, False


def main():
    os.makedirs(DUMP, exist_ok=True)
    files = sorted(glob.glob(os.path.join(ROOT, "*.docx")))
    all_q: list[dict] = []

    for f in files:
        name = os.path.basename(f)
        lines = extract_doc(f)
        with open(os.path.join(DUMP, name + ".txt"), "w", encoding="utf-8") as out:
            out.write("\n".join(lines))

        text = "\n".join(lines)
        qs = parse_inline_mcqs(text, name)

        # Prefer list-style when few inline (EX1.2, EX5.1)
        if len(qs) < 5 or "5.1" in name or "1.2" in name:
            alt = parse_list_style(lines, name)
            if len(alt) > len(qs):
                qs = alt

        # EX3.4 special: many unnumbered inline on separate lines
        if "3.4" in name and len(qs) < 10:
            qs = parse_inline_mcqs(text, name)
            # renumber in order
            for i, q in enumerate(qs, 1):
                q["qnum"] = i

        print(f"{name}: {len(qs)} questions")
        all_q.extend(qs)

    export = []
    verified = 0
    for i, q in enumerate(all_q, 1):
        ans, ok = resolve_answer(q)
        if ok:
            verified += 1
        export.append(
            {
                "id": i,
                "subject": q["subject"],
                "exercise": q["stem_key"],
                "question": q["question"],
                "options": q["options"],
                "correctIndex": ans,
                "explanation": f"From {q['stem_key']} · Q{q['qnum']}"
                + ("" if ok else " — verify answer key"),
            }
        )

    print(f"TOTAL {len(export)} | verified answers {verified}")

    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(export, f, ensure_ascii=False, indent=2)

    js = f"""/**
 * Fazaia Inter College — Class XI Mathematics MCQ Bank
 * Extracted from exercise Word documents (Ex 1.1 – 5.3).
 * correctIndex: 0 = A, 1 = B, 2 = C, 3 = D
 * Add/edit items freely — PDF/DOCX content plugs in with this schema.
 */

const QUIZ_META = {{
  title: "XI Mathematics — Practice MCQs",
  description: "Class XI maths MCQs covering Complex Numbers, Matrices, Vectors, Sequences & Series, and Algebra (Exercises 1.1–5.3).",
  timeLimitMinutes: null,
}};

const QUIZ_QUESTIONS = {json.dumps(export, ensure_ascii=False, indent=2)};

window.QUIZ_META = QUIZ_META;
window.QUIZ_QUESTIONS = QUIZ_QUESTIONS;
"""
    with open(OUT_JS, "w", encoding="utf-8") as f:
        f.write(js)
    print("Wrote", OUT_JS)


if __name__ == "__main__":
    main()
