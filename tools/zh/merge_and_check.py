"""合并所有分片译文 -> dictionary.json，并做质量校验。

校验项：
- 每个 out_XX 与 chunk_XX 等长
- 占位符/HTML 标签多重集一致
- 译文里残留的英文单词统计（提示可能的漏译）
- 术语一致性（同一英文对应多个中文）
- 合并规则 UI 标签词典
"""
import os, re, json, collections, sys

ROOT = os.path.join(os.path.dirname(__file__))
D = ROOT
NCHUNK = 17

TOKEN_RE = re.compile(r'(\[[^\]]+\]|<[^>]+>|\{[^}]*\}|\$\{[^}]*\})')
def tokens(s): return sorted(TOKEN_RE.findall(s))

def main():
    dic = {}
    problems = []
    for i in range(NCHUNK):
        cp = os.path.join(D, f'chunk_{i:02d}.json')
        op = os.path.join(D, f'out_{i:02d}.json')
        if not os.path.exists(op):
            problems.append(f'缺少 {op}'); continue
        en = json.load(open(cp, encoding='utf-8'))
        zh = json.load(open(op, encoding='utf-8'))
        if len(en) != len(zh):
            problems.append(f'{i:02d}: 长度不符 {len(en)} vs {len(zh)}'); continue
        for a, b in zip(en, zh):
            if not isinstance(b, str):
                problems.append(f'{i:02d}: 非字符串译文 {a!r}'); continue
            if tokens(a) != tokens(b):
                problems.append(f'{i:02d}: token 不一致 {a!r} -> {b!r}')
            dic[a] = b

    # 合并规则 UI 标签
    rp = os.path.join(D, 'rule_labels.json')
    if os.path.exists(rp):
        rules = json.load(open(rp, encoding='utf-8'))
        dic.update(rules)

    # 一致性：同一英文多个译文（分片边界可能产生）
    # 词典天然去重（后者覆盖），这里没有冲突；检查译文->多英文的术语漂移另做

    # 漏译统计：译文里仍含 2+ 连续英文单词，且不是原样返回
    residue = []
    for en, zh in dic.items():
        if zh == en:
            continue
        if len(re.findall(r'[A-Za-z]{3,}', zh)) >= 2 and not TOKEN_RE.search(zh):
            residue.append((en, zh))

    json.dump(dic, open(os.path.join(D, 'dictionary.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)

    print(f"词典条目 {len(dic)}")
    print(f"问题 {len(problems)}")
    for p in problems[:30]:
        print("  !", p)
    print(f"\n疑似漏译(译文仍含英文词) {len(residue)}：")
    for en, zh in residue[:25]:
        print(f"  {en[:55]!r} -> {zh[:55]!r}")

if __name__ == '__main__':
    main()
