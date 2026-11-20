function pointFormulaDisplay(){
        let a = "点数产出为 (" + format(getPointConstant(), 1) + "*AX)^BX 全部膨胀 ^CX。"
        let b = "AX、BX 和 CX 初始为 1，加成如下。"
        let c = ""

        if (hasChallenge("hu", 11)) {
                let ret = a + br + b + br2 + c
                ret = ret.replaceAll("AX", makeRed("A"))
                ret = ret.replaceAll("BX", makeRed("B"))
                ret = ret.replaceAll("CX", makeRed("C"))
                return ret
        }

        if (tmp.l.effect.gt(1))         c += "生命效果 使 AX 乘以 " + format(tmp.l.effect) + br
        if (tmp.sci.effect.gt(1))       c += "科学效果 使 AX 乘以 " + format(tmp.sci.effect) + br
        if (hasUpgrade("sci", 302))     c += "氮科学 II 效果 使 AX 乘以 " + format(tmp.sci.upgrades[302].effect) + br
        if (player.easyMode)            c += "简单模式 使 AX 乘以 4" + br
        if (c.includes("AX"))           c += br

        if (player.easyMode)            c += "简单模式 使 BX 乘以 1.001" + br
        if (hasMilestone("l", 1))       c += "生命 里程碑 1 使 BX 乘以 " + format(tmp.l.milestones[1].effect) + br
        if (hasMilestone("l", 18) && !player.extremeMode) {
                                        c += "生命 里程碑 18 使 BX 乘以 2" + br
        }
        if (hasUpgrade("mu", 51))       c += "µ XXI 使 BX 乘以 " + format(player.l.points.max(10).log10()) + br
        if (hasMilestone("l", 31)) {
                let l31exp = Math.max(0, player.l.challenges[11] - 100)
                let l31base = 100
                if (player.extremeMode) l31base = 9
                if (hasMilestone("l", 32)) l31base *= 10
                if (hasMilestone("l", 34)) l31base *= 10
                                        c += "生命 里程碑 31, 32, 和 34 使 BX 乘以 " + format(Decimal.pow(l31base, l31exp)) + br
        }
        if (hasMilestone("l", 33)) {
                let l33base = Math.max(1, player.l.challenges[11]/(player.extremeMode ? 98 : 100) )
                let l33exp = player.mu.buyables[33]
                                        c += "生命 里程碑 33 使 BX 乘以 " + format(Decimal.pow(l33base, l33exp)) + br
        }
        if (layers.l.grid.getGemEffect(102).gt(1)) {
                                        c += "C12 宝石 使 BX 乘以 " + format(layers.l.grid.getGemEffect(102)) + br
        }
        if (hasMilestone("a", 18))      c += "氨基酸 里程碑 18 使 BX 乘以 " + format(Decimal.pow(3, getBuyableAmount("l", 23))) + br
        if (!player.extremeMode) {
                let c31base = layers.l.grid.getGemEffect(301)
                if (c31base.gt(1))      c += "C31 宝石 使 BX 乘以 " + format(c31base.pow(tmp.l.getNonZeroGemCount)) + br
                let c34base = layers.l.grid.getGemEffect(304)
                if (c34base.gt(1))      c += "C34 宝石 使 BX 乘以 " + format(c34base.pow(getBuyableAmount("mu", 32))) + br
                let c65base = layers.l.grid.getGemEffect(605)
                if (c65base.gt(1))      c += "C65 宝石 使 BX 乘以 " + format(c65base.pow(getBuyableAmount("l", 11))) + br
                if (!hasUpgrade("or", 132)) {
                        let c73base = layers.l.grid.getGemEffect(703)
                        if (c73base.gt(1)) {
                                        c += "C73 宝石 使 BX 乘以 " + format(c73base.pow(getBuyableAmount("a", 21))) + br
                        }
                }
                let c38base = layers.l.grid.getGemEffect(308)
                if (c38base.gt(1))      c += "C38 宝石 使 BX 乘以 " + format(c38base.pow(getBuyableAmount("l", 21))) + br
                if (hasMile("l", 36))   c += "生命 里程碑 36 使 BX 乘以 1.1" + br
        } else {
                let c34base = layers.l.grid.getGemEffect(304)
                if (c34base.gt(1))      c += "C34 宝石 使 BX 乘以 " + format(c34base.pow(getBuyableAmount("l", 33))) + br
                if (hasUpg("p", 43))    c += "磷 XVIII 使 BX 乘以 " + format(Decimal.pow(2, player.p.upgrades.length))
                if (hasMile("a", 17))   c += "氨基酸 里程碑 17 使 BX 乘以 " + format(Decimal.pow(3, player.a.milestones.length)) + br
                if (hasMile("a", 22))   c += "氨基酸 里程碑 22 使 BX 乘以 " + format(Decimal.pow(1 + player.a.milestones.length/100, player.a.milestones.length)) + br
                                        c += "极限模式 使 BX 乘以 .75" + br
        }
        if (!hasUpgrade("or", 132)) {
                let c54base = layers.l.grid.getGemEffect(504)
                                        c += "C54 宝石 使 BX 乘以 " + format(c54base.pow(getBuyableAmount("a", 22))) + br
                let c64base = layers.l.grid.getGemEffect(604)
                                        c += "C64 宝石 使 BX 乘以 " + format(c64base.pow(getBuyableAmount("a", 33))) + br
                let c17base = layers.l.grid.getGemEffect(107)
                                        c += "C17 宝石 使 BX 乘以 " + format(c17base.pow(getBuyableAmount("a", 32))) + br
                let c18base = layers.l.grid.getGemEffect(108)
                                        c += "C18 宝石 使 BX 乘以 " + format(c18base.pow(getBuyableAmount("l", 33).pow(player.extremeMode ? 1.9394 : 1.8))) + br
        }
        if (hasMilestone("a", 19))      c += "氨基酸 里程碑 19 使 BX 乘以 " + format(tmp.a.milestones[19].effect) + br
        if (hasUpgrade("a", 11))        c += "氨基酸 I 使 BX 乘以 " + format(Decimal.pow(3, player.a.upgrades.length)) + br
        if (hasUpgrade("a", 13))        c += "氨基酸 III 使 BX 乘以 " + format(getBuyableAmount("a", 11).max(1)) + br
        if (hasUpgrade("a", 15))        c += "氨基酸 V 使 BX 乘以 " + format(getBuyableAmount("a", 12).max(1)) + br
        if (hasUpgrade("a", 33))        c += "氨基酸 XIII 使 BX 乘以 " + format(Decimal.pow(100, getBuyableAmount("a", 13))) + br
        let logProteinTimes = hasUpgrade("a", 34) + hasUpgrade("a", 35)
        if (logProteinTimes > 0)        c += "氨基酸 XIII 和 XIV 使 BX 乘以 " + format(player.a.protein.points.max(10).log10().pow(logProteinTimes)) + br
        if (hasMilestone("a", 24))      c += "氨基酸里程碑 24 使 BX 乘以 " + format(tmp.a.milestones[24].effect) + br
        if (!hasUpgrade("or", 223))     c += "siRNA 使 BX 乘以 " + format(tmp.a.buyables[22].effect) + br
        if (hasUpgrade("d", 12)) {
                let ncRNA = getBuyableAmount("a", 31)
                let d12exp = ncRNA.times(player.d.upgrades.length)
                if (ncRNA.gt(1))        c += "DNA II 使 BX 乘以 " + format(ncRNA.pow(d12exp)) + br
        }
        if (hasUpgrade("d", 13)) {
                let d13base = getBuyableAmount("a", 13)
                let d13exp = d13base.times(player.extremeMode && !hasUpgrade("sci", 455) ? 1 : player.d.upgrades.length)
                if (d13base.gt(1))      c += "DNA III 使 BX 乘以 " + format(d13base.pow(d13exp)) + br
        }
        if (hasUpgrade("d", 34)) {
                let a2da = getBuyableAmount("l", 11)
                let d34exp = a2da.times(player.d.upgrades.length)
                                        c += "DNA XIV 使 BX 乘以 " + format(a2da.pow(d34exp)) + br
        }
        if (hasMilestone("d", 27) && tmp.d.milestones[27].effect.gt(1)) {
                                        c += "DNA 里程碑 27 使 BX 乘以 " + format(tmp.d.milestones[27].effect) + br
        }
        if (hasUpgrade("l", 14))        c += "生命 IV 使 BX 乘以 " + format(tmp.l.upgrades[14].effect) + br
        if (hasUpgrade("l", 45))        c += "生命 XX 使 BX 乘以 " + format(player.l.buyables[22].max(1)) + br
        if (hasUpgrade("sci", 411))     c += "蛋白质 科学 VI 使 BX 乘以 " + format(player.sci.protein_science.points.max(1)) + br
        if (hasUpgrade("sci", 502))     c += "DNA 科学 II 使 BX 乘以 " + format(player.d.points.max(1).pow(player.a.buyables[31].plus(player.a.buyables[13]))) + br
        if (hasUpgrade("sci", 504))     c += "DNA 科学 IV 使 BX 乘以 " + format(tmp.sci.upgrades[504].effect) + br
        if (c.includes("BX"))           c += br

        if (inChallenge("l", 11))       c += "膨胀 使 CX 乘以 " + format(tmp.l.challenges[11].challengeEffect) + br
        if (inChallenge("l", 12)) {
                let c2depth = tmp.l.challenges[12].getChallengeDepths[2] || 0
                let c5depth = tmp.l.challenges[12].getChallengeDepths[5] || 0  
                let c6depth = tmp.l.challenges[12].getChallengeDepths[6] || 0
                let c7depth = tmp.l.challenges[12].getChallengeDepths[7] || 0

                let c6Layers = (86 + c2depth) * c6depth ** (1/(player.extremeMode ? 10 : 8))
                let c6Base = player.extremeMode ? (hasUpgrade("sci", 451) ? .952 : .951) : .96
                let c7Base = player.extremeMode ? .0188 : .023
                c7Base -= layers.l.grid.getGemEffect(706).toNumber()
                c6Base -= c7Base * c7depth ** .56

                let portion = decimalOne
                let challId = player.l.activeChallengeID
                portion = portion.times(Decimal.pow(player.extremeMode ? .713 : .665, Math.sqrt(c5depth)))
                portion = portion.times(Decimal.pow(c6Base, c6Layers))
                if (challId > 801 && !player.extremeMode) {
                        portion = portion.div(Decimal.pow(200, Math.pow(challId-801, .57)))
                }
                if (challId > 801 && player.extremeMode) {
                        portion = portion.div(Decimal.pow(406, Math.pow(challId-801, .55)))
                }
                if (challId > 803) {
                        let sub = player.extremeMode && challId > 804 ? .058 : 0
                        portion = portion.div(Decimal.pow(2.2 - sub, nCk(challId-802, 2)))
                }
                if (challId > 805 && player.extremeMode) portion = portion.times(1.53)
                if (challId > 806 && player.extremeMode) portion = portion.div(4.47)
                if (challId > 807 && player.extremeMode) portion = portion.div(1.55)

                if (hasMilestone("d", 24)) portion = portion.pow(.94)
                if (hasMilestone("d", 25) && player.extremeMode) portion = portion.pow(.973)
                
                let c58exp = Math.max(0, tmp.l.getNonZeroGemCount - 53)
                let c58base = layers.l.grid.getGemEffect(508)
                
                portion = portion.pow(c58base.pow(c58exp))
                                        c += "选择 使 CX 乘以 " + format(portion) + br
        }
        if (!hasMilestone("ch", 15)) {
                if (hasUpgrade("cells", 11))    c += "细胞 I 使 CX 乘以 " + format(tmp.cells.upgrades[11].effect) + br
                if (hasUpgrade("cells", 61))    c += "细胞 XXVI 使 CX 乘以 " + format(Decimal.pow(1.1, player.cells.upgrades.length)) + br
        }
        if (hasUpgrade("cells", 315) && !hasUpgrade("ch", 25)) {
                                        c += "κ V 使 CX 乘以 " + format(player.tokens.total.max(1)) + br
        }
        if (hasMilestone("cells", 56) && !hasMilestone("ch", 13)) {
                                        c += "细胞 里程碑 56 使 CX 乘以 " + format(tmp.cells.milestones[56].effect) + br
        }
        if (!hasMilestone("an", 30)) {
                if (hasMilestone("t", 4))       c += "组织 里程碑 4 使 CX 乘以 " + format(tmp.t.milestones[4].effect) + br
                if (hasMilestone("t", 21))      c += "组织 里程碑 21 使 CX 乘以 " + format(player.t.milestones.length) + br
        }
        if (!hasMilestone("ch", 14)) {
                if (hasUpgrade("t", 114))       c += "组织 LIV 使 CX 乘以 " + format(player.t.upgrades.length) + br
                if (hasUpgrade("t", 124))       c += "组织 LIX 使 CX 乘以 " + format(Math.max(1, player.cells.challenges[11]) ** 2.5) + br
        }
        if (hasUpgrade("cells", 43) && !hasMilestone("ch", 15)) {
                                        c += br + "细胞 XVIII 使 CX 乘以 " + format(Decimal.pow(13, player.tokens.tokens2.total)) + br
        }
        if (hasMilestone("or", 23))     c += "器官 里程碑 23 使 CX 乘以 " + format(player.or.energy.points.max(1).pow(.01 * player.or.milestones.length)) + br
        if (hasUpgrade("an", 25))       c += "动物 X 使 CX 乘以 " + format(player.or.air.points.max(1).pow(.01 * player.an.upgrades.length)) + br
        if (hasUpgrade("nu", 32)) {
                let eff = hasMilestone("hu", 12) ? player.or.points.max(1).log10().pow(3).pow10().pow(player.ch.points) : player.or.points.max(1).pow(player.ch.points)
                c += "细胞核 XII 使 CX 乘以 " + format(eff) + br
        }

        let ret = a + br + b + br2 + c
        ret = ret.replaceAll("AX", makeRed("A"))
        ret = ret.replaceAll("BX", makeRed("B"))
        ret = ret.replaceAll("CX", makeRed("C"))
        return ret
}

