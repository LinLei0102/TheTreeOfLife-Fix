"""汉化构建主脚本（路线 B：源码补丁 + 双语双入口）

职责：
1. 从 HEAD(evolution 原版) 导出英文原版到 en/（若不存在）
2. 用 dictionary.json 位置性回填，生成中文版源码到根目录
3. 给根目录 index.html 注入 charset / 语言层脚本
4. 给设置面板注入语言切换按钮
5. 全部改动做命中数断言，失败即中止

用法: python tools/zh/build.py
"""
import os, re, json, subprocess, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, r"C:\Users\Administrator\.workbuddy\skills\game-localization\scripts")
from jslex import scan, decode_js_string

DICT_PATH = os.path.join(ROOT, 'tools', 'zh', 'dictionary.json')
EN_DIR = os.path.join(ROOT, 'en')
BASE_TAG = 'zh-baseline-evolution'

# 需要汉化的源码文件（相对根目录）
SRC_FILES = [
    'index.html', 'js/mod.js', 'js/utils.js', 'js/game.js', 'js/components.js',
    'js/technical/displays.js', 'js/technical/systemComponents.js',
    'js/utils/options.js', 'js/achievements.js', 'js/versions.js', 'js/layers.js',
]

def git(*args, cwd=ROOT):
    r = subprocess.run(['git', *args], cwd=cwd, capture_output=True, text=True, encoding='utf-8')
    if r.returncode != 0:
        raise RuntimeError(f"git {' '.join(args)} failed: {r.stderr}")
    return r.stdout

def ensure_en_backup():
    """从未改动的基线 tag 导出英文原版到 en/。"""
    if os.path.isdir(EN_DIR) and os.listdir(EN_DIR):
        print(f"[en] 原版备份已存在: {EN_DIR}")
        return
    os.makedirs(EN_DIR, exist_ok=True)
    # 用 git archive 导出基线快照
    import io, tarfile
    data = subprocess.run(['git', 'archive', BASE_TAG], cwd=ROOT, capture_output=True).stdout
    with tarfile.open(fileobj=io.BytesIO(data), mode='r') as tf:
        tf.extractall(EN_DIR)
    print(f"[en] 已从 tag {BASE_TAG} 导出原版到 {EN_DIR}")

def encode_for_quote(text, quote):
    out = text.replace('\\', '\\\\').replace('\n', '\\n').replace('\r', '\\r')
    if quote == "'": out = out.replace("'", "\\'")
    elif quote == '"': out = out.replace('"', '\\"')
    elif quote == '`': out = out.replace('`', '\\`')
    return out

TOKEN_RE = re.compile(r'(\[[^\]]+\]|<[^>]+>|\{[^}]*\}|\$\{[^}]*\})')
def tokens(s): return sorted(TOKEN_RE.findall(s))

def patch_js(src, dic, cands_for_file):
    """只对提取器认定的展示文本位置回填（避免误伤当键用的字符串）。返回替换数。"""
    edits = []
    for c in cands_for_file:
        en = c['en']
        if en not in dic:
            continue
        zh = dic[en]
        if not zh or zh == en:
            continue
        if tokens(en) != tokens(zh):
            continue
        q = c['quote']
        edits.append((c['start'], c['end'], q, zh))
    edits.sort(key=lambda x: x[0], reverse=True)
    for start, end, q, zh in edits:
        src = src[:start] + q + encode_for_quote(zh, q) + q + src[end:]
    return len(edits), src

def patch_html(src, dic):
    """HTML 里对纯文本节点做整段/片段替换（仅词典里有的）。"""
    n = 0
    for en, zh in dic.items():
        if en == zh or not en.strip():
            continue
        if '<' in en or '>' in en:  # HTML 片段用字面替换（谨慎）
            if en in src:
                c = src.count(en)
                src = src.replace(en, zh); n += c
    return n, src

def inject_charset_and_lang(html):
    # 1) charset
    if not re.search(r'<meta\s+charset', html, re.I):
        html = html.replace('<head>', '<head>\n\t<meta charset="utf-8">', 1)
    # 2) 语言层脚本（放在 head 最前，越早跳转越好）
    if 'lang_layer.js' not in html:
        html = html.replace('<head>', '<head>\n\t<script src="tools/zh/lang_layer.js"></script>', 1)
    return html

def inject_switch_button(src):
    anchor = '<td><button class="opt" onclick="save()">Save</button></td>'
    # 在设置面板第一行的 Save 按钮旁加语言切换（先按英文原文锚点；若已被汉化则按 onclick 定位）
    if 'switchLanguage()' in src:
        return src, 0
    m = re.search(r'(<td><button class="opt" onclick="save\(\)">[^<]*</button></td>)', src)
    if not m:
        return src, 0
    btn = ('<td><button class="opt" onclick="switchLanguage()">'
           '语言 / Language: {{ getLangLabel() }}</button></td>')
    src = src[:m.end()] + '\n                ' + btn + src[m.end():]
    return src, 1

def main():
    if not os.path.exists(DICT_PATH):
        print('ERROR: dictionary.json 不存在', file=sys.stderr); sys.exit(1)
    dic = json.load(open(DICT_PATH, encoding='utf-8'))
    print(f"词典条目 {len(dic)}")

    # 加载候选位置信息，按文件分组
    cands_path = os.path.join(ROOT, 'tools', 'zh', 'candidates.json')
    cands = json.load(open(cands_path, encoding='utf-8'))
    by_file = {}
    for c in cands:
        by_file.setdefault(c['file'], []).append(c)

    ensure_en_backup()

    total = 0
    for f in SRC_FILES:
        p = os.path.join(ROOT, f)
        src = open(p, encoding='utf-8', newline='').read()
        if f.endswith('.js'):
            n, src = patch_js(src, dic, by_file.get(f, []))
        else:
            n, src = patch_html(src, dic)
        if f == 'index.html':
            src = inject_charset_and_lang(src)
        if f == 'js/technical/systemComponents.js':
            src, k = inject_switch_button(src)
            if k == 0:
                print('  WARN: 语言切换按钮锚点未命中', file=sys.stderr)
            else:
                n += k
        open(p, 'w', encoding='utf-8', newline='').write(src)
        total += n
        print(f"  {f}: {n}")

    # en 入口：复制英文原版 index.html 为 index.en.html（原版在 en/index.html 已存在）
    en_index = os.path.join(EN_DIR, 'index.html')
    if os.path.exists(en_index):
        en_src = open(en_index, encoding='utf-8', newline='').read()
        en_src = inject_charset_and_lang(en_src)
        # en/ 子目录下脚本路径要加 ../
        en_src = en_src.replace('src="tools/zh/lang_layer.js"', 'src="../tools/zh/lang_layer.js"')
        # 英文版设置面板同样加语言切换按钮（锚点按英文原文 Save）
        en_src, k = inject_switch_button(en_src)
        open(en_index, 'w', encoding='utf-8', newline='').write(en_src)
    print(f"\n完成，总替换 {total}")

if __name__ == '__main__':
    main()
