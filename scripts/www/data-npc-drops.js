/* ============================================================
   data-npc-drops.js — 角色掉落表 + 掉落规则（重做方案）
   ------------------------------------------------------------
   数据来源：《角色分类.xlsx》，167 个角色逐条录入。
   字段：
     cat     分类
     lv      表内等级
     mats    掉落材料（普通，独立判定）
     special 特殊材料掉落
     items   掉落道具（药品 / 唯一剧情道具）
     rel     相关道具（首领剧情道具，必掉）
   ------------------------------------------------------------
   掉落规则（掉落池 + 权重 + 抽取次数）：
     · 每个角色只有一个 drops 池，池内按 weight 权重随机抽取
     · 战斗胜利后按等级抽 rolls 次，每次有 rollChance 概率掉出 1 件
       （同件可重复抽中，数量叠加）
     · 普通材料权重 100、特殊材料 15、药品 40
     · 唯一剧情道具 / 首级 · 密令标记 guaranteed（必掉，不参与权重）
   抽取次数、数量区间、各类权重集中在 NPC_DROP_RULES，改档位即可全局调整。
   ============================================================ */

const NPC_DROP_RULES = {
  /* 战斗胜利后按角色等级抽取几次（每次按权重取 1 件） */
  rolls: [
    { maxLv: 9,   rolls: 1 },
    { maxLv: 19,  rolls: 2 },
    { maxLv: 29,  rolls: 2 },
    { maxLv: 39,  rolls: 3 },
    { maxLv: 999, rolls: 3 }
  ],
  /* 每次抽取真正掉出物品的概率（抽不中就是空手，避免单物品池必掉） */
  rollChance: 0.65,
  /* 普通材料的掉落数量区间（按等级） */
  counts: [
    { maxLv: 9,   min: 1, max: 2 },
    { maxLv: 19,  min: 1, max: 2 },
    { maxLv: 29,  min: 1, max: 3 },
    { maxLv: 39,  min: 1, max: 3 },
    { maxLv: 999, min: 2, max: 3 }
  ],
  /* 各类物品的默认权重：普通材料最常见，特殊材料稀有，药品居中 */
  weight: {
    material: 100,
    special: 15,
    potion: 40,
    rare: 1
  }
};

