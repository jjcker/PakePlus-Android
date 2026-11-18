/* ============================================================
   data-materials.js — 角色掉落材料 / 特殊材料 / 剧情道具 / 矿石
   ============================================================ */

const DROP_MATERIALS = {
  "item_m101": {
    "id": "item_m101",
    "name": "兽毛",
    "type": "material",
    "level": 1,
    "price": 8,
    "words": [],
    "tags": [
      "tag004",
      "tag045"
    ],
    "desc": "野兽身上粗硬的毛发，可搓绳，也可填塞皮甲。"
  },
  "item_m102": {
    "id": "item_m102",
    "name": "小型兽皮",
    "type": "material",
    "level": 1,
    "price": 10,
    "words": [],
    "tags": [
      "tag004",
      "tag045"
    ],
    "desc": "小型兽类剥下的整张皮，面积不大，胜在好硝制。"
  },
  "item_m103": {
    "id": "item_m103",
    "name": "小型兽爪",
    "type": "material",
    "level": 1,
    "price": 12,
    "words": [],
    "tags": [
      "tag004",
      "tag047"
    ],
    "desc": "小型兽类的利爪，剥下来还能当钩子用。"
  },
  "item_m104": {
    "id": "item_m104",
    "name": "獠牙",
    "type": "material",
    "level": 3,
    "price": 14,
    "words": [],
    "tags": [
      "tag004",
      "tag046",
      "tag047"
    ],
    "desc": "野兽的獠牙，打磨后能做成短匕。"
  },
  "item_m105": {
    "id": "item_m105",
    "name": "兽皮",
    "type": "material",
    "level": 3,
    "price": 18,
    "words": [],
    "tags": [
      "tag004",
      "tag045"
    ],
    "desc": "成年野兽的皮，厚实耐磨，是皮甲的主料。"
  },
  "item_m106": {
    "id": "item_m106",
    "name": "甲壳",
    "type": "material",
    "level": 3,
    "price": 20,
    "words": [],
    "tags": [
      "tag004"
    ],
    "desc": "甲壳类生物的硬壳，敲碎后可以熬胶，也能做护片。"
  },
  "item_m107": {
    "id": "item_m107",
    "name": "蓝色碎片",
    "type": "material",
    "level": 3,
    "price": 22,
    "words": [],
    "tags": [
      "tag004",
      "tag041"
    ],
    "desc": "水属性妖精凝结的蓝色晶片，触手冰凉。"
  },
  "item_m108": {
    "id": "item_m108",
    "name": "丝线",
    "type": "material",
    "level": 4,
    "price": 12,
    "words": [],
    "tags": [
      "tag004"
    ],
    "desc": "蜘蛛类魔物吐出的丝线，韧性极强，扯不断。"
  },
  "item_m109": {
    "id": "item_m109",
    "name": "兽爪",
    "type": "material",
    "level": 4,
    "price": 18,
    "words": [],
    "tags": [
      "tag004",
      "tag047"
    ],
    "desc": "野兽的整只利爪，锋利依旧。"
  },
  "item_m110": {
    "id": "item_m110",
    "name": "鳞皮",
    "type": "material",
    "level": 4,
    "price": 25,
    "words": [],
    "tags": [
      "tag004",
      "tag045"
    ],
    "desc": "覆着细鳞的皮，防水耐磨，蛇与蜥蜴身上最常见。"
  },
  "item_m111": {
    "id": "item_m111",
    "name": "绿色碎片",
    "type": "material",
    "level": 4,
    "price": 22,
    "words": [],
    "tags": [
      "tag004",
      "tag041"
    ],
    "desc": "风属性妖精凝结的绿色晶片，轻得几乎没有重量。"
  },
  "item_m112": {
    "id": "item_m112",
    "name": "毒囊",
    "type": "material",
    "level": 7,
    "price": 30,
    "words": [],
    "tags": [
      "tag004",
      "tag061"
    ],
    "desc": "毒物储存毒液的囊袋，处理不当会出事。"
  },
  "item_m113": {
    "id": "item_m113",
    "name": "兽角",
    "type": "material",
    "level": 8,
    "price": 60,
    "words": [],
    "tags": [
      "tag004",
      "tag048"
    ],
    "desc": "野鹿褪下的角，可以入药，也能做弓臂。"
  },
  "item_m114": {
    "id": "item_m114",
    "name": "白色碎片",
    "type": "material",
    "level": 8,
    "price": 28,
    "words": [],
    "tags": [
      "tag004",
      "tag041"
    ],
    "desc": "光属性妖精凝结的白色晶片，在暗处微微发亮。"
  },
  "item_m115": {
    "id": "item_m115",
    "name": "黄色碎片",
    "type": "material",
    "level": 9,
    "price": 30,
    "words": [],
    "tags": [
      "tag004",
      "tag041"
    ],
    "desc": "土属性妖精凝结的黄色晶片，沉甸甸的。"
  },
  "item_m116": {
    "id": "item_m116",
    "name": "红色碎片",
    "type": "material",
    "level": 16,
    "price": 140,
    "words": [],
    "tags": [
      "tag004",
      "tag041"
    ],
    "desc": "火属性妖精凝结的红色晶片，握久了会发烫。"
  },
  "item_m117": {
    "id": "item_m117",
    "name": "兽羽",
    "type": "material",
    "level": 17,
    "price": 157,
    "words": [],
    "tags": [
      "tag004",
      "tag049"
    ],
    "desc": "大型猛禽的羽毛，翎管中空却坚挺。"
  },
  "item_m118": {
    "id": "item_m118",
    "name": "鸟喙",
    "type": "material",
    "level": 17,
    "price": 157,
    "words": [],
    "tags": [
      "tag004",
      "tag049"
    ],
    "desc": "猛禽的喙，角质坚硬，前端带钩。"
  },
  "item_m119": {
    "id": "item_m119",
    "name": "紫色碎片",
    "type": "material",
    "level": 23,
    "price": 520,
    "words": [],
    "tags": [
      "tag004",
      "tag041"
    ],
    "desc": "雷属性妖精凝结的紫色晶片，偶尔噼啪作响。"
  },
  "item_m120": {
    "id": "item_m120",
    "name": "龙之牙",
    "type": "material",
    "level": 26,
    "price": 840,
    "words": [],
    "tags": [
      "tag004",
      "tag050",
      "tag052"
    ],
    "desc": "巨龙脱落的牙，比精钢还硬，是顶级武器的材料。"
  },
  "item_m121": {
    "id": "item_m121",
    "name": "龙之骨",
    "type": "material",
    "level": 26,
    "price": 840,
    "words": [],
    "tags": [
      "tag004",
      "tag050",
      "tag047"
    ],
    "desc": "巨龙的骨，轻而坚韧，可锻可雕。"
  },
  "item_m122": {
    "id": "item_m122",
    "name": "黑色碎片",
    "type": "material",
    "level": 26,
    "price": 520,
    "words": [],
    "tags": [
      "tag004",
      "tag041"
    ],
    "desc": "暗属性妖精凝结的黑色晶片，看久了心里发慌。"
  }
};

