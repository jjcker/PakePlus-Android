/* ============================================================
   core.js — 全局状态 / 存档 / UI / 地图 / 队伍
   ============================================================ */

/* 属性公式、职业模板、敌人模板统一在 data-attributes.js（本文件之前加载） */

/* ---- 全局状态 ---- */
let currentGame = null;
let currentSlot = -1;
let currentMapLayer = 'street';
let currentMapId = 'region01-town01';
let currentTileId = 'region01-town01-12';
let currentTalkNpc = null;
let currentTalkPlacementId = null;
let currentTalkLevel = 1;
let nextSpeaker = 'npc';
let talkCount = 0;
let pendingAcceptAction = null;
let selectedGender = '男';
let debugUnlocked = false;
let mapView = {x:0, y:0, scale:1};
let mapPitch = MAP_CELL_SIZE;   /* 当前地图层实际使用的格距（按最长节点名动态计算） */
let queueMode = false;
let selectedQueueChar = null;
let selectedBagChar = 'player';
let battleCheckedTileId = null;
let toastTimer = null;
let _confirmCallback = null;
let _currentPair = null;
let _lastTileId = null;

/* ============================================================
   NPC 访问
   ============================================================ */

function getNpc(id){
  if(!id) return null;
  if(currentGame && currentGame.characters && currentGame.characters[id]) return currentGame.characters[id];
  if(currentGame && currentGame.npcs && currentGame.npcs[id]) return currentGame.npcs[id];
  return getCharacterTemplate(id);
}

function getCharObj(id){
  if(id === 'player') return currentGame;
  return getNpc(id);
}

function getChar(id){
  if(id === 'player'){
    return {
      id:'player', name:currentGame.name, gender:currentGame.gender,
      race:currentGame.race || '人族',
      classes:currentGame.classes,
      classStr:currentGame.classes.filter(c=>c).join('·') || '无',
      level:currentGame.level, hp:currentGame.hp, maxHp:currentGame.maxHp,
      mp:currentGame.mp, maxMp:currentGame.maxMp,
      vit:currentGame.vit, spi:currentGame.spi,
      physAtk:currentGame.physAtk, magicAtk:currentGame.magicAtk,
      def:currentGame.def, spd:currentGame.spd,
      affinity:null, desc:'你，一个穿越者。'
    };
  }
  return getNpc(id);
}

function getCharClasses(charObj){
  if(charObj === currentGame) return currentGame.classes.filter(c=>c);
  if(charObj && charObj.classes) return charObj.classes.filter(c=>c);
  return [];
}

/* ---- 职业标签 ----
   九大职业是固定标签；隐藏职业可以挂若干个基础职业标签，算“进阶”。
   CLASS_TAGS 由职业编辑器导出，例如：
     CLASS_TAGS['影武者'] = ['战士','杀手']
   没有配置时，职业本身就是它的唯一标签。 */
function getClassTags(name){
  if(!name) return [];
  const t = (typeof CLASS_TAGS !== 'undefined' && CLASS_TAGS) ? CLASS_TAGS[name] : null;
  return (Array.isArray(t) && t.length) ? t.slice() : [name];
}
function getCharClassTags(charObj){
  const out = [];
  getCharClasses(charObj).forEach(c => {
    if(out.indexOf(c) < 0) out.push(c);              /* 职业名本身也算标签 */
    getClassTags(c).forEach(t => { if(t && out.indexOf(t) < 0) out.push(t); });
  });
  return out;
}
/* 装备/技能的职业限制：命中任意一个标签即可 */
function charHasAnyClassTag(charObj, list){
  if(!Array.isArray(list) || !list.length) return true;
  const tags = getCharClassTags(charObj);
  return list.some(t => tags.indexOf(t) >= 0);
}

/* 角色中"运行时会变"的字段，只有这些需要存进存档 */
const NPC_DYNAMIC_FIELDS = [
  'templateId', 'instanceId',
  'name', 'gender', 'race', 'faction', 'factionTags',
  'affinity',
  'level', 'exp', 'expMax',
  'hp', 'maxHp', 'mp', 'maxMp', 'spd', 'def',
  'base', 'growth',
  'classes',
  'equipment', 'equippedSkills', 'skillProficiency',
  'personalPassives',
  'homeTile', 'canRecruit', 'canBattle', 'isPet', 'dead',
  'respawnAfterRecruit', 'allowMultipleMount', 'allowMultipleCopies',
  /* 年龄死亡 / 物种个体年龄 */
  'deceased', 'deceasedAge', 'deceasedAt', 'spawnAge', 'spawnedAt'
];

/* 补齐存档中的 NPC（旧存档兼容 + 新增 NPC 补齐） */
/* 统一角色持久状态：NPC 默认全部建档；敌人只有被招募/被剧情写状态时才建档。
   旧存档的 game.npcs 会自动迁移为 game.characters。 */
function ensureCharacters(game){
  const raw = (game && (game.characters || game.npcs)) || {};
  const restored = {};

  /* 先恢复已有状态（含 npc299#1 这类多副本实例） */
  for(const key in raw){
    const saved = raw[key];
    if(!saved || typeof saved !== 'object') continue;
    const templateId = saved.templateId || String(key).split('#')[0];
    const tpl = CHARACTERS[templateId];
    if(!tpl) continue;
    const fresh = dcClone(tpl);
    Object.assign(fresh, saved);
    fresh.id = saved.id || key;
    fresh.templateId = templateId;
    fresh.instanceId = saved.instanceId || fresh.id;
    normalizeCharAttributeModel(fresh);
    fresh.equipment = migrateEquipment(fresh.equipment);
    recalcCharStats(fresh);
    restored[fresh.id] = fresh;
  }

  /* 所有角色统一默认建档（好感、送礼、装备、等级都需要持久化），不再按来源区分 */
  for(const id in CHARACTERS){
    if(restored[id]) continue;
    const tpl = CHARACTERS[id];
    const fresh = dcClone(tpl);
    fresh.templateId = id;
    fresh.instanceId = id;
    normalizeCharAttributeModel(fresh);
    fresh.equipment = migrateEquipment(fresh.equipment);
    recalcCharStats(fresh);
    restored[id] = fresh;
  }

  if(game){
    game.characters = restored;
    game.npcs = restored;   /* 旧 UI / 调试代码兼容别名 */
    if(!game.pets || typeof game.pets !== 'object') game.pets = { front:null, back:null };
    if(!Array.isArray(game.petBag)) game.petBag = [];
    /* 清掉已不存在的宠物引用 */
    ['front','back'].forEach(slot => {
      if(game.pets[slot] && !restored[game.pets[slot]]) game.pets[slot] = null;
    });
    game.petBag = game.petBag.filter(id => id && restored[id]);
  }
  return restored;
}
/* 兼容旧调用 */
function ensureNpcs(game){ return ensureCharacters(game); }

/* 按需为地图上的敌人/宠物创建持久状态（送礼、好感、查看时用） */
function ensureCharacterState(id, level){
  if(!currentGame) return null;
  if(!currentGame.characters) currentGame.characters = currentGame.npcs || {};
  if(currentGame.characters[id]){
    const st = currentGame.characters[id];
    const lv = Math.max(1, Number(level) || 0);
    if(lv && !isNpcRecruited(id) && st.level !== lv){
      st.level = lv;
      st.exp = 0;
      st.expMax = calcExpMax(lv);
      applyDerivedAttrStats(st);
      st.hp = st.maxHp;
      st.mp = st.maxMp;
    }
    return st;
  }
  const tpl = getCharacterTemplate(id);
  if(!tpl || tpl.isEnv) return null;
  const s = dcClone(tpl);
  s.id = id;
  s.templateId = id;
  s.instanceId = id;
  s.level = Math.max(1, Number(level) || 1);
  s.exp = 0;
  s.expMax = calcExpMax(s.level);
  applyDerivedAttrStats(s);
  s.hp = s.maxHp;
  s.mp = s.maxMp;
  currentGame.characters[id] = s;
  currentGame.npcs = currentGame.characters;
  return s;
}

/* ============================================================
   队伍
   ============================================================ */

function isNpcRecruited(npcId){
  if(!currentGame || !currentGame.queue) return false;
  const target = String(npcId || '');
  const q = currentGame.queue;
  for(const row of ['front','back','rest']){
    for(const id of q[row]){
      if(!id) continue;
      if(id === target) return true;
    }
  }
  /* 传模板 id 时，任何同模板实例都算“该角色已在队中”；
     传 npc299#2 这类实例 id 时只做精确匹配，避免复制循环永远为真。 */
  if(target.indexOf('#') >= 0) return false;
  for(const row of ['front','back','rest']){
    for(const id of q[row]){
      if(!id) continue;
      if(String(id).split('#')[0] === target) return true;
    }
  }
  return false;
}
function getRecruitedInstanceId(id){
  if(!currentGame || !currentGame.queue) return null;
  const base = String(id || '').split('#')[0];
  const q = currentGame.queue;
  for(const row of ['front','back','rest']){
    for(const cid of q[row]){
      if(!cid) continue;
      if(cid === id) return cid;
      if(String(cid).split('#')[0] === base) return cid;
    }
  }
  return null;
}
/* 是否还能再招募一个副本（可复数角色） */
function canRecruitAnother(char){
  if(!char) return false;
  if(!isRecruitableCharacter(char)) return false;
  if(!isNpcRecruited(char.id)) return true;
  /* 非唯一物种允许出现多个独立个体；唯一角色只有 allowMultipleCopies 才可重复 */
  return !!char.allowMultipleCopies || !isCharacterUnique(char);
}

/* ============================================================
   宠物
   ------------------------------------------------------------
   出战宠物：pets.front / pets.back 各 1 个实例
   未出战宠物：petBag，最多 9 个
   宠物与“可招募”互斥，isPet 的角色不会进队友队列。
   ============================================================ */
function isAdoptablePet(char){
  return !!char && !!char.isPet && !char.deceased && !isDemonOrCult(char);
}
function isPetActive(id){
  if(!currentGame || !currentGame.pets) return false;
  return currentGame.pets.front === id || currentGame.pets.back === id;
}
function isPetOwned(id){
  if(isPetActive(id)) return true;
  return !!(currentGame && currentGame.petBag && currentGame.petBag.includes(id));
}
function petSlotOf(id){
  if(!currentGame || !currentGame.pets) return null;
  if(currentGame.pets.front === id) return 'front';
  if(currentGame.pets.back === id) return 'back';
  return null;
}
function countPetBag(){ return (currentGame && currentGame.petBag) ? currentGame.petBag.length : 0; }
function findPetInstanceId(templateId){
  if(!currentGame) return null;
  const base = String(templateId || '').split('#')[0];
  const ids = [currentGame.pets && currentGame.pets.front, currentGame.pets && currentGame.pets.back].concat(currentGame.petBag || []);
  for(const id of ids){
    if(id && String(id).split('#')[0] === base) return id;
  }
  return null;
}
function canAdoptPet(char){
  if(!isAdoptablePet(char)) return false;
  if(!currentGame.pets) currentGame.pets = {front:null, back:null};
  if(!Array.isArray(currentGame.petBag)) currentGame.petBag = [];
  if(!char.allowMultipleCopies && (isPetActive(char.id) || currentGame.petBag.includes(char.id))) return false;
  const activeFree = !currentGame.pets.front || !currentGame.pets.back;
  return activeFree || countPetBag() < 9;
}
function firstFreePetSlot(){
  if(!currentGame.pets) currentGame.pets = {front:null, back:null};
  if(!currentGame.pets.front) return 'front';
  if(!currentGame.pets.back) return 'back';
  return null;
}
function deployPet(id, slot){
  if(!currentGame.pets) currentGame.pets = {front:null, back:null};
  if(!Array.isArray(currentGame.petBag)) currentGame.petBag = [];
  if(!currentGame.petBag.includes(id)) return false;
  const npcCheck = getNpc(id);
  if(npcCheck && npcCheck.deceased){ toast('这只宠物已经离世。'); return false; }
  slot = slot === 'back' ? 'back' : 'front';
  const old = currentGame.pets[slot];
  if(old){
    if(currentGame.petBag.length >= 9){ toast('宠物行囊已满（9/9）'); return false; }
    currentGame.petBag.push(old);
  }
  currentGame.petBag = currentGame.petBag.filter(x => x !== id);
  const npc = getNpc(id);
  if(npc) npc.dead = false;
  currentGame.pets[slot] = id;
  saveGame();
  renderBag();
  if(typeof renderQueue === 'function') renderQueue();
  updateAllUI();
  return true;
}
function withdrawPet(slot){
  if(!currentGame.pets) currentGame.pets = {front:null, back:null};
  if(!Array.isArray(currentGame.petBag)) currentGame.petBag = [];
  slot = slot === 'back' ? 'back' : 'front';
  const id = currentGame.pets[slot];
  if(!id) return false;
  if(currentGame.petBag.length >= 9){ toast('宠物行囊已满（9/9）'); return false; }
  currentGame.pets[slot] = null;
  currentGame.petBag.push(id);
  saveGame();
  renderBag();
  if(typeof renderQueue === 'function') renderQueue();
  updateAllUI();
  return true;
}

function countParty(){
  const q = currentGame.queue;
  let c = 0;
  ['front','back','rest'].forEach(r => q[r].forEach(x => { if(x) c++; }));
  return c;
}

function countBattleParty(){
  const q = currentGame.queue;
  let c = 0;
  ['front','back'].forEach(r => q[r].forEach(x => { if(x) c++; }));
  return c;
}

/* 全队（含休息区）是否满 HP / MP */
function isPartyFull(){
  if(!currentGame) return true;
  if(currentGame.hp < getFinalMaxHp(currentGame)) return false;
  if(currentGame.mp < getFinalMaxMp(currentGame)) return false;
  const q = currentGame.queue;
  for(const row of ['front','back','rest']){
    for(const id of q[row]){
      if(!id || id === 'player') continue;
      const n = getNpc(id);
      if(!n) continue;
      if(n.hp < n.maxHp || n.mp < n.maxMp) return false;
    }
  }
  return true;
}

/* ============================================================
   成长 / 属性计算
   ============================================================ */

function applyGrowth(charObj){
  if(!charObj) return;
  const stats = applyDerivedAttrStats(charObj);
  if(!stats) return;

  if(charObj.hp === undefined || charObj.hp > charObj.maxHp) charObj.hp = charObj.maxHp;
  if(charObj.mp === undefined || charObj.mp > charObj.maxMp) charObj.mp = charObj.maxMp;
  if(charObj.hp < 0) charObj.hp = 0;
  if(charObj.mp < 0) charObj.mp = 0;
}

/* 按当前 maxHp / maxMp 的比例重算成长属性（幂等：重复调用结果一致）
   用于：读档时统一升级属性公式、ensureNpcs 补全新 NPC */
function recalcCharStats(charObj){
  if(!charObj) return;
  const oldMaxHp = charObj.maxHp || 1;
  const oldMaxMp = charObj.maxMp || 1;
  const hpRatio = oldMaxHp > 0 ? (charObj.hp || 0) / oldMaxHp : 1;
  const mpRatio = oldMaxMp > 0 ? (charObj.mp || 0) / oldMaxMp : 1;
  applyGrowth(charObj);
  charObj.hp = Math.max(1, Math.min(charObj.maxHp, Math.floor(charObj.maxHp * hpRatio)));
  charObj.mp = Math.max(0, Math.min(charObj.maxMp, Math.floor(charObj.maxMp * mpRatio)));
}

/* ============================================================
   装备槽结构 / 旧存档迁移
   ============================================================ */

/* 全新 8 槽空结构 */
function makeEmptyEquipment(){
  const e = {};
  EQUIP_SLOTS.forEach(s => e[s] = null);
  return e;
}

/* 把任意版本的 equipment 迁移为标准 8 槽（幂等，不丢数据）
   - 已是 8 槽：补齐缺失槽
   - 旧三槽：weapon→mainHand、armor→chest、accessory 按 slot→accessory/charm
   双手武器迁移后副手保持空 */
function migrateEquipment(eq){
  const out = makeEmptyEquipment();
  if(eq && typeof eq === 'object'){
    if('mainHand' in eq || 'chest' in eq || 'head' in eq){
      EQUIP_SLOTS.forEach(s => { if(eq[s]) out[s] = eq[s]; });
    }else{
      if(eq.weapon){
        out.mainHand = eq.weapon;
        const wt = EQUIPS[eq.weapon.id];
        if(wt && wt.twoHanded) out.offHand = null;
      }
      if(eq.armor) out.chest = eq.armor;
      if(eq.accessory){
        const at = EQUIPS[eq.accessory.id];
        if(at && at.slot === 'charm') out.charm = eq.accessory;
        else out.accessory = eq.accessory;
      }
    }
  }
  return out;
}

/* ============================================================
   装备实例（品阶 / 词条）
   ------------------------------------------------------------
   模板：rarity = 出厂品阶，words = 固有词条（长度 = 出厂槽数）
   实例：rarity = 当前品阶（可被合成表进阶抬高）
         words  = 实际词条（固有词条 + 进阶时由材料加入的词条）
   没有强化等级；进阶只在合成表里进行。
   ============================================================ */
