/* ============================================================
   main.js — 交互入口 / Modal / 调试面板 / 启动
   ============================================================ */

let pendingKickNpcId = null;
let pendingLearnProfession = null;
let currentTrainerNpcId = null;
let currentTrainerPlacementId = null;
let selectedClassChar = 'player';
let expandedGearChar = null;
let debugTab = 'save';
let debugSkillChar = 'player';
let debugEquipChar = 'player';
let pendingTradeNpc = null;
let tradeBuyList = [];
let tradeSellList = [];
let pendingInteractions = [];   // 多功能 NPC 的互动队列
let pendingInteractionsNpcId = null;
let pendingInteractionsIdx = 0;

/* 原始数据快照（用于"恢复原始设定"） */
const _ORIGINAL_DATA = {
  NPCS: JSON.parse(JSON.stringify(NPCS)),
  CHARACTERS: JSON.parse(JSON.stringify(CHARACTERS)),
  SKILLS: JSON.parse(JSON.stringify(SKILLS)),
  EQUIPS: JSON.parse(JSON.stringify(EQUIPS))
};

let bagSkillKeyword = '';
let bagEquipKeyword = '';
let bagEquipSort = 'level_desc';
let bagEquipGroup = 'equip';   /* 行囊物品：当前一级分类 */
let bagEquipCat = 'all';       /* 行囊物品：当前二级分类（仅装备），all = 全部 */
let debugCharKeyword = '';
let bagSkillGroupOpenMap = {};
let _debugGroupState = new Map();

/* 修复费用公式：按装备价格比例算，修满 = 价格 25% */
function calcRepairCost(price, curV, maxV){
  if(maxV <= 0 || curV >= maxV) return 0;
  const wearRatio = (maxV - curV) / maxV;
  const base = Math.floor((price || 0) * wearRatio * 0.25);
  /* 修理费减免：被动/装备词条 */
  const cut = (typeof getPassiveStatTotal === 'function')
    ? Math.min(90, getPassiveStatTotal(currentGame, 'repair_discount', 'add'))
    : 0;
  return Math.max(1, Math.floor(base * (1 - cut / 100)));
}

/* ============================================================
   一、UI 辅助：下拉展示
   ============================================================ */

function buildEquipDropdown(eq, uid, onlyAccessory){
    const eqName = (slot) => {
    const it = eq[slot];
    if(!it) return '—';
    const tpl = EQUIPS[it.id];
    if(!tpl) return '—';
    const wStr = it.wear != null ? it.wear : 'null';
    const dStr = it.durability != null ? it.durability : 'null';
    const q = getQuality(tpl);
    return `<span class="eq-clickable q-${q}" onclick="event.stopPropagation();showEquipDetail('${it.id}',${wStr},${dStr})">${tpl.name}</span>`;
  };
  const wearText = (slot) => {
    const item = eq[slot];
    if(!item) return '';
    const tpl = EQUIPS[item.id];
    if(!tpl) return '';
    if(tpl.type === 'weapon' && tpl.maxWear){
      return `<span class="eq-wear">磨损 ${getItemWear(item, tpl)}/${tpl.maxWear}</span>`;
    }
    if((tpl.type === 'armor' || tpl.type === 'shield') && tpl.durability){
      return `<span class="eq-wear">耐久 ${getItemDur(item, tpl)}/${tpl.durability}</span>`;
    }
    return '';
  };
  const _slots = onlyAccessory ? ['accessory'] : EQUIP_SLOTS;
  const rows = _slots.map(slot =>
    `<div class="equip-slot"><div class="es-label">${EQUIP_SLOT_LABEL[slot]}</div><div class="es-name ${eq[slot]?'':'es-empty'}">${eqName(slot)}${wearText(slot)}</div></div>`
  ).join('');
  return `<div class="view-dropdown" id="vd_equip_${uid}">
    <div class="view-dropdown-head" onclick="toggleViewDropdown('vd_equip_body_${uid}')">
      <span>▾ 装备槽（${onlyAccessory ? '1 件项链' : EQUIP_SLOTS.length + ' 部位'}）</span><span class="vd-arrow">▼</span>
    </div>
    <div class="view-dropdown-body" id="vd_equip_body_${uid}">
      ${rows}
    </div>
  </div>`;
}

function buildSkillDropdown(skillIds, unitRef, uid){
  const list = (skillIds || []).filter(Boolean);
  const refStr = (unitRef && unitRef.isPlayer)
    ? '{isPlayer:true}'
    : `{npcId:'${(unitRef && unitRef.npcId) || ''}'}`;
  return `<div class="view-dropdown" id="vd_skill_${uid}">
    <div class="view-dropdown-head" onclick="toggleViewDropdown('vd_skill_body_${uid}')">
      <span>▾ 技能槽（${list.length}/4）</span><span class="vd-arrow">▼</span>
    </div>
    <div class="view-dropdown-body" id="vd_skill_body_${uid}">
      ${list.length === 0 ? '<div class="bag-empty">未装备技能</div>' :
        list.map((sid, i) => {
          const s = SKILLS[sid];
          if(!s) return '';
          const lv = getSkillLevel(unitRef, sid);
          return `<div class="equip-slot"><div class="es-label">技能 ${i+1}</div><div class="es-name"><span class="eq-clickable" onclick="event.stopPropagation();showSkillDetail('${sid}', ${refStr})">${s.name}</span> ${skillLevelText(s, lv)}</div></div>`;
        }).join('')}
    </div>
  </div>`;
}

function buildPassiveDropdown(charObj, uid){
  const classes = getCharClasses(charObj);
  const classPassives = classes.filter(c => PASSIVE_SKILLS[c]);
  const personal = (charObj && Array.isArray(charObj.personalPassives)) ? charObj.personalPassives : [];
  const ownerId = (charObj === currentGame) ? 'player' : ((charObj && charObj.id) || '');
  const ownerIdEsc = String(ownerId).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const total = classPassives.length + personal.length;
  return `<div class="view-dropdown" id="vd_passive_${uid}">
    <div class="view-dropdown-head" onclick="toggleViewDropdown('vd_passive_body_${uid}')">
      <span>▾ 被动技能（${total}）</span><span class="vd-arrow">▼</span>
    </div>
    <div class="view-dropdown-body" id="vd_passive_body_${uid}">
      ${total === 0 ? '<div class="bag-empty">无被动技能</div>' : (
        classPassives.map(cls => {
          const p = PASSIVE_SKILLS[cls];
          return `<div class="equip-slot passive-slot"><div class="es-label">${cls} · 职业</div><div class="es-name"><span class="eq-clickable" onclick="event.stopPropagation();showPassiveDetail('${cls}')">${p.name}</span></div></div>`;
        }).join('') +
        personal.map((p, i) =>
          `<div class="equip-slot passive-slot"><div class="es-label">个性化 ${i+1}</div><div class="es-name"><span class="eq-clickable" onclick="event.stopPropagation();showPersonalPassiveDetail('${ownerIdEsc}',${i})">${p.name || '未命名被动'}</span></div></div>`
        ).join('')
      )}
    </div>
  </div>`;
}

/* ============================================================
   二、NPC 交互
   ============================================================ */

/* 从 NPC 对白池随机抽一条（统一三处随机对话）
   优先级：好感度分段对话 > DIALOGUE_PAIRS > DIALOGUES 兜底
   返回 {npc, player} 结构；无话可说时也返回占位对象，方便上层直接使用 */
function pickNpcLine(npcId){
  const pair = getAffinityDialogue(npcId);
  if(pair) return pair;
  return {npc:'……', player:'……'};
}
function clickNpcName(id, placementId, level){
  const npc = getNpc(id);
  if(!npc) return;
  currentTalkNpc = id;
  currentTalkPlacementId = placementId || null;
  currentTalkLevel = Math.max(1, Number(level) || 1);
  const box = document.getElementById('storyBox');
  box.innerHTML = '';
   if(npc.isEnv){
    appendStory('', `你正在看向【${npc.name}】……`, 'env');
  }else{
    nextSpeaker = 'player';
    talkCount = 0;
    pendingAcceptAction = null;
    pendingInteractions = [];
    pendingInteractionsNpcId = null;
    document.getElementById('btnAccept').disabled = true;
    document.getElementById('btnAccept').classList.remove('accept-active');
    const line = pickNpcLine(id);
    _currentPair = line;
    appendStory(npc.name, line.npc, 'npc');
  }
  renderNpcRow();
  updateActionButtons();
}

/* 互动：触发功能（商店/转职/修复/疗愈师回满/环境物/任务） */
function doInteract(){
  if(!currentTalkNpc) return;
  const npc = getNpc(currentTalkNpc);
  if(!npc) return;

  /* ===== 环境物体 ===== */
  if(npc.isEnv){
    const triggered = checkStoryTriggers({
      type:'env_interact',
      tileId: currentTileId,
      envName: npc.name
    });
    if(triggered) return;
    const tile = getCurrentTile();
    if(!tile || !tile.battle){ toast('这里没有可触发的内容'); return; }
    appendStory('', '敌人正在靠近……', 'narration');
    const encId = Array.isArray(tile.battle)
      ? tile.battle[Math.floor(Math.random() * tile.battle.length)]
      : tile.battle;
    currentTalkNpc = null;
    setTimeout(() => { triggerBattleFromTile(encId); }, 600);
    return;
  }

  /* ===== 剧情/任务触发 ===== */
  const storyTriggered = checkStoryTriggers({type:'npc_talk', npcId:currentTalkNpc});
  if(storyTriggered) return;

  /* ===== 功能队列：点互动切换下一个，点接受才执行当前 ===== */
  const list = buildInteractions(npc);
  if(list.length === 0){
    pendingInteractions = [];
    pendingInteractionsNpcId = null;
    const _icfg = (typeof placementActorConfig === 'function') ? placementActorConfig(npc.id, currentTalkPlacementId) : null;
    if(npc.classes && npc.classes.includes('疗愈师') && !(_icfg && _icfg.services.trainer) && !(_icfg && _icfg.services.trader)){
      appendStory(npc.name, '「你们看起来状态不错，不需要我出手。」', 'npc');
    }else{
      toast('这里没有可互动的功能');
    }
    return;
  }

  /* 同一 NPC 连续点互动 → 循环切换；换了 NPC → 从头开始 */
  if(currentTalkNpc !== pendingInteractionsNpcId){
    pendingInteractions = list;
    pendingInteractionsNpcId = npc.id;
    pendingInteractionsIdx = 0;
  }else{
    pendingInteractionsIdx = (pendingInteractionsIdx + 1) % pendingInteractions.length;
  }
  showInteractionPrompt(npc, pendingInteractions[pendingInteractionsIdx]);
}

/* ============================================================
   互动功能收集：一个 NPC 可能同时具备多个功能，
   这里统一列出，依次询问，玩家在哪个上接受就执行哪个。
   ============================================================ */
function buildInteractions(npc){
  const list = [];
  const hasCls = (c) => npc.classes && npc.classes.includes(c);
  const _cfg = (typeof placementActorConfig === 'function')
    ? placementActorConfig(npc.id, currentTalkPlacementId)
    : null;
  const svc = _cfg ? _cfg.services : {
    trainer: !!npc.isTrainer, trader: !!npc.isTrader, repairer: !!npc.isRepairer,
    shopItems: npc.shopItems || [], professions: npc.professions || [], skillShop: npc.skillShop || []
  };

  /* 疗愈师：互动回满（满血自动不出现）；与剧情中的 heal_party 是两回事 */
  if(hasCls('疗愈师') && !isPartyFull()){
    list.push({
      prompt: '「你看起来需要休息。要让我帮你看看吗？」',
      action: () => {
        healPartyNow();
        toast('全队已恢复');
        updateAllUI();
        appendStory(npc.name, '「好了，都精神多了吧。」', 'npc');
      }
    });
  }

  /* 商人：挂载点服务开关 + 商品列表，避免镇长这种挂名商人误触 */
  if(svc.trader && Array.isArray(svc.shopItems) && svc.shopItems.length > 0){
    list.push({ prompt: '「要交易吗？」', action: () => openTradeModal(npc.id) });
  }

  /* 铁匠 / 修复师：挂载点服务开关（旧数据用职业自动识别） */
  if(svc.repairer || hasCls('铁匠')){
    list.push({ prompt: '「装备磨损了？拿来我看看。」', action: () => openRepairModal() });
  }

  /* 转职官：转职/学技能（必须在该挂载点启用并有内容） */
  const hasTrainerData = (svc.professions && svc.professions.length > 0)
                      || (svc.skillShop && svc.skillShop.length > 0);
  if(svc.trainer && hasTrainerData){
    list.push({
      prompt: '「你要转职吗？还是学习技能？」',
      action: () => { openClassTrainer(npc.id); }
    });
  }

  /* 招募/收服入口统一在「查看角色」详情面板：好感度达到阈值后按钮才亮起。
     互动中不再提供直接收服/招募，npc 与 foe 走完全相同的流程。 */

  return list;
}

/* 显示当前功能提示，接受按钮亮起；点接受才执行 */
function showInteractionPrompt(npc, item){
  appendStory(npc.name, item.prompt, 'quest');
  pendingAcceptAction = () => {
    item.action();
    pendingInteractions = [];
    pendingInteractionsNpcId = null;
    document.getElementById('btnAccept').disabled = true;
    document.getElementById('btnAccept').classList.remove('accept-active');
  };
  document.getElementById('btnAccept').disabled = false;
  document.getElementById('btnAccept').classList.add('accept-active');
}

/* 对话：纯文本闲聊，了解NPC（不触发功能/剧情） */
function doTalk(){
  if(!currentTalkNpc) return;
  const npc = getNpc(currentTalkNpc);
  if(!npc) return;
  if(npc.isEnv) return;   // 环境物体不能对话

  pendingInteractions = [];
  pendingInteractionsNpcId = null;
  document.getElementById('btnAccept').disabled = true;
  document.getElementById('btnAccept').classList.remove('accept-active');

  talkCount++;
  if(nextSpeaker === 'player'){
    if(_currentPair && _currentPair.player){
      appendStory(currentGame.name, _currentPair.player, 'player');
       }else{
      appendStory(currentGame.name, '……', 'player');
    }
    nextSpeaker = 'npc';
  }else{
    const line = pickNpcLine(currentTalkNpc);
    _currentPair = line;
    appendStory(npc.name, line.npc, 'npc');
    nextSpeaker = 'player';
  }
}

function doView(){
  if(!currentTalkNpc) return;
  const npc = getNpc(currentTalkNpc);
  if(npc && npc.isEnv){ toast('环境物体无法查看详情'); return; }
  if(currentTalkNpc === 'player'){ viewPlayer(); return; }
  viewNpc(currentTalkNpc);
}

function doAccept(){
  if(pendingAcceptAction){
    const act = pendingAcceptAction;
    pendingAcceptAction = null;
    document.getElementById('btnAccept').disabled = true;
    document.getElementById('btnAccept').classList.remove('accept-active');
    act();
  }else{
    toast('当前没有可接受的任务');
  }
}

/* ============================================================
   三、查看角色
   ============================================================ */

/* ---------- 新 UI：角色卡共用部件 ---------- */
function fmtRate(v){
  const n = Math.round((Number(v) || 0) * 1000) / 10;
  return (Number.isInteger(n) ? n : n.toFixed(1)) + '%';
}
/* 战斗四率：角色卡自带 → 叠加装备词条。
   与 battle.js 的判定口径一致：命中与闪避相加后对抗，暴击率/倍率相加。 */
function getCombatRates(charObj){
  const eq = (typeof calcEquipStats === 'function' && charObj) ? calcEquipStats(charObj) : {};
  const base = (typeof getCharCombatRates === 'function')
    ? getCharCombatRates(charObj)
    : { hitRate: 0, dodge: 0, critRate: 0.05, critMult: 1.5 };
  const cap = (typeof DODGE_CAP === 'number') ? DODGE_CAP : 0.75;
  const hitCap = (typeof HIT_CAP === 'number') ? HIT_CAP : 1.5;
  const critCap = (typeof CRIT_RATE_CAP === 'number') ? CRIT_RATE_CAP : 0.75;
  const critMultCap = (typeof CRIT_MULT_CAP === 'number') ? CRIT_MULT_CAP : 3;
  const hitRate = (Number(base.hitRate) || 0) + (Number(eq.hitRate) || 0);
  return {
    dodge: Math.max(0, Math.min(cap, (Number(base.dodge) || 0) + (Number(eq.dodge) || 0))),
    hit: Math.max(0, Math.min(hitCap, 1 + hitRate)),
    crit: Math.max(0, Math.min(critCap, (Number(base.critRate) || 0) + (Number(eq.critRate) || 0))),
    critMult: Math.max(1, Math.min(critMultCap, (Number(base.critMult) || 1.5) + (Number(eq.critMult) || 0)))
  };
}
/* 礼物偏好标签：从 giftRules 归纳最多 4 个「送什么涨好感」的标签 */
function getGiftPreferenceTags(npc){
  const rules = (npc && npc.giftRules) || [];
  const map = new Map();
  rules.forEach(r => {
    if(!r) return;
    let label = '';
    if(r.cond === 'tag'){
      const t = (typeof TAGS !== 'undefined')
        ? (TAGS[r.value] || Object.keys(TAGS).map(k => TAGS[k]).find(x => x && x.name === r.value))
        : null;
      label = t ? t.name : r.value;
    }else if(r.cond === 'classLimit') label = (typeof maskClassName === 'function' ? maskClassName(r.value) : r.value) + '装备';
    else if(r.cond === 'price') label = '价值≥' + r.min;
    else if(r.cond === 'level') label = 'Lv≥' + r.min;
    else if(r.cond === 'itemId') label = (typeof EQUIPS !== 'undefined' && EQUIPS[r.value] && EQUIPS[r.value].name) || r.value;
    else if(r.cond === 'name_contains') label = '名称含「' + r.value + '」';
    if(!label) return;
    map.set(label, (map.get(label) || 0) + (Number(r.bonus) || 0));
  });
  return [...map.entries()].map(([label, bonus]) => ({label, bonus}))
    .sort((a, b) => b.bonus - a.bonus).slice(0, 4);
}
function giftTagsHtml(npc){
  const tags = getGiftPreferenceTags(npc);
  if(!tags.length) return '<span class="cv-gift-none">暂无特别偏好</span>';
  return tags.map(t => `<span class="cv-gift-tag" title="送这类礼物：好感 +${t.bonus}">${t.label}<b>+${t.bonus}</b></span>`).join('');
}

/* 三栏角色卡：左（身份/血蓝/属性/简介） 中（职业/技能） 右（装备纸娃娃） */
function buildCharView(o){
  const st = o.stats, rates = o.rates;
  const statCell = (label, val, cls) =>
    `<div class="cv-stat${cls ? ' ' + cls : ''}"><span class="cv-stat-label">${label}</span><span class="cv-stat-val">${val}</span></div>`;
  const hpPct = o.maxHp > 0 ? Math.max(0, Math.min(100, o.hp / o.maxHp * 100)) : 0;
  const mpPct = o.maxMp > 0 ? Math.max(0, Math.min(100, o.mp / o.maxMp * 100)) : 0;
  const skills = o.skills || [null, null, null, null];
  const skillRows = skills.map((sid, i) => {
    const sk = sid ? SKILLS[sid] : null;
    if(!sk) return `<div class="cv-skill-row empty"><span class="cv-skill-idx">${i + 1}</span><span class="cv-skill-name">空</span></div>`;
    const lv = (typeof getSkillLevel === 'function') ? getSkillLevel(o.skillRef, sid) : 1;
    return `<div class="cv-skill-row"><span class="cv-skill-idx">${i + 1}</span>
      <span class="cv-skill-name eq-clickable" onclick="showSkillDetail('${sid}', ${o.skillRefStr})">${sk.name}</span>
      <span class="cv-skill-lv">${(typeof skillLevelText === 'function') ? skillLevelText(sk, lv) : ''}</span></div>`;
  }).join('');

  const affBlock = o.affinity == null ? '' : `
    <div class="cv-aff">
      <div class="cv-aff-head"><span>好感度</span><b>${o.affinity}/${o.affinityMax}</b></div>
      <div class="aff-bar cv-aff-bar">
        <div class="aff-fill" style="width:${o.affPct}%"></div>
        <div class="aff-mark" style="left:${o.thresholdPct}%"></div>
        <div class="aff-mark2" style="left:40%"></div>
      </div>
      <div class="cv-gift-line"><span class="cv-gift-label">礼物标签</span>${giftTagsHtml(o.npc)}</div>
      <div class="cv-aff-hint">${o.affinityHint}</div>
    </div>`;

  return `<div class="cv-grid">
    <div class="cv-col cv-col-info">
      <div class="cv-ident">
        <span class="cv-name">${o.name}</span>
        <span class="cv-badge${o.isPet ? ' pet' : ''}">${o.isPet ? '宠物' : '角色'}</span>
        <span class="cv-lv">Lv.${o.level}</span>
        <span class="cv-gender">${o.gender || '—'}</span>
        ${o.ageText ? `<span class="cv-gender">${o.ageText}</span>` : ''}
      </div>
      <div class="cv-tags">
        <span>种族 <b>${o.race || '—'}</b></span>
        <span>阵营 <b>${o.faction || '中立'}</b></span>
      </div>
      <div class="cv-bars">
        <div class="cv-bar hp"><i style="width:${hpPct}%"></i><span>HP ${o.hp} / ${o.maxHp}</span></div>
        <div class="cv-bar mp"><i style="width:${mpPct}%"></i><span>MP ${o.mp} / ${o.maxMp}</span></div>
      </div>
      <div class="cv-stat-grid">
        ${statCell('体力', st.vit)}
        ${statCell('物理攻击', st.physAtk)}
        ${statCell('防御值', st.def)}
        ${statCell('精神力', st.spi)}
        ${statCell('魔法攻击', st.magicAtk)}
        ${statCell('速度值', st.spd)}
      </div>
      <div class="cv-rate-grid">
        ${statCell('闪避率', fmtRate(rates.dodge))}
        ${statCell('命中率', fmtRate(rates.hit))}
        ${statCell('暴击率', fmtRate(rates.crit))}
        ${statCell('暴击倍率', fmtRate(rates.critMult))}
      </div>
      <div class="cv-sub-title">简介</div>
      <div class="cv-desc">${o.desc || '——'}</div>
      <div class="cv-note">速度值越小越先手；HP/MP 为实际生效上限，其余属性未计装备与技能修正。${o.moneyNote || ''}</div>
    </div>
    <div class="cv-col cv-col-skill">
      <div class="cv-sub-title">职业</div>
      <div class="cv-class-row"><span class="cv-class-label">职业1</span><span class="cv-class-val">${o.class1 || '—'}</span></div>
      <div class="cv-class-row"><span class="cv-class-label">职业2</span><span class="cv-class-val">${o.class2 || '—'}</span></div>
      <div class="cv-sub-title">装备技能</div>
      <div class="cv-skills">${skillRows}</div>
      <div class="cv-sub-title">被动技能</div>
      ${o.passiveHtml || '<div class="bag-empty">无被动技能</div>'}
    </div>
    <div class="cv-col cv-col-equip">
      <div class="cv-sub-title">装备</div>
      ${o.equipHtml}
    </div>
  </div>
  <div class="cv-foot">
    <div class="cv-foot-left">${o.affinity == null ? (o.footLeft || '') : affBlock}</div>
    <div class="cv-foot-actions">${o.actions || ''}</div>
  </div>`;
}

function viewNpc(id){
  const tplRaw = getCharacterTemplate(id) || getNpc(id);
  const placementId = (currentTalkNpc === id) ? currentTalkPlacementId : null;
  const tpl = (typeof effectiveCharacterForPlacement === 'function'
    ? effectiveCharacterForPlacement(tplRaw && tplRaw.id, placementId)
    : null) || tplRaw;
  if(tpl && !tpl.isEnv) ensureCharacterState(tpl.id, (currentTalkNpc === id && currentTalkLevel) || 1);
  const inPartyId = getRecruitedInstanceId(id);
  const petInstanceId = findPetInstanceId(id);
  const ownedId = inPartyId || petInstanceId;
  const npc = ownedId ? getNpc(ownedId) : getNpc(id);
  if(!npc || npc.isEnv) return;
  document.getElementById('viewName').textContent = '查看角色 · ' + npc.name;
  const _threshold = (npc.affinityThreshold !== undefined && npc.affinityThreshold !== null) ? npc.affinityThreshold : 90;
  const isPetCard = !!tpl && !!tpl.isPet;
  const canRecruit = !isPetCard && !!tpl && isRecruitableCharacter(tpl) && canRecruitAnother(tpl)
    && (npc.affinity || 0) >= _threshold;
  const canAdopt = isPetCard && !!tpl && canAdoptPet(tpl) && (npc.affinity || 0) >= _threshold;
  const petOwned = isPetCard && isPetOwned(npc.id);
  const petSlot = isPetCard ? petSlotOf(npc.id) : null;
  const skills = npc.equippedSkills || [null, null, null, null];
  const viewLevel = ownedId ? (npc.level || 1) : ((currentTalkNpc === id && currentTalkLevel) || npc.level || 1);
  const st = getCharAttrStats(npc, viewLevel);
  const maxHpTotal = getFinalMaxHp(npc);
  const maxMpTotal = getFinalMaxMp(npc);
  const classes = (npc.classes || []).filter(c => c);
  const faction = (npc.factionTags && npc.factionTags.length ? npc.factionTags.join(' / ') : (npc.faction || '中立'));
  const affPct = (npc.affinity / npc.affinityMax * 100).toFixed(0);
  const thresholdPct = (_threshold / npc.affinityMax * 100).toFixed(0);

  const actions = [
    `<button class="btn-money" onclick="openGiftModal('${npc.id}')">送礼</button>`,
    isPetCard ? (
      petSlot
        ? `<button class="btn-danger" onclick="dismissCharacter('${npc.id}');closeViewModal();">召回宠物</button>`
        : (petOwned
            ? `<button class="btn-primary" onclick="deployPet('${npc.id}','front');closeViewModal();">出战前排</button>
               <button class="btn-primary" onclick="deployPet('${npc.id}','back');closeViewModal();">出战后排</button>`
            : `<button class="btn-primary" ${canAdopt ? `onclick="enlistCharacter('${tpl.id}','${currentTalkPlacementId || ''}');closeViewModal();"` : 'disabled'}>收服</button>`)
    ) : (inPartyId ? `<button class="btn-danger" onclick="closeViewModal();dismissCharacter('${inPartyId}');">请出队伍</button>` : ''),
    !isPetCard ? `<button class="btn-primary" ${canRecruit ? `onclick="enlistCharacter('${tpl.id}','${currentTalkPlacementId || ''}');closeViewModal();"` : 'disabled'}>${inPartyId ? '再招募' : '招募'}</button>` : ''
  ].join('');

  document.getElementById('viewContent').innerHTML = buildCharView({
    npc,
    name: npc.name,
    gender: npc.gender,
    ageText: (typeof getCharacterAgeTextForView === 'function')
      ? getCharacterAgeTextForView(npc, (currentTalkNpc === id) ? currentTalkPlacementId : null)
      : '',
    isPet: isPetCard,
    level: viewLevel,
    race: npc.race,
    faction: faction,
    hp: npc.hp, maxHp: maxHpTotal,
    mp: npc.mp, maxMp: maxMpTotal,
    stats: st,
    rates: getCombatRates(npc),
    class1: classes[0], class2: classes[1],
    skills,
    skillRef: { npcId: npc.id },
    skillRefStr: `{npcId:'${npc.id}'}`,
    passiveHtml: buildPassiveDropdown(npc, 'npc_' + id),
    equipHtml: isPetCard ? petPaperdollGrid(npc.id) : paperdollGrid(npc.id),
    desc: npc.desc,
    affinity: npc.affinity,
    affinityMax: npc.affinityMax,
    affinityThreshold: _threshold,
    affPct, thresholdPct,
    affinityHint: `${isPetCard ? '收服线' : '招募线'} ${_threshold}　离队线 40`,
    footLeft: `<div class="cv-aff-mini">好感度 ${npc.affinity}/${npc.affinityMax} · ${isPetCard ? '收服线' : '招募线'} ${_threshold}</div>`,
    actions
  });
  document.getElementById('viewModal').classList.add('show');
}

function viewPlayer(){
  const c1 = currentGame.classes[0] || '—';
  const c2 = currentGame.classes[1] || '—';
  const skills = currentGame.equippedSkills || [null, null, null, null];
  const st = getCharAttrStats(currentGame);
  const maxHpTotal = getFinalMaxHp(currentGame);
  const maxMpTotal = getFinalMaxMp(currentGame);
  document.getElementById('viewName').textContent = '查看角色 · ' + currentGame.name;
  document.getElementById('viewContent').innerHTML = buildCharView({
    npc: currentGame,
    name: currentGame.name,
    gender: currentGame.gender || '男',
    ageText: '',
    isPet: false,
    level: currentGame.level,
    race: currentGame.race || '人类',
    faction: currentGame.faction || '冒险者',
    hp: currentGame.hp, maxHp: maxHpTotal,
    mp: currentGame.mp, maxMp: maxMpTotal,
    stats: st,
    rates: getCombatRates(currentGame),
    class1: c1, class2: c2,
    skills,
    skillRef: { isPlayer: true },
    skillRefStr: '{isPlayer:true}',
    passiveHtml: buildPassiveDropdown(currentGame, 'player'),
    equipHtml: paperdollGrid('player'),
    desc: currentGame.desc || '你，一个穿越者。落水后被雷克救起。',
    footLeft: `<div class="cv-aff-mini">资金 ￥${currentGame.money}</div>`,
    actions: `<button class="btn-primary" onclick="closeViewModal();openBag();">物品管理</button>`
  });
  document.getElementById('viewModal').classList.add('show');
}

function closeViewModal(){
  document.getElementById('viewModal').classList.remove('show');
  /* 清理下拉展开状态（下次打开时恢复默认收起） */
  document.querySelectorAll('#viewModal .view-dropdown.open').forEach(el => el.classList.remove('open'));
}

/* ============================================================
   装备详情弹窗
   ============================================================ */