function dnaFormulaDisplay(){
        let a = "DNA 产出为 " + format(tmp.d.getBaseGain, 3) + "*AX"
        let b = "AX 受以下因素影响"
        let c = ""

        if (layers.l.grid.getGemEffect(206).gt(1)) {
                                        c += "C26 宝石 使 AX 乘以 " + format(layers.l.grid.getGemEffect(206)) + br
        }
        if (hasUpgrade("d", 12)) {
                let base = 2
                if (hasUpgrade("d", 13)) base *= 2
                if (hasMilestone("d", 14)) base *= 2
                if (hasUpgrade("d", 14)) base *= 2
                if (hasUpgrade("d", 15)) base *= 2
                                        c += "DNA II, III, IV, 和 V 和 DNA 里程碑 14 使 AX 乘以 " + format(Decimal.pow(base, player.d.upgrades.length)) + br
        }       
        if (hasChallenge("l", 22))      c += "反小游戏 使 AX 乘以 " + format(tmp.l.challenges[22].reward) + br
        if (!hasUpgrade("or", 133))     c += "C61 宝石 使 AX 乘以 " + format(layers.l.grid.getGemEffect(601).pow(getBuyableAmount("a", 33)).min("1e50000")) + br
        if (hasUpgrade("d", 23) && player.l.points.gt(10)) {
                                        c += "DNA VIII 使 AX 乘以 " + format(player.l.points.max(10).log10()) + br
        }
        if (hasMilestone("d", 18) && !hasMilestone("an", 30)) {
                let base = 2
                if (hasUpgrade("d", 24) && !player.extremeMode) base *= 2
                if (hasUpgrade("d", 25)) base *= 2
                if (hasUpgrade("d", 31)) base *= 2
                                        c += "DNA IX, X, 和 XI 和 DNA 里程碑 18 使 AX 乘以 " + format(Decimal.pow(base, player.d.milestones.length)) + br
                if (player.extremeMode) c = c.replaceAll("DNA IX, X,", "DNA X")
        }
        if (layers.l.grid.getGemEffect(607).gt(1)) {
                                        c += "C67 宝石 使 AX 乘以 " + format(layers.l.grid.getGemEffect(607).pow(tmp.l.getNonZeroGemCount)) + br
        }
        if (hasUpgrade("d", 35) && getBuyableAmount("a", 33).gt(0)) {
                                        c += "DNA XV 使 AX 乘以 " + format(Decimal.pow(1.01, getBuyableAmount("a", 33)).min("e2e5")) + br
        }
        if (hasUpgrade("cells", 113) && !hasUpgrade("ch", 25)) {
                                        c += "μ III 使 AX 乘以 " + format(tmp.cells.upgrades[113].effect) + br
        }
        if (hasChallenge("l", 111))     c += "反θ挑战 使 AX 乘以 " + format(tmp.l.challenges[21].reward) + br
        if (player.cells.challenges[21] >= 1 && !hasMilestone("sp", 13)) {
                let base = player.points.max(10).log10().max(10).log10()
                let exp = player.cells.upgrades.length
                                        c += "三级 使 AX 乘以 " + format(base.pow(exp)) + br
        }
        if (player.easyMode)            c += "简单模式 使 AX 乘以 2" + br
        if (hasUpgrade("sci", 553))     c += "DNA 科学 XXVIII 使 AX 乘以 " + format(tmp.cells.buyables[13].effect) + br
        if (tmp.sci.buyables[503].effect.gt(0)) {
                let eff = player.points.max(100).log10().log10().log10().max(1).pow(tmp.sci.buyables[503].effect)
                                        c += "DNA 聚合酶 使 AX 乘以 " + format(eff) + br
        }
        if (tmp.an.effect.gt(1))        c += "动物效果 使 AX 乘以 " + format(tmp.an.effect) + br
        if (tmp.or.effect.gt(1))        c += "器官效果 使 AX 乘以 " + format(tmp.or.effect) + br
                                        c += br + "细胞效果 使 AX 乘以 " + format(tmp.cells.effect, 3) + br
                                        c += "组织效果 使 AX 乘以 " + format(tmp.t.effect, 3) + br
        if (hasUpgrade("t", 112))       c += "组织 LII 使 AX 乘以 " + format(tmp.t.effect.pow(player.t.upgrades.length), 3) + br
        if (hasUpgrade("sp", 45))       c += "效果 XX 使 AX 乘以 " + format(player.an.grid[208].extras.plus(1).pow(player.nu.points.pow(9))) + br

        return (a + br + b + br2 + c + br).replaceAll("AX", makeRed("A"))
}

function dnaExpDisplay(){
        let a = "DNA 产出指数为 BX"
        let b = "BX 初始为 2，受以下因素影响"
        let c = ""

        if (hasChallenge("l", 32))      c += "反氧挑战 增加 " + format(tmp.l.challenges[32].reward) + " 至 BX" + br
        if (hasUpgrade("d", 33))        c += "DNA XIII 增加 " + format(player.d.upgrades.length) + " 至 BX" + br
        if (hasMilestone("cells", 18))  c += "细胞 里程碑 18 增加 " + format(getBuyableAmount("cells", 11).sqrt()) + " 至 BX" + br
        if (player.extremeMode)         c += "C57 增加 " + format(layers.l.grid.getGemEffect(507)) + " 至 BX" + br

        if (c != "")                    c += br
        
        if (hasUpgrade("t", 74))        c += "组织 XXXIV 使 BX 乘以 " + format(player.t.upgrades.length) + br
        if (hasUpgrade("or", 145) && !hasMilestone("hu", 4)) { 
                                        c += "心脏 XXV 使 BX 乘以 " + format(2) + br
        }
        if (hasUpgrade("or", 213) && !hasUpgrade("hu", 22)) {
                                        c += "肾 VIII 使 BX 乘以 " + format(2) + br
        }
        if (hasUpgrade("an", 41))       c += "动物 XVI 使 BX 乘以 " + format(player.ch.points.max(6).log(6)) + br
        if (hasMilestone("ch", 23))     c += "染色体 里程碑 23 使 BX 乘以 " + format(player.nu.points.max(2).log(2)) + br
        if (hasMilestone("ch", 25))     c += "染色体 里程碑 25 使 BX 乘以 " + format(player.nu.points.max(1).sqrt()) + br
        if (hasMilestone("ch", 26) && !hasMilestone("pl", 19)) {
                                        c += "染色体 里程碑 26 使 BX 乘以 1.31" + br
        }
        if (hasMilestone("nu", 17)) {
                let exp = player.nu.points.min(3333).times(player.nu.points).sqrt()
                                        c += "细胞核 里程碑 17 使 BX 乘以 " + format(Decimal.pow(1.01, exp)) + br
        }
        if (hasUpgrade("sp", 84))       c += "升级效果 XIV 使 BX 乘以 " + format(Decimal.pow(1.01, player.sp.upgrades.length ** (hasUpgrade("sp", 134) ? 1.1 : 1))) + br
        if (hasChallenge("sp", 32))     c += "真正无能量 使 BX 乘以 " + format(tmp.sp.challenges[32].reward) + br
        if (hasUpgrade("e", 24))        c += "生态系统 IX 使 BX 乘以 " + format(player.tokens.mastery_tokens.total.max(1).sqrt()) + br
        if (hasUpgrade("pl", 43))       c += "植物 XVIII 使 BX 乘以 " + format(Decimal.pow(1.01, player.pl.points.sub(100))) + br

                                        c += br + "最终结果为 " + format(tmp.d.getGainExp) + br2

        return (br + a + br + b + br2 + c).replaceAll("BX", makeRed("B"))
}