function raritySlotCount(rarity){
  const info = ITEM_RARITY[rarity];
  return info ? info.words : 0;
}
function getItemRarityOf(item, tpl){
  const t = tpl || (item && EQUIPS[item.id]);
  const r = (item && item.rarity) || (t && t.rarity);
  return ITEM_RARITY[r] ? r : null;
}
function getItemWords(item, tpl){
  const t = tpl || (item && EQUIPS[item.id]);
  if(item && Array.isArray(item.words)) return item.words;
  return (t && t.words) || [];
}
/* 按模板生成一件新实例（拷走品阶与固有词条） */
function createItemInstance(tpl, id){
  const it = { id: id || (tpl && tpl.id) };
  if(!tpl) return it;
  if(tpl.rarity) it.rarity = tpl.rarity;
  if(Array.isArray(tpl.words) && tpl.words.length) it.words = JSON.parse(JSON.stringify(tpl.words));
  if(tpl.maxWear) it.wear = tpl.maxWear;
  if(tpl.durability) it.durability = tpl.durability;
  return it;
}
/* 实例是否还没被进阶过（可与同模板堆叠） */
function isPlainInstance(item, tpl){
  if(!item || !tpl) return false;
  if(item.rarity && item.rarity !== tpl.rarity) return false;
  if(Array.isArray(item.words)){
    if(!Array.isArray(tpl.words) || item.words.length !== tpl.words.length) return false;
    return JSON.stringify(item.words) === JSON.stringify(tpl.words);
  }
  return true;
}
/* 材料是否带"功能词条"（有就是符文类材料） */
function getMaterialWord(tpl){
  const f = tpl && tpl.func;
  return (f && f.kind === 'word' && f.word && f.word.type) ? f.word : null;
}

function calcEquipStats(charObj){
  const res = {
    physAtk:0, magicAtk:0, defBonus:0, maxHpBonus:0, maxMpBonus:0,
    spdMod:0, dodge:0, hitRate:0, critRate:0, critMult:0,
    vitBonus:0, spiBonus:0, dmgUp:0,
    /* 机制词条按“每条独立实例”保存；数值词条仍然汇总。 */
    onHitWords:[],
    reflectArmor:0, reflectAcc:0,
    physAtkPct:0, magicAtkPct:0,
    ignoreDef:0, dmgVsDemon:0, defVsDemon:0, executeBelow:0, lowHpPower:0, firstStrike:0,
    lifestealOnKill:0, hpDrainPct:0, mpDrainPct:0, trueDmgBonus:0,
    extraPhysDmg:0, extraMagicDmg:0,
    poisonOnHit:0, burnOnHit:0, bleedOnHit:0,
    silenceOnHit:0, freezeOnHit:0, petrifyOnHit:0, stunOnHit:0,
    sureHit:0, multiHit:0, splashPct:0,
    counterStart:0,
    grantedSkills: []
  };
  const eq = (charObj && charObj.equipment) || {};
  for(const slot of EQUIP_SLOTS){
    const item = eq[slot];
    if(!item) continue;
    const tpl = EQUIPS[item.id];
    if(!tpl) continue;
    /* 白板模式：未设计的物品不提供任何词条 */
    if(tpl.draft) continue;
    /* 装备赋予的技能：不写存档，装备期间才存在 */
    if(Array.isArray(tpl.grantSkills)){
      tpl.grantSkills.forEach(sid => {
        if(sid && res.grantedSkills.indexOf(sid) < 0) res.grantedSkills.push(sid);
      });
    }
    getItemWords(item, tpl).forEach((w, wi) => {
      const atom = (typeof getEffectAtom === 'function') ? getEffectAtom(w.type) : null;
      if(!atom) return;
      const val = Number(w.value) || 0;

      /* 命中附加类机制：每条词条保留独立实例，不合并成单一字段。
         这样两条“攻击附加中毒”会生成两条独立中毒状态。 */
      const ONHIT_MECHANICS = ['poison_on_hit','burn_on_hit','bleed_on_hit','silence_on_hit','freeze_on_hit','petrify_on_hit','stun_on_hit'];
      if(ONHIT_MECHANICS.indexOf(w.type) >= 0){
        res.onHitWords.push({
          type: w.type,
          value: val,
          source: 'equip:' + slot + ':' + (item.id || '') + ':' + wi,
          itemId: item.id || '',
          slot: slot
        });
        return;
      }

      /* 反伤：保留旧规则，防具/盾计入护甲反伤，其余计入饰品反伤 */
      if(w.type === 'reflect'){
        if(tpl.type === 'armor' || tpl.type === 'shield') res.reflectArmor += val;
        else res.reflectAcc += val;
        return;
      }

      if(!atom.equipStat) return;
      if(atom.stack === 'max'){
        res[atom.equipStat] = Math.max(res[atom.equipStat] || 0, val);
      }else{
        res[atom.equipStat] = (res[atom.equipStat] || 0) + val * (atom.equipSign || 1);
      }
    });
  }
  return res;
}

/* ============================================================
   技能来源合并
   ------------------------------------------------------------
   已学 = 技能熟练度表里的键（转职/功法书写入）
        ∪ 装备当前赋予的技能（不写存档，卸下即消失）
   ============================================================ */
function getKnownSkillIds(charObj){
  const out = [];
  const seen = {};
  if(charObj && charObj.skillProficiency){
    Object.keys(charObj.skillProficiency).forEach(id => {
      if(id && !seen[id]){ seen[id] = 1; out.push(id); }
    });
  }
  const eq = (typeof calcEquipStats === 'function' && charObj)
    ? calcEquipStats(charObj)
    : { grantedSkills: [] };
  (eq.grantedSkills || []).forEach(id => {
    if(id && !seen[id]){ seen[id] = 1; out.push(id); }
  });
  return out;
}

/* 装备换下后，把已经失效的技能从出战槽里清掉 */
function pruneEquippedSkills(charObj){
  if(!charObj || !Array.isArray(charObj.equippedSkills)) return false;
  const known = {};
  getKnownSkillIds(charObj).forEach(id => { known[id] = 1; });
  let changed = false;
  charObj.equippedSkills.forEach((sid, i) => {
    if(sid && !known[sid]){ charObj.equippedSkills[i] = null; changed = true; }
  });
  return changed;
}

/* 单位阵营标签：角色模板、战斗单位、玩家都能读 */
function getUnitFactionTags(unit){
  if(!unit) return [];
  const out = [];
  const add = v => { if(v && out.indexOf(v) < 0) out.push(v); };
  if(Array.isArray(unit.factionTags)) unit.factionTags.forEach(add);
  add(unit.faction);
  add(unit.race);
  if(Array.isArray(unit.classes)) unit.classes.forEach(add);
  return out;
}
function unitHasFactionTag(unit, tag){
  return getUnitFactionTags(unit).indexOf(tag) >= 0;
}

/* 单位有效防御值：体力基础 + 固定防御 + 临时防御，
   再乘防御百分比、石化 +20%、对魔军防御。
   防御是伤害公式的最后一个减项；没有护盾/减伤层。
   系数唯一来源是 data-attributes.js 的 ATTR_FORMULA.def.perVit。 */
function getUnitDefense(unit, attacker){
  if(!unit) return 0;
  const eq = (typeof getUnitMods === 'function')
    ? getUnitMods(unit)
    : calcEquipStats(unit.equipment ? { equipment: unit.equipment } : {});
  const vit = Number(unit.vit) || 0;
  let def = Number(eq.defBonus) || 0;
  const perVit = (typeof ATTR_FORMULA !== 'undefined' && ATTR_FORMULA.def)
    ? (Number(ATTR_FORMULA.def.perVit) || 0)
    : 0.7;
  def += vit * perVit;
  const tm = unit.tempMods || {};
  def += (Number(tm.def_up) || 0) - (Number(tm.def_down) || 0);
  def += (Number(unit.defOnce) || 0);
  const sm = (typeof getStatusMods === 'function') ? getStatusMods(unit) : {};
  def *= (1 + (Number(sm.dpu) || 0) / 100);
  def *= (1 - Math.min(90, Number(sm.dpd) || 0) / 100);
  def *= (1 + (Number(eq.defPct) || 0) / 100);
  if(attacker && unitHasFactionTag(attacker, '魔军')){
    def *= 1 + (Number(eq.defVsDemon) || 0) / 100;
  }
  return Math.max(0, def);
}

/* 带装备词条（体力/精神力）的派生属性：
   装备上的 vitBonus / spiBonus 会先进一级属性，再走统一派生公式，
   所以"体力+"会同时提升 HP、物攻和防御。 */
function getCharAttrStatsWithEquip(charObj, levelOverride){
  if(!charObj) return null;
  const eq = calcEquipStats(charObj);
  const proxy = Object.assign({}, charObj, {
    vitFlat: (Number(charObj.vitFlat) || 0) + (Number(eq.vitBonus) || 0) + getPassiveStatTotal(charObj, 'vit_up', 'add'),
    spiFlat: (Number(charObj.spiFlat) || 0) + (Number(eq.spiBonus) || 0) + getPassiveStatTotal(charObj, 'spi_up', 'add')
  });
  return getCharAttrStats(proxy, levelOverride);
}

/*
   支持三种传入形态：
   - 战斗单位（有 isPlayer / npcId）
   - game 对象（currentGame，有 classes）
   - NPC 对象（有 classes）
   职业被动来自 PASSIVE_SKILLS；个性化被动来自角色卡 personalPassives。*/
function getPassiveEffects(unit){
  if(!unit) return [];
  const effects = [];
  let classes = [];
  let owner = null;
  if(unit.isPlayer){
    owner = currentGame;
    classes = currentGame.classes.filter(c=>c);
  }else if(unit.npcId){
    owner = getNpc(unit.npcId);
    classes = (owner && owner.classes) ? owner.classes.filter(c=>c) : [];
  }else if(Array.isArray(unit.classes)){
    owner = unit;
    classes = unit.classes.filter(c=>c);
  }
  classes.forEach(cls => { if(PASSIVE_SKILLS[cls]) effects.push(...PASSIVE_SKILLS[cls].effects); });
  /* 称号被动：当前持有的称号也会提供 effects */
  const titleIds = (owner && Array.isArray(owner.titles)) ? owner.titles : [];
  titleIds.forEach(tid => {
    const t = (typeof TITLES !== 'undefined') ? TITLES[tid] : null;
    if(t && Array.isArray(t.effects)) effects.push(...t.effects);
  });
  const personal = (owner && Array.isArray(owner.personalPassives)) ? owner.personalPassives : [];
  personal.forEach(p => {
    if(p && Array.isArray(p.effects)) effects.push(...p.effects);
  });
  /* 装备被动：装备期间生效，卸下即消失（不写存档） */
  const gearEq = (owner && owner.equipment) || (unit && unit.equipment) || null;
  if(gearEq && typeof EQUIPS !== 'undefined' && typeof EQUIP_SLOTS !== 'undefined'){
    EQUIP_SLOTS.forEach(slot => {
      const held = gearEq[slot];
      if(!held) return;
      const tpl = EQUIPS[held.id];
      if(!tpl || tpl.draft) return;
      (tpl.passives || []).forEach(p => {
        if(p && Array.isArray(p.effects)) effects.push(...p.effects);
      });
    });
  }
  return effects;
}

/* ---- 隐藏职业 ----
   职业被动里带 hidden:true 的职业：不在装备职业限制、技能职业标签等地方露出真名，
   只在职业编辑器、转职道具选择器里可见。 */
function isHiddenClass(name){
  if(!name) return false;
  if(typeof HIDDEN_CLASSES !== 'undefined' && Array.isArray(HIDDEN_CLASSES) && HIDDEN_CLASSES.indexOf(name) >= 0) return true;
  const p = (typeof PASSIVE_SKILLS !== 'undefined') ? PASSIVE_SKILLS[name] : null;
  return !!(p && p.hidden);
}
function maskClassName(name){
  return isHiddenClass(name) ? '？？？' : name;
}

/* ---- 单位最终修正：装备词条 + 被动效果 ----
   两者按同一套规则汇总，避免“同一个词条挂在装备上有效、挂在被动上无效”。
   属性读取统一走这里。
   规则与 calcEquipStats 一致：stack='max' 取最大，其余加算（equipSign 处理符号）。
   反伤是例外：防具/盾计入护甲反伤，其余计入饰品反伤。 */
function getUnitMods(unit){
  const res = calcEquipStats(unit && unit.equipment ? { equipment: unit.equipment } : {});
  res.immuneTags = [];
  const pushImmune = tag => {
    if(tag && res.immuneTags.indexOf(tag) < 0) res.immuneTags.push(tag);
  };
  /* 装备词条上的免疫 */
  const eq = (unit && unit.equipment) || {};
  if(typeof EQUIP_SLOTS !== 'undefined' && typeof EQUIPS !== 'undefined' && typeof getItemWords === 'function'){
    EQUIP_SLOTS.forEach(slot => {
      const held = eq[slot];
      if(!held) return;
      const tpl = EQUIPS[held.id];
      if(!tpl || tpl.draft) return;
      getItemWords(held, tpl).forEach(w => {
        const a = (typeof getEffectAtom === 'function') ? getEffectAtom(w.type) : null;
        if(a && a.immune) pushImmune(w.tag);
      });
    });
  }
  if(!unit || typeof getPassiveEffects !== 'function') return res;
  getPassiveEffects(unit).forEach(e => {
    if(!e || !e.type) return;
    /* 事件型被动（battle_start / on_hit / turn_*）由战斗钩子结算，不能重复算进常驻属性 */
    if(e.trigger && e.trigger !== 'always') return;
    const atom = (typeof getEffectAtom === 'function') ? getEffectAtom(e.type) : null;
    if(!atom) return;
    if(atom.immune){ pushImmune(e.tag); return; }
    const val = Number(e.value) || 0;
    if(e.type === 'reflect'){
      res.reflectArmor = (res.reflectArmor || 0) + val;
      return;
    }
    if(!atom.equipStat) return;
    if(atom.stack === 'max'){
      res[atom.equipStat] = Math.max(res[atom.equipStat] || 0, val);
    }else{
      res[atom.equipStat] = (res[atom.equipStat] || 0) + val * (atom.equipSign || 1);
    }
  });
  return res;
}

function getPassiveMaxHpBonus(unit){
  let bonus = 0;
  getPassiveEffects(unit).forEach(e => { if(e.type === 'maxhp_up_pct') bonus += e.value; });
  return bonus;
}

/* 个性化/职业被动的固定值加成（最大 HP / MP） */
function getPassiveFlatBonus(unit, type){
  let bonus = 0;
  getPassiveEffects(unit).forEach(e => { if(e.type === type) bonus += Number(e.value) || 0; });
  return bonus;
}

/* ---- 被动词条数值汇总（P2 补接） ----
   只统计被动来源：职业被动 / 称号 / 个性化被动。
   mode='max' 取最大值；其余为加算（与词条库的 stackText 一致）。 */
function getPassiveStatTotal(owner, type, mode){
  let total = 0;
  getPassiveEffects(owner).forEach(e => {
    if(!e || e.type !== type) return;
    const v = Number(e.value);
    if(!isFinite(v)) return;
    total = (mode === 'max') ? Math.max(total, v) : total + v;
  });
  return total;
}

/* 交易系数：商店折扣 / 出售加成都按"取最大值"叠加。
   商人职业的被动（shop_discount 20 / sell_bonus 10）换算后
   正好等于原来硬编码的 0.8 买入 / 0.55 卖出，经济数值不变。 */
function getTradeRates(owner){
  const who = owner || currentGame;
  /* 折扣封顶 90%，避免出现 0 或负数价格 */
  const buyPct  = Math.min(90, Math.max(0, getPassiveStatTotal(who, 'shop_discount', 'max')));
  const sellPct = Math.max(0, getPassiveStatTotal(who, 'sell_bonus', 'max'));
  return {
    buyPct: buyPct,
    sellPct: sellPct,
    buyMult: 1 - buyPct / 100,
    sellMult: 1 + sellPct / 100
  };
}

/* 装备词条某一类的合计（结算类词条用） */
function getEquipWordTotal(owner, type){
  let total = 0;
  const eq = (owner && owner.equipment) || {};
  if(typeof EQUIP_SLOTS === 'undefined' || typeof EQUIPS === 'undefined' || typeof getItemWords !== 'function') return 0;
  EQUIP_SLOTS.forEach(slot => {
    const held = eq[slot];
    if(!held) return;
    const tpl = EQUIPS[held.id];
    if(!tpl || tpl.draft) return;
    getItemWords(held, tpl).forEach(w => {
      if(w && w.type === type) total += Number(w.value) || 0;
    });
  });
  return total;
}

/* 战斗结算加成：金币 / 经验 / 掉率，加算。被动 + 装备词条都算 */
function getSettleBonus(owner){
  const who = owner || currentGame;
  return {
    goldPct: getPassiveStatTotal(who, 'gold_bonus', 'add') + getEquipWordTotal(who, 'gold_bonus'),
    expPct:  getPassiveStatTotal(who, 'exp_bonus', 'add')  + getEquipWordTotal(who, 'exp_bonus'),
    dropPct: getPassiveStatTotal(who, 'drop_bonus', 'add') + getEquipWordTotal(who, 'drop_bonus')
  };
}

function getFinalMaxHp(charObj){
  const eqStats = calcEquipStats(charObj);
  const passiveBonus = getPassiveMaxHpBonus(charObj);
  const passiveFlat = getPassiveFlatBonus(charObj, 'maxhp_up');
  /* 有完整一级属性模型时，用"含装备体力加值"的派生结果做基数，
     这样体力+词条也会提升面板 HP 上限 */
  const hasModel = charObj && charObj.base && isFinite(Number(charObj.base.vit))
    && charObj.growth && isFinite(Number(charObj.growth.vit));
  const baseHp = hasModel ? getCharAttrStatsWithEquip(charObj).maxHp : (charObj.maxHp || 0);
  const extraHp = Number(charObj.extraMaxHp) || 0;
  return Math.floor((baseHp + (eqStats.maxHpBonus || 0) + passiveFlat) * (1 + (passiveBonus + (Number(eqStats.maxHpPct) || 0)) / 100)) + extraHp;
}

