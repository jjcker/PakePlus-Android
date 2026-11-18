/* ============================================================
   debug-plus.js — 调试面板增强（手机版 / 电脑版通用）
   ------------------------------------------------------------
   在 main.js 之后加载，复用原调试面板的弹窗、分组、词条选择器，
   只替换/扩展下面这些页签：
     · 角色：基础值 / 成长 / 四率 / 装备挂载 / 技能挂载 / 被动 / 模板
     · 敌人：可搜索的角色卡模板编辑（基础值、成长、四率、技能、AI）
     · 物品：类别 / 部位 / 标签 / 词条 / 赋予技能 / 装备被动 / 批量词条
     · 技能：技能名 / 职业限制 / 等级增减 / 熟练度 / 发放
     · 战斗：遭遇战选择、战场单位 HP/MP/攻防速、状态增删
     · 剧情：剧情线进度 / 标记完成 / 重置 / flags
     · 数据：全局公式、敌人档位模板、战斗上限、玩家初始值、导出补丁
   ------------------------------------------------------------
   所有修改都只在内存中；模板改动用「导出修改」生成补丁。
   ============================================================ */

/* 先保存原函数，避免被本文件后面的同名覆盖影响 */
const DP_BASE = {
  renderDebugContent: window.renderDebugContent,
  renderDebugChars: window.renderDebugChars,
  buildDebugCharEntry: window.buildDebugCharEntry,
  renderDebugSkillList: window.renderDebugSkillList,
  renderDebugEquipList: window.renderDebugEquipList,
  renderDebugItemEdit: window.renderDebugItemEdit,
  debugSaveItemEdit: window.debugSaveItemEdit,
  renderDebugSkillEdit: window.renderDebugSkillEdit,
  debugSaveSkillEdit: window.debugSaveSkillEdit,
  debugChangeCounts: window.debugChangeCounts,
  debugBuildPatch: window.debugBuildPatch,
  debugPatchJs: window.debugPatchJs,
  debugClearChanges: window.debugClearChanges,
  debugRestoreAll: window.debugRestoreAll
};

/* 文件加载时的原始快照：用于「恢复」与「导出补丁」 */
const DP_ORIGINAL = {
  ATTR_FORMULA: JSON.parse(JSON.stringify(ATTR_FORMULA)),
  ENEMY_ATTR_TEMPLATE: JSON.parse(JSON.stringify(ENEMY_ATTR_TEMPLATE)),
  PLAYER_BASE_CONFIG: JSON.parse(JSON.stringify(PLAYER_BASE_CONFIG)),
  CRAFTING: JSON.parse(JSON.stringify(CRAFTING_RECIPES)),
  CAPS: {
    DODGE_CAP: DODGE_CAP, HIT_CAP: HIT_CAP, CRIT_RATE_CAP: CRIT_RATE_CAP,
    CRIT_MULT_CAP: CRIT_MULT_CAP, SPD_MIN: SPD_MIN, STACK_MAX: STACK_MAX,
    BATTLE_DROP_CAP: BATTLE_DROP_CAP, GAME_YEAR_LIMIT: GAME_YEAR_LIMIT
  },
  AUTO_TIME: JSON.parse(JSON.stringify(AUTO_TIME_CONFIG))
};

/* ---------- 小工具 ---------- */
function dpDeep(o){ return o == null ? o : JSON.parse(JSON.stringify(o)); }
function dpEsc(s){ return (typeof debugEsc === 'function') ? debugEsc(s) : String(s == null ? '' : s); }
function dpNum(v, fb){
  const n = Number(v);
  return isFinite(n) ? n : (Number(fb) || 0);
}
function dpInt(v, fb, min, max){
  let n = Math.floor(dpNum(v, fb));
  if(min !== undefined) n = Math.max(min, n);
  if(max !== undefined) n = Math.min(max, n);
  return n;
}
function dpPct(v){ return Math.round((Number(v) || 0) * 1000) / 10; }
function dpReplaceObject(target, src){
  if(!target || !src) return target;
  Object.keys(target).forEach(k => { delete target[k]; });
  Object.assign(target, dpDeep(src));
  return target;
}
function dpShowConfirm(title, msg, cb){
  if(typeof showConfirm === 'function') showConfirm(title, msg, cb);
  else if(window.confirm(msg)) cb();
}
function dpCharLabel(id, obj){
  if(id === 'player') return '玩家 · ' + ((obj && obj.name) || '');
  return ((obj && obj.name) || id) + ' · ' + id;
}
function dpArray(v){
  if(Array.isArray(v)) return v;
  if(v === undefined || v === null || v === '') return [];
  return String(v).split(/[,，\s]+/).filter(Boolean);
}

/* 角色编辑页由本文件接管（原 renderDebugContent 不认 char） */
function dpRenderDebugContent(opts){
  if(debugEdit && (debugEdit.kind === 'char' || debugEdit.kind === 'crafting')){
    const c = document.getElementById('debugContent');
    if(!c) return;
    const top = c.scrollTop || 0;
    c.innerHTML = (debugEdit.kind === 'char') ? dpCharEditHtml() : dpCraftEditHtml();
    c.scrollTop = (opts && opts.resetScroll) ? 0 : top;
    return;
  }
  if(!debugEdit && !debugExportOpen && debugTab === 'crafting'){
    const c = document.getElementById('debugContent');
    if(!c) return;
    const top = c.scrollTop || 0;
    c.innerHTML = dpCraftingListHtml();
    c.scrollTop = (opts && opts.resetScroll) ? 0 : top;
    return;
  }
  return DP_BASE.renderDebugContent(opts);
}

/* ============================================================
   一、角色编辑
   ============================================================ */

function dpCharObj(ed){
  if(!ed) return null;
  if(ed.mode === 'template') return getCharacterTemplate(ed.id);
  if(ed.id === 'player') return currentGame;
  return getNpc(ed.id);
}

function dpMarkCharacter(id){
  if(!debugChanges.characters) debugChanges.characters = {};
  debugChanges.characters[id] = true;
}

function dpOpenCharEdit(id, mode){
  const obj = mode === 'template'
    ? getCharacterTemplate(id)
    : (id === 'player' ? currentGame : getNpc(id));
  if(!obj){ toast('找不到这个角色'); return; }
  debugEdit = {
    kind: 'char',
    id: (mode === 'template') ? String(obj.id || id).split('#')[0] : id,
    mode: mode === 'template' ? 'template' : 'runtime',
    previewLv: dpInt(obj.level || obj.suggestedLevel || 1, 1, 1, 999),
    snapshot: dpCharSnapshot(obj)
  };
  /* 地图挂载：默认定位到角色当前所在地图 / 格子 */
  debugEdit.placeMapId = currentMapId;
  debugEdit.placeTileId = currentTileId;
  if(debugEdit.mode === 'runtime' && id !== 'player'){
    const tiles = dpCharacterTiles(id);
    if(tiles.length){
      debugEdit.placeMapId = dpMapIdOfTile(tiles[0].id) || currentMapId;
      debugEdit.placeTileId = tiles[0].id;
    }
  }
  renderDebugContent({ resetScroll: true });
}

const DP_CHAR_SNAPSHOT_KEYS = [
  'level','exp','expMax','hp','mp','money','base','growth','vitFlat','spiFlat',
  'hit','dodge','critRate','critMult','equipment','equippedSkills','skillProficiency',
  'classes','titles','personalPassives','behavior','ai','race','faction','factionTags',
  'affinity','affinityMax','isUnique','appearanceAge','deathAge','isPet','canRecruit','canBattle',
  'suggestedLevel','mapLevel','rank','drops'
];
function dpCharSnapshot(obj){
  const out = {};
  DP_CHAR_SNAPSHOT_KEYS.forEach(k => { if(obj && obj[k] !== undefined) out[k] = dpDeep(obj[k]); });
  return out;
}
function dpCharRevert(){
  const ed = debugEdit;
  if(!ed || ed.kind !== 'char') return;
  const obj = dpCharObj(ed);
  if(!obj || !ed.snapshot) return;
  Object.keys(ed.snapshot).forEach(k => { obj[k] = dpDeep(ed.snapshot[k]); });
  if(ed.mode === 'runtime'){ normalizeCharAttributeModel(obj); recalcCharStats(obj); }
  if(ed.mode === 'template') dpMarkCharacter(ed.id);
  toast('已撤销本次角色修改');
  updateAllUI();
  debugSyncBattle();
  renderDebugContent();
}

function dpStats(obj){
  const attr = getCharAttrStatsWithEquip(obj);
  const eqs = calcEquipStats(obj);
  const hpPct = getPassiveMaxHpBonus(obj) + (Number(eqs.maxHpPct) || 0);
  const mpPct = getPassiveStatTotal(obj, 'maxmp_up_pct', 'add') + (Number(eqs.maxMpPct) || 0);
  const maxHp = Math.floor((attr.maxHp + (eqs.maxHpBonus || 0) + getPassiveFlatBonus(obj, 'maxhp_up')) * (1 + hpPct / 100));
  const maxMp = Math.floor((attr.maxMp + (eqs.maxMpBonus || 0) + getPassiveFlatBonus(obj, 'maxmp_up')) * (1 + mpPct / 100));
  const rates = getCharCombatRates(obj);
  return { attr: attr, eqs: eqs, maxHp: maxHp, maxMp: maxMp, rates: rates };
}

/* 改技能槽后，让正在进行的战斗也立刻用上新技能 */
function dpBattleRefreshAllySkills(){
  if(typeof battleState === 'undefined' || !battleState || battleState.over) return;
  (battleState.allies || []).forEach(u => {
    const owner = u.isPlayer ? currentGame : (u.npcId ? getNpc(u.npcId) : null);
    if(!owner) return;
    u.skills = (owner.equippedSkills || []).filter(Boolean);
  });
  if(typeof renderBattleSkills === 'function') renderBattleSkills();
}
function dpAfterCharChange(obj, key){
  const ed = debugEdit;
  if(!obj || !ed) return;
  if(ed.mode === 'runtime'){
    if(['hp','mp','money','affinity','affinityMax','exp','expMax','race','faction','factionTags'].indexOf(key) < 0){
      normalizeCharAttributeModel(obj);
      recalcCharStats(obj);
    }
    const st = dpStats(obj);
    if(obj.hp > st.maxHp) obj.hp = st.maxHp;
    if(obj.mp > st.maxMp) obj.mp = st.maxMp;
  }else{
    normalizeCharAttributeModel(obj);
    dpMarkCharacter(ed.id);
  }
  updateAllUI();
  debugSyncBattle();
  dpBattleRefreshAllySkills();
  renderDebugContent();
}

function dpCharSetField(key, val){
  const ed = debugEdit;
  const obj = dpCharObj(ed);
  if(!obj) return;
  if(key === 'level'){
    obj.level = dpInt(val, 1, 1, 999);
    if(ed.mode === 'runtime') obj.expMax = calcExpMax(obj.level);
  }else if(key === 'hp' || key === 'mp'){
    const st = dpStats(obj);
    obj[key] = Math.max(0, dpInt(val, obj[key], 0, key === 'hp' ? st.maxHp : st.maxMp));
  }else if(['exp','expMax','money','affinity','affinityMax','appearanceAge','deathAge','suggestedLevel','mapLevel'].indexOf(key) >= 0){
    obj[key] = Math.max(0, dpNum(val, obj[key]));
  }else if(key === 'name' || key === 'desc' || key === 'race' || key === 'faction'){
    obj[key] = String(val || '');
  }else{
    obj[key] = val;
  }
  dpAfterCharChange(obj, key);
}

function dpCharSetBase(stat, val){
  const obj = dpCharObj(debugEdit);
  if(!obj) return;
  if(!obj.base) obj.base = {};
  obj.base[stat] = dpNum(val, obj.base[stat]);
  normalizeCharAttributeModel(obj);
  dpAfterCharChange(obj, 'base');
}
function dpCharSetGrowth(stat, val){
  const obj = dpCharObj(debugEdit);
  if(!obj) return;
  if(!obj.growth) obj.growth = {};
  obj.growth[stat] = dpNum(val, obj.growth[stat]);
  normalizeCharAttributeModel(obj);
  dpAfterCharChange(obj, 'growth');
}
function dpCharSetCurrentAttr(stat, val){
  const obj = dpCharObj(debugEdit);
  if(!obj) return;
  normalizeCharAttributeModel(obj);
  const lv1 = Math.max(0, (obj.level || 1) - 1);
  const growth = (obj.growth && obj.growth[stat] !== undefined) ? Number(obj.growth[stat]) : 0;
  obj.base[stat] = dpNum(val, 0) - growth * lv1;
  dpAfterCharChange(obj, stat);
}

function dpCharSetRate(key, val){
  const obj = dpCharObj(debugEdit);
  if(!obj) return;
  if(key === 'critMult'){
    obj.critMult = Math.max(1, dpNum(val, 1.5));
  }else{
    obj[key] = Math.min(1, Math.max(0, dpNum(val, 0) / 100));
  }
  dpAfterCharChange(obj, key);
}

function dpCharSetClass(idx, val){
  const obj = dpCharObj(debugEdit);
  if(!obj) return;
  if(!Array.isArray(obj.classes)) obj.classes = ['',''];
  obj.classes[idx] = String(val || '').trim();
  dpAfterCharChange(obj, 'classes');
}

function dpCharToggleTitle(tid, checked){
  const obj = dpCharObj(debugEdit);
  if(!obj) return;
  if(!Array.isArray(obj.titles)) obj.titles = [];
  obj.titles = obj.titles.filter(t => t !== tid);
  if(checked) obj.titles.push(tid);
  dpAfterCharChange(obj, 'titles');
}

function dpCharToggleFlag(key, checked){
  const obj = dpCharObj(debugEdit);
  if(!obj) return;
  obj[key] = !!checked;
  dpAfterCharChange(obj, key);
}

function dpCharSetEquip(slot, itemId){
  const ed = debugEdit;
  const obj = dpCharObj(ed);
  if(!obj) return;
  if(!obj.equipment) obj.equipment = makeEmptyEquipment();
  if(!itemId){ obj.equipment[slot] = null; dpAfterCharChange(obj, 'equipment'); return; }
  const tpl = EQUIPS[itemId];
  if(!tpl){ toast('物品不存在'); return; }
  if(!getItemEquipSlots(tpl).includes(slot)){
    toast('这件物品不能装备在「' + (EQUIP_SLOT_LABEL[slot] || slot) + '」');
    return;
  }
  if(slot === 'offHand' && obj.equipment.mainHand){
    const mainTpl = EQUIPS[obj.equipment.mainHand.id];
    if(mainTpl && mainTpl.twoHanded){ toast('主手是双手武器，请先卸下主手'); return; }
  }
  const inst = createItemInstance(tpl, itemId);
  obj.equipment[slot] = inst;
  if(slot === 'mainHand' && tpl.twoHanded) obj.equipment.offHand = null;
  dpAfterCharChange(obj, 'equipment');
}
function dpCharClearEquip(){
  const obj = dpCharObj(debugEdit);
  if(!obj) return;
  obj.equipment = makeEmptyEquipment();
  dpAfterCharChange(obj, 'equipment');
}

function dpCharSetSkillSlot(idx, sid){
  const obj = dpCharObj(debugEdit);
  if(!obj) return;
  if(!Array.isArray(obj.equippedSkills)) obj.equippedSkills = [null, null, null, null];
  while(obj.equippedSkills.length < 4) obj.equippedSkills.push(null);
  obj.equippedSkills[idx] = sid || null;
  if(sid){
    if(!obj.skillProficiency) obj.skillProficiency = {};
    if(obj.skillProficiency[sid] === undefined) obj.skillProficiency[sid] = 0;
  }
  dpAfterCharChange(obj, 'equippedSkills');
}
function dpCharLearnAll(){
  const obj = dpCharObj(debugEdit);
  if(!obj) return;
  if(!obj.skillProficiency) obj.skillProficiency = {};
  Object.keys(SKILLS).forEach(sid => { if(obj.skillProficiency[sid] === undefined) obj.skillProficiency[sid] = 0; });
  dpAfterCharChange(obj, 'skillProficiency');
  toast('已学会全部技能');
}
function dpCharAllSkillsMax(charId){
  const obj = getCharObj(charId || 'player');
  if(!obj) return;
  if(!obj.skillProficiency) obj.skillProficiency = {};
  const ids = Object.keys(obj.skillProficiency);
  if(!ids.length){ toast('该角色还没学技能'); return; }
  ids.forEach(sid => { obj.skillProficiency[sid] = 999999; });
  updateAllUI();
  toast('已将 ' + ids.length + ' 个技能熟练度拉满');
  renderDebugContent();
}
function dpCharSetProf(sid, val){
  const obj = dpCharObj(debugEdit);
  if(!obj) return;
  if(!obj.skillProficiency) obj.skillProficiency = {};
  obj.skillProficiency[sid] = Math.max(0, dpInt(val, 0));
  dpAfterCharChange(obj, 'skillProficiency');
}
function dpCharMaxProf(sid){
  const obj = dpCharObj(debugEdit);
  if(!obj) return;
  if(!obj.skillProficiency) obj.skillProficiency = {};
  obj.skillProficiency[sid] = 999999;
  dpAfterCharChange(obj, 'skillProficiency');
}
function dpCharRemoveSkill(sid){
  const obj = dpCharObj(debugEdit);
  if(!obj) return;
  if(obj.skillProficiency) delete obj.skillProficiency[sid];
  if(Array.isArray(obj.equippedSkills)) obj.equippedSkills = obj.equippedSkills.map(s => s === sid ? null : s);
  dpAfterCharChange(obj, 'skillProficiency');
}
function dpCharSetBehavior(val){
  const obj = dpCharObj(debugEdit);
  if(!obj) return;
  obj.behavior = String(val || 'default');
  dpAfterCharChange(obj, 'behavior');
}

function dpCharApplyPassivesJson(){
  const el = document.getElementById('dpCharPassivesJson');
  const obj = dpCharObj(debugEdit);
  if(!el || !obj) return;
  let arr;
  try{ arr = JSON.parse(el.value || '[]'); }catch(e){ toast('被动 JSON 格式错误'); return; }
  if(!Array.isArray(arr)){ toast('被动必须是数组'); return; }
  obj.personalPassives = arr;
  dpAfterCharChange(obj, 'personalPassives');
  toast('个性化被动已应用');
}
function dpCharAddPassiveExample(){
  const el = document.getElementById('dpCharPassivesJson');
  const obj = dpCharObj(debugEdit);
  if(!el || !obj) return;
  const arr = Array.isArray(obj.personalPassives) ? obj.personalPassives.slice() : [];
  arr.push({ name:'调试被动', effects:[{ type:'phys_atk_up', value:30, scope:'battle' }] });
  obj.personalPassives = arr;
  dpAfterCharChange(obj, 'personalPassives');
}
function dpCharApplyAiJson(){
  const el = document.getElementById('dpCharAiJson');
  const obj = dpCharObj(debugEdit);
  if(!el || !obj) return;
  let arr;
  try{ arr = JSON.parse(el.value || '[]'); }catch(e){ toast('AI JSON 格式错误'); return; }
  if(!Array.isArray(arr)){ toast('AI 必须是数组'); return; }
  obj.ai = arr;
  dpAfterCharChange(obj, 'ai');
  toast('AI 权重已应用');
}
function dpCharApplyRawJson(){
  const el = document.getElementById('dpCharRawJson');
  const obj = dpCharObj(debugEdit);
  if(!el || !obj) return;
  let parsed;
  try{ parsed = JSON.parse(el.value || '{}'); }catch(e){ toast('JSON 格式错误'); return; }
  if(!parsed || Array.isArray(parsed) || typeof parsed !== 'object'){ toast('必须是 JSON 对象'); return; }
  Object.keys(parsed).forEach(k => {
    if(k === 'id' || k === 'templateId' || k === 'instanceId') return;
    obj[k] = dpDeep(parsed[k]);
  });
  dpAfterCharChange(obj, 'raw');
  toast('角色关键字段已应用');
}
function dpCharRawJsonText(obj){
  const out = {};
  DP_CHAR_SNAPSHOT_KEYS.forEach(k => { if(obj[k] !== undefined) out[k] = obj[k]; });
  out.id = obj.id;
  if(obj.templateId) out.templateId = obj.templateId;
  return JSON.stringify(out, null, 2);
}

