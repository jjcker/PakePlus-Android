/* ============================================================
   data-actors.js — 地图挂载 / 遭遇战角色实例的兼容层
   ------------------------------------------------------------
   旧数据仍然写 tile.npcs / enc.enemies / enc.pool；
   本文件把它们归一成 tile.actors / enc.actors / enc.actorPool。
   新编辑器优先写新字段，旧字段保留用于旧存档与旧工具。
   ============================================================ */

function actorCharId(a){
  if(!a) return null;
  if(typeof a === 'string') return a;
  return a.charId || a.id || a.name || null;
}

/* 技能商店条目统一成 { id, price? }：
   允许只写技能编号（价格从 SKILLS[id].price 读），也允许写 {id, price} 覆盖。 */
function normalizeSkillShopItem(x){
  if(typeof x === 'string') return { id: x };
  if(!x || typeof x !== 'object') return null;
  var out = { id: x.id || x.skillId || '' };
  if(x.price !== undefined && x.price !== null) out.price = Number(x.price) || 0;
  return out;
}
function normalizeSkillShopList(list){
  if(!Array.isArray(list)) return [];
  return list.map(normalizeSkillShopItem).filter(function(x){ return x && x.id; });
}
function defaultActorServices(tpl){
  var classes = tpl && Array.isArray(tpl.classes) ? tpl.classes : [];
  return {
    trainer: !!(tpl && tpl.isTrainer),
    trader: !!(tpl && tpl.isTrader) || classes.indexOf('商人') >= 0,
    repairer: !!(tpl && tpl.isRepairer) || classes.indexOf('铁匠') >= 0,
    shopItems: tpl && Array.isArray(tpl.shopItems) ? tpl.shopItems.slice() : [],
    professions: tpl && Array.isArray(tpl.professions) ? tpl.professions.map(function(p){ return Object.assign({}, p); }) : [],
    skillShop: normalizeSkillShopList(tpl && tpl.skillShop)
  };
}
function normalizeActorServices(src, tpl){
  var out = defaultActorServices(tpl);
  var s = (src && src.services && typeof src.services === 'object') ? src.services : null;
  if(!s) return out;
  if(s.trainer !== undefined) out.trainer = !!s.trainer;
  if(s.trader !== undefined) out.trader = !!s.trader;
  if(s.repairer !== undefined) out.repairer = !!s.repairer;
  if(Array.isArray(s.shopItems)) out.shopItems = s.shopItems.slice();
  if(Array.isArray(s.professions)) out.professions = s.professions.map(function(p){ return Object.assign({}, p); });
  if(Array.isArray(s.skillShop)) out.skillShop = normalizeSkillShopList(s.skillShop);
  return out;
}
function defaultRecruitMode(tpl){
  if(!tpl) return 'none';
  if(tpl.isPet) return 'pet';
  return tpl.canRecruit === false ? 'none' : 'companion';
}
function normalizeActor(a, fallbackLevel){
  const charId = actorCharId(a);
  if(!charId) return null;
  const tpl = getCharacterTemplate(charId);
  const src = (a && typeof a === 'object') ? a : {};
  const lv = Number(src.level);
  const mode = src.recruitMode || defaultRecruitMode(tpl);
  return {
    charId,
    placementId: src.placementId || null,
    level: isFinite(lv) && lv >= 1 ? Math.floor(lv) : (Number(fallbackLevel) || 1),
    row: src.row === 'back' ? 'back' : 'front',
    mode: src.mode || 'npc',
    /* 挂载实例字段：优先读 actor，旧模板字段只做兼容回退 */
    recruitMode: (mode === 'pet' || mode === 'companion' || mode === 'none') ? mode : 'none',
    respawn: src.respawn !== undefined
      ? !!src.respawn
      : !!(tpl && tpl.respawnAfterRecruit),
    unique: src.unique !== undefined
      ? !!src.unique
      : !(tpl && tpl.allowMultipleMount),
    allowMultipleCopies: src.allowMultipleCopies !== undefined
      ? !!src.allowMultipleCopies
      : !!(tpl && tpl.allowMultipleCopies),
    returnTile: src.returnTile || src.homeTile || (tpl && tpl.homeTile) || null,
    hidden: src.hidden !== undefined
      ? !!src.hidden
      : !!(tpl && tpl.isHidden),
    services: normalizeActorServices(src, tpl),
    condition: src.condition || null,
    /* 宠物收服后的定时刷新标记（累计小时数），到期由 refreshPetRespawns 清除 */
    removedAt: src.removedAt != null ? src.removedAt : null,
    /* 非唯一物种个体的出生年龄/出生时间（游戏累计小时） */
    spawnAge: src.spawnAge != null ? Number(src.spawnAge) : null,
    spawnedAt: src.spawnedAt != null ? Number(src.spawnedAt) : null
  };
}

