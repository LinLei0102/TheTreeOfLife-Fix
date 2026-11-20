"""收尾补丁：rebuild.py 之后的所有手工修正，固化以保证可复现。

包含：
1. 数字读法函数中文化
2. 拼接尾巴标题补全（DNA/Lambda/Kappa/Iota 等词根）
3. 漏译短标题/UI 标签（按包含匹配回填）
4. Vue 模板里的固定 UI 文案
"""
import os, sys, json, re
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..'))
D = os.path.join(ROOT,'tools','zh')
sys.path.insert(0, r"C:\Users\Administrator\.workbuddy\skills\game-localization\scripts")
from jslex import scan, decode_js_string

def apply_number_fn():
    s=open(os.path.join(ROOT,'js','achievements.js'),encoding='utf-8',newline='').read()
    if 'function getNumberNameLT1000' not in s: return 0
    a=s.index('function getNumberNameLT1000'); b=s.index('function getAchStuffFromNumber')
    patch=open(os.path.join(D,'number_fn_patch.txt'),encoding='utf-8').read()
    if getNumberName_patched(s): return 0
    open(os.path.join(ROOT,'js','achievements.js'),'w',encoding='utf-8',newline='').write(s[:a]+patch+s[b:])
    return 1

def getNumberName_patched(s):
    seg=s[s.index('function getNumberNameLT1000'):s.index('function getAchStuffFromNumber')]
    return '"百"' in seg or '百' in seg

def apply_contains(locale):
    """按包含匹配回填漏译（词典里 key 是纯词，源码里带 HTML 包装）。"""
    total=0
    for f, pairs in locale.items():
        p=os.path.join(ROOT,f)
        if not os.path.exists(p): continue
        s=open(p,encoding='utf-8',newline='').read()
        strings,_=scan(s)
        ordered=sorted(pairs.items(),key=lambda x:-len(x[0]))
        edits=[]
        for x in strings:
            val=decode_js_string(x['raw'],x['quote'])
            new=val
            for en,zh in ordered:
                if en in new: new=new.replace(en,zh)
            if new!=val: edits.append((x['start'],x['end'],x['quote'],new))
        edits.sort(key=lambda e:e[0],reverse=True)
        for st,enp,q,new in edits:
            out=new.replace('\\','\\\\').replace('\n','\\n')
            if q=="'": out=out.replace("'","\\'")
            elif q=='"': out=out.replace('"','\\"')
            s=s[:st]+q+out+q+s[enp:]
        if edits:
            open(p,'w',encoding='utf-8',newline='').write(s); total+=len(edits)
    return total

def apply_template_text():
    p=os.path.join(ROOT,'js','components.js'); s=open(p,encoding='utf-8',newline='').read()
    n=0
    for a,b in [('>Currently: <','>当前: <'),('<br>Currently: <','<br>当前: <'),
                ('Cost: {{','花费: {{'),('v-html="\'Requires: \'','v-html="\'需要: \''),
                ('"Levels:<br>"','"等级:<br>"'),('>You have ','>你有 ')]:
        c=s.count(a); s=s.replace(a,b); n+=c
    s=s.replace('>你有 {{','>你有 {{').replace('>You have made a total of {{','>你总共获得了 {{')
    open(p,'w',encoding='utf-8',newline='').write(s)
    return n

def main():
    print("数字函数:",apply_number_fn())
    locale={
      'js/layers.js':{
        'Show a row':'显示一行','Repetitive clicking':'重复点击','Arthritis cure':'关节炎疗法',
        'Pre-frontal cortex':'前额叶皮层','Frontal cortex':'额叶皮层','Ankle sprain':'脚踝扭伤',
        'Multiplicative Identity':'乘法单位元','Even Prime':'偶素数','Odd Prime':'奇素数',
        'Even square':'偶平方数','Safe Prime':'安全素数','Start here!':'从这里开始！',
        'You get one':'你获得一个','An old silent pond /':'古池呀——','A frog jumps into':'青蛙跳入',
        'Splash! Silence':'扑通一声！万籁俱寂','by Matsuo Bashō':'——松尾芭蕉',
        'Egg is here.':'蛋来了。','Once Upon':'从前','rather near':'近在咫尺',
        'Radio Waves':'无线电波','Near-ultraviolet':'近紫外线','Gamma Rays':'伽马射线',
        'UHF Gamma Rays':'超高频伽马射线','Semi-exponential':'半指数','Double-exponential':'双指数',
        'Sell-all':'全部出售','Upgrades':'升级','Deuterium':'氘',
      },
    }
    print("包含匹配回填:",apply_contains(locale))
    print("模板文案:",apply_template_text())

if __name__=='__main__': main()