function dpTemplateSyncKeys(){
  return ['base','growth','hit','dodge','critRate','critMult','classes','race','faction','factionTags',
    'equipment','equippedSkills','ai','behavior','isPet','canRecruit','canBattle',
    'appearanceAge','deathAge','isUnique','personalPassives',
    'suggestedLevel','mapLevel','rank','drops'];
}
function dpApplyTemplateToInstances(tplId){
  if(!currentGame || !currentGame.characters) return 0;
  const tpl = getCharacterTemplate(tplId);
  if(!tpl) return 0;
  const keys = dpTemplateSyncKeys();
  let count = 0;
  for(const id in currentGame.characters){
    const inst = currentGame.characters[id];
    if(!inst) continue;
    const baseId = String(inst.templateId || id).split('#')[0];
    if(baseId !== String(tplId)) continue;
    keys.forEach(k => { if(tpl[k] !== undefined) inst[k] = dpDeep(tpl[k]); });
    normalizeCharAttributeModel(inst);
    recalcCharStats(inst);
    count++;
  }
  updateAllUI();
  debugSyncBattle();
  return count;
}
function dpCharApplyToInstances(){
  const ed = debugEdit;
  if(!ed || ed.mode !== 'template') return;
  dpShowConfirm('同步模板到当前存档',
    '把这张角色卡的数值 / 装备 / 技能 / AI 覆盖到当前存档里所有同模板实例？\n等级、好感、剧情与 HP 比例会保留。',
    () => {
      const n = dpApplyTemplateToInstances(ed.id);
      toast('已同步 ' + n + ' 个实例');
      renderDebugContent();
    });
}
function dpCharPushToTemplate(){
  const ed = debugEdit;
  if(!ed || ed.mode !== 'runtime' || ed.id === 'player') return;
  const obj = getNpc(ed.id);
  const tpl = obj && getCharacterTemplate(obj.templateId || ed.id);
  if(!tpl){ toast('找不到角色模板'); return; }
  dpShowConfirm('写回角色模板',
    '把当前实例的数值 / 装备 / 技能 / AI 写回角色卡模板？\n这会改变之后所有同模板角色与导出补丁。',
    () => {
      dpTemplateSyncKeys().forEach(k => { if(obj[k] !== undefined) tpl[k] = dpDeep(obj[k]); });
      dpMarkCharacter(tpl.id);
      toast('已写回模板 ' + tpl.id);
      renderDebugContent();
    });
}
function dpCharReset(){
  const ed = debugEdit;
  if(!ed) return;
  const obj = dpCharObj(ed);
  if(!obj) return;
  if(ed.mode === 'template'){
    const orig = _ORIGINAL_DATA.CHARACTERS[ed.id];
    if(!orig){ toast('没有原始快照'); return; }
    dpShowConfirm('还原角色模板', '把「' + dpEsc(obj.name || ed.id) + '」还原成文件里的原始数值？', () => {
      dpReplaceObject(obj, orig);
      delete debugChanges.characters[ed.id];
      updateAllUI();
      debugSyncBattle();
      renderDebugContent();
      toast('模板已还原');
    });
  }else if(ed.id === 'player'){
    toast('玩家没有角色卡模板，请使用「撤销本次修改」');
  }else{
    const tpl = getCharacterTemplate(obj.templateId || ed.id);
    if(!tpl){ toast('找不到模板'); return; }
    dpShowConfirm('重置为角色模板', '用当前角色卡模板覆盖这个实例的数值 / 装备 / 技能？', () => {
      dpTemplateSyncKeys().forEach(k => { if(tpl[k] !== undefined) obj[k] = dpDeep(tpl[k]); });
      normalizeCharAttributeModel(obj);
      recalcCharStats(obj);
      updateAllUI();
      debugSyncBattle();
      renderDebugContent();
      toast('实例已重置为模板');
    });
  }
}
function dpCharSyncInitialConfig(){
  const ed = debugEdit;
  if(!ed || ed.id !== 'player') return;
  PLAYER_BASE_CONFIG.base = dpDeep(currentGame.base);
  PLAYER_BASE_CONFIG.growth = dpDeep(currentGame.growth);
  PLAYER_BASE_CONFIG.startLevel = Math.max(1, dpInt(currentGame.level, 1));
  toast('已把当前 base / growth / 等级同步为新建角色初始值');
  renderDebugContent();
}

/* ---------- 角色编辑页 HTML ---------- */
const DP_SECTION_STATE = {};
document.addEventListener('toggle', function(e){
  const el = e.target;
  if(el && el.classList && el.classList.contains('dp-section') && el.dataset.dpsec){
    DP_SECTION_STATE[el.dataset.dpsec] = !!el.open;
  }
}, true);
function dpSection(title, body, open){
  const prefix = (typeof debugEdit !== 'undefined' && debugEdit && debugEdit.kind) ? (debugEdit.kind + ':') : '';
  const key = prefix + String(title);
  const isOpen = (DP_SECTION_STATE[key] !== undefined) ? DP_SECTION_STATE[key] : (open !== false);
  return '<details class="dp-section" data-dpsec="' + dpEsc(key) + '"' + (isOpen ? ' open' : '') + '>'
    + '<summary>' + title + '</summary><div class="dp-section-body">' + body + '</div></details>';
}
function dpCharEditHtml(){
  const ed = debugEdit;
  const obj = dpCharObj(ed);
  if(!obj){ debugEdit = null; return '<div class="quest-empty">角色不存在</div>'; }
  const st = dpStats(obj);
  const attr = st.attr;
  const eqs = st.eqs;
  const isPlayer = ed.id === 'player' && ed.mode === 'runtime';
  const isTemplate = ed.mode === 'template';
  const tplId = obj.templateId || String(ed.id).split('#')[0];
  const classes = (obj.classes || ['','']).slice(0, 2);
  const name = obj.name || ed.id;
  const hpNow = isTemplate ? st.maxHp : (obj.hp === undefined ? st.maxHp : obj.hp);
  const mpNow = isTemplate ? st.maxMp : (obj.mp === undefined ? st.maxMp : obj.mp);

  let h = '<div class="debug-actions">'
    + '<button class="debug-btn" onclick="debugBackToList()">← 返回列表</button>'
    + '<button class="debug-btn" onclick="dpCharRevert()">撤销本次修改</button>'
    + (isTemplate
        ? '<button class="debug-btn success" onclick="dpCharApplyToInstances()">应用到当前存档实例</button>'
        : '')
    + (!isTemplate && !isPlayer
        ? '<button class="debug-btn" onclick="dpCharPushToTemplate()">写回角色卡模板</button>'
        : '')
    + '<button class="debug-btn danger" onclick="dpCharReset()">' + (isTemplate ? '还原模板' : '重置为模板') + '</button>'
    + '</div>';

  h += '<div class="debug-info"><b style="color:#ffcc66">' + dpEsc(name) + '</b> · ' + dpEsc(ed.id)
    + '<br>' + (isTemplate ? '角色卡模板：改动只影响之后生成的角色 / 战斗，需导出补丁保存到文件。' : '当前存档实例：改动会随下次存档保存。')
    + '<br><span style="color:#8cb">HP ' + dpEsc(hpNow) + ' / ' + dpEsc(st.maxHp)
    + '　MP ' + dpEsc(mpNow) + ' / ' + dpEsc(st.maxMp)
    + '　物攻 ' + attr.physAtk + '　魔攻 ' + attr.magicAtk
    + '　防御 ' + attr.def + '　速度 ' + attr.spd + '</span></div>';

  /* 1. 基础信息 */
  let base = '<div class="dp-grid">';
  base += dpField('卡面等级', '<input class="debug-input" type="number" min="1" value="' + dpInt(obj.level, 1) + '" onchange="dpCharSetField(\'level\',this.value)">');
  if(obj.suggestedLevel !== undefined || isTemplate){
    base += dpField('建议等级（遭遇默认）', '<input class="debug-input" type="number" min="1" value="' + dpInt(obj.suggestedLevel, 1) + '" onchange="dpCharSetField(\'suggestedLevel\',this.value)">');
  }
  if(!isTemplate){
    base += dpField('当前 HP', '<input class="debug-input" type="number" min="0" value="' + dpEsc(hpNow) + '" onchange="dpCharSetField(\'hp\',this.value)">');
    base += dpField('当前 MP', '<input class="debug-input" type="number" min="0" value="' + dpEsc(mpNow) + '" onchange="dpCharSetField(\'mp\',this.value)">');
  }
  base += dpField('名字', '<input class="debug-input" value="' + dpEsc(obj.name || '') + '" onchange="dpCharSetField(\'name\',this.value)">');
  base += dpField('种族', '<input class="debug-input" value="' + dpEsc(obj.race || '') + '" onchange="dpCharSetField(\'race\',this.value)">');
  base += dpField('阵营', '<input class="debug-input" value="' + dpEsc(obj.faction || '') + '" onchange="dpCharSetField(\'faction\',this.value)">');
  base += dpField('阵营标签（逗号）', '<input class="debug-input" value="' + dpEsc(dpArray(obj.factionTags).join(',')) + '" onchange="dpCharSetField(\'factionTags\',this.value.split(/[,，\\s]+/).filter(Boolean))">');
  base += dpField('经验 / 升级所需', '<div class="dp-inline"><input class="debug-input" type="number" value="' + dpInt(obj.exp, 0) + '" onchange="dpCharSetField(\'exp\',this.value)"><input class="debug-input" type="number" value="' + dpInt(obj.expMax, 1) + '" onchange="dpCharSetField(\'expMax\',this.value)"></div>');
  if(isPlayer || obj.money !== undefined){
    base += dpField('金钱', '<input class="debug-input" type="number" value="' + dpInt(obj.money, 0) + '" onchange="dpCharSetField(\'money\',this.value)">');
  }
  if(!isPlayer && !isTemplate){
    base += dpField('好感 / 上限', '<div class="dp-inline"><input class="debug-input" type="number" value="' + dpInt(obj.affinity, 0) + '" onchange="dpCharSetField(\'affinity\',this.value)"><input class="debug-input" type="number" value="' + dpInt(obj.affinityMax, 100) + '" onchange="dpCharSetField(\'affinityMax\',this.value)"></div>');
  }
  base += dpField('出场年龄 / 死亡年龄', '<div class="dp-inline"><input class="debug-input" type="number" value="' + dpInt(obj.appearanceAge, 20) + '" onchange="dpCharSetField(\'appearanceAge\',this.value)"><input class="debug-input" type="number" value="' + dpInt(obj.deathAge, 80) + '" onchange="dpCharSetField(\'deathAge\',this.value)"></div>');
  base += '</div>';
  base += '<div class="dp-chips">'
    + '<label class="dp-check"><input type="checkbox" ' + (obj.isUnique ? 'checked' : '') + ' onchange="dpCharToggleFlag(\'isUnique\',this.checked)"> 唯一角色</label>'
    + '<label class="dp-check"><input type="checkbox" ' + (obj.isPet ? 'checked' : '') + ' onchange="dpCharToggleFlag(\'isPet\',this.checked)"> 宠物</label>'
    + '<label class="dp-check"><input type="checkbox" ' + (obj.canRecruit !== false ? 'checked' : '') + ' onchange="dpCharToggleFlag(\'canRecruit\',this.checked)"> 可招募</label>'
    + '<label class="dp-check"><input type="checkbox" ' + (obj.canBattle !== false ? 'checked' : '') + ' onchange="dpCharToggleFlag(\'canBattle\',this.checked)"> 可战斗</label>'
    + '</div>';
  if(isPlayer){
    base += '<div class="dp-actions"><button class="debug-btn" onclick="dpCharSyncInitialConfig()">同步为新建角色初始值</button></div>';
  }
  h += dpSection('① 基础信息', base);

  /* 2. 属性与成长 */
  let attrs = '<div class="dp-info-line">当前：体力 <b>' + attr.vit + '</b>　精神力 <b>' + attr.spi
    + '</b>　HP 上限 <b>' + st.maxHp + '</b>　MP 上限 <b>' + st.maxMp + '</b></div>';
  attrs += '<div class="dp-grid">'
    + dpField('Lv.1 体力基础', '<input class="debug-input" type="number" step="0.1" value="' + dpNum(obj.base && obj.base.vit, 0) + '" onchange="dpCharSetBase(\'vit\',this.value)">')
    + dpField('Lv.1 精神力基础', '<input class="debug-input" type="number" step="0.1" value="' + dpNum(obj.base && obj.base.spi, 0) + '" onchange="dpCharSetBase(\'spi\',this.value)">')
    + dpField('体力 / 级', '<input class="debug-input" type="number" step="0.01" value="' + dpNum(obj.growth && obj.growth.vit, 0) + '" onchange="dpCharSetGrowth(\'vit\',this.value)">')
    + dpField('精神力 / 级', '<input class="debug-input" type="number" step="0.01" value="' + dpNum(obj.growth && obj.growth.spi, 0) + '" onchange="dpCharSetGrowth(\'spi\',this.value)">')
    + dpField('直接改当前体力', '<input class="debug-input" type="number" step="0.1" value="' + attr.vit + '" onchange="dpCharSetCurrentAttr(\'vit\',this.value)">')
    + dpField('直接改当前精神力', '<input class="debug-input" type="number" step="0.1" value="' + attr.spi + '" onchange="dpCharSetCurrentAttr(\'spi\',this.value)">')
    + '</div>';
  attrs += '<div class="dp-hint">「直接改当前」会按当前等级反推 Lv.1 基础值，成长值保持不变。HP / MP / 物攻 / 魔攻 / 防御 / 速度全部由体力与精神力派生。</div>';
  const kinds = ['minion','normal','strong'];
  if(isTemplate && (obj.kind === 'enemy' || obj.rank !== undefined)){
    attrs += '<div class="dp-actions">';
    kinds.forEach(k => {
      attrs += '<button class="debug-btn" onclick="dpCharApplyRank(\'' + k + '\')">套用' + dpRankLabel(k) + '档位</button>';
    });
    attrs += '</div>';
  }
  h += dpSection('② 属性与成长', attrs);

  /* 3. 战斗四率 */
  let rates = '<div class="dp-grid">'
    + dpField('命中率 %', '<input class="debug-input" type="number" step="1" min="0" max="200" value="' + dpPct(st.rates.hit) + '" onchange="dpCharSetRate(\'hit\',this.value)">')
    + dpField('闪避率 %', '<input class="debug-input" type="number" step="1" min="0" max="100" value="' + dpPct(st.rates.dodge) + '" onchange="dpCharSetRate(\'dodge\',this.value)">')
    + dpField('暴击率 %', '<input class="debug-input" type="number" step="1" min="0" max="100" value="' + dpPct(st.rates.critRate) + '" onchange="dpCharSetRate(\'critRate\',this.value)">')
    + dpField('暴击倍数', '<input class="debug-input" type="number" step="0.1" min="1" max="10" value="' + dpNum(st.rates.critMult, 1.5) + '" onchange="dpCharSetRate(\'critMult\',this.value)">')
    + '</div>';
  rates += '<div class="dp-hint">上限：命中 ' + dpPct(HIT_CAP) + '% / 闪避 ' + dpPct(DODGE_CAP) + '% / 暴击率 ' + dpPct(CRIT_RATE_CAP) + '% / 暴击倍数 ' + CRIT_MULT_CAP + '。装备与被动会在此之上叠加。</div>';
  h += dpSection('③ 战斗四率', rates);

  /* 4. 装备挂载 */
  if(!obj.equipment) obj.equipment = makeEmptyEquipment();
  let equips = '<div class="dp-equip-list">';
  EQUIP_SLOTS.forEach(slot => {
    const inst = obj.equipment[slot];
    const tpl = inst ? EQUIPS[inst.id] : null;
    const ri = inst && inst.rarity && ITEM_RARITY[inst.rarity];
    equips += '<div class="dp-equip-row">'
      + '<div class="dp-equip-slot">' + dpEsc(EQUIP_SLOT_LABEL[slot] || slot) + '</div>'
      + '<select class="debug-select dp-grow" onchange="dpCharSetEquip(\'' + slot + '\',this.value)">'
      + dpEquipSlotOptions(slot, inst ? inst.id : '')
      + '</select>'
      + (inst
          ? '<span class="dp-tag">' + (ri ? ri.label : '未定') + ' · ' + ((inst.words || []).length) + '条</span>'
            + (!isTemplate ? '<button class="debug-btn" onclick="debugOpenItemEditInstance(\'' + dpEsc(inst.id) + '\',\'' + dpEsc(ed.id) + '\',\'' + slot + '\',-1)">编辑实例</button>' : '')
            + '<button class="debug-btn" onclick="debugOpenItemEdit(\'' + dpEsc(inst.id) + '\',\'template\')">模板</button>'
          : '<span class="dp-hint-inline">空</span>')
      + '</div>';
  });
  equips += '</div>';
  equips += '<div class="dp-actions"><button class="debug-btn danger" onclick="dpCharClearEquip()">清空全部装备</button></div>';
  equips += '<div class="dp-hint">装备词条汇总：物攻 +' + (eqs.physAtk || 0) + '　魔攻 +' + (eqs.magicAtk || 0)
    + '　防御 +' + (eqs.defBonus || 0) + '　HP +' + (eqs.maxHpBonus || 0)
    + '　MP +' + (eqs.maxMpBonus || 0) + '　速度 ' + (eqs.spdMod || 0)
    + '　闪避 +' + dpPct(eqs.dodge || 0) + '%　暴击 +' + dpPct(eqs.critRate || 0) + '%</div>';
  h += dpSection('④ 装备挂载（8 槽）', equips);

  /* 5. 技能挂载 */
  let skills = '';
  if(!Array.isArray(obj.equippedSkills)) obj.equippedSkills = [null, null, null, null];
  for(let i = 0; i < 4; i++){
    skills += '<div class="dp-equip-row"><div class="dp-equip-slot">技能 ' + (i + 1) + '</div>'
      + '<select class="debug-select dp-grow" onchange="dpCharSetSkillSlot(' + i + ',this.value)">'
      + '<option value="">— 空槽 —</option>'
      + dpSkillOptions(obj.equippedSkills[i] || '')
      + '</select></div>';
  }
  const profIds = obj.skillProficiency ? Object.keys(obj.skillProficiency) : [];
  skills += '<div class="dp-actions">'
    + '<button class="debug-btn" onclick="dpCharLearnAll()">学会全部技能</button>'
    + '<button class="debug-btn success" onclick="dpCharAllSkillsMax(\'' + dpEsc(ed.id) + '\')">已学技能全部 MAX</button>'
    + '</div>';
  skills += '<div class="dp-sub-title">已学技能 / 熟练度（' + profIds.length + '）</div>';
  if(profIds.length){
    skills += '<div class="dp-prof-list">';
    profIds.slice(0, 120).forEach(sid => {
      const sk = SKILLS[sid];
      const lv = getSkillLevel(isPlayer ? { isPlayer:true } : { npcId:ed.id }, sid);
      skills += '<div class="dp-prof-row">'
        + '<span class="dp-grow">' + dpEsc(sk ? sk.name : sid) + ' <span class="dp-hint-inline">' + dpEsc(sid) + ' · Lv.' + lv + '</span></span>'
        + '<input class="debug-input" type="number" min="0" value="' + dpInt(obj.skillProficiency[sid], 0) + '" onchange="dpCharSetProf(\'' + dpEsc(sid) + '\',this.value)">'
        + '<button class="debug-btn" onclick="dpCharMaxProf(\'' + dpEsc(sid) + '\')">MAX</button>'
        + '<button class="debug-btn danger" onclick="dpCharRemoveSkill(\'' + dpEsc(sid) + '\')">×</button>'
        + '</div>';
    });
    skills += '</div>';
    if(profIds.length > 120){
      skills += '<div class="dp-hint">只列出前 120 个已学技能（共 ' + profIds.length + ' 个）。要点满全部请用上面的「已学技能全部 MAX」。</div>';
    }
  }else{
    skills += '<div class="dp-hint">还没有学会任何技能。先「学会全部技能」，或到技能页给这个角色发放。</div>';
  }
  h += dpSection('⑤ 技能挂载 / 熟练度', skills, false);

  /* 6. 职业 / 被动 / AI */
  let passives = '<div class="dp-grid">'
    + dpField('职业 1', '<input class="debug-input" list="dpClassList" value="' + dpEsc(classes[0] || '') + '" onchange="dpCharSetClass(0,this.value)">')
    + dpField('职业 2', '<input class="debug-input" list="dpClassList" value="' + dpEsc(classes[1] || '') + '" onchange="dpCharSetClass(1,this.value)">')
    + dpField('AI 行为', '<select class="debug-select" onchange="dpCharSetBehavior(this.value)">'
        + [['default','默认'],['guard','防守'],['aggressive','进攻'],['assault','伏击'],['coward','怯懦']]
            .map(x => '<option value="' + x[0] + '"' + ((obj.behavior || 'default') === x[0] ? ' selected' : '') + '>' + x[1] + '</option>').join('')
        + '</select>')
    + '</div>';
  passives += '<datalist id="dpClassList">' + Object.keys(PASSIVE_SKILLS).map(c => '<option value="' + dpEsc(c) + '">').join('') + '</datalist>';
  passives += '<div class="dp-sub-title">称号</div><div class="dp-chips">';
  Object.keys(TITLES).forEach(tid => {
    const t = TITLES[tid];
    passives += '<label class="dp-check"><input type="checkbox" ' + ((obj.titles || []).indexOf(tid) >= 0 ? 'checked' : '') + ' onchange="dpCharToggleTitle(\'' + tid + '\',this.checked)"> ' + dpEsc(t.name || tid) + '</label>';
  });
  passives += '</div>';
  passives += '<div class="dp-sub-title">个性化被动（JSON）</div>'
    + '<textarea class="debug-json dp-json" id="dpCharPassivesJson" spellcheck="false">' + dpEsc(JSON.stringify(obj.personalPassives || [], null, 2)) + '</textarea>'
    + '<div class="dp-actions"><button class="debug-btn success" onclick="dpCharApplyPassivesJson()">应用被动</button>'
    + '<button class="debug-btn" onclick="dpCharAddPassiveExample()">加一条示例</button></div>';
  passives += '<div class="dp-sub-title">AI 权重（JSON：skill / w）</div>'
    + '<textarea class="debug-json dp-json" id="dpCharAiJson" spellcheck="false">' + dpEsc(JSON.stringify(obj.ai || [], null, 2)) + '</textarea>'
    + '<div class="dp-actions"><button class="debug-btn success" onclick="dpCharApplyAiJson()">应用 AI</button></div>';
  h += dpSection('⑥ 职业 / 称号 / 被动 / AI', passives, false);

  /* 7. 掉落表 */
  const drops = Array.isArray(obj.drops) ? obj.drops : [];
  let dropHtml = '<div class="dp-hint">掉落读的是角色卡模板。改完模板后，若要让当前存档的已生成敌人也生效，请点「应用到当前存档实例」。</div>';
  if(drops.length){
    dropHtml += '<div class="dp-drop-list">';
    drops.forEach((d, di) => {
      const it = EQUIPS[d.itemId];
      dropHtml += '<div class="dp-drop-row">'
        + '<span class="dp-grow">' + dpEsc(it ? it.name : ('未知道具 ' + d.itemId)) + '</span>'
        + '<input class="debug-input" type="number" min="0" value="' + dpInt(d.weight, 0) + '" title="权重" onchange="dpCharSetDrop(' + di + ',\'weight\',this.value)">'
        + '<input class="debug-input" type="number" min="0" value="' + dpInt(d.min, 1) + '" title="最少" onchange="dpCharSetDrop(' + di + ',\'min\',this.value)">'
        + '<input class="debug-input" type="number" min="0" value="' + dpInt(d.max, 1) + '" title="最多" onchange="dpCharSetDrop(' + di + ',\'max\',this.value)">'
        + '<label class="dp-check"><input type="checkbox" ' + (d.guaranteed ? 'checked' : '') + ' onchange="dpCharSetDrop(' + di + ',\'guaranteed\',this.checked)"> 必掉</label>'
        + '<button class="debug-btn danger" onclick="dpCharDelDrop(' + di + ')">×</button>'
        + '</div>';
    });
    dropHtml += '</div>';
  }else{
    dropHtml += '<div class="dp-hint">这张角色卡没有掉落。</div>';
  }
  dropHtml += '<div class="dp-inline"><select class="debug-select dp-grow" id="dpDropAddItem">'
    + dpAllItemOptions() + '</select>'
    + '<button class="debug-btn" onclick="dpCharAddDrop()">+ 添加掉落</button></div>';
  h += dpSection('⑦ 掉落表（模板）', dropHtml, false);

  /* 8. 地图挂载位置 */
  h += dpSection('⑧ 地图挂载位置', dpPlacementSectionHtml(obj, ed), true);

  /* 9. 原始 JSON */
  let raw = '<div class="dp-hint">这里可以直接改角色关键字段；适合面板没覆盖到的字段。保存前请确认 JSON 合法。</div>'
    + '<textarea class="debug-json dp-json" id="dpCharRawJson" spellcheck="false">' + dpEsc(dpCharRawJsonText(obj)) + '</textarea>'
    + '<div class="dp-actions"><button class="debug-btn success" onclick="dpCharApplyRawJson()">应用 JSON</button></div>';
  h += dpSection('⑨ 原始 JSON（高级）', raw, false);

  return h;
}

