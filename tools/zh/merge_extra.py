"""增量合并：把补充的单词级译文并入词典，并刷新 candidates。"""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from extract import extract

D = os.path.dirname(__file__)
ROOT = os.path.abspath(os.path.join(D, '..', '..'))

FILES = [
    'js/layers.js','js/mod.js','js/utils.js','js/game.js','js/components.js',
    'js/technical/displays.js','js/technical/systemComponents.js',
    'js/utils/options.js','js/achievements.js','js/versions.js',
]

def main():
    # 从英文原版目录重新提取（en/ 是干净的基线），保证位置基于未汉化的源码
    new_cands = []
    for f in FILES:
        en_path = os.path.join(ROOT, 'en', f)
        if not os.path.exists(en_path):
            print('WARN 缺少', en_path); continue
        # extract 返回 file 字段是绝对路径形式，改成相对
        for c in extract(en_path):
            c['file'] = f
            new_cands.append(c)
    new_cands.sort(key=lambda x:(x['file'],x['line'],x['start']))
    json.dump(new_cands, open(os.path.join(D,'candidates.json'),'w',encoding='utf-8'),
              ensure_ascii=False, indent=1)
    print(f"新候选 {len(new_cands)} （含字段）")

    # 现有词典
    dic = json.load(open(os.path.join(D,'dictionary.json'),encoding='utf-8'))
    # 补充词译文
    en_words = json.load(open(os.path.join(D,'extra_words.json'),encoding='utf-8'))
    zh_words = json.load(open(os.path.join(D,'extra_words_zh.json'),encoding='utf-8'))
    assert len(en_words)==len(zh_words), (len(en_words),len(zh_words))
    added=0
    for a,b in zip(en_words,zh_words):
        if a not in dic:
            dic[a]=b; added+=1
        elif dic[a] in ('',a) and b!=a:
            dic[a]=b; added+=1
    json.dump(dic, open(os.path.join(D,'dictionary.json'),'w',encoding='utf-8'),
              ensure_ascii=False, indent=1)
    print(f"词典 {len(dic)} （新增 {added}）")

if __name__=='__main__':
    main()
