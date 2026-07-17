"""
OCR 识别模块 —— 使用智谱 GLM-4V-Flash 识别截图中的地名和密码

图像特征：
- 水平排列 6 个单元，上层地名（白色粗体），下层密码框（白色数字）
- 纯白文字 + 深色背景，对比度极高
"""

import base64
import json
import re
import urllib.request
from app.config import settings


async def recognize_passwords(
    image_bytes: bytes,
    location_names: list[str],
) -> tuple[list[dict], dict]:
    """调用智谱 GLM-4V-Flash 识别密码"""
    api_key = settings.glm_api_key
    if not api_key:
        raise RuntimeError("未配置 GLM_API_KEY，请在 .env 中设置")

    b64 = base64.b64encode(image_bytes).decode("utf-8")

    prompt = (
        "识别这张游戏UI截图中的所有密码。图片横向排列6个单元，每个单元上方是地点名（白色粗体字），下方是4位数字密码（白色数字）。\n"
        f"已知地点名从左到右依次为：{', '.join(location_names)}。\n"
        "请直接输出JSON数组，格式：[{\"name\": \"地点名\", \"password\": \"4位数字\"}]\n"
        "只输出JSON，不要任何其他文字。"
    )

    body = {
        "model": "glm-4v-flash",
        "messages": [{
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64}"}}
            ]
        }],
        "temperature": 0.0,
        "max_tokens": 1024,
    }

    req = urllib.request.Request(
        "https://open.bigmodel.cn/api/paas/v4/chat/completions",
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
    )

    print(f"[GLM-4V] 调用视觉 API...", flush=True)
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    text = data["choices"][0]["message"]["content"]
    print(f"[GLM-4V] 回复: {text}", flush=True)

    # 解析 JSON
    match = re.search(r"\[.*\]", text, re.DOTALL)
    json_text = match.group(0) if match else text

    try:
        items = json.loads(json_text)
    except json.JSONDecodeError:
        items = [{"password": m.group(1)} for m in re.finditer(r"(\d{4})", text)]

    # 按地点名匹配
    results = []
    for i, name in enumerate(location_names):
        password = ""
        for item in items:
            if isinstance(item, dict) and item.get("name", "").strip() == name:
                password = item.get("password", "")
                break
        if not password and i < len(items):
            pw = items[i]
            password = pw.get("password", "") if isinstance(pw, dict) else str(pw)
        digits = re.findall(r"\d+", password)
        password = "".join(digits)[-4:] if len("".join(digits)) >= 4 else "".join(digits)

        results.append({"location": name, "password": password})

    print(f"[GLM-4V] 结果: {results}", flush=True)

    debug_info = {
        "rawBlocks": [{"text": text, "x": 0, "y": 0}],
        "mergedBlocks": [],
        "units": [{"unit": i+1, "xRange": [0, 0], "nameText": r["location"], "passwordRaw": r["password"]} for i, r in enumerate(results)],
    }

    return results, debug_info
