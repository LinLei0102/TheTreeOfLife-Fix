# -*- coding: utf-8 -*-
"""为 formulaDisplaySupport.js 生成规则化翻译映射（en 片段 -> zh 片段）。

公式说明页句式高度规整：<主语> multiplies/multiply A?X by <数值>、<X> gain is 等。
本脚本用词根映射 + 整句特例生成映射，输出到 formula_zh.json，再由 finalize.py
以字面替换方式固化，保证可复现、不破坏 AX/BX/CX/DX 占位符与 format() 拼接。
"""
import os, re, json, io

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, 'js', 'utils', 'formulaDisplaySupport.js')
OUT = os.path.join(os.path.dirname(__file__), 'formula_zh.json')

# 罗马数字（保留原样，作为升级/里程碑编号）
ROMAN = set('I II III IV V VI VII VIII IX X XI XII XIII XIV XV XVI XVII XVIII XIX XX '
            'XXI XXII XXIII XXIV XXV XXVI XXVII XXVIII XXIX XXX XXXI XXXII XXXIII XXXIV '
            'XLI XLII LI LII LIII LIV LIX LXI LXV LXIX LXXV'.split())

# 1) 整句 / 固定句式特例（精确匹配，优先）
FULL = {
    'Point gain is (': '点数产出为 (',
    '*AX)^BX all dilated ^CX.': '*AX)^BX 全部膨胀 ^CX。',
    'AX, BX, and CX are initially 1 and boosted as follows.': 'AX、BX 和 CX 初始为 1，加成如下。',
    'AX, BX, CX, and DX are initially 1 and boosted as follows.': 'AX、BX、CX 和 DX 初始为 1，加成如下。',
    'AX and BX are initially 1 and are multiplied by the following factors': 'AX 和 BX 初始为 1，受以下因素影响',
    'AX is initially 1 and is multiplied by the following factors': 'AX 初始为 1，受以下因素影响',
    'AX is initially 400 and the following factors add to it': 'AX 初始为 400，以下因素对其加成',
    'AX is multiplied by the following factors': 'AX 受以下因素影响',
    'BX initally 2 and is affected by the following factors': 'BX 初始为 2，受以下因素影响',
    ' and is affected by the following factors': ' 并受以下因素影响',
    'BX initally ': 'BX 初始为 ',
    'DNA gain is ': 'DNA 产出为 ',
    'The DNA gain exponent is BX': 'DNA 产出指数为 BX',
    'Cell gain is ': '细胞产出为 ',
    'Stem Cell gain is (AX<sup>BX</sup>CX)<sup>DX</sup>.': '干细胞产出为 (AX<sup>BX</sup>CX)<sup>DX</sup>。',
    'Tissue gain is ': '组织产出为 ',
    'Organ gain is ': '器官产出为 ',
    'The Organ effect exponent is BX': '器官效果指数为 BX',
    'Air gain is AX<sup>BX</sup>': '空气产出为 AX<sup>BX</sup>',
    'Energy gain is AX<sup>BX</sup>': '能量产出为 AX<sup>BX</sup>',
    'Animal gain is ': '动物产出为 ',
    'Gene gain is ': '基因产出为 ',
    'Contaminant gain is AX': '污染物产出为 AX',
    'Taxonomy cap is AX': '分类学上限为 AX',
    'Species gain is ': '物种产出为 ',
    'Ecosystem gain is ': '生态系统产出为 ',
    'Base biomass gain is ': '基础生物质产出为 ',
    'Netting a result of ': '最终结果为 ',
    'raises this to the ': '将此提升至 ',
    ' power': ' 次方',
    ' is an error': ' 为错误值',
    'The result is ': '结果为 ',
    ' is ': ' 为 ',
    ' to the following': ' 受以下',
    ' + 9000': ' + 9000',
    'raises this to the ': '将此升至 ',
    'raises this ': '将此提升 ',
    'maxes AX ': '使 AX 达到 ',
    'months of ":': '个月的「',
}

# 2) 句式短语（动词结构），按长度降序替换
PHRASES = [
    ('multplies AX by ', '使 AX 乘以 '),
    ('multplies BX by ', '使 BX 乘以 '),
    ('multplies CX by ', '使 CX 乘以 '),
    ('multplies DX by ', '使 DX 乘以 '),
    ('multiplies AX by ', '使 AX 乘以 '),
    ('multiply AX by ', '使 AX 乘以 '),
    ('multiplies BX by ', '使 BX 乘以 '),
    ('multiply BX by ', '使 BX 乘以 '),
    ('multiplies CX by ', '使 CX 乘以 '),
    ('multiply CX by ', '使 CX 乘以 '),
    ('multiplies DX by ', '使 DX 乘以 '),
    ('multiply DX by ', '使 DX 乘以 '),
    ('multiplied by the following factors', '受以下因素影响'),
    ('divides AX by ', '使 AX 除以 '),
    ('divide AX by ', '使 AX 除以 '),
    ('adds 1 to AX', '使 AX 增加 1'),
    ('adds ', '增加 '),
    ('add ', '增加 '),
    ('due to Species', '由于物种'),
    ('being ON', '处于开启'),
    ('gain per ', '产出/每'),
    ('gain is ', '产出为 '),
    (' and ', ' 和 '),
]