function getFinalMaxMp(charObj){
  const eqStats = calcEquipStats(charObj);
  const passiveFlat = getPassiveFlatBonus(charObj, 'maxmp_up');
  const hasModel = charObj && charObj.base && isFinite(Number(charObj.base.spi))
    && charObj.growth && isFinite(Number(charObj.growth.spi));
  const baseMp = hasModel ? getCharAttrStatsWithEquip(charObj).maxMp : (charObj.maxMp || 0);
  const mpPct = getPassiveStatTotal(charObj, 'maxmp_up_pct', 'add') + (Number(eqStats.maxMpPct) || 0);
  const extraMp = Number(charObj.extraMaxMp) || 0;
  return Math.floor((baseMp + (eqStats.maxMpBonus || 0) + passiveFlat) * (1 + mpPct / 100)) + extraMp;
}

function displaySpd(unit){
  let base = unit.spd || 10;
  if(unit.equipment){
    const stats = calcEquipStats({equipment:unit.equipment});
    base += (stats.spdMod || 0);
  }
  const m = getStatusMods(unit);
  base += m.spd_down;
  base -= m.spd_up;
  return Math.max(SPD_MIN, Math.ceil(base));
}

function getStatusMods(unit){
  const m = {paup:0, maup:0, padp:0, madp:0, dpu:0, dpd:0, spd_up:0, spd_down:0,
             hit:0, dodge:0, crit:0, critMult:0, atk:0, matk:0, def:0};
  (unit.statuses || []).forEach(st => {
    if(st.type === 'phys_atk_up_pct')        m.paup += st.value;
    else if(st.type === 'phys_atk_down_pct') m.padp += st.value;
    else if(st.type === 'magic_atk_up_pct')  m.maup += st.value;
    else if(st.type === 'magic_atk_down_pct')m.madp += st.value;
    else if(st.type === 'def_up_pct')        m.dpu += st.value;
    else if(st.type === 'def_down_pct')      m.dpd += st.value;
    else if(st.type === 'spd_up')            m.spd_up += st.value;
    else if(st.type === 'spd_down')          m.spd_down += st.value;
    else if(st.type === 'hit_up')            m.hit += st.value;
    else if(st.type === 'dodge')             m.dodge += st.value;
    else if(st.type === 'petrify')           m.dpu += 20;
    else if(st.type === 'airborne')          m.dodge -= 0.20;
    else if(st.type === 'crit_up')           m.crit += st.value;
    else if(st.type === 'critdmg_up')        m.critMult += st.value;
    else if(st.type === 'phys_atk_up')       m.atk += st.value;
    else if(st.type === 'magic_atk_up')      m.matk += st.value;
    else if(st.type === 'def_up')            m.def += st.value;
  });
  return m;
}

/* ============================================================
   装备磨损 / 耐久 —— 统一读取
   ============================================================ */

/* 武器当前磨损值（缺省 = 满值） */
function getItemWear(item, tpl){
  if(!item || !tpl || !tpl.maxWear) return 0;
  return item.wear !== undefined ? item.wear : tpl.maxWear;
}

/* 护甲当前耐久值（缺省 = 满值） */
function getItemDur(item, tpl){
  if(!item || !tpl || !tpl.durability) return 0;
  return item.durability !== undefined ? item.durability : tpl.durability;
}

/* 获取装备磨损状态
   返回 { cur, max, ratio, level }
   level 取值：
     'none'     —— 该装备没有磨损属性（饰品、消耗品等）
     'ok'       —— 磨损正常
     'warn'     —— 磨损过半（ratio <= 0.5）
     'critical' —— 磨损临界（ratio <= 0.2）→ UI 红框告警
     'broken'   —— 已损坏（cur <= 0，通常已被移除，兜底用）
   用法：
     const st = getWearStatus(item, EQUIPS[item.id]);
     if(st.level === 'critical' || st.level === 'broken'){ ... 加红框 ... }
*/
function getWearStatus(item, tpl){
  if(!item || !tpl) return {cur:0, max:0, ratio:1, level:'none'};
  let max = 0, cur = 0;
  if(tpl.type === 'weapon' && tpl.maxWear){
    max = tpl.maxWear;
    cur = getItemWear(item, tpl);
  }else if((tpl.type === 'armor' || tpl.type === 'shield') && tpl.durability){
    max = tpl.durability;
    cur = getItemDur(item, tpl);
  }else{
    return {cur:0, max:0, ratio:1, level:'none'};
  }
  const ratio = max > 0 ? cur / max : 1;
  let level = 'ok';
  if(cur <= 0) level = 'broken';
  else if(ratio <= 0.2) level = 'critical';
  else if(ratio <= 0.5) level = 'warn';
  return {cur, max, ratio, level};
}

/* 战斗结算：对单个角色的全部 8 个部位扣 rounds 点磨损/耐久
   （防御不再是"耐久池"，耐久纯粹是物品损耗，归零即碎裂）
   返回需要写入战斗日志的提示数组 */
/* 某件装备上某一类词条的合计 */
function getItemWordSum(item, tpl, type){
  let sum = 0;
  if(typeof getItemWords !== 'function' || !item || !tpl) return 0;
  getItemWords(item, tpl).forEach(w => {
    if(w && w.type === type) sum += Number(w.value) || 0;
  });
  return sum;
}

function applyWeaponWear(charObj, rounds){
  const messages = [];
  if(!charObj || rounds <= 0) return messages;
  const eq = charObj.equipment;
  if(!eq) return messages;

  const pushBroken = (slot, tpl) => {
    if(typeof battleState !== 'undefined' && battleState && Array.isArray(battleState.wearBroken)){
      battleState.wearBroken.push({
        owner: charObj.name, slot: slot, name: tpl.name, level: 'broken'
      });
    }
  };

  for(const slot of EQUIP_SLOTS){
    const held = eq[slot];
    if(!held) continue;
    const tpl = EQUIPS[held.id];
    if(!tpl) continue;

    /* 磨损速度 / 破损保护（装备词条） */
    const wearDown = Math.min(90, getItemWordSum(held, tpl, 'wear_down'));
    const guarded = getItemWordSum(held, tpl, 'durability_guard') > 0;
    const loss = Math.max(1, Math.floor(rounds * (1 - wearDown / 100)));

    /* 武器：磨损 */
    if(tpl.maxWear){
      const cur = getItemWear(held, tpl);
      const next = cur - loss;
      if(next <= 0){
        if(guarded){
          eq[slot] = Object.assign({}, held, { wear: 1 });
          messages.push(`【${charObj.name}】的${tpl.name}磨损见底，被保护住了。`);
        }else{
          messages.push(`【${charObj.name}】的${tpl.name}磨损殆尽，碎裂消失。`);
          pushBroken(slot, tpl);
          eq[slot] = null;
          if(slot === 'mainHand' && tpl.twoHanded) eq.offHand = null;
        }
      }else{
        eq[slot] = Object.assign({}, held, { wear: next });
      }
      continue;
    }

    /* 防具 / 盾 / 其他有耐久的部位：耐久 */
    if(tpl.durability){
      const cur = getItemDur(held, tpl);
      const next = cur - loss;
      if(next <= 0){
        if(guarded){
          eq[slot] = Object.assign({}, held, { durability: 1 });
          messages.push(`【${charObj.name}】的${tpl.name}耐久见底，被保护住了。`);
        }else{
          messages.push(`【${charObj.name}】的${tpl.name}耐久耗尽，碎裂消失。`);
          pushBroken(slot, tpl);
          eq[slot] = null;
        }
      }else{
        eq[slot] = Object.assign({}, held, { durability: next });
      }
    }
  }
  return messages;
}
/* ============================================================
   时间
   ============================================================ */

function advanceTime(h){
  const t = currentGame.time;
  t.hour += h;
  while(t.hour >= 24){
    t.hour -= 24;
    t.day++;
    if(t.day > 30){
      t.day = 1;
      t.month++;
      if(t.month > 12){ t.month = 1; t.year++; }
    }
  }
  refreshPetRespawns();
  if(checkGameOver()) return;
  if(typeof checkAgeDeaths === 'function') checkAgeDeaths();
}

/* 时间换算为累计小时（月按 30 天，与 advanceTime 进位一致） */
function timeToHours(t){
  return ((t.year || 1) * 12 * 30 + (t.month - 1) * 30 + (t.day - 1)) * 24 + (t.hour || 0);
}

/* 宠物收服后的刷新周期：2 天 = 48 小时（与 ACTOR_RESPAWN_HOURS 保持一致） */
const PET_RESPAWN_HOURS = (typeof ACTOR_RESPAWN_HOURS !== 'undefined') ? ACTOR_RESPAWN_HOURS : 48;

/* 遍历全部地图挂载：到期的宠物/物种个体恢复显示，并重置为新个体 */
function refreshPetRespawns(){
  if(!currentGame || !currentGame.time) return;
  const now = timeToHours(currentGame.time);
  let changedGlobal = false;
  for(const mapId in MAPS){
    (MAPS[mapId].tiles || []).forEach(tile => {
      if(!Array.isArray(tile.actors) || !tile.actors.length) return;
      const kept = [];
      let changed = false;
      tile.actors.forEach(a => {
        if(!a || a.removedAt == null){ kept.push(a); return; }
        const tpl = getCharacterTemplate(a.charId);
        /* 唯一角色一旦被收服/死亡，就不能通过 48h 刷新再出现一个同一个人 */
        if(tpl && isCharacterUnique(tpl)){
          changed = true;
          if(currentGame.actorStates) delete currentGame.actorStates[a.placementId];
          if(Array.isArray(tile.npcs)) tile.npcs = tile.npcs.filter(x => x !== a.charId);
          return;
        }
        if(now - a.removedAt >= PET_RESPAWN_HOURS){
          delete a.removedAt;
          /* 物种刷新出来的是新个体：年龄重置为出场年龄 */
          if(tpl && !isCharacterUnique(tpl)){
            a.spawnAge = getAppearanceAge(tpl);
            a.spawnedAt = now;
          }
          if(Array.isArray(tile.npcs) && !tile.npcs.includes(a.charId)) tile.npcs.push(a.charId);
          syncActorState(a);
          changed = true;
        }
        kept.push(a);
      });
      if(kept.length !== tile.actors.length) tile.actors = kept;
      if(changed) changedGlobal = true;
    });
  }
  if(changedGlobal && typeof saveGame === 'function') saveGame(currentSlot, {silent:true});
}

function getTimeStr(){
  const t = currentGame.time;
  return `${t.year}年${t.month}月${t.day}日 ${t.hour}时`;
}

/* ============================================================
   年龄 / 唯一角色 / 物种个体
   ------------------------------------------------------------
   唯一角色：年龄 = 角色卡出场年龄 + 游戏已过年数，老死永久。
   非唯一角色：每个地图挂载点 / 收服实例有独立出生年龄与时间，
   老死只影响当前个体，刷新后按新个体重置年龄。
   ============================================================ */

function isCharacterUnique(obj){
  return !!(obj && obj.isUnique === true);
}
function getAppearanceAge(obj){
  const n = Number(obj && obj.appearanceAge);
  return (isFinite(n) && n >= 0) ? n : ((typeof DEFAULT_APPEARANCE_AGE !== 'undefined') ? DEFAULT_APPEARANCE_AGE : 20);
}
function getDeathAge(obj){
  const n = Number(obj && obj.deathAge);
  return (isFinite(n) && n > 0) ? n : ((typeof DEFAULT_DEATH_AGE !== 'undefined') ? DEFAULT_DEATH_AGE : 80);
}
function getGameElapsedYears(){
  if(!currentGame || !currentGame.time) return 0;
  const start = ((typeof GAME_START_HOURS !== 'undefined') ? GAME_START_HOURS : ((1 * 12 * 30) * 24 + 8));
  const perYear = (typeof AGE_YEAR_HOURS !== 'undefined') ? AGE_YEAR_HOURS : (360 * 24);
  return Math.max(0, (timeToHours(currentGame.time) - start) / perYear);
}
function getCardAgeYears(obj){
  return getAppearanceAge(obj) + getGameElapsedYears();
}
function getInstanceAgeYears(obj, fallbackObj){
  if(!currentGame || !currentGame.time) return getCardAgeYears(fallbackObj || obj);
  const base = Number(obj && obj.spawnAge);
  const started = Number(obj && obj.spawnedAt);
  if(isFinite(base) && isFinite(started)){
    const perYear = (typeof AGE_YEAR_HOURS !== 'undefined') ? AGE_YEAR_HOURS : (360 * 24);
    return Math.max(0, base + Math.max(0, timeToHours(currentGame.time) - started) / perYear);
  }
  return getCardAgeYears(fallbackObj || obj);
}
function getCharacterAgeYears(charObj){
  if(!charObj) return 0;
  const tpl = (typeof getCharacterTemplate === 'function')
    ? (getCharacterTemplate(charObj.templateId || charObj.id) || charObj) : charObj;
  if(isCharacterUnique(tpl)){
    return getCardAgeYears(charObj.appearanceAge !== undefined ? charObj : tpl);
  }
  return getInstanceAgeYears(charObj, tpl);
}
function formatAgeYears(years){
  return Math.max(0, Math.floor(Number(years) || 0)) + '岁';
}
function getCharacterAgeTextForView(npc, placementId){
  if(!npc) return '';
  const tpl = (typeof getCharacterTemplate === 'function')
    ? (getCharacterTemplate(npc.templateId || npc.id) || npc) : npc;
  let years;
  if(isCharacterUnique(tpl)){
    years = getCardAgeYears(npc.appearanceAge !== undefined ? npc : tpl);
  }else if(placementId && typeof findPlacementActor === 'function'){
    const actor = findPlacementActor(npc.id, placementId);
    years = actor ? getInstanceAgeYears(actor, tpl) : getInstanceAgeYears(npc, tpl);
  }else{
    years = getInstanceAgeYears(npc, tpl);
  }
  return '年龄 ' + formatAgeYears(years);
}
function isCharacterDeceased(id){
  if(!id) return false;
  const inst = (typeof getNpc === 'function') ? getNpc(id) : null;
  return !!(inst && inst.deceased);
}
function isCharacterInQueue(id){
  if(!currentGame || !currentGame.queue || !id) return false;
  const q = currentGame.queue;
  return ['front','back','rest'].some(row => (q[row] || []).some(x => x === id));
}
function isCharacterOwned(id){
  if(!id) return false;
  if(isCharacterInQueue(id)) return true;
  if(typeof isPetActive === 'function' && isPetActive(id)) return true;
  return !!(currentGame && currentGame.petBag && currentGame.petBag.includes(id));
}
function removeCharacterFromParty(id){
  if(!currentGame || !id) return;
  const q = currentGame.queue;
  if(q){
    ['front','back','rest'].forEach(row => {
      for(let i = 0; i < q[row].length; i++){
        if(q[row][i] === id) q[row][i] = null;
      }
    });
  }
  if(currentGame.pets){
    ['front','back'].forEach(slot => {
      if(currentGame.pets[slot] === id) currentGame.pets[slot] = null;
    });
  }
  if(Array.isArray(currentGame.petBag)){
    currentGame.petBag = currentGame.petBag.filter(x => x !== id);
  }
  if(typeof selectedQueueChar !== 'undefined' && selectedQueueChar && selectedQueueChar.charId === id){
    selectedQueueChar = null;
  }
  if(typeof renderQueue === 'function') renderQueue();
}
function clearCharacterTransientUi(id, name){
  const baseId = String(id || '').split('#')[0];
  if(currentTalkNpc === baseId || currentTalkNpc === id){
    currentTalkNpc = null;
    currentTalkPlacementId = null;
    const box = document.getElementById('storyBox');
    if(box) box.innerHTML = '';
  }
  if(typeof pendingKickNpcId !== 'undefined' && pendingKickNpcId && String(pendingKickNpcId).split('#')[0] === baseId){
    pendingKickNpcId = null;
    const km = document.getElementById('kickModal');
    if(km) km.classList.remove('show');
  }
  const vm = document.getElementById('viewModal');
  if(vm && vm.classList.contains('show')){
    const vn = document.getElementById('viewName');
    if(!name || !vn || vn.textContent.indexOf(name) >= 0) vm.classList.remove('show');
  }
  if(typeof renderNpcRow === 'function') renderNpcRow();
  if(typeof renderBag === 'function'){
    const bm = document.getElementById('bagModal');
    if(bm && bm.classList.contains('show')) renderBag();
  }
}
function syncActorState(a){
  if(!currentGame || !a || !a.placementId) return;
  if(!currentGame.actorStates) currentGame.actorStates = {};
  currentGame.actorStates[a.placementId] = {
    removedAt: (a.removedAt != null ? a.removedAt : null),
    spawnAge: (a.spawnAge != null ? a.spawnAge : null),
    spawnedAt: (a.spawnedAt != null ? a.spawnedAt : null)
  };
}
function ensureActorAges(){
  if(!currentGame) return;
  if(!currentGame.actorStates) currentGame.actorStates = {};
  for(const mapId in MAPS){
    (MAPS[mapId].tiles || []).forEach(tile => {
      if(!Array.isArray(tile.actors)) return;
      tile.actors.forEach((a, idx) => {
        if(!a || !a.charId) return;
        const tpl = getCharacterTemplate(a.charId);
        if(!tpl || isCharacterUnique(tpl)) return;
        if(!a.placementId) a.placementId = tile.id + '::' + a.charId + '::' + idx;
        const st = currentGame.actorStates[a.placementId];
        if(st){
          if(st.removedAt !== undefined) a.removedAt = st.removedAt;
          if(st.spawnAge !== undefined) a.spawnAge = st.spawnAge;
          if(st.spawnedAt !== undefined) a.spawnedAt = st.spawnedAt;
        }else{
          if(a.spawnAge == null) a.spawnAge = getAppearanceAge(tpl);
          if(a.spawnedAt == null) a.spawnedAt = ((typeof GAME_START_HOURS !== 'undefined') ? GAME_START_HOURS : ((1 * 12 * 30) * 24 + 8));
          syncActorState(a);
        }
      });
    });
  }
  return true;
}
function applyDeathState(){
  if(!currentGame || !currentGame.characters) return;
  for(const id in currentGame.characters){
    const c = currentGame.characters[id];
    if(!c || c.isEnv || !c.deceased) continue;
    const tpl = getCharacterTemplate(c.templateId || id) || c;
    const baseId = String(c.templateId || id).split('#')[0];
    removeCharacterFromParty(id);
    if(isCharacterUnique(tpl)){
      removeCharacterFromParty(baseId);
      if(typeof _removeCharacterPlacements === 'function') _removeCharacterPlacements(baseId);
      if(typeof invalidateStoriesForNpc === 'function') invalidateStoriesForNpc(baseId);
      clearCharacterTransientUi(baseId, tpl.name);
    }else{
      clearCharacterTransientUi(id, tpl.name);
    }
  }
  ensureActorAges();
}