function cellFormulaDisplay(){
        let a = "细胞产出为 " + format(tmp.cells.getBaseGain, 3) + "*AX"
        let b = "AX 初始为 1，受以下因素影响"
        let c = ""

        let ret = decimalOne
        
        if (!hasMilestone("an", 29)) {
                if (hasUpgrade("cells", 111)) {
                                        c += "μ I 使 AX 乘以 " + format(tmp.cells.upgrades[111].effect) + br
                }
                if (hasUpgrade("cells", 211)) {
                                        c += "λ I 使 AX 乘以 " + format(tmp.cells.upgrades[211].effect) + br
                }
                if (hasUpgrade("cells", 311)) {
                                        c += "κ I 使 AX 乘以 " + format(tmp.cells.upgrades[311].effect) + br
                }
                if (hasUpgrade("cells", 411)) {
                                        c += "ι I 使 AX 乘以 " + format(tmp.cells.upgrades[411].effect) + br
                }
        }
        if (hasMilestone("cells", 16) && !hasMilestone("ch", 13)) {
                                        c += "细胞 里程碑 16 使 AX 乘以 " + format(tmp.cells.milestones[16].effect) + br
        }
        if (!hasUpgrade("an", 51))      c += "次级 使 AX 乘以 " + format(tmp.cells.challenges[12].rewardEffect) + br                         
        if (!hasMilestone("sp", 17))    c += "干细胞 使 AX 乘以 " + format(player.cells.stem_cells.points.plus(10).log10()) + br
        if (!hasMilestone("ch", 15)) {
                if (hasUpgrade("cells", 15))    c += "细胞 V 使 AX 乘以 " + format(tmp.cells.upgrades[15].effect) + br
                if (hasUpgrade("cells", 21) && player.extremeMode)  {
                                                c += "细胞 VI 使 AX 乘以 " + format(Decimal.pow(player.cells.upgrades.length, player.cells.upgrades.length + 3)) + br
                }
                if (hasUpgrade("cells", 54) && tmp.cells.upgrades[54].effect.gt(1)) {
                                                c += "细胞 XXIV 使 AX 乘以 " + format(tmp.cells.upgrades[54].effect) + br
                }
        }
        if (hasMilestone("t", 17) && !hasMilestone("an", 30)) {
                                        c += "组织 里程碑 17 使 AX 乘以 " + format(player.tokens.tokens2.total.max(1).pow(player.t.milestones.length)) + br
        }
        if (hasUpgrade("t", 135) && !hasMilestone("ch", 14)) {
                                        c += "组织 LXV 使 AX 乘以 " + format(tmp.t.upgrades[135].effect) + br
        }
        if (hasUpgrade("sci", 511))     c += "DNA 科学 VI 使 AX 乘以 " + format(Decimal.pow(2, tmp.sci.upgrades[511].lvls)) + br
        if (hasUpgrade("sci", 555))     c += "DNA 科学 XXV 使 AX 乘以 " + format(tmp.sci.buyables[501].effect.max(1)) + br
        if (hasUpgrade("sci", 561))     c += "DNA 科学 XXVI 使 AX 乘以 " + format(tmp.sci.buyables[502].effect.max(1)) + br
        if (hasChallenge("l", 111))     c += "反θ挑战 使 AX 乘以 " + format(tmp.l.challenges[22].reward.min(ret.sqrt())) + br
        if (tmp.or.effect.gt(1))        c += "器官效果 使 AX 乘以 " + format(tmp.or.effect) + br
        if (player.easyMode)            c += "简单模式 使 AX 乘以 2" + br
        if (hasUpgrade("sci", 514))     c += "DNA 科学 IX 使 AX 乘以 " + format(player.cells.stem_cells.points.plus(10).log10()) + br
        if (hasUpgrade("sci", 551))     c += "DNA 科学 XXI 使 AX 乘以 " + format(player.sci.dna_science.points.max(10).log10().pow(tmp.sci.upgrades[551].lvls)) + br
        if (tmp.an.effect.gt(1))        c += "动物效果 使 AX 乘以 " + format(tmp.an.effect) + br
        if (tmp.or.challenges[21].reward.gt(1) && !hasMilestone("sp", 25)) {
                                        c += "主支气管 使 AX 乘以 " + format(tmp.or.challenges[21].reward) + br
        }
        if (hasUpgrade("or", 102) && !hasMilestone("sp", 18)) {
                                        c += "心脏 II 使 AX 乘以 " + format(tmp.or.upgrades[102].cell_effect) + br
        }
                                        
        if (hasMilestone("cells", 40))  c += br + "细胞 里程碑 40 使 AX 乘以 " + format(player.cells.stem_cells.best.max(1).root(hasUpgrade("tokens", 222) ? 50 : 100), 3) + br
                                        c += "组织效果 使 AX 乘以 " + format(tmp.t.effect, 3) + br
        if (hasUpgrade("an", 41))       c += "动物 XVI 使 AX 乘以 " + format(player.an.grid[406].extras.plus(1).pow(player.an.grid[507].buyables.pow(3))) + br

        return (a + br + b + br2 + c).replaceAll("AX", makeRed("A"))
}

