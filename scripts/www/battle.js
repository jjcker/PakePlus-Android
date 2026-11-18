/* ============================================================
   battle.js — 战斗系统
   ============================================================ */

/* ---- 战斗节奏参数（毫秒）----
   想整体加快/放慢，只改这组数字即可 */
const BATTLE_DELAY = {
  roundStart:   500,   // 回合标题显示后，等多久开始第一个单位行动
  skip:         450,   // 跳过回合后
  death:        500,   // 单位被 DOT 击倒后
  statusTick:   650,   // 沉默跳过 / MP 不足
  afterAction:  850,   // 一次行动完成（技能/普攻/道具）后
  aiAct:        1000,  // 轮到 AI，等多久开始选招
  defeatMessage:1800   // 战斗失败后，弹窗停留时间
};
/* ============================================================
   技能伤害模型（2026-11 定稿）
   ------------------------------------------------------------
   技能面板 = 角色攻击 + 技能数值 + 武器物攻
   ------------------------------------------------------------
   · 物理技能吃「核心物攻 + 武器物攻」，魔法技能吃「核心魔攻 + 武器魔攻」
   · 一个技能同时带物理和魔法效果时，两段各自计算、各自结算
   · 「数值」是技能相对普攻的额外加成，填 0 就等于普攻
   · 已移除：倍率（mult）与角色攻击 × 1.5 的成长层
   最后统一减目标防御；低于防御则完全格挡。
   ============================================================ */
/* ---- 战斗视觉反馈参数（P0-11）---- */
const BATTLE_CRIT_RATE = 0.05;   // 基础暴击率
const BATTLE_CRIT_MULT = 1.5;    // 暴击伤害倍率
/* ---- 战斗开场动画参数（P0-12）---- */
const BATTLE_INTRO = {
  unitDelay:   50,    // 每个单位入场的间隔（毫秒）
  bannerDelay: 400,   // 从开场到显示横幅的间隔
  bannerHold:  1000,  // 横幅停留时长（与 CSS bannerFlash 时长一致）
  donePad:     150    // 动画全部结束后额外缓冲
};

const STATUS_COLORS = {
  burn:  {cls:'sd-burn',    label:'火'},
  poison:{cls:'sd-poison',  label:'毒'},
  bleed: {cls:'sd-bleed',   label:'血'},
  silence:{cls:'sd-silence',label:'沉'},
  freeze:{cls:'sd-freeze',  label:'冰'},
  airborne:{cls:'sd-airborne',label:'空'},
  stun:  {cls:'sd-stun',    label:'晕'},
  petrify:{cls:'sd-petrify',label:'石'},
  confusion:{cls:'sd-confusion',label:'乱'},
  taunt: {cls:'sd-taunt',   label:'嘲'},
  guard: {cls:'sd-guard',   label:'护'},
  mark:  {cls:'sd-mark',    label:'印'},
  spd_up:{cls:'sd-spd-up',label:'→'},
  spd_down:{cls:'sd-spd-down',label:'←'},
  phys_atk_up_pct:{cls:'sd-atk-up',label:'↑'},
  phys_atk_down_pct:{cls:'sd-atk-down',label:'↓'},
  magic_atk_up_pct:{cls:'sd-atk-up',label:'↑'},
  magic_atk_down_pct:{cls:'sd-atk-down',label:'↓'},
  def_up_pct:{cls:'sd-def-up',label:'↑'},
  def_down_pct:{cls:'sd-def-down',label:'↓'}
};

/* ---- 全局战斗状态 ---- */
let battleState = null;
let battleSelectedSkill = null;
let battleTargetPick = null;   /* 多阵营目标选择：{ skill, plan, picks, stage } */
let battleTipTimer = null;
let battleItemOpen = false;
let battlePendingItem = null;   // 用药等待选择目标：{bagIdx, itemId}
let _battleResultCallback = null;
let _pendingBattleCallback = null;   /* story.js 的 battle action 用它等待战斗结束 */

/* ============================================================
   属性修正
   ============================================================ */

function getCombinedMods(unit){
  const m = getStatusMods(unit);
  const passives = getPassiveEffects(unit);
  passives.forEach(p => {
    if(p.type === 'phys_atk_up_pct') m.paup += p.value;
    else if(p.type === 'magic_atk_up_pct') m.maup += p.value;
    else if(p.type === 'def_up_pct') m.dpu += p.value;
  });
  return m;
}

/* 攻击修正 = 装备词条 + 本场战斗临时词条
   临时词条来源：技能 / 道具把“破防、首回合加伤、击杀回血”等
   装备专属词条施加到单位身上，存在 unit.tempMods 里。 */
function getAttackStats(unit){
  const stats = (typeof getUnitMods === 'function')
    ? getUnitMods(unit)
    : calcEquipStats(unit && unit.equipment ? {equipment:unit.equipment} : {});
  const tm = unit && unit.tempMods;
  if(tm){
    for(const k in tm){
      if(!(k in stats)) continue;
      const v = Number(tm[k]) || 0;
      if(k === 'executeBelow') stats[k] = Math.max(stats[k] || 0, v);
      else stats[k] = (stats[k] || 0) + v;
    }
  }
  return stats;
}
function addTempMod(unit, key, value, stack){
  if(!unit || !key) return;
  if(!unit.tempMods) unit.tempMods = {};
  const v = Number(value) || 0;
  if(stack === 'max') unit.tempMods[key] = Math.max(unit.tempMods[key] || 0, v);
  else unit.tempMods[key] = (unit.tempMods[key] || 0) + v;
}

/* ============================================================
   速度系统（P0-5 已修正命名）
   ------------------------------------------------------------
   速度数值越小 = 越快（先手）。命名遵循直觉：
     spd_up   状态 = 加速 → 数值变小 → 先手
     spd_down 状态 = 减速 → 数值变大 → 后手
   计算时：
     base += m.spd_down   // 减速累加
     base -= m.spd_up     // 加速抵扣
   排行动序时按速度升序排列（数值小的先动）。
   ============================================================ */
function calcFinalSpd(unit){
  let base = unit.spd || 10;
  const stats = (typeof getUnitMods === 'function')
    ? getUnitMods(unit)
    : (unit.equipment ? calcEquipStats({equipment:unit.equipment}) : null);
  if(stats) base += (stats.spdMod || 0);
  const m = getCombinedMods(unit);
  base += m.spd_down;   // spd_down 状态 = 减速
  base -= m.spd_up;     // spd_up 状态 = 加速
  return Math.max(0, base);
}

function calcFinalPhysAtk(unit, basePhysAtk){
  const m = getCombinedMods(unit);
  const stats = getAttackStats(unit);
  let mult = 1 + (m.paup - m.padp) / 100;
  mult *= 1 + (stats.physAtkPct || 0) / 100;
  /* low_hp_power：自己 HP 越低，攻击越高 */
  if(stats.lowHpPower && unit.maxHp > 0){
    const hpRatio = unit.hp / unit.maxHp;
    if(hpRatio < 0.3){
      const boost = stats.lowHpPower * (1 - hpRatio / 0.3) / 100;
      mult *= 1 + boost;
    }
  }
  return Math.max(0, basePhysAtk * mult);
}

function calcFinalMagicAtk(unit, baseMagicAtk){
  const m = getCombinedMods(unit);
  const stats = getAttackStats(unit);
  let mult = 1 + (m.maup - m.madp) / 100;
  mult *= 1 + (stats.magicAtkPct || 0) / 100;
  return Math.max(0, baseMagicAtk * mult);
}

/* ============================================================
   多部位耐久（胸甲为核心，按部位分摊）
   ============================================================ */

/* 耐久损耗吸收顺序：胸甲 → 头部 → 腿部 → 副手盾牌 */
const ARMOR_PART_SLOTS = ['chest','head','legs','offHand'];

/* 从单位装备构建各部位耐久，汇总总耐久池（仅含带 durability 的防具/盾牌） */
function initArmorParts(unit){
  unit.armorParts = [];
  let totalCur = 0, totalMax = 0;
  ARMOR_PART_SLOTS.forEach(slot => {
    const held = unit.equipment && unit.equipment[slot];
    if(!held) return;
    const tpl = EQUIPS[held.id];
    if(!tpl || !tpl.durability) return;
    const up = (typeof getItemWordSum === 'function') ? getItemWordSum(held, tpl, 'durability_up') : 0;
    const max = (Number(tpl.durability) || 0) + up;
    const cur = Math.min(max, (Number(getItemDur(held, tpl)) || 0) + up);
    unit.armorParts.push({slot, cur, max:max});
    totalCur += cur;
    totalMax += max;
  });
  unit.armorDurability = totalCur;
  unit.armorMaxDur = totalMax;
}

/* 按总耐久当前值，依胸甲优先顺序把损耗分摊回各部位，并回写单位装备；
   部位耐久归零时销毁该装备并记录碎裂 */
function syncArmorParts(unit){
  if(!unit.armorParts || unit.armorParts.length === 0) return;
  let lossLeft = unit.armorMaxDur - unit.armorDurability;
  unit.armorParts.forEach(p => {
    const take = Math.min(p.cur, Math.max(0, lossLeft));
    p.cur -= take;
    lossLeft -= take;
    const held = unit.equipment && unit.equipment[p.slot];
    if(!held) return;
    if(p.cur <= 0){
      const tpl = EQUIPS[held.id];
      if(battleState && battleState.wearBroken){
        battleState.wearBroken.push({
          owner:unit.name, slot:p.slot,
          name:tpl ? tpl.name : held.id, level:'broken'
        });
      }
      unit.equipment[p.slot] = null;
    }else{
      held.durability = p.cur;
    }
  });
}

/* 战后：把单位副本的 8 个部位装备（含磨损/耐久）回写到真实角色 */
function writeBackArmor(unit, realCharObj){
  if(!realCharObj) return;
  if(!realCharObj.equipment) realCharObj.equipment = makeEmptyEquipment();
  EQUIP_SLOTS.forEach(slot => {
    const uHeld = unit.equipment ? unit.equipment[slot] : null;
    if(!uHeld){ realCharObj.equipment[slot] = null; return; }
    realCharObj.equipment[slot] = JSON.parse(JSON.stringify(uHeld));
  });
}

function getArmorDefBonus(unit){
  let armorDef = 0;
  const eq = unit.equipment || {};
  /* 汇总所有防具/盾牌部位的 def_up 词条 */
  EQUIP_SLOTS.forEach(slot => {
    const held = eq[slot];
    if(!held) return;
    const tpl = EQUIPS[held.id];
    if(tpl && (tpl.type === 'armor' || tpl.type === 'shield')){
      (tpl.words || []).forEach(w => { if(w.type === 'def_up') armorDef += w.value; });
    }
  });
  const m = getCombinedMods(unit);
  const stats = (typeof getUnitMods === 'function') ? getUnitMods(unit) : calcEquipStats(unit.equipment ? {equipment:unit.equipment} : {});
  /* 技能/道具临时给的固定防御，也并入护甲防御池 */
  const tm = unit.tempMods || {};
  armorDef += (tm.def_up || 0) - (tm.def_down || 0);
  return Math.max(0, armorDef) * (1 + m.dpu / 100) * (1 - Math.min(90, m.dpd) / 100) * (1 + (stats.defPct || 0) / 100);
}

/* ============================================================
   战斗触发
   ============================================================ */

function triggerBattleFromTile(encounterId){
  const enc = BATTLE_ENCOUNTERS[encounterId];
  if(!enc){
    toast('战斗场景不存在');
    if(typeof _pendingBattleCallback === 'function'){
      const cb = _pendingBattleCallback;
      _pendingBattleCallback = null;
      try{ cb(); }catch(e){ console.error(e); }
    }
    return;
  }
  let enemyList = [];
  const built = buildEncounterActors(enc);
  if(built.type === 'special'){
    enemyList = built.actors
      .filter(a => a && getCharacterTemplate(a.charId))
      .map(a => ({ charId:a.charId, row:a.row, level:a.level }));
  }else if(built.type === 'random'){
    const pool = built.actors.filter(a => a && getCharacterTemplate(a.charId));
    if(pool.length){
      const count = built.min + Math.floor(Math.random() * (built.max - built.min + 1));
      const totalWeight = pool.reduce((sum, a) => sum + (Number(a.weight) > 0 ? Number(a.weight) : 1), 0);
      const pickWeighted = () => {
        let roll = Math.random() * totalWeight;
        for(let i = 0; i < pool.length; i++){
          roll -= (Number(pool[i].weight) > 0 ? Number(pool[i].weight) : 1);
          if(roll < 0) return pool[i];
        }
        return pool[pool.length - 1];
      };
      for(let i = 0; i < count; i++){
        const a = pickWeighted();
        enemyList.push({
          charId: a.charId,
          level: a.level,
          row: Math.random() < 0.5 ? 'front' : 'back'
        });
      }
    }
  }
  if(!enemyList.length){ toast('这里暂时没有敌人'); return; }

  startBattle(enc.name, enemyList, enc.special);
}

function getEquippedSkillObjs(charObj){
  /* 只认当前真正拥有的技能：卸掉赋予它的装备后，槽里的残留直接忽略 */
  const known = (typeof getKnownSkillIds === 'function')
    ? new Set(getKnownSkillIds(charObj))
    : null;
  const ids = (charObj.equippedSkills || []).filter(x => x && (!known || known.has(x)));
  return ids.map(id => SKILLS[id]).filter(Boolean);
}

/* 按 id 在 allies / 敌前后排里查单位 */
function findUnitById(unitId){
  if(!battleState) return null;
  let u = battleState.allies.find(x => x.id === unitId);
  if(u) return u;
  u = battleState.frontSlots.find(x => x && x.id === unitId);
  if(u) return u;
  u = battleState.backSlots.find(x => x && x.id === unitId);
  return u || null;
}

/* ============================================================
   开始战斗
   ============================================================ */

/* ============================================================
   战斗四率的装载
   ------------------------------------------------------------
   角色卡自带 → unit.hitRate / critRate / critMult，
   闪避则是「角色卡闪避 + 装备闪避」合并进 dodgeBonus。
   装备/技能/被动的同类加成仍走 getAttackStats，在判定时再加一次。
   ============================================================ */
function applyUnitCombatRates(unit, charObj, eqStats){
  const r = (typeof getCharCombatRates === 'function')
    ? getCharCombatRates(charObj)
    : { hitRate:0, dodge:0, critRate:BATTLE_CRIT_RATE, critMult:BATTLE_CRIT_MULT };
  unit.hitRate = r.hitRate;
  unit.critRate = r.critRate;
  unit.critMult = r.critMult;
  /* 闪避封顶：角色自带 + 装备，超出 DODGE_CAP 的部分直接作废 */
  const mods = (typeof getUnitMods === 'function') ? getUnitMods(unit) : eqStats;
  unit.dodgeBonus = Math.min(
    (typeof DODGE_CAP === 'number' ? DODGE_CAP : 0.75),
    Math.max(0, (Number(mods && mods.dodge) || 0) + r.dodge)
  );
  return unit;
}