/* ============================================================
   章节系统
   ============================================================ */
let _deathQueue = [];
let _deathActive = false;
function isDeathNoticeOpen(){
  const el = document.getElementById('deathModal');
  return !!(el && el.classList.contains('show'));
}
function queueDeathNotice(entry){
  if(!entry) return;
  _deathQueue.push(entry);
  if(!_deathActive) showNextDeathNotice();
}
function showNextDeathNotice(){
  if(_deathQueue.length === 0){ _deathActive = false; return; }
  _deathActive = true;
  const e = _deathQueue[0];
  const title = document.getElementById('deathTitle');
  const msg = document.getElementById('deathMsg');
  if(title) title.textContent = e.title || '角色离世';
  if(msg) msg.textContent = e.message || '';
  const modal = document.getElementById('deathModal');
  if(modal) modal.classList.add('show');
}
function confirmDeathNotice(){
  const e = _deathQueue.shift();
  const modal = document.getElementById('deathModal');
  if(modal) modal.classList.remove('show');
  _deathActive = false;
  try{ if(e && typeof e.onConfirm === 'function') e.onConfirm(); }catch(err){ console.error('[death]', err); }
  if(currentGame && typeof saveGame === 'function'){
    try{ saveGame(currentSlot, {silent:true}); }catch(err){}
  }
  if(_deathQueue.length) setTimeout(showNextDeathNotice, 120);
}

/* ============================================================
   老死检测
   ============================================================ */
function handleUniqueDeath(c, tpl){
  const id = c.id;
  const baseId = String(c.templateId || id).split('#')[0];
  const inParty = isCharacterInQueue(id) || isCharacterInQueue(baseId);
  const inPet = isCharacterOwned(id) || isCharacterOwned(baseId);
  const ageText = formatAgeYears(getCardAgeYears(c));
  removeCharacterFromParty(id);
  removeCharacterFromParty(baseId);
  if(typeof _removeCharacterPlacements === 'function') _removeCharacterPlacements(baseId);
  let storyChanged = false;
  if(typeof invalidateStoriesForNpc === 'function') storyChanged = invalidateStoriesForNpc(baseId);
  clearCharacterTransientUi(baseId, tpl.name);
  if(inParty || inPet){
    queueDeathNotice({
      title: '角色离世',
      message: `【${tpl.name}】已到寿终，享年 ${ageText}。\n\n已从队伍/宠物中离开，并在地图上消失。`
        + (storyChanged ? '\n相关主线剧情已中断，相关地图限制已解除。' : '')
    });
  }else{
    toast(`【${tpl.name}】已到寿终，享年 ${ageText}。`);
  }
}
function handleSpeciesDeath(c, tpl){
  const id = c.id;
  const inParty = isCharacterInQueue(id);
  const inPet = isCharacterOwned(id) && !inParty;
  const ageText = formatAgeYears(getCharacterAgeYears(c));
  removeCharacterFromParty(id);
  clearCharacterTransientUi(id, tpl.name);
  if(inParty || inPet){
    queueDeathNotice({
      title: '宠物/伙伴离世',
      message: `【${tpl.name}】已到寿终，享年 ${ageText}。\n\n已从队伍/宠物中离开。\n该物种的刷新点与遭遇战不受影响。`
    });
  }
}
function checkAgeDeaths(){
  if(!currentGame || !currentGame.characters || isGameFailed()) return;
  ensureActorAges();
  const now = timeToHours(currentGame.time);
  let changed = false;

  /* 1) 唯一角色：角色卡年龄，永久死亡 */
  for(const id in currentGame.characters){
    const c = currentGame.characters[id];
    if(!c || c.isEnv || c.deceased) continue;
    const tpl = getCharacterTemplate(c.templateId || id) || c;
    if(!isCharacterUnique(tpl)) continue;
    const deathAge = getDeathAge(tpl);
    if(!isFinite(deathAge) || deathAge <= getAppearanceAge(tpl)) continue;
    const age = getCardAgeYears(c);
    if(age >= deathAge){
      c.deceased = true;
      c.deceasedAge = deathAge;
      c.deceasedAt = now;
      handleUniqueDeath(c, tpl);
      changed = true;
    }
  }

  /* 2) 非唯一角色：只检查被收服/入队的独立实例 */
  for(const id in currentGame.characters){
    const c = currentGame.characters[id];
    if(!c || c.isEnv || c.deceased) continue;
    const tpl = getCharacterTemplate(c.templateId || id) || c;
    if(isCharacterUnique(tpl)) continue;
    if(!isCharacterOwned(id)) continue;
    if(c.spawnAge == null) c.spawnAge = getAppearanceAge(tpl);
    if(c.spawnedAt == null) c.spawnedAt = ((typeof GAME_START_HOURS !== 'undefined') ? GAME_START_HOURS : ((1 * 12 * 30) * 24 + 8));
    const deathAge = getDeathAge(tpl);
    if(!isFinite(deathAge) || deathAge <= getAppearanceAge(tpl)) continue;
    const age = getInstanceAgeYears(c, tpl);
    if(age >= deathAge){
      c.deceased = true;
      c.deceasedAge = deathAge;
      c.deceasedAt = now;
      handleSpeciesDeath(c, tpl);
      changed = true;
    }
  }

  /* 3) 非唯一角色的地图挂载点：老死只隐藏当前个体，48h 后刷新新个体 */
  for(const mapId in MAPS){
    (MAPS[mapId].tiles || []).forEach(tile => {
      if(!Array.isArray(tile.actors)) return;
      tile.actors.forEach(a => {
        if(!a || !a.charId || a.removedAt != null) return;
        const tpl = getCharacterTemplate(a.charId);
        if(!tpl || isCharacterUnique(tpl)) return;
        const deathAge = getDeathAge(tpl);
        if(!isFinite(deathAge) || deathAge <= getAppearanceAge(tpl)) return;
        if(a.spawnAge == null) a.spawnAge = getAppearanceAge(tpl);
        if(a.spawnedAt == null) a.spawnedAt = ((typeof GAME_START_HOURS !== 'undefined') ? GAME_START_HOURS : ((1 * 12 * 30) * 24 + 8));
        const age = getInstanceAgeYears(a, tpl);
        if(age < deathAge) return;
        a.removedAt = now;
        syncActorState(a);
        changed = true;
        if(currentTalkNpc === a.charId && currentTalkPlacementId === a.placementId){
          currentTalkNpc = null;
          currentTalkPlacementId = null;
          const box = document.getElementById('storyBox');
          if(box) box.innerHTML = '';
        }
        if(mapId === currentMapId && tile.id === currentTileId){
          toast(`【${tpl.name}】已到寿终，刷新点会在 ${PET_RESPAWN_HOURS} 小时后出现新个体。`);
        }
      });
    });
  }

  if(changed){
    if(typeof saveGame === 'function') saveGame(currentSlot, {silent:true});
    if(typeof renderNpcRow === 'function') renderNpcRow();
  }
}

/* ============================================================
   自动时间
   ============================================================ */
let _autoTimeTimer = null;
let _autoTimeLast = 0;
let _autoTimeAccum = 0;
let _autoSaveHours = 0;

function isAutoTimeBlocked(){
  if(!currentGame) return true;
  const gs = document.getElementById('gameScreen');
  if(!gs || gs.style.display === 'none') return true;
  if((typeof AUTO_TIME_CONFIG === 'undefined' || AUTO_TIME_CONFIG.pauseWhenHidden) && document.hidden) return true;
  if(typeof isGameFailed === 'function' && isGameFailed()) return true;
  const bs = document.getElementById('battleScreen');
  if((typeof AUTO_TIME_CONFIG === 'undefined' || AUTO_TIME_CONFIG.pauseInBattle) && bs && bs.classList.contains('show')) return true;
  if((typeof AUTO_TIME_CONFIG === 'undefined' || AUTO_TIME_CONFIG.pauseInQueue) && typeof queueMode !== 'undefined' && queueMode) return true;
  if((typeof AUTO_TIME_CONFIG === 'undefined' || AUTO_TIME_CONFIG.pauseInStory) && isStoryBlocking()) return true;
  if((typeof AUTO_TIME_CONFIG === 'undefined' || AUTO_TIME_CONFIG.pauseInModal) && document.querySelector('.modal-overlay.show')) return true;
  return false;
}
function autoTimeTick(){
  if(!currentGame) return;
  const now = Date.now();
  const dt = Math.max(0, Math.min(60000, now - _autoTimeLast));
  _autoTimeLast = now;
  if(isAutoTimeBlocked()){ _autoTimeAccum = 0; return; }
  _autoTimeAccum += dt;
  const msPerHour = (typeof AUTO_TIME_CONFIG !== 'undefined' && Number(AUTO_TIME_CONFIG.msPerGameHour) > 0)
    ? Number(AUTO_TIME_CONFIG.msPerGameHour) : 30000;
  let guard = 0;
  while(_autoTimeAccum >= msPerHour && guard++ < 24){
    _autoTimeAccum -= msPerHour;
    advanceTime(1);
    _autoSaveHours++;
    /* 每过一个游戏日静默自动存档一次，避免刷新后时间回退太多 */
    if(_autoSaveHours >= 24){
      _autoSaveHours = 0;
      if(currentGame && !isGameFailed() && typeof saveGame === 'function'){
        try{ saveGame(currentSlot, {silent:true}); }catch(e){}
      }
    }
    if(typeof checkTimeEvents === 'function' && !isStoryBlocking()) checkTimeEvents();
    if(isAutoTimeBlocked()) break;
  }
}
function startAutoTime(){
  if(_autoTimeTimer) return;
  _autoTimeLast = Date.now();
  _autoTimeAccum = 0;
  _autoSaveHours = 0;
  _autoTimeTimer = setInterval(autoTimeTick, 250);
}
function stopAutoTime(){
  if(_autoTimeTimer){ clearInterval(_autoTimeTimer); _autoTimeTimer = null; }
  _autoTimeAccum = 0;
}
document.addEventListener('visibilitychange', () => {
  _autoTimeLast = Date.now();
  _autoTimeAccum = 0;
  if(document.hidden && currentGame && !isGameFailed() && typeof saveGame === 'function'){
    try{ saveGame(currentSlot, {silent:true}); }catch(e){}
  }
});

/* ============================================================
   章节系统
   ============================================================ */

/* 主线 / 章节不再在代码里硬编码。
   章节大标题由剧情节点的「本节点作用 → 显示大标题(show_banner)」触发，
   剧情线本身在 data-lines.js（由剧情编辑器维护）。
   保留空表仅为兼容旧存档结构。 */
const MAIN_QUESTS = {};
const CHAPTER_TITLES = {};

function startChapter(n){
  if(!currentGame) return;
  currentGame.chapter = n;
  if(typeof updateQuestBadge === 'function') updateQuestBadge();
  checkStoryTriggers({type:'chapter_enter', chapter:n});
}

function advanceChapter(){
  if(!currentGame) return;
  startChapter((currentGame.chapter || 1) + 1);
}

/* ============================================================
   结局 / 限时失败（20 年）
   ------------------------------------------------------------
   showEnding({kind, title, text})：剧情节点「进入结局」动作和
   20 年坏结局统一走这里。
   · kind：'good' 好结局（绿）｜'bad' 坏结局（红）｜'normal' 普通（金）
   · 触发后标记 game_ended；坏结局额外标记 game_failed
   ============================================================ */

function showEnding(opts){
  opts = opts || {};
  if(!currentGame) return;
  if(typeof stopAutoTime === 'function') stopAutoTime();
  if(!currentGame.flags) currentGame.flags = {};
  const kind = opts.kind || 'normal';
  currentGame.flags['game_ended'] = true;
  if(kind === 'bad') currentGame.flags['game_failed'] = true;

  /* 关闭所有弹窗与战斗，避免结局画面被盖住 */
  document.querySelectorAll('.modal-overlay.show').forEach(el => el.classList.remove('show'));
  const bs = document.getElementById('battleScreen');
  if(bs) bs.classList.remove('show');

  const titleEl = document.getElementById('gameOverTitle');
  const msgEl = document.getElementById('gameOverMsg');
  if(titleEl){
    titleEl.textContent = opts.title || (kind === 'good' ? '通关' : '游戏结束');
    titleEl.style.color = kind === 'good' ? '#5cc98a' : (kind === 'bad' ? '#ff6688' : '#ffcc66');
  }
  if(msgEl) msgEl.textContent = opts.text || '';
  document.getElementById('gameOverModal').classList.add('show');
  try{ saveGame(currentSlot); }catch(e){}
}

function checkGameOver(){
  if(!currentGame) return false;
  if(currentGame.flags['game_failed']) return true;
  const t = currentGame.time;
  const totalDays = (t.year - 1) * 360 + (t.month - 1) * 30 + t.day;
  const LIMIT_DAYS = (typeof GAME_YEAR_LIMIT !== 'undefined' ? GAME_YEAR_LIMIT : 20) * 360;
  if(totalDays >= LIMIT_DAYS){
    showEnding({
      kind: 'bad',
      title: '游戏结束',
      text: `${typeof GAME_YEAR_LIMIT !== 'undefined' ? GAME_YEAR_LIMIT : 20} 年过去了，魔王已经占领人间。你的故事，到此为止。`
    });
    return true;
  }
  return false;
}

function isGameFailed(){
  return !!(currentGame && currentGame.flags && currentGame.flags['game_failed']);
}

/* ============================================================
   UI 工具
   ============================================================ */