function stemCellFormulaDisplay(){
        let a = "干细胞产出为 (AX<sup>BX</sup>CX)<sup>DX</sup>。"
        let b = "AX、BX、CX 和 DX 初始为 1，加成如下。"
        let c = ""

        if (player.hardMode)            c += "困难模式 使 AX 除以 4" + br
        if (player.easyMode)            c += "简单模式 使 AX 乘以 4" + br
        if (!hasUpgrade("an", 45)) {
                if (hasUpgrade("cells", 114))   c += "μ IV 使 AX 乘以 " + format(getBuyableAmount("cells", 112)) + br
                if (hasUpgrade("cells", 214))   c += "λ IV 使 AX 乘以 " + format(tmp.cells.upgrades[214].effect) + br
                if (hasUpgrade("cells", 314))   c += "κ IV 使 AX 乘以 " + format(tmp.cells.upgrades[314].effect) + br
                if (hasUpgrade("cells", 414))   c += "ι IV 使 AX 乘以 " + format(getBuyableAmount("cells", 411).max(10).log10().pow(1 + player.extremeMode)) + br
        }
        if (!hasUpgrade("an", 51))      c += "主要奖励 使 AX 乘以 " + format(tmp.cells.challenges[11].rewardEffect) + br
        if (!hasMilestone("ch", 13)) {
                if (hasMilestone("cells", 12)) {
                        let exp = player.extremeMode ? 2.5 : 1
                                                c += "细胞 里程碑 12 使 AX 乘以 " + format(player.cells.milestones.length ** exp) + br
                }
                if (hasMilestone("cells", 16))  c += "细胞 里程碑 16 使 AX 乘以 " + format(tmp.cells.milestones[16].effect) + br
                if (hasMilestone("cells", 17))  {
                        let exp = player.cells.activeChallenge ? 2 : 1
                        if (!player.extremeMode) exp = .5
                                                c += "细胞 里程碑 17 使 AX 乘以 " + format(Math.max(1, player.cells.upgrades.length) ** exp) + br
                }
                if (hasMilestone("cells", 22))  c += "细胞 里程碑 22 使 AX 乘以 " + format(getBuyableAmount("cells", 11).plus(1)) + br
                if (hasMilestone("cells", 23))  c += "细胞 里程碑 23 使 AX 乘以 " + format(player.cells.mu.best.max(10).log10()) + br
                if (hasMilestone("cells", 24))  c += "细胞 里程碑 24 使 AX 乘以 " + format(tmp.tokens.buyables[21].effect) + br
                if (hasMilestone("cells", 26))  c += "细胞 里程碑 26 使 AX 乘以 " + format(player.tokens.total.max(1)) + br
                if (hasMilestone("cells", 32))  c += "细胞 里程碑 32 使 AX 乘以 " + format(player.cells.lambda.points.max(10).log10()) + br
                if (hasMilestone("cells", 38))  c += "细胞 里程碑 38 使 AX 乘以 " + format(player.d.points.max(10).log10()) + br
                if (hasMilestone("cells", 39))  c += "细胞 里程碑 39 使 AX 乘以 " + format(player.mu.points.max(10).log10()) + br
                if (hasMilestone("cells", 40))  c += "细胞 里程碑 40 使 AX 乘以 " + format(player.cells.best.max(1).root(player.extremeMode ? 100 : hasUpgrade("tokens", 222) ? 25 : 50)) + br
                if (hasMilestone("cells", 41))  c += "细胞 里程碑 41 使 AX 乘以 " + format(player.tokens.buyables[11].max(1)) + br
                if (hasMilestone("cells", 53))  c += "细胞 里程碑 53 使 AX 乘以 " + format(tmp.cells.milestones[53].effect) + br
                if (hasMilestone("cells", 59) && !player.extremeMode) {
                                                c += "细胞 里程碑 59 使 AX 乘以 " + format(layerChallengeCompletions("cells") ** 2) + br
                }
        }
        if (hasChallenge("l", 111) && player.cells.challenges[12] >= 15 && !player.extremeMode) {
                                        c += "反θ挑战 使 AX 乘以 " + format(tmp.l.challenges[31].reward.max(1)) + br
        }
        if (!hasMilestone("ch", 15)) {
                if (hasUpgrade("cells", 15))    c += "细胞 V 使 AX 乘以 " + format(tmp.cells.upgrades[15].effect) + br
                if (hasUpgrade("cells", 21))  {
                        let exp = player.extremeMode ? player.cells.upgrades.length + 3 : 2
                                                c += "细胞 VI 使 AX 乘以 " + format(Decimal.pow(player.cells.upgrades.length, exp)) + br
                }
                if (hasUpgrade("cells", 23) && !player.extremeMode) {
                                                c += "细胞 VIII 使 AX 乘以 " + format(player.cells.upgrades.length) + br
                }
                if (hasUpgrade("cells", 24)) {
                        if (player.extremeMode) c += "细胞 IX 使 AX 乘以 " + format(player.cells.points.max(1).pow(.01)) + br
                        else                    c += "细胞 IX 使 AX 乘以 " + format(player.cells.upgrades.length) + br
                }
                if (hasUpgrade("cells", 52))    c += "细胞 XXII 使 AX 乘以 " + format(player.cells.points.max(10).log10().pow(player.tokens.tokens2.total)) + br
                if (hasUpgrade("cells", 54) && tmp.cells.upgrades[54].effect.gt(1)) {
                                                c += "细胞 XXIV 使 AX 乘以 " + format(tmp.cells.upgrades[54].effect) + br
                }
        }
        if (!hasMilestone("an", 30)) {
                if (hasMilestone("t", 10)) {
                        let base = getBuyableAmount("cells", 13).max(1)
                        let exp  = player.t.upgrades.length ** .5
                                                c += "组织 里程碑 10 使 AX 乘以 " + format(base.pow(exp)) + br
                }
                if (hasMilestone("t", 11)) {
                        let base = getBuyableAmount("cells", 13).max(1)
                        let exp  = player.t.milestones.length
                                                c += "组织 里程碑 11 使 AX 乘以 " + format(base.pow(exp)) + br
                }
                if (hasMilestone("t", 17))      c += "组织 里程碑 17 使 AX 乘以 " + format(player.tokens.tokens2.total.max(1).pow(player.t.milestones.length)) + br
                if (hasMilestone("t", 18))      c += "组织 里程碑 18 使 AX 乘以 " + format(player.tokens.total.pow10().root(player.extremeMode ? 29.918840221005354 : 47.19363281906435)) + br
        }
        if (!hasMilestone("ch", 14)) {
                if (hasUpgrade("t", 31))        c += "组织 XI 使 AX 乘以 3" + br
                if (hasUpgrade("t", 32) && player.cells.activeChallenge != undefined) {
                                                c += "组织 XII 使 AX 乘以 10" + br
                }        
                if (hasUpgrade("t", 34))        c += "组织 XIV 使 AX 乘以 " + format(tmp.t.upgrades[34].effect) + br
                if (hasUpgrade("t", 92))        c += "组织 XLII 使 AX 乘以 " + format(player.tokens.total.max(1).pow(Math.PI)) + br
                if (hasUpgrade("t", 111))       c += "组织 LI 使 AX 乘以 5" + br
                if (hasUpgrade("t", 113))       c += "组织 LIII 使 AX 乘以 " + format(player.tokens.tokens2.total.div(69).plus(1).pow(player.tokens.total)) + br
                if (hasUpgrade("t", 135))       c += "组织 LXV 使 AX 乘以 " + format(tmp.t.upgrades[135].effect) + br
                if (hasUpgrade("t", 144))       c += "组织 LXIX 使 AX 乘以 " + format(Decimal.pow(2, player.t.upgrades.length)) + br
        }
        if (!hasUpgrade("an", 34))      c += "下夸克 使 AX 乘以 " + format(tmp.tokens.buyables[102].effect) + br
        if (tmp.or.effect.gt(1))        c += "器官效果 使 AX 乘以 " + format(tmp.or.effect) + br
        if (player.extremeMode)         c += "端粒酶 使 AX 乘以 " + format(tmp.sci.buyables[522].stem_cell_effect) + br
        if ((!inChallenge("cells", 12) || player.cells.challenges[12] < 10) && tmp.sci.buyables[523].stem_cell_effect.gt(1)) {
                                        c += "单链 DNA 结合蛋白 使 AX 乘以 " + format(tmp.sci.buyables[523].stem_cell_effect) + br
        }
        if (hasUpgrade("sci", 524))     c += "DNA 科学 XIV 使 AX 乘以 " + format(tmp.sci.buyables[501].effect.max(1)) + br
        if (hasUpgrade("sci", 525))     c += "DNA 科学 XV 使 AX 乘以 " + format(tmp.sci.buyables[502].effect.max(1)) + br
        if (hasMilestone("cells", 32) && player.extremeMode && !hasMilestone("ch", 13)) {
                                        c += "细胞 里程碑 32 使 AX 乘以 " + format(tmp.sci.buyables[503].effect.max(1)) + br
        }
        if (hasUpgrade("sci", 531))     c += "DNA 科学 XVI 使 AX 乘以 " + format(tmp.sci.buyables[511].effect.max(1)) + br
        if (hasUpgrade("sci", 532))     c += "DNA 科学 XVII 使 AX 乘以 " + format(tmp.sci.buyables[512].effect.max(1).times(tmp.sci.upgrades[532].effect)) + br
        if (hasMilestone("cells", 34) && player.extremeMode) {
                                        c += "细胞 里程碑 34 使 AX 乘以 " + format(tmp.sci.buyables[513].effect.max(1)) + br
        }
        if (hasUpgrade("sci", 533))     c += "DNA 科学 XVIII 使 AX 乘以 " + format(tmp.sci.buyables[521].effect.max(1)) + br
        if (hasUpgrade("sci", 534))     c += "DNA 科学 XIX 使 AX 乘以 " + format(tmp.sci.buyables[522].effect.max(1)) + br
        if (hasUpgrade("sci", 535))     c += "DNA 科学 XX 使 AX 乘以 " + format(tmp.sci.buyables[523].effect.max(1).times(Decimal.pow(1.01, tmp.sci.buyables.dnaBuyablesTotal))) + br
        if (hasUpgrade("sci", 542))     c += "DNA 科学 XXII 使 AX 乘以 " + format(tmp.sci.upgrades[542].effect) + br
        if (hasUpgrade("sci", 543))     c += "DNA 科学 XXIII 使 AX 乘以 " + format(tmp.sci.upgrades.dnaUpgradesLength) + br
        if (hasUpgrade("or", 102) && !hasMilestone("sp", 18)) {
                                        c += "心脏 II 使 AX 乘以 " + format(tmp.or.upgrades[102].stem_cell_effect) + br
        }
        if (hasUpgrade("sci", 552))     c += "DNA 科学 XXVII 使 AX 乘以 " + format(Decimal.pow(2, tmp.sci.upgrades[552].lvls)) + br
        if (hasUpgrade("t", 72) && player.extremeMode) {
                                        c += "组织 XXXII 使 AX 乘以 " + format(player.cells.points.max(10).log10()) + br
        }
        if (hasUpgrade("sci", 553))     c += "DNA 科学 XXVIII 使 AX 乘以 " + format(player.tokens.total.max(1)) + br
        if (hasUpgrade("sci", 561))     c += "DNA 科学 XXXI 使 AX 乘以 " + format(Decimal.pow(2, tmp.sci.upgrades.dnaUpgradesLength)) + br
        if (hasUpgrade("sci", 562))     c += "DNA 科学 XXXII 使 AX 乘以 " + format(tmp.sci.buyables[521].effect.max(1).pow(tmp.sci.upgrades[551].lvls)) + br
        if (hasUpgrade("sci", 563))     c += "DNA 科学 XXXIII 使 AX 乘以 " + format(tmp.sci.buyables[512].effect.max(1).pow(tmp.sci.upgrades[551].lvls)) + br
        if (hasUpgrade("sci", 564))     c += "DNA 科学 XXXIV 使 AX 乘以 " + format(tmp.sci.buyables[522].effect.max(1).pow(tmp.sci.upgrades[551].lvls)) + br
        if (hasUpgrade("t", 91) && player.extremeMode) {
                                        c += "组织 XLI 使 AX 乘以 " + format(tmp.t.upgrades[91].effect) + br
        }
        if (tmp.or.challenges[12].reward.gt(1) && !hasMilestone("sp", 25)) {
                                        c += "气管 使 AX 乘以 " + format(tmp.or.challenges[12].reward) + br
        }
        if (tmp.an.effect.gt(1))        c += "动物效果 使 AX 乘以 " + format(tmp.an.effect) + br
        if (tmp.t.effect.gt(1))         c += br + "组织效果 使 AX 乘以 " + format(tmp.t.effect) + br
        if (hasUpgrade("or", 332))      c += "肺 XVII 使 AX 乘以 " + format(player.or.contaminants.points.max(1).pow(.01 * player.or.upgrades.length)) + br
                                        c += "万能干细胞 使 AX 乘以 " + format(tmp.cells.buyables[11].effect) + br
                                        c += "全能干细胞 使 AX 乘以 " + format(tmp.cells.buyables[12].effect) + br
                                        c += "多能干细胞 使 AX 乘以 " + format(tmp.cells.buyables[13].effect) + br
                                        c += "多能干细胞 使 AX 乘以 " + format(tmp.cells.buyables[21].effect) + br
                                        c += "少能干细胞 使 AX 乘以 " + format(tmp.cells.buyables[22].effect) + br
        if (c.includes("AX"))           c += br

        if (inChallenge("cells", 12))   c += "次级挑战 使 BX 乘以 " + format(tmp.cells.challenges[12].challengeEffect) + br
        if (c.includes("BX"))           c += br

        // AFTER SECONDARY BUFFS
        if (!hasMilestone("ch", 14)) {
                if (hasUpgrade("t", 63))        c += "组织 XXVIII 使 CX 乘以 " + format(tmp.t.effect) + br
                if (hasUpgrade("t", 124))       c += "组织 LIX 使 CX 乘以 " + format(Math.max(1, player.cells.challenges[11]) ** 2.5) + br
        }
        if (hasMilestone("t", 20) && !hasMilestone("an", 30)) {
                                        c += "组织 里程碑 20 使 CX 乘以 " + format(Decimal.pow(1.5, player.tokens.tokens2.total)) + br
        }
        if (c.includes("CX"))           c += br

        if (hasUpgrade("t", 35) && !hasUpgrade("e", 21)) {
                                        c += "组织 XV 使 DX 乘以 1.001" + br
        }
        if (hasUpgrade("sci", 513))     c += "DNA 科学 VIII 使 DX 乘以 " + format(tmp.sci.upgrades[513].effect, 4) + br
        if (hasUpgrade("sci", 525))     c += "DNA 科学 XV 使 DX 乘以 1.01" + br
        if (player.extremeMode)         c += "极限模式 使 DX 乘以 .75" + br
        if (!hasUpgrade("e", 22)) {
                if (hasUpgrade("or", 205) && player.or.filterLeftKidney) {
                                        c += "肾 V 使 DX 乘以 1.001" + br
                }
                if (hasUpgrade("or", 214) && !player.or.filterLeftKidney) {
                                        c += "肾 IX 使 DX 乘以 1.001" + br
                }
        }
        if (hasUpgrade("sp", 54) && !hasUpgrade("e", 21)) {
                                        c += "效果 XXIV 使 DX 乘以 1.0" + (hasUpgrade("sp", 154) ? "4" : hasUpgrade("sp", 104) ? "1" : "01") + br
        }
        if (c.includes("DX"))           c += br

        let ret = a + br + b + br2 + c
        ret = ret.replaceAll("AX", makeRed("A"))
        ret = ret.replaceAll("BX", makeRed("B"))
        ret = ret.replaceAll("CX", makeRed("C"))
        ret = ret.replaceAll("DX", makeRed("D"))
        return ret
}

function tissueFormulaDisplay(){
        let a = "组织产出为 " + format(tmp.t.getBaseGain, 3) + "*AX"
        let b = "AX 初始为 1，受以下因素影响"
        let c = ""

        if (player.easyMode)            c += "简单模式 使 AX 乘以 " + format(2) + br
        if (!hasMilestone("ch", 14)) {
                if (hasUpgrade("t", 83)) {
                        let base = new Decimal(player.cells.challenges[12]).max(10).log10()
                        let exp = Math.max(0, player.cells.challenges[11] - 10)
                                                c += "组织 三十八 使 AX 乘以 " + format(base.pow(exp)) + br
                }
                if (hasUpgrade("t", 131))       c += "组织 LXI 使 AX 乘以 " + format(Decimal.pow(2, tmp.t.upgrades.endUpgradeAmount)) + br
                if (hasUpgrade("t", 155))       c += "组织 LXXV 使 AX 乘以 " + format(Decimal.pow(1.11, player.tokens.tokens2.total)) + br
        }
        if (hasUpgrade("cells", 44) && !hasMilestone("ch", 15)) {
                                        c += "细胞 XIX 使 AX 乘以 " + format(player.tokens.tokens2.total.max(1)) + br
        }
        if (!hasUpgrade("or", 43))      c += "底夸克 使 AX 乘以 " + format(tmp.tokens.buyables[122].effect) + br
        if (player.cells.challenges[21] >= 2 && !hasMilestone("sp", 13)) {
                                        c += "三级 使 AX 乘以 " + format(player.t.best.plus(10).log10().plus(9).log10().pow(player.cells.challenges[21])) + br
        }
        if (tmp.an.effect.gt(1))        c += "动物效果 使 AX 乘以 " + format(tmp.an.effect) + br
        if (hasMilestone("or", 10) && !hasUpgrade("nu", 35)) {
                                        c += "器官 里程碑 10 使 AX 乘以 " + format(Decimal.pow(2, player.or.milestones.length)) + br
        }
        if (hasUpgrade("sci", 552))     c += "DNA 科学 XXVII 使 AX 乘以 " + format(Decimal.pow(2, tmp.sci.upgrades[552].lvls)) + br
        if (!hasMilestone("sp", 18)) {
                if (hasUpgrade("or", 143))      c += "心脏 XXIII 使 AX 乘以 " + format(player.or.buyables[202].max(1).pow(player.or.upgrades.length)) + br
                if (hasUpgrade("or", 155))      c += "心脏 XXX 使 AX 乘以 " + format(player.or.energy.points.max(1)) + br
        }
        if (hasUpgrade("sci", 563))     c += "DNA 科学 XXXIII 使 AX 乘以 " + format(2) + br
        if (tmp.or.challenges[32].reward.gt(1) && !hasMilestone("sp", 25)) {
                                        c += "细支气管 使 AX 乘以 " + format(tmp.or.challenges[32].reward) + br
        }
        if (hasUpgrade("an", 14))       c += "动物 IV 使 AX 乘以 " + format(player.an.grid[608].extras.plus(1).pow(player.an.milestones.length ** 2)) + br
        if (hasUpgrade("an", 34))       c += "动物 XIV 使 AX 乘以 " + format(tmp.tokens.buyables[102].effect) + br
        if (hasMilestone("nu", 2) && !hasMilestone("sp", 25)) {
                                        c += "细胞核 里程碑 2 使 AX 乘以 " + format(player.t.points.plus(10).log10().pow(player.nu.points)) + br
        }
        if (tmp.or.effect.gt(1))        c += br + "器官效果 使 AX 乘以 " + format(tmp.or.effect) + br
        if (hasMilestone("an", 39))     c += "动物 里程碑 39 使 AX 乘以 " + format(player.an.grid[307].extras.plus(1).pow(player.ch.points.min(5000).pow(3))) + br
        
        return (a + br + b + br2 + c).replaceAll("AX", makeRed("A"))
}