# 3) 词根映射（英文词 -> 中文），按长度降序，带词边界
WORDS = {
    'Chromosomeless': '无染色体', 'Nucleusless': '无细胞核', 'Nucleusless?': '无细胞核？',
    'Animaless?': '无动物？', 'Truly Chromosomeless': '真正无染色体', 'Truly Energyless': '真正无能量',
    'Single-strand DNA-binding protein': '单链 DNA 结合蛋白',
    'Stem Cells': '干细胞', 'Amino Acid': '氨基酸', 'Amino Milestone': '氨基酸里程碑',
    'Bottom Quark': '底夸克', 'Down Quark': '下夸克', 'DNA Polymerase': 'DNA 聚合酶',
    'Primary Bronchi': '主支气管', 'Secondary Bronchi': '次级支气管', 'Tertiary Bronchi': '三级支气管',
    'Primary reward': '主要奖励', 'Secondary Challenge': '次级挑战',
    'Boosted Species': '强化物种', 'Boosted Effect': '强化效果', 'Upgraded Effect': '升级效果',
    'Animal Effect': '动物效果', 'Ecosystem effect': '生态系统效果', 'Cell effect': '细胞效果',
    'Organ effect': '器官效果', 'Tissue effect': '组织效果', 'Science effect': '科学效果',
    'Life effect': '生命效果', 'Animal effect': '动物效果', 'N Sci II effect': '氮科学 II 效果',
    'Easy Mode': '简单模式', 'Easy mode': '简单模式', 'Hard Mode': '困难模式', 'Hard mode': '困难模式',
    'Extreme Mode': '极限模式', 'Extreme mode': '极限模式', 'Milestones': '里程碑', 'Milestone': '里程碑',
    'Chromosomes': '染色体', 'Chromosome': '染色体', 'Nucleuses': '细胞核', 'Nucleus': '细胞核',
    'Animals': '动物', 'Animal': '动物', 'Tissues': '组织', 'Tissue': '组织',
    'Organs': '器官', 'Organ': '器官', 'Ecosystems': '生态系统', 'Ecosystem': '生态系统',
    'Species': '物种', 'Plants': '植物', 'Plant': '植物', 'Human': '人类', 'Humans': '人类',
    'Cells': '细胞', 'Cell': '细胞', 'Gems': '宝石', 'Stem': '干细胞', 'Sprout': '幼苗',
    'Leaf': '叶', 'Flower': '花', 'Heart': '心脏', 'Kidney': '肾', 'Lung': '肺',
    'Larynx': '喉', 'Trachea': '气管', 'Bronchioles': '细支气管', 'Bronchoiles': '细支气管',
    'Selection': '选择', 'Dilation': '膨胀', 'Contaminant': '污染物', 'Energy': '能量', 'Air': '空气',
    'Biomass': '生物质', 'Progression': '进程', 'Telomerase': '端粒酶', 'siRNA': 'siRNA',
    'Multipotent': '多能干细胞', 'Pluripotent': '多能干细胞', 'Oligopotent': '少能干细胞',
    'Totipotent': '全能干细胞', 'Omnipotent': '万能干细胞', 'Phosphorus': '磷',
    'Life': '生命', 'Live': '生命', 'Mu': 'μ', 'Iota': 'ι', 'Kappa': 'κ', 'Lambda': 'λ',
    'Effect': '效果', 'Secondary': '次级', 'Tertiary': '三级', 'Primary': '主要',
    'Sci': '科学', 'Protein': '蛋白质', 'Token': '代币', 'XXXVIII': '三十八',
    'Anti-Oxygen': '反氧挑战', 'Anti-Theta': '反θ挑战',
    'Anti-minigame': '反小游戏', 'Anti-': '反', 'Oxygen': '氧', 'Theta': 'θ',
    'milestone': '里程碑', 'Nucleuse': '细胞核', 'Initial': '初始',
    'biomass': '生物质', 'gian': '产出为', 'maxes': '使', 'raises': '提升',
    'this': '此', 'the': '该', 'next': '下一个', 'increase': '增加', 'decrease': '减少',
    'gain': '产出', 'due': '由于', 'makes': '使', 'make': '使', 'raise': '提升',
    'adds': '增加', 'add': '增加', 'to': '至', 'and': '和',
}