function toast(msg){
  const el = document.getElementById('toast');
  if(!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

/* 剧情弹窗 / 队列正在处理时，阻断一切地图操作 */
function isStoryBlocking(){
  /* 剧情弹窗打开 */
  const sm = document.getElementById('storyModal');
  if(sm && sm.classList.contains('show')) return true;
  /* 角色死亡通知打开 */
  const dm = document.getElementById('deathModal');
  if(dm && dm.classList.contains('show')) return true;
  /* 剧情队列还有事件在排队 / 正在执行 */
  if(typeof _storyRunning !== 'undefined'){
    if(_storyRunning) return true;
    if(typeof _storyQueue !== 'undefined' && _storyQueue && _storyQueue.length > 0) return true;
  }
  return false;
}
function showConfirm(title, msg, onConfirm){
  document.getElementById('confirmActionTitle').textContent = title;
  document.getElementById('confirmActionMsg').textContent = msg;
  _confirmCallback = onConfirm;
  document.getElementById('confirmActionModal').classList.add('show');
  document.getElementById('confirmActionBtn').onclick = () => {
    const cb = _confirmCallback;
    _confirmCallback = null;
    document.getElementById('confirmActionModal').classList.remove('show');
    if(cb) cb();
  };
}

function closeConfirmAction(){
  document.getElementById('confirmActionModal').classList.remove('show');
  _confirmCallback = null;
}

/* ============================================================
   全屏报幕 —— 章节 / 称号共用
   ------------------------------------------------------------
   ============================================================ */
let _bannerQueue = [];
let _bannerRunning = false;

function showChapterTitle(text, opts){
  opts = opts || {};
  _bannerQueue.push({
    text: text,
    hold: opts.hold || 1500,
    done: opts.done || null
  });
  if(!_bannerRunning) runNextBanner();
}

function runNextBanner(){
  if(_bannerQueue.length === 0){ _bannerRunning = false; return; }
  _bannerRunning = true;
  const item = _bannerQueue.shift();
  const ov = document.getElementById('chapterOverlay');
  const t = document.getElementById('chapterTitle');
  if(!ov || !t){
    if(item.done) item.done();
    setTimeout(runNextBanner, 50);
    return;
  }
  t.textContent = item.text;
  ov.classList.remove('fade-out');
  ov.classList.add('show');
  setTimeout(() => {
    ov.classList.add('fade-out');
    setTimeout(() => {
      ov.classList.remove('show', 'fade-out');
      if(item.done) item.done();
      setTimeout(runNextBanner, 100);
    }, 500);
  }, item.hold);
}

/* ============================================================
   称号 · 统一入口
   ------------------------------------------------------------
   所有获得称号的地方都调 addTitle(tid)。
   内部：查重 → 去重 → 入库 → 报幕 → 刷新 UI
   报幕复用章节报幕的 showChapterTitle，视觉完全一致。
   参数：
     tid          称号 id（TITLES 的 key）
     opts.target  默认 currentGame；createNewGame 时传 game
     opts.silent  默认 false；true 则不报幕（用于开局赠送）
   ============================================================ */
function grantTitleSkills(target, t){
  if(!target || !t || !Array.isArray(t.activeSkills)) return;
  if(!target.skillProficiency) target.skillProficiency = {};
  if(!Array.isArray(target.equippedSkills)) target.equippedSkills = [null,null,null,null];
  t.activeSkills.forEach(function(sid){
    if(!sid || !SKILLS[sid]) return;
    if(target.skillProficiency[sid] === undefined) target.skillProficiency[sid] = 0;
    if(target.equippedSkills.indexOf(sid) < 0){
      const idx = target.equippedSkills.indexOf(null);
      if(idx >= 0) target.equippedSkills[idx] = sid;
    }
  });
}
function syncTitleSkills(target){
  if(!target || !Array.isArray(target.titles)) return;
  target.titles.forEach(function(tid){
    const t = (typeof TITLES !== 'undefined') ? TITLES[tid] : null;
    if(t) grantTitleSkills(target, t);
  });
}
function addTitle(tid, opts){
  opts = opts || {};
  const target = opts.target || currentGame;
  if(!target || !tid) return false;
  const t = (typeof TITLES !== 'undefined') ? TITLES[tid] : null;
  if(!t){ console.warn('[addTitle] 未知称号:', tid); return false; }
  if(!target.titles) target.titles = [];
  if(target.titles.includes(tid)) return false;   /* 已有，不重复 */
  target.titles.push(tid);
  grantTitleSkills(target, t);
  if(!opts.silent){
    showChapterTitle('获得称号 · ' + t.name);       /* 复用章节报幕 */
    if(typeof updateAllUI === 'function') updateAllUI();
  }
  return true;
}

/* 从 titles（id 数组）取第一个的显示名 */
function getFirstTitleName(){
  if(!currentGame || !currentGame.titles) return '无';
  const first = currentGame.titles[0];
  if(!first) return '无';
  const t = (typeof TITLES !== 'undefined') ? TITLES[first] : null;
  return t ? t.name : '无';
}

function showTransition(text, callback){
  const ov = document.getElementById('transitionOverlay');
  document.getElementById('transitionText').textContent = text;
  ov.classList.add('show');
  setTimeout(() => {
    ov.classList.remove('show');
    if(callback) callback();
  }, 900);
}

function hideAll(){
  document.querySelectorAll('.title-screen,.save-screen,.game-screen').forEach(e => e.style.display = 'none');
}
function showTitle(){ if(typeof stopAutoTime === 'function') stopAutoTime(); hideAll(); document.getElementById('titleScreen').style.display = 'flex'; }
function showSaveScreen(){ if(typeof stopAutoTime === 'function') stopAutoTime(); hideAll(); document.getElementById('saveScreen').style.display = 'block'; renderSaveSlots(); }
function backToTitle(){ if(typeof stopAutoTime === 'function') stopAutoTime(); showTitle(); }
function backToSaveScreen(){ if(typeof stopAutoTime === 'function') stopAutoTime(); if(currentGame) saveGame(currentSlot); showSaveScreen(); }
function manualSave(){
  if(!currentGame){ toast('没有可保存的游戏'); return; }
  showConfirm('保存游戏', '是否保存当前状态？', () => { saveGame(currentSlot); });
}

/* ============================================================
   存档
   ============================================================ */

/* 旧存档字符串称号 → id 的迁移表 */
const _TITLE_NAME_TO_ID = {};
Object.keys(TITLES).forEach(k => { _TITLE_NAME_TO_ID[TITLES[k].name] = k; });

function renderSaveSlots(){
  const grid = document.getElementById('saveGrid');
  if(!grid) return;
  grid.innerHTML = '';
  for(let i = 0; i < SAVE_COUNT; i++){
    const raw = localStorage.getItem(SAVE_KEY + i);
    const card = document.createElement('div');
    if(raw){
      let data;
      try{ data = JSON.parse(raw); }catch(e){ data = null; }
      if(data){
        const titles = data.titles || [];
        const firstTid = titles[0];
        const titleName = (firstTid && TITLES[firstTid]) ? TITLES[firstTid].name : '无';
        card.className = 'save-card';
        card.innerHTML = `<div class="save-id">存档 ${String(i+1).padStart(2,'0')}</div>
          <div class="save-name">${data.name || '无名'}</div>
          <div class="save-meta">称号：<b>${titleName}</b><br>时间：${data.time ? `${data.time.year}年${data.time.month}月${data.time.day}日` : '—'}</div>
          <div class="save-actions">
            <button class="save-btn primary" onclick="event.stopPropagation();loadAndStart(${i})">继续</button>
            <button class="save-btn danger" onclick="event.stopPropagation();deleteSave(${i})">删除</button>
          </div>`;
        card.onclick = () => loadAndStart(i);
      }else{
        card.className = 'save-card empty';
        card.innerHTML = `<div class="save-id">存档 ${String(i+1).padStart(2,'0')}</div><div class="save-empty-tip">损坏 · 点击重建</div>`;
        card.onclick = () => openCreateForSlot(i);
      }
    }else{
      card.className = 'save-card empty';
      card.innerHTML = `<div class="save-id">存档 ${String(i+1).padStart(2,'0')}</div><div class="save-empty-tip">空存档 · 点击创建</div>`;
      card.onclick = () => openCreateForSlot(i);
    }
    grid.appendChild(card);
  }
}

function deleteSave(slot){
  showConfirm('删除存档', `确定删除存档 ${slot+1}？`, () => {
    localStorage.removeItem(SAVE_KEY + slot);
    renderSaveSlots();
  });
}

function saveGame(slot, opts){
  if(!currentGame) return;
  if(slot === undefined || slot === null || slot < 0) slot = currentSlot;
  if(slot === undefined || slot === null || slot < 0) return;
  const silent = !!(opts && opts.silent);
  currentGame.currentTileId = currentTileId;
  currentGame.currentMapId = currentMapId;
  currentGame.currentMapLayer = currentMapLayer;

  const serializable = Object.assign({}, currentGame);
  serializable.characters = {};
  if(!currentGame.characters) currentGame.characters = currentGame.npcs || {};

  for(const id in currentGame.characters){
    const npc = currentGame.characters[id];
    const tpl = getCharacterTemplate(npc.templateId || id);
    if(!npc || !tpl) continue;
    const diff = {};
    NPC_DYNAMIC_FIELDS.forEach(key => {
      if(JSON.stringify(npc[key]) !== JSON.stringify(tpl[key])) diff[key] = npc[key];
    });
    /* 实例角色必须保留身份字段，否则读档无法还原副本 */
    if(npc.templateId && npc.templateId !== id){
      diff.templateId = npc.templateId;
      diff.instanceId = npc.instanceId || id;
    }
    if(Object.keys(diff).length > 0) serializable.characters[id] = diff;
  }
  /* 不再写重复的 npcs；旧存档读取时会迁移 */
  delete serializable.npcs;

  try{
    localStorage.setItem(SAVE_KEY + slot, JSON.stringify(serializable));
  }catch(e){
    if(e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22){
      toast('存档空间不足，请清理旧存档');
    }else{
      toast('保存失败：' + e.message);
    }
    return;
  }
  if(!silent) toast('已保存');
}

function openCreateForSlot(slot){
  currentSlot = slot;
  document.getElementById('playerName').value = '';
  selectedGender = '男';
  document.querySelectorAll('.gender-btn').forEach(b => b.classList.toggle('active', b.dataset.gender === '男'));
  document.getElementById('createModal').classList.add('show');
}
function closeCreateModal(){ document.getElementById('createModal').classList.remove('show'); }
function selectGender(g){
  selectedGender = g;
  document.querySelectorAll('.gender-btn').forEach(b => b.classList.toggle('active', b.dataset.gender === g));
}

function confirmCreate(){
  const name = document.getElementById('playerName').value.trim();
  if(!name){ toast('请输入名字'); return; }
  currentGame = createNewGame(name, selectedGender);
  closeCreateModal();
  saveGame(currentSlot);
  startGame();
}

function createNewGame(name, gender){
  const P = (typeof PLAYER_BASE_CONFIG !== 'undefined') ? PLAYER_BASE_CONFIG : {};
  const pBase = P.base || {};
  const pGrowth = P.growth || {};
  const startLevel = Math.max(1, Math.floor(Number(P.startLevel) || 1));
  const startMoney = Number.isFinite(Number(P.startMoney)) ? Math.max(0, Number(P.startMoney)) : 30;
  const startTitle = P.startTitle || 't_ray_grandson';
  const game = {
    name, gender: gender || '男', race: '人族',
    titles:[startTitle].filter(Boolean),
    chapter: 1,
    classes:['',''], level:startLevel, exp:0, expMax: calcExpMax(startLevel),
    hp:0, maxHp:0, mp:0, maxMp:0, def:0, spd:0,
    base:{
      vit: Number.isFinite(Number(pBase.vit)) ? Number(pBase.vit) : 8,
      spi: Number.isFinite(Number(pBase.spi)) ? Number(pBase.spi) : 6
    },
    growth:{
      vit: Number.isFinite(Number(pGrowth.vit)) ? Number(pGrowth.vit) : 1.5,
      spi: Number.isFinite(Number(pGrowth.spi)) ? Number(pGrowth.spi) : 1.2
    },
    money:startMoney,
    time:{year:1, month:1, day:1, hour:8},
    queue:{
      front:['player', null, null],
      back:[null, null],
      rest:[null, null, null, null]
    },
    pets:{ front:null, back:null },
    petBag:[],
    bag:[{id:'item_c001', count:2}],
    equipment:makeEmptyEquipment(),
    equippedSkills:[null, null, null, null],
    skillProficiency:{},
    flags:{},
    npcs:{},
    /* 地图挂载点的物种个体年龄/刷新状态；唯一角色不用这里 */
    actorStates:{},
    mainlineInvalidFromChapter:null,
    lineState:{
      'line-player-001': { nodeIdx: 0, status: 'active' }
    }
  };
  applyGrowth(game);
  game.hp = game.maxHp;
  game.mp = game.maxMp;
  ensureNpcs(game);
  syncTitleSkills(game);
  return game;
}

function loadAndStart(slot){
  const raw = localStorage.getItem(SAVE_KEY + slot);
  if(!raw) return;
  try{
    currentGame = JSON.parse(raw);
  }catch(e){
    toast('存档损坏');
    return;
  }
  currentSlot = slot;

  /* 旧存档兼容 */
  if(!currentGame.gender) currentGame.gender = '男';
  if(!currentGame.chapter) currentGame.chapter = 1;
  if(!Array.isArray(currentGame.classes)) currentGame.classes = ['',''];
  if(!Array.isArray(currentGame.bag)) currentGame.bag = [];
  if(!currentGame.pets || typeof currentGame.pets !== 'object') currentGame.pets = {front:null, back:null};
  if(!Array.isArray(currentGame.petBag)) currentGame.petBag = [];
  if(!currentGame.queue) currentGame.queue = {front:['player',null,null], back:[null,null], rest:[null,null,null,null]};
  if(!Array.isArray(currentGame.titles)) currentGame.titles = [];
  /* 旧存档 titles 迁移：中文名 / 对象 → id */
  currentGame.titles = currentGame.titles.map(t => {
    if(typeof t === 'string'){
      if(TITLES[t]) return t;                                    /* 已是 id */
      if(_TITLE_NAME_TO_ID[t]) return _TITLE_NAME_TO_ID[t];      /* 旧中文名 */
      return null;                                               /* 未知，丢弃 */
    }
    if(t && typeof t === 'object'){
      if(t.id && TITLES[t.id]) return t.id;
      if(t.name && _TITLE_NAME_TO_ID[t.name]) return _TITLE_NAME_TO_ID[t.name];
    }
    return null;
  }).filter(Boolean);
  /* 旧存档：npcs → 统一 characters */
  if(!currentGame.characters) currentGame.characters = currentGame.npcs || {};
  if(!currentGame.characters || typeof currentGame.characters !== 'object') currentGame.characters = {};
  /* 装备槽迁移：旧三槽 → 新 8 槽（含玩家自身） */
  currentGame.equipment = migrateEquipment(currentGame.equipment);
  if(!Array.isArray(currentGame.equippedSkills)) currentGame.equippedSkills = [null,null,null,null];
  if(!currentGame.skillProficiency) currentGame.skillProficiency = {};
  if(!currentGame.flags) currentGame.flags = {};
  /* 一级属性迁移：玩家也使用自己的 base / growth；
     缺失时用 PLAYER_BASE_CONFIG 兜底（职业不再提供属性模板） */
  normalizeCharAttributeModel(currentGame, (typeof PLAYER_BASE_CONFIG !== 'undefined') ? PLAYER_BASE_CONFIG : null);

  ensureNpcs(currentGame);
  syncTitleSkills(currentGame);

  /* 用最新成长公式重算所有角色属性（含旧存档），HP/MP 按比例回填 */
  (function recalcAll(){
    const chars = [currentGame];
    for(const id in currentGame.npcs){
      const npc = currentGame.npcs[id];
      if(npc && !npc.isEnv) chars.push(npc);
    }
    chars.forEach(c => recalcCharStats(c));
  })();

  currentMapId = currentGame.currentMapId || 'region01-town01';
  currentTileId = currentGame.currentTileId || 'region01-town01-12';
  currentMapLayer = 'street';

  /* 读档后，根据 NPC 的 homeTile 重建地图位置（处理退队换位置的情况） */
  resyncNpcPositions();

  /* 年龄/死亡状态在挂载重建之后应用，避免死人被 resync 放回地图 */
  ensureActorAges();
  applyDeathState();

  startGame();
}

function startGame(){
  if(typeof stopAutoTime === 'function') stopAutoTime();
  hideAll();
  document.getElementById('gameScreen').style.display = 'flex';
  const storyBox = document.getElementById('storyBox');
  storyBox.innerHTML = '';
  appendStory('', '你睁开眼，发现自己躺在一张粗糙的木床上。\n屋顶是低矮的木梁，窗外传来鸡鸣和炊烟的味道。', 'narration');
  currentTalkNpc = null;
  updateActionButtons();
  updateAllUI();
  switchMapLayer('street');

  /* 任务面板统一由剧情引擎 lineState 驱动（见 story.js），这里不再往旧 quests 表塞数据。 */
  if(typeof initOpeningStory === 'function') initOpeningStory();
  if(typeof updateQuestBadge === 'function') updateQuestBadge();

  if(!currentGame.flags['prologue_done']){
    setTimeout(() => { showPrologue(); }, 600);
  }

  /* 自动时间：读档/新游戏后启动；弹窗/战斗/后台会暂停 */
  if(typeof startAutoTime === 'function') startAutoTime();
}

/* ============================================================
   UI 刷新
   ============================================================ */

function updateAllUI(){
  if(!currentGame) return;
  document.getElementById('uiPlayerName').textContent = currentGame.name;
  document.getElementById('uiPlayerLv').textContent = 'Lv.' + currentGame.level;
  document.getElementById('uiPlayerMoney').textContent = '￥' + currentGame.money;

  const c1 = currentGame.classes[0] || '';
  const c2 = currentGame.classes[1] || '';
  const e1 = document.getElementById('uiClass1');
  const e2 = document.getElementById('uiClass2');
  e1.textContent = c1 || '—';
  e1.className = 'class-tag' + (c1 ? '' : ' empty');
  e2.textContent = c2 || '—';
  e2.className = 'class-tag' + (c2 ? '' : ' empty');

  const maxHpTotal = getFinalMaxHp(currentGame);
  const maxMpTotal = getFinalMaxMp(currentGame);
  if(currentGame.hp > maxHpTotal) currentGame.hp = maxHpTotal;
  if(currentGame.mp > maxMpTotal) currentGame.mp = maxMpTotal;
  document.getElementById('uiHpText').textContent = `HP ${currentGame.hp}/${maxHpTotal}`;
  document.getElementById('uiHpBar').style.width = (currentGame.hp / maxHpTotal * 100) + '%';

  document.getElementById('uiMpText').textContent = `MP ${currentGame.mp}/${maxMpTotal}`;
  document.getElementById('uiMpBar').style.width = (currentGame.mp / maxMpTotal * 100) + '%';

  document.getElementById('uiExpText').textContent = `EXP ${currentGame.exp}/${currentGame.expMax}`;
  document.getElementById('uiExpBar').style.width = (currentGame.exp / currentGame.expMax * 100) + '%';

  document.getElementById('uiTitleName').textContent = getFirstTitleName();
  document.getElementById('uiTimeBtn').textContent = getTimeStr();

  renderNpcRow();
  updateQuestBadge();

  const bm = document.getElementById('bagMoney');
  if(bm) bm.textContent = '￥' + currentGame.money;
}

function updateQuestBadge(){
  const badge = document.getElementById('questBadge');
  if(!badge || !currentGame) return;
  let active = 0;
  const ls = currentGame.lineState || {};
  for(const lineId in ls){
    const st = ls[lineId];
    if(!st || st.status === 'done' || st.status === 'invalid') continue;
    if(typeof isLineInvalid === 'function' && isLineInvalid(lineId)) continue;
    const line = (typeof LINES !== 'undefined') ? LINES[lineId] : null;
    if(line && st.nodeIdx >= (line.nodes || []).length) continue;
    active++;
  }
  if(active > 0){
    badge.textContent = active;
    badge.style.display = 'inline-block';
  }else{
    badge.style.display = 'none';
  }
}

function getTileEnvs(tile){
  const result = [];
  if(!tile || !tile.env) return result;
  tile.env.forEach(item => {
    if(typeof item === 'string'){
      result.push(item);
    }else if(item && item.name){
      /* 由节点 unlock_env 动作解锁 */
      const envKey = tile.id + '::' + item.name;
      const unlockOk = currentGame.unlockedEnvs && currentGame.unlockedEnvs.includes(envKey);
      if(!unlockOk) return;
      result.push(item.name);
    }
  });
  return result;
}

/* ============================================================
   通用简略角色卡
   ------------------------------------------------------------
   地图挂载角色 / 战斗队列 / 行囊角色选择 统一用这一套：
   姓名 + 性别 / 种族 / 职业 + HP·MP 颜色条。
   opts: { level, hp, maxHp, mp, maxMp, gender, race, job, badge, actions }
   ============================================================ */
function charCardEsc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, ch => (
    {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]
  ));
}