const DROP_SPECIAL_MATERIALS = {
  "item_s001": {
    "id": "item_s001",
    "name": "迷幻孢子",
    "type": "material",
    "level": 4,
    "price": 90,
    "words": [],
    "rare": true,
    "tags": [
      "tag004"
    ],
    "desc": "蘑菇精散落的孢子，吸一口便会看见幻象。"
  },
  "item_s002": {
    "id": "item_s002",
    "name": "硬化晶石",
    "type": "material",
    "level": 5,
    "price": 140,
    "words": [],
    "rare": true,
    "tags": [
      "tag004",
      "tag041"
    ],
    "desc": "石像鬼体内凝结的晶石，硬得能崩坏铁锤。"
  },
  "item_s003": {
    "id": "item_s003",
    "name": "尖啸宝石",
    "type": "material",
    "level": 6,
    "price": 220,
    "words": [],
    "rare": true,
    "tags": [
      "tag004",
      "tag041"
    ],
    "desc": "鹰身女妖喉间的宝石，靠近时耳中全是尖啸。"
  },
  "item_s004": {
    "id": "item_s004",
    "name": "淬火獠牙",
    "type": "material",
    "level": 8,
    "price": 380,
    "words": [],
    "rare": true,
    "tags": [
      "tag004",
      "tag046",
      "tag057"
    ],
    "desc": "地狱犬的獠牙，常年被狱火烧得发亮。"
  },
  "item_s005": {
    "id": "item_s005",
    "name": "淬火兽爪",
    "type": "material",
    "level": 8,
    "price": 380,
    "words": [],
    "rare": true,
    "tags": [
      "tag004",
      "tag047",
      "tag057"
    ],
    "desc": "地狱犬的爪，落地便留下一道焦痕。"
  },
  "item_s006": {
    "id": "item_s006",
    "name": "再生种子",
    "type": "material",
    "level": 9,
    "price": 520,
    "words": [],
    "rare": true,
    "tags": [
      "tag004"
    ],
    "desc": "幼树苗的核心种子，埋进土里就能重新发芽。"
  },
  "item_s007": {
    "id": "item_s007",
    "name": "叶绿素",
    "type": "material",
    "level": 9,
    "price": 460,
    "words": [],
    "rare": true,
    "tags": [
      "tag004"
    ],
    "desc": "幼树苗体内浓稠的绿色汁液，蕴含旺盛生机。"
  },
  "item_s008": {
    "id": "item_s008",
    "name": "硬质皮甲",
    "type": "material",
    "level": 10,
    "price": 700,
    "words": [],
    "rare": true,
    "tags": [
      "tag004",
      "tag045"
    ],
    "desc": "地龙身上剥下的硬皮，比铁板还难割。"
  },
  "item_s009": {
    "id": "item_s009",
    "name": "魔气",
    "type": "material",
    "level": 10,
    "price": 800,
    "words": [],
    "rare": true,
    "tags": [
      "tag004",
      "tag063"
    ],
    "desc": "魔军身上缠绕的黑气，凝成一小团后有腐蚀性。"
  },
  "item_s010": {
    "id": "item_s010",
    "name": "魔抗鬃毛",
    "type": "material",
    "level": 14,
    "price": 1600,
    "words": [],
    "rare": true,
    "tags": [
      "tag004",
      "tag045"
    ],
    "desc": "蝎尾狮颈间的鬃毛，能卸去大半术法。"
  },
  "item_s011": {
    "id": "item_s011",
    "name": "硬质獠牙",
    "type": "material",
    "level": 15,
    "price": 1900,
    "words": [],
    "rare": true,
    "tags": [
      "tag004",
      "tag046"
    ],
    "desc": "铁甲野猪的獠牙，确实硬如生铁。"
  },
  "item_s012": {
    "id": "item_s012",
    "name": "幼龙之牙",
    "type": "material",
    "level": 15,
    "price": 2100,
    "words": [],
    "rare": true,
    "tags": [
      "tag004",
      "tag050",
      "tag052"
    ],
    "desc": "幼龙初生的牙，尚带稚气，却已锋利异常。"
  },
  "item_s013": {
    "id": "item_s013",
    "name": "发电器官",
    "type": "material",
    "level": 18,
    "price": 3300,
    "words": [],
    "rare": true,
    "tags": [
      "tag004",
      "tag059"
    ],
    "desc": "电鳗体内的发电器官，触碰会被电得手臂发麻。"
  },
  "item_s014": {
    "id": "item_s014",
    "name": "龙翼",
    "type": "material",
    "level": 20,
    "price": 4500,
    "words": [],
    "rare": true,
    "tags": [
      "tag004",
      "tag050"
    ],
    "desc": "双足飞龙的翼膜，轻薄却能兜住狂风。"
  },
  "item_s015": {
    "id": "item_s015",
    "name": "奇花",
    "type": "material",
    "level": 21,
    "price": 5200,
    "words": [],
    "rare": true,
    "tags": [
      "tag004"
    ],
    "desc": "花妖的本体之花，离土之后仍能开三日。"
  },
  "item_s016": {
    "id": "item_s016",
    "name": "墨囊",
    "type": "material",
    "level": 22,
    "price": 6000,
    "words": [],
    "rare": true,
    "tags": [
      "tag004"
    ],
    "desc": "巨型章鱼的墨囊，墨汁能遮住整片海面。"
  },
  "item_s017": {
    "id": "item_s017",
    "name": "章鱼皮",
    "type": "material",
    "level": 22,
    "price": 5800,
    "words": [],
    "rare": true,
    "tags": [
      "tag004",
      "tag045"
    ],
    "desc": "巨型章鱼的皮，柔韧且能随环境变色。"
  },
  "item_s018": {
    "id": "item_s018",
    "name": "尾环",
    "type": "material",
    "level": 24,
    "price": 7600,
    "words": [],
    "rare": true,
    "tags": [
      "tag004"
    ],
    "desc": "响尾蛇尾端的角质环，摇动时声如流水。"
  },
  "item_s019": {
    "id": "item_s019",
    "name": "独角兽之角",
    "type": "material",
    "level": 26,
    "price": 9800,
    "words": [],
    "rare": true,
    "tags": [
      "tag004",
      "tag048"
    ],
    "desc": "独角兽额前的角，据说能解百毒。"
  },
  "item_s020": {
    "id": "item_s020",
    "name": "凤凰之羽",
    "type": "material",
    "level": 27,
    "price": 11500,
    "words": [],
    "rare": true,
    "tags": [
      "tag004",
      "tag049",
      "tag057"
    ],
    "desc": "凤凰换下的羽毛，永不熄灭地泛着暖光。"
  },
  "item_s021": {
    "id": "item_s021",
    "name": "鳄皮",
    "type": "material",
    "level": 28,
    "price": 12500,
    "words": [],
    "rare": true,
    "tags": [
      "tag004",
      "tag045"
    ],
    "desc": "沼泽鳄的皮，鳞甲厚得刀枪难入。"
  },
  "item_s022": {
    "id": "item_s022",
    "name": "迅捷之羽",
    "type": "material",
    "level": 28,
    "price": 12000,
    "words": [],
    "rare": true,
    "tags": [
      "tag004",
      "tag049",
      "tag060"
    ],
    "desc": "狮鹫的飞羽，轻若无物，握在手里却带着风。"
  },
  "item_s023": {
    "id": "item_s023",
    "name": "血晶",
    "type": "material",
    "level": 29,
    "price": 14000,
    "words": [],
    "rare": true,
    "tags": [
      "tag004",
      "tag041",
      "tag065"
    ],
    "desc": "血狼体内凝成的血晶，映着血色微光。"
  },
  "item_s024": {
    "id": "item_s024",
    "name": "火晶",
    "type": "material",
    "level": 29,
    "price": 15000,
    "words": [],
    "rare": true,
    "tags": [
      "tag004",
      "tag041",
      "tag057"
    ],
    "desc": "炎魔核心的火晶，隔着一层皮都烫手。"
  },
  "item_s025": {
    "id": "item_s025",
    "name": "炎魔之冠",
    "type": "material",
    "level": 29,
    "price": 16000,
    "words": [],
    "rare": true,
    "tags": [
      "tag004",
      "tag057"
    ],
    "desc": "炎魔头顶的火焰之冠，是它力量的凭证。"
  },
  "item_s026": {
    "id": "item_s026",
    "name": "再造器官",
    "type": "material",
    "level": 30,
    "price": 17000,
    "words": [],
    "rare": true,
    "tags": [
      "tag004"
    ],
    "desc": "剧毒水母能不断再生的器官，软而温热。"
  },
  "item_s027": {
    "id": "item_s027",
    "name": "水晶",
    "type": "material",
    "level": 30,
    "price": 15000,
    "words": [],
    "rare": true,
    "tags": [
      "tag004",
      "tag043"
    ],
    "desc": "剧毒水母体内析出的水晶，清透如水。"
  },
  "item_s028": {
    "id": "item_s028",
    "name": "黄金之肤",
    "type": "material",
    "level": 30,
    "price": 18000,
    "words": [],
    "rare": true,
    "tags": [
      "tag004",
      "tag045"
    ],
    "desc": "黄金巨龙褪下的金色皮膜，轻软而华贵。"
  },
  "item_s029": {
    "id": "item_s029",
    "name": "毒刺",
    "type": "material",
    "level": 33,
    "price": 22000,
    "words": [],
    "rare": true,
    "tags": [
      "tag004",
      "tag061"
    ],
    "desc": "沙丘巨蝎尾端的毒刺，毒液能穿透护甲。"
  },
  "item_s030": {
    "id": "item_s030",
    "name": "鲨鱼皮",
    "type": "material",
    "level": 33,
    "price": 23000,
    "words": [],
    "rare": true,
    "tags": [
      "tag004",
      "tag045"
    ],
    "desc": "深海鲨的皮，粗粝得能当砂纸用。"
  },
  "item_s031": {
    "id": "item_s031",
    "name": "抗阻皮毛",
    "type": "material",
    "level": 34,
    "price": 25000,
    "words": [],
    "rare": true,
    "tags": [
      "tag004",
      "tag045"
    ],
    "desc": "棕熊王的皮毛，火烤水浸都不损分毫。"
  },
  "item_s032": {
    "id": "item_s032",
    "name": "魔气抗体",
    "type": "material",
    "level": 35,
    "price": 27000,
    "words": [],
    "rare": true,
    "tags": [
      "tag004",
      "tag063"
    ],
    "desc": "从魔军体内提炼的抗魔物质，能抵御魔气侵蚀。"
  },
  "item_s033": {
    "id": "item_s033",
    "name": "巨型獠牙",
    "type": "material",
    "level": 38,
    "price": 32000,
    "words": [],
    "rare": true,
    "tags": [
      "tag004",
      "tag046"
    ],
    "desc": "林中巨蟒的牙，一根就有半人高。"
  },
  "item_s034": {
    "id": "item_s034",
    "name": "神力锁",
    "type": "material",
    "level": 40,
    "price": 36000,
    "words": [],
    "rare": true,
    "tags": [
      "tag004",
      "tag041"
    ],
    "desc": "深海克拉肯体内的神力结晶，锁着深海的意志。"
  },
  "item_s035": {
    "id": "item_s035",
    "name": "硬质巨钳",
    "type": "material",
    "level": 42,
    "price": 42000,
    "words": [],
    "rare": true,
    "tags": [
      "tag004",
      "tag047"
    ],
    "desc": "蝎子王的巨钳，能夹断精钢。"
  }
};

