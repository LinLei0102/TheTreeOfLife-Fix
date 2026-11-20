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

def apply_residual_phrases():
    """漏网短串：成就提示、里程碑需求单位、化学元素/初始效果等。

    使用位置性字符串扫描，只改展示文本字面量；对象键与存档键不受影响。
    """
    mp = json.load(open(os.path.join(D,'residual_zh.json'),encoding='utf-8'))
    chem = json.load(open(os.path.join(D,'chemistry_zh.json'),encoding='utf-8'))
    locale = {
      'js/layers.js': mp,
      'js/achievements.js': mp,
      'js/utils/standardModelSupport.js': chem,
    }
    return apply_contains(locale)

def apply_exact_strings():
    """整条展示文本精确替换（忽略 HTML 包装），避免短词误伤对象键。"""
    mp = json.load(open(os.path.join(D,'exact_zh.json'),encoding='utf-8'))
    p = os.path.join(ROOT,'js','layers.js')
    s = open(p,encoding='utf-8',newline='').read()
    strings,_ = scan(s)
    def plain(v): return re.sub(r'<[^>]*>','',v).strip()
    edits=[]
    for x in strings:
        v=decode_js_string(x['raw'],x['quote'])
        key=plain(v)
        if key not in mp: continue
        new=v.replace(key,mp[key],1)
        if new==v: continue
        out=new.replace('\\','\\\\').replace('\n','\\n')
        if x['quote']=="'": out=out.replace("'","\\'")
        elif x['quote']=='"': out=out.replace('"','\\"')
        edits.append((x['start'],x['end'],x['quote'],out))
    edits.sort(key=lambda e:e[0],reverse=True)
    for st,en,q,out in edits:
        s=s[:st]+q+out+q+s[en:]
    if edits:
        open(p,'w',encoding='utf-8',newline='').write(s)
    return len(edits)

def apply_chain_fixes():
    """修正汉化后断开的 .replace() 公式链与挑战按钮文案。"""
    mp = json.load(open(os.path.join(D,'chain_fix_zh.json'),encoding='utf-8'))
    total = 0
    for f, pairs in mp.items():
        p = os.path.join(ROOT, f)
        if not os.path.exists(p): continue
        s = open(p,encoding='utf-8',newline='').read()
        for a,b in pairs.items():
            c = s.count(a)
            if c == 0:
                print('  WARN 链条修正未命中:',f,a[:48],file=sys.stderr)
            s = s.replace(a,b); total += c
        open(p,'w',encoding='utf-8',newline='').write(s)
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
        # 公式链条：检索键随上游汉化同步，插入值也汉化
        ('eformula.replace("log10(动物)", "Humans")','eformula.replace("log10(动物)", "人类")'),
        ('cost.replace("Humans", "Thoughts")','cost.replace("人类", "思想")'),
        ('a2.replace("Plants", "Thoughts")','a2.replace("植物", "思想")'),
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

def apply_components_ui():
    """引擎通用 Vue 组件模板 UI 文案（components.js，此前大量残留英文）。"""
    p=os.path.join(ROOT,'js','components.js')
    s=open(p,encoding='utf-8',newline='').read()
    mp=json.load(open(os.path.join(D,'components_zh.json'),encoding='utf-8'))
    n=0; miss=[]
    for a in sorted(mp,key=lambda x:-len(x)):
        b=mp[a]
        c=s.count(a)
        if c==0: miss.append(a)
        s=s.replace(a,b); n+=c
    if miss:
        print('  WARN 组件模板未命中:',len(miss),file=sys.stderr)
        for a in miss[:10]: print('   ',repr(a[:60]),file=sys.stderr)
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

def apply_bracket_tokens():
    """方括号占位符 [xxx] 里的英文词中文化。

    这些 token 是字面显示的公式占位说明（英文原版也如此），不在运行时替换。
    只改字符串字面量内的 token，避免误伤代码里的数组索引 arr[tokens]。
    带方括号整体匹配，保证 .replace("[upgrades]", ...) 检索键与插入值同步。
    """
    mp=json.load(open(os.path.join(D,'bracket_tokens.json'),encoding='utf-8'))
    locale={'js/layers.js':mp}
    return apply_contains(locale)

