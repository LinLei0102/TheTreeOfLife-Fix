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

def apply_system_text():
    """系统组件里的固定 UI 文案。"""
    p=os.path.join(ROOT,'js','technical','systemComponents.js')
    s=open(p,encoding='utf-8',newline='').read()
    pairs=[
        ("'Reach ' + formatWhole(tmp[layer].requires) + ' ' + tmp[layer].baseResource + ' to unlock (You have ' + formatWhole(tmp[layer].baseAmount) + ' ' + tmp[layer].baseResource + ')'",
         "'需要 ' + formatWhole(tmp[layer].requires) + ' ' + tmp[layer].baseResource + ' 才能解锁（当前有 ' + formatWhole(tmp[layer].baseAmount) + ' ' + tmp[layer].baseResource + '）'"),
        ("'I am a button!'", "'我是一个按钮！'"),
        ('<br>Offline Time: {{formatTime(player.offTime.remain)}}<br>', '<br>离线时间：{{formatTime(player.offTime.remain)}}<br>'),
        ('class="overlayThing">You have </span>', 'class="overlayThing">你有 </span>'),
    ]
    n=0
    for a,b in pairs:
        c=s.count(a)
        if c==0:
            print('  WARN 系统文案未命中:',a[:40],file=sys.stderr)
        s=s.replace(a,b); n+=c
    open(p,'w',encoding='utf-8',newline='').write(s)
    return n

def apply_taxonomy_text():
    """taxonomySupport.js 未被提取器覆盖，直接固化该函数文案。"""
    p=os.path.join(ROOT,'js','utils','taxonomySupport.js')
    s=open(p,encoding='utf-8',newline='').read()
    pairs=[
        ('"Gene gain is <b>Sapien</b> amount plus 1,<br>and amount gain is 2<sup><b>levels</b></sup>-1, multiplied by above<sup>*</sup> amounts plus 1."',
         '"基因产出为 <b>智人</b> 数量加 1，<br>数量产出为 2<sup><b>等级</b></sup>-1，再乘以上述<sup>*</sup>数量加 1。"'),
        ('a.replace("2", "(Chromosome effect)")','a.replace("2", "（染色体效果）")'),
        ('"Amounts and gene amount decays by PC per second due to genetic cross contamination."',
         '"由于基因交叉污染，数量与基因数量每秒按 PC 衰减。"'),
        ('"Press shift to bulk buy 5x. The buyable in light blue is the cheapest."',
         '"按住 Shift 批量购买 5 倍。浅蓝色可购买项最便宜。"'),
        ('"The number of Chromosomes in amount effects is maxed at 5000."',
         '"数量效果中的染色体数量上限为 5000。"'),
    ]
    n=0
    for a,b in pairs:
        c=s.count(a)
        if c==0:
            print('  WARN 分类学文案未命中:',a[:40],file=sys.stderr)
        s=s.replace(a,b); n+=c
    open(p,'w',encoding='utf-8',newline='').write(s)
    return n

def apply_formula_replacements():
    """修正公式字符串里的 replace() 检索词，保证与已汉化公式一致。"""
    p=os.path.join(ROOT,'js','layers.js')
    s=open(p,encoding='utf-8',newline='').read()
    pairs=[
        ('eformula.replace("Animals", "Organs")','eformula.replace("动物", "器官")'),
        ('eformula.replace("Cells", "干细胞")','eformula.replace("细胞", "干细胞")'),
        ('cost.replace("干细胞", "Animals")','cost.replace("干细胞", "动物")'),
        ('eformula.replace("代币 II",','eformula.replace("代币II",'),
        # 插入值（replace 第二参数 / makeOrange 参数）里的资源名要汉化；
        # 检索键（第一参数）由词典回填同步处理，不要在这里动。
        ('a2.replace("动物升级", "Chromosomes")','a2.replace("动物升级", "染色体")'),
        ('eformula.replace("log2(代币)", "Chromosomes")','eformula.replace("log2(代币)", "染色体")'),
        ('makeOrange("Chromosomes")','makeOrange("染色体")'),
        ('eformula.replace("(细胞核)", "Chromosomes")','eformula.replace("(细胞核)", "染色体")'),
    ]
    n=0
    for a,b in pairs:
        c=s.count(a)
        if c==0:
            print('  WARN 公式替换未命中:',a,file=sys.stderr)
        s=s.replace(a,b); n+=c
    open(p,'w',encoding='utf-8',newline='').write(s)
    return n

