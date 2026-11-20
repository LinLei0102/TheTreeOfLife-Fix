"""把词典中漏译的资源单位批量补齐（只处理 key == value 的条目）。

这是构建前置步骤：rebuild_all.sh 会先跑它，再跑 rebuild.py。
只改展示词条，不碰键名、占位符、HTML 标签和公式函数名。
"""
import json, os, re, sys

D = os.path.dirname(os.path.abspath(__file__))
PATH = os.path.join(D, 'dictionary.json')

# 顺序敏感：长词/复合词必须先替换
TERMS = [
    (r'\bLife Points\b', '生命点'),
    (r'\bStem Cells\b', '干细胞'),
    (r'\bToken II\b', '代币II'),
    (r'\bTokens II\b', '代币II'),
    (r'\bAnimal reset\b', '次动物重置'),
    (r'\bAnimal resets\b', '次动物重置'),
    (r'\bAnimals\b', '动物'),
    (r'\bAnimal\b', '动物'),
    (r'\bOrgans\b', '器官'),
    (r'\bOrgan\b', '器官'),
    (r'\bCells\b', '细胞'),
    (r'\bGenes\b', '基因'),
    (r'\bEnergy\b', '能量'),
    (r'\bTokens\b', '代币'),
    (r'\bToken\b', '代币'),
    (r'\bPlants\b', '植物'),
    (r'\bNucleuses\b', '细胞核'),
    (r'\bNucleus\b', '细胞核'),
    (r'\bLives\b', '生命'),
    (r'\bCarbon\b', '碳'),
    (r'\bOxygen\b', '氧'),
    (r'\bProtein\b', '蛋白质'),
    (r'\bAir\b', '空气'),
    (r'\bSpecies\b', '物种'),
    (r'\bEcosystems\b', '生态系统'),
    (r'\bContaminants\b', '污染物'),
    (r'\bBiomass\b', '生物质'),
    (r'\bTissues\b', '组织'),
    (r'\bHeart\b', '心脏'),
    (r'\bKidney\b', '肾脏'),
    (r'\bIntestine\b', '肠道'),
    (r'\bLung\b', '肺'),
    (r'\bFuel\b', '燃料'),
    (r'\bPoints\b', '点数'),
    (r'\bScience\b', '科学'),
    (r'\bMultipliers\b', '倍率'),
    (r'\bIota\b', 'ι'),
    (r'\bKappa\b', 'κ'),
    (r'\bLambda\b', 'λ'),
    (r'\bMu\b', 'μ'),
    (r'\bNext:\s*', '下一个：'),
    (r'\bEach\b', '每个'),
]

# 像 "1 Animal reset" 这种前面已有数字时，不应变成 "1 次动物重置" 之外的形式
RESET_RE = re.compile(r'^(\s*\d+(?:[\.,]\d+)?\s+)Animals?\s+resets?(\s*)$', re.I)

# 明显是代码/样式的碎片跳过
SKIP_RE = re.compile(r'(a_points|b_points|c_points|d_points|e_points|_content|px solid|shift\+|Control\+|https?://|\.js|\.css)', re.I)


def translate(text):
    if SKIP_RE.search(text):
        return text
    m = RESET_RE.match(text)
    if m:
        return m.group(1) + '次动物重置' + m.group(2)
    out = text
    for pattern, zh in TERMS:
        out = re.sub(pattern, zh, out)
    # 统一已有译法里的空格差异
    out = out.replace('代币 II', '代币II')
    return out


TOKEN_RE = re.compile(r'(\[[^\]]+\]|<[^>]+>|\{[^}]*\}|\$\{[^}]*\})')


def restore_tokens(original, translated):
    """占位符/HTML 标签按原顺序原样还原，绝不翻译。"""
    tokens = TOKEN_RE.findall(original)
    if not tokens:
        return translated
    it = iter(tokens)
    return TOKEN_RE.sub(lambda m: next(it, m.group(0)), translated)


def main():
    dic = json.load(open(PATH, encoding='utf-8'))
    changed = 0
    for key in list(dic):
        val = dic[key]
        if not re.search(r'[A-Za-z]', val):
            continue
        new = restore_tokens(key, translate(val))
        if new == val:
            continue
        # 占位符/HTML 标签必须原样保留
        if sorted(TOKEN_RE.findall(key)) != sorted(TOKEN_RE.findall(new)):
            continue
        dic[key] = new
        changed += 1
    json.dump(dic, open(PATH, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'词典单位归一化: 修正 {changed} 条，合计 {len(dic)} 条')
    return changed


if __name__ == '__main__':
    sys.exit(0 if main() >= 0 else 1)