function organFormulaDisplay(){
        let a = "器官产出为 " + format(tmp.or.getBaseGain, 3) + "*AX"
        let b = "AX 初始为 1，受以下因素影响"
        let c = ""

        if (player.easyMode)            c += "简单模式 使 AX 乘以 2" + br
        if (!hasMilestone("sp", 18)) {
                if (hasUpgrade("or", 124))      c += "心脏 XIV 使 AX 乘以 " + format(tmp.or.upgrades[124].effect) + br
                if (hasUpgrade("or", 131))      c += "心脏 XVI 使 AX 乘以 " + format(player.or.milestones.length) + br
                if (hasUpgrade("or", 135))      c += "心脏 XX 使 AX 乘以 " + format(player.or.upgrades.length) + br
        }
        if (hasUpgrade("or", 141) && !hasUpgrade("or", 41)) {
                let lvls = Math.max(0, player.or.upgrades.length - 30)
                                        c += "心脏 XXI 使 AX 乘以 " + format(player.or.buyables[201].plus(10).log10().pow(lvls)) + br
        }
        if (!hasMilestone("sp", 27)) {
                if (hasUpgrade("or", 14))       c += "器官 IV 使 AX 乘以 " + format(player.tokens.tokens2.total.max(1)) + br
                if (hasUpgrade("or", 31))       c += "器官 XI 使 AX 乘以 " + format(Decimal.pow(1.03, player.tokens.tokens2.total)) + br
        }
        if (hasUpgrade("or", 313) && !hasUpgrade("tokens", 144)) {
                                        c += "肺 VIII 使 AX 乘以 " + format(player.or.air.points.max(10).log10()) + br
        }
        if (hasMilestone("or", 20) && !hasUpgrade("nu", 35)) {
                                        c += "器官 里程碑 20 使 AX 乘以 " + format(player.or.energy.points.max(10).log10()) + br
        }
        if (tmp.or.buyables[423].effect.gt(1) && !hasUpgrade("sp", 112)) {
                                        c += br + "intes<u>TINE</u> 使 AX 乘以 " + format(tmp.or.buyables[423].effect) + br
        }
        if (tmp.an.effect.gt(1))        c += "动物效果 使 AX 乘以 " + format(tmp.an.effect) + br
        if (hasUpgrade("an", 23))       c += "动物 VIII 使 AX 乘以 " + format(player.an.grid[506].extras.plus(1)) + br
        if (hasMilestone("ch", 7) && !hasUpgrade("sp", 121)) {
                                        c += "染色体 里程碑 7 使 AX 乘以 " + format(player.ch.points.pow(player.ch.points)) + br
        }
        if (player.an.achActive[13] && hasAchievement("an", 13) || hasAchievement("an", 23)) {
                                        c += "COM I 处于开启 使 AX 乘以 " + format(player.an.grid[308].extras.plus(1).pow(player.ch.points.min(5000).div(hasMilestone("sp", 21) ? 1 : 17))) + br
        }
        if (hasUpgrade("ch", 41))       c += "染色体 XVI 使 AX 乘以 " + format(player.an.grid[303].extras.plus(1).pow(player.nu.points)) + br
        if (hasUpgrade("nu", 24))       c += "细胞核 IX 使 AX 乘以 " + format(player.an.grid[203].extras.plus(1).pow(player.ch.points.min(5000))) + br
        if (hasUpgrade("sp", 12))       c += "效果 II 使 AX 乘以 " + format(tmp.sp.effect.pow(hasUpgrade("sp", 112) ? player.ch.points.pow(2) : Math.min(hasMilestone("nu", 21) ? 222 : 64, player.sp.times) ** 2)) + br
        if (hasUpgrade("sp", 62))       c += "升级效果 II 使 AX 乘以 " + format(tmp.sp.effect.pow(player.nu.points.pow(3))) + br
        if (hasUpgrade("sp", 141))      c += "强化效果 XVI 使 AX 乘以 " + format(player.an.grid[102].extras.plus(1).pow(player.tokens.tokens2.total)) + br

        return (a + br + b + br2 + c).replaceAll("AX", makeRed("A"))
}

function organExpDisplay(){
        let a = "器官效果指数为 BX"
        let b = "BX 初始为 " + format(player.or.points.cbrt().div(5).min(99).plus(1)) + " 并受以下因素影响"
        let c = ""

        if (hasUpgrade("an", 12))       c += "动物 II 增加 " + format(player.tokens.tokens2.total) + " 至 BX" + br2
        
        if (hasMilestone("an", 27))     c += "动物 里程碑 27 使 BX 乘以 " + format(player.ch.points.max(6).log(6)) + br
        if (hasMilestone("nu", 8))      c += "细胞核 里程碑 8 使 BX 乘以 " + formatWhole(player.nu.points.plus(1)) + br
        if (hasMilestone("sp", 13))     c += "物种 里程碑 13 使 BX 乘以 " + format(player.sp.milestones.length ** (hasUpgrade("sp", 141) ? 1 : .5)) + br
        if (hasUpgrade("tokens", 121))  c += "代币<sup>2</sup> XI 使 BX 乘以 50" + br
        if (hasUpgrade("tokens", 142))  c += "代币<sup>2</sup> XXII 使 BX 乘以 " + format(player.tokens.mastery_tokens.total.max(10).log10()) + br
        if (hasMilestone("pl", 10))     c += "植物 里程碑 10 使 BX 乘以 " + format(player.tokens.tokens2.total.max(1)) + br

        return (br + a + br + b + br2 + c).replaceAll("BX", makeRed("B"))
}

function airFormulaDisplay(){
        let a = "空气产出为 AX<sup>BX</sup>"
        let b = "AX 和 BX 初始为 1，受以下因素影响"
        let c = ""

        if (player.hardMode)            c += "困难模式 使 AX 除以 4" + br
        if (player.easyMode)            c += "简单模式 使 AX 乘以 4" + br
        if (!hasMilestone("ch", 11)) {
                                        c += "喉 使 AX 乘以 " + format(tmp.or.challenges[11].reward) + br
                                        c += "气管 使 AX 乘以 " + format(tmp.or.challenges[12].reward) + br
                                        c += "主支气管 使 AX 乘以 " + format(tmp.or.challenges[21].reward) + br
                                        c += "次级支气管 使 AX 乘以 " + format(tmp.or.challenges[22].reward) + br
                                        c += "三级支气管 使 AX 乘以 " + format(tmp.or.challenges[31].reward) + br
                                        c += "细支气管 使 AX 乘以 " + format(tmp.or.challenges[32].reward) + br
        }
        if (!hasMilestone("sp", 19)) {
                if (hasUpgrade("or", 221))      c += "肾 XI 使 AX 乘以 " + format(player.t.points.max(10).log10()) + br
                if (hasUpgrade("or", 224))      c += "肾 XIV 使 AX 乘以 " + format(tmp.or.upgrades[224].effect) + br
                if (hasUpgrade("or", 225))      c += "肾 XV 使 AX 乘以 " + format(tmp.or.buyables[412].effect) + br
                if (hasUpgrade("or", 233))      c += "肾 XVIII 使 AX 乘以 " + format(tmp.or.upgrades[323].effect) + br
        }
        if (hasUpgrade("or", 301))      c += "空气 I 使 AX 乘以 " + format(tmp.or.upgrades[301].effect) + br
        if (hasUpgrade("or", 312))      c += "空气 VII 使 AX 乘以 " + format(Decimal.pow(3, player.tokens.best_buyables[101].sub(30)).max(1)) + br
        if (!hasUpgrade("nu", 35)) {
                if (hasMilestone("or", 17))     c += "器官 里程碑 17 使 AX 乘以 " + format(player.or.milestones.length) + br
                if (hasMilestone("or", 20))     c += "器官 里程碑 20 使 AX 乘以 " + format(player.or.energy.points.max(10).log10()) + br
        }
        if (hasUpgrade("or", 23))       c += "器官 VIII 使 AX 乘以 " + format(tmp.or.upgrades[23].effect) + br
        if (hasUpgrade("or", 43))       c += "器官 XVIII 使 AX 乘以 " + format(tmp.tokens.buyables[122].effect) + br
        if (tmp.an.effect.gt(1))        c += "动物效果 使 AX 乘以 " + format(tmp.an.effect) + br
        if (hasMilestone("an", 16))     c += "动物 里程碑 16 使 AX 乘以 " + format(player.an.grid[808].extras.plus(1)) + br
        if (hasUpgrade("an", 22))       c += "动物 VII 使 AX 乘以 " + format(player.an.grid[505].extras.plus(1).pow(player.an.grid[508].buyables)) + br
        if (hasUpgrade("sp", 14))       c += "效果 IV 使 AX 乘以 " + format(tmp.sp.effect.pow(player.tokens.total.pow(.7))) + br
        if (c.includes("AX"))           c += br

        if (hasMilestone("ch", 11))     c += "染色体 里程碑 11 使 BX 乘以 " + format(60) + br
        if (hasMilestone("nu", 17))     c += "细胞核 里程碑 17 使 BX 乘以 " + format(Decimal.pow(1.01, player.nu.points)) + br
        if (hasUpgrade("sp", 64))       c += "升级效果 IV 使 BX 乘以 " + format(Decimal.pow(1.01, player.sp.upgrades.length)) + br
        if (c.includes("BX"))           c += br

        let ret = a + br + b + br2 + c
        ret = ret.replaceAll("AX", makeRed("A"))
        ret = ret.replaceAll("BX", makeRed("B"))
        return ret
}

