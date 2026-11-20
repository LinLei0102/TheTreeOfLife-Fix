let modInfo = {
	name: "生命之树",
	id: "tree_of_life",
	author: "pg132",
	pointsName: "生命点",
	modFiles: ["layers.js", "tree.js"],
	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (1), // Used for hard resets and new players
	offlineLimit: 0,  // In hours
}

let winText = `恭喜！你已抵达本版本的终点！更多内容即将推出……`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = [
	"blowUpEverything",
	"costFormula",
	"costFormulaID",
	"costFormula2",
	"getCoords",
	"getMaxCoord",
	"getGemEffect",
	"updateCoins",
	"updateUpgradeAutobuyers",
	"updateMinigames",
	"updateUniverse",
	"autobuyRadioWaves",
	"updateBestBuyables",
	"doImprovedPassiveGain",
	"getCompletedLevels",
	]

function getStartPoints(){
    	return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
	toggleKeys: false,
	undulating: false,
	lastSave: new Date().getTime(),
	hardMode: false,
	easyMode: false,
	extremeMode: false,
	hardFromBeginning: false,
	extremeFromBeginning: false,
	arrowHotkeys: true,
	modTab: false,
	lastLettersPressed: [],
	targetWord: "johnson",
	wordsSpelled: 0,
	currentTime: new Date().getTime(),
	showBuiltInSaves: false,
	dev: {
		fastCorn: false,
		aPointMult: undefined,
		bPointMult: undefined,
		cPointMult: undefined,
		dPointMult: undefined,
		ePointMult: undefined,
		autobuytokens: false,
	},
	spaceBarPauses: false,
	paused: false,
	shiftAlias: false,
	controlAlias: false,
	CUSTOM_SAVES_PAGE: 0,
	CHANGELOG_PAGE: 0,
}}

function getLastSaveDisplay(a){
	return "上次保存时间: " + formatTime((new Date().getTime()-player.lastSave)/1000, a) + " 前。"
}

// Display extra things at the top of the page
var displayThings = [
	function(){
		list1 = []
		if (shiftDown) list1 = list1.concat("S")
		if (controlDown) list1 = list1.concat("C")
		if (player.undulating) list1 = list1.concat("U")
		if (!player.arrowHotkeys) list1 = list1.concat("¬A")
		if (!player.spaceBarPauses) list1 = list1.concat("¬P")
		
		let end = ""
		if (list1.length > 0) end = "(" + combineStrings(list1) + ")"
		let saveFinal = getLastSaveDisplay() + end

		let len = pastTickTimes.length
		if (len <= 3) return saveFinal
		let a = 0
		for (i = 0; i < len; i++){
			a += pastTickTimes[i]
		}

		let val = Math.round(a/len)
		let p1 = ""
		let p2 = ""
		if (val > 50) {
			p1 = "<bdi style='color: #CC0000'>"
			p2 = "</bdi>"
		}

		let msptFinal = " ms/tick = " + p1 + formatWhole(val) + p2
		return saveFinal + msptFinal
	}, 
	function(){
		if (paused || player.paused) return "<bdi style='color:#CC0033'>THE GAME IS PAUSED</bdi>"
		if (player.cells.slowTime > 0) return "接下来的 " + makeGreen(formatTime(player.cells.slowTime)) + " 真实秒，<br>游戏将以 100 倍慢速运行"
		if (inChallenge("l", 11)) return "膨胀指数当前为 1/" + format(getPointDilationExponent().pow(-1))
		if (player.keepGoing && isEndgameRaw()) return makeBlue("你已通关，<br>游戏可能会在这里出问题。")
		if (player.extremeMode) return "你处于极限模式"
	},
]

var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return 1 // Default is 1 hour which is just arbitrarily large
}

var controlDown = false
var shiftDown = false
var logKeyCode = false

function hasSpelledWord(word){
	let l = word.length
	if (l > 25) {
		console.log("nopers")
		return false
	}
	for (i = 0; i < l; i++){
		let id = 25 - l + i
		let is = player.lastLettersPressed[id]
		let shouldbe = word[i]
		if (is != shouldbe) return false
	}
	return true
} 

function getLetterFromNum(x){
	return {
		32: " ",
		65: "a",
		66: "b",
		67: "c",
		68: "d",
		69: "e",
		70: "f",
		71: "g",
		72: "h",
		73: "i",
		74: "j",
		75: "k",
		76: "l",
		77: "m",
		78: "n",
		79: "o",
		80: "p",
		81: "q",
		82: "r",
		83: "s",
		84: "t",
		85: "u",
		86: "v",
		87: "w",
		88: "x",
		89: "y",
		90: "z",
	}[x]
}

window.addEventListener('keydown', function(event) {
	code = event.keyCode
	if (player.toggleKeys) {
		if (code == 16) shiftDown = !shiftDown;
		if (code == 17) controlDown = !controlDown;
	} else {
		if (code == 16) shiftDown = true;
		if (code == 17) controlDown = true;
	}
	if (logKeyCode) console.log(code)
	if ((code >= 65 && code <= 90) || code == 32) {
		player.lastLettersPressed.push(getLetterFromNum(code))
		let l = player.lastLettersPressed.length
		if (l > 25) {
			player.lastLettersPressed = player.lastLettersPressed.slice(l-25,)
		}
	}
	//65 to 90 are a to z
}, false);

window.addEventListener('keyup', function(event) {
	if (player != undefined && player.toggleKeys) return 
	if (event.keyCode == 16) shiftDown = false;
	if (event.keyCode == 17) controlDown = false;
}, false);

function toggleShift(){
	shiftDown = !shiftDown
}

function toggleControl(){
	controlDown = !controlDown
}

function toggleUndulating(){
	player.undulating = !player.undulating
}

function enterHardMode(){
	let s = "确定要进入困难模式吗？此操作无法撤销。"
	if (!confirm(s)) return 
	if (player.extremeMode) {
		if (!confirm("你已处于极限模式，不建议这样做。" + s)) return 
	}
	if (confirm("要将其应用到当前存档 [cancel] 还是创建新存档 [okay]？")) {
		// this means you said okay so create a new save
		newSave("hard")
	} else {
		// apply to this save
		player.hardMode = true
		if (player.h.best.lt(10) && !player.o.unlocked && !player.c.unlocked) player.hardFromBeginning = true
	}
}

function enterExtremeMode(){
	let s = "确定要进入极限模式吗？此操作无法撤销。"
	if (!confirm(s)) return 
	if (player.hardmode) {
		if (!confirm("你已处于困难模式，不建议这样做。" + s)) return 
	}
	if (confirm("要将其应用到当前存档 [cancel] 还是创建新存档 [okay]？")) {
		// this means you said okay so create a new save
		newSave("extreme")
	} else {
		// apply to this save
		player.extremeMode = true
		if (player.h.best.lt(10) && !player.o.unlocked && !player.c.unlocked) player.extremeFromBeginning = true
	}
}

function enterEasyMode(){
	let s = "确定要进入简单模式吗？此操作无法撤销。"
	if (!confirm(s)) return 
	if (confirm("要将其应用到当前存档 [cancel] 还是创建新存档 [okay]？")) {
		// this means you said okay so create a new save
		newSave("easy")
	} else {
		// apply to this save
		player.easyMode = true
	}
}

function toggleArrowHotkeys(){
	player.arrowHotkeys = !player.arrowHotkeys
}