function dpAllItemOptions(){
  let html = '<option value="">— 选择物品 —</option>';
  const cats = [['equip','装备'],['material','材料'],['medicine','药品'],['instant','即时道具'],['special','特殊道具']];
  cats.forEach(pair => {
    const list = Object.keys(EQUIPS).map(id => EQUIPS[id]).filter(t => t && getItemCategory(t) === pair[0]);
    if(!list.length) return;
    list.sort((a, b) => String(a.name).localeCompare(String(b.name), 'zh'));
    html += '<optgroup label="' + pair[1] + '">';
    list.forEach(t => {
      html += '<option value="' + dpEsc(t.id) + '">' + dpEsc(t.name) + '（' + dpEsc(t.id) + '）</option>';
    });
    html += '</optgroup>';
  });
  return html;
}
function dpCharAddDrop(){
  const obj = dpCharObj(debugEdit);
  const sel = document.getElementById('dpDropAddItem');
  if(!obj || !sel || !sel.value){ toast('请选择物品'); return; }
  if(!Array.isArray(obj.drops)) obj.drops = [];
  if(obj.drops.some(d => d.itemId === sel.value)){ toast('这个物品已经在掉落表里'); return; }
  obj.drops.push({ itemId:sel.value, weight:10, min:1, max:1 });
  dpAfterCharChange(obj, 'drops');
}
function dpCharSetDrop(idx, key, val){
  const obj = dpCharObj(debugEdit);
  if(!obj || !Array.isArray(obj.drops) || !obj.drops[idx]) return;
  const d = obj.drops[idx];
  if(key === 'guaranteed') d.guaranteed = !!val;
  else d[key] = Math.max(0, dpInt(val, d[key]));
  dpAfterCharChange(obj, 'drops');
}
function dpCharDelDrop(idx){
  const obj = dpCharObj(debugEdit);
  if(!obj || !Array.isArray(obj.drops)) return;
  obj.drops.splice(idx, 1);
  dpAfterCharChange(obj, 'drops');
}

function dpField(label, control){
  return '<label class="dp-field"><span>' + label + '</span>' + control + '</label>';
}
function dpRankLabel(k){
  return k === 'minion' ? '杂兵' : k === 'strong' ? '精英' : '普通';
}
function dpEquipSlotOptions(slot, selectedId){
  const list = Object.keys(EQUIPS).map(id => EQUIPS[id]).filter(tpl => {
    if(!tpl || getItemCategory(tpl) !== 'equip') return false;
    const slots = getItemEquipSlots(tpl);
    if(slot === 'offHand' && tpl.twoHanded) return false;
    return slots.indexOf(slot) >= 0;
  });
  list.sort((a, b) => (a.level || 1) - (b.level || 1) || String(a.name).localeCompare(String(b.name), 'zh'));
  let html = '<option value="">— 空 —</option>';
  list.forEach(tpl => {
    html += '<option value="' + dpEsc(tpl.id) + '"' + (tpl.id === selectedId ? ' selected' : '') + '>'
      + 'Lv.' + (tpl.level || 1) + ' ' + dpEsc(tpl.name) + '（' + dpEsc(tpl.id) + '）</option>';
  });
  if(selectedId && !list.some(t => t.id === selectedId)){
    const cur = EQUIPS[selectedId];
    html += '<option value="' + dpEsc(selectedId) + '" selected>' + dpEsc(cur ? cur.name : selectedId) + '（当前）</option>';
  }
  return html;
}
function dpSkillOptions(selectedId){
  const groups = {};
  Object.keys(SKILLS).forEach(sid => {
    const sk = SKILLS[sid];
    const cls = sk.classLimit || '通用';
    if(!groups[cls]) groups[cls] = [];
    groups[cls].push(sk);
  });
  let html = '';
  Object.keys(groups).sort((a, b) => String(a).localeCompare(String(b), 'zh')).forEach(cls => {
    html += '<optgroup label="' + dpEsc(cls) + '">';
    groups[cls].sort((a, b) => String(a.name).localeCompare(String(b.name), 'zh')).forEach(sk => {
      html += '<option value="' + dpEsc(sk.id) + '"' + (sk.id === selectedId ? ' selected' : '') + '>'
        + dpEsc(sk.name) + '（' + dpEsc(sk.id) + '）</option>';
    });
    html += '</optgroup>';
  });
  return html;
}
/* ---------- 地图挂载位置 ---------- */
function dpMapIdOfTile(tileId){
  for(const mapId in MAPS){
    if((MAPS[mapId].tiles || []).some(t => t.id === tileId)) return mapId;
  }
  return null;
}
function dpCharacterTiles(id){
  if(typeof _findCharacterTiles === 'function') return _findCharacterTiles(id);
  const out = [];
  for(const mapId in MAPS){
    (MAPS[mapId].tiles || []).forEach(tile => {
      if((tile.npcs || []).includes(id) || (tile.actors || []).some(a => a && a.charId === id)) out.push(tile);
    });
  }
  return out;
}
function dpPlacementMapOptions(selected){
  const ids = Object.keys(MAPS).sort((a, b) => String(MAPS[a].name).localeCompare(String(MAPS[b].name), 'zh'));
  return ids.map(id => '<option value="' + dpEsc(id) + '"' + (id === selected ? ' selected' : '') + '>'
    + dpEsc(MAPS[id].name || id) + '（' + dpEsc(id) + '）</option>').join('');
}
function dpPlacementTileOptions(mapId, selected){
  const map = MAPS[mapId];
  if(!map) return '';
  return (map.tiles || []).map(t => '<option value="' + dpEsc(t.id) + '"' + (t.id === selected ? ' selected' : '') + '>'
    + dpEsc(t.name || t.id) + '（' + dpEsc(t.id) + '）</option>').join('');
}
function dpPlacementSelectMap(mapId){
  const ed = debugEdit;
  if(!ed || ed.kind !== 'char') return;
  ed.placeMapId = mapId;
  const map = MAPS[mapId];
  ed.placeTileId = (map && map.tiles && map.tiles[0]) ? map.tiles[0].id : '';
  renderDebugContent();
}
function dpPlacementSelectTile(tileId){
  const ed = debugEdit;
  if(!ed || ed.kind !== 'char') return;
  ed.placeTileId = tileId;
}
function dpPlacementSectionHtml(obj, ed){
  if(ed.mode === 'template'){
    return '<div class="dp-hint">模板模式不移动地图实例。请回到「角色」页打开这个角色的「当前实例」再改挂载位置。</div>';
  }
  const isPlayer = ed.id === 'player';
  const mapId = ed.placeMapId || currentMapId;
  const tileId = ed.placeTileId || currentTileId;
  const map = MAPS[mapId];
  const tile = map ? (map.tiles || []).find(t => t.id === tileId) : null;
  let h = '<div class="dp-info-line">';
  if(isPlayer){
    const curMap = MAPS[currentMapId];
    const curTile = curMap ? (curMap.tiles || []).find(t => t.id === currentTileId) : null;
    h += '当前位置：<b>' + dpEsc(curMap ? curMap.name : currentMapId) + ' · ' + dpEsc(curTile ? curTile.name : currentTileId) + '</b>';
  }else{
    const tiles = dpCharacterTiles(ed.id);
    if(tiles.length){
      h += '当前挂载：<b>' + tiles.map(t => {
        const mid = dpMapIdOfTile(t.id);
        return dpEsc((MAPS[mid] ? MAPS[mid].name : mid) + ' · ' + t.name);
      }).join(' / ') + '</b>';
    }else{
      h += '当前未在地图上（可能在队伍中 / 已死亡 / 被隐藏）。';
    }
    if(typeof isNpcRecruited === 'function' && isNpcRecruited(ed.id)){
      h += '<br><span style="color:#ffcc66">该角色在队伍中：移动只会更新退队后的回归点，不会立刻放到地图上。</span>';
    }
  }
  h += '</div>';
  h += '<div class="dp-grid">'
    + dpField('目标地图', '<select class="debug-select" onchange="dpPlacementSelectMap(this.value)">' + dpPlacementMapOptions(mapId) + '</select>')
    + dpField('目标格子', '<select class="debug-select" onchange="dpPlacementSelectTile(this.value)">' + dpPlacementTileOptions(mapId, tileId) + '</select>')
    + '</div>';
  h += '<div class="dp-actions">';
  if(isPlayer){
    h += '<button class="debug-btn success" onclick="dpTeleportPlayer()">传送到选中格</button>';
  }else{
    h += '<button class="debug-btn success" onclick="dpMoveCharacterPlacement()">移动到选中格</button>'
      + '<button class="debug-btn danger" onclick="dpRemoveCharacterPlacement()">从地图移除</button>';
  }
  h += '</div>';
  h += '<div class="dp-hint">位置会写入当前存档（debugPlacements），刷新 / 读档后保留，不会改 data-world.js。'
    + (isPlayer ? ' 传送会同时保存游戏。' : '') + '</div>';
  return h;
}
function dpMoveCharacterPlacement(){
  const ed = debugEdit;
  if(!ed || ed.kind !== 'char' || ed.mode !== 'runtime') return;
  const map = MAPS[ed.placeMapId];
  const tile = map && (map.tiles || []).find(t => t.id === ed.placeTileId);
  if(!tile){ toast('请选择目标格子'); return; }
  const tileId = tile.id;
  if(ed.id === 'player'){ dpTeleportPlayer(); return; }
  const npc = getNpc(ed.id);
  if(!npc){ toast('角色不存在'); return; }
  if(!currentGame.debugPlacements) currentGame.debugPlacements = {};
  currentGame.debugPlacements[ed.id] = tileId;
  npc.homeTile = tileId;
  npc.returnTile = tileId;
  const inParty = (typeof isNpcRecruited === 'function') && isNpcRecruited(ed.id);
  if(typeof _removeCharacterPlacements === 'function') _removeCharacterPlacements(ed.id);
  if(!inParty && typeof _addCharacterPlacement === 'function') _addCharacterPlacement(ed.id, tileId);
  if(currentTalkNpc === ed.id){
    currentTalkNpc = null;
    currentTalkPlacementId = null;
    const box = document.getElementById('storyBox');
    if(box) box.innerHTML = '';
  }
  renderCurrentMap();
  updateAllUI();
  updateActionButtons();
  renderNpcRow();
  if(currentSlot >= 0) saveGame(currentSlot, {silent:true});
  toast((inParty ? '已更新退队回归点：' : '已移动到：') + (map.name || '') + ' · ' + (tile.name || tileId));
  renderDebugContent();
}
function dpRemoveCharacterPlacement(){
  const ed = debugEdit;
  if(!ed || ed.kind !== 'char' || ed.mode !== 'runtime' || ed.id === 'player') return;
  if(!currentGame.debugPlacements) currentGame.debugPlacements = {};
  currentGame.debugPlacements[ed.id] = '__none__';
  const npc = getNpc(ed.id);
  if(npc){ npc.homeTile = null; npc.returnTile = null; }
  if(typeof _removeCharacterPlacements === 'function') _removeCharacterPlacements(ed.id);
  if(currentTalkNpc === ed.id){
    currentTalkNpc = null; currentTalkPlacementId = null;
    const box = document.getElementById('storyBox'); if(box) box.innerHTML = '';
  }
  renderCurrentMap();
  updateAllUI();
  updateActionButtons();
  renderNpcRow();
  if(currentSlot >= 0) saveGame(currentSlot, {silent:true});
  toast('已从地图移除（仍可在队伍 / 角色列表中找到）');
  renderDebugContent();
}
function dpTeleportPlayer(){
  const ed = debugEdit;
  if(!ed || ed.kind !== 'char') return;
  const map = MAPS[ed.placeMapId];
  const tile = map && (map.tiles || []).find(t => t.id === ed.placeTileId);
  if(!tile){ toast('请选择目标格子'); return; }
  currentMapId = ed.placeMapId;
  currentTileId = tile.id;
  currentMapLayer = 'street';
  currentTalkNpc = null;
  currentTalkPlacementId = null;
  const box = document.getElementById('storyBox'); if(box) box.innerHTML = '';
  if(typeof battleCheckedTileId !== 'undefined') battleCheckedTileId = null;
  if(currentGame){
    currentGame.currentMapId = currentMapId;
    currentGame.currentTileId = currentTileId;
  }
  if(typeof updateLayerButtons === 'function') updateLayerButtons();
  renderCurrentMap();
  if(typeof centerMap === 'function') centerMap();
  updateAllUI();
  updateActionButtons();
  renderNpcRow();
  if(currentSlot >= 0) saveGame(currentSlot, {silent:true});
  toast('已传送到：' + (map.name || '') + ' · ' + (tile.name || tile.id));
  renderDebugContent();
}

function dpCharApplyRank(kind){
  const ed = debugEdit;
  const obj = dpCharObj(ed);
  if(!obj || !ENEMY_ATTR_TEMPLATE[kind]) return;
  const t = ENEMY_ATTR_TEMPLATE[kind];
  obj.base = { vit: t.base.vit, spi: t.base.spi };
  obj.growth = { vit: t.growth.vit, spi: t.growth.spi };
  obj.rank = kind;
  dpAfterCharChange(obj, 'base');
  toast('已套用' + dpRankLabel(kind) + '档位');
}

/* ============================================================
   二、角色页 / 敌人页入口
   ============================================================ */

function dpRenderDebugChars(c){
  DP_BASE.renderDebugChars(c);
  const first = c.querySelector('.debug-actions');
  if(first){
    first.insertAdjacentHTML('beforebegin',
      '<div class="debug-info">点角色右侧「详细数值 / 挂载」可以改基础值、成长、四率、装备、技能、被动与 AI；'
      + 'NPC 还可以「写回角色卡模板」。</div>');
  }
}

function dpBuildDebugCharEntry(id, charObj){
  let html = '';
  if(typeof DP_BASE.buildDebugCharEntry === 'function') html = DP_BASE.buildDebugCharEntry(id, charObj);
  const tplId = charObj && (charObj.templateId || String(id).split('#')[0]);
  let extra = '<div class="debug-actions">'
    + '<button class="debug-btn success" onclick="dpOpenCharEdit(\'' + dpEsc(id) + '\',\'runtime\')">详细数值 / 挂载</button>';
  if(id !== 'player' && tplId) extra += '<button class="debug-btn" onclick="dpOpenCharEdit(\'' + dpEsc(tplId) + '\',\'template\')">角色卡模板</button>';
  if(id !== 'player') extra += '<button class="debug-btn" onclick="dpCharAllSkillsMax(\'' + dpEsc(id) + '\')">技能全 MAX</button>';
  extra += '</div>';
  return html + extra;
}