function energyFormulaDisplay(){
        let a = "能量产出为 AX<sup>BX</sup>"
        let b = "AX 和 BX 初始为 1，受以下因素影响"
        let c = ""
        let data = player.or.extras

        if (player.easyMode)            c += "简单模式 使 AX 乘以 4" + br
        if (data[401].gt(0))            c += "<u>IN</u>testine 使 AX 乘以 " + format(data[401].plus(1)) + br
        if (data[402].gt(0))            c += "<u>in</u>TEStine 使 AX 乘以 " + format(data[402].plus(1)) + br
        if (data[403].gt(0))            c += "<u>in</u>tesTINE 使 AX 乘以 " + format(data[403].plus(1)) + br
        if (data[411].gt(0))            c += "IN<u>tes</u>tine 使 AX 乘以 " + format(data[411].plus(1)) + br
        if (data[412].gt(0))            c += "in<u>TES</u>tine 使 AX 乘以 " + format(data[412].plus(1)) + br
        if (data[413].gt(0))            c += "in<u>tes</u>TINE 使 AX 乘以 " + format(data[413].plus(1)) + br
        if (data[421].gt(0))            c += "INtes<u>tine</u> 使 AX 乘以 " + format(data[421].plus(1)) + br
        if (data[422].gt(0))            c += "inTES<u>tine</u> 使 AX 乘以 " + format(data[422].plus(1)) + br
        if (data[423].gt(0))            c += "intes<u>TINE</u> 使 AX 乘以 " + format(data[423].plus(1)) + br
        if (hasMilestone("or", 20) && !hasUpgrade("nu", 35)) {
                                        c += "器官 里程碑 20 使 AX 乘以 " + format(player.or.milestones.length) + br
        }
        if (!hasMilestone("sp", 27)) {
                if (hasUpgrade("or", 21))       c += "器官 VI 使 AX 乘以 " + format(player.d.points.max(10).log10()) + br
                if (hasUpgrade("or", 23))       c += "器官 VIII 使 AX 乘以 " + format(tmp.or.upgrades[23].effect) + br
        }
        if (hasUpgrade("or", 43))       c += "器官 XVIII 使 AX 乘以 " + format(tmp.tokens.buyables[122].effect) + br
        if (hasUpgrade("or", 323) && !hasUpgrade("tokens", 144)) {
                                        c += "肺 XIII 使 AX 乘以 " + format(tmp.or.upgrades[323].effect) + br
        }
        if (tmp.an.effect.gt(1))        c += "动物效果 使 AX 乘以 " + format(tmp.an.effect.min("ee12")) + br
        if (hasUpgrade("an", 15))       c += "动物 V 使 AX 乘以 " + format(player.an.grid[607].extras.plus(1)) + br
        if (hasMilestone("an", 23)) {
                let base = player.an.grid[404].extras.plus(1)
                let exp = hasMilestone("ch", 36) ? player.ch.points.times(player.ch.points.min(5000)).sqrt() : player.ch.points.min(5000)
                                        c += "动物 里程碑 23 使 AX 乘以 " + format(base.pow(exp)) + br
        }
        if (hasUpgrade("sp", 151))      c += "强化效果 XXI 使 AX 乘以 " + format(player.an.grid[107].extras.plus(1).pow(player.nu.points.times(2))) + br
        if (c.includes("AX"))           c += br

        // BELOW IS EXPONENTIAL THINGS
        if (hasMilestone("or", 21)) {
                let a = hasUpgrade("or", 151) + hasUpgrade("or", 152) + hasUpgrade("or", 153)
                a += hasUpgrade("or", 154) + hasUpgrade("or", 155) 
                                        c += "器官 里程碑 21 使 BX 乘以 " + format(Decimal.pow(1.01, a), 4) + br
        }
        if (hasUpgrade("nu", 21))       c += "细胞核 VI 使 BX 乘以 " + format(player.ch.points.max(1234).div(1234).cbrt().min(1.01), 4) + br
        if (hasMilestone("an", 42))     c += "动物 里程碑 42 使 BX 乘以 " + format(player.ch.points.max(1465).div(1465).sqrt().min(1.1), 4) + br
        if (hasUpgrade("sp", 53))       c += "效果 XXIII 使 BX 乘以 1.0" + (hasUpgrade("sp", 153) ? "03" : "01") + br
        if (hasUpgrade("sp", 103))      c += "升级效果 XXIII 使 BX 乘以 1.003" + br
        if (c.includes("BX"))           c += br

        let ret = a + br + b + br2 + c
        ret = ret.replaceAll("AX", makeRed("A"))
        ret = ret.replaceAll("BX", makeRed("B"))
        return ret
}

function animalFormulaDisplay(){
        let a = "动物产出为 " + format(tmp.an.getBaseGain, 3) + "*AX"
        let b = "AX 初始为 1，受以下因素影响"
        let c = ""

        if (player.easyMode)            c += "简单模式 使 AX 乘以 2" + br
        if (!hasMilestone("pl", 12)) {
                if (hasMilestone("an", 13))     c += "动物 里程碑 13 使 AX 乘以 " + format(player.an.milestones.length) + br
                if (hasMilestone("an", 18))     c += "动物 里程碑 18 使 AX 乘以 " + format(player.an.genes.points.max(10).log10()) + br
                else if (hasUpgrade("or", 351)) {
                        let a = 1
                        if (hasUpgrade("or", 352)) a ++
                        if (hasUpgrade("or", 353)) a ++
                        if (hasUpgrade("or", 354)) a ++
                        if (hasUpgrade("or", 355)) a ++
                                                c += "肺 XXVI 使 AX 乘以 " + format(Decimal.pow(2, a)) + br
                }
        }
        if (hasUpgrade("an", 35))       c += "动物 XV 使 AX 乘以 " + format(Decimal.pow(1.01, player.ch.points)) + br
        if (hasAchievement("an", 23) && player.an.achActive[23]) {
                                        c += "COM II 使 AX 乘以 10" + br
        }
        if (hasMilestone("nu", 1))      c += "细胞核 里程碑 1 使 AX 乘以 2" + br

        if (hasUpgrade("an", 53))       c += br + "动物 XXIII 使 AX 乘以 " + format(Decimal.pow(1.01, player.tokens.tokens2.total.sub(hasMilestone("nu", 9) ? 0 : 7200).max(0))) + br
        if (hasUpgrade("nu", 33))       c += "细胞核 XIII 使 AX 乘以 " + format(tmp.sp.challenges[11].reward.pow(player.nu.upgrades.length ** .5)) + br
        if (hasMilestone("an", 22))     c += "动物 里程碑 22 使 AX 乘以 " + format(player.an.grid[508].extras.plus(1).pow(.01)) + br
        if ((player.an.achActive[33] || hasMilestone("nu", 14)) && hasAchievement("an", 33)) {
                                        c += "COM III 使 AX 乘以 " + format(Decimal.pow(5, player.nu.points.times(tmp.an.clickables.rowThreeOff))) + br
        }
        if (hasUpgrade("sp", 11))       c += "效果 I 使 AX 乘以 " + format(tmp.sp.effect.pow(hasUpgrade("sp", 111) ? player.nu.points : 1)) + br
        if (hasMilestone("sp", 7))      c += "物种 里程碑 7 使 AX 乘以 " + format(tmp.sp.effect.pow(player.sp.milestones.length)) + br
        if (hasMilestone("sp", 10)) {
                let sub = hasUpgrade("nu", 45) ? 0 : 85800
                let base = decimalOne.plus(player.sp.milestones.length/500)
                                        c += "物种 里程碑 10 使 AX 乘以 " + format(base.pow(player.tokens.tokens2.total.sub(sub).max(0))) + br
        }
        if (hasUpgrade("sp", 152))      c += "强化效果 XXII 使 AX 乘以 " + format(player.an.grid[108].extras.plus(1).pow(player.tokens.mastery_tokens.total.div(100))) + br
        if (hasUpgrade("sp", 144))      c += "强化效果 XIX 使 AX 乘以 " + format(player.an.grid[105].extras.plus(1)) + br

        return (a + br + b + br2 + c).replaceAll("AX", makeRed("A"))
}