function charBriefCard(c, opts){
  opts = opts || {};
  const lv = (opts.level != null && isFinite(opts.level)) ? Math.round(opts.level) : (c.level || 1);
  const maxHp = Math.max(1, Math.round(Number(opts.maxHp != null ? opts.maxHp : (c.maxHp || c.hp || 1)) || 1));
  const hp = Math.max(0, Math.min(maxHp, Math.round(Number(opts.hp != null ? opts.hp : (c.hp || 0)) || 0)));
  const maxMp = Math.max(1, Math.round(Number(opts.maxMp != null ? opts.maxMp : (c.maxMp || c.mp || 1)) || 1));
  const mp = Math.max(0, Math.min(maxMp, Math.round(Number(opts.mp != null ? opts.mp : (c.mp || 0)) || 0)));

  const gender = opts.gender != null ? opts.gender : (c.gender || '');
  let race = opts.race != null ? opts.race : (c.race || '');
  /* 主角在建号时没有存种族字段，统一按人族显示 */
  if(!race && typeof currentGame !== 'undefined' && c === currentGame) race = '人族';
  const job = opts.job != null ? opts.job
    : (((c.classes || []).filter(Boolean).join('·')) || c.class || '');

  const pct = (v, m) => (m > 0 ? Math.max(0, Math.min(100, v / m * 100)) : 0).toFixed(1) + '%';
  const bits = [];
  if(gender) bits.push(`<span class="cc-sex">${charCardEsc(gender)}</span>`);
  if(race)   bits.push(`<span class="cc-race">${charCardEsc(race)}</span>`);
  if(job)    bits.push(`<span class="cc-job">${charCardEsc(job)}</span>`);

  return `<div class="cc">
    <div class="cc-head">
      <span class="cc-name">${charCardEsc(c.name)}</span>
      <span class="cc-lv">Lv.${lv}</span>
      ${opts.badge || ''}
    </div>
    ${bits.length ? `<div class="cc-sub">${bits.join('<span class="cc-dot">·</span>')}</div>` : ''}
    <div class="cc-bars">
      <div class="cc-bar cc-hpbar"><i style="width:${pct(hp, maxHp)}"></i><em>${hp}/${maxHp}</em></div>
      <div class="cc-bar cc-mpbar"><i style="width:${pct(mp, maxMp)}"></i><em>${mp}/${maxMp}</em></div>
    </div>
    ${opts.actions ? `<div class="cc-actions">${opts.actions}</div>` : ''}
  </div>`;
}

function renderNpcRow(){
  const row = document.getElementById('npcRow');
  row.innerHTML = '';
  /* 惰性检查：到期的宠物挂载点先恢复，再渲染 */
  refreshPetRespawns();
  const tile = getCurrentTile();
  const actors = buildTileActors(tile);

  /* 地图角色：隐藏 / 已招募且不刷新 / 条件不满足 → 不显示 */
  const shown = actors.filter(actor => {
    const npc = getNpc(actor.charId);
    if(!npc) return false;
    /* 唯一角色老死后永久不显示 */
    if(npc.deceased && isCharacterUnique(npc)) return false;
    /* 宠物收服后未到 48 小时刷新点 → 不显示 */
    if(actor.removedAt != null) return false;
    if(actor.condition){
      const flag = typeof actor.condition === 'string' ? actor.condition : actor.condition.flag;
      if(flag && !(currentGame.flags && currentGame.flags[flag])) return false;
    }
    if(actor.hidden || npc.isHidden){
      if(!(currentGame.unlockedNpcs && currentGame.unlockedNpcs.includes(actor.charId))) return false;
    }
    if(isNpcRecruited(actor.charId) && !actor.respawn) return false;
    return true;
  });

  const entries = shown.map(actor => ({ kind:'actor', id:actor.charId, actor }));
  getTileEnvs(tile).forEach(envName => {
    const envId = envNameToId(envName);
    if(envId) entries.push({ kind:'env', id:envId, actor:null });
  });

  for(let i = 0; i < 5; i++){
    const slot = document.createElement('div');
    if(i < entries.length){
      const entry = entries[i];
      const npc = getNpc(entry.id);
      if(npc){
        const isActive = currentTalkNpc === npc.id && (!entry.actor || currentTalkPlacementId === entry.actor.placementId);
        /* 检查这个npc/环境身上有没有满足触发条件+判断条件的待跑剧情 */
        let hasReadyStory = false;
        if(typeof LINES !== 'undefined' && currentGame.lineState){
          for(const lid in LINES){
            const ls = currentGame.lineState[lid];
            if(!ls || ls.status === 'done') continue;
            const line = LINES[lid];
            if(ls.nodeIdx >= line.nodes.length) continue;
            const node = line.nodes[ls.nodeIdx];
            if(!node.on) continue;
            if(npc.isEnv){
              /* 环境卡：按「当前格 + 环境卡名字」精确匹配 */
              if(node.on.type === 'env_interact'
                 && node.on.tileId === currentTileId
                 && node.on.envName === npc.name){
                if(checkConditionList(node.requires || [])) hasReadyStory = true;
              }
            }else{
              if(node.on.type === 'npc_talk' && node.on.npcId === npc.id){
                if(checkConditionList(node.requires || [])) hasReadyStory = true;
              }
            }
          }
        }
        if(npc.isEnv){
          slot.className = 'npc-slot env' + (isActive ? ' active' : '') + (hasReadyStory ? ' glow' : '');
          slot.innerHTML = `<div class="cc">
            <div class="cc-head"><span class="cc-name">${charCardEsc(npc.name)}</span><span class="npc-tap">点击</span></div>
            <div class="cc-sub"><span class="cc-job">环境 · 可交互</span></div>
          </div>`;
        }else{
          const lv = entry.actor ? entry.actor.level : (npc.suggestedLevel || npc.level || 1);
          const recruited = isNpcRecruited(npc.id) || isPetOwned(npc.id);
          const asPet = isPetOwned(npc.id) || !!(entry.actor && entry.actor.recruitMode === 'pet');
          const lvStats = getCharAttrStats(npc, lv);
          slot.className = 'npc-slot filled' + (isActive ? ' active' : '') + (hasReadyStory ? ' glow' : '');
          const badge = `<span class="npc-tap">点击</span>` +
            (recruited ? `<span class="npc-tag">${asPet ? '已收服' : '已招募'}</span>` : '');
          slot.innerHTML = charBriefCard(npc, {
            level: lv,
            hp: lvStats.maxHp, maxHp: lvStats.maxHp,
            mp: lvStats.maxMp, maxMp: lvStats.maxMp,
            badge
          });
        }
        slot.onclick = () => clickNpcName(npc.id, entry.actor ? entry.actor.placementId : null, entry.actor ? entry.actor.level : (npc.suggestedLevel || npc.level || 1));
      }
    }else{
      slot.className = 'npc-slot empty';
      slot.innerHTML = '<div class="npc-name" style="color:#445">—</div>';
    }
    row.appendChild(slot);
  }
}

function envNameToId(name){
  if(!name) return null;
  for(const id in ENVIRONMENTS){
    if(ENVIRONMENTS[id] && ENVIRONMENTS[id].name === name) return id;
  }
  return null;
}

function getCurrentTile(){
  const map = MAPS[currentMapId];
  if(!map) return null;
  return map.tiles.find(t => t.id === currentTileId);
}

function appendStory(speaker, text, type){
  const box = document.getElementById('storyBox');
  const line = document.createElement('div');
  line.className = 'story-line ' + (type || 'npc');
  if(speaker){
    line.innerHTML = `<span class="speaker">【${speaker}】</span>${text}`;
  }else{
    line.textContent = text;
  }
  box.appendChild(line);
  box.scrollTop = box.scrollHeight;
}

function updateActionButtons(){
  const hasTarget = currentTalkNpc && getNpc(currentTalkNpc);
  const npc = hasTarget ? getNpc(currentTalkNpc) : null;
  const btnTalk = document.getElementById('btnTalk');
  const btnInteract = document.getElementById('btnInteract');
  const btnView = document.getElementById('btnView');
  if(btnTalk) btnTalk.disabled = !hasTarget || (npc && npc.isEnv);   // 环境物体只能互动不能对话
  if(btnView) btnView.disabled = !hasTarget;

  /* 互动按钮：只要选中了NPC/环境就亮（所有NPC都可互动） */
  let interactable = false;
  if(hasTarget){
    interactable = true;   // 所有NPC和环境都可以互动
  }
  if(btnInteract) btnInteract.disabled = !interactable;
}

function toggleViewDropdown(id){
  const el = document.getElementById(id);
  if(el) el.parentElement.classList.toggle('open');
}

/* ============================================================
   ============================================================ */

function getAffinityDialogue(npcId){
  const npc = getNpc(npcId);
  if(!npc) return null;
  const ad = npc.affinityDialogue;
  if(!ad) return null;
  const aff = npc.affinity || 0;
  const keys = Object.keys(ad).map(Number).filter(k => k <= aff).sort((a,b) => b - a);
  if(keys.length === 0) return null;
  const seg = ad[keys[0]];
  if(!seg || seg.length === 0) return null;
  return seg[Math.floor(Math.random() * seg.length)];
}

/* ============================================================
   行囊
   ============================================================ */

function addItemToBag(itemId, wear, durability, inst){
  const tpl = EQUIPS[itemId];
  if(!tpl) return false;

  /* 先按模板生成实例，再用传入的实例字段覆盖（品阶 / 词条 / 磨损） */
  const it = { id:itemId, count:1 };
  if(tpl.rarity) it.rarity = tpl.rarity;
  if(Array.isArray(tpl.words) && tpl.words.length) it.words = JSON.parse(JSON.stringify(tpl.words));
  if(inst){
    if(inst.rarity) it.rarity = inst.rarity;
    if(Array.isArray(inst.words)) it.words = JSON.parse(JSON.stringify(inst.words));
  }
  const maxWear = tpl.maxWear;
  const maxDur = tpl.durability;
  if(maxWear) it.wear = (wear === undefined ? maxWear : wear);
  if(maxDur) it.durability = (durability === undefined ? maxDur : durability);

  /* 只有"没被进阶过、词条与模板一致"的实例才能堆叠 */
  const plain = isPlainInstance(it, tpl);
  if(plain){
    const existing = currentGame.bag.find(b =>
      b.id === itemId &&
      isPlainInstance(b, tpl) &&
      (!maxWear || b.wear === undefined || b.wear === maxWear) &&
      (!maxDur || b.durability === undefined || b.durability === maxDur)
    );
    if(existing){
      if(existing.count >= STACK_MAX){ toast('行囊中该物品已达上限'); return false; }
      existing.count++;
      return true;
    }
  }
  currentGame.bag.push(it);
  return true;
}

/* ============================================================
   招募 / 踢出
   ============================================================ */

function lancelotMoveHome(){
  const lance = getNpc('npc017');
  if(!lance) return;
  lance.homeTile = 'region01-town01-09';
  _removeCharacterPlacements('npc017');
  _addCharacterPlacement('npc017', 'region01-town01-09');
  renderNpcRow();
}

/* 根据所有"已变动过"的 NPC 的 homeTile，重建地图上的 npcs 数组。
   已变动过 = 曾被招募入队（flags['npc_'+id+'_recruited']）。
   没变动过的 NPC 保持在 data-world.js 里的初始挂载点不动。 */
function _findCharacterTiles(id){
  const out = [];
  for(const mapId in MAPS){
    (MAPS[mapId].tiles || []).forEach(tile => {
      if((tile.npcs || []).includes(id) || (tile.actors || []).some(a => a.charId === id)){
        out.push(tile);
      }
    });
  }
  return out;
}
function _removeCharacterPlacements(id){
  for(const mapId in MAPS){
    (MAPS[mapId].tiles || []).forEach(tile => {
      if(Array.isArray(tile.npcs)){
        tile.npcs = tile.npcs.filter(x => x !== id);
      }
      if(Array.isArray(tile.actors)){
        tile.actors = tile.actors.filter(a => {
          if(a && a.charId === id){
            if(currentGame && currentGame.actorStates && a.placementId) delete currentGame.actorStates[a.placementId];
            return false;
          }
          return true;
        });
      }
    });
  }
}
function _addCharacterPlacement(id, tileId){
  if(isCharacterDeceased(id)) return;
  for(const mapId in MAPS){
    const tile = (MAPS[mapId].tiles || []).find(t => t.id === tileId);
    if(!tile) continue;
    const tpl = CHARACTERS[id] || {};
    if(!Array.isArray(tile.npcs)) tile.npcs = [];
    if(!tile.npcs.includes(id)) tile.npcs.push(id);
    if(!Array.isArray(tile.actors)) tile.actors = [];
    if(!tile.actors.some(a => a.charId === id)){
      /* 退队回归时保留实例实际等级（经验随之保留），新角色才用模板建议等级 */
      const inst = currentGame.characters && currentGame.characters[id];
      const lv = (inst && Number(inst.level)) || 1;
      const actor = (typeof normalizeActor === 'function') ? normalizeActor({
        charId:id, level:lv,
        recruitMode: inst && inst.recruitMode ? inst.recruitMode : undefined,
        respawn: inst && inst.respawnAfterRecruit !== undefined ? !!inst.respawnAfterRecruit : !!tpl.respawnAfterRecruit,
        returnTile: (inst && inst.returnTile) || tile.id,
        mode:'npc',
        placementId: tile.id + '::' + id + '::' + tile.actors.length
      }, lv) : {
        charId:id, level:lv, respawn:!!tpl.respawnAfterRecruit, mode:'npc',
        placementId: tile.id + '::' + id + '::' + tile.actors.length
      };
      if(!isCharacterUnique(tpl)){
        actor.spawnAge = getAppearanceAge(tpl);
        actor.spawnedAt = timeToHours(currentGame.time);
      }
      tile.actors.push(actor);
      if(!isCharacterUnique(tpl)) syncActorState(actor);
    }
    return;
  }
}
function resyncNpcPositions(){
  for(const id in CHARACTERS){
    const tpl = CHARACTERS[id];
    if(!tpl) continue;
    const _inst = currentGame && currentGame.characters && currentGame.characters[id];
    const _cfg = (_inst && _inst.recruitedFrom && typeof placementActorConfig === 'function')
      ? placementActorConfig(id, _inst.recruitedFrom) : null;
    /* 只处理唯一挂载、不刷新的角色；可多点挂载/可刷新角色由刷新机制处理 */
    if(_cfg ? (_cfg.respawn || !_cfg.unique) : (tpl.respawnAfterRecruit || tpl.allowMultipleMount)) continue;
    const npc = getNpc(id);
    if(!npc || npc.isEnv) continue;
    if(npc.deceased) continue;
    if(!currentGame || !currentGame.flags['npc_'+id+'_recruited']) continue;
    /* 挂载点 returnTile 是退队回归主路径；旧 homeTile / recruitedFrom 兜底 */
    const targetTile = npc.returnTile || npc.homeTile
      || (npc.recruitedFrom ? npc.recruitedFrom.split('::')[0] : null);
    if(!targetTile) continue;

    const tiles = _findCharacterTiles(id);
    if(tiles.length === 1 && tiles[0].id === targetTile) continue;
    _removeCharacterPlacements(id);
    _addCharacterPlacement(id, targetTile);
  }
}

function _templateIdOf(id){ return String(id || '').split('#')[0]; }
function _placementLevel(placementId){
  if(!placementId) return 1;
  const tile = getCurrentTile();
  if(!tile) return 1;
  const a = buildTileActors(tile).find(x => x.placementId === placementId);
  return a ? a.level : 1;
}
function _removePlacement(placementId, charId){
  if(!placementId) return;
  for(const mapId in MAPS){
    const tile = MAPS[mapId].tiles.find(t => t.id === (placementId.split('::')[0] || ''));
    if(!tile) continue;
    if(Array.isArray(tile.actors)){
      const idx = tile.actors.findIndex(a => (a.placementId || '') === placementId);
      if(idx >= 0) tile.actors.splice(idx, 1);
    }
    if(Array.isArray(tile.npcs)){
      const idx = tile.npcs.indexOf(charId);
      if(idx >= 0) tile.npcs.splice(idx, 1);
    }
    return;
  }
}

/* 宠物收服：挂载点标记 removedAt（保留记录用于 2 天后恢复），
   同时从旧字段 tile.npcs 移除。成功返回 true。 */
function _markPetPlacementRemoved(placementId, charId){
  if(!placementId) return false;
  const tileId = placementId.split('::')[0] || '';
  for(const mapId in MAPS){
    const tile = MAPS[mapId].tiles.find(t => t.id === tileId);
    if(!tile) continue;
    if(Array.isArray(tile.actors)){
      const a = tile.actors.find(x => (x.placementId || '') === placementId);
      if(a){
        a.removedAt = timeToHours(currentGame.time);
        syncActorState(a);
        if(Array.isArray(tile.npcs)){
          const idx = tile.npcs.indexOf(charId);
          if(idx >= 0) tile.npcs.splice(idx, 1);
        }
        return true;
      }
    }
    return false;
  }
  return false;
}

/* 统一入队函数：宠物与队友共用同一套逻辑，仅由 isPet 开关决定入位，
   由 respawnAfterRecruit/allowMultipleMount 决定挂载处理；与 id 前缀无关。 */