let dpEnemyKeyword = '';
let dpEnemyFilter = 'enemy';
function dpRenderDebugEnemies(c){
  const total = Object.keys(CHARACTERS).length;
  c.innerHTML = '<div class="debug-info">角色卡模板编辑：改完可以「应用到当前存档实例」，让已经生成的敌人立刻生效。'
    + '<br>共 ' + total + ' 张角色卡。</div>'
    + '<div class="debug-search"><input type="text" id="dpEnemySearch" placeholder="搜索名字 / 编号 / 种族 / 职业..." value="' + dpEsc(dpEnemyKeyword) + '" oninput="dpFilterEnemies(this.value)"></div>'
    + '<div class="dp-chips">'
    + dpFilterBtn('enemy', '敌人')
    + dpFilterBtn('npc', 'NPC')
    + dpFilterBtn('pet', '宠物')
    + dpFilterBtn('all', '全部')
    + '</div>'
    + '<div id="dpEnemyList"></div>';
  dpRenderEnemyList();
}
function dpFilterBtn(key, label){
  return '<button class="debug-btn' + (dpEnemyFilter === key ? ' success' : '') + '" onclick="dpSetEnemyFilter(\'' + key + '\')">' + label + '</button>';
}
function dpSetEnemyFilter(key){
  dpEnemyFilter = key;
  renderDebugContent();
}
function dpFilterEnemies(val){
  dpEnemyKeyword = val || '';
  dpRenderEnemyList();
}
function dpRenderEnemyList(){
  const el = document.getElementById('dpEnemyList');
  if(!el) return;
  const kw = (dpEnemyKeyword || '').toLowerCase().trim();
  const rows = [];
  for(const id in CHARACTERS){
    const t = CHARACTERS[id];
    if(!t || t.isEnv) continue;
    const kind = t.kind || 'npc';
    const isPet = kind === 'enemy' && (t.rank === 'pet' || (t.isPet === true && t.canRecruit === true));
    if(dpEnemyFilter === 'enemy' && kind !== 'enemy') continue;
    if(dpEnemyFilter === 'npc' && kind !== 'npc') continue;
    if(dpEnemyFilter === 'pet' && !isPet) continue;
    if(kw){
      const hay = (id + ' ' + (t.name || '') + ' ' + (t.race || '') + ' ' + (t.faction || '') + ' '
        + (t.classes || []).join(' ')).toLowerCase();
      if(hay.indexOf(kw) < 0) continue;
    }
    rows.push(t);
  }
  rows.sort((a, b) => (a.suggestedLevel || 1) - (b.suggestedLevel || 1) || String(a.name).localeCompare(String(b.name), 'zh'));
  const limit = 180;
  const shown = rows.slice(0, limit);
  let html = '<div class="dp-hint">匹配 ' + rows.length + ' 张' + (rows.length > limit ? '，只显示前 ' + limit + ' 张，请用搜索缩小范围' : '') + '。</div>';
  if(!shown.length){ el.innerHTML = html + '<div class="quest-empty">没有匹配的角色卡</div>'; return; }
  html += '<div class="dp-enemy-list">';
  shown.forEach(t => {
    const lv = t.suggestedLevel || 1;
    const st = getCharAttrStats(t, lv);
    const rank = t.kind === 'enemy' ? dpRankLabel(enemyTemplateKind(t)) : '角色';
    html += '<div class="dp-enemy-row">'
      + '<div class="dp-enemy-main"><b>' + dpEsc(t.name || t.id) + '</b> <span class="dp-hint-inline">' + dpEsc(t.id) + '</span>'
      + '<div class="dp-hint-inline">' + rank + ' · 建议 Lv.' + lv + ' · 体力 ' + st.vit + ' / 精神 ' + st.spi
      + ' · HP ' + st.maxHp + ' · 物攻 ' + st.physAtk + ' · 防御 ' + st.def + '</div></div>'
      + '<div class="dp-enemy-actions">'
      + '<button class="debug-btn success" onclick="dpOpenCharEdit(\'' + dpEsc(t.id) + '\',\'template\')">编辑模板</button>'
      + '<button class="debug-btn" onclick="dpOpenCharEdit(\'' + dpEsc(t.id) + '\',\'runtime\')">当前实例</button>'
      + '<button class="debug-btn danger" onclick="dpResetTemplate(\'' + dpEsc(t.id) + '\')">还原</button>'
      + '</div></div>';
  });
  html += '</div>';
  el.innerHTML = html;
}
function dpResetTemplate(id){
  const orig = _ORIGINAL_DATA.CHARACTERS[id];
  if(!orig){ toast('没有原始快照'); return; }
  dpShowConfirm('还原角色卡', '把「' + dpEsc((CHARACTERS[id] && CHARACTERS[id].name) || id) + '」还原成文件里的原始数据？', () => {
    dpReplaceObject(CHARACTERS[id], orig);
    if(debugChanges.characters) delete debugChanges.characters[id];
    debugRecalcAll();
    updateAllUI();
    debugSyncBattle();
    renderDebugContent();
    toast('角色卡已还原');
  });
}

/* ============================================================
   三、物品页 / 物品编辑增强
   ============================================================ */

function dpRenderDebugEquipList(charId, keyword){
  const listEl = document.getElementById('debugEquipList');
  if(!listEl) return;
  const kw = (keyword || '').toLowerCase().trim();
  const cats = [
    ['equip', '装备'], ['material', '材料'], ['medicine', '药品'],
    ['instant', '即时道具'], ['special', '特殊道具']
  ];
  let html = '';
  let total = 0;
  cats.forEach(pair => {
    const cat = pair[0], label = pair[1];
    const list = Object.keys(EQUIPS).map(id => EQUIPS[id]).filter(tpl => {
      if(!tpl || getItemCategory(tpl) !== cat) return false;
      if(!kw) return true;
      return ((tpl.id || '') + ' ' + (tpl.name || '') + ' ' + (tpl.desc || '') + ' ' + (tpl.tags || []).join(' ')).toLowerCase().indexOf(kw) >= 0;
    });
    if(!list.length) return;
    total += list.length;
    list.sort((a, b) => (a.level || 1) - (b.level || 1) || String(a.name).localeCompare(String(b.name), 'zh'));
    const dkey = 'dpitems:' + cat;
    const open = _debugOpen(dkey, false);
    html += '<div class="debug-group' + (open ? ' open' : '') + '"><div class="debug-group-head" data-dkey="' + dkey + '" onclick="toggleDebugGroup(this)">'
      + label + '（' + list.length + '）<span class="debug-arrow">' + (open ? '▲' : '▼') + '</span></div><div class="debug-group-body">';
    list.forEach(tpl => {
      const ri = tpl.rarity && ITEM_RARITY[tpl.rarity];
      const draft = tpl.draft ? ' <span class="dp-tag warn">未设计</span>' : '';
      html += '<div class="dp-item-row">'
        + '<div class="dp-item-main"><b>' + dpEsc(tpl.name || tpl.id) + '</b>' + draft
        + '<div class="dp-hint-inline">' + dpEsc(tpl.id) + ' · Lv.' + (tpl.level || 1) + ' · ￥' + (tpl.price || 0)
        + (ri ? ' · ' + ri.label + '（' + ((tpl.words || []).length) + '词条）' : '')
        + (tpl.type ? ' · ' + dpEsc(tpl.type) : '') + '</div></div>'
        + '<div class="dp-item-actions">'
        + '<button class="debug-btn success" onclick="dpGiveItem(\'' + dpEsc(tpl.id) + '\',1)">发放</button>'
        + '<button class="debug-btn" onclick="dpGiveItem(\'' + dpEsc(tpl.id) + '\',10)">×10</button>'
        + '<button class="debug-btn" onclick="debugOpenItemEdit(\'' + dpEsc(tpl.id) + '\',\'template\')">编辑</button>'
        + (getItemCategory(tpl) === 'equip' ? '<button class="debug-btn" onclick="dpEquipToChar(\'' + dpEsc(tpl.id) + '\',\'' + dpEsc(charId) + '\')">穿上</button>' : '')
        + '</div></div>';
    });
    html += '</div></div>';
  });
  if(!total){ listEl.innerHTML = '<div class="quest-empty">没有匹配的物品</div>'; return; }
  listEl.innerHTML = html;
}

function dpGiveItem(itemId, n){
  const tpl = EQUIPS[itemId];
  if(!tpl) return;
  const count = Math.max(1, Math.min(99, dpInt(n, 1)));
  let ok = 0;
  for(let i = 0; i < count; i++){ if(addItemToBag(itemId, tpl.maxWear, tpl.durability)) ok++; }
  if(typeof updateAllUI === 'function') updateAllUI();
  toast('已发放 ' + (tpl.name || itemId) + ' ×' + ok + ' 到行囊');
}
function dpEquipToChar(itemId, charId){
  const tpl = EQUIPS[itemId];
  const obj = getCharObj(charId || debugEquipChar || 'player');
  if(!tpl || !obj) return;
  const slots = getItemEquipSlots(tpl);
  if(!slots.length){ toast('这件物品没有装备部位'); return; }
  if(!obj.equipment) obj.equipment = makeEmptyEquipment();
  let slot = slots.find(s => !obj.equipment[s]) || slots[0];
  if(slot === 'offHand' && obj.equipment.mainHand){
    const mainTpl = EQUIPS[obj.equipment.mainHand.id];
    if(mainTpl && mainTpl.twoHanded){
      obj.equipment.mainHand = null;
      slot = slots.find(s => s === 'mainHand') || 'mainHand';
    }
  }
  obj.equipment[slot] = createItemInstance(tpl, itemId);
  if(slot === 'mainHand' && tpl.twoHanded) obj.equipment.offHand = null;
  normalizeCharAttributeModel(obj);
  recalcCharStats(obj);
  if(typeof updateAllUI === 'function') updateAllUI();
  debugSyncBattle();
  dpBattleRefreshAllySkills();
  toast('已把「' + (tpl.name || itemId) + '」装备到 ' + (obj.name || charId));
  renderDebugContent();
}

/* ---- 物品编辑页：在原编辑器后追加详细字段 ---- */
function dpRenderDebugItemEdit(c){
  DP_BASE.renderDebugItemEdit(c);
  const preview = c.querySelector('#debugItemPreview');
  if(!preview) return;
  preview.insertAdjacentHTML('beforebegin', dpItemExtraHtml());
}

function dpItemIsEquip(){
  const ed = debugEdit;
  return !!(ed && ed.work && getItemCategory(ed.work) === 'equip');
}
function dpItemExtraHtml(){
  const ed = debugEdit;
  if(!ed || !ed.work) return '';
  const w = ed.work;
  const isTemplate = ed.source === 'template';
  const isEquip = dpItemIsEquip();
  let h = '<div class="dp-card"><div class="dp-sub-title">详细字段（调试挂载）</div>';

  if(isTemplate){
    h += '<div class="dp-grid">';
    h += dpField('物品类别', '<select class="debug-select" onchange="dpItemSetWork(\'category\',this.value)">'
      + ITEM_CATEGORY_ORDER.map(k => '<option value="' + k + '"' + ((w.category || getItemCategory(w)) === k ? ' selected' : '') + '>' + ITEM_CATEGORY_LABEL[k] + '</option>').join('')
      + '</select>');
    if(isEquip){
      h += dpField('装备部位', '<select class="debug-select" onchange="dpItemSetSlot(this.value)">'
        + EQUIP_SLOTS.map(s => '<option value="' + s + '"' + ((w.slot || getItemEquipSlot(w)) === s ? ' selected' : '') + '>' + EQUIP_SLOT_LABEL[s] + '</option>').join('')
        + '</select>');
      h += dpField('磨损/耐久上限', '<div class="dp-inline">'
        + '<input class="debug-input" type="number" min="0" value="' + dpInt(w.maxWear, 0) + '" onchange="dpItemSetWork(\'maxWear\',this.value)">'
        + '<input class="debug-input" type="number" min="0" value="' + dpInt(w.durability, 0) + '" onchange="dpItemSetWork(\'durability\',this.value)">'
        + '</div>');
    }
    h += '</div>';
    if(isEquip){
      h += '<div class="dp-chips">'
        + '<label class="dp-check"><input type="checkbox" ' + (w.twoHanded ? 'checked' : '') + ' onchange="dpItemSetTwoHanded(this.checked)"> 双手武器（占主副手）</label>'
        + '</div>';
      h += '<div class="dp-grid">';
      h += dpField('标签（逗号分隔）', '<input class="debug-input" value="' + dpEsc(dpArray(w.tags).join(',')) + '" onchange="dpItemSetTags(this.value)">');
      h += dpField('职业限制（逗号）', '<input class="debug-input" value="' + dpEsc(dpArray(w.classLimit).join(',')) + '" onchange="dpItemSetClassLimit(this.value)">');
      h += '</div>';
      h += '<div class="dp-hint">槽位由标签决定；双手武器会占主手+副手。改完点下面的「保存」才会写进模板。</div>';
      h += '<div class="dp-sub-title">赋予技能（逗号分隔技能 ID）</div>'
        + '<input class="debug-input dp-wide" value="' + dpEsc(dpArray(w.grantSkills).join(',')) + '" onchange="dpItemSetGrantSkills(this.value)">';
      h += '<div class="dp-sub-title">装备被动（JSON 数组）</div>'
        + '<textarea class="debug-json dp-json" id="dpItemPassivesJson" spellcheck="false">' + dpEsc(JSON.stringify(w.passives || [], null, 2)) + '</textarea>'
        + '<div class="dp-actions"><button class="debug-btn success" onclick="dpItemApplyPassives()">应用装备被动</button></div>';
      h += '<div class="dp-actions"><button class="debug-btn" onclick="dpItemFillWords()">按品阶补满词条</button>'
        + '<button class="debug-btn" onclick="dpItemMakeDesigned()">设为已设计（品阶+词条）</button></div>';
    }
    h += '<div class="dp-chips">'
      + '<label class="dp-check"><input type="checkbox" ' + (w.unique ? 'checked' : '') + ' onchange="dpItemSetWork(\'unique\',this.checked)"> 唯一物品</label>'
      + '<label class="dp-check"><input type="checkbox" ' + (w.noSell ? 'checked' : '') + ' onchange="dpItemSetWork(\'noSell\',this.checked)"> 禁止出售</label>'
      + '<label class="dp-check"><input type="checkbox" ' + (w.giftFixed ? 'checked' : '') + ' onchange="dpItemSetWork(\'giftFixed\',this.checked)"> 固定礼物值</label>'
      + '</div>';
    h += '<details class="debug-adv"><summary>原始 JSON（work，可改面板没覆盖的字段）</summary>'
      + '<textarea class="debug-json dp-json" id="dpItemRawJson" spellcheck="false">' + dpEsc(JSON.stringify(w, null, 2)) + '</textarea>'
      + '<div class="dp-actions"><button class="debug-btn" onclick="dpItemApplyRawJson()">应用 JSON</button></div></details>';
  }

  h += '<div class="dp-actions">'
    + '<button class="debug-btn success" onclick="dpGiveItem(\'' + dpEsc(ed.id) + '\',1)">发放 1 个</button>'
    + '<button class="debug-btn" onclick="dpGiveItem(\'' + dpEsc(ed.id) + '\',10)">发放 10 个</button>'
    + (getItemCategory(w) === 'equip' ? '<button class="debug-btn" onclick="dpEquipToChar(\'' + dpEsc(ed.id) + '\',\'' + dpEsc(debugEquipChar || 'player') + '\')">装备到当前角色</button>' : '')
    + '</div>';
  h += '</div>';
  return h;
}
function dpItemSetWork(key, val){
  const ed = debugEdit;
  if(!ed || !ed.work) return;
  ed.work[key] = val;
}
function dpItemSetSlot(slot){
  const ed = debugEdit;
  if(!ed || !ed.work) return;
  const w = ed.work;
  w.slot = slot;
  if(!Array.isArray(w.tags)) w.tags = [];
  Object.keys(SLOT_TAG).forEach(s => {
    w.tags = w.tags.filter(t => t !== SLOT_TAG[s]);
  });
  if(SLOT_TAG[slot]) w.tags.push(SLOT_TAG[slot]);
  if(slot === 'mainHand') w.type = 'weapon';
  else if(slot === 'offHand') w.type = (w.type === 'focus') ? 'focus' : 'shield';
  else if(slot === 'accessory' || slot === 'charm') w.type = 'accessory';
  else w.type = 'armor';
  if(w.type === 'weapon'){ if(!w.maxWear) w.maxWear = 100; delete w.durability; }
  else if(w.type === 'armor' || w.type === 'shield'){ if(!w.durability) w.durability = 100; delete w.maxWear; }
  renderDebugContent();
}
function dpItemSetTwoHanded(v){
  const ed = debugEdit;
  if(!ed || !ed.work) return;
  const w = ed.work;
  w.twoHanded = !!v;
  if(!Array.isArray(w.tags)) w.tags = [];
  if(v){
    ['tag080','tag073','tag074'].forEach(t => { if(w.tags.indexOf(t) < 0) w.tags.push(t); });
  }else{
    w.tags = w.tags.filter(t => t !== 'tag080');
  }
}
function dpItemSetTags(text){
  const ed = debugEdit;
  if(!ed || !ed.work) return;
  ed.work.tags = String(text || '').split(/[,，\s]+/).map(s => s.trim()).filter(Boolean);
}
function dpItemSetClassLimit(text){
  const ed = debugEdit;
  if(!ed || !ed.work) return;
  ed.work.classLimit = String(text || '').split(/[,，\s]+/).map(s => s.trim()).filter(Boolean);
}
function dpItemSetGrantSkills(text){
  const ed = debugEdit;
  if(!ed || !ed.work) return;
  ed.work.grantSkills = String(text || '').split(/[,，\s]+/).map(s => s.trim()).filter(s => s && SKILLS[s]);
}
function dpItemApplyPassives(){
  const ed = debugEdit;
  const el = document.getElementById('dpItemPassivesJson');
  if(!ed || !ed.work || !el) return;
  let arr;
  try{ arr = JSON.parse(el.value || '[]'); }catch(e){ toast('被动 JSON 格式错误'); return; }
  if(!Array.isArray(arr)){ toast('装备被动必须是数组'); return; }
  ed.work.passives = arr;
  toast('装备被动已写入编辑区，保存后生效');
}
function dpDefaultWord(w, index){
  const fallback = (w.type === 'weapon') ? ['phys_atk_up','spd_up','hp_drain_pct','execute_below','first_strike']
    : (w.type === 'accessory' || w.type === 'charm') ? ['maxhp_up','maxmp_up','spd_up','dodge','crit_up']
    : ['def_up','maxhp_up','vit_up','spi_up','spd_up'];
  const atom = getEffectAtom(fallback[index % fallback.length]);
  return { type: atom ? atom.id : 'def_up', value: atom && atom.mode === 'rate' ? 0.05 : 5 };
}
function dpItemFillWords(){
  const ed = debugEdit;
  if(!ed || !ed.work) return;
  const w = ed.work;
  const need = (w.rarity && ITEM_RARITY[w.rarity]) ? ITEM_RARITY[w.rarity].words : 0;
  if(!need){ toast('请先选择品阶'); return; }
  if(!Array.isArray(w.words)) w.words = [];
  w.words.forEach((x, i) => { if(!x || !x.type) w.words[i] = dpDefaultWord(w, i); });
  let fi = w.words.length;
  while(w.words.length < need){
    w.words.push(dpDefaultWord(w, fi));
    fi++;
  }
  if(w.words.length > need) w.words.length = need;
  renderDebugContent();
  toast('已补满 ' + need + ' 条词条，可逐条改类型/数值');
}
function dpItemMakeDesigned(){
  const ed = debugEdit;
  if(!ed || !ed.work) return;
  const w = ed.work;
  if(!w.rarity) w.rarity = 'epic';
  const need = ITEM_RARITY[w.rarity] ? ITEM_RARITY[w.rarity].words : 0;
  if(!Array.isArray(w.words)) w.words = [];
  w.words.forEach((x, i) => { if(!x || !x.type) w.words[i] = dpDefaultWord(w, i); });
  if(w.words.length !== need){
    let fi = w.words.length;
    while(w.words.length < need){ w.words.push(dpDefaultWord(w, fi)); fi++; }
    if(w.words.length > need) w.words.length = need;
  }
  ed.assumeDesigned = true;
  renderDebugContent();
  toast('已设为「视为已设计」，保存后装备词条会生效');
}
function dpItemApplyRawJson(){
  const ed = debugEdit;
  const el = document.getElementById('dpItemRawJson');
  if(!ed || !el) return;
  let parsed;
  try{ parsed = JSON.parse(el.value || '{}'); }catch(e){ toast('JSON 格式错误'); return; }
  if(!parsed || Array.isArray(parsed) || typeof parsed !== 'object'){ toast('必须是 JSON 对象'); return; }
  Object.keys(parsed).forEach(k => { if(k !== 'id') ed.work[k] = dpDeep(parsed[k]); });
  renderDebugContent();
  toast('已应用到编辑区，点保存后生效');
}