def apply_formula_words():
    """公式/描述串里夹带的普通英文词（Thoughts→思想、resets→重置次数等）。

    采用整串精确替换，避免误伤 makeBlue()/方括号占位符/英文 replace 检索键。
    make/him/gonna/Tapeworm/Hual 等混淆词与台词梗是游戏玩法内容，刻意保留。
    """
    mp = json.load(open(os.path.join(D,'formula_words.json'),encoding='utf-8'))
    total=0
    for f,pairs in mp.items():
        p=os.path.join(ROOT,f)
        if not os.path.exists(p): continue
        s=open(p,encoding='utf-8',newline='').read()
        for a,b in pairs.items():
            c=s.count(a)
            if c==0: print('  WARN 公式词未命中:',f,repr(a[:48]),file=sys.stderr)
            s=s.replace(a,b); total+=c
        open(p,'w',encoding='utf-8',newline='').write(s)
    return total

def apply_resource_names():
    """improveName() 把子资源 id 动态拼成英文（genes→Genes、widgets→Widgets）。

    这些英文串在源码里不存在（运行时生成），静态词典/扫描都抓不到。
    给 improveName 注入一张 id→中文映射，命中即返回中文。
    """
    p=os.path.join(ROOT,'js','utils.js')
    s=open(p,encoding='utf-8',newline='').read()
    if 'ZH_RESOURCE_NAMES' in s: return 0
    mp=json.load(open(os.path.join(D,'resource_names.json'),encoding='utf-8'))
    pairs=', '.join(json.dumps(k,ensure_ascii=False)+':'+json.dumps(v,ensure_ascii=False) for k,v in mp.items())
    inj=('function improveName(s){\n'
         '\tconst ZH_RESOURCE_NAMES = {'+pairs+'};\n'
         '\tif (ZH_RESOURCE_NAMES[s] !== undefined) return ZH_RESOURCE_NAMES[s];')
    old='function improveName(s){'
    if old not in s:
        print('  WARN improveName 未找到',file=sys.stderr); return 0
    s=s.replace(old,inj,1)
    open(p,'w',encoding='utf-8',newline='').write(s)
    return 1

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

def apply_mod_text():
    """mod.js 顶部状态栏与模式切换确认框里的漏网展示串。"""
    return apply_contains({'js/mod.js':{
        'THE GAME IS PAUSED':'游戏已暂停',
        ' ms/tick = ':' 毫秒/帧 = ',
        '[cancel]':'[取消]',
        '[okay]':'[确定]',
    }})

def apply_engine_text():
    """引擎 NaN 检测弹窗（tmp.js）中文化。

    名称是运行时变量 item（getInit/cost/exp 等），不只是固定文案：
    常见 tmp 函数名译成中文并保留原名，未收录的名字原样显示，
    保证任意名称下中文句式都成立。
    """
    n = apply_contains({'js/technical/temp.js':{
        "Invalid value found in tmp, named '": "tmp 中发现无效值，名称：'",
        "'. Please let the creator of this mod know with a screenshot of the console and the save! You can refresh the page, and you will be un-NaNed.":
            "'。请把控制台截图和存档发给本模组作者！刷新页面即可恢复正常。",
    }})
    p = os.path.join(ROOT, 'js', 'technical', 'temp.js')
    s = open(p, encoding='utf-8', newline='').read()
    if 'function tmpKeyZh' not in s:
        helper = (
            'function tmpKeyZh(k){\n'
            '  var M={getInit:"初始值",getCostBase:"花费基数",cost:"花费",exp:"指数",\n'
            '    unlocked:"解锁条件",effect:"效果",effectDescription:"效果描述",\n'
            '    display:"显示",fullDisplay:"完整显示",layerShown:"层级显示",\n'
            '    deactivated:"已停用",startData:"初始数据",doReset:"重置",update:"更新",\n'
            '    canBuy:"可购买",buy:"购买",buyMax:"最大购买",onPress:"按下时",onClick:"点击时"};\n'
            '  return M[k] ? M[k]+"（"+k+"）" : k;\n'
            '}\n'
        )
        s = helper + s
        open(p, 'w', encoding='utf-8', newline='').write(s)
        n += 1
    s = open(p, encoding='utf-8', newline='').read()
    needle = "名称：'\" + item + \"'"
    if needle in s and 'tmpKeyZh(item)' not in s:
        s = s.replace(needle, "名称：'\" + tmpKeyZh(item) + \"'")
        open(p, 'w', encoding='utf-8', newline='').write(s)
        n += 1
    return n