function enlistCharacter(id, placementId){
  if(!currentGame.pets) currentGame.pets = {front:null, back:null};
  if(!Array.isArray(currentGame.petBag)) currentGame.petBag = [];
  if(typeof battleState !== 'undefined' && battleState && !battleState.over){
    toast('战斗中不能招募。'); return;
  }
  const template = (typeof effectiveCharacterForPlacement === 'function'
    ? effectiveCharacterForPlacement(id, placementId)
    : null) || getCharacterTemplate(id);
  if(!template) return;
  const asPet = !!template.isPet;
  const cardTemplate = getCharacterTemplate(template.id) || template;
  const speciesMode = !isCharacterUnique(cardTemplate);
  if(!speciesMode && isCharacterDeceased(template.id)){
    toast(`【${template.name}】已经离世。`); return;
  }

  /* 资格：宠物走 isAdoptablePet，队友走 isRecruitableCharacter（均为开关判断） */
  if(asPet){
    if(!isAdoptablePet(template)){ toast('这个角色不能作为宠物。'); return; }
  }else{
    if(!isRecruitableCharacter(template)){ toast(`${template.name} 的阵营不会接受你的招募。`); return; }
  }

  /* 好感度阈值：与详情面板按钮口径一致，检查模板 id 的持久状态 */
  const threshold = template.affinityThreshold !== undefined && template.affinityThreshold !== null
    ? template.affinityThreshold : 90;
  const affState = currentGame.characters && currentGame.characters[template.id];
  const aff = affState ? (affState.affinity || 0) : 0;
  if(aff < threshold){
    toast(`好感度达到 ${threshold} 才能${asPet ? '收服' : '招募'} ${template.name}。`); return;
  }
  if(template.joinCondition && !currentGame.flags[template.joinCondition]){
    toast(asPet ? `${template.name} 还不愿意跟你走。` : `${template.name} 摇了摇头，似乎还不想跟你走。`);
    return;
  }

  /* 容量 / 冲突：宠物看宠物区，队友看队伍上限与冲突 */
  if(asPet){
    if(!canAdoptPet(template)){ toast('宠物区已满，或这只宠物已经在队伍/行囊里。'); return; }
  }else{
    if(!canRecruitAnother(template)){ toast(`${template.name} 已经在队伍里了。`); return; }
    if(countParty() >= 5){ toast(`${template.name} 于其他人不熟，拒绝了你的邀请。`); return; }
    const conflict = checkNpcConflict(template.id);
    if(conflict){
      toast(`${template.name} 看到队伍里的【${conflict.name}】，转身就走。`); return;
    }
  }

  /* 多副本：可复数角色每次创建独立实例；非唯一物种也强制独立实例，
     否则收服的宠物会和地图刷新的同种个体共享年龄/状态。 */
  const makeCopy = !!template.allowMultipleCopies || speciesMode;
  let instanceId = template.id;
  if(makeCopy){
    let n = 1;
    const taken = x => !!currentGame.characters[x] || (asPet ? isPetOwned(x) : isNpcRecruited(x));
    while(taken(template.id + '#' + n)) n++;
    instanceId = template.id + '#' + n;
  }else if(asPet){
    if(isPetOwned(instanceId)){ toast('这只宠物已经在队伍/行囊里了。'); return; }
  }else if(currentGame.characters[instanceId] && isNpcRecruited(instanceId)){
    toast(`${template.name} 已经在队伍里了。`); return;
  }

  /* 建/取实例：新实例按挂载点等级初始化；已有持久状态（好感/装备/等级）不被覆盖 */
  let inst = currentGame.characters[instanceId];
  const srcActor = (speciesMode && typeof findPlacementActor === 'function')
    ? findPlacementActor(template.id, placementId) : null;
  const _spawnAge = srcActor && srcActor.spawnAge != null ? srcActor.spawnAge : getAppearanceAge(template);
  const _spawnedAt = srcActor && srcActor.spawnedAt != null ? srcActor.spawnedAt : timeToHours(currentGame.time);
  if(!inst){
    inst = dcClone(template);
    inst.id = instanceId;
    inst.templateId = template.id;
    inst.instanceId = instanceId;
    if(asPet) inst.isPet = true;
    inst.recruitMode = asPet ? 'pet' : 'companion';
    inst.returnTile = template.homeTile || null;
    inst.level = _placementLevel(placementId) || 1;
    inst.exp = 0;
    inst.expMax = calcExpMax(inst.level);
    applyDerivedAttrStats(inst);
    inst.hp = inst.maxHp;
    inst.mp = inst.maxMp;
    if(speciesMode){
      inst.spawnAge = _spawnAge;
      inst.spawnedAt = _spawnedAt;
    }
    currentGame.characters[instanceId] = inst;
  }else{
    inst.templateId = template.id;
    inst.instanceId = inst.instanceId || instanceId;
    inst.recruitMode = asPet ? 'pet' : 'companion';
    if(template.homeTile) inst.returnTile = template.homeTile;
    if(asPet) inst.isPet = true;
    if(speciesMode && inst.spawnAge == null){
      inst.spawnAge = _spawnAge;
      inst.spawnedAt = _spawnedAt;
    }
    /* 首次入队按挂载点初始化；已在队/已拥有则保留自身状态 */
    const already = asPet ? isPetOwned(instanceId) : isNpcRecruited(instanceId);
    if(!already){
      inst.level = _placementLevel(placementId) || inst.level || 1;
      inst.exp = 0;
      inst.expMax = calcExpMax(inst.level);
      applyDerivedAttrStats(inst);
      inst.hp = inst.maxHp;
      inst.mp = inst.maxMp;
    }
    if(!inst.maxHp) applyDerivedAttrStats(inst);
    inst.dead = false;
    if(inst.hp <= 0) inst.hp = inst.maxHp;
  }
  if(inst && inst.deceased){ toast(`【${template.name}】已经离世。`); return; }
  currentGame.npcs = currentGame.characters;

  /* 入位：宠物进 pets/petBag，队友进 queue */
  let placed = false;
  if(asPet){
    const free = firstFreePetSlot();
    if(free){
      currentGame.pets[free] = instanceId; placed = true;
    }else if(currentGame.petBag.length < 9){
      currentGame.petBag.push(instanceId); placed = true;
    }else{
      toast('宠物行囊已满（9/9）'); return;
    }
  }else{
    const q = currentGame.queue;
    for(const row of ['front','back','rest']){
      for(let i = 0; i < q[row].length; i++){
        if(!q[row][i]){ q[row][i] = instanceId; placed = true; break; }
      }
      if(placed) break;
    }
  }
  if(!placed) return;

  /* 挂载处理：宠物标 removedAt 走 48h 刷新；队友按 respawnAfterRecruit 决定物理移除 */
  if(asPet){
    if(speciesMode){
    if(!_markPetPlacementRemoved(placementId, template.id)){
      _removePlacement(placementId, template.id);
      }
    }else{
      /* 唯一角色被收服后不能再在地图上留一个“同一个人” */
      _removeCharacterPlacements(template.id);
    }
    currentGame.flags['pet_' + template.id + '_adopted'] = true;
    toast(`${template.name} 成为了你的宠物`);
  }else{
    currentGame.flags['npc_' + template.id + '_recruited'] = true;
    inst.recruitedFrom = placementId;
    if(!speciesMode || !template.respawnAfterRecruit){
      _removeCharacterPlacements(template.id);
    }
    toast(`${template.name} 同意你的邀请`);
  }

  updateAllUI();
  if(typeof renderBag === 'function') renderBag();
  if(typeof renderQueue === 'function') renderQueue();
  if(typeof checkStoryTriggers === 'function') checkStoryTriggers(null);
  renderNpcRow();
}

function checkNpcConflict(newNpcId){
  const newNpc = getNpc(newNpcId);
  if(!newNpc) return null;
  const newBase = _templateIdOf(newNpcId);
  const q = currentGame.queue;
  const party = [];
  ['front','back','rest'].forEach(r => q[r].forEach(id => { if(id && id !== 'player') party.push(id); }));
  for(const pid of party){
    const p = getNpc(pid);
    if(!p) continue;
    const pBase = _templateIdOf(p.templateId || pid);
    if((newNpc.rivals || []).includes(pBase) || (newNpc.rivals || []).includes(pid)) return p;
    if((newNpc.dislikes || []).includes(pBase) || (newNpc.dislikes || []).includes(pid)) return p;
    if((p.rivals || []).includes(newBase)) return p;
    if((p.dislikes || []).includes(newBase)) return p;
  }
  return null;
}

/* ============================================================
   地图
   ============================================================ */
function getMapRegionId(mapId){
  if(!mapId) return null;
  /* 新地图可以在数据里显式写 region（不靠 id 前缀）；旧地图继续按 region\d+ 兼容 */
  if(typeof MAPS !== 'undefined' && MAPS[mapId] && Object.prototype.hasOwnProperty.call(MAPS[mapId], 'region')){
    return MAPS[mapId].region || null;
  }
  const m = mapId.match(/^(region\d+)/);
  return m ? m[1] : null;
}

function switchMapLayer(layer){
  if(queueMode && layer !== 'street'){ toast('请先关闭队列显示'); return; }
  /* 没有子城镇的大区（冒险之森 / 迷途岛 / 绝境沙漠…）切"城镇"时回退到世界层 */
  if(layer === 'town'){
    const rid = getMapRegionId(currentMapId);
    const region = WORLD_REGIONS.find(r => r.id === rid);
    if(!region || !region.hasSubTown){
      toast('当前区域没有城镇层，已切换到世界地图');
      layer = 'world';
    }
  }
  currentMapLayer = layer;
  updateLayerButtons();
  renderCurrentMap();
}

function updateLayerButtons(){
  document.querySelectorAll('.map-switch button').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(currentMapLayer === 'world' ? 'btnWorldMap' : currentMapLayer === 'town' ? 'btnTownMap' : 'btnStreetMap');
  if(btn) btn.classList.add('active');
}

function renderCurrentMap(opts){
  const keepView = !!(opts && opts.keepView);
  const canvas = document.getElementById('mapCanvas');
  const edgeOv = document.getElementById('edgeOverlay');
  const mlbName = document.getElementById('mlbName');
  const mlbTag = document.getElementById('mlbTag');
  const NS = 'http://www.w3.org/2000/svg';

  canvas.innerHTML = '';
  edgeOv.innerHTML = '';
  canvas.setAttribute('data-layer', currentMapLayer);
  let items = [], currentId = null, onClick = null, mapW = 0, mapH = 0, cellSize = MAP_CELL_SIZE;

   if(currentMapLayer === 'world'){
    mlbName.textContent = '世界地图';
    mlbTag.textContent = '1级';
    cellSize = 90;
    const maxCol = Math.max(...WORLD_REGIONS.map(r => r.col), 0);
    const maxRow = Math.max(...WORLD_REGIONS.map(r => r.row), 0);
    mapW = (maxCol + 1) * cellSize;
    mapH = (maxRow + 1) * cellSize;
    currentId = getMapRegionId(currentMapId);
    items = WORLD_REGIONS.map(r => ({...r, x:(r.col+0.5)*cellSize, y:(r.row+0.5)*cellSize}));
    onClick = () => { toast('世界地图仅供参考，移动请在街道层通过边缘连接处'); };
  }else if(currentMapLayer === 'town'){
    const rid = getMapRegionId(currentMapId);
    const region = WORLD_REGIONS.find(r => r.id === rid);
    if(!region || !region.hasSubTown){
      /* 兜底：逻辑上 switchMapLayer 已经拦了，这里再防一次 */
      currentMapLayer = 'world';
      updateLayerButtons();
      renderCurrentMap();
      return;
    }
    mlbName.textContent = region.name;
    mlbTag.textContent = '2级 · 城镇';
    cellSize = 110;
    const regionTowns = TOWNS.filter(t => t.id.startsWith(rid + '-town'));
    const maxCol = Math.max(...regionTowns.map(t => t.col), 0);
    const maxRow = Math.max(...regionTowns.map(t => t.row), 0);
    mapW = (maxCol + 1) * cellSize;
    mapH = (maxRow + 1) * cellSize;
    items = regionTowns.map(t => ({...t, x:(t.col+0.5)*cellSize, y:(t.row+0.5)*cellSize}));
    currentId = currentMapId;
    onClick = () => { toast('城镇地图仅供参考，移动请在街道层通过边缘连接处'); };
  }else{
    const map = MAPS[currentMapId];
    if(!map) return;
    mlbName.textContent = map.name;
    mlbTag.textContent = '3级 · 街道';
    cellSize = MAP_CELL_SIZE;
    const g = map.grid;
    mapW = g.cols * cellSize;
    mapH = g.rows * cellSize;
    items = map.tiles
      .filter(t => !t.hidden || (currentGame && currentGame.flags['unlock_' + t.id]))
      .map(t => ({...t, x:(t.col+0.5)*cellSize, y:(t.row+0.5)*cellSize}));
    currentId = currentTileId;
    onClick = id => moveToTile(id);
  }

  /* ============================================================
     先建节点、量出真实文字宽度，再统一定宽度与格距
     ------------------------------------------------------------
     以前格距是固定 80px，而节点宽度随名字变长（「冒险者工会」比
     「洼地」宽一倍多），相邻两格就会压在一起。现在：
       · 所有节点统一成同一宽度（取本层最长的那个）
       · 格距 = 节点宽 + 间隙，连线正好从间隙里穿过
     ============================================================ */
  const nodeEls = [];

  items.forEach(item => {
    const node = document.createElement('div');
    /* tile 有 tile_enter 剧情 / NPC 有 npc_talk 剧情 / env 可交互任务点，都亮"!"
       （只显示主线剧情的标记，支线不显示） */
    let isStory = hasPendingMainStoryTile(item.id);
    if(!isStory && item.npcs){
      isStory = item.npcs.some(npcId => hasPendingMainStoryNpc(npcId));
    }
    if(!isStory && item.env && currentGame){
      /* 环境卡：是主线剧情下一个待触发的 env_interact 节点才亮（只主线）
         按「地图格 id + 环境卡名字」精确匹配 */
      isStory = getTileEnvs(item).some(envName => hasPendingMainStoryEnv(item.id, envName));
    }
    node.className = 'map-node' +
      (item.id === currentId ? ' current' : '') +
      (item.battle ? ' battle-node' : '') +
      (isStory ? ' story-node' : '');
    if(currentMapLayer === 'world'){
      const escHtml = (s) => String(s).replace(/[&<>"']/g, c => (
        {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]
      ));
      const townCount = TOWNS.filter(t => t.id.startsWith(item.id + '-town')).length;
      node.innerHTML = escHtml(item.name) +
        (townCount > 0
          ? `<span style="font-size:0.75em;color:#889;margin-left:5px;font-weight:400">${townCount}镇</span>`
          : '');
    }else{
      node.textContent = item.name;
    }
    node.onclick = () => {
      if(isStoryBlocking()) return;
      onClick && onClick(item.id);
    };
    canvas.appendChild(node);
    nodeEls.push(node);

    if(item.edge && item.id === currentId){
      const dir = item.edge.direction || 'south';
      const btn = document.createElement('button');
      btn.className = 'edge-floating ' + dir;
      btn.textContent = '⟶ ' + item.edge.label;
      btn.onclick = e => { e.stopPropagation(); handleEdge(item.edge); };
      edgeOv.appendChild(btn);
    }
  });

  const MIN_NODE_W = 78;   /* 名字很短的格子也保持同样体量 */
  const NODE_GAP = 30;     /* 相邻两格之间留出的空隙，连线从中间过 */
  let maxNodeW = 0;
  nodeEls.forEach(n => { if(n.offsetWidth > maxNodeW) maxNodeW = n.offsetWidth; });
  const nodeW = Math.max(maxNodeW || 0, MIN_NODE_W);
  const pitch = Math.max(cellSize, nodeW + NODE_GAP);

  const maxCol = items.reduce((m, i) => Math.max(m, i.col), 0);
  const maxRow = items.reduce((m, i) => Math.max(m, i.row), 0);
  mapW = (maxCol + 1) * pitch;
  mapH = (maxRow + 1) * pitch;
  canvas.style.width = mapW + 'px';
  canvas.style.height = mapH + 'px';

  const nodePos = items.map(item => ({
    x: (item.col + 0.5) * pitch,
    y: (item.row + 0.5) * pitch
  }));
  nodeEls.forEach((n, i) => {
    n.style.width = nodeW + 'px';
    n.style.left = nodePos[i].x + 'px';
    n.style.top = nodePos[i].y + 'px';
  });

  /* 记住本层实际格距，供聚焦 / 重置视野使用 */
  mapPitch = pitch;

  /* 连线：只画在格子之间的空隙里，两端各让出节点边框 */
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'map-svg');
  svg.setAttribute('viewBox', `0 0 ${mapW} ${mapH}`);
  svg.setAttribute('width', mapW);
  svg.setAttribute('height', mapH);

  const idxById = {};
  items.forEach((it, i) => { idxById[it.id] = i; });

  items.forEach((item, i) => {
    (item.links || []).forEach(linkId => {
      const j = idxById[linkId];
      if(j === undefined || j === i) return;
      if(i > j) return;   /* 同一条边只画一次 */
      const a = nodeEls[i], b = nodeEls[j];
      const dx = nodePos[j].x - nodePos[i].x;
      const dy = nodePos[j].y - nodePos[i].y;
      const len = Math.hypot(dx, dy);
      if(len < 1) return;
      const ux = dx / len, uy = dy / len;
      /* 端点内缩：按节点在连线方向上的半宽/半高计算，斜率再大也不会穿透 */
      const insetA = Math.abs(ux) * (a.offsetWidth / 2) + Math.abs(uy) * (a.offsetHeight / 2) + 4;
      const insetB = Math.abs(ux) * (b.offsetWidth / 2) + Math.abs(uy) * (b.offsetHeight / 2) + 4;
      if(len <= insetA + insetB) return;

      const line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', nodePos[i].x + ux * insetA);
      line.setAttribute('y1', nodePos[i].y + uy * insetA);
      line.setAttribute('x2', nodePos[j].x - ux * insetB);
      line.setAttribute('y2', nodePos[j].y - uy * insetB);
      if(currentMapLayer === 'world'){
        line.setAttribute('stroke', 'rgba(255,204,102,.7)');
        line.setAttribute('stroke-width', '3');
        line.setAttribute('stroke-dasharray', '8,6');
      }else{
        line.setAttribute('stroke', 'rgba(178,140,255,.8)');
        line.setAttribute('stroke-width', '2.5');
        line.setAttribute('stroke-dasharray', '6,4');
      }
      line.setAttribute('stroke-linecap', 'round');
      svg.appendChild(line);
    });
  });
  canvas.insertBefore(svg, canvas.firstChild);

  applyMapTransform();
  if(currentMapLayer === 'street'){
    focusOnTile(currentId, keepView ? mapView.scale : null);
  }else if(isMobileLayout() && currentId){
    /* 手机端：世界 / 城镇层直接聚焦当前节点，避免整层缩得太小 */
    const cur = items.find(it => it.id === currentId);
    if(cur) focusMapPoint(cur.x, cur.y, 1.0);
    else centerMap();
  }else{
    centerMap();
  }
}