function startBattle(name, enemyList, special){
  const q = currentGame.queue;
  const allies = [];

  /* 每个单位在队列里的槽位索引（用于渲染时按位置摆放） */
  const charSlotMap = {};

  /* 玩家（按队列里的真实位置决定前排/后排） */
  const playerSkillObjs = getEquippedSkillObjs(currentGame);
  const playerAttr = getCharAttrStatsWithEquip(currentGame);
  let playerRow = 'front';
  if(q.back.includes('player')) playerRow = 'back';
  const playerSlotIdx = q[playerRow].indexOf('player');
  const playerUnit = {
    id:'player', name:currentGame.name, side:'ally', row: playerRow,
    slotIdx: playerSlotIdx,
    lv:currentGame.level,
    hp:currentGame.hp, maxHp:playerAttr.maxHp,
    mp:currentGame.mp, maxMp:playerAttr.maxMp,
    vit:playerAttr.vit, spi:playerAttr.spi,
    physAtk:playerAttr.physAtk, magicAtk:playerAttr.magicAtk,
    def:playerAttr.def, spd:playerAttr.spd, isPlayer:true,
    classes:currentGame.classes.filter(c => c),
    faction:'', factionTags:[], race:'',
    equipment: currentGame.equipment ? JSON.parse(JSON.stringify(currentGame.equipment)) : {},
    base:   Object.assign({}, currentGame.base),
    growth: Object.assign({}, currentGame.growth),
    derivedPhysAtk:  playerAttr.physAtk,
    derivedMagicAtk: playerAttr.magicAtk,
    skills: playerSkillObjs.map(s => s.id),
    statuses:[], counterCharges:0, dodgeBonus:0, defOnce:0, tempMods:{},
    reflectArmorRate:0, reflectAccRate:0,
    armorDurability:0, armorMaxDur:0
  };
  initArmorParts(playerUnit);
  const pStats = calcEquipStats(currentGame);
  const pMods = (typeof getUnitMods === 'function') ? getUnitMods(playerUnit) : pStats;
  playerUnit.reflectArmorRate = pMods.reflectArmor || 0;
  playerUnit.reflectAccRate = pMods.reflectAcc || 0;
  applyUnitCombatRates(playerUnit, currentGame, pStats);
  playerUnit.maxHp = playerUnit.maxHp + (pStats.maxHpBonus || 0) + getPassiveFlatBonus(playerUnit, 'maxhp_up');
  playerUnit.maxMp = playerUnit.maxMp + (pStats.maxMpBonus || 0) + getPassiveFlatBonus(playerUnit, 'maxmp_up');
  const hpPct = getPassiveMaxHpBonus(playerUnit) + (Number(pStats.maxHpPct) || 0);
  playerUnit.maxHp = Math.floor(playerUnit.maxHp * (1 + hpPct / 100));
  const mpPct = getPassiveStatTotal(playerUnit, 'maxmp_up_pct', 'add') + (Number(pStats.maxMpPct) || 0);
  playerUnit.maxMp = Math.floor(playerUnit.maxMp * (1 + mpPct / 100));
  if(playerUnit.hp > playerUnit.maxHp) playerUnit.hp = playerUnit.maxHp;
  if(pMods.counterStart) playerUnit.counterCharges = (playerUnit.counterCharges || 0) + pMods.counterStart;
  allies.push(playerUnit);

  /* 队友（只取前排 + 后排，休息区不参战） */
  const charIds = [];
  const charRowMap = {};
  ['front','back'].forEach(r => q[r].forEach((c, i) => {
    if(c && c !== 'player' && !charIds.includes(c)){
      charIds.push(c);
      charRowMap[c] = r;
      charSlotMap[c] = i;
    }
  }));
  charIds.forEach((id) => {
    const npc = getNpc(id);
    if(!npc) return;
    const npcSkillIds = (npc.equippedSkills || []).filter(x => x);
    const npcAttr = getCharAttrStatsWithEquip(npc);
    const unit = {
      id:npc.id, npcId:id, name:npc.name, side:'ally',
      row: (charRowMap[id] === 'front') ? 'front' : 'back',
      slotIdx: charSlotMap[id],
      lv:npc.level, hp:npc.hp, maxHp:npcAttr.maxHp,
      mp:npc.mp, maxMp:npcAttr.maxMp,
      vit:npcAttr.vit, spi:npcAttr.spi,
      physAtk:npcAttr.physAtk, magicAtk:npcAttr.magicAtk,
      def:npcAttr.def, spd:npcAttr.spd,
      isPlayer:false,
      classes:(npc.classes || []).filter(c => c),
      faction:npc.faction || '', factionTags:Array.isArray(npc.factionTags) ? npc.factionTags.slice() : [], race:npc.race || '',
      equipment: JSON.parse(JSON.stringify(npc.equipment || {})),
      base:   Object.assign({}, npc.base),
      growth: Object.assign({}, npc.growth),
      derivedPhysAtk:  npcAttr.physAtk,
      derivedMagicAtk: npcAttr.magicAtk,
      skills: npcSkillIds,
      statuses:[], counterCharges:0, dodgeBonus:0, defOnce:0, tempMods:{},
      reflectArmorRate:0, reflectAccRate:0,
      armorDurability:0, armorMaxDur:0
    };
    initArmorParts(unit);
    const npcStats = calcEquipStats(npc);
    const npcMods = (typeof getUnitMods === 'function') ? getUnitMods(unit) : npcStats;
    unit.reflectArmorRate = npcMods.reflectArmor || 0;
    unit.reflectAccRate = npcMods.reflectAcc || 0;
    applyUnitCombatRates(unit, npc, npcStats);
    unit.maxHp = unit.maxHp + (npcStats.maxHpBonus || 0) + getPassiveFlatBonus(unit, 'maxhp_up');
    unit.maxMp = unit.maxMp + (npcStats.maxMpBonus || 0) + getPassiveFlatBonus(unit, 'maxmp_up');
    const hpPct = getPassiveMaxHpBonus(unit) + (Number(npcStats.maxHpPct) || 0);
    unit.maxHp = Math.floor(unit.maxHp * (1 + hpPct / 100));
    const mpPct = getPassiveStatTotal(unit, 'maxmp_up_pct', 'add') + (Number(npcStats.maxMpPct) || 0);
    unit.maxMp = Math.floor(unit.maxMp * (1 + mpPct / 100));
    if(unit.hp > unit.maxHp) unit.hp = unit.maxHp;
    if(npcMods.counterStart) unit.counterCharges = (unit.counterCharges || 0) + npcMods.counterStart;
    allies.push(unit);
  });

  /* 出战宠物：前排末尾 / 后排末尾，各 1 个 */
  const petSlots = [
    { row:'front', slotIdx:3 },
    { row:'back',  slotIdx:2 }
  ];
  petSlots.forEach(ps => {
    const petId = currentGame.pets ? currentGame.pets[ps.row] : null;
    if(!petId) return;
    const pet = getNpc(petId);
    if(!pet || pet.dead || pet.hp <= 0) return;
    const petAttr = getCharAttrStatsWithEquip(pet);
    const unit = {
      id:pet.id, npcId:petId, name:pet.name, side:'ally', isPet:true,
      row:ps.row, slotIdx:ps.slotIdx, lv:pet.level,
      hp:pet.hp, maxHp:petAttr.maxHp,
      mp:pet.mp, maxMp:petAttr.maxMp,
      vit:petAttr.vit, spi:petAttr.spi,
      physAtk:petAttr.physAtk, magicAtk:petAttr.magicAtk,
      def:petAttr.def, spd:petAttr.spd,
      isPlayer:false,
      classes:(pet.classes || []).filter(Boolean),
      faction:pet.faction || '', factionTags:Array.isArray(pet.factionTags) ? pet.factionTags.slice() : [], race:pet.race || '',
      equipment:dcClone(pet.equipment || {}),
      base:Object.assign({}, pet.base),
      growth:Object.assign({}, pet.growth),
      derivedPhysAtk:petAttr.physAtk,
      derivedMagicAtk:petAttr.magicAtk,
      skills:(pet.equippedSkills || []).filter(Boolean),
      ai:pet.ai || (pet.equippedSkills || []).filter(Boolean).map(s => ({skill:s, w:1})),
      statuses:[], counterCharges:0, dodgeBonus:0, defOnce:0, tempMods:{},
      reflectArmorRate:0, reflectAccRate:0,
      armorDurability:0, armorMaxDur:0
    };
    initArmorParts(unit);
    const petStats = calcEquipStats(pet);
    const petMods = (typeof getUnitMods === 'function') ? getUnitMods(unit) : petStats;
    unit.reflectArmorRate = petMods.reflectArmor || 0;
    unit.reflectAccRate = petMods.reflectAcc || 0;
    applyUnitCombatRates(unit, pet, petStats);
    unit.maxHp += (petStats.maxHpBonus || 0);
    unit.maxMp += (petStats.maxMpBonus || 0);
    const petHpBonus = getPassiveMaxHpBonus(unit) + (Number(petStats.maxHpPct) || 0);
    unit.maxHp = Math.floor(unit.maxHp * (1 + petHpBonus / 100));
    const petMpPct = getPassiveStatTotal(unit, 'maxmp_up_pct', 'add') + (Number(petStats.maxMpPct) || 0);
    unit.maxMp = Math.floor(unit.maxMp * (1 + petMpPct / 100));
    /* 驯兽师：宠物 HP / MP / 物攻 / 魔攻 +100% */
    const petBoost = (typeof getPassiveStatTotal === 'function')
      ? getPassiveStatTotal(currentGame, 'pet_stat_up_pct', 'add') : 0;
    if(petBoost > 0){
      const mult = 1 + petBoost / 100;
      unit.maxHp = Math.floor(unit.maxHp * mult);
      unit.maxMp = Math.floor(unit.maxMp * mult);
      unit.hp = Math.min(unit.maxHp, Math.floor(unit.hp * mult));
      unit.mp = Math.min(unit.maxMp, Math.floor((unit.mp || 0) * mult));
      unit.physAtk = Math.floor((unit.physAtk || 0) * mult);
      unit.magicAtk = Math.floor((unit.magicAtk || 0) * mult);
      unit.derivedPhysAtk = unit.physAtk;
      unit.derivedMagicAtk = unit.magicAtk;
    }
    if(unit.hp > unit.maxHp) unit.hp = unit.maxHp;
    if(petMods.counterStart) unit.counterCharges += petMods.counterStart;
    allies.push(unit);
  });

  /* 敌人 */
  const frontSlots = [null,null,null,null,null];
  const backSlots = [null,null,null,null,null];
  let fc = 0, bc = 0;
  enemyList.forEach(e => {
    const charId = e.charId || e.name;
    const t = getCharacterTemplate(charId) || { id:charId, name:charId, base:{vit:8,spi:5}, growth:{vit:1.6,spi:1.0}, equippedSkills:[], ai:[], behavior:'default' };
    /* 角色卡固定 Lv1；遭遇/地图条目可用 level 覆盖 */
    const lv = Math.max(1, Number(e.level) || Number(t.suggestedLevel) || 1);
    const enemyAttr = getCharAttrStats(t, lv);
    const unit = {
      id:'e_' + Math.random().toString(36).slice(2, 8),
      charId: t.id,
      name:t.name || charId, side:'enemy', row:e.row,
      lv: lv,
      hp:enemyAttr.maxHp, maxHp:enemyAttr.maxHp,
      mp:enemyAttr.maxMp, maxMp:enemyAttr.maxMp,
      vit:enemyAttr.vit, spi:enemyAttr.spi,
      physAtk:enemyAttr.physAtk, magicAtk:enemyAttr.magicAtk,
      def:enemyAttr.def, spd:enemyAttr.spd,
      isPlayer:false, equipment:dcClone(t.equipment || {}), classes:(t.classes || []).filter(Boolean),
      faction:t.faction || '', factionTags:Array.isArray(t.factionTags) ? t.factionTags.slice() : [], race:t.race || '',
      skills:(t.equippedSkills || []).filter(Boolean).length
        ? (t.equippedSkills || []).filter(Boolean)
        : ((t.skillPool || t.skills || []).filter(Boolean)),
      ai:t.ai || [], behavior:t.behavior || 'default',
      statuses:[], counterCharges:0, dodgeBonus:0, defOnce:0, tempMods:{},
      reflectArmorRate:0, reflectAccRate:0,
      armorDurability:0, armorMaxDur:0
    };
    applyUnitCombatRates(unit, t, (typeof getUnitMods === 'function') ? getUnitMods(unit) : calcEquipStats(t));
    if(e.row === 'front' && fc < 5){ frontSlots[SLOT_ORDER_5[fc]] = unit; fc++; }
    else if(e.row === 'back' && bc < 5){ backSlots[SLOT_ORDER_5[bc]] = unit; bc++; }
  });

    battleState = {
    name, allies, frontSlots, backSlots,
    round:1, queue:[], queueIdx:0,
    phase:'intro', over:false, victory:false,
    log:[], mini:false, totalRounds:0,
    specialGuardian: !!special,
    damageStats: {},
    wearBroken: [],
    startTime: Date.now(),
    tileId: currentTileId   /* ✨ 记录战斗发生在哪个地图格，供剧情触发器使用 */
  };
  /* P0-18：初始化伤害统计 */
  [...allies, ...frontSlots.filter(Boolean), ...backSlots.filter(Boolean)].forEach(u => {
    battleState.damageStats[u.id] = {
      name: u.name,
      side: u.side,
      totalDmg: 0,
      totalHeal: 0
    };
  });
    battleSelectedSkill = null;
  battleTargetPick = null;
  battlePendingItem = null;
  battleItemOpen = false;
  document.getElementById('battleScreen').classList.add('show');
  document.getElementById('battleLog').innerHTML = '';
  addBattleLog(`【战斗开始】${name}`, 'turn');

  /* 即时道具：战斗外使用，本场开局生效（只作用于玩家） */
  if(Array.isArray(currentGame.pendingItemBuffs) && currentGame.pendingItemBuffs.length){
    const pu = battleState.allies[0];
    currentGame.pendingItemBuffs.forEach(b => {
      (b.effects || []).forEach(e => applyEffect(e, pu, pu, null));
    });
    addBattleLog(`【${pu.name}】的即时道具效果生效。`, 'status');
    currentGame.pendingItemBuffs = [];
  }

  /* 战斗开始被动：所有带 battle_start 触发器的状态词条 */
  battleState.allies.forEach(u => {
    const passives = getPassiveEffects(u);
    passives.forEach(p => {
      if(p.trigger !== 'battle_start') return;
      const atom = (typeof getEffectAtom === 'function') ? getEffectAtom(p.type) : null;
      if(!atom || !atom.status) return;
      if(p.chance !== undefined && Math.random() >= (Number(p.chance) || 0)) return;
      const negative = (typeof statusHasTag === 'function') ? statusHasTag(p.type, '负面') : (p.type === 'poison');
      const side = (!negative || p.target === 'ally_all')
        ? battleState.allies
        : [...battleState.frontSlots, ...battleState.backSlots];
      const targets = side.filter(e => e && e.hp > 0);
      targets.forEach(e => { addStatus(e, {type:p.type, value:p.value, duration:p.duration || 3}); });
      if(targets.length){
        addBattleLog(`【${u.name}】触发【${atom.name}】。`, 'status');
      }
    });
  });

  document.getElementById('battleScreen').scrollTop = 0;
  /* P0-12：先播开场动画，动画结束后再进入回合流程 */
  playBattleIntro(() => startNewRound());
}

/* ============================================================
   回合流程
   ============================================================ */

function getAllUnits(){
  const u = [];
  battleState.allies.forEach(a => { if(a.hp > 0) u.push(a); });
  battleState.frontSlots.forEach(e => { if(e && e.hp > 0) u.push(e); });
  battleState.backSlots.forEach(e => { if(e && e.hp > 0) u.push(e); });
  return u;
}

/* 速度升序排列（数值小的先动） */
function startNewRound(){
  if(!battleState || battleState.over) return;
  const all = getAllUnits();
  if(all.length === 0){ finishBattle(false); return; }
  all.sort((a, b) => {
    const sa = calcFinalSpd(a), sb = calcFinalSpd(b);
    if(sa !== sb) return sa - sb;
    if((a.maxMp||0) !== (b.maxMp||0)) return (b.maxMp||0) - (a.maxMp||0);
    return (b.mp||0) - (a.mp||0);
  });
  all.forEach(u => { u.hasActedThisRound = false; });
  battleState.queue = all;
  battleState.queueIdx = 0;
    addBattleLog(`【第 ${battleState.round} 回合】`, 'turn');
  renderBattle();
  setTimeout(processNextTurn, BATTLE_DELAY.roundStart);
}

/* ---- 状态机制查询：行为统一读 mechanic，旧状态用 type 兜底 ---- */
function statusWithMechanic(unit, mechanic){
  return ((unit && unit.statuses) || []).filter(s => {
    if(s.mechanic) return s.mechanic === mechanic;
    if(mechanic === 'skill_lock') return s.type === 'silence' || s.type === 'freeze';
    if(mechanic === 'skip_action') return s.type === 'stun' || s.type === 'petrify';
    if(mechanic === 'confuse') return s.type === 'confusion';
    if(mechanic === 'redirect') return s.type === 'taunt' || s.type === 'guard';
    return false;
  });
}
function unitHasMechanic(unit, mechanic){
  return statusWithMechanic(unit, mechanic).length > 0;
}
function unitSkillLocked(unit){
  return unitHasMechanic(unit, 'skill_lock');
}
function unitSkipAction(unit){
  return statusWithMechanic(unit, 'skip_action')[0] || null;
}
function unitConfused(unit){
  return statusWithMechanic(unit, 'confuse')[0] || null;
}
function unitTaunter(unit){
  return ((unit && unit.statuses) || []).find(s => s.type === 'taunt' || (s.mechanic === 'redirect' && s.type === 'taunt')) || null;
}

function processNextTurn(){
  if(!battleState || battleState.over) return;
  if(battleState.queueIdx >= battleState.queue.length){
    battleState.totalRounds++;
    tickStatuses();
    battleState.round++;
    startNewRound();
    return;
  }
  const unit = battleState.queue[battleState.queueIdx];
  if(unit.hp <= 0){ battleState.queueIdx++; processNextTurn(); return; }

  /* DOT */
  const dotDmg = calcDotDamage(unit);
  if(dotDmg > 0){
    unit.hp = Math.max(0, unit.hp - dotDmg);
    addBattleLog(`【${unit.name}】受到 ${dotDmg} 点持续伤害。`, 'status');
    showBattleFloat(unit.id, '-' + dotDmg, 'status');
    if(unit.hp <= 0){
      addBattleLog(`【${unit.name}】被持续伤害击倒`, 'dead');
      renderBattle();
      if(checkBattleEnd()) return;
      battleState.queueIdx++;
      setTimeout(processNextTurn, BATTLE_DELAY.death);
      return;
    }
  }

  /* 沉默 / 冰冻：只锁技能，普攻照常；真正的行动跳过交给 skip_action */
  const skillLocked = unitSkillLocked(unit);
  if(skillLocked && unit.isPlayer) showBattleTip('被沉默/冰冻：只能普攻');

  /* 眩晕 / 石化：跳过整个行动 */
  const hardSkip = unitSkipAction(unit);
  if(hardSkip){
    const label = hardSkip.type === 'stun' ? '被眩晕' : hardSkip.type === 'petrify' ? '被石化' : `被${statusLabel(hardSkip.type)}`;
    addBattleLog(`【${unit.name}】${label}，无法行动。`, 'status');
    renderBattle();
    battleState.queueIdx++;
    setTimeout(processNextTurn, BATTLE_DELAY.statusTick);
    return;
  }

  /* 混乱 */
  const confStatus = unitConfused(unit);
  if(confStatus && Math.random() < confStatus.value){
    const others = unit.side === 'ally'
      ? battleState.allies.filter(u => u !== unit && u.hp > 0)
      : [...battleState.frontSlots, ...battleState.backSlots].filter(u => u && u !== unit && u.hp > 0);
    if(others.length > 0){
      const target = others[Math.floor(Math.random() * others.length)];
      const skillId = (unit.skills || [])[0];
      const sk = skillId ? SKILLS[skillId] : null;
      addBattleLog(`【${unit.name}】陷入混乱，攻击了【${target.name}】！`, 'status');
      if(sk){
        /* executeSkill 内部已自带 queueIdx++ 和 setTimeout，此处直接 return 交由它推进 */
        executeSkill(unit, sk, target, true);
        return;
      }
      const dmg = Math.floor((unit.physAtk || unit.derivedPhysAtk || 0) * 0.5);
      applyDamage(target, dmg, 'phys', unit, null);
      renderBattle();
      if(checkBattleEnd()) return;
      battleState.queueIdx++;
      setTimeout(processNextTurn, BATTLE_DELAY.afterAction);
      return;
    }
  }

  /* 回合开始被动 */
  const passives = getPassiveEffects(unit);
  passives.forEach(p => {
    if(p.type === 'mp_heal' && p.trigger === 'turn_start'){
      unit.mp = Math.min(unit.maxMp, unit.mp + p.value);
    }
  });

  /* 轮到该单位行动 */
  unit.hasActedThisRound = true;

  renderBattle();

  if(unit.isPlayer){
    battleState.phase = 'player_turn';
    showBattleTip('轮到你行动');
    renderBattleSkills();
  }else{
    battleState.phase = 'ai_turn';
    renderBattleSkills();
    setTimeout(() => aiAct(unit), BATTLE_DELAY.aiAct);
  }
}

