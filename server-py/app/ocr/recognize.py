"""
OCR 识别模块 —— 使用 pytesseract 本地识别截图中的文字，
然后根据空间位置将地点名与 4 位数字密码配对。

注意：首次使用需要安装 Tesseract OCR 引擎：
  macOS: brew install tesseract tesseract-lang
  Ubuntu: apt install tesseract-ocr tesseract-ocr-chi-sim
"""

import io
import re
from PIL import Image
import pytesseract


async def recognize_passwords(
    image_bytes: bytes,
    location_names: list[str],
) -> list[dict]:
    """
    识别图片中的文字，返回 [{location, password}, ...]
    """
    image = Image.open(io.BytesIO(image_bytes))

    data = pytesseract.image_to_data(
        image,
        lang="chi_sim+eng",
        output_type=pytesseract.Output.DICT,
    )

    blocks: list[dict] = []
    for i in range(len(data["text"])):
        text = (data["text"][i] or "").strip()
        if not text:
            continue
        blocks.append({
            "text": text,
            "x": data["left"][i],
            "y": data["top"][i],
        })

    results: list[dict] = []
    for name in location_names:
        name_lower = name.lower()
        name_block = next(
            (b for b in blocks if name_lower in b["text"].lower()),
            None,
        )
        if not name_block:
            continue

        best = None
        best_dist = float("inf")
        for b in blocks:
            if b is name_block:
                continue
            m = re.search(r"\b(\d{4})\b", b["text"])
            if not m:
                continue
            dist = ((b["x"] - name_block["x"]) ** 2 + (b["y"] - name_block["y"]) ** 2) ** 0.5
            if dist < best_dist:
                best_dist = dist
                best = m.group(1)

        if best:
            results.append({"location": name, "password": best})

    return results