def apply_options_text():
    """系统设置里里程碑显示模式的两个英文枚举值。"""
    p=os.path.join(ROOT,'js','utils','options.js')
    s=open(p,encoding='utf-8',newline='').read()
    pairs=[('"INCOMPLETE", "NONE"','"仅未完成", "不显示"')]
    n=0
    for a,b in pairs:
        c=s.count(a); s=s.replace(a,b); n+=c
    if n: open(p,'w',encoding='utf-8',newline='').write(s)
    return n

def apply_connector_words():
    """中文句子里夹带的英文连接词 and / and,（只改字符串字面量）。"""
    return apply_contains({'js/layers.js':{
        ' and, ':' 和 ',
        ' and ':' 和 ',
    }})

def apply_list_punctuation():
    """器官升级数量列表的连接标点与句号中文化（须在 and 替换之后运行）。"""
    p=os.path.join(ROOT,'js','layers.js')
    s=open(p,encoding='utf-8',newline='').read()
    pairs=[
        ('e = e1[0] + "," + e1[1] + " 和 " + e1[2] + "."',
         'e = e1[0] + "、" + e1[1] + " 和 " + e1[2] + "。"'),
        ('e = e1[0] + " 和 " + e1[1] + "."',
         'e = e1[0] + " 和 " + e1[1] + "。"'),
        ('e = e1[0] + "."', 'e = e1[0] + "。"'),
    ]
    n=0
    for a,b in pairs:
        c=s.count(a); s=s.replace(a,b); n+=c
        if c==0: print('  WARN 列表标点未命中:',a[:48],file=sys.stderr)
    if n: open(p,'w',encoding='utf-8',newline='').write(s)
    return n

def apply_gem_descriptions():
    """宝石效果说明（gemSupport.js 的前两段描述对象）此前完全未覆盖。

    只翻译 <br> 前的说明短语，公式部分原样保留；数字 id 与函数名不受影响。
    """
    mp=json.load(open(os.path.join(D,'gem_terms.json'),encoding='utf-8'))
    p=os.path.join(ROOT,'js','utils','gemSupport.js')
    if not os.path.exists(p): return 0
    s=open(p,encoding='utf-8',newline='').read()
    strings,_=scan(s)
    edits=[]
    for x in strings:
        if s.count('\n',0,x['start'])+1 > 133: break  # 后面是公式与工具函数
        val=decode_js_string(x['raw'],x['quote'])
        m=re.match(r"(<bdi style='[^']+'>)(.*)(</bdi>)$",val)
        if m: pre,inner,post=m.group(1),m.group(2),m.group(3)
        else: pre,inner,post='',val,''
        if '<br>' not in inner: continue
        left,right=inner.split('<br>',1)
        if left not in mp: continue
        newval=pre+mp[left]+'<br>'+right+post
        if newval==val: continue
        out=newval.replace('\\','\\\\').replace('\n','\\n')
        if x['quote']=="'": out=out.replace("'","\\'")
        elif x['quote']=='"': out=out.replace('"','\\"')
        edits.append((x['start'],x['end'],x['quote'],out))
    edits.sort(key=lambda e:e[0],reverse=True)
    for st,enp,q,out in edits:
        s=s[:st]+q+out+q+s[enp:]
    if edits: open(p,'w',encoding='utf-8',newline='').write(s)
    return len(edits)