function tickStatuses(){
  [...battleState.allies, ...battleState.frontSlots, ...battleState.backSlots].forEach(u => {
    if(!u) return;
    const passives = getPassiveEffects(u);
    passives.forEach(p => {
      if(p.type === 'hp_heal_pct' && p.trigger === 'turn_end'){
        u.hp = Math.min(u.maxHp, u.hp + Math.floor(u.maxHp * p.value / 100));
      }
      if(p.type === 'mp_heal_pct' && p.trigger === 'turn_end'){
        u.mp = Math.min(u.maxMp, u.mp + Math.floor(u.maxMp * p.value / 100));
      }
    });
    u.statuses = (u.statuses || []).filter(s => {
      s.duration = (s.duration || 1) - 1;
      return s.duration > 0;
    });
  });
}

function calcDotDamage(unit){
  let total = 0;
  (unit.statuses || []).forEach(s => {
    /* 按机制读：任何 dot 类状态都算，不再写死 type */
    const isDot = (s.mechanic === 'dot') || s.type === 'poison' || s.type === 'burn' || s.type === 'bleed';
    if(isDot) total += s.value || 0;
    if(s.type === 'airborne') total += Math.max(1, Math.floor((Number(unit.maxHp) || 0) * 0.05));
  });
  return total;
}

/* ============================================================
   技能渲染
   ============================================================ */

function getSkillLevel(unit, skillId){
  const sk = SKILLS[skillId];
  const levels = (sk && sk.levels) ? sk.levels : null;
  const maxLv = levels ? levels.length : 1;
  if(unit && (unit.isPlayer || unit.npcId)){
    const obj = unit.isPlayer ? currentGame : getNpc(unit.npcId);
    if(!obj) return 1;
    const prof = (obj.skillProficiency || {})[skillId] || 0;
    // 玩家技能：按该技能每级自带的熟练度门槛判级（最高为技能自身等级数）
    if(levels && levels.length && levels.some(l => (l.proficiency || 0) > 0)){
      let lv = 1;
      for(let i = 1; i < levels.length; i++){
        const need = (levels[i].proficiency !== undefined) ? levels[i].proficiency : Infinity;
        if(need > 0 && prof >= need) lv = i + 1;
      }
      return lv;
    }
    // 敌人技能（beast/humanoid，无熟练度门槛）：按敌人等级缩放（每 5 级 +1 级，最高为技能自身等级数）
    const lv = unit.lv || 1;
    return Math.max(1, Math.min(maxLv, Math.floor(lv / 5) + 1));
  }
  return 1;
}

/* 等级显示：最后一级统一显示 MAX（数据里 lv 字段为 "max"） */
function skillLevelText(sk, lv){
  if(sk && sk.levels && sk.levels.length && lv >= sk.levels.length) return 'MAX';
  return 'Lv.' + (lv || 1);
}

const TARGET_UI_LABEL = {
  same_prev:'同上',
  self:'自身',
  single:'敌方任意单体',
  ally_single:'我方单体',
  ally_all:'我方全体',
  enemy_front_single:'敌方前排单体',
  enemy_back_single:'敌方后排单体',
  enemy_front:'敌方前排全体',
  enemy_back:'敌方后排全体',
  enemy_all:'敌方全体',
  random:'随机敌方'
};
function targetUiLabel(target){
  return TARGET_UI_LABEL[target] || target || '';
}
function getRangeText(effects){
  const list = effects || [];
  const targets = [];
  list.forEach(e => {
    if(e.type === 'random_choice') return;
    if(typeof e.target === 'string' && e.target && targets.indexOf(e.target) < 0) targets.push(e.target);
  });
  if(targets.length) return targets.map(targetUiLabel).join(' + ');
  if(list.some(e => e.type === 'random_choice')) return '随机子效果';
  if(list.some(e => e.type !== 'random_choice' && !e.target)) return '无目标（未设置）';
  return '';
}
/* 玩家/AI 需不需要手动点一个单位；返回一句可直接显示的选择规则 */
function getTargetSelectRule(effects){
  const list = effects || [];
  const manual = new Set();
  list.forEach(e => {
    if(['single','enemy_front_single','enemy_back_single','ally_single'].indexOf(e.target) >= 0) manual.add(e.target);
  });
  if(manual.size === 0) return '自动选择目标';
  const hasEnemy = Array.from(manual).some(t => t === 'single' || t.indexOf('enemy_') === 0);
  const hasAlly = manual.has('ally_single');
  if(hasEnemy && hasAlly) return '先选敌方、再选我方，共 2 次';
  if(hasAlly) return '手动选择 1 个我方目标';
  if(manual.has('enemy_front_single') && manual.has('enemy_back_single')) return '前后排冲突：一次选择无法同时满足两排';
  if(manual.has('single') && (manual.has('enemy_front_single') || manual.has('enemy_back_single'))) return '手动选择 1 个敌方目标（会锁到前排/后排）';
  if(manual.has('single')) return '手动选择 1 个敌方目标（前后排任选）';
  if(manual.has('enemy_front_single') && !manual.has('enemy_back_single')) return '手动选择 1 个敌方前排目标（前排清空后转任意敌人）';
  if(manual.has('enemy_back_single') && !manual.has('enemy_front_single')) return '手动选择 1 个敌方后排目标（后排清空后转任意敌人）';
  return '手动选择 1 个敌方目标';
}

function getSkillDmgDisplay(effects, unit){
  const parts = [];
  const stats = (typeof getUnitMods === 'function') ? getUnitMods(unit) : calcEquipStats(unit.equipment ? {equipment:unit.equipment} : {});
  effects.forEach(e => {
    if(e.type === 'phys_dmg'){
      const coreAtk = unit.physAtk || unit.derivedPhysAtk || 0;
      const base = (e.value||0) + coreAtk + (stats.physAtk||0);
      const total = Math.floor(calcFinalPhysAtk(unit, base));
      parts.push(`<span class="sk-dmg">物 ${total}</span>`);
    }else if(e.type === 'magic_dmg'){
      const coreAtk = unit.magicAtk || unit.derivedMagicAtk || 0;
      const base = (e.value||0) + coreAtk + (stats.magicAtk||0);
      const total = Math.floor(calcFinalMagicAtk(unit, base));
      parts.push(`<span class="sk-dmg magic">法 ${total}</span>`);
    }else if(e.type === 'true_dmg'){
      parts.push(`<span class="sk-dmg">真 ${e.value}</span>`);
    }else if(e.type === 'hp_heal'){
      parts.push(`<span class="sk-dmg" style="color:#66ff99">治 ${e.value}</span>`);
    }
  });
  return parts.join(' ');
}

/* 效果说明文案统一来自 data-effects.js 的 EFFECT_DESC，避免三套文案 */


function describeEffects(effects){
  const parts = [];
  (effects || []).forEach(e => {
    const fn = EFFECT_DESC[e.type];
    if(!fn) return;
    /* 纯倍率效果：value 缺失但有 mult，用特殊展示 */
    if(e.value === undefined && e.mult !== undefined){
      parts.push(`${fn(0).replace(/0/, '')}${Math.round(e.mult * 100)}%`);
    }else{
      parts.push(fn(e.value));
    }
  });
  return parts.join('、');
}

/* 单条效果文案：优先走 EFFECT_DESC；伤害类没进 EFFECT_DESC，这里补上基础值 */
function describeEffectLine(e){
  const fn = EFFECT_DESC[e.type];
  if(fn){
    if(e.value === undefined && e.mult !== undefined){
      return `${fn(0).replace(/0/, '')}${Math.round(e.mult * 100)}%`;
    }
    return fn(e.value);
  }
  const atom = (typeof getEffectAtom === 'function') ? getEffectAtom(e.type) : null;
  if(atom && atom.cat === 'damage'){
    return atom.name + ' ' + (e.value || 0);
  }
  return '';
}

/* 详情页用：每条效果前面带上自己的作用对象，避免多效果技能只显示一个范围 */
function describeEffectsWithTargets(effects){
  return (effects || []).map(e => {
    const line = describeEffectLine(e);
    if(!line) return '';
    const tgt = (e.type === 'random_choice')
      ? '随机子效果'
      : (e.target ? targetUiLabel(e.target) : '无目标');
    return tgt + '：' + line;
  }).filter(Boolean).join('；');
}

function renderBattleSkills(){
  const el = document.getElementById('battleSkills');
  el.innerHTML = '';
  const player = battleState ? battleState.allies[0] : null;
  const isPlayerTurn = player && battleState && !battleState.over && battleState.phase === 'player_turn';
  const playerLocked = !!(player && unitSkillLocked(player));
  const skipBtn = document.getElementById('battleSkipBtn');
  if(skipBtn) skipBtn.disabled = !isPlayerTurn;
  const itemBtn = document.getElementById('battleItemBtn');
  if(itemBtn) itemBtn.disabled = !isPlayerTurn || !!battlePendingItem;

  /* 非玩家回合自动收起道具面板 */
  if(!isPlayerTurn && battleItemOpen){
    battleItemOpen = false;
    renderBattleItemPanel();
  }
  if(!isPlayerTurn){
    for(let i = 0; i < 4; i++){
      const btn = document.createElement('button');
      btn.className = 'skill-btn';
      btn.disabled = true;
      btn.innerHTML = '<span class="sk-empty">—</span>';
      el.appendChild(btn);
    }
    return;
  }

  /* 普通攻击按钮 */
  const atkBtn = document.createElement('button');
  atkBtn.className = 'skill-btn';
  const dmgEstimate = calcBasicAttackDamage(player, false);
  atkBtn.innerHTML = `<span class="sk-name">普通攻击</span>
    <span class="sk-info">近战</span>
    <span class="sk-dmg">物 ${dmgEstimate}</span>
    <span class="sk-mp">—</span>`;
  if(battleSelectedSkill && battleSelectedSkill.isBasic) atkBtn.className += ' selected';
  atkBtn.onclick = () => battleBasicAttack();
  el.appendChild(atkBtn);

  const skIds = player.skills || [];
  for(let i = 0; i < 4; i++){
    const skId = skIds[i];
    const sk = skId ? SKILLS[skId] : null;
    const btn = document.createElement('button');
    btn.className = 'skill-btn';
    if(!sk){
      btn.innerHTML = '<span class="sk-empty">空</span>';
      btn.disabled = true;
    }else{
      const lv = getSkillLevel(player, skId);
      const lvData = sk.levels[lv-1] || sk.levels[0];
      if(!skillHasEffects(sk, lvData)){
        btn.disabled = true;
        btn.innerHTML = `<span class="sk-name">${sk.name}</span><span class="sk-empty">未设计</span>`;
        el.appendChild(btn);
        continue;
      }
      const canUse = player.mp >= lvData.mpCost;
      if(battleSelectedSkill && battleSelectedSkill.id === sk.id) btn.className += ' selected';
      btn.disabled = !canUse || playerLocked;
      const effDesc = describeEffects(lvData.effects);
      btn.innerHTML = `<span class="sk-name">${sk.name} ${skillLevelText(sk, lv)}</span>
        <span class="sk-info">${playerLocked ? '沉默/冰冻：只能普攻' : getRangeText(lvData.effects)}</span>
        <span class="sk-desc" style="font-size:11.5px;color:#889;line-height:1.3;overflow:hidden;text-overflow:ellipsis">${effDesc}</span>
        ${getSkillDmgDisplay(lvData.effects, player)}
        <span class="sk-mp">MP${lvData.mpCost}</span>`;
      btn.onclick = () => battleSelectSkill(sk.id);
    }
    el.appendChild(btn);
  }
}

/* 把本等级词条按“选择阵营”分组：敌方组、我方组；AOE/自身/随机不参与 */
function buildTargetPlan(effects){
  const needs = [];
  let enemyRow = null;
  (effects || []).forEach(e => {
    if(!e || e.cond || e.type === 'random_choice') return;
    const t = e.target;
    if(!t || t === 'same_prev') return;
    if(t === 'ally_single'){
      if(needs.indexOf('ally') < 0) needs.push('ally');
      return;
    }
    if(t === 'single' || t === 'enemy_front_single' || t === 'enemy_back_single'){
      if(needs.indexOf('enemy') < 0) needs.push('enemy');
      if(t === 'enemy_front_single') enemyRow = enemyRow === 'back' ? 'both' : (enemyRow || 'front');
      if(t === 'enemy_back_single') enemyRow = enemyRow === 'front' ? 'both' : (enemyRow || 'back');
    }
  });
  return {needs: needs, enemyRow: enemyRow};
}

function aliveEnemyRow(row){
  return row === 'front'
    ? battleState.frontSlots.some(u => u && u.hp > 0)
    : battleState.backSlots.some(u => u && u.hp > 0);
}

function pickGroupOf(pick){
  return pick && pick.plan ? pick.plan.needs[pick.stage] : null;
}

function isValidPickTarget(unit, pick){
  if(!unit || unit.hp <= 0 || !pick) return false;
  const group = pickGroupOf(pick);
  const caster = pick.caster;
  if(group === 'ally') return unit.side === caster.side;
  if(group !== 'enemy' || unit.side === caster.side) return false;
  if(pick.plan.enemyRow === 'front' && aliveEnemyRow('front') && unit.row !== 'front') return false;
  if(pick.plan.enemyRow === 'back' && aliveEnemyRow('back') && unit.row !== 'back') return false;
  /* 单体技能的目标选择也要吃嘲讽；AOE 不参与选择，不受影响 */
  if(!pick.plan.enemyRow){
    const taunter = aliveOpponentsOf(caster).find(u => unitTaunter(u));
    if(taunter && unit !== taunter) return false;
  }
  return true;
}

/* 从两次选择里取当前词条该用的目标 */
function selectedForEffect(eff, target, picks){
  if(!picks) return target;
  if(eff.target === 'ally_single') return picks.ally || null;
  if(eff.target === 'single' || eff.target === 'enemy_front_single' || eff.target === 'enemy_back_single'){
    return picks.enemy || null;
  }
  return target;
}
function selectedForCond(cond, target, picks){
  if(!picks) return target;
  if(cond.target === 'ally_single') return picks.ally || target;
  return picks.enemy || target;
}

function battleSelectSkill(skillId){
  if(!battleState || battleState.over) return;
  if(battleState.phase !== 'player_turn') return;
  const player = battleState.allies[0];
  const sk = SKILLS[skillId];
  if(!sk) return;
  if(unitSkillLocked(player)){ showBattleTip('被沉默/冰冻，无法使用技能'); return; }
  const lv = getSkillLevel(player, skillId);
  const lvData = sk.levels[lv-1] || sk.levels[0];
  if(!skillHasEffects(sk, lvData)){ showBattleTip('该技能尚未设计'); return; }
  if(player.mp < lvData.mpCost){ showBattleTip('MP 不足'); return; }

  battleTargetPick = null;
  const plan = buildTargetPlan(lvData.effects);
  if(!plan.needs.length){ battleSelectedSkill = null; executeSkill(player, sk, null); return; }
  battleSelectedSkill = sk;
  battleTargetPick = { caster:player, skill:sk, plan:plan, picks:{}, stage:0 };
  renderBattleSkills();
  renderBattle();
  const first = plan.needs[0] === 'enemy' ? '敌方' : '我方';
  showBattleTip(`请选择${first}目标（1/${plan.needs.length}）`);
}

function battleBasicAttack(){
  if(!battleState || battleState.over) return;
  if(battleState.phase !== 'player_turn') return;
  battleTargetPick = null;
  battleSelectedSkill = { id: '__basic_attack__', isBasic: true };
  renderBattleSkills();
  renderBattle();
  showBattleTip('请选择目标');
}

function battleClickUnit(unitId){
  if(!battleState || battleState.over) return;
  if(battleState.phase !== 'player_turn') return;

  /* 用药选择目标 */
  if(battlePendingItem){
    const unit = battleState.allies.find(u => u.id === unitId);
    if(!unit || unit.hp <= 0) return;
    applyBattleItem(battlePendingItem.bagIdx, unit);
    return;
  }

  const unit = findUnitById(unitId);
  if(!unit || unit.hp <= 0) return;

  /* 技能的多阵营目标选择：先选完所有组，再统一结算 */
  if(battleTargetPick){
    const pick = battleTargetPick;
    if(!isValidPickTarget(unit, pick)){
      const group = pickGroupOf(pick);
      showBattleTip(group === 'ally' ? '需要选择我方单位' : '需要选择敌方单位');
      return;
    }
    const group = pickGroupOf(pick);
    pick.picks[group] = unit;
    pick.stage++;
    if(pick.stage < pick.plan.needs.length){
      renderBattle();
      const next = pick.plan.needs[pick.stage] === 'enemy' ? '敌方' : '我方';
      showBattleTip(`请选择${next}目标（${pick.stage + 1}/${pick.plan.needs.length}）`);
      return;
    }
    const player = pick.caster, sk = pick.skill, picks = pick.picks;
    battleTargetPick = null;
    battleSelectedSkill = null;
    executeSkill(player, sk, null, false, picks);
    return;
  }

  if(!battleSelectedSkill){
    if(typeof battleViewUnit === 'function') battleViewUnit(unitId);
    return;
  }

  /* 普通攻击：只能选敌方 */
  if(battleSelectedSkill.isBasic){
    if(unit.side !== 'enemy'){ showBattleTip('普通攻击只能打敌人'); return; }
    const player = battleState.allies[0];
    executeBasicAttack(player, unit);
    battleSelectedSkill = null;
    renderBattle();
    if(checkBattleEnd()) return;
    battleState.phase = 'ai_turn';
    renderBattleSkills();
    battleState.queueIdx++;
    setTimeout(processNextTurn, BATTLE_DELAY.afterAction);
    return;
  }

  /* 兼容直接调用：没有走目标组时仍按旧单目标结算 */
  const sk = battleSelectedSkill;
  battleSelectedSkill = null;
  executeSkill(battleState.allies[0], sk, unit);
}

/* ============================================================
   技能执行
   ============================================================ */

/* ============================================================
   判断（施放前置条件）
   ============================================================ */

/* 单位身上是否有带该标签（或同 id）的状态 */
function unitHasStatusTag(unit, tag){
  return ((unit && unit.statuses) || []).some(s =>
    (s.tags && s.tags.indexOf(tag) >= 0) || s.type === tag);
}

/* 施法者的敌对存活单位 */
function aliveOpponentsOf(unit){
  if(!battleState) return [];
  const isAlly = !!(unit && unit.side === 'ally');
  const pool = isAlly
    ? [...battleState.frontSlots, ...battleState.backSlots]
    : battleState.allies;
  return pool.filter(u => u && u.hp > 0);
}