function showEquipDetail(itemId, wear, durability, inst){
  const tpl = EQUIPS[itemId];
  if(!tpl) return;
  const item = inst || null;
  const cat = getItemCategory(tpl);
  const typeStr = cat === 'equip'
    ? (ITEM_TYPE_LABEL[tpl.type] || '装备')
    : (ITEM_CATEGORY_LABEL[cat] || '特殊道具');
  /* 品阶取实例优先（进阶会改），没有就取模板 */
  const rarityId = (typeof getItemRarityOf === 'function') ? getItemRarityOf(item, tpl) : null;
  const ri = rarityId ? ITEM_RARITY[rarityId] : null;
  const nameEl = document.getElementById('equipDetailName');
  nameEl.textContent = tpl.name;
  nameEl.style.color = ri ? ri.color : '#e8e8e8';

  let html = '<div class="equip-detail-block">';
  html += `<div class="equip-detail-row"><span class="edr-label">类别</span><span class="edr-value">${typeStr}</span></div>`;
  const slot = getItemEquipSlot(tpl);
  if(slot)
    html += `<div class="equip-detail-row"><span class="edr-label">部位</span><span class="edr-value">${EQUIP_SLOT_LABEL[slot] || '—'}</span></div>`;
  html += `<div class="equip-detail-row"><span class="edr-label">品阶</span><span class="edr-value" style="color:${ri ? ri.color : '#888'}">${ri ? ri.label + '（' + ri.words + ' 槽）' : '未设计'}</span></div>`;
  html += `<div class="equip-detail-row"><span class="edr-label">等级</span><span class="edr-value">Lv.${tpl.level||1}</span></div>`;
  const shownPrice = (item && item.price) ? item.price : (tpl.price || 0);
  html += `<div class="equip-detail-row"><span class="edr-label">售价</span><span class="edr-value">￥${shownPrice}</span></div>`;

  if(tpl.type === 'weapon' && tpl.maxWear){
    const w = (wear != null) ? wear : tpl.maxWear;
    html += `<div class="equip-detail-row"><span class="edr-label">磨损</span><span class="edr-value">${w} / ${tpl.maxWear}</span></div>`;
  }
  if((tpl.type === 'armor' || tpl.type === 'shield') && tpl.durability){
    const d = (durability != null) ? durability : tpl.durability;
    html += `<div class="equip-detail-row"><span class="edr-label">耐久</span><span class="edr-value">${d} / ${tpl.durability}</span></div>`;
  }
  if(tpl.twoHanded)
    html += `<div class="equip-detail-row"><span class="edr-label">占用</span><span class="edr-value" style="color:#ff9966">右手+左手（双手）</span></div>`;
  if(cat === 'equip'){
    const clsList = tpl.classLimit;
    const hasLimit = clsList && clsList.length > 0;
    /* 隐藏职业不显示真名，避免通过装备详情泄露 */
    const showList = hasLimit ? clsList.map(c => (typeof maskClassName === 'function' ? maskClassName(c) : c)) : [];
    const clsStr = hasLimit ? showList.join(' / ') : '无限制';
    const clsColor = hasLimit ? '#ffcc66' : '#667';
    html += `<div class="equip-detail-row"><span class="edr-label">职业限制</span><span class="edr-value" style="color:${clsColor}">${clsStr}</span></div>`;
  }
  html += '</div>';

  /* 词条：实例优先（进阶得到的词条存在实例上） */
  const words = (typeof getItemWords === 'function') ? getItemWords(item, tpl) : (tpl.words || []);
  if(words.length){
    html += '<div class="equip-detail-section-title">词条</div>';
    html += '<div class="equip-detail-block">';
    words.forEach(w => {
      if(!w || !w.type) return;
      const atom = (typeof getEffectAtom === 'function') ? getEffectAtom(w.type) : null;
      const label = EQUIP_WORD_LABEL[w.type] || w.type;
      const unit = (atom && atom.valueUnit) ? atom.valueUnit : '';
      const srcName = (w.src === 'ore' && w.oreId && typeof EQUIPS !== 'undefined' && EQUIPS[w.oreId])
        ? '（' + EQUIPS[w.oreId].name + '）' : '';
      html += `<div class="equip-detail-row"><span class="edr-label">${label}${srcName}</span><span class="edr-value" style="color:#ffcc66">${w.value}${unit ? ' ' + unit : ''}</span></div>`;
    });
    html += '</div>';
  }

  const itemEffects = getItemEffects(tpl);
  if(cat !== 'equip' && itemEffects.length){
    html += `<div class="equip-detail-section-title">${cat === 'special' ? '送礼效果' : '使用效果'}</div>`;
    html += '<div class="equip-detail-block">';
    itemEffects.forEach(e => {
      const atom = (typeof getEffectAtom === 'function') ? getEffectAtom(e.type) : null;
      const fn = (typeof EFFECT_DESC !== 'undefined') ? EFFECT_DESC[e.type] : null;
      const label = (atom && atom.name) || e.type;
      const value = fn ? fn(e.value) : (e.value != null ? e.value : '');
      html += `<div class="equip-detail-row"><span class="edr-label">${label}</span><span class="edr-value" style="color:#66ff99">${value}</span></div>`;
    });
    html += '</div>';
  }
  if(cat === 'special' && (tpl.questId || tpl.unique)){
    html += '<div class="equip-detail-section-title">特殊属性</div>';
    html += '<div class="equip-detail-block">';
    if(tpl.questId) html += `<div class="equip-detail-row"><span class="edr-label">任务</span><span class="edr-value">${tpl.questId}</span></div>`;
    if(tpl.unique) html += `<div class="equip-detail-row"><span class="edr-label">唯一</span><span class="edr-value">不可重复持有</span></div>`;
    html += '</div>';
  }

  if(tpl.tags && tpl.tags.length){
    html += '<div class="equip-detail-section-title">标签</div>';
    html += '<div class="equip-detail-block"><div class="equip-detail-tags">';
    tpl.tags.forEach(t => { html += `<span class="equip-detail-tag">${(typeof getTagName === 'function' ? getTagName(t) : t)}</span>`; });
    html += '</div></div>';
  }

  if(tpl.desc){
    html += '<div class="equip-detail-section-title">描述</div>';
    html += `<div class="equip-detail-desc">${tpl.desc}</div>`;
  }

  document.getElementById('equipDetailContent').innerHTML = html;
  document.getElementById('equipDetailModal').classList.add('show');
}

function showEquipDetailByIndex(idx){
  const it = currentGame.bag[idx];
  if(!it) return;
  showEquipDetail(it.id, it.wear, it.durability, it);
}

/* 从人物装备栏打开详情（保留实例上的进阶词条） */
function showEquipDetailByEquip(charId, slot){
  const obj = getCharObj(charId);
  const it = obj && obj.equipment ? obj.equipment[slot] : null;
  if(!it) return;
  showEquipDetail(it.id, it.wear, it.durability, it);
}

function closeEquipDetail(){
  document.getElementById('equipDetailModal').classList.remove('show');
}

/* 技能详情：复用 equipDetailModal，不新建弹窗 */
function showSkillDetail(skillId, unitRef){
  const sk = SKILLS[skillId];
  if(!sk) return;
  document.getElementById('equipDetailName').textContent = sk.name;

  const lv = getSkillLevel(unitRef, skillId);
  const lvData = sk.levels[lv - 1] || sk.levels[0];

  let html = '<div class="equip-detail-block">';
  html += `<div class="equip-detail-row"><span class="edr-label">职业限制</span><span class="edr-value" style="color:#ffcc66">${typeof maskClassName === 'function' ? maskClassName(sk.classLimit) : sk.classLimit}</span></div>`;
  html += `<div class="equip-detail-row"><span class="edr-label">当前等级</span><span class="edr-value">${skillLevelText(sk, lv)}</span></div>`;
  html += `<div class="equip-detail-row"><span class="edr-label">MP消耗</span><span class="edr-value">${lvData.mpCost}</span></div>`;
  const rangeStr = (typeof getRangeText === 'function') ? getRangeText(lvData.effects) : '';
  const selectRule = (typeof getTargetSelectRule === 'function') ? getTargetSelectRule(lvData.effects) : '';
  html += `<div class="equip-detail-row"><span class="edr-label">作用对象</span><span class="edr-value">${rangeStr || '—'}</span></div>`;
  if(selectRule) html += `<div class="equip-detail-row"><span class="edr-label">目标选择</span><span class="edr-value">${selectRule}</span></div>`;
  html += '</div>';

  const effDesc = (typeof describeEffectsWithTargets === 'function')
    ? describeEffectsWithTargets(lvData.effects)
    : ((typeof describeEffects === 'function') ? describeEffects(lvData.effects) : '');
  if(effDesc){
    html += '<div class="equip-detail-section-title">效果</div>';
    html += `<div class="equip-detail-desc">${effDesc}</div>`;
  }

  html += '<div class="equip-detail-section-title">各等级</div>';
  html += '<div class="equip-detail-block">';
  sk.levels.forEach((lvd, i) => {
    const lvNum = i + 1;
    const lvText = skillLevelText(sk, lvNum);
    const prof = (lvd.proficiency !== undefined) ? lvd.proficiency : '—';
    const isCur = (lvNum === lv) ? ' style="color:#ffcc66"' : '';
    html += `<div class="equip-detail-row"><span class="edr-label"${isCur}>${lvText}${lvNum === lv ? '（当前）' : ''}</span><span class="edr-value"${isCur}>MP${lvd.mpCost} · 熟练度 ${prof}</span></div>`;
  });
  html += '</div>';

  document.getElementById('equipDetailContent').innerHTML = html;
  document.getElementById('equipDetailModal').classList.add('show');
}

/* 被动详情：职业被动 / 角色个性化被动共用同一套展示 */
function renderPassiveDetail(p, ownerLabel, typeLabel){
  if(!p) return;
  document.getElementById('equipDetailName').textContent = p.name || '未命名被动';

  let html = '<div class="equip-detail-block">';
  html += `<div class="equip-detail-row"><span class="edr-label">所属</span><span class="edr-value" style="color:#ffcc66">${ownerLabel}</span></div>`;
  html += `<div class="equip-detail-row"><span class="edr-label">类型</span><span class="edr-value">${typeLabel}</span></div>`;
  html += `<div class="equip-detail-row"><span class="edr-label">升级</span><span class="edr-value">无等级</span></div>`;
  html += '</div>';
  if(p.desc){
    html += '<div class="equip-detail-section-title">描述</div>';
    html += `<div class="equip-detail-desc">${p.desc}</div>`;
  }

  if(p.effects && p.effects.length){
    html += '<div class="equip-detail-section-title">效果</div>';
    html += '<div class="equip-detail-block">';
    p.effects.forEach(e => {
      const label = (typeof EFFECT_DESC !== 'undefined' && EFFECT_DESC[e.type])
        ? EFFECT_DESC[e.type](e.value)
        : `${e.type} ${e.value}`;
      const scopeStr = e.scope === 'battle' ? '战斗内' : e.scope === 'field' ? '场景内' : '';
      const triggerStr = (typeof EFFECT_TRIGGER_LABEL !== 'undefined' && EFFECT_TRIGGER_LABEL[e.trigger])
        ? EFFECT_TRIGGER_LABEL[e.trigger]
        : (e.trigger === 'turn_end' ? '每回合结束'
          : e.trigger === 'turn_start' ? '每回合开始'
          : e.trigger === 'battle_start' ? '战斗开始时' : '');
      const subStr = [scopeStr, triggerStr].filter(Boolean).join(' · ') || '常驻';
      html += `<div class="equip-detail-row"><span class="edr-label">${label}</span><span class="edr-value" style="color:#889">${subStr}</span></div>`;
    });
    html += '</div>';
  }

  document.getElementById('equipDetailContent').innerHTML = html;
  document.getElementById('equipDetailModal').classList.add('show');
}

/* 职业被动详情 */
function showPassiveDetail(className){
  const p = PASSIVE_SKILLS[className];
  if(!p) return;
  renderPassiveDetail(p, className, '职业被动');
}

/* 角色个性化被动详情 */
function showPersonalPassiveDetail(charId, idx){
  const obj = (charId === 'player') ? currentGame : getNpc(charId);
  const p = obj && Array.isArray(obj.personalPassives) ? obj.personalPassives[idx] : null;
  if(!p) return;
  let ownerLabel = charId === 'player' ? '玩家' : ((getChar(charId) || {}).name || charId);
  renderPassiveDetail(p, ownerLabel, '个性化被动');
}
/* ============================================================
   四、队列交互
   ============================================================ */

function queueViewChar(id){
  if(id === 'player'){ viewPlayer(); return; }
  const npc = getNpc(id);
  if(npc){ viewNpc(id); }
}

function queueTalk(npcId){
  const npc = getNpc(npcId);
  if(!npc) return;
  const line = pickNpcLine(npcId);
  showConfirm(`与 ${npc.name} 对话`, `${npc.name}：${line.npc}`, () => {
    toast(`你：${line.player || '……'}`);
    checkStoryTriggers({type:'npc_talk', npcId});
  });
}
/* ============================================================
   五、称号
   ============================================================ */

function openTitle(){
  const titles = currentGame.titles || [];
  document.getElementById('titleContent').innerHTML = titles.length === 0
    ? '<div class="quest-empty">暂无称号</div>'
    : titles.map(tid => {
        const t = (typeof TITLES !== 'undefined') ? TITLES[tid] : null;
        if(!t) return '';
        const descHtml = t.desc ? `<div class="quest-item-desc">${t.desc}</div>` : '';
        return `<div class="quest-item"><div class="quest-item-title">${t.name}</div>${descHtml}</div>`;
      }).join('');
  document.getElementById('titleModal').classList.add('show');
}
function closeTitleModal(){ document.getElementById('titleModal').classList.remove('show'); }

/* ============================================================
   六、行囊
   ============================================================ */

let bagTab = 'bag';

function openBag(tab){
  if(!currentGame) return;
  if(!selectedBagChar) selectedBagChar = 'player';
  if(tab) bagTab = tab;
  renderBagMoney();
  renderBag();
  applyBagTab();
  document.getElementById('bagModal').classList.add('show');
}
function closeBagModal(){
  document.getElementById('bagModal').classList.remove('show');
  bagTab = 'bag';
  bagSkillGroupOpenMap = {};
  bagSkillKeyword = '';
  bagEquipKeyword = '';
  bagEquipSort = 'level_desc';
  bagEquipGroup = 'equip';
  bagEquipCat = 'all';
}
function renderBagMoney(){
  const el = document.getElementById('bagMoney');
  if(el) el.textContent = '￥' + currentGame.money;
}
function applyBagTab(){
  document.querySelectorAll('.bag-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.bagTab === bagTab);
  });
  const map = { bag:'bagPageBag', party:'bagPageParty', pet:'bagPagePet' };
  Object.keys(map).forEach(k => {
    const el = document.getElementById(map[k]);
    if(el) el.style.display = (k === bagTab) ? '' : 'none';
  });
}
function switchBagTab(tab){
  bagTab = tab;
  applyBagTab();
  if(tab === 'party') renderBagParty();
  if(tab === 'pet') renderBagPets();
}

/* 队伍成员 ID：主角 + 队列 + 出战宠物 + 宠物行囊（去重） */
function partyCharIds(){
  const ids = ['player'];
  const q = currentGame.queue || {};
  ['front','back','rest'].forEach(r => (q[r] || []).forEach(c => {
    if(c && c !== 'player' && !ids.includes(c)) ids.push(c);
  }));
  const pets = currentGame.pets || {};
  ['front','back'].forEach(sl => {
    if(pets[sl] && !ids.includes(pets[sl])) ids.push(pets[sl]);
  });
  (currentGame.petBag || []).forEach(id => {
    if(id && !ids.includes(id)) ids.push(id);
  });
  return ids;
}

function renderBag(){
  renderBagChars();
  renderBagCurrentEquip();
  renderBagEquip();
  renderBagSkill();
  renderBagParty();
  renderBagPets();
}

/* 顶部角色切换条（与地图 / 队列 同一套简略角色卡） */
function renderBagChars(){
  const el = document.getElementById('bagChars');
  if(!el) return;
  const ids = partyCharIds();
  el.innerHTML = ids.map(id => {
    const c = getChar(id);
    if(!c) return '';
    const obj = getCharObj(id);
    const isPet = !!(obj && obj.isPet);
    const job = (c.classes && c.classes.filter(Boolean).join('·')) || (isPet ? '宠物' : '');
    return `<button class="bag-char-chip${id === selectedBagChar ? ' selected' : ''}${isPet ? ' pet' : ''}" onclick="selectBagChar('${id}')">
      ${charBriefCard(c, {
        level: c.level,
        hp: obj ? obj.hp : c.hp, maxHp: getFinalMaxHp(obj || c),
        mp: obj ? obj.mp : c.mp, maxMp: getFinalMaxMp(obj || c),
        job
      })}
    </button>`;
  }).join('');
}
function selectBagChar(id){
  selectedBagChar = id;
  renderBag();
}

/* ---------------- 宠物列表 ---------------- */
function renderBagPets(){
  const el = document.getElementById('bagPetPanel');
  if(!el) return;
  const pets = currentGame.pets || {front:null, back:null};
  const bag = currentGame.petBag || [];
  const activeRows = ['front','back'].map(slot => {
    const id = pets[slot];
    const c = id ? getChar(id) : null;
    if(!c) return `<div class="bag-pet-card"><div class="bpc-name" style="color:#667">${slot==='front'?'前排':'后排'}宠物位</div><div class="bpc-meta">空 · 从下方安排</div></div>`;
    return `<div class="bag-pet-card active">
      <div class="bpc-name">${c.name}<span style="color:#ffcc66;font-size:11px"> ${slot==='front'?'前排':'后排'}出战</span></div>
      <div class="bpc-meta">Lv.${c.level} · HP ${c.hp}/${c.maxHp}</div>
      <div class="bpc-btns">
        <button onclick="queueViewChar('${id}')">查看</button>
        <button onclick="selectBagChar('${id}');switchBagTab('bag');">装备</button>
        <button onclick="withdrawPet('${slot}')">召回</button>
      </div></div>`;
  }).join('');
  const bagRows = bag.length ? bag.map(id => {
    const c = getChar(id);
    if(!c) return '';
    return `<div class="bag-pet-card">
      <div class="bpc-name">${c.name}</div>
      <div class="bpc-meta">Lv.${c.level} · HP ${c.hp}/${c.maxHp}${c.dead?' · 已死亡':''}</div>
      <div class="bpc-btns">
        <button onclick="queueViewChar('${id}')">查看</button>
        <button onclick="selectBagChar('${id}');switchBagTab('bag');">装备</button>
        <button onclick="deployPet('${id}','front')">出战前排</button>
        <button onclick="deployPet('${id}','back')">出战后排</button>
      </div></div>`;
  }).join('') : '<div class="bpc-meta" style="color:#667">行囊里还没有未出战宠物</div>';
  el.innerHTML = `<div class="bag-pet-head" onclick="toggleBagPetPanel()" style="cursor:pointer"><span>宠物（行囊 ${bag.length}/9） <span class="bpp-arrow" style="color:#667;font-size:11.5px">▶</span></span><span style="color:#667;font-size:11.5px">出战 2 格 · 未出战最多 9 格 · 只能携带 1 件项链</span></div>
    <div class="bag-pet-list" id="bagPetList" style="display:none">${activeRows}${bagRows}</div>`;
}
function toggleBagPetPanel(){
  const el = document.getElementById('bagPetList');
  if(!el) return;
  const show = el.style.display === 'none';
  el.style.display = show ? 'flex' : 'none';
  const head = el.previousElementSibling;
  const arrow = head && head.querySelector('.bpp-arrow');
  if(arrow) arrow.textContent = show ? '▼' : '▶';
}

/* ---------------- 队伍列表 ---------------- */
function renderBagParty(){
  const el = document.getElementById('bagPartyBody');
  if(!el) return;
  const q = currentGame.queue || {front:[], back:[], rest:[]};
  const rows = [['front','前排'],['back','后排'],['rest','休息区']];
  el.innerHTML = rows.map(([key,label]) => {
    const cells = (q[key] || []).map(id => {
      if(!id) return `<div class="bag-party-card empty"><span class="bpc-empty">空位</span></div>`;
      const c = getChar(id);
      if(!c) return '';
      const obj = getCharObj(id);
      const isPet = !!(obj && obj.isPet);
      const job = (c.classes && c.classes.filter(Boolean).join('·')) || (isPet ? '宠物' : '');
      const talk = id !== 'player' ? `<button onclick="event.stopPropagation();closeBagModal();queueTalk('${id}')">对话</button>` : '';
      const kick = id !== 'player' ? `<button class="danger" onclick="event.stopPropagation();dismissCharacter('${id}');renderBag();">请出</button>` : '';
      return `<div class="bag-party-card${id === selectedBagChar ? ' selected' : ''}" onclick="selectBagChar('${id}')">
        ${charBriefCard(c, {
          level: c.level,
          hp: obj ? obj.hp : c.hp, maxHp: getFinalMaxHp(obj || c),
          mp: obj ? obj.mp : c.mp, maxMp: getFinalMaxMp(obj || c),
          job,
          badge: id === 'player' ? '<span class="bpc-self">主角</span>' : ''
        })}
        <div class="bpc-btns">
          <button onclick="event.stopPropagation();queueViewChar('${id}')">查看</button>
          ${talk}${kick}
        </div>
      </div>`;
    }).join('');
    return `<section class="bag-party-row"><div class="bag-party-label">${label} <span>${(q[key] || []).filter(Boolean).length}/${(q[key] || []).length}</span></div>
      <div class="bag-party-cards">${cells}</div></section>`;
  }).join('');
}

/* ============================================================
   暗黑纸娃娃（8 部位，3 列人体布局）
   布局：    .   头部  项链
           右手  胸部  左手
           挂饰  腿部   .
             .   足部   .
   ============================================================ */
const PD_LAYOUT = [
  null, 'head', 'accessory',
  'mainHand', 'chest', 'offHand',
  'charm', 'legs', null,
  null, 'feet', null
];

function renderPdSlot(charId, slot){
  const charObj = getCharObj(charId);
  const held = charObj.equipment[slot];
  if(!held){
    return `<div class="pd-slot pd-empty"><div class="pd-label">${EQUIP_SLOT_LABEL[slot]}</div><div class="pd-name">空</div></div>`;
  }
  const tpl = EQUIPS[held.id];
  const q = getQuality(tpl);
  const wStr = held.wear != null ? held.wear : 'null';
  const dStr = held.durability != null ? held.durability : 'null';
  const st = getWearStatus(held, tpl);
  const critCls = (st.level === 'critical' || st.level === 'broken') ? ' pd-crit' : '';
  let metric = '';
  if(tpl.type === 'weapon' && tpl.maxWear)
    metric = `<div class="pd-metric">磨损 ${getItemWear(held,tpl)}/${tpl.maxWear}</div>`;
  else if((tpl.type === 'armor' || tpl.type === 'shield') && tpl.durability)
    metric = `<div class="pd-metric">耐久 ${getItemDur(held,tpl)}/${tpl.durability}</div>`;
  const two = tpl.twoHanded ? '<div class="pd-two">双手</div>' : '';
  return `<div class="pd-slot q-${q}${critCls}">
    <div class="pd-label">${EQUIP_SLOT_LABEL[slot]}</div>
    <div class="pd-name eq-clickable q-${q}" onclick="showEquipDetailByEquip('${charId}','${slot}')">${tpl.name}${(() => { const rid = (typeof getItemRarityOf==='function') ? getItemRarityOf(held,tpl) : null; const ri = rid ? ITEM_RARITY[rid] : null; return ri ? ` <span style="color:${ri.color};font-size:10px">${ri.label}</span>` : ''; })()}</div>
    ${two}${metric}
    <button class="pd-unequip" title="卸下" onclick="unequipSlot(getCharObj('${charId}'),'${slot}')">×</button>
  </div>`;
}

function paperdollGrid(charId){
  const charObj = getCharObj(charId);
  if(!charObj) return '';
  if(!charObj.equipment) charObj.equipment = makeEmptyEquipment();
  const cells = PD_LAYOUT.map(slot =>
    slot ? renderPdSlot(charId, slot) : '<div class="pd-cell pd-blank"></div>'
  ).join('');
  return `<div class="pd-grid">${cells}</div>`;
}

function petPaperdollGrid(charId){
  return `<div class="pd-grid" style="grid-template-columns:1fr;max-width:160px">
    ${renderPdSlot(charId, 'accessory')}
  </div>`;
}
function renderPaperdoll(charId){
  const char = getChar(charId);
  const charObj = getCharObj(charId);
  if(!char) return '';
  return `<div class="pd-title">当前装备 · <span class="pd-char">${char.name}</span>${charObj && charObj.isPet ? '（宠物 · 仅项链）' : ''}</div>
    ${charObj && charObj.isPet ? petPaperdollGrid(charId) : paperdollGrid(charId)}`;
}

/* 渲染选中角色的当前装备（行囊顶部，暗黑纸娃娃） */
function renderBagCurrentEquip(){
  const el = document.getElementById('bagCurrentEquip');
  if(!el) return;
  const char = getChar(selectedBagChar);
  if(!char){ el.innerHTML = ''; return; }
  el.innerHTML = renderPaperdoll(selectedBagChar);
}

function renderBagEquip(){
  const body = document.getElementById('bagEquipBody');
  if(!body) return;
  const cntEl = document.getElementById('bagEquipCount');
  if(cntEl) cntEl.textContent = `${(currentGame.bag || []).length} 件物品`;
  body.innerHTML = `
    <div class="bag-toolbar">
      <input type="text" id="bagEquipSearch" placeholder="搜索物品..." value="${bagEquipKeyword}" oninput="onBagEquipSearch(this.value)">
      <button id="bagEquipSortBtn" onclick="toggleBagEquipSort()">${getBagEquipSortLabel()}</button>
    </div>
    <div id="bagEquipList"></div>
  `;
  renderBagEquipList();
}

function getBagEquipSortLabel(){
  if(bagEquipSort === 'level_desc') return '↓ 等级';
  if(bagEquipSort === 'level_asc') return '↑ 等级';
  return '按名称';
}

function toggleBagEquipSort(){
  if(bagEquipSort === 'level_desc') bagEquipSort = 'level_asc';
  else if(bagEquipSort === 'level_asc') bagEquipSort = 'name';
  else bagEquipSort = 'level_desc';
  const btn = document.getElementById('bagEquipSortBtn');
  if(btn) btn.textContent = getBagEquipSortLabel();
  renderBagEquipList();
}

function onBagEquipSearch(val){
  bagEquipKeyword = val || '';
  renderBagEquipList();
}

/* 行囊分类：物品五分法 → 装备（七槽）/ 材料 / 药品 / 即时道具 / 特殊道具 */
const BAG_GROUPS = [
  { id:'equip', label:'装备', cats:[
    {id:'mainHand',  label:'右手', match:t => getItemEquipSlot(t) === 'mainHand'},
    {id:'offHand',   label:'左手', match:t => getItemEquipSlot(t) === 'offHand'},
    {id:'head',      label:'头部', match:t => getItemEquipSlot(t) === 'head'},
    {id:'chest',     label:'胸部', match:t => getItemEquipSlot(t) === 'chest'},
    {id:'legs',      label:'腿部', match:t => getItemEquipSlot(t) === 'legs'},
    {id:'feet',      label:'足部', match:t => getItemEquipSlot(t) === 'feet'},
    {id:'accessory', label:'项链', match:t => getItemEquipSlot(t) === 'accessory'},
    {id:'charm',     label:'挂饰', match:t => getItemEquipSlot(t) === 'charm'}
  ]},
  { id:'material', label:'材料', cats:[
    {id:'material', label:'材料', match:t => getItemCategory(t) === 'material'}
  ]},
  { id:'medicine', label:'药品', cats:[
    {id:'medicine', label:'药品', match:t => getItemCategory(t) === 'medicine'}
  ]},
  { id:'instant', label:'即时道具', cats:[
    {id:'instant', label:'即时道具', match:t => getItemCategory(t) === 'instant'}
  ]},
  { id:'special', label:'特殊道具', cats:[
    {id:'special', label:'特殊道具', match:t => getItemCategory(t) === 'special'}
  ]}
];

/* 按「一级分类 / 二级分类」聚合行囊物品（含搜索与排序） */
function bagEquipBuckets(){
  const bag = currentGame.bag || [];
  const charObj = getCharObj(selectedBagChar);
  const kw = (bagEquipKeyword || '').toLowerCase().trim();
  return BAG_GROUPS.map(group => {
    const cats = group.cats.map(cat => {
      const items = bag.map((it, realIdx) => ({it, realIdx}))
        .filter(x => {
          const tpl = EQUIPS[x.it.id];
          if(!tpl || !cat.match(tpl)) return false;
          if(charObj && charObj.isPet && tpl.type !== 'accessory') return false;
          if(!kw) return true;
          const name = (tpl.name || '').toLowerCase();
          const desc = (tpl.desc || '').toLowerCase();
          const tags = (tpl.tags || []).join(' ').toLowerCase();
          return name.includes(kw) || desc.includes(kw) || tags.includes(kw);
        });
      if(bagEquipSort === 'level_desc'){
        items.sort((a, b) => (EQUIPS[b.it.id].level || 0) - (EQUIPS[a.it.id].level || 0));
      }else if(bagEquipSort === 'level_asc'){
        items.sort((a, b) => (EQUIPS[a.it.id].level || 0) - (EQUIPS[b.it.id].level || 0));
      }else if(bagEquipSort === 'name'){
        items.sort((a, b) => (EQUIPS[a.it.id].name || '').localeCompare(EQUIPS[b.it.id].name || '', 'zh'));
      }
      return {cat, items};
    });
    return {group, cats, total: cats.reduce((n, c) => n + c.items.length, 0)};
  });
}

/* 单条物品行 */
function bagItemRowHTML(it, realIdx, charObj){
  const tpl = EQUIPS[it.id];
  if(!tpl) return '';
  const q = getQuality(tpl);
  const isEquipped = !!findEquippedSlot(charObj, it.id);
  const canEquip = isEquipItem(tpl);
  const canUse = isUsableItem(tpl);
  let extra = '';
  if(tpl.type === 'weapon' && tpl.maxWear)
    extra = `<span class="eq-wear">磨损 ${getItemWear(it,tpl)}/${tpl.maxWear}</span>`;
  else if((tpl.type === 'armor' || tpl.type === 'shield') && tpl.durability)
    extra = `<span class="eq-wear">耐久 ${getItemDur(it,tpl)}/${tpl.durability}</span>`;
  const lvTag = `<span style="color:#9966ff;font-size:11px">Lv.${tpl.level || 1}</span>`;
  const _rid = (typeof getItemRarityOf === 'function') ? getItemRarityOf(it, tpl) : null;
  const _ri = _rid ? ITEM_RARITY[_rid] : null;
  const upTag = _ri ? `<span style="color:${_ri.color};font-size:11px">${_ri.label}</span>` : '';

  const actionBtns = [];
  if(canEquip)
    actionBtns.push(`<button class="bag-item-btn${isEquipped ? ' equipped' : ''}" onclick="bagEquipItemByIdx(${realIdx})">${isEquipped ? '卸下' : '装备'}</button>`);
  if(canUse)
    actionBtns.push(`<button class="bag-item-btn" onclick="bagUseItem('${it.id}')">使用</button>`);
  if(getItemCategory(tpl) === 'special' && tpl.questId)
    actionBtns.push(`<button class="bag-item-btn equipped" disabled>任务</button>`);
  const actionsHtml = actionBtns.length
    ? `<div class="bag-item-actions">${actionBtns.join('')}</div>` : '';

  return `<div class="bag-item">
    <div style="flex:1;min-width:0">
      <div class="bag-item-name"><span class="eq-clickable q-${q}" onclick="showEquipDetailByIndex(${realIdx})">${tpl.name}</span> ${lvTag} ${upTag} ${it.count > 1 ? `<span class="count">×${it.count}</span>` : ''} ${extra}</div>
      ${tpl.tags ? `<div class="bag-item-desc">${tpl.tags.map(t=>getTagName(t)).join(' · ')}</div>` : ''}
    </div>
    ${actionsHtml}
  </div>`;
}

function switchBagEquipGroup(id){
  bagEquipGroup = id;
  bagEquipCat = 'all';
  renderBagEquipList();
}

function switchBagEquipCat(id){
  bagEquipCat = id;
  renderBagEquipList();
}

