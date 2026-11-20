"""提取 JS/HTML 中疑似展示文本的字符串字面量，输出带位置信息的候选清单。

只做提取与分类，不修改源码。回填由 apply.py 负责。
用法: python tools/zh/extract.py <file> [> out.json]
"""
import sys, json, re, os
sys.path.insert(0, r"C:\Users\Administrator\.workbuddy\skills\game-localization\scripts")
from jslex import scan, decode_js_string

# 明显不是自然语言的特征
RE_HTML_TAG = re.compile(r'^<\/?[a-zA-Z][^>]*>?$')           # <bdi ...>, </bdi>
RE_STYLE_FRAG = re.compile(r"style\s*[:=]|color\s*:|font-|#(?:[0-9a-fA-F]{3,8})\b")
RE_PATH = re.compile(r'\.(js|css|png|html|json)$|^\.?/|^https?://|^data:')
RE_PLACEHOLDER = re.compile(r'^\[[^\]]+\]$')                   # [best Hydrogen]
RE_CODE_ID = re.compile(r'^[A-Za-z_$][A-Za-z0-9_$]*$')         # 纯标识符
RE_NUM = re.compile(r'^[\d\s\.,+\-*/%^()<>=!eE]+$')            # 数字/科学计数(含 e)
RE_KEBAB = re.compile(r'^[a-z]+(?:-[a-z]+)+$')                  # CSS 类名 display-text
RE_ONLY_TAGS = re.compile(r'^(?:<[^>]*>\s*)+$')                 # <br><br><br>
RE_LEADING_TAG = re.compile(r"^'?>\s*")                        # '>Hydrogen I 拼接尾巴(整体排除)

def is_display_text(t: str) -> bool:
    s = t.strip()
    if not s:
        return False
    if RE_NUM.match(s) or RE_KEBAB.match(s) or RE_ONLY_TAGS.match(s):
        return False
    if RE_HTML_TAG.match(s):
        return False
    # 样式片段：仅当去掉标签和样式属性后几乎没有自然语言时才排除。
    # （过去用 RE_STYLE_FRAG 直接排除，误伤了大量 <bdi style=...>长句</bdi>）
    if RE_STYLE_FRAG.search(s):
        stripped = re.sub(r'<[^>]*>', ' ', s)
        stripped = re.sub(r'[a-z-]+\s*:\s*[^;\'"<>]+', ' ', stripped)
        natural = re.findall(r'[A-Za-z][A-Za-z\' ]{3,}', stripped)
        if len(' '.join(natural).split()) < 4:
            return False
    if RE_PATH.search(s) or RE_PLACEHOLDER.match(s):
        return False
    # HTML 拼接尾巴、含插值残留的片段整体排除，避免破坏结构
    if RE_LEADING_TAG.match(s) or s.startswith('>') or "'>" in s or '">' in s:
        return False
    words = re.findall(r"[A-Za-z][A-Za-z']*", s)
    if len(words) >= 2:
        return True
    # 单个长词：只在它没有明显代码特征时才当作可译（如 "Hydrogen", "Unlocked"）
    if len(words) == 1 and len(words[0]) >= 4 and RE_CODE_ID.match(s) is None:
        if re.fullmatch(r'[A-Za-z]+', s) and len(s) >= 4:
            return True
    return False

# 字段值模式：name/resource/pointsName 等字段里的短名称也要纳入（单个英文单词常被上面的规则排除）
RE_FIELD = re.compile(r'\b(name|resource|baseResource|pointsName|symbol|title)\s*:\s*"(?P<val>[^"]*[A-Za-z]{2,}[^"]*)"')
SINGLE_LETTERS = set('ABCDEFGHIJKLMNOPQRSTUVWXYZ')

def extract(path):
    with open(path, encoding='utf-8', newline='') as f:
        src = f.read()
    strings, comments = scan(src)
    out = []
    seen = set()
    # 先记录字段值的位置（这些即使单词也纳入）
    field_positions = {}
    for m in RE_FIELD.finditer(src):
        field_positions[m.start('val')] = m.group('val')
    for s in strings:
        # 跳过注释内的字符串
        if any(a <= s['start'] < b for a, b in comments):
            continue
        t = decode_js_string(s['raw'], s['quote'])
        # 字段值起点 = s.start+1（引号后一位）
        is_field = (s['start'] + 1) in field_positions
        ok = is_field or is_display_text(t)
        if not ok:
            continue
        # 字段值里的单字母代号不译
        if is_field and t.strip().upper() in SINGLE_LETTERS:
            continue
        line = src.count('\n', 0, s['start']) + 1
        out.append({
            'file': path.replace('\\', '/'),
            'line': line,
            'start': s['start'],
            'end': s['end'],
            'quote': s['quote'],
            'en': t,
            'field': bool(is_field),
        })
    return out

if __name__ == '__main__':
    files = sys.argv[1:]
    if not files:
        print('usage: extract.py <file> [...]', file=sys.stderr)
        sys.exit(1)
    allc = []
    for f in files:
        allc.extend(extract(f))
    # 按文件行号排序
    allc.sort(key=lambda x: (x['file'], x['line'], x['start']))
    json.dump(allc, sys.stdout, ensure_ascii=False, indent=1)
    print(f'\n# candidates: {len(allc)}', file=sys.stderr)