/* 单个判断是否成立 */
function checkCond(eff, caster, target){
  const t = target || caster;
  if(!t) return false;
  const v = Number(eff.value) || 0;
  const ratio = (v > 1 ? v / 100 : v);
  switch(eff.type){
    case 'cond_target_has_tag':   return unitHasStatusTag(t, eff.tag || '毒');
    case 'cond_target_no_tag':    return !unitHasStatusTag(t, eff.tag || '毒');
    case 'cond_target_full_hp':   return (Number(t.hp) || 0) >= (Number(t.maxHp) || 0);
    case 'cond_target_hp_below':  return Number(t.maxHp) > 0 && (t.hp / t.maxHp) < ratio;
    case 'cond_target_acted':     return !!t.hasActedThisRound;
    case 'cond_target_not_acted': return !t.hasActedThisRound;
    case 'cond_target_row':       return (eff.row || 'front') === t.row;
    case 'cond_self_hp_below':    return Number(caster.maxHp) > 0 && (caster.hp / caster.maxHp) < ratio;
    case 'cond_enemy_count':{
      const n = aliveOpponentsOf(caster).length;
      return (eff.op === '<=') ? (n <= v) : (n >= v);
    }
  }
  return true;
}

function executeSkill(caster, sk, target, isConfused, picks){
  if(!battleState || battleState.over) return;
  battleTargetPick = null;
  const lv = getSkillLevel(caster, sk.id);
  const lvData = sk.levels[lv-1];
  /* 判断：全部条件成立才继续，否则本次施放失败且不扣 MP */
  const conds = (lvData.effects || []).filter(e => e && e.cond);
  if(conds.length && !conds.every(c => checkCond(c, caster, selectedForCond(c, target, picks)))){
    showBattleTip('条件不满足');
    addBattleLog(`【${caster.name}】的条件不满足，施放失败。`, 'status');
    battleState.queueIdx++;
    setTimeout(processNextTurn, BATTLE_DELAY.statusTick);
    return;
  }
  /* MP 消耗：技能耗蓝降低 / 概率不消耗 */
  const castStats = (typeof getAttackStats === 'function') ? (getAttackStats(caster) || {}) : {};
  let mpCost = Number(lvData.mpCost) || 0;
  if(mpCost > 0){
    const down = Math.min(90, Number(castStats.mpCostDown) || 0);
    if(down > 0) mpCost = Math.max(0, Math.floor(mpCost * (1 - down / 100)));
    const freeChance = Math.min(1, Number(castStats.noCostChance) || 0);
    if(freeChance > 0 && Math.random() < freeChance) mpCost = 0;
  }
  if(mpCost > 0){
    if(caster.mp < mpCost && !isConfused){
      showBattleTip('MP 不足');
      if(battleState.queueIdx < battleState.queue.length){
        battleState.queueIdx++;
        setTimeout(processNextTurn, BATTLE_DELAY.statusTick);
      }
      return;
    }
    caster.mp = Math.max(0, caster.mp - mpCost);
  }
  /* 技能级一次性 cost（如策反的 100 金） */
  if(!isConfused){
    lvData.effects.forEach(eff => {
      if(eff.cost && eff.cost.type === 'gold_cost'){
        currentGame.money = Math.max(0, currentGame.money - Math.abs(eff.cost.value || 0));
      }
    });
  }
  const targetLabel = target ? `→【${target.name}】` : '';
  addBattleLog(`【${caster.name}】施放【${sk.name}】${targetLabel}${mpCost > 0 ? `，消耗 ${mpCost} MP` : ''}`, 'turn');
  const hiddenBonus = getHiddenBonus(caster);
  let prevTargets = null;
  lvData.effects.forEach(eff => {
    if(eff.cond) return; /* 判断行不产生效果 */
    /* 「同上」：沿用前一个词条已解析出的目标；否则按阵营从两次选择里取 */
    const selected = selectedForEffect(eff, target, picks);
    const targets = (eff.target === 'same_prev' && prevTargets)
      ? prevTargets.slice()
      : getEffectTargets(eff, caster, selected, isConfused);
    if(!prevTargets || eff.target !== 'same_prev') prevTargets = targets.slice();
    targets.forEach(tgt => {
      if(!tgt) return;
      if(tgt.hp <= 0 && eff.type !== 'revive' && eff.type !== 'hp_heal') return;
      let modifiedEff = eff;
      if(hiddenBonus.magic > 0 && eff.type === 'magic_dmg'){
        modifiedEff = {...eff, value:(eff.value||0) + hiddenBonus.magic};
      }
      if(hiddenBonus.phys > 0 && eff.type === 'phys_dmg'){
        modifiedEff = {...eff, value:(eff.value||0) + hiddenBonus.phys};
      }
      applyEffect(modifiedEff, caster, tgt, sk);
    });
  });
  if(!isConfused && (caster.isPlayer || caster.npcId)){ recordSkillUse(caster, sk.id); }
  renderBattle();
  if(checkBattleEnd()) return;
  battleSelectedSkill = null;
  battleState.queueIdx++;
  setTimeout(processNextTurn, BATTLE_DELAY.afterAction);
}

/* ============================================================
   普通攻击（不消耗 MP）
   ------------------------------------------------------------
   伤害 = (角色物理攻击 + 武器物理攻击) × 加成 × 浮动
   角色物理攻击来自 data-attributes.js 的统一公式，已经包含等级与体力。
   武器物理攻击来自 calcEquipStats(...).physAtk，受 paup / 物理攻击% /
   low_hp_power 等修正（通过 calcFinalPhysAtk）。
   ============================================================ */

function calcBasicAttackDamage(unit, withVariance){
  const coreAtk    = unit.physAtk || unit.derivedPhysAtk || 0;
  let weaponAtk = 0;
  if(unit && unit.equipment){
    weaponAtk = (typeof getAttackStats === 'function' ? getAttackStats(unit) : (typeof getUnitMods === 'function' ? getUnitMods(unit) : calcEquipStats({equipment:unit.equipment}))).physAtk || 0;
  }
  const raw = calcFinalPhysAtk(unit, coreAtk + weaponAtk);
  if(withVariance === false) return Math.max(1, Math.floor(raw));
  const variance = 0.8 + Math.random() * 0.4;
  return Math.max(1, Math.floor(raw * variance));
}

function executeBasicAttack(attacker, target){
  if(!attacker || !target || target.hp <= 0) return;
  /* 前后排锁定：普通攻击优先攻击前排；前排还有存活单位时不能越过前排打后排。
     后排只能通过明确标注「敌方后排」的技能命中。 */
  if(attacker.side !== target.side){
    const enemyUnits = getEnemySideUnits(attacker).filter(u => u && u.hp > 0);
    const frontAlive = enemyUnits.some(u => u.row === 'front');
    if(frontAlive && target.row !== 'front'){
      const frontUnits = enemyUnits.filter(u => u.row === 'front');
      target = frontUnits[Math.floor(Math.random() * frontUnits.length)] || target;
    }
  }
  const dmg = calcBasicAttackDamage(attacker);
  addBattleLog(`【${attacker.name}】对【${target.name}】发动普通攻击。`, 'turn');
  applyDamage(target, dmg, 'phys', attacker, null);
}

function getHiddenBonus(caster){
  const result = {magic:0, phys:0};
  let obj = null;
  if(caster.isPlayer) obj = currentGame;
  else if(caster.npcId) obj = getNpc(caster.npcId);
  if(!obj || !obj.hiddenWords) return result;
  const lv = obj.level || 1;
  obj.hiddenWords.forEach(hw => {
    if(hw.type === 'magic_atk_up') result.magic += hw.perLevel * lv;
    else if(hw.type === 'phys_atk_up') result.phys += hw.perLevel * lv;
  });
  return result;
}

/* 按施法者视角，拿到"敌方阵营"的全部单位 */
function getEnemySideUnits(caster){
  if(caster.side === 'ally'){
    return [...battleState.frontSlots, ...battleState.backSlots].filter(Boolean);
  }else{
    return battleState.allies;
  }
}

/* 按施法者视角，拿到"我方阵营"的全部单位（含施法者自己） */
function getAllySideUnits(caster){
  if(caster.side === 'enemy'){
    return [...battleState.frontSlots, ...battleState.backSlots].filter(Boolean);
  }else{
    return battleState.allies;
  }
}

