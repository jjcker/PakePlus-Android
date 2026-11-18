/* ============================================================
   data-loot.js — 统一掉落入口（权重池）
   ------------------------------------------------------------
   机制：
     · 每个角色卡只有一个 drops 列表，任何物品都能放进去
       （武器 / 防具 / 饰品 / 材料 / 药品 / 剧情道具……）
     · 每条：{itemId, weight, min, max, guaranteed}
         weight     权重，越大越容易被抽中；同一物品只写一行
         min / max  抽中后掉落数量区间
         guaranteed 必掉（不参与权重抽取，战斗胜利后直接掉）
     · 战斗胜利后按敌人等级抽若干次，每次按权重随机取 1 条
       （每次有 NPC_DROP_RULES.rollChance 的概率掉出，抽不中就空手）
   旧数据（equipPool / materialPool / itemPool）会自动折算成 drops：
     概率 15% → 权重 15，概率 100% → 必掉。
   ============================================================ */

const DROP_DEFAULT_WEIGHT = 10;

function dropWeightOf(entry){
  const w = Number(entry && entry.weight);
  return isFinite(w) && w > 0 ? w : 0;
}

/* 单条掉落标准化 */
function normalizeDropEntry(e){
  if(typeof e === 'string') return { itemId:e, weight:DROP_DEFAULT_WEIGHT, min:1, max:1 };
  if(!e || !e.itemId) return null;
  const min = Math.max(1, Math.floor(Number(e.min) || 1));
  const max = Math.max(min, Math.floor(Number(e.max) || min));
  const w = Number(e.weight);
  const out = {
    itemId: e.itemId,
    weight: isFinite(w) && w >= 0 ? w : DROP_DEFAULT_WEIGHT,
    min: min,
    max: max
  };
  if(e.guaranteed) out.guaranteed = true;
  return out;
}

/* 同一物品只保留一行：权重相加，数量取并集 */
function mergeDropEntries(list){
  const map = new Map();
  (Array.isArray(list) ? list : []).forEach(raw => {
    const e = normalizeDropEntry(raw);
    if(!e) return;
    const old = map.get(e.itemId);
    if(!old){ map.set(e.itemId, e); return; }
    old.weight += e.weight;
    old.min = Math.min(old.min, e.min);
    old.max = Math.max(old.max, e.max);
    if(e.guaranteed) old.guaranteed = true;
  });
  return Array.from(map.values());
}

/* 旧版三个掉落池 → drops */
function legacyDropEntries(obj){
  const out = [];
  ['equipPool', 'materialPool', 'itemPool'].forEach(key => {
    (Array.isArray(obj[key]) ? obj[key] : []).forEach(d => {
      if(typeof d === 'string'){ out.push({ itemId:d, weight:DROP_DEFAULT_WEIGHT, min:1, max:1 }); return; }
      if(!d || !d.itemId) return;
      const chance = Math.max(0, Math.min(1, Number(d.chance) || 0));
      out.push({
        itemId: d.itemId,
        weight: Math.max(1, Math.round(chance * 100)),
        min: d.min || 1,
        max: d.max || 1,
        guaranteed: chance >= 1
      });
    });
  });
  return out;
}

/* 读取/迁移角色卡的掉落池，返回归一化后的 drops */
function ensureDropModel(obj){
  if(!obj) return [];
  const source = Array.isArray(obj.drops) ? obj.drops : legacyDropEntries(obj);
  obj.drops = mergeDropEntries(source);
  ['equipPool', 'materialPool', 'itemPool'].forEach(k => { if(k in obj) delete obj[k]; });
  return obj.drops;
}

/* 启动时把所有角色卡归一到 drops */
function applyDropModelToAll(){
  if(typeof CHARACTERS === 'undefined') return;
  for(const id in CHARACTERS) ensureDropModel(CHARACTERS[id]);
  if(typeof ENVIRONMENTS !== 'undefined'){
    for(const id in ENVIRONMENTS) ensureDropModel(ENVIRONMENTS[id]);
  }
}

/* 战斗胜利后按等级抽取几次 */
function dropRollsForLevel(level){
  const lv = Math.max(1, Number(level) || 1);
  const tiers = (typeof NPC_DROP_RULES !== 'undefined' && NPC_DROP_RULES.rolls) || null;
  if(!tiers || !tiers.length) return 1;
  for(let i = 0; i < tiers.length; i++){
    if(lv <= tiers[i].maxLv) return Math.max(0, Math.floor(tiers[i].rolls));
  }
  return Math.max(0, Math.floor(tiers[tiers.length - 1].rolls));
}

/* 每次抽取真正掉出物品的概率
   bonusPct：被动的"掉落率 +%"，直接乘在该概率上（封顶 100%） */
function dropRollChance(bonusPct){
  const rules = (typeof NPC_DROP_RULES !== 'undefined') ? NPC_DROP_RULES : null;
  let c = (!rules || rules.rollChance === undefined) ? 1 : Number(rules.rollChance);
  if(!isFinite(c)) c = 1;
  c = Math.max(0, Math.min(1, c));
  const bonus = Math.max(0, Number(bonusPct) || 0);
  return Math.max(0, Math.min(1, c * (1 + bonus / 100)));
}

/* 当前玩家的掉落率加成（战斗外/编辑器里无 currentGame 时返回 0） */
function playerDropBonusPct(){
  if(typeof getSettleBonus !== 'function') return 0;
  if(typeof currentGame === 'undefined' || !currentGame) return 0;
  return getSettleBonus(currentGame).dropPct || 0;
}

function pickWeightedDrop(list){  let total = 0;
  list.forEach(e => { total += dropWeightOf(e); });
  if(total <= 0) return null;
  let r = Math.random() * total;
  for(let i = 0; i < list.length; i++){
    r -= dropWeightOf(list[i]);
    if(r < 0) return list[i];
  }
  return list[list.length - 1];
}

function pushDropResult(out, entry){
  const min = Math.max(1, Number(entry.min) || 1);
  const max = Math.max(min, Number(entry.max) || min);
  const count = min + Math.floor(Math.random() * (max - min + 1));
  if(count > 0) out.push({ itemId:entry.itemId, count, source:'drop', weight:dropWeightOf(entry) });
}

function rollCharacterDrops(charId, levelOverride){
  const tpl = getCharacterTemplate(charId);
  if(!tpl) return [];
  const list = ensureDropModel(tpl).filter(e => {
    const it = (typeof EQUIPS !== 'undefined') ? EQUIPS[e.itemId] : null;
    if(!it) return false;
    /* P2：与商店/合成/剧情共用同一套"未设计物品"判断 */
    return (typeof isItemAvailable === 'function')
      ? isItemAvailable(it)
      : !(typeof isItemDraft === 'function' && isItemDraft(it));
  });
  if(!list.length) return [];

  const lv = Math.max(1, Number(levelOverride) || Number(tpl.suggestedLevel) || 1);
  const drops = [];
  const weighted = [];
  list.forEach(e => {
    if(e.guaranteed) pushDropResult(drops, e);
    else if(dropWeightOf(e) > 0) weighted.push(e);
  });

  const rolls = dropRollsForLevel(lv);
  const rollChance = dropRollChance(playerDropBonusPct());
  for(let i = 0; i < rolls && weighted.length; i++){
    if(Math.random() >= rollChance) continue;
    const picked = pickWeightedDrop(weighted);
    if(picked) pushDropResult(drops, picked);
  }
  return drops;
}

/* 兼容旧调用名 */
function rollEnemyDrops(charId){ return rollCharacterDrops(charId); }

/* 调试用：列出某个敌人的完整掉落池（不含随机） */
function inspectCharacterDrops(charId){
  const tpl = getCharacterTemplate(charId);
  if(!tpl) return null;
  const list = ensureDropModel(tpl);
  let totalWeight = 0;
  list.forEach(e => { if(!e.guaranteed) totalWeight += dropWeightOf(e); });
  return {
    charId: tpl.id,
    name: tpl.name,
    category: tpl.enemyCategory || '',
    level: tpl.suggestedLevel || tpl.level || 1,
    rolls: dropRollsForLevel(tpl.suggestedLevel || tpl.level || 1),
    rollChance: dropRollChance(playerDropBonusPct()),
    dropBonusPct: playerDropBonusPct(),
    totalWeight: totalWeight,
    drops: list.map(e => ({
      itemId: e.itemId,
      itemName: (EQUIPS[e.itemId] || {}).name || e.itemId,
      weight: dropWeightOf(e),
      min: e.min,
      max: e.max,
      guaranteed: !!e.guaranteed,
      /* false = 未设计，实际战斗不会掉出 */
      available: (typeof isItemAvailable === 'function') ? isItemAvailable(EQUIPS[e.itemId]) : true
    }))
  };
}

applyDropModelToAll();