function dpApplyItemWorkToTpl(tpl, w){
  if(!tpl || !w) return;
  ['category','type','slot','twoHanded','tags','classLimit','grantSkills','passives',
   'unique','noSell','giftFixed','twoHanded','maxWear','durability'].forEach(k => {
    if(w[k] !== undefined) tpl[k] = dpDeep(w[k]);
  });
  if(tpl.type !== 'weapon') delete tpl.twoHanded;
}
function dpSaveItemEdit(mode){
  const ed = debugEdit;
  const isTemplate = ed && ed.kind === 'item' && ed.source === 'template';
  if(ed && ed.work){
    ['words','effects','tags','classLimit','grantSkills','passives'].forEach(k => {
      if(ed.work[k] !== undefined && !Array.isArray(ed.work[k])) ed.work[k] = [];
    });
  }
  if(isTemplate && ed.work && EQUIPS[ed.id]) dpApplyItemWorkToTpl(EQUIPS[ed.id], ed.work);
  DP_BASE.debugSaveItemEdit(mode);
  if(!isTemplate) return;
  const tpl = EQUIPS[ed.id];
  if(!tpl) return;
  const w = ed.work || {};
  dpApplyItemWorkToTpl(tpl, w);
  if(getItemCategory(tpl) === 'equip'){
    tpl.words = (w.words || []).filter(x => x && x.type).map(x => {
      const o = { type:x.type, value:Number(x.value) || 0 };
      if(x.duration) o.duration = Number(x.duration);
      if(x.tag) o.tag = x.tag;
      return o;
    });
  }else{
    tpl.effects = (w.effects || []).filter(x => x && x.type).map(x => dpDeep(x));
  }
  if(debugChanges.items) debugChanges.items[tpl.id] = true;
  debugRecalcAll();
  updateAllUI();
  debugSyncBattle();
  renderDebugContent();
}

/* 单条物品效果行：补充目标和概率字段 */
function dpWordRowHtml(isEquip, i, x){
  const atom = getEffectAtom(x.type);
  const step = atom && atom.mode === 'rate' ? '0.01' : '1';
  const unit = atom ? (atom.valueUnit || '') : '';
  let h = '<div class="debug-word-row">'
    + '<select class="debug-select" onchange="debugSetRowType(' + i + ',this.value)">' + debugAtomOptions(isEquip ? 'equip' : 'item', x.type) + '</select>'
    + '<input class="debug-input" type="number" step="' + step + '" value="' + (x.value != null ? x.value : 0) + '" oninput="debugSetRowValue(' + i + ',this.value)" id="debugWordVal_' + i + '">'
    + '<span class="debug-unit">' + dpEsc(unit) + '</span>';
  if(!isEquip){
    h += '<select class="debug-select" onchange="dpSetRowTarget(' + i + ',this.value)">' + debugTargetOptions(x.target || (atom && atom.defaultTarget) || '') + '</select>';
  }
  if(atom && atom.status){
    h += '<input class="debug-input" style="width:56px" type="number" min="1" title="持续回合" value="' + (x.duration || atom.duration || 1) + '" onchange="debugSetRowDuration(' + i + ',this.value)">';
  }
  h += '<button class="debug-btn danger" onclick="debugDelRow(' + i + ')">×</button>'
    + '</div>';
  if(atom && atom.valueHint){
    h += '<div class="debug-edit-sub" style="padding:0 0 3px 4px">' + dpEsc(atom.valueHint) + '</div>';
  }
  return h;
}
function dpSetRowTarget(i, val){
  const list = debugRowList();
  if(!list[i]) return;
  list[i].target = val;
  debugRefreshItemPreview();
}

/* ============================================================
   四、技能编辑增强
   ============================================================ */

function dpRenderDebugSkills(c){
  /* 原技能页未单独保存，这里按同样结构重排，并补上「全部 MAX」按钮 */
  if(!currentGame){ c.innerHTML = '<div class="quest-empty">尚未创建角色</div>'; return; }
  const charIds = ['player'];
  const q = currentGame.queue;
  ['front','back','rest'].forEach(r => q[r].forEach(cid => {
    if(cid && cid !== 'player' && charIds.indexOf(cid) < 0) charIds.push(cid);
  }));
  const sel = debugSkillChar || 'player';
  c.innerHTML += '<div class="debug-info">选择角色后点「发放」；「MAX」把熟练度拉满，用来测试满级技能。点「编辑效果」可逐级改 effects。</div>';
  c.innerHTML += '<div class="debug-actions">';
  charIds.forEach(id => {
    const ch = getChar(id);
    c.innerHTML += '<button class="debug-btn' + (sel === id ? ' success' : '') + '" onclick="debugSkillCharSelect(\'' + dpEsc(id) + '\')">' + dpEsc(ch.name) + '</button>';
  });
  c.innerHTML += '</div>';
  c.innerHTML += '<div class="debug-actions">'
    + '<button class="debug-btn success" onclick="dpCharAllSkillsMax(\'' + dpEsc(sel) + '\')">该角色已学技能全部 MAX</button>'
    + '</div>';
  c.innerHTML += '<div class="debug-search"><input type="text" id="debugSkillSearch" placeholder="搜索技能名 / 职业..." oninput="filterDebugSkills()"></div>';
  c.innerHTML += '<div id="debugSkillList"></div>';
  renderDebugSkillList(sel, '');
}

function dpRenderDebugSkillList(charId, keyword){
  DP_BASE.renderDebugSkillList(charId, keyword);
  const list = document.getElementById('debugSkillList');
  const obj = getCharObj(charId);
  if(!list || !obj) return;
  list.querySelectorAll('button[data-give-skill]').forEach(btn => {
    const parts = String(btn.getAttribute('data-give-skill') || '').split('|');
    const sid = parts[1];
    if(!sid || !obj.skillProficiency || obj.skillProficiency[sid] === undefined) return;
    const lv = getSkillLevel(charId === 'player' ? { isPlayer:true } : { npcId:charId }, sid);
    const span = document.createElement('span');
    span.className = 'dp-tag';
    span.textContent = 'Lv.' + lv;
    btn.after(span);
    const maxBtn = document.createElement('button');
    maxBtn.className = 'debug-btn';
    maxBtn.textContent = 'MAX';
    maxBtn.onclick = function(){ dpSkillSetProf(charId, sid, 999999); };
    span.after(maxBtn);
  });
}
function dpSkillSetProf(charId, sid, val){
  const obj = getCharObj(charId);
  if(!obj) return;
  if(!obj.skillProficiency) obj.skillProficiency = {};
  obj.skillProficiency[sid] = Math.max(0, dpInt(val, 0));
  updateAllUI();
  toast('熟练度已设为 ' + obj.skillProficiency[sid]);
  filterDebugSkills();
}

function dpRenderDebugSkillEdit(c){
  DP_BASE.renderDebugSkillEdit(c);
  const ed = debugEdit;
  if(!ed || ed.kind !== 'skill') return;
  const sk = SKILLS[ed.id];
  if(!sk) return;
  const firstGroup = c.querySelector('.debug-group');
  const meta = '<div class="dp-card">'
    + '<div class="dp-grid">'
    + dpField('技能名', '<input class="debug-input" value="' + dpEsc(sk.name || '') + '" onchange="dpSkillSetMeta(\'name\',this.value)">')
    + dpField('职业限制', '<input class="debug-input" value="' + dpEsc(sk.classLimit || '') + '" onchange="dpSkillSetMeta(\'classLimit\',this.value)">')
    + dpField('等级数', '<div class="dp-inline"><button class="debug-btn" onclick="dpSkillAddLevel()">+1 级</button>'
        + '<button class="debug-btn danger" onclick="dpSkillDelLevel()">-1 级</button></div>')
    + '</div>'
    + '<div class="dp-actions">'
    + '<button class="debug-btn success" onclick="dpSkillGive()">发放给当前角色</button>'
    + '<button class="debug-btn" onclick="dpSkillGiveMax()">发放并满熟练</button>'
    + '</div>'
    + '<div class="dp-hint">当前角色：' + dpEsc((getChar(debugSkillChar || 'player') || {}).name || '') + '。改技能名 / 职业限制会立刻写进技能表。</div>'
    + '</div>';
  if(firstGroup) firstGroup.insertAdjacentHTML('beforebegin', meta);
  else c.insertAdjacentHTML('afterbegin', meta);

  const raw = '<details class="debug-adv"><summary>技能原始 JSON（高级）</summary>'
    + '<textarea class="debug-json dp-json" id="dpSkillRawJson" spellcheck="false">' + dpEsc(JSON.stringify(sk, null, 2)) + '</textarea>'
    + '<div class="dp-actions"><button class="debug-btn" onclick="dpSkillApplyRawJson()">应用 JSON</button></div></details>';
  c.insertAdjacentHTML('beforeend', raw);
}
function dpSkillSetMeta(key, val){
  const ed = debugEdit;
  const sk = ed && SKILLS[ed.id];
  if(!sk) return;
  if(key === 'name') sk.name = String(val || sk.name);
  else if(key === 'classLimit') sk.classLimit = String(val || '');
  if(!debugChanges.skills) debugChanges.skills = {};
  debugChanges.skills[sk.id] = true;
}
function dpSkillGive(){
  if(!debugEdit) return;
  debugGiveSkill(debugSkillChar || 'player', debugEdit.id);
}
function dpSkillGiveMax(){
  if(!debugEdit) return;
  const charId = debugSkillChar || 'player';
  debugGiveSkill(charId, debugEdit.id);
  const obj = getCharObj(charId);
  if(obj){ if(!obj.skillProficiency) obj.skillProficiency = {}; obj.skillProficiency[debugEdit.id] = 999999; }
  updateAllUI();
  toast('已发放并满熟练');
  renderDebugContent();
}
function dpSkillAddLevel(){
  const ed = debugEdit;
  if(!ed || !ed.work) return;
  const last = ed.work[ed.work.length - 1] || { mpCost:0, effects:[] };
  ed.work.push(dpDeep(last));
  renderDebugContent();
}
function dpSkillDelLevel(){
  const ed = debugEdit;
  if(!ed || !ed.work || ed.work.length <= 1) return;
  ed.work.pop();
  renderDebugContent();
}
function dpSkillApplyRawJson(){
  const ed = debugEdit;
  const el = document.getElementById('dpSkillRawJson');
  if(!ed || !el) return;
  let parsed;
  try{ parsed = JSON.parse(el.value || '{}'); }catch(e){ toast('JSON 格式错误'); return; }
  if(!parsed || Array.isArray(parsed) || typeof parsed !== 'object'){ toast('必须是 JSON 对象'); return; }
  const sk = SKILLS[ed.id];
  if(!sk) return;
  Object.keys(parsed).forEach(k => { if(k !== 'id') sk[k] = dpDeep(parsed[k]); });
  ed.work = dpDeep(sk.levels || []);
  if(!debugChanges.skills) debugChanges.skills = {};
  debugChanges.skills[sk.id] = true;
  toast('技能 JSON 已应用');
  renderDebugContent();
}
function dpSaveSkillEdit(){
  const ed = debugEdit;
  if(ed && ed.kind === 'skill' && ed.work){
    const sk = SKILLS[ed.id];
    if(sk){
      if(!Array.isArray(sk.levels)) sk.levels = [];
      while(sk.levels.length < ed.work.length){
        sk.levels.push(dpDeep(ed.work[sk.levels.length] || ed.work[ed.work.length - 1] || {}));
      }
      if(sk.levels.length > ed.work.length) sk.levels.length = ed.work.length;
    }
  }
  DP_BASE.debugSaveSkillEdit();
}

/* ============================================================
   五、战斗页
   ============================================================ */

function dpRenderDebugBattle(c){
  if(!currentGame){ c.innerHTML = '<div class="quest-empty">尚未创建角色</div>'; return; }
  const b = (typeof battleState !== 'undefined') ? battleState : null;

  c.innerHTML = '<div class="debug-info">平衡测试：遭遇战直接开打；战斗中可改双方 HP / MP / 攻防速，或加状态。</div>';

  /* 遭遇战选择 */
  let enc = '<div class="dp-grid">'
    + dpField('选择遭遇战', '<select class="debug-select" id="dpEncounterSelect">' + dpEncounterOptions() + '</select>')
    + dpField('动作', '<div class="dp-inline"><button class="debug-btn success" onclick="dpTriggerEncounter()">开战</button>'
        + '<button class="debug-btn" onclick="dpTriggerEncounter(true)">随机一场</button></div>')
    + '</div>';
  enc += '<div class="dp-hint">「随机一场」从全部遭遇战里随机。开战后调试面板会关闭，从手机菜单可再次打开。</div>';
  c.innerHTML += dpSection('快速遭遇战', enc, true);

  /* 战场单位 */
  if(b && !b.over){
    let units = '<div class="dp-actions">'
      + '<button class="debug-btn" onclick="dpBattleSync()">按角色数据重算战场</button>'
      + '<button class="debug-btn" onclick="dpBattleAllEnemiesOneHp()">敌方全体 1 HP</button>'
      + '<button class="debug-btn danger" onclick="dpBattleKillAllEnemies()">敌方全体击杀</button>'
      + '<button class="debug-btn success" onclick="dpBattleHealAll()">我方满血满蓝</button>'
      + '</div>';
    units += '<div class="dp-sub-title">我方（' + b.allies.length + '）</div>';
    b.allies.forEach((u, i) => { units += dpBattleUnitHtml(u, 'ally', i); });
    const enemies = b.frontSlots.concat(b.backSlots).filter(Boolean);
    units += '<div class="dp-sub-title">敌方（' + enemies.length + '）</div>';
    enemies.forEach((u, i) => { units += dpBattleUnitHtml(u, 'enemy', i); });
    c.innerHTML += dpSection('战场单位编辑（第 ' + (b.round || 1) + ' 回合 · ' + dpEsc(b.phase || '') + '）', units, true);
  }else{
    c.innerHTML += dpSection('战场单位编辑', '<div class="dp-hint">当前不在战斗中。先在上面开一场遭遇战。</div>', true);
  }

  /* 常规快捷 */
  let quick = '<div class="debug-actions">'
    + '<button class="debug-btn success" onclick="debugBattleHealAll()">我方满血满蓝</button>'
    + '<button class="debug-btn" onclick="debugBattleFullMp()">我方回满 MP</button>'
    + '<button class="debug-btn" onclick="debugBattleClearStatus()">清空我方状态</button>'
    + '</div>';
  quick += '<div class="dp-hint">这些按钮只在战斗进行中生效；改敌人角色卡后点「按角色数据重算战场」。</div>';
  c.innerHTML += dpSection('战斗快捷', quick, true);
}
function dpEncounterOptions(){
  const list = (typeof BATTLE_ENCOUNTERS !== 'undefined') ? BATTLE_ENCOUNTERS : {};
  const special = [], random = [];
  Object.keys(list).forEach(id => {
    const e = list[id] || {};
    const label = (e.name || id) + '（' + id + '）';
    if(e.type === 'special') special.push({ id:id, label:label });
    else random.push({ id:id, label:label });
  });
  const opt = arr => arr.map(x => '<option value="' + dpEsc(x.id) + '">' + dpEsc(x.label) + '</option>').join('');
  let html = '';
  if(special.length) html += '<optgroup label="特殊遭遇（' + special.length + '）">' + opt(special) + '</optgroup>';
  if(random.length) html += '<optgroup label="随机遭遇（' + random.length + '）">' + opt(random) + '</optgroup>';
  return html;
}
function dpTriggerEncounter(random){
  const sel = document.getElementById('dpEncounterSelect');
  let id = sel ? sel.value : '';
  const list = (typeof BATTLE_ENCOUNTERS !== 'undefined') ? Object.keys(BATTLE_ENCOUNTERS) : [];
  if(random && list.length) id = list[Math.floor(Math.random() * list.length)];
  if(!id){ toast('没有可用的遭遇战'); return; }
  debugTriggerBattle(id);
}
function dpBattleUnitHtml(u, side, idx){
  if(!u) return '';
  const uid = String(u.id || (side + idx));
  const statuses = (u.statuses || []).map((s, si) => {
    return '<span class="dp-chip">' + dpEsc(statusLabel(s.type)) + (s.value ? ' ' + s.value : '')
      + (s.duration ? ' · ' + s.duration + '回合' : '')
      + ' <span class="dp-chip-x" onclick="dpBattleDelStatus(\'' + dpEsc(uid) + '\',' + si + ')">×</span></span>';
  }).join('') || '<span class="dp-hint-inline">无状态</span>';
  let h = '<div class="dp-unit">'
    + '<div class="dp-unit-head"><b>' + dpEsc(u.name) + '</b> <span class="dp-hint-inline">Lv.' + dpInt(u.lv, 1)
    + ' · ' + (side === 'ally' ? '我方' : '敌方') + ' · ' + (u.row === 'back' ? '后排' : '前排') + '</span>'
    + '<span class="dp-unit-hp">HP ' + dpInt(u.hp, 0) + '/' + dpInt(u.maxHp, 1) + '</span></div>'
    + '<div class="dp-grid dp-grid-compact">'
    + dpField('HP', '<input class="debug-input" type="number" value="' + dpInt(u.hp, 0) + '" onchange="dpBattleSet(\'' + dpEsc(uid) + '\',\'hp\',this.value)">')
    + dpField('HP 上限', '<input class="debug-input" type="number" value="' + dpInt(u.maxHp, 1) + '" onchange="dpBattleSet(\'' + dpEsc(uid) + '\',\'maxHp\',this.value)">')
    + dpField('MP', '<input class="debug-input" type="number" value="' + dpInt(u.mp, 0) + '" onchange="dpBattleSet(\'' + dpEsc(uid) + '\',\'mp\',this.value)">')
    + dpField('MP 上限', '<input class="debug-input" type="number" value="' + dpInt(u.maxMp, 0) + '" onchange="dpBattleSet(\'' + dpEsc(uid) + '\',\'maxMp\',this.value)">')
    + dpField('物攻', '<input class="debug-input" type="number" step="0.1" value="' + dpNum(u.physAtk, 0) + '" onchange="dpBattleSet(\'' + dpEsc(uid) + '\',\'physAtk\',this.value)">')
    + dpField('魔攻', '<input class="debug-input" type="number" step="0.1" value="' + dpNum(u.magicAtk, 0) + '" onchange="dpBattleSet(\'' + dpEsc(uid) + '\',\'magicAtk\',this.value)">')
    + dpField('防御', '<input class="debug-input" type="number" step="0.1" value="' + dpNum(u.def, 0) + '" onchange="dpBattleSet(\'' + dpEsc(uid) + '\',\'def\',this.value)">')
    + dpField('速度', '<input class="debug-input" type="number" step="0.1" value="' + dpNum(u.spd, 0) + '" onchange="dpBattleSet(\'' + dpEsc(uid) + '\',\'spd\',this.value)">')
    + '</div>'
    + '<div class="dp-chips">' + statuses + '</div>'
    + '<div class="dp-inline">'
    + '<select class="debug-select" id="dpStatus_' + dpEsc(uid) + '">' + dpStatusOptions() + '</select>'
    + '<input class="debug-input" id="dpStatusVal_' + dpEsc(uid) + '" type="number" step="0.01" value="1" title="数值">'
    + '<input class="debug-input" id="dpStatusDur_' + dpEsc(uid) + '" type="number" min="1" value="3" title="持续回合">'
    + '<button class="debug-btn" onclick="dpBattleAddStatus(\'' + dpEsc(uid) + '\')">加状态</button>'
    + '<button class="debug-btn" onclick="dpBattleUnitAction(\'' + dpEsc(uid) + '\',\'heal\')">满血</button>'
    + '<button class="debug-btn danger" onclick="dpBattleUnitAction(\'' + dpEsc(uid) + '\',\'kill\')">击杀</button>'
    + '</div></div>';
  return h;
}
function dpStatusOptions(){
  const atoms = Object.keys(EFFECT_ATOMS).map(id => EFFECT_ATOMS[id]).filter(a => a && a.status);
  atoms.sort((a, b) => String(a.name).localeCompare(String(b.name), 'zh'));
  return atoms.map(a => '<option value="' + dpEsc(a.id) + '">' + dpEsc(a.name) + '（' + dpEsc(a.id) + '）</option>').join('');
}
function dpBattleFindUnit(uid){
  if(typeof battleState === 'undefined' || !battleState) return null;
  const list = battleState.allies.concat(battleState.frontSlots.filter(Boolean), battleState.backSlots.filter(Boolean));
  return list.find(u => String(u.id) === String(uid)) || null;
}
function dpBattleSet(uid, key, val){
  const u = dpBattleFindUnit(uid);
  if(!u) return;
  if(key === 'hp' || key === 'mp'){
    const max = key === 'hp' ? dpNum(u.maxHp, 1) : dpNum(u.maxMp, 0);
    u[key] = Math.max(0, Math.min(max, dpNum(val, u[key])));
  }else if(key === 'maxHp' || key === 'maxMp'){
    u[key] = Math.max(1, dpNum(val, u[key]));
    if(key === 'maxHp' && u.hp > u.maxHp) u.hp = u.maxHp;
    if(key === 'maxMp' && u.mp > u.maxMp) u.mp = u.maxMp;
  }else{
    u[key] = dpNum(val, u[key]);
  }
  renderBattle();
  renderDebugContent();
}
function dpBattleAddStatus(uid){
  const u = dpBattleFindUnit(uid);
  if(!u) return;
  const sel = document.getElementById('dpStatus_' + uid);
  const val = document.getElementById('dpStatusVal_' + uid);
  const dur = document.getElementById('dpStatusDur_' + uid);
  if(!sel || !sel.value) return;
  addStatus(u, { type:sel.value, value:dpNum(val && val.value, 0), duration:dpInt(dur && dur.value, 3, 1), by:'debug' });
  renderBattle();
  renderDebugContent();
}
function dpBattleDelStatus(uid, idx){
  const u = dpBattleFindUnit(uid);
  if(!u || !Array.isArray(u.statuses)) return;
  u.statuses.splice(idx, 1);
  renderBattle();
  renderDebugContent();
}
function dpBattleUnitAction(uid, action){
  const u = dpBattleFindUnit(uid);
  if(!u) return;
  if(action === 'heal'){ u.hp = u.maxHp; u.mp = u.maxMp; }
  else if(action === 'kill'){ u.hp = 0; }
  renderBattle();
  if(action === 'kill' && typeof checkBattleEnd === 'function') checkBattleEnd();
  renderDebugContent();
}
function dpBattleHealAll(){
  const b = debugBattleGuard();
  if(!b) return;
  b.allies.forEach(u => { u.hp = u.maxHp; u.mp = u.maxMp; });
  addBattleLog('【调试】我方已满血满蓝', 'heal');
  renderBattle();
  renderDebugContent();
}
function dpBattleAllEnemiesOneHp(){
  const b = debugBattleGuard();
  if(!b) return;
  b.frontSlots.concat(b.backSlots).forEach(u => { if(u && u.hp > 0) u.hp = 1; });
  renderBattle();
  renderDebugContent();
}
function dpBattleKillAllEnemies(){
  const b = debugBattleGuard();
  if(!b) return;
  b.frontSlots.concat(b.backSlots).forEach(u => { if(u) u.hp = 0; });
  renderBattle();
  if(typeof checkBattleEnd === 'function') checkBattleEnd();
  renderDebugContent();
}
function dpBattleSync(){
  const ok = debugSyncBattle();
  if(ok){ dpBattleRefreshAllySkills(); toast('已按角色数据重算战场'); renderDebugContent(); }
  else toast('当前不在战斗');
}