function getEffectTargets(eff, caster, selected, ignoreSide){
  /* random_choice 内部子效果自带 target，外层只需返回一个占位让 applyEffect 被执行 */
  if(eff.type === 'random_choice') return [caster];

  const t = (eff.target === 'same_prev') ? 'single' : (eff.target || 'single');
  const enemySide = getEnemySideUnits(caster);
  const ownSide = getAllySideUnits(caster);

  if(t === 'self') return [caster];
  if(t === 'ally_single'){
    /* 混乱时施法者会攻击自己人，此时不再校验阵营 */
    if(ignoreSide) return [selected || caster].filter(u => u && u.hp > 0);
    /* 选择型友方目标：只接受施法者自己阵营的单位 */
    if(selected) return (ownSide.indexOf(selected) >= 0 && selected.hp > 0) ? [selected] : [];
    return (caster && ownSide.indexOf(caster) >= 0 && caster.hp > 0) ? [caster] : [];
  }
  if(t === 'ally_all') return ownSide.filter(u => u.hp > 0 || eff.type === 'revive');

  if(t === 'enemy_all') return enemySide.filter(u => u.hp > 0);

  if(t === 'enemy_front'){
    const front = enemySide.filter(u => u.hp > 0 && u.row === 'front');
    if(front.length > 0) return front;
    /* 前排全灭 → 打后排 */
    return enemySide.filter(u => u.hp > 0);
  }
  if(t === 'enemy_back'){
    const back = enemySide.filter(u => u.hp > 0 && u.row === 'back');
    if(back.length > 0) return back;
    return enemySide.filter(u => u.hp > 0);
  }

  if(t === 'enemy_front_single'){
    if(ignoreSide) return [selected].filter(u => u && u.hp > 0);
    if(!selected || enemySide.indexOf(selected) < 0 || selected.hp <= 0) return [];
    const frontAlive = enemySide.some(u => u.hp > 0 && u.row === 'front');
    if(!frontAlive) return [selected];
    return selected.row === 'front' ? [selected] : [];
  }
  if(t === 'enemy_back_single'){
    if(ignoreSide) return [selected].filter(u => u && u.hp > 0);
    if(!selected || enemySide.indexOf(selected) < 0 || selected.hp <= 0) return [];
    const backAlive = enemySide.some(u => u.hp > 0 && u.row === 'back');
    if(!backAlive) return [selected];
    return selected.row === 'back' ? [selected] : [];
  }

  if(t === 'single'){
    if(ignoreSide) return [selected].filter(u => u && u.hp > 0);
    if(!selected || enemySide.indexOf(selected) < 0 || selected.hp <= 0) return [];
    /* 前后排锁定：敌方施法者的普通单体技能也不能越过存活的前排 */
    if(caster.side === 'enemy'){
      const frontAlive = enemySide.some(u => u.hp > 0 && u.row === 'front');
      if(frontAlive && selected.row !== 'front'){
        const fallback = enemySide.find(u => u.hp > 0 && u.row === 'front');
        if(fallback) return [fallback];
      }
    }
    return [selected];
  }

  if(t === 'random'){
    const pool = enemySide.filter(u => u.hp > 0);
    const count = eff.count || 1;
    const picks = [];
    for(let i = 0; i < count; i++){
      if(pool.length === 0) break;
      picks.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    return picks;
  }

  return [selected].filter(u => u && u.hp > 0);
}

function applyEffect(eff, caster, tgt, sk){
  switch(eff.type){
    /* ---- 原装备专属词条：技能/道具现在也能施加 ---- */
    case 'maxhp_up':{
      /* 只提高上限，不补当前 HP；上限 = 基础值 + 累加奖励，可随时重算 */
      const v = Number(eff.value) || 0;
      if(tgt.baseMaxHp === undefined) tgt.baseMaxHp = Number(tgt.maxHp) || 0;
      tgt.maxHpBonus = (Number(tgt.maxHpBonus) || 0) + v;
      tgt.maxHp = Math.max(1, tgt.baseMaxHp + tgt.maxHpBonus);
      if(tgt.hp > tgt.maxHp) tgt.hp = tgt.maxHp;
      addBattleLog(`【${tgt.name}】最大 HP +${v}`, 'status');
      break;
    }
    case 'maxmp_up':{
      const v = Number(eff.value) || 0;
      if(tgt.baseMaxMp === undefined) tgt.baseMaxMp = Number(tgt.maxMp) || 0;
      tgt.maxMpBonus = (Number(tgt.maxMpBonus) || 0) + v;
      tgt.maxMp = Math.max(1, tgt.baseMaxMp + tgt.maxMpBonus);
      if(tgt.mp > tgt.maxMp) tgt.mp = tgt.maxMp;
      addBattleLog(`【${tgt.name}】最大 MP +${v}`, 'status');
      break;
    }
    case 'def_up_once':{
      const v = Math.max(0, Number(eff.value) || 0);
      tgt.defOnce = (Number(tgt.defOnce) || 0) + v;
      addBattleLog(`【${tgt.name}】下一次受击防御 +${v}。`, 'status');
      break;
    }
    /* 四率：命中/闪避/暴击/暴伤 走状态，带回合 */
    case 'dodge': case 'hit_up': case 'crit_up': case 'critdmg_up':
      addStatus(tgt, eff); break;
    /* 固定攻/魔攻：写进战斗内修正，本场有效 */
    case 'phys_atk_up':
      addTempMod(tgt, 'physAtk', eff.value);
      addBattleLog(`【${tgt.name}】物攻 +${eff.value}`, 'status');
      break;
    case 'magic_atk_up':
      addTempMod(tgt, 'magicAtk', eff.value);
      addBattleLog(`【${tgt.name}】魔攻 +${eff.value}`, 'status');
      break;
    /* 耗血：施法者自己掉血 */
    case 'hp_cost':{
      const cost = Math.max(0, Number(eff.value) || 0);
      if(caster){
        caster.hp = Math.max(1, caster.hp - cost);
        addBattleLog(`【${caster.name}】消耗 ${cost} HP`, 'status');
      }
      break;
    }
    /* 增伤 / 减伤：写进战斗内修正（本场有效） */
    case 'dmg_up_pct':
      addTempMod(tgt, 'dmgUp', eff.value);
      addBattleLog(`【${tgt.name}】增伤 ${eff.value}%`, 'status');
      break;
    case 'sure_hit':
      addTempMod(tgt, 'sureHit', 1, 'max'); break;
    case 'ignore_def':
      addTempMod(tgt, 'ignoreDef', 1, 'max'); break;
    case 'extra_phys_dmg':
      addTempMod(tgt, 'extraPhysDmg', eff.value); break;
    case 'extra_magic_dmg':
      addTempMod(tgt, 'extraMagicDmg', eff.value); break;
    case 'multi_hit':
      addTempMod(tgt, 'multiHit', eff.value, 'max'); break;
    case 'pierce_def': case 'first_strike':
    case 'lifesteal_on_kill': case 'low_hp_power': case 'true_dmg_bonus':
    case 'hp_drain_pct': case 'mp_drain_pct': case 'execute_below':{
      const atom = (typeof getEffectAtom === 'function') ? getEffectAtom(eff.type) : null;
      const key = (atom && atom.combatKey) ? atom.combatKey : eff.type;
      addTempMod(tgt, key, eff.value, atom && atom.stack);
      addBattleLog(`【${tgt.name}】获得【${(atom && atom.name) || eff.type}】`, 'status');
      break;
    }
    case 'def_up':
      addTempMod(tgt, 'def_up', eff.value);
      break;
    case 'def_down':
      addTempMod(tgt, 'def_down', eff.value);
      break;
       case 'phys_dmg':{
      const stats = (typeof getAttackStats === 'function') ? (getAttackStats(caster) || {}) : ((typeof getUnitMods === 'function') ? getUnitMods(caster) : calcEquipStats(caster.equipment ? {equipment:caster.equipment} : {}));
      const coreAtk = caster.physAtk || caster.derivedPhysAtk || 0;
      const base = (eff.value||0) + coreAtk + (stats.physAtk||0);
      applyDamage(tgt, Math.floor(calcFinalPhysAtk(caster, base)), 'phys', caster, sk, {ignoreDef: !!eff.ignoreDef});
      break;
    }
        case 'betray':{
      /* MVP 实现：把目标视为"被策反并退出战斗" */
      if(Math.random() < (eff.chance || 0)){
        addBattleLog(`【${tgt.name}】被策反，退出了战斗！`, 'dead');
        tgt.hp = 0;
      }
      break;
    }
    case 'magic_dmg':{
      const stats = (typeof getAttackStats === 'function') ? (getAttackStats(caster) || {}) : ((typeof getUnitMods === 'function') ? getUnitMods(caster) : calcEquipStats(caster.equipment ? {equipment:caster.equipment} : {}));
      const coreAtk = caster.magicAtk || caster.derivedMagicAtk || 0;
      const base = (eff.value||0) + coreAtk + (stats.magicAtk||0);
      applyDamage(tgt, Math.floor(calcFinalMagicAtk(caster, base)), 'magic', caster, sk, {ignoreDef: !!eff.ignoreDef});
      break;
    }
    case 'true_dmg': applyDamage(tgt, eff.value, 'true', caster, sk); break;
    case 'hp_heal':{
      const spiBonus = (caster.spi || (caster.base && caster.base.spi) || 0) * 0.5;
      const heal = eff.value + spiBonus;
      const before = tgt.hp;
      tgt.hp = Math.min(tgt.maxHp, tgt.hp + heal);
      const healed = tgt.hp - before;
      if(healed > 0){
        recordBattleHeal(caster, healed);
        addBattleLog(`【${caster.name}】为【${tgt.name}】恢复 ${healed} 生命。`, 'heal');
        showBattleFloat(tgt.id, '+' + healed, 'heal');
      }
      break;
    }
    case 'mp_heal': tgt.mp = Math.min(tgt.maxMp, tgt.mp + eff.value); break;
               case 'hp_heal_pct':{
      const before = tgt.hp;
      tgt.hp = Math.min(tgt.maxHp, tgt.hp + Math.floor(tgt.maxHp * eff.value / 100));
      const healed = tgt.hp - before;
      if(healed > 0){
        recordBattleHeal(caster, healed);
        addBattleLog(`【${caster.name}】为【${tgt.name}】恢复 ${healed} 生命。`, 'heal');
        showBattleFloat(tgt.id, '+' + healed, 'heal');
      }
      break;
    }
    case 'mp_heal_pct': tgt.mp = Math.min(tgt.maxMp, tgt.mp + Math.floor(tgt.maxMp * eff.value / 100)); break;
    case 'hp_drain':{
      const dmg = eff.value;
      applyDamage(tgt, dmg, 'phys', caster, sk);
      const heal = Math.floor(dmg * 0.5);
      caster.hp = Math.min(caster.maxHp, caster.hp + heal);
      break;
    }
    case 'mp_drain': tgt.mp = Math.max(0, tgt.mp - eff.value); caster.mp = Math.min(caster.maxMp, caster.mp + eff.value); break;
    case 'cleanse':
      if(eff.value >= 99){ tgt.statuses = (tgt.statuses || []).filter(s => !(isDebuff(s.type) && s.cleanseable !== false)); }
      else{
        let removed = 0;
        tgt.statuses = (tgt.statuses || []).filter(s => {
          if(removed < eff.value && isDebuff(s.type) && s.cleanseable !== false){ removed++; return false; }
          return true;
        });
      }
      break;
    case 'dispel':{
      const before = (tgt.statuses || []).length;
      tgt.statuses = (tgt.statuses || []).filter(s => !(s.tags || []).includes('正面'));
      if(before !== tgt.statuses.length) addBattleLog(`【${tgt.name}】的增益被驱散。`, 'status');
      break;
    }
    case 'cure_poison': case 'cure_burn': case 'cure_bleed':
    case 'cure_silence': case 'cure_freeze': case 'cure_confuse': case 'cure_stun':
    case 'cure_petrify': case 'cure_mark':{
      const cureAtom = (typeof getEffectAtom === 'function') ? getEffectAtom(eff.type) : null;
      const cureTag = cureAtom && cureAtom.curesTag;
      let cured = 0;
      if(cureTag){
        tgt.statuses = (tgt.statuses || []).filter(s => {
          const hit = (s.tags && s.tags.indexOf(cureTag) >= 0) || s.type === cureTag;
          if(hit) cured++;
          return !hit;
        });
      }
      if(cured > 0) addBattleLog(`【${tgt.name}】${cureAtom ? cureAtom.name : '解除'}成功。`, 'heal');
      break;
    }
    case 'revive':
      if(tgt.hp <= 0){ tgt.hp = Math.floor(tgt.maxHp * eff.value); addBattleLog(`【${tgt.name}】被复活！`, 'heal'); }
      break;
    case 'counter': tgt.counterCharges = (tgt.counterCharges || 0) + (eff.value || 1); break;
    case 'poison': case 'burn': case 'bleed': case 'silence': case 'freeze': case 'airborne': case 'confusion':
    case 'stun': case 'petrify': case 'mark': case 'taunt':
    case 'phys_atk_up_pct': case 'phys_atk_down_pct':
    case 'magic_atk_up_pct': case 'magic_atk_down_pct':
    case 'def_up_pct': case 'def_down_pct':
    case 'spd_up': case 'spd_down':
      addStatus(tgt, eff); break;
    /* 守护：记录保护者，受击时把伤害转给他 */
    case 'guard':
      addStatus(tgt, Object.assign({}, eff, { by: caster && caster.id }));
      break;
    case 'execute':
      if(Math.random() < (eff.chance || 1)){
        if(tgt.hp / tgt.maxHp < eff.value){ tgt.hp = 0; addBattleLog(`【${tgt.name}】被斩杀！`, 'dead'); }
      }
      break;
    case 'gold_cost':{
      const v = Math.abs(eff.value || 0);
      const amount = (eff.costType === 'current_pct')
        ? Math.floor(currentGame.money * v)
        : v;
      currentGame.money = Math.max(0, currentGame.money - amount);
      break;
    }
    case 'gold_steal':
      /* 敌人偷玩家钱 */
      currentGame.money = Math.max(0, currentGame.money - Math.abs(eff.value || 0));
      break;
    case 'random_dmg':{
      let dmg;
      if(Math.random() < (eff.chance || 0.5)) 
          dmg = (eff.fixed !== undefined ? eff.fixed : (eff.value || 0));
      else{
        const lost = caster.maxHp - caster.hp;
        dmg = Math.floor(lost * (eff.lostHpRatio || 0.3));
      }
      applyDamage(tgt, dmg, 'phys', caster, sk);
      break;
    }
    case 'random_choice':{
      /* 兼容两种数据结构：eff.options 或 eff.target.options */
      const opts = eff.options
        || (eff.target && typeof eff.target === 'object' && eff.target.options)
        || [];
      if(opts.length === 0) break;
      const pick = opts[Math.floor(Math.random() * opts.length)];
      (pick || []).forEach(sub => {
        const subEff = expandEff(sub);
        if(!subEff) return;
        const subTargets = getEffectTargets(subEff, caster, tgt);
        subTargets.forEach(t => {
          if(t && (t.hp > 0 || subEff.type === 'revive')) applyEffect(subEff, caster, t, sk);
        });
      });
      break;
    }
  }
}

/* 把 skill 数据里的简写 effect 展开成标准 effect 对象 */
function expandEff(sub){
  if(!sub) return null;
  if(!Array.isArray(sub)) return sub;   /* 已经是对象，直接用 */
  const map = {
    md:'magic_dmg', pd:'phys_dmg', td:'true_dmg',
    hh:'hp_heal', mh:'mp_heal',
    hhp:'hp_heal_pct', mhp:'mp_heal_pct',
    pn:'poison', bn:'burn', sil:'silence', cnf:'confusion',
    cl:'cleanse', rv:'revive', ct:'counter',
    paup:'phys_atk_up_pct', padp:'phys_atk_down_pct',
    maup:'magic_atk_up_pct', madp:'magic_atk_down_pct',
    dpu:'def_up_pct', dpd:'def_down_pct',
    sup:'spd_up', sdn:'spd_down'
  };
  const tgtMap = {
    ea:'enemy_all', ef:'enemy_front', eb:'enemy_back',
    ef1:'enemy_front_single', eb1:'enemy_back_single',
    aa:'ally_all', as:'ally_single', sf:'self'
  };
  const eff = {
    type: map[sub[0]] || sub[0],
    value: sub[1],
    target: tgtMap[sub[2]] || sub[2] || 'single'
  };
  if(sub[3] && typeof sub[3] === 'object') Object.assign(eff, sub[3]);
  return eff;
}

function isDebuff(t){
  if(typeof statusHasTag === 'function') return statusHasTag(t, '负面');
  return ['poison','burn','silence','confusion','phys_atk_down_pct','magic_atk_down_pct','def_down_pct','spd_down'].includes(t);
}

function addStatus(tgt, eff){
  if(!tgt.statuses) tgt.statuses = [];
  /* 免疫：持有该标签免疫的单位直接拒绝 */
  if(typeof statusTagsOf === 'function'){
    if(tgt.immuneTags === undefined && typeof getUnitMods === 'function'){
      const im = getUnitMods(tgt);
      tgt.immuneTags = (im && im.immuneTags) ? im.immuneTags : [];
    }
    const stTags = statusTagsOf(eff.type);
    if(tgt.immuneTags && tgt.immuneTags.some(t => stTags.indexOf(t) >= 0)){
      addBattleLog(`【${tgt.name}】免疫了【${statusLabel(eff.type)}】`, 'status');
      return;
    }
  }
  /* 同类型但不同来源（不同装备词条）不合并：各自独立计时/结算。 */
  const srcKey = eff.source || '';
  const existing = tgt.statuses.find(s => s.type === eff.type && (s.source || '') === srcKey);
  const NON_STACKING = ['phys_atk_down_pct','magic_atk_down_pct','def_down_pct'];
  const atom = (typeof getEffectAtom === 'function') ? getEffectAtom(eff.type) : null;
  const defDur = (atom && atom.duration) ? atom.duration : 3;
  const tags = (typeof statusTagsOf === 'function') ? statusTagsOf(eff.type).slice() : [];
  const mechanic = (typeof statusMechanicOf === 'function') ? statusMechanicOf(eff.type) : '';
  const cleanseable = !(atom && atom.cleanseable === false);
  if(existing){
    if(NON_STACKING.includes(eff.type)){
      existing.value = Math.max(existing.value || 0, eff.value || 0);
    }else{
      existing.value = (existing.value || 0) + (eff.value || 0);
    }
    existing.duration = Math.max(existing.duration, eff.duration || defDur);
    existing.tags = tags;
    existing.mechanic = mechanic;
    existing.cleanseable = cleanseable;
  }else{
    tgt.statuses.push({type:eff.type, value:eff.value || 0, duration:eff.duration || defDur, tags:tags, mechanic:mechanic, cleanseable:cleanseable, by:eff.by, source:srcKey || undefined});
  }
  addBattleLog(`【${tgt.name}】获得【${statusLabel(eff.type)}】`, 'status');
}

/* 状态中文名 */
function statusLabel(type){
  const m = {
    poison:'中毒', burn:'灼烧', bleed:'流血', silence:'沉默', freeze:'冰冻', airborne:'腾空',
    confusion:'混乱', stun:'眩晕', petrify:'石化', taunt:'嘲讽', guard:'守护', mark:'印记',
    phys_atk_up_pct:'攻击提升', phys_atk_down_pct:'攻击下降',
    magic_atk_up_pct:'法伤提升', magic_atk_down_pct:'法伤下降',
    def_up_pct:'防御提升', def_down_pct:'防御下降',
    spd_up:'加速', spd_down:'减速'
  };
  return m[type] || type;
}

function recordSkillUse(unit, skillId){
  const obj = unit.isPlayer ? currentGame : getNpc(unit.npcId);
  if(!obj) return;
  if(!obj.skillProficiency) obj.skillProficiency = {};
  obj.skillProficiency[skillId] = (obj.skillProficiency[skillId] || 0) + 1;
}



/* ============================================================
   伤害计算
   ============================================================ */


/* ---- P0-18：伤害 / 治疗统计记录 ---- */
function recordBattleDamage(attacker, dmg){
  if(!battleState || !battleState.damageStats) return;
  if(!attacker || !attacker.id || dmg <= 0) return;
  const s = battleState.damageStats[attacker.id];
  if(s) s.totalDmg += dmg;
}

function recordBattleHeal(caster, heal){
  if(!battleState || !battleState.damageStats) return;
  if(!caster || !caster.id || heal <= 0) return;
  const s = battleState.damageStats[caster.id];
  if(s) s.totalHeal += heal;
}


function applyDamage(target, dmg, dmgType, attacker, sk, opts){
  if(dmg <= 0 || target.hp <= 0) return;

  /* 守护：伤害转给保护者（只转一次，避免连环） */
  if(!(opts && opts._guarded)){
    const g = (target.statuses || []).find(s => s.type === 'guard' && s.by && s.by !== (attacker && attacker.id));
    if(g){
      const protector = findUnitById(g.by);
      if(protector && protector !== target && protector.hp > 0){
        addBattleLog(`【${protector.name}】替【${target.name}】承受了伤害。`, 'status');
        return applyDamage(protector, dmg, dmgType, attacker, sk, Object.assign({}, opts || {}, {_guarded:true}));
      }
    }
  }

  const aStats = getAttackStats(attacker) || {};

  /* 多段：把一次伤害拆成 N 段，每段独立命中/暴击/减防 */
  const hits = Math.max(1, Math.min(10, Number(aStats.multiHit) || 1));
  if(hits > 1 && !(opts && opts._multi)){
    const per = Math.max(1, Math.floor(dmg / hits));
    for(let i = 0; i < hits; i++){
      applyDamage(target, per, dmgType, attacker, sk, Object.assign({}, opts || {}, {_multi:true}));
      if(target.hp <= 0) break;
    }
    return;
  }

  const tStats = (typeof getAttackStats === 'function')
    ? (getAttackStats(target) || {})
    : ((typeof getUnitMods === 'function') ? getUnitMods(target) : calcEquipStats(target && target.equipment ? { equipment: target.equipment } : {}));
  /* 状态提供的四率加成 */
  const mA = (typeof getStatusMods === 'function') ? getStatusMods(attacker || {}) : {};
  const mT = (typeof getStatusMods === 'function') ? getStatusMods(target || {}) : {};
  const isTrue = (dmgType === 'true');
  const ignoreDef = !!(opts && opts.ignoreDef) || (Number(aStats.ignoreDef) > 0);
  let isCrit = false;

  if(!isTrue){
    /* ① 命中：目标闪避 - (攻击方角色命中 + 装备命中)；必中跳过
       命中率与闪避率都有硬顶，超出上限的部分不生效 */
    const sure = Number(aStats.sureHit) > 0;
    const atkHit = (attacker && typeof attacker.hitRate === 'number') ? attacker.hitRate : 0;
    const hitCap = (typeof HIT_CAP === 'number' ? HIT_CAP : 1.5) - 1;
    const totalHit = Math.min(hitCap, Math.max(-1, atkHit + (Number(aStats.hitRate) || 0) + (Number(mA.hit) || 0)));
    const dodgeCap = (typeof DODGE_CAP === 'number' ? DODGE_CAP : 0.75);
    const targetDodge = Math.min(dodgeCap, Math.max(0, (Number(target.dodgeBonus) || 0) + (Number(mT.dodge) || 0)));
    const effDodge = Math.max(0, Math.min(dodgeCap, targetDodge - totalHit));
    if(!sure && effDodge > 0 && Math.random() < effDodge){
      addBattleLog(`【${target.name}】闪避了【${attacker ? attacker.name : '攻击'}】的攻击！`, 'status');
      showBattleFloat(target.id, '闪避', 'miss');
      return;
    }

    /* ② 暴击（减防御之前）：角色暴击率/倍率 + 装备与状态的加成，各自封顶 */
    const atkCrit = (attacker && typeof attacker.critRate === 'number') ? attacker.critRate : BATTLE_CRIT_RATE;
    const atkCritMult = (attacker && typeof attacker.critMult === 'number') ? attacker.critMult : BATTLE_CRIT_MULT;
    const critCap = (typeof CRIT_RATE_CAP === 'number' ? CRIT_RATE_CAP : 0.75);
    const critMultCap = (typeof CRIT_MULT_CAP === 'number' ? CRIT_MULT_CAP : 3);
    const critRate = Math.min(critCap, atkCrit + (Number(aStats.critRate) || 0) + (Number(mA.crit) || 0));
    const critMult = Math.min(critMultCap, atkCritMult + (Number(aStats.critMult) || 0) + (Number(mA.critMult) || 0));
    if(Math.random() < critRate){
      isCrit = true;
      dmg = Math.floor(dmg * critMult);
    }

    /* ③ 首回合增伤 */
    if(Number(aStats.firstStrike) > 0 && battleState && battleState.round === 1){
      dmg = Math.floor(dmg * (1 + aStats.firstStrike / 100));
    }

    /* ④ 增伤乘区（防御是唯一减伤，没有 dmgTakenDown） */
    if(Number(aStats.dmgUp) > 0) dmg *= (1 + aStats.dmgUp / 100);
    dmg = Math.floor(dmg);

    /* ⑤ 斩杀阈值 */
    if(Number(aStats.executeBelow) > 0){
      const hpRatio = target.hp / target.maxHp;
      if(hpRatio < aStats.executeBelow / 100){
        target.hp = 0;
        addBattleLog(`【${target.name}】被斩杀！`, 'dead');
        if(aStats.lifestealOnKill && attacker){
          const heal = Math.floor(attacker.maxHp * aStats.lifestealOnKill / 100);
          attacker.hp = Math.min(attacker.maxHp, attacker.hp + heal);
          addBattleLog(`【${attacker.name}】击杀回复 ${heal} 生命。`, 'heal');
        }
        return;
      }
    }

    /* ⑥ 减防御：总攻击 - 总防御；防御是伤害公式最后一个减项 */
    if(!ignoreDef){
      const def = Math.round(getUnitDefense(target, attacker));
      const after = dmg - def;
      if(after <= 0){
        addBattleLog(`【${target.name}】完全格挡了【${attacker ? attacker.name : '攻击'}】的攻击（伤害 ${dmg} / 防御 ${def}）。`, 'status');
        showBattleFloat(target.id, '格挡', 'miss');
        target.defOnce = 0;
        return;
      }
      dmg = after;
    }
  }

  /* 单次防御：本次命中已计入，结算后移除 */
  target.defOnce = 0;

  /* 圣骑士：对魔军伤害 +X%，真实伤害也生效 */
  if(Number(aStats.dmgVsDemon) > 0 && target && unitHasFactionTag(target, '魔军')){
    dmg *= 1 + Number(aStats.dmgVsDemon) / 100;
  }

  let originalDmg = Math.max(0, Math.floor(dmg));
  if(originalDmg <= 0) return;

  /* 扣血 */
  target.hp = Math.max(0, target.hp - originalDmg);
  recordBattleDamage(attacker, originalDmg);
  const typeStr = isTrue ? '真实' : dmgType === 'magic' ? '法术' : '物理';
  const sourceStr = attacker ? `【${attacker.name}】对【${target.name}】` : `【${target.name}】`;
  addBattleLog(`${sourceStr}造成 ${originalDmg} 点${typeStr}伤害${isCrit ? '（暴击！）' : ''}，剩余 HP ${target.hp}/${target.maxHp}。`);
  if(isCrit){
    showBattleFloat(target.id, '-' + originalDmg + '!', 'crit');
    shakeBattleScreen();
  }else{
    const cls = dmgType === 'magic' ? 'magic' : dmgType === 'true' ? 'true' : 'phys';
    showBattleFloat(target.id, '-' + originalDmg, cls);
  }
  if(target.hp <= 0) addBattleLog(`【${target.name}】倒下了`, 'dead');

  /* 附加伤害（不减防御、不暴击） */
  if(target.hp > 0 && !isTrue){
    const extras = [
      { v:Number(aStats.extraPhysDmg) || 0,  label:'物理' },
      { v:Number(aStats.extraMagicDmg) || 0, label:'魔法' },
      { v:Number(aStats.trueDmgBonus) || 0,  label:'真实' }
    ];
    extras.forEach(x => {
      if(x.v <= 0 || target.hp <= 0) return;
      target.hp = Math.max(0, target.hp - x.v);
      recordBattleDamage(attacker, x.v);
      addBattleLog(`【${target.name}】额外受到 ${x.v} 点${x.label}伤害。`);
      if(target.hp <= 0) addBattleLog(`【${target.name}】倒下了`, 'dead');
    });
  }

  /* 溅射：对目标同排其他人造成部分伤害 */
  if(!isTrue && Number(aStats.splashPct) > 0 && target.side && battleState){
    const row = (target.side === 'enemy')
      ? (target.row === 'front' ? battleState.frontSlots : battleState.backSlots)
      : battleState.allies;
    const splash = Math.floor(originalDmg * Number(aStats.splashPct) / 100);
    if(splash > 0){
      row.filter(u => u && u !== target && u.hp > 0).forEach(u => {
        u.hp = Math.max(0, u.hp - splash);
        recordBattleDamage(attacker, splash);
        addBattleLog(`【${u.name}】受到 ${splash} 点溅射伤害。`);
        showBattleFloat(u.id, '-' + splash, 'phys');
      });
    }
  }

  /* 吸血 / 吸蓝 */
  if(Number(aStats.hpDrainPct) > 0 && attacker){
    const heal = Math.floor(originalDmg * aStats.hpDrainPct / 100);
    if(heal > 0){
      attacker.hp = Math.min(attacker.maxHp, attacker.hp + heal);
      addBattleLog(`【${attacker.name}】吸取 ${heal} 生命。`, 'heal');
    }
  }
  if(Number(aStats.mpDrainPct) > 0 && target.mp > 0 && attacker){
    const drain = Math.min(target.mp, aStats.mpDrainPct);
    target.mp -= drain;
    attacker.mp = Math.min(attacker.maxMp, (attacker.mp || 0) + drain);
  }

  /* 命中附加状态：装备词条按“每条独立实例”逐条结算 */
  if(target.hp > 0 && Array.isArray(aStats.onHitWords)){
    const dotMap = { poison_on_hit:'poison', burn_on_hit:'burn', bleed_on_hit:'bleed' };
    const chanceMap = { silence_on_hit:'silence', freeze_on_hit:'freeze', petrify_on_hit:'petrify', stun_on_hit:'stun' };
    aStats.onHitWords.forEach(w => {
      if(!target.hp || !w || !w.type) return;
      if(dotMap[w.type]){
        addStatus(target, {type:dotMap[w.type], value:w.value, duration:3, source:w.source});
      }else if(chanceMap[w.type]){
        if(Math.random() < (Number(w.value) || 0) / 100){
          addStatus(target, {type:chanceMap[w.type], value:1, duration:1, source:w.source});
        }
      }
    });
  }

  /* 命中附加状态（旧汇总来源：被动/技能） */
  if(target.hp > 0){
    if(Number(aStats.poisonOnHit) > 0) addStatus(target, {type:'poison', value:aStats.poisonOnHit, duration:3});
    if(Number(aStats.burnOnHit) > 0)   addStatus(target, {type:'burn', value:aStats.burnOnHit, duration:3});
    if(Number(aStats.bleedOnHit) > 0)  addStatus(target, {type:'bleed', value:aStats.bleedOnHit, duration:3});
    if(Number(aStats.silenceOnHit) > 0 && Math.random() < aStats.silenceOnHit / 100){
      addStatus(target, {type:'silence', value:1, duration:1});
    }
    if(Number(aStats.freezeOnHit) > 0 && Math.random() < aStats.freezeOnHit / 100){
      addStatus(target, {type:'freeze', value:1, duration:1});
    }
    if(Number(aStats.petrifyOnHit) > 0 && Math.random() < aStats.petrifyOnHit / 100){
      addStatus(target, {type:'petrify', value:1, duration:1});
    }
    if(Number(aStats.stunOnHit) > 0 && Math.random() < aStats.stunOnHit / 100){
      addStatus(target, {type:'stun', value:1, duration:1});
    }
  }
  if(target.hp <= 0 && aStats.lifestealOnKill > 0 && attacker){
    const heal = Math.floor(attacker.maxHp * aStats.lifestealOnKill / 100);
    attacker.hp = Math.min(attacker.maxHp, attacker.hp + heal);
    addBattleLog(`【${attacker.name}】击杀回复 ${heal} 生命。`, 'heal');
  }

  /* 反伤 */
  const reflectRate = (target.reflectArmorRate || 0) + (target.reflectAccRate || 0);
  if(reflectRate > 0 && attacker && attacker.hp > 0 && target.hp > 0){
    const reflectDmg = Math.floor(originalDmg * reflectRate);
    if(reflectDmg > 0){
      attacker.hp = Math.max(0, attacker.hp - reflectDmg);
      recordBattleDamage(target, reflectDmg);
      addBattleLog(`【${target.name}】反伤 ${reflectDmg} 给【${attacker.name}】`, 'status');
      showBattleFloat(attacker.id, '反伤 -' + reflectDmg, 'true');
      if(attacker.hp <= 0) addBattleLog(`【${attacker.name}】被反伤击倒`, 'dead');
    }
  }

  /* 反击 */
  if(target.counterCharges > 0 && target.hp > 0 && attacker && attacker.hp > 0){
    target.counterCharges--;
    const counterDmg = Math.floor((target.physAtk || target.derivedPhysAtk || 0) * 0.5);
    if(counterDmg > 0){
      attacker.hp = Math.max(0, attacker.hp - counterDmg);
      recordBattleDamage(target, counterDmg);
      addBattleLog(`【${target.name}】反击 ${counterDmg} 点伤害给【${attacker.name}】`, 'status');
      showBattleFloat(attacker.id, '反击 -' + counterDmg, 'phys');
      if(attacker.hp <= 0) addBattleLog(`【${attacker.name}】被反击击倒`, 'dead');
    }
  }
}

/* ============================================================
   战斗结束
   ============================================================ */

function checkBattleEnd(){
  if(!battleState) return false;
  const alliesAlive = battleState.allies.some(u => u.hp > 0);
  const enemiesAlive = [...battleState.frontSlots, ...battleState.backSlots].some(u => u && u.hp > 0);
  if(!alliesAlive){ finishBattle(false); return true; }
  if(!enemiesAlive){ finishBattle(true); return true; }
  return false;
}

function finishBattle(victory){
  battleState.over = true;
  battleState.victory = victory;
  const rounds = battleState.totalRounds || (battleState.round - 1);

  const battleResult = {
    victory: victory, money: 0, totalExp: 0, expPer: 0,
    rounds: rounds,
    durationMs: battleState.startTime ? (Date.now() - battleState.startTime) : 0,
    drops: [], playerLevelUp: null, npcLevelUps: [],
    damageTop3: []
  };

  if(victory){
    addBattleLog('【战斗胜利】', 'turn');
    showBattleTip('战斗胜利！');
    let totalExp = 0;
    let totalGold = 0;
    [...battleState.frontSlots, ...battleState.backSlots].forEach(e => {
      if(e && !e.escaped){
        totalExp += (e.lv || 1) * 10;
        totalGold += (e.lv || 1) * 5;
      }
    });
    /* P2：被动结算加成（金币 / 经验），加算后向下取整 */
    const settleBonus = (typeof getSettleBonus === 'function')
      ? getSettleBonus(currentGame) : { goldPct:0, expPct:0, dropPct:0 };
    if(settleBonus.goldPct > 0) totalGold = Math.floor(totalGold * (1 + settleBonus.goldPct / 100));
    if(settleBonus.expPct > 0)  totalExp  = Math.floor(totalExp  * (1 + settleBonus.expPct / 100));
    if(settleBonus.goldPct > 0) addBattleLog(`金币加成 +${settleBonus.goldPct}%（被动）`, 'status');
    if(settleBonus.expPct > 0)  addBattleLog(`经验加成 +${settleBonus.expPct}%（被动）`, 'status');
    currentGame.money += totalGold;
    addBattleLog(`获得金钱：￥${totalGold}`, 'status');

    /* 敌人掉落（装备 / 材料，统一走 rollCharacterDrops） */
    const dropCountMap = {};
    [...battleState.frontSlots, ...battleState.backSlots].forEach(e => {
      if(!e || e.escaped) return;
      const tpl = getCharacterTemplate(e.charId || e.name);
      if(!tpl) return;

      const rolled = rollCharacterDrops(e.charId || e.name, e.lv);
      rolled.forEach(d => {
        if(!d.itemId || d.count <= 0) return;
        const itemTpl = EQUIPS[d.itemId];
        if(!itemTpl) return;
        /* 单场战斗每种物品上限 BATTLE_DROP_CAP 个 */
        const already = dropCountMap[d.itemId] || 0;
        if(already >= BATTLE_DROP_CAP) return;
        let count = d.count;
        if(already + count > BATTLE_DROP_CAP) count = BATTLE_DROP_CAP - already;
        if(count <= 0) return;
        dropCountMap[d.itemId] = already + count;
        for(let i = 0; i < count; i++){
          addItemToBag(d.itemId, d.wear, d.durability);
        }
        addBattleLog(`【${tpl.name || e.name}】掉落了 ${itemTpl.name} ×${count}`, 'heal');
        const existing = battleResult.drops.find(x => x.id === d.itemId);
        if(existing) existing.count += count;
        else battleResult.drops.push({id: d.itemId, name: itemTpl.name, count: count});
      });
    });

    const partySize = countBattleParty();
    const expPer = Math.floor(totalExp / Math.max(1, partySize));
    addBattleLog(`获得经验：${totalExp}（每人 ${expPer}）`, 'status');
    battleResult.money = totalGold;
    battleResult.totalExp = totalExp;
    battleResult.expPer = expPer;

    const oldPlayerLv = currentGame.level;
    currentGame.exp += expPer;
    while(currentGame.exp >= currentGame.expMax){
      currentGame.exp -= currentGame.expMax;
      currentGame.level++;
      currentGame.expMax = calcExpMax(currentGame.level);
      applyGrowth(currentGame);
      addBattleLog(`【升级！】等级 Lv.${currentGame.level}`, 'status');
    }
    if(currentGame.level > oldPlayerLv){
      battleResult.playerLevelUp = {from: oldPlayerLv, to: currentGame.level};
    }

    const q = currentGame.queue;
    const activeNpcIds = [...q.front, ...q.back].filter(x => x && x !== 'player');
    const activePetIds = Object.values(currentGame.pets || {}).filter(Boolean);
    activePetIds.forEach(id => { if(!activeNpcIds.includes(id)) activeNpcIds.push(id); });
    activeNpcIds.forEach(npcId => {
      const npc = getNpc(npcId);
      if(!npc) return;
      if(npc.exp === undefined){ npc.exp = 0; npc.expMax = calcExpMax(npc.level || 1); }
      const oldLv = npc.level;
      const oldMaxHp = npc.maxHp;
      const oldMaxMp = npc.maxMp;
      npc.exp += expPer;
      while(npc.exp >= npc.expMax){
        npc.exp -= npc.expMax;
        npc.level++;
        npc.expMax = calcExpMax(npc.level);
        applyGrowth(npc);
      }
      if(npc.level > oldLv){
        battleResult.npcLevelUps.push({
          name: npc.name,
          from: oldLv,
          to: npc.level,
          hpGain: npc.maxHp - oldMaxHp,
          mpGain: npc.maxMp - oldMaxMp
        });
      }
    });
   }else{
    addBattleLog('【战斗失败】', 'turn');
    showBattleTip('战斗失败…');
    const isSpecial = !!battleState.specialGuardian;
    if(!isSpecial){
      battleState.allies.forEach(u => {
        if(u.npcId && !u.isPet){
          const npc = getNpc(u.npcId);
          if(npc){
            npc.affinity = Math.max(0, npc.affinity - 2);
            addBattleLog(`【${npc.name}】好感度 -2（当前${npc.affinity}）`, 'status');
            if(npc.affinity < 40){
              const q = currentGame.queue;
              ['front','back','rest'].forEach(r => {
                for(let i = 0; i < q[r].length; i++){
                  if(q[r][i] === u.npcId) q[r][i] = null;
                }
              });
              addBattleLog(`【${npc.name}】离开了队伍。`, 'dead');
            }
          }
        }
      });
      }
  }

  /* P0-19：本场输出 TOP3（胜败均计算） */
  if(battleState.damageStats){
    battleResult.damageTop3 = battleState.allies
      .map(u => battleState.damageStats[u.id])
      .filter(s => s && s.totalDmg > 0)
      .sort((a, b) => b.totalDmg - a.totalDmg)
      .slice(0, 3);
  }

    /* 装备磨损（8 个部位）：
       先回写战斗中的耐久变化，再按回合数扣磨损，避免回写把扣减覆盖掉 */
  const wearAlerts = [];
  if(rounds > 0 && !battleState.specialGuardian){
    battleState.allies.forEach(u => {
      if(u.npcId){
        const npc = getNpc(u.npcId);
        if(npc) writeBackArmor(u, npc);
      }else if(u.isPlayer){
        writeBackArmor(u, currentGame);
      }
    });
    const wearMessages = [];
    wearMessages.push(...applyWeaponWear(currentGame, rounds));
    battleState.allies.forEach(u => {
      if(!u.npcId) return;
      const npc = getNpc(u.npcId);
      if(npc) wearMessages.push(...applyWeaponWear(npc, rounds));
    });
    wearMessages.forEach(m => addBattleLog(m, 'dead'));

    /* ---- 收集战后磨损警告 ---- */
    /* 1. 战斗中被打碎的护甲（applyDamage 里已记录） */
    (battleState.wearBroken || []).forEach(w => wearAlerts.push(w));

    /* 2. 全队装备的临界 / 碎裂（武器磨损后低于 20% 会在这里被抓到） */
    const seenKeys = new Set();
    const scanEq = (owner, eq) => {
      if(!eq) return;
      EQUIP_SLOTS.forEach(slot => {
        if(!eq[slot]) return;
        const tpl = EQUIPS[eq[slot].id];
        if(!tpl) return;
        const st = getWearStatus(eq[slot], tpl);
        if(st.level !== 'broken' && st.level !== 'critical') return;
        const key = owner + '|' + slot + '|' + eq[slot].id;
        if(seenKeys.has(key)) return;
        seenKeys.add(key);
        wearAlerts.push({
          owner, slot, name: tpl.name,
          metric: tpl.type === 'weapon' ? 'wear' : 'durability',
          level: st.level, cur: st.cur, max: st.max
        });
      });
    };
    scanEq(currentGame.name, currentGame.equipment);
    battleState.allies.forEach(u => {
      if(u.npcId){
        const npc = getNpc(u.npcId);
        if(npc) scanEq(npc.name, npc.equipment);
      }
    });

    /* 3. 行囊里的临界 / 碎裂 */
    (currentGame.bag || []).forEach(it => {
      const tpl = EQUIPS[it.id];
      if(!tpl) return;
      const st = getWearStatus(it, tpl);
      if(st.level !== 'broken' && st.level !== 'critical') return;
      const key = 'bag|' + it.id + '|' + (it.wear || 0) + '|' + (it.durability || 0);
      if(seenKeys.has(key)) return;
      seenKeys.add(key);
      wearAlerts.push({
        owner: '行囊', slot: tpl.type, name: tpl.name,
        metric: tpl.type === 'weapon' ? 'wear' : 'durability',
        level: st.level, cur: st.cur, max: st.max
      });
    });
  }
  battleResult.wearAlerts = wearAlerts;

  renderBattleSkills();

  const doFinalize = () => {
    const battleTileId = battleState.tileId;   /* ✨ 先保存，避免 battleState = null 后丢失 */
    const p = battleState.allies[0];
    currentGame.hp = Math.max(1, p.hp);
    currentGame.mp = p.mp;
    battleState.allies.forEach(u => {
      if(u.isPet && u.npcId){
        const pet = getNpc(u.npcId);
        if(!pet) return;
        if(u.hp <= 0){
          pet.hp = 0;
          pet.dead = true;
          ['front','back'].forEach(slot => {
            if(currentGame.pets && currentGame.pets[slot] === u.npcId) currentGame.pets[slot] = null;
          });
        }else{
          pet.hp = Math.max(1, u.hp);
          pet.mp = u.mp;
          pet.dead = false;
        }
      }else if(u.npcId){
        const npc = getNpc(u.npcId);
        if(npc){ npc.hp = Math.max(1, u.hp); npc.mp = u.mp; }
      }
    });
    const battleName = battleState.name;
    closeBattleItemPanel();
    document.getElementById('battleScreen').classList.remove('show');
    battleState = null;
    currentTalkNpc = null;
    document.getElementById('storyBox').innerHTML = '';
    updateActionButtons();
    resyncNpcPositions();
    renderNpcRow();
    updateAllUI();
    if(typeof renderBag === 'function') renderBag();
    if(typeof renderQueue === 'function') renderQueue();
    saveGame(currentSlot);
    checkStoryTriggers({
      type: victory ? 'battle_win' : 'battle_lose',
      battleName: battleName,
      tileId: battleTileId
    });
    if(typeof _pendingBattleCallback === 'function'){
      const cb = _pendingBattleCallback;
      _pendingBattleCallback = null;
      try{ cb(); }catch(e){ console.error(e); }
    }
  };

  /* P0-19：无论胜败都弹结算面板，玩家点击关闭后才 finalize
     若战后有装备碎裂 / 磨损临界，先弹磨损警告，再执行收尾 */
  const finalizeBattle = () => {
    if(battleResult.wearAlerts && battleResult.wearAlerts.length > 0){
      showWearAlert(battleResult.wearAlerts, doFinalize);
    }else{
      doFinalize();
    }
  };

  showBattleResult(battleResult, finalizeBattle);
}

/* ============================================================
   战斗结算弹窗
   ============================================================ */

/* P0-19：战斗时长格式化 */
function formatBattleDuration(ms){
  const s = Math.max(0, Math.floor(ms / 1000));
  if(s < 60) return s + ' 秒';
  const m = Math.floor(s / 60);
  const rs = s % 60;
  return m + ' 分 ' + rs + ' 秒';
}

function showBattleResult(result, callback){
  _battleResultCallback = callback || null;
  const victory = !!result.victory;
  const titleEl = document.getElementById('battleResultTitle');
  titleEl.textContent = victory ? '战斗胜利' : '战斗失败';
  titleEl.style.color = victory ? '#ffcc66' : '#ff6688';
  titleEl.style.textShadow = victory
    ? '0 0 20px rgba(255,204,102,.5)'
    : '0 0 20px rgba(255,102,136,.5)';

  let html = '';


  /* ---- 战斗数据（胜败都显示）---- */
  if((result.rounds && result.rounds > 0) || (result.durationMs && result.durationMs > 0)){
    html += '<div class="br-section">';
    html += '<div class="br-section-title">📊 战斗数据</div>';
    html += `<div class="br-row"><span class="br-label">总回合数</span><span class="br-value">${result.rounds || 0}</span></div>`;
    html += `<div class="br-row"><span class="br-label">本场用时</span><span class="br-value">${formatBattleDuration(result.durationMs || 0)}</span></div>`;
    html += '</div>';
  }

  /* ---- 本场输出 TOP3（胜败都显示）---- */
  if(result.damageTop3 && result.damageTop3.length > 0){
    html += '<div class="br-section">';
    html += '<div class="br-section-title">⚔️ 本场输出 TOP3</div>';
    const medals = ['①', '②', '③'];
    result.damageTop3.forEach((u, i) => {
      html += `<div class="br-row"><span class="br-label">${medals[i] || '·'} ${u.name}</span><span class="br-value dmg">${u.totalDmg}</span></div>`;
    });
    html += '</div>';
  }

  if(victory){
    /* ---- 收益 ---- */
    html += '<div class="br-section">';
    html += '<div class="br-section-title">💰 收益</div>';
    html += `<div class="br-row"><span class="br-label">获得金钱</span><span class="br-value money">￥${result.money}</span></div>`;
    html += `<div class="br-row"><span class="br-label">获得经验</span><span class="br-value exp">${result.expPer} / 人</span></div>`;
    html += '</div>';

    /* ---- 掉落物品（按类别分组）---- */
    if(result.drops.length > 0){
      const groups = { equip: [], material: [], consumable: [], other: [] };
      result.drops.forEach(d => {
        const tpl = EQUIPS[d.id];
        if(!tpl){ groups.other.push(d); return; }
        if(tpl.type === 'material') groups.material.push(d);
        else if(tpl.type === 'consumable') groups.consumable.push(d);
        else if(tpl.type === 'weapon' || tpl.type === 'armor' || tpl.type === 'accessory') groups.equip.push(d);
        else groups.other.push(d);
      });
      const groupDefs = [
        { key:'equip',      icon:'⚔️', label:'装备' },
        { key:'material',   icon:'🌿', label:'材料' },
        { key:'consumable', icon:'💊', label:'药品' },
        { key:'other',      icon:'📦', label:'其他' }
      ];
      html += '<div class="br-section">';
      html += '<div class="br-section-title">📦 掉落物品</div>';
      groupDefs.forEach(g => {
        const list = groups[g.key];
        if(list.length === 0) return;
        html += `<div class="br-drop-group-label">${g.icon} ${g.label}</div>`;
        list.forEach(d => {
          html += `<div class="br-row"><span class="br-label">${d.name}</span><span class="br-value drop">×${d.count}</span></div>`;
        });
      });
      html += '</div>';
    }

    /* ---- 升级 ---- */
    if(result.playerLevelUp || (result.npcLevelUps && result.npcLevelUps.length > 0)){
      html += '<div class="br-section">';
      html += '<div class="br-section-title">⭐ 升级</div>';
      if(result.playerLevelUp){
        html += `<div class="br-levelup">${currentGame.name} Lv.${result.playerLevelUp.from} → Lv.${result.playerLevelUp.to}</div>`;
      }
      (result.npcLevelUps || []).forEach(u => {
        const gainStr = (u.hpGain !== undefined || u.mpGain !== undefined)
          ? ` （HP+${u.hpGain || 0}, MP+${u.mpGain || 0}）`
          : '';
        html += `<div class="br-levelup">${u.name} Lv.${u.from} → Lv.${u.to}${gainStr}</div>`;
      });
      html += '</div>';
    }
  }else{
    /* ---- 战败提示 ---- */
    html += '<div class="br-section">';
    html += '<div class="br-section-title">💀 战败</div>';
    html += '<div class="br-row"><span class="br-label">结果</span><span class="br-value" style="color:#ff8899">队伍被迫撤退</span></div>';
    html += '</div>';
  }

  const summaryHtml = html;
  const logHtml = getBattleLogHtml();
  document.getElementById('battleResultBody').innerHTML =
    '<div class="br-tabs">' +
      '<button class="br-tab active" data-br-tab="summary" onclick="switchBattleResultTab(\'summary\')">结算</button>' +
      '<button class="br-tab" data-br-tab="log" onclick="switchBattleResultTab(\'log\')">战斗记录</button>' +
    '</div>' +
    '<div id="brTabSummary">' + summaryHtml + '</div>' +
    '<div id="brTabLog" style="display:none"><div class="br-log">' + (logHtml || '<div class="br-empty">暂无战斗记录</div>') + '</div></div>';
  document.getElementById('battleResultModal').classList.add('show');
}

function getBattleLogHtml(){
  const el = document.getElementById('battleLog');
  return el ? el.innerHTML : '';
}

function switchBattleResultTab(tab){
  const isLog = tab === 'log';
  const summary = document.getElementById('brTabSummary');
  const log = document.getElementById('brTabLog');
  if(summary) summary.style.display = isLog ? 'none' : '';
  if(log) log.style.display = isLog ? '' : 'none';
  document.querySelectorAll('#battleResultBody .br-tab').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-br-tab') === tab);
  });
}

