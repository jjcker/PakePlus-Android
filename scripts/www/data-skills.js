/* 词条中文名统一由 data-effects.js 的 EFFECT_ATOMS 派生，不再手写第二份 */
const SKILL_EFF_LABEL = effectLabelMap('skill');

/* 技能等级：职业技能 6 级（Lv.1~5 + MAX），非职业技能 4 级（Lv.1~3 + MAX）。
   最后一级的 lv 字段固定为字符串 "max"，战斗与编辑器统一显示为 MAX。
   职业被动技能不设等级。 */
const PLAYER_CLASSES = ["战士","法师","巡警","杀手","疗愈师","阵法师","铁匠","商人","炼金术师"];

const SKILLS = {
  "skill_warrior01": {
    "id": "skill_warrior01",
    "name": "重斩",
    "category": "职业",
    "tier": "basic",
    "classLimit": "战士",
    "tags": [
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 30,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 6,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 32,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 8,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 34,
            "target": "enemy_front_single"
          },
          {
            "type": "def_down_pct",
            "value": 22,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 10,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 36,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 12,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 60,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 100,
            "target": "enemy_front_single"
          },
          {
            "type": "execute",
            "value": 0.1,
            "target": "enemy_front_single",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_warrior02": {
    "id": "skill_warrior02",
    "name": "旋风斩",
    "category": "职业",
    "tier": "basic",
    "classLimit": "战士",
    "tags": [
      "aoe",
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 17,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 18,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 14,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 19,
            "target": "enemy_all"
          },
          {
            "type": "def_down_pct",
            "value": 18,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 20,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 38,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 55,
            "target": "enemy_all"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_warrior03": {
    "id": "skill_warrior03",
    "name": "盾击",
    "category": "职业",
    "tier": "basic",
    "classLimit": "战士",
    "tags": [
      "control",
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 26,
            "target": "enemy_front_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 27,
            "target": "enemy_front_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 14,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 29,
            "target": "enemy_front_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          },
          {
            "type": "spd_down",
            "value": 6,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 30,
            "target": "enemy_front_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 55,
            "target": "enemy_front_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 85,
            "target": "enemy_front_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          },
          {
            "type": "confusion",
            "value": 0.4,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_warrior04": {
    "id": "skill_warrior04",
    "name": "冲锋",
    "category": "职业",
    "tier": "basic",
    "classLimit": "战士",
    "tags": [
      "fast",
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 10,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 28,
            "target": "enemy_front_single"
          },
          {
            "type": "spd_up",
            "value": 3,
            "target": "self",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 12,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 29,
            "target": "enemy_front_single"
          },
          {
            "type": "spd_up",
            "value": 5,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 14,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 31,
            "target": "enemy_front_single"
          },
          {
            "type": "spd_up",
            "value": 8,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 32,
            "target": "enemy_front_single"
          },
          {
            "type": "spd_up",
            "value": 11,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 58,
            "target": "enemy_front_single"
          },
          {
            "type": "spd_up",
            "value": 15,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 90,
            "target": "enemy_front_single"
          },
          {
            "type": "spd_up",
            "value": 15,
            "target": "self",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 22,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_warrior05": {
    "id": "skill_warrior05",
    "name": "战吼",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "战士",
    "tags": [
      "buff",
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 15,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 25,
            "target": "self",
            "duration": 4
          },
          {
            "type": "taunt",
            "value": 1,
            "target": "self",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 16,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 90,
            "target": "enemy_all"
          },
          {
            "type": "hp_heal",
            "value": 120,
            "target": "ally_all"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 50,
            "target": "self",
            "duration": 3
          },
          {
            "type": "spd_up",
            "value": 7,
            "target": "ally_all",
            "duration": 2
          },
          {
            "type": "taunt",
            "value": 1,
            "target": "self",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 18,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 98,
            "target": "enemy_all"
          },
          {
            "type": "hp_heal",
            "value": 132,
            "target": "ally_all"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 69,
            "target": "self",
            "duration": 3
          },
          {
            "type": "taunt",
            "value": 1,
            "target": "self",
            "duration": 2
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 20,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 114,
            "target": "enemy_all"
          },
          {
            "type": "hp_heal",
            "value": 150,
            "target": "ally_all"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 90,
            "target": "self",
            "duration": 3
          },
          {
            "type": "taunt",
            "value": 1,
            "target": "self",
            "duration": 2
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 136,
            "target": "enemy_all"
          },
          {
            "type": "hp_heal",
            "value": 180,
            "target": "ally_all"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 90,
            "target": "self",
            "duration": 3
          },
          {
            "type": "phys_atk_up_pct",
            "value": 19,
            "target": "ally_all",
            "duration": 2
          },
          {
            "type": "taunt",
            "value": 1,
            "target": "self",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_warrior06": {
    "id": "skill_warrior06",
    "name": "钢铁壁垒",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "战士",
    "tags": [
      "defense",
      "buff"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 30,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 60,
            "target": "self",
            "duration": 4
          },
          {
            "type": "def_up",
            "value": 1,
            "target": "ally_all"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 16,
        "proficiency": 180,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 120,
            "target": "self",
            "duration": 5
          },
          {
            "type": "def_up",
            "value": 2,
            "target": "ally_all"
          },
          {
            "type": "guard",
            "value": 1,
            "target": "ally_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 18,
        "proficiency": 400,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 120,
            "target": "self",
            "duration": 5
          },
          {
            "type": "def_up",
            "value": 3,
            "target": "ally_all"
          },
          {
            "type": "guard",
            "value": 1,
            "target": "ally_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 20,
        "proficiency": 750,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 120,
            "target": "self",
            "duration": 5
          },
          {
            "type": "def_up",
            "value": 4,
            "target": "ally_all"
          },
          {
            "type": "guard",
            "value": 1,
            "target": "ally_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 120,
            "target": "self",
            "duration": 5
          },
          {
            "type": "def_up",
            "value": 4,
            "target": "ally_all"
          },
          {
            "type": "def_up",
            "value": 2,
            "target": "self"
          },
          {
            "type": "guard",
            "value": 1,
            "target": "ally_single",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_warrior07": {
    "id": "skill_warrior07",
    "name": "破甲斩",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "战士",
    "tags": [
      "heavy",
      "pierce"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 14,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 150,
            "target": "enemy_front_single"
          },
          {
            "type": "true_dmg",
            "value": 100,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 16,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 158,
            "target": "enemy_front_single"
          },
          {
            "type": "true_dmg",
            "value": 124,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 18,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 165,
            "target": "enemy_front_single"
          },
          {
            "type": "true_dmg",
            "value": 135,
            "target": "enemy_front_single"
          },
          {
            "type": "true_dmg",
            "value": 36,
            "target": "enemy_all"
          },
          {
            "type": "def_down_pct",
            "value": 30,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 20,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 172,
            "target": "enemy_front_single"
          },
          {
            "type": "true_dmg",
            "value": 140,
            "target": "enemy_front_single"
          },
          {
            "type": "true_dmg",
            "value": 38,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 22,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 220,
            "target": "enemy_front_single"
          },
          {
            "type": "true_dmg",
            "value": 179,
            "target": "enemy_front_single"
          },
          {
            "type": "true_dmg",
            "value": 47,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 300,
            "target": "enemy_front_single"
          },
          {
            "type": "true_dmg",
            "value": 244,
            "target": "enemy_front_single",
            "duration": 0
          },
          {
            "type": "true_dmg",
            "value": 64,
            "target": "enemy_all"
          }
        ]
      }
    ]
  },
  "skill_warrior08": {
    "id": "skill_warrior08",
    "name": "血怒",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "战士",
    "tags": [
      "burst",
      "sustain"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 650,
            "target": "enemy_front_single"
          },
          {
            "type": "hp_cost",
            "value": 15,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 40,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 683,
            "target": "enemy_front_single"
          },
          {
            "type": "hp_cost",
            "value": 20,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 45,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 715,
            "target": "enemy_front_single"
          },
          {
            "type": "hp_cost",
            "value": 25,
            "target": "self"
          },
          {
            "type": "def_down_pct",
            "value": 37,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 50,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 748,
            "target": "enemy_front_single"
          },
          {
            "type": "hp_cost",
            "value": 30,
            "target": "self"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 55,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 850,
            "target": "enemy_front_single"
          },
          {
            "type": "hp_cost",
            "value": 35,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 60,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 1000,
            "target": "enemy_front_single"
          },
          {
            "type": "hp_cost",
            "value": 40,
            "target": "self"
          },
          {
            "type": "execute",
            "value": 0.17,
            "target": "enemy_front_single",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_warrior09": {
    "id": "skill_warrior09",
    "name": "战神降临",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "战士",
    "tags": [
      "buff",
      "burst"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 40,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 650,
            "target": "enemy_front_single"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 20,
            "target": "self",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 45,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 700,
            "target": "enemy_front_single"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 30,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 50,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 600,
            "target": "enemy_all"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 50,
            "target": "self",
            "duration": 3
          },
          {
            "type": "spd_up",
            "value": 8,
            "target": "ally_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 55,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 650,
            "target": "enemy_all"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 69,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 60,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 750,
            "target": "enemy_all"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 90,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 65,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 850,
            "target": "enemy_all"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 90,
            "target": "self",
            "duration": 3
          },
          {
            "type": "phys_atk_up_pct",
            "value": 24,
            "target": "ally_all",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_warrior10": {
    "id": "skill_warrior10",
    "name": "弑神之击",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "战士",
    "tags": [
      "burst",
      "execute"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 45,
        "proficiency": 0,
        "effects": [
          {
            "type": "sure_hit",
            "value": 1,
            "target": "self"
          },
          {
            "type": "ignore_def",
            "value": 1,
            "target": "self"
          },
          {
            "type": "phys_dmg",
            "value": 600,
            "target": "enemy_all"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 25,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 50,
        "proficiency": 50,
        "effects": [
          {
            "type": "sure_hit",
            "value": 1,
            "target": "self"
          },
          {
            "type": "ignore_def",
            "value": 1,
            "target": "self"
          },
          {
            "type": "phys_dmg",
            "value": 630,
            "target": "enemy_all"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 43,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 55,
        "proficiency": 180,
        "effects": [
          {
            "type": "sure_hit",
            "value": 1,
            "target": "self"
          },
          {
            "type": "ignore_def",
            "value": 1,
            "target": "self"
          },
          {
            "type": "phys_dmg",
            "value": 660,
            "target": "enemy_all"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 60,
            "target": "self",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 37,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 60,
        "proficiency": 400,
        "effects": [
          {
            "type": "sure_hit",
            "value": 1,
            "target": "self"
          },
          {
            "type": "ignore_def",
            "value": 1,
            "target": "self"
          },
          {
            "type": "phys_dmg",
            "value": 690,
            "target": "enemy_all"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 83,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 65,
        "proficiency": 750,
        "effects": [
          {
            "type": "sure_hit",
            "value": 1,
            "target": "self"
          },
          {
            "type": "ignore_def",
            "value": 1,
            "target": "self"
          },
          {
            "type": "phys_dmg",
            "value": 800,
            "target": "enemy_all"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 90,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 65,
        "proficiency": 1000,
        "effects": [
          {
            "type": "sure_hit",
            "value": 1,
            "target": "self"
          },
          {
            "type": "ignore_def",
            "value": 1,
            "target": "self"
          },
          {
            "type": "phys_dmg",
            "value": 950,
            "target": "enemy_all"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 90,
            "target": "self",
            "duration": 3
          },
          {
            "type": "execute",
            "value": 0.24,
            "target": "enemy_all",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_mage01": {
    "id": "skill_mage01",
    "name": "火花术",
    "category": "职业",
    "tier": "basic",
    "classLimit": "法师",
    "tags": [
      "burst",
      "dot"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 32,
            "target": "single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 6,
        "proficiency": 50,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 34,
            "target": "single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 8,
        "proficiency": 180,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 35,
            "target": "single"
          },
          {
            "type": "burn",
            "value": 8,
            "target": "single",
            "duration": 2
          },
          {
            "type": "def_down_pct",
            "value": 22,
            "target": "single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 10,
        "proficiency": 400,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 37,
            "target": "single"
          },
          {
            "type": "burn",
            "value": 11,
            "target": "single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 12,
        "proficiency": 750,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 62,
            "target": "single"
          },
          {
            "type": "burn",
            "value": 15,
            "target": "single",
            "duration": 2
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 100,
            "target": "single"
          },
          {
            "type": "burn",
            "value": 17,
            "target": "single",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_mage02": {
    "id": "skill_mage02",
    "name": "冰霜新星",
    "category": "职业",
    "tier": "basic",
    "classLimit": "法师",
    "tags": [
      "aoe",
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 18,
            "target": "enemy_all"
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 19,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 2,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 14,
        "proficiency": 180,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 20,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 4,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 18,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 21,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 6,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 36,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 7,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 55,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 8,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_mage03": {
    "id": "skill_mage03",
    "name": "雷击",
    "category": "职业",
    "tier": "basic",
    "classLimit": "法师",
    "tags": [
      "burst",
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 14,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 36,
            "target": "single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 38,
            "target": "single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 14,
        "proficiency": 180,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 40,
            "target": "single"
          },
          {
            "type": "stun",
            "value": 1,
            "target": "single",
            "duration": 1
          },
          {
            "type": "def_down_pct",
            "value": 22,
            "target": "single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 41,
            "target": "single"
          },
          {
            "type": "stun",
            "value": 1,
            "target": "single",
            "duration": 1
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 68,
            "target": "single"
          },
          {
            "type": "stun",
            "value": 1,
            "target": "single",
            "duration": 1
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 105,
            "target": "single"
          },
          {
            "type": "stun",
            "value": 1,
            "target": "single",
            "duration": 1
          }
        ]
      }
    ]
  },
  "skill_mage04": {
    "id": "skill_mage04",
    "name": "烈焰风暴",
    "category": "职业",
    "tier": "basic",
    "classLimit": "法师",
    "tags": [
      "aoe",
      "dot"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 14,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 20,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 21,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 5,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 14,
        "proficiency": 180,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 22,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 12,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 18,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 23,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 17,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 38,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 22,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 60,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 25,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_mage05": {
    "id": "skill_mage05",
    "name": "奥术护甲",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "法师",
    "tags": [
      "defense",
      "sustain"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up",
            "value": 1,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "def_up",
            "value": 3,
            "target": "self"
          },
          {
            "type": "mp_heal",
            "value": 5,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 16,
        "proficiency": 180,
        "effects": [
          {
            "type": "def_up",
            "value": 6,
            "target": "ally_all"
          },
          {
            "type": "mp_heal",
            "value": 15,
            "target": "self"
          },
          {
            "type": "def_up_pct",
            "value": 16,
            "target": "ally_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 18,
        "proficiency": 400,
        "effects": [
          {
            "type": "def_up",
            "value": 8,
            "target": "ally_all"
          },
          {
            "type": "mp_heal",
            "value": 21,
            "target": "self"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 20,
        "proficiency": 750,
        "effects": [
          {
            "type": "def_up",
            "value": 10,
            "target": "ally_all"
          },
          {
            "type": "mp_heal",
            "value": 28,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "def_up",
            "value": 14,
            "target": "ally_all"
          },
          {
            "type": "mp_heal",
            "value": 32,
            "target": "self"
          }
        ]
      }
    ]
  },
  "skill_mage06": {
    "id": "skill_mage06",
    "name": "冰封术",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "法师",
    "tags": [
      "control",
      "aoe"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 14,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 150,
            "target": "single"
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 16,
        "proficiency": 50,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 158,
            "target": "single"
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "single",
            "duration": 2
          },
          {
            "type": "spd_down",
            "value": 3,
            "target": "single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 18,
        "proficiency": 180,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 165,
            "target": "single"
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "single",
            "duration": 3
          },
          {
            "type": "spd_down",
            "value": 8,
            "target": "single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 20,
        "proficiency": 400,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 172,
            "target": "single"
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "single",
            "duration": 3
          },
          {
            "type": "spd_down",
            "value": 7,
            "target": "single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 22,
        "proficiency": 750,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 220,
            "target": "single"
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "single",
            "duration": 3
          },
          {
            "type": "spd_down",
            "value": 9,
            "target": "single",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 300,
            "target": "single"
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "single",
            "duration": 3
          },
          {
            "type": "spd_down",
            "value": 11,
            "target": "single",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 26,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_mage07": {
    "id": "skill_mage07",
    "name": "魔力汲取",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "法师",
    "tags": [
      "sustain",
      "burst"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 140,
            "target": "single"
          },
          {
            "type": "mp_drain",
            "value": 5,
            "target": "single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 147,
            "target": "single"
          },
          {
            "type": "mp_drain",
            "value": 12,
            "target": "single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 16,
        "proficiency": 180,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 154,
            "target": "single"
          },
          {
            "type": "mp_drain",
            "value": 25,
            "target": "single"
          },
          {
            "type": "hp_heal",
            "value": 61,
            "target": "self"
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 18,
        "proficiency": 400,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 161,
            "target": "single"
          },
          {
            "type": "mp_drain",
            "value": 35,
            "target": "single"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 20,
        "proficiency": 750,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 210,
            "target": "single"
          },
          {
            "type": "mp_drain",
            "value": 46,
            "target": "single"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 280,
            "target": "single"
          },
          {
            "type": "mp_drain",
            "value": 53,
            "target": "single"
          },
          {
            "type": "cleanse",
            "value": 1,
            "target": "self"
          }
        ]
      }
    ]
  },
  "skill_mage08": {
    "id": "skill_mage08",
    "name": "奥术洪流",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "法师",
    "tags": [
      "aoe",
      "burst"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 600,
            "target": "enemy_all"
          },
          {
            "type": "mp_heal",
            "value": 5,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 40,
        "proficiency": 50,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 630,
            "target": "enemy_all"
          },
          {
            "type": "mp_heal",
            "value": 12,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 45,
        "proficiency": 180,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 660,
            "target": "enemy_all"
          },
          {
            "type": "mp_heal",
            "value": 25,
            "target": "self"
          },
          {
            "type": "def_down_pct",
            "value": 31,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 50,
        "proficiency": 400,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 690,
            "target": "enemy_all"
          },
          {
            "type": "mp_heal",
            "value": 35,
            "target": "self"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 55,
        "proficiency": 750,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 800,
            "target": "enemy_all"
          },
          {
            "type": "mp_heal",
            "value": 46,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 60,
        "proficiency": 1000,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 950,
            "target": "enemy_all"
          },
          {
            "type": "mp_heal",
            "value": 53,
            "target": "self"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_mage09": {
    "id": "skill_mage09",
    "name": "禁咒·湮灭",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "法师",
    "tags": [
      "burst",
      "aoe",
      "dot"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 50,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 650,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 55,
        "proficiency": 50,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 683,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 10,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 60,
        "proficiency": 180,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 715,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 20,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          },
          {
            "type": "gold_cost",
            "value": 0.2,
            "target": "self"
          },
          {
            "type": "def_down_pct",
            "value": 37,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 65,
        "proficiency": 400,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 748,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 28,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          },
          {
            "type": "gold_cost",
            "value": 0.2,
            "target": "self"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 65,
        "proficiency": 750,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 850,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 37,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          },
          {
            "type": "gold_cost",
            "value": 0.2,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 65,
        "proficiency": 1000,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 1000,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 42,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          },
          {
            "type": "gold_cost",
            "value": 0.2,
            "target": "self"
          }
        ]
      }
    ]
  },
  "skill_mage10": {
    "id": "skill_mage10",
    "name": "禁咒·创世",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "法师",
    "tags": [
      "aoe",
      "burst",
      "dot"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 55,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 700,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 10,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 60,
        "proficiency": 50,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 735,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 18,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 65,
        "proficiency": 180,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 770,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 25,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          },
          {
            "type": "def_down_pct",
            "value": 31,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 65,
        "proficiency": 400,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 805,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 35,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 65,
        "proficiency": 750,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 900,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 46,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 65,
        "proficiency": 1000,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 1050,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 53,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          }
        ]
      }
    ]
  },
  "skill_patrol01": {
    "id": "skill_patrol01",
    "name": "制式斩击",
    "category": "职业",
    "tier": "basic",
    "classLimit": "巡警",
    "tags": [
      "control",
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 24,
            "target": "enemy_front_single"
          },
          {
            "type": "spd_down",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 6,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 26,
            "target": "enemy_front_single"
          },
          {
            "type": "spd_down",
            "value": 2,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 8,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 27,
            "target": "enemy_front_single"
          },
          {
            "type": "spd_down",
            "value": 6,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 10,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 28,
            "target": "enemy_front_single"
          },
          {
            "type": "spd_down",
            "value": 4,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 12,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 51,
            "target": "enemy_front_single"
          },
          {
            "type": "spd_down",
            "value": 6,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 69,
            "target": "enemy_front_single"
          },
          {
            "type": "spd_down",
            "value": 6,
            "target": "enemy_front_single",
            "duration": 3
          },
          {
            "type": "confusion",
            "value": 0.4,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_patrol02": {
    "id": "skill_patrol02",
    "name": "压制",
    "category": "职业",
    "tier": "basic",
    "classLimit": "巡警",
    "tags": [
      "control",
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 19,
            "target": "enemy_front_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 20,
            "target": "enemy_front_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          },
          {
            "type": "phys_atk_down_pct",
            "value": 15,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 14,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 21,
            "target": "enemy_front_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          },
          {
            "type": "phys_atk_down_pct",
            "value": 30,
            "target": "enemy_front_single",
            "duration": 3
          },
          {
            "type": "spd_down",
            "value": 6,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 22,
            "target": "enemy_front_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          },
          {
            "type": "phys_atk_down_pct",
            "value": 41,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 40,
            "target": "enemy_front_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          },
          {
            "type": "phys_atk_down_pct",
            "value": 56,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 53,
            "target": "enemy_front_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          },
          {
            "type": "phys_atk_down_pct",
            "value": 64,
            "target": "enemy_front_single",
            "duration": 3
          },
          {
            "type": "confusion",
            "value": 0.4,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_patrol03": {
    "id": "skill_patrol03",
    "name": "立阵",
    "category": "职业",
    "tier": "basic",
    "classLimit": "巡警",
    "tags": [
      "counter",
      "defense"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 40,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 10,
        "proficiency": 50,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 75,
            "target": "self",
            "duration": 4
          },
          {
            "type": "counter",
            "value": 1,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 180,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 120,
            "target": "self",
            "duration": 5
          },
          {
            "type": "counter",
            "value": 2,
            "target": "self",
            "duration": 4
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 120,
            "target": "self",
            "duration": 5
          },
          {
            "type": "counter",
            "value": 2,
            "target": "self",
            "duration": 4
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 120,
            "target": "self",
            "duration": 5
          },
          {
            "type": "counter",
            "value": 2,
            "target": "self",
            "duration": 4
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 120,
            "target": "self",
            "duration": 5
          },
          {
            "type": "counter",
            "value": 2,
            "target": "self",
            "duration": 4
          }
        ]
      }
    ]
  },
  "skill_patrol04": {
    "id": "skill_patrol04",
    "name": "军令",
    "category": "职业",
    "tier": "basic",
    "classLimit": "巡警",
    "tags": [
      "buff",
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 15,
            "target": "ally_all",
            "duration": 3
          },
          {
            "type": "spd_down",
            "value": 2,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 35,
            "target": "ally_all",
            "duration": 4
          },
          {
            "type": "spd_down",
            "value": 3,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "phys_atk_down_pct",
            "value": 15,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 14,
        "proficiency": 180,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 70,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "spd_down",
            "value": 5,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "phys_atk_down_pct",
            "value": 30,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "spd_up",
            "value": 5,
            "target": "ally_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 97,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "spd_down",
            "value": 7,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "phys_atk_down_pct",
            "value": 41,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 120,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "spd_down",
            "value": 9,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "phys_atk_down_pct",
            "value": 56,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 120,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "spd_down",
            "value": 11,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "phys_atk_down_pct",
            "value": 64,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "phys_atk_up_pct",
            "value": 14,
            "target": "ally_all",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_patrol05": {
    "id": "skill_patrol05",
    "name": "制式横扫",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "巡警",
    "tags": [
      "aoe",
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 100,
            "target": "enemy_back"
          },
          {
            "type": "spd_down",
            "value": 2,
            "target": "enemy_back",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 100,
            "target": "enemy_back"
          },
          {
            "type": "spd_down",
            "value": 3,
            "target": "enemy_back",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 16,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 100,
            "target": "enemy_back"
          },
          {
            "type": "spd_down",
            "value": 5,
            "target": "enemy_back",
            "duration": 3
          },
          {
            "type": "phys_atk_down_pct",
            "value": 25,
            "target": "enemy_back",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 24,
            "target": "enemy_back",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 18,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 100,
            "target": "enemy_back"
          },
          {
            "type": "spd_down",
            "value": 7,
            "target": "enemy_back",
            "duration": 3
          },
          {
            "type": "phys_atk_down_pct",
            "value": 35,
            "target": "enemy_back",
            "duration": 3
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 20,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 121,
            "target": "enemy_back"
          },
          {
            "type": "spd_down",
            "value": 9,
            "target": "enemy_back",
            "duration": 3
          },
          {
            "type": "phys_atk_down_pct",
            "value": 46,
            "target": "enemy_back",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 162,
            "target": "enemy_back"
          },
          {
            "type": "spd_down",
            "value": 11,
            "target": "enemy_back",
            "duration": 3
          },
          {
            "type": "phys_atk_down_pct",
            "value": 53,
            "target": "enemy_back",
            "duration": 3
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_back",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_patrol06": {
    "id": "skill_patrol06",
    "name": "处刑",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "巡警",
    "tags": [
      "heavy",
      "pierce",
      "execute"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 148,
            "target": "enemy_front_single"
          },
          {
            "type": "phys_atk_down_pct",
            "value": 15,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 156,
            "target": "enemy_front_single"
          },
          {
            "type": "phys_atk_down_pct",
            "value": 25,
            "target": "enemy_front_single",
            "duration": 3
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 16,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 163,
            "target": "enemy_front_single"
          },
          {
            "type": "phys_atk_down_pct",
            "value": 50,
            "target": "enemy_front_single",
            "duration": 3
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          },
          {
            "type": "def_down_pct",
            "value": 30,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 18,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 171,
            "target": "enemy_front_single"
          },
          {
            "type": "phys_atk_down_pct",
            "value": 69,
            "target": "enemy_front_single",
            "duration": 3
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          },
          {
            "type": "def_down_pct",
            "value": 41,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 20,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 223,
            "target": "enemy_front_single"
          },
          {
            "type": "phys_atk_down_pct",
            "value": 90,
            "target": "enemy_front_single",
            "duration": 3
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          },
          {
            "type": "def_down_pct",
            "value": 56,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 297,
            "target": "enemy_front_single"
          },
          {
            "type": "phys_atk_down_pct",
            "value": 90,
            "target": "enemy_front_single",
            "duration": 3
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          },
          {
            "type": "def_down_pct",
            "value": 64,
            "target": "enemy_front_single",
            "duration": 3
          },
          {
            "type": "true_dmg",
            "value": 75,
            "target": "enemy_front_single"
          }
        ]
      }
    ]
  },
  "skill_patrol07": {
    "id": "skill_patrol07",
    "name": "不动如山",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "巡警",
    "tags": [
      "defense",
      "counter"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up",
            "value": 1,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "def_up",
            "value": 3,
            "target": "self"
          },
          {
            "type": "hp_heal",
            "value": 110,
            "target": "self"
          },
          {
            "type": "counter",
            "value": 1,
            "target": "self",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 16,
        "proficiency": 180,
        "effects": [
          {
            "type": "def_up",
            "value": 7,
            "target": "self"
          },
          {
            "type": "hp_heal",
            "value": 120,
            "target": "self"
          },
          {
            "type": "counter",
            "value": 2,
            "target": "self",
            "duration": 4
          },
          {
            "type": "def_up_pct",
            "value": 50,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 18,
        "proficiency": 400,
        "effects": [
          {
            "type": "def_up",
            "value": 10,
            "target": "self"
          },
          {
            "type": "hp_heal",
            "value": 140,
            "target": "self"
          },
          {
            "type": "counter",
            "value": 2,
            "target": "self",
            "duration": 4
          },
          {
            "type": "def_up_pct",
            "value": 69,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 20,
        "proficiency": 750,
        "effects": [
          {
            "type": "def_up",
            "value": 13,
            "target": "self"
          },
          {
            "type": "hp_heal",
            "value": 170,
            "target": "self"
          },
          {
            "type": "counter",
            "value": 2,
            "target": "self",
            "duration": 4
          },
          {
            "type": "def_up_pct",
            "value": 93,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "def_up",
            "value": 17,
            "target": "self"
          },
          {
            "type": "hp_heal",
            "value": 170,
            "target": "self"
          },
          {
            "type": "counter",
            "value": 2,
            "target": "self",
            "duration": 4
          },
          {
            "type": "def_up_pct",
            "value": 106,
            "target": "self",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_patrol08": {
    "id": "skill_patrol08",
    "name": "迎击",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "巡警",
    "tags": [
      "counter",
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "counter",
            "value": 1,
            "target": "self",
            "duration": 2
          },
          {
            "type": "spd_down",
            "value": 2,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 40,
        "proficiency": 50,
        "effects": [
          {
            "type": "counter",
            "value": 2,
            "target": "self",
            "duration": 3
          },
          {
            "type": "spd_down",
            "value": 3,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "def_up_pct",
            "value": 30,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 45,
        "proficiency": 180,
        "effects": [
          {
            "type": "counter",
            "value": 3,
            "target": "self",
            "duration": 4
          },
          {
            "type": "spd_down",
            "value": 5,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "def_up_pct",
            "value": 70,
            "target": "self",
            "duration": 4
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          },
          {
            "type": "taunt",
            "value": 1,
            "target": "self",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 50,
        "proficiency": 400,
        "effects": [
          {
            "type": "counter",
            "value": 3,
            "target": "self",
            "duration": 4
          },
          {
            "type": "spd_down",
            "value": 7,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "def_up_pct",
            "value": 97,
            "target": "self",
            "duration": 4
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          },
          {
            "type": "taunt",
            "value": 1,
            "target": "self",
            "duration": 2
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 55,
        "proficiency": 750,
        "effects": [
          {
            "type": "counter",
            "value": 3,
            "target": "self",
            "duration": 4
          },
          {
            "type": "spd_down",
            "value": 9,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "def_up_pct",
            "value": 120,
            "target": "self",
            "duration": 4
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          },
          {
            "type": "taunt",
            "value": 1,
            "target": "self",
            "duration": 2
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 60,
        "proficiency": 1000,
        "effects": [
          {
            "type": "counter",
            "value": 3,
            "target": "self",
            "duration": 4
          },
          {
            "type": "spd_down",
            "value": 11,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "def_up_pct",
            "value": 120,
            "target": "self",
            "duration": 4
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          },
          {
            "type": "taunt",
            "value": 1,
            "target": "self",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_patrol09": {
    "id": "skill_patrol09",
    "name": "肃清",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "巡警",
    "tags": [
      "aoe",
      "control",
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "enemy_front_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 40,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "enemy_front_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          },
          {
            "type": "phys_atk_down_pct",
            "value": 30,
            "target": "enemy_front_single",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 25,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 45,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          },
          {
            "type": "spd_down",
            "value": 5,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "phys_atk_down_pct",
            "value": 30,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 31,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 50,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          },
          {
            "type": "spd_down",
            "value": 7,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "phys_atk_down_pct",
            "value": 41,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 41,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 55,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          },
          {
            "type": "spd_down",
            "value": 9,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "phys_atk_down_pct",
            "value": 56,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 56,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 60,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "spd_down",
            "value": 11,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "phys_atk_down_pct",
            "value": 64,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 64,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_patrol10": {
    "id": "skill_patrol10",
    "name": "王权裁决",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "巡警",
    "tags": [
      "heavy",
      "control",
      "execute"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "spd_down",
            "value": 5,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "phys_atk_down_pct",
            "value": 30,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 30,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 40,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "spd_down",
            "value": 5,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "phys_atk_down_pct",
            "value": 33,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 33,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 45,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "spd_down",
            "value": 5,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "phys_atk_down_pct",
            "value": 35,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 37,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 50,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "spd_down",
            "value": 7,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "phys_atk_down_pct",
            "value": 48,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 48,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 55,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "spd_down",
            "value": 9,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "phys_atk_down_pct",
            "value": 65,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 65,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 60,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "spd_down",
            "value": 11,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "phys_atk_down_pct",
            "value": 74,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 74,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "execute",
            "value": 0.24,
            "target": "enemy_all",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_assassin01": {
    "id": "skill_assassin01",
    "name": "背刺",
    "category": "职业",
    "tier": "basic",
    "classLimit": "杀手",
    "tags": [
      "fast",
      "pierce"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 42,
            "target": "enemy_back_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 6,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 44,
            "target": "enemy_back_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 8,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 46,
            "target": "enemy_back_single"
          },
          {
            "type": "def_down_pct",
            "value": 20,
            "target": "enemy_back_single",
            "duration": 2
          },
          {
            "type": "spd_up",
            "value": 5,
            "target": "self",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 10,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 48,
            "target": "enemy_back_single"
          },
          {
            "type": "def_down_pct",
            "value": 28,
            "target": "enemy_back_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 12,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 70,
            "target": "enemy_back_single"
          },
          {
            "type": "def_down_pct",
            "value": 37,
            "target": "enemy_back_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 116,
            "target": "enemy_back_single"
          },
          {
            "type": "def_down_pct",
            "value": 42,
            "target": "enemy_back_single",
            "duration": 2
          },
          {
            "type": "true_dmg",
            "value": 12,
            "target": "enemy_back_single"
          }
        ]
      }
    ]
  },
  "skill_assassin02": {
    "id": "skill_assassin02",
    "name": "毒刃",
    "category": "职业",
    "tier": "basic",
    "classLimit": "杀手",
    "tags": [
      "fast",
      "dot"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 10,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 22,
            "target": "enemy_back_single"
          },
          {
            "type": "poison",
            "value": 8,
            "target": "enemy_back_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 12,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 24,
            "target": "enemy_back_single"
          },
          {
            "type": "poison",
            "value": 18,
            "target": "enemy_back_single",
            "duration": 4
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 14,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 25,
            "target": "enemy_back_single"
          },
          {
            "type": "poison",
            "value": 35,
            "target": "enemy_back_single",
            "duration": 5
          },
          {
            "type": "spd_up",
            "value": 5,
            "target": "self",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 26,
            "target": "enemy_back_single"
          },
          {
            "type": "poison",
            "value": 48,
            "target": "enemy_back_single",
            "duration": 5
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 47,
            "target": "enemy_back_single"
          },
          {
            "type": "poison",
            "value": 65,
            "target": "enemy_back_single",
            "duration": 5
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 63,
            "target": "enemy_back_single"
          },
          {
            "type": "poison",
            "value": 74,
            "target": "enemy_back_single",
            "duration": 5
          }
        ]
      }
    ]
  },
  "skill_assassin03": {
    "id": "skill_assassin03",
    "name": "隐匿",
    "category": "职业",
    "tier": "basic",
    "classLimit": "杀手",
    "tags": [
      "fast",
      "buff"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "spd_up",
            "value": 3,
            "target": "self",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 10,
        "proficiency": 50,
        "effects": [
          {
            "type": "spd_up",
            "value": 5,
            "target": "self",
            "duration": 3
          },
          {
            "type": "phys_atk_up_pct",
            "value": 25,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 180,
        "effects": [
          {
            "type": "spd_up",
            "value": 8,
            "target": "self",
            "duration": 4
          },
          {
            "type": "phys_atk_up_pct",
            "value": 50,
            "target": "self",
            "duration": 4
          },
          {
            "type": "counter",
            "value": 1,
            "target": "self",
            "duration": 4
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "spd_up",
            "value": 11,
            "target": "self",
            "duration": 4
          },
          {
            "type": "phys_atk_up_pct",
            "value": 69,
            "target": "self",
            "duration": 4
          },
          {
            "type": "counter",
            "value": 1,
            "target": "self",
            "duration": 4
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "spd_up",
            "value": 15,
            "target": "self",
            "duration": 4
          },
          {
            "type": "phys_atk_up_pct",
            "value": 90,
            "target": "self",
            "duration": 4
          },
          {
            "type": "counter",
            "value": 1,
            "target": "self",
            "duration": 4
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "spd_up",
            "value": 15,
            "target": "self",
            "duration": 4
          },
          {
            "type": "phys_atk_up_pct",
            "value": 90,
            "target": "self",
            "duration": 4
          },
          {
            "type": "counter",
            "value": 1,
            "target": "self",
            "duration": 4
          }
        ]
      }
    ]
  },
  "skill_assassin04": {
    "id": "skill_assassin04",
    "name": "影袭",
    "category": "职业",
    "tier": "basic",
    "classLimit": "杀手",
    "tags": [
      "fast",
      "pierce"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 42,
            "target": "enemy_back_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 44,
            "target": "enemy_back_single"
          },
          {
            "type": "def_down_pct",
            "value": 20,
            "target": "enemy_back_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 14,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 46,
            "target": "enemy_back_single"
          },
          {
            "type": "def_down_pct",
            "value": 40,
            "target": "enemy_back_single",
            "duration": 3
          },
          {
            "type": "spd_up",
            "value": 5,
            "target": "self",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 48,
            "target": "enemy_back_single"
          },
          {
            "type": "def_down_pct",
            "value": 55,
            "target": "enemy_back_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 70,
            "target": "enemy_back_single"
          },
          {
            "type": "def_down_pct",
            "value": 74,
            "target": "enemy_back_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 116,
            "target": "enemy_back_single"
          },
          {
            "type": "def_down_pct",
            "value": 85,
            "target": "enemy_back_single",
            "duration": 3
          },
          {
            "type": "true_dmg",
            "value": 9,
            "target": "enemy_back_single"
          }
        ]
      }
    ]
  },
  "skill_assassin05": {
    "id": "skill_assassin05",
    "name": "死亡标记",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "杀手",
    "tags": [
      "pierce",
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 100,
            "target": "enemy_back_single"
          },
          {
            "type": "def_down_pct",
            "value": 25,
            "target": "enemy_back_single",
            "duration": 3
          },
          {
            "type": "mark",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 4
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 103,
            "target": "enemy_back_single"
          },
          {
            "type": "def_down_pct",
            "value": 45,
            "target": "enemy_back_single",
            "duration": 4
          },
          {
            "type": "phys_atk_down_pct",
            "value": 20,
            "target": "enemy_back_single",
            "duration": 4
          },
          {
            "type": "mark",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 4
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 16,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 108,
            "target": "enemy_back_single"
          },
          {
            "type": "def_down_pct",
            "value": 70,
            "target": "enemy_back_single",
            "duration": 5
          },
          {
            "type": "phys_atk_down_pct",
            "value": 40,
            "target": "enemy_back_single",
            "duration": 5
          },
          {
            "type": "mark",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 4
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 18,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 113,
            "target": "enemy_back_single"
          },
          {
            "type": "def_down_pct",
            "value": 90,
            "target": "enemy_back_single",
            "duration": 5
          },
          {
            "type": "phys_atk_down_pct",
            "value": 55,
            "target": "enemy_back_single",
            "duration": 5
          },
          {
            "type": "mark",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 4
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 20,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 147,
            "target": "enemy_back_single"
          },
          {
            "type": "def_down_pct",
            "value": 90,
            "target": "enemy_back_single",
            "duration": 5
          },
          {
            "type": "phys_atk_down_pct",
            "value": 74,
            "target": "enemy_back_single",
            "duration": 5
          },
          {
            "type": "mark",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 4
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 196,
            "target": "enemy_back_single"
          },
          {
            "type": "def_down_pct",
            "value": 90,
            "target": "enemy_back_single",
            "duration": 5
          },
          {
            "type": "phys_atk_down_pct",
            "value": 85,
            "target": "enemy_back_single",
            "duration": 5
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 2
          },
          {
            "type": "mark",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 4
          }
        ]
      }
    ]
  },
  "skill_assassin06": {
    "id": "skill_assassin06",
    "name": "割喉",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "杀手",
    "tags": [
      "fast",
      "pierce",
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 154,
            "target": "enemy_back_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 1
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 162,
            "target": "enemy_back_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 1
          },
          {
            "type": "def_down_pct",
            "value": 20,
            "target": "enemy_back_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 16,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 170,
            "target": "enemy_back_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 1
          },
          {
            "type": "def_down_pct",
            "value": 40,
            "target": "enemy_back_single",
            "duration": 3
          },
          {
            "type": "spd_up",
            "value": 7,
            "target": "self",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 18,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 177,
            "target": "enemy_back_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 1
          },
          {
            "type": "def_down_pct",
            "value": 55,
            "target": "enemy_back_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 20,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 231,
            "target": "enemy_back_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 1
          },
          {
            "type": "def_down_pct",
            "value": 74,
            "target": "enemy_back_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 309,
            "target": "enemy_back_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 1
          },
          {
            "type": "def_down_pct",
            "value": 85,
            "target": "enemy_back_single",
            "duration": 3
          },
          {
            "type": "true_dmg",
            "value": 74,
            "target": "enemy_back_single"
          }
        ]
      }
    ]
  },
  "skill_assassin07": {
    "id": "skill_assassin07",
    "name": "暗影步",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "杀手",
    "tags": [
      "fast",
      "counter"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "spd_up",
            "value": 4,
            "target": "self",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "spd_up",
            "value": 6,
            "target": "self",
            "duration": 3
          },
          {
            "type": "counter",
            "value": 2,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 16,
        "proficiency": 180,
        "effects": [
          {
            "type": "spd_up",
            "value": 9,
            "target": "self",
            "duration": 4
          },
          {
            "type": "counter",
            "value": 3,
            "target": "self",
            "duration": 4
          },
          {
            "type": "phys_atk_up_pct",
            "value": 35,
            "target": "self",
            "duration": 4
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 18,
        "proficiency": 400,
        "effects": [
          {
            "type": "spd_up",
            "value": 12,
            "target": "self",
            "duration": 4
          },
          {
            "type": "counter",
            "value": 3,
            "target": "self",
            "duration": 4
          },
          {
            "type": "phys_atk_up_pct",
            "value": 48,
            "target": "self",
            "duration": 4
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 20,
        "proficiency": 750,
        "effects": [
          {
            "type": "spd_up",
            "value": 15,
            "target": "self",
            "duration": 4
          },
          {
            "type": "counter",
            "value": 3,
            "target": "self",
            "duration": 4
          },
          {
            "type": "phys_atk_up_pct",
            "value": 65,
            "target": "self",
            "duration": 4
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "spd_up",
            "value": 15,
            "target": "self",
            "duration": 4
          },
          {
            "type": "counter",
            "value": 3,
            "target": "self",
            "duration": 4
          },
          {
            "type": "phys_atk_up_pct",
            "value": 74,
            "target": "self",
            "duration": 4
          }
        ]
      }
    ]
  },
  "skill_assassin08": {
    "id": "skill_assassin08",
    "name": "毒爆",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "杀手",
    "tags": [
      "dot",
      "burst"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "poison",
            "value": 5,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 40,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "poison",
            "value": 12,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 45,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "poison",
            "value": 25,
            "target": "enemy_all",
            "duration": 4
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 50,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "poison",
            "value": 35,
            "target": "enemy_all",
            "duration": 4
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 55,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "poison",
            "value": 46,
            "target": "enemy_all",
            "duration": 4
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 60,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "poison",
            "value": 53,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "def_down_pct",
            "value": 34,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_assassin09": {
    "id": "skill_assassin09",
    "name": "致命一击",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "杀手",
    "tags": [
      "fast",
      "execute"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 699,
            "target": "enemy_back_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 40,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 734,
            "target": "enemy_back_single"
          },
          {
            "type": "execute",
            "value": 0.1,
            "target": "enemy_back_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 45,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 769,
            "target": "enemy_back_single"
          },
          {
            "type": "execute",
            "value": 0.25,
            "target": "enemy_back_single"
          },
          {
            "type": "spd_up",
            "value": 8,
            "target": "self",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 50,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 804,
            "target": "enemy_back_single"
          },
          {
            "type": "execute",
            "value": 0.25,
            "target": "enemy_back_single"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 55,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 909,
            "target": "enemy_back_single"
          },
          {
            "type": "execute",
            "value": 0.25,
            "target": "enemy_back_single"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 60,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 1119,
            "target": "enemy_back_single"
          },
          {
            "type": "execute",
            "value": 0.25,
            "target": "enemy_back_single",
            "duration": 0
          }
        ]
      }
    ]
  },
  "skill_assassin10": {
    "id": "skill_assassin10",
    "name": "死神裁决",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "杀手",
    "tags": [
      "execute",
      "burst"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 796,
            "target": "enemy_back_single"
          },
          {
            "type": "execute",
            "value": 0.15,
            "target": "enemy_back_single",
            "chance": 1
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 40,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 835,
            "target": "enemy_back_single"
          },
          {
            "type": "execute",
            "value": 0.22,
            "target": "enemy_back_single",
            "chance": 1
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 45,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 875,
            "target": "enemy_back_single"
          },
          {
            "type": "execute",
            "value": 0.3,
            "target": "enemy_back_single",
            "chance": 1
          },
          {
            "type": "def_down_pct",
            "value": 37,
            "target": "enemy_back_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 50,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 915,
            "target": "enemy_back_single"
          },
          {
            "type": "execute",
            "value": 0.3,
            "target": "enemy_back_single",
            "chance": 1
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 55,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 1034,
            "target": "enemy_back_single"
          },
          {
            "type": "execute",
            "value": 0.3,
            "target": "enemy_back_single",
            "chance": 1
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 60,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 1260,
            "target": "enemy_back_single"
          },
          {
            "type": "execute",
            "value": 0.3,
            "target": "enemy_back_single",
            "duration": 0,
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_healer01": {
    "id": "skill_healer01",
    "name": "治愈之光",
    "category": "职业",
    "tier": "basic",
    "classLimit": "疗愈师",
    "tags": [
      "heal"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "hp_heal",
            "value": 42,
            "target": "ally_single"
          },
          {
            "type": "hp_heal",
            "value": 24,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 6,
        "proficiency": 50,
        "effects": [
          {
            "type": "hp_heal",
            "value": 44,
            "target": "ally_single"
          },
          {
            "type": "hp_heal",
            "value": 25,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 8,
        "proficiency": 180,
        "effects": [
          {
            "type": "hp_heal",
            "value": 46,
            "target": "ally_single"
          },
          {
            "type": "hp_heal",
            "value": 26,
            "target": "self"
          },
          {
            "type": "cleanse",
            "value": 1,
            "target": "ally_single"
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 10,
        "proficiency": 400,
        "effects": [
          {
            "type": "hp_heal",
            "value": 48,
            "target": "ally_single"
          },
          {
            "type": "hp_heal",
            "value": 27,
            "target": "self"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 12,
        "proficiency": 750,
        "effects": [
          {
            "type": "hp_heal",
            "value": 70,
            "target": "ally_single"
          },
          {
            "type": "hp_heal",
            "value": 39,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "hp_heal",
            "value": 116,
            "target": "ally_single"
          },
          {
            "type": "hp_heal",
            "value": 66,
            "target": "self"
          },
          {
            "type": "def_up",
            "value": 2,
            "target": "ally_single"
          }
        ]
      }
    ]
  },
  "skill_healer02": {
    "id": "skill_healer02",
    "name": "群体治愈",
    "category": "职业",
    "tier": "basic",
    "classLimit": "疗愈师",
    "tags": [
      "heal",
      "sustain"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 14,
        "proficiency": 0,
        "effects": [
          {
            "type": "hp_heal",
            "value": 23,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 10,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "hp_heal",
            "value": 24,
            "target": "ally_all"
          },
          {
            "type": "mp_heal",
            "value": 5,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 11,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 14,
        "proficiency": 180,
        "effects": [
          {
            "type": "hp_heal",
            "value": 25,
            "target": "ally_all"
          },
          {
            "type": "mp_heal",
            "value": 12,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 10,
            "target": "self"
          },
          {
            "type": "cleanse",
            "value": 1,
            "target": "ally_all"
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "hp_heal",
            "value": 26,
            "target": "ally_all"
          },
          {
            "type": "mp_heal",
            "value": 17,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 11,
            "target": "self"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "hp_heal",
            "value": 48,
            "target": "ally_all"
          },
          {
            "type": "mp_heal",
            "value": 22,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 20,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "hp_heal",
            "value": 64,
            "target": "ally_all"
          },
          {
            "type": "mp_heal",
            "value": 25,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 26,
            "target": "self"
          },
          {
            "type": "def_up",
            "value": 2,
            "target": "ally_all"
          }
        ]
      }
    ]
  },
  "skill_healer03": {
    "id": "skill_healer03",
    "name": "生命守护",
    "category": "职业",
    "tier": "basic",
    "classLimit": "疗愈师",
    "tags": [
      "defense",
      "heal"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 10,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up",
            "value": 2,
            "target": "ally_single"
          },
          {
            "type": "hp_heal",
            "value": 24,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 12,
        "proficiency": 50,
        "effects": [
          {
            "type": "def_up",
            "value": 4,
            "target": "ally_single"
          },
          {
            "type": "def_up_pct",
            "value": 30,
            "target": "ally_single",
            "duration": 3
          },
          {
            "type": "hp_heal",
            "value": 25,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 14,
        "proficiency": 180,
        "effects": [
          {
            "type": "def_up",
            "value": 7,
            "target": "ally_all"
          },
          {
            "type": "def_up_pct",
            "value": 40,
            "target": "ally_all",
            "duration": 3
          },
          {
            "type": "hp_heal",
            "value": 26,
            "target": "self"
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "def_up",
            "value": 10,
            "target": "ally_all"
          },
          {
            "type": "def_up_pct",
            "value": 55,
            "target": "ally_all",
            "duration": 3
          },
          {
            "type": "hp_heal",
            "value": 28,
            "target": "self"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "def_up",
            "value": 13,
            "target": "ally_all"
          },
          {
            "type": "def_up_pct",
            "value": 74,
            "target": "ally_all",
            "duration": 3
          },
          {
            "type": "hp_heal",
            "value": 50,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "def_up",
            "value": 17,
            "target": "ally_all"
          },
          {
            "type": "def_up_pct",
            "value": 85,
            "target": "ally_all",
            "duration": 3
          },
          {
            "type": "hp_heal",
            "value": 67,
            "target": "self"
          }
        ]
      }
    ]
  },
  "skill_healer04": {
    "id": "skill_healer04",
    "name": "净化",
    "category": "职业",
    "tier": "basic",
    "classLimit": "疗愈师",
    "tags": [
      "heal",
      "defense"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "hp_heal",
            "value": 24,
            "target": "ally_single"
          },
          {
            "type": "cleanse",
            "value": 1,
            "target": "ally_single"
          },
          {
            "type": "hp_heal",
            "value": 19,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 10,
        "proficiency": 50,
        "effects": [
          {
            "type": "hp_heal",
            "value": 25,
            "target": "ally_single"
          },
          {
            "type": "cleanse",
            "value": 3,
            "target": "ally_single"
          },
          {
            "type": "def_up",
            "value": 1,
            "target": "ally_single"
          },
          {
            "type": "hp_heal",
            "value": 18,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 180,
        "effects": [
          {
            "type": "hp_heal",
            "value": 20,
            "target": "ally_all"
          },
          {
            "type": "cleanse",
            "value": 99,
            "target": "ally_all",
            "duration": 0
          },
          {
            "type": "def_up",
            "value": 2,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 12,
            "target": "self"
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "hp_heal",
            "value": 20,
            "target": "ally_all"
          },
          {
            "type": "cleanse",
            "value": 99,
            "target": "ally_all"
          },
          {
            "type": "def_up",
            "value": 3,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 13,
            "target": "self"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "hp_heal",
            "value": 33,
            "target": "ally_all"
          },
          {
            "type": "cleanse",
            "value": 99,
            "target": "ally_all"
          },
          {
            "type": "def_up",
            "value": 4,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 21,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "hp_heal",
            "value": 44,
            "target": "ally_all"
          },
          {
            "type": "cleanse",
            "value": 99,
            "target": "ally_all"
          },
          {
            "type": "def_up",
            "value": 6,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 27,
            "target": "self"
          },
          {
            "type": "dispel",
            "value": 1,
            "target": "ally_all"
          }
        ]
      }
    ]
  },
  "skill_healer05": {
    "id": "skill_healer05",
    "name": "祝福",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "疗愈师",
    "tags": [
      "buff",
      "heal"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 15,
            "target": "ally_single",
            "duration": 3
          },
          {
            "type": "magic_atk_up_pct",
            "value": 15,
            "target": "ally_single",
            "duration": 3
          },
          {
            "type": "hp_heal",
            "value": 115,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 30,
            "target": "ally_single",
            "duration": 4
          },
          {
            "type": "magic_atk_up_pct",
            "value": 30,
            "target": "ally_single",
            "duration": 4
          },
          {
            "type": "spd_up",
            "value": 2,
            "target": "ally_single",
            "duration": 4
          },
          {
            "type": "hp_heal",
            "value": 121,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 16,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 55,
            "target": "ally_single",
            "duration": 5
          },
          {
            "type": "magic_atk_up_pct",
            "value": 55,
            "target": "ally_single",
            "duration": 5
          },
          {
            "type": "spd_up",
            "value": 4,
            "target": "ally_single",
            "duration": 5
          },
          {
            "type": "hp_heal",
            "value": 127,
            "target": "self"
          },
          {
            "type": "spd_up",
            "value": 7,
            "target": "ally_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 18,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 76,
            "target": "ally_single",
            "duration": 5
          },
          {
            "type": "magic_atk_up_pct",
            "value": 76,
            "target": "ally_single",
            "duration": 5
          },
          {
            "type": "spd_up",
            "value": 6,
            "target": "ally_single",
            "duration": 5
          },
          {
            "type": "hp_heal",
            "value": 133,
            "target": "self"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 20,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 90,
            "target": "ally_single",
            "duration": 5
          },
          {
            "type": "magic_atk_up_pct",
            "value": 90,
            "target": "ally_single",
            "duration": 5
          },
          {
            "type": "spd_up",
            "value": 7,
            "target": "ally_single",
            "duration": 5
          },
          {
            "type": "hp_heal",
            "value": 173,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 90,
            "target": "ally_single",
            "duration": 5
          },
          {
            "type": "magic_atk_up_pct",
            "value": 90,
            "target": "ally_single",
            "duration": 5
          },
          {
            "type": "spd_up",
            "value": 8,
            "target": "ally_single",
            "duration": 5
          },
          {
            "type": "hp_heal",
            "value": 231,
            "target": "self"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 19,
            "target": "ally_all",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_healer06": {
    "id": "skill_healer06",
    "name": "神圣惩戒",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "疗愈师",
    "tags": [
      "burst",
      "heal"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 124,
            "target": "enemy_front_single"
          },
          {
            "type": "hp_heal",
            "value": 8,
            "target": "ally_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 130,
            "target": "enemy_front_single"
          },
          {
            "type": "hp_heal",
            "value": 18,
            "target": "ally_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 16,
        "proficiency": 180,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 136,
            "target": "enemy_front_single"
          },
          {
            "type": "def_down_pct",
            "value": 30,
            "target": "enemy_front_single",
            "duration": 2
          },
          {
            "type": "hp_heal",
            "value": 35,
            "target": "ally_single"
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 18,
        "proficiency": 400,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 142,
            "target": "enemy_front_single"
          },
          {
            "type": "hp_heal",
            "value": 48,
            "target": "ally_single"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 20,
        "proficiency": 750,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 186,
            "target": "enemy_front_single"
          },
          {
            "type": "hp_heal",
            "value": 65,
            "target": "ally_single"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 248,
            "target": "enemy_front_single"
          },
          {
            "type": "execute",
            "value": 0.14,
            "target": "enemy_front_single",
            "chance": 1
          },
          {
            "type": "hp_heal",
            "value": 74,
            "target": "ally_single"
          }
        ]
      }
    ]
  },
  "skill_healer07": {
    "id": "skill_healer07",
    "name": "圣光审判",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "疗愈师",
    "tags": [
      "burst",
      "control",
      "heal"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 100,
            "target": "enemy_front_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          },
          {
            "type": "hp_heal",
            "value": 10,
            "target": "ally_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 103,
            "target": "enemy_front_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          },
          {
            "type": "magic_atk_down_pct",
            "value": 20,
            "target": "enemy_front_single",
            "duration": 2
          },
          {
            "type": "hp_heal",
            "value": 22,
            "target": "ally_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 16,
        "proficiency": 180,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 108,
            "target": "enemy_front_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          },
          {
            "type": "magic_atk_down_pct",
            "value": 40,
            "target": "enemy_front_single",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 30,
            "target": "enemy_front_single",
            "duration": 2
          },
          {
            "type": "hp_heal",
            "value": 42,
            "target": "ally_single"
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 18,
        "proficiency": 400,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 113,
            "target": "enemy_front_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          },
          {
            "type": "magic_atk_down_pct",
            "value": 55,
            "target": "enemy_front_single",
            "duration": 3
          },
          {
            "type": "hp_heal",
            "value": 58,
            "target": "ally_single"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 20,
        "proficiency": 750,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 147,
            "target": "enemy_front_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          },
          {
            "type": "magic_atk_down_pct",
            "value": 74,
            "target": "enemy_front_single",
            "duration": 3
          },
          {
            "type": "hp_heal",
            "value": 78,
            "target": "ally_single"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 196,
            "target": "enemy_front_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 2
          },
          {
            "type": "magic_atk_down_pct",
            "value": 85,
            "target": "enemy_front_single",
            "duration": 3
          },
          {
            "type": "hp_heal",
            "value": 89,
            "target": "ally_single"
          }
        ]
      }
    ]
  },
  "skill_healer08": {
    "id": "skill_healer08",
    "name": "忏悔",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "疗愈师",
    "tags": [
      "control",
      "heal"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 428,
            "target": "enemy_front_single"
          },
          {
            "type": "phys_atk_down_pct",
            "value": 15,
            "target": "enemy_front_single",
            "duration": 3
          },
          {
            "type": "hp_heal",
            "value": 570,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 40,
        "proficiency": 50,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 475,
            "target": "enemy_front_single"
          },
          {
            "type": "phys_atk_down_pct",
            "value": 30,
            "target": "enemy_front_single",
            "duration": 4
          },
          {
            "type": "magic_atk_down_pct",
            "value": 30,
            "target": "enemy_front_single",
            "duration": 4
          },
          {
            "type": "def_down_pct",
            "value": 20,
            "target": "enemy_front_single",
            "duration": 4
          },
          {
            "type": "hp_heal",
            "value": 570,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 45,
        "proficiency": 180,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 521,
            "target": "enemy_front_single"
          },
          {
            "type": "phys_atk_down_pct",
            "value": 40,
            "target": "enemy_front_single",
            "duration": 5
          },
          {
            "type": "magic_atk_down_pct",
            "value": 40,
            "target": "enemy_front_single",
            "duration": 5
          },
          {
            "type": "def_down_pct",
            "value": 40,
            "target": "enemy_front_single",
            "duration": 5
          },
          {
            "type": "hp_heal",
            "value": 570,
            "target": "self"
          },
          {
            "type": "spd_down",
            "value": 10,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 50,
        "proficiency": 400,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 522,
            "target": "enemy_front_single"
          },
          {
            "type": "phys_atk_down_pct",
            "value": 55,
            "target": "enemy_front_single",
            "duration": 5
          },
          {
            "type": "magic_atk_down_pct",
            "value": 55,
            "target": "enemy_front_single",
            "duration": 5
          },
          {
            "type": "def_down_pct",
            "value": 55,
            "target": "enemy_front_single",
            "duration": 5
          },
          {
            "type": "hp_heal",
            "value": 570,
            "target": "self"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 55,
        "proficiency": 750,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 517,
            "target": "enemy_front_single"
          },
          {
            "type": "phys_atk_down_pct",
            "value": 74,
            "target": "enemy_front_single",
            "duration": 5
          },
          {
            "type": "magic_atk_down_pct",
            "value": 74,
            "target": "enemy_front_single",
            "duration": 5
          },
          {
            "type": "def_down_pct",
            "value": 74,
            "target": "enemy_front_single",
            "duration": 5
          },
          {
            "type": "hp_heal",
            "value": 570,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 60,
        "proficiency": 1000,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 595,
            "target": "enemy_front_single"
          },
          {
            "type": "phys_atk_down_pct",
            "value": 85,
            "target": "enemy_front_single",
            "duration": 5
          },
          {
            "type": "magic_atk_down_pct",
            "value": 85,
            "target": "enemy_front_single",
            "duration": 5
          },
          {
            "type": "def_down_pct",
            "value": 85,
            "target": "enemy_front_single",
            "duration": 5
          },
          {
            "type": "hp_heal",
            "value": 647,
            "target": "self"
          },
          {
            "type": "confusion",
            "value": 0.4,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_healer09": {
    "id": "skill_healer09",
    "name": "生命复苏",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "疗愈师",
    "tags": [
      "heal",
      "defense",
      "sustain"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "hp_heal",
            "value": 884,
            "target": "ally_single"
          },
          {
            "type": "hp_heal",
            "value": 354,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 40,
        "proficiency": 50,
        "effects": [
          {
            "type": "hp_heal",
            "value": 928,
            "target": "ally_single"
          },
          {
            "type": "cleanse",
            "value": 99,
            "target": "ally_single"
          },
          {
            "type": "def_up",
            "value": 3,
            "target": "ally_single"
          },
          {
            "type": "hp_heal",
            "value": 302,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 45,
        "proficiency": 180,
        "effects": [
          {
            "type": "revive",
            "value": 0.5,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 708,
            "target": "ally_all"
          },
          {
            "type": "cleanse",
            "value": 99,
            "target": "ally_all",
            "duration": 0
          },
          {
            "type": "def_up",
            "value": 4,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 566,
            "target": "self"
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 50,
        "proficiency": 400,
        "effects": [
          {
            "type": "revive",
            "value": 0.5,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 708,
            "target": "ally_all"
          },
          {
            "type": "cleanse",
            "value": 99,
            "target": "ally_all"
          },
          {
            "type": "def_up",
            "value": 6,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 568,
            "target": "self"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 55,
        "proficiency": 750,
        "effects": [
          {
            "type": "revive",
            "value": 0.5,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 884,
            "target": "ally_all"
          },
          {
            "type": "cleanse",
            "value": 99,
            "target": "ally_all"
          },
          {
            "type": "def_up",
            "value": 7,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 706,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 60,
        "proficiency": 1000,
        "effects": [
          {
            "type": "revive",
            "value": 0.5,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 919,
            "target": "ally_all"
          },
          {
            "type": "cleanse",
            "value": 99,
            "target": "ally_all"
          },
          {
            "type": "def_up",
            "value": 12,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 734,
            "target": "self"
          }
        ]
      }
    ]
  },
  "skill_healer10": {
    "id": "skill_healer10",
    "name": "生命赞歌",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "疗愈师",
    "tags": [
      "heal",
      "defense",
      "sustain"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "revive",
            "value": 1,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 575,
            "target": "ally_all"
          },
          {
            "type": "cleanse",
            "value": 100,
            "target": "ally_all"
          },
          {
            "type": "def_up",
            "value": 3,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 239,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 40,
        "proficiency": 50,
        "effects": [
          {
            "type": "revive",
            "value": 1,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 603,
            "target": "ally_all"
          },
          {
            "type": "cleanse",
            "value": 100,
            "target": "ally_all"
          },
          {
            "type": "def_up",
            "value": 4,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 382,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 45,
        "proficiency": 180,
        "effects": [
          {
            "type": "revive",
            "value": 1,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 632,
            "target": "ally_all"
          },
          {
            "type": "cleanse",
            "value": 100,
            "target": "ally_all",
            "duration": 0
          },
          {
            "type": "def_up",
            "value": 5,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 492,
            "target": "self"
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 50,
        "proficiency": 400,
        "effects": [
          {
            "type": "revive",
            "value": 1,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 661,
            "target": "ally_all"
          },
          {
            "type": "cleanse",
            "value": 100,
            "target": "ally_all"
          },
          {
            "type": "def_up",
            "value": 7,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 514,
            "target": "self"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 55,
        "proficiency": 750,
        "effects": [
          {
            "type": "revive",
            "value": 1,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 747,
            "target": "ally_all"
          },
          {
            "type": "cleanse",
            "value": 100,
            "target": "ally_all"
          },
          {
            "type": "def_up",
            "value": 10,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 581,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 60,
        "proficiency": 1000,
        "effects": [
          {
            "type": "revive",
            "value": 1,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 919,
            "target": "ally_all"
          },
          {
            "type": "cleanse",
            "value": 100,
            "target": "ally_all"
          },
          {
            "type": "def_up",
            "value": 14,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 715,
            "target": "self"
          }
        ]
      }
    ]
  },
  "skill_formation01": {
    "id": "skill_formation01",
    "name": "攻击阵",
    "category": "职业",
    "tier": "basic",
    "classLimit": "阵法师",
    "tags": [
      "buff",
      "aoe"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 12,
            "target": "ally_all",
            "duration": 3
          },
          {
            "type": "magic_atk_up_pct",
            "value": 12,
            "target": "ally_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 6,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 25,
            "target": "ally_all",
            "duration": 4
          },
          {
            "type": "magic_atk_up_pct",
            "value": 25,
            "target": "ally_all",
            "duration": 4
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 8,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 50,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "magic_atk_up_pct",
            "value": 50,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "spd_up",
            "value": 5,
            "target": "ally_all",
            "duration": 5
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 10,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 69,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "magic_atk_up_pct",
            "value": 69,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "spd_up",
            "value": 3,
            "target": "ally_all",
            "duration": 5
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 12,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 90,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "magic_atk_up_pct",
            "value": 90,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "spd_up",
            "value": 4,
            "target": "ally_all",
            "duration": 5
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 90,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "magic_atk_up_pct",
            "value": 90,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "spd_up",
            "value": 4,
            "target": "ally_all",
            "duration": 5
          }
        ]
      }
    ]
  },
  "skill_formation02": {
    "id": "skill_formation02",
    "name": "防御阵",
    "category": "职业",
    "tier": "basic",
    "classLimit": "阵法师",
    "tags": [
      "buff",
      "defense",
      "counter"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 30,
            "target": "ally_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 60,
            "target": "ally_all",
            "duration": 4
          },
          {
            "type": "def_up",
            "value": 1,
            "target": "ally_all"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 14,
        "proficiency": 180,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 120,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "def_up",
            "value": 2,
            "target": "ally_all"
          },
          {
            "type": "counter",
            "value": 1,
            "target": "ally_all",
            "duration": 4
          },
          {
            "type": "spd_up",
            "value": 5,
            "target": "ally_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 120,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "def_up",
            "value": 3,
            "target": "ally_all"
          },
          {
            "type": "counter",
            "value": 1,
            "target": "ally_all",
            "duration": 4
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 120,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "def_up",
            "value": 4,
            "target": "ally_all"
          },
          {
            "type": "counter",
            "value": 1,
            "target": "ally_all",
            "duration": 4
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 120,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "def_up",
            "value": 5,
            "target": "ally_all"
          },
          {
            "type": "counter",
            "value": 1,
            "target": "ally_all",
            "duration": 4
          },
          {
            "type": "phys_atk_up_pct",
            "value": 14,
            "target": "ally_all",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_formation03": {
    "id": "skill_formation03",
    "name": "疾风阵",
    "category": "职业",
    "tier": "basic",
    "classLimit": "阵法师",
    "tags": [
      "buff",
      "fast"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 10,
        "proficiency": 0,
        "effects": [
          {
            "type": "spd_up",
            "value": 3,
            "target": "ally_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 12,
        "proficiency": 50,
        "effects": [
          {
            "type": "spd_up",
            "value": 5,
            "target": "ally_all",
            "duration": 4
          },
          {
            "type": "def_up_pct",
            "value": 25,
            "target": "ally_all",
            "duration": 4
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 14,
        "proficiency": 180,
        "effects": [
          {
            "type": "spd_up",
            "value": 8,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "def_up_pct",
            "value": 50,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "phys_atk_up_pct",
            "value": 25,
            "target": "ally_all",
            "duration": 5
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "spd_up",
            "value": 11,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "def_up_pct",
            "value": 69,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "phys_atk_up_pct",
            "value": 35,
            "target": "ally_all",
            "duration": 5
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "spd_up",
            "value": 15,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "def_up_pct",
            "value": 93,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "phys_atk_up_pct",
            "value": 46,
            "target": "ally_all",
            "duration": 5
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "spd_up",
            "value": 15,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "def_up_pct",
            "value": 106,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "phys_atk_up_pct",
            "value": 53,
            "target": "ally_all",
            "duration": 5
          }
        ]
      }
    ]
  },
  "skill_formation04": {
    "id": "skill_formation04",
    "name": "束缚阵",
    "category": "职业",
    "tier": "basic",
    "classLimit": "阵法师",
    "tags": [
      "aoe",
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 14,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 10,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 2,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 11,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 3,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "magic_atk_down_pct",
            "value": 15,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 14,
        "proficiency": 180,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 12,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 5,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "magic_atk_down_pct",
            "value": 35,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "def_down_pct",
            "value": 18,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 12,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 7,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "magic_atk_down_pct",
            "value": 48,
            "target": "enemy_all",
            "duration": 4
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 22,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 9,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "magic_atk_down_pct",
            "value": 65,
            "target": "enemy_all",
            "duration": 4
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 29,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 11,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "magic_atk_down_pct",
            "value": 74,
            "target": "enemy_all",
            "duration": 4
          }
        ]
      }
    ]
  },
  "skill_formation05": {
    "id": "skill_formation05",
    "name": "雷罚阵",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "阵法师",
    "tags": [
      "aoe",
      "burst"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 100,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 18,
        "proficiency": 50,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 100,
            "target": "enemy_all"
          },
          {
            "type": "magic_atk_down_pct",
            "value": 15,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 20,
        "proficiency": 180,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 100,
            "target": "enemy_all"
          },
          {
            "type": "magic_atk_down_pct",
            "value": 30,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "stun",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          },
          {
            "type": "def_down_pct",
            "value": 24,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 22,
        "proficiency": 400,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 100,
            "target": "enemy_all"
          },
          {
            "type": "magic_atk_down_pct",
            "value": 41,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "stun",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 22,
        "proficiency": 750,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 123,
            "target": "enemy_all"
          },
          {
            "type": "magic_atk_down_pct",
            "value": 56,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "stun",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 163,
            "target": "enemy_all"
          },
          {
            "type": "magic_atk_down_pct",
            "value": 64,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "stun",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          }
        ]
      }
    ]
  },
  "skill_formation06": {
    "id": "skill_formation06",
    "name": "火阵",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "阵法师",
    "tags": [
      "aoe",
      "dot"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 14,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 100,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 5,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 16,
        "proficiency": 50,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 100,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 12,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 18,
        "proficiency": 180,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 100,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 25,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "def_down_pct",
            "value": 24,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 20,
        "proficiency": 400,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 100,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 35,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "def_down_pct",
            "value": 28,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 22,
        "proficiency": 750,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 102,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 46,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "def_down_pct",
            "value": 37,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 136,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 53,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "def_down_pct",
            "value": 42,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_formation07": {
    "id": "skill_formation07",
    "name": "冰阵",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "阵法师",
    "tags": [
      "aoe",
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 100,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 3,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 100,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 5,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 16,
        "proficiency": 180,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 100,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 8,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "phys_atk_down_pct",
            "value": 25,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "def_down_pct",
            "value": 24,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 18,
        "proficiency": 400,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 100,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 11,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "phys_atk_down_pct",
            "value": 35,
            "target": "enemy_all",
            "duration": 4
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 20,
        "proficiency": 750,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 100,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 15,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "phys_atk_down_pct",
            "value": 46,
            "target": "enemy_all",
            "duration": 4
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 108,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 15,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "phys_atk_down_pct",
            "value": 53,
            "target": "enemy_all",
            "duration": 4
          }
        ]
      }
    ]
  },
  "skill_formation08": {
    "id": "skill_formation08",
    "name": "混乱阵",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "阵法师",
    "tags": [
      "aoe",
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "confusion",
            "value": 0.15,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 40,
        "proficiency": 50,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "confusion",
            "value": 0.25,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "phys_atk_down_pct",
            "value": 20,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 45,
        "proficiency": 180,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "confusion",
            "value": 0.4,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "phys_atk_down_pct",
            "value": 40,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "magic_atk_down_pct",
            "value": 40,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "def_down_pct",
            "value": 31,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 50,
        "proficiency": 400,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "confusion",
            "value": 0.4,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "phys_atk_down_pct",
            "value": 55,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "magic_atk_down_pct",
            "value": 55,
            "target": "enemy_all",
            "duration": 4
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 55,
        "proficiency": 750,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "confusion",
            "value": 0.4,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "phys_atk_down_pct",
            "value": 74,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "magic_atk_down_pct",
            "value": 74,
            "target": "enemy_all",
            "duration": 4
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 60,
        "proficiency": 1000,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "confusion",
            "value": 0.4,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "phys_atk_down_pct",
            "value": 85,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "magic_atk_down_pct",
            "value": 85,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_formation09": {
    "id": "skill_formation09",
    "name": "五行大阵",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "阵法师",
    "tags": [
      "aoe",
      "control",
      "dot"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 3,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 40,
        "proficiency": 50,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 5,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "phys_atk_down_pct",
            "value": 30,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "burn",
            "value": 10,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 45,
        "proficiency": 180,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 8,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "phys_atk_down_pct",
            "value": 50,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "magic_atk_down_pct",
            "value": 50,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "def_down_pct",
            "value": 40,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "burn",
            "value": 20,
            "target": "enemy_all",
            "duration": 4
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 50,
        "proficiency": 400,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 11,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "phys_atk_down_pct",
            "value": 69,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "magic_atk_down_pct",
            "value": 69,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "def_down_pct",
            "value": 55,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "burn",
            "value": 28,
            "target": "enemy_all",
            "duration": 4
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 55,
        "proficiency": 750,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 15,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "phys_atk_down_pct",
            "value": 90,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "magic_atk_down_pct",
            "value": 90,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "def_down_pct",
            "value": 74,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "burn",
            "value": 37,
            "target": "enemy_all",
            "duration": 4
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 60,
        "proficiency": 1000,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 15,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "phys_atk_down_pct",
            "value": 90,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "magic_atk_down_pct",
            "value": 90,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "def_down_pct",
            "value": 85,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "burn",
            "value": 42,
            "target": "enemy_all",
            "duration": 4
          }
        ]
      }
    ]
  },
  "skill_formation10": {
    "id": "skill_formation10",
    "name": "太极诛天阵",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "阵法师",
    "tags": [
      "aoe",
      "burst",
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 4,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "phys_atk_down_pct",
            "value": 40,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "magic_atk_down_pct",
            "value": 40,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "def_down_pct",
            "value": 30,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "burn",
            "value": 15,
            "target": "enemy_all",
            "duration": 4
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 40,
        "proficiency": 50,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 7,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "phys_atk_down_pct",
            "value": 48,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "magic_atk_down_pct",
            "value": 48,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "def_down_pct",
            "value": 38,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "burn",
            "value": 18,
            "target": "enemy_all",
            "duration": 4
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 45,
        "proficiency": 180,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 9,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "phys_atk_down_pct",
            "value": 55,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "magic_atk_down_pct",
            "value": 55,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "def_down_pct",
            "value": 45,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "burn",
            "value": 20,
            "target": "enemy_all",
            "duration": 4
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 50,
        "proficiency": 400,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 12,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "phys_atk_down_pct",
            "value": 76,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "magic_atk_down_pct",
            "value": 76,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "def_down_pct",
            "value": 62,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "burn",
            "value": 28,
            "target": "enemy_all",
            "duration": 4
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 55,
        "proficiency": 750,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 15,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "phys_atk_down_pct",
            "value": 90,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "magic_atk_down_pct",
            "value": 90,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "def_down_pct",
            "value": 83,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "burn",
            "value": 37,
            "target": "enemy_all",
            "duration": 4
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 60,
        "proficiency": 1000,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 15,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "phys_atk_down_pct",
            "value": 90,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "magic_atk_down_pct",
            "value": 90,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "def_down_pct",
            "value": 90,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "burn",
            "value": 42,
            "target": "enemy_all",
            "duration": 4
          }
        ]
      }
    ]
  },
  "skill_blacksmith01": {
    "id": "skill_blacksmith01",
    "name": "锻锤",
    "category": "职业",
    "tier": "basic",
    "classLimit": "铁匠",
    "tags": [
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 42,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 6,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 44,
            "target": "enemy_front_single"
          },
          {
            "type": "spd_down",
            "value": 2,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 8,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 46,
            "target": "enemy_front_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          },
          {
            "type": "def_down_pct",
            "value": 22,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 10,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 48,
            "target": "enemy_front_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 12,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 70,
            "target": "enemy_front_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 116,
            "target": "enemy_front_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          },
          {
            "type": "execute",
            "value": 0.1,
            "target": "enemy_front_single",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_blacksmith02": {
    "id": "skill_blacksmith02",
    "name": "淬火",
    "category": "职业",
    "tier": "basic",
    "classLimit": "铁匠",
    "tags": [
      "defense",
      "sustain"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 10,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 40,
            "target": "self",
            "duration": 3
          },
          {
            "type": "hp_heal",
            "value": 32,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 12,
        "proficiency": 50,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 80,
            "target": "self",
            "duration": 4
          },
          {
            "type": "hp_heal",
            "value": 34,
            "target": "self"
          },
          {
            "type": "def_up",
            "value": 1,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 14,
        "proficiency": 180,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 120,
            "target": "self",
            "duration": 5
          },
          {
            "type": "hp_heal",
            "value": 35,
            "target": "self"
          },
          {
            "type": "def_up",
            "value": 3,
            "target": "self"
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 120,
            "target": "self",
            "duration": 5
          },
          {
            "type": "hp_heal",
            "value": 37,
            "target": "self"
          },
          {
            "type": "def_up",
            "value": 4,
            "target": "self"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 120,
            "target": "self",
            "duration": 5
          },
          {
            "type": "hp_heal",
            "value": 67,
            "target": "self"
          },
          {
            "type": "def_up",
            "value": 5,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 120,
            "target": "self",
            "duration": 5
          },
          {
            "type": "hp_heal",
            "value": 90,
            "target": "self"
          },
          {
            "type": "def_up",
            "value": 8,
            "target": "self"
          }
        ]
      }
    ]
  },
  "skill_blacksmith03": {
    "id": "skill_blacksmith03",
    "name": "烈焰熔炉",
    "category": "职业",
    "tier": "basic",
    "classLimit": "铁匠",
    "tags": [
      "dot",
      "aoe"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 14,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 18,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 6,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 18,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 15,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 14,
        "proficiency": 180,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 19,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 30,
            "target": "enemy_all",
            "duration": 4
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 20,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 41,
            "target": "enemy_all",
            "duration": 4
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 37,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 56,
            "target": "enemy_all",
            "duration": 4
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 49,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 64,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "def_down_pct",
            "value": 19,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_blacksmith04": {
    "id": "skill_blacksmith04",
    "name": "熔炉铁壁",
    "category": "职业",
    "tier": "basic",
    "classLimit": "铁匠",
    "tags": [
      "defense",
      "buff"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 10,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up",
            "value": 2,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 12,
        "proficiency": 50,
        "effects": [
          {
            "type": "def_up",
            "value": 5,
            "target": "self"
          },
          {
            "type": "def_up_pct",
            "value": 50,
            "target": "self",
            "duration": 4
          },
          {
            "type": "counter",
            "value": 1,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 14,
        "proficiency": 180,
        "effects": [
          {
            "type": "def_up",
            "value": 9,
            "target": "self"
          },
          {
            "type": "def_up_pct",
            "value": 100,
            "target": "self",
            "duration": 5
          },
          {
            "type": "counter",
            "value": 2,
            "target": "self",
            "duration": 4
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "def_up",
            "value": 12,
            "target": "self"
          },
          {
            "type": "def_up_pct",
            "value": 120,
            "target": "self",
            "duration": 5
          },
          {
            "type": "counter",
            "value": 2,
            "target": "self",
            "duration": 4
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "def_up",
            "value": 16,
            "target": "self"
          },
          {
            "type": "def_up_pct",
            "value": 120,
            "target": "self",
            "duration": 5
          },
          {
            "type": "counter",
            "value": 2,
            "target": "self",
            "duration": 4
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "def_up",
            "value": 20,
            "target": "self"
          },
          {
            "type": "def_up_pct",
            "value": 120,
            "target": "self",
            "duration": 5
          },
          {
            "type": "counter",
            "value": 2,
            "target": "self",
            "duration": 4
          }
        ]
      }
    ]
  },
  "skill_blacksmith05": {
    "id": "skill_blacksmith05",
    "name": "飞锤",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "铁匠",
    "tags": [
      "heavy",
      "pierce"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 215,
            "target": "enemy_back_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 225,
            "target": "enemy_back_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 1
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 16,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 236,
            "target": "enemy_back_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 1
          },
          {
            "type": "def_down_pct",
            "value": 30,
            "target": "enemy_back_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 18,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 247,
            "target": "enemy_back_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 1
          },
          {
            "type": "def_down_pct",
            "value": 41,
            "target": "enemy_back_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 20,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 322,
            "target": "enemy_back_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 1
          },
          {
            "type": "def_down_pct",
            "value": 56,
            "target": "enemy_back_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 429,
            "target": "enemy_back_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 1
          },
          {
            "type": "def_down_pct",
            "value": 64,
            "target": "enemy_back_single",
            "duration": 3
          },
          {
            "type": "true_dmg",
            "value": 60,
            "target": "enemy_back_single"
          }
        ]
      }
    ]
  },
  "skill_blacksmith06": {
    "id": "skill_blacksmith06",
    "name": "熔岩爆发",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "铁匠",
    "tags": [
      "burst",
      "aoe",
      "dot"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 118,
            "target": "enemy_all"
          },
          {
            "type": "gold_cost",
            "value": 0.08,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 124,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 8,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "gold_cost",
            "value": 0.1,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 16,
        "proficiency": 180,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 130,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 18,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "gold_cost",
            "value": 0.15,
            "target": "self"
          },
          {
            "type": "def_down_pct",
            "value": 30,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 18,
        "proficiency": 400,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 136,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 25,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "gold_cost",
            "value": 0.15,
            "target": "self"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 20,
        "proficiency": 750,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 177,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 33,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "gold_cost",
            "value": 0.15,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 236,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 38,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "gold_cost",
            "value": 0.15,
            "target": "self"
          }
        ]
      }
    ]
  },
  "skill_blacksmith07": {
    "id": "skill_blacksmith07",
    "name": "回火",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "铁匠",
    "tags": [
      "heal",
      "sustain"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "hp_heal",
            "value": 214,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "hp_heal",
            "value": 225,
            "target": "self"
          },
          {
            "type": "cleanse",
            "value": 2,
            "target": "self"
          },
          {
            "type": "mp_heal",
            "value": 10,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 16,
        "proficiency": 180,
        "effects": [
          {
            "type": "hp_heal",
            "value": 236,
            "target": "self"
          },
          {
            "type": "cleanse",
            "value": 99,
            "target": "self",
            "duration": 0
          },
          {
            "type": "mp_heal",
            "value": 25,
            "target": "self"
          },
          {
            "type": "def_up",
            "value": 2,
            "target": "self"
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 18,
        "proficiency": 400,
        "effects": [
          {
            "type": "hp_heal",
            "value": 247,
            "target": "self"
          },
          {
            "type": "cleanse",
            "value": 99,
            "target": "self"
          },
          {
            "type": "mp_heal",
            "value": 35,
            "target": "self"
          },
          {
            "type": "def_up",
            "value": 3,
            "target": "self"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 20,
        "proficiency": 750,
        "effects": [
          {
            "type": "hp_heal",
            "value": 322,
            "target": "self"
          },
          {
            "type": "cleanse",
            "value": 99,
            "target": "self"
          },
          {
            "type": "mp_heal",
            "value": 46,
            "target": "self"
          },
          {
            "type": "def_up",
            "value": 4,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "hp_heal",
            "value": 429,
            "target": "self"
          },
          {
            "type": "cleanse",
            "value": 99,
            "target": "self"
          },
          {
            "type": "mp_heal",
            "value": 53,
            "target": "self"
          },
          {
            "type": "def_up",
            "value": 8,
            "target": "self"
          }
        ]
      }
    ]
  },
  "skill_blacksmith08": {
    "id": "skill_blacksmith08",
    "name": "锻造之魂",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "铁匠",
    "tags": [
      "buff",
      "sustain"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 15,
            "target": "self",
            "duration": 3
          },
          {
            "type": "def_up_pct",
            "value": 20,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 40,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 30,
            "target": "self",
            "duration": 4
          },
          {
            "type": "def_up_pct",
            "value": 50,
            "target": "self",
            "duration": 4
          },
          {
            "type": "hp_heal_pct",
            "value": 2,
            "target": "self",
            "duration": 4,
            "trigger": "turn_end"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 45,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 55,
            "target": "self",
            "duration": 5
          },
          {
            "type": "def_up_pct",
            "value": 100,
            "target": "self",
            "duration": 5
          },
          {
            "type": "hp_heal_pct",
            "value": 5,
            "target": "self",
            "duration": 5,
            "trigger": "turn_end"
          },
          {
            "type": "spd_up",
            "value": 8,
            "target": "ally_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 50,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 76,
            "target": "self",
            "duration": 5
          },
          {
            "type": "def_up_pct",
            "value": 120,
            "target": "self",
            "duration": 5
          },
          {
            "type": "hp_heal_pct",
            "value": 7,
            "target": "self",
            "duration": 5,
            "trigger": "turn_end"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 55,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 90,
            "target": "self",
            "duration": 5
          },
          {
            "type": "def_up_pct",
            "value": 120,
            "target": "self",
            "duration": 5
          },
          {
            "type": "hp_heal_pct",
            "value": 9,
            "target": "self",
            "duration": 5,
            "trigger": "turn_end"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 60,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 90,
            "target": "self",
            "duration": 5
          },
          {
            "type": "def_up_pct",
            "value": 120,
            "target": "self",
            "duration": 5
          },
          {
            "type": "hp_heal_pct",
            "value": 11,
            "target": "self",
            "duration": 5,
            "trigger": "turn_end"
          }
        ]
      }
    ]
  },
  "skill_blacksmith09": {
    "id": "skill_blacksmith09",
    "name": "火山喷发",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "铁匠",
    "tags": [
      "aoe",
      "dot",
      "burst"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 8,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 40,
        "proficiency": 50,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 18,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 20,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 45,
        "proficiency": 180,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 35,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "def_down_pct",
            "value": 40,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "spd_down",
            "value": 3,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "hp_heal",
            "value": 120,
            "target": "self"
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 50,
        "proficiency": 400,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 48,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "def_down_pct",
            "value": 55,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "spd_down",
            "value": 4,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "hp_heal",
            "value": 166,
            "target": "self"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 55,
        "proficiency": 750,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 65,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "def_down_pct",
            "value": 74,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "spd_down",
            "value": 6,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "hp_heal",
            "value": 222,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 60,
        "proficiency": 1000,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 627,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 74,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "def_down_pct",
            "value": 85,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "spd_down",
            "value": 6,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "hp_heal",
            "value": 254,
            "target": "self"
          }
        ]
      }
    ]
  },
  "skill_blacksmith10": {
    "id": "skill_blacksmith10",
    "name": "天工开物",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "铁匠",
    "tags": [
      "aoe",
      "burst",
      "buff"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 10,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "def_down_pct",
            "value": 30,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "spd_down",
            "value": 3,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "hp_heal",
            "value": 60,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 40,
        "proficiency": 50,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 25,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "def_down_pct",
            "value": 35,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "spd_down",
            "value": 4,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "hp_heal",
            "value": 95,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 45,
        "proficiency": 180,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 40,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "def_down_pct",
            "value": 40,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "spd_down",
            "value": 4,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "hp_heal",
            "value": 130,
            "target": "self"
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 50,
        "proficiency": 400,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 55,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "def_down_pct",
            "value": 55,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "spd_down",
            "value": 6,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "hp_heal",
            "value": 179,
            "target": "self"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 55,
        "proficiency": 750,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 602,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 74,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "def_down_pct",
            "value": 74,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "spd_down",
            "value": 7,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "hp_heal",
            "value": 241,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 60,
        "proficiency": 1000,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 741,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 85,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "def_down_pct",
            "value": 85,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "spd_down",
            "value": 8,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "hp_heal",
            "value": 276,
            "target": "self"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_merchant01": {
    "id": "skill_merchant01",
    "name": "金币投掷",
    "category": "职业",
    "tier": "basic",
    "classLimit": "商人",
    "tags": [
      "fast",
      "execute"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 20,
            "target": "enemy_front_single"
          },
          {
            "type": "gold_cost",
            "value": 5,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 6,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 21,
            "target": "enemy_front_single"
          },
          {
            "type": "gold_cost",
            "value": 20,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 8,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 22,
            "target": "enemy_front_single"
          },
          {
            "type": "gold_cost",
            "value": 60,
            "target": "self"
          },
          {
            "type": "spd_up",
            "value": 5,
            "target": "self",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 10,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 23,
            "target": "enemy_front_single"
          },
          {
            "type": "gold_cost",
            "value": 60,
            "target": "self"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 12,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 42,
            "target": "enemy_front_single"
          },
          {
            "type": "gold_cost",
            "value": 60,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 56,
            "target": "enemy_front_single"
          },
          {
            "type": "gold_cost",
            "value": 60,
            "target": "self"
          },
          {
            "type": "execute",
            "value": 0.14,
            "target": "enemy_front_single",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_merchant02": {
    "id": "skill_merchant02",
    "name": "讨价还价",
    "category": "职业",
    "tier": "basic",
    "classLimit": "商人",
    "tags": [
      "control",
      "buff"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 10,
            "target": "enemy_all"
          },
          {
            "type": "phys_atk_down_pct",
            "value": 15,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 11,
            "target": "enemy_all"
          },
          {
            "type": "phys_atk_down_pct",
            "value": 28,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "magic_atk_down_pct",
            "value": 28,
            "target": "enemy_all",
            "duration": 4
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 14,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 12,
            "target": "enemy_all"
          },
          {
            "type": "phys_atk_down_pct",
            "value": 50,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "magic_atk_down_pct",
            "value": 50,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "spd_down",
            "value": 6,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 12,
            "target": "enemy_all"
          },
          {
            "type": "phys_atk_down_pct",
            "value": 69,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "magic_atk_down_pct",
            "value": 69,
            "target": "enemy_all",
            "duration": 5
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 22,
            "target": "enemy_all"
          },
          {
            "type": "phys_atk_down_pct",
            "value": 90,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "magic_atk_down_pct",
            "value": 90,
            "target": "enemy_all",
            "duration": 5
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 29,
            "target": "enemy_all"
          },
          {
            "type": "phys_atk_down_pct",
            "value": 90,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "magic_atk_down_pct",
            "value": 90,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "confusion",
            "value": 0.4,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_merchant03": {
    "id": "skill_merchant03",
    "name": "垄断市场",
    "category": "职业",
    "tier": "basic",
    "classLimit": "商人",
    "tags": [
      "control",
      "pierce"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 10,
            "target": "enemy_all"
          },
          {
            "type": "def_down_pct",
            "value": 15,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 11,
            "target": "enemy_all"
          },
          {
            "type": "def_down_pct",
            "value": 30,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "spd_down",
            "value": 2,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 14,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 12,
            "target": "enemy_all"
          },
          {
            "type": "def_down_pct",
            "value": 55,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "spd_down",
            "value": 6,
            "target": "enemy_all",
            "duration": 4
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 12,
            "target": "enemy_all"
          },
          {
            "type": "def_down_pct",
            "value": 76,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "spd_down",
            "value": 6,
            "target": "enemy_all",
            "duration": 4
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 22,
            "target": "enemy_all"
          },
          {
            "type": "def_down_pct",
            "value": 90,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "spd_down",
            "value": 7,
            "target": "enemy_all",
            "duration": 4
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 29,
            "target": "enemy_all"
          },
          {
            "type": "def_down_pct",
            "value": 90,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "spd_down",
            "value": 8,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "true_dmg",
            "value": 12,
            "target": "enemy_all"
          }
        ]
      }
    ]
  },
  "skill_merchant04": {
    "id": "skill_merchant04",
    "name": "雇佣打手",
    "category": "职业",
    "tier": "basic",
    "classLimit": "商人",
    "tags": [
      "buff",
      "sustain"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 10,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 15,
            "target": "ally_all",
            "duration": 3
          },
          {
            "type": "magic_atk_up_pct",
            "value": 15,
            "target": "ally_all",
            "duration": 3
          },
          {
            "type": "gold_cost",
            "value": 20,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 12,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 30,
            "target": "ally_all",
            "duration": 4
          },
          {
            "type": "magic_atk_up_pct",
            "value": 30,
            "target": "ally_all",
            "duration": 4
          },
          {
            "type": "def_up_pct",
            "value": 20,
            "target": "ally_all",
            "duration": 4
          },
          {
            "type": "gold_cost",
            "value": 55,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 14,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 55,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "magic_atk_up_pct",
            "value": 55,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "def_up_pct",
            "value": 45,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "spd_up",
            "value": 5,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "gold_cost",
            "value": 120,
            "target": "self"
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 76,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "magic_atk_up_pct",
            "value": 76,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "def_up_pct",
            "value": 62,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "spd_up",
            "value": 3,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "gold_cost",
            "value": 120,
            "target": "self"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 90,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "magic_atk_up_pct",
            "value": 90,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "def_up_pct",
            "value": 83,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "spd_up",
            "value": 4,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "gold_cost",
            "value": 120,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 90,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "magic_atk_up_pct",
            "value": 90,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "def_up_pct",
            "value": 95,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "spd_up",
            "value": 4,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "gold_cost",
            "value": 120,
            "target": "self"
          }
        ]
      }
    ]
  },
  "skill_merchant05": {
    "id": "skill_merchant05",
    "name": "策反",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "商人",
    "tags": [
      "control",
      "buff"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "betray",
            "value": 1,
            "target": "enemy_all",
            "chance": 0.05,
            "cost": {
              "type": "gold_cost",
              "value": 100
            }
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "betray",
            "value": 3,
            "target": "enemy_all",
            "chance": 0.12,
            "cost": {
              "type": "gold_cost",
              "value": 500
            }
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 16,
        "proficiency": 180,
        "effects": [
          {
            "type": "betray",
            "value": 5,
            "target": "enemy_all",
            "chance": 0.25,
            "cost": {
              "type": "gold_cost",
              "value": 1500
            }
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 18,
        "proficiency": 400,
        "effects": [
          {
            "type": "betray",
            "value": 5,
            "target": "enemy_all",
            "chance": 0.25,
            "cost": {
              "type": "gold_cost",
              "value": 1500
            }
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 20,
        "proficiency": 750,
        "effects": [
          {
            "type": "betray",
            "value": 5,
            "target": "enemy_all",
            "chance": 0.25,
            "cost": {
              "type": "gold_cost",
              "value": 1500
            }
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "betray",
            "value": 5,
            "target": "enemy_all",
            "chance": 0.25,
            "cost": {
              "type": "gold_cost",
              "value": 1500
            }
          }
        ]
      }
    ]
  },
  "skill_merchant06": {
    "id": "skill_merchant06",
    "name": "命运赌局",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "商人",
    "tags": [
      "execute"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 186,
            "target": "single"
          },
          {
            "type": "execute",
            "value": 0.9,
            "target": "single",
            "chance": 0.01
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 18,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 195,
            "target": "single"
          },
          {
            "type": "execute",
            "value": 0.9,
            "target": "single",
            "chance": 0.015
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 20,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 204,
            "target": "single"
          },
          {
            "type": "execute",
            "value": 0.9,
            "target": "single",
            "chance": 0.02
          },
          {
            "type": "def_down_pct",
            "value": 30,
            "target": "single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 22,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 213,
            "target": "single"
          },
          {
            "type": "execute",
            "value": 0.9,
            "target": "single",
            "chance": 0.02
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 22,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 278,
            "target": "single"
          },
          {
            "type": "execute",
            "value": 0.9,
            "target": "single",
            "chance": 0.02
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 371,
            "target": "single"
          },
          {
            "type": "execute",
            "value": 0.9,
            "target": "single",
            "duration": 0,
            "chance": 0.02
          }
        ]
      }
    ]
  },
  "skill_merchant07": {
    "id": "skill_merchant07",
    "name": "雇佣兵团",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "商人",
    "tags": [
      "buff",
      "aoe"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 20,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "magic_atk_up_pct",
            "value": 20,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "def_up_pct",
            "value": 15,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "spd_up",
            "value": 2,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "gold_cost",
            "value": 30,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 40,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "magic_atk_up_pct",
            "value": 40,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "def_up_pct",
            "value": 33,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "spd_up",
            "value": 3,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "gold_cost",
            "value": 90,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 16,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 60,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "magic_atk_up_pct",
            "value": 60,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "def_up_pct",
            "value": 50,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "spd_up",
            "value": 7,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "gold_cost",
            "value": 150,
            "target": "self"
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 18,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 83,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "magic_atk_up_pct",
            "value": 83,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "def_up_pct",
            "value": 69,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "spd_up",
            "value": 4,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "gold_cost",
            "value": 150,
            "target": "self"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 20,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 90,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "magic_atk_up_pct",
            "value": 90,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "def_up_pct",
            "value": 93,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "spd_up",
            "value": 6,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "gold_cost",
            "value": 150,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 90,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "magic_atk_up_pct",
            "value": 90,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "def_up_pct",
            "value": 106,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "spd_up",
            "value": 6,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "gold_cost",
            "value": 150,
            "target": "self"
          }
        ]
      }
    ]
  },
  "skill_merchant08": {
    "id": "skill_merchant08",
    "name": "赏金通缉",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "商人",
    "tags": [
      "execute",
      "pierce"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "single"
          },
          {
            "type": "execute",
            "value": 0.1,
            "target": "single",
            "chance": 1
          },
          {
            "type": "gold_cost",
            "value": 20,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 40,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "single"
          },
          {
            "type": "execute",
            "value": 0.2,
            "target": "single",
            "chance": 1
          },
          {
            "type": "gold_cost",
            "value": 50,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 45,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "single"
          },
          {
            "type": "execute",
            "value": 0.3,
            "target": "single",
            "chance": 1
          },
          {
            "type": "gold_cost",
            "value": 80,
            "target": "self"
          },
          {
            "type": "def_down_pct",
            "value": 37,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 50,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "single"
          },
          {
            "type": "execute",
            "value": 0.3,
            "target": "single",
            "chance": 1
          },
          {
            "type": "gold_cost",
            "value": 80,
            "target": "self"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 55,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "single"
          },
          {
            "type": "execute",
            "value": 0.3,
            "target": "single",
            "chance": 1
          },
          {
            "type": "gold_cost",
            "value": 80,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 60,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 685,
            "target": "single"
          },
          {
            "type": "execute",
            "value": 0.3,
            "target": "single",
            "chance": 1
          },
          {
            "type": "gold_cost",
            "value": 80,
            "target": "self"
          },
          {
            "type": "true_dmg",
            "value": 116,
            "target": "enemy_front_single"
          }
        ]
      }
    ]
  },
  "skill_merchant09": {
    "id": "skill_merchant09",
    "name": "金钱壁垒",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "商人",
    "tags": [
      "defense",
      "sustain"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up",
            "value": 2,
            "target": "ally_all"
          },
          {
            "type": "def_up_pct",
            "value": 20,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "hp_heal",
            "value": 570,
            "target": "ally_all"
          },
          {
            "type": "gold_cost",
            "value": 20,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 40,
        "proficiency": 50,
        "effects": [
          {
            "type": "def_up",
            "value": 5,
            "target": "ally_all"
          },
          {
            "type": "def_up_pct",
            "value": 38,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "hp_heal",
            "value": 570,
            "target": "ally_all"
          },
          {
            "type": "gold_cost",
            "value": 60,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 45,
        "proficiency": 180,
        "effects": [
          {
            "type": "def_up",
            "value": 7,
            "target": "ally_all"
          },
          {
            "type": "def_up_pct",
            "value": 55,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "hp_heal",
            "value": 570,
            "target": "ally_all"
          },
          {
            "type": "gold_cost",
            "value": 100,
            "target": "self"
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 50,
        "proficiency": 400,
        "effects": [
          {
            "type": "def_up",
            "value": 10,
            "target": "ally_all"
          },
          {
            "type": "def_up_pct",
            "value": 76,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "hp_heal",
            "value": 570,
            "target": "ally_all"
          },
          {
            "type": "gold_cost",
            "value": 100,
            "target": "self"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 55,
        "proficiency": 750,
        "effects": [
          {
            "type": "def_up",
            "value": 13,
            "target": "ally_all"
          },
          {
            "type": "def_up_pct",
            "value": 102,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "hp_heal",
            "value": 570,
            "target": "ally_all"
          },
          {
            "type": "gold_cost",
            "value": 100,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 60,
        "proficiency": 1000,
        "effects": [
          {
            "type": "def_up",
            "value": 18,
            "target": "ally_all"
          },
          {
            "type": "def_up_pct",
            "value": 117,
            "target": "ally_all",
            "duration": 5
          },
          {
            "type": "hp_heal",
            "value": 570,
            "target": "ally_all"
          },
          {
            "type": "gold_cost",
            "value": 100,
            "target": "self"
          }
        ]
      }
    ]
  },
  "skill_merchant10": {
    "id": "skill_merchant10",
    "name": "富可敌国",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "商人",
    "tags": [
      "buff",
      "execute"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "phys_atk_down_pct",
            "value": 25,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "gold_cost",
            "value": 40,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 40,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "phys_atk_down_pct",
            "value": 33,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "gold_cost",
            "value": 95,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 45,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "phys_atk_down_pct",
            "value": 40,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "gold_cost",
            "value": 150,
            "target": "self"
          },
          {
            "type": "spd_up",
            "value": 8,
            "target": "ally_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 50,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "phys_atk_down_pct",
            "value": 55,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "gold_cost",
            "value": 150,
            "target": "self"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 55,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "phys_atk_down_pct",
            "value": 74,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "gold_cost",
            "value": 150,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 60,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "phys_atk_down_pct",
            "value": 85,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "gold_cost",
            "value": 150,
            "target": "self"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 24,
            "target": "ally_all",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_alchemist01": {
    "id": "skill_alchemist01",
    "name": "酸液瓶",
    "category": "职业",
    "tier": "basic",
    "classLimit": "炼金术师",
    "tags": [
      "dot",
      "pierce"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 29,
            "target": "enemy_front_single"
          },
          {
            "type": "def_down_pct",
            "value": 15,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 6,
        "proficiency": 50,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 30,
            "target": "enemy_front_single"
          },
          {
            "type": "def_down_pct",
            "value": 30,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 8,
        "proficiency": 180,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 32,
            "target": "enemy_front_single"
          },
          {
            "type": "def_down_pct",
            "value": 55,
            "target": "enemy_front_single",
            "duration": 4
          },
          {
            "type": "burn",
            "value": 12,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 10,
        "proficiency": 400,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 33,
            "target": "enemy_front_single"
          },
          {
            "type": "def_down_pct",
            "value": 76,
            "target": "enemy_front_single",
            "duration": 4
          },
          {
            "type": "burn",
            "value": 17,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 12,
        "proficiency": 750,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 60,
            "target": "enemy_front_single"
          },
          {
            "type": "def_down_pct",
            "value": 90,
            "target": "enemy_front_single",
            "duration": 4
          },
          {
            "type": "burn",
            "value": 22,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 81,
            "target": "enemy_front_single"
          },
          {
            "type": "def_down_pct",
            "value": 90,
            "target": "enemy_front_single",
            "duration": 4
          },
          {
            "type": "burn",
            "value": 25,
            "target": "enemy_front_single",
            "duration": 3
          },
          {
            "type": "true_dmg",
            "value": 15,
            "target": "enemy_front_single"
          }
        ]
      }
    ]
  },
  "skill_alchemist02": {
    "id": "skill_alchemist02",
    "name": "燃烧瓶",
    "category": "职业",
    "tier": "basic",
    "classLimit": "炼金术师",
    "tags": [
      "dot",
      "aoe"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 14,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 13,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 6,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 14,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 15,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 14,
        "proficiency": 180,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 15,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 30,
            "target": "enemy_all",
            "duration": 4
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 15,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 41,
            "target": "enemy_all",
            "duration": 4
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 28,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 56,
            "target": "enemy_all",
            "duration": 4
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 37,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 64,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "def_down_pct",
            "value": 19,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_alchemist03": {
    "id": "skill_alchemist03",
    "name": "毒气弹",
    "category": "职业",
    "tier": "basic",
    "classLimit": "炼金术师",
    "tags": [
      "dot",
      "aoe"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 14,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 12,
            "target": "enemy_all"
          },
          {
            "type": "poison",
            "value": 8,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 13,
            "target": "enemy_all"
          },
          {
            "type": "poison",
            "value": 18,
            "target": "enemy_all",
            "duration": 4
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 14,
        "proficiency": 180,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 14,
            "target": "enemy_all"
          },
          {
            "type": "poison",
            "value": 35,
            "target": "enemy_all",
            "duration": 5
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 14,
            "target": "enemy_all"
          },
          {
            "type": "poison",
            "value": 48,
            "target": "enemy_all",
            "duration": 5
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 26,
            "target": "enemy_all"
          },
          {
            "type": "poison",
            "value": 65,
            "target": "enemy_all",
            "duration": 5
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 34,
            "target": "enemy_all"
          },
          {
            "type": "poison",
            "value": 74,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "def_down_pct",
            "value": 19,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_alchemist04": {
    "id": "skill_alchemist04",
    "name": "治疗药剂",
    "category": "职业",
    "tier": "basic",
    "classLimit": "炼金术师",
    "tags": [
      "heal",
      "defense"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "hp_heal",
            "value": 42,
            "target": "ally_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 10,
        "proficiency": 50,
        "effects": [
          {
            "type": "hp_heal",
            "value": 44,
            "target": "ally_single"
          },
          {
            "type": "cleanse",
            "value": 1,
            "target": "ally_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 180,
        "effects": [
          {
            "type": "hp_heal",
            "value": 46,
            "target": "ally_single"
          },
          {
            "type": "cleanse",
            "value": 99,
            "target": "ally_single",
            "duration": 0
          },
          {
            "type": "def_up",
            "value": 2,
            "target": "ally_single"
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "hp_heal",
            "value": 48,
            "target": "ally_single"
          },
          {
            "type": "cleanse",
            "value": 99,
            "target": "ally_single"
          },
          {
            "type": "def_up",
            "value": 2,
            "target": "ally_single"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "hp_heal",
            "value": 70,
            "target": "ally_single"
          },
          {
            "type": "cleanse",
            "value": 99,
            "target": "ally_single"
          },
          {
            "type": "def_up",
            "value": 3,
            "target": "ally_single"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "hp_heal",
            "value": 116,
            "target": "ally_single"
          },
          {
            "type": "cleanse",
            "value": 99,
            "target": "ally_single"
          },
          {
            "type": "def_up",
            "value": 5,
            "target": "ally_single"
          }
        ]
      }
    ]
  },
  "skill_alchemist05": {
    "id": "skill_alchemist05",
    "name": "强化药剂",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "炼金术师",
    "tags": [
      "buff",
      "defense"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 20,
            "target": "ally_single",
            "duration": 3
          },
          {
            "type": "magic_atk_up_pct",
            "value": 20,
            "target": "ally_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 40,
            "target": "ally_single",
            "duration": 4
          },
          {
            "type": "magic_atk_up_pct",
            "value": 40,
            "target": "ally_single",
            "duration": 4
          },
          {
            "type": "spd_up",
            "value": 2,
            "target": "ally_single",
            "duration": 4
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 16,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 75,
            "target": "ally_single",
            "duration": 5
          },
          {
            "type": "magic_atk_up_pct",
            "value": 75,
            "target": "ally_single",
            "duration": 5
          },
          {
            "type": "spd_up",
            "value": 4,
            "target": "ally_single",
            "duration": 5
          },
          {
            "type": "def_up",
            "value": 1,
            "target": "ally_single"
          },
          {
            "type": "spd_up",
            "value": 7,
            "target": "ally_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 18,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 90,
            "target": "ally_single",
            "duration": 5
          },
          {
            "type": "magic_atk_up_pct",
            "value": 90,
            "target": "ally_single",
            "duration": 5
          },
          {
            "type": "spd_up",
            "value": 6,
            "target": "ally_single",
            "duration": 5
          },
          {
            "type": "def_up",
            "value": 2,
            "target": "ally_single"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 20,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 90,
            "target": "ally_single",
            "duration": 5
          },
          {
            "type": "magic_atk_up_pct",
            "value": 90,
            "target": "ally_single",
            "duration": 5
          },
          {
            "type": "spd_up",
            "value": 7,
            "target": "ally_single",
            "duration": 5
          },
          {
            "type": "def_up",
            "value": 2,
            "target": "ally_single"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 90,
            "target": "ally_single",
            "duration": 5
          },
          {
            "type": "magic_atk_up_pct",
            "value": 90,
            "target": "ally_single",
            "duration": 5
          },
          {
            "type": "spd_up",
            "value": 8,
            "target": "ally_single",
            "duration": 5
          },
          {
            "type": "def_up",
            "value": 3,
            "target": "ally_single"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 19,
            "target": "ally_all",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_alchemist06": {
    "id": "skill_alchemist06",
    "name": "不稳定化合物",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "炼金术师",
    "tags": [
      "burst",
      "dot"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "random_dmg",
            "value": 214,
            "target": "enemy_front_single",
            "chance": 0.5,
            "lostHpRatio": 0.3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "random_dmg",
            "value": 225,
            "target": "enemy_front_single",
            "chance": 0.5,
            "lostHpRatio": 0.5
          },
          {
            "type": "burn",
            "value": 8,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 16,
        "proficiency": 180,
        "effects": [
          {
            "type": "random_dmg",
            "value": 236,
            "target": "enemy_front_single",
            "chance": 0.5,
            "lostHpRatio": 0.8
          },
          {
            "type": "burn",
            "value": 18,
            "target": "enemy_front_single",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 30,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 18,
        "proficiency": 400,
        "effects": [
          {
            "type": "random_dmg",
            "value": 247,
            "target": "enemy_front_single",
            "chance": 0.5,
            "lostHpRatio": 0.8
          },
          {
            "type": "burn",
            "value": 25,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 20,
        "proficiency": 750,
        "effects": [
          {
            "type": "random_dmg",
            "value": 322,
            "target": "enemy_front_single",
            "chance": 0.5,
            "lostHpRatio": 0.8
          },
          {
            "type": "burn",
            "value": 33,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "random_dmg",
            "value": 429,
            "target": "enemy_front_single",
            "chance": 0.5,
            "lostHpRatio": 0.8
          },
          {
            "type": "burn",
            "value": 38,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_alchemist07": {
    "id": "skill_alchemist07",
    "name": "神经毒素",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "炼金术师",
    "tags": [
      "dot",
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 105,
            "target": "enemy_front_single"
          },
          {
            "type": "confusion",
            "value": 0.15,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 110,
            "target": "enemy_front_single"
          },
          {
            "type": "confusion",
            "value": 0.25,
            "target": "enemy_front_single",
            "duration": 3
          },
          {
            "type": "poison",
            "value": 10,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 16,
        "proficiency": 180,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 116,
            "target": "enemy_front_single"
          },
          {
            "type": "confusion",
            "value": 0.4,
            "target": "enemy_front_single",
            "duration": 4
          },
          {
            "type": "poison",
            "value": 22,
            "target": "enemy_front_single",
            "duration": 5
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 18,
        "proficiency": 400,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 121,
            "target": "enemy_front_single"
          },
          {
            "type": "confusion",
            "value": 0.4,
            "target": "enemy_front_single",
            "duration": 4
          },
          {
            "type": "poison",
            "value": 30,
            "target": "enemy_front_single",
            "duration": 5
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 20,
        "proficiency": 750,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 158,
            "target": "enemy_front_single"
          },
          {
            "type": "confusion",
            "value": 0.4,
            "target": "enemy_front_single",
            "duration": 4
          },
          {
            "type": "poison",
            "value": 41,
            "target": "enemy_front_single",
            "duration": 5
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 210,
            "target": "enemy_front_single"
          },
          {
            "type": "confusion",
            "value": 0.4,
            "target": "enemy_front_single",
            "duration": 4
          },
          {
            "type": "poison",
            "value": 47,
            "target": "enemy_front_single",
            "duration": 5
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_alchemist08": {
    "id": "skill_alchemist08",
    "name": "禁忌实验",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "炼金术师",
    "tags": [
      "burst",
      "aoe"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "random_choice",
            "value": "s",
            "target": {
              "options": [
                [
                  [
                    "md",
                    45,
                    "ea"
                  ]
                ],
                [
                  [
                    "hh",
                    40,
                    "aa"
                  ]
                ],
                [
                  [
                    "pn",
                    8,
                    "ea",
                    {
                      "duration": 3
                    }
                  ]
                ]
              ]
            },
            "options": [
              [
                [
                  "md",
                  45,
                  "ea"
                ]
              ],
              [
                [
                  "hh",
                  40,
                  "aa"
                ]
              ],
              [
                [
                  "pn",
                  8,
                  "ea",
                  {
                    "duration": 3
                  }
                ]
              ]
            ]
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 40,
        "proficiency": 50,
        "effects": [
          {
            "type": "random_choice",
            "value": "s",
            "target": {
              "options": [
                [
                  [
                    "md",
                    95,
                    "ea"
                  ]
                ],
                [
                  [
                    "hh",
                    90,
                    "aa"
                  ]
                ],
                [
                  [
                    "pn",
                    18,
                    "ea",
                    {
                      "duration": 4
                    }
                  ],
                  [
                    "bn",
                    15,
                    "ea",
                    {
                      "duration": 3
                    }
                  ]
                ]
              ]
            },
            "options": [
              [
                [
                  "md",
                  95,
                  "ea"
                ]
              ],
              [
                [
                  "hh",
                  90,
                  "aa"
                ]
              ],
              [
                [
                  "pn",
                  18,
                  "ea",
                  {
                    "duration": 4
                  }
                ],
                [
                  "bn",
                  15,
                  "ea",
                  {
                    "duration": 3
                  }
                ]
              ]
            ]
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 45,
        "proficiency": 180,
        "effects": [
          {
            "type": "random_choice",
            "value": "s",
            "target": {
              "options": [
                [
                  [
                    "md",
                    190,
                    "ea"
                  ]
                ],
                [
                  [
                    "hh",
                    180,
                    "aa"
                  ]
                ],
                [
                  [
                    "pn",
                    35,
                    "ea",
                    {
                      "duration": 5
                    }
                  ],
                  [
                    "bn",
                    30,
                    "ea",
                    {
                      "duration": 4
                    }
                  ],
                  [
                    "sil",
                    2,
                    "ea"
                  ],
                  [
                    "cnf",
                    0.25,
                    "ea",
                    {
                      "duration": 3
                    }
                  ]
                ]
              ]
            },
            "options": [
              [
                [
                  "md",
                  190,
                  "ea"
                ]
              ],
              [
                [
                  "hh",
                  180,
                  "aa"
                ]
              ],
              [
                [
                  "pn",
                  35,
                  "ea",
                  {
                    "duration": 5
                  }
                ],
                [
                  "bn",
                  30,
                  "ea",
                  {
                    "duration": 4
                  }
                ],
                [
                  "sil",
                  2,
                  "ea"
                ],
                [
                  "cnf",
                  0.25,
                  "ea",
                  {
                    "duration": 3
                  }
                ]
              ]
            ]
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 50,
        "proficiency": 400,
        "effects": [
          {
            "type": "random_choice",
            "value": "s",
            "target": {
              "options": [
                [
                  [
                    "md",
                    190,
                    "ea"
                  ]
                ],
                [
                  [
                    "hh",
                    180,
                    "aa"
                  ]
                ],
                [
                  [
                    "pn",
                    35,
                    "ea",
                    {
                      "duration": 5
                    }
                  ],
                  [
                    "bn",
                    30,
                    "ea",
                    {
                      "duration": 4
                    }
                  ],
                  [
                    "sil",
                    2,
                    "ea"
                  ],
                  [
                    "cnf",
                    0.25,
                    "ea",
                    {
                      "duration": 3
                    }
                  ]
                ]
              ]
            },
            "options": [
              [
                [
                  "md",
                  190,
                  "ea"
                ]
              ],
              [
                [
                  "hh",
                  180,
                  "aa"
                ]
              ],
              [
                [
                  "pn",
                  35,
                  "ea",
                  {
                    "duration": 5
                  }
                ],
                [
                  "bn",
                  30,
                  "ea",
                  {
                    "duration": 4
                  }
                ],
                [
                  "sil",
                  2,
                  "ea"
                ],
                [
                  "cnf",
                  0.25,
                  "ea",
                  {
                    "duration": 3
                  }
                ]
              ]
            ]
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 55,
        "proficiency": 750,
        "effects": [
          {
            "type": "random_choice",
            "value": "s",
            "target": {
              "options": [
                [
                  [
                    "md",
                    190,
                    "ea"
                  ]
                ],
                [
                  [
                    "hh",
                    180,
                    "aa"
                  ]
                ],
                [
                  [
                    "pn",
                    35,
                    "ea",
                    {
                      "duration": 5
                    }
                  ],
                  [
                    "bn",
                    30,
                    "ea",
                    {
                      "duration": 4
                    }
                  ],
                  [
                    "sil",
                    2,
                    "ea"
                  ],
                  [
                    "cnf",
                    0.25,
                    "ea",
                    {
                      "duration": 3
                    }
                  ]
                ]
              ]
            },
            "options": [
              [
                [
                  "md",
                  190,
                  "ea"
                ]
              ],
              [
                [
                  "hh",
                  180,
                  "aa"
                ]
              ],
              [
                [
                  "pn",
                  35,
                  "ea",
                  {
                    "duration": 5
                  }
                ],
                [
                  "bn",
                  30,
                  "ea",
                  {
                    "duration": 4
                  }
                ],
                [
                  "sil",
                  2,
                  "ea"
                ],
                [
                  "cnf",
                  0.25,
                  "ea",
                  {
                    "duration": 3
                  }
                ]
              ]
            ]
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 60,
        "proficiency": 1000,
        "effects": [
          {
            "type": "random_choice",
            "value": "s",
            "target": {
              "options": [
                [
                  [
                    "md",
                    190,
                    "ea"
                  ]
                ],
                [
                  [
                    "hh",
                    180,
                    "aa"
                  ]
                ],
                [
                  [
                    "pn",
                    35,
                    "ea",
                    {
                      "duration": 5
                    }
                  ],
                  [
                    "bn",
                    30,
                    "ea",
                    {
                      "duration": 4
                    }
                  ],
                  [
                    "sil",
                    2,
                    "ea"
                  ],
                  [
                    "cnf",
                    0.25,
                    "ea",
                    {
                      "duration": 3
                    }
                  ]
                ]
              ]
            },
            "options": [
              [
                [
                  "md",
                  190,
                  "ea"
                ]
              ],
              [
                [
                  "hh",
                  180,
                  "aa"
                ]
              ],
              [
                [
                  "pn",
                  35,
                  "ea",
                  {
                    "duration": 5
                  }
                ],
                [
                  "bn",
                  30,
                  "ea",
                  {
                    "duration": 4
                  }
                ],
                [
                  "sil",
                  2,
                  "ea"
                ],
                [
                  "cnf",
                  0.25,
                  "ea",
                  {
                    "duration": 3
                  }
                ]
              ]
            ]
          }
        ]
      }
    ]
  },
  "skill_alchemist09": {
    "id": "skill_alchemist09",
    "name": "大爆炸",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "炼金术师",
    "tags": [
      "aoe",
      "dot"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 10,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "gold_cost",
            "value": 0.1,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 40,
        "proficiency": 50,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 22,
            "target": "enemy_all",
            "duration": 4
          },
          {
            "type": "def_down_pct",
            "value": 20,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "gold_cost",
            "value": 0.15,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 45,
        "proficiency": 180,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 40,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "def_down_pct",
            "value": 40,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          },
          {
            "type": "gold_cost",
            "value": 0.25,
            "target": "self"
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 50,
        "proficiency": 400,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 55,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "def_down_pct",
            "value": 55,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          },
          {
            "type": "gold_cost",
            "value": 0.25,
            "target": "self"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 55,
        "proficiency": 750,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 74,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "def_down_pct",
            "value": 74,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          },
          {
            "type": "gold_cost",
            "value": 0.25,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 60,
        "proficiency": 1000,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 684,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 85,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "def_down_pct",
            "value": 85,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          },
          {
            "type": "gold_cost",
            "value": 0.25,
            "target": "self"
          }
        ]
      }
    ]
  },
  "skill_beast01": {
    "id": "skill_beast01",
    "name": "冲撞",
    "category": "野兽",
    "tier": "basic",
    "classLimit": "兽",
    "tags": [
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 3,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 16,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 3,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 40,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 5,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 40,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 76,
            "target": "enemy_front_single"
          },
          {
            "type": "execute",
            "value": 0.1,
            "target": "enemy_front_single",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_beast02": {
    "id": "skill_beast02",
    "name": "连续跳",
    "category": "野兽",
    "tier": "basic",
    "classLimit": "兽",
    "tags": [
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 5,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 10,
            "target": "enemy_front_single",
            "count": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 6,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 25,
            "target": "enemy_front_single",
            "count": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 25,
            "target": "enemy_front_single",
            "count": 2
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 11,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 48,
            "target": "enemy_front_single",
            "count": 2
          },
          {
            "type": "execute",
            "value": 0.1,
            "target": "enemy_front_single",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_beast03": {
    "id": "skill_beast03",
    "name": "啃咬",
    "category": "野兽",
    "tier": "basic",
    "classLimit": "兽",
    "tags": [
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 20,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 5,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 50,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 7,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 50,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 10,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 95,
            "target": "enemy_front_single"
          },
          {
            "type": "execute",
            "value": 0.1,
            "target": "enemy_front_single",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_beast04": {
    "id": "skill_beast04",
    "name": "狼撕咬",
    "category": "野兽",
    "tier": "basic",
    "classLimit": "兽",
    "tags": [
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 5,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 25,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 6,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 64,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 64,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 11,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 121,
            "target": "enemy_front_single"
          },
          {
            "type": "execute",
            "value": 0.1,
            "target": "enemy_front_single",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_beast05": {
    "id": "skill_beast05",
    "name": "嚎叫",
    "category": "野兽",
    "tier": "basic",
    "classLimit": "兽",
    "tags": [
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 6,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 15,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 7,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 18,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 9,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 25,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 38,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "confusion",
            "value": 0.4,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_beast06": {
    "id": "skill_beast06",
    "name": "猛扑",
    "category": "野兽",
    "tier": "basic",
    "classLimit": "兽",
    "tags": [
      "heavy",
      "fast"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 7,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 25,
            "target": "enemy_front_single"
          },
          {
            "type": "spd_up",
            "value": 3,
            "target": "self",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 64,
            "target": "enemy_front_single"
          },
          {
            "type": "spd_up",
            "value": 4,
            "target": "self",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 10,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 64,
            "target": "enemy_front_single"
          },
          {
            "type": "spd_up",
            "value": 6,
            "target": "self",
            "duration": 2
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 13,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 121,
            "target": "enemy_front_single"
          },
          {
            "type": "spd_up",
            "value": 8,
            "target": "self",
            "duration": 2
          },
          {
            "type": "execute",
            "value": 0.1,
            "target": "enemy_front_single",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_beast07": {
    "id": "skill_beast07",
    "name": "熊掌拍击",
    "category": "野兽",
    "tier": "basic",
    "classLimit": "兽",
    "tags": [
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 6,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 25,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 7,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 64,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 9,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 64,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 121,
            "target": "enemy_front_single"
          },
          {
            "type": "execute",
            "value": 0.1,
            "target": "enemy_front_single",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_beast08": {
    "id": "skill_beast08",
    "name": "咆哮",
    "category": "野兽",
    "tier": "basic",
    "classLimit": "兽",
    "tags": [
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 20,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 9,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 24,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 11,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 33,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 15,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 51,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "confusion",
            "value": 0.4,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_beast09": {
    "id": "skill_beast09",
    "name": "狂暴",
    "category": "野兽",
    "tier": "advanced",
    "classLimit": "兽",
    "tags": [
      "buff"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 10,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 30,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 35,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 15,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 48,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 20,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 74,
            "target": "self",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_human01": {
    "id": "skill_human01",
    "name": "短剑突刺",
    "category": "人类",
    "tier": "basic",
    "classLimit": "人",
    "tags": [
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 7,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 5,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 13,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 7,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 13,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 10,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 26,
            "target": "enemy_front_single"
          },
          {
            "type": "execute",
            "value": 0.1,
            "target": "enemy_front_single",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_human02": {
    "id": "skill_human02",
    "name": "投掷石块",
    "category": "人类",
    "tier": "basic",
    "classLimit": "人",
    "tags": [
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 3,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 5,
            "target": "enemy_back_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 3,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 11,
            "target": "enemy_back_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 5,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 11,
            "target": "enemy_back_single"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 22,
            "target": "enemy_back_single"
          },
          {
            "type": "execute",
            "value": 0.1,
            "target": "enemy_back_single",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_human03": {
    "id": "skill_human03",
    "name": "抢掠",
    "category": "人类",
    "tier": "basic",
    "classLimit": "人",
    "tags": [
      "heavy",
      "execute"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 6,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 4,
            "target": "enemy_front_single"
          },
          {
            "type": "gold_steal",
            "value": 5,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 7,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 8,
            "target": "enemy_front_single"
          },
          {
            "type": "gold_steal",
            "value": 6,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 9,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 8,
            "target": "enemy_front_single"
          },
          {
            "type": "gold_steal",
            "value": 8,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 16,
            "target": "enemy_front_single"
          },
          {
            "type": "gold_steal",
            "value": 13,
            "target": "self"
          },
          {
            "type": "execute",
            "value": 0.14,
            "target": "enemy_front_single",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_human04": {
    "id": "skill_human04",
    "name": "木棍敲打",
    "category": "人类",
    "tier": "basic",
    "classLimit": "人",
    "tags": [
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 2,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 4,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 2,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 8,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 8,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 7,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 17,
            "target": "enemy_front_single"
          },
          {
            "type": "execute",
            "value": 0.1,
            "target": "enemy_front_single",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_human05": {
    "id": "skill_human05",
    "name": "扔石头",
    "category": "人类",
    "tier": "basic",
    "classLimit": "人",
    "tags": [
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 3,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 4,
            "target": "enemy_back_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 3,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 8,
            "target": "enemy_back_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 5,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 8,
            "target": "enemy_back_single"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 17,
            "target": "enemy_back_single"
          },
          {
            "type": "execute",
            "value": 0.1,
            "target": "enemy_back_single",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_human06": {
    "id": "skill_human06",
    "name": "绝望一击",
    "category": "人类",
    "tier": "basic",
    "classLimit": "人",
    "tags": [
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 5,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 7,
            "target": "enemy_front_single"
          },
          {
            "type": "gold_cost",
            "value": 5,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 6,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 13,
            "target": "enemy_front_single"
          },
          {
            "type": "gold_cost",
            "value": 6,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 13,
            "target": "enemy_front_single"
          },
          {
            "type": "gold_cost",
            "value": 6,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 11,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 26,
            "target": "enemy_front_single"
          },
          {
            "type": "gold_cost",
            "value": 6,
            "target": "self"
          },
          {
            "type": "execute",
            "value": 0.1,
            "target": "enemy_front_single",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_beast10": {
    "id": "skill_beast10",
    "name": "熊撕咬",
    "category": "野兽",
    "tier": "advanced",
    "classLimit": "兽",
    "tags": [
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 3,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 45,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 3,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 115,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 5,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 115,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 218,
            "target": "enemy_front_single"
          },
          {
            "type": "execute",
            "value": 0.14,
            "target": "enemy_front_single",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_beast11": {
    "id": "skill_beast11",
    "name": "怒吼",
    "category": "野兽",
    "tier": "advanced",
    "classLimit": "兽",
    "tags": [
      "heavy",
      "aoe"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 5,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 45,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 6,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 115,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 115,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 11,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 218,
            "target": "enemy_all"
          },
          {
            "type": "execute",
            "value": 0.14,
            "target": "enemy_all",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_monster01": {
    "id": "skill_monster01",
    "name": "威吓",
    "category": "魔兽",
    "tier": "basic",
    "classLimit": "兽",
    "tags": [
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 10,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 5,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 12,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 7,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 17,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 10,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 25,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "confusion",
            "value": 0.4,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_beast12": {
    "id": "skill_beast12",
    "name": "疾驰",
    "category": "野兽",
    "tier": "advanced",
    "classLimit": "兽",
    "tags": [
      "fast"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "spd_up",
            "value": 3,
            "target": "self",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 5,
        "proficiency": 0,
        "effects": [
          {
            "type": "spd_up",
            "value": 4,
            "target": "self",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 7,
        "proficiency": 0,
        "effects": [
          {
            "type": "spd_up",
            "value": 6,
            "target": "self",
            "duration": 2
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 10,
        "proficiency": 0,
        "effects": [
          {
            "type": "spd_up",
            "value": 8,
            "target": "self",
            "duration": 2
          },
          {
            "type": "phys_atk_up_pct",
            "value": 19,
            "target": "self",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_beast13": {
    "id": "skill_beast13",
    "name": "硬化",
    "category": "野兽",
    "tier": "advanced",
    "classLimit": "兽",
    "tags": [
      "defense",
      "counter"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 5,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up",
            "value": 1,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 6,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up",
            "value": 1,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up",
            "value": 1,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 11,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up",
            "value": 4,
            "target": "self"
          }
        ]
      }
    ]
  },
  "skill_beast14": {
    "id": "skill_beast14",
    "name": "自愈",
    "category": "野兽",
    "tier": "advanced",
    "classLimit": "兽",
    "tags": [
      "heal"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 5,
        "proficiency": 0,
        "effects": [
          {
            "type": "hp_heal",
            "value": 65,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 6,
        "proficiency": 0,
        "effects": [
          {
            "type": "hp_heal",
            "value": 166,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "hp_heal",
            "value": 166,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 11,
        "proficiency": 0,
        "effects": [
          {
            "type": "hp_heal",
            "value": 314,
            "target": "self"
          },
          {
            "type": "def_up",
            "value": 2,
            "target": "self"
          }
        ]
      }
    ]
  },
  "skill_beast15": {
    "id": "skill_beast15",
    "name": "毒牙",
    "category": "野兽",
    "tier": "ultimate",
    "classLimit": "兽",
    "tags": [
      "heavy",
      "dot"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 95,
            "target": "enemy_front_single"
          },
          {
            "type": "poison",
            "value": 3,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 5,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 242,
            "target": "enemy_front_single"
          },
          {
            "type": "poison",
            "value": 4,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 7,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 242,
            "target": "enemy_front_single"
          },
          {
            "type": "poison",
            "value": 6,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 10,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 459,
            "target": "enemy_front_single"
          },
          {
            "type": "poison",
            "value": 22,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_beast16": {
    "id": "skill_beast16",
    "name": "火焰爪",
    "category": "野兽",
    "tier": "ultimate",
    "classLimit": "兽",
    "tags": [
      "heavy",
      "dot"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 95,
            "target": "enemy_front_single"
          },
          {
            "type": "burn",
            "value": 3,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 5,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 242,
            "target": "enemy_front_single"
          },
          {
            "type": "burn",
            "value": 4,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 7,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 242,
            "target": "enemy_front_single"
          },
          {
            "type": "burn",
            "value": 6,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 10,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 459,
            "target": "enemy_front_single"
          },
          {
            "type": "burn",
            "value": 22,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_monster02": {
    "id": "skill_monster02",
    "name": "封锁",
    "category": "魔兽",
    "tier": "basic",
    "classLimit": "兽",
    "tags": [
      "heavy",
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 5,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 30,
            "target": "enemy_front_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 6,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 77,
            "target": "enemy_front_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 77,
            "target": "enemy_front_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 11,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 145,
            "target": "enemy_front_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_monster03": {
    "id": "skill_monster03",
    "name": "猛击",
    "category": "魔兽",
    "tier": "basic",
    "classLimit": "兽",
    "tags": [
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 5,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 38,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 6,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 96,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 96,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 11,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 180,
            "target": "enemy_front_single"
          },
          {
            "type": "execute",
            "value": 0.1,
            "target": "enemy_front_single",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_monster04": {
    "id": "skill_monster04",
    "name": "巨兽横扫",
    "category": "魔兽",
    "tier": "basic",
    "classLimit": "兽",
    "tags": [
      "heavy",
      "aoe"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 7,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 30,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 77,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 10,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 77,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 13,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 145,
            "target": "enemy_all"
          },
          {
            "type": "execute",
            "value": 0.1,
            "target": "enemy_all",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_monster05": {
    "id": "skill_monster05",
    "name": "威吓·强",
    "category": "魔兽",
    "tier": "basic",
    "classLimit": "兽",
    "tags": [
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 6,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 15,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 7,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 18,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 9,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 25,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 38,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "confusion",
            "value": 0.4,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_monster06": {
    "id": "skill_monster06",
    "name": "神速",
    "category": "魔兽",
    "tier": "basic",
    "classLimit": "兽",
    "tags": [
      "fast"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 6,
        "proficiency": 0,
        "effects": [
          {
            "type": "spd_up",
            "value": 6,
            "target": "self",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 7,
        "proficiency": 0,
        "effects": [
          {
            "type": "spd_up",
            "value": 7,
            "target": "self",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 9,
        "proficiency": 0,
        "effects": [
          {
            "type": "spd_up",
            "value": 10,
            "target": "self",
            "duration": 2
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "spd_up",
            "value": 15,
            "target": "self",
            "duration": 2
          },
          {
            "type": "phys_atk_up_pct",
            "value": 14,
            "target": "self",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_monster07": {
    "id": "skill_monster07",
    "name": "硬甲",
    "category": "魔兽",
    "tier": "basic",
    "classLimit": "兽",
    "tags": [
      "defense",
      "counter"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up",
            "value": 3,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 9,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up",
            "value": 4,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 11,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up",
            "value": 5,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 15,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up",
            "value": 10,
            "target": "self"
          }
        ]
      }
    ]
  },
  "skill_beast17": {
    "id": "skill_beast17",
    "name": "再生",
    "category": "野兽",
    "tier": "ultimate",
    "classLimit": "兽",
    "tags": [
      "heal"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "hp_heal",
            "value": 120,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 9,
        "proficiency": 0,
        "effects": [
          {
            "type": "hp_heal",
            "value": 306,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 11,
        "proficiency": 0,
        "effects": [
          {
            "type": "hp_heal",
            "value": 306,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 15,
        "proficiency": 0,
        "effects": [
          {
            "type": "hp_heal",
            "value": 580,
            "target": "self"
          },
          {
            "type": "def_up",
            "value": 3,
            "target": "self"
          }
        ]
      }
    ]
  },
  "skill_beast18": {
    "id": "skill_beast18",
    "name": "剧毒",
    "category": "野兽",
    "tier": "ultimate",
    "classLimit": "兽",
    "tags": [
      "heavy",
      "dot"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 6,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 108,
            "target": "enemy_front_single"
          },
          {
            "type": "poison",
            "value": 12,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 7,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 274,
            "target": "enemy_front_single"
          },
          {
            "type": "poison",
            "value": 14,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 9,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 274,
            "target": "enemy_front_single"
          },
          {
            "type": "poison",
            "value": 19,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 520,
            "target": "enemy_front_single"
          },
          {
            "type": "poison",
            "value": 30,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_beast19": {
    "id": "skill_beast19",
    "name": "烈焰",
    "category": "野兽",
    "tier": "ultimate",
    "classLimit": "兽",
    "tags": [
      "heavy",
      "dot"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 6,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 120,
            "target": "enemy_front_single"
          },
          {
            "type": "burn",
            "value": 10,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 7,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 306,
            "target": "enemy_front_single"
          },
          {
            "type": "burn",
            "value": 12,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 9,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 306,
            "target": "enemy_front_single"
          },
          {
            "type": "burn",
            "value": 17,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 580,
            "target": "enemy_front_single"
          },
          {
            "type": "burn",
            "value": 25,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_monster08": {
    "id": "skill_monster08",
    "name": "禁言",
    "category": "魔兽",
    "tier": "basic",
    "classLimit": "兽",
    "tags": [
      "heavy",
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 42,
            "target": "enemy_front_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 9,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 106,
            "target": "enemy_front_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 11,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 106,
            "target": "enemy_front_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 15,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 199,
            "target": "enemy_front_single"
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_monster09": {
    "id": "skill_monster09",
    "name": "撕裂",
    "category": "魔兽",
    "tier": "basic",
    "classLimit": "兽",
    "tags": [
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 7,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 45,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 115,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 10,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 115,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 13,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 218,
            "target": "enemy_front_single"
          },
          {
            "type": "execute",
            "value": 0.1,
            "target": "enemy_front_single",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_monster10": {
    "id": "skill_monster10",
    "name": "冲击波",
    "category": "魔兽",
    "tier": "basic",
    "classLimit": "兽",
    "tags": [
      "heavy",
      "aoe"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 10,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 30,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 77,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 15,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 77,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 20,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 145,
            "target": "enemy_all"
          },
          {
            "type": "execute",
            "value": 0.1,
            "target": "enemy_all",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_monster11": {
    "id": "skill_monster11",
    "name": "恐吓",
    "category": "魔兽",
    "tier": "basic",
    "classLimit": "兽",
    "tags": [
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 18,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 9,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 21,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 11,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 29,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 15,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 45,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "confusion",
            "value": 0.4,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_monster12": {
    "id": "skill_monster12",
    "name": "强力猛击",
    "category": "魔兽",
    "tier": "advanced",
    "classLimit": "兽",
    "tags": [
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 9,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 95,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 10,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 242,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 242,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 17,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 459,
            "target": "enemy_front_single"
          },
          {
            "type": "execute",
            "value": 0.14,
            "target": "enemy_front_single",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_monster13": {
    "id": "skill_monster13",
    "name": "裂地",
    "category": "魔兽",
    "tier": "advanced",
    "classLimit": "兽",
    "tags": [
      "heavy",
      "aoe"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 75,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 191,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 17,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 191,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 23,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 363,
            "target": "enemy_all"
          },
          {
            "type": "execute",
            "value": 0.14,
            "target": "enemy_all",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_monster14": {
    "id": "skill_monster14",
    "name": "震恐",
    "category": "魔兽",
    "tier": "advanced",
    "classLimit": "兽",
    "tags": [
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 10,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 20,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 24,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 15,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 33,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 20,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 51,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "confusion",
            "value": 0.4,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_monster15": {
    "id": "skill_monster15",
    "name": "裂骨击",
    "category": "魔兽",
    "tier": "advanced",
    "classLimit": "兽",
    "tags": [
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 11,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 95,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 13,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 242,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 242,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 21,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 459,
            "target": "enemy_front_single"
          },
          {
            "type": "execute",
            "value": 0.14,
            "target": "enemy_front_single",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_monster16": {
    "id": "skill_monster16",
    "name": "大地震颤",
    "category": "魔兽",
    "tier": "advanced",
    "classLimit": "兽",
    "tags": [
      "heavy",
      "aoe"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 14,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 75,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 191,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 20,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 191,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 26,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 363,
            "target": "enemy_all"
          },
          {
            "type": "execute",
            "value": 0.14,
            "target": "enemy_all",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_monster17": {
    "id": "skill_monster17",
    "name": "战栗",
    "category": "魔兽",
    "tier": "advanced",
    "classLimit": "兽",
    "tags": [
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 22,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 26,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 17,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 36,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 23,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 55,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "confusion",
            "value": 0.4,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_monster18": {
    "id": "skill_monster18",
    "name": "碎骨",
    "category": "魔兽",
    "tier": "advanced",
    "classLimit": "兽",
    "tags": [
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 13,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 95,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 15,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 242,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 19,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 242,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 25,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 459,
            "target": "enemy_front_single"
          },
          {
            "type": "execute",
            "value": 0.14,
            "target": "enemy_front_single",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_monster19": {
    "id": "skill_monster19",
    "name": "冲击地裂",
    "category": "魔兽",
    "tier": "advanced",
    "classLimit": "兽",
    "tags": [
      "heavy",
      "aoe"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 75,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 18,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 191,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 22,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 191,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 30,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 363,
            "target": "enemy_all"
          },
          {
            "type": "execute",
            "value": 0.14,
            "target": "enemy_all",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_monster20": {
    "id": "skill_monster20",
    "name": "绝望之音",
    "category": "魔兽",
    "tier": "advanced",
    "classLimit": "兽",
    "tags": [
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 14,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 25,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 30,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 20,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 41,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 26,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 64,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "confusion",
            "value": 0.4,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_monster21": {
    "id": "skill_monster21",
    "name": "毁灭击",
    "category": "魔兽",
    "tier": "advanced",
    "classLimit": "兽",
    "tags": [
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 15,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 95,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 17,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 242,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 21,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 242,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 28,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 459,
            "target": "enemy_front_single"
          },
          {
            "type": "execute",
            "value": 0.14,
            "target": "enemy_front_single",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_monster22": {
    "id": "skill_monster22",
    "name": "崩坏",
    "category": "魔兽",
    "tier": "advanced",
    "classLimit": "兽",
    "tags": [
      "heavy",
      "aoe"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 18,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 75,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 21,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 191,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 26,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 191,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 363,
            "target": "enemy_all"
          },
          {
            "type": "execute",
            "value": 0.14,
            "target": "enemy_all",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_monster23": {
    "id": "skill_monster23",
    "name": "恐惧领域",
    "category": "魔兽",
    "tier": "advanced",
    "classLimit": "兽",
    "tags": [
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 28,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 18,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 33,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 22,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 46,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 30,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 70,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "confusion",
            "value": 0.4,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_monster24": {
    "id": "skill_monster24",
    "name": "终末斩",
    "category": "魔兽",
    "tier": "ultimate",
    "classLimit": "兽",
    "tags": [
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 17,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 160,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 20,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 408,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 25,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 408,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 33,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 774,
            "target": "enemy_front_single"
          },
          {
            "type": "execute",
            "value": 0.17,
            "target": "enemy_front_single",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_monster25": {
    "id": "skill_monster25",
    "name": "灭世裂",
    "category": "魔兽",
    "tier": "ultimate",
    "classLimit": "兽",
    "tags": [
      "heavy",
      "aoe"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 20,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 130,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 23,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 332,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 29,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 332,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 38,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 629,
            "target": "enemy_all"
          },
          {
            "type": "execute",
            "value": 0.17,
            "target": "enemy_all",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_monster26": {
    "id": "skill_monster26",
    "name": "降魔咒",
    "category": "魔兽",
    "tier": "ultimate",
    "classLimit": "兽",
    "tags": [
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 18,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 30,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 21,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 35,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 26,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 48,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 74,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "confusion",
            "value": 0.4,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_monster27": {
    "id": "skill_monster27",
    "name": "湮灭击",
    "category": "魔兽",
    "tier": "ultimate",
    "classLimit": "兽",
    "tags": [
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 19,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 160,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 22,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 408,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 27,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 408,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 36,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 774,
            "target": "enemy_front_single"
          },
          {
            "type": "execute",
            "value": 0.17,
            "target": "enemy_front_single",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_monster28": {
    "id": "skill_monster28",
    "name": "末日",
    "category": "魔兽",
    "tier": "ultimate",
    "classLimit": "兽",
    "tags": [
      "heavy",
      "aoe"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 22,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 130,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 25,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 332,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 31,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 332,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 41,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 629,
            "target": "enemy_all"
          },
          {
            "type": "execute",
            "value": 0.17,
            "target": "enemy_all",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_monster29": {
    "id": "skill_monster29",
    "name": "神明压制",
    "category": "魔兽",
    "tier": "ultimate",
    "classLimit": "兽",
    "tags": [
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 20,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 32,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 23,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 38,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 29,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 52,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 38,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 81,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "confusion",
            "value": 0.4,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_monster30": {
    "id": "skill_monster30",
    "name": "终焉",
    "category": "魔兽",
    "tier": "ultimate",
    "classLimit": "兽",
    "tags": [
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 22,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 160,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 25,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 408,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 31,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 408,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 41,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 774,
            "target": "enemy_front_single"
          },
          {
            "type": "execute",
            "value": 0.17,
            "target": "enemy_front_single",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_monster31": {
    "id": "skill_monster31",
    "name": "万劫",
    "category": "魔兽",
    "tier": "ultimate",
    "classLimit": "兽",
    "tags": [
      "heavy",
      "aoe"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 25,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 130,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 29,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 332,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 36,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 332,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 48,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 629,
            "target": "enemy_all"
          },
          {
            "type": "execute",
            "value": 0.17,
            "target": "enemy_all",
            "chance": 1
          }
        ]
      }
    ]
  },
  "skill_monster32": {
    "id": "skill_monster32",
    "name": "诸神黄昏",
    "category": "魔兽",
    "tier": "ultimate",
    "classLimit": "兽",
    "tags": [
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 24,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 35,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 28,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 41,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 57,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 46,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 87,
            "target": "enemy_all",
            "duration": 2
          },
          {
            "type": "confusion",
            "value": 0.4,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_monster33": {
    "id": "skill_monster33",
    "name": "大治愈",
    "category": "魔兽",
    "tier": "ultimate",
    "classLimit": "兽",
    "tags": [
      "heal"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 10,
        "proficiency": 0,
        "effects": [
          {
            "type": "hp_heal",
            "value": 145,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "hp_heal",
            "value": 370,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 15,
        "proficiency": 0,
        "effects": [
          {
            "type": "hp_heal",
            "value": 370,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 20,
        "proficiency": 0,
        "effects": [
          {
            "type": "hp_heal",
            "value": 700,
            "target": "self"
          },
          {
            "type": "def_up",
            "value": 3,
            "target": "self"
          }
        ]
      }
    ]
  },
  "skill_monster34": {
    "id": "skill_monster34",
    "name": "钢化",
    "category": "魔兽",
    "tier": "ultimate",
    "classLimit": "兽",
    "tags": [
      "defense",
      "counter"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 10,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up",
            "value": 6,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up",
            "value": 7,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 15,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up",
            "value": 10,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 20,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up",
            "value": 18,
            "target": "self"
          }
        ]
      }
    ]
  },
  "skill_monster35": {
    "id": "skill_monster35",
    "name": "炎爆",
    "category": "魔兽",
    "tier": "ultimate",
    "classLimit": "兽",
    "tags": [
      "heavy",
      "dot"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 130,
            "target": "enemy_front_single"
          },
          {
            "type": "burn",
            "value": 15,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 9,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 332,
            "target": "enemy_front_single"
          },
          {
            "type": "burn",
            "value": 18,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 11,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 332,
            "target": "enemy_front_single"
          },
          {
            "type": "burn",
            "value": 25,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 15,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 629,
            "target": "enemy_front_single"
          },
          {
            "type": "burn",
            "value": 38,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_alchemist10": {
    "id": "skill_alchemist10",
    "name": "贤者之石",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "炼金术师",
    "tags": [
      "aoe",
      "burst",
      "dot"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 12,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "def_down_pct",
            "value": 30,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          },
          {
            "type": "gold_cost",
            "value": 0.1,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 40,
        "proficiency": 50,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 29,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "def_down_pct",
            "value": 35,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          },
          {
            "type": "gold_cost",
            "value": 0.18,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 45,
        "proficiency": 180,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 45,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "def_down_pct",
            "value": 40,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          },
          {
            "type": "gold_cost",
            "value": 0.25,
            "target": "self"
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 50,
        "proficiency": 400,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 62,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "def_down_pct",
            "value": 55,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          },
          {
            "type": "gold_cost",
            "value": 0.25,
            "target": "self"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 55,
        "proficiency": 750,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 632,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 83,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "def_down_pct",
            "value": 74,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          },
          {
            "type": "gold_cost",
            "value": 0.25,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 60,
        "proficiency": 1000,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 778,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 95,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "def_down_pct",
            "value": 85,
            "target": "enemy_all",
            "duration": 5
          },
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          },
          {
            "type": "gold_cost",
            "value": 0.25,
            "target": "self"
          }
        ]
      }
    ]
  },
  "skill_human07": {
    "id": "skill_human07",
    "name": "卫士格挡",
    "category": "人类",
    "tier": "basic",
    "classLimit": "人",
    "tags": [
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up",
            "value": 1,
            "target": "self"
          },
          {
            "type": "def_up_pct",
            "value": 20,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up",
            "value": 2,
            "target": "self"
          },
          {
            "type": "def_up_pct",
            "value": 35,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up",
            "value": 4,
            "target": "self"
          },
          {
            "type": "def_up_pct",
            "value": 50,
            "target": "self",
            "duration": 4
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up",
            "value": 5,
            "target": "self"
          },
          {
            "type": "def_up_pct",
            "value": 60,
            "target": "self",
            "duration": 4
          }
        ]
      }
    ]
  },
  "skill_human08": {
    "id": "skill_human08",
    "name": "弓手射击",
    "category": "人类",
    "tier": "basic",
    "classLimit": "人",
    "tags": [
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 7,
            "target": "enemy_back_single"
          },
          {
            "type": "spd_down",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 13,
            "target": "enemy_back_single"
          },
          {
            "type": "spd_down",
            "value": 2,
            "target": "enemy_back_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 13,
            "target": "enemy_back_single"
          },
          {
            "type": "spd_down",
            "value": 3,
            "target": "enemy_back_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 26,
            "target": "enemy_back_single"
          },
          {
            "type": "spd_down",
            "value": 3,
            "target": "enemy_back_single",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_human09": {
    "id": "skill_human09",
    "name": "火把投掷",
    "category": "人类",
    "tier": "basic",
    "classLimit": "人",
    "tags": [
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 5,
            "target": "enemy_front_single"
          },
          {
            "type": "burn",
            "value": 4,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 11,
            "target": "enemy_front_single"
          },
          {
            "type": "burn",
            "value": 8,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 11,
            "target": "enemy_front_single"
          },
          {
            "type": "burn",
            "value": 12,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 22,
            "target": "enemy_front_single"
          },
          {
            "type": "burn",
            "value": 15,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_human10": {
    "id": "skill_human10",
    "name": "佣兵连斩",
    "category": "人类",
    "tier": "advanced",
    "classLimit": "人",
    "tags": [
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 15,
            "target": "enemy_front_single"
          },
          {
            "type": "multi_hit",
            "value": 2,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 38,
            "target": "enemy_front_single"
          },
          {
            "type": "multi_hit",
            "value": 2,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 38,
            "target": "enemy_front_single"
          },
          {
            "type": "multi_hit",
            "value": 2,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 73,
            "target": "enemy_front_single"
          },
          {
            "type": "multi_hit",
            "value": 2,
            "target": "self"
          }
        ]
      }
    ]
  },
  "skill_human11": {
    "id": "skill_human11",
    "name": "队长号令",
    "category": "人类",
    "tier": "advanced",
    "classLimit": "人",
    "tags": [
      "buff"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 10,
            "target": "ally_all"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 10,
            "target": "ally_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 17,
            "target": "ally_all"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 17,
            "target": "ally_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 24,
            "target": "ally_all"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 24,
            "target": "ally_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 30,
            "target": "ally_all"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 30,
            "target": "ally_all",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_human12": {
    "id": "skill_human12",
    "name": "亡命反击",
    "category": "人类",
    "tier": "advanced",
    "classLimit": "人",
    "tags": [
      "counter"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "counter",
            "value": 1,
            "target": "self"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 10,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "counter",
            "value": 1,
            "target": "self"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 20,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "counter",
            "value": 2,
            "target": "self"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 30,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "counter",
            "value": 2,
            "target": "self"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 40,
            "target": "self",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_beast20": {
    "id": "skill_beast20",
    "name": "撕扯",
    "category": "野兽",
    "tier": "advanced",
    "classLimit": "野兽",
    "tags": [
      "dot"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 65,
            "target": "enemy_front_single"
          },
          {
            "type": "bleed",
            "value": 4,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 166,
            "target": "enemy_front_single"
          },
          {
            "type": "bleed",
            "value": 8,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 166,
            "target": "enemy_front_single"
          },
          {
            "type": "bleed",
            "value": 12,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 314,
            "target": "enemy_front_single"
          },
          {
            "type": "bleed",
            "value": 15,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_beast21": {
    "id": "skill_beast21",
    "name": "毒尾",
    "category": "野兽",
    "tier": "basic",
    "classLimit": "野兽",
    "tags": [
      "dot"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 20,
            "target": "enemy_front_single"
          },
          {
            "type": "poison",
            "value": 4,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 50,
            "target": "enemy_front_single"
          },
          {
            "type": "poison",
            "value": 9,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 50,
            "target": "enemy_front_single"
          },
          {
            "type": "poison",
            "value": 14,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 95,
            "target": "enemy_front_single"
          },
          {
            "type": "poison",
            "value": 18,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_beast22": {
    "id": "skill_beast22",
    "name": "震地",
    "category": "野兽",
    "tier": "advanced",
    "classLimit": "野兽",
    "tags": [
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 45,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 115,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 115,
            "target": "enemy_all"
          },
          {
            "type": "stun",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 218,
            "target": "enemy_all"
          },
          {
            "type": "stun",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          }
        ]
      }
    ]
  },
  "skill_beast23": {
    "id": "skill_beast23",
    "name": "群狼嚎叫",
    "category": "野兽",
    "tier": "advanced",
    "classLimit": "野兽",
    "tags": [
      "buff"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 10,
            "target": "ally_all"
          },
          {
            "type": "spd_up",
            "value": 1,
            "target": "ally_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 17,
            "target": "ally_all"
          },
          {
            "type": "spd_up",
            "value": 2,
            "target": "ally_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 24,
            "target": "ally_all"
          },
          {
            "type": "spd_up",
            "value": 3,
            "target": "ally_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 30,
            "target": "ally_all"
          },
          {
            "type": "spd_up",
            "value": 3,
            "target": "ally_all",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_beast24": {
    "id": "skill_beast24",
    "name": "扑杀",
    "category": "野兽",
    "tier": "advanced",
    "classLimit": "野兽",
    "tags": [
      "execute"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 64,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 164,
            "target": "enemy_front_single"
          },
          {
            "type": "execute",
            "value": 0.1,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 164,
            "target": "enemy_front_single"
          },
          {
            "type": "execute",
            "value": 0.15,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 310,
            "target": "enemy_front_single"
          },
          {
            "type": "execute",
            "value": 0.2,
            "target": "enemy_front_single"
          }
        ]
      }
    ]
  },
  "skill_beast25": {
    "id": "skill_beast25",
    "name": "甲壳",
    "category": "野兽",
    "tier": "advanced",
    "classLimit": "野兽",
    "tags": [
      "buff"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 15,
            "target": "self"
          },
          {
            "type": "def_up",
            "value": 2,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 25,
            "target": "self"
          },
          {
            "type": "def_up",
            "value": 4,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 33,
            "target": "self"
          },
          {
            "type": "def_up",
            "value": 6,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 40,
            "target": "self"
          },
          {
            "type": "def_up",
            "value": 8,
            "target": "self"
          }
        ]
      }
    ]
  },
  "skill_monster36": {
    "id": "skill_monster36",
    "name": "深渊凝视",
    "category": "魔兽",
    "tier": "advanced",
    "classLimit": "兽",
    "tags": [
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 75,
            "target": "enemy_front_single"
          },
          {
            "type": "confusion",
            "value": 0.15,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 191,
            "target": "enemy_front_single"
          },
          {
            "type": "confusion",
            "value": 0.22,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 191,
            "target": "enemy_front_single"
          },
          {
            "type": "confusion",
            "value": 0.3,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 363,
            "target": "enemy_front_single"
          },
          {
            "type": "confusion",
            "value": 0.35,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_monster37": {
    "id": "skill_monster37",
    "name": "虚空撕裂",
    "category": "魔兽",
    "tier": "advanced",
    "classLimit": "兽",
    "tags": [
      "pierce"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 77,
            "target": "enemy_front_single"
          },
          {
            "type": "true_dmg",
            "value": 19,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 196,
            "target": "enemy_front_single"
          },
          {
            "type": "true_dmg",
            "value": 55,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 196,
            "target": "enemy_front_single"
          },
          {
            "type": "true_dmg",
            "value": 56,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 373,
            "target": "enemy_front_single"
          },
          {
            "type": "true_dmg",
            "value": 104,
            "target": "enemy_front_single"
          }
        ]
      }
    ]
  },
  "skill_monster38": {
    "id": "skill_monster38",
    "name": "魔焰吐息",
    "category": "魔兽",
    "tier": "advanced",
    "classLimit": "兽",
    "tags": [
      "aoe",
      "dot"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 75,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 8,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 191,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 15,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 191,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 23,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 363,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 30,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_monster39": {
    "id": "skill_monster39",
    "name": "石化之眼",
    "category": "魔兽",
    "tier": "ultimate",
    "classLimit": "兽",
    "tags": [
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 130,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 332,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 332,
            "target": "enemy_front_single"
          },
          {
            "type": "petrify",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 629,
            "target": "enemy_front_single"
          },
          {
            "type": "petrify",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          }
        ]
      }
    ]
  },
  "skill_monster40": {
    "id": "skill_monster40",
    "name": "黑暗治疗",
    "category": "魔兽",
    "tier": "advanced",
    "classLimit": "兽",
    "tags": [
      "heal"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "hp_heal",
            "value": 95,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "hp_heal",
            "value": 242,
            "target": "self"
          },
          {
            "type": "cleanse",
            "value": 99,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "hp_heal",
            "value": 242,
            "target": "self"
          },
          {
            "type": "cleanse",
            "value": 99,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "hp_heal",
            "value": 459,
            "target": "self"
          },
          {
            "type": "cleanse",
            "value": 99,
            "target": "self"
          }
        ]
      }
    ]
  },
  "skill_monster41": {
    "id": "skill_monster41",
    "name": "暗影护甲",
    "category": "魔兽",
    "tier": "advanced",
    "classLimit": "兽",
    "tags": [
      "buff"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 20,
            "target": "ally_all"
          },
          {
            "type": "def_up",
            "value": 2,
            "target": "ally_all"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 30,
            "target": "ally_all"
          },
          {
            "type": "def_up",
            "value": 5,
            "target": "ally_all"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 40,
            "target": "ally_all"
          },
          {
            "type": "def_up",
            "value": 8,
            "target": "ally_all"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 50,
            "target": "ally_all"
          },
          {
            "type": "def_up",
            "value": 10,
            "target": "ally_all"
          }
        ]
      }
    ]
  },
  "skill_monster42": {
    "id": "skill_monster42",
    "name": "末日审判",
    "category": "魔兽",
    "tier": "ultimate",
    "classLimit": "兽",
    "tags": [
      "aoe"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 130,
            "target": "enemy_all"
          },
          {
            "type": "def_down_pct",
            "value": 15,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 332,
            "target": "enemy_all"
          },
          {
            "type": "def_down_pct",
            "value": 23,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 332,
            "target": "enemy_all"
          },
          {
            "type": "def_down_pct",
            "value": 32,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 629,
            "target": "enemy_all"
          },
          {
            "type": "def_down_pct",
            "value": 40,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_monster43": {
    "id": "skill_monster43",
    "name": "深渊狂暴",
    "category": "魔兽",
    "tier": "ultimate",
    "classLimit": "兽",
    "tags": [
      "buff"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 20,
            "target": "self"
          },
          {
            "type": "spd_up",
            "value": 2,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 33,
            "target": "self"
          },
          {
            "type": "spd_up",
            "value": 3,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 47,
            "target": "self"
          },
          {
            "type": "spd_up",
            "value": 4,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 60,
            "target": "self"
          },
          {
            "type": "spd_up",
            "value": 5,
            "target": "self",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_fairy01": {
    "id": "skill_fairy01",
    "name": "花粉",
    "category": "妖精",
    "tier": "basic",
    "classLimit": "妖精",
    "tags": [
      "dot",
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 7,
            "target": "enemy_front_single"
          },
          {
            "type": "poison",
            "value": 4,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 13,
            "target": "enemy_front_single"
          },
          {
            "type": "poison",
            "value": 8,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 13,
            "target": "enemy_front_single"
          },
          {
            "type": "poison",
            "value": 12,
            "target": "enemy_front_single",
            "duration": 3
          },
          {
            "type": "confusion",
            "value": 0.1,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 27,
            "target": "enemy_front_single"
          },
          {
            "type": "poison",
            "value": 15,
            "target": "enemy_front_single",
            "duration": 3
          },
          {
            "type": "confusion",
            "value": 0.3,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_fairy02": {
    "id": "skill_fairy02",
    "name": "藤蔓缠绕",
    "category": "妖精",
    "tier": "advanced",
    "classLimit": "妖精",
    "tags": [
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 15,
            "target": "enemy_front_single"
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          },
          {
            "type": "spd_down",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 39,
            "target": "enemy_front_single"
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 2
          },
          {
            "type": "spd_down",
            "value": 2,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 39,
            "target": "enemy_front_single"
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 2
          },
          {
            "type": "spd_down",
            "value": 3,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 73,
            "target": "enemy_front_single"
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 2
          },
          {
            "type": "spd_down",
            "value": 4,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_fairy03": {
    "id": "skill_fairy03",
    "name": "月光",
    "category": "妖精",
    "tier": "advanced",
    "classLimit": "妖精",
    "tags": [
      "heal"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "hp_heal",
            "value": 25,
            "target": "ally_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "hp_heal",
            "value": 64,
            "target": "ally_single"
          },
          {
            "type": "cleanse",
            "value": 1,
            "target": "ally_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "hp_heal",
            "value": 64,
            "target": "ally_single"
          },
          {
            "type": "cleanse",
            "value": 1,
            "target": "ally_single"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "hp_heal",
            "value": 121,
            "target": "ally_single"
          },
          {
            "type": "cleanse",
            "value": 1,
            "target": "ally_single"
          }
        ]
      }
    ]
  },
  "skill_fairy04": {
    "id": "skill_fairy04",
    "name": "风刃",
    "category": "妖精",
    "tier": "basic",
    "classLimit": "妖精",
    "tags": [
      "fast"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 8,
            "target": "enemy_back_single"
          },
          {
            "type": "spd_down",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 16,
            "target": "enemy_back_single"
          },
          {
            "type": "spd_down",
            "value": 2,
            "target": "enemy_back_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 16,
            "target": "enemy_back_single"
          },
          {
            "type": "spd_down",
            "value": 3,
            "target": "enemy_back_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 31,
            "target": "enemy_back_single"
          },
          {
            "type": "spd_down",
            "value": 3,
            "target": "enemy_back_single",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_fairy05": {
    "id": "skill_fairy05",
    "name": "火焰花",
    "category": "妖精",
    "tier": "advanced",
    "classLimit": "妖精",
    "tags": [
      "aoe",
      "dot"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 15,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 5,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 38,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 10,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 38,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 15,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 73,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 20,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_fairy06": {
    "id": "skill_fairy06",
    "name": "冰晶",
    "category": "妖精",
    "tier": "advanced",
    "classLimit": "妖精",
    "tags": [
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 19,
            "target": "enemy_front_single"
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 46,
            "target": "enemy_front_single"
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 46,
            "target": "enemy_front_single"
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 88,
            "target": "enemy_front_single"
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_demon01": {
    "id": "skill_demon01",
    "name": "魔刃斩",
    "category": "魔军",
    "tier": "advanced",
    "classLimit": "魔军",
    "tags": [
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 75,
            "target": "enemy_front_single"
          },
          {
            "type": "def_down_pct",
            "value": 10,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 191,
            "target": "enemy_front_single"
          },
          {
            "type": "def_down_pct",
            "value": 17,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 191,
            "target": "enemy_front_single"
          },
          {
            "type": "def_down_pct",
            "value": 24,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 363,
            "target": "enemy_front_single"
          },
          {
            "type": "def_down_pct",
            "value": 30,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_demon02": {
    "id": "skill_demon02",
    "name": "魔枪突刺",
    "category": "魔军",
    "tier": "advanced",
    "classLimit": "魔军",
    "tags": [
      "fast"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 75,
            "target": "enemy_back_single"
          },
          {
            "type": "spd_down",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 191,
            "target": "enemy_back_single"
          },
          {
            "type": "spd_down",
            "value": 2,
            "target": "enemy_back_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 191,
            "target": "enemy_back_single"
          },
          {
            "type": "spd_down",
            "value": 3,
            "target": "enemy_back_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 363,
            "target": "enemy_back_single"
          },
          {
            "type": "spd_down",
            "value": 3,
            "target": "enemy_back_single",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_demon03": {
    "id": "skill_demon03",
    "name": "魔气侵蚀",
    "category": "魔军",
    "tier": "advanced",
    "classLimit": "魔军",
    "tags": [
      "dot"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 75,
            "target": "enemy_front_single"
          },
          {
            "type": "poison",
            "value": 8,
            "target": "enemy_front_single",
            "duration": 4
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 191,
            "target": "enemy_front_single"
          },
          {
            "type": "poison",
            "value": 15,
            "target": "enemy_front_single",
            "duration": 4
          },
          {
            "type": "def_down_pct",
            "value": 10,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 191,
            "target": "enemy_front_single"
          },
          {
            "type": "poison",
            "value": 23,
            "target": "enemy_front_single",
            "duration": 4
          },
          {
            "type": "def_down_pct",
            "value": 20,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 363,
            "target": "enemy_front_single"
          },
          {
            "type": "poison",
            "value": 30,
            "target": "enemy_front_single",
            "duration": 4
          },
          {
            "type": "def_down_pct",
            "value": 30,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_demon04": {
    "id": "skill_demon04",
    "name": "军阵冲锋",
    "category": "魔军",
    "tier": "advanced",
    "classLimit": "魔军",
    "tags": [
      "buff"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "spd_up",
            "value": 1,
            "target": "ally_all"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 10,
            "target": "ally_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "spd_up",
            "value": 2,
            "target": "ally_all"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 17,
            "target": "ally_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "spd_up",
            "value": 3,
            "target": "ally_all"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 24,
            "target": "ally_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "spd_up",
            "value": 4,
            "target": "ally_all"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 30,
            "target": "ally_all",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_demon05": {
    "id": "skill_demon05",
    "name": "暗黑治疗",
    "category": "魔军",
    "tier": "advanced",
    "classLimit": "魔军",
    "tags": [
      "heal"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "hp_heal",
            "value": 77,
            "target": "ally_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "hp_heal",
            "value": 196,
            "target": "ally_single"
          },
          {
            "type": "cleanse",
            "value": 1,
            "target": "ally_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "hp_heal",
            "value": 196,
            "target": "ally_single"
          },
          {
            "type": "cleanse",
            "value": 99,
            "target": "ally_single"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "hp_heal",
            "value": 373,
            "target": "ally_single"
          },
          {
            "type": "cleanse",
            "value": 99,
            "target": "ally_single"
          }
        ]
      }
    ]
  },
  "skill_demon06": {
    "id": "skill_demon06",
    "name": "魔甲",
    "category": "魔军",
    "tier": "advanced",
    "classLimit": "魔军",
    "tags": [
      "buff"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 10,
            "target": "ally_all"
          },
          {
            "type": "def_up",
            "value": 2,
            "target": "ally_all"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 20,
            "target": "ally_all"
          },
          {
            "type": "def_up",
            "value": 4,
            "target": "ally_all"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 30,
            "target": "ally_all"
          },
          {
            "type": "def_up",
            "value": 7,
            "target": "ally_all"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 40,
            "target": "ally_all"
          },
          {
            "type": "def_up",
            "value": 10,
            "target": "ally_all"
          }
        ]
      }
    ]
  },
  "skill_demon07": {
    "id": "skill_demon07",
    "name": "恐惧号令",
    "category": "魔军",
    "tier": "ultimate",
    "classLimit": "魔军",
    "tags": [
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 15,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 25,
            "target": "enemy_all"
          },
          {
            "type": "confusion",
            "value": 0.15,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 35,
            "target": "enemy_all"
          },
          {
            "type": "confusion",
            "value": 0.25,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_down_pct",
            "value": 45,
            "target": "enemy_all"
          },
          {
            "type": "confusion",
            "value": 0.35,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_demon08": {
    "id": "skill_demon08",
    "name": "魔军处决",
    "category": "魔军",
    "tier": "ultimate",
    "classLimit": "魔军",
    "tags": [
      "execute"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 130,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 332,
            "target": "enemy_front_single"
          },
          {
            "type": "execute",
            "value": 0.1,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 332,
            "target": "enemy_front_single"
          },
          {
            "type": "execute",
            "value": 0.15,
            "target": "enemy_front_single"
          },
          {
            "type": "def_down_pct",
            "value": 15,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 629,
            "target": "enemy_front_single"
          },
          {
            "type": "execute",
            "value": 0.2,
            "target": "enemy_front_single"
          },
          {
            "type": "def_down_pct",
            "value": 25,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_cult01": {
    "id": "skill_cult01",
    "name": "血祭",
    "category": "邪教",
    "tier": "advanced",
    "classLimit": "邪教",
    "tags": [
      "burst"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 25,
            "target": "enemy_front_single"
          },
          {
            "type": "hp_cost",
            "value": 10,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 64,
            "target": "enemy_front_single"
          },
          {
            "type": "hp_cost",
            "value": 17,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 64,
            "target": "enemy_front_single"
          },
          {
            "type": "hp_cost",
            "value": 24,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 121,
            "target": "enemy_front_single"
          },
          {
            "type": "hp_cost",
            "value": 30,
            "target": "self"
          }
        ]
      }
    ]
  },
  "skill_cult02": {
    "id": "skill_cult02",
    "name": "诅咒",
    "category": "邪教",
    "tier": "advanced",
    "classLimit": "邪教",
    "tags": [
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_down_pct",
            "value": 15,
            "target": "enemy_front_single"
          },
          {
            "type": "magic_atk_down_pct",
            "value": 10,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_down_pct",
            "value": 25,
            "target": "enemy_front_single"
          },
          {
            "type": "magic_atk_down_pct",
            "value": 17,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_down_pct",
            "value": 35,
            "target": "enemy_front_single"
          },
          {
            "type": "magic_atk_down_pct",
            "value": 24,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_down_pct",
            "value": 45,
            "target": "enemy_front_single"
          },
          {
            "type": "magic_atk_down_pct",
            "value": 30,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_cult03": {
    "id": "skill_cult03",
    "name": "精神控制",
    "category": "邪教",
    "tier": "advanced",
    "classLimit": "邪教",
    "tags": [
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 15,
            "target": "enemy_front_single"
          },
          {
            "type": "confusion",
            "value": 0.2,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 39,
            "target": "enemy_front_single"
          },
          {
            "type": "confusion",
            "value": 0.27,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 39,
            "target": "enemy_front_single"
          },
          {
            "type": "confusion",
            "value": 0.34,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 73,
            "target": "enemy_front_single"
          },
          {
            "type": "confusion",
            "value": 0.4,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_cult04": {
    "id": "skill_cult04",
    "name": "暗影箭",
    "category": "邪教",
    "tier": "advanced",
    "classLimit": "邪教",
    "tags": [
      "pierce"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 25,
            "target": "enemy_back_single"
          },
          {
            "type": "true_dmg",
            "value": 4,
            "target": "enemy_back_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 64,
            "target": "enemy_back_single"
          },
          {
            "type": "true_dmg",
            "value": 10,
            "target": "enemy_back_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 64,
            "target": "enemy_back_single"
          },
          {
            "type": "true_dmg",
            "value": 10,
            "target": "enemy_back_single"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 121,
            "target": "enemy_back_single"
          },
          {
            "type": "true_dmg",
            "value": 20,
            "target": "enemy_back_single"
          }
        ]
      }
    ]
  },
  "skill_cult05": {
    "id": "skill_cult05",
    "name": "献祭仪式",
    "category": "邪教",
    "tier": "ultimate",
    "classLimit": "邪教",
    "tags": [
      "buff"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 15,
            "target": "ally_all"
          },
          {
            "type": "magic_atk_up_pct",
            "value": 15,
            "target": "ally_all",
            "duration": 3
          },
          {
            "type": "hp_cost",
            "value": 15,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 25,
            "target": "ally_all"
          },
          {
            "type": "magic_atk_up_pct",
            "value": 25,
            "target": "ally_all",
            "duration": 3
          },
          {
            "type": "hp_cost",
            "value": 25,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 35,
            "target": "ally_all"
          },
          {
            "type": "magic_atk_up_pct",
            "value": 35,
            "target": "ally_all",
            "duration": 3
          },
          {
            "type": "hp_cost",
            "value": 35,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 40,
            "target": "ally_all"
          },
          {
            "type": "magic_atk_up_pct",
            "value": 40,
            "target": "ally_all",
            "duration": 3
          },
          {
            "type": "hp_cost",
            "value": 40,
            "target": "self"
          }
        ]
      }
    ]
  },
  "skill_cult06": {
    "id": "skill_cult06",
    "name": "瘟疫",
    "category": "邪教",
    "tier": "advanced",
    "classLimit": "邪教",
    "tags": [
      "dot"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "poison",
            "value": 6,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "poison",
            "value": 14,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "poison",
            "value": 21,
            "target": "enemy_all"
          },
          {
            "type": "def_down_pct",
            "value": 10,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "poison",
            "value": 25,
            "target": "enemy_all"
          },
          {
            "type": "def_down_pct",
            "value": 30,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_cult07": {
    "id": "skill_cult07",
    "name": "邪神低语",
    "category": "邪教",
    "tier": "ultimate",
    "classLimit": "邪教",
    "tags": [
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all"
          },
          {
            "type": "magic_atk_down_pct",
            "value": 15,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "silence",
            "value": 1,
            "target": "enemy_all"
          },
          {
            "type": "magic_atk_down_pct",
            "value": 25,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "silence",
            "value": 2,
            "target": "enemy_all"
          },
          {
            "type": "magic_atk_down_pct",
            "value": 35,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "silence",
            "value": 2,
            "target": "enemy_all"
          },
          {
            "type": "magic_atk_down_pct",
            "value": 40,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_cult08": {
    "id": "skill_cult08",
    "name": "末日预言",
    "category": "邪教",
    "tier": "ultimate",
    "classLimit": "邪教",
    "tags": [
      "aoe",
      "dot"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 4,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 35,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 10,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 89,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 18,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 89,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 27,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 10,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 169,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 35,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 20,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_paladin01": {
    "id": "skill_paladin01",
    "name": "圣光斩",
    "category": "职业",
    "tier": "basic",
    "classLimit": "圣骑士",
    "tags": [
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 6,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 42,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 44,
            "target": "enemy_front_single"
          },
          {
            "type": "def_down_pct",
            "value": 10,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 10,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 46,
            "target": "enemy_front_single"
          },
          {
            "type": "def_down_pct",
            "value": 10,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 12,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 48,
            "target": "enemy_front_single"
          },
          {
            "type": "def_down_pct",
            "value": 10,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 70,
            "target": "enemy_front_single"
          },
          {
            "type": "def_down_pct",
            "value": 10,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 116,
            "target": "enemy_front_single"
          },
          {
            "type": "def_down_pct",
            "value": 30,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_paladin02": {
    "id": "skill_paladin02",
    "name": "守护誓言",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "圣骑士",
    "tags": [
      "buff"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "hp_heal",
            "value": 165,
            "target": "ally_single"
          },
          {
            "type": "guard",
            "value": 1,
            "target": "ally_single"
          },
          {
            "type": "def_up_pct",
            "value": 20,
            "target": "ally_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "hp_heal",
            "value": 173,
            "target": "ally_single"
          },
          {
            "type": "guard",
            "value": 1,
            "target": "ally_single"
          },
          {
            "type": "def_up_pct",
            "value": 20,
            "target": "ally_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 16,
        "proficiency": 180,
        "effects": [
          {
            "type": "hp_heal",
            "value": 182,
            "target": "ally_single"
          },
          {
            "type": "guard",
            "value": 1,
            "target": "ally_single"
          },
          {
            "type": "def_up_pct",
            "value": 20,
            "target": "ally_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 18,
        "proficiency": 400,
        "effects": [
          {
            "type": "hp_heal",
            "value": 190,
            "target": "ally_single"
          },
          {
            "type": "guard",
            "value": 1,
            "target": "ally_single"
          },
          {
            "type": "def_up_pct",
            "value": 20,
            "target": "ally_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 20,
        "proficiency": 750,
        "effects": [
          {
            "type": "hp_heal",
            "value": 248,
            "target": "ally_single"
          },
          {
            "type": "guard",
            "value": 1,
            "target": "ally_single"
          },
          {
            "type": "def_up_pct",
            "value": 20,
            "target": "ally_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "hp_heal",
            "value": 330,
            "target": "ally_single"
          },
          {
            "type": "guard",
            "value": 1,
            "target": "ally_single"
          },
          {
            "type": "def_up_pct",
            "value": 60,
            "target": "ally_single",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_paladin03": {
    "id": "skill_paladin03",
    "name": "制裁之锤",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "圣骑士",
    "tags": [
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 182,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 191,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 16,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 201,
            "target": "enemy_front_single"
          },
          {
            "type": "stun",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 18,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 210,
            "target": "enemy_front_single"
          },
          {
            "type": "stun",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 20,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 273,
            "target": "enemy_front_single"
          },
          {
            "type": "stun",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 365,
            "target": "enemy_front_single"
          },
          {
            "type": "stun",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          }
        ]
      }
    ]
  },
  "skill_paladin04": {
    "id": "skill_paladin04",
    "name": "神圣壁垒",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "圣骑士",
    "tags": [
      "buff"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 20,
            "target": "ally_all"
          },
          {
            "type": "def_up",
            "value": 2,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 570,
            "target": "ally_all"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 40,
        "proficiency": 50,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 28,
            "target": "ally_all"
          },
          {
            "type": "def_up",
            "value": 2,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 570,
            "target": "ally_all"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 45,
        "proficiency": 180,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 36,
            "target": "ally_all"
          },
          {
            "type": "def_up",
            "value": 2,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 570,
            "target": "ally_all"
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 50,
        "proficiency": 400,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 44,
            "target": "ally_all"
          },
          {
            "type": "def_up",
            "value": 2,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 570,
            "target": "ally_all"
          },
          {
            "type": "cleanse",
            "value": 1,
            "target": "ally_all"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 55,
        "proficiency": 750,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 52,
            "target": "ally_all"
          },
          {
            "type": "def_up",
            "value": 2,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 570,
            "target": "ally_all"
          },
          {
            "type": "cleanse",
            "value": 1,
            "target": "ally_all"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 60,
        "proficiency": 1000,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 60,
            "target": "ally_all"
          },
          {
            "type": "def_up",
            "value": 12,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 570,
            "target": "ally_all"
          },
          {
            "type": "cleanse",
            "value": 1,
            "target": "ally_all"
          }
        ]
      }
    ]
  },
  "skill_demonknight01": {
    "id": "skill_demonknight01",
    "name": "魔刃突刺",
    "category": "职业",
    "tier": "basic",
    "classLimit": "魔骑士",
    "tags": [
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 6,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 42,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 44,
            "target": "enemy_front_single"
          },
          {
            "type": "def_down_pct",
            "value": 10,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 10,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 46,
            "target": "enemy_front_single"
          },
          {
            "type": "def_down_pct",
            "value": 10,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 12,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 48,
            "target": "enemy_front_single"
          },
          {
            "type": "def_down_pct",
            "value": 10,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 70,
            "target": "enemy_front_single"
          },
          {
            "type": "def_down_pct",
            "value": 10,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 116,
            "target": "enemy_front_single"
          },
          {
            "type": "def_down_pct",
            "value": 30,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_demonknight02": {
    "id": "skill_demonknight02",
    "name": "暗黑护甲",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "魔骑士",
    "tags": [
      "buff"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 30,
            "target": "self"
          },
          {
            "type": "hp_heal",
            "value": 165,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 40,
            "target": "self"
          },
          {
            "type": "counter",
            "value": 1,
            "target": "self"
          },
          {
            "type": "hp_heal",
            "value": 173,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 16,
        "proficiency": 180,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 50,
            "target": "self"
          },
          {
            "type": "counter",
            "value": 1,
            "target": "self"
          },
          {
            "type": "hp_heal",
            "value": 182,
            "target": "self"
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 18,
        "proficiency": 400,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 60,
            "target": "self"
          },
          {
            "type": "counter",
            "value": 1,
            "target": "self"
          },
          {
            "type": "hp_heal",
            "value": 190,
            "target": "self"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 20,
        "proficiency": 750,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 70,
            "target": "self"
          },
          {
            "type": "counter",
            "value": 1,
            "target": "self"
          },
          {
            "type": "hp_heal",
            "value": 248,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 80,
            "target": "self"
          },
          {
            "type": "counter",
            "value": 1,
            "target": "self"
          },
          {
            "type": "hp_heal",
            "value": 330,
            "target": "self"
          }
        ]
      }
    ]
  },
  "skill_demonknight03": {
    "id": "skill_demonknight03",
    "name": "恐惧冲锋",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "魔骑士",
    "tags": [
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 182,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 191,
            "target": "enemy_front_single"
          },
          {
            "type": "confusion",
            "value": 0.2,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 16,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 201,
            "target": "enemy_front_single"
          },
          {
            "type": "confusion",
            "value": 0.2,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 18,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 210,
            "target": "enemy_front_single"
          },
          {
            "type": "confusion",
            "value": 0.2,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 20,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 273,
            "target": "enemy_front_single"
          },
          {
            "type": "confusion",
            "value": 0.2,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 365,
            "target": "enemy_front_single"
          },
          {
            "type": "confusion",
            "value": 0.4,
            "target": "enemy_front_single",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_demonknight04": {
    "id": "skill_demonknight04",
    "name": "魔军裁决",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "魔骑士",
    "tags": [
      "aoe"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 40,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 45,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "execute",
            "value": 0.1,
            "target": "enemy_all"
          },
          {
            "type": "def_down_pct",
            "value": 10,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 50,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "execute",
            "value": 0.1,
            "target": "enemy_all"
          },
          {
            "type": "def_down_pct",
            "value": 10,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 55,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "execute",
            "value": 0.1,
            "target": "enemy_all"
          },
          {
            "type": "def_down_pct",
            "value": 10,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 60,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "execute",
            "value": 0.2,
            "target": "enemy_all"
          },
          {
            "type": "def_down_pct",
            "value": 30,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_meleemage01": {
    "id": "skill_meleemage01",
    "name": "法术斩",
    "category": "职业",
    "tier": "basic",
    "classLimit": "近战法师",
    "tags": [
      "fast",
      "burst"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 6,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 32,
            "target": "enemy_front_single"
          },
          {
            "type": "magic_dmg",
            "value": 24,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 8,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 34,
            "target": "enemy_front_single"
          },
          {
            "type": "magic_dmg",
            "value": 11,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 10,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 35,
            "target": "enemy_front_single"
          },
          {
            "type": "magic_dmg",
            "value": 7,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 12,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 37,
            "target": "enemy_front_single"
          },
          {
            "type": "magic_dmg",
            "value": 5,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 67,
            "target": "enemy_front_single"
          },
          {
            "type": "magic_dmg",
            "value": 8,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 90,
            "target": "enemy_front_single"
          },
          {
            "type": "magic_dmg",
            "value": 67,
            "target": "enemy_front_single"
          }
        ]
      }
    ]
  },
  "skill_meleemage02": {
    "id": "skill_meleemage02",
    "name": "瞬身咒",
    "category": "职业",
    "tier": "basic",
    "classLimit": "近战法师",
    "tags": [
      "fast"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "spd_up",
            "value": 2,
            "target": "self"
          },
          {
            "type": "dodge",
            "value": 0.05,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 10,
        "proficiency": 50,
        "effects": [
          {
            "type": "spd_up",
            "value": 3,
            "target": "self"
          },
          {
            "type": "dodge",
            "value": 0.05,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 180,
        "effects": [
          {
            "type": "spd_up",
            "value": 4,
            "target": "self"
          },
          {
            "type": "dodge",
            "value": 0.05,
            "target": "self",
            "duration": 3
          },
          {
            "type": "counter",
            "value": 1,
            "target": "self"
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "spd_up",
            "value": 6,
            "target": "self"
          },
          {
            "type": "dodge",
            "value": 0.05,
            "target": "self",
            "duration": 3
          },
          {
            "type": "counter",
            "value": 1,
            "target": "self"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "spd_up",
            "value": 7,
            "target": "self"
          },
          {
            "type": "dodge",
            "value": 0.05,
            "target": "self",
            "duration": 3
          },
          {
            "type": "counter",
            "value": 1,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "spd_up",
            "value": 8,
            "target": "self"
          },
          {
            "type": "dodge",
            "value": 0.15,
            "target": "self",
            "duration": 3
          },
          {
            "type": "counter",
            "value": 1,
            "target": "self"
          }
        ]
      }
    ]
  },
  "skill_meleemage03": {
    "id": "skill_meleemage03",
    "name": "冰刃",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "近战法师",
    "tags": [
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 182,
            "target": "enemy_back_single"
          },
          {
            "type": "spd_down",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 191,
            "target": "enemy_back_single"
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 1
          },
          {
            "type": "spd_down",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 16,
        "proficiency": 180,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 201,
            "target": "enemy_back_single"
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 1
          },
          {
            "type": "spd_down",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 18,
        "proficiency": 400,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 210,
            "target": "enemy_back_single"
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 2
          },
          {
            "type": "spd_down",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 20,
        "proficiency": 750,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 273,
            "target": "enemy_back_single"
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 2
          },
          {
            "type": "spd_down",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 365,
            "target": "enemy_back_single"
          },
          {
            "type": "freeze",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 2
          },
          {
            "type": "spd_down",
            "value": 4,
            "target": "enemy_back_single",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_meleemage04": {
    "id": "skill_meleemage04",
    "name": "奥术爆发",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "近战法师",
    "tags": [
      "aoe"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 40,
        "proficiency": 50,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 10,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 45,
        "proficiency": 180,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 10,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 10,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 50,
        "proficiency": 400,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 10,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 10,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 55,
        "proficiency": 750,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 10,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 10,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 60,
        "proficiency": 1000,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 570,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 40,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 30,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_maniac01": {
    "id": "skill_maniac01",
    "name": "疯狂药剂",
    "category": "职业",
    "tier": "basic",
    "classLimit": "狂人",
    "tags": [
      "buff"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 20,
            "target": "self"
          },
          {
            "type": "magic_atk_up_pct",
            "value": 20,
            "target": "self",
            "duration": 3
          },
          {
            "type": "hp_cost",
            "value": 10,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 10,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 28,
            "target": "self"
          },
          {
            "type": "magic_atk_up_pct",
            "value": 20,
            "target": "self",
            "duration": 3
          },
          {
            "type": "hp_cost",
            "value": 10,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 36,
            "target": "self"
          },
          {
            "type": "magic_atk_up_pct",
            "value": 20,
            "target": "self",
            "duration": 3
          },
          {
            "type": "hp_cost",
            "value": 10,
            "target": "self"
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 44,
            "target": "self"
          },
          {
            "type": "magic_atk_up_pct",
            "value": 20,
            "target": "self",
            "duration": 3
          },
          {
            "type": "hp_cost",
            "value": 10,
            "target": "self"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 52,
            "target": "self"
          },
          {
            "type": "magic_atk_up_pct",
            "value": 20,
            "target": "self",
            "duration": 3
          },
          {
            "type": "hp_cost",
            "value": 10,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 60,
            "target": "self"
          },
          {
            "type": "magic_atk_up_pct",
            "value": 60,
            "target": "self",
            "duration": 3
          },
          {
            "type": "hp_cost",
            "value": 30,
            "target": "self"
          }
        ]
      }
    ]
  },
  "skill_maniac02": {
    "id": "skill_maniac02",
    "name": "不稳定爆炸",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "狂人",
    "tags": [
      "aoe"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 14,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 100,
            "target": "enemy_all"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 16,
        "proficiency": 50,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 100,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 10,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 18,
        "proficiency": 180,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 100,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 10,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 10,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 20,
        "proficiency": 400,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 104,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 10,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 10,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 22,
        "proficiency": 750,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 136,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 10,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 10,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 182,
            "target": "enemy_all"
          },
          {
            "type": "burn",
            "value": 40,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 30,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_maniac03": {
    "id": "skill_maniac03",
    "name": "痛苦转换",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "狂人",
    "tags": [
      "sustain"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "hp_cost",
            "value": 20,
            "target": "self"
          },
          {
            "type": "mp_heal",
            "value": 20,
            "target": "self"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "hp_cost",
            "value": 24,
            "target": "self"
          },
          {
            "type": "mp_heal",
            "value": 20,
            "target": "self"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 16,
        "proficiency": 180,
        "effects": [
          {
            "type": "hp_cost",
            "value": 28,
            "target": "self"
          },
          {
            "type": "mp_heal",
            "value": 20,
            "target": "self"
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 18,
        "proficiency": 400,
        "effects": [
          {
            "type": "hp_cost",
            "value": 32,
            "target": "self"
          },
          {
            "type": "mp_heal",
            "value": 20,
            "target": "self"
          },
          {
            "type": "cleanse",
            "value": 1,
            "target": "self"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 20,
        "proficiency": 750,
        "effects": [
          {
            "type": "hp_cost",
            "value": 36,
            "target": "self"
          },
          {
            "type": "mp_heal",
            "value": 20,
            "target": "self"
          },
          {
            "type": "cleanse",
            "value": 1,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "hp_cost",
            "value": 40,
            "target": "self"
          },
          {
            "type": "mp_heal",
            "value": 80,
            "target": "self"
          },
          {
            "type": "cleanse",
            "value": 1,
            "target": "self"
          }
        ]
      }
    ]
  },
  "skill_maniac04": {
    "id": "skill_maniac04",
    "name": "狂乱",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "狂人",
    "tags": [
      "buff"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "crit_up",
            "value": 0.1,
            "target": "self"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 10,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 40,
        "proficiency": 50,
        "effects": [
          {
            "type": "crit_up",
            "value": 0.13,
            "target": "self"
          },
          {
            "type": "multi_hit",
            "value": 2,
            "target": "self"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 10,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 45,
        "proficiency": 180,
        "effects": [
          {
            "type": "crit_up",
            "value": 0.16,
            "target": "self"
          },
          {
            "type": "multi_hit",
            "value": 2,
            "target": "self"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 10,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 50,
        "proficiency": 400,
        "effects": [
          {
            "type": "crit_up",
            "value": 0.19,
            "target": "self"
          },
          {
            "type": "multi_hit",
            "value": 2,
            "target": "self"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 10,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 55,
        "proficiency": 750,
        "effects": [
          {
            "type": "crit_up",
            "value": 0.22,
            "target": "self"
          },
          {
            "type": "multi_hit",
            "value": 2,
            "target": "self"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 10,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 60,
        "proficiency": 1000,
        "effects": [
          {
            "type": "crit_up",
            "value": 0.25,
            "target": "self"
          },
          {
            "type": "multi_hit",
            "value": 3,
            "target": "self"
          },
          {
            "type": "phys_atk_up_pct",
            "value": 30,
            "target": "self",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_aviator01": {
    "id": "skill_aviator01",
    "name": "俯冲",
    "category": "职业",
    "tier": "basic",
    "classLimit": "飞行家",
    "tags": [
      "fast"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 42,
            "target": "enemy_back_single"
          },
          {
            "type": "spd_up",
            "value": 2,
            "target": "self",
            "duration": 2
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 10,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 44,
            "target": "enemy_back_single"
          },
          {
            "type": "spd_up",
            "value": 2,
            "target": "self",
            "duration": 2
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 46,
            "target": "enemy_back_single"
          },
          {
            "type": "spd_up",
            "value": 2,
            "target": "self",
            "duration": 2
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 48,
            "target": "enemy_back_single"
          },
          {
            "type": "spd_up",
            "value": 2,
            "target": "self",
            "duration": 2
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 70,
            "target": "enemy_back_single"
          },
          {
            "type": "spd_up",
            "value": 2,
            "target": "self",
            "duration": 2
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 116,
            "target": "enemy_back_single"
          },
          {
            "type": "spd_up",
            "value": 6,
            "target": "self",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_aviator02": {
    "id": "skill_aviator02",
    "name": "风翼",
    "category": "职业",
    "tier": "basic",
    "classLimit": "飞行家",
    "tags": [
      "buff"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "dodge",
            "value": 0.05,
            "target": "self"
          },
          {
            "type": "spd_up",
            "value": 2,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 10,
        "proficiency": 50,
        "effects": [
          {
            "type": "dodge",
            "value": 0.07,
            "target": "self"
          },
          {
            "type": "spd_up",
            "value": 2,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 180,
        "effects": [
          {
            "type": "dodge",
            "value": 0.09,
            "target": "self"
          },
          {
            "type": "spd_up",
            "value": 2,
            "target": "self",
            "duration": 3
          },
          {
            "type": "counter",
            "value": 1,
            "target": "self"
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "dodge",
            "value": 0.11,
            "target": "self"
          },
          {
            "type": "spd_up",
            "value": 2,
            "target": "self",
            "duration": 3
          },
          {
            "type": "counter",
            "value": 1,
            "target": "self"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "dodge",
            "value": 0.13,
            "target": "self"
          },
          {
            "type": "spd_up",
            "value": 2,
            "target": "self",
            "duration": 3
          },
          {
            "type": "counter",
            "value": 1,
            "target": "self"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "dodge",
            "value": 0.15,
            "target": "self"
          },
          {
            "type": "spd_up",
            "value": 6,
            "target": "self",
            "duration": 3
          },
          {
            "type": "counter",
            "value": 1,
            "target": "self"
          }
        ]
      }
    ]
  },
  "skill_aviator03": {
    "id": "skill_aviator03",
    "name": "高空投掷",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "飞行家",
    "tags": [
      "aoe"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 14,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 115,
            "target": "enemy_back"
          },
          {
            "type": "bleed",
            "value": 5,
            "target": "enemy_back",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 16,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 121,
            "target": "enemy_back"
          },
          {
            "type": "bleed",
            "value": 5,
            "target": "enemy_back",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 18,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 127,
            "target": "enemy_back"
          },
          {
            "type": "bleed",
            "value": 5,
            "target": "enemy_back",
            "duration": 3
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 20,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 133,
            "target": "enemy_back"
          },
          {
            "type": "bleed",
            "value": 5,
            "target": "enemy_back",
            "duration": 3
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 22,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 173,
            "target": "enemy_back"
          },
          {
            "type": "bleed",
            "value": 5,
            "target": "enemy_back",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 231,
            "target": "enemy_back"
          },
          {
            "type": "bleed",
            "value": 20,
            "target": "enemy_back",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_aviator04": {
    "id": "skill_aviator04",
    "name": "气流护体",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "飞行家",
    "tags": [
      "buff"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 10,
            "target": "self"
          },
          {
            "type": "dodge",
            "value": 0.05,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 40,
        "proficiency": 50,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 14,
            "target": "self"
          },
          {
            "type": "cleanse",
            "value": 99,
            "target": "self"
          },
          {
            "type": "dodge",
            "value": 0.05,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 45,
        "proficiency": 180,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 18,
            "target": "self"
          },
          {
            "type": "cleanse",
            "value": 99,
            "target": "self"
          },
          {
            "type": "dodge",
            "value": 0.05,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 50,
        "proficiency": 400,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 22,
            "target": "self"
          },
          {
            "type": "cleanse",
            "value": 99,
            "target": "self"
          },
          {
            "type": "dodge",
            "value": 0.05,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 55,
        "proficiency": 750,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 26,
            "target": "self"
          },
          {
            "type": "cleanse",
            "value": 99,
            "target": "self"
          },
          {
            "type": "dodge",
            "value": 0.05,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 60,
        "proficiency": 1000,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 30,
            "target": "self"
          },
          {
            "type": "cleanse",
            "value": 99,
            "target": "self"
          },
          {
            "type": "dodge",
            "value": 0.15,
            "target": "self",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_wingknight01": {
    "id": "skill_wingknight01",
    "name": "翼斩",
    "category": "职业",
    "tier": "basic",
    "classLimit": "翼骑士",
    "tags": [
      "control"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 35,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 10,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 37,
            "target": "enemy_front_single"
          },
          {
            "type": "airborne",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 39,
            "target": "enemy_front_single"
          },
          {
            "type": "airborne",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 41,
            "target": "enemy_front_single"
          },
          {
            "type": "airborne",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 70,
            "target": "enemy_front_single"
          },
          {
            "type": "airborne",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 99,
            "target": "enemy_front_single"
          },
          {
            "type": "airborne",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_wingknight02": {
    "id": "skill_wingknight02",
    "name": "天空守护",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "翼骑士",
    "tags": [
      "heal"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 14,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 10,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 139,
            "target": "ally_all"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 16,
        "proficiency": 50,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 14,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 146,
            "target": "ally_all"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 18,
        "proficiency": 180,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 18,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 153,
            "target": "ally_all"
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 20,
        "proficiency": 400,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 22,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 160,
            "target": "ally_all"
          },
          {
            "type": "cleanse",
            "value": 99,
            "target": "ally_all"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 22,
        "proficiency": 750,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 26,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 209,
            "target": "ally_all"
          },
          {
            "type": "cleanse",
            "value": 99,
            "target": "ally_all"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 30,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 279,
            "target": "ally_all"
          },
          {
            "type": "cleanse",
            "value": 99,
            "target": "ally_all"
          }
        ]
      }
    ]
  },
  "skill_wingknight03": {
    "id": "skill_wingknight03",
    "name": "风暴之翼",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "翼骑士",
    "tags": [
      "aoe"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 100,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 1,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 18,
        "proficiency": 50,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 100,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 1,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "airborne",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 20,
        "proficiency": 180,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 100,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 1,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "airborne",
            "value": 1,
            "target": "enemy_all",
            "duration": 1
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 22,
        "proficiency": 400,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 104,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 1,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "airborne",
            "value": 1,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 22,
        "proficiency": 750,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 136,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 1,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "airborne",
            "value": 1,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "magic_dmg",
            "value": 182,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 4,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "airborne",
            "value": 1,
            "target": "enemy_all",
            "duration": 2
          }
        ]
      }
    ]
  },
  "skill_wingknight04": {
    "id": "skill_wingknight04",
    "name": "坠落审判",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "翼骑士",
    "tags": [
      "execute"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 699,
            "target": "enemy_front_single"
          },
          {
            "type": "cond_target_has_tag",
            "value": 1,
            "target": "enemy_front_single",
            "tag": "腾空"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 40,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 734,
            "target": "enemy_front_single"
          },
          {
            "type": "cond_target_has_tag",
            "value": 1,
            "target": "enemy_front_single",
            "tag": "腾空"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 45,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 769,
            "target": "enemy_front_single"
          },
          {
            "type": "cond_target_has_tag",
            "value": 1,
            "target": "enemy_front_single",
            "tag": "腾空"
          },
          {
            "type": "execute",
            "value": 0.15,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 50,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 804,
            "target": "enemy_front_single"
          },
          {
            "type": "cond_target_has_tag",
            "value": 1,
            "target": "enemy_front_single",
            "tag": "腾空"
          },
          {
            "type": "execute",
            "value": 0.15,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 55,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 909,
            "target": "enemy_front_single"
          },
          {
            "type": "cond_target_has_tag",
            "value": 1,
            "target": "enemy_front_single",
            "tag": "腾空"
          },
          {
            "type": "execute",
            "value": 0.15,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 60,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 1119,
            "target": "enemy_front_single"
          },
          {
            "type": "cond_target_has_tag",
            "value": 1,
            "target": "enemy_front_single",
            "tag": "腾空"
          },
          {
            "type": "execute",
            "value": 0.3,
            "target": "enemy_front_single"
          }
        ]
      }
    ]
  },
  "skill_ironpagoda01": {
    "id": "skill_ironpagoda01",
    "name": "铁壁冲撞",
    "category": "职业",
    "tier": "basic",
    "classLimit": "铁浮屠",
    "tags": [
      "heavy"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 8,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 42,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 10,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 44,
            "target": "enemy_front_single"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 12,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 46,
            "target": "enemy_front_single"
          },
          {
            "type": "stun",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 48,
            "target": "enemy_front_single"
          },
          {
            "type": "stun",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 70,
            "target": "enemy_front_single"
          },
          {
            "type": "stun",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 116,
            "target": "enemy_front_single"
          },
          {
            "type": "stun",
            "value": 1,
            "target": "enemy_front_single",
            "duration": 1
          }
        ]
      }
    ]
  },
  "skill_ironpagoda02": {
    "id": "skill_ironpagoda02",
    "name": "重装守护",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "铁浮屠",
    "tags": [
      "buff"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 20,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 107,
            "target": "ally_all"
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 28,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 113,
            "target": "ally_all"
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 16,
        "proficiency": 180,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 36,
            "target": "ally_all"
          },
          {
            "type": "counter",
            "value": 1,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 118,
            "target": "ally_all"
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 18,
        "proficiency": 400,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 44,
            "target": "ally_all"
          },
          {
            "type": "counter",
            "value": 1,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 123,
            "target": "ally_all"
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 20,
        "proficiency": 750,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 52,
            "target": "ally_all"
          },
          {
            "type": "counter",
            "value": 1,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 161,
            "target": "ally_all"
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 60,
            "target": "ally_all"
          },
          {
            "type": "counter",
            "value": 1,
            "target": "ally_all"
          },
          {
            "type": "hp_heal",
            "value": 214,
            "target": "ally_all"
          }
        ]
      }
    ]
  },
  "skill_ironpagoda03": {
    "id": "skill_ironpagoda03",
    "name": "地动山摇",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "铁浮屠",
    "tags": [
      "aoe"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 16,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 100,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 1,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 18,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 100,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 1,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 20,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 100,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 1,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 10,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 22,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 104,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 1,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 10,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 22,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 136,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 1,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 10,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 182,
            "target": "enemy_all"
          },
          {
            "type": "spd_down",
            "value": 4,
            "target": "enemy_all",
            "duration": 3
          },
          {
            "type": "def_down_pct",
            "value": 30,
            "target": "enemy_all",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_ironpagoda04": {
    "id": "skill_ironpagoda04",
    "name": "不坏之身",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "铁浮屠",
    "tags": [
      "buff"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 30,
            "target": "self"
          },
          {
            "type": "hp_heal_pct",
            "value": 2,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 40,
        "proficiency": 50,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 40,
            "target": "self"
          },
          {
            "type": "hp_heal_pct",
            "value": 2,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 45,
        "proficiency": 180,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 50,
            "target": "self"
          },
          {
            "type": "hp_heal_pct",
            "value": 2,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 50,
        "proficiency": 400,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 60,
            "target": "self"
          },
          {
            "type": "hp_heal_pct",
            "value": 2,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 55,
        "proficiency": 750,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 70,
            "target": "self"
          },
          {
            "type": "hp_heal_pct",
            "value": 2,
            "target": "self",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 60,
        "proficiency": 1000,
        "effects": [
          {
            "type": "def_up_pct",
            "value": 80,
            "target": "self"
          },
          {
            "type": "hp_heal_pct",
            "value": 8,
            "target": "self",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_tamer01": {
    "id": "skill_tamer01",
    "name": "兽群命令",
    "category": "职业",
    "tier": "basic",
    "classLimit": "驯兽师",
    "tags": [
      "buff"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 10,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 15,
            "target": "ally_all"
          },
          {
            "type": "magic_atk_up_pct",
            "value": 15,
            "target": "ally_all",
            "duration": 3
          },
          {
            "type": "spd_up",
            "value": 1,
            "target": "ally_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 12,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 21,
            "target": "ally_all"
          },
          {
            "type": "magic_atk_up_pct",
            "value": 15,
            "target": "ally_all",
            "duration": 3
          },
          {
            "type": "spd_up",
            "value": 1,
            "target": "ally_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 14,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 27,
            "target": "ally_all"
          },
          {
            "type": "magic_atk_up_pct",
            "value": 15,
            "target": "ally_all",
            "duration": 3
          },
          {
            "type": "spd_up",
            "value": 1,
            "target": "ally_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 14,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 33,
            "target": "ally_all"
          },
          {
            "type": "magic_atk_up_pct",
            "value": 15,
            "target": "ally_all",
            "duration": 3
          },
          {
            "type": "spd_up",
            "value": 1,
            "target": "ally_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 14,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 39,
            "target": "ally_all"
          },
          {
            "type": "magic_atk_up_pct",
            "value": 15,
            "target": "ally_all",
            "duration": 3
          },
          {
            "type": "spd_up",
            "value": 1,
            "target": "ally_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 14,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 45,
            "target": "ally_all"
          },
          {
            "type": "magic_atk_up_pct",
            "value": 45,
            "target": "ally_all",
            "duration": 3
          },
          {
            "type": "spd_up",
            "value": 3,
            "target": "ally_all",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_tamer02": {
    "id": "skill_tamer02",
    "name": "狩猎标记",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "驯兽师",
    "tags": [
      "pierce"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 214,
            "target": "enemy_back_single"
          },
          {
            "type": "mark",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 4
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 225,
            "target": "enemy_back_single"
          },
          {
            "type": "mark",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 4
          },
          {
            "type": "def_down_pct",
            "value": 10,
            "target": "enemy_back_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 16,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 236,
            "target": "enemy_back_single"
          },
          {
            "type": "mark",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 4
          },
          {
            "type": "def_down_pct",
            "value": 10,
            "target": "enemy_back_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 18,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 247,
            "target": "enemy_back_single"
          },
          {
            "type": "mark",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 4
          },
          {
            "type": "def_down_pct",
            "value": 10,
            "target": "enemy_back_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 20,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 322,
            "target": "enemy_back_single"
          },
          {
            "type": "mark",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 4
          },
          {
            "type": "def_down_pct",
            "value": 10,
            "target": "enemy_back_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_dmg",
            "value": 429,
            "target": "enemy_back_single"
          },
          {
            "type": "mark",
            "value": 1,
            "target": "enemy_back_single",
            "duration": 4
          },
          {
            "type": "def_down_pct",
            "value": 30,
            "target": "enemy_back_single",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_tamer03": {
    "id": "skill_tamer03",
    "name": "治疗宠物",
    "category": "职业",
    "tier": "advanced",
    "classLimit": "驯兽师",
    "tags": [
      "heal"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 12,
        "proficiency": 0,
        "effects": [
          {
            "type": "hp_heal",
            "value": 214,
            "target": "ally_single"
          },
          {
            "type": "def_up_pct",
            "value": 10,
            "target": "ally_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 14,
        "proficiency": 50,
        "effects": [
          {
            "type": "hp_heal",
            "value": 225,
            "target": "ally_single"
          },
          {
            "type": "cleanse",
            "value": 1,
            "target": "ally_single"
          },
          {
            "type": "def_up_pct",
            "value": 10,
            "target": "ally_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 16,
        "proficiency": 180,
        "effects": [
          {
            "type": "hp_heal",
            "value": 236,
            "target": "ally_single"
          },
          {
            "type": "cleanse",
            "value": 1,
            "target": "ally_single"
          },
          {
            "type": "def_up_pct",
            "value": 10,
            "target": "ally_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 18,
        "proficiency": 400,
        "effects": [
          {
            "type": "hp_heal",
            "value": 247,
            "target": "ally_single"
          },
          {
            "type": "cleanse",
            "value": 1,
            "target": "ally_single"
          },
          {
            "type": "def_up_pct",
            "value": 10,
            "target": "ally_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 20,
        "proficiency": 750,
        "effects": [
          {
            "type": "hp_heal",
            "value": 322,
            "target": "ally_single"
          },
          {
            "type": "cleanse",
            "value": 1,
            "target": "ally_single"
          },
          {
            "type": "def_up_pct",
            "value": 10,
            "target": "ally_single",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 22,
        "proficiency": 1000,
        "effects": [
          {
            "type": "hp_heal",
            "value": 429,
            "target": "ally_single"
          },
          {
            "type": "cleanse",
            "value": 1,
            "target": "ally_single"
          },
          {
            "type": "def_up_pct",
            "value": 30,
            "target": "ally_single",
            "duration": 3
          }
        ]
      }
    ]
  },
  "skill_tamer04": {
    "id": "skill_tamer04",
    "name": "野兽狂暴",
    "category": "职业",
    "tier": "ultimate",
    "classLimit": "驯兽师",
    "tags": [
      "buff"
    ],
    "levels": [
      {
        "lv": 1,
        "mpCost": 35,
        "proficiency": 0,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 20,
            "target": "ally_all"
          },
          {
            "type": "spd_up",
            "value": 2,
            "target": "ally_all",
            "duration": 3
          },
          {
            "type": "hp_heal_pct",
            "value": 2,
            "target": "ally_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 2,
        "mpCost": 40,
        "proficiency": 50,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 28,
            "target": "ally_all"
          },
          {
            "type": "spd_up",
            "value": 2,
            "target": "ally_all",
            "duration": 3
          },
          {
            "type": "hp_heal_pct",
            "value": 2,
            "target": "ally_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 3,
        "mpCost": 45,
        "proficiency": 180,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 36,
            "target": "ally_all"
          },
          {
            "type": "spd_up",
            "value": 2,
            "target": "ally_all",
            "duration": 3
          },
          {
            "type": "hp_heal_pct",
            "value": 2,
            "target": "ally_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 4,
        "mpCost": 50,
        "proficiency": 400,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 44,
            "target": "ally_all"
          },
          {
            "type": "spd_up",
            "value": 2,
            "target": "ally_all",
            "duration": 3
          },
          {
            "type": "hp_heal_pct",
            "value": 2,
            "target": "ally_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": 5,
        "mpCost": 55,
        "proficiency": 750,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 52,
            "target": "ally_all"
          },
          {
            "type": "spd_up",
            "value": 2,
            "target": "ally_all",
            "duration": 3
          },
          {
            "type": "hp_heal_pct",
            "value": 2,
            "target": "ally_all",
            "duration": 3
          }
        ]
      },
      {
        "lv": "max",
        "mpCost": 60,
        "proficiency": 1000,
        "effects": [
          {
            "type": "phys_atk_up_pct",
            "value": 60,
            "target": "ally_all"
          },
          {
            "type": "spd_up",
            "value": 5,
            "target": "ally_all",
            "duration": 3
          },
          {
            "type": "hp_heal_pct",
            "value": 6,
            "target": "ally_all",
            "duration": 3
          }
        ]
      }
    ]
  }
};

/* ============================================================
   技能白板模式
   ------------------------------------------------------------
   true  = 所有技能只保留白板：清空每一级的 effects，
           等级、MP、熟练度、分类、职业、tags 全部保留。
           原始效果不再保留参考副本。
   false = 正常使用当前技能数据。
   ============================================================ */
/* ============================================================
   技能曲线补丁（2026-11 三档成长模型，方案 A）
   ------------------------------------------------------------
   低档：Lv1 低、上限低；中档：Lv1 略高；高档：Lv1 接近中档、上限最高。
   “成长慢”通过熟练度门槛体现：高档升到下一级需要更多熟练度。
   本补丁只改：伤害值 / MP / 熟练度；其他效果（治疗、buff、状态）不改。
   ============================================================ */
const SKILL_CURVE_PATCH = {
  "skill_warrior01": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 19
        }
      ],
      [
        {
          "i": 0,
          "v": 24
        }
      ],
      [
        {
          "i": 0,
          "v": 30
        }
      ],
      [
        {
          "i": 0,
          "v": 38
        }
      ],
      [
        {
          "i": 0,
          "v": 47
        }
      ],
      [
        {
          "i": 0,
          "v": 59
        }
      ]
    ]
  },
  "skill_warrior02": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 17
        }
      ],
      [
        {
          "i": 0,
          "v": 21
        }
      ],
      [
        {
          "i": 0,
          "v": 26
        }
      ],
      [
        {
          "i": 0,
          "v": 33
        }
      ],
      [
        {
          "i": 0,
          "v": 41
        }
      ],
      [
        {
          "i": 0,
          "v": 52
        }
      ]
    ]
  },
  "skill_warrior03": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 19
        }
      ],
      [
        {
          "i": 0,
          "v": 23
        }
      ],
      [
        {
          "i": 0,
          "v": 29
        }
      ],
      [
        {
          "i": 0,
          "v": 37
        }
      ],
      [
        {
          "i": 0,
          "v": 46
        }
      ],
      [
        {
          "i": 0,
          "v": 57
        }
      ]
    ]
  },
  "skill_warrior04": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 19
        }
      ],
      [
        {
          "i": 0,
          "v": 24
        }
      ],
      [
        {
          "i": 0,
          "v": 30
        }
      ],
      [
        {
          "i": 0,
          "v": 37
        }
      ],
      [
        {
          "i": 0,
          "v": 47
        }
      ],
      [
        {
          "i": 0,
          "v": 58
        }
      ]
    ]
  },
  "skill_warrior05": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [],
      [],
      [
        {
          "i": 0,
          "v": 36
        }
      ],
      [
        {
          "i": 0,
          "v": 46
        }
      ],
      [
        {
          "i": 0,
          "v": 59
        }
      ],
      [
        {
          "i": 0,
          "v": 76
        }
      ]
    ]
  },
  "skill_warrior06": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_warrior07": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 17
        },
        {
          "i": 1,
          "v": 11
        }
      ],
      [
        {
          "i": 0,
          "v": 20
        },
        {
          "i": 1,
          "v": 15
        }
      ],
      [
        {
          "i": 0,
          "v": 22
        },
        {
          "i": 1,
          "v": 18
        },
        {
          "i": 2,
          "v": 5
        }
      ],
      [
        {
          "i": 0,
          "v": 29
        },
        {
          "i": 1,
          "v": 23
        },
        {
          "i": 2,
          "v": 6
        }
      ],
      [
        {
          "i": 0,
          "v": 37
        },
        {
          "i": 1,
          "v": 30
        },
        {
          "i": 2,
          "v": 8
        }
      ],
      [
        {
          "i": 0,
          "v": 46
        },
        {
          "i": 1,
          "v": 38
        },
        {
          "i": 2,
          "v": 10
        }
      ]
    ]
  },
  "skill_warrior08": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 29
        }
      ],
      [
        {
          "i": 0,
          "v": 38
        }
      ],
      [
        {
          "i": 0,
          "v": 50
        }
      ],
      [
        {
          "i": 0,
          "v": 67
        }
      ],
      [
        {
          "i": 0,
          "v": 88
        }
      ],
      [
        {
          "i": 0,
          "v": 116
        }
      ]
    ]
  },
  "skill_warrior09": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 29
        }
      ],
      [
        {
          "i": 0,
          "v": 38
        }
      ],
      [
        {
          "i": 0,
          "v": 50
        }
      ],
      [
        {
          "i": 0,
          "v": 67
        }
      ],
      [
        {
          "i": 0,
          "v": 88
        }
      ],
      [
        {
          "i": 0,
          "v": 116
        }
      ]
    ]
  },
  "skill_warrior10": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [
        {
          "i": 2,
          "v": 28
        }
      ],
      [
        {
          "i": 2,
          "v": 37
        }
      ],
      [
        {
          "i": 2,
          "v": 49
        }
      ],
      [
        {
          "i": 2,
          "v": 65
        }
      ],
      [
        {
          "i": 2,
          "v": 86
        }
      ],
      [
        {
          "i": 2,
          "v": 114
        }
      ]
    ]
  },
  "skill_mage01": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 20
        }
      ],
      [
        {
          "i": 0,
          "v": 25
        }
      ],
      [
        {
          "i": 0,
          "v": 31
        }
      ],
      [
        {
          "i": 0,
          "v": 39
        }
      ],
      [
        {
          "i": 0,
          "v": 48
        }
      ],
      [
        {
          "i": 0,
          "v": 60
        }
      ]
    ]
  },
  "skill_mage02": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 17
        }
      ],
      [
        {
          "i": 0,
          "v": 21
        }
      ],
      [
        {
          "i": 0,
          "v": 27
        }
      ],
      [
        {
          "i": 0,
          "v": 33
        }
      ],
      [
        {
          "i": 0,
          "v": 42
        }
      ],
      [
        {
          "i": 0,
          "v": 52
        }
      ]
    ]
  },
  "skill_mage03": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 20
        }
      ],
      [
        {
          "i": 0,
          "v": 25
        }
      ],
      [
        {
          "i": 0,
          "v": 32
        }
      ],
      [
        {
          "i": 0,
          "v": 40
        }
      ],
      [
        {
          "i": 0,
          "v": 50
        }
      ],
      [
        {
          "i": 0,
          "v": 62
        }
      ]
    ]
  },
  "skill_mage04": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 18
        }
      ],
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 27
        }
      ],
      [
        {
          "i": 0,
          "v": 34
        }
      ],
      [
        {
          "i": 0,
          "v": 43
        }
      ],
      [
        {
          "i": 0,
          "v": 54
        }
      ]
    ]
  },
  "skill_mage05": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_mage06": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 25
        }
      ],
      [
        {
          "i": 0,
          "v": 31
        }
      ],
      [
        {
          "i": 0,
          "v": 40
        }
      ],
      [
        {
          "i": 0,
          "v": 52
        }
      ],
      [
        {
          "i": 0,
          "v": 66
        }
      ],
      [
        {
          "i": 0,
          "v": 85
        }
      ]
    ]
  },
  "skill_mage07": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 24
        }
      ],
      [
        {
          "i": 0,
          "v": 31
        }
      ],
      [
        {
          "i": 0,
          "v": 40
        }
      ],
      [
        {
          "i": 0,
          "v": 51
        }
      ],
      [
        {
          "i": 0,
          "v": 65
        }
      ],
      [
        {
          "i": 0,
          "v": 83
        }
      ]
    ]
  },
  "skill_mage08": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 28
        }
      ],
      [
        {
          "i": 0,
          "v": 37
        }
      ],
      [
        {
          "i": 0,
          "v": 49
        }
      ],
      [
        {
          "i": 0,
          "v": 65
        }
      ],
      [
        {
          "i": 0,
          "v": 86
        }
      ],
      [
        {
          "i": 0,
          "v": 114
        }
      ]
    ]
  },
  "skill_mage09": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 29
        }
      ],
      [
        {
          "i": 0,
          "v": 38
        }
      ],
      [
        {
          "i": 0,
          "v": 50
        }
      ],
      [
        {
          "i": 0,
          "v": 67
        }
      ],
      [
        {
          "i": 0,
          "v": 88
        }
      ],
      [
        {
          "i": 0,
          "v": 116
        }
      ]
    ]
  },
  "skill_mage10": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 29
        }
      ],
      [
        {
          "i": 0,
          "v": 39
        }
      ],
      [
        {
          "i": 0,
          "v": 51
        }
      ],
      [
        {
          "i": 0,
          "v": 68
        }
      ],
      [
        {
          "i": 0,
          "v": 89
        }
      ],
      [
        {
          "i": 0,
          "v": 118
        }
      ]
    ]
  },
  "skill_patrol01": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 18
        }
      ],
      [
        {
          "i": 0,
          "v": 23
        }
      ],
      [
        {
          "i": 0,
          "v": 29
        }
      ],
      [
        {
          "i": 0,
          "v": 36
        }
      ],
      [
        {
          "i": 0,
          "v": 45
        }
      ],
      [
        {
          "i": 0,
          "v": 56
        }
      ]
    ]
  },
  "skill_patrol02": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 17
        }
      ],
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 27
        }
      ],
      [
        {
          "i": 0,
          "v": 34
        }
      ],
      [
        {
          "i": 0,
          "v": 42
        }
      ],
      [
        {
          "i": 0,
          "v": 53
        }
      ]
    ]
  },
  "skill_patrol03": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_patrol04": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_patrol05": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 28
        }
      ],
      [
        {
          "i": 0,
          "v": 36
        }
      ],
      [
        {
          "i": 0,
          "v": 47
        }
      ],
      [
        {
          "i": 0,
          "v": 60
        }
      ],
      [
        {
          "i": 0,
          "v": 76
        }
      ]
    ]
  },
  "skill_patrol06": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 25
        }
      ],
      [
        {
          "i": 0,
          "v": 31
        }
      ],
      [
        {
          "i": 0,
          "v": 40
        }
      ],
      [
        {
          "i": 0,
          "v": 51
        }
      ],
      [
        {
          "i": 0,
          "v": 66
        }
      ],
      [
        {
          "i": 0,
          "v": 67
        },
        {
          "i": 4,
          "v": 17
        }
      ]
    ]
  },
  "skill_patrol07": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_patrol08": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_patrol09": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 28
        }
      ],
      [
        {
          "i": 0,
          "v": 37
        }
      ],
      [
        {
          "i": 0,
          "v": 49
        }
      ],
      [
        {
          "i": 0,
          "v": 64
        }
      ],
      [
        {
          "i": 0,
          "v": 85
        }
      ],
      [
        {
          "i": 0,
          "v": 112
        }
      ]
    ]
  },
  "skill_patrol10": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 28
        }
      ],
      [
        {
          "i": 0,
          "v": 37
        }
      ],
      [
        {
          "i": 0,
          "v": 49
        }
      ],
      [
        {
          "i": 0,
          "v": 64
        }
      ],
      [
        {
          "i": 0,
          "v": 85
        }
      ],
      [
        {
          "i": 0,
          "v": 112
        }
      ]
    ]
  },
  "skill_assassin01": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 21
        }
      ],
      [
        {
          "i": 0,
          "v": 26
        }
      ],
      [
        {
          "i": 0,
          "v": 33
        }
      ],
      [
        {
          "i": 0,
          "v": 41
        }
      ],
      [
        {
          "i": 0,
          "v": 52
        }
      ],
      [
        {
          "i": 0,
          "v": 59
        },
        {
          "i": 2,
          "v": 6
        }
      ]
    ]
  },
  "skill_assassin02": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 18
        }
      ],
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 28
        }
      ],
      [
        {
          "i": 0,
          "v": 35
        }
      ],
      [
        {
          "i": 0,
          "v": 44
        }
      ],
      [
        {
          "i": 0,
          "v": 55
        }
      ]
    ]
  },
  "skill_assassin03": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_assassin04": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 21
        }
      ],
      [
        {
          "i": 0,
          "v": 26
        }
      ],
      [
        {
          "i": 0,
          "v": 33
        }
      ],
      [
        {
          "i": 0,
          "v": 41
        }
      ],
      [
        {
          "i": 0,
          "v": 52
        }
      ],
      [
        {
          "i": 0,
          "v": 60
        },
        {
          "i": 2,
          "v": 5
        }
      ]
    ]
  },
  "skill_assassin05": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 28
        }
      ],
      [
        {
          "i": 0,
          "v": 36
        }
      ],
      [
        {
          "i": 0,
          "v": 47
        }
      ],
      [
        {
          "i": 0,
          "v": 60
        }
      ],
      [
        {
          "i": 0,
          "v": 76
        }
      ]
    ]
  },
  "skill_assassin06": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 25
        }
      ],
      [
        {
          "i": 0,
          "v": 32
        }
      ],
      [
        {
          "i": 0,
          "v": 41
        }
      ],
      [
        {
          "i": 0,
          "v": 52
        }
      ],
      [
        {
          "i": 0,
          "v": 66
        }
      ],
      [
        {
          "i": 0,
          "v": 69
        },
        {
          "i": 3,
          "v": 16
        }
      ]
    ]
  },
  "skill_assassin07": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_assassin08": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 28
        }
      ],
      [
        {
          "i": 0,
          "v": 37
        }
      ],
      [
        {
          "i": 0,
          "v": 49
        }
      ],
      [
        {
          "i": 0,
          "v": 64
        }
      ],
      [
        {
          "i": 0,
          "v": 85
        }
      ],
      [
        {
          "i": 0,
          "v": 112
        }
      ]
    ]
  },
  "skill_assassin09": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 29
        }
      ],
      [
        {
          "i": 0,
          "v": 39
        }
      ],
      [
        {
          "i": 0,
          "v": 51
        }
      ],
      [
        {
          "i": 0,
          "v": 68
        }
      ],
      [
        {
          "i": 0,
          "v": 89
        }
      ],
      [
        {
          "i": 0,
          "v": 118
        }
      ]
    ]
  },
  "skill_assassin10": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 30
        }
      ],
      [
        {
          "i": 0,
          "v": 40
        }
      ],
      [
        {
          "i": 0,
          "v": 53
        }
      ],
      [
        {
          "i": 0,
          "v": 70
        }
      ],
      [
        {
          "i": 0,
          "v": 92
        }
      ],
      [
        {
          "i": 0,
          "v": 122
        }
      ]
    ]
  },
  "skill_healer01": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_healer02": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_healer03": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_healer04": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_healer05": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_healer06": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 23
        }
      ],
      [
        {
          "i": 0,
          "v": 30
        }
      ],
      [
        {
          "i": 0,
          "v": 38
        }
      ],
      [
        {
          "i": 0,
          "v": 49
        }
      ],
      [
        {
          "i": 0,
          "v": 63
        }
      ],
      [
        {
          "i": 0,
          "v": 81
        }
      ]
    ]
  },
  "skill_healer07": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 28
        }
      ],
      [
        {
          "i": 0,
          "v": 36
        }
      ],
      [
        {
          "i": 0,
          "v": 47
        }
      ],
      [
        {
          "i": 0,
          "v": 60
        }
      ],
      [
        {
          "i": 0,
          "v": 76
        }
      ]
    ]
  },
  "skill_healer08": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 26
        }
      ],
      [
        {
          "i": 0,
          "v": 34
        }
      ],
      [
        {
          "i": 0,
          "v": 45
        }
      ],
      [
        {
          "i": 0,
          "v": 60
        }
      ],
      [
        {
          "i": 0,
          "v": 79
        }
      ],
      [
        {
          "i": 0,
          "v": 104
        }
      ]
    ]
  },
  "skill_healer09": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_healer10": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_formation01": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_formation02": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_formation03": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_formation04": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 15
        }
      ],
      [
        {
          "i": 0,
          "v": 18
        }
      ],
      [
        {
          "i": 0,
          "v": 23
        }
      ],
      [
        {
          "i": 0,
          "v": 29
        }
      ],
      [
        {
          "i": 0,
          "v": 36
        }
      ],
      [
        {
          "i": 0,
          "v": 45
        }
      ]
    ]
  },
  "skill_formation05": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 28
        }
      ],
      [
        {
          "i": 0,
          "v": 36
        }
      ],
      [
        {
          "i": 0,
          "v": 47
        }
      ],
      [
        {
          "i": 0,
          "v": 60
        }
      ],
      [
        {
          "i": 0,
          "v": 76
        }
      ]
    ]
  },
  "skill_formation06": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 28
        }
      ],
      [
        {
          "i": 0,
          "v": 36
        }
      ],
      [
        {
          "i": 0,
          "v": 47
        }
      ],
      [
        {
          "i": 0,
          "v": 60
        }
      ],
      [
        {
          "i": 0,
          "v": 76
        }
      ]
    ]
  },
  "skill_formation07": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 28
        }
      ],
      [
        {
          "i": 0,
          "v": 36
        }
      ],
      [
        {
          "i": 0,
          "v": 47
        }
      ],
      [
        {
          "i": 0,
          "v": 60
        }
      ],
      [
        {
          "i": 0,
          "v": 76
        }
      ]
    ]
  },
  "skill_formation08": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 28
        }
      ],
      [
        {
          "i": 0,
          "v": 37
        }
      ],
      [
        {
          "i": 0,
          "v": 49
        }
      ],
      [
        {
          "i": 0,
          "v": 64
        }
      ],
      [
        {
          "i": 0,
          "v": 85
        }
      ],
      [
        {
          "i": 0,
          "v": 112
        }
      ]
    ]
  },
  "skill_formation09": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 28
        }
      ],
      [
        {
          "i": 0,
          "v": 37
        }
      ],
      [
        {
          "i": 0,
          "v": 49
        }
      ],
      [
        {
          "i": 0,
          "v": 64
        }
      ],
      [
        {
          "i": 0,
          "v": 85
        }
      ],
      [
        {
          "i": 0,
          "v": 112
        }
      ]
    ]
  },
  "skill_formation10": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 28
        }
      ],
      [
        {
          "i": 0,
          "v": 37
        }
      ],
      [
        {
          "i": 0,
          "v": 49
        }
      ],
      [
        {
          "i": 0,
          "v": 64
        }
      ],
      [
        {
          "i": 0,
          "v": 85
        }
      ],
      [
        {
          "i": 0,
          "v": 112
        }
      ]
    ]
  },
  "skill_blacksmith01": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 21
        }
      ],
      [
        {
          "i": 0,
          "v": 26
        }
      ],
      [
        {
          "i": 0,
          "v": 33
        }
      ],
      [
        {
          "i": 0,
          "v": 41
        }
      ],
      [
        {
          "i": 0,
          "v": 52
        }
      ],
      [
        {
          "i": 0,
          "v": 65
        }
      ]
    ]
  },
  "skill_blacksmith02": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_blacksmith03": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 17
        }
      ],
      [
        {
          "i": 0,
          "v": 21
        }
      ],
      [
        {
          "i": 0,
          "v": 27
        }
      ],
      [
        {
          "i": 0,
          "v": 33
        }
      ],
      [
        {
          "i": 0,
          "v": 42
        }
      ],
      [
        {
          "i": 0,
          "v": 52
        }
      ]
    ]
  },
  "skill_blacksmith04": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_blacksmith05": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 27
        }
      ],
      [
        {
          "i": 0,
          "v": 34
        }
      ],
      [
        {
          "i": 0,
          "v": 44
        }
      ],
      [
        {
          "i": 0,
          "v": 56
        }
      ],
      [
        {
          "i": 0,
          "v": 72
        }
      ],
      [
        {
          "i": 0,
          "v": 81
        },
        {
          "i": 3,
          "v": 11
        }
      ]
    ]
  },
  "skill_blacksmith06": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 23
        }
      ],
      [
        {
          "i": 0,
          "v": 30
        }
      ],
      [
        {
          "i": 0,
          "v": 38
        }
      ],
      [
        {
          "i": 0,
          "v": 49
        }
      ],
      [
        {
          "i": 0,
          "v": 62
        }
      ],
      [
        {
          "i": 0,
          "v": 80
        }
      ]
    ]
  },
  "skill_blacksmith07": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_blacksmith08": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_blacksmith09": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 28
        }
      ],
      [
        {
          "i": 0,
          "v": 37
        }
      ],
      [
        {
          "i": 0,
          "v": 49
        }
      ],
      [
        {
          "i": 0,
          "v": 64
        }
      ],
      [
        {
          "i": 0,
          "v": 85
        }
      ],
      [
        {
          "i": 0,
          "v": 112
        }
      ]
    ]
  },
  "skill_blacksmith10": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 28
        }
      ],
      [
        {
          "i": 0,
          "v": 37
        }
      ],
      [
        {
          "i": 0,
          "v": 49
        }
      ],
      [
        {
          "i": 0,
          "v": 64
        }
      ],
      [
        {
          "i": 0,
          "v": 85
        }
      ],
      [
        {
          "i": 0,
          "v": 112
        }
      ]
    ]
  },
  "skill_merchant01": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 18
        }
      ],
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 27
        }
      ],
      [
        {
          "i": 0,
          "v": 34
        }
      ],
      [
        {
          "i": 0,
          "v": 43
        }
      ],
      [
        {
          "i": 0,
          "v": 54
        }
      ]
    ]
  },
  "skill_merchant02": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 15
        }
      ],
      [
        {
          "i": 0,
          "v": 18
        }
      ],
      [
        {
          "i": 0,
          "v": 23
        }
      ],
      [
        {
          "i": 0,
          "v": 29
        }
      ],
      [
        {
          "i": 0,
          "v": 36
        }
      ],
      [
        {
          "i": 0,
          "v": 45
        }
      ]
    ]
  },
  "skill_merchant03": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 15
        }
      ],
      [
        {
          "i": 0,
          "v": 18
        }
      ],
      [
        {
          "i": 0,
          "v": 23
        }
      ],
      [
        {
          "i": 0,
          "v": 29
        }
      ],
      [
        {
          "i": 0,
          "v": 36
        }
      ],
      [
        {
          "i": 0,
          "v": 32
        },
        {
          "i": 3,
          "v": 13
        }
      ]
    ]
  },
  "skill_merchant04": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_merchant05": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_merchant06": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 26
        }
      ],
      [
        {
          "i": 0,
          "v": 33
        }
      ],
      [
        {
          "i": 0,
          "v": 43
        }
      ],
      [
        {
          "i": 0,
          "v": 54
        }
      ],
      [
        {
          "i": 0,
          "v": 70
        }
      ],
      [
        {
          "i": 0,
          "v": 89
        }
      ]
    ]
  },
  "skill_merchant07": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_merchant08": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 28
        }
      ],
      [
        {
          "i": 0,
          "v": 37
        }
      ],
      [
        {
          "i": 0,
          "v": 49
        }
      ],
      [
        {
          "i": 0,
          "v": 64
        }
      ],
      [
        {
          "i": 0,
          "v": 85
        }
      ],
      [
        {
          "i": 0,
          "v": 96
        },
        {
          "i": 3,
          "v": 16
        }
      ]
    ]
  },
  "skill_merchant09": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_merchant10": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 28
        }
      ],
      [
        {
          "i": 0,
          "v": 37
        }
      ],
      [
        {
          "i": 0,
          "v": 49
        }
      ],
      [
        {
          "i": 0,
          "v": 64
        }
      ],
      [
        {
          "i": 0,
          "v": 85
        }
      ],
      [
        {
          "i": 0,
          "v": 112
        }
      ]
    ]
  },
  "skill_alchemist01": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 19
        }
      ],
      [
        {
          "i": 0,
          "v": 24
        }
      ],
      [
        {
          "i": 0,
          "v": 30
        }
      ],
      [
        {
          "i": 0,
          "v": 38
        }
      ],
      [
        {
          "i": 0,
          "v": 47
        }
      ],
      [
        {
          "i": 0,
          "v": 50
        },
        {
          "i": 3,
          "v": 9
        }
      ]
    ]
  },
  "skill_alchemist02": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 16
        }
      ],
      [
        {
          "i": 0,
          "v": 20
        }
      ],
      [
        {
          "i": 0,
          "v": 25
        }
      ],
      [
        {
          "i": 0,
          "v": 31
        }
      ],
      [
        {
          "i": 0,
          "v": 39
        }
      ],
      [
        {
          "i": 0,
          "v": 48
        }
      ]
    ]
  },
  "skill_alchemist03": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 15
        }
      ],
      [
        {
          "i": 0,
          "v": 19
        }
      ],
      [
        {
          "i": 0,
          "v": 24
        }
      ],
      [
        {
          "i": 0,
          "v": 30
        }
      ],
      [
        {
          "i": 0,
          "v": 38
        }
      ],
      [
        {
          "i": 0,
          "v": 47
        }
      ]
    ]
  },
  "skill_alchemist04": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_alchemist05": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_alchemist06": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 27
        }
      ],
      [
        {
          "i": 0,
          "v": 34
        }
      ],
      [
        {
          "i": 0,
          "v": 44
        }
      ],
      [
        {
          "i": 0,
          "v": 56
        }
      ],
      [
        {
          "i": 0,
          "v": 72
        }
      ],
      [
        {
          "i": 0,
          "v": 92
        }
      ]
    ]
  },
  "skill_alchemist07": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 29
        }
      ],
      [
        {
          "i": 0,
          "v": 37
        }
      ],
      [
        {
          "i": 0,
          "v": 47
        }
      ],
      [
        {
          "i": 0,
          "v": 60
        }
      ],
      [
        {
          "i": 0,
          "v": 77
        }
      ]
    ]
  },
  "skill_alchemist08": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_alchemist09": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 28
        }
      ],
      [
        {
          "i": 0,
          "v": 37
        }
      ],
      [
        {
          "i": 0,
          "v": 49
        }
      ],
      [
        {
          "i": 0,
          "v": 64
        }
      ],
      [
        {
          "i": 0,
          "v": 85
        }
      ],
      [
        {
          "i": 0,
          "v": 112
        }
      ]
    ]
  },
  "skill_beast01": {
    "mp": [
      4,
      6,
      8,
      10
    ],
    "prof": [
      0,
      50,
      150,
      300
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 17
        }
      ],
      [
        {
          "i": 0,
          "v": 21
        }
      ],
      [
        {
          "i": 0,
          "v": 26
        }
      ],
      [
        {
          "i": 0,
          "v": 32
        }
      ]
    ]
  },
  "skill_beast02": {
    "mp": [
      4,
      6,
      8,
      10
    ],
    "prof": [
      0,
      50,
      150,
      300
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 15
        }
      ],
      [
        {
          "i": 0,
          "v": 18
        }
      ],
      [
        {
          "i": 0,
          "v": 23
        }
      ],
      [
        {
          "i": 0,
          "v": 29
        }
      ]
    ]
  },
  "skill_beast03": {
    "mp": [
      4,
      6,
      8,
      10
    ],
    "prof": [
      0,
      50,
      150,
      300
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 18
        }
      ],
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 27
        }
      ],
      [
        {
          "i": 0,
          "v": 34
        }
      ]
    ]
  },
  "skill_beast04": {
    "mp": [
      4,
      6,
      8,
      10
    ],
    "prof": [
      0,
      50,
      150,
      300
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 19
        }
      ],
      [
        {
          "i": 0,
          "v": 23
        }
      ],
      [
        {
          "i": 0,
          "v": 29
        }
      ],
      [
        {
          "i": 0,
          "v": 36
        }
      ]
    ]
  },
  "skill_beast05": {
    "mp": [
      4,
      6,
      8,
      10
    ],
    "prof": [
      0,
      50,
      150,
      300
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_beast06": {
    "mp": [
      4,
      6,
      8,
      10
    ],
    "prof": [
      0,
      50,
      150,
      300
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 19
        }
      ],
      [
        {
          "i": 0,
          "v": 23
        }
      ],
      [
        {
          "i": 0,
          "v": 29
        }
      ],
      [
        {
          "i": 0,
          "v": 36
        }
      ]
    ]
  },
  "skill_beast07": {
    "mp": [
      4,
      6,
      8,
      10
    ],
    "prof": [
      0,
      50,
      150,
      300
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 19
        }
      ],
      [
        {
          "i": 0,
          "v": 23
        }
      ],
      [
        {
          "i": 0,
          "v": 29
        }
      ],
      [
        {
          "i": 0,
          "v": 36
        }
      ]
    ]
  },
  "skill_beast08": {
    "mp": [
      4,
      6,
      8,
      10
    ],
    "prof": [
      0,
      50,
      150,
      300
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_beast09": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_human01": {
    "mp": [
      4,
      6,
      8,
      10
    ],
    "prof": [
      0,
      50,
      150,
      300
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 14
        }
      ],
      [
        {
          "i": 0,
          "v": 18
        }
      ],
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 28
        }
      ]
    ]
  },
  "skill_human02": {
    "mp": [
      4,
      6,
      8,
      10
    ],
    "prof": [
      0,
      50,
      150,
      300
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 14
        }
      ],
      [
        {
          "i": 0,
          "v": 18
        }
      ],
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 28
        }
      ]
    ]
  },
  "skill_human03": {
    "mp": [
      4,
      6,
      8,
      10
    ],
    "prof": [
      0,
      50,
      150,
      300
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 14
        }
      ],
      [
        {
          "i": 0,
          "v": 18
        }
      ],
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 28
        }
      ]
    ]
  },
  "skill_human04": {
    "mp": [
      4,
      6,
      8,
      10
    ],
    "prof": [
      0,
      50,
      150,
      300
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 14
        }
      ],
      [
        {
          "i": 0,
          "v": 18
        }
      ],
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 28
        }
      ]
    ]
  },
  "skill_human05": {
    "mp": [
      4,
      6,
      8,
      10
    ],
    "prof": [
      0,
      50,
      150,
      300
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 14
        }
      ],
      [
        {
          "i": 0,
          "v": 18
        }
      ],
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 28
        }
      ]
    ]
  },
  "skill_human06": {
    "mp": [
      4,
      6,
      8,
      10
    ],
    "prof": [
      0,
      50,
      150,
      300
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 14
        }
      ],
      [
        {
          "i": 0,
          "v": 18
        }
      ],
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 28
        }
      ]
    ]
  },
  "skill_beast10": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 18
        }
      ],
      [
        {
          "i": 0,
          "v": 23
        }
      ],
      [
        {
          "i": 0,
          "v": 30
        }
      ],
      [
        {
          "i": 0,
          "v": 38
        }
      ]
    ]
  },
  "skill_beast11": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 18
        }
      ],
      [
        {
          "i": 0,
          "v": 23
        }
      ],
      [
        {
          "i": 0,
          "v": 30
        }
      ],
      [
        {
          "i": 0,
          "v": 38
        }
      ]
    ]
  },
  "skill_monster01": {
    "mp": [
      4,
      6,
      8,
      10
    ],
    "prof": [
      0,
      50,
      150,
      300
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_beast12": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_beast13": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_beast14": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_beast15": {
    "mp": [
      30,
      37,
      44,
      51
    ],
    "prof": [
      0,
      500,
      1500,
      3000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 30
        }
      ],
      [
        {
          "i": 0,
          "v": 39
        }
      ],
      [
        {
          "i": 0,
          "v": 52
        }
      ]
    ]
  },
  "skill_beast16": {
    "mp": [
      30,
      37,
      44,
      51
    ],
    "prof": [
      0,
      500,
      1500,
      3000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 30
        }
      ],
      [
        {
          "i": 0,
          "v": 39
        }
      ],
      [
        {
          "i": 0,
          "v": 52
        }
      ]
    ]
  },
  "skill_monster02": {
    "mp": [
      4,
      6,
      8,
      10
    ],
    "prof": [
      0,
      50,
      150,
      300
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 19
        }
      ],
      [
        {
          "i": 0,
          "v": 24
        }
      ],
      [
        {
          "i": 0,
          "v": 30
        }
      ],
      [
        {
          "i": 0,
          "v": 38
        }
      ]
    ]
  },
  "skill_monster03": {
    "mp": [
      4,
      6,
      8,
      10
    ],
    "prof": [
      0,
      50,
      150,
      300
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 21
        }
      ],
      [
        {
          "i": 0,
          "v": 26
        }
      ],
      [
        {
          "i": 0,
          "v": 32
        }
      ],
      [
        {
          "i": 0,
          "v": 40
        }
      ]
    ]
  },
  "skill_monster04": {
    "mp": [
      4,
      6,
      8,
      10
    ],
    "prof": [
      0,
      50,
      150,
      300
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 19
        }
      ],
      [
        {
          "i": 0,
          "v": 24
        }
      ],
      [
        {
          "i": 0,
          "v": 30
        }
      ],
      [
        {
          "i": 0,
          "v": 38
        }
      ]
    ]
  },
  "skill_monster05": {
    "mp": [
      4,
      6,
      8,
      10
    ],
    "prof": [
      0,
      50,
      150,
      300
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_monster06": {
    "mp": [
      4,
      6,
      8,
      10
    ],
    "prof": [
      0,
      50,
      150,
      300
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_monster07": {
    "mp": [
      4,
      6,
      8,
      10
    ],
    "prof": [
      0,
      50,
      150,
      300
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_beast17": {
    "mp": [
      30,
      37,
      44,
      51
    ],
    "prof": [
      0,
      500,
      1500,
      3000
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_beast18": {
    "mp": [
      30,
      37,
      44,
      51
    ],
    "prof": [
      0,
      500,
      1500,
      3000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 30
        }
      ],
      [
        {
          "i": 0,
          "v": 39
        }
      ],
      [
        {
          "i": 0,
          "v": 52
        }
      ]
    ]
  },
  "skill_beast19": {
    "mp": [
      30,
      37,
      44,
      51
    ],
    "prof": [
      0,
      500,
      1500,
      3000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 30
        }
      ],
      [
        {
          "i": 0,
          "v": 39
        }
      ],
      [
        {
          "i": 0,
          "v": 52
        }
      ]
    ]
  },
  "skill_monster08": {
    "mp": [
      4,
      6,
      8,
      10
    ],
    "prof": [
      0,
      50,
      150,
      300
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 21
        }
      ],
      [
        {
          "i": 0,
          "v": 26
        }
      ],
      [
        {
          "i": 0,
          "v": 33
        }
      ],
      [
        {
          "i": 0,
          "v": 41
        }
      ]
    ]
  },
  "skill_monster09": {
    "mp": [
      4,
      6,
      8,
      10
    ],
    "prof": [
      0,
      50,
      150,
      300
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 27
        }
      ],
      [
        {
          "i": 0,
          "v": 34
        }
      ],
      [
        {
          "i": 0,
          "v": 42
        }
      ]
    ]
  },
  "skill_monster10": {
    "mp": [
      4,
      6,
      8,
      10
    ],
    "prof": [
      0,
      50,
      150,
      300
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 19
        }
      ],
      [
        {
          "i": 0,
          "v": 24
        }
      ],
      [
        {
          "i": 0,
          "v": 30
        }
      ],
      [
        {
          "i": 0,
          "v": 38
        }
      ]
    ]
  },
  "skill_monster11": {
    "mp": [
      4,
      6,
      8,
      10
    ],
    "prof": [
      0,
      50,
      150,
      300
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_monster12": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 28
        }
      ],
      [
        {
          "i": 0,
          "v": 36
        }
      ],
      [
        {
          "i": 0,
          "v": 46
        }
      ]
    ]
  },
  "skill_monster13": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 21
        }
      ],
      [
        {
          "i": 0,
          "v": 26
        }
      ],
      [
        {
          "i": 0,
          "v": 34
        }
      ],
      [
        {
          "i": 0,
          "v": 43
        }
      ]
    ]
  },
  "skill_monster14": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_monster15": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 28
        }
      ],
      [
        {
          "i": 0,
          "v": 36
        }
      ],
      [
        {
          "i": 0,
          "v": 46
        }
      ]
    ]
  },
  "skill_monster16": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 21
        }
      ],
      [
        {
          "i": 0,
          "v": 26
        }
      ],
      [
        {
          "i": 0,
          "v": 34
        }
      ],
      [
        {
          "i": 0,
          "v": 43
        }
      ]
    ]
  },
  "skill_monster17": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_monster18": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 28
        }
      ],
      [
        {
          "i": 0,
          "v": 36
        }
      ],
      [
        {
          "i": 0,
          "v": 46
        }
      ]
    ]
  },
  "skill_monster19": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 21
        }
      ],
      [
        {
          "i": 0,
          "v": 26
        }
      ],
      [
        {
          "i": 0,
          "v": 34
        }
      ],
      [
        {
          "i": 0,
          "v": 43
        }
      ]
    ]
  },
  "skill_monster20": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_monster21": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 28
        }
      ],
      [
        {
          "i": 0,
          "v": 36
        }
      ],
      [
        {
          "i": 0,
          "v": 46
        }
      ]
    ]
  },
  "skill_monster22": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 21
        }
      ],
      [
        {
          "i": 0,
          "v": 26
        }
      ],
      [
        {
          "i": 0,
          "v": 34
        }
      ],
      [
        {
          "i": 0,
          "v": 43
        }
      ]
    ]
  },
  "skill_monster23": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_monster24": {
    "mp": [
      30,
      37,
      44,
      51
    ],
    "prof": [
      0,
      500,
      1500,
      3000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 30
        }
      ],
      [
        {
          "i": 0,
          "v": 39
        }
      ],
      [
        {
          "i": 0,
          "v": 52
        }
      ]
    ]
  },
  "skill_monster25": {
    "mp": [
      30,
      37,
      44,
      51
    ],
    "prof": [
      0,
      500,
      1500,
      3000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 30
        }
      ],
      [
        {
          "i": 0,
          "v": 39
        }
      ],
      [
        {
          "i": 0,
          "v": 52
        }
      ]
    ]
  },
  "skill_monster26": {
    "mp": [
      30,
      37,
      44,
      51
    ],
    "prof": [
      0,
      500,
      1500,
      3000
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_monster27": {
    "mp": [
      30,
      37,
      44,
      51
    ],
    "prof": [
      0,
      500,
      1500,
      3000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 30
        }
      ],
      [
        {
          "i": 0,
          "v": 39
        }
      ],
      [
        {
          "i": 0,
          "v": 52
        }
      ]
    ]
  },
  "skill_monster28": {
    "mp": [
      30,
      37,
      44,
      51
    ],
    "prof": [
      0,
      500,
      1500,
      3000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 30
        }
      ],
      [
        {
          "i": 0,
          "v": 39
        }
      ],
      [
        {
          "i": 0,
          "v": 52
        }
      ]
    ]
  },
  "skill_monster29": {
    "mp": [
      30,
      37,
      44,
      51
    ],
    "prof": [
      0,
      500,
      1500,
      3000
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_monster30": {
    "mp": [
      30,
      37,
      44,
      51
    ],
    "prof": [
      0,
      500,
      1500,
      3000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 30
        }
      ],
      [
        {
          "i": 0,
          "v": 39
        }
      ],
      [
        {
          "i": 0,
          "v": 52
        }
      ]
    ]
  },
  "skill_monster31": {
    "mp": [
      30,
      37,
      44,
      51
    ],
    "prof": [
      0,
      500,
      1500,
      3000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 30
        }
      ],
      [
        {
          "i": 0,
          "v": 39
        }
      ],
      [
        {
          "i": 0,
          "v": 52
        }
      ]
    ]
  },
  "skill_monster32": {
    "mp": [
      30,
      37,
      44,
      51
    ],
    "prof": [
      0,
      500,
      1500,
      3000
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_monster33": {
    "mp": [
      30,
      37,
      44,
      51
    ],
    "prof": [
      0,
      500,
      1500,
      3000
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_monster34": {
    "mp": [
      30,
      37,
      44,
      51
    ],
    "prof": [
      0,
      500,
      1500,
      3000
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_monster35": {
    "mp": [
      30,
      37,
      44,
      51
    ],
    "prof": [
      0,
      500,
      1500,
      3000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 30
        }
      ],
      [
        {
          "i": 0,
          "v": 39
        }
      ],
      [
        {
          "i": 0,
          "v": 52
        }
      ]
    ]
  },
  "skill_alchemist10": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 28
        }
      ],
      [
        {
          "i": 0,
          "v": 37
        }
      ],
      [
        {
          "i": 0,
          "v": 49
        }
      ],
      [
        {
          "i": 0,
          "v": 64
        }
      ],
      [
        {
          "i": 0,
          "v": 85
        }
      ],
      [
        {
          "i": 0,
          "v": 112
        }
      ]
    ]
  },
  "skill_human07": {
    "mp": [
      4,
      6,
      8,
      10
    ],
    "prof": [
      0,
      50,
      150,
      300
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_human08": {
    "mp": [
      4,
      6,
      8,
      10
    ],
    "prof": [
      0,
      50,
      150,
      300
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 14
        }
      ],
      [
        {
          "i": 0,
          "v": 18
        }
      ],
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 28
        }
      ]
    ]
  },
  "skill_human09": {
    "mp": [
      4,
      6,
      8,
      10
    ],
    "prof": [
      0,
      50,
      150,
      300
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 14
        }
      ],
      [
        {
          "i": 0,
          "v": 18
        }
      ],
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 28
        }
      ]
    ]
  },
  "skill_human10": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 18
        }
      ],
      [
        {
          "i": 0,
          "v": 23
        }
      ],
      [
        {
          "i": 0,
          "v": 29
        }
      ],
      [
        {
          "i": 0,
          "v": 37
        }
      ]
    ]
  },
  "skill_human11": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_human12": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_beast20": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 20
        }
      ],
      [
        {
          "i": 0,
          "v": 26
        }
      ],
      [
        {
          "i": 0,
          "v": 33
        }
      ],
      [
        {
          "i": 0,
          "v": 42
        }
      ]
    ]
  },
  "skill_beast21": {
    "mp": [
      4,
      6,
      8,
      10
    ],
    "prof": [
      0,
      50,
      150,
      300
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 18
        }
      ],
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 27
        }
      ],
      [
        {
          "i": 0,
          "v": 34
        }
      ]
    ]
  },
  "skill_beast22": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 18
        }
      ],
      [
        {
          "i": 0,
          "v": 23
        }
      ],
      [
        {
          "i": 0,
          "v": 30
        }
      ],
      [
        {
          "i": 0,
          "v": 38
        }
      ]
    ]
  },
  "skill_beast23": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_beast24": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 20
        }
      ],
      [
        {
          "i": 0,
          "v": 25
        }
      ],
      [
        {
          "i": 0,
          "v": 33
        }
      ],
      [
        {
          "i": 0,
          "v": 42
        }
      ]
    ]
  },
  "skill_beast25": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_monster36": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 21
        }
      ],
      [
        {
          "i": 0,
          "v": 26
        }
      ],
      [
        {
          "i": 0,
          "v": 34
        }
      ],
      [
        {
          "i": 0,
          "v": 43
        }
      ]
    ]
  },
  "skill_monster37": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 18
        },
        {
          "i": 1,
          "v": 4
        }
      ],
      [
        {
          "i": 0,
          "v": 22
        },
        {
          "i": 1,
          "v": 6
        }
      ],
      [
        {
          "i": 0,
          "v": 28
        },
        {
          "i": 1,
          "v": 8
        }
      ],
      [
        {
          "i": 0,
          "v": 36
        },
        {
          "i": 1,
          "v": 10
        }
      ]
    ]
  },
  "skill_monster38": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 21
        }
      ],
      [
        {
          "i": 0,
          "v": 26
        }
      ],
      [
        {
          "i": 0,
          "v": 34
        }
      ],
      [
        {
          "i": 0,
          "v": 43
        }
      ]
    ]
  },
  "skill_monster39": {
    "mp": [
      30,
      37,
      44,
      51
    ],
    "prof": [
      0,
      500,
      1500,
      3000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 30
        }
      ],
      [
        {
          "i": 0,
          "v": 39
        }
      ],
      [
        {
          "i": 0,
          "v": 52
        }
      ]
    ]
  },
  "skill_monster40": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_monster41": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_monster42": {
    "mp": [
      30,
      37,
      44,
      51
    ],
    "prof": [
      0,
      500,
      1500,
      3000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 30
        }
      ],
      [
        {
          "i": 0,
          "v": 39
        }
      ],
      [
        {
          "i": 0,
          "v": 52
        }
      ]
    ]
  },
  "skill_monster43": {
    "mp": [
      30,
      37,
      44,
      51
    ],
    "prof": [
      0,
      500,
      1500,
      3000
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_fairy01": {
    "mp": [
      4,
      6,
      8,
      10
    ],
    "prof": [
      0,
      50,
      150,
      300
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 14
        }
      ],
      [
        {
          "i": 0,
          "v": 18
        }
      ],
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 28
        }
      ]
    ]
  },
  "skill_fairy02": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 18
        }
      ],
      [
        {
          "i": 0,
          "v": 23
        }
      ],
      [
        {
          "i": 0,
          "v": 29
        }
      ],
      [
        {
          "i": 0,
          "v": 37
        }
      ]
    ]
  },
  "skill_fairy03": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_fairy04": {
    "mp": [
      4,
      6,
      8,
      10
    ],
    "prof": [
      0,
      50,
      150,
      300
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 14
        }
      ],
      [
        {
          "i": 0,
          "v": 18
        }
      ],
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 28
        }
      ]
    ]
  },
  "skill_fairy05": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 18
        }
      ],
      [
        {
          "i": 0,
          "v": 23
        }
      ],
      [
        {
          "i": 0,
          "v": 29
        }
      ],
      [
        {
          "i": 0,
          "v": 37
        }
      ]
    ]
  },
  "skill_fairy06": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 18
        }
      ],
      [
        {
          "i": 0,
          "v": 23
        }
      ],
      [
        {
          "i": 0,
          "v": 29
        }
      ],
      [
        {
          "i": 0,
          "v": 37
        }
      ]
    ]
  },
  "skill_demon01": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 21
        }
      ],
      [
        {
          "i": 0,
          "v": 26
        }
      ],
      [
        {
          "i": 0,
          "v": 34
        }
      ],
      [
        {
          "i": 0,
          "v": 43
        }
      ]
    ]
  },
  "skill_demon02": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 21
        }
      ],
      [
        {
          "i": 0,
          "v": 26
        }
      ],
      [
        {
          "i": 0,
          "v": 34
        }
      ],
      [
        {
          "i": 0,
          "v": 43
        }
      ]
    ]
  },
  "skill_demon03": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 21
        }
      ],
      [
        {
          "i": 0,
          "v": 26
        }
      ],
      [
        {
          "i": 0,
          "v": 34
        }
      ],
      [
        {
          "i": 0,
          "v": 43
        }
      ]
    ]
  },
  "skill_demon04": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_demon05": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_demon06": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_demon07": {
    "mp": [
      30,
      37,
      44,
      51
    ],
    "prof": [
      0,
      500,
      1500,
      3000
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_demon08": {
    "mp": [
      30,
      37,
      44,
      51
    ],
    "prof": [
      0,
      500,
      1500,
      3000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 30
        }
      ],
      [
        {
          "i": 0,
          "v": 39
        }
      ],
      [
        {
          "i": 0,
          "v": 52
        }
      ]
    ]
  },
  "skill_cult01": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 18
        }
      ],
      [
        {
          "i": 0,
          "v": 23
        }
      ],
      [
        {
          "i": 0,
          "v": 29
        }
      ],
      [
        {
          "i": 0,
          "v": 37
        }
      ]
    ]
  },
  "skill_cult02": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_cult03": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 18
        }
      ],
      [
        {
          "i": 0,
          "v": 23
        }
      ],
      [
        {
          "i": 0,
          "v": 29
        }
      ],
      [
        {
          "i": 0,
          "v": 37
        }
      ]
    ]
  },
  "skill_cult04": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 16
        },
        {
          "i": 1,
          "v": 2
        }
      ],
      [
        {
          "i": 0,
          "v": 20
        },
        {
          "i": 1,
          "v": 3
        }
      ],
      [
        {
          "i": 0,
          "v": 25
        },
        {
          "i": 1,
          "v": 4
        }
      ],
      [
        {
          "i": 0,
          "v": 32
        },
        {
          "i": 1,
          "v": 5
        }
      ]
    ]
  },
  "skill_cult05": {
    "mp": [
      30,
      37,
      44,
      51
    ],
    "prof": [
      0,
      500,
      1500,
      3000
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_cult06": {
    "mp": [
      10,
      12,
      15,
      17
    ],
    "prof": [
      0,
      150,
      450,
      900
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_cult07": {
    "mp": [
      30,
      37,
      44,
      51
    ],
    "prof": [
      0,
      500,
      1500,
      3000
    ],
    "dmg": [
      [],
      [],
      [],
      []
    ]
  },
  "skill_cult08": {
    "mp": [
      30,
      37,
      44,
      51
    ],
    "prof": [
      0,
      500,
      1500,
      3000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 30
        }
      ],
      [
        {
          "i": 0,
          "v": 39
        }
      ],
      [
        {
          "i": 0,
          "v": 52
        }
      ]
    ]
  },
  "skill_paladin01": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 21
        }
      ],
      [
        {
          "i": 0,
          "v": 26
        }
      ],
      [
        {
          "i": 0,
          "v": 33
        }
      ],
      [
        {
          "i": 0,
          "v": 41
        }
      ],
      [
        {
          "i": 0,
          "v": 52
        }
      ],
      [
        {
          "i": 0,
          "v": 65
        }
      ]
    ]
  },
  "skill_paladin02": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_paladin03": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 26
        }
      ],
      [
        {
          "i": 0,
          "v": 33
        }
      ],
      [
        {
          "i": 0,
          "v": 42
        }
      ],
      [
        {
          "i": 0,
          "v": 54
        }
      ],
      [
        {
          "i": 0,
          "v": 69
        }
      ],
      [
        {
          "i": 0,
          "v": 89
        }
      ]
    ]
  },
  "skill_paladin04": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_demonknight01": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 21
        }
      ],
      [
        {
          "i": 0,
          "v": 26
        }
      ],
      [
        {
          "i": 0,
          "v": 33
        }
      ],
      [
        {
          "i": 0,
          "v": 41
        }
      ],
      [
        {
          "i": 0,
          "v": 52
        }
      ],
      [
        {
          "i": 0,
          "v": 65
        }
      ]
    ]
  },
  "skill_demonknight02": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_demonknight03": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 26
        }
      ],
      [
        {
          "i": 0,
          "v": 33
        }
      ],
      [
        {
          "i": 0,
          "v": 42
        }
      ],
      [
        {
          "i": 0,
          "v": 54
        }
      ],
      [
        {
          "i": 0,
          "v": 69
        }
      ],
      [
        {
          "i": 0,
          "v": 89
        }
      ]
    ]
  },
  "skill_demonknight04": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 28
        }
      ],
      [
        {
          "i": 0,
          "v": 37
        }
      ],
      [
        {
          "i": 0,
          "v": 49
        }
      ],
      [
        {
          "i": 0,
          "v": 64
        }
      ],
      [
        {
          "i": 0,
          "v": 85
        }
      ],
      [
        {
          "i": 0,
          "v": 112
        }
      ]
    ]
  },
  "skill_meleemage01": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 13
        },
        {
          "i": 1,
          "v": 9
        }
      ],
      [
        {
          "i": 0,
          "v": 21
        },
        {
          "i": 1,
          "v": 7
        }
      ],
      [
        {
          "i": 0,
          "v": 29
        },
        {
          "i": 1,
          "v": 6
        }
      ],
      [
        {
          "i": 0,
          "v": 39
        },
        {
          "i": 1,
          "v": 5
        }
      ],
      [
        {
          "i": 0,
          "v": 49
        },
        {
          "i": 1,
          "v": 6
        }
      ],
      [
        {
          "i": 0,
          "v": 40
        },
        {
          "i": 1,
          "v": 29
        }
      ]
    ]
  },
  "skill_meleemage02": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_meleemage03": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 26
        }
      ],
      [
        {
          "i": 0,
          "v": 33
        }
      ],
      [
        {
          "i": 0,
          "v": 42
        }
      ],
      [
        {
          "i": 0,
          "v": 54
        }
      ],
      [
        {
          "i": 0,
          "v": 69
        }
      ],
      [
        {
          "i": 0,
          "v": 89
        }
      ]
    ]
  },
  "skill_meleemage04": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 28
        }
      ],
      [
        {
          "i": 0,
          "v": 37
        }
      ],
      [
        {
          "i": 0,
          "v": 49
        }
      ],
      [
        {
          "i": 0,
          "v": 64
        }
      ],
      [
        {
          "i": 0,
          "v": 85
        }
      ],
      [
        {
          "i": 0,
          "v": 112
        }
      ]
    ]
  },
  "skill_maniac01": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_maniac02": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 28
        }
      ],
      [
        {
          "i": 0,
          "v": 36
        }
      ],
      [
        {
          "i": 0,
          "v": 47
        }
      ],
      [
        {
          "i": 0,
          "v": 60
        }
      ],
      [
        {
          "i": 0,
          "v": 76
        }
      ]
    ]
  },
  "skill_maniac03": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_maniac04": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_aviator01": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 21
        }
      ],
      [
        {
          "i": 0,
          "v": 26
        }
      ],
      [
        {
          "i": 0,
          "v": 33
        }
      ],
      [
        {
          "i": 0,
          "v": 41
        }
      ],
      [
        {
          "i": 0,
          "v": 52
        }
      ],
      [
        {
          "i": 0,
          "v": 65
        }
      ]
    ]
  },
  "skill_aviator02": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_aviator03": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 23
        }
      ],
      [
        {
          "i": 0,
          "v": 29
        }
      ],
      [
        {
          "i": 0,
          "v": 38
        }
      ],
      [
        {
          "i": 0,
          "v": 48
        }
      ],
      [
        {
          "i": 0,
          "v": 62
        }
      ],
      [
        {
          "i": 0,
          "v": 79
        }
      ]
    ]
  },
  "skill_aviator04": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_wingknight01": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 20
        }
      ],
      [
        {
          "i": 0,
          "v": 25
        }
      ],
      [
        {
          "i": 0,
          "v": 32
        }
      ],
      [
        {
          "i": 0,
          "v": 39
        }
      ],
      [
        {
          "i": 0,
          "v": 49
        }
      ],
      [
        {
          "i": 0,
          "v": 62
        }
      ]
    ]
  },
  "skill_wingknight02": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_wingknight03": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 28
        }
      ],
      [
        {
          "i": 0,
          "v": 36
        }
      ],
      [
        {
          "i": 0,
          "v": 47
        }
      ],
      [
        {
          "i": 0,
          "v": 60
        }
      ],
      [
        {
          "i": 0,
          "v": 76
        }
      ]
    ]
  },
  "skill_wingknight04": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 29
        }
      ],
      [
        {
          "i": 0,
          "v": 39
        }
      ],
      [
        {
          "i": 0,
          "v": 51
        }
      ],
      [
        {
          "i": 0,
          "v": 68
        }
      ],
      [
        {
          "i": 0,
          "v": 89
        }
      ],
      [
        {
          "i": 0,
          "v": 118
        }
      ]
    ]
  },
  "skill_ironpagoda01": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 21
        }
      ],
      [
        {
          "i": 0,
          "v": 26
        }
      ],
      [
        {
          "i": 0,
          "v": 33
        }
      ],
      [
        {
          "i": 0,
          "v": 41
        }
      ],
      [
        {
          "i": 0,
          "v": 52
        }
      ],
      [
        {
          "i": 0,
          "v": 65
        }
      ]
    ]
  },
  "skill_ironpagoda02": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_ironpagoda03": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 22
        }
      ],
      [
        {
          "i": 0,
          "v": 28
        }
      ],
      [
        {
          "i": 0,
          "v": 36
        }
      ],
      [
        {
          "i": 0,
          "v": 47
        }
      ],
      [
        {
          "i": 0,
          "v": 60
        }
      ],
      [
        {
          "i": 0,
          "v": 76
        }
      ]
    ]
  },
  "skill_ironpagoda04": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_tamer01": {
    "mp": [
      4,
      6,
      8,
      10,
      12,
      14
    ],
    "prof": [
      0,
      50,
      150,
      300,
      500,
      750
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_tamer02": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [
        {
          "i": 0,
          "v": 27
        }
      ],
      [
        {
          "i": 0,
          "v": 34
        }
      ],
      [
        {
          "i": 0,
          "v": 44
        }
      ],
      [
        {
          "i": 0,
          "v": 56
        }
      ],
      [
        {
          "i": 0,
          "v": 72
        }
      ],
      [
        {
          "i": 0,
          "v": 92
        }
      ]
    ]
  },
  "skill_tamer03": {
    "mp": [
      10,
      12,
      15,
      17,
      20,
      22
    ],
    "prof": [
      0,
      150,
      450,
      900,
      1500,
      2200
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  },
  "skill_tamer04": {
    "mp": [
      30,
      37,
      44,
      51,
      58,
      65
    ],
    "prof": [
      0,
      500,
      1500,
      3000,
      5000,
      7000
    ],
    "dmg": [
      [],
      [],
      [],
      [],
      [],
      []
    ]
  }
};
Object.keys(SKILL_CURVE_PATCH).forEach(function(id){
  const p=SKILL_CURVE_PATCH[id]; const sk=SKILLS[id]; if(!sk) return;
  (sk.levels||[]).forEach(function(lv,i){
    if(p.mp && p.mp[i]!=null) lv.mpCost=p.mp[i];
    if(p.prof && p.prof[i]!=null) lv.proficiency=p.prof[i];
    ((p.dmg && p.dmg[i])||[]).forEach(function(x){
      if(lv.effects && lv.effects[x.i]) lv.effects[x.i].value=x.v;
    });
  });
});

const SKILL_DRAFT_MODE = false;

if(SKILL_DRAFT_MODE){
  for(const _sid in SKILLS){
    const _sk = SKILLS[_sid];
    _sk.draft = true;
    (_sk.levels || []).forEach(_lv => {
      _lv.effects = [];
    });
  }
}

function isSkillDraft(sk){ return !!(sk && sk.draft); }

/* 某一级的技能效果是否为空（白板技能） */
function skillHasEffects(sk, lvData){
  const e = lvData ? lvData.effects : (sk && sk.levels && sk.levels[0] ? sk.levels[0].effects : null);
  return !!(e && e.length);
}