/* ============================================================
   六、剧情页
   ============================================================ */

function dpRenderDebugStory(c){
  if(!currentGame){ c.innerHTML = '<div class="quest-empty">尚未创建角色</div>'; return; }
  const lines = (typeof LINES !== 'undefined') ? LINES : {};
  const state = currentGame.lineState || {};
  let h = '<div class="debug-info">剧情线总数：' + Object.keys(lines).length
    + '　当前章节：' + dpInt(currentGame.chapter, 1) + '</div>';
  h += '<div class="dp-grid">'
    + dpField('当前章节', '<input class="debug-input" type="number" min="1" value="' + dpInt(currentGame.chapter, 1) + '" onchange="dpStorySetChapter(this.value)">')
    + dpField('主线失效章节', '<input class="debug-input" type="number" min="0" value="' + dpInt(currentGame.mainlineInvalidFromChapter, 0) + '" onchange="dpStorySetCutoff(this.value)">')
    + '</div>';

  h += '<div class="dp-sub-title">剧情线进度</div>';
  let list = '';
  Object.keys(lines).forEach(lid => {
    const line = lines[lid] || {};
    const st = state[lid];
    const total = (line.nodes || []).length;
    let statusText = '未开始', color = '#667';
    if(st){
      if(st.status === 'done'){ statusText = '已完成'; color = '#66ff99'; }
      else { statusText = '节点 ' + (dpInt(st.nodeIdx, 0) + 1) + '/' + total; color = '#ffd166'; }
    }
    const label = (line.type === 'side' ? '［支线］' : '［主线］') + (line.name || lid);
    list += '<div class="dp-story-row">'
      + '<div class="dp-story-main"><b style="color:' + color + '">' + dpEsc(label) + '</b>'
      + '<div class="dp-hint-inline">' + dpEsc(lid) + ' · ' + statusText + '</div></div>'
      + '<div class="dp-story-actions">'
      + '<button class="debug-btn" onclick="dpStoryLine(\'' + dpEsc(lid) + '\',\'next\')">下一节点</button>'
      + '<button class="debug-btn success" onclick="dpStoryLine(\'' + dpEsc(lid) + '\',\'done\')">完成</button>'
      + '<button class="debug-btn danger" onclick="dpStoryLine(\'' + dpEsc(lid) + '\',\'reset\')">重置</button>'
      + '</div></div>';
  });
  h += '<div class="dp-story-list">' + list + '</div>';

  h += '<div class="dp-sub-title">剧情 flags</div>'
    + '<textarea class="debug-json dp-json" id="dpStoryFlagsJson" spellcheck="false">' + dpEsc(JSON.stringify(currentGame.flags || {}, null, 2)) + '</textarea>'
    + '<div class="dp-actions"><button class="debug-btn success" onclick="dpStoryApplyFlags()">应用 flags</button>'
    + '<input class="debug-input" id="dpStoryFlagKey" placeholder="flag 名">'
    + '<input class="debug-input" id="dpStoryFlagVal" placeholder="值（默认 true）">'
    + '<button class="debug-btn" onclick="dpStoryAddFlag()">添加 / 覆盖</button></div>';
  h += '<details class="debug-adv"><summary>lineState 原始 JSON（高级）</summary>'
    + '<textarea class="debug-json dp-json" id="dpStoryStateJson" spellcheck="false">' + dpEsc(JSON.stringify(state, null, 2)) + '</textarea>'
    + '<div class="dp-actions"><button class="debug-btn" onclick="dpStoryApplyState()">应用 lineState</button></div></details>';
  c.innerHTML = h;
}
function dpStorySetChapter(v){
  if(!currentGame) return;
  currentGame.chapter = Math.max(1, dpInt(v, 1));
  renderDebugContent();
}
function dpStorySetCutoff(v){
  if(!currentGame) return;
  const n = dpInt(v, 0);
  currentGame.mainlineInvalidFromChapter = n > 0 ? n : null;
  renderDebugContent();
}
function dpStoryLine(lid, action){
  if(!currentGame) return;
  const lines = (typeof LINES !== 'undefined') ? LINES : {};
  const line = lines[lid];
  if(!line) return;
  if(!currentGame.lineState) currentGame.lineState = {};
  if(action === 'reset'){
    delete currentGame.lineState[lid];
    toast('已重置：' + (line.name || lid));
  }else{
    const st = currentGame.lineState[lid] || (currentGame.lineState[lid] = { nodeIdx:0, status:'active' });
    if(action === 'done'){
      st.nodeIdx = (line.nodes || []).length;
      st.status = 'done';
    }else if(action === 'next'){
      st.nodeIdx = Math.min((line.nodes || []).length, dpInt(st.nodeIdx, 0) + 1);
      st.status = st.nodeIdx >= (line.nodes || []).length ? 'done' : 'active';
    }
    toast('剧情线已更新');
  }
  updateAllUI();
  renderDebugContent();
}
function dpStoryApplyFlags(){
  const el = document.getElementById('dpStoryFlagsJson');
  if(!el || !currentGame) return;
  let parsed;
  try{ parsed = JSON.parse(el.value || '{}'); }catch(e){ toast('JSON 格式错误'); return; }
  if(!parsed || Array.isArray(parsed) || typeof parsed !== 'object'){ toast('flags 必须是对象'); return; }
  currentGame.flags = parsed;
  updateAllUI();
  toast('flags 已替换');
  renderDebugContent();
}
function dpStoryAddFlag(){
  if(!currentGame) return;
  const k = document.getElementById('dpStoryFlagKey');
  const v = document.getElementById('dpStoryFlagVal');
  if(!k || !k.value.trim()){ toast('请输入 flag 名'); return; }
  let val = true;
  if(v && v.value !== ''){
    const raw = v.value.trim();
    if(raw === 'true') val = true;
    else if(raw === 'false') val = false;
    else if(isFinite(Number(raw))) val = Number(raw);
    else val = raw;
  }
  if(!currentGame.flags) currentGame.flags = {};
  currentGame.flags[k.value.trim()] = val;
  updateAllUI();
  toast('已写入 flag');
  renderDebugContent();
}
function dpStoryApplyState(){
  const el = document.getElementById('dpStoryStateJson');
  if(!el || !currentGame) return;
  let parsed;
  try{ parsed = JSON.parse(el.value || '{}'); }catch(e){ toast('JSON 格式错误'); return; }
  if(!parsed || Array.isArray(parsed) || typeof parsed !== 'object'){ toast('lineState 必须是对象'); return; }
  currentGame.lineState = parsed;
  updateAllUI();
  toast('lineState 已替换');
  renderDebugContent();
}

/* ============================================================
   七、测试用商店：当前地图商人上架全部物品
   ============================================================ */
function dpAllItemIds(){ return Object.keys(EQUIPS); }
function dpStockMerchantChar(id, actor){
  const tpl = getCharacterTemplate(id);
  const inst = getNpc(id);
  const classes = (inst && Array.isArray(inst.classes)) ? inst.classes
    : (tpl && Array.isArray(tpl.classes)) ? tpl.classes : [];
  const isMerchant = classes.indexOf('商人') >= 0
    || !!(tpl && tpl.isTrader) || !!(inst && inst.isTrader)
    || !!(actor && actor.services && actor.services.trader);
  if(!isMerchant) return false;
  const all = dpAllItemIds();
  if(tpl){ tpl.isTrader = true; tpl.shopItems = all.slice(); dpMarkCharacter(tpl.id); }
  if(inst){ inst.isTrader = true; inst.shopItems = all.slice(); }
  if(actor && actor.services){
    actor.services.trader = true;
    actor.services.shopItems = all.slice();
  }
  return true;
}
function dpStockCurrentMapMerchants(){
  if(!currentGame){ toast('没有角色'); return; }
  const map = MAPS[currentMapId];
  if(!map || !Array.isArray(map.tiles)){ toast('当前地图不存在'); return; }
  const touched = {};
  map.tiles.forEach(tile => {
    (tile.npcs || []).forEach(id => {
      if(dpStockMerchantChar(id, null)) touched[id] = true;
    });
    (tile.actors || []).forEach(a => {
      if(a && a.charId && dpStockMerchantChar(a.charId, a)) touched[a.charId] = true;
    });
  });
  const n = Object.keys(touched).length;
  updateAllUI();
  toast(n ? ('当前地图 ' + n + ' 个商人已上架全部物品') : '当前地图没有商人');
  renderDebugContent();
}
function dpSetShopShowAll(v){
  DEBUG_SHOW_ALL_ITEMS_IN_SHOP = !!v;
  const modal = document.getElementById('tradeModal');
  if(modal && modal.classList.contains('show') && typeof renderTradeModal === 'function') renderTradeModal();
  toast(v ? '商店将展示全部物品（含未设计）' : '商店只展示可用物品');
}

/* ============================================================
   八、合成表编辑器
   ============================================================ */

let dpCraftKeyword = '';
const DP_CRAFT_CAT_LABEL = { equip:'装备', material:'材料', medicine:'药品', instant:'即时道具', special:'特殊道具' };