const NPC_DROP_TABLE = {
  npc299:{cat:'野兽类', lv:1, mats:['兽毛', '小型兽皮'], special:[], items:[], rel:[]},
  npc300:{cat:'野兽类', lv:1, mats:['小型兽爪'], special:[], items:[], rel:[]},
  npc301:{cat:'野兽类', lv:2, mats:['小型兽爪'], special:[], items:[], rel:[]},
  npc302:{cat:'野兽类', lv:2, mats:['小型兽爪', '小型兽皮'], special:[], items:[], rel:[]},
  npc303:{cat:'野兽类', lv:3, mats:['獠牙'], special:[], items:[], rel:[]},
  npc304:{cat:'野兽类', lv:3, mats:['獠牙', '兽皮'], special:[], items:[], rel:[]},
  npc305:{cat:'野兽类', lv:3, mats:['小型兽爪'], special:[], items:[], rel:[]},
  npc306:{cat:'野兽类', lv:3, mats:['兽毛', '兽皮'], special:[], items:[], rel:[]},
  npc307:{cat:'野兽类', lv:3, mats:['甲壳'], special:[], items:[], rel:[]},
  npc308:{cat:'野兽类', lv:3, mats:['甲壳'], special:[], items:[], rel:[]},
  npc309:{cat:'野兽类', lv:4, mats:['兽毛', '小型兽皮'], special:[], items:[], rel:[]},
  npc310:{cat:'野兽类', lv:4, mats:['小型兽爪'], special:[], items:[], rel:[]},
  npc311:{cat:'野兽类', lv:4, mats:['丝线'], special:[], items:[], rel:[]},
  npc312:{cat:'野兽类', lv:4, mats:['兽毛', '兽皮', '獠牙', '兽爪'], special:[], items:[], rel:[]},
  npc313:{cat:'野兽类', lv:4, mats:['鳞皮', '獠牙'], special:[], items:[], rel:[]},
  npc314:{cat:'野兽类', lv:4, mats:['小型兽爪'], special:[], items:[], rel:[]},
  npc315:{cat:'野兽类', lv:4, mats:['兽毛', '兽皮', '獠牙', '兽爪'], special:[], items:[], rel:[]},
  npc316:{cat:'野兽类', lv:7, mats:['鳞皮', '獠牙'], special:[], items:[], rel:[]},
  npc317:{cat:'野兽类', lv:7, mats:['甲壳', '毒囊'], special:[], items:[], rel:[]},
  npc318:{cat:'野兽类', lv:7, mats:['鳞皮', '獠牙'], special:[], items:[], rel:[]},
  npc319:{cat:'野兽类', lv:8, mats:['毒囊'], special:[], items:[], rel:[]},
  npc320:{cat:'野兽类', lv:8, mats:['兽角', '兽皮'], special:[], items:[], rel:[]},
  npc321:{cat:'野兽类', lv:8, mats:['獠牙'], special:[], items:[], rel:[]},
  npc322:{cat:'野兽类', lv:9, mats:['兽皮'], special:[], items:[], rel:[]},
  npc323:{cat:'野兽类', lv:9, mats:['兽爪', '兽皮'], special:[], items:[], rel:[]},
  npc324:{cat:'野兽类', lv:9, mats:['鳞皮'], special:[], items:[], rel:[]},
  npc325:{cat:'野兽类', lv:12, mats:['兽毛', '兽皮'], special:[], items:[], rel:[]},
  npc326:{cat:'野兽类', lv:12, mats:['丝线', '甲壳', '毒囊'], special:[], items:[], rel:[]},
  npc327:{cat:'野兽类', lv:12, mats:['甲壳'], special:[], items:[], rel:[]},
  npc328:{cat:'野兽类', lv:15, mats:['兽毛', '兽皮', '獠牙', '兽爪'], special:[], items:[], rel:[]},
  npc329:{cat:'野兽类', lv:15, mats:['兽毛', '兽皮', '獠牙', '兽爪'], special:['硬质獠牙'], items:[], rel:[]},
  npc330:{cat:'野兽类', lv:17, mats:['兽毛', '兽皮', '獠牙', '兽爪'], special:[], items:[], rel:[]},
  npc331:{cat:'野兽类', lv:17, mats:['兽羽', '兽爪', '鸟喙'], special:[], items:[], rel:[]},
  npc332:{cat:'野兽类', lv:18, mats:[], special:['发电器官'], items:[], rel:[]},
  npc333:{cat:'野兽类', lv:18, mats:['甲壳', '毒囊'], special:[], items:[], rel:[]},
  npc334:{cat:'野兽类', lv:22, mats:['兽毛', '兽皮', '獠牙', '兽爪'], special:[], items:[], rel:[]},
  npc335:{cat:'野兽类', lv:22, mats:[], special:['墨囊', '章鱼皮'], items:[], rel:[]},
  npc336:{cat:'野兽类', lv:24, mats:['丝线', '毒囊'], special:[], items:[], rel:[]},
  npc337:{cat:'野兽类', lv:24, mats:['鳞皮', '獠牙'], special:['尾环'], items:[], rel:[]},
  npc338:{cat:'野兽类', lv:28, mats:['兽毛', '兽皮', '獠牙', '兽爪'], special:[], items:[], rel:[]},
  npc339:{cat:'野兽类', lv:28, mats:['兽爪', '獠牙'], special:['鳄皮'], items:[], rel:[]},
  npc340:{cat:'野兽类', lv:29, mats:['兽毛', '兽皮', '獠牙', '兽爪'], special:['血晶'], items:[], rel:[]},
  npc341:{cat:'野兽类', lv:29, mats:['獠牙'], special:[], items:[], rel:[]},
  npc342:{cat:'野兽类', lv:30, mats:['毒囊'], special:['再造器官', '水晶'], items:[], rel:[]},
  npc343:{cat:'野兽类', lv:30, mats:['兽毛', '兽皮', '獠牙', '兽爪'], special:[], items:[], rel:[]},
  npc344:{cat:'野兽类', lv:33, mats:['甲壳', '毒囊'], special:['毒刺'], items:[], rel:[]},
  npc345:{cat:'野兽类', lv:33, mats:['獠牙'], special:['鲨鱼皮'], items:[], rel:[]},
  npc346:{cat:'野兽类', lv:34, mats:['獠牙', '兽爪'], special:['抗阻皮毛'], items:['红药水（中）', '蓝药水（中）'], rel:[]},
  npc347:{cat:'野兽类', lv:38, mats:['鳞皮', '獠牙'], special:['巨型獠牙'], items:['红药水（中）', '蓝药水（中）'], rel:[]},
  npc348:{cat:'野兽类', lv:40, mats:[], special:[], items:['红药水（中）', '蓝药水（中）'], rel:[]},
  npc349:{cat:'野兽类', lv:42, mats:['甲壳', '毒囊'], special:['硬质巨钳'], items:['红药水（中）', '蓝药水（中）'], rel:[]},
  npc350:{cat:'魔兽类', lv:5, mats:[], special:['硬化晶石'], items:[], rel:[]},
  npc351:{cat:'魔兽类', lv:6, mats:[], special:['尖啸宝石'], items:[], rel:[]},
  npc352:{cat:'魔兽类', lv:8, mats:['兽毛', '兽皮'], special:['淬火獠牙', '淬火兽爪'], items:[], rel:[]},
  npc353:{cat:'魔兽类', lv:10, mats:[], special:[], items:['红药水（中）', '蓝药水（中）'], rel:[]},
  npc354:{cat:'魔兽类', lv:10, mats:[], special:['硬质皮甲'], items:[], rel:[]},
  npc355:{cat:'魔兽类', lv:14, mats:['毒囊', '兽爪', '兽皮'], special:['魔抗鬃毛'], items:[], rel:[]},
  npc356:{cat:'魔兽类', lv:15, mats:[], special:[], items:['红药水（中）', '蓝药水（中）'], rel:[]},
  npc357:{cat:'魔兽类', lv:15, mats:[], special:['幼龙之牙'], items:[], rel:[]},
  npc358:{cat:'魔兽类', lv:20, mats:['鳞皮', '獠牙'], special:[], items:[], rel:[]},
  npc359:{cat:'魔兽类', lv:20, mats:[], special:['龙翼'], items:[], rel:[]},
  npc360:{cat:'魔兽类', lv:21, mats:['兽毛', '兽皮', '兽爪', '獠牙', '鳞皮', '毒囊', '甲壳'], special:[], items:[], rel:[]},
  npc361:{cat:'魔兽类', lv:22, mats:[], special:[], items:['红药水（大）'], rel:[]},
  npc362:{cat:'魔兽类', lv:25, mats:[], special:[], items:['蓝药水（大）'], rel:[]},
  npc363:{cat:'魔兽类', lv:26, mats:[], special:['独角兽之角'], items:[], rel:[]},
  npc364:{cat:'魔兽类', lv:26, mats:['龙之牙', '龙之骨'], special:[], items:[], rel:[]},
  npc365:{cat:'魔兽类', lv:27, mats:[], special:['凤凰之羽'], items:[], rel:[]},
  npc366:{cat:'魔兽类', lv:27, mats:[], special:[], items:['红药水（大）', '蓝药水（大）'], rel:[]},
  npc367:{cat:'魔兽类', lv:28, mats:[], special:['迅捷之羽'], items:[], rel:[]},
  npc368:{cat:'魔兽类', lv:28, mats:['龙之牙', '龙之骨'], special:[], items:[], rel:[]},
  npc369:{cat:'魔兽类', lv:29, mats:[], special:[], items:[], rel:[]},
  npc370:{cat:'魔兽类', lv:29, mats:[], special:['火晶', '炎魔之冠'], items:[], rel:[]},
  npc371:{cat:'魔兽类', lv:30, mats:['龙之牙', '龙之骨'], special:['黄金之肤'], items:[], rel:[]},
  npc372:{cat:'魔兽类', lv:35, mats:['龙之牙', '龙之骨'], special:[], items:[], rel:[]},
  npc373:{cat:'魔兽类', lv:35, mats:[], special:[], items:['红药水（大）', '蓝药水（大）'], rel:[]},
  npc374:{cat:'魔兽类', lv:40, mats:['龙之牙', '龙之骨'], special:[], items:['红药水（大）', '蓝药水（大）'], rel:[]},
  npc375:{cat:'魔兽类', lv:40, mats:[], special:['神力锁'], items:['红药水（极）', '蓝药水（极）'], rel:[]},
  npc376:{cat:'魔兽类', lv:45, mats:[], special:[], items:['红药水（极）', '蓝药水（极）'], rel:[]},
  npc377:{cat:'妖精类', lv:3, mats:['蓝色碎片'], special:[], items:[], rel:[]},
  npc378:{cat:'妖精类', lv:4, mats:['绿色碎片'], special:['迷幻孢子'], items:[], rel:[]},
  npc379:{cat:'妖精类', lv:8, mats:['白色碎片'], special:[], items:[], rel:[]},
  npc380:{cat:'妖精类', lv:9, mats:['绿色碎片', '黄色碎片'], special:['再生种子', '叶绿素'], items:[], rel:[]},
  npc381:{cat:'妖精类', lv:15, mats:['白色碎片'], special:[], items:[], rel:[]},
  npc382:{cat:'妖精类', lv:16, mats:['蓝色碎片'], special:[], items:[], rel:[]},
  npc383:{cat:'妖精类', lv:16, mats:['红色碎片'], special:[], items:[], rel:[]},
  npc384:{cat:'妖精类', lv:16, mats:['黄色碎片'], special:[], items:[], rel:[]},
  npc385:{cat:'妖精类', lv:16, mats:['绿色碎片'], special:[], items:[], rel:[]},
  npc386:{cat:'妖精类', lv:18, mats:['蓝色碎片'], special:[], items:[], rel:[]},
  npc387:{cat:'妖精类', lv:20, mats:['绿色碎片'], special:[], items:[], rel:[]},
  npc388:{cat:'妖精类', lv:21, mats:['绿色碎片', '黄色碎片'], special:['奇花'], items:[], rel:[]},
  npc389:{cat:'妖精类', lv:22, mats:['绿色碎片', '黄色碎片'], special:[], items:[], rel:[]},
  npc390:{cat:'妖精类', lv:23, mats:['紫色碎片'], special:[], items:[], rel:[]},
  npc391:{cat:'妖精类', lv:25, mats:['蓝色碎片'], special:[], items:[], rel:[]},
  npc392:{cat:'妖精类', lv:25, mats:['红色碎片'], special:[], items:[], rel:[]},
  npc393:{cat:'妖精类', lv:25, mats:['黄色碎片'], special:[], items:[], rel:[]},
  npc394:{cat:'妖精类', lv:25, mats:['绿色碎片'], special:[], items:[], rel:[]},
  npc395:{cat:'妖精类', lv:26, mats:['黑色碎片', '白色碎片', '红色碎片', '紫色碎片'], special:[], items:[], rel:[]},
  npc396:{cat:'妖精类', lv:27, mats:['黄色碎片'], special:[], items:[], rel:[]},
  npc397:{cat:'妖精类', lv:28, mats:['蓝色碎片', '白色碎片'], special:[], items:[], rel:[]},
  npc398:{cat:'妖精类', lv:28, mats:['蓝色碎片'], special:[], items:[], rel:[]},
  npc399:{cat:'妖精类', lv:30, mats:['紫色碎片'], special:[], items:[], rel:[]},
  npc400:{cat:'妖精类', lv:35, mats:['黑色碎片', '白色碎片'], special:[], items:[], rel:[]},
  npc401:{cat:'妖精类', lv:36, mats:['红色碎片'], special:[], items:[], rel:[]},
  npc402:{cat:'妖精类', lv:38, mats:['黄色碎片', '白色碎片'], special:[], items:[], rel:[]},
  npc403:{cat:'妖精类', lv:40, mats:['黑色碎片'], special:[], items:[], rel:[]},
  npc404:{cat:'妖精类', lv:43, mats:['绿色碎片'], special:[], items:[], rel:[]},
  npc405:{cat:'妖精类', lv:43, mats:['蓝色碎片'], special:[], items:[], rel:[]},
  npc406:{cat:'妖精类', lv:43, mats:['黄色碎片'], special:[], items:[], rel:[]},
  npc407:{cat:'妖精类', lv:43, mats:['红色碎片'], special:[], items:[], rel:[]},
  npc408:{cat:'妖精类', lv:45, mats:['紫色碎片'], special:[], items:[], rel:[]},
  npc409:{cat:'恶人类', lv:3, mats:[], special:[], items:['红药水（小）', '蓝药水（小）'], rel:[]},
  npc410:{cat:'恶人类', lv:4, mats:[], special:[], items:['红药水（小）', '蓝药水（小）'], rel:[]},
  npc411:{cat:'恶人类', lv:4, mats:[], special:[], items:['红药水（小）', '蓝药水（小）'], rel:[]},
  npc412:{cat:'恶人类', lv:4, mats:[], special:[], items:['红药水（小）', '蓝药水（小）'], rel:[]},
  npc413:{cat:'恶人类', lv:7, mats:[], special:[], items:['红药水（小）', '蓝药水（小）'], rel:[]},
  npc414:{cat:'恶人类', lv:10, mats:[], special:[], items:['红药水（小）', '蓝药水（小）'], rel:[]},
  npc415:{cat:'恶人类', lv:12, mats:[], special:[], items:['红药水（中）', '蓝药水（中）'], rel:[]},
  npc416:{cat:'恶人类', lv:15, mats:[], special:[], items:['红药水（中）', '蓝药水（中）'], rel:[]},
  npc417:{cat:'恶人类', lv:15, mats:[], special:[], items:['红药水（中）', '蓝药水（中）'], rel:[]},
  npc418:{cat:'恶人类', lv:18, mats:[], special:[], items:['红药水（中）', '蓝药水（中）'], rel:[]},
  npc419:{cat:'恶人类', lv:18, mats:[], special:[], items:['红药水（中）', '蓝药水（中）'], rel:[]},
  npc420:{cat:'恶人类', lv:20, mats:[], special:[], items:['红药水（中）', '蓝药水（中）'], rel:[]},
  npc421:{cat:'恶人类', lv:21, mats:[], special:[], items:['红药水（大）', '蓝药水（大）'], rel:[]},
  npc422:{cat:'恶人类', lv:25, mats:[], special:[], items:['红药水（大）', '蓝药水（大）'], rel:[]},
  npc423:{cat:'恶人类', lv:25, mats:[], special:[], items:['红药水（大）', '蓝药水（大）'], rel:[]},
  npc424:{cat:'恶人类', lv:28, mats:[], special:[], items:['红药水（大）', '蓝药水（大）'], rel:[]},
  npc425:{cat:'恶人类', lv:30, mats:[], special:[], items:['红药水（大）', '蓝药水（大）'], rel:[]},
  npc426:{cat:'恶人类', lv:33, mats:[], special:[], items:['红药水（大）', '蓝药水（大）'], rel:[]},
  npc427:{cat:'恶人类', lv:34, mats:[], special:[], items:['红药水（大）', '蓝药水（大）'], rel:[]},
  npc428:{cat:'恶人类', lv:40, mats:[], special:[], items:['红药水（大）', '蓝药水（大）'], rel:[]},
  npc429:{cat:'邪教类', lv:10, mats:[], special:[], items:['红药水（中）', '蓝药水（中）'], rel:[]},
  npc430:{cat:'邪教类', lv:15, mats:[], special:[], items:['红药水（中）', '蓝药水（中）'], rel:[]},
  npc431:{cat:'邪教类', lv:20, mats:[], special:[], items:['红药水（中）', '蓝药水（中）'], rel:[]},
  npc432:{cat:'邪教类', lv:25, mats:[], special:[], items:['红药水（中）', '蓝药水（中）'], rel:[]},
  npc433:{cat:'邪教类', lv:28, mats:[], special:[], items:['红药水（大）', '蓝药水（大）'], rel:[]},
  npc434:{cat:'邪教类', lv:35, mats:[], special:[], items:['红药水（大）', '蓝药水（大）'], rel:[]},
  npc435:{cat:'邪教类', lv:40, mats:[], special:[], items:['红药水（大）', '蓝药水（大）'], rel:[]},
  npc436:{cat:'邪教类', lv:42, mats:[], special:[], items:['红药水（大）', '蓝药水（大）'], rel:[]},
  npc437:{cat:'魔军类', lv:12, mats:[], special:['魔气'], items:[], rel:[]},
  npc438:{cat:'魔军类', lv:14, mats:[], special:['魔气'], items:[], rel:[]},
  npc439:{cat:'魔军类', lv:15, mats:[], special:['魔气'], items:[], rel:[]},
  npc440:{cat:'魔军类', lv:16, mats:[], special:['魔气'], items:['密探通令'], rel:[]},
  npc441:{cat:'魔军类', lv:17, mats:[], special:['魔气'], items:[], rel:[]},
  npc442:{cat:'魔军类', lv:18, mats:[], special:['魔气'], items:[], rel:[]},
  npc443:{cat:'魔军类', lv:18, mats:[], special:['魔气'], items:[], rel:[]},
  npc444:{cat:'魔军类', lv:20, mats:[], special:['魔气'], items:[], rel:[]},
  npc445:{cat:'魔军类', lv:22, mats:[], special:[], items:[], rel:[]},
  npc446:{cat:'魔军类', lv:22, mats:[], special:[], items:[], rel:[]},
  npc447:{cat:'魔军类', lv:24, mats:[], special:[], items:['骑士徽章'], rel:[]},
  npc448:{cat:'魔军类', lv:28, mats:[], special:[], items:['统帅印章'], rel:[]},
  npc449:{cat:'魔军类', lv:30, mats:[], special:[], items:[], rel:[]},
  npc450:{cat:'魔军类', lv:34, mats:[], special:[], items:[], rel:[]},
  npc451:{cat:'魔军类', lv:35, mats:[], special:[], items:['祭司宝典'], rel:[]},
  npc452:{cat:'魔军类', lv:38, mats:[], special:[], items:[], rel:[]},
  npc453:{cat:'魔军类', lv:38, mats:[], special:[], items:[], rel:[]},
  npc454:{cat:'魔军类', lv:39, mats:[], special:[], items:[], rel:[]},
  npc455:{cat:'魔军类', lv:39, mats:[], special:[], items:[], rel:[]},
  npc456:{cat:'魔军类', lv:40, mats:[], special:[], items:[], rel:[]},
  npc457:{cat:'魔军类', lv:42, mats:[], special:[], items:[], rel:['威辛亚艾的首级', '太保密令1']},
  npc458:{cat:'魔军类', lv:43, mats:[], special:[], items:[], rel:['贡的首级', '太保密令2']},
  npc459:{cat:'魔军类', lv:44, mats:[], special:[], items:[], rel:[]},
  npc460:{cat:'魔军类', lv:45, mats:[], special:[], items:[], rel:['魔子的首级']},
  npc461:{cat:'感染者', lv:10, mats:[], special:['魔气'], items:[], rel:[]},
  npc462:{cat:'感染者', lv:15, mats:[], special:['魔气'], items:[], rel:[]},
  npc463:{cat:'感染者', lv:15, mats:[], special:['魔气'], items:[], rel:[]},
  npc464:{cat:'感染者', lv:20, mats:[], special:['魔气'], items:[], rel:[]},
  npc465:{cat:'感染者', lv:35, mats:[], special:['魔气抗体'], items:[], rel:[]},
};