function geneFormulaDisplay(){
        let a = "基因产出为 " + format(player.an.grid[808].extras.plus(1), 3) + "*AX"
        let b = "AX 初始为 1，受以下因素影响"
        let c = ""

        if (player.easyMode)            c += "简单模式 使 AX 乘以 4" + br
        if (hasMilestone("an", 16) && !hasUpgrade("tokens", 114)) {
                let sub = hasMilestone("an", 22) ? 0 : 1000
                                        c += "动物 里程碑 16 使 AX 乘以 " + format(Decimal.pow(1.01, player.tokens.tokens2.total.sub(sub).max(0))) + br
                if (player.sp.unlocked) c += "动物 里程碑 16 由于物种 使 AX 乘以 " + format(Decimal.pow(10, player.sp.times).min(1e22)) + br
        }
        if (!hasUpgrade("ch", 44)) {
                if (hasMilestone("an", 17)) {
                        let base = player.or.deoxygenated_blood.points.max(10).log10().max(10).log10()
                        let exp = player.nu.points.plus(player.an.upgrades.length)
                                                c += "动物 里程碑 17 使 AX 乘以 " + format(base.pow(exp)) + br
                }
                if (hasMilestone("an", 18))     c += "动物 里程碑 18 使 AX 乘以 " + format(player.an.points.max(10).log10()) + br
                if (hasMilestone("an", 19))     c += "动物 里程碑 19 使 AX 乘以 " + format(player.or.contaminants.points.max(10).log10()) + br
                if (hasMilestone("an", 20))     c += "动物 里程碑 20 使 AX 乘以 " + format(player.cells.points.max(10).log10()) + br
        }
        if (hasMilestone("an", 21) && !hasUpgrade("nu", 23)) {
                                        c += "动物 里程碑 21 使 AX 乘以 " + format(tmp.an.milestones[21].effect) + br
        }
        if (hasMilestone("an", 28) && !hasUpgrade("hu", 153)) {
                                        c += "动物 里程碑 28 使 AX 乘以 " + format(player.an.grid[306].extras.plus(1)) + br
        }
        if (hasMilestone("an", 34) && !hasMilestone("an", 36)) {
                                        c += "动物 里程碑 34 使 AX 乘以 10" + br
        }
        if (hasMilestone("an", 39) && !hasMilestone("e", 5)) {
                                        c += "动物 里程碑 39 使 AX 乘以 1000" + br
        }
        if (hasMilestone("ch", 5) && !hasUpgrade("an", 31)) {
                                        c += "染色体 里程碑 5 使 AX 除以 " + format(Decimal.pow(2, player.ch.points.sub(8))) + br
        }
        if (hasMilestone("ch", 6) && !hasMilestone("an", 24)) {
                                        c += "染色体 里程碑 6 使 AX 除以 " + format(Decimal.pow(2, player.ch.points)) + br
        }
        if (!hasUpgrade("nu", 23)) {
                if (hasMilestone("ch", 8))      c += "染色体 里程碑 8 使 AX 乘以 " + format(player.ch.points.pow(player.ch.milestones.length/3).max(1)) + br
                if (hasMilestone("ch", 16))     c += "染色体 里程碑 16 使 AX 乘以 " + format(player.ch.points.plus(1)) + br
                if (hasMilestone("ch", 17))     c += "染色体 里程碑 17 使 AX 乘以 " + format(Decimal.pow(2, player.nu.points)) + br
        }
        if (hasUpgrade("ch", 14) && !hasMilestone("ch", 30)) {
                                        c += "染色体 IV 使 AX 乘以 " + format(tmp.ch.upgrades[14].effect) + br
        }
        if (hasUpgrade("ch", 15) && !hasMilestone("sp", 26)) {
                let base = hasUpgrade("an", 34) ? 1.04 : 1.01
                let sub = hasUpgrade("an", 43) ? 0 : 2600
                let exp = player.tokens.tokens2.total.sub(sub).max(0)
                                        c += "染色体 V 使 AX 乘以 " + format(Decimal.pow(base, exp)) + br
        }
        if (hasUpgrade("ch", 23) && !hasUpgrade("nu", 14)) {
                                        c += "染色体 VIII 使 AX 乘以 20" + br
        }
        if (hasUpgrade("ch", 32) && !hasUpgrade("nu", 14)) {
                                        c += "染色体 XII 使 AX 乘以 20" + br
        }
        if (hasUpgrade("an", 43) && !hasMilestone("ch", 29)) {
                                        c += "动物 XVIII 使 AX 除以 1e42" + br
        }
        if (!hasMilestone("sp", 26)) {
                if (hasUpgrade("an", 51))       c += "动物 XXI 使 AX 乘以 2" + br
                if (hasUpgrade("an", 53)) {
                        let sub = hasMilestone("nu", 9) ? 0 : 7200
                        let per = 1.05
                                                c += "动物 XXIII 使 AX 乘以 " + format(Decimal.pow(per, player.tokens.tokens2.total.sub(sub).max(0))) + br
                }
                if (hasUpgrade("an", 54))       c += "动物 XXIV 使 AX 乘以 " + format(player.nu.points.div(4).plus(1).pow(player.an.upgrades.length)) + br
        }
        if (!player.an.achActive[11] && hasAchievement("an", 11)) {
                if (!player.an.achActive[22]) {
                                        c += "PRO I 使 AX 乘以 " + format(Decimal.pow(hasMilestone("an", 36) ? 25 : 5, player.an.achievements.length + 4)) + br
                } else                  c += "PRO I 使 AX 乘以 25" + br
        }
        if (hasAchievement("an", 12)) {
                if ((player.an.achActive[12] || hasMilestone("ch", 16)) && !hasUpgrade("ch", 34)) {
                                        c += "PRI I 使 AX 除以 4e49" + br
                } 
                if (!player.an.achActive[12] || hasAchievement("an", 22)) {
                                        c += "PRI I 使 AX 乘以 " + format(Decimal.pow(hasMilestone("an", 31) ? 2 : 4, player.ch.points.sub(hasUpgrade("nu", 12) ? 0 : 200).max(0))) + br
                }
        }
        if (hasAchievement("an", 21)) {
                let l = player.ch.points.sub(235).max(0)
                let aa = player.an.achActive
                let r1o = !aa[11] + !aa[12] + !aa[13] + !aa[14]
                if (player.an.achActive[21])    c += "PRO II 使 AX 乘以 " + format(Decimal.pow(3.3, l.times(r1o))) + br
                else                            c += "PRO II 使 AX 乘以 " + format(Decimal.pow(100, l)) + br
        }
        if (hasAchievement("an", 31) && !hasUpgrade("tokens", 123)) {
                                        c += "进程 III 使 AX 乘以 " + format(Decimal.pow(15, player.nu.milestones.length)) + br
        }
        if (!hasUpgrade("hu", 153)) {
                if (hasUpgrade("tokens", 102))  c += "代币<sup>2</sup> II 使 AX 乘以 " + format(player.sp.points.max(1).pow(player.tokens.upgrades.length)) + br
                if (hasMilestone("nu", 1))      c += "细胞核 里程碑 1 使 AX 乘以 2" + br
        }
        if (hasMilestone("nu", 2) && !hasMilestone("sp", 25)) {
                                        c += "细胞核 里程碑 2 使 AX 乘以 " + format(Decimal.pow(hasMilestone("an", 43) ? 70 : 10, player.nu.points)) + br
        }
        
        
        if (c.includes(br))             c += br 
        if (hasMilestone("ch", 7) && !hasUpgrade("sp", 121)) {
                                        c += "染色体 里程碑 7 使 AX 乘以 " + format(player.ch.points.div(67).plus(1).pow(player.ch.points)) + br
        }
        if (!hasUpgrade("hu", 153)) {
                if (hasMilestone("sp", 26))     c += "物种 里程碑 26 使 AX 乘以 " + format(Decimal.pow(1.1, player.tokens.tokens2.total)) + br
                if (hasMilestone("an", 23))     c += "动物 里程碑 23 使 AX 乘以 " + format(player.or.energy.points.div("1e14000").plus(1).pow(.002)) + br
        }
        if (hasUpgrade("sp", 143))      c += "强化物种 XVIII 使 AX 乘以 " + format(player.an.grid[104].extras.plus(1).pow(player.tokens.mastery_tokens.total)) + br
        if (hasMilestone("hu", 41))     c += "人类 里程碑 41 使 AX 乘以 " + format(player.pl.biomass.points.max(1).pow(player.tokens.mastery_tokens.total.div(1.6))) + br

        return (a + br + b + br2 + c).replaceAll("AX", makeRed("A"))
}

function contaminantFormulaDisplay(){
        let a = "污染物产出为 AX"
        let b = "AX 初始为 1，受以下因素影响"
        let c = ""

        if (!hasMilestone("pl", 13)) {
                if (hasUpgrade("or", 201)) {
                        let base = hasUpgrade("or", 321) || player.an.unlocked ? 4 : 2
                                                c += "肾 I 使 AX 乘以 " + format(Decimal.pow(base, tmp.or.upgrades.kidneyUpgradesLength)) + br
                }
                if (hasUpgrade("or", 225))      c += "肾 XV 使 AX 乘以 " + format(player.or.energy.points.max(1).div(1e200).pow(player.or.upgrades.length)) + br
                if (!hasMilestone("sp", 25))    c += "喉 使 AX 乘以 " + format(tmp.or.challenges[11].reward) + br
                if (hasUpgrade("or", 142))      c += "心脏 XXII 使 AX 乘以 " + format(player.or.points.max(1)) + br
                if (hasUpgrade("or", 143) && !hasMilestone("sp", 18)) {
                                                c += "心脏 XXIII 使 AX 乘以 " + format(player.or.buyables[202].max(1).pow(player.or.upgrades.length)) + br
                }
                if (hasMilestone("or", 16))     c += "器官 里程碑 16 使 AX 乘以 " + format(player.or.deoxygenated_blood.points.max(1)) + br
                if (tmp.an.effect.gt(1))        c += "动物效果 使 AX 乘以 " + format(tmp.an.effect) + br
                if (hasMilestone("an", 5))      c += "动物 里程碑 5 使 AX 乘以 " + format(player.or.contaminants.points.plus(10).log10().sqrt().pow10()) + br
                if (hasUpgrade("an", 21))       c += "动物 VI 使 AX 乘以 " + format(player.an.grid[608].extras.plus(1).pow(tmp.an.grid.totalLevels)) + br
                if (hasMilestone("ch", 21))     c += "染色体 里程碑 21 使 AX 乘以 " + format(player.an.grid[305].extras.plus(1).pow(player.ch.points.min(5000).pow(4))) + br
                if (hasUpgrade("sp", 15))       c += "效果 V 使 AX 乘以 " + format(tmp.sp.effect.pow(player.or.buyables[201].pow(hasUpgrade("sp", 115) ? .91 : hasUpgrade("sp", 65) ? .9 : .8))) + br
                if (hasUpgrade("sp", 44))       c += "效果 XIX 使 AX 乘以 " + format(player.an.grid[206].extras.plus(1).pow(player.nu.points.pow(6))) + br
                if (c.includes(br))             c += br
        }

                                        c += "I'm 使 AX 乘以 " + format(tmp.or.buyables[201].effect) + br
                                        c += "gonna 使 AX 乘以 " + format(tmp.or.buyables[202].effect) + br
                                        c += "使 使 AX 乘以 " + format(tmp.or.buyables[203].effect) + br
                                        c += "him 使 AX 乘以 " + format(tmp.or.buyables[211].effect) + br
                                        c += "an 使 AX 乘以 " + format(tmp.or.buyables[212].effect) + br
                                        c += "offer 使 AX 乘以 " + format(tmp.or.buyables[213].effect) + br
                                        c += "he 使 AX 乘以 " + format(tmp.or.buyables[221].effect) + br
                                        c += "can't 使 AX 乘以 " + format(tmp.or.buyables[222].effect) + br
                                        c += "refuse 使 AX 乘以 " + format(tmp.or.buyables[223].effect) + br
        
        return (a + br + b + br2 + c).replaceAll("AX", makeRed("A"))
}

function taxonomyCapFormulaDisplay(){
        let a = "分类学上限为 AX"
        let b = "AX 初始为 400，以下因素对其加成"
        let c = ""

        if (hasMilestone("hu", 44))  {
                c = "人类 里程碑 44 使 AX 10 * 植物" + br
                if (hasMilestone("hu", 71)) {
                        let x = decimalOne
                        if (player.hu.points.gte("1e20579")) x = x.times(100)
                        if (player.hu.points.gte("1e20831")) x = x.times(5)
                        if (x.gt(1)) c += "人类 里程碑 71 使 AX 乘以 " + format(x) + br 
                }
                if (hasMilestone("hu", 95)) {
                        let x = new Decimal(2)
                        if (player.hu.points.gte("1e46005")) x = x.times(2)
                        if (player.hu.points.gte("1e46110")) x = x.times(2)
                        if (player.hu.points.gte("1e46289")) x = x.times(2)
                        if (x.gt(1)) c += "人类 里程碑 95 使 AX 乘以 " + format(x) + br 
                }
                if (hasUpgrade("hu", 131))    c += "人类 LXI 使 AX 乘以 5" + br
                if (hasUpgrade("hu", 151)) {
                        if (player.hu.points.gte("1e114367")) c += "人类 LXI 使 AX 乘以 10" + br
                        if (player.hu.points.gte("1e114390")) c += "人类 LXI 使 AX 乘以 10" + br
                }

                return (a + br + b + br2 + c).replaceAll("AX", makeRed("A"))
        }

        if (hasMilestone("hu", 15)) {
                c = "人类 里程碑 15 使 AX 植物 + 9000" + br 
                if (hasMilestone("hu", 35) && player.hu.thoughts.points.gte("4.44e4444")) {
                        c += "人类 里程碑 35 增加 1000 至 AX" + br
                }
                return (a + br + b + br2 + c).replaceAll("AX", makeRed("A"))
        }

        if (hasMilestone("ch", 32))             c = "染色体 里程碑 32 使 AX 细胞核 + 1200" + br
        else if (hasMilestone("ch", 29))        c = "染色体 里程碑 29 使 AX 细胞核 + 1500" + br
        else {
                if (hasUpgrade("ch", 23)) {
                        let add = player.ch.points.times(3).min(700)
                        c += "染色体 VIII 增加 " + formatWhole(add) + " 至 AX" + br
                } else if (hasUpgrade("ch", 13)) {
                        let add = player.ch.points.sub(37).max(0).times(4)
                        c += "染色体 III 增加 " + formatWhole(add.min(450)) + " 至 AX" + br
                }
                if (hasMilestone("ch", 14)) {
                        let add = player.ch.points.sub(234).times(2).max(0)
                        c += "染色体 里程碑 14 增加 " + formatWhole(add.min(110)) + " 至 AX" + br
                }
                if (hasUpgrade("an", 55)) {
                        let add = player.ch.points.sub(291).max(0)
                        c += "动物 XXV 增加 " + formatWhole(add.min(297)) + " 至 AX" + br
                }
                if (hasMilestone("nu", 16)) {
                        c += "细胞核 里程碑 16 增加 " + formatWhole(tmp.nu.effectPrimary) + " 至 AX" + br
                } else {
                        if (hasMilestone("nu", 11))     c += "细胞核 里程碑 11 增加 " + formatWhole(player.nu.points.div(2)) + " 至 AX" + br
                        if (hasUpgrade("ch", 44))       c += "染色体 XIX 增加 " + formatWhole(player.nu.points.div(2)) + " 至 AX" + br
                }
        }
        

        if (hasChallenge("sp", 31))     c += "真正无染色体 增加 " + formatWhole(tmp.sp.challenges[31].reward) + " 至 AX" + br
        if (hasUpgrade("sp", 121))      c += "强化效果 VI 增加 30 至 AX" + br
        if (hasUpgrade("sp", 144))      c += "强化效果 XIX 增加 20 至 AX" + br
        if (hasMilestone("e", 1))       c += "生态系统 里程碑 1 增加 " + formatWhole(Math.min(10, player.e.milestones.length) * 5) + " 至 AX" + br
        if (hasUpgrade("e", 14))        c += "生态系统 IV 增加 " + formatWhole(4 * player.e.challenges[11]) + " 至 AX" + br                        
        if (hasUpgrade("tokens", 292))  c += "M 102 增加 " + formatWhole(player.pl.points.min(300)) + " 至 AX" + br

        return (a + br + b + br2 + c).replaceAll("AX", makeRed("A"))
}