const DROP_QUEST_ITEMS = {
  "item_q101": {
    "id": "item_q101",
    "name": "密探通令",
    "type": "other",
    "level": 16,
    "price": 0,
    "words": [],
    "noGift": true,
    "tags": [
      "tag005"
    ],
    "desc": "魔军密探随身携带的通令，凭它能在魔军营地通行。"
  },
  "item_q102": {
    "id": "item_q102",
    "name": "骑士徽章",
    "type": "other",
    "level": 24,
    "price": 0,
    "words": [],
    "noGift": true,
    "tags": [
      "tag005"
    ],
    "desc": "魔军骑士的徽章，是身份的证明。"
  },
  "item_q103": {
    "id": "item_q103",
    "name": "统帅印章",
    "type": "other",
    "level": 28,
    "price": 0,
    "words": [],
    "noGift": true,
    "tags": [
      "tag005"
    ],
    "desc": "魔军统帅的印章，可以拿来伪造军令。"
  },
  "item_q104": {
    "id": "item_q104",
    "name": "祭司宝典",
    "type": "other",
    "level": 35,
    "price": 0,
    "words": [],
    "noGift": true,
    "tags": [
      "tag005"
    ],
    "desc": "邪教祭司的宝典，记载着禁忌的仪式。"
  },
  "item_q111": {
    "id": "item_q111",
    "name": "威辛亚艾的首级",
    "type": "other",
    "level": 42,
    "price": 0,
    "words": [],
    "noGift": true,
    "tags": [
      "tag005"
    ],
    "desc": "魔将威辛亚艾的首级，需要用布裹好。"
  },
  "item_q112": {
    "id": "item_q112",
    "name": "太保密令1",
    "type": "other",
    "level": 42,
    "price": 0,
    "words": [],
    "noGift": true,
    "tags": [
      "tag005"
    ],
    "desc": "太保发出的密令之一，字迹被刻意写得潦草。"
  },
  "item_q113": {
    "id": "item_q113",
    "name": "贡的首级",
    "type": "other",
    "level": 43,
    "price": 0,
    "words": [],
    "noGift": true,
    "tags": [
      "tag005"
    ],
    "desc": "魔将贡的首级，双目仍然睁着。"
  },
  "item_q114": {
    "id": "item_q114",
    "name": "太保密令2",
    "type": "other",
    "level": 43,
    "price": 0,
    "words": [],
    "noGift": true,
    "tags": [
      "tag005"
    ],
    "desc": "太保发出的密令之二，封口处有暗记。"
  },
  "item_q115": {
    "id": "item_q115",
    "name": "魔子的首级",
    "type": "other",
    "level": 45,
    "price": 0,
    "words": [],
    "noGift": true,
    "tags": [
      "tag005"
    ],
    "desc": "魔子的首级，即使离体仍散发着压迫感。"
  }
};

