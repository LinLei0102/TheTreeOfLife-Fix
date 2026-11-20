const electronMass      = new Decimal(.511)             // MeV/c^2
const muonMass          = new Decimal(105.7)            // MeV/c^2
const tauonMass         = new Decimal(1780)             // MeV/c^2

const upQuarkMass       = new Decimal(1.9)              // MeV/c^2
const downQuarkMass     = new Decimal(4.4)              // MeV/c^2
const strangeQuarkMass  = new Decimal(87)               // MeV/c^2
const charmQuarkMass    = new Decimal(1320)             // MeV/c^2
const bottomQuarkMass   = new Decimal(4240)             // MeV/c^2
const topQuarkMass      = new Decimal(172700)           // MeV/c^2

const protonMass        = new Decimal(938.2)            // MeV/c^2
const neutronMass       = new Decimal(939.5)            // MeV/c^2
const dalton            = new Decimal(931.494)          // MeV/c^2 https://en.wikipedia.org/wiki/Dalton_(unit)

const MeVtoKg           = new Decimal(1.7827e-30)       // https://www.unitsconverters.com/en/Mev-To-Kg/Utu-3460-3509

const speedOfLight      = new Decimal(299792458)        // 299 792 458 m/s
const coulombConst      = new Decimal(9e9)              // N * m^2 * C^{-2}
const gravitationalConst= new Decimal(6.67430e-11)      // N * m^2 * kg^{-2}
const gravConstMeV      = new Decimal(2.12110e-70)      // N * m^2 * MeV^{-2} * c^4 gravitationalConst.times(MeVtoKg.pow(2))
const chargeToCoulomb   = new Decimal(6.24150e18)       // https://en.wikipedia.org/wiki/Coulomb
const coulombConstElm   = new Decimal(2.31027e-28)      // N * m^2 * e^{-2} coulombConst.div(chargeToCoulomb.pow(2))

const hydrogen1Mass     = new Decimal(1.0078)           // https://en.wikipedia.org/wiki/Isotopes_of_hydrogen
const hydrogen2Mass     = new Decimal(2.0141)

const helium3Mass       = new Decimal(3.0160)           // https://en.wikipedia.org/wiki/Isotopes_of_helium
const helium4Mass       = new Decimal(4.0026)

const lithium6Mass      = new Decimal(6.0151)           // https://en.wikipedia.org/wiki/Isotopes_of_lithium
const lithium7Mass      = new Decimal(7.0160)   

const beryllium9Mass    = new Decimal(9.0121)           // https://en.wikipedia.org/wiki/Isotopes_of_beryllium

const boron10Mass       = new Decimal(10.0129)          // https://en.wikipedia.org/wiki/Isotopes_of_boron
const boron11Mass       = new Decimal(11.0093)

const carbon12Mass      = new Decimal(12)               // https://en.wikipedia.org/wiki/Isotopes_of_carbon
const carbon13Mass      = new Decimal(13.0033)

const nitrogen14Mass    = new Decimal(14.0030)          // https://en.wikipedia.org/wiki/Isotopes_of_nitrogen
const nitrogen15Mass    = new Decimal(15.0001)

const oxygen16Mass      = new Decimal(15.9949)          // https://en.wikipedia.org/wiki/Isotopes_of_oxygen
const oxygen17Mass      = new Decimal(16.9991)
const oxygen18Mass      = new Decimal(17.9991)

const flourine19Mass    = new Decimal(18.9984)          // https://en.wikipedia.org/wiki/Isotopes_of_fluorine

const neon20Mass        = new Decimal(19.9924)          // https://en.wikipedia.org/wiki/Isotopes_of_neon
const neon21Mass        = new Decimal(20.9938)
const neon22Mass        = new Decimal(21.9913)

const sodium23Mass      = new Decimal(22.9897)          // https://en.wikipedia.org/wiki/Isotopes_of_sodium

const magnesium24Mass   = new Decimal(23.9850)          // https://en.wikipedia.org/wiki/Isotopes_of_magnesium
const magnesium25Mass   = new Decimal(24.9858)
const magnesium26Mass   = new Decimal(25.9825)

const aluminium27Mass   = new Decimal(26.9815)          // https://en.wikipedia.org/wiki/Isotopes_of_aluminium

const silicon28Mass     = new Decimal(27.9769)          // https://en.wikipedia.org/wiki/Isotopes_of_silicon
const silicon29Mass     = new Decimal(28.9764)
const silicon30Mass     = new Decimal(29.9737)

const phosphorus31Mass  = new Decimal(30.9737)          // https://en.wikipedia.org/wiki/Isotopes_of_phosphorus

const sulfur32Mass      = new Decimal(31.9720)          // https://en.wikipedia.org/wiki/Isotopes_of_sulfur
const sulfur33Mass      = new Decimal(32.9714)
const sulfur34Mass      = new Decimal(33.9678)
const sulfur36Mass      = new Decimal(35.9670)

const chlorine35Mass    = new Decimal(34.9688)          // https://en.wikipedia.org/wiki/Isotopes_of_chlorine
const chlorine37Mass    = new Decimal(36.9659)

const argon36Mass       = new Decimal(35.9675)          // https://en.wikipedia.org/wiki/Isotopes_of_argon
const argon38Mass       = new Decimal(37.9627)
const argon40Mass       = new Decimal(39.9623)



const chemAbbrev        = {
        "H":    "氢",
        "He":   "氦",
        "Li":   "锂",
        "Be":   "铍",
        "B":    "硼",
        "C":    "碳",
        "N":    "氮",
        "O":    "氧",
        "F":    "氟",
        "Ne":   "氖",
        "Na":   "钠",
        "Mg":   "镁",
        "Al":   "铝",
        "Si":   "硅",
        "P":    "磷",
        "S":    "硫",
        "Cl":   "氯",
        "Ar":   "氩",
}

const chemInitialEffects = {
        "H":    "每级从 <i>IttIa</i> 基础值减去 .01（上限 150）",
        "He":   "每级使研究员产出乘以 1+等级/30",
        "Li":   "每级从细胞核花费指数减去 .0001（上限 200）",
        "Be":   "每级<sup>.5</sup>从精通 VII 指数减去 .01（上限 100）",
        "B":    "每级从精通 III 基础值减去 .0007（上限 100）",
        "C":    "每级使研究员产出指数增加 .01（第一级会消除 -9）",
        "N":    "每 2 级获得一名化学家（仅此项基于历史最高值）",
        "O":    "每级<sup>.5</sup>使工人速度乘以 1 + 等级",
        "F":    "每级 log10(生态系统) 使人类产出倍增",
        "Ne":   "使研究员效果指数乘以 1 + 等级 / 8",
        "Na":   "精通 VI 指数为 .11，基础值为 1.7 - 等级 / 400",
        "Mg":   "使 <i>Hual</i> 基础值乘以 log2(2 + 等级)<sup>sqrt(等级)</sup>",
        "Al":   "每级从染色体花费指数减去 .0001（上限 100）",
        "Si":   "简化物种产出，并使其产出指数乘以 1 + 等级 / 1000",
        "P":    "给植物可购买项指数加上 1.2 - 等级/1e4，并移除其软上限（上限 100）",
        "S":    "每级使衰减每秒减少 .01%（上限 100）",
        "Cl":   "每级从 <i>Tulinwl</i> 基础值减去 .01（上限 100）",
        "Ar":   "每级从 <i>GmaptsaIwmte</i> 基础值减去 2（上限 100）",
}

function displayChemInitialEffect(s){
        return makeGreen(s) + " - " + chemInitialEffects[s]
}