function dpCraftMark(id){
  if(!debugChanges.crafting) debugChanges.crafting = {};
  if(id) debugChanges.crafting[id] = true;
}
function dpCraftChanged(){
  return !!(debugChanges.crafting && Object.keys(debugChanges.crafting).length);
}
function dpCraftItemOptions(selected){
  const cats = ['equip','material','medicine','instant','special'];
  let html = '';
  cats.forEach(cat => {
    const list = Object.keys(EQUIPS).map(id => EQUIPS[id]).filter(t => t && getItemCategory(t) === cat);
    if(!list.length) return;
    list.sort((a, b) => (a.level || 1) - (b.level || 1) || String(a.name).localeCompare(String(b.name), 'zh'));
    html += '<optgroup label="' + (DP_CRAFT_CAT_LABEL[cat] || cat) + '">';
    list.forEach(t => {
      html += '<option value="' + dpEsc(t.id) + '"' + (t.id === selected ? ' selected' : '') + '>'
        + 'Lv.' + (t.level || 1) + ' ' + dpEsc(t.name) + '（' + dpEsc(t.id) + '）</option>';
    });
    html += '</optgroup>';
  });
  return html;
}
function dpCraftItemName(id){
  const t = EQUIPS[id];
  return t ? t.name : ('未知道具 ' + id);
}
function dpCraftSummary(r){
  const mats = (r.materials || []).map(m => dpCraftItemName(m.id) + '×' + (m.count || 0)).join(' + ') || '无材料';
  if(r.kind === 'advance'){
    const from = ITEM_RARITY[r.from] ? ITEM_RARITY[r.from].label : (r.from || '?');
    const to = ITEM_RARITY[r.to] ? ITEM_RARITY[r.to].label : (r.to || '?');
    return mats + ' → ' + from + ' → ' + to + '（金币 ' + (r.gold || 0) + '）';
  }
  return mats + ' → ' + dpCraftItemName(r.result && r.result.id) + '×' + ((r.result && r.result.count) || 0);
}
function dpCraftingListHtml(){
  const kw = (dpCraftKeyword || '').toLowerCase().trim();
  let h = '<div class="debug-info">合成表编辑器：配方改动只在内存里，测试满意后用「数据 → 导出修改」生成补丁。'
    + '<br>共 ' + CRAFTING_RECIPES.length + ' 条配方；材料最多 5 种。</div>';
  h += '<div class="dp-actions">'
    + '<button class="debug-btn success" onclick="dpNewCraft(\'craft\')">+ 新建合成</button>'
    + '<button class="debug-btn" onclick="dpNewCraft(\'advance\')">+ 新建进阶</button>'
    + '<button class="debug-btn danger" onclick="dpCraftRestoreAll()">恢复原始合成表</button>'
    + '</div>';
  h += '<div class="debug-search"><input type="text" id="dpCraftSearch" placeholder="搜索配方名 / 编号 / 材料 / 产出..." value="' + dpEsc(dpCraftKeyword) + '" oninput="dpFilterCrafts(this.value)"></div>';
  h += '<div id="dpCraftList">' + dpCraftListInner(kw) + '</div>';
  return h;
}
function dpCraftListInner(kw){
  const matches = CRAFTING_RECIPES.filter(r => {
    if(!kw) return true;
    const hay = [r.id, r.name, r.desc, r.from, r.to,
      (r.materials || []).map(m => m.id + ' ' + dpCraftItemName(m.id)).join(' '),
      r.result ? (r.result.id + ' ' + dpCraftItemName(r.result.id)) : ''].join(' ').toLowerCase();
    return hay.indexOf(kw) >= 0;
  });
  if(!matches.length) return '<div class="quest-empty">没有匹配的配方</div>';
  let html = '';
  [['craft','普通合成'],['advance','品阶进阶']].forEach(pair => {
    const list = matches.filter(r => (r.kind || 'craft') === pair[0]);
    if(!list.length) return;
    html += '<div class="dp-sub-title">' + pair[1] + '（' + list.length + '）</div>';
    list.forEach(r => {
      html += '<div class="dp-craft-row">'
        + '<div class="dp-craft-main"><b>' + dpEsc(r.name || r.id) + '</b> <span class="dp-tag">' + dpEsc(r.id) + '</span>'
        + '<div class="dp-hint-inline">' + dpEsc(dpCraftSummary(r)) + '</div></div>'
        + '<div class="dp-item-actions">'
        + '<button class="debug-btn success" onclick="dpOpenCraftEdit(\'' + dpEsc(r.id) + '\')">编辑</button>'
        + '<button class="debug-btn" onclick="dpCraftCopy(\'' + dpEsc(r.id) + '\')">复制</button>'
        + '<button class="debug-btn danger" onclick="dpCraftDelete(\'' + dpEsc(r.id) + '\')">删除</button>'
        + '</div></div>';
    });
  });
  return html;
}
function dpFilterCrafts(val){
  dpCraftKeyword = val || '';
  const el = document.getElementById('dpCraftList');
  if(el) el.innerHTML = dpCraftListInner((dpCraftKeyword || '').toLowerCase().trim());
}
function dpCraftRestoreAll(){
  dpShowConfirm('恢复原始合成表', '把所有合成配方恢复成文件原始值？调试中新增 / 修改的配方会丢失。', () => {
    CRAFTING_RECIPES.length = 0;
    DP_ORIGINAL.CRAFTING.forEach(r => CRAFTING_RECIPES.push(dpDeep(r)));
    debugChanges.crafting = {};
    toast('合成表已恢复');
    renderDebugContent();
  });
}
function dpNextCraftId(prefix){
  let n = 1;
  while(CRAFTING_RECIPES.some(r => r.id === prefix + String(n).padStart(3, '0'))) n++;
  return prefix + String(n).padStart(3, '0');
}
function dpNewCraft(kind){
  const k = kind === 'advance' ? 'advance' : 'craft';
  const work = {
    id: dpNextCraftId(k === 'advance' ? 'adv' : 'craft'),
    name: k === 'advance' ? '新进阶配方' : '新合成配方',
    desc: '',
    kind: k,
    materials: [{ id:'item_o101', count:1 }]
  };
  if(k === 'craft'){
    work.result = { id:'eq_w001', count:1 };
  }else{
    work.from = 'common';
    work.to = 'useful';
    work.gold = 0;
  }
  debugEdit = { kind:'crafting', id:work.id, originalId:null, isNew:true, work:work };
  renderDebugContent({ resetScroll:true });
}
function dpOpenCraftEdit(id){
  const r = CRAFTING_RECIPES.find(x => x.id === id);
  if(!r){ toast('配方不存在'); return; }
  debugEdit = { kind:'crafting', id:id, originalId:id, isNew:false, work:dpDeep(r) };
  renderDebugContent({ resetScroll:true });
}
function dpCraftCopy(id){
  const r = CRAFTING_RECIPES.find(x => x.id === id);
  if(!r) return;
  const copy = dpDeep(r);
  copy.id = dpNextCraftId((r.kind === 'advance') ? 'adv' : 'craft');
  copy.name = (r.name || r.id) + ' 副本';
  CRAFTING_RECIPES.push(copy);
  dpCraftMark(copy.id);
  toast('已复制配方');
  renderDebugContent();
}
function dpCraftDelete(id, fromEdit){
  const idx = CRAFTING_RECIPES.findIndex(x => x.id === id);
  if(idx < 0) return;
  dpShowConfirm('删除配方', '确定删除「' + dpEsc((CRAFTING_RECIPES[idx].name) || id) + '」？', () => {
    CRAFTING_RECIPES.splice(idx, 1);
    dpCraftMark(id);
    if(fromEdit) debugEdit = null;
    toast('配方已删除');
    renderDebugContent();
  });
}
function dpCraftDeleteCurrent(){
  const ed = debugEdit;
  if(!ed || ed.kind !== 'crafting' || ed.isNew) return;
  dpCraftDelete(ed.originalId, true);
}
function dpCraftEditHtml(){
  const ed = debugEdit;
  const w = ed.work;
  const isAdvance = w.kind === 'advance';
  let h = '<div class="debug-actions">'
    + '<button class="debug-btn" onclick="debugBackToList()">← 返回合成表</button>'
    + '<button class="debug-btn success" onclick="dpCraftSave()">保存配方</button>'
    + (ed.isNew ? '' : '<button class="debug-btn danger" onclick="dpCraftDeleteCurrent()">删除配方</button>')
    + '</div>';
  h += '<div class="debug-info"><b style="color:#ffcc66">' + (ed.isNew ? '新建配方' : '编辑配方') + '</b> · '
    + dpEsc(w.id) + '<br>改动保存后立即写入合成表内存。</div>';

  let base = '<div class="dp-grid">'
    + dpField('配方名', '<input class="debug-input" value="' + dpEsc(w.name || '') + '" onchange="dpCraftSetField(\'name\',this.value)">')
    + dpField('编号（英文）', '<input class="debug-input" value="' + dpEsc(w.id || '') + '" onchange="dpCraftSetField(\'id\',this.value)">')
    + dpField('类型', '<select class="debug-select" onchange="dpCraftSetKind(this.value)">'
        + '<option value="craft"' + (!isAdvance ? ' selected' : '') + '>普通合成</option>'
        + '<option value="advance"' + (isAdvance ? ' selected' : '') + '>品阶进阶</option>'
        + '</select>')
    + '</div>'
    + '<div class="dp-grid"><label class="dp-field"><span>描述</span>'
    + '<textarea class="debug-input debug-textarea" onchange="dpCraftSetField(\'desc\',this.value)">' + dpEsc(w.desc || '') + '</textarea></label></div>';
  h += dpSection('① 基础信息', base, true);

  let mats = '<div class="dp-hint">材料 1~5 种；每种填物品和数量。材料取自全物品表。</div>';
  (w.materials || []).forEach((m, i) => {
    mats += '<div class="dp-craft-material">'
      + '<span class="dp-craft-no">材料' + (i + 1) + '</span>'
      + '<select class="debug-select dp-grow" onchange="dpCraftSetMaterial(' + i + ',\'id\',this.value)">'
      + dpCraftItemOptions(m.id) + '</select>'
      + '<input class="debug-input" type="number" min="1" value="' + dpInt(m.count, 1, 1) + '" onchange="dpCraftSetMaterial(' + i + ',\'count\',this.value)">'
      + '<button class="debug-btn danger" onclick="dpCraftDelMaterial(' + i + ')">×</button>'
      + '</div>';
  });
  mats += '<div class="dp-actions"><button class="debug-btn" onclick="dpCraftAddMaterial()"' + ((w.materials || []).length >= 5 ? ' disabled' : '') + '>+ 添加材料</button></div>';
  h += dpSection('② 材料', mats, true);

  if(isAdvance){
    let adv = '<div class="dp-grid">'
      + dpField('起始品阶', '<select class="debug-select" onchange="dpCraftSetField(\'from\',this.value)">'
          + ITEM_RARITY_ORDER.map(k => '<option value="' + k + '"' + (w.from === k ? ' selected' : '') + '>' + ITEM_RARITY[k].label + '</option>').join('')
          + '</select>')
      + dpField('目标品阶', '<select class="debug-select" onchange="dpCraftSetField(\'to\',this.value)">'
          + ITEM_RARITY_ORDER.map(k => '<option value="' + k + '"' + (w.to === k ? ' selected' : '') + '>' + ITEM_RARITY[k].label + '</option>').join('')
          + '</select>')
      + dpField('金币花费', '<input class="debug-input" type="number" min="0" value="' + dpInt(w.gold, 0, 0) + '" onchange="dpCraftSetField(\'gold\',this.value)">')
      + '</div>';
    adv += '<div class="dp-hint">品阶进阶仍需要在「词条材料槽」放一件带词条功能的材料，由该材料决定新词条。</div>';
    h += dpSection('③ 进阶设置', adv, true);
  }else{
    let result = '<div class="dp-grid">'
      + dpField('产出物品', '<select class="debug-select" onchange="dpCraftSetResultItem(this.value)">' + dpCraftItemOptions(w.result && w.result.id) + '</select>')
      + dpField('产出数量', '<input class="debug-input" type="number" min="1" value="' + dpInt(w.result && w.result.count, 1, 1) + '" onchange="dpCraftSetResultCount(this.value)">')
      + '</div>';
    result += '<div class="dp-hint">产出数量通常为 1；测试时可以调大。</div>';
    h += dpSection('③ 产出', result, true);
  }

  h += '<div class="dp-actions"><button class="debug-btn success" onclick="dpCraftSave()">保存配方</button></div>';
  return h;
}
function dpCraftSetField(key, val){
  const ed = debugEdit;
  if(!ed || ed.kind !== 'crafting') return;
  const w = ed.work;
  if(key === 'gold') w.gold = Math.max(0, dpInt(val, 0));
  else w[key] = String(val || '');
}
function dpCraftSetKind(kind){
  const ed = debugEdit;
  if(!ed || ed.kind !== 'crafting') return;
  const w = ed.work;
  w.kind = kind === 'advance' ? 'advance' : 'craft';
  if(w.kind === 'advance'){
    if(!w.from) w.from = 'common';
    if(!w.to) w.to = 'useful';
    if(w.gold === undefined) w.gold = 0;
  }else if(!w.result){
    w.result = { id:'eq_w001', count:1 };
  }
  renderDebugContent();
}
function dpCraftSetMaterial(idx, key, val){
  const ed = debugEdit;
  if(!ed || ed.kind !== 'crafting') return;
  const list = ed.work.materials;
  if(!list || !list[idx]) return;
  if(key === 'count') list[idx].count = Math.max(1, dpInt(val, 1));
  else list[idx].id = String(val || '');
}
function dpCraftAddMaterial(){
  const ed = debugEdit;
  if(!ed || ed.kind !== 'crafting') return;
  if(!Array.isArray(ed.work.materials)) ed.work.materials = [];
  if(ed.work.materials.length >= 5){ toast('材料最多 5 种'); return; }
  ed.work.materials.push({ id:'item_o101', count:1 });
  renderDebugContent();
}
function dpCraftDelMaterial(idx){
  const ed = debugEdit;
  if(!ed || ed.kind !== 'crafting' || !ed.work.materials) return;
  ed.work.materials.splice(idx, 1);
  renderDebugContent();
}
function dpCraftSetResultItem(id){
  const ed = debugEdit;
  if(!ed || ed.kind !== 'crafting') return;
  ed.work.result = { id:String(id || ''), count: (ed.work.result && ed.work.result.count) || 1 };
}
function dpCraftSetResultCount(val){
  const ed = debugEdit;
  if(!ed || ed.kind !== 'crafting') return;
  ed.work.result = { id:(ed.work.result && ed.work.result.id) || '', count: Math.max(1, dpInt(val, 1)) };
}
function dpCraftSave(){
  const ed = debugEdit;
  if(!ed || ed.kind !== 'crafting') return;
  const w = ed.work;
  const id = String(w.id || '').trim();
  const name = String(w.name || '').trim() || id;
  if(!id){ toast('配方编号不能为空'); return; }
  if(!/^[A-Za-z0-9_]+$/.test(id)){ toast('配方编号只能用英文、数字、下划线'); return; }
  const mats = (w.materials || []).filter(m => m && m.id && EQUIPS[m.id]).map(m => ({ id:m.id, count:Math.max(1, dpInt(m.count, 1)) }));
  if(mats.length < 1){ toast('至少需要一种材料'); return; }
  if(mats.length > 5){ toast('材料最多 5 种'); return; }
  const recipe = { id:id, name:name, desc:String(w.desc || ''), kind:(w.kind === 'advance' ? 'advance' : 'craft'), materials:mats };
  if(recipe.kind === 'advance'){
    if(!ITEM_RARITY[w.from] || !ITEM_RARITY[w.to]){ toast('请选择起始 / 目标品阶'); return; }
    if(w.from === w.to){ toast('起始品阶与目标品阶不能相同'); return; }
    recipe.from = w.from;
    recipe.to = w.to;
    recipe.gold = Math.max(0, dpInt(w.gold, 0));
  }else{
    if(!w.result || !EQUIPS[w.result.id]){ toast('请选择产出物品'); return; }
    recipe.result = { id:w.result.id, count:Math.max(1, dpInt(w.result.count, 1)) };
  }
  const dup = CRAFTING_RECIPES.find(r => r.id === id && r.id !== ed.originalId);
  if(dup){ toast('编号已存在：' + id); return; }
  if(ed.isNew){
    CRAFTING_RECIPES.push(recipe);
    dpCraftMark(id);
  }else{
    const idx = CRAFTING_RECIPES.findIndex(r => r.id === ed.originalId);
    if(idx < 0){ toast('原配方已不存在'); return; }
    dpReplaceObject(CRAFTING_RECIPES[idx], recipe);
    dpCraftMark(id);
    if(ed.originalId !== id) dpCraftMark(ed.originalId);
  }
  debugEdit = null;
  toast('配方已保存：' + name);
  renderDebugContent();
}

/* ============================================================
   八、数据页 / 全局公式
   ============================================================ */

function dpRenderDebugData(c){
  if(!currentGame){ c.innerHTML = '<div class="quest-empty">尚未创建角色</div>'; return; }
  const counts = dpChangeCounts();
  let h = '<div class="debug-info"><b style="color:#66ff99">【游玩类】</b>等级、金钱、HP/MP、好感、技能、装备、剧情 flag 等，改了会随存档保存。</div>';
  h += '<div class="dp-actions">'
    + '<button class="debug-btn success" onclick="saveGame(currentSlot);toast(\'已保存\');">保存到存档</button>'
    + '<button class="debug-btn" onclick="debugExportSave()">导出存档 JSON</button>'
    + '<button class="debug-btn" onclick="debugImportSave()">导入存档 JSON</button>'
    + '</div>';

  h += '<div class="dp-sub-title">游戏时间</div>'
    + '<div class="dp-actions">'
    + '<button class="debug-btn" onclick="dpAddTime(1)">+1 小时</button>'
    + '<button class="debug-btn" onclick="dpAddTime(24)">+1 天</button>'
    + '<button class="debug-btn" onclick="dpAddTime(720)">+1 月</button>'
    + '<button class="debug-btn" onclick="dpAddTime(8640)">+1 年</button>'
    + '</div>';

  h += '<div class="debug-info" style="margin-top:12px"><b style="color:#ffcc66">【全局公式】</b>改完立即重算当前角色；勾选「套用档位」可把敌人基础值模板刷到全部敌人卡。</div>';
  h += dpSection('角色属性公式（ATTR_FORMULA）', dpAttrFormulaHtml(), false);
  h += dpSection('敌人档位模板（ENEMY_ATTR_TEMPLATE）', dpEnemyTemplateHtml(), false);
  h += dpSection('战斗上限 / 全局常量', dpCapsHtml(), false);
  h += dpSection('玩家新建初始值（PLAYER_BASE_CONFIG）', dpPlayerConfigHtml(), false);
  h += dpSection('自动时间（AUTO_TIME_CONFIG）', dpAutoTimeHtml(), false);

  h += '<div class="debug-info" style="margin-top:12px"><b style="color:#ff6688">【测试类】</b>模板改动用「导出修改」生成补丁，或一键恢复。</div>';
  h += '<div class="dp-actions">'
    + '<button class="debug-btn success" onclick="dpStockCurrentMapMerchants()">当前地图商人上架全部物品</button>'
    + '<button class="debug-btn" onclick="debugRestoreNpcs()">恢复 NPC 实例数值</button>'
    + '<button class="debug-btn" onclick="debugRestoreEnemies()">恢复全部角色卡</button>'
    + '<button class="debug-btn danger" onclick="debugRestoreAll()">恢复全部原始数据</button>'
    + '</div>';
  h += '<div class="dp-chips">'
    + '<label class="dp-check"><input type="checkbox" ' + ((typeof DEBUG_SHOW_ALL_ITEMS_IN_SHOP !== 'undefined' && DEBUG_SHOW_ALL_ITEMS_IN_SHOP) ? 'checked' : '') + ' onchange="dpSetShopShowAll(this.checked)"> 商店显示全部物品（含未设计）</label>'
    + '</div>';
  h += '<div class="dp-sub-title">导出修改</div>'
    + '<div class="dp-info-line">已记录：物品 ' + counts.items + ' · 技能 ' + counts.skills + ' · 角色卡 ' + counts.characters
    + ' · 合成表 ' + counts.crafting + ' · 公式 ' + counts.formulas + '。实例改动不导出，随存档保存。</div>'
    + '<div class="dp-actions"><button class="debug-btn success" onclick="debugOpenExport()">查看 / 导出修改（'
    + (counts.items + counts.skills + counts.characters + counts.crafting + counts.formulas) + '）</button></div>';

  h += '<div class="debug-info" style="margin-top:12px"><b style="color:#ff6688">【危险操作】</b>不可撤销。</div>'
    + '<div class="dp-actions">'
    + '<button class="debug-btn danger" onclick="debugResetCurrentSave()">重置当前存档（重新开始）</button>'
    + '<button class="debug-btn danger" onclick="debugDeleteCurrentSave()">删除当前存档</button>'
    + '<button class="debug-btn" onclick="location.reload()">刷新页面</button>'
    + '</div>';
  const size = (localStorage.getItem(SAVE_KEY + currentSlot) || '').length;
  h += '<div class="dp-hint">当前存档位：' + (currentSlot + 1) + '　存档大小约：' + size + ' 字符</div>';
  c.innerHTML = h;
}
function dpAttrFormulaHtml(){
  const label = {
    hp:'HP', mp:'MP', physAtk:'物攻', magicAtk:'魔攻', def:'防御', spd:'速度'
  };
  const fieldLabel = { flat:'基础', perVit:'每点体力', perSpi:'每点精神', perLevel:'每级', base:'基础', perSqrtSpi:'√精神系数', min:'下限' };
  let h = '<div class="dp-grid">';
  ['hp','mp','physAtk','magicAtk','def','spd'].forEach(key => {
    const f = ATTR_FORMULA[key];
    Object.keys(f).forEach(field => {
      h += dpField(label[key] + ' · ' + (fieldLabel[field] || field),
        '<input class="debug-input" type="number" step="0.01" value="' + f[field] + '" onchange="dpSetAttrFormula(\'' + key + '\',\'' + field + '\',this.value)">');
    });
  });
  h += '</div>';
  h += '<div class="dp-hint">公式所有权重在 data-attributes.js；这里改的是运行时内存。改完会重算所有角色。</div>';
  return h;
}
function dpEnemyTemplateHtml(){
  let h = '<div class="dp-grid">';
  ['minion','normal','strong'].forEach(kind => {
    const t = ENEMY_ATTR_TEMPLATE[kind];
    h += '<div class="dp-card"><div class="dp-sub-title">' + dpRankLabel(kind) + '（' + kind + '）</div><div class="dp-grid">';
    ['vit','spi'].forEach(k => {
      h += dpField('Lv.1 ' + k, '<input class="debug-input" type="number" step="0.1" value="' + t.base[k] + '" onchange="dpSetEnemyTemplate(\'' + kind + '\',\'base\',\'' + k + '\',this.value)">');
      h += dpField('成长 ' + k, '<input class="debug-input" type="number" step="0.01" value="' + t.growth[k] + '" onchange="dpSetEnemyTemplate(\'' + kind + '\',\'growth\',\'' + k + '\',this.value)">');
    });
    h += '</div></div>';
  });
  h += '</div>';
  h += '<div class="dp-actions"><button class="debug-btn danger" onclick="dpApplyEnemyTemplates()">把档位模板套用到全部敌人卡</button></div>';
  h += '<div class="dp-hint">套用会覆盖所有 kind=enemy 角色卡的 base / growth；对当前存档实例还要再「同步」。</div>';
  return h;
}
function dpCapsHtml(){
  const current = {
    DODGE_CAP: DODGE_CAP, HIT_CAP: HIT_CAP, CRIT_RATE_CAP: CRIT_RATE_CAP,
    CRIT_MULT_CAP: CRIT_MULT_CAP, SPD_MIN: SPD_MIN, STACK_MAX: STACK_MAX,
    BATTLE_DROP_CAP: BATTLE_DROP_CAP, GAME_YEAR_LIMIT: GAME_YEAR_LIMIT
  };
  const rows = [
    ['DODGE_CAP','闪避率上限','0.75 = 75%'],
    ['HIT_CAP','命中率上限','1.5 = 150%'],
    ['CRIT_RATE_CAP','暴击率上限','0.75 = 75%'],
    ['CRIT_MULT_CAP','暴击倍数上限','3 = 3 倍'],
    ['SPD_MIN','速度下限','0.1'],
    ['STACK_MAX','物品堆叠上限','99'],
    ['BATTLE_DROP_CAP','单场掉落上限','5'],
    ['GAME_YEAR_LIMIT','游戏年限','20']
  ];
  let h = '<div class="dp-grid">';
  rows.forEach(r => {
    h += dpField(r[1] + '（' + r[2] + '）',
      '<input class="debug-input" type="number" step="0.01" value="' + current[r[0]] + '" onchange="dpSetCap(\'' + r[0] + '\',this.value)">');
  });
  h += '</div>';
  h += '<div class="dp-hint">这些常量已改为可写；改完立即生效。</div>';
  return h;
}
function dpPlayerConfigHtml(){
  const P = PLAYER_BASE_CONFIG;
  let h = '<div class="dp-grid">'
    + dpField('Lv.1 体力', '<input class="debug-input" type="number" step="0.1" value="' + P.base.vit + '" onchange="dpSetPlayerConfig(\'base\',\'vit\',this.value)">')
    + dpField('Lv.1 精神', '<input class="debug-input" type="number" step="0.1" value="' + P.base.spi + '" onchange="dpSetPlayerConfig(\'base\',\'spi\',this.value)">')
    + dpField('体力 / 级', '<input class="debug-input" type="number" step="0.01" value="' + P.growth.vit + '" onchange="dpSetPlayerConfig(\'growth\',\'vit\',this.value)">')
    + dpField('精神 / 级', '<input class="debug-input" type="number" step="0.01" value="' + P.growth.spi + '" onchange="dpSetPlayerConfig(\'growth\',\'spi\',this.value)">')
    + dpField('初始等级', '<input class="debug-input" type="number" min="1" value="' + P.startLevel + '" onchange="dpSetPlayerConfig(\'startLevel\',null,this.value)">')
    + dpField('初始金钱', '<input class="debug-input" type="number" min="0" value="' + P.startMoney + '" onchange="dpSetPlayerConfig(\'startMoney\',null,this.value)">')
    + '</div>';
  h += '<div class="dp-hint">只影响之后新建的角色。当前角色请在「角色」页改。</div>';
  return h;
}
function dpAutoTimeHtml(){
  const C = AUTO_TIME_CONFIG;
  let h = '<div class="dp-grid">'
    + dpField('每游戏小时毫秒', '<input class="debug-input" type="number" min="1000" step="1000" value="' + C.msPerGameHour + '" onchange="dpSetAutoTime(\'msPerGameHour\',this.value)">')
    + '</div>';
  h += '<div class="dp-chips">'
    + ['pauseInBattle','pauseInStory','pauseInModal','pauseInQueue','pauseWhenHidden'].map(k =>
        '<label class="dp-check"><input type="checkbox" ' + (C[k] ? 'checked' : '') + ' onchange="dpSetAutoTime(\'' + k + '\',this.checked)"> ' + k + '</label>').join('')
    + '</div>';
  h += '<div class="dp-hint">调整后立即生效；时间推进仍走游戏内 advanceTime。</div>';
  return h;
}
function dpAddTime(hours){
  if(!currentGame){ toast('没有角色'); return; }
  if(typeof advanceTime === 'function') advanceTime(dpInt(hours, 1, 1));
  updateAllUI();
  renderDebugContent();
  toast('时间已推进');
}
function dpSetAttrFormula(key, field, val){
  if(!ATTR_FORMULA[key]) return;
  ATTR_FORMULA[key][field] = dpNum(val, ATTR_FORMULA[key][field]);
  dpAfterFormulaChange();
}
function dpSetEnemyTemplate(kind, section, stat, val){
  if(!ENEMY_ATTR_TEMPLATE[kind] || !ENEMY_ATTR_TEMPLATE[kind][section]) return;
  ENEMY_ATTR_TEMPLATE[kind][section][stat] = dpNum(val, ENEMY_ATTR_TEMPLATE[kind][section][stat]);
}
function dpSetCap(name, val){
  const v = dpNum(val, 0);
  if(name === 'DODGE_CAP') DODGE_CAP = v;
  else if(name === 'HIT_CAP') HIT_CAP = v;
  else if(name === 'CRIT_RATE_CAP') CRIT_RATE_CAP = v;
  else if(name === 'CRIT_MULT_CAP') CRIT_MULT_CAP = v;
  else if(name === 'SPD_MIN') SPD_MIN = v;
  else if(name === 'STACK_MAX') STACK_MAX = Math.max(1, Math.floor(v));
  else if(name === 'BATTLE_DROP_CAP') BATTLE_DROP_CAP = Math.max(1, Math.floor(v));
  else if(name === 'GAME_YEAR_LIMIT') GAME_YEAR_LIMIT = Math.max(1, Math.floor(v));
  dpAfterFormulaChange();
}
function dpSetPlayerConfig(section, stat, val){
  if(section === 'startLevel' || section === 'startMoney'){
    PLAYER_BASE_CONFIG[section] = section === 'startLevel' ? Math.max(1, dpInt(val, 1)) : Math.max(0, dpInt(val, 0));
  }else if(PLAYER_BASE_CONFIG[section] && stat){
    PLAYER_BASE_CONFIG[section][stat] = dpNum(val, 0);
  }
  renderDebugContent();
}
function dpSetAutoTime(key, val){
  AUTO_TIME_CONFIG[key] = (key === 'msPerGameHour') ? Math.max(1000, dpInt(val, 30000)) : !!val;
  renderDebugContent();
}
function dpAfterFormulaChange(){
  debugRecalcAll();
  updateAllUI();
  debugSyncBattle();
  renderDebugContent();
}
function dpApplyEnemyTemplates(){
  dpShowConfirm('套用档位模板', '用当前「杂兵 / 普通 / 精英」模板覆盖全部敌人卡的 base / growth？\n现有的个别调整会被覆盖。', () => {
    let n = 0;
    Object.keys(CHARACTERS).forEach(id => {
      const t = CHARACTERS[id];
      if(!t || t.kind !== 'enemy') return;
      const kind = enemyTemplateKind(t);
      const tpl = ENEMY_ATTR_TEMPLATE[kind];
      if(!tpl) return;
      t.base = dpDeep(tpl.base);
      t.growth = dpDeep(tpl.growth);
      t.rank = kind;
      dpMarkCharacter(id);
      n++;
    });
    dpAfterFormulaChange();
    toast('已套用 ' + n + ' 张敌人卡');
  });
}