const ORE_MATERIALS = {
  "item_o101": {
    "id": "item_o101",
    "name": "铁矿石",
    "type": "material",
    "level": 1,
    "price": 20,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag021"
    ],
    "desc": "常见的铁矿石，能提炼出生铁。"
  },
  "item_o102": {
    "id": "item_o102",
    "name": "精铁矿",
    "type": "material",
    "level": 10,
    "price": 100,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag022"
    ],
    "desc": "含铁量较高的矿石，可炼精钢。"
  },
  "item_o103": {
    "id": "item_o103",
    "name": "玄铁矿",
    "type": "material",
    "level": 20,
    "price": 600,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag024"
    ],
    "desc": "深黑色的矿石，玄铁的原料。"
  },
  "item_o104": {
    "id": "item_o104",
    "name": "寒铁矿",
    "type": "material",
    "level": 30,
    "price": 2500,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag026"
    ],
    "desc": "带着寒气的铁矿，适合锻造寒铁。"
  },
  "item_o105": {
    "id": "item_o105",
    "name": "陨铁矿",
    "type": "material",
    "level": 40,
    "price": 10000,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag027"
    ],
    "desc": "天外落下的矿石，沉重而稀有。"
  },
  "item_o106": {
    "id": "item_o106",
    "name": "深渊矿",
    "type": "material",
    "level": 50,
    "price": 30000,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag067"
    ],
    "desc": "深渊岩层里采出的黑矿，带着微弱暗光。"
  },
  "item_o111": {
    "id": "item_o111",
    "name": "铜精-攻",
    "type": "material",
    "level": 5,
    "price": 150,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag015"
    ],
    "desc": "铜精矿石，升阶时追加攻类数值词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "phys_atk_up",
        "value": 3
      }
    }
  },
  "item_o112": {
    "id": "item_o112",
    "name": "铜精-法",
    "type": "material",
    "level": 5,
    "price": 150,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag015"
    ],
    "desc": "铜精矿石，升阶时追加法类数值词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "magic_atk_up",
        "value": 3
      }
    }
  },
  "item_o113": {
    "id": "item_o113",
    "name": "铜精-防",
    "type": "material",
    "level": 5,
    "price": 150,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag015"
    ],
    "desc": "铜精矿石，升阶时追加防类数值词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "def_up",
        "value": 2
      }
    }
  },
  "item_o114": {
    "id": "item_o114",
    "name": "铜精-生",
    "type": "material",
    "level": 5,
    "price": 150,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag015"
    ],
    "desc": "铜精矿石，升阶时追加生类数值词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "maxhp_up",
        "value": 20
      }
    }
  },
  "item_o115": {
    "id": "item_o115",
    "name": "铜精-速",
    "type": "material",
    "level": 5,
    "price": 150,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag015"
    ],
    "desc": "铜精矿石，升阶时追加速类数值词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "spd_up",
        "value": 1
      }
    }
  },
  "item_o116": {
    "id": "item_o116",
    "name": "铜精-暴",
    "type": "material",
    "level": 5,
    "price": 150,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag015"
    ],
    "desc": "铜精矿石，升阶时追加暴类数值词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "crit_up",
        "value": 0.02
      }
    }
  },
  "item_o117": {
    "id": "item_o117",
    "name": "铜精-命",
    "type": "material",
    "level": 5,
    "price": 400,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag020"
    ],
    "rare": true,
    "desc": "铜精矿石，升阶时追加命类机制词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "hit_up",
        "value": 0.03
      }
    }
  },
  "item_o118": {
    "id": "item_o118",
    "name": "铜精-闪",
    "type": "material",
    "level": 5,
    "price": 400,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag020"
    ],
    "rare": true,
    "desc": "铜精矿石，升阶时追加闪类机制词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "dodge",
        "value": 0.02
      }
    }
  },
  "item_o119": {
    "id": "item_o119",
    "name": "铜精-首",
    "type": "material",
    "level": 5,
    "price": 400,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag020"
    ],
    "rare": true,
    "desc": "铜精矿石，升阶时追加首类机制词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "first_strike",
        "value": 8
      }
    }
  },
  "item_o120": {
    "id": "item_o120",
    "name": "铜精-低",
    "type": "material",
    "level": 5,
    "price": 400,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag020"
    ],
    "rare": true,
    "desc": "铜精矿石，升阶时追加低类机制词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "low_hp_power",
        "value": 10
      }
    }
  },
  "item_o121": {
    "id": "item_o121",
    "name": "银精-攻",
    "type": "material",
    "level": 15,
    "price": 800,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag015"
    ],
    "desc": "银精矿石，升阶时追加攻类数值词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "phys_atk_up",
        "value": 6
      }
    }
  },
  "item_o122": {
    "id": "item_o122",
    "name": "银精-法",
    "type": "material",
    "level": 15,
    "price": 800,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag015"
    ],
    "desc": "银精矿石，升阶时追加法类数值词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "magic_atk_up",
        "value": 6
      }
    }
  },
  "item_o123": {
    "id": "item_o123",
    "name": "银精-防",
    "type": "material",
    "level": 15,
    "price": 800,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag015"
    ],
    "desc": "银精矿石，升阶时追加防类数值词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "def_up",
        "value": 4
      }
    }
  },
  "item_o124": {
    "id": "item_o124",
    "name": "银精-生",
    "type": "material",
    "level": 15,
    "price": 800,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag015"
    ],
    "desc": "银精矿石，升阶时追加生类数值词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "maxhp_up",
        "value": 40
      }
    }
  },
  "item_o125": {
    "id": "item_o125",
    "name": "银精-速",
    "type": "material",
    "level": 15,
    "price": 800,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag015"
    ],
    "desc": "银精矿石，升阶时追加速类数值词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "spd_up",
        "value": 2
      }
    }
  },
  "item_o126": {
    "id": "item_o126",
    "name": "银精-暴",
    "type": "material",
    "level": 15,
    "price": 800,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag015"
    ],
    "desc": "银精矿石，升阶时追加暴类数值词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "crit_up",
        "value": 0.03
      }
    }
  },
  "item_o127": {
    "id": "item_o127",
    "name": "银精-吸",
    "type": "material",
    "level": 15,
    "price": 2000,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag020"
    ],
    "rare": true,
    "desc": "银精矿石，升阶时追加吸类机制词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "hp_drain_pct",
        "value": 5
      }
    }
  },
  "item_o128": {
    "id": "item_o128",
    "name": "银精-反",
    "type": "material",
    "level": 15,
    "price": 2000,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag020"
    ],
    "rare": true,
    "desc": "银精矿石，升阶时追加反类机制词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "counter_start",
        "value": 1
      }
    }
  },
  "item_o129": {
    "id": "item_o129",
    "name": "银精-毒",
    "type": "material",
    "level": 15,
    "price": 2000,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag020"
    ],
    "rare": true,
    "desc": "银精矿石，升阶时追加毒类机制词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "poison_on_hit",
        "value": 3
      }
    }
  },
  "item_o130": {
    "id": "item_o130",
    "name": "银精-烧",
    "type": "material",
    "level": 15,
    "price": 2000,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag020"
    ],
    "rare": true,
    "desc": "银精矿石，升阶时追加烧类机制词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "burn_on_hit",
        "value": 3
      }
    }
  },
  "item_o131": {
    "id": "item_o131",
    "name": "秘银-攻",
    "type": "material",
    "level": 30,
    "price": 4000,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag015"
    ],
    "desc": "秘银矿石，升阶时追加攻类数值词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "phys_atk_up",
        "value": 10
      }
    }
  },
  "item_o132": {
    "id": "item_o132",
    "name": "秘银-法",
    "type": "material",
    "level": 30,
    "price": 4000,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag015"
    ],
    "desc": "秘银矿石，升阶时追加法类数值词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "magic_atk_up",
        "value": 10
      }
    }
  },
  "item_o133": {
    "id": "item_o133",
    "name": "秘银-防",
    "type": "material",
    "level": 30,
    "price": 4000,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag015"
    ],
    "desc": "秘银矿石，升阶时追加防类数值词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "def_up",
        "value": 7
      }
    }
  },
  "item_o134": {
    "id": "item_o134",
    "name": "秘银-生",
    "type": "material",
    "level": 30,
    "price": 4000,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag015"
    ],
    "desc": "秘银矿石，升阶时追加生类数值词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "maxhp_up",
        "value": 70
      }
    }
  },
  "item_o135": {
    "id": "item_o135",
    "name": "秘银-速",
    "type": "material",
    "level": 30,
    "price": 4000,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag015"
    ],
    "desc": "秘银矿石，升阶时追加速类数值词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "spd_up",
        "value": 3
      }
    }
  },
  "item_o136": {
    "id": "item_o136",
    "name": "秘银-暴",
    "type": "material",
    "level": 30,
    "price": 4000,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag015"
    ],
    "desc": "秘银矿石，升阶时追加暴类数值词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "crit_up",
        "value": 0.04
      }
    }
  },
  "item_o137": {
    "id": "item_o137",
    "name": "秘银-穿",
    "type": "material",
    "level": 30,
    "price": 10000,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag020"
    ],
    "rare": true,
    "desc": "秘银矿石，升阶时追加穿类机制词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "ignore_def",
        "value": 1
      }
    }
  },
  "item_o138": {
    "id": "item_o138",
    "name": "秘银-斩",
    "type": "material",
    "level": 30,
    "price": 10000,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag020"
    ],
    "rare": true,
    "desc": "秘银矿石，升阶时追加斩类机制词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "execute_below",
        "value": 8
      }
    }
  },
  "item_o139": {
    "id": "item_o139",
    "name": "秘银-连",
    "type": "material",
    "level": 30,
    "price": 10000,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag020"
    ],
    "rare": true,
    "desc": "秘银矿石，升阶时追加连类机制词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "multi_hit",
        "value": 1
      }
    }
  },
  "item_o140": {
    "id": "item_o140",
    "name": "秘银-溅",
    "type": "material",
    "level": 30,
    "price": 10000,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag020"
    ],
    "rare": true,
    "desc": "秘银矿石，升阶时追加溅类机制词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "splash_pct",
        "value": 15
      }
    }
  },
  "item_o141": {
    "id": "item_o141",
    "name": "星辉-攻",
    "type": "material",
    "level": 45,
    "price": 15000,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag015"
    ],
    "desc": "星辉矿石，升阶时追加攻类数值词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "phys_atk_up",
        "value": 15
      }
    }
  },
  "item_o142": {
    "id": "item_o142",
    "name": "星辉-法",
    "type": "material",
    "level": 45,
    "price": 15000,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag015"
    ],
    "desc": "星辉矿石，升阶时追加法类数值词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "magic_atk_up",
        "value": 15
      }
    }
  },
  "item_o143": {
    "id": "item_o143",
    "name": "星辉-防",
    "type": "material",
    "level": 45,
    "price": 15000,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag015"
    ],
    "desc": "星辉矿石，升阶时追加防类数值词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "def_up",
        "value": 10
      }
    }
  },
  "item_o144": {
    "id": "item_o144",
    "name": "星辉-生",
    "type": "material",
    "level": 45,
    "price": 15000,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag015"
    ],
    "desc": "星辉矿石，升阶时追加生类数值词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "maxhp_up",
        "value": 110
      }
    }
  },
  "item_o145": {
    "id": "item_o145",
    "name": "星辉-速",
    "type": "material",
    "level": 45,
    "price": 15000,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag015"
    ],
    "desc": "星辉矿石，升阶时追加速类数值词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "spd_up",
        "value": 4
      }
    }
  },
  "item_o146": {
    "id": "item_o146",
    "name": "星辉-暴",
    "type": "material",
    "level": 45,
    "price": 15000,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag015"
    ],
    "desc": "星辉矿石，升阶时追加暴类数值词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "crit_up",
        "value": 0.05
      }
    }
  },
  "item_o147": {
    "id": "item_o147",
    "name": "星辉-中",
    "type": "material",
    "level": 45,
    "price": 35000,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag020"
    ],
    "rare": true,
    "desc": "星辉矿石，升阶时追加中类机制词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "sure_hit",
        "value": 1
      }
    }
  },
  "item_o148": {
    "id": "item_o148",
    "name": "星辉-魔",
    "type": "material",
    "level": 45,
    "price": 35000,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag020"
    ],
    "rare": true,
    "desc": "星辉矿石，升阶时追加魔类机制词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "dmg_vs_demon_pct",
        "value": 15
      }
    }
  },
  "item_o149": {
    "id": "item_o149",
    "name": "星辉-爆",
    "type": "material",
    "level": 45,
    "price": 35000,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag020"
    ],
    "rare": true,
    "desc": "星辉矿石，升阶时追加爆类机制词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "critdmg_up",
        "value": 0.2
      }
    }
  },
  "item_o150": {
    "id": "item_o150",
    "name": "星辉-伤",
    "type": "material",
    "level": 45,
    "price": 35000,
    "words": [],
    "tags": [
      "tag004",
      "tag044",
      "tag020"
    ],
    "rare": true,
    "desc": "星辉矿石，升阶时追加伤类机制词条。",
    "func": {
      "kind": "word",
      "word": {
        "type": "dmg_up_pct",
        "value": 8
      }
    }
  }
};

