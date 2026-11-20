"""注入引擎通用 UI 标签短串的译文（拼接尾巴，位置回填可精确命中）。

这些是 TMT 引擎在各升级/里程碑卡片里硬编码的标签前缀/分隔符，
此前提取器与词表均未覆盖，导致 Levels:/Currently:/Cost: 等残留英文。
"""
import json, os
D = os.path.dirname(os.path.abspath(__file__))
PATH = os.path.join(D, 'dictionary.json')

# 精确短串映射（en -> zh）
UI = {
    'Levels: ': '等级: ',
    'Levels:': '等级:',
    'Amount: ': '数量: ',
    'Amount:': '数量:',
    'Cost: ': '花费: ',
    'Cost:': '花费:',
    'Currently: ': '当前: ',
    'Currently:': '当前:',
    ' Currently: *': ' 当前: *',
    'Currently: *': '当前: *',
    'Currently: +': '当前: +',
    'Currently: -': '当前: -',
    'Currently: /': '当前: /',
    'Currently: ^': '当前: ^',
    'Currently ': '当前 ',
    'Goal: ': '目标: ',
    'Goal:': '目标:',
    'Effect: ': '效果: ',
    'Next: ': '下一个: ',
    'Gain ': '获得 ',
    ' Gain': ' 获得',
    'Gain ': '获得 ',
    'Gain ^': '获得 ^',
    ' gain.': ' 获得。',
    ' gain': ' 获得',
    'Cost': '花费',
    'Start': '开始',
    'Bulk': '批量',
    'Bulk II': '批量 II',
    'Nullify': '归零',
    'Sacrifice': '献祭',
    'Toggle': '切换',
    'Second': '秒',
    'Minute': '分',
    'Decaseconds': '十秒',
    '1 Second': '1 秒',
    '1 Minute': '1 分钟',
    '6 Decaseconds': '6 个十秒',
    ' / Worker / second': ' / 工人 / 秒',
    'Start here!': '从这里开始！',

    # 拼接标题（' >Effect I' 这类由 contains 处理，这里补前缀词）
    'Effect': '效果',
    'Boosted Effect': '强化效果',
    'Upgraded Effect': '升级效果',

    # 其余显示短串（对象键由位置回填天然排除，这里只在源码有该字面量处生效）
    'Reward: ': '奖励: ',
    'Reward:': '奖励:',
    'Req: ': '需求: ',
    'Req:': '需求:',
    'Next:': '下一个:',
    'Thoughts': '思想',
    'Reset for ': '重置获取 ',
    ' amount ': ' 数量 ',
    ' levels.': ' 等级。',
    ') costs ': ') 花费 ',
    ' costs ': ' 花费 ',
    '15 Be levels': '15 Be 等级',
    'again.': '再来一次。',
}


def main():
    dic = json.load(open(PATH, encoding='utf-8'))
    added = 0
    for en, zh in UI.items():
        if en not in dic or dic[en] == en:
            dic[en] = zh
            added += 1
    json.dump(dic, open(PATH, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'注入 UI 标签短串: +{added}，词典合计 {len(dic)}')
    return added


if __name__ == '__main__':
    main()