function closeBattleResult(){
  document.getElementById('battleResultModal').classList.remove('show');
  if(_battleResultCallback){
    const cb = _battleResultCallback;
    _battleResultCallback = null;
    cb();
  }
}

/* ============================================================
   装备磨损警告弹窗（B5）
   ------------------------------------------------------------
   alerts 格式：[{owner, slot, name, level, cur?, max?}]
     level：'broken'（碎裂） | 'critical'（磨损临界）
   关闭途径：点击"确定" / 点遮罩 / 按 ESC
   ============================================================ */
function showWearAlert(alerts, onClose){
  if(!alerts || alerts.length === 0){ if(onClose) onClose(); return; }
  if(document.getElementById('__wearAlertOverlay')){ if(onClose) onClose(); return; }

  const overlay = document.createElement('div');
  overlay.id = '__wearAlertOverlay';
  overlay.className = 'modal-overlay show';
  overlay.style.zIndex = '360';

  const broken = alerts.filter(a => a.level === 'broken');
  const critical = alerts.filter(a => a.level === 'critical');

  let html = '<div class="modal" style="max-width:460px">';
  html += '<span class="modal-close" id="wearAlertClose">×</span>';
  html += '<h3 style="text-align:center;color:#ffcc66">装备磨损警告</h3>';
  html += '<div style="max-height:50vh;overflow-y:auto;padding:4px 0">';

  if(broken.length > 0){
    html += '<div style="color:#ff4466;font-size:14px;margin:6px 0;font-weight:700;letter-spacing:1px">⚠ 已碎裂</div>';
    broken.forEach(a => {
      html += `<div style="color:#ff8899;font-size:13.5px;margin-bottom:5px;padding-left:10px">· ${a.owner} 的 ${a.name}</div>`;
    });
  }
  if(critical.length > 0){
    html += '<div style="color:#ffcc66;font-size:14px;margin:12px 0 6px;font-weight:700;letter-spacing:1px">⚠ 磨损临界</div>';
    critical.forEach(a => {
      const label = a.metric === 'wear' ? '磨损' : '耐久';
      const tail = (a.cur !== undefined && a.max !== undefined)
        ? `（${label} ${a.cur}/${a.max}）` : '';
      html += `<div style="color:#ffcc66;font-size:13.5px;margin-bottom:5px;padding-left:10px">· ${a.owner} 的 ${a.name}${tail}</div>`;
    });
  }

  html += '</div>';
  html += '<div style="color:#889;font-size:12.5px;margin-top:10px;line-height:1.6;text-align:center">建议尽快找铁匠修复。</div>';
  html += '<div class="modal-footer"><button class="btn-primary" id="wearAlertOkBtn">确定</button></div>';
  html += '</div>';

  overlay.innerHTML = html;
  document.body.appendChild(overlay);

  let closed = false;
  const close = () => {
    if(closed) return;
    closed = true;
    overlay.remove();
    if(onClose) onClose();
  };
  overlay.querySelector('#wearAlertOkBtn').onclick = close;
  overlay.querySelector('#wearAlertClose').onclick = close;
  overlay.addEventListener('click', e => { if(e.target === overlay) close(); });
}