/* 全部并入统一物品表 */
Object.assign(EQUIPS, DROP_MATERIALS, DROP_SPECIAL_MATERIALS, DROP_QUEST_ITEMS, ORE_MATERIALS);

/* ---- 掉落表用到的“名字 → 物品 id”映射 ---- */
const DROP_NAME_TO_ID = {};
[DROP_MATERIALS,DROP_SPECIAL_MATERIALS,DROP_QUEST_ITEMS,ORE_MATERIALS].forEach(lib => {
  Object.keys(lib).forEach(id => { DROP_NAME_TO_ID[lib[id].name] = id; });
});
DROP_NAME_TO_ID['红药水（小）'] = 'item_c001';
DROP_NAME_TO_ID['蓝药水（小）'] = 'item_c002';
DROP_NAME_TO_ID['红药水（中）'] = 'item_c003';
DROP_NAME_TO_ID['蓝药水（中）'] = 'item_c004';
DROP_NAME_TO_ID['红药水（大）'] = 'item_c005';
DROP_NAME_TO_ID['蓝药水（大）'] = 'item_c006';
DROP_NAME_TO_ID['红药水（特）'] = 'item_c007';
DROP_NAME_TO_ID['蓝药水（特）'] = 'item_c008';
DROP_NAME_TO_ID['红药水（极）'] = 'item_c009';
DROP_NAME_TO_ID['蓝药水（极）'] = 'item_c010';
DROP_NAME_TO_ID['赤露'] = 'item_c011';
DROP_NAME_TO_ID['蓝露'] = 'item_c012';
DROP_NAME_TO_ID['血莓酿'] = 'item_c013';
DROP_NAME_TO_ID['月泉'] = 'item_c014';
DROP_NAME_TO_ID['绯红药剂'] = 'item_c015';
DROP_NAME_TO_ID['星辉药剂'] = 'item_c016';
DROP_NAME_TO_ID['龙血露'] = 'item_c017';
DROP_NAME_TO_ID['秘银露'] = 'item_c018';
DROP_NAME_TO_ID['生命之露'] = 'item_c019';
DROP_NAME_TO_ID['灵海露'] = 'item_c020';
DROP_NAME_TO_ID['解毒药'] = 'item_c021';
DROP_NAME_TO_ID['灭火药'] = 'item_c022';
DROP_NAME_TO_ID['止血药'] = 'item_c023';
DROP_NAME_TO_ID['解默药'] = 'item_c024';
DROP_NAME_TO_ID['融冰药'] = 'item_c025';
DROP_NAME_TO_ID['清心药'] = 'item_c026';
DROP_NAME_TO_ID['醒神药'] = 'item_c027';
DROP_NAME_TO_ID['破石药'] = 'item_c028';
DROP_NAME_TO_ID['去印记药'] = 'item_c029';
DROP_NAME_TO_ID['解毒药·血'] = 'item_c030';
DROP_NAME_TO_ID['解毒药·灵'] = 'item_c039';
DROP_NAME_TO_ID['解毒药·双'] = 'item_c048';
DROP_NAME_TO_ID['灭火药·血'] = 'item_c031';
DROP_NAME_TO_ID['灭火药·灵'] = 'item_c040';
DROP_NAME_TO_ID['灭火药·双'] = 'item_c049';
DROP_NAME_TO_ID['止血药·血'] = 'item_c032';
DROP_NAME_TO_ID['止血药·灵'] = 'item_c041';
DROP_NAME_TO_ID['止血药·双'] = 'item_c050';
DROP_NAME_TO_ID['解默药·血'] = 'item_c033';
DROP_NAME_TO_ID['解默药·灵'] = 'item_c042';
DROP_NAME_TO_ID['解默药·双'] = 'item_c051';
DROP_NAME_TO_ID['融冰药·血'] = 'item_c034';
DROP_NAME_TO_ID['融冰药·灵'] = 'item_c043';
DROP_NAME_TO_ID['融冰药·双'] = 'item_c052';
DROP_NAME_TO_ID['清心药·血'] = 'item_c035';
DROP_NAME_TO_ID['清心药·灵'] = 'item_c044';
DROP_NAME_TO_ID['清心药·双'] = 'item_c053';
DROP_NAME_TO_ID['醒神药·血'] = 'item_c036';
DROP_NAME_TO_ID['醒神药·灵'] = 'item_c045';
DROP_NAME_TO_ID['醒神药·双'] = 'item_c054';
DROP_NAME_TO_ID['破石药·血'] = 'item_c037';
DROP_NAME_TO_ID['破石药·灵'] = 'item_c046';
DROP_NAME_TO_ID['破石药·双'] = 'item_c055';
DROP_NAME_TO_ID['去印记药·血'] = 'item_c038';
DROP_NAME_TO_ID['去印记药·灵'] = 'item_c047';
DROP_NAME_TO_ID['去印记药·双'] = 'item_c056';