/* 物品列表：搜索框下方是分类按钮；点一级分类出二级分类按钮，下方只显示对应物品 */
function renderBagEquipList(){
  const listEl = document.getElementById('bagEquipList');
  if(!listEl) return;
  const charObj = getCharObj(selectedBagChar);
  const groups = bagEquipBuckets();

  const cur = groups.find(g => g.group.id === bagEquipGroup) || groups[0];
  bagEquipGroup = cur.group.id;
  const multi = cur.group.cats.length > 1;   /* 只有装备带二级分类 */
  if(!multi) bagEquipCat = 'all';
  else if(bagEquipCat !== 'all' && !cur.cats.some(c => c.cat.id === bagEquipCat)) bagEquipCat = 'all';

  const groupTabs = groups.map(g =>
    `<button class="bag-seg${g.group.id === cur.group.id ? ' active' : ''}${g.total === 0 ? ' zero' : ''}" onclick="switchBagEquipGroup('${g.group.id}')">${g.group.label}<span class="seg-n">${g.total}</span></button>`
  ).join('');

  const catTabs = multi ? `<div class="bag-subtabs">
      <button class="bag-seg sub${bagEquipCat === 'all' ? ' active' : ''}${cur.total === 0 ? ' zero' : ''}" onclick="switchBagEquipCat('all')">全部<span class="seg-n">${cur.total}</span></button>
      ${cur.cats.map(c => `<button class="bag-seg sub${bagEquipCat === c.cat.id ? ' active' : ''}${c.items.length === 0 ? ' zero' : ''}" onclick="switchBagEquipCat('${c.cat.id}')">${c.cat.label}<span class="seg-n">${c.items.length}</span></button>`).join('')}
    </div>` : '';

  const picked = (!multi || bagEquipCat === 'all') ? cur.cats : cur.cats.filter(c => c.cat.id === bagEquipCat);
  const items = picked.reduce((arr, c) => arr.concat(c.items), []);
  const rows = items.length
    ? items.map(({it, realIdx}) => bagItemRowHTML(it, realIdx, charObj)).join('')
    : `<div class="bag-empty">${bagEquipKeyword ? '没有匹配的物品' : '这一类里还没有物品'}</div>`;

  listEl.innerHTML = `<div class="bag-cattabs">${groupTabs}</div>${catTabs}<div class="bag-itemlist">${rows}</div>`;
}

/* ============================================================
   穿戴 / 卸下（8 槽，含双手武器与左手类型校验）
   ============================================================ */

/* 已装备在哪个槽（未装备返回 null） */
function findEquippedSlot(charObj, itemId){
  const eq = charObj.equipment || {};
  for(const s of EQUIP_SLOTS){ if(eq[s] && eq[s].id === itemId) return s; }
  return null;
}

/* 把一件已装备物品回行囊（null 视为成功） */
function _returnToBag(held){
  if(!held) return true;
  return addItemToBag(held.id, held.wear, held.durability, held);
}

/* 核心：装备槽位完全由 tags 决定；type 只决定物品分类。
   左右手标签同时存在时，可进任一手；同一模板允许左右手各一件。 */
function decideAndEquip(charObj, tpl, instance){
  const eq = charObj.equipment;
  if(charObj.isPet){
    if(tpl.type !== 'accessory'){ toast('宠物只能携带 1 件项链'); return false; }
    if(eq.accessory && !_returnToBag(eq.accessory)){ toast('行囊空间不足'); return false; }
    eq.accessory = instance;
    return true;
  }
  const slots = (typeof getItemEquipSlots === 'function') ? getItemEquipSlots(tpl) : [getItemEquipSlot(tpl)].filter(Boolean);
  if(!slots.length){ toast('该装备没有可装备的槽位标签'); return false; }
  const hasMain = slots.indexOf('mainHand') >= 0;
  const hasOff = slots.indexOf('offHand') >= 0;
  if(tpl.twoHanded || (Array.isArray(tpl.tags) && tpl.tags.indexOf('tag080') >= 0)){
    if(!_returnToBag(eq.mainHand) || !_returnToBag(eq.offHand)){ toast('行囊空间不足'); return false; }
    eq.mainHand = instance; eq.offHand = null;
    return true;
  }
  if(hasMain && hasOff){
    /* 左右手都可：优先空手；右手是双手武器时先清左手 */
    if(eq.mainHand && EQUIPS[eq.mainHand.id] && EQUIPS[eq.mainHand.id].twoHanded){
      if(!_returnToBag(eq.mainHand)){ toast('行囊空间不足'); return false; }
      eq.mainHand = null; eq.offHand = null;
    }
    if(!eq.mainHand){ eq.mainHand = instance; return true; }
    if(!eq.offHand){ eq.offHand = instance; return true; }
    if(!_returnToBag(eq.mainHand)){ toast('行囊空间不足'); return false; }
    eq.mainHand = instance;
    return true;
  }
  if(hasMain){
    if(eq.mainHand && EQUIPS[eq.mainHand.id] && EQUIPS[eq.mainHand.id].twoHanded){
      eq.offHand = null;
    }
    if(!_returnToBag(eq.mainHand)){ toast('行囊空间不足'); return false; }
    eq.mainHand = instance;
    return true;
  }
  if(hasOff){
    if(eq.mainHand && EQUIPS[eq.mainHand.id] && EQUIPS[eq.mainHand.id].twoHanded){
      toast('双手武器占用左手，请先卸下'); return false;
    }
    if(!_returnToBag(eq.offHand)){ toast('行囊空间不足'); return false; }
    eq.offHand = instance;
    return true;
  }
  const s = slots[0];
  if(!_returnToBag(eq[s])){ toast('行囊空间不足'); return false; }
  eq[s] = instance;
  return true;
}

/* 卸下指定槽位（保留磨损/耐久回行囊） */
function unequipSlot(charObj, slot){
  const held = charObj.equipment[slot];
  if(!held) return;
  if(!addItemToBag(held.id, held.wear, held.durability, held)){ toast('行囊空间不足，无法卸下'); return; }
  charObj.equipment[slot] = null;
  const pruned = (typeof pruneEquippedSkills === 'function') && pruneEquippedSkills(charObj);
  saveGame();
  const itemName = EQUIPS[held.id] ? EQUIPS[held.id].name : held.id;
  toast(pruned ? ('已卸下 ' + itemName + '，它赋予的技能已从技能槽移除') : ('已卸下 ' + itemName));
  updateAllUI();
  renderBag();
}

function bagEquipItemByIdx(realIdx){
  const invItem = currentGame.bag[realIdx];
  if(!invItem) return;
  const tpl = EQUIPS[invItem.id];
  if(!tpl) return;
  const charObj = getCharObj(selectedBagChar);
  if(!charObj.equipment) charObj.equipment = makeEmptyEquipment();
  const wornSlots = EQUIP_SLOTS.filter(s => charObj.equipment[s] && charObj.equipment[s].id === invItem.id);
  if(wornSlots.length){
    /* 左右手同模板：还有空手时允许再装一件；两只手都满才卸下 */
    const slots = (typeof getItemEquipSlots === 'function') ? getItemEquipSlots(tpl) : [getItemEquipSlot(tpl)].filter(Boolean);
    const hasFreeSlot = slots.some(s => !charObj.equipment[s]);
    if(!hasFreeSlot || tpl.twoHanded){ unequipSlot(charObj, wornSlots[0]); return; }
  }
  if(!['weapon','armor','accessory','shield','focus'].includes(tpl.type)) return;
  if(charObj.isPet && tpl.type !== 'accessory'){ toast('宠物只能携带 1 件项链'); return; }
  /* 等级限制 */
  const charLevel = charObj.level || 1;
  if(tpl.level && charLevel < tpl.level){
    toast('需要等级 ' + tpl.level + '（当前 ' + charLevel + '）'); return;
  }
  /* 职业限制：命中任意一个职业标签即可 */
  if(!charObj.isPet && tpl.classLimit && tpl.classLimit.length > 0){
    if(!(typeof charHasAnyClassTag === 'function' ? charHasAnyClassTag(charObj, tpl.classLimit) : getCharClasses(charObj).some(c => tpl.classLimit.includes(c)))){
      toast('需要职业：' + tpl.classLimit.map(c => (typeof maskClassName === 'function' ? maskClassName(c) : c)).join(' / ')); return;
    }
  }
  /* 构建装备实例（保留当前品阶 / 进阶词条 / 磨损） */
  const instance = (typeof createItemInstance === 'function') ? createItemInstance(tpl, invItem.id) : { id:invItem.id };
  if(invItem.rarity) instance.rarity = invItem.rarity;
  if(Array.isArray(invItem.words)) instance.words = JSON.parse(JSON.stringify(invItem.words));
  if(tpl.maxWear) instance.wear = getItemWear(invItem, tpl);
  if(tpl.durability) instance.durability = getItemDur(invItem, tpl);
  if(!decideAndEquip(charObj, tpl, instance)) return;
  /* 从行囊扣除一件 */
  invItem.count--;
  if(invItem.count <= 0) currentGame.bag.splice(realIdx, 1);
  saveGame();
  toast('已装备 ' + tpl.name);
  updateAllUI();
  renderBag();
}

/* 即时道具（战斗外）：记录到下一场战斗开局生效 */
function queueInstantItem(tpl, inv, effects){
  currentGame.pendingItemBuffs = currentGame.pendingItemBuffs || [];
  currentGame.pendingItemBuffs.push({ name:tpl.name, effects:effects || getItemEffects(tpl) });
  if(inv){
    inv.count--;
    if(inv.count <= 0) currentGame.bag = currentGame.bag.filter(b => b.count > 0);
  }
  updateAllUI(); renderBag();
  toast(`${tpl.name} 已使用，下一场战斗开始时生效`);
}

/* 窥探镜：当前地图格内非隐藏角色的成长与全部被动 */
function useInspectMirror(tpl, inv){
  const tile = (typeof getCurrentTile === 'function') ? getCurrentTile() : null;
  if(!tile){ toast('当前没有可查看的地图格'); return; }
  const actors = (typeof buildTileActors === 'function') ? buildTileActors(tile) : [];
  const visible = actors.filter(a => a && !a.hidden);
  if(!visible.length){ toast('当前地图格没有可查看的角色'); return; }
  const entries = visible.map(a => {
    const c = (typeof getNpc === 'function' ? getNpc(a.charId) : null) || getCharacterTemplate(a.charId);
    if(!c) return null;
    const classes = (typeof getCharClasses === 'function') ? getCharClasses(c) : (c.classes || []);
    const classPassives = classes.filter(cls => typeof PASSIVE_SKILLS !== 'undefined' && PASSIVE_SKILLS[cls]).map(cls => ({
      name: PASSIVE_SKILLS[cls].name,
      text: (typeof describeEffects === 'function') ? describeEffects(PASSIVE_SKILLS[cls].effects || []) : '被动效果',
      src: cls
    }));
    const personal = (Array.isArray(c.personalPassives) ? c.personalPassives : []).map(p => ({
      name: p.name || '未命名被动',
      text: (typeof describeEffects === 'function') ? describeEffects(p.effects || []) : '被动效果',
      src: '个性化'
    }));
    return {
      name: c.name || a.charId,
      gv: (c.growth && c.growth.vit),
      gs: (c.growth && c.growth.spi),
      passives: classPassives.concat(personal)
    };
  }).filter(Boolean);
  if(!entries.length){ toast('当前地图格没有可查看的角色'); return; }
  showInspectMirrorModal(tile.name || '当前地图格', entries);
  if(inv){
    inv.count--;
    if(inv.count <= 0) currentGame.bag = currentGame.bag.filter(b => b.count > 0);
  }
  saveGame();
  updateAllUI();
  renderBag();
}