/* ============================================================
   八、导出补丁 / 恢复
   ============================================================ */

function dpCharDbChanged(id){
  const cur = CHARACTERS[id];
  const orig = _ORIGINAL_DATA.CHARACTERS[id];
  if(!cur || !orig) return false;
  return JSON.stringify(cur) !== JSON.stringify(orig);
}
function dpFormulaPayload(){
  const original = DP_ORIGINAL;
  const caps = {
    DODGE_CAP: DODGE_CAP, HIT_CAP: HIT_CAP, CRIT_RATE_CAP: CRIT_RATE_CAP,
    CRIT_MULT_CAP: CRIT_MULT_CAP, SPD_MIN: SPD_MIN, STACK_MAX: STACK_MAX,
    BATTLE_DROP_CAP: BATTLE_DROP_CAP, GAME_YEAR_LIMIT: GAME_YEAR_LIMIT
  };
  const attrChanged = JSON.stringify(ATTR_FORMULA) !== JSON.stringify(original.ATTR_FORMULA);
  const enemyChanged = JSON.stringify(ENEMY_ATTR_TEMPLATE) !== JSON.stringify(original.ENEMY_ATTR_TEMPLATE);
  const capsChanged = JSON.stringify(caps) !== JSON.stringify(original.CAPS);
  const timeChanged = JSON.stringify(AUTO_TIME_CONFIG) !== JSON.stringify(original.AUTO_TIME);
  if(!attrChanged && !enemyChanged && !capsChanged && !timeChanged) return null;
  return {
    attrFormula: dpDeep(ATTR_FORMULA),
    enemyTemplate: dpDeep(ENEMY_ATTR_TEMPLATE),
    caps: caps,
    autoTime: dpDeep(AUTO_TIME_CONFIG)
  };
}
function dpPlayerChanged(){
  return JSON.stringify(PLAYER_BASE_CONFIG) !== JSON.stringify(DP_ORIGINAL.PLAYER_BASE_CONFIG);
}
function dpBuildPatch(){
  const items = {}, skills = {}, characters = {};
  Object.keys(debugChanges.items || {}).forEach(id => { if(EQUIPS[id]) items[id] = dpDeep(EQUIPS[id]); });
  Object.keys(debugChanges.skills || {}).forEach(id => { if(SKILLS[id]) skills[id] = dpDeep(SKILLS[id]); });
  const charIds = {};
  Object.keys(debugChanges.characters || {}).forEach(id => { charIds[id] = true; });
  Object.keys(debugChanges.enemies || {}).forEach(id => { charIds[id] = true; });
  Object.keys(charIds).forEach(id => {
    if(CHARACTERS[id] && dpCharDbChanged(id)) characters[id] = dpDeep(CHARACTERS[id]);
  });
  const formulas = dpFormulaPayload();
  const player = dpPlayerChanged() ? dpDeep(PLAYER_BASE_CONFIG) : null;
  const crafting = dpCraftChanged() ? dpDeep(CRAFTING_RECIPES) : null;
  return { items: items, skills: skills, characters: characters, crafting: crafting, formulas: formulas, player: player };
}
function dpPatchJs(patch){
  const json = JSON.stringify(patch, null, 2);
  return '/* ============================================================\n'
    + '   调试面板导出 · 数据补丁（角色 / 物品 / 技能 / 公式）\n'
    + '   ------------------------------------------------------------\n'
    + '   用法：另存为 data-debug-patch.js，在 index.html 里放到所有\n'
    + '   data-*.js 之后、core.js 之前加载。\n'
    + '   补丁只覆盖导出时记录过的条目。\n'
    + '   ============================================================ */\n'
    + '(function(){\n'
    + '  var P = ' + json + ';\n'
    + '  for(var id in P.items){ if(typeof EQUIPS !== "undefined" && EQUIPS[id]) Object.assign(EQUIPS[id], P.items[id]); }\n'
    + '  if(typeof SKILLS !== "undefined"){\n'
    + '    for(var sid in P.skills){ if(SKILLS[sid]) Object.assign(SKILLS[sid], P.skills[sid]); }\n'
    + '  }\n'
    + '  if(typeof CHARACTERS !== "undefined"){\n'
    + '    for(var cid in P.characters){ if(CHARACTERS[cid]) Object.assign(CHARACTERS[cid], P.characters[cid]); }\n'
    + '  }\n'
    + '  if(P.crafting && typeof CRAFTING_RECIPES !== "undefined"){\n'
    + '    CRAFTING_RECIPES.length = 0;\n'
    + '    P.crafting.forEach(function(r){ CRAFTING_RECIPES.push(r); });\n'
    + '  }\n'
    + '  if(P.formulas){\n'
    + '    if(P.formulas.attrFormula && typeof ATTR_FORMULA !== "undefined"){\n'
    + '      for(var g in P.formulas.attrFormula) Object.assign(ATTR_FORMULA[g], P.formulas.attrFormula[g]);\n'
    + '    }\n'
    + '    if(P.formulas.enemyTemplate && typeof ENEMY_ATTR_TEMPLATE !== "undefined"){\n'
    + '      for(var k in P.formulas.enemyTemplate){\n'
    + '        if(P.formulas.enemyTemplate[k].base) Object.assign(ENEMY_ATTR_TEMPLATE[k].base, P.formulas.enemyTemplate[k].base);\n'
    + '        if(P.formulas.enemyTemplate[k].growth) Object.assign(ENEMY_ATTR_TEMPLATE[k].growth, P.formulas.enemyTemplate[k].growth);\n'
    + '      }\n'
    + '    }\n'
    + '    if(P.formulas.autoTime && typeof AUTO_TIME_CONFIG !== "undefined") Object.assign(AUTO_TIME_CONFIG, P.formulas.autoTime);\n'
    + '    if(P.formulas.caps){\n'
    + '      if(P.formulas.caps.DODGE_CAP !== undefined) DODGE_CAP = P.formulas.caps.DODGE_CAP;\n'
    + '      if(P.formulas.caps.HIT_CAP !== undefined) HIT_CAP = P.formulas.caps.HIT_CAP;\n'
    + '      if(P.formulas.caps.CRIT_RATE_CAP !== undefined) CRIT_RATE_CAP = P.formulas.caps.CRIT_RATE_CAP;\n'
    + '      if(P.formulas.caps.CRIT_MULT_CAP !== undefined) CRIT_MULT_CAP = P.formulas.caps.CRIT_MULT_CAP;\n'
    + '      if(P.formulas.caps.SPD_MIN !== undefined) SPD_MIN = P.formulas.caps.SPD_MIN;\n'
    + '      if(P.formulas.caps.STACK_MAX !== undefined) STACK_MAX = P.formulas.caps.STACK_MAX;\n'
    + '      if(P.formulas.caps.BATTLE_DROP_CAP !== undefined) BATTLE_DROP_CAP = P.formulas.caps.BATTLE_DROP_CAP;\n'
    + '      if(P.formulas.caps.GAME_YEAR_LIMIT !== undefined) GAME_YEAR_LIMIT = P.formulas.caps.GAME_YEAR_LIMIT;\n'
    + '    }\n'
    + '  }\n'
    + '  if(P.player && typeof PLAYER_BASE_CONFIG !== "undefined"){\n'
    + '    if(P.player.base) Object.assign(PLAYER_BASE_CONFIG.base, P.player.base);\n'
    + '    if(P.player.growth) Object.assign(PLAYER_BASE_CONFIG.growth, P.player.growth);\n'
    + '    ["startLevel","startMoney","startTitle"].forEach(function(k){ if(P.player[k] !== undefined) PLAYER_BASE_CONFIG[k] = P.player[k]; });\n'
    + '  }\n'
    + '})();\n';
}
function dpRenderDebugExport(c){
  const counts = dpChangeCounts();
  const total = counts.items + counts.skills + counts.characters + counts.crafting + counts.formulas;
  let h = '<div class="debug-actions"><button class="debug-btn" onclick="debugCloseExport()">← 返回数据</button></div>';
  h += '<div class="debug-info"><b style="color:#ffcc66">导出修改</b><br>'
    + '已记录：物品 ' + counts.items + ' · 技能 ' + counts.skills + ' · 角色卡 ' + counts.characters
    + ' · 合成表 ' + counts.crafting + ' · 公式 ' + counts.formulas + '。<br>'
    + '只包含模板 / 公式改动；角色实例、装备实例的改动随存档保存，不导出。<br>'
    + 'JS 补丁可另存为 data-debug-patch.js（放到 core.js 之前加载）。</div>';
  if(!total){
    h += '<div class="debug-preview">还没有记录到模板修改。去角色 / 敌人 / 物品 / 技能 / 数据页保存几次再来。</div>';
    c.innerHTML = h;
    return;
  }
  h += '<div class="debug-row-item"><label>格式</label>'
    + '<select class="debug-select" onchange="debugSetExportFormat(this.value)">'
    + '<option value="js"' + (debugExportFormat === 'js' ? ' selected' : '') + '>JS 补丁（推荐）</option>'
    + '<option value="json"' + (debugExportFormat === 'json' ? ' selected' : '') + '>JSON</option>'
    + '</select>'
    + '<button class="debug-btn" onclick="debugDownloadPatch()">下载文件</button>'
    + '<button class="debug-btn" onclick="debugCopyPatch()">复制</button>'
    + '<button class="debug-btn danger" onclick="debugClearChanges()">清空记录</button></div>';
  h += '<textarea class="debug-json" id="debugExportText" readonly style="min-height:360px;white-space:pre">'
    + dpEsc(debugPatchText()) + '</textarea>';
  c.innerHTML = h;
}

function dpChangeCounts(){
  const items = Object.keys(debugChanges.items || {}).length;
  const skills = Object.keys(debugChanges.skills || {}).length;
  const chars = {};
  Object.keys(debugChanges.characters || {}).forEach(id => { chars[id] = true; });
  Object.keys(debugChanges.enemies || {}).forEach(id => { chars[id] = true; });
  Object.keys(chars).forEach(id => { if(!dpCharDbChanged(id)) delete chars[id]; });
  return {
    items: items,
    skills: skills,
    characters: Object.keys(chars).length,
    enemies: Object.keys(debugChanges.enemies || {}).length,
    crafting: dpCraftChanged() ? Object.keys(debugChanges.crafting || {}).length : 0,
    formulas: dpFormulaPayload() ? 1 : 0
  };
}
function dpClearChanges(){
  dpShowConfirm('清空修改记录', '只清空导出列表，不会撤销已经生效的模板修改。继续？', () => {
    debugChanges = { items:{}, skills:{}, enemies:{}, characters:{}, crafting:{} };
    toast('修改记录已清空');
    renderDebugContent();
  });
}
function dpRestoreAll(){
  dpShowConfirm('恢复全部原始数据', '把所有角色卡、技能、物品、公式、玩家初始值恢复成文件原始值？\n当前存档实例的好感 / 等级等不会回滚。', () => {
    Object.keys(_ORIGINAL_DATA.CHARACTERS).forEach(id => {
      if(CHARACTERS[id]) dpReplaceObject(CHARACTERS[id], _ORIGINAL_DATA.CHARACTERS[id]);
    });
    Object.keys(_ORIGINAL_DATA.SKILLS).forEach(id => {
      if(SKILLS[id]) dpReplaceObject(SKILLS[id], _ORIGINAL_DATA.SKILLS[id]);
    });
    Object.keys(_ORIGINAL_DATA.EQUIPS).forEach(id => {
      if(EQUIPS[id]) dpReplaceObject(EQUIPS[id], _ORIGINAL_DATA.EQUIPS[id]);
    });
    CRAFTING_RECIPES.length = 0;
    DP_ORIGINAL.CRAFTING.forEach(r => CRAFTING_RECIPES.push(dpDeep(r)));
    ['hp','mp','physAtk','magicAtk','def','spd'].forEach(g => {
      if(DP_ORIGINAL.ATTR_FORMULA[g]) Object.assign(ATTR_FORMULA[g], DP_ORIGINAL.ATTR_FORMULA[g]);
    });
    ['minion','normal','strong'].forEach(k => {
      Object.assign(ENEMY_ATTR_TEMPLATE[k].base, DP_ORIGINAL.ENEMY_ATTR_TEMPLATE[k].base);
      Object.assign(ENEMY_ATTR_TEMPLATE[k].growth, DP_ORIGINAL.ENEMY_ATTR_TEMPLATE[k].growth);
    });
    Object.assign(AUTO_TIME_CONFIG, DP_ORIGINAL.AUTO_TIME);
    Object.assign(PLAYER_BASE_CONFIG, dpDeep(DP_ORIGINAL.PLAYER_BASE_CONFIG));
    DODGE_CAP = DP_ORIGINAL.CAPS.DODGE_CAP;
    HIT_CAP = DP_ORIGINAL.CAPS.HIT_CAP;
    CRIT_RATE_CAP = DP_ORIGINAL.CAPS.CRIT_RATE_CAP;
    CRIT_MULT_CAP = DP_ORIGINAL.CAPS.CRIT_MULT_CAP;
    SPD_MIN = DP_ORIGINAL.CAPS.SPD_MIN;
    STACK_MAX = DP_ORIGINAL.CAPS.STACK_MAX;
    BATTLE_DROP_CAP = DP_ORIGINAL.CAPS.BATTLE_DROP_CAP;
    GAME_YEAR_LIMIT = DP_ORIGINAL.CAPS.GAME_YEAR_LIMIT;
    debugChanges = { items:{}, skills:{}, enemies:{}, characters:{}, crafting:{} };
    debugRecalcAll();
    updateAllUI();
    debugSyncBattle();
    toast('已恢复全部原始数据');
    renderDebugContent();
  });
}

/* ============================================================
   九、覆盖原调试函数
   ============================================================ */
window.renderDebugContent = dpRenderDebugContent;
window.renderDebugChars = dpRenderDebugChars;
window.buildDebugCharEntry = dpBuildDebugCharEntry;
window.renderDebugEnemies = dpRenderDebugEnemies;
window.renderDebugEquipList = dpRenderDebugEquipList;
window.renderDebugSkillList = dpRenderDebugSkillList;
window.renderDebugItemEdit = dpRenderDebugItemEdit;
window.debugSaveItemEdit = dpSaveItemEdit;
window.debugWordRowHtml = dpWordRowHtml;
window.renderDebugSkills = dpRenderDebugSkills;
window.renderDebugSkillEdit = dpRenderDebugSkillEdit;
window.debugSaveSkillEdit = dpSaveSkillEdit;
window.renderDebugBattle = dpRenderDebugBattle;
window.renderDebugStory = dpRenderDebugStory;
window.renderDebugData = dpRenderDebugData;
window.debugChangeCounts = dpChangeCounts;
window.renderDebugExport = dpRenderDebugExport;
window.debugBuildPatch = dpBuildPatch;
window.debugPatchJs = dpPatchJs;
window.debugClearChanges = dpClearChanges;
window.debugRestoreAll = dpRestoreAll;
window.debugRestoreEnemies = function(){
  Object.keys(_ORIGINAL_DATA.CHARACTERS).forEach(id => {
    if(CHARACTERS[id]) dpReplaceObject(CHARACTERS[id], _ORIGINAL_DATA.CHARACTERS[id]);
  });
  debugChanges.characters = {};
  debugChanges.enemies = {};
  debugRecalcAll();
  updateAllUI();
  debugSyncBattle();
  toast('已恢复全部角色卡');
  renderDebugContent();
};

/* ============================================================
   十、调试面板打开时补一个「增强版」标记
   ============================================================ */
const dpOriginalOpenDebugModal = window.openDebugModal;
window.openDebugModal = function(){
  const r = dpOriginalOpenDebugModal.apply(this, arguments);
  const title = document.querySelector('#debugModal h3');
  if(title) title.textContent = '调试面板 · 增强版';
  return r;
};