def apply_save_ui():
    """存档管理/导入导出弹窗里的英文提示中文化。只改展示字符串字面量。"""
    mp=json.load(open(os.path.join(D,'save_ui_zh.json'),encoding='utf-8'))
    return apply_contains({'js/utils/save.js':mp})

def apply_save_names():
    """内置存档名（CUSTOM_SAVES 的对象键）中文化。

    存档名既是 UI 显示文本，也是 importSave 的查找键（CUSTOM_SAVES_IDS =
    Object.keys(CUSTOM_SAVES)，点击原样传回），因此翻译键会同步生效。
    只改「字符串字面量恰好等于存档名」的项（即键），base64 值不匹配任何
    存档名、绝不改动。保留 EX: 前缀（key.slice(0,2)=='EX' 与 .replace 依赖）。
    """
    mp=json.load(open(os.path.join(D,'save_names.json'),encoding='utf-8'))
    p=os.path.join(ROOT,'js','technical','customSaves.js')
    if not os.path.exists(p): return 0
    s=open(p,encoding='utf-8',newline='').read()
    strings,_=scan(s)
    # 只把「字面量值恰好是英文存档名」的项列为编辑；最长优先避免子串误伤
    edits=[]
    for x in strings:
        if x['end']-x['start']>200: continue  # 跳过超长 base64
        val=decode_js_string(x['raw'],x['quote'])
        if val in mp:
            new=mp[val]
            if new!=val: edits.append((x['start'],x['end'],x['quote'],new))
    edits.sort(key=lambda e:e[0],reverse=True)
    for st,enp,q,new in edits:
        out=new.replace('\\','\\\\').replace('\n','\\n')
        if q=="'": out=out.replace("'","\\'")
        elif q=='"': out=out.replace('"','\\"')
        s=s[:st]+q+out+q+s[enp:]
    if edits: open(p,'w',encoding='utf-8',newline='').write(s)
    return len(edits)

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
        # 拼接标题前缀（'>Effect I / >Boosted Effect XXV / >Upgraded Effect X）
        'Boosted Effect':'强化效果','Upgraded Effect':'升级效果','Effect':'效果',
        'Currently: <bdi':'当前: <bdi','Currently: ': '当前: ',
        'Reward: Remove':'奖励：移除',"Increase 3's base cost":"提高 3 的基础花费",
      },
    }
    print("包含匹配回填:",apply_contains(locale))
    print("漏网短串回填:",apply_residual_phrases())
    print("整条标题回填:",apply_exact_strings())
    print("链条/按钮修正:",apply_chain_fixes())
    print("系统文案:",apply_system_text())
    print("分类学文案:",apply_taxonomy_text())
    print("公式检索词:",apply_formula_replacements())
    print("标签页按钮:",apply_tab_labels())
    print("模板文案:",apply_template_text())
    print("组件模板:",apply_components_ui())
    print("系统面板:",apply_system_ui())
    print("公式说明页:",apply_formula_display())
    print("分类学效果表:",apply_taxonomy_tables())
    print("主题名:",apply_theme_name())
    print("零散单位:",apply_misc_units())
    print("资源显示名:",apply_resource_names())
    print("公式普通词:",apply_formula_words())
    print("英文连接词:",apply_connector_words())
    print("列表标点:",apply_list_punctuation())
    print("mod.js 状态栏:",apply_mod_text())
    print("引擎报错提示:",apply_engine_text())
    print("设置枚举值:",apply_options_text())
    print("宝石效果说明:",apply_gem_descriptions())
    print("方括号占位符:",apply_bracket_tokens())
    print("内置存档名:",apply_save_names())
    print("存档弹窗提示:",apply_save_ui())

if __name__=='__main__': main()
