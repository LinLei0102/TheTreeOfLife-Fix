var ZH_TAB_LABELS = {"Achievements": "成就", "Activate": "激活", "Air": "空气", "All": "全部", "Animals": "动物", "Anti": "反挑战", "Atomic Hydrogen": "原子氢", "Biomass": "生物质", "Boosted Effects": "强化效果", "Buyables": "可购买项", "Buyables II": "可购买项 II", "C Research": "C 研究", "Cells": "细胞", "Challenges": "挑战", "Chemistry 1": "化学 1", "Coins": "硬币", "Contaminants": "污染物", "DNA": "DNA", "DNA Research": "DNA 研究", "Deuterium": "氘", "Dilation": "膨胀", "Ecosystems": "生态系统", "Effects": "效果", "End": "终局", "Energy": "能量", "Factories": "工厂", "First": "第一", "Flat": "固定", "Fuel": "燃料", "Genes": "基因", "H Research": "H 研究", "Heart": "心脏", "Info": "信息", "Intestine": "肠道", "Iota": "ι", "Kappa": "κ", "Kidney": "肾脏", "Lambda": "λ", "Lung": "肺", "Main": "主要", "Mastery": "精通", "Micro": "微观", "Middle": "中期", "Milestones": "里程碑", "Mu": "μ", "Multipliers": "倍率", "N Research": "N 研究", "Nothing": "无", "O Research": "O 研究", "Old": "旧版", "Old+": "旧版+", "Organ Research": "器官研究", "Organs": "器官", "Points": "点数", "Protein": "蛋白质", "Protein Research": "蛋白质研究", "RNA Research": "RNA 研究", "Scaling": "递增", "Second": "第二", "Selection": "选择", "Species": "物种", "Speed": "速度", "Spelling": "拼写", "Start": "开始", "Stem": "干细胞", "Stem Cells": "干细胞", "Taxonomy": "分类学", "Taxonomy Limit": "分类学上限", "Third": "第三", "Tissues": "组织", "Upgrade Tree": "升级树", "Upgraded Effects": "升级效果", "Upgrades": "升级", "Upgrades II": "升级 II"};
var systemComponents = {
	'tab-buttons': {
		props: ['layer', 'data', 'name'],
		methods: { tabLabel: function(tab){ return ZH_TAB_LABELS[tab] || tab; } },
		template: `
			<div class="upgRow">
				<div v-for="tab in Object.keys(data)">
					<button v-if="data[tab].unlocked == undefined || data[tab].unlocked" v-bind:class="{tabButton: true, notify: subtabShouldNotify(layer, name, tab), resetNotify: subtabResetNotify(layer, name, tab)}"
					v-bind:style="[{'border-color': tmp[layer].color}, (subtabShouldNotify(layer, name, tab) ? {'box-shadow': 'var(--hqProperty2a), 0 0 20px '  + (data[tab].glowColor || defaultGlow)} : {}), tmp[layer].componentStyles['tab-button'], data[tab].buttonStyle]"
						v-on:click="function(){player.subtabs[layer][name] = tab; updateTabFormats(); needCanvasUpdate = true;}"><span v-html="tabLabel(tab)"></span></button>
				</div>
			</div>
		`
	},

	'tree-node': {
		props: ['layer', 'abb', 'size', 'prev'],
		template: `
		<button v-if="nodeShown(layer)"
			v-bind:id="layer"
			v-on:click="function() {
				if (shiftDown && options.forceTooltips) player[layer].forceTooltip = !player[layer].forceTooltip
				else if(tmp[layer].isLayer) {
					if (tmp[layer].leftTab) {
						showNavTab(layer, prev)
						showTab('none')
					}
					else
						showTab(layer, prev)
				}
				else {run(layers[layer].onClick, layers[layer])}
			}"


			v-bind:class="{
				treeNode: tmp[layer].isLayer,
				treeButton: !tmp[layer].isLayer,
				smallNode: size == 'small',
				[layer]: true,
				tooltipBox: true,
				forceTooltip: player[layer].forceTooltip,
				ghost: tmp[layer].layerShown == 'ghost',
				hidden: !tmp[layer].layerShown,
				locked: tmp[layer].isLayer ? !(player[layer].unlocked || tmp[layer].canReset) : !(tmp[layer].canClick),
				notify: tmp[layer].notify && player[layer].unlocked,
				resetNotify: tmp[layer].prestigeNotify,
				can: ((player[layer].unlocked || tmp[layer].canReset) && tmp[layer].isLayer) || (!tmp[layer].isLayer && tmp[layer].canClick),
				front: !tmp.scrolled,
			}"
			v-bind:style="constructNodeStyle(layer)">
			<span class="nodeLabel" v-html="(abb !== '' && tmp[layer].image === undefined) ? abb : '&nbsp;'"></span>
			<tooltip
      v-if="tmp[layer].tooltip != ''"
			:text="(tmp[layer].isLayer) ? (
				player[layer].unlocked ? (tmp[layer].tooltip ? tmp[layer].tooltip : formatWhole(player[layer].points, false, 3) + ' ' + tmp[layer].resource)
				: (tmp[layer].tooltipLocked ? tmp[layer].tooltipLocked : '需要 ' + formatWhole(tmp[layer].requires) + ' ' + tmp[layer].baseResource + ' 才能解锁（当前有 ' + formatWhole(tmp[layer].baseAmount) + ' ' + tmp[layer].baseResource + '）')
			)
			: (
				tmp[layer].canClick ? (tmp[layer].tooltip ? tmp[layer].tooltip : '我是一个按钮！')
				: (tmp[layer].tooltipLocked ? tmp[layer].tooltipLocked : '我是一个按钮！')
			)"></tooltip>
			<node-mark :layer='layer' :data='tmp[layer].marked'></node-mark></span>
		</button>
		`
	},

	
	'layer-tab': {
		props: ['layer', 'back', 'spacing', 'embedded'],
		template: `<div v-bind:style="[tmp[layer].style ? tmp[layer].style : {}, (tmp[layer].tabFormat && !Array.isArray(tmp[layer].tabFormat)) ? tmp[layer].tabFormat[player.subtabs[layer].mainTabs].style : {}]" class="noBackground">
		<div v-if="back"><button v-bind:class="back == 'big' ? 'other-back' : 'back'" v-on:click="goBack(layer)">←</button></div>
		<div v-if="!tmp[layer].tabFormat">
			<div v-if="spacing" v-bind:style="{'height': spacing}" :key="this.$vnode.key + '-spacing'"></div>
			<infobox v-if="tmp[layer].infoboxes" :layer="layer" :data="Object.keys(tmp[layer].infoboxes)[0]":key="this.$vnode.key + '-info'"></infobox>
			<main-display v-bind:style="tmp[layer].componentStyles['main-display']" :layer="layer"></main-display>
			<div v-if="tmp[layer].type !== 'none'">
				<prestige-button v-bind:style="tmp[layer].componentStyles['prestige-button']" :layer="layer"></prestige-button>
			</div>
			<resource-display v-bind:style="tmp[layer].componentStyles['resource-display']" :layer="layer"></resource-display>
			<milestones v-bind:style="tmp[layer].componentStyles.milestones" :layer="layer"></milestones>
			<div v-if="Array.isArray(tmp[layer].midsection)">
				<column :layer="layer" :data="tmp[layer].midsection" :key="this.$vnode.key + '-mid'"></column>
			</div>
			<clickables v-bind:style="tmp[layer].componentStyles['clickables']" :layer="layer"></clickables>
			<buyables v-bind:style="tmp[layer].componentStyles.buyables" :layer="layer"></buyables>
			<upgrades v-bind:style="tmp[layer].componentStyles['upgrades']" :layer="layer"></upgrades>
			<challenges v-bind:style="tmp[layer].componentStyles['challenges']" :layer="layer"></challenges>
			<achievements v-bind:style="tmp[layer].componentStyles.achievements" :layer="layer"></achievements>
			<br><br>
		</div>
		<div v-if="tmp[layer].tabFormat">
			<div v-if="Array.isArray(tmp[layer].tabFormat)"><div v-if="spacing" v-bind:style="{'height': spacing}"></div>
				<column :layer="layer" :data="tmp[layer].tabFormat" :key="this.$vnode.key + '-col'"></column>
			</div>
			<div v-else>
				<div class="upgTable" v-bind:style="{'padding-top': (embedded ? '0' : '25px'), 'margin-top': (embedded ? '-10px' : '0'), 'margin-bottom': '24px'}">
					<tab-buttons v-bind:style="tmp[layer].componentStyles['tab-buttons']" :layer="layer" :data="tmp[layer].tabFormat" :name="'mainTabs'"></tab-buttons>
				</div>
				<layer-tab v-if="tmp[layer].tabFormat[player.subtabs[layer].mainTabs].embedLayer" :layer="tmp[layer].tabFormat[player.subtabs[layer].mainTabs].embedLayer" :embedded="true" :key="this.$vnode.key + '-' + layer"></layer-tab>
				<column v-else :layer="layer" :data="tmp[layer].tabFormat[player.subtabs[layer].mainTabs].content" :key="this.$vnode.key + '-col'"></column>
			</div>
		</div></div>
			`
	},

	'overlay-head': {
		template: `			
		<div class="overlayThing" style="padding-bottom:7px; width: 90%; z-index: 1000; position: relative">
		<span v-if="player.devSpeed && player.devSpeed != 1" class="overlayThing">
			<br>Dev Speed: {{format(player.devSpeed)}}x<br>
		</span>
		<span v-if="player.offTime !== undefined"  class="overlayThing">
			<br>离线时间：{{formatTime(player.offTime.remain)}}<br>
		</span>
		<br>
		<span v-if="player.points.lt('1e1000')"  class="overlayThing">你有 </span>
		<h2  class="overlayThing" id="points">{{format(player.points)}}</h2>
		<span v-if="player.points.lt('1e1e6')"  class="overlayThing"> {{modInfo.pointsName}}</span>
		<br>
		<span v-if="canGenPoints()"  class="overlayThing">({{tmp.other.oompsMag != 0 ? format(tmp.other.oomps) + " OOM" + (tmp.other.oompsMag < 0 ? "^OOM" : tmp.other.oompsMag > 1 ? "^" + tmp.other.oompsMag : "") + "s" : formatSmall(getPointGen())}}/sec)</span>
		<div v-for="thing in tmp.displayThings" class="overlayThing"><span v-if="thing" v-html="thing"></span></div>
	</div>
	`
    },

	'info-tab': {
		template: `
		<div>
		<h2>{{modInfo.name}}</h2>
		<br>
		<h3>{{VERSION.withName}}</h3>
		<span v-if="modInfo.author">
		<br>
		制作者：{{modInfo.author}}	
		</span>
		<br>
		The Modding Tree <a v-bind:href="'https://github.com/Acamaeda/The-Modding-Tree/blob/master/changelog.md'" target="_blank" class="link" v-bind:style = "{'font-size': '14px', 'display': 'inline'}" >{{TMT_VERSION.tmtNum}}</a>，作者 Acamaeda
		<br>
		The Prestige Tree，作者 Jacorb 与 Aarex
			<br><br>
		<span v-if="modInfo.discordLink"><a class="link" v-bind:href="modInfo.discordLink" target="_blank">{{modInfo.discordName}}</a><br></span>
		<a class="link" href="https://discord.gg/F3xveHV" target="_blank" v-bind:style="modInfo.discordLink ? {'font-size': '16px'} : {}">The Modding Tree Discord</a><br>
		<a class="link" href="http://discord.gg/wwQfgPa" target="_blank" v-bind:style="{'font-size': '16px'}">主声望树服务器</a><br>

		<button class="opt" onclick="player.modTab = !player.modTab"><span>{{player.modTab ? "显示信息页":"显示模组选择页"}}</button>

		<span v-if="player.modTab">
		<br><br>
		进入模式：
		<table>
			<tr>
				<td>
					<button class="opt" onclick="enterHardMode()">
						<span v-if="player.hardMode"><bdi style='color:#CC0033'>{{"困难模式中"}}</bdi></span>
						<span v-if="!player.hardMode"><bdi style='color:#3300CC'>{{"进入困难模式"}}</bdi></span>
					</button>
				</td>
				<td>
					<button class="opt" onclick="enterExtremeMode()">
						<span v-if="player.extremeMode"><bdi style='color:#CC0033'>{{"极限模式中"}}</bdi></span>
						<span v-if="!player.extremeMode"><bdi style='color:#3300CC'>{{"进入极限模式"}}</bdi></span>
					</button>
				</td>
				<td>
					<button class="opt" onclick="enterEasyMode()">
						<span v-if="player.easyMode"><bdi style='color:#CC0033'>{{"简单模式中"}}</bdi></span>
						<span v-if="!player.easyMode"><bdi style='color:#3300CC'>{{"进入简单模式"}}</bdi></span>
					</button>
				</td>
			</tr>
		</table>
		<br><br>
		<h2 style='color: #FF0066'>困难模式</h2>:<br>
		大多数被动产出降低为四分之一，另有若干较小的削弱<br><br>

		<h2 style='color: #FF0066'>简单模式</h2>:<br>
		默认启用全部批量购买<br>
		所有声望货币产出翻倍，所有被动产出货币产出翻四倍<br>
		一次性转生收益翻倍，磷之前资源产出 ^1.001<br><br>

		<h2 style='color: #FF0066'>极限模式</h2>:<br>
		所有货币产出取 ^.75 次幂（在除膨胀外的所有加成之后）。<br>
		作为交换，解锁新层级：科学！<br>
		对于蛋白质，除 mRNA 和 tRNA 外的加成取 ^.75 次幂<br><br>
		
		</span>
		
		<span v-if="!player.modTab">
		<br>
		游戏时长：{{ formatTime(player.timePlayed) }}<br>
		<h1 style='color: #FF0066'>按住 Shift 查看详情！</h1><br>
		开关：
		<table>
			<tr>
				<td><button class="opt" onclick="toggleShift()">强制切换 Shift<span><bdi style='color:#CC0033'><br>{{shiftDown?"按下":"抬起"}}</bdi></span></button></td>
				<td><button class="opt" onclick="toggleControl()">强制切换 Ctrl<span><bdi style='color:#CC0033'><br>{{controlDown?"按下":"抬起"}}</bdi></span></button></td>
				<td><button class="opt" onclick="toggleUndulating()">切换流动色彩<span><bdi style='color:#CC0033'><br>{{player.undulating?"开":"关"}}</bdi></span></button></td>
				<td><button class="opt" onclick="toggleArrowHotkeys()">切换方向键热键<span><bdi style='color:#CC0033'><br>{{player.arrowHotkeys?"开":"关"}}</bdi></span></button></td>
				<td><button class="opt" onclick="player.spaceBarPauses = !player.spaceBarPauses">切换空格键暂停<span><bdi style='color:#CC0033'><br>{{player.spaceBarPauses?"是":"否"}}</bdi></span></button></td>
				<td><button class="opt" onclick="player.paused = !player.paused">切换暂停<span><bdi style='color:#CC0033'><br>{{player.paused?"已暂停":"运行中"}}</bdi></span></button></td>
			</tr>
		</table>
		其他：
		<table>
			<tr>
				<td><button class="opt" onclick="save()">保存<span><br>{{formatTime((new Date().getTime()-player.lastSave)/1000, true)}}</span></button></td>
				<td><button class="opt" onclick="player.showBuiltInSaves = true">显示内置存档</button></td>
				<td><button class="opt" onclick="setUpPGSettings()">将设置改为开发者默认</button></td>
				<span v-if="player.keepGoing"><td><button class="opt" onclick="player.keepGoing = false">重新显示终局画面</button></td></span>
			</tr>
		</table>
		
		<br><br>
		<h2 style='color: #00FF99'>热键</h2><br>
		<span v-for="key in hotkeys" v-if="player[key.layer].unlocked && tmp[key.layer].hotkeys[key.id].unlocked"><span v-html="getDescriptionFromKey(key)"></span><br></span>
		<br><br>

		<h2 style='color: #7D5D9E'>致谢</h2><br>
		感谢 <b>Jacorb</b> 允许我使用他的多存档代码！<br>
		感谢 <b>Digiprime</b> 提出器官层级的想法！<br>
		感谢 <b>Lordshinjo</b> 提交了一份关于“自动购买”的具体且准确的错误报告，并协助随后修复。<br>
		感谢 <b>Virgil</b> 建议了分类学等级和整体构想。<br>

		<br><br><span v-if="player.showBuiltInSaves">
			<h2 style='color: #00FF99'>内置存档</h2><br>
			<bdi style='color: #F16105'>警告：继续向下滚动可能包含剧透。</bdi><br><br>

			<button class="opt" onclick="player.CUSTOM_SAVES_PAGE = Math.max(0, player.CUSTOM_SAVES_PAGE - (player.shiftAlias ? 5 : 1))">上一页<br>（Shift 翻 5 页）</button>
			<button class="opt" onclick="player.CUSTOM_SAVES_PAGE = Math.min(Math.floor(CUSTOM_SAVE_IDS.length / 20), player.CUSTOM_SAVES_PAGE + (player.shiftAlias ? 5 : 1))">下一页<br>（Shift 翻 5 页）</button>
			<br>
			<span>第 {{player.CUSTOM_SAVES_PAGE+1}} / {{1+Math.floor(CUSTOM_SAVE_IDS.length / 20)}}</span>
			<br><br>

			<template v-for="(key, i) in CUSTOM_SAVES_IDS">
				<table>
					<tr v-if="i >= 20 * player.CUSTOM_SAVES_PAGE && i < (player.CUSTOM_SAVES_PAGE + 1) * 20">
						<button class="savebutton" v-on:click="importSave(key, false, true)">
							<span v-if="key.slice(0,2) == 'EX' " style='color: #AA3333'>极限 </span>
							<span v-if="key.slice(0,2) != 'EX' " style='color: #339966'>普通 </span>
							导入“{{key.replace("EX: ", "")}}”存档
						</button>
					</tr>
				</table>
			</template> 
		</span>
		<br><br><br><br>
		</span>

		</div>
	`
	},

    'options-tab': {
        template: `
	<div>
        <table>
            <tr>
                <td><button class="opt" onclick="save()">保存</button></td>
                <td><button class="opt" onclick="switchLanguage()">语言 / Language: {{ getLangLabel() }}</button></td>
                <td><button class="opt" onclick="toggleOpt('autosave')">自动保存：{{ options.autosave?"开":"关" }}</button></td>
                <td><button class="opt" onclick="hardReset()">硬重置</button></td>
            </tr>
            <tr>
                <td><button class="opt" onclick="exportSave()">导出到剪贴板</button></td>
                <td><button class="opt" onclick="importSave()">导入</button></td>
                <td><button class="opt" onclick="toggleOpt('offlineProd')">离线产出：{{ options.offlineProd?"开":"关" }}</button></td>
            </tr>
            <tr>
                <td><button class="opt" onclick="switchTheme()">主题：{{ getThemeName() }}</button></td>
                <td><button class="opt" onclick="adjustMSDisp()">显示里程碑：{{ MS_DISPLAYS[MS_SETTINGS.indexOf(options.msDisplay)]}}</button></td>
                <td><button class="opt" onclick="toggleOpt('hqTree')">高清树：{{ options.hqTree?"开":"关" }}</button></td>
            </tr>
            <tr>
                <td><button class="opt" onclick="toggleOpt('hideChallenges')">已完成挑战：{{ options.hideChallenges?"隐藏":"显示" }}</button></td>
                <td><button class="opt" onclick="toggleOpt('forceOneTab'); needsCanvasUpdate = true">单标签模式：{{ options.forceOneTab?"总是":"自动" }}</button></td>
		<td><button class="opt" onclick="toggleOpt('forceTooltips'); needsCanvasUpdate = true">Shift+点击切换提示：{{ options.forceTooltips?"开":"关" }}</button></td>
	    </tr> 
	    <tr>
	    	<td><button class="opt" onclick="toggleOpt('hideMilestonePopups'); needsCanvasUpdate = false">弹窗：{{ options.hideMilestonePopups?"隐藏":"显示" }}</button></td>
		<td><button class="opt" onclick="showAllSaves()">显示你的存档</button></td>
		<td></td>
	    </tr>
        </table>
	<saves></saves>
	</div>`
    },

    'back-button': {
        template: `
        <button v-bind:class="back" onclick="goBack()">←</button>
        `
    },


	'tooltip' : {
		props: ['text'],
		template: `<div class="tooltip" v-html="text"></div>
		`
	},

	'node-mark': {
		props: {'layer': {}, data: {}, offset: {default: 0}, scale: {default: 1}},
		template: `<div v-if='data'>
			<div v-if='data === true' class='star' v-bind:style='{position: "absolute", left: (offset-10) + "px", top: (offset-10) + "px", transform: "scale( " + scale||1 + ", " + scale||1 + ")"}'></div>
			<img v-else class='mark' v-bind:style='{position: "absolute", left: (offset-22) + "px", top: (offset-15) + "px", transform: "scale( " + scale||1 + ", " + scale||1 + ")"}' v-bind:src="data"></div>
		</div>
		`
	},

	'particle': {
		props: ['data', 'index'],
		template: `<div><div class='particle instant' v-bind:style="[constructParticleStyle(data), data.style]" 
			v-on:click="run(data.onClick, data)"  v-on:mouseenter="run(data.onMouseOver, data)" v-on:mouseleave="run(data.onMouseLeave, data)" ><span v-html="data.text"></span>
		</div>
		<svg version="2" v-if="data.color">
		<mask v-bind:id="'pmask' + data.id">
        <image id="img" v-bind:href="data.image" x="0" y="0" :height="data.width" :width="data.height" />
    	</mask>
    	</svg>
		</div>
		`
	},

	'bg': {
		props: ['layer'],
		template: `<div class ="bg" v-bind:style="[tmp[layer].style ? tmp[layer].style : {}, (tmp[layer].tabFormat && !Array.isArray(tmp[layer].tabFormat)) ? tmp[layer].tabFormat[player.subtabs[layer].mainTabs].style : {}]"></div>
		`
	}

}