/* 地图格解析：新 actors 优先，旧 npcs 兼容 */
function buildTileActors(tile){
  if(!tile) return [];
  if(Array.isArray(tile.actors) && tile.actors.length){
    return tile.actors.map((a, i) => {
      const n = normalizeActor(a, 1);
      if(n && !n.placementId) n.placementId = tile.id + '::' + n.charId + '::' + i;
      return n;
    }).filter(Boolean);
  }
  const legacy = Array.isArray(tile.npcs) ? tile.npcs : [];
  return legacy.map((id, i) => {
    const tpl = getCharacterTemplate(id);
    /* 地图出场等级优先用 mapLevel；suggestedLevel 只作遭遇战默认值/旧数据兜底。
       新格式 tile.actors[].level 仍然优先级最高（上面的分支已处理）。 */
    const sceneLevel = tpl && (Number(tpl.mapLevel) || Number(tpl.suggestedLevel) || 1);
    const a = normalizeActor({ charId:id, mode:'npc' }, sceneLevel || 1);
    if(a) a.placementId = tile.id + '::' + id + '::' + i;
    return a;
  }).filter(Boolean);
}

/* 遭遇战解析：新 actors / actorPool 优先，旧 enemies / pool 兼容。
   随机池的 weight 为刷新权重；旧数据没有权重时按 1 处理，
   因此旧版“同一角色重复多次”的池子仍然保持原来的相对概率。 */
function actorRefreshWeight(a){
  const raw = (a && typeof a === 'object') ? a.weight : a;
  const w = Number(raw);
  return isFinite(w) && w > 0 ? w : 1;
}
/* 唯一角色老死后不再进入遭遇战；非唯一物种不受某个个体死亡影响 */
function encounterActorAllowed(id){
  const tpl = getCharacterTemplate(id);
  if(!tpl || tpl.isUnique !== true) return true;
  return !(typeof isCharacterDeceased === 'function' && isCharacterDeceased(id));
}
function buildEncounterActors(enc){
  if(!enc) return { type:'special', actors:[] };
  if(enc.type === 'random'){
    if(Array.isArray(enc.actorPool) && enc.actorPool.length){
      return {
        type:'random',
        actors: enc.actorPool.map((a, i) => {
          if(!encounterActorAllowed(actorCharId(a))) return null;
          const tpl = getCharacterTemplate(actorCharId(a));
          const n = normalizeActor(a, tpl ? tpl.suggestedLevel : 1);
          if(n) n.weight = actorRefreshWeight(a);
          return n;
        }).filter(Boolean),
        min: Number(enc.min) || 1,
        max: Number(enc.max) || Number(enc.min) || 1
      };
    }
    const pool = Array.isArray(enc.pool) ? enc.pool : [];
    return {
      type:'random',
      actors: pool.map((id, i) => {
        if(!encounterActorAllowed(id)) return null;
        const tpl = getCharacterTemplate(id);
        const lv = Array.isArray(enc.poolLevels) ? enc.poolLevels[i] : null;
        const n = normalizeActor({ charId:id, level:lv }, tpl ? tpl.suggestedLevel : 1);
        if(n) n.weight = actorRefreshWeight(Array.isArray(enc.poolWeights) ? enc.poolWeights[i] : 1);
        return n;
      }).filter(Boolean),
      min: Number(enc.min) || 1,
      max: Number(enc.max) || Number(enc.min) || 1
    };
  }
  if(Array.isArray(enc.actors) && enc.actors.length){
    return {
      type:'special',
      actors: enc.actors.map(a => {
        if(!encounterActorAllowed(actorCharId(a))) return null;
        const tpl = getCharacterTemplate(actorCharId(a));
        return normalizeActor(a, tpl ? tpl.suggestedLevel : 1);
      }).filter(Boolean)
    };
  }
  const enemies = Array.isArray(enc.enemies) ? enc.enemies : [];
  return {
    type:'special',
    actors: enemies.map(e => {
      if(!encounterActorAllowed(actorCharId(e))) return null;
      const tpl = getCharacterTemplate(actorCharId(e));
      return normalizeActor(e, tpl ? tpl.suggestedLevel : 1);
    }).filter(Boolean)
  };
}

/* 启动时把旧数据补成新结构；不删除旧字段，保证旧存档/旧编辑器仍可用 */
function normalizeWorldActors(){
  if(typeof MAPS !== 'undefined'){
    for(const mid in MAPS){
      (MAPS[mid].tiles || []).forEach(tile => {
        if(!Array.isArray(tile.actors) || tile.actors.length === 0){
          const acts = buildTileActors(tile);
          if(acts.length) tile.actors = acts;
        }
      });
    }
  }
  if(typeof BATTLE_ENCOUNTERS !== 'undefined'){
    for(const eid in BATTLE_ENCOUNTERS){
      const enc = BATTLE_ENCOUNTERS[eid];
      const built = buildEncounterActors(enc);
      if(built.type === 'random'){
        if(!Array.isArray(enc.actorPool) || enc.actorPool.length === 0){
          if(built.actors.length) enc.actorPool = built.actors;
        }
      }else{
        if(!Array.isArray(enc.actors) || enc.actors.length === 0){
          if(built.actors.length) enc.actors = built.actors;
        }
      }
    }
  }
}

normalizeWorldActors();