/* ============================================================
   AI 目标选择（按 behavior 分支）
   ============================================================ */
function pickAiTarget(unit, isHeal, restrictRow){
  /* 友方目标：血最少的己方存活单位（治疗/增益/净化都走这里） */
  if(isHeal){
    const ownSide = unit.side === 'enemy'
      ? [...battleState.frontSlots, ...battleState.backSlots].filter(u => u && u.hp > 0 && u.hp < u.maxHp)
      : battleState.allies.filter(u => u.hp > 0 && u.hp < u.maxHp);
    if(ownSide.length === 0) return null;
    ownSide.sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
    return ownSide[0];
  }

  /* 攻击目标 */
  const enemySide = unit.side === 'enemy'
    ? battleState.allies
    : [...battleState.frontSlots, ...battleState.backSlots].filter(Boolean);
  const alive = enemySide.filter(u => u.hp > 0);
  if(alive.length === 0) return null;

  /* 嘲讽：目标阵营里有人带嘲讽时，强制打他 */
  const taunter = alive.find(u => (u.statuses || []).some(s => s.type === 'taunt'));
  if(taunter) return taunter;

  const behavior = unit.behavior || 'default';
  const front = alive.filter(u => u.row === 'front');
  const back  = alive.filter(u => u.row === 'back');
  /* 技能限定前排/后排时，先把可选池缩到对应行；该行全灭才放开。
     未明确限定行时，敌方 AI 的普通攻击 / 单体技能默认锁定前排，
     只有明确标注「敌方后排」的技能才允许绕过前排。 */
  if(!restrictRow && unit.side === 'enemy') restrictRow = 'front';
  let pool = alive;
  if(restrictRow === 'front') pool = front.length > 0 ? front : alive;
  else if(restrictRow === 'back') pool = back.length > 0 ? back : alive;

  switch(behavior){
    case 'ambush':{
      /* 伏击：在可选池内优先切后排 */
      const backPool = pool.filter(u => u.row === 'back');
      const use = backPool.length > 0 ? backPool : pool;
      return use[Math.floor(Math.random() * use.length)];
    }
    case 'aggressive':{
      /* 进攻：在可选池内优先收残血 */
      const sorted = [...pool].sort((a, b) => a.hp - b.hp);
      return sorted[0];
    }
    case 'guard':{
      /* 防守：在可选池内优先前排 */
      const frontPool = pool.filter(u => u.row === 'front');
      const use = frontPool.length > 0 ? frontPool : pool;
      return use[Math.floor(Math.random() * use.length)];
    }
    default:{
      /* 默认：在可选池内前排随机 */
      const frontPool = pool.filter(u => u.row === 'front');
      const use = frontPool.length > 0 ? frontPool : pool;
      return use[Math.floor(Math.random() * use.length)];
    }
  }
}

/* ============================================================
   AI
   ============================================================ */

function pickAiSupportTarget(unit){
  let t = pickAiTarget(unit, true);
  if(t) return t;
  const own = unit.side === 'enemy'
    ? [...battleState.frontSlots, ...battleState.backSlots].filter(u => u && u.hp > 0)
    : battleState.allies.filter(u => u && u.hp > 0);
  return own.length ? own[0] : unit;
}

function aiAct(unit){
  if(!battleState || battleState.over) return;
  /* 怯懦：血量 < 30% 时 30% 概率逃跑 */
  if(unit.behavior === 'coward' && unit.maxHp > 0 && (unit.hp / unit.maxHp) < 0.3){
    if(Math.random() < 0.3){
      addBattleLog(`【${unit.name}】吓得逃走了！`, 'status');
      showBattleFloat(unit.id, '逃跑', 'miss');
      unit.hp = 0;
      unit.escaped = true;
      renderBattle();
      if(checkBattleEnd()) return;
      battleState.queueIdx++;
      setTimeout(processNextTurn, 700);
      return;
    }
  }

  /* 沉默 / 冰冻：AI 也只能普攻 */
  if(unitSkillLocked(unit)){
    const target = pickAiTarget(unit, false);
    if(target){
      executeBasicAttack(unit, target);
      renderBattle();
      if(checkBattleEnd()) return;
    }
    battleState.queueIdx++;
    setTimeout(processNextTurn, 700);
    return;
  }

  const skillIds = (unit.skills || []).filter(id => {
    const sk = SKILLS[id];
    if(!sk) return false;
    const lv = getSkillLevel(unit, id);
    return skillHasEffects(sk, sk.levels[Math.max(0, lv - 1)] || sk.levels[0]);
  });
  if(skillIds.length === 0){
    /* 没有可用技能（白板状态）→ 用普通攻击，避免 AI 空过回合 */
    const target = pickAiTarget(unit, false);
    if(target){
      executeBasicAttack(unit, target);
      renderBattle();
      if(checkBattleEnd()) return;
    }
    battleState.queueIdx++;
    setTimeout(processNextTurn, 700);
    return;
  }
  const ai = unit.ai && unit.ai.length > 0 ? unit.ai : skillIds.map(id => ({skill:id, w:1}));
  const validAi = ai.filter(a => skillIds.includes(a.skill));
  if(validAi.length === 0){ battleState.queueIdx++; setTimeout(processNextTurn, 700); return; }
  const totalW = validAi.reduce((s, a) => s + a.w, 0);
  let r = Math.random() * totalW;
  let picked = validAi[0];
  for(const a of validAi){ r -= a.w; if(r <= 0){ picked = a; break; } }

  const sk = SKILLS[picked.skill];
  const skillLv = getSkillLevel(unit, picked.skill);
  const lvData = sk.levels[skillLv - 1] || sk.levels[0];
  if(unit.mp < lvData.mpCost){
    /* MP 不够，改用普通攻击 */
    const target = pickAiTarget(unit, false);
    if(target){
      executeBasicAttack(unit, target);
      renderBattle();
      if(checkBattleEnd()) return;
      battleState.queueIdx++;
      setTimeout(processNextTurn, 800);
      return;
    }
    battleState.queueIdx++;
    setTimeout(processNextTurn, 700);
    return;
  }

  const effects = lvData.effects || [];
  const plan = buildTargetPlan(effects);
  if(plan.needs.length){
    const picks = {};
    plan.needs.forEach(group => {
      if(group === 'enemy'){
        picks.enemy = pickAiTarget(unit, false, plan.enemyRow === 'both' ? null : plan.enemyRow);
      }else{
        picks.ally = pickAiSupportTarget(unit);
      }
    });
    executeSkill(unit, sk, null, false, picks);
    return;
  }
  executeSkill(unit, sk, null);
}

/* ============================================================
   战斗渲染
   ============================================================ */

function renderBattle(){
  if(!battleState) return;
  const p = battleState.allies[0];
  document.getElementById('btPlayerName').textContent = currentGame.name;
  document.getElementById('btPlayerLv').textContent = 'Lv.' + currentGame.level;
  document.getElementById('btPlayerMoney').textContent = '￥' + currentGame.money;
  document.getElementById('btClass1').textContent = currentGame.classes[0] || '—';
  document.getElementById('btClass2').textContent = currentGame.classes[1] || '—';
  document.getElementById('btHpText').textContent = `HP ${p.hp}/${p.maxHp}`;
  document.getElementById('btHpBar').style.width = (p.hp / p.maxHp * 100) + '%';
  document.getElementById('btMpText').textContent = `MP ${p.mp}/${p.maxMp}`;
  document.getElementById('btMpBar').style.width = (p.mp / p.maxMp * 100) + '%';
  document.getElementById('btRound').textContent = '第 ' + battleState.round + ' 回合';
  const cur = battleState.queue[battleState.queueIdx];
  document.getElementById('btTurnOwner').textContent = cur ? `${cur.name} 行动中` : '—';

  const liveQueue = battleState.queue.slice(battleState.queueIdx).filter(u => u.hp > 0);
  const getCls = (u) => {
    if(u.hp <= 0) return 'dead';
    const idx = liveQueue.findIndex(q => q.id === u.id);
    if(idx === 0) return 'acting';
    if(idx === 1) return 'next1';
    if(idx === 2) return 'next2';
    return '';
  };

  renderSlotRow('enemyBack', battleState.backSlots, getCls);
  renderSlotRow('enemyFront', battleState.frontSlots, getCls);
  const alliesFront = buildAllySlots('front', 4);
  const alliesBack = buildAllySlots('back', 3);
  renderFixedRow('allyFront', alliesFront, 4, getCls);
  renderFixedRow('allyBack', alliesBack, 3, getCls);
}

/* 按 slotIdx 把 allies 填充到固定长度的槽位数组里，空位为 null */
function buildAllySlots(row, count){
  const arr = new Array(count).fill(null);
  battleState.allies.forEach(u => {
    if(u.row === row && u.slotIdx >= 0 && u.slotIdx < count){
      arr[u.slotIdx] = u;
    }
  });
  return arr;
}

function unitHtml(u){
  const statuses = (u.statuses || []).slice(0, 6);
  const statusHtml = statuses.map(s => {
    const c = STATUS_COLORS[s.type];
    if(!c) return '';
    return `<span class="status-dot ${c.cls}">${c.label}</span>`;
  }).join('');
  const more = (u.statuses || []).length > 6 ? `<span style="font-size:11px;color:#888">+${u.statuses.length-6}</span>` : '';
  return `<div class="u-top"><span class="u-name">${u.name}</span><span class="u-lv">Lv${u.lv||1}</span><span class="u-spd">速${displaySpd(u)}</span></div>
    <div class="u-stat u-hp">HP ${Math.max(0, u.hp)}/${u.maxHp}</div>
    <div class="u-stat u-mp">MP ${u.mp||0}/${u.maxMp||0}</div>
    ${statusHtml ? `<div class="u-status">${statusHtml}${more}</div>` : ''}`;
}

function renderSlotRow(containerId, slots, getCls){
  const row = document.getElementById(containerId);
  row.innerHTML = '';
  for(let i = 0; i < 5; i++){
    const u = slots ? slots[i] : null;
    const slot = document.createElement('div');
       if(u){
      const cls = getCls(u);
      let sel = '';
      if(battlePendingItem && u.side === 'ally' && u.hp > 0) sel = ' targetable';
      else if(battleSelectedSkill && isSelectableTarget(u)) sel = ' targetable';
      slot.className = 'unit ' + cls + sel;
      slot.dataset.unitId = u.id;
      slot.innerHTML = unitHtml(u);
      slot.onclick = () => battleClickUnit(u.id);
    }else{
      slot.className = 'unit empty';
    }
    row.appendChild(slot);
  }
}