function speciesFormulaDisplay(){ // c += " 使 AX 乘以 " + format
        let a = "物种产出为 " + format(tmp.sp.getBaseGain, 3) + "*AX"
        let b = "AX 初始为 1，受以下因素影响"
        let c = ""

        if (hasMilestone("nu", 20))     c += "细胞核 里程碑 20 使 AX 乘以 " + format(player.tokens.total.plus(10).log10()) + br
        if (hasChallenge("sp", 11))     c += "无染色体 使 AX 乘以 " + format(tmp.sp.challenges[11].reward) + br
        if (hasMilestone("sp", 8))      c += "物种 里程碑 8 使 AX 乘以 " + format(new Decimal(player.sp.milestones.length).div(50).plus(.87).pow(player.nu.points)) + br
        if (hasMilestone("sp", 12))     c += "物种 里程碑 12 使 AX 乘以 " + format(Decimal.pow(player.sp.milestones.length/10, player.nu.points.sub(80).max(0)).max(1)) + br
        if (hasUpgrade("nu", 34)) {
                let base = new Decimal(1.01)
                let lvls = function(x){return player.an.grid[100 + x].buyables}
                let exp = lvls(1).plus(lvls(2)).plus(lvls(3)).plus(lvls(4)).plus(lvls(5))
                exp = exp.plus(lvls(6)).plus(lvls(7)).plus(lvls(8))
                                        c += "细胞核 XIV 使 AX 乘以 " + format(base.pow(exp)) + br
        }
        if (hasUpgrade("tokens", 114) && player.or.energy.points.gt(10)) {
                                        c += "代币<sup>2</sup> IX 使 AX 乘以 " + format(player.or.energy.points.max(10).log10()) + br
        }
        if (hasUpgrade("tokens", 124))  c += "代币<sup>2</sup> XIV 使 AX 乘以 " + format(Decimal.pow(player.sp.upgrades.length, player.tokens.mastery_tokens.total.div(3))) + br
        if (hasUpgrade("tokens", 251))  c += "M 61 使 AX 乘以 10" + br
        if (hasUpgrade("sp", 145))      c += "强化效果 XX 使 AX 乘以 " + format(player.an.grid[106].extras.plus(1).pow(.02)) + br
        if (tmp.e.effect.gt(1))         c += "生态系统效果 使 AX 乘以 " + format(tmp.e.effect) + br

        return (a + br + b + br2 + c).replaceAll("AX", makeRed("A"))
}

function ecosystemFormulaDisplay(){
        let a = "生态系统产出为 " + format(tmp.e.getBaseGain, 3) + "*AX"
        let b = "AX 初始为 1，受以下因素影响"
        let c = ""

        if (hasUpgrade("e", 13)) {
                let base = 1.02
                if (hasMilestone("hu", 73)) {
                        if (player.hu.points.gte("3e22,278"))   base = 1.03
                        if (player.hu.points.gte("1e22,422"))   base = 1.04
                        if (player.hu.points.gte("3e22,558"))   base = 1.05
                        if (player.hu.points.gte("3e22,779"))   base = 1.06
                        if (player.hu.points.gte("3e22,964"))   base = 1.07
                        if (player.hu.points.gte("1e23,935"))   base = 1.072
                }
                if (hasMilestone("hu", 76)) {
                        if (player.hu.points.gte("1e26,279"))   base = 1.08
                        if (player.hu.points.gte("1e26,308"))   base = 1.09
                        if (player.hu.points.gte("1e26,335"))   base = 1.10
                }
                if (hasMilestone("hu", 98)) {
                        if (player.hu.points.gte("1e52,623"))   base = 1.105
                        if (player.hu.points.gte("1e52,675"))   base = 1.115
                        if (player.hu.points.gte("1e52,743"))   base = 1.12
                        if (player.hu.points.gte("1e52,770"))   base = 1.13
                        if (player.hu.points.gte("1e52,855"))   base = 1.14
                        if (player.hu.points.gte("1e52,933"))   base = 1.15
                        if (player.hu.points.gte("1e53,583"))   base = 1.155
                        if (player.hu.points.gte("1e53,651"))   base = 1.16
                }
                c += "生态系统 III 使 AX 乘以 " + format(Decimal.pow(base, player.tokens.mastery_tokens.total)) + br
        }
        if (hasChallenge("e", 12))      c += "无细胞核？ 使 AX 乘以 " + format(tmp.e.challenges[12].ecoMult) + br
        if (hasMilestone("pl", 2))      c += "植物 里程碑 2 使 AX 乘以 " + format(player.ch.points.max(10).log10().pow(player.pl.milestones.length)) + br
        if (hasMilestone("pl", 6))      c += "植物 里程碑 6 使 AX 乘以 " + format(player.nu.points.sub(1200).max(1)) + br
        if (hasUpgrade("pl", 24))       c += "植物 IX 使 AX 乘以 " + format(player.pl.points.pow(player.pl.points.sub(44).max(0).sqrt())) + br
        if (hasMilestone("hu", 68)) {
                let exp = player.hu.milestones.length
                                        c += "人类 里程碑 68 使 AX 乘以 " + format(player.hu.thoughts.points.max(1).pow(exp)) + br
        }

        return (a + br + b + br2 + c).replaceAll("AX", makeRed("A"))
}

function biomassFormulaDisplay(){
        let a = "基础生物质产出为 " + format(tmp.pl.biomass.getBaseGain, 3) + " (AX)"
        let b = "AX 初始为 1，受以下因素影响"
        let c = ""

        if (hasUpgrade("r", 12)) {
                let exp = player.tokens.mastery_tokens.total.plus(player.nu.points.times(2))
                                
                let ret = Decimal.pow(1.2824319950172338, exp) // 1.01 ** 25

                if (ret.gt("e15e6")) ret = ret.log10().times(6e7).sqrt().sub(15e6).pow10()

                c += "植物 II 使 AX 乘以 " + format(ret) + br

                let f = function(x){
                        if (x.lt("1e10000") ||  player.chem.best_amount.P.gte(10)) return x 
                        return x.log10().sqrt().sub(50).pow10().pow(200)
                }
                c += "幼苗 使 AX 乘以 " + format(f(tmp.pl.buyables[11].effect)) + br
                c += "叶 使 AX 乘以 " + format(f(tmp.pl.buyables[12].effect)) + br
                c += "干细胞 使 AX 乘以 " + format(f(tmp.pl.buyables[13].effect)) + br
                c += "花 使 AX 乘以 " + format(f(tmp.pl.buyables[21].effect)) + br

                return (a + br + b + br2 + c).replaceAll("AX", makeRed("A"))
        }
                        
                                        c += "初始 生物质 产出为 is " + format(player.e.points.max(10).log10().sub(hasMilestone("pl", 4) ? 0 : 100).max(0)) + br
        if (hasUpgrade("pl", 13))       c += "植物 III 提升 此 至 该 " + formatWhole(player.pl.points.max(1).min(160)) + " 次方" + br

        

        if (hasMilestone("pl", 1))      c += "植物 里程碑 1 使 AX 乘以 " + format(Decimal.pow(3, player.e.challenges[21] - 33).max(1)) + br
        if (hasMilestone("pl", 2))      c += "植物 里程碑 2 使 AX 乘以 " + format(player.ch.points.max(10).log10().pow(player.pl.milestones.length)) + br
        if (hasUpgrade("pl", 12)) {
                let exp = player.tokens.mastery_tokens.total.sub(hasMilestone("pl", 3) ? 0 : 500).max(0)
                if (hasMilestone("pl", 6))      exp = exp.plus(player.nu.points.sub(1200).max(0))
                if (hasUpgrade("tokens", 292))  exp = exp.plus(player.nu.points.sub(2030).max(0))
                
                let b1 = Decimal.pow(1.01, exp)

                let upgs = player.pl.upgrades.length + (hasUpgrade("e", 31) ? player.e.upgrades.filter(x => x > 30 & x < 40).length : 0)
                let eff = b1.pow(upgs)
                if (eff.gt("e15e6")) eff = eff.log10().times(6e7).sqrt().sub(15e6).pow10()
                                        c += "植物 II 使 AX 乘以 " + format(eff) + br
        }
        if (hasUpgrade("pl", 24))       c += "植物 IX 使 AX 乘以 " + format(player.pl.points.pow(player.pl.points.sub(44).max(0).sqrt())) + br
                                        c += "无动物？ 使 AX 乘以 " + format(player.pl.biomass.points.max(10).log10().pow(player.e.challenges[22])) + br
        if (!hasMilestone("hu", 18)) {
                if (hasUpgrade("e", 31))        c += "生态系统 XI 使 AX 乘以 " + format(player.nu.points.max(10).log10().pow(player.e.upgrades.length)) + br
                if (hasUpgrade("e", 34))        c += "生态系统 XIV 使 AX 乘以 " + format(player.tokens.tokens2.total.max(1).pow(player.pl.points.min(100).sub(15).max(0))) + br
                if (hasUpgrade("e", 44))        c += "生态系统 XIX 使 AX 乘以 " + format(Decimal.pow(1e10, player.pl.points.plus(.0001).cbrt().floor().sub(3.9).max(0))) + br
        }
        if (hasUpgrade("hu", 11))       c += "人类 I 使 AX 乘以 " + format(player.hu.thoughts.points.max(1).pow(player.hu.upgrades.length).pow(hasUpgrade("hu", 12) ? player.hu.milestones.length : 1)) + br
        if (hasUpgrade("hu", 61) && player.hu.points.gte("1e5551")) {
                c += "人类 XXVI 使 AX 乘以 " + format(player.hu.thoughts.points.max(1).pow(player.hu.milestones.length)) + br
        }

        let f = function(x){
                if (x.lt("1e10000")) return x 
                return x.log10().sqrt().sub(50).pow10().pow(200)
        }
                                        c += "幼苗 使 AX 乘以 " + format(f(tmp.pl.buyables[11].effect)) + br
                                        c += "叶 使 AX 乘以 " + format(f(tmp.pl.buyables[12].effect)) + br
                                        c += "干细胞 使 AX 乘以 " + format(f(tmp.pl.buyables[13].effect)) + br
                                        c += "花 使 AX 乘以 " + format(f(tmp.pl.buyables[21].effect)) + br

        return (a + br + b + br2 + c).replaceAll("AX", makeRed("A"))
}







