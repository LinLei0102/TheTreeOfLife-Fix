"""补齐提取器漏掉的资源单位短词条（按英文原版的字符串字面量精确生成）。

只添加「源码中存在、词典中缺失、且不是对象键」的展示文本。
"""
import json, os, re, sys
sys.path.insert(0, r"C:\Users\Administrator\.workbuddy\skills\game-localization\scripts")
from jslex import scan, decode_js_string
from normalize_dictionary import translate, restore_tokens, SKIP_RE, D

ROOT = os.path.abspath(os.path.join(D, '..', '..'))
PATH = os.path.join(D, 'dictionary.json')
FILES = [
    'en/js/layers.js', 'en/js/mod.js', 'en/js/utils.js', 'en/js/game.js',
    'en/js/components.js', 'en/js/technical/displays.js',
    'en/js/technical/systemComponents.js', 'en/js/utils/options.js',
    'en/js/achievements.js', 'en/js/versions.js',
]
# 命中资源名（含公式里的括号写法）；对象键由 is_object_key 排除
UNIT_RE = re.compile(
    r'\b(?:Animals?|Cells?|Genes?|Energy|Organs?|Tokens?(?:\s+II)?|'
    r'Points?|Lives|Carbon|Oxygen|Protein|Air|Species|Ecosystems|'
    r'Contaminants|Biomass|Tissues|Heart|Kidney|Intestine|Lung|Fuel|Plants|'
    r'Nucleuses|Stem\s+Cells|Science|Multipliers)\b')


def is_object_key(src, value):
    """任一出现位置后面紧跟冒号，就当作键名跳过。"""
    for q in ['"', "'"]:
        needle = q + value.replace(q, '\\' + q) + q
        pos = 0
        while True:
            i = src.find(needle, pos)
            if i < 0:
                break
            j = i + len(needle)
            while j < len(src) and src[j] in ' \t\r\n':
                j += 1
            if j < len(src) and src[j] == ':':
                return True
            pos = i + 1
    return False


def main():
    dic = json.load(open(PATH, encoding='utf-8'))
    added = 0
    for rel in FILES:
        p = os.path.join(ROOT, rel)
        if not os.path.exists(p):
            continue
        src = open(p, encoding='utf-8', newline='').read()
        strings, _ = scan(src)
        for x in strings:
            try:
                val = decode_js_string(x['raw'], x['quote'])
            except Exception:
                continue
            if not val or val in dic or SKIP_RE.search(val):
                continue
            if not UNIT_RE.search(val) or is_object_key(src, val):
                continue
            zh = restore_tokens(val, translate(val))
            if zh == val or not re.search(r'[\u4e00-\u9fffμικλ]', zh):
                continue
            dic[val] = zh
            added += 1
    # 标点与固定短语的精确覆盖
    dic.update({
        ' Animals. ': ' 动物。 ',
        ' Animals.': ' 动物。',
        ' Organs': ' 器官',
    })
    json.dump(dic, open(PATH, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'补充漏译短词条: +{added}，词典合计 {len(dic)}')
    return added


if __name__ == '__main__':
    main()
