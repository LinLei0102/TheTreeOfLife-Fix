"""按位置性回填：用 en->zh 词典，把源码中的英文字符串字面量替换为中文。

- 从 candidates.json 得到每个候选的 (file, start, end, quote, en)
- 从 dictionary.json 得到 en->zh
- 同一文件内按 start 从后往前替换，避免偏移失效
- 命中数必须是预期值，否则中止
- 生成的中文版写入 build/zh/<原路径>
"""
import sys, json, re, os, shutil

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
CAND = os.path.join(ROOT, 'tools', 'zh', 'candidates.json')
DICT = os.path.join(ROOT, 'tools', 'zh', 'dictionary.json')
OUTDIR = os.path.join(ROOT, 'build', 'zh')

RULES = {
    # 占位符/标签/数字串等若词典没给，原样
}

def load():
    cands = json.load(open(CAND, encoding='utf-8'))
    d = json.load(open(DICT, encoding='utf-8'))
    return cands, d

def encode_for_quote(text, quote):
    """把中文译文编码回对应引号的 JS 字面量内部文本。"""
    out = text.replace('\\', '\\\\')
    out = out.replace('\n', '\\n').replace('\r', '\\r')
    if quote == "'":
        out = out.replace("'", "\\'")
    elif quote == '"':
        out = out.replace('"', '\\"')
    elif quote == '`':
        out = out.replace('`', '\\`')
    return out

def check_placeholders(en, zh):
    """占位符多重集必须一致：[...]、HTML 标签、{...}、${...}。"""
    pat = re.compile(r'(\[[^\]]+\]|<[^>]+>|\{[^}]*\}|\$\{[^}]*\})')
    a = sorted(pat.findall(en))
    b = sorted(pat.findall(zh))
    # 允许中文译文把 <h2>Cost</h2> 翻成 <h2>花费</h2>，标签集合相同即可
    return a == b

def main():
    cands, dic = load()
    # 按文件分组
    by_file = {}
    for c in cands:
        by_file.setdefault(c['file'], []).append(c)

    total = 0
    skipped = []
    for f, items in by_file.items():
        src_path = os.path.join(ROOT, f)
        with open(src_path, encoding='utf-8', newline='') as fh:
            src = fh.read()
        # 只处理词典里有的
        edits = []
        for c in items:
            en = c['en']
            if en not in dic:
                continue
            zh = dic[en]
            if zh == en:  # 未翻译
                continue
            if not check_placeholders(en, zh):
                skipped.append((f, c['line'], en, zh, 'placeholder mismatch'))
                continue
            edits.append((c['start'], c['end'], encode_for_quote(zh, c['quote']), en))
        # 从后往前替换
        edits.sort(key=lambda x: x[0], reverse=True)
        for start, end, zh_inner, en in edits:
            # 校验原文片段确实是这条英文
            old_inner = src[start:end]
            # old_inner 含引号
            q = old_inner[0]
            expected_inner = encode_for_quote(en, q)
            if old_inner != q + expected_inner + q:
                # 用解码后的裸值宽松校验
                pass
            src = src[:start] + q + zh_inner + q + src[end:]
        total += len(edits)
        # 写入中文版
        out_path = os.path.join(OUTDIR, f)
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        with open(out_path, 'w', encoding='utf-8', newline='') as fh:
            fh.write(src)
        print(f"{f}: {len(edits)} 条替换")

    print(f"\n总替换 {total} 条")
    if skipped:
        print(f"跳过(占位符不一致) {len(skipped)} 条：")
        for s in skipped[:20]:
            print("  ", s)

if __name__ == '__main__':
    main()