function renderFixedRow(containerId, units, count, getCls){
  const row = document.getElementById(containerId);
  row.innerHTML = '';
  for(let i = 0; i < count; i++){
    const u = units[i];
    const slot = document.createElement('div');
       if(u){
      const cls = getCls(u);
      let sel = '';
      if(battlePendingItem && u.side === 'ally' && u.hp > 0) sel = ' targetable';
      else if(battleSelectedSkill && isSelectableTarget(u)) sel = ' targetable';
      slot.className = 'unit ' + cls + sel + (u.isPet ? ' pet' : '');
      slot.dataset.unitId = u.id;
      slot.innerHTML = unitHtml(u);
      slot.onclick = () => battleClickUnit(u.id);
    }else{
      slot.className = 'unit empty';
    }
    row.appendChild(slot);
  }
}

function isSelectableTarget(u){
  if(u.hp <= 0) return false;
  if(battleTargetPick) return isValidPickTarget(u, battleTargetPick);
  if(!battleSelectedSkill) return false;
  if(battleSelectedSkill.isBasic){
    if(u.side !== 'enemy') return false;
    const frontAlive = battleState.frontSlots.some(x => x && x.hp > 0);
    if(frontAlive && u.row !== 'front') return false;
    return true;
  }
  const lv = getSkillLevel(battleState.allies[0], battleSelectedSkill.id);
  const lvData = battleSelectedSkill.levels[lv-1];
  const hasAlly = lvData.effects.some(e => e.target === 'ally_single');
  const hasEnemy = lvData.effects.some(e => ['single','enemy_front_single','enemy_back_single'].includes(e.target));
  if(hasAlly && !hasEnemy) return u.side === 'ally';
  if(hasEnemy && !hasAlly){
    if(u.side !== 'enemy') return false;
    const onlyFront = lvData.effects.some(e => e.target === 'enemy_front_single')
                   && !lvData.effects.some(e => e.target === 'enemy_back_single');
    const onlyBack = lvData.effects.some(e => e.target === 'enemy_back_single')
                  && !lvData.effects.some(e => e.target === 'enemy_front_single');
    if(onlyFront){
      const frontAlive = battleState.frontSlots.some(x => x && x.hp > 0);
      if(frontAlive && u.row !== 'front') return false;
    }
    if(onlyBack){
      const backAlive = battleState.backSlots.some(x => x && x.hp > 0);
      if(backAlive && u.row !== 'back') return false;
    }
    return true;
  }
  return true;
}

/* ============================================================
   日志 / 提示
   ============================================================ */

function addBattleLog(text, type){
  if(!battleState) return;
  battleState.log = battleState.log || [];
  battleState.log.push({ text:String(text), type:type || '', round:battleState.round || 0 });
  const el = document.getElementById('battleLog');
  const line = document.createElement('div');
  line.className = 'log-line' +
    (type === 'turn' ? ' log-turn' : '') +
    (type === 'dead' ? ' lg-dead' : '') +
    (type === 'heal' ? ' lg-heal' : '') +
    (type === 'status' ? ' lg-status' : '');

  /* P0-19：伤害 / 反伤 / 反击 / 溢出 / 护具 日志里的数字高亮 */
  if(/伤害|反伤|反击|溢出|护具/.test(text)){
    const escaped = String(text).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
    line.innerHTML = escaped.replace(/(\d+)/g, '<span class="lg-dmg-num">$1</span>');
  }else{
    line.textContent = text;
  }

  el.appendChild(line);
  el.scrollTop = el.scrollHeight;
  if(battleState.mini){
    const all = [...el.children];
    all.forEach((l, i) => { l.style.display = i >= all.length - 10 ? '' : 'none'; });
  }
}

function showBattleTip(msg){
  const el = document.getElementById('battleTip');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(battleTipTimer);
  battleTipTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

/* ---- 战斗飘字 / 震屏（P0-11）---- */
function findUnitElement(unitId){
  return document.querySelector('[data-unit-id="' + unitId + '"]');
}

function showBattleFloat(unitId, text, cls){
  const el = findUnitElement(unitId);
  if(!el) return;
  const rect = el.getBoundingClientRect();
  const stage = document.body.getBoundingClientRect();
  const sc = window.__gameScale || 1;
  const node = document.createElement('div');
  node.className = 'dmg-float ' + (cls || '');
  node.textContent = text;
  /* 飘字是 body（固定画布）的 fixed 子元素：视口坐标 → 画布逻辑坐标 */
  node.style.left = ((rect.left - stage.left) / sc + rect.width / (2 * sc)) + 'px';
  node.style.top  = ((rect.top - stage.top) / sc + 6) + 'px';
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 1100);
}

function shakeBattleScreen(){
  const el = document.querySelector('.battle-wrap');
  if(!el) return;
  el.classList.remove('battle-shake');
  void el.offsetWidth;
  el.classList.add('battle-shake');
  setTimeout(() => el.classList.remove('battle-shake'), 320);
}

/* ---- 战斗开场动画（P0-12）---- */
function playBattleIntro(done){
  if(!battleState) return;
  battleState.phase = 'intro';
  renderBattle();
  renderBattleSkills();

  const delay = BATTLE_INTRO.unitDelay;

  /* 我方：从左下飞入 */
  battleState.allies.forEach((u, i) => {
    const el = findUnitElement(u.id);
    if(!el) return;
    el.classList.add('intro-ally');
    el.style.animationDelay = (i * delay) + 'ms';
  });

  /* 敌方：从右上飞入 */
  let enemyIdx = 0;
  [...battleState.frontSlots, ...battleState.backSlots].forEach(u => {
    if(!u) return;
    const el = findUnitElement(u.id);
    if(!el) return;
    el.classList.add('intro-enemy');
    el.style.animationDelay = (enemyIdx * delay) + 'ms';
    enemyIdx++;
  });

  /* 中央横幅 */
  setTimeout(() => {
    if(!battleState) return;
    const banner = ensureBattleBanner();
    const isBoss = !!battleState.specialGuardian;
    banner.textContent = isBoss ? '决 战' : '战 斗 开 始';
    banner.className = 'battle-start-banner' + (isBoss ? ' boss' : '');
    void banner.offsetWidth;   /* 强制重排以重启动画 */
    banner.classList.add('show');
  }, BATTLE_INTRO.bannerDelay);

  /* 动画全部结束 → 进入回合流程 */
  const totalUnits = battleState.allies.length
    + battleState.frontSlots.filter(Boolean).length
    + battleState.backSlots.filter(Boolean).length;
  const totalDelay = Math.max(
    totalUnits * delay + 500,
    BATTLE_INTRO.bannerDelay + BATTLE_INTRO.bannerHold
  ) + BATTLE_INTRO.donePad;

  setTimeout(() => {
    if(!battleState) return;
    battleState.phase = 'init';
    if(done) done();
  }, totalDelay);
}

function ensureBattleBanner(){
  let banner = document.getElementById('battleStartBanner');
  if(!banner){
    banner = document.createElement('div');
    banner.id = 'battleStartBanner';
    banner.className = 'battle-start-banner';
    document.body.appendChild(banner);
  }
  return banner;
}

function toggleBattleLogMode(){
  if(!battleState) return;
  battleState.mini = !battleState.mini;
  const btn = document.getElementById('battleMiniBtn');
  btn.classList.toggle('active', battleState.mini);
  btn.textContent = battleState.mini ? '完整' : '精简';
  const el = document.getElementById('battleLog');
  const all = [...el.children];
  if(battleState.mini){
    all.forEach((l, i) => { l.style.display = i >= all.length - 10 ? '' : 'none'; });
  }else{
    all.forEach(l => { l.style.display = ''; });
  }
}

/* ============================================================
   战斗内使用道具
   ============================================================ */

function toggleBattleItemPanel(){
  if(!battleState || battleState.over) return;
  if(battleState.phase !== 'player_turn'){ showBattleTip('不是你的回合'); return; }
  if(battlePendingItem){
    battlePendingItem = null;
    renderBattle();
    return;
  }
  battleItemOpen = !battleItemOpen;
  renderBattleItemPanel();
}

function closeBattleItemPanel(){
  battleItemOpen = false;
  renderBattleItemPanel();
}
function renderBattleItemPanel(){
  const modal = document.getElementById('battleItemModal');
  const list = document.getElementById('battleItemList');
  if(!modal || !list) return;

  if(!battleItemOpen || !battleState || battleState.over){
    modal.classList.remove('show');
    list.innerHTML = '';
    return;
  }

  const bag = currentGame.bag || [];
  const items = bag.map((it, idx) => ({it, idx}))
    .filter(x => {
      const tpl = EQUIPS[x.it.id];
      return tpl && isUsableItem(tpl);
    });

  if(items.length === 0){
    list.innerHTML = '<div class="battle-item-empty">行囊里没有可用的药品或即时道具</div>';
  }else{
    list.innerHTML = items.map(({it, idx}) => {
      const tpl = EQUIPS[it.id];
      const parts = getItemEffects(tpl).map(e => {
        const label = (typeof EFFECT_DESC !== 'undefined' && EFFECT_DESC[e.type])
          ? EFFECT_DESC[e.type](e.value) : (e.type + ' ' + e.value);
        return `<span class="bi-hp">${label}</span>`;
      });
      return `<div class="battle-item-row" onclick="battleUseItem(${idx})">
        <div class="bi-name">${tpl.name}<span class="bi-count">×${it.count}</span></div>
        <div class="bi-effect">${parts.join(' ')}</div>
      </div>`;
    }).join('');
  }
  modal.classList.add('show');
}

function battleUseItem(bagIdx){
  if(!battleState || battleState.over) return;
  if(battleState.phase !== 'player_turn') return;
  const invItem = currentGame.bag[bagIdx];
  if(!invItem) return;
  const tpl = EQUIPS[invItem.id];
  if(!tpl || !isUsableItem(tpl)) return;
  if(getItemEffects(tpl).length === 0) return;

  const aliveAllies = battleState.allies.filter(u => u.hp > 0);
  if(aliveAllies.length <= 1){
    applyBattleItem(bagIdx, aliveAllies[0]);
    return;
  }
  battlePendingItem = { bagIdx, itemId: invItem.id };
  closeBattleItemPanel();
  renderBattle();
  showBattleTip('请选择使用目标');
}

function applyBattleItem(bagIdx, target){
  if(!battleState || battleState.over) return;
  if(!target || target.hp <= 0){
    showBattleTip('目标已无法行动');
    battlePendingItem = null;
    renderBattle();
    return;
  }
  const invItem = currentGame.bag[bagIdx];
  if(!invItem){ battlePendingItem = null; renderBattle(); return; }
  const tpl = EQUIPS[invItem.id];
  if(!tpl){ battlePendingItem = null; renderBattle(); return; }

  /* 恢复类交给 doConsume（它负责上限与“已经满了”判断），
     其余即时效果（防御、增益、清除负面等）直接走 applyEffect */
  const effects = getItemEffects(tpl);
  const healTypes = ['hp_heal','hp_heal_pct','mp_heal','mp_heal_pct'];
  const healEffects = effects.filter(e => healTypes.indexOf(e.type) >= 0);
  const otherEffects = effects.filter(e => healTypes.indexOf(e.type) < 0);
  const parts = [];
  let applied = false;

  if(healEffects.length){
    const result = doConsume(target, tpl);
    if(result.ok){ parts.push.apply(parts, result.parts); applied = true; }
  }
  otherEffects.forEach(e => {
    applyEffect(e, target, target, null);
    const label = (typeof EFFECT_DESC !== 'undefined' && EFFECT_DESC[e.type])
      ? EFFECT_DESC[e.type](e.value) : (e.type + ' ' + e.value);
    parts.push(label);
    applied = true;
  });

  if(!applied){
    showBattleTip('当前没有可生效的效果');
    battlePendingItem = null;
    renderBattle();
    return;
  }

  invItem.count--;
  if(invItem.count <= 0) currentGame.bag.splice(bagIdx, 1);

  addBattleLog(`【${target.name}】使用了 ${tpl.name}，${parts.join('，')}。`, 'heal');

  battlePendingItem = null;
  closeBattleItemPanel();
  renderBattle();
  battleSelectedSkill = null;
  battleTargetPick = null;
  battleState.phase = 'ai_turn';
  renderBattleSkills();
  battleState.queueIdx++;
  setTimeout(processNextTurn, BATTLE_DELAY.afterAction);
}
/* ============================================================
   逃跑 / 跳过
   ============================================================ */

function battleSkipTurn(){
  if(!battleState || battleState.over) return;
  if(battleState.phase !== 'player_turn') return;
  const player = battleState.allies[0];
  if(!player) return;
  addBattleLog(`【${player.name}】跳过本回合。`, 'status');
  battleSelectedSkill = null;
  battleTargetPick = null;
  battlePendingItem = null;
  battleState.phase = 'ai_turn';
  renderBattleSkills();
  battleState.queueIdx++;
  setTimeout(processNextTurn, BATTLE_DELAY.skip);
}

function tryFleeBattle(){
  if(!battleState || battleState.over) return;
  document.getElementById('confirmFleeModal').classList.add('show');
}
function closeFleeConfirm(){ document.getElementById('confirmFleeModal').classList.remove('show'); }
function confirmFlee(){ closeFleeConfirm(); doFlee(); }

function doFlee(){
  if(!battleState) return;
  const battleName = battleState.name;
  const battleTileId = battleState.tileId;
  const rounds = battleState.totalRounds || (battleState.round - 1);
  battleState.over = true;
  battleState.victory = false;
  battleState.allies.forEach(u => {
    if(u.npcId && !u.isPet){
      const npc = getNpc(u.npcId);
      if(npc){ npc.affinity = Math.max(0, npc.affinity - 2); }
    }
    if(u.isPet && u.npcId){
      const pet = getNpc(u.npcId);
      if(pet){
        if(u.hp <= 0){
          pet.hp = 0; pet.dead = true;
          ['front','back'].forEach(slot => {
            if(currentGame.pets && currentGame.pets[slot] === u.npcId) currentGame.pets[slot] = null;
          });
        }else{ pet.hp = Math.max(1, u.hp); pet.mp = u.mp; }
      }
    }
    if(rounds > 0){
      if(u.isPlayer){ applyWeaponWear(currentGame, rounds); }
      else if(u.npcId){ const _n = getNpc(u.npcId); if(_n) applyWeaponWear(_n, rounds); }
    }
  });
  const p = battleState.allies[0];
  currentGame.hp = Math.max(1, p.hp);
  currentGame.mp = p.mp;
  closeBattleItemPanel();
  document.getElementById('battleScreen').classList.remove('show');
  battleState = null;
  currentTalkNpc = null;
  document.getElementById('storyBox').innerHTML = '';
  updateActionButtons();
  renderNpcRow();
  updateAllUI();
  if(typeof renderBag === 'function') renderBag();
  if(typeof renderQueue === 'function') renderQueue();
  toast('已逃离战斗');
  appendStory('', '你成功逃离了战斗。', 'narration');
  saveGame(currentSlot);
  checkStoryTriggers({type:'battle_flee', battleName, tileId: battleTileId});
  if(typeof _pendingBattleCallback === 'function'){
    const cb = _pendingBattleCallback;
    _pendingBattleCallback = null;
    try{ cb(); }catch(e){ console.error(e); }
  }
}

/* ============================================================
   战斗内查看单位
   ============================================================ */

function battleViewUnit(unitId){
  if(!battleState) return;
  const unit = findUnitById(unitId);
  if(!unit) return;

  const eq = unit.equipment || {weapon:null, armor:null, accessory:null};
  const skills = (unit.skills || []).filter(id => SKILLS[id]);
  const uid = 'bt_' + unitId;

  const eqHtml = typeof buildEquipDropdown === 'function' ? buildEquipDropdown(eq, uid, !!unit.isPet) : '';
  const skHtml = typeof buildSkillDropdown === 'function' ? buildSkillDropdown(skills, unit, uid) : '';
  let classes, passiveOwner;
  if(unit.isPlayer){
    passiveOwner = currentGame;
    classes = currentGame.classes.filter(c => c);
  }else if(unit.npcId){
    const _npc = getNpc(unit.npcId);
    passiveOwner = _npc || unit;
    classes = (_npc && _npc.classes) ? _npc.classes.filter(c => c) : [];
  }else{
    passiveOwner = unit;
    classes = unit.classes || [];
  }
  const pvHtml = typeof buildPassiveDropdown === 'function' ? buildPassiveDropdown(passiveOwner, uid) : '';

  const isAlly = unit.side === 'ally';
  const factionText = isAlly ? '我方' : '敌方';
  const factionColor = isAlly ? '#66d9ff' : '#ff8899';
  const unitAttr = {
    vit: unit.vit || 0,
    spi: unit.spi || 0,
    physAtk: unit.physAtk || unit.derivedPhysAtk || 0,
    magicAtk: unit.magicAtk || unit.derivedMagicAtk || 0
  };

  document.getElementById('viewName').textContent = unit.name;
  document.getElementById('viewContent').innerHTML = `
    <div class="view-card"><div>
      <div class="view-stat"><label>阵营</label><span style="color:${factionColor};font-weight:700">${factionText}</span></div>
      <div class="view-stat"><label>等级</label><span>Lv.${unit.lv||1}</span></div>
      <div class="view-stat"><label>HP</label><span>${Math.max(0,unit.hp)}/${unit.maxHp}</span></div>
      <div class="view-stat"><label>MP</label><span>${unit.mp||0}/${unit.maxMp||0}</span></div>
      <div class="view-stat"><label>体力</label><span>${unitAttr.vit}</span></div>
      <div class="view-stat"><label>精神力</label><span>${unitAttr.spi}</span></div>
      <div class="view-stat"><label>物理攻击</label><span>${unitAttr.physAtk}</span></div>
      <div class="view-stat"><label>魔法攻击</label><span>${unitAttr.magicAtk}</span></div>
      <div class="view-stat"><label>防御</label><span>${unit.def||0}</span></div>
      <div class="view-stat"><label>速度</label><span>${displaySpd(unit)}（小=先手）</span></div>
      <div class="view-stat"><label>状态</label><span>${(unit.statuses||[]).length === 0 ? '无' : (unit.statuses||[]).map(s => statusLabel(s.type)).join('、')}</span></div>
    </div><div>
      <div class="view-section-title">装备槽</div>${eqHtml}
      <div class="view-section-title">技能槽</div>${skHtml}
      <div class="view-section-title">被动技能</div>${pvHtml}
    </div></div>
    <div class="modal-footer"><button class="btn-primary" onclick="closeViewModal()">关闭</button></div>`;
  document.getElementById('viewModal').classList.add('show');
}