function showInspectMirrorModal(tileName, entries){
  const old = document.getElementById('inspectMirrorModal');
  if(old) old.remove();
  const fmt = v => (v == null || v === '') ? '—' : (Math.round(Number(v) * 100) / 100);
  const body = entries.map(e => {
    const passives = e.passives.length
      ? e.passives.map(p => `${debugEsc(p.name)}：${debugEsc(p.text)}（${debugEsc(p.src)}）`).join('<br>')
      : '无';
    return `<div style="padding:10px 0;border-bottom:1px dashed rgba(153,102,255,.2)">
      <div style="color:#ffcc66;font-weight:700;margin-bottom:4px">${debugEsc(e.name)}</div>
      <div style="color:#bdb4d8;font-size:13px">体力成长：${fmt(e.gv)}　精神成长：${fmt(e.gs)}</div>
      <div style="color:#d8ccff;font-size:13px;margin-top:6px">被动：</div>
      <div style="color:#bdb4d8;font-size:13px;line-height:1.8">${passives}</div>
    </div>`;
  }).join('');
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay show';
  overlay.id = 'inspectMirrorModal';
  overlay.innerHTML = `<div class="modal" style="max-width:620px">
    <span class="modal-close" onclick="document.getElementById('inspectMirrorModal').remove()">×</span>
    <h3>窥探镜 · ${debugEsc(tileName)}</h3>
    <div style="max-height:60vh;overflow-y:auto">${body}</div>
  </div>`;
  overlay.addEventListener('click', ev => { if(ev.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

/* 使用消耗品：优先玩家，玩家满了自动找最需要的队友 */
function bagUseItem(itemId){
  const inv = currentGame.bag.find(b => b.id === itemId);
  const tpl = EQUIPS[itemId];
  if(!inv || inv.count <= 0 || !tpl) return;

  const effects = getItemEffects(tpl);
  /* 功法书：学习技能，不看职业限制；已学则不消耗 */
  const learnEff = effects.find(e => e && e.type === 'learn_skill');
  if(learnEff){
    const sid = learnEff.skillId;
    const sk = sid ? SKILLS[sid] : null;
    if(!sk){ toast('这本功法没有配置技能'); return; }
    const target = getCharObj(selectedBagChar) || currentGame;
    if(target.skillProficiency && target.skillProficiency[sid] !== undefined){
      toast(`【${target.name || '角色'}】已经学会「${sk.name}」`);
      return;
    }
    showConfirm('学习技能', `让【${target.name || '角色'}】学习「${sk.name}」？`, () => {
      if(!target.skillProficiency) target.skillProficiency = {};
      target.skillProficiency[sid] = 0;
      inv.count--;
      if(inv.count <= 0) currentGame.bag = currentGame.bag.filter(b => b.count > 0);
      saveGame();
      toast(`学会了「${sk.name}」`);
      updateAllUI(); renderBag();
    });
    return;
  }

  /* 转职道具：直接改变职业，不进入战斗队列 */
  const classEff = effects.find(e => e && e.type === 'change_class');
  if(classEff){
    useClassChangeItem(tpl, inv, classEff);
    return;
  }

  /* 即时道具：场景内立即结算，不进战斗队列 */
  const inspectEff = effects.find(e => e && e.type === 'inspect_tile_characters');
  if(inspectEff){ useInspectMirror(tpl, inv); return; }
  if(getItemCategory(tpl) === 'instant'){
    const target = getCharObj(selectedBagChar) || currentGame;
    const result = doConsume(target, tpl);
    if(!result.ok){ toast('该道具当前无法使用'); return; }
    inv.count--;
    if(inv.count <= 0) currentGame.bag = currentGame.bag.filter(b => b.count > 0);
    saveGame();
    updateAllUI();
    renderBag();
    toast(`${target.name || '你'} ${result.parts.join('，')}`);
    return;
  }

  const maxHpTotal = getFinalMaxHp(currentGame);
  const maxMpTotal = getFinalMaxMp(currentGame);
  const hasHp = effects.some(e => e.type === 'hp_heal' || e.type === 'hp_heal_pct');
  const hasMp = effects.some(e => e.type === 'mp_heal' || e.type === 'mp_heal_pct');
  /* 即时道具：非恢复类效果统一记录到下一场战斗开局生效 */
  const healTypes = ['hp_heal','hp_heal_pct','mp_heal','mp_heal_pct'];
  const hasOther = effects.some(e => healTypes.indexOf(e.type) < 0);
  if(getItemCategory(tpl) === 'instant' && hasOther){
    queueInstantItem(tpl, inv, effects);
    return;
  }
  if(!hasHp && !hasMp){ toast('该道具需要在战斗中使用'); return; }
  const playerNeedsHp = hasHp && currentGame.hp < maxHpTotal;
  const playerNeedsMp = hasMp && currentGame.mp < maxMpTotal;

  /* 玩家自己能用就用在自己身上 */
  if(playerNeedsHp || playerNeedsMp){
    applyConsumableTo(currentGame, tpl, inv);
    return;
  }

  /* 玩家自己满了 → 找最需要的队友 */
  const ally = findAllyNeedingConsumable(tpl);
  if(!ally){ toast('没有人需要使用该物品'); return; }
  applyConsumableTo(ally, tpl, inv);
}

/* 转职道具：改成目标职业，并自动学会该职业的第一个技能 */
function useClassChangeItem(tpl, inv, eff){
  const cid = eff && eff.classId;
  if(!cid){ toast('这个道具没有配置转职职业'); return; }
  const target = getCharObj(selectedBagChar) || currentGame;
  if(!Array.isArray(target.classes)) target.classes = ['',''];
  if(target.classes.includes(cid)){ toast(`【${target.name || '角色'}】已经是「${cid}」`); return; }
  showConfirm('转职', `让【${target.name || '角色'}】转职为「${cid}」？`, () => {
    if(!Array.isArray(target.classes)) target.classes = ['',''];
    if(!target.classes[0]) target.classes[0] = cid;
    else if(!target.classes[1]) target.classes[1] = cid;
    else target.classes[0] = cid;   /* 两个职业都满：替换槽位 1 */
    if(!target.skillProficiency) target.skillProficiency = {};
    const list = (typeof CLASS_ACTIVE_SKILLS !== 'undefined' && Array.isArray(CLASS_ACTIVE_SKILLS[cid]))
      ? CLASS_ACTIVE_SKILLS[cid].filter(id => SKILLS[id])
      : [];
    const first = (list.length ? SKILLS[list[0]] : null) || Object.values(SKILLS).find(s => s.classLimit === cid);
    if(first && target.skillProficiency[first.id] === undefined){
      target.skillProficiency[first.id] = 0;
      if(!target.equippedSkills) target.equippedSkills = [null,null,null,null];
      const empty = target.equippedSkills.indexOf(null);
      if(empty >= 0) target.equippedSkills[empty] = first.id;
    }
    inv.count--;
    if(inv.count <= 0) currentGame.bag = currentGame.bag.filter(b => b.count > 0);
    saveGame();
    toast(`转职成功：${cid}${first ? '，学会「' + first.name + '」' : ''}`);
    updateAllUI();
    renderBag();
  });
}

function findAllyNeedingConsumable(tpl){
  const q = currentGame.queue;
  const seen = new Set();
  const ids = [];
  ['front','back','rest'].forEach(r => q[r].forEach(id => {
    if(id && id !== 'player' && !seen.has(id)){ seen.add(id); ids.push(id); }
  }));
  const effects = getItemEffects(tpl);
  const hasHp = effects.some(e => e.type === 'hp_heal' || e.type === 'hp_heal_pct');
  const hasMp = effects.some(e => e.type === 'mp_heal' || e.type === 'mp_heal_pct');
  let best = null, bestScore = 0;
  ids.forEach(id => {
    const npc = getNpc(id);
    if(!npc) return;
    let score = 0;
    if(hasHp && npc.hp < npc.maxHp) score += (npc.maxHp - npc.hp);
    if(hasMp && npc.mp < npc.maxMp) score += (npc.maxMp - npc.mp) * 0.5;
    if(score > bestScore){ bestScore = score; best = npc; }
  });
  return best;
}

/* 执行消耗品效果（战场 / 行囊共用）
   参数 target：目标角色（currentGame 或 NPC 对象）
        tpl   ：消耗品模板
   返回 { ok, parts }
     - ok=false 表示没有效果（目标 HP / MP 已满）
     - parts 是恢复描述数组，如 ['恢复 20 HP', '恢复 10 MP']
   注意：本函数不扣 inv.count、不弹提示，由调用方决定 */
function doConsume(target, tpl){
  if(!target || !tpl) return {ok:false, parts:[]};
  const isPlayer = target === currentGame;
  const maxHp = isPlayer ? getFinalMaxHp(currentGame) : (target.maxHp || 0);
  const maxMp = isPlayer ? getFinalMaxMp(currentGame) : (target.maxMp || 0);
  const parts = [];
  getItemEffects(tpl).forEach(e => {
    if(e.type === 'hp_heal'){
      const before = target.hp;
      target.hp = Math.min(maxHp, target.hp + (Number(e.value) || 0));
      const healed = target.hp - before;
      if(healed > 0) parts.push(`恢复 ${healed} HP`);
    }else if(e.type === 'hp_heal_pct'){
      const before = target.hp;
      target.hp = Math.min(maxHp, target.hp + Math.floor(maxHp * (Number(e.value) || 0) / 100));
      const healed = target.hp - before;
      if(healed > 0) parts.push(`恢复 ${healed} HP`);
    }else if(e.type === 'mp_heal'){
      const before = target.mp;
      target.mp = Math.min(maxMp, target.mp + (Number(e.value) || 0));
      const healed = target.mp - before;
      if(healed > 0) parts.push(`恢复 ${healed} MP`);
    }else if(e.type === 'mp_heal_pct'){
      const before = target.mp;
      target.mp = Math.min(maxMp, target.mp + Math.floor(maxMp * (Number(e.value) || 0) / 100));
      const healed = target.mp - before;
      if(healed > 0) parts.push(`恢复 ${healed} MP`);
    }else if(e.type === 'gain_gold'){
      const gain = Math.max(0, Number(e.value) || 0);
      if(gain > 0){ currentGame.money += gain; parts.push(`获得 ${gain} 金币`); }
    }else if(e.type === 'exp_potion'){
      const gain = Math.max(0, Number(e.value) || 0);
      if(gain > 0){
        target.exp = (target.exp || 0) + gain;
        parts.push(`获得 ${gain} 经验`);
        while(target.exp >= (target.expMax || calcExpMax(target.level || 1))){
          target.expMax = target.expMax || calcExpMax(target.level || 1);
          target.exp -= target.expMax;
          target.level = (target.level || 1) + 1;
          target.expMax = calcExpMax(target.level);
          if(typeof applyGrowth === 'function') applyGrowth(target);
          parts.push(`升到 Lv.${target.level}`);
        }
      }
    }else if(e.type === 'perm_vit_up'){
      const gain = Number(e.value) || 0;
      if(gain !== 0){
        target.base = target.base || {};
        target.base.vit = (Number(target.base.vit) || 0) + gain;
        parts.push(`永久体力 +${gain}`);
      }
    }else if(e.type === 'perm_spi_up'){
      const gain = Number(e.value) || 0;
      if(gain !== 0){
        target.base = target.base || {};
        target.base.spi = (Number(target.base.spi) || 0) + gain;
        parts.push(`永久精神力 +${gain}`);
      }
    }else if(e.type === 'perm_hp_up'){
      const gain = Number(e.value) || 0;
      if(gain !== 0){
        target.extraMaxHp = (Number(target.extraMaxHp) || 0) + gain;
        parts.push(`额外生命上限 +${gain}`);
      }
    }else if(e.type === 'perm_mp_up'){
      const gain = Number(e.value) || 0;
      if(gain !== 0){
        target.extraMaxMp = (Number(target.extraMaxMp) || 0) + gain;
        parts.push(`额外魔力上限 +${gain}`);
      }
    }
  });
  if(parts.length && target){
    target.maxHp = getFinalMaxHp(target);
    target.maxMp = getFinalMaxMp(target);
  }
  return {ok: parts.length > 0, parts};
}

function applyConsumableTo(charObj, tpl, inv){
  const result = doConsume(charObj, tpl);
  if(!result.ok){ toast('不需要使用该物品'); return; }
  inv.count--;
  if(inv.count <= 0) currentGame.bag = currentGame.bag.filter(b => b.count > 0);
  updateAllUI();
  renderBag();
  const who = (charObj === currentGame) ? '你' : charObj.name;
  toast(`${who} ${result.parts.join('，')}`);
}

function renderBagSkill(){
  const body = document.getElementById('bagSkillBody');
  const charObj = getCharObj(selectedBagChar);
  if(!charObj) return;
  /* 装备换下后残留的技能槽先清干净 */
  if(typeof pruneEquippedSkills === 'function') pruneEquippedSkills(charObj);
  const equipped = charObj.equippedSkills || [null,null,null,null];
  const countEl = document.getElementById('bagSkillCount');
  const equippedCount = equipped.filter(x => x).length;
  if(countEl) countEl.textContent = `${equippedCount}/4`;

  const slotsEl = document.getElementById('bagSkillSlots');
  if(slotsEl){
    slotsEl.innerHTML = equipped.map((sid, i) => {
      if(!sid) return `<div class="bag-skill-slot empty"><span class="bss-idx">${i+1}</span><span class="bss-name">空技能槽</span></div>`;
      const sk = SKILLS[sid];
      if(!sk) return `<div class="bag-skill-slot empty"><span class="bss-idx">${i+1}</span><span class="bss-name">空技能槽</span></div>`;
      return `<div class="bag-skill-slot"><span class="bss-idx">${i+1}</span><span class="bss-name">${sk.name}</span><button class="bss-x" title="卸下" onclick="toggleEquipSkill('${sid}')">×</button></div>`;
    }).join('');
  }

  body.innerHTML = `
    <div class="bag-toolbar">
      <input type="text" id="bagSkillSearch" placeholder="搜索技能..." value="${bagSkillKeyword}" oninput="onBagSkillSearch(this.value)">
    </div>
    <div id="bagSkillList"></div>
  `;
  renderBagSkillList();
}

function onBagSkillSearch(val){
  bagSkillKeyword = val || '';
  renderBagSkillList();
}

function renderBagSkillList(){
  const listEl = document.getElementById('bagSkillList');
  if(!listEl) return;
  const charObj = getCharObj(selectedBagChar);
  const equipped = charObj.equippedSkills || [null,null,null,null];
  /* 已学 = 熟练度表（转职/功法书）+ 装备当前赋予的技能 */
  const learned = (typeof getKnownSkillIds === 'function')
    ? getKnownSkillIds(charObj)
    : (charObj.skillProficiency ? Object.keys(charObj.skillProficiency) : []);
  const eqStats = (typeof calcEquipStats === 'function') ? calcEquipStats(charObj) : { grantedSkills: [] };
  const eqGranted = {};
  (eqStats.grantedSkills || []).forEach(id => { eqGranted[id] = 1; });
  const curClasses = getCharClasses(charObj);
  const unitRef = charObj === currentGame ? {isPlayer:true} : {npcId:charObj.id};
  const unitRefStr = charObj === currentGame ? '{isPlayer:true}' : `{npcId:'${charObj.id}'}`;
  const kw = (bagSkillKeyword || '').toLowerCase().trim();

  if(learned.length === 0){
    listEl.innerHTML = '<div class="bag-empty">暂无已学技能</div>';
    return;
  }

  const groups = {};
  learned.forEach(sid => {
    const s = SKILLS[sid];
    if(!s) return;
    if(kw && !s.name.toLowerCase().includes(kw) && !s.classLimit.toLowerCase().includes(kw)) return;
    if(!groups[s.classLimit]) groups[s.classLimit] = [];
    groups[s.classLimit].push(sid);
  });

  if(Object.keys(groups).length === 0){
    listEl.innerHTML = '<div class="bag-empty">没有匹配的技能</div>';
    return;
  }

  let html = '';
  Object.keys(groups).forEach(cls => {
    /* 只有九大职业才判定「职业不匹配」；种族技能（人/兽等）对所有人开放 */
    const isClassSkill = ((typeof PLAYER_CLASSES !== 'undefined') && PLAYER_CLASSES.indexOf(cls) >= 0)
      || (typeof PASSIVE_SKILLS !== 'undefined' && PASSIVE_SKILLS[cls] && PASSIVE_SKILLS[cls].hidden);
    const matched = !isClassSkill || curClasses.includes(cls);
    const headCls = matched ? 'skill-group-head' : 'skill-group-head mismatch';
    const statusTag = matched ? '' : ' <span style="color:#ff6688;font-size:11.5px">（职业不匹配）</span>';
    /* 默认为收起状态 */
    let isOpen = (bagSkillGroupOpenMap[cls] !== undefined) ? bagSkillGroupOpenMap[cls] : false;
    const openCls = isOpen ? ' open' : '';
    const clsEsc = String(cls).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    html += `<div class="skill-group${openCls}">
      <div class="${headCls}" onclick="toggleSkillGroup(this,'${clsEsc}')">
        <span>${cls}${statusTag}</span>
        <span class="sgh-count">${groups[cls].length} 个 <span class="sgh-arrow">${isOpen ? '▼' : '▶'}</span></span>
      </div>
      <div class="skill-group-body">`;
    groups[cls].forEach(sid => {
      const s = SKILLS[sid];
      const isEquipped = equipped.includes(sid);
      const lv = getSkillLevel(unitRef, sid);
      html += `<div class="bag-item">
        <div style="flex:1;min-width:0">
          <div class="bag-item-name"><span class="eq-clickable" onclick="showSkillDetail('${sid}', ${unitRefStr})">${s.name}</span> ${skillLevelText(s, lv)}${(eqGranted[sid] && !(charObj.skillProficiency && charObj.skillProficiency[sid] !== undefined)) ? ' <span class="tag-mini" style="color:#66d9ff">装备</span>' : ''}</div>
          <div class="bag-item-desc">MP${s.levels[lv-1] ? s.levels[lv-1].mpCost : '?'}</div>
        </div>
        <div class="bag-item-actions">
          <button class="bag-item-btn${isEquipped ? ' equipped' : ''}" ${matched ? '' : 'disabled'} onclick="toggleEquipSkill('${sid}')">${isEquipped ? '卸下' : '装备'}</button>
        </div>
      </div>`;
    });
    html += `</div></div>`;
  });
  listEl.innerHTML = html;
}

function toggleSkillGroup(el, cls){
  const isOpen = el.parentElement.classList.toggle('open');
  bagSkillGroupOpenMap[cls] = isOpen;
  const arrow = el.querySelector('.sgh-arrow');
  if(arrow) arrow.textContent = isOpen ? '▼' : '▶';
}

function toggleEquipSkill(skillId){
  const charObj = getCharObj(selectedBagChar);
  const sk = SKILLS[skillId];
  const curClasses = getCharClasses(charObj);
  /* 只有九大职业技能受职业限制；人类/野兽/魔兽等种族技能任何人都能装 */
  const isClassSkill = ((typeof PLAYER_CLASSES !== 'undefined') && PLAYER_CLASSES.indexOf(sk.classLimit) >= 0)
    || (typeof PASSIVE_SKILLS !== 'undefined' && PASSIVE_SKILLS[sk.classLimit] && PASSIVE_SKILLS[sk.classLimit].hidden);
  if(isClassSkill && !(typeof charHasAnyClassTag === 'function' ? charHasAnyClassTag(charObj, [sk.classLimit]) : curClasses.includes(sk.classLimit))){ toast(`需要职业：${sk.classLimit}`); return; }
  if(!charObj.equippedSkills) charObj.equippedSkills = [null,null,null,null];
  const idx = charObj.equippedSkills.indexOf(skillId);
  if(idx >= 0){
    charObj.equippedSkills[idx] = null;
    toast('已卸下技能');
    renderBag();
    return;
  }
  const emptyIdx = charObj.equippedSkills.indexOf(null);
  if(emptyIdx < 0){ toast('技能槽已满（4/4）'); return; }
  charObj.equippedSkills[emptyIdx] = skillId;
  toast('已装备技能');
  renderBag();
}

/* ============================================================
   七、着装总览
   ============================================================ */

function openGear(){
  const el = document.getElementById('gearContent');
  const q = currentGame.queue;
  const charIds = ['player'];
  ['front','back','rest'].forEach(r => q[r].forEach(c => {
    if(c && c !== 'player' && !charIds.includes(c)) charIds.push(c);
  }));
  /* 已出战宠物也进入着装表，单独标记 */
  const _pets = currentGame.pets || {};
  ['front','back'].forEach(slot => {
    if(_pets[slot] && !charIds.includes(_pets[slot])) charIds.push(_pets[slot]);
  });
  if(charIds.length === 0){
    el.innerHTML = '<div class="quest-empty">队列中暂无角色</div>';
  }else{
    el.innerHTML = charIds.map(id => {
      const c = getChar(id);
      const charObj = getCharObj(id);
      const skills = charObj.equippedSkills || [null,null,null,null];
      const classStr = charObj && charObj.isPet ? '宠物' : ((c.classes && c.classes.filter(x => x).join('·')) || c.class || '无');
      const isOpen = expandedGearChar === id;
      return `<div class="gear-row${charObj && charObj.isPet ? ' pet-gear' : ''}">
        <div class="gear-head" onclick="toggleGearExpand('${id}')">
          <span class="gear-name">${c.name} <span style="color:#9966ff;font-size:12.5px;font-weight:400">Lv.${c.level}</span> <span class="gear-class">${classStr}</span></span>
          <span class="gear-arrow">${isOpen ? '▲' : '▼'}</span>
        </div>
        <div class="gear-body ${isOpen ? 'open' : ''}">
          <div style="color:#667;font-size:11px;margin-bottom:3px">装备${charObj && charObj.isPet ? '（仅 1 件项链）' : ''}</div>
          <div class="gear-pd">${charObj && charObj.isPet ? petPaperdollGrid(id) : paperdollGrid(id)}</div>
          <div style="color:#667;font-size:11px;margin:6px 0 3px">技能</div>
          <div class="gear-skills">
            ${skills.map(sid => {
              const s = sid ? SKILLS[sid] : null;
              if(!s) return `<div class="gear-skill empty">—</div>`;
              const refStr = (id === 'player') ? '{isPlayer:true}' : `{npcId:'${id}'}`;
              return `<div class="gear-skill"><span class="eq-clickable" onclick="event.stopPropagation();showSkillDetail('${sid}', ${refStr})">${s.name}</span></div>`;
            }).join('')}
          </div>
        </div>
      </div>`;
    }).join('');
  }
  document.getElementById('gearModal').classList.add('show');
}
function closeGearModal(){
  document.getElementById('gearModal').classList.remove('show');
  expandedGearChar = null;
}
function toggleGearExpand(id){
  expandedGearChar = expandedGearChar === id ? null : id;
  openGear();
}

/* ============================================================
   八、任务面板
   ============================================================ */

function openQuest(){
  const el = document.getElementById('questContent');
  if(typeof LINES === 'undefined' || !currentGame.lineState){
    el.innerHTML = '<div class="empty-hint">暂无剧情</div>';
    return;
  }

  /* 收集所有进行中和已完成的剧情线 */
  const storyList = [], sideList = [];
  for(const lineId in LINES){
    const line = LINES[lineId];
    const st = currentGame.lineState[lineId];
    if(!st) continue; /* 没触发过的不显示，保留神秘感 */
    const entry = {
      id: lineId,
      title: line.title,
      stage: st.nodeIdx,
      status: st.status,
      type: line.type,
      giver: line.giver
    };
    if(line.type === 'side') sideList.push(entry);
    else storyList.push(entry);
  }

  /* 从 title 提取章节前缀分组 */
  const chapterOf = (title) => {
    const m = (title||'').match(/^(第[一二三四五六七八九十\d]+章[：:].*?)(?=·|$)/);
    return m ? m[1] : (title || '其他');
  };

  /* 渲染一条剧情（可折叠，点标题展开节点进度） */
  const renderLine = (m, hasActive) => {
    const def = LINES[m.id];
    const done = m.status === 'done';
    const invalid = m.status === 'invalid';
    let nodesHtml = '';
    nodesHtml = (def.nodes||[]).map((n, i) => {
      let mark = '○';
      let color = '#667';
      if(i < m.stage){ mark = '✓'; color = '#66ff99'; }
      else if(i === m.stage && !done && !invalid){ mark = '●'; color = '#ffcc66'; }
      else return ''; /* 未开始的不显示 */
      const hint = n.hint || '触发推进';
      return `<div style="font-size:12.5px;color:${color};padding:2px 0 2px 16px">${mark} ${hint}</div>`;
    }).join('');
    const lineId = 'qline_' + m.id.replace(/[^a-zA-Z0-9]/g, '_');
    const statusText = invalid ? '<span style="color:#ff6688;font-size:11.5px;margin-left:6px">已中断</span>' : '';
    return `<div class="quest-item" style="${done?'opacity:.7':''}${invalid?';opacity:.55':''}">
      <div class="quest-item-title" onclick="toggleQuestSection('${lineId}')" style="cursor:pointer">${done?'✓ ':''}${invalid?'⚠ ':''}${m.title || '剧情'}${statusText} <span class="arrow" style="font-size:11.5px">${hasActive?'▼':'▶'}</span></div>
      <div id="${lineId}" style="display:${hasActive?'block':'none'}">${nodesHtml}${invalid?'<div style="font-size:12.5px;color:#ff8899;padding:2px 0 2px 16px">相关角色已离世，该剧情不再推进</div>':''}</div>
    </div>`;
  };

  /* 主线按章节分组 */
  const storyGroups = {};
  storyList.forEach(m => {
    const c = chapterOf(m.title);
    if(!storyGroups[c]) storyGroups[c] = [];
    storyGroups[c].push(m);
  });

  /* 支线按NPC名字分组 */
  const sideGroups = {};
  sideList.forEach(m => {
    const _giver = m.giver && typeof getCharacterTemplate === 'function' ? getCharacterTemplate(m.giver) : null;
    const npcName = _giver ? _giver.name : '其他NPC';
    if(!sideGroups[npcName]) sideGroups[npcName] = [];
    sideGroups[npcName].push(m);
  });

  /* 渲染分组（每组也是可折叠） */
  const renderGroups = (groups, prefix) => {
    return Object.keys(groups).map((c, idx) => {
      const gid = prefix + '_g' + idx;
      return `<div style="margin:6px 0">
        <div onclick="toggleQuestSection('${gid}')" style="color:#ffcc66;font-size:13.5px;font-weight:bold;cursor:pointer;padding:3px 0">▎${c} <span class="arrow" style="font-size:11.5px">▶</span></div>
        <div id="${gid}" style="display:none">
          ${groups[c].map(m => renderLine(m, m.status !== 'done' && m.status !== 'invalid' && m.stage < LINES[m.id].nodes.length)).join('')}
        </div>
      </div>`;
    }).join('');
  };

  el.innerHTML = `
    <div class="quest-section" id="qs_story">
      <div class="quest-section-title" onclick="toggleQuestSection('qs_story')"><span>主线剧情</span><span class="arrow">▶</span></div>
      <div class="quest-section-body">${storyList.length === 0 ? '<div class="quest-empty">暂无主线剧情</div>' : renderGroups(storyGroups, 'story')}</div>
    </div>
    <div class="quest-section" id="qs_side">
      <div class="quest-section-title" onclick="toggleQuestSection('qs_side')"><span>支线剧情</span><span class="arrow">▶</span></div>
      <div class="quest-section-body">${sideList.length === 0 ? '<div class="quest-empty">暂无支线剧情</div>' : renderGroups(sideGroups, 'side')}</div>
    </div>`;
  document.getElementById('questModal').classList.add('show');
}
function closeQuestModal(){ document.getElementById('questModal').classList.remove('show'); }
function toggleQuestSection(id){
  const el = document.getElementById(id);
  if(!el) return;
  let open;
  if(el.classList.contains('quest-section')){
    /* 外层分区：靠 .open 类控制 body 显示 */
    open = el.classList.toggle('open');
    const arrow = el.querySelector('.quest-section-title .arrow');
    if(arrow) arrow.textContent = open ? '▼' : '▶';
  }else{
    /* 内层分组：内联 display 控制 */
    open = el.style.display === 'none';
    el.style.display = open ? 'block' : 'none';
    const title = el.previousElementSibling;
    const arrow = title && title.querySelector('.arrow');
    if(arrow) arrow.textContent = open ? '▼' : '▶';
  }
}

function showAbout(){ document.getElementById('aboutModal').classList.add('show'); }
function closeAbout(){ document.getElementById('aboutModal').classList.remove('show'); }

/* ============================================================
   九、转职 / 技能商店
   ============================================================ */

function openClassTrainer(npcId){
  const npc = getNpc(npcId);
  if(!npc) return;
  const cfg = (typeof placementActorConfig === 'function')
    ? placementActorConfig(npcId, currentTalkPlacementId)
    : null;
  if(cfg ? !cfg.services.trainer : !npc.isTrainer) return;
  currentTrainerNpcId = npcId;
  currentTrainerPlacementId = currentTalkPlacementId;
  selectedClassChar = 'player';
  renderClassModal();
  document.getElementById('classModal').classList.add('show');
}
function closeClassModal(){
  document.getElementById('classModal').classList.remove('show');
  selectedClassChar = 'player';
}
function selectClassChar(id){ selectedClassChar = id; renderClassModal(); }

function renderClassModal(){
  const npc = getNpc(currentTrainerNpcId);
  if(!npc) return;
  const _trainerCfg = (typeof placementActorConfig === 'function')
    ? placementActorConfig(currentTrainerNpcId, currentTrainerPlacementId)
    : null;
  const _trainerServices = _trainerCfg ? _trainerCfg.services : {
    professions: npc.professions || [], skillShop: npc.skillShop || []
  };
  document.getElementById('classTrainerName').textContent = npc.name;
  const charIds = ['player'];
  const q = currentGame.queue;
  ['front','back','rest'].forEach(r => q[r].forEach(c => {
    if(c && c !== 'player' && !charIds.includes(c)) charIds.push(c);
  }));
  const targetCharObj = getCharObj(selectedClassChar);
  const targetClasses = getCharClasses(targetCharObj);

  let html = `<div class="class-modal-grid"><div>
    <div style="color:#9966ff;font-size:12.5px;margin-bottom:6px">选择角色</div>
    <div style="display:flex;flex-direction:column;gap:4px;max-height:280px;overflow-y:auto">`;
  charIds.forEach(id => {
    const c = getChar(id);
    const sel = id === selectedClassChar ? ' selected' : '';
    const classStr = (c.classes && c.classes.filter(x => x).join('·')) || c.class || '无';
    html += `<div class="bag-char-slot${sel}" onclick="selectClassChar('${id}')"><div class="bcs-name">${c.name}</div><div class="bcs-lv">Lv.${c.level} · ${classStr}</div></div>`;
  });
  html += `</div></div><div>`;
  html += `<div style="color:#9966ff;font-size:12.5px;margin-bottom:6px">转职 · 资金 ￥${currentGame.money}</div>`;
  (_trainerServices.professions || []).forEach(p => {
    const learned = targetClasses.includes(p.name);
    const canAfford = currentGame.money >= p.cost;
    const disabled = (learned || !canAfford) ? 'disabled' : '';
    html += `<button class="class-opt" ${disabled} onclick="learnProfession('${p.name}',${p.cost})">${learned ? '✓ ' : ''}${p.name}<span class="co-cost">${learned ? '已学' : ('￥' + p.cost)}</span></button>`;
  });
  html += `<div style="color:#667;font-size:11.5px;margin-top:8px;line-height:1.6">职业槽共 2 个。空槽直接装备，满槽弹窗选择替换。</div>`;
  const passives = targetClasses.filter(c => PASSIVE_SKILLS[c]);
  const personalPassives = Array.isArray(targetCharObj.personalPassives) ? targetCharObj.personalPassives : [];
  if(passives.length > 0 || personalPassives.length > 0){
    html += `<div style="color:#66aaff;font-size:12.5px;margin:10px 0 4px;border-top:1px solid rgba(102,170,255,.2);padding-top:8px">当前被动</div>`;
    passives.forEach(cls => {
      html += `<div class="equip-slot passive-slot"><div class="es-label">${cls} · 职业</div><div class="es-name"><span class="eq-clickable" onclick="showPassiveDetail('${cls}')">${PASSIVE_SKILLS[cls].name}</span></div></div>`;
    });
    personalPassives.forEach((p, i) => {
      html += `<div class="equip-slot passive-slot"><div class="es-label">个性化 ${i+1}</div><div class="es-name"><span class="eq-clickable" onclick="showPersonalPassiveDetail('${selectedClassChar}',${i})">${p.name || '未命名被动'}</span></div></div>`;
    });
  }
  const shop = _trainerServices.skillShop || [];
  if(shop.length > 0){
    html += `<div style="color:#9966ff;font-size:12.5px;margin:12px 0 6px;border-top:1px solid rgba(153,102,255,.2);padding-top:10px">技能商店（资金 ￥${currentGame.money}）</div>`;
    html += `<div class="skill-shop-list">`;
    shop.forEach(item => {
      const sid = (typeof item === 'string') ? item : (item && item.id);
      const sk = SKILLS[sid];
      if(!sk) return;
      /* 价格：条目级覆盖优先，否则读技能自身的学习价格 */
      const price = (item && item.price != null) ? Number(item.price) : (Number(sk.price) || 0);
      const owned = targetCharObj.skillProficiency && targetCharObj.skillProficiency[sid] !== undefined;
      const affordable = currentGame.money >= price;
      const classOk = (typeof charHasAnyClassTag === 'function') ? charHasAnyClassTag(targetCharObj, [sk.classLimit]) : targetClasses.includes(sk.classLimit);
      const canBuy = !owned && affordable && classOk;
      let stateText = '';
      let btnText = '购买';
      if(owned){ stateText = '已学'; btnText = '已学'; }
      else if(!classOk){ stateText = `需 ${typeof maskClassName === 'function' ? maskClassName(sk.classLimit) : sk.classLimit}`; btnText = '锁定'; }
      else if(!affordable){ stateText = '资金不足'; btnText = '资金不足'; }
      const lvData = sk.levels[0];
      const effDesc = (typeof describeEffects === 'function') ? describeEffects(lvData.effects) : '';
      const rangeStr = (typeof getRangeText === 'function') ? getRangeText(lvData.effects) : '';
      const refStr = (selectedClassChar === 'player') ? '{isPlayer:true}' : `{npcId:'${selectedClassChar}'}`;
      html += `<div class="skill-shop-row">
        <div class="ssr-info">
          <div class="ssr-name"><span class="eq-clickable" onclick="showSkillDetail('${sid}', ${refStr})">${sk.name}</span> <span class="ssr-class">${typeof maskClassName === 'function' ? maskClassName(sk.classLimit) : sk.classLimit}</span></div>
          <div class="ssr-meta">MP ${lvData.mpCost} · ${rangeStr} · ${stateText || '可学习'}</div>
          <div style="color:#889;font-size:11.5px;margin-top:2px;line-height:1.4">${effDesc}</div>
        </div>
        <div class="ssr-price">￥${price}</div>
        <button class="ssr-btn" ${canBuy ? '' : 'disabled'} onclick="buySkillFromShop('${sid}','${selectedClassChar}',${price})">${btnText}</button>
      </div>`;
    });
    html += `</div>`;
  }
  html += `</div></div>`;
  document.getElementById('classContent').innerHTML = html;
}

function buySkillFromShop(skillId, charId, price){
  selectedClassChar = charId;
  const targetCharObj = getCharObj(charId);
  const targetCharName = getChar(charId).name;
  const sk = SKILLS[skillId];
  if(!sk) return;
  const owned = targetCharObj.skillProficiency && targetCharObj.skillProficiency[skillId] !== undefined;
  if(owned){ toast(`【${targetCharName}】已拥有该技能`); return; }
  if(currentGame.money < price){ toast('资金不足'); return; }
  const targetClasses = getCharClasses(targetCharObj);
  if(!(typeof charHasAnyClassTag === 'function' ? charHasAnyClassTag(targetCharObj, [sk.classLimit]) : targetClasses.includes(sk.classLimit))){ toast(`需要职业：${sk.classLimit}`); return; }
  showConfirm('购买技能', `给【${targetCharName}】购买「${sk.name}」？花费 ￥${price}`, () => {
    buySkill(skillId, price);
  });
}

function learnProfession(name, cost){
  if(currentGame.money < cost){ toast('资金不足'); return; }
  const targetCharObj = getCharObj(selectedClassChar);
  const targetClasses = getCharClasses(targetCharObj);
  if(targetClasses.includes(name)){ toast('已学过该职业'); return; }
  const cls = targetCharObj === currentGame ? currentGame.classes : (targetCharObj.classes || (targetCharObj.classes = ['','']));
  if(!cls[0] || !cls[1]){
    if(!cls[0]) cls[0] = name; else cls[1] = name;
    finishLearnProfession(targetCharObj, name, cost);
  }else{
    pendingLearnProfession = {name, cost, charObj:targetCharObj};
    showClassReplaceDialog(targetCharObj);
  }
}

function finishLearnProfession(targetCharObj, name, cost){
  currentGame.money -= cost;
  if(!targetCharObj.skillProficiency) targetCharObj.skillProficiency = {};
  const activeList = (typeof CLASS_ACTIVE_SKILLS !== 'undefined' && Array.isArray(CLASS_ACTIVE_SKILLS[name]))
    ? CLASS_ACTIVE_SKILLS[name].filter(id => SKILLS[id])
    : [];
  const firstSkill = (activeList.length ? SKILLS[activeList[0]] : null)
    || Object.values(SKILLS).find(s => s.classLimit === name);
  if(firstSkill && targetCharObj.skillProficiency[firstSkill.id] === undefined){
    targetCharObj.skillProficiency[firstSkill.id] = 0;
    if(!targetCharObj.equippedSkills) targetCharObj.equippedSkills = [null,null,null,null];
    const emptyIdx = targetCharObj.equippedSkills.indexOf(null);
    if(emptyIdx >= 0) targetCharObj.equippedSkills[emptyIdx] = firstSkill.id;
    toast(`转职成功：${name}（花费 ￥${cost}），获得技能「${firstSkill.name}」`);
  }else{
    toast(`转职成功：${name}（花费 ￥${cost}）`);
  }
  updateAllUI();
  renderClassModal();
}

function showClassReplaceDialog(charObj){
  const cls = charObj === currentGame ? currentGame.classes : charObj.classes;
  document.getElementById('classReplaceOptions').innerHTML =
    `<button class="class-opt" onclick="confirmReplace(0)">替换槽1：${cls[0] || '空'}</button>
     <button class="class-opt" onclick="confirmReplace(1)">替换槽2：${cls[1] || '空'}</button>`;
  document.getElementById('classReplaceModal').classList.add('show');
}
function closeClassReplace(){
  document.getElementById('classReplaceModal').classList.remove('show');
  pendingLearnProfession = null;
}
function confirmReplace(slotIdx){
  if(!pendingLearnProfession) return;
  const {name, cost, charObj} = pendingLearnProfession;
  const cls = charObj === currentGame ? currentGame.classes : charObj.classes;
  cls[slotIdx] = name;
  closeClassReplace();
  finishLearnProfession(charObj, name, cost);
}

function buySkill(skillId, price){
  if(currentGame.money < price){ toast('资金不足'); return; }
  const targetCharObj = getCharObj(selectedClassChar);
  const targetCharName = getChar(selectedClassChar).name;
  if(targetCharObj.skillProficiency && targetCharObj.skillProficiency[skillId] !== undefined){
    toast(`【${targetCharName}】已拥有该技能`); return;
  }
  const sk = SKILLS[skillId];
  if(!sk){ toast('技能不存在'); return; }
  const targetClasses = getCharClasses(targetCharObj);
  if(!(typeof charHasAnyClassTag === 'function' ? charHasAnyClassTag(targetCharObj, [sk.classLimit]) : targetClasses.includes(sk.classLimit))){ toast(`需要职业：${sk.classLimit}`); return; }
  currentGame.money -= price;
  if(!targetCharObj.skillProficiency) targetCharObj.skillProficiency = {};
  targetCharObj.skillProficiency[skillId] = 0;
  toast(`【${targetCharName}】学会了「${sk.name}」（花费 ￥${price}）`);
  updateAllUI();
  renderClassModal();
}

/* ============================================================
   十、送礼
   ============================================================ */

function renderGiftBody(npc){
  const body = document.getElementById('giftBody');
  if(!body || !npc) return;
  const bagItems = (currentGame.bag || []).filter(it => {
    const tpl = EQUIPS[it.id];
    return tpl && !tpl.noGift;
  });
  const prefHtml = `<div class="gift-pref"><span class="cv-gift-label">偏好礼物</span>${giftTagsHtml(npc)}</div>`;
  if(bagItems.length === 0){
    body.innerHTML = prefHtml + '<div class="quest-empty">行囊里没有可以送的东西</div>';
  }else{
    body.innerHTML = prefHtml + bagItems.map(it => {
      const tpl = EQUIPS[it.id];
      if(!tpl) return '';
      const wStr = it.wear != null ? it.wear : 'null';
      const dStr = it.durability != null ? it.durability : 'null';
      const tagsStr = tpl.tags ? tpl.tags.map(t=>getTagName(t)).join(' · ') : '';
      const delta = getGiftAffinityDelta(tpl);
      const deltaStr = delta
        ? ` <span style="color:${delta > 0 ? '#66ff99' : '#ff6688'}">好感 ${delta > 0 ? '+' : ''}${delta}</span>`
        : '';
      return `<div class="bag-item">
        <div style="flex:1;min-width:0">
          <div class="bag-item-name"><span class="eq-clickable" onclick="event.stopPropagation();showEquipDetail('${it.id}',${wStr},${dStr})">${tpl.name}</span> <span class="count">×${it.count}</span></div>
          <div class="bag-item-desc">${tagsStr}${deltaStr}</div>
        </div>
        <button class="bag-item-btn" onclick="doGift('${npc.id}','${it.id}')">赠送</button>
      </div>`;
    }).join('');
  }
}

function openGiftModal(npcId){
  ensureCharacterState(npcId, currentTalkNpc === npcId ? (currentTalkLevel || 0) : 0);
  const npc = getNpc(npcId);
  if(!npc) return;
  closeViewModal();
  document.getElementById('giftTitle').textContent = `送礼给 ${npc.name}`;
  renderGiftBody(npc);
  document.getElementById('giftModal').classList.add('show');
}
function closeGiftModal(){ document.getElementById('giftModal').classList.remove('show'); }

/* 礼物自带的好感度变化（来自道具 effects 里的 affinity 词条，可正可负） */
function getGiftAffinityDelta(tpl){
  let delta = 0;
  getItemEffects(tpl).forEach(e => {
    if(e && e.type === 'affinity') delta += Number(e.value) || 0;
  });
  return delta;
}

function doGift(npcId, itemId){
  const npc = getNpc(npcId);
  const tpl = EQUIPS[itemId];
  if(!npc || !tpl) return;
  if(tpl.noGift){ toast('这件东西不能送人。'); return; }
  const inv = currentGame.bag.find(b => b.id === itemId);
  if(!inv || inv.count <= 0){ toast('没有该物品'); return; }
  let ruleBonus = 0;
  (npc.giftRules || []).forEach(rule => {
    if(rule.cond === 'classLimit' && (tpl.classLimit || []).includes(rule.value)) ruleBonus += rule.bonus;
    else if(rule.cond === 'price' && (tpl.price || 0) >= rule.min) ruleBonus += rule.bonus;
    else if(rule.cond === 'level' && (tpl.level || 0) >= rule.min) ruleBonus += rule.bonus;
    else if(rule.cond === 'itemId' && itemId === rule.value) ruleBonus += rule.bonus;
    else if(rule.cond === 'tag'){
      const tagId = TAGS[rule.value] ? rule.value : Object.keys(TAGS).find(k => TAGS[k].name === rule.value);
      if(tagId && (tpl.tags || []).includes(tagId)) ruleBonus += rule.bonus;
    }
    else if(rule.cond === 'name_contains' && (tpl.name || '').indexOf(rule.value) >= 0) ruleBonus += rule.bonus;
  });
  /* 词条加成：好感度变化（可为负）。
     giftFixed = true 的礼物以词条数值为准，保证「+20 / -20」这类礼物精确；
     其余道具则与 NPC 的偏好规则叠乘相加。 */
  const itemDelta = getGiftAffinityDelta(tpl);
  const bonus = tpl.giftFixed ? itemDelta : (ruleBonus + itemDelta);

  inv.count--;
  if(inv.count <= 0) currentGame.bag = currentGame.bag.filter(b => b.count > 0);

  const before = Number(npc.affinity) || 0;
  const max = Number(npc.affinityMax) || 100;
  const after = Math.max(0, Math.min(max, before + bonus));
  npc.affinity = after;
  const diff = after - before;

  if(diff > 0){
    if(diff >= 5) toast(`${npc.name} 非常喜欢这份礼物（好感 +${diff}）`);
    else if(diff >= 2) toast(`${npc.name} 收下了礼物（好感 +${diff}）`);
    else toast(`${npc.name} 收下了礼物，但没什么反应`);
  }else if(diff < 0){
    toast(`${npc.name} 似乎不太喜欢这份礼物（好感 ${diff}）`);
  }else{
    toast(`${npc.name} 收下了礼物，但没什么反应`);
  }
  updateAllUI();
  /* 连续赠送：不自动关闭，刷新礼物列表后由玩家手动关闭 */
  renderGiftBody(npc);
  checkStoryTriggers({type:'affinity', npcId});
}

/* ============================================================
   十一、修复
   ============================================================ */

/* ============================================================
   装备修复 · 合成（双标签页，共用同一个弹窗）
   ============================================================ */

let repairTab = 'repair';   /* 'repair' | 'craft' */

function openRepairModal(){
  closeViewModal();
  repairTab = 'repair';
  renderRepairModal();
  document.getElementById('repairModal').classList.add('show');
}
function closeRepairModal(){ document.getElementById('repairModal').classList.remove('show'); }

function switchRepairTab(tab){
  repairTab = tab;
  renderRepairModal();
}

function renderRepairModal(){
  const content = document.getElementById('repairContent');
  const btn = document.getElementById('repairAllBtn');

  const tabsHtml = '<div class="rt-tabs">'
    + '<div class="rt-tab' + (repairTab==='repair'?' active':'') + '" onclick="switchRepairTab(\'repair\')">🔧 装备修复</div>'
    + '<div class="rt-tab' + (repairTab==='craft'?' active':'') + '" onclick="switchRepairTab(\'craft\')">⚒ 装备合成</div>'
    + '</div>';

  if(repairTab === 'craft'){
    content.innerHTML = tabsHtml + renderCraftingTab();
    btn.style.display = 'none';
    return;
  }

  /* 修复标签页 */
  const result = renderRepairTabContent();
  content.innerHTML = tabsHtml + result.html;
  btn.style.display = '';
  if(result.totalCost > 0){ btn.disabled = false; btn.textContent = `一键全修（￥${result.totalCost}）`; }
  else{ btn.disabled = true; btn.textContent = '一键全修'; }
}

/* 原来的修复主体，返回值改成 { html, totalCost } */
function renderRepairTabContent(){
  const chars = ['player'];
  const q = currentGame.queue;
  ['front','back','rest'].forEach(r => q[r].forEach(c => {
    if(c && c !== 'player' && !chars.includes(c)) chars.push(c);
  }));
  let html = '';
  let totalCost = 0;

  /* ---- 1. 角色已装备物品 ---- */
  chars.forEach(id => {
    const charObj = getCharObj(id);
    const c = getChar(id);
    const eq = charObj.equipment || {};
    const items = [];
    EQUIP_SLOTS.forEach(slot => {
      if(!eq[slot]) return;
      const tpl = EQUIPS[eq[slot].id];
      if(!tpl) return;
      const isWear = tpl.type === 'weapon' && tpl.maxWear;
      const isDur = (tpl.type === 'armor' || tpl.type === 'shield') && tpl.durability;
      const maxV = isWear ? tpl.maxWear : isDur ? tpl.durability : 0;
      if(!maxV) return;
      const curV = isWear ? getItemWear(eq[slot], tpl) : getItemDur(eq[slot], tpl);
      if(curV >= maxV) return;
      const cost = calcRepairCost(tpl.price, curV, maxV);
      items.push({slot, itemId:eq[slot].id, name:tpl.name, cur:curV, max:maxV,
                  metric: isWear ? 'wear' : 'durability',
                  label: isWear ? '磨损' : '耐久', cost});
      totalCost += cost;
    });
    if(items.length === 0) return;
    html += `<div style="color:#9966ff;font-size:12.5px;margin:8px 0 4px">${c.name}（装备）</div>`;
    items.forEach(it => {
      const wArg = it.metric === 'wear' ? it.cur : 'null';
      const dArg = it.metric === 'durability' ? it.cur : 'null';
      html += `<div class="repair-row">
        <div class="repair-info">
          <div class="repair-name"><span class="eq-clickable" onclick="showEquipDetail('${it.itemId}',${wArg},${dArg})">${it.name}</span>（${it.label} ${it.cur}/${it.max}）</div>
          <div class="repair-detail">修复 ${it.max - it.cur} 点 · 花费 ￥${it.cost}</div>
        </div>
        <button class="repair-btn" onclick="repairOne({char:'${id}', slot:'${it.slot}'})">修复</button>
      </div>`;
    });
  });

  /* ---- 2. 行囊里的可修复物品 ---- */
  const bagItems = [];
  (currentGame.bag || []).forEach((it, bagIdx) => {
    const tpl = EQUIPS[it.id];
    if(!tpl) return;
    const maxV = tpl.maxWear || tpl.durability;
    if(!maxV) return;
    const curV = tpl.maxWear ? getItemWear(it, tpl) : getItemDur(it, tpl);
    if(curV >= maxV) return;
    const cost = calcRepairCost(tpl.price, curV, maxV);
    bagItems.push({bagIdx, itemId:it.id, name:tpl.name, cur:curV, max:maxV,
                   label: tpl.maxWear ? '磨损' : '耐久', cost});
    totalCost += cost;
  });
  if(bagItems.length > 0){
    html += `<div style="color:#9966ff;font-size:12.5px;margin:8px 0 4px">行囊</div>`;
    bagItems.forEach(it => {
      const wArg = it.label === '磨损' ? it.cur : 'null';
      const dArg = it.label === '耐久' ? it.cur : 'null';
      html += `<div class="repair-row">
        <div class="repair-info">
          <div class="repair-name"><span class="eq-clickable" onclick="showEquipDetail('${it.itemId}',${wArg},${dArg})">${it.name}</span>（${it.label} ${it.cur}/${it.max}）</div>
          <div class="repair-detail">修复 ${it.max - it.cur} 点 · 花费 ￥${it.cost}</div>
        </div>
        <button class="repair-btn" onclick="repairOne({bagIdx:${it.bagIdx}})">修复</button>
      </div>`;
    });
  }

  if(html === '') html = '<div class="quest-empty">所有装备状态良好，无需修复。</div>';
  return { html, totalCost };
}

/* ============================================================
   合成标签页
   ============================================================ */

function countItemInBag(itemId){
  let n = 0;
  (currentGame.bag || []).forEach(it => { if(it.id === itemId) n += it.count; });
  return n;
}

function renderCraftingTab(){
  const all = (typeof CRAFTING_RECIPES !== 'undefined') ? CRAFTING_RECIPES : [];
  if(!all.length) return '<div class="quest-empty">当前没有可用的合成配方</div>';

  /* 未设计物品不进玩家端：产出或任一材料未设计，整条配方隐藏 */
  const craftList = all.filter(r => (r.kind || 'craft') !== 'advance' && isRecipeAvailable(r));
  const advList = all.filter(r => r.kind === 'advance' && isRecipeAvailable(r));

  let html = '<div class="craft-hint">消耗行囊里的材料合成新物品。已装备的物品不计入材料。</div>';

  /* 品阶提升：配方 + 目标装备 + 词条材料 */
  if(advList.length){
    html += `<div class="craft-group">▎品阶提升（${advList.length}）</div>`;
    advList.forEach(r => { html += renderAdvanceRow(r); });
  }

  /* 普通合成：按产出物品类型分组 */
  const groups = { weapon:[], armor:[], accessory:[], consumable:[], material:[], other:[] };
  craftList.forEach(r => {
    const tpl = EQUIPS[r.result.id];
    const cat = (tpl && groups[tpl.type]) ? tpl.type : 'other';
    groups[cat].push(r);
  });

  const catNames = { weapon:'⚔ 武器', armor:'🛡 防具', accessory:'💍 饰品', consumable:'💊 药品', material:'🌿 材料', other:'📦 其他' };
  let hasAny = advList.length > 0;
  ['weapon','armor','accessory','consumable','material','other'].forEach(cat => {
    const list = groups[cat];
    if(!list.length) return;
    hasAny = true;
    html += `<div class="craft-group">▎${catNames[cat]}（${list.length}）</div>`;
    list.forEach(r => { html += renderRecipeRow(r); });
  });

  if(!hasAny) return '<div class="quest-empty">当前没有可用的合成配方</div>';
  return html;
}

function renderRecipeRow(recipe){
  const rTpl = EQUIPS[recipe.result.id];
  const rName = rTpl ? rTpl.name : recipe.result.id;
  const rCount = recipe.result.count || 1;

  let canCraft = true;
  const matParts = (recipe.materials || []).map(m => {
    const tpl = EQUIPS[m.id];
    const name = tpl ? tpl.name : m.id;
    const have = countItemInBag(m.id);
    const enough = have >= m.count;
    if(!enough) canCraft = false;
    return `<span class="craft-mat${enough?'':' lack'}">${name}×${m.count}<em>(${have})</em></span>`;
  });

  return `<div class="craft-row${canCraft?'':' craft-lack'}">
    <div class="craft-formula">
      ${matParts.join('<span class="craft-op">+</span>')}
      <span class="craft-op eq">=</span>
      <span class="craft-result">${rName}×${rCount}</span>
    </div>
    <button class="craft-btn" ${canCraft?'':'disabled'} onclick="craftRecipe('${recipe.id}')">合成</button>
  </div>`;
}

/* ---- 品阶提升 ---- */
function renderAdvanceRow(recipe){
  const fromInfo = ITEM_RARITY[recipe.from] || { label:recipe.from, words:0 };
  const toInfo   = ITEM_RARITY[recipe.to]   || { label:recipe.to, words:0 };

  const targets = [];
  (currentGame.bag || []).forEach((it, idx) => {
    const tpl = EQUIPS[it.id];
    if(!tpl || getItemCategory(tpl) !== 'equip') return;
    /* 未设计装备不能进阶（没有有效词条可保留） */
    if(!isItemDesigned(tpl)) return;
    if(getItemRarityOf(it, tpl) !== recipe.from) return;
    targets.push({ idx:idx, label:`${tpl.name} Lv.${tpl.level||1}` });
  });

  const wordItems = [];
  (currentGame.bag || []).forEach((it, idx) => {
    const tpl = EQUIPS[it.id];
    const w = getMaterialWord(tpl);
    if(!w) return;
    wordItems.push({ idx:idx, label:`${tpl.name}（${EQUIP_WORD_LABEL[w.type] || w.type} ${w.value}）` });
  });

  let can = targets.length > 0 && wordItems.length > 0;
  const matParts = (recipe.materials || []).map(m => {
    const tpl = EQUIPS[m.id];
    const name = tpl ? tpl.name : m.id;
    const have = countItemInBag(m.id);
    const enough = have >= m.count;
    if(!enough) can = false;
    return `<span class="craft-mat${enough?'':' lack'}">${name}×${m.count}<em>(${have})</em></span>`;
  });
  const gold = recipe.gold || 0;
  if(gold > currentGame.money) can = false;

  return `<div class="craft-row${can?'':' craft-lack'}">
    <div class="craft-formula" style="flex-wrap:wrap;gap:6px">
      <span class="craft-result">${fromInfo.label} → ${toInfo.label}</span>
      ${matParts.join('<span class="craft-op">+</span>')}
      ${gold ? `<span class="craft-mat">￥${gold}</span>` : ''}
      <select id="advTarget_${recipe.id}" class="cat-select" style="width:auto;display:inline-block">
        ${targets.length ? targets.map(t=>`<option value="${t.idx}">${t.label}</option>`).join('') : '<option value="-1">无可进阶装备</option>'}
      </select>
      <select id="advWord_${recipe.id}" class="cat-select" style="width:auto;display:inline-block">
        ${wordItems.length ? wordItems.map(w=>`<option value="${w.idx}">${w.label}</option>`).join('') : '<option value="-1">无词条材料</option>'}
      </select>
    </div>
    <button class="craft-btn" ${can?'':'disabled'} onclick="advanceItem('${recipe.id}')">进阶</button>
  </div>`;
}

function advanceItem(recipeId){
  const recipe = (typeof CRAFTING_RECIPES !== 'undefined' ? CRAFTING_RECIPES : []).find(r => r.id === recipeId);
  if(!recipe) return;
  const tSel = document.getElementById('advTarget_' + recipeId);
  const wSel = document.getElementById('advWord_' + recipeId);
  const tIdx = tSel ? parseInt(tSel.value) : -1;
  const wIdx = wSel ? parseInt(wSel.value) : -1;
  if(tIdx < 0 || wIdx < 0){ toast('请选择装备和词条材料'); return; }

  const target = currentGame.bag[tIdx];
  const wordItem = currentGame.bag[wIdx];
  if(!target || !wordItem){ toast('目标不存在'); return; }
  const tpl = EQUIPS[target.id];
  const wordTpl = EQUIPS[wordItem.id];
  if(!tpl || getItemCategory(tpl) !== 'equip'){ toast('只能进阶装备'); return; }
  if(!isItemDesigned(tpl)){ toast('该装备尚未设计，不能进阶'); return; }
  if(getItemRarityOf(target, tpl) !== recipe.from){ toast('品阶不匹配'); return; }
  const word = getMaterialWord(wordTpl);
  if(!word){ toast('该材料没有词条功能'); return; }
  const fromInfo = ITEM_RARITY[recipe.from];
  const toInfo = ITEM_RARITY[recipe.to];
  if(!fromInfo || !toInfo){ toast('配方品阶无效'); return; }
  for(const m of (recipe.materials || [])){
    if(countItemInBag(m.id) < m.count){ toast('材料不足'); return; }
  }
  const gold = recipe.gold || 0;
  if(currentGame.money < gold){ toast('金币不足'); return; }

  /* 先记录生成所需的字段，再扣物品（索引会变）
     base 词条随品阶成长；ore 词条按矿石档位固定，不重复放大。 */
  const oldWords = (Array.isArray(target.words) ? target.words : (tpl.words || []))
    .map(w => ({ type:w.type, value:w.value, src:w.src || 'base', oreId:w.oreId || null }));

  /* 扣掉词条材料与目标装备（索引大的先删） */
  [{ idx:wIdx }, { idx:tIdx }].sort((a,b) => b.idx - a.idx).forEach(o => {
    const it = currentGame.bag[o.idx];
    if(!it) return;
    it.count--;
    if(it.count <= 0) currentGame.bag.splice(o.idx, 1);
  });

  /* 扣普通材料 */
  (recipe.materials || []).forEach(m => {
    let need = m.count;
    for(let i = currentGame.bag.length - 1; i >= 0 && need > 0; i--){
      const it = currentGame.bag[i];
      if(it.id !== m.id) continue;
      const take = Math.min(it.count, need);
      it.count -= take;
      need -= take;
      if(it.count <= 0) currentGame.bag.splice(i, 1);
    }
  });
  if(gold) currentGame.money -= gold;

  const kRatio = (Number(toInfo.k) || 1) / (Number(fromInfo.k) || 1);
  const newWords = oldWords.map(w => {
    if(w.src === 'ore') return w;  // 升阶矿追加的词条保持原值
    const grown = Math.round((Number(w.value) || 0) * kRatio * 100) / 100;
    return Object.assign({}, w, { value:grown });
  });
  newWords.push({ type:word.type, value:word.value, src:'ore', oreId:wordItem.id });
  const inst = { id:target.id, rarity:recipe.to, words:newWords };
  if(tpl.maxWear) inst.wear = getItemWear(target, tpl);
  if(tpl.durability) inst.durability = getItemDur(target, tpl);
  inst.price = Math.round((tpl.price || 0) * (toInfo.priceMult || 1) / (fromInfo.priceMult || 1));
  addItemToBag(target.id, inst.wear, inst.durability, inst);

  toast(`${tpl.name} 进阶为 ${toInfo.label}，获得：${EQUIP_WORD_LABEL[word.type] || word.type} ${word.value}`);
  saveGame();
  updateAllUI();
  renderRepairModal();
}

function craftRecipe(recipeId){
  if(typeof CRAFTING_RECIPES === 'undefined') return;
  const recipe = CRAFTING_RECIPES.find(r => r.id === recipeId);
  if(!recipe) return;
  /* 守卫：产出或材料引用了未设计物品时不允许合成 */
  if(!isRecipeAvailable(recipe)){ toast('该配方包含未设计物品，暂不可合成'); return; }

  /* 二次校验材料 */
  for(const m of (recipe.materials || [])){
    if(countItemInBag(m.id) < m.count){ toast('材料不足'); return; }
  }

  /* 先加产出：失败立刻回滚并取消，不动材料 */
  const rTpl = EQUIPS[recipe.result.id];
  if(!rTpl){ toast('配方产出不存在'); return; }
  const cnt = recipe.result.count || 1;
  const snapshot = currentGame.bag.map(it => ({id:it.id, count:it.count, wear:it.wear, durability:it.durability}));
  let addedOk = true;
  for(let i = 0; i < cnt; i++){
    const ok = (rTpl && (rTpl.maxWear || rTpl.durability))
      ? addItemToBag(recipe.result.id, rTpl.maxWear, rTpl.durability)
      : addItemToBag(recipe.result.id);
    if(!ok){ addedOk = false; break; }
  }
  if(!addedOk){
    /* 行囊回滚到加产出前的快照 */
    currentGame.bag.length = 0;
    snapshot.forEach(it => currentGame.bag.push(it));
    toast('行囊空间不足，合成取消');
    return;
  }

  /* 扣材料（注意跳过刚加入的产出堆，防止材料与产出同 id 时误扣） */
  (recipe.materials || []).forEach(m => {
    let need = m.count;
    for(let i = currentGame.bag.length - 1; i >= 0 && need > 0; i--){
      const it = currentGame.bag[i];
      if(it.id !== m.id) continue;
      /* 若与产出 id 相同，跳过最新加入的那一条（从尾部算起的前 cnt 条） */
      const take = Math.min(it.count, need);
      it.count -= take;
      need -= take;
      if(it.count <= 0) currentGame.bag.splice(i, 1);
    }
  });

  toast(`合成成功：${rTpl ? rTpl.name : recipe.result.id} ×${cnt}`);
  updateAllUI();
  renderRepairModal();
}

/* 修复一项装备
   target 两种形式：
     { char: 'player' | npcId, slot: 'weapon' | 'armor' }  角色装备
     { bagIdx: number }                                      行囊物品 */
function repairOne(target){
  if(!target) return;
  let tpl = null, maxV = 0, curV = 0, apply = null, name = '';

  if(target.bagIdx !== undefined){
    /* 行囊物品 */
    const it = currentGame.bag[target.bagIdx];
    if(!it) return;
    tpl = EQUIPS[it.id];
    if(!tpl) return;
    maxV = tpl.maxWear || tpl.durability;
    if(!maxV){ toast('该物品无需修复'); return; }
    curV = tpl.maxWear ? getItemWear(it, tpl) : getItemDur(it, tpl);
    name = tpl.name;
    apply = () => {
      if(tpl.maxWear) it.wear = maxV;
      else it.durability = maxV;
    };
  }else{
    /* 角色装备（target.slot 为 8 槽之一） */
    const charObj = getCharObj(target.char);
    if(!charObj) return;
    const eq = charObj.equipment;
    if(!eq || !eq[target.slot]) return;
    tpl = EQUIPS[eq[target.slot].id];
    if(!tpl) return;
    const isWear = tpl.type === 'weapon' && tpl.maxWear;
    const isDur = (tpl.type === 'armor' || tpl.type === 'shield') && tpl.durability;
    maxV = isWear ? tpl.maxWear : isDur ? tpl.durability : 0;
    if(!maxV){ toast('该装备无需修复'); return; }
    curV = isWear ? getItemWear(eq[target.slot], tpl) : getItemDur(eq[target.slot], tpl);
    name = tpl.name;
    apply = () => {
      if(isWear) eq[target.slot].wear = maxV;
      else eq[target.slot].durability = maxV;
    };
  }

  if(curV >= maxV){ toast('无需修复'); return; }
  const cost = calcRepairCost(tpl.price, curV, maxV);
  if(currentGame.money < cost){ toast('资金不足'); return; }
  currentGame.money -= cost;
  apply();
  toast(`修复 ${name}（花费 ￥${cost}）`);
  updateAllUI();
  renderRepairModal();
}

function repairAll(){
  const chars = ['player'];
  const q = currentGame.queue;
  ['front','back','rest'].forEach(r => q[r].forEach(c => {
    if(c && c !== 'player' && !chars.includes(c)) chars.push(c);
  }));
  let totalCost = 0;
  const list = [];

  /* 1. 角色已装备的武器 / 防具 / 盾牌 */
  chars.forEach(id => {
    const charObj = getCharObj(id);
    const eq = charObj.equipment || {};
    EQUIP_SLOTS.forEach(slot => {
      if(!eq[slot]) return;
      const tpl = EQUIPS[eq[slot].id];
      if(!tpl) return;
      const isWear = tpl.type === 'weapon' && tpl.maxWear;
      const isDur = (tpl.type === 'armor' || tpl.type === 'shield') && tpl.durability;
      const maxV = isWear ? tpl.maxWear : isDur ? tpl.durability : 0;
      if(!maxV) return;
      const curV = isWear ? getItemWear(eq[slot], tpl) : getItemDur(eq[slot], tpl);
      if(curV >= maxV) return;
      totalCost += calcRepairCost(tpl.price, curV, maxV);
      list.push({
        apply: () => {
          if(isWear) eq[slot].wear = maxV;
          else eq[slot].durability = maxV;
        }
      });
    });
  });

  /* 2. 行囊里的武器 / 护甲 */
  (currentGame.bag || []).forEach(it => {
    const tpl = EQUIPS[it.id];
    if(!tpl) return;
    const maxV = tpl.maxWear || tpl.durability;
    if(!maxV) return;
    const curV = tpl.maxWear ? getItemWear(it, tpl) : getItemDur(it, tpl);
    if(curV >= maxV) return;
    totalCost += calcRepairCost(tpl.price, curV, maxV);
    list.push({
      apply: () => {
        if(tpl.maxWear) it.wear = maxV;
        else it.durability = maxV;
      }
    });
  });

  if(totalCost === 0){ toast('无需修复'); return; }
  if(currentGame.money < totalCost){ toast('资金不足'); return; }
  currentGame.money -= totalCost;
  list.forEach(item => item.apply());
  toast(`全修完成（花费 ￥${totalCost}）`);
  updateAllUI();
  renderRepairModal();
}

/* ============================================================
   十二、交易
   ============================================================ */

function openTradeModal(npcId){
  closeViewModal();
  pendingTradeNpc = npcId;
  tradeBuyList = [];
  tradeSellList = [];
  document.getElementById('tradeNpcName').textContent = getNpc(npcId).name;
  renderTradeModal();
  document.getElementById('tradeModal').classList.add('show');
}
function closeTradeModal(){
  document.getElementById('tradeModal').classList.remove('show');
  pendingTradeNpc = null;
  tradeBuyList = [];
  tradeSellList = [];
}

/* 交易价格统一由 core.js 的 getTradeRates() 计算：
   商店折扣 / 出售加成来自被动词条（商人职业、称号、个性化被动）。 */
function getBuyPrice(itemId){
  const tpl = EQUIPS[itemId];
  if(!tpl) return 0;
  const base = tpl.price || 0;
  if(base <= 0) return 0;
  return Math.floor(base * getTradeRates().buyMult);
}
function getSellPrice(itemId, wear, durability, priceOverride){
  const tpl = EQUIPS[itemId];
  if(!tpl) return 0;
  /* 进阶过的装备按实例价格算（实例价格已按品阶倍率换算） */
  const base = (Number(priceOverride) > 0) ? Number(priceOverride) : (tpl.price || 0);
  /* 基础回收率 50%，再乘被动的"出售加成"（商人 10% → 0.55） */
  let rate = 0.5 * getTradeRates().sellMult;
  if(tpl.maxWear && wear !== undefined) rate *= (wear / tpl.maxWear);
  else if(tpl.durability && durability !== undefined) rate *= (durability / tpl.durability);
  return Math.max(1, Math.floor(base * rate));
}

function renderTradeModal(){
  const bagStock = document.getElementById('tradeBagStock');
  const bag = currentGame.bag || [];
  const sellableBag = bag.map((it, realIdx) => ({it, realIdx}))
    .filter(x => {
      const tpl = EQUIPS[x.it.id];
      return tpl && tpl.type !== 'other' && tpl.price > 0;
    });
  bagStock.innerHTML = sellableBag.length === 0 ? '<div class="trade-empty">无可卖物品</div>' :
    sellableBag.map((x, idx) => {
      const tpl = EQUIPS[x.it.id];
      const price = getSellPrice(x.it.id, x.it.wear, x.it.durability, x.it.price);
      const wearTag = (x.it.wear !== undefined && tpl.maxWear) ? ` 磨损${getItemWear(x.it, tpl)}/${tpl.maxWear}` : (x.it.durability !== undefined && tpl.durability ? ` 耐久${getItemDur(x.it, tpl)}/${tpl.durability}` : '');
      return `<div class="trade-item">
        <div class="trade-item-name">${tpl.name}${x.it.count > 1 ? ` ×${x.it.count}` : ''}${wearTag}</div>
        <div class="trade-item-price">￥${price}</div>
        <button class="trade-item-btn" onclick="addToSell(${idx})">卖出</button>
      </div>`;
    }).join('');

    /* 商店列表：优先用当前商人 NPC 的 shopItems，没配则回退全局 SHOP_ITEMS */
  const tradeNpc = pendingTradeNpc ? getNpc(pendingTradeNpc) : null;
  const _tradeCfg = (tradeNpc && typeof placementActorConfig === 'function')
    ? placementActorConfig(tradeNpc.id, currentTalkPlacementId)
    : null;
  const _tradeItems = _tradeCfg && Array.isArray(_tradeCfg.services.shopItems)
    ? _tradeCfg.services.shopItems
    : (tradeNpc && tradeNpc.shopItems) || [];
  const shopItemIds = _tradeItems.length > 0 ? _tradeItems : SHOP_ITEMS;

  /* 按类型 + 等级排序，让同类物品排一起；未设计物品不对玩家展示 */
  const typeOrder = {weapon:0, armor:1, accessory:2, consumable:3, other:9};
  const sortedIds = shopItemIds
    .map(id => EQUIPS[id])
    .filter(tpl => tpl && isItemAvailable(tpl))
    .sort((a, b) => {
      const ta = typeOrder[a.type] != null ? typeOrder[a.type] : 9;
      const tb = typeOrder[b.type] != null ? typeOrder[b.type] : 9;
      if(ta !== tb) return ta - tb;
      return (a.level || 1) - (b.level || 1);
    })
    .map(tpl => tpl.id);

  const typeLabel = {weapon:'武器', armor:'防具', accessory:'饰品', consumable:'药品', other:'其他'};
  const shopList = document.getElementById('tradeShopList');
  shopList.innerHTML = sortedIds.length === 0 ? '<div class="trade-empty">暂无可售物品</div>' : sortedIds.map(id => {
    const tpl = EQUIPS[id];
    if(!tpl) return '';
    const price = getBuyPrice(id);
    const lvTag = `<span style="color:#9966ff;font-size:11px;margin-right:4px">Lv.${tpl.level || 1}</span>`;
    const typeTag = `<span style="color:#889;font-size:11px;margin-right:4px">[${typeLabel[tpl.type] || '物品'}]</span>`;
        return `<div class="trade-item">
      <div class="trade-item-name">${lvTag}${typeTag}<span class="eq-clickable" onclick="event.stopPropagation();showEquipDetail('${id}')">${tpl.name}</span></div>
      <div class="trade-item-price">￥${price}</div>
      <button class="trade-item-btn" onclick="addToBuy('${id}')">买入</button>
    </div>`;
  }).join('');

  const buyList = document.getElementById('tradeBuyList');
  buyList.innerHTML = tradeBuyList.length === 0 ? '<div class="trade-empty">未选择</div>' :
    tradeBuyList.map((it, idx) => {
      const tpl = EQUIPS[it.id];
      const price = getBuyPrice(it.id) * it.count;
      return `<div class="trade-item">
        <div class="trade-item-name">${tpl.name} ×${it.count}</div>
        <div class="trade-item-price">-￥${price}</div>
        <button class="trade-item-btn" onclick="removeFromBuy(${idx})">撤</button>
      </div>`;
    }).join('');

  const sellList = document.getElementById('tradeSellList');
  sellList.innerHTML = tradeSellList.length === 0 ? '<div class="trade-empty">未选择</div>' :
    tradeSellList.map((it, idx) => {
      const tpl = EQUIPS[it.id];
      const price = getSellPrice(it.id, it.wear, it.durability, it.price) * it.count;
      const wearTag = (it.wear !== undefined && tpl.maxWear) ? ` 磨损${getItemWear(it, tpl)}/${tpl.maxWear}` : '';
      return `<div class="trade-item">
        <div class="trade-item-name">${tpl.name}${wearTag}</div>
        <div class="trade-item-price">+￥${price}</div>
        <button class="trade-item-btn" onclick="removeFromSell(${idx})">撤</button>
      </div>`;
    }).join('');

  let buyTotal = 0;
  tradeBuyList.forEach(it => buyTotal += getBuyPrice(it.id) * it.count);
  let sellTotal = 0;
  tradeSellList.forEach(it => sellTotal += getSellPrice(it.id, it.wear, it.durability) * it.count);
  document.getElementById('tradeBuyTotal').textContent = `合计：-￥${buyTotal}`;
  document.getElementById('tradeSellTotal').textContent = `合计：+￥${sellTotal}`;
  const current = currentGame.money;
  const after = current - buyTotal + sellTotal;
  document.getElementById('tradeCurrentMoney').textContent = '￥' + current;
  const afterEl = document.getElementById('tradeAfterMoney');
  afterEl.textContent = '￥' + after;
  afterEl.className = 'trade-money' + (after < 0 ? ' negative' : '');
  const btn = document.getElementById('tradeConfirmBtn');
  btn.disabled = after < 0;
  btn.textContent = after < 0 ? '资金不足' : '确定交易';
}

function addToBuy(itemId){
  /* 守卫：旧 UI 残留 / 手改 DOM 也不能买未设计物品 */
  if(!isItemAvailable(EQUIPS[itemId])){ toast('该物品尚未设计，暂不出售'); return; }
  const existing = tradeBuyList.find(it => it.id === itemId);
  if(existing) existing.count++;
  else tradeBuyList.push({id:itemId, count:1});
  renderTradeModal();
}
function removeFromBuy(idx){ tradeBuyList.splice(idx, 1); renderTradeModal(); }

function addToSell(bagIdx){
  const bag = currentGame.bag || [];
  const sellableBag = bag.map((it, realIdx) => ({it, realIdx}))
    .filter(x => {
      const tpl = EQUIPS[x.it.id];
      return tpl && tpl.type !== 'other' && tpl.price > 0;
    });
  if(bagIdx >= sellableBag.length) return;
  const {it, realIdx} = sellableBag[bagIdx];
  const existing = tradeSellList.find(s => s.realIdx === realIdx);
  const maxCount = it.count;
  if(existing){ if(existing.count < maxCount) existing.count++; }
  else{ tradeSellList.push({id:it.id, count:1, realIdx, wear:it.wear, durability:it.durability}); }
  renderTradeModal();
}
function removeFromSell(idx){ tradeSellList.splice(idx, 1); renderTradeModal(); }

function confirmTrade(){
  tradeBuyList.forEach(item => {
    const tpl = EQUIPS[item.id];
    const price = getBuyPrice(item.id);
    for(let i = 0; i < item.count; i++){
      currentGame.money -= price;
      addItemToBag(item.id, tpl.maxWear, tpl.durability);
    }
  });
  tradeSellList.forEach(item => {
    const src = currentGame.bag[item.realIdx];
    const price = getSellPrice(item.id, item.wear, item.durability, src && src.price);
    currentGame.money += price * item.count;
    const realItem = currentGame.bag[item.realIdx];
    if(realItem){ realItem.count -= item.count; }
  });
  currentGame.bag = currentGame.bag.filter(b => b.count > 0);
  toast('交易完成');
  closeTradeModal();
  updateAllUI();
}

/* ============================================================
   十三、踢出
   ============================================================ */

/* 统一离队入口：由 isPet 开关决定行为，与 id 前缀无关。
   宠物召回宠物行囊；队友弹确认后回归 homeTile。 */
function dismissCharacter(id){
  const inst = getNpc(id);
  if(!inst) return;
  if(inst.isPet){
    const slot = petSlotOf(id);
    if(slot) withdrawPet(slot);
    return;
  }
  kickNpc(id);
}
function kickNpc(npcId){
  const npc = getNpc(npcId);
  if(!npc) return;
  pendingKickNpcId = npcId;
  document.getElementById('kickText').textContent = `确定请出 ${npc.name}？好感度会下降 20。`;
  document.getElementById('kickModal').classList.add('show');
}
function closeKickModal(){
  document.getElementById('kickModal').classList.remove('show');
  pendingKickNpcId = null;
}
function confirmKick(){
  const npcId = pendingKickNpcId;
  if(!npcId){ closeKickModal(); return; }
  const npc = getNpc(npcId);
  const q = currentGame.queue;
  ['front','back','rest'].forEach(r => {
    for(let i = 0; i < q[r].length; i++){
      if(q[r][i] === npcId) q[r][i] = null;
    }
  });
  npc.affinity = Math.max(0, npc.affinity - 20);

  /* 退队后，NPC 的家改为"回归位置"（若定义了 returnTile），并重建地图上的 npcs 数组 */
  if(npc.returnTile){
    npc.homeTile = npc.returnTile;
  }
  resyncNpcPositions();

  closeKickModal();
  toast(`${npc.name} 离开了队伍`);
  updateAllUI();
  renderNpcRow();
  const bagEl = document.getElementById('bagModal');
  if(bagEl && bagEl.classList.contains('show')) renderBag();
}

/* ============================================================
   十四、调试面板
   ============================================================ */

function openDebug(){
  if(document.getElementById('debugPwd').value !== DEBUG_PWD){ toast('密码错误'); return; }
  debugUnlocked = true;
  openDebugModal();
}
function openDebugModal(){
  debugTab = 'save';
  debugEdit = null;
  debugExportOpen = false;
  document.querySelectorAll('#debugTabs .debug-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.debugTab === 'save');
  });
  renderDebugContent({ resetScroll: true });
  document.getElementById('debugModal').classList.add('show');
}
function closeDebugModal(){ debugEdit = null; document.getElementById('debugModal').classList.remove('show'); }
function switchDebugTab(tab){
  debugTab = tab;
  debugEdit = null;
  debugExportOpen = false;
  document.querySelectorAll('#debugTabs .debug-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.debugTab === tab);
  });
  renderDebugContent({ resetScroll: true });
}

function renderDebugContent(opts){
  const resetScroll = !!(opts && opts.resetScroll);
  const c = document.getElementById('debugContent');
  if(!c) return;
  /* 保存滚动位置与展开状态：改下拉会触发整块重渲染，
     不保留的话看起来会"跳回顶部" */
  const scrollTop = c.scrollTop || 0;
  const openGroups = [];
  const openAdvs = [];
  if(c.querySelectorAll){
    const groups = c.querySelectorAll('.debug-group');
    for(let i = 0; i < groups.length; i++){
      if(groups[i].classList.contains('open')) openGroups.push(i);
    }
    const advs = c.querySelectorAll('details.debug-adv');
    for(let i = 0; i < advs.length; i++){
      if(advs[i].open) openAdvs.push(i);
    }
  }
  c.innerHTML = '';

  const restoreView = () => {
    if(c.querySelectorAll){
      const newGroups = c.querySelectorAll('.debug-group');
      openGroups.forEach(i => { if(newGroups[i]) newGroups[i].classList.add('open'); });
      const newAdvs = c.querySelectorAll('details.debug-adv');
      openAdvs.forEach(i => { if(newAdvs[i]) newAdvs[i].open = true; });
    }
    c.scrollTop = resetScroll ? 0 : scrollTop;
  };

  if(debugEdit){
    if(debugEdit.kind === 'item') renderDebugItemEdit(c);
    else if(debugEdit.kind === 'skill') renderDebugSkillEdit(c);
    restoreView();
    return;
  }
  if(debugExportOpen){
    renderDebugExport(c);
    restoreView();
    return;
  }
  if(debugTab === 'save') renderDebugSave(c);
  else if(debugTab === 'chars') renderDebugChars(c);
  else if(debugTab === 'skills') renderDebugSkills(c);
  else if(debugTab === 'equips') renderDebugEquips(c);
  else if(debugTab === 'enemies') renderDebugEnemies(c);
  else if(debugTab === 'battle') renderDebugBattle(c);
  else if(debugTab === 'story') renderDebugStory(c);
  else if(debugTab === 'data') renderDebugData(c);
  restoreView();
}

function renderDebugSave(c){
  if(!currentGame){ c.innerHTML = '<div class="quest-empty">尚未创建角色</div>'; return; }
  const t = currentGame.time;
  const tile = getCurrentTile();
  c.innerHTML += `<div class="debug-info">当前存档位：${currentSlot + 1}<br>角色：${currentGame.name}｜Lv.${currentGame.level}<br>时间：${t.year}年${t.month}月${t.day}日 ${t.hour}时<br>位置：${MAPS[currentMapId] ? MAPS[currentMapId].name : '—'} · ${tile ? tile.name : '—'}</div>`;
  c.innerHTML += `<div class="debug-actions">
    <button class="debug-btn success" onclick="debugSaveNow()">立即保存</button>
    <button class="debug-btn" onclick="debugReload()">重新载入</button>
  </div>`;
}
function debugSaveNow(){ if(!currentGame){ toast('没有角色'); return; } saveGame(currentSlot); renderDebugContent(); }
function debugReload(){
  if(currentSlot < 0){ toast('无法重新载入'); return; }
  showConfirm('重新载入', '确定重新载入当前存档？未保存的进度将丢失。', () => {
    loadAndStart(currentSlot);
    closeDebugModal();
  });
}

function renderDebugChars(c){
  if(!currentGame){ c.innerHTML = '<div class="quest-empty">尚未创建角色</div>'; return; }
  c.innerHTML += `<div class="debug-actions">
    <button class="debug-btn success" onclick="debugHealAll()">全队满血满蓝</button>
    <button class="debug-btn" onclick="debugLevelUp()">玩家+1级</button>
    <button class="debug-btn" onclick="debugAddMoney(1000)">+1000金</button>
  </div>`;
  c.innerHTML += `<div class="debug-search">
    <input type="text" id="debugCharSearch" placeholder="搜索角色名 / 职业 / 描述..." value="${debugCharKeyword}" oninput="onDebugCharSearch(this.value)">
  </div>`;
  c.innerHTML += `<div id="debugCharList"></div>`;
  renderDebugCharList();
}

function onDebugCharSearch(val){
  debugCharKeyword = val || '';
  renderDebugCharList();
}

function getMapIdByTileId(tileId){
  for(const mapId in MAPS){
    if(MAPS[mapId].tiles.some(t => t.id === tileId)) return mapId;
  }
  return null;
}

function getMapDisplayName(mapId){
  if(!mapId) return '无固定位置';
  return (MAPS[mapId] && MAPS[mapId].name) ? MAPS[mapId].name : mapId;
}

function getNpcRoleTags(npc){
  const tags = [];
  if(npc.isEnv) tags.push({label:'环境', color:'#88ffaa'});
  if(npc.isTrainer) tags.push({label:'转职官', color:'#ffcc66'});
  if(npc.isRepairer) tags.push({label:'修复师', color:'#88ccff'});
  if(npc.isTrader) tags.push({label:'商人', color:'#66ff99'});
  if(tags.length === 0) tags.push({label:'普通', color:'#889'});
  return tags;
}

function getTileInfo(tileId){
  if(!tileId) return null;
  for(const mapId in MAPS){
    const tile = MAPS[mapId].tiles.find(t => t.id === tileId);
    if(tile){
      return {mapId, mapName:MAPS[mapId].name, tileName:tile.name};
    }
  }
  return null;
}

function getQueuePosition(npcId){
  const q = currentGame.queue;
  if(q.front.includes(npcId)) return '前排';
  if(q.back.includes(npcId)) return '后排';
  if(q.rest.includes(npcId)) return '休息区';
  return null;
}

function buildDebugSubgroupHead(npcId, npc){
  if(npcId === 'player'){
    const tileInfo = getTileInfo(currentTileId);
    const tileStr = tileInfo ? `${tileInfo.mapName} · ${tileInfo.tileName}` : '—';
    const key = 'subgroup:player';
    const isOpen = _debugOpen(key, true);
    return `<div class="debug-subgroup-head" data-dkey="${key}" onclick="toggleDebugSubgroup(this)">
      <div class="dsg-info">
        <div class="dsg-line1">
          <span class="dsg-name">${currentGame.name}</span>
          <span class="dsg-tag" style="color:#66d9ff;border-color:rgba(102,217,255,.5)">玩家</span>
          <span class="dsg-lv">Lv.${currentGame.level}</span>
        </div>
        <div class="dsg-line2">📍 ${tileStr}</div>
      </div>
      <span class="dsg-arrow">${isOpen ? '▲' : '▼'}</span>
    </div>`;
  }
  const tags = getNpcRoleTags(npc);
  const tagsHtml = tags.map(t =>
    `<span class="dsg-tag" style="color:${t.color};border-color:${t.color}55">${t.label}</span>`
  ).join('');
  const tileInfo = npc.homeTile ? getTileInfo(npc.homeTile) : null;
  const queuePos = getQueuePosition(npcId);
  let locStr;
  if(queuePos){
    locStr = tileInfo
      ? `${tileInfo.mapName} · ${tileInfo.tileName}（队列 · ${queuePos}）`
      : `队列 · ${queuePos}`;
  }else{
    locStr = tileInfo ? `${tileInfo.mapName} · ${tileInfo.tileName}` : '—';
  }
  const key = 'subgroup:' + npcId;
  const isOpen = _debugOpen(key, false);
  return `<div class="debug-subgroup-head" data-dkey="${key}" onclick="toggleDebugSubgroup(this)">
    <div class="dsg-info">
      <div class="dsg-line1">
        <span class="dsg-name">${npc.name}</span>
        ${tagsHtml}
        <span class="dsg-lv">Lv.${npc.level}</span>
        <span class="dsg-aff">好感 ${npc.affinity}</span>
      </div>
      <div class="dsg-line2">📍 ${locStr}</div>
    </div>
    <span class="dsg-arrow">${isOpen ? '▲' : '▼'}</span>
  </div>`;
}

function renderDebugCharList(){
  const listEl = document.getElementById('debugCharList');
  if(!listEl) return;
  const kw = (debugCharKeyword || '').toLowerCase().trim();

  const queueIds = [];
  const mapGroups = {};
  const orphans = [];

  const q = currentGame.queue;
  ['front','back','rest'].forEach(r => q[r].forEach(id => {
    if(id && id !== 'player' && !queueIds.includes(id)) queueIds.push(id);
  }));

  for(const id in currentGame.npcs){
    const npc = currentGame.npcs[id];
    if(!npc || npc.isEnv) continue;
    if(kw){
      const name = (npc.name || '').toLowerCase();
      const classes = (npc.classes || []).filter(c => c).join(' ').toLowerCase();
      const desc = (npc.desc || '').toLowerCase();
      if(!name.includes(kw) && !classes.includes(kw) && !desc.includes(kw)) continue;
    }
    if(queueIds.includes(id)) continue;
    const mapId = npc.homeTile ? getMapIdByTileId(npc.homeTile) : null;
    if(mapId){
      if(!mapGroups[mapId]) mapGroups[mapId] = [];
      mapGroups[mapId].push(id);
    }else{
      orphans.push(id);
    }
  }

  const filteredQueueIds = queueIds.filter(id => {
    if(!kw) return true;
    const npc = currentGame.npcs[id];
    if(!npc) return false;
    const name = (npc.name || '').toLowerCase();
    const classes = (npc.classes || []).filter(c => c).join(' ').toLowerCase();
    const desc = (npc.desc || '').toLowerCase();
    return name.includes(kw) || classes.includes(kw) || desc.includes(kw);
  });

  let html = '';

  const pKey = 'chars:player';
  const pOpen = _debugOpen(pKey, true);
  const pSubOpen = _debugOpen('subgroup:player', true);
  html += `<div class="debug-group${pOpen ? ' open' : ''}">
    <div class="debug-group-head" data-dkey="${pKey}" onclick="toggleDebugGroup(this)">玩家 <span class="debug-arrow">${pOpen ? '▲' : '▼'}</span></div>
    <div class="debug-group-body">
      <div class="debug-subgroup${pSubOpen ? ' open' : ''}">
        ${buildDebugSubgroupHead('player', currentGame)}
        <div class="debug-subgroup-body">${buildDebugCharEntry('player', currentGame)}</div>
      </div>
    </div>
  </div>`;

  if(filteredQueueIds.length > 0){
    let bodyHtml = '';
    filteredQueueIds.forEach(id => {
      const npc = currentGame.npcs[id];
      if(!npc) return;
      const subOpen = _debugOpen('subgroup:' + id, false);
      bodyHtml += `<div class="debug-subgroup${subOpen ? ' open' : ''}">
        ${buildDebugSubgroupHead(id, npc)}
        <div class="debug-subgroup-body">${buildDebugCharEntry(id, npc)}</div>
      </div>`;
    });
    const qKey = 'chars:queue';
    const qOpen = _debugOpen(qKey, false);
    html += `<div class="debug-group${qOpen ? ' open' : ''}">
      <div class="debug-group-head" data-dkey="${qKey}" onclick="toggleDebugGroup(this)">队列（${filteredQueueIds.length}）<span class="debug-arrow">${qOpen ? '▲' : '▼'}</span></div>
      <div class="debug-group-body">${bodyHtml}</div>
    </div>`;
  }

  const order = Object.keys(mapGroups).sort((a, b) => {
    return getMapDisplayName(a).localeCompare(getMapDisplayName(b), 'zh');
  });
  order.forEach(mapId => {
    const ids = mapGroups[mapId];
    let bodyHtml = '';
    ids.forEach(id => {
      const npc = currentGame.npcs[id];
      if(!npc) return;
      const subOpen = _debugOpen('subgroup:' + id, false);
      bodyHtml += `<div class="debug-subgroup${subOpen ? ' open' : ''}">
        ${buildDebugSubgroupHead(id, npc)}
        <div class="debug-subgroup-body">${buildDebugCharEntry(id, npc)}</div>
      </div>`;
    });
    const mKey = 'chars:map:' + mapId;
    const mOpen = _debugOpen(mKey, false);
    html += `<div class="debug-group${mOpen ? ' open' : ''}">
      <div class="debug-group-head" data-dkey="${mKey}" onclick="toggleDebugGroup(this)">${getMapDisplayName(mapId)}（${ids.length}）<span class="debug-arrow">${mOpen ? '▲' : '▼'}</span></div>
      <div class="debug-group-body">${bodyHtml}</div>
    </div>`;
  });

  if(orphans.length > 0){
    let bodyHtml = '';
    orphans.forEach(id => {
      const npc = currentGame.npcs[id];
      if(!npc) return;
      const subOpen = _debugOpen('subgroup:' + id, false);
      bodyHtml += `<div class="debug-subgroup${subOpen ? ' open' : ''}">
        ${buildDebugSubgroupHead(id, npc)}
        <div class="debug-subgroup-body">${buildDebugCharEntry(id, npc)}</div>
      </div>`;
    });
    const oKey = 'chars:orphans';
    const oOpen = _debugOpen(oKey, false);
    html += `<div class="debug-group${oOpen ? ' open' : ''}">
      <div class="debug-group-head" data-dkey="${oKey}" onclick="toggleDebugGroup(this)">其他（${orphans.length}）<span class="debug-arrow">${oOpen ? '▲' : '▼'}</span></div>
      <div class="debug-group-body">${bodyHtml}</div>
    </div>`;
  }

  if(!html){
    listEl.innerHTML = '<div class="quest-empty">没有匹配的角色</div>';
    return;
  }
  listEl.innerHTML = html;
}

function toggleDebugSubgroup(el){
  const isOpen = el.parentElement.classList.toggle('open');
  const arrow = el.querySelector('.dsg-arrow');
  if(arrow) arrow.textContent = isOpen ? '▲' : '▼';
  if(el.dataset.dkey) _debugGroupState.set(el.dataset.dkey, isOpen);
}

function _debugOpen(key, defaultOpen){
  if(_debugGroupState.has(key)) return _debugGroupState.get(key);
  /* 下拉分组统一默认收起，展开状态由点击记录 */
  return false;
}

function buildDebugCharEntry(id, charObj){
  if(!charObj) return '';
  const isPlayer = id === 'player';
  const lv = charObj.level || 1;
  const st = getCharAttrStats(charObj);
  const hp = charObj.hp || 0;
  const maxHp = st.maxHp;
  const mp = charObj.mp || 0;
  const maxMp = st.maxMp;
  const affinity = isPlayer ? null : (charObj.affinity || 0);
  const affinityMax = isPlayer ? null : (charObj.affinityMax || 100);
  const classes = (charObj.classes || ['','']).slice(0, 2);
  const money = isPlayer ? (charObj.money || 0) : null;

  let html = '';
  html += `<div class="debug-row-item"><label>等级</label>
    <input class="debug-input" type="number" value="${lv}" onchange="debugSetNpcField('${id}','level',this.value)">
  </div>`;
  html += `<div class="debug-row-item"><label>HP</label>
    <input class="debug-input" type="number" value="${hp}" onchange="debugSetNpcField('${id}','hp',this.value)">
    <span style="color:#667;font-size:11.5px">/ ${maxHp}（公式）</span>
  </div>`;
  html += `<div class="debug-row-item"><label>MP</label>
    <input class="debug-input" type="number" value="${mp}" onchange="debugSetNpcField('${id}','mp',this.value)">
    <span style="color:#667;font-size:11.5px">/ ${maxMp}（公式）</span>
  </div>`;
  html += `<div class="debug-row-item"><label>体力</label>
    <input class="debug-input" type="number" value="${st.vit}" onchange="debugSetNpcAttr('${id}','vit',this.value)">
  </div>`;
  html += `<div class="debug-row-item"><label>精神力</label>
    <input class="debug-input" type="number" value="${st.spi}" onchange="debugSetNpcAttr('${id}','spi',this.value)">
  </div>`;
  html += `<div class="debug-row-item"><label>派生</label>
    <span style="color:#8cb;font-size:11.5px">物攻 ${st.physAtk}　魔攻 ${st.magicAtk}　防御 ${st.def}　速度 ${st.spd}</span>
  </div>`;
  if(!isPlayer){
    html += `<div class="debug-row-item"><label>好感度</label>
      <input class="debug-input" type="number" value="${affinity}" onchange="debugSetNpcField('${id}','affinity',this.value)">
      <span style="color:#667;font-size:11.5px">/ ${affinityMax}</span>
    </div>`;
  }
  if(isPlayer){
    html += `<div class="debug-row-item"><label>金钱</label>
      <input class="debug-input" type="number" value="${money}" onchange="debugSetNpcField('${id}','money',this.value)">
    </div>`;
  }
  html += `<div class="debug-row-item"><label>职业1</label>
    <input class="debug-input wide" value="${classes[0] || ''}" onchange="debugSetNpcClass('${id}',0,this.value)">
  </div>`;
  html += `<div class="debug-row-item"><label>职业2</label>
    <input class="debug-input wide" value="${classes[1] || ''}" onchange="debugSetNpcClass('${id}',1,this.value)">
  </div>`;

  return html;
}

function debugSetNpcField(id, key, val){
  const obj = id === 'player' ? currentGame : (currentGame.npcs ? currentGame.npcs[id] : null);
  if(!obj) return;
  obj[key] = Number(val) || 0;
  if(key === 'level') recalcCharStats(obj);
  if(key === 'hp' && obj.hp > obj.maxHp) obj.hp = obj.maxHp;
  if(key === 'mp' && obj.mp > obj.maxMp) obj.mp = obj.maxMp;
  updateAllUI();
  renderDebugContent();
}

/* 调试面板：直接按当前等级设定体力/精神力（反推 Lv.1 基础值） */
function debugSetNpcAttr(id, key, val){
  const obj = id === 'player' ? currentGame : (currentGame.npcs ? currentGame.npcs[id] : null);
  if(!obj) return;
  normalizeCharAttributeModel(obj);
  const lv1 = Math.max(0, (obj.level || 1) - 1);
  const growth = (obj.growth && obj.growth[key] !== undefined) ? Number(obj.growth[key]) : 0;
  obj.base[key] = (Number(val) || 0) - growth * lv1;
  recalcCharStats(obj);
  updateAllUI();
  renderDebugContent();
}

function debugSetNpcClass(id, idx, val){
  const obj = id === 'player' ? currentGame : (currentGame.npcs ? currentGame.npcs[id] : null);
  if(!obj) return;
  if(!obj.classes) obj.classes = ['',''];
  obj.classes[idx] = String(val || '').trim();
  updateAllUI();
  renderDebugContent();
}

function debugHealAll(){
  if(!currentGame) return;
  currentGame.hp = currentGame.maxHp;
  currentGame.mp = currentGame.maxMp;
  const q = currentGame.queue;
  ['front','back','rest'].forEach(r => q[r].forEach(id => {
    if(id && id !== 'player'){
      const npc = getNpc(id);
      if(npc){ npc.hp = npc.maxHp; npc.mp = npc.maxMp; }
    }
  }));
  toast('全队已恢复满状态');
  updateAllUI();
  renderDebugContent();
}
function debugLevelUp(){
  if(!currentGame) return;
  currentGame.level++;
  currentGame.expMax = Math.floor(currentGame.expMax * 1.5);
  applyGrowth(currentGame);
  toast(`玩家等级提升至 Lv.${currentGame.level}`);
  updateAllUI();
  renderDebugContent();
}
function debugAddMoney(n){
  if(!currentGame) return;
  currentGame.money += n;
  toast(`资金 +${n}`);
  updateAllUI();
  renderDebugContent();
}
function toggleDebugGroup(el){
  const isOpen = el.parentElement.classList.toggle('open');
  const arrow = el.querySelector('.debug-arrow');
  if(arrow) arrow.textContent = isOpen ? '▲' : '▼';
  if(el.dataset.dkey) _debugGroupState.set(el.dataset.dkey, isOpen);
}
function debugSet(target, key, val){
  const obj = target === 'player' ? currentGame : getNpc(target);
  if(!obj) return;
  obj[key] = Number(val) || 0;
  if(key === 'level') recalcCharStats(obj);
  updateAllUI();
  renderDebugContent();
}

function renderDebugSkills(c){
  if(!currentGame){ c.innerHTML = '<div class="quest-empty">尚未创建角色</div>'; return; }
  const charIds = ['player'];
  const q = currentGame.queue;
  ['front','back','rest'].forEach(r => q[r].forEach(cid => {
    if(cid && cid !== 'player' && !charIds.includes(cid)) charIds.push(cid);
  }));
  const sel = debugSkillChar || 'player';

  c.innerHTML += `<div class="debug-info">选择角色后，点击技能右侧「发放」；点「编辑效果」可逐级配置 effects（立即生效）。支持搜索。</div>`;
  c.innerHTML += `<div class="debug-actions">`;
  charIds.forEach(id => {
    const ch = getChar(id);
    c.innerHTML += `<button class="debug-btn${sel === id ? ' success' : ''}" onclick="debugSkillCharSelect('${id}')">${ch.name}</button>`;
  });
  c.innerHTML += `</div>`;
  c.innerHTML += `<div class="debug-search">
    <input type="text" id="debugSkillSearch" placeholder="搜索技能名 / 职业..." oninput="filterDebugSkills()">
  </div>`;
  c.innerHTML += `<div id="debugSkillList"></div>`;
  renderDebugSkillList(sel, '');
}

function renderDebugSkillList(charId, keyword){
  const listEl = document.getElementById('debugSkillList');
  if(!listEl) return;
  const targetObj = getCharObj(charId);
  const kw = (keyword || '').toLowerCase().trim();

  const groups = {};
  Object.values(SKILLS).forEach(sk => {
    if(kw && !sk.name.toLowerCase().includes(kw) && !sk.classLimit.toLowerCase().includes(kw)) return;
    if(!groups[sk.classLimit]) groups[sk.classLimit] = [];
    groups[sk.classLimit].push(sk);
  });

  if(Object.keys(groups).length === 0){
    listEl.innerHTML = '<div class="quest-empty">没有匹配的技能</div>';
    return;
  }

  let html = '';
  Object.keys(groups).forEach(cls => {
    const dkey = 'skills:' + cls;
    const isOpen = _debugOpen(dkey, false);
    html += `<div class="debug-group${isOpen ? ' open' : ''}"><div class="debug-group-head" data-dkey="${dkey}" onclick="toggleDebugGroup(this)">${cls}（${groups[cls].length}）<span class="debug-arrow">${isOpen ? '▲' : '▼'}</span></div><div class="debug-group-body">`;
    groups[cls].forEach(sk => {
      const learned = targetObj.skillProficiency && targetObj.skillProficiency[sk.id] !== undefined;
      html += `<div class="debug-row-item">
        <label style="min-width:110px">${sk.name}</label>
        <button class="debug-btn${learned ? ' success' : ''}" data-give-skill="${charId}|${sk.id}" onclick="debugGiveSkill('${charId}','${sk.id}')">${learned ? '已学' : '发放'}</button>
        <button class="debug-btn" onclick="debugOpenSkillEdit('${sk.id}')">编辑效果</button>
        <span style="color:#667;font-size:11.5px">MP${sk.levels[0].mpCost}</span>
      </div>`;
    });
    html += '</div></div>';
  });
  listEl.innerHTML = html;
}

function filterDebugSkills(){
  const input = document.getElementById('debugSkillSearch');
  renderDebugSkillList(debugSkillChar || 'player', input ? input.value : '');
}
function debugSkillCharSelect(id){ debugSkillChar = id; renderDebugContent(); }
function debugGiveSkill(charId, skillId){
  const obj = getCharObj(charId);
  if(!obj) return;
  if(!obj.skillProficiency) obj.skillProficiency = {};
  if(obj.skillProficiency[skillId] !== undefined){ toast('该角色已学会此技能'); return; }
  obj.skillProficiency[skillId] = 0;
  const sk = SKILLS[skillId];
  toast(`【${getChar(charId).name}】学会了「${sk.name}」`);
  updateAllUI();
  const btn = document.querySelector('button[data-give-skill="' + charId + '|' + skillId + '"]');
  if(btn){
    btn.classList.add('success');
    btn.textContent = '已学';
    btn.disabled = true;
  }
}

/* ============================================================
   调试面板 · 实时编辑（第一期）
   ------------------------------------------------------------
   物品：模板 / 实例的等级、价格、品阶、词条；
   技能：逐级 effects；
   保存后重算角色属性，并同步到当前战斗。
   改动只在内存里，用「数据 → 恢复全部原始数据」还原。
   ============================================================ */
let debugEdit = null;
let debugPreviewLv = 10;
let debugExportOpen = false;
let debugExportFormat = 'js';
/* 调试期间改过的模板（不是实例），供“导出修改”使用 */
let debugChanges = { items:{}, skills:{}, enemies:{} };

const DEBUG_STAT_LABEL = {
  physAtk:'物攻', magicAtk:'魔攻', defBonus:'防御',
  maxHpBonus:'生命上限', maxMpBonus:'魔力上限', spdMod:'速度',
  dodge:'闪避', hitRate:'命中', critRate:'暴击率', critMult:'暴击倍率',
  vitBonus:'体力', spiBonus:'精神力', dmgUp:'造成伤害', dmgTakenDown:'受到伤害',
  physAtkPct:'物攻%', magicAtkPct:'魔攻%',
  ignoreDef:'无视防御', executeBelow:'斩杀阈值', lowHpPower:'低血增伤',
  firstStrike:'首回合增伤', lifestealOnKill:'击杀回血', hpDrainPct:'吸血',
  mpDrainPct:'吸蓝', trueDmgBonus:'附加真实伤害', extraPhysDmg:'附加物理伤害',
  extraMagicDmg:'附加魔法伤害', poisonOnHit:'攻击附加中毒', burnOnHit:'攻击附加灼烧',
  bleedOnHit:'攻击附加流血', silenceOnHit:'攻击附加沉默', freezeOnHit:'攻击附加冰冻', petrifyOnHit:'攻击附加石化',
  stunOnHit:'攻击附加眩晕', sureHit:'必中', multiHit:'多发', splashPct:'溅射',
  counterStart:'开局反击'
};

function debugEsc(s){
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function debugDeep(o){ return JSON.parse(JSON.stringify(o)); }

function debugAllOwners(){
  const list = [];
  if(currentGame) list.push({ id:'player', obj:currentGame });
  const chars = (currentGame && (currentGame.characters || currentGame.npcs)) || {};
  for(const id in chars) list.push({ id:id, obj:chars[id] });
  return list;
}
function debugRecalcAll(){
  debugAllOwners().forEach(o => { if(o.obj) recalcCharStats(o.obj); });
}

function debugGetInstance(ed){
  if(!ed || !currentGame) return null;
  if(ed.bagIdx !== undefined) return currentGame.bag[ed.bagIdx] || null;
  if(ed.charId && ed.slot){
    const owner = getCharObj(ed.charId);
    return owner && owner.equipment ? owner.equipment[ed.slot] : null;
  }
  return null;
}

/* 词条下拉：按载体过滤，带分类前缀，todo 标记 */
function debugAtomOptions(carrier, selected){
  return '<option value=""' + (!selected ? ' selected' : '') + '>— 选择词条 —</option>'
    + effectAtomsFor(carrier).map(a => {
    const cat = EFFECT_CAT_LABEL[a.cat] || a.cat;
    const mark = a.todo ? ' ⚠' : '';
    return '<option value="' + a.id + '"' + (a.id === selected ? ' selected' : '') + '>'
      + '[' + cat + '] ' + a.name + '（' + a.id + '）' + mark + '</option>';
  }).join('');
}
function debugTargetOptions(selected){
  const defs = [
    ['self','自己'], ['ally_single','友方单体'], ['ally_all','友方全体'],
    ['enemy_front_single','敌方前排单体'], ['enemy_front','敌方前排'],
    ['enemy_back_single','敌方后排单体'], ['enemy_back','敌方后排'],
    ['enemy_all','敌方全体'], ['single','当前目标'], ['random','随机敌人']
  ];
  return defs.map(d => '<option value="' + d[0] + '"'
    + (d[0] === selected ? ' selected' : '') + '>' + d[1] + '</option>').join('');
}
function debugRarityOptions(selected){
  return '<option value=""' + (!selected ? ' selected' : '') + '>未定品阶</option>'
    + ITEM_RARITY_ORDER.map(r => '<option value="' + r + '"'
        + (r === selected ? ' selected' : '') + '>' + ITEM_RARITY[r].label
        + '（' + ITEM_RARITY[r].words + ' 条）</option>').join('');
}

/* ---------------- 入口 / 返回 ---------------- */
function debugBackToList(){ debugEdit = null; renderDebugContent(); }

function debugOpenItemEdit(id, source, extra){
  const tpl = EQUIPS[id];
  if(!tpl) return;
  const isEquip = getItemCategory(tpl) === 'equip';
  let work;
  let inst = null;
  if(source === 'template'){
    work = debugDeep(tpl);
    if(!isEquip) work.effects = debugDeep(getItemEffects(tpl));
  }else{
    inst = debugGetInstance(extra || {});
    if(!inst){ toast('找不到这件实例'); return; }
    work = {
      id: id,
      rarity: inst.rarity || tpl.rarity || null,
      words: debugDeep(Array.isArray(inst.words) ? inst.words : (tpl.words || [])),
      wear: inst.wear,
      durability: inst.durability
    };
  }
  debugEdit = {
    kind: 'item', id: id, source: source,
    charId: extra && extra.charId,
    slot: extra && extra.slot,
    bagIdx: extra && extra.bagIdx,
    work: work,
    assumeDesigned: !tpl.draft
  };
  renderDebugContent();
}
function debugOpenItemEditInstance(id, charId, slot, bagIdx){
  if(bagIdx >= 0) debugOpenItemEdit(id, 'bag', { bagIdx: bagIdx });
  else debugOpenItemEdit(id, 'equip', { charId: charId, slot: slot });
}
function debugOpenSkillEdit(id){
  const sk = SKILLS[id];
  if(!sk) return;
  debugEdit = { kind:'skill', id:id, work: debugDeep(sk.levels || []) };
  renderDebugContent();
}

function debugEditHead(title, sub){
  return '<div class="debug-actions"><button class="debug-btn" onclick="debugBackToList()">← 返回列表</button></div>'
    + '<div class="debug-info"><b style="color:#ffcc66">' + debugEsc(title) + '</b><br>' + sub + '</div>';
}

/* ---------------- 物品编辑器 ---------------- */
function renderDebugItemEdit(c){
  const ed = debugEdit;
  const tpl = EQUIPS[ed.id];
  if(!tpl){ debugEdit = null; renderDebugContent(); return; }
  const isEquip = getItemCategory(tpl) === 'equip';
  const w = ed.work;
  const srcText = ed.source === 'template'
    ? '模板：影响之后发放 / 生成的同类物品。'
    : (ed.source === 'equip'
        ? '实例：' + debugEsc(getChar(ed.charId).name) + ' 的「' + (EQUIP_SLOT_LABEL[ed.slot] || ed.slot) + '」。'
        : '实例：行囊第 ' + (ed.bagIdx + 1) + ' 格。');
  const notice = ed.source === 'template'
    ? '模板改动只在内存里（刷新页面还原）；若同步了实例，实例会随下次存档保存。'
    : '实例改动会写进当前存档，下次自动/手动保存后保留。';
  let h = debugEditHead(tpl.name + ' · ' + ed.id, srcText + notice);

  if(ed.source === 'template'){
    h += '<div class="debug-row-item"><label>名称</label>'
      + '<input class="debug-input wide" style="flex:1" value="' + debugEsc(w.name || '') + '" onchange="debugSetEditField(\'name\',this.value)"></div>';
    h += '<div class="debug-row-item"><label>等级</label>'
      + '<input class="debug-input" type="number" min="1" value="' + (w.level || 1) + '" onchange="debugSetEditField(\'level\',this.value)">'
      + '<label style="min-width:40px">价格</label>'
      + '<input class="debug-input" type="number" min="0" value="' + (w.price || 0) + '" onchange="debugSetEditField(\'price\',this.value)">'
      + '</div>';
    h += '<div class="debug-row-item" style="align-items:flex-start"><label>描述</label>'
      + '<textarea class="debug-input debug-textarea" onchange="debugSetEditField(\'desc\',this.value)">'
      + debugEsc(w.desc || '') + '</textarea></div>';
  }else{
    h += '<div class="debug-row-item"><label>模板</label>'
      + '<span class="debug-edit-sub">Lv.' + (tpl.level || 1) + ' · ￥' + (tpl.price || 0)
      + '（实例不改等级/价格；要改请编辑模板）</span></div>';
  }

  if(isEquip){
    h += '<div class="debug-row-item"><label>品阶</label>'
      + '<select class="debug-select" onchange="debugSetEditRarity(this.value)">' + debugRarityOptions(w.rarity) + '</select>';
    if(ed.source === 'template'){
      h += '<label style="display:flex;align-items:center;gap:5px;min-width:0;margin-left:8px">'
        + '<input type="checkbox" ' + (ed.assumeDesigned ? 'checked' : '') + ' onchange="debugSetAssumeDesigned(this.checked)"> 视为已设计</label>';
    }
    h += '</div>';
    h += '<div class="debug-row-item"><label>词条</label><span class="debug-edit-sub">数量不要求严格等于品阶（调试允许）</span></div>';
    h += '<div id="debugItemRowsBox">' + debugRowsHtml(isEquip) + '</div>';
    if(ed.source === 'template' && (tpl.maxWear !== undefined || tpl.durability !== undefined)){
      h += '<div class="debug-row-item"><label>' + (tpl.maxWear !== undefined ? '磨损上限' : '耐久上限') + '</label>'
        + '<input class="debug-input" type="number" min="1" value="' + (tpl.maxWear !== undefined ? (w.maxWear || tpl.maxWear) : (w.durability || tpl.durability)) + '" '
        + 'onchange="debugSetEditField(\'' + (tpl.maxWear !== undefined ? 'maxWear' : 'durability') + '\',this.value)"></div>';
    }
    if(ed.source !== 'template' && (w.wear !== undefined || w.durability !== undefined)){
      h += '<div class="debug-row-item"><label>' + (w.wear !== undefined ? '磨损' : '耐久') + '</label>'
        + '<input class="debug-input" type="number" min="0" value="' + (w.wear !== undefined ? (w.wear || 0) : (w.durability || 0)) + '" '
        + 'onchange="debugSetEditInstanceField(\'' + (w.wear !== undefined ? 'wear' : 'durability') + '\',this.value)"></div>';
    }
  }else{
    h += '<div class="debug-row-item"><label>效果</label><span class="debug-edit-sub">药品 / 即时道具 / 礼物共用</span></div>';
    h += debugRowsHtml(false);
  }

  h += '<div class="debug-preview" id="debugItemPreview">' + debugItemPreviewHtml() + '</div>';

  if(ed.source === 'template'){
    h += '<div class="debug-actions">'
      + '<button class="debug-btn success" onclick="debugSaveItemEdit(\'template\')">保存（只改模板）</button>';
    if(isEquip){
      h += '<button class="debug-btn" onclick="debugSaveItemEdit(\'syncPlain\')">保存并同步未进阶实例</button>'
        + '<button class="debug-btn" onclick="debugSaveItemEdit(\'syncAll\')">保存并强制同步全部实例</button>';
    }
    h += '<button class="debug-btn danger" onclick="debugRevertTemplate()">还原模板</button>'
      + '</div>';
  }else{
    h += '<div class="debug-actions">'
      + '<button class="debug-btn success" onclick="debugSaveItemEdit(\'instance\')">保存到这件实例</button>'
      + '<button class="debug-btn danger" onclick="debugRevertInstance()">还原这件</button>'
      + '</div>';
  }
  c.innerHTML = h;
}

/* 单条词条/效果行：换类型时只重绘这一行 */
function debugWordRowHtml(isEquip, i, x){
  const atom = getEffectAtom(x.type);
  const step = atom && atom.mode === 'rate' ? '0.01' : '1';
  const unit = atom ? (atom.valueUnit || '') : '';
  let h = '<div class="debug-word-row">'
    + '<select class="debug-select" onchange="debugSetRowType(' + i + ',this.value)">' + debugAtomOptions(isEquip ? 'equip' : 'item', x.type) + '</select>'
    + '<input class="debug-input" type="number" step="' + step + '" value="' + (x.value != null ? x.value : 0) + '" oninput="debugSetRowValue(' + i + ',this.value)" id="debugWordVal_' + i + '">'
    + '<span class="debug-unit">' + debugEsc(unit) + '</span>';
  if(!isEquip && atom && atom.status){
    h += '<input class="debug-input" style="width:56px" type="number" min="1" title="持续回合" value="' + (x.duration || atom.duration || 1) + '" onchange="debugSetRowDuration(' + i + ',this.value)">';
  }
  h += '<button class="debug-btn danger" onclick="debugDelRow(' + i + ')">×</button>'
    + '</div>';
  if(atom && atom.valueHint){
    h += '<div class="debug-edit-sub" style="padding:0 0 3px 4px">' + debugEsc(atom.valueHint) + '</div>';
  }
  return h;
}

function debugRowsHtml(isEquip){
  const ed = debugEdit;
  const w = ed.work;
  const list = isEquip ? (w.words = w.words || []) : (w.effects = w.effects || []);
  let h = '';
  list.forEach((x, i) => {
    h += '<div class="debug-word-row-box" id="debugWordRowBox_' + i + '">'
      + debugWordRowHtml(isEquip, i, x) + '</div>';
  });
  h += '<div class="debug-actions"><button class="debug-btn" onclick="debugAddRow()">+ 添加' + (isEquip ? '词条' : '效果') + '</button></div>';
  return h;
}

function debugSetEditField(key, val){
  if(!debugEdit || !debugEdit.work) return;
  if(key === 'name' || key === 'desc') debugEdit.work[key] = String(val || '');
  else debugEdit.work[key] = Number(val) || 0;
  if(key !== 'name' && key !== 'desc') debugRefreshItemPreview();
}
function debugSetEditRarity(val){
  if(!debugEdit) return;
  debugEdit.work.rarity = (val && ITEM_RARITY[val]) ? val : null;
  debugRefreshItemPreview();
}
function debugSetAssumeDesigned(v){
  if(!debugEdit) return;
  debugEdit.assumeDesigned = !!v;
  debugRefreshItemPreview();
}
function debugSetEditInstanceField(key, val){
  if(!debugEdit) return;
  debugEdit.work[key] = Math.max(0, Math.floor(Number(val) || 0));
}
function debugRowList(){
  const ed = debugEdit;
  const tpl = EQUIPS[ed.id];
  const isEquip = getItemCategory(tpl) === 'equip';
  return isEquip ? (ed.work.words = ed.work.words || []) : (ed.work.effects = ed.work.effects || []);
}
function debugSetRowType(i, val){
  const list = debugRowList();
  if(!list[i]) return;
  if(list[i].type === val) return;
  list[i].type = val;
  const atom = getEffectAtom(val);
  if(atom){
    if(!list[i].value) list[i].value = (atom.mode === 'rate') ? 0.05 : 0;
    if(!list[i].duration && atom.status) list[i].duration = atom.duration || 1;
  }
  /* 只重绘这一行，避免整块重建造成下拉“乱跳” */
  const isEquip = getItemCategory(EQUIPS[debugEdit.id]) === 'equip';
  const box = document.getElementById('debugWordRowBox_' + i);
  if(box) box.innerHTML = debugWordRowHtml(isEquip, i, list[i]);
  else renderDebugContent();
  const focusEl = document.getElementById('debugWordVal_' + i);
  if(focusEl) focusEl.focus();
}
function debugSetRowValue(i, val){
  const list = debugRowList();
  if(!list[i]) return;
  list[i].value = Number(val) || 0;
  debugRefreshItemPreview();
}
function debugSetRowDuration(i, val){
  const list = debugRowList();
  if(!list[i]) return;
  list[i].duration = Math.max(1, Math.floor(Number(val) || 1));
}
function debugRefreshItemRows(){
  const isEquip = getItemCategory(EQUIPS[debugEdit.id]) === 'equip';
  const box = document.getElementById('debugItemRowsBox');
  if(box) box.innerHTML = debugRowsHtml(isEquip);
  else renderDebugContent();
  debugRefreshItemPreview();
}
function debugAddRow(){
  const list = debugRowList();
  list.push({ type:'', value:0 });
  debugRefreshItemRows();
  const box = document.getElementById('debugWordRowBox_' + (list.length - 1));
  if(box && box.scrollIntoView) box.scrollIntoView({ block:'nearest' });
}
function debugDelRow(i){
  const list = debugRowList();
  list.splice(i, 1);
  debugRefreshItemRows();
}

function debugItemPreviewHtml(){
  if(!debugEdit) return '';
  const ed = debugEdit;
  const tpl = EQUIPS[ed.id];
  const isEquip = getItemCategory(tpl) === 'equip';
  const w = ed.work;
  if(!isEquip){
    const lines = (w.effects || []).filter(e => e && e.type).map(e => {
      const atom = getEffectAtom(e.type);
      const fn = (typeof EFFECT_DESC !== 'undefined') ? EFFECT_DESC[e.type] : null;
      return '<div>' + debugEsc((atom && atom.name) || e.type) + '：'
        + debugEsc(fn ? fn(e.value) : e.value) + '</div>';
    });
    return '<b>效果预览</b>' + (lines.length ? lines.join('') : '<div style="color:#667">暂无效果（存档/商店仍会当作未设计）</div>');
  }
  const agg = {};
  (w.words || []).forEach(x => {
    if(!x || !x.type) return;
    const atom = getEffectAtom(x.type);
    if(!atom) return;
    const key = atom.equipStat || ('atom:' + atom.id);
    if(!agg[key]) agg[key] = {
      label: (atom.equipStat && DEBUG_STAT_LABEL[atom.equipStat]) || atom.name,
      value: 0, unit: atom.valueUnit || '', stack: atom.stack || 'add'
    };
    const val = Number(x.value) || 0;
    if(agg[key].stack === 'max') agg[key].value = Math.max(agg[key].value, val);
    else agg[key].value += val;
  });
  const parts = Object.keys(agg).map(k => {
    const a = agg[k];
    return a.label + ' +' + a.value + (a.unit ? ' ' + a.unit : '');
  });
  const used = (w.words || []).filter(x => x && x.type).length;
  const need = (w.rarity && ITEM_RARITY[w.rarity]) ? ITEM_RARITY[w.rarity].words : 0;
  let h = '<b>词条汇总</b>' + (parts.length ? '<div>' + parts.join('　') + '</div>' : '<div style="color:#667">暂无词条</div>');
  h += '<div style="color:#667;margin-top:4px">品阶需要 ' + need + ' 条，当前 ' + used + ' 条'
    + (need && used !== need ? ' <span style="color:#ffcc66">（调试允许，但商店/掉落会视为未设计）</span>' : '') + '</div>';
  if(ed.source === 'template' && tpl.draft && !ed.assumeDesigned){
    h += '<div style="color:#ff8899;margin-top:4px">draft=true：属性计算会跳过词条，勾选「视为已设计」后才生效。</div>';
  }
  return h;
}
function debugRefreshItemPreview(){
  const el = document.getElementById('debugItemPreview');
  if(el) el.innerHTML = debugItemPreviewHtml();
}

function debugSyncItemInstances(tpl, before, all){
  const words = debugDeep(tpl.words || []);
  const rarity = tpl.rarity;
  const apply = inst => {
    if(!inst || inst.id !== tpl.id) return;
    if(!all && !isPlainInstance(inst, before)) return;
    if(rarity) inst.rarity = rarity;
    else delete inst.rarity;
    inst.words = debugDeep(words);
  };
  debugAllOwners().forEach(o => {
    const eq = o.obj && o.obj.equipment;
    if(!eq) return;
    EQUIP_SLOTS.forEach(slot => { if(eq[slot]) apply(eq[slot]); });
  });
  (currentGame.bag || []).forEach(apply);
}

function debugSaveItemEdit(mode){
  if(!debugEdit || debugEdit.kind !== 'item') return;
  const ed = debugEdit;
  const tpl = EQUIPS[ed.id];
  if(!tpl) return;
  const isEquip = getItemCategory(tpl) === 'equip';
  const w = ed.work;

  if(ed.source === 'template'){
    const before = debugDeep(tpl);
    if(w.name !== undefined) tpl.name = String(w.name).trim() || tpl.name;
    if(w.desc !== undefined) tpl.desc = String(w.desc);
    tpl.level = Math.max(1, Math.floor(Number(w.level) || 1));
    tpl.price = Math.max(0, Math.floor(Number(w.price) || 0));
    if(isEquip){
      tpl.rarity = (w.rarity && ITEM_RARITY[w.rarity]) ? w.rarity : null;
      tpl.words = (w.words || []).filter(x => x && x.type).map(x => {
        const o = { type:x.type, value:Number(x.value) || 0 };
        if(x.duration) o.duration = Number(x.duration);
        return o;
      });
      if(tpl.maxWear !== undefined && w.maxWear !== undefined) tpl.maxWear = Math.max(1, Math.floor(Number(w.maxWear) || 1));
      if(tpl.durability !== undefined && w.durability !== undefined) tpl.durability = Math.max(1, Math.floor(Number(w.durability) || 1));
      tpl.draft = !(ed.assumeDesigned && tpl.rarity && tpl.words.length);
    }else{
      tpl.effects = (w.effects || []).filter(x => x && x.type).map(x => {
        const o = { type:x.type, value:Number(x.value) || 0 };
        if(x.duration) o.duration = Number(x.duration);
        if(x.target) o.target = x.target;
        return o;
      });
      delete tpl.recoverHp;
      delete tpl.recoverMp;
    }
    if(isEquip && (mode === 'syncPlain' || mode === 'syncAll')){
      debugSyncItemInstances(tpl, before, mode === 'syncAll');
    }
    debugChanges.items[ed.id] = true;
  }else{
    const inst = debugGetInstance(ed);
    if(!inst){ toast('实例不存在'); return; }
    if(isEquip){
      inst.rarity = (w.rarity && ITEM_RARITY[w.rarity]) ? w.rarity : null;
      inst.words = (w.words || []).filter(x => x && x.type)
        .map(x => ({ type:x.type, value:Number(x.value) || 0 }));
      if(w.wear !== undefined) inst.wear = Math.max(0, Math.floor(Number(w.wear) || 0));
      if(w.durability !== undefined) inst.durability = Math.max(0, Math.floor(Number(w.durability) || 0));
    }
  }

  debugRecalcAll();
  updateAllUI();
  const synced = debugSyncBattle();
  toast('已保存' + (synced ? '，并同步到当前战斗' : ''));
  debugEdit = null;
  renderDebugContent();
}

/* 还原：模板 / 实例 / 技能 */
function debugRevertTemplate(){
  const ed = debugEdit;
  if(!ed || ed.source !== 'template') return;
  if(_ORIGINAL_DATA.EQUIPS[ed.id]) EQUIPS[ed.id] = debugDeep(_ORIGINAL_DATA.EQUIPS[ed.id]);
  delete debugChanges.items[ed.id];
  debugRecalcAll();
  updateAllUI();
  debugSyncBattle();
  toast('模板已还原为文件原始值');
  debugEdit = null;
  renderDebugContent();
}
function debugRevertInstance(){
  const ed = debugEdit;
  if(!ed) return;
  const inst = debugGetInstance(ed);
  if(!inst){ toast('实例不存在'); return; }
  const tpl = EQUIPS[ed.id];
  if(!tpl) return;
  /* 还原 = 清掉实例覆盖，回到当前模板词条（磨损/耐久保留） */
  if(tpl.rarity) inst.rarity = tpl.rarity; else delete inst.rarity;
  inst.words = debugDeep(tpl.words || []);
  debugRecalcAll();
  updateAllUI();
  debugSyncBattle();
  toast('已还原为模板词条');
  debugEdit = null;
  renderDebugContent();
}

/* 把当前数据同步到正在进行的战斗（战斗单位是开局快照） */
function debugSyncBattle(){
  if(typeof battleState === 'undefined' || !battleState || battleState.over) return false;
  (battleState.allies || []).forEach(u => {
    const owner = u.isPlayer ? currentGame : (u.npcId ? getNpc(u.npcId) : null);
    if(!owner) return;
    const attr = getCharAttrStatsWithEquip(owner);
    const eqs = calcEquipStats(owner);
    u.base = Object.assign({}, owner.base);
    u.growth = Object.assign({}, owner.growth);
    u.equipment = owner.equipment ? debugDeep(owner.equipment) : {};
    u.vit = attr.vit; u.spi = attr.spi;
    u.physAtk = attr.physAtk; u.magicAtk = attr.magicAtk;
    u.def = attr.def; u.spd = attr.spd;
    const maxHp = Math.floor((attr.maxHp + (eqs.maxHpBonus || 0)
      + getPassiveFlatBonus(owner, 'maxhp_up')) * (1 + getPassiveMaxHpBonus(owner) / 100));
    const maxMp = attr.maxMp + (eqs.maxMpBonus || 0) + getPassiveFlatBonus(owner, 'maxmp_up');
    u.maxHp = maxHp; u.maxMp = maxMp;
    u.hp = Math.max(1, Math.min(maxHp, Number(u.hp) || 1));
    u.mp = Math.max(0, Math.min(maxMp, Number(u.mp) || 0));
    u.reflectArmorRate = eqs.reflectArmor || 0;
    u.reflectAccRate = eqs.reflectAcc || 0;
    if(typeof applyUnitCombatRates === 'function') applyUnitCombatRates(u, owner, eqs);
    else u.dodgeBonus = eqs.dodge || 0;
    initArmorParts(u);
  });
  /* 敌人：按角色卡模板重算（debug 敌人页改的就是模板） */
  const syncEnemy = u => {
    if(!u) return;
    const tpl = getCharacterTemplate(u.charId || u.name);
    if(!tpl) return;
    const attr = getCharAttrStats(tpl, u.lv);
    u.maxHp = attr.maxHp;
    u.maxMp = attr.maxMp;
    u.hp = Math.max(1, Math.min(u.maxHp, Number(u.hp) || 1));
    u.mp = Math.max(0, Math.min(u.maxMp, Number(u.mp) || 0));
    u.vit = attr.vit; u.spi = attr.spi;
    u.physAtk = attr.physAtk; u.magicAtk = attr.magicAtk;
    u.def = attr.def; u.spd = attr.spd;
    u.equipment = debugDeep(tpl.equipment || {});
    const eqSkills = (tpl.equippedSkills || []).filter(Boolean);
    if(eqSkills.length) u.skills = eqSkills;
    else{
      const pool = (tpl.skillPool || tpl.skills || []).filter(Boolean);
      if(pool.length) u.skills = pool;
    }
    if(tpl.ai) u.ai = tpl.ai;
    if(tpl.behavior) u.behavior = tpl.behavior;
  };
  (battleState.frontSlots || []).forEach(syncEnemy);
  (battleState.backSlots || []).forEach(syncEnemy);
  renderBattle();
  return true;
}

/* ---------------- 技能编辑器 ---------------- */
function renderDebugSkillEdit(c){
  const ed = debugEdit;
  const sk = SKILLS[ed.id];
  if(!sk){ debugEdit = null; renderDebugContent(); return; }
  let h = debugEditHead(sk.name + ' · ' + sk.id,
    '职业：' + debugEsc(sk.classLimit || '通用')
    + '。改动写入全局技能表，保存后立即生效（战斗中也立即生效）。');

  h += '<div class="debug-row-item"><label>试算目标</label>'
    + '<input class="debug-input" type="number" min="1" max="50" value="' + debugPreviewLv + '" onchange="debugSetPreviewLv(this.value)">'
    + '<span class="debug-edit-sub">普通怪等级</span>'
    + '<span class="debug-edit-sub">预览角色：' + debugEsc(getChar(debugSkillChar || 'player').name) + '</span></div>';

  (ed.work || []).forEach((lv, i) => {
    const open = i === 0 ? ' open' : '';
    h += '<div class="debug-group' + open + '">'
      + '<div class="debug-group-head" onclick="this.parentElement.classList.toggle(\'open\')">'
      + 'Lv.' + (i + 1) + ' · MP ' + (lv.mpCost || 0)
      + '<span class="debug-arrow">▼</span></div>'
      + '<div class="debug-group-body">';
    h += '<div class="debug-row-item"><label>MP 消耗</label>'
      + '<input class="debug-input" type="number" min="0" value="' + (lv.mpCost || 0) + '" onchange="debugSetSkillMp(' + i + ',this.value)"></div>';

    const list = (lv.effects = lv.effects || []);
    h += '<div id="debugSkillEffectList_' + i + '">' + debugSkillEffectsHtml(i) + '</div>';
    h += '<div class="debug-preview" id="debugSkillPreview_' + i + '">' + debugSkillPreviewHtml(i) + '</div>';
    h += '</div></div>';
  });

  h += '<div class="debug-actions"><button class="debug-btn success" onclick="debugSaveSkillEdit()">保存技能</button>'
    + '<button class="debug-btn danger" onclick="debugRevertSkill()">还原技能</button></div>';
  c.innerHTML = h;
}

/* 某一级的全部效果行 + 添加按钮（添加/删除时只重绘这一块） */
function debugSkillEffectsHtml(i){
  const lv = debugEdit && debugEdit.work[i];
  if(!lv) return '';
  const list = (lv.effects = lv.effects || []);
  let h = '';
  list.forEach((e, j) => {
    h += '<div class="debug-skill-effect-box" id="debugEffectRowBox_' + i + '_' + j + '">'
      + debugSkillEffectHtml(i, j, e) + '</div>';
  });
  h += '<div class="debug-actions"><button class="debug-btn" onclick="debugAddSkillEffect(' + i + ')">+ 添加效果</button></div>';
  return h;
}

/* 单条技能效果行：换词条类型时只重绘这一行，不整块重建 */
function debugSkillEffectHtml(i, j, e){
  const atom = getEffectAtom(e.type);
  const step = atom && atom.mode === 'rate' ? '0.01' : '1';
  let h = '<div class="debug-word-row">'
    + '<select class="debug-select" onchange="debugSetSkillEffect(' + i + ',' + j + ',\'type\',this.value)">'
    + debugAtomOptions('skill', e.type) + '</select>'
    + '<input class="debug-input" type="number" step="' + step + '" value="' + (e.value != null ? e.value : 0) + '" '
    + 'oninput="debugSetSkillEffect(' + i + ',' + j + ',\'value\',this.value)" id="debugSkillVal_' + i + '_' + j + '">'
    + '<span class="debug-unit">' + debugEsc(atom ? (atom.valueUnit || '') : '') + '</span>';
  /* 2026-11 起技能伤害 = 数值 + 武器物攻，不再有「倍率」字段 */
  h += '<select class="debug-select" onchange="debugSetSkillEffect(' + i + ',' + j + ',\'target\',this.value)">'
    + debugTargetOptions(e.target || (atom && atom.defaultTarget) || 'enemy_front_single') + '</select>';
  if(atom && atom.status){
    h += '<input class="debug-input" style="width:56px" type="number" min="1" title="持续回合" '
      + 'value="' + (e.duration || atom.duration || 1) + '" '
      + 'onchange="debugSetSkillEffect(' + i + ',' + j + ',\'duration\',this.value)">';
  }
  h += '<button class="debug-btn danger" onclick="debugDelSkillEffect(' + i + ',' + j + ')">×</button>'
    + '</div>';
  /* 高级字段：chance / cost / buffStat / options 等原样保留，用 JSON 编辑 */
  const extras = {};
  Object.keys(e).forEach(k => {
    if(['type','value','target','duration','mult'].indexOf(k) >= 0) return;
    extras[k] = e[k];
  });
  h += '<details class="debug-adv"><summary>高级字段（JSON）：'
    + (Object.keys(extras).length ? Object.keys(extras).join(', ') : '无')
    + '</summary><textarea class="debug-json" id="debugEffJson_' + i + '_' + j + '" spellcheck="false">'
    + debugEsc(JSON.stringify(extras)) + '</textarea>'
    + '<div class="debug-actions"><button class="debug-btn" onclick="debugApplyEffectJson(' + i + ',' + j + ')">应用 JSON</button></div></details>';
  return h;
}

function debugSetPreviewLv(v){
  debugPreviewLv = Math.max(1, Math.min(50, Math.floor(Number(v) || 1)));
  (debugEdit && debugEdit.work || []).forEach((lv, i) => debugRefreshSkillPreview(i));
}
function debugSetSkillMp(li, val){
  if(!debugEdit || !debugEdit.work[li]) return;
  debugEdit.work[li].mpCost = Math.max(0, Math.floor(Number(val) || 0));
}
function debugSetSkillEffect(li, ei, key, val){
  const lv = debugEdit && debugEdit.work[li];
  if(!lv || !lv.effects || !lv.effects[ei]) return;
  const e = lv.effects[ei];
  if(key === 'type' && e.type === val) return;
  if(key === 'value') e.value = Number(val) || 0;
  else if(key === 'duration') e.duration = Math.max(1, Math.floor(Number(val) || 1));
  else if(key === 'mult') e.mult = Math.max(0, Number(val) || 0);
  else e[key] = val;
  if(key === 'type'){
    const atom = getEffectAtom(val);
    if(atom){
      if(atom.defaultTarget) e.target = atom.defaultTarget;
      if(atom.status && !e.duration) e.duration = atom.duration || 1;
      if(atom.mode === 'rate' && !e.value) e.value = 0.05;
      if(e.value === undefined) e.value = 0;
    }
    /* 只重绘这一条效果行，避免整块重建造成下拉“乱跳” */
    const box = document.getElementById('debugEffectRowBox_' + li + '_' + ei);
    if(box) box.innerHTML = debugSkillEffectHtml(li, ei, e);
    else renderDebugContent();
    const focusEl = document.getElementById('debugSkillVal_' + li + '_' + ei);
    if(focusEl) focusEl.focus();
    return;
  }
  debugRefreshSkillPreview(li);
}
/* 高级字段（JSON）：chance / cost / buffStat / options / fixed 等 */
function debugApplyEffectJson(li, ei){
  const el = document.getElementById('debugEffJson_' + li + '_' + ei);
  if(!el) return;
  let obj;
  try{
    obj = JSON.parse(el.value || '{}');
  }catch(err){
    toast('JSON 格式错误');
    return;
  }
  if(!obj || Array.isArray(obj) || typeof obj !== 'object'){
    toast('高级字段必须是 JSON 对象');
    return;
  }
  const lv = debugEdit && debugEdit.work[li];
  const e = lv && lv.effects ? lv.effects[ei] : null;
  if(!e) return;
  const CORE = ['type','value','target','duration','mult'];
  Object.keys(e).forEach(k => { if(CORE.indexOf(k) < 0) delete e[k]; });
  Object.keys(obj).forEach(k => { if(CORE.indexOf(k) < 0) e[k] = obj[k]; });
  /* 只重绘这一条效果行 */
  const box = document.getElementById('debugEffectRowBox_' + li + '_' + ei);
  if(box) box.innerHTML = debugSkillEffectHtml(li, ei, e);
  else renderDebugContent();
  debugRefreshSkillPreview(li);
  toast('高级字段已应用');
}
function debugRefreshSkillEffects(li){
  const box = document.getElementById('debugSkillEffectList_' + li);
  if(box) box.innerHTML = debugSkillEffectsHtml(li);
  else renderDebugContent();
  debugRefreshSkillPreview(li);
}
function debugAddSkillEffect(li){
  const lv = debugEdit && debugEdit.work[li];
  if(!lv) return;
  lv.effects = lv.effects || [];
  lv.effects.push({ type:'phys_dmg', value:20, target:'enemy_front_single' });
  debugRefreshSkillEffects(li);
  const box = document.getElementById('debugEffectRowBox_' + li + '_' + (lv.effects.length - 1));
  if(box && box.scrollIntoView) box.scrollIntoView({ block:'nearest' });
}
function debugDelSkillEffect(li, ei){
  const lv = debugEdit && debugEdit.work[li];
  if(!lv || !lv.effects) return;
  lv.effects.splice(ei, 1);
  debugRefreshSkillEffects(li);
}
function debugRefreshSkillPreview(li){
  const el = document.getElementById('debugSkillPreview_' + li);
  if(el) el.innerHTML = debugSkillPreviewHtml(li);
}
function debugSkillPreviewHtml(li){
  if(!debugEdit) return '';
  const caster = getCharObj(debugSkillChar || 'player');
  if(!caster) return '';
  const lvNum = Math.max(1, Math.min(50, Math.floor(Number(debugPreviewLv) || 1)));
  /* 三种目标防御：杂兵（3~4 只群战）/ 普通（1~2 只）/ 精英（strong）。
     数值平衡规划的口径是三档技能对着"杂兵"算净伤。 */
  const defMinion = Math.round(getEnemyDerivedStats(lvNum, 'minion').def || 0);
  const defNormal = Math.round(getEnemyDerivedStats(lvNum, 'normal').def || 0);
  const defStrong = Math.round(getEnemyDerivedStats(lvNum, 'strong').def || 0);
  const netTriple = raw => [defMinion, defNormal, defStrong].map(d => {
    const v = raw - d;
    return v > 0 ? String(v) : '格挡';
  }).join(' / ');
  const eq = calcEquipStats(caster);
  const lines = [];
  ((debugEdit.work[li] && debugEdit.work[li].effects) || []).forEach(e => {
    if(!e || !e.type) return;
    if(e.type === 'phys_dmg'){
      const core = caster.physAtk || caster.derivedPhysAtk || 0;
      const base = (Number(e.value) || 0) + core + (eq.physAtk || 0);
      const raw = Math.floor(calcFinalPhysAtk(caster, base));
      lines.push('物理：面板 ' + raw + ' → 杂兵/普通/精英 = ' + netTriple(raw));
    }else if(e.type === 'magic_dmg'){
      const core = caster.magicAtk || caster.derivedMagicAtk || 0;
      const base = (Number(e.value) || 0) + core + (eq.magicAtk || 0);
      const raw = Math.floor(calcFinalMagicAtk(caster, base));
      lines.push('魔法：面板 ' + raw + ' → 杂兵/普通/精英 = ' + netTriple(raw));
    }else if(e.type === 'true_dmg'){
      lines.push('真实：' + (Number(e.value) || 0) + ' 点（不减防御）');
    }else if(e.type === 'hp_heal'){
      lines.push('治疗：' + ((Number(e.value) || 0) + Math.floor((Number(caster.spi) || 0) * 0.5)) + '（含精神力）');
    }else if(e.type === 'hp_heal_pct'){
      lines.push('治疗：最大 HP 的 ' + (Number(e.value) || 0) + '%');
    }else{
      const line = (typeof describeEffectLine === 'function') ? describeEffectLine(e) : '';
      if(line) lines.push(line);
    }
  });
  return '<b>试算（Lv.' + lvNum + ' 防御：杂兵 ' + defMinion + ' / 普通 ' + defNormal + ' / 精英 ' + defStrong + '）</b>'
    + (lines.length ? lines.map(t => '<div>' + debugEsc(t) + '</div>').join('')
        : '<div style="color:#667">暂无效果（白板技能）</div>')
    + '<div style="color:#667;margin-top:4px">未计暴击、浮动、增伤/减伤与状态。</div>';
}
function debugRevertSkill(){
  const ed = debugEdit;
  if(!ed || ed.kind !== 'skill') return;
  if(_ORIGINAL_DATA.SKILLS[ed.id]) SKILLS[ed.id] = debugDeep(_ORIGINAL_DATA.SKILLS[ed.id]);
  delete debugChanges.skills[ed.id];
  toast('技能已还原为文件原始值');
  if(typeof battleState !== 'undefined' && battleState && !battleState.over) renderBattleSkills();
  debugEdit = null;
  renderDebugContent();
}
function debugSaveSkillEdit(){
  if(!debugEdit || debugEdit.kind !== 'skill') return;
  const sk = SKILLS[debugEdit.id];
  if(!sk) return;
  (sk.levels || []).forEach((lv, i) => {
    const src = debugEdit.work[i] || {};
    lv.mpCost = Math.max(0, Math.floor(Number(src.mpCost) || 0));
    lv.effects = (src.effects || []).filter(e => e && e.type).map(e => {
      const o = Object.assign({}, e);
      o.value = Number(e.value) || 0;
      if(!o.target){
        const atom = getEffectAtom(o.type);
        if(atom && atom.defaultTarget) o.target = atom.defaultTarget;
      }
      if(o.duration !== undefined) o.duration = Math.max(1, Math.floor(Number(o.duration) || 1));
      return o;
    });
  });
  sk.draft = (sk.levels || []).every(lv => !(lv.effects && lv.effects.length));
  debugChanges.skills[sk.id] = true;
  toast('技能已保存，立即生效');
  if(typeof battleState !== 'undefined' && battleState && !battleState.over) renderBattleSkills();
  debugEdit = null;
  renderDebugContent();
}

function renderDebugEquips(c){
  if(!currentGame){ c.innerHTML = '<div class="quest-empty">尚未创建角色</div>'; return; }
  const charIds = ['player'];
  const q = currentGame.queue;
  ['front','back','rest'].forEach(r => q[r].forEach(cid => {
    if(cid && cid !== 'player' && !charIds.includes(cid)) charIds.push(cid);
  }));
  const sel = debugEquipChar || 'player';

  c.innerHTML += `<div class="debug-info">选择角色，点击物品右侧「发放」入包；点「编辑」可实时改等级/价格/品阶/词条。支持搜索。</div>`;
  c.innerHTML += `<div class="debug-actions">`;
  charIds.forEach(id => {
    const ch = getChar(id);
    c.innerHTML += `<button class="debug-btn${sel === id ? ' success' : ''}" onclick="debugEquipCharSelect('${id}')">${ch.name}</button>`;
  });
  c.innerHTML += `<button class="debug-btn danger" onclick="debugEquipClear('${sel}')">清空该角色装备</button></div>`;
  c.innerHTML += `<div class="debug-search">
    <input type="text" id="debugEquipSearch" placeholder="搜索物品名 / 标签 / 描述..." oninput="filterDebugEquips()">
  </div>`;
  c.innerHTML += `<div id="debugEquipList"></div>`;
  c.innerHTML += `<div id="debugInstanceList"></div>`;
  renderDebugInstanceList(sel);
  renderDebugEquipList(sel, '');
}

function renderDebugEquipList(charId, keyword){
  const listEl = document.getElementById('debugEquipList');
  if(!listEl) return;
  const kw = (keyword || '').toLowerCase().trim();

  const groups = {weapon:'武器', armor:'防具', accessory:'饰品', consumable:'药品', material:'材料', other:'其他'};
  let html = '';
  let total = 0;

  Object.keys(groups).forEach(type => {
    const list = Object.values(EQUIPS).filter(e => {
      if(e.type !== type) return false;
      if(!kw) return true;
      const name = (e.name || '').toLowerCase();
      const desc = (e.desc || '').toLowerCase();
      const tags = (e.tags || []).join(' ').toLowerCase();
      return name.includes(kw) || desc.includes(kw) || tags.includes(kw);
    });
    if(list.length === 0) return;
    total += list.length;

    const byLevel = {};
    list.forEach(e => {
      const lv = e.level || 1;
      if(!byLevel[lv]) byLevel[lv] = [];
      byLevel[lv].push(e);
    });

    const dkey = 'equips:' + type;
    const isOpen = _debugOpen(dkey, false);
    html += `<div class="debug-group${isOpen ? ' open' : ''}"><div class="debug-group-head" data-dkey="${dkey}" onclick="toggleDebugGroup(this)">${groups[type]}（${list.length}）<span class="debug-arrow">${isOpen ? '▲' : '▼'}</span></div><div class="debug-group-body">`;
    Object.keys(byLevel).sort((a, b) => Number(a) - Number(b)).forEach(lv => {
      html += `<div class="debug-level-head">Lv.${lv}</div>`;
      byLevel[lv].forEach(eq => {
        html += `<div class="debug-row-item">
          <label style="min-width:140px">${eq.name}</label>
          <button class="debug-btn" onclick="debugGiveEquip('${charId}','${eq.id}')">发放</button>
          <button class="debug-btn" onclick="debugOpenItemEdit('${eq.id}','template')">编辑</button>
          <span style="color:#667;font-size:11.5px">￥${eq.price || 0}</span>
        </div>`;
      });
    });
    html += '</div></div>';
  });

  if(total === 0){
    listEl.innerHTML = '<div class="quest-empty">没有匹配的装备</div>';
  }else{
    listEl.innerHTML = html;
  }
}

function filterDebugEquips(){
  const input = document.getElementById('debugEquipSearch');
  renderDebugEquipList(debugEquipChar || 'player', input ? input.value : '');
}
function debugEquipCharSelect(id){ debugEquipChar = id; renderDebugContent(); }
function debugGiveEquip(charId, itemId){
  const tpl = EQUIPS[itemId];
  if(!tpl) return;
  addItemToBag(itemId, tpl.maxWear, tpl.durability);
  toast(`已发放 ${tpl.name} 到行囊`);
  updateAllUI();
}
function debugEquipClear(charId){
  const obj = getCharObj(charId);
  if(!obj) return;
  obj.equipment = makeEmptyEquipment();
  toast('已清空装备');
  updateAllUI();
  renderDebugContent();
}

/* 实例编辑列表：已装备 + 行囊里的装备 */
function renderDebugInstanceList(charId){
  const el = document.getElementById('debugInstanceList');
  if(!el) return;
  const ch = getCharObj(charId);
  let h = '<div class="debug-info">实例编辑：只改这一件（不动模板），适合测试具体 build。</div>';

  const eq = (ch && ch.equipment) || {};
  const equipped = [];
  EQUIP_SLOTS.forEach(slot => {
    const inst = eq[slot];
    if(!inst) return;
    const tpl = EQUIPS[inst.id];
    if(!tpl) return;
    const ri = inst.rarity && ITEM_RARITY[inst.rarity];
    equipped.push('<div class="debug-row-item">'
      + '<label style="min-width:74px">' + (EQUIP_SLOT_LABEL[slot] || slot) + '</label>'
      + '<span style="flex:1;min-width:0">' + debugEsc(tpl.name)
      + ' <span style="color:#667;font-size:11.5px">' + (ri ? ri.label : '-') + ' · ' + ((inst.words || []).length) + ' 条</span></span>'
      + '<button class="debug-btn" onclick="debugOpenItemEditInstance(\'' + inst.id + '\',\'' + charId + '\',\'' + slot + '\',-1)">编辑实例</button>'
      + '</div>');
  });
  if(equipped.length){
    h += '<div class="debug-group open"><div class="debug-group-head" onclick="this.parentElement.classList.toggle(\'open\')">'
      + '该角色已装备（' + equipped.length + '）<span class="debug-arrow">▼</span></div>'
      + '<div class="debug-group-body">' + equipped.join('') + '</div></div>';
  }else{
    h += '<div class="debug-edit-sub" style="margin:2px 0 8px">该角色没有装备。</div>';
  }

  const bagRows = [];
  (currentGame.bag || []).forEach((it, idx) => {
    const tpl = EQUIPS[it.id];
    if(!tpl || getItemCategory(tpl) !== 'equip') return;
    const ri = it.rarity && ITEM_RARITY[it.rarity];
    bagRows.push('<div class="debug-row-item">'
      + '<label style="min-width:74px">#' + (idx + 1) + '</label>'
      + '<span style="flex:1;min-width:0">' + debugEsc(tpl.name) + (it.count > 1 ? ' ×' + it.count : '')
      + ' <span style="color:#667;font-size:11.5px">' + (ri ? ri.label : '-') + ' · ' + ((it.words || []).length) + ' 条</span></span>'
      + '<button class="debug-btn" onclick="debugOpenItemEditInstance(\'' + it.id + '\',\'' + charId + '\',\'\',' + idx + ')">编辑实例</button>'
      + '</div>');
  });
  h += '<div class="debug-group"><div class="debug-group-head" onclick="this.parentElement.classList.toggle(\'open\')">'
    + '行囊中的装备实例（' + bagRows.length + '）<span class="debug-arrow">▼</span></div>'
    + '<div class="debug-group-body">' + (bagRows.length ? bagRows.join('') : '<div class="debug-edit-sub">行囊里没有装备。</div>') + '</div></div>';

  el.innerHTML = h;
}

function renderDebugEnemies(c){
  Object.keys(CHARACTERS).forEach(name => {
    const t = CHARACTERS[name];
    const lv = t.suggestedLevel || 1;
    const s = getCharAttrStats(t, lv);
    const dkey = 'enemy:' + name;
    const isOpen = _debugOpen(dkey, false);
    c.innerHTML += `<div class="debug-group${isOpen ? ' open' : ''}"><div class="debug-group-head" data-dkey="${dkey}" onclick="toggleDebugGroup(this)">${t.name||name}（卡Lv.1 / 建议Lv.${lv}）<span class="debug-arrow">${isOpen ? '▲' : '▼'}</span></div><div class="debug-group-body">
      <div class="debug-row-item"><label>建议等级</label><input class="debug-input" type="number" value="${lv}" onchange="debugSetEnemy('${name}','suggestedLevel',this.value)"></div>
      <div class="debug-row-item"><label>体力</label><input class="debug-input" type="number" value="${s.vit}" onchange="debugSetEnemyAttr('${name}','vit',this.value)"></div>
      <div class="debug-row-item"><label>精神力</label><input class="debug-input" type="number" value="${s.spi}" onchange="debugSetEnemyAttr('${name}','spi',this.value)"></div>
      <div class="debug-row-item"><label>派生</label><span style="color:#8cb;font-size:11.5px">HP ${s.maxHp}　MP ${s.maxMp}　物攻 ${s.physAtk}　魔攻 ${s.magicAtk}　防御 ${s.def}　速度 ${s.spd}</span></div>
    </div></div>`;
  });
}
function debugSetEnemy(name, key, val){
  const t = CHARACTERS[name];
  if(!t) return;
  if(key === 'suggestedLevel') t.suggestedLevel = Math.max(1, Number(val) || 1);
  else t[key] = Number(val) || 0;
  debugChanges.enemies[name] = true;
  if(debugSyncBattle()) toast('已同步到当前战斗');
  renderDebugContent();
}
function debugSetEnemyAttr(name, key, val){
  const t = CHARACTERS[name];
  if(!t) return;
  if(!t.base) t.base = {};
  t.base[key] = Number(val) || 0;
  debugChanges.enemies[name] = true;
  if(debugSyncBattle()) toast('已同步到当前战斗');
  renderDebugContent();
}

function renderDebugBattle(c){
  if(!currentGame){ c.innerHTML = '<div class="quest-empty">尚未创建角色</div>'; return; }
  const gKey = 'battle:global';
  const gOpen = _debugOpen(gKey, true);
  c.innerHTML += `<div class="debug-group${gOpen ? ' open' : ''}"><div class="debug-group-head" data-dkey="${gKey}" onclick="toggleDebugGroup(this)">全局参数<span class="debug-arrow">${gOpen ? '▲' : '▼'}</span></div><div class="debug-group-body">
    <div class="debug-row-item"><label>闪避上限</label><span style="color:#ffcc66">${DODGE_CAP * 100}%</span></div>
    <div class="debug-row-item"><label>熟练度门槛(6级)</label><span style="color:#ffcc66">${PROF_CURVE.join(' / ')}</span></div>
    <div class="debug-row-item"><label>SPD下限</label><span style="color:#ffcc66">${SPD_MIN}</span></div>
    <div class="debug-row-item"><label>堆叠上限</label><span style="color:#ffcc66">${STACK_MAX}</span></div>
    <div class="debug-row-item"><label>玩家等级</label><input class="debug-input" type="number" value="${currentGame.level}" onchange="debugSet('player','level',this.value)"></div>
    <div class="debug-row-item"><label>玩家金钱</label><input class="debug-input" type="number" value="${currentGame.money}" onchange="debugSet('player','money',this.value)"></div>
  </div></div>`;
  const qbKey = 'battle:quick';
  const qbOpen = _debugOpen(qbKey, true);
  c.innerHTML += `<div class="debug-group${qbOpen ? ' open' : ''}"><div class="debug-group-head" data-dkey="${qbKey}" onclick="toggleDebugGroup(this)">快速战斗<span class="debug-arrow">${qbOpen ? '▲' : '▼'}</span></div><div class="debug-group-body">
    <div class="debug-actions">
      <button class="debug-btn" onclick="debugTriggerBattle('enc_001')">北郊</button>
      <button class="debug-btn" onclick="debugTriggerBattle('enc_003')">西郊</button>
      <button class="debug-btn" onclick="debugTriggerBattle('enc_005')">南郊</button>
      <button class="debug-btn" onclick="debugTriggerBattle('enc_006')">南郊2</button>
      <button class="debug-btn" onclick="debugTriggerBattle('enc_007')">南郊3</button>
      <button class="debug-btn" onclick="debugTriggerBattle('enc_008')">坟地</button>
      <button class="debug-btn" onclick="debugTriggerBattle('enc_048')">感染者</button>
      <button class="debug-btn" onclick="debugTriggerBattle('enc_028')">森林1</button>
      <button class="debug-btn" onclick="debugTriggerBattle('enc_031')">水域1</button>
      <button class="debug-btn" onclick="debugTriggerBattle('enc_035')">沙漠1</button>
      <button class="debug-btn" onclick="debugTriggerBattle('enc_038')">魔军1</button>
      <button class="debug-btn" onclick="debugTriggerBattle('enc_050')">魔兽1</button>
    </div>
  </div></div>`;
  const qaKey = 'battle:actions';
  const qaOpen = _debugOpen(qaKey, true);
  c.innerHTML += `<div class="debug-group${qaOpen ? ' open' : ''}"><div class="debug-group-head" data-dkey="${qaKey}" onclick="toggleDebugGroup(this)">战斗快捷<span class="debug-arrow">${qaOpen ? '▲' : '▼'}</span></div><div class="debug-group-body">
    <div class="debug-actions">
      <button class="debug-btn success" onclick="debugBattleHealAll()">我方满血满蓝</button>
      <button class="debug-btn" onclick="debugBattleFullMp()">我方回满 MP</button>
      <button class="debug-btn" onclick="debugBattleClearStatus()">清空我方状态</button>
    </div>
    <div class="debug-info">只在战斗进行中生效；敌人数据改动会自动同步到当前战斗。</div>
  </div></div>`;
}
function debugBattleGuard(){
  if(typeof battleState === 'undefined' || !battleState || battleState.over){
    toast('当前不在战斗');
    return null;
  }
  return battleState;
}
function debugBattleHealAll(){
  const b = debugBattleGuard();
  if(!b) return;
  b.allies.forEach(u => { u.hp = u.maxHp; u.mp = u.maxMp; });
  addBattleLog('【调试】我方已满血满蓝', 'heal');
  renderBattle();
  toast('我方已回满');
}
function debugBattleFullMp(){
  const b = debugBattleGuard();
  if(!b) return;
  b.allies.forEach(u => { u.mp = u.maxMp; });
  addBattleLog('【调试】我方 MP 已回满', 'heal');
  renderBattle();
  toast('我方 MP 已回满');
}
function debugBattleClearStatus(){
  const b = debugBattleGuard();
  if(!b) return;
  b.allies.forEach(u => { u.statuses = []; u.tempMods = {}; });
  addBattleLog('【调试】我方状态已清空', 'status');
  renderBattle();
  toast('我方状态已清空');
}
function debugTriggerBattle(encId){
  if(!currentGame){ toast('没有角色'); return; }
  closeDebugModal();
  triggerBattleFromTile(encId);
}

function renderDebugStory(c){
  if(!currentGame){ c.innerHTML = '<div class="quest-empty">尚未创建角色</div>'; return; }
  const lines = (typeof LINES !== 'undefined') ? LINES : {};
  const state = currentGame.lineState || {};
  const key = 'story:lines';
  const open = _debugOpen(key, true);
  c.innerHTML += `<div class="debug-info">剧情线总数：${Object.keys(lines).length}</div>`;
  c.innerHTML += `<div class="debug-group${open ? ' open' : ''}"><div class="debug-group-head" data-dkey="${key}" onclick="toggleDebugGroup(this)">剧情线进度<span class="debug-arrow">${open ? '▲' : '▼'}</span></div><div class="debug-group-body">`;
  for(const lid in lines){
    const line = lines[lid];
    const st = state[lid];
    const total = (line.nodes || []).length;
    let statusText, color;
    if(!st){ statusText = '未开始'; color = '#667'; }
    else if(st.status === 'done'){ statusText = '已完成'; color = '#66ff99'; }
    else { statusText = `节点 ${st.nodeIdx + 1}/${total}`; color = '#ffd166'; }
    const label = (line.type === 'side' ? '［支线］' : '［主线］') + (line.name || lid);
    c.innerHTML += `<div class="debug-row-item">
      <label style="min-width:200px">${label}</label>
      <span style="color:${color}">${statusText}</span>
    </div>`;
  }
  c.innerHTML += `</div></div>`;
}

/* ============================================================
   导出修改（调试面板 → 数据）
   ============================================================ */
function debugChangeCounts(){
  return {
    items: Object.keys(debugChanges.items).length,
    skills: Object.keys(debugChanges.skills).length,
    enemies: Object.keys(debugChanges.enemies).length
  };
}
function debugOpenExport(){
  debugExportOpen = true;
  debugEdit = null;
  renderDebugContent();
}
function debugCloseExport(){
  debugExportOpen = false;
  renderDebugContent();
}
function debugBuildPatch(){
  const items = {}, skills = {}, enemies = {};
  Object.keys(debugChanges.items).forEach(id => {
    if(EQUIPS[id]) items[id] = debugDeep(EQUIPS[id]);
  });
  Object.keys(debugChanges.skills).forEach(id => {
    const sk = SKILLS[id];
    if(!sk) return;
    skills[id] = {
      draft: !!sk.draft,
      levels: (sk.levels || []).map(lv => ({
        mpCost: Number(lv.mpCost) || 0,
        effects: debugDeep(lv.effects || [])
      }))
    };
  });
  Object.keys(debugChanges.enemies).forEach(id => {
    const t = CHARACTERS[id];
    if(!t) return;
    enemies[id] = {
      suggestedLevel: t.suggestedLevel,
      base: debugDeep(t.base || {}),
      growth: debugDeep(t.growth || {})
    };
  });
  return { items: items, skills: skills, enemies: enemies };
}
function debugPatchJs(patch){
  const json = JSON.stringify(patch, null, 2);
  return '/* ============================================================\n'
    + '   调试面板导出 · 数据补丁\n'
    + '   ------------------------------------------------------------\n'
    + '   用法（二选一）：\n'
    + '   1. 推荐：另存为 data-debug-patch.js，在 index.html 中放到所有\n'
    + '      data-*.js 之后、core.js 之前加载；\n'
    + '   2. 或按 items / skills / enemies 分段粘到对应 data 文件末尾。\n'
    + '   补丁只覆盖导出时记录过的条目。\n'
    + '   ============================================================ */\n'
    + '(function(){\n'
    + '  var P = ' + json + ';\n'
    + '  for(var id in P.items){ if(typeof EQUIPS[id] !== "undefined") Object.assign(EQUIPS[id], P.items[id]); }\n'
    + '  if(typeof SKILLS !== "undefined"){\n'
    + '    for(var sid in P.skills){\n'
    + '      var sk = SKILLS[sid]; if(!sk) continue;\n'
    + '      var sp = P.skills[sid];\n'
    + '      if(typeof sp.draft === "boolean") sk.draft = sp.draft;\n'
    + '      (sp.levels || []).forEach(function(lv, i){\n'
    + '        if(!sk.levels[i]) return;\n'
    + '        if(lv.mpCost !== undefined) sk.levels[i].mpCost = lv.mpCost;\n'
    + '        if(lv.effects) sk.levels[i].effects = lv.effects;\n'
    + '      });\n'
    + '    }\n'
    + '  }\n'
    + '  if(typeof CHARACTERS !== "undefined"){\n'
    + '    for(var eid in P.enemies){ if(typeof CHARACTERS[eid] !== "undefined") Object.assign(CHARACTERS[eid], P.enemies[eid]); }\n'
    + '  }\n'
    + '})();\n';
}
function debugPatchText(){
  const patch = debugBuildPatch();
  if(debugExportFormat === 'json') return JSON.stringify(patch, null, 2);
  return debugPatchJs(patch);
}
function debugSetExportFormat(fmt){
  debugExportFormat = fmt === 'json' ? 'json' : 'js';
  /* 只更新文本框，避免整块重建 */
  const ta = document.getElementById('debugExportText');
  if(ta) ta.value = debugPatchText();
}
function renderDebugExport(c){
  const counts = debugChangeCounts();
  const total = counts.items + counts.skills + counts.enemies;
  let h = '<div class="debug-actions"><button class="debug-btn" onclick="debugCloseExport()">← 返回数据</button></div>';
  h += '<div class="debug-info"><b style="color:#ffcc66">导出修改</b><br>'
    + '已记录：物品 ' + counts.items + ' · 技能 ' + counts.skills + ' · 敌人 ' + counts.enemies + '。<br>'
    + '只包含在调试面板里「保存」过的模板；实例改动不导出。<br>'
    + 'JS 补丁可另存为 data-debug-patch.js（放到 core.js 之前加载），或粘到对应 data 文件末尾。</div>';
  if(!total){
    h += '<div class="debug-preview">还没有记录到修改。去物品 / 技能 / 敌人页保存几次再来。</div>';
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
  h += '<textarea class="debug-json" id="debugExportText" readonly style="min-height:320px;white-space:pre">'
    + debugEsc(debugPatchText()) + '</textarea>';
  c.innerHTML = h;
}
function debugCopyPatch(){
  const ta = document.getElementById('debugExportText');
  if(!ta) return;
  const text = ta.value;
  const done = () => toast('已复制到剪贴板');
  if(typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(done).catch(() => {
      ta.focus(); ta.select();
      try{ document.execCommand('copy'); done(); }catch(e){ toast('复制失败，请手动全选复制'); }
    });
    return;
  }
  ta.focus(); ta.select();
  try{ document.execCommand('copy'); done(); }catch(e){ toast('复制失败，请手动全选复制'); }
}
function debugDownloadPatch(){
  const text = debugPatchText();
  const name = debugExportFormat === 'json' ? 'debug-data-patch.json' : 'data-debug-patch.js';
  try{
    const blob = new Blob([text], {type:'text/plain;charset=utf-8'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    toast('已开始下载 ' + name);
  }catch(e){
    toast('下载失败，请用「复制」');
  }
}
function debugClearChanges(){
  showConfirm('清空修改记录', '只清空导出列表，不会撤销已经生效的修改。继续？', () => {
    debugChanges = { items:{}, skills:{}, enemies:{} };
    toast('修改记录已清空');
    renderDebugContent();
  });
}

function renderDebugData(c){
  c.innerHTML += `<div class="debug-info">
    <b style="color:#66ff99">【游玩类】</b>改了就好，不需要恢复。<br>
    等级、金钱、HP/MP、好感度、技能、装备、剧情 flag 等。
  </div>`;
  c.innerHTML += `<div class="debug-actions">
    <button class="debug-btn success" onclick="saveGame(currentSlot);toast('已保存');">保存到存档</button>
    <button class="debug-btn" onclick="debugExportSave()">导出存档数据</button>
    <button class="debug-btn" onclick="debugImportSave()">导入存档数据</button>
  </div>`;
  c.innerHTML += `<div class="debug-info" style="margin-top:12px">
    <b style="color:#ffcc66">【测试类】</b>改了可以一键恢复成文件里原始的数值。<br>
    NPC 基础属性、敌人模板、技能数值、装备数值等。
  </div>`;
  c.innerHTML += `<div class="debug-actions">
    <button class="debug-btn" onclick="debugRestoreNpcs()">恢复 NPC 原始数值</button>
    <button class="debug-btn" onclick="debugRestoreEnemies()">恢复敌人模板</button>
    <button class="debug-btn" onclick="debugRestoreAll()">恢复全部原始数据</button>
  </div>`;
  const _counts = debugChangeCounts();
  const _changedTotal = _counts.items + _counts.skills + _counts.enemies;
  c.innerHTML += `<div class="debug-group open" style="margin-top:10px">
    <div class="debug-group-head" onclick="this.parentElement.classList.toggle('open')">导出修改<span class="debug-arrow">▼</span></div>
    <div class="debug-group-body">
      <div class="debug-info">已记录：物品 ${_counts.items} · 技能 ${_counts.skills} · 敌人 ${_counts.enemies}。<br>
      在调试面板保存过的模板可以直接导出成补丁，跳过重新打开编辑器修改。</div>
      <div class="debug-actions"><button class="debug-btn success" onclick="debugOpenExport()">查看 / 导出修改（${_changedTotal}）</button></div>
    </div></div>`;
  c.innerHTML += `<div class="debug-info" style="margin-top:12px">
    <b style="color:#ff6688">【危险操作】</b>不可撤销。
  </div>`;
  c.innerHTML += `<div class="debug-actions">
    <button class="debug-btn danger" onclick="debugResetCurrentSave()">重置当前存档（重新开始）</button>
    <button class="debug-btn danger" onclick="debugDeleteCurrentSave()">删除当前存档（从硬盘删除）</button>
  </div>`;
  const size = (localStorage.getItem(SAVE_KEY + currentSlot) || '').length;
  c.innerHTML += `<div class="debug-info">当前存档位：${currentSlot + 1}<br>存档大小约：${size} 字符</div>`;
}

function debugRestoreNpcs(){
  if(!currentGame || !currentGame.npcs){ toast('没有角色'); return; }
  const orig = _ORIGINAL_DATA.NPCS;
  for(const id in orig){
    if(orig[id].isEnv) continue;
    if(!currentGame.npcs[id]) continue;
    const npc = currentGame.npcs[id];
    const keepAffinity = npc.affinity;
    Object.assign(npc, JSON.parse(JSON.stringify(orig[id])));
    npc.affinity = keepAffinity;
    normalizeCharAttributeModel(npc);
    recalcCharStats(npc);
  }
  toast('已恢复 NPC 原始数值（好感度保留）');
  updateAllUI();
  renderDebugContent();
}

function debugRestoreEnemies(){
  for(const id in _ORIGINAL_DATA.CHARACTERS){
    const n = parseInt(String(id).replace(/^npc/, ''), 10);
    if(!isNaN(n) && n >= 299){
      CHARACTERS[id] = JSON.parse(JSON.stringify(_ORIGINAL_DATA.CHARACTERS[id]));
    }
  }
  toast('已恢复角色模板');
  renderDebugContent();
}

function debugRestoreAll(){
  debugRestoreNpcs();
  debugRestoreEnemies();
  for(const id in _ORIGINAL_DATA.SKILLS){
    SKILLS[id] = JSON.parse(JSON.stringify(_ORIGINAL_DATA.SKILLS[id]));
  }
  for(const id in _ORIGINAL_DATA.EQUIPS){
    EQUIPS[id] = JSON.parse(JSON.stringify(_ORIGINAL_DATA.EQUIPS[id]));
  }
  toast('已恢复全部原始数据');
  updateAllUI();
  renderDebugContent();
}

function debugResetCurrentSave(){
  if(!currentGame){ toast('没有角色'); return; }
  showConfirm(
    '重置当前存档',
    '保留存档位，角色回到初始状态，好感度、剧情、物品全部清空。确定？',
    () => {
      const name = currentGame.name;
      const gender = currentGame.gender;
      currentGame = createNewGame(name, gender);
      currentMapId = 'region01-town01';
      currentTileId = 'region01-town01-12';
      currentMapLayer = 'street';
      currentTalkNpc = null;
      saveGame(currentSlot);
      closeDebugModal();
      startGame();
      toast('已重置当前存档');
    }
  );
}

function debugDeleteCurrentSave(){
  if(currentSlot < 0){ toast('无法删除'); return; }
  showConfirm(
    '删除当前存档',
    `确定从硬盘上删除存档位 ${currentSlot + 1}？不可恢复。`,
    () => {
      localStorage.removeItem(SAVE_KEY + currentSlot);
      currentGame = null;
      currentSlot = -1;
      closeDebugModal();
      showSaveScreen();
      toast('已删除');
    }
  );
}


/* ============================================================
   前言弹窗
   ============================================================ */

const PROLOGUE_LINES = [
  '你穿越落水，被克·雷和他的孙子小安救起。\n\n在这间简陋小屋，他们没有询问你的过往，也没有排斥你的留宿，你渐渐习惯了异世界的生活。\n\n日子清苦，却渐渐有了烟火气。',
  '这天，镇长福德曼带着一个从主城区来的巡警，闯进了克·雷家。\n\n巡警态度强硬，说是高尖塔的指示——"雷之孙"必须加入讨伐魔王亚克的队伍，去对抗魔王亚克的大军。\n\n克·雷和镇长先前多次以小安年幼推脱，这次再也躲不开。\n\n巡警不依不挠。',
  '你看着雷克佝偻的背影，又看了看那个还没长开的孩子。\n\n你心一横，站了出来。\n\n你提议镇长将小安恢复以前的姓氏，安·瓦伦，由你接过 “雷之孙” 的身份，奔赴伐魔之路。'
];

let prologueIdx = 0;

function showPrologue(){
  prologueIdx = 0;
  document.getElementById('prologueTitle').textContent = '前言';
  document.getElementById('prologueContent').textContent = PROLOGUE_LINES[0];
  document.getElementById('prologueNextBtn').textContent = '继续';
  document.getElementById('prologueModal').classList.add('show');
}

function prologueNext(){
  prologueIdx++;
  if(prologueIdx >= PROLOGUE_LINES.length){
    document.getElementById('prologueModal').classList.remove('show');
    currentGame.flags['prologue_done'] = true;
    try{ saveGame(currentSlot); }catch(e){}
    setTimeout(() => { startChapter(1); }, 400);
    return;
  }
  document.getElementById('prologueContent').textContent = PROLOGUE_LINES[prologueIdx];
  if(prologueIdx === PROLOGUE_LINES.length - 1){
    document.getElementById('prologueNextBtn').textContent = '接下雷之孙的称号';
  }
}

/* ============================================================
   十五、启动
   ============================================================ */

setInterval(() => {
  if(currentGame && document.getElementById('uiTimeBtn')){
    document.getElementById('uiTimeBtn').textContent = getTimeStr();
  }
}, 1000);

function initGame(){
  try{ renderSaveSlots(); }catch(e){ console.error('initGame error', e); }
}
if(document.readyState === 'loading'){
  window.addEventListener('DOMContentLoaded', initGame);
}else{
  initGame();
}


/* ============================================================
   桌面端键盘快捷键
   ============================================================ */
window.addEventListener('keydown', e => {
  /* Enter：标题界面快速进入存档选择 */
  const titleScreenEl = document.getElementById('titleScreen');
  const titleVisible = !!titleScreenEl && getComputedStyle(titleScreenEl).display !== 'none';
  if(e.key === 'Enter' && titleVisible){
    const active = document.activeElement;
    const typing = active && /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName);
    if(!typing){ showSaveScreen(); e.preventDefault(); return; }
  }

  /* ESC：关闭最上层弹窗 */
  if(e.key === 'Escape'){
    const opened = [...document.querySelectorAll('.modal-overlay.show')].pop();
    if(opened){
      /* Promise 驱动的弹窗必须走各自的关闭函数，否则 await 会永远挂起 */
      if(opened.id === 'rewardModal'){ closeRewardModal(); e.preventDefault(); return; }
      if(opened.id === 'deathModal'){ e.preventDefault(); return; }
      if(opened.id === 'confirmActionModal'){
        if(typeof _confirmCallback !== 'undefined' && _confirmCallback){
          closeConfirmAction();
        }else{
          const cancelBtn = opened.querySelector('.btn-danger');
          if(cancelBtn) cancelBtn.click();
        }
        e.preventDefault();
        return;
      }
      /* 行囊弹窗：走自己的关闭函数，顺带重置页签 / 搜索 / 折叠状态 */
      if(opened.id === 'bagModal'){ closeBagModal(); e.preventDefault(); return; }
      const closeBtn = opened.querySelector('.modal-close');
      if(closeBtn){ closeBtn.click(); return; }
      /* 无 close 按钮的弹窗手动关闭 */
      opened.classList.remove('show');
      e.preventDefault();
      return;
    }
    if(document.getElementById('storyModal').classList.contains('show')){
      const skip = document.querySelector('#storyModal .story-skip-btn');
      if(skip) skip.click();
      return;
    }
  }

  /* Enter / 空格：剧情弹窗下一句 */
  const storyModal = document.getElementById('storyModal');
  if(storyModal && storyModal.classList.contains('show')){
    if(e.key === 'Enter' || e.key === ' '){
      const next = document.getElementById('storyModalNext');
      if(next){ next.click(); e.preventDefault(); }
      return;
    }
  }

  /* Ctrl+S / Cmd+S：保存 */
  if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's'){
    e.preventDefault();
    if(currentGame && currentSlot >= 0){
      saveGame(currentSlot);
    }
    return;
  }

  /* 字母快捷键：B 行囊 / G 着装 / Q 任务 / T 队列（仅主界面、无弹窗、非战斗中） */
  if(currentGame && typeof battleState !== 'undefined' && !battleState
     && !document.querySelector('.modal-overlay.show')){
    const gameScreenEl = document.getElementById('gameScreen');
    const inGame = gameScreenEl && getComputedStyle(gameScreenEl).display !== 'none';
    const active = document.activeElement;
    const typing = active && /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName);
    if(inGame && !typing){
      const k = e.key.toLowerCase();
      if(k === 'b'){ openBag(); e.preventDefault(); return; }
      if(k === 'g'){ openGear(); e.preventDefault(); return; }
      if(k === 'q'){ openQuest(); e.preventDefault(); return; }
      if(k === 't'){ toggleQueue(); e.preventDefault(); return; }
    }
  }

  /* 数字键 1-5：战斗中选技能（仅在玩家回合、无弹窗打开时生效） */
  if(/^[1-5]$/.test(e.key) && battleState && battleState.phase === 'player_turn'){
    const anyModalOpen = document.querySelector('.modal-overlay.show');
    if(anyModalOpen) return;
    const skillBtns = document.querySelectorAll('#battleSkills .skill-btn:not(:disabled)');
    const idx = Number(e.key) - 1;
    if(skillBtns[idx]){ skillBtns[idx].click(); e.preventDefault(); }
    return;
  }

  /* 空格：战斗中跳过回合 */
  if(e.key === ' ' && battleState && battleState.phase === 'player_turn'){
    const anyModalOpen = document.querySelector('.modal-overlay.show');
    if(anyModalOpen) return;
    const skipBtn = document.getElementById('battleSkipBtn');
    if(skipBtn && !skipBtn.disabled){ skipBtn.click(); e.preventDefault(); }
    return;
  }
});
function debugExportSave(){
  if(!currentGame){ toast('没有角色'); return; }
  try{
    const blob = new Blob([JSON.stringify(currentGame, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'luoshuigou_save_' + currentSlot + '_' + Date.now() + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('存档已导出');
  }catch(e){ toast('导出失败：' + e.message); }
}

function debugImportSave(){
  if(currentSlot < 0){ toast('无法导入'); return; }
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.onchange = e => {
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try{
        const data = JSON.parse(ev.target.result);
        if(!data || !data.name){ toast('存档格式错误'); return; }
        currentGame = data;
        saveGame(currentSlot);
        toast('存档已导入，正在重新载入…');
        loadAndStart(currentSlot);
        closeDebugModal();
      }catch(err){ toast('导入失败：' + err.message); }
    };
    reader.readAsText(file);
  };
  input.click();
}

/* ============================================================
   固定画布缩放（1920 × 1080）
   ------------------------------------------------------------
   body 是固定尺寸舞台，这里只做整体等比缩放；
   浏览器缩放 / 拖动窗口都不会改变内部布局。
   ============================================================ */
function fitGameStage(){
  const w = window.innerWidth || 1920;
  const h = window.innerHeight || 1080;
  const s = Math.min(w / 1920, h / 1080);
  window.__gameScale = s;
  document.body.style.transform = 'scale(' + (Math.round(s * 10000) / 10000) + ')';
}
fitGameStage();
window.addEventListener('resize', fitGameStage);
window.addEventListener('orientationchange', fitGameStage);