/* ------------------------------------------------------------
   矿石掉落来源（按角色主题挂载）
   ------------------------------------------------------------
   矿石是材料，不单独建矿点；按“石 / 土 / 冰 / 龙 / 深渊 / 星辉”
   的主题挂到对应角色身上。变体按家族整体挂载，具体抽到哪一条
   由掉落池权重决定。 */
const ORE_DROP_SOURCES = {
  npc350: ['铁矿石','铜精-攻','铜精-法','铜精-防','铜精-生','铜精-速','铜精-暴','铜精-命','铜精-闪','铜精-首','铜精-低'],
  npc384: ['精铁矿','银精-攻','银精-防','银精-生'],
  npc396: ['玄铁矿','银精-法','银精-速','银精-暴','银精-吸','银精-反','银精-毒','银精-烧'],
  npc397: ['寒铁矿','秘银-法','秘银-生','秘银-速'],
  npc398: ['寒铁矿','秘银-暴'],
  npc370: ['陨铁矿','秘银-攻','秘银-穿','秘银-斩'],
  npc372: ['陨铁矿','秘银-连','秘银-溅','星辉-攻','星辉-法','星辉-防','星辉-生'],
  npc374: ['深渊矿','星辉-速','星辉-暴','星辉-魔'],
  npc375: ['深渊矿','星辉-中','星辉-爆','星辉-伤'],
  npc363: ['银精-生','秘银-生'],
  npc365: ['秘银-法','星辉-法','星辉-爆','星辉-伤'],
  npc402: ['陨铁矿','星辉-魔','星辉-速','星辉-伤'],
  npc403: ['深渊矿','星辉-中','星辉-魔'],
  npc460: ['深渊矿','星辉-中','星辉-魔','星辉-爆','星辉-伤'],
  npc364: ['秘银-攻','秘银-防','秘银-生','秘银-速','星辉-攻'],
  npc368: ['秘银-法','秘银-暴','星辉-法'],
  npc371: ['秘银-防','秘银-生','星辉-防'],
};
Object.keys(ORE_DROP_SOURCES).forEach(npcId => {
  const def = NPC_DROP_TABLE[npcId];
  if(!def) return;
  const old = Array.isArray(def.special) ? def.special : [];
  def.special = old.concat(ORE_DROP_SOURCES[npcId].filter(n => old.indexOf(n) < 0));
});