# 大小写文字游戏：这些词根原样保留（INtestine 的各种大小写变体）
WORD_GAMES = re.compile(r'(?:<u>)?(?:IN|in|In)(?:<\\?u>)?(?:test|TEST|tes|TES|TINE|tine|tINE|TINE)[a-zA-Z]*(?:<\\?/u>)?')

_phrase_re = None
_word_re = None

def _compile():
    global _phrase_re, _word_re
    ph = sorted(PHRASES, key=lambda x: -len(x[0]))
    _phrase_re = [(re.compile(re.escape(a)), b) for a, b in ph]
    wd = sorted(WORDS.items(), key=lambda x: -len(x[0]))
    _word_re = [(re.compile(r'(?<![A-Za-z])' + re.escape(a) + r'(?![A-Za-z])'), b) for a, b in wd]

def translate(en):
    if _phrase_re is None:
        _compile()
    if en in FULL:
        return FULL[en]
    out = en
    # 先保护大小写文字游戏片段
    games = WORD_GAMES.findall(out)
    holders = {}
    for i, g in enumerate(games):
        key = '\x00G%d\x00' % i
        holders[key] = g
        out = out.replace(g, key, 1)
    for rx, zh in _phrase_re:
        out = rx.sub(zh, out)
    for rx, zh in _word_re:
        out = rx.sub(zh, out)
    for key, g in holders.items():
        out = out.replace(key, g)
    # 清理多余空格
    out = re.sub(r'[ \t]{2,}', ' ', out)
    return out

# 白名单：翻译后允许残留的英文（占位符、符号、缩写、代号、颜色梗）
ALLOW = re.compile(r'\b(?:AX|BX|CX|DX|DNA|RNA|siRNA|mRNA|tRNA|M|PRO|PRI|COM|ONE|OUT|DB|OB|HP|MP|'
                   r'I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX|'
                   r'XXI|XXII|XXIII|XXIV|XXV|XXVI|XXVII|XXVIII|XXXI|XXXII|XXXIII|XXXIV|'
                   r'LII|LIII|LIV|LIX|LXI|LXV|LXIX|LXXV|log|log2|log10|sqrt|pow|exp|ln|max|min|e|'
                   r'u|sup|sub|bdi|b|br|style|color|span|div|OFF|ON|shift|Shift|Iota|Kappa|Lambda|Mu|'
                   r'uTINE|tesTINE|TEStine|TINE|testine|tes|TEST|IN|in)\b')

def residual(out):
    # 去掉 HTML 标签与占位符后，找裸英文单词
    s = re.sub(r'<[^>]*>', ' ', out)
    # 先把字母+数字代号（C12、M61）整体剔除，避免拆出单字母 C/M
    s = re.sub(r'\b[A-Za-z]+\d+[A-Za-z0-9]*\b', ' ', s)
    toks = re.findall(r'[A-Za-z]+', s)
    # 排除：罗马数字、白名单、大小写文字游戏
    def ok(t):
        if t in ROMAN or ALLOW.fullmatch(t):
            return True
        if t.lower() in ('testine', 'intestine', 'in', 'integrin', 'm', 'tine', 'tes', 'inte',
                         'an', 'can', 't', 'gonna', 'he', 'him', 'offer', 'refuse', 'make',
                         'i', 'im', 'quote', 'protein'):
            return True
        # 大小写文字游戏：任意大小写组合的 intestine 片段
        if re.fullmatch(r'[iI][nN]?[tT]?[eE]?[sS]?[tT]?[iI]?[nN]?[eE]?', t) and len(t) >= 2:
            return True
        return False
    return [t for t in toks if not ok(t)]

def main():
    src = io.open(SRC, encoding='utf-8').read()
    strs = re.findall(r'"([^"\\]*(?:\\.[^"\\]*)*)"', src)
    eng = sorted(set(x for x in strs if re.search(r'[A-Za-z]', x) and re.search(r'\s', x)))
    mp = {}
    bad = []
    for x in eng:
        zh = translate(x)
        mp[x] = zh
        r = residual(zh)
        if r:
            bad.append((x, zh, r))
    json.dump(mp, io.open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('片段总数', len(eng), '映射', len(mp))
    print('仍有裸英文残留', len(bad))
    for x, zh, r in bad[:60]:
        print('  ', repr(x))
        print('=> ', repr(zh), ' 残留', r)

if __name__ == '__main__':
    main()