def apply_tab_labels():
    """标签页按钮显示中文，但保留英文对象键作为存档键。"""
    p=os.path.join(ROOT,'js','technical','systemComponents.js')
    s=open(p,encoding='utf-8',newline='').read()
    labels=json.load(open(os.path.join(D,'tab_labels.json'),encoding='utf-8'))
    marker='var ZH_TAB_LABELS ='
    if marker not in s:
        payload='var ZH_TAB_LABELS = '+json.dumps(labels,ensure_ascii=False)+';\n'
        s=payload+s
    if 'tabLabel: function' not in s:
        s,n=re.subn(r"(props: \['layer', 'data', 'name'\],)(\r?\n)(\s*)(template: `)",
                    r"\1\2\3methods: { tabLabel: function(tab){ return ZH_TAB_LABELS[tab] || tab; } },\2\3\4",
                    s,count=1)
        if n==0:
            print('  WARN 标签方法注入失败',file=sys.stderr)
    s=s.replace('<span v-html="tab"></span>','<span v-html="tabLabel(tab)"></span>',1)
    open(p,'w',encoding='utf-8',newline='').write(s)
    return 1

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

def apply_system_ui():
    """系统设置页 / 信息页的固定 UI 文案（此前未被提取器覆盖）。"""
    p=os.path.join(ROOT,'js','technical','systemComponents.js')
    s=open(p,encoding='utf-8',newline='').read()
    mp=json.load(open(os.path.join(D,'system_ui_zh.json'),encoding='utf-8'))
    n=0; miss=[]
    # 长键优先，避免短键先命中破坏上下文
    for a in sorted(mp,key=lambda x:-len(x)):
        b=mp[a]
        c=s.count(a)
        if c==0: miss.append(a)
        s=s.replace(a,b); n+=c
    if miss:
        print('  WARN 系统面板未命中:',len(miss),file=sys.stderr)
        for a in miss[:8]: print('   ',repr(a[:60]),file=sys.stderr)
    open(p,'w',encoding='utf-8',newline='').write(s)
    return n

def apply_formula_display():
    """分类学上限公式说明页（formulaDisplaySupport.js，此前完全未覆盖）。"""
    p=os.path.join(ROOT,'js','utils','formulaDisplaySupport.js')
    s=open(p,encoding='utf-8',newline='').read()
    mp=json.load(open(os.path.join(D,'formula_zh.json'),encoding='utf-8'))
    n=0
    for a in sorted(mp,key=lambda x:-len(x)):
        b=mp[a]
        if a==b: continue
        c=s.count(a)
        s=s.replace(a,b); n+=c
    open(p,'w',encoding='utf-8',newline='').write(s)
    return n

def apply_taxonomy_tables():
    """分类学效果表 TAXONOMY_EFFECTS / TAXONOMY_NAMES（此前未覆盖）。"""
    p=os.path.join(ROOT,'js','utils','taxonomySupport.js')
    s=open(p,encoding='utf-8',newline='').read()
    mp=json.load(open(os.path.join(D,'taxonomy_zh.json'),encoding='utf-8'))
    n=0
    for a in sorted(mp,key=lambda x:-len(x)):
        b=mp[a]
        if a==b: continue
        c=s.count(a)
        s=s.replace(a,b); n+=c
    open(p,'w',encoding='utf-8',newline='').write(s)
    return n

def apply_theme_name():
    """主题显示为中文名，不影响 options.theme 存储值。"""
    p=os.path.join(ROOT,'js','utils','themes.js')
    s=open(p,encoding='utf-8',newline='').read()
    old='\treturn options.theme? options.theme : "default";'
    new='\tvar t = options.theme? options.theme : "default";\n\treturn {"default":"默认","aqua":"水蓝"}[t] || t;'
    if old in s:
        s=s.replace(old,new,1)
        open(p,'w',encoding='utf-8',newline='').write(s)
        return 1
    return 0

def apply_misc_units():
    """零散资源单位与成就文案漏译。"""
    total=0
    files={
      'js/layers.js':[
        ('[shift for primes]','[按住 Shift 查看素数]'),
        ('Primes: ','素数：'),
        ('makeRed("red")','makeRed("红色")'),
        ('"Click"','"点击"'),
        ('"Get 20 Hydrogen"','"获得 20 氢"'),
        ('"Chromosome"','"染色体"'),
        ('"Nucleus"','"细胞核"'),
        ('"Nucleuses"','"细胞核"'),
        ('"Tokens II"','"代币 II"'),
        ('"Space: 切换暂停"','"空格：切换暂停"'),
        ('description: "Control+','description: "Ctrl+'),
        ('description: "Shift+Control+','description: "Shift+Ctrl+'),
      ],
    }
    for f,pairs in files.items():
        p=os.path.join(ROOT,f)
        s=open(p,encoding='utf-8',newline='').read()
        for a,b in pairs:
            c=s.count(a); s=s.replace(a,b); total+=c
        open(p,'w',encoding='utf-8',newline='').write(s)
    return total

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
    print("系统文案:",apply_system_text())
    print("分类学文案:",apply_taxonomy_text())
    print("公式检索词:",apply_formula_replacements())
    print("标签页按钮:",apply_tab_labels())
    print("模板文案:",apply_template_text())
    print("系统面板:",apply_system_ui())
    print("公式说明页:",apply_formula_display())
    print("分类学效果表:",apply_taxonomy_tables())
    print("主题名:",apply_theme_name())
    print("零散单位:",apply_misc_units())

if __name__=='__main__': main()
