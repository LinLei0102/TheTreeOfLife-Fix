"""完整重建：从英文基线重新生成中文版（幂等、可复现）。

流程：
1. git checkout 基线 tag 恢复根目录源码（不动 en/）
2. 汇总词典：主词典 + 尾巴规则 + 补充词 + 样式长句
3. 用修复后的提取器从 en/ 重新生成完整 candidates
4. 调 build.py 回填主体
5. 回填拼接尾巴（895 条）
6. 语法检查
"""
import os, sys, json, subprocess, re
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
D = os.path.join(ROOT, 'tools', 'zh')
sys.path.insert(0, D)
sys.path.insert(0, r"C:\Users\Administrator\.workbuddy\skills\game-localization\scripts")
from jslex import scan

def git(*a):
    return subprocess.run(['git',*a],cwd=ROOT,capture_output=True,text=True,encoding='utf-8')

def merge_dictionary():
    dic = json.load(open(os.path.join(D,'dictionary.json'),encoding='utf-8'))
    # 补充词
    for a,b,c in [('extra_words.json','extra_words_zh.json','补充词'),
                  ('styled_miss.json','styled_miss_zh.json','样式长句')]:
        ap,bp=os.path.join(D,a),os.path.join(D,b)
        if os.path.exists(ap) and os.path.exists(bp):
            en=json.load(open(ap,encoding='utf-8')); zh=json.load(open(bp,encoding='utf-8'))
            assert len(en)==len(zh),(a,len(en),len(zh))
            add=0
            for x,y in zip(en,zh):
                if x not in dic or dic[x]==x:
                    dic[x]=y; add+=1
            print(f"  {c}: +{add}")
    json.dump(dic,open(os.path.join(D,'dictionary.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
    print(f"  词典合计 {len(dic)}")

def main():
    print("1) 恢复基线源码")
    r=git('checkout','zh-baseline-evolution','--','index.html','js/')
    if r.returncode: print(r.stderr); sys.exit(1)

    print("2) 汇总词典")
    merge_dictionary()

    print("3) 重新提取完整候选")
    from extract import extract
    FILES=['js/layers.js','js/mod.js','js/utils.js','js/game.js','js/components.js',
           'js/technical/displays.js','js/technical/systemComponents.js',
           'js/utils/options.js','js/achievements.js','js/versions.js']
    cands=[]
    for f in FILES:
        for c in extract(os.path.join(ROOT,'en',f)):
            c['file']=f; cands.append(c)
    # 补充：词典里有、但提取器没纳入的短片段（如 " ago. "），按字面定位追加
    dic_all = json.load(open(os.path.join(D,'dictionary.json'),encoding='utf-8'))
    covered = set(c['en'] for c in cands)
    extra_added = 0
    for en_key, zh in dic_all.items():
        if en_key in covered or not zh or en_key == zh:
            continue
        # 在英文原版里找该字面量（带引号）；按源码实际引号类型匹配
        found = False
        for f in FILES:
            ep = os.path.join(ROOT,'en',f)
            if not os.path.exists(ep): continue
            esrc = open(ep,encoding='utf-8',newline='').read()
            for q in ['"', "'"]:
                needle = q+en_key+q
                pos = 0
                while True:
                    i = esrc.find(needle, pos)
                    if i < 0: break
                    # start 指向引号本身，end 指向结束引号之后（与 jslex 的 s.start/s.end 一致）
                    cands.append({'file':f,'line':esrc.count('\n',0,i)+1,'start':i,
                                  'end':i+2+len(en_key),'quote':q,'en':en_key,'field':False})
                    extra_added += 1; found = True; pos = i+2+len(en_key)-1
                if found: break
            if found: break
    cands.sort(key=lambda x:(x['line'],x['start']))
    cands.sort(key=lambda x:x['file'])
    json.dump(cands,open(os.path.join(D,'candidates.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
    print(f"  候选 {len(cands)}（含补充短片段 {extra_added}）")

    print("4) build 主体回填")
    r=subprocess.run([sys.executable,os.path.join(D,'build.py')],cwd=ROOT,capture_output=True,text=True,encoding='utf-8')
    print(r.stdout[-600:]); print(r.stderr[-300:] if r.stderr else '')

    print("5) 回填拼接尾巴")
    tail=json.load(open(os.path.join(D,'tail_map.json'),encoding='utf-8'))
    rawmap={chr(39)+k:chr(39)+v for k,v in tail.items()}
    f=os.path.join(ROOT,'js','layers.js')
    src=open(f,encoding='utf-8',newline='').read()
    strings,_=scan(src)
    edits=[(s['start'],s['end'],rawmap[s['raw']]) for s in strings if s['quote']=='"' and s['raw'] in rawmap]
    edits.sort(key=lambda x:x[0],reverse=True)
    for st,en,newraw in edits:
        src=src[:st]+'"'+newraw+'"'+src[en:]
    open(f,'w',encoding='utf-8',newline='').write(src)
    print(f"  尾巴替换 {len(edits)}")

    print("6) index.html 纯文本补翻")
    dic_all = json.load(open(os.path.join(D,'dictionary.json'),encoding='utf-8'))
    hp = os.path.join(ROOT,'index.html')
    hsrc = open(hp,encoding='utf-8',newline='').read()
    html_fixed = 0
    for k,v in dic_all.items():
        if k==v or not k.strip() or '<' in k: continue
        if k in hsrc:
            c=hsrc.count(k); hsrc=hsrc.replace(k,v); html_fixed+=c
    open(hp,'w',encoding='utf-8',newline='').write(hsrc)
    print(f"  HTML 纯文本替换 {html_fixed}")

    print("7) 语法检查")
    bad=[]
    for dp,_,fs in os.walk(os.path.join(ROOT,'js')):
        for fn in fs:
            if fn.endswith('.js'):
                p=os.path.join(dp,fn)
                r=subprocess.run(['node','--check',p],capture_output=True)
                if r.returncode: bad.append(p)
    print(f"  语法失败 {len(bad)}", bad[:5])

if __name__=='__main__':
    main()