/* ------------------------------------------------------------
   把掉落表按规则展开成角色卡上的掉落池 drops：
     每条 {itemId, weight, min, max, guaranteed}
     · 同一物品只保留一行，权重越大越容易抽中
     · 唯一剧情道具 / 首级 · 密令 → 必掉
   旧角色卡上的 equipPool / materialPool / itemPool（本方案不再使用）会被清掉。
   ------------------------------------------------------------ */
function pickDropTier(tiers, lv){
  const level = Math.max(1, Number(lv) || 1);
  for(let i = 0; i < tiers.length; i++){
    if(level <= tiers[i].maxLv) return tiers[i];
  }
  return tiers[tiers.length - 1];
}

function buildNpcDrops(def){
  const drops = [];
  const warn = [];
  const countTier = pickDropTier(NPC_DROP_RULES.counts, def.lv);
  const weight = NPC_DROP_RULES.weight;

  (def.mats || []).forEach(name => {
    const id = DROP_NAME_TO_ID[name];
    if(!id){ warn.push(name); return; }
    drops.push({ itemId:id, weight:weight.material, min:countTier.min, max:countTier.max });
  });
  (def.special || []).forEach(name => {
    const id = DROP_NAME_TO_ID[name];
    if(!id){ warn.push(name); return; }
    drops.push({ itemId:id, weight:weight.special, min:1, max:1 });
  });
  const uniqueNames = ['密探通令', '骑士徽章', '统帅印章', '祭司宝典'];
  (def.items || []).forEach(name => {
    const id = DROP_NAME_TO_ID[name];
    if(!id){ warn.push(name); return; }
    if(uniqueNames.indexOf(name) >= 0){
      drops.push({ itemId:id, weight:weight.rare, min:1, max:1, guaranteed:true });
    }else{
      drops.push({ itemId:id, weight:weight.potion, min:1, max:1 });
    }
  });
  (def.rel || []).forEach(name => {
    const id = DROP_NAME_TO_ID[name];
    if(!id){ warn.push(name); return; }
    drops.push({ itemId:id, weight:weight.rare, min:1, max:1, guaranteed:true });
  });
  if(warn.length && typeof console !== 'undefined' && console.warn){
    console.warn('[NPC_DROP_TABLE] 未找到物品：' + warn.join('、'));
  }
  return drops;
}

/* 启动时写入角色卡 */
function applyNpcDropTable(){
  for(const charId in NPC_DROP_TABLE){
    const tpl = getCharacterTemplate(charId);
    if(!tpl) continue;
    const def = NPC_DROP_TABLE[charId];
    tpl.drops = buildNpcDrops(def);
    delete tpl.equipPool;
    delete tpl.materialPool;
    delete tpl.itemPool;
    tpl.enemyCategory = def.cat;
    tpl.suggestedLevel = tpl.suggestedLevel || def.lv;
  }
}

applyNpcDropTable();