/* 把地图视图对准某个画布坐标（世界/城镇层用） */
function focusMapPoint(px, py, scale){
  const area = document.getElementById('mapArea');
  const W = area.clientWidth, H = area.clientHeight;
  if(W === 0 || H === 0) return;
  const ins = getMapSafeInsets();
  const availH = Math.max(80, H - ins.top - ins.bottom);
  mapView.scale = scale;
  mapView.x = W/2 - px * scale;
  mapView.y = ins.top + availH/2 - py * scale;
  applyMapTransform();
}

/* 手机端地图上下有悬浮控件，居中时预留出安全可视区 */
function getMapSafeInsets(){
  if(document.body && document.body.classList.contains('mobile')){
    return {top:52, bottom:12};
  }
  return {top:0, bottom:0};
}
function isMobileLayout(){
  return !!(document.body && document.body.classList.contains('mobile'));
}

function focusOnTile(tileId, keepScale){
  const area = document.getElementById('mapArea');
  const W = area.clientWidth, H = area.clientHeight;
  if(W === 0 || H === 0){ setTimeout(() => focusOnTile(tileId, keepScale), 100); return; }
  const map = MAPS[currentMapId];
  if(!map) return;
  const tile = map.tiles.find(t => t.id === tileId);
  if(!tile) return;
  const showSpan = 4;
  const ins = getMapSafeInsets();
  const availH = Math.max(80, H - ins.top - ins.bottom);
  const isMobile = isMobileLayout();
  /* 点击地图移动时保留玩家当前的缩放级别，不再强制回到固定大小。
     手机屏幕窄：以接近原始比例显示节点，保证文字可读，其余靠拖动查看。 */
  const scale = keepScale
    ? Math.max(0.3, Math.min(3, Number(keepScale) || 1))
    : (isMobile
        ? 1.0
        : Math.max(0.5, Math.min(1.0, Math.min(W, availH) / (showSpan * mapPitch))));
  const cx = (tile.col + 0.5) * mapPitch;
  const cy = (tile.row + 0.5) * mapPitch;
  mapView.scale = scale;
  mapView.x = W/2 - cx * scale;
  mapView.y = ins.top + availH/2 - cy * scale;
  applyMapTransform();
}

function centerMap(){
  const area = document.getElementById('mapArea');
  const W = area.clientWidth, H = area.clientHeight;
  if(W === 0 || H === 0){ setTimeout(centerMap, 100); return; }
  /* 用实际画布尺寸（world / town 层画布大小不同），而不是固定网格 */
  const canvas = document.getElementById('mapCanvas');
  const mapW = canvas.offsetWidth || parseFloat(canvas.style.width) || 1;
  const mapH = canvas.offsetHeight || parseFloat(canvas.style.height) || 1;
  const ins = getMapSafeInsets();
  const availH = Math.max(80, H - ins.top - ins.bottom);
  /* 上限 1.2：小地图不要被放大到字比格子还大 */
  const scale = Math.min(1.2, Math.min(W / mapW, availH / mapH) * 0.92);
  mapView.scale = scale;
  mapView.x = (W - mapW * scale) / 2;
  mapView.y = ins.top + (availH - mapH * scale) / 2;
  applyMapTransform();
}

/* 离开雷克家时打标记（handleEdge / moveToTile 共用）—— 目前无实际逻辑 */
function markLeftRayhome(){
  /* 预留：此处可触发 currentGame.flags['left_rayhome'] = true 之类 */
}

function handleEdge(edge){
  if(!edge || !edge.targetMap) return;
  if(isGameFailed()) return;
  if(isStoryBlocking()) return;   /* 剧情优先 */
  markLeftRayhome();
  const targetMapName = (MAPS[edge.targetMap] && MAPS[edge.targetMap].name) || edge.targetMap;
  showTransition(`正在前往 ${targetMapName}…`, () => {
    advanceTime(5);
    if(isStoryBlocking()) return;
    currentMapId = edge.targetMap;
    currentTileId = edge.targetTile || MAPS[edge.targetMap].tiles[0].id;
    currentTalkNpc = null;
    document.getElementById('storyBox').innerHTML = '';
    battleCheckedTileId = null;
    renderCurrentMap();
    updateAllUI();
    updateActionButtons();
    renderNpcRow();
    toast(`到达 ${targetMapName} · +5时`);
    saveGame(currentSlot);
    checkStoryTriggers({type:'tile_enter', mapId:currentMapId, tileId:currentTileId});
    checkTimeEvents();
  });
}

let _mapTransformRaf = 0;
function applyMapTransform(){
  /* 合并同一帧内的多次拖拽/缩放写入，减少手机端地图重绘 */
  if(_mapTransformRaf) return;
  const run = () => {
    _mapTransformRaf = 0;
    const c = document.getElementById('mapCanvas');
    if(!c) return;
    c.style.transform = `translate3d(${mapView.x}px, ${mapView.y}px, 0) scale(${mapView.scale})`;
  };
  _mapTransformRaf = (window.requestAnimationFrame || function(cb){ return setTimeout(cb, 16); })(run);
}

function zoomMap(factor){
  mapView.scale = Math.max(0.3, Math.min(3, mapView.scale * factor));
  applyMapTransform();
}

function resetMapView(){
  const area = document.getElementById('mapArea');
  const W = area.clientWidth, H = area.clientHeight;
  if(currentMapLayer === 'world'){
    mapView = {x:0, y:0, scale:1};
  }else{
    /* 画布尺寸即渲染后的真实大小（格距已按节点宽度动态计算） */
    const canvas = document.getElementById('mapCanvas');
    const mapW = canvas.offsetWidth || parseFloat(canvas.style.width) || 1;
    const mapH = canvas.offsetHeight || parseFloat(canvas.style.height) || 1;
    const ins = getMapSafeInsets();
    const availH = Math.max(80, H - ins.top - ins.bottom);
    const scale = Math.min(W/mapW, availH/mapH) * 0.9;
    mapView.scale = scale;
    mapView.x = (W - mapW * scale) / 2;
    mapView.y = ins.top + (availH - mapH * scale) / 2;
  }
  applyMapTransform();
}

function moveToTile(tileId){
  if(isGameFailed()) return;
  if(isStoryBlocking()) return;   /* 剧情优先，阻断本次点击 */
  const map = MAPS[currentMapId];
  const current = map.tiles.find(t => t.id === currentTileId);
  if(!current || !current.links.includes(tileId)){ toast('无法直接到达'); return; }

  markLeftRayhome();
  /* 触发 tile_leave（离开当前节点）；如果触发了剧情，阻断本次移动 */
  const leaveTriggered = checkStoryTriggers({
    type:'tile_leave',
    mapId: currentMapId,
    tileId: currentTileId,
    toTileId: tileId
  });
  if(leaveTriggered) return;

  _lastTileId = currentTileId;
  advanceTime(1);
  if(isStoryBlocking()) return;
  currentTileId = tileId;
  currentTalkNpc = null;
  document.getElementById('storyBox').innerHTML = '';
  renderCurrentMap({keepView:true});
  updateAllUI();
  updateActionButtons();
  renderNpcRow();
  toast('移动 · +1时');

  checkStoryTriggers({type:'tile_enter', mapId:currentMapId, tileId});
  checkTimeEvents();

  const tile = getCurrentTile();
  if(tile && tile.battle && battleCheckedTileId !== tileId){
    battleCheckedTileId = tileId;
    const chance = tile.battleChance !== undefined ? tile.battleChance : 0.15;
    if(Math.random() < chance){
      /* P0-15：tile.battle 支持字符串（单一遭遇）或数组（随机变体） */
      const encId = Array.isArray(tile.battle)
        ? tile.battle[Math.floor(Math.random() * tile.battle.length)]
        : tile.battle;
      appendStory('', '有什么在对你虎视眈眈……', 'narration');
      setTimeout(() => triggerBattleFromTile(encId), 800);
    }
  }
  saveGame(currentSlot);
}

/* ---- 地图拖拽 ---- */
(function initMapDrag(){
  const area = document.getElementById('mapArea');
  let dragging = false, startX = 0, startY = 0, startMapX = 0, startMapY = 0;

  area.addEventListener('mousedown', e => {
    if(queueMode) return;
    if(e.button !== 0) return;
    if(e.target.closest('.map-node') || e.target.closest('.edge-floating')) return;
    dragging = true;
    startX = e.clientX; startY = e.clientY;
    startMapX = mapView.x; startMapY = mapView.y;
    area.classList.add('dragging');
    e.preventDefault();
  });
  window.addEventListener('mousemove', e => {
    if(!dragging) return;
    /* 固定画布整体缩放后，鼠标位移需换算回 1920×1080 逻辑坐标 */
    const sc = window.__gameScale || 1;
    mapView.x = startMapX + (e.clientX - startX) / sc;
    mapView.y = startMapY + (e.clientY - startY) / sc;
    applyMapTransform();
  });
  window.addEventListener('mouseup', () => {
    if(!dragging) return;
    dragging = false;
    area.classList.remove('dragging');
  });
  area.addEventListener('wheel', e => {
    if(queueMode) return;
    e.preventDefault();
    zoomMap(e.deltaY < 0 ? 1.15 : 0.87);
  }, {passive:false});
  /* 双击复原地图视角 */
  area.addEventListener('dblclick', e => {
    if(queueMode) return;
    if(e.target.closest('.map-node') || e.target.closest('.edge-floating')) return;
    resetMapView();
  });

  /* ---- 手机端：单指拖拽 + 双指捏合缩放 ----
     map-area 已经设置 touch-action:none，浏览器不会再接管手势。 */
  let touchDragging = false;
  let touchStartX = 0, touchStartY = 0, touchStartMapX = 0, touchStartMapY = 0;
  let pinchStartDist = 0, pinchStartScale = 1, pinchMapX = 0, pinchMapY = 0;

  function touchPoint(t){
    const sc = window.__gameScale || 1;
    return { x:t.clientX / sc, y:t.clientY / sc };
  }
  function distance(a, b){
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  }
  function beginOneFinger(e){
    const t = e.touches[0];
    const p = touchPoint(t);
    touchDragging = false;
    touchStartX = p.x; touchStartY = p.y;
    touchStartMapX = mapView.x; touchStartMapY = mapView.y;
  }
  function beginPinch(e){
    const a = e.touches[0], b = e.touches[1];
    const p = touchPoint({clientX:(a.clientX+b.clientX)/2, clientY:(a.clientY+b.clientY)/2});
    pinchStartDist = Math.max(1, distance(a,b));
    pinchStartScale = mapView.scale;
    pinchMapX = (p.x - mapView.x) / mapView.scale;
    pinchMapY = (p.y - mapView.y) / mapView.scale;
    touchDragging = false;
  }

  area.addEventListener('touchstart', e => {
    if(queueMode || area.classList.contains('locked')) return;
    if(e.touches.length === 2){
      beginPinch(e);
      e.preventDefault();
      return;
    }
    if(e.target.closest('.map-node') || e.target.closest('.edge-floating')) return;
    if(e.touches.length === 1){
      beginOneFinger(e);
    }
  }, {passive:false});

  area.addEventListener('touchmove', e => {
    if(queueMode || area.classList.contains('locked')) return;
    if(e.touches.length === 2){
      const a = e.touches[0], b = e.touches[1];
      const p = touchPoint({clientX:(a.clientX+b.clientX)/2, clientY:(a.clientY+b.clientY)/2});
      const nextScale = Math.max(0.3, Math.min(3, pinchStartScale * (distance(a,b) / pinchStartDist)));
      mapView.scale = nextScale;
      mapView.x = p.x - pinchMapX * nextScale;
      mapView.y = p.y - pinchMapY * nextScale;
      applyMapTransform();
      e.preventDefault();
      return;
    }
    if(e.touches.length === 1 && !touchDragging){
      const p = touchPoint(e.touches[0]);
      const dx = p.x - touchStartX, dy = p.y - touchStartY;
      if(Math.abs(dx) + Math.abs(dy) > 3){
        touchDragging = true;
        area.classList.add('dragging');
      }
    }
    if(e.touches.length === 1 && touchDragging){
      const p = touchPoint(e.touches[0]);
      mapView.x = touchStartMapX + (p.x - touchStartX);
      mapView.y = touchStartMapY + (p.y - touchStartY);
      applyMapTransform();
      e.preventDefault();
    }
  }, {passive:false});

  function endTouch(e){
    if(e.touches.length === 1){
      /* 双指变单指：以剩下的手指重新开始拖拽 */
      beginOneFinger(e);
      return;
    }
    if(e.touches.length === 0){
      touchDragging = false;
      area.classList.remove('dragging');
    }
  }
  area.addEventListener('touchend', endTouch, {passive:true});
  area.addEventListener('touchcancel', endTouch, {passive:true});
})();

/* ============================================================
   队列
   ============================================================ */

function toggleQueue(){
  queueMode = !queueMode;
  const btn = document.getElementById('queueToggleBtn');
  if(btn) btn.textContent = queueMode ? '关闭队列' : '队列';
  const qd = document.getElementById('queueDisplay');
  if(queueMode){
    qd.classList.add('show');
    document.getElementById('mapArea').classList.add('locked');
    document.querySelectorAll('.map-switch button').forEach(b => b.disabled = true);
    selectedQueueChar = null;
    renderQueue();
  }else{
    qd.classList.remove('show');
    document.getElementById('mapArea').classList.remove('locked');
    document.querySelectorAll('.map-switch button').forEach(b => b.disabled = false);
    selectedQueueChar = null;
  }
}

function renderQueue(){
  const qd = document.getElementById('queueDisplay');
  const q = currentGame.queue;
  const playerSelected = selectedQueueChar && selectedQueueChar.charId === 'player';

  function slotHtml(row, idx){
    const charId = q[row][idx];
    const char = charId ? getChar(charId) : null;
    const sel = (selectedQueueChar && selectedQueueChar.row === row && selectedQueueChar.idx === idx) ? ' selected' : '';
    const locked = (playerSelected && row === 'rest') ? ' locked' : '';
    if(!char) return `<div class="queue-slot empty${sel}${locked}" onclick="queueSlotClick('${row}',${idx})"></div>`;
    const talkBtn = charId !== 'player' ? `<button class="qs-talk" onclick="event.stopPropagation();queueTalk('${charId}')">对话</button>` : '';
    const actions = `<button class="qs-view" onclick="event.stopPropagation();queueViewChar('${charId}')">查看</button>${talkBtn}`;
    return `<div class="queue-slot${sel}${locked}" onclick="queueSlotClick('${row}',${idx})">
      ${charBriefCard(char, { actions })}
    </div>`;
  }

  function petSlotHtml(row){
    const id = currentGame.pets ? currentGame.pets[row] : null;
    const char = id ? getChar(id) : null;
    if(!char){
      return `<div class="queue-slot empty pet-slot" onclick="openBag()">
        <div class="qs-name" style="color:#667">宠物位</div>
        <div class="qs-lv">点击行囊安排</div>
      </div>`;
    }
    return `<div class="queue-slot pet-slot" onclick="queueViewChar('${id}')">
      ${charBriefCard(char, { badge:'<span class="npc-tag">宠物</span>' })}
    </div>`;
  }

  qd.innerHTML = `
    <div class="queue-section"><div class="queue-section-label">▎前排</div><div class="queue-row front">${q.front.map((_,i)=>slotHtml('front',i)).join('')}${petSlotHtml('front')}</div></div>
    <div class="queue-section"><div class="queue-section-label">▎后排</div><div class="queue-row back">${q.back.map((_,i)=>slotHtml('back',i)).join('')}${petSlotHtml('back')}</div></div>
    <div class="queue-section"><div class="queue-section-label">▎休息区${playerSelected ? '<span style="color:#ff6688;font-size:11px;margin-left:6px">（主角不能进入）</span>' : ''}</div><div class="queue-row rest">${q.rest.map((_,i)=>slotHtml('rest',i)).join('')}</div></div>
  `;
}

function queueSlotClick(row, idx){
  const q = currentGame.queue;
  if(selectedQueueChar){
    if(selectedQueueChar.row === row && selectedQueueChar.idx === idx){
      selectedQueueChar = null; renderQueue(); return;
    }
    const temp = q[row][idx];
    const srcRow = selectedQueueChar.row;
    const srcIdx = selectedQueueChar.idx;
    const movingChar = selectedQueueChar.charId;

    const playerWouldBeInRest =
      (row === 'rest' && movingChar === 'player') ||
      (srcRow === 'rest' && temp === 'player');
    if(playerWouldBeInRest){
      toast('主角不能进入休息区');
      return;
    }

    q[row][idx] = movingChar;
    q[srcRow][srcIdx] = temp;
    selectedQueueChar = null;
    renderQueue();
  }else{
    if(q[row][idx]) selectedQueueChar = {row, idx, charId:q[row][idx]};
    renderQueue();
  }
}

/* ============================================================
   剧情钩子占位（story.js / main.js 会覆盖）
   ============================================================ */

function checkStoryTriggers(trigger){ /* story.js 覆盖 */ }
function checkTimeEvents(){ /* story.js 覆盖 */ }
function hasPendingStoryEvent(tileId){ return false; }  /* story.js 覆盖 */
function clickNpcName(id){ /* main.js 覆盖 */ }
function queueViewChar(id){ /* main.js 覆盖 */ }
function queueTalk(id){ /* main.js 覆盖 */ }