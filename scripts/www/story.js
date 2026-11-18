/* ============================================================
   story.js — 单轨 LINES 线性节点剧情引擎
   ------------------------------------------------------------
   checkStoryTriggers / advanceLineNode / checkConditionList 等
   ============================================================ */

/* ============================================================
   全局辅助：id 转中文名（显示层统一用这个）
   ============================================================ */
function getItemName(id){
  if(!id) return '';
  if(typeof EQUIPS !== 'undefined' && EQUIPS[id]) return EQUIPS[id].name;
  return id;
}
function getNpcName(id){
  if(!id) return '';
  if(typeof getNpc === 'function'){
    const npc = getNpc(id);
    if(npc) return npc.name;
  }
  return id;
}
function getSkillName(id){
  if(!id) return '';
  if(typeof SKILLS !== 'undefined' && SKILLS[id]) return SKILLS[id].name;
  return id;
}
function getTagName(id){
  if(!id) return '';
  if(typeof TAGS !== 'undefined' && TAGS[id]) return TAGS[id].name;
  return id;
}

/* ============================================================
   三、事件队列（防重入）
   ============================================================ */

let _storyQueue = [];
let _storyRunning = false;

function queueStoryEvent(evt){
  if(!evt) return;
  _storyQueue.push(evt);
  if(!_storyRunning) runNextStoryEvent();
}

function runNextStoryEvent(){
  if(_storyQueue.length === 0){ _storyRunning = false; return; }
  _storyRunning = true;
  const evt = _storyQueue.shift();
  runStoryEvent(evt, () => {
    setTimeout(runNextStoryEvent, 400);
  });
}

/* ============================================================
   四、条件检查
   ============================================================ */

function checkCondition(cond){
  if(!cond) return true;
  switch(cond.type){
    case 'flag':
      return currentGame.flags[cond.key] === (cond.value !== undefined ? cond.value : true);
    case 'not_flag':
      return !currentGame.flags[cond.key];
    case 'affinity':{
      const npc = getNpc(cond.npcId);
      if(!npc) return false;
      return (npc.affinity || 0) >= cond.min;
    }
    case 'has_npc':
      return isNpcRecruited(cond.npcId);
    case 'has_item':{
      const it = currentGame.bag.find(b => b.id === cond.itemId);
      return it && it.count > 0;
    }
    case 'item_count':{
      const it = currentGame.bag.find(b => b.id === cond.itemId);
      return it && it.count >= cond.min;
    }
        case 'level':
      if(cond.min !== undefined && currentGame.level < cond.min) return false;
      if(cond.max !== undefined && currentGame.level > cond.max) return false;
      return true;
    case 'money':
      return (currentGame.money || 0) >= (cond.amount || cond.min || 0);
    case 'has_job':
      return (currentGame.classes || []).filter(c => c).length > 0;
    case 'time_after':{
      const t = currentGame.time;
      const total = (t.year - 1) * 360 + (t.month - 1) * 30 + t.day;
      return total >= cond.day;
    }
    case 'no_party':{
      const q = currentGame.queue;
      return !q.front.some(x => x && x !== 'player')
          && !q.back.some(x => x && x !== 'player')
          && !q.rest.some(x => x && x !== 'player');
    }
case 'profession_count':{
  const classes = (currentGame.classes || []).filter(c => c);
  return classes.length >= cond.min;
}
    case 'has_class':
      /* 拥有某个指定职业（cond.className 为职业正式中文名） */
      return (currentGame.classes || []).filter(c => c).includes(cond.className);
    case 'has_title':
      /* 已获得某个称号 */
      return (currentGame.titles || []).includes(cond.titleId);
    case 'not_has_npc':
      /* 某NPC不在队伍中 */
      return !isNpcRecruited(cond.npcId);
    case 'random':
      /* 随机概率：cond.chance 为 0-100 的百分数，每次判定掷一次 */
      return Math.random() * 100 < (Number(cond.chance) || 0);
    case 'from_tile':
      return _lastTileId === cond.tileId;
    default:
      return true;
  }
}

function checkConditionList(list){
  if(!list || list.length === 0) return true;
  /* 新格式：二维数组，外层组间为"或"，组内为"且" */
  if(Array.isArray(list[0])){
    for(var g=0; g<list.length; g++){
      var group = list[g];
      if(group.every(c => checkCondition(c))) return true;
    }
    return false;
  }
  /* 兼容旧格式：一维数组，全部条件都要满足 */
  return list.every(c => checkCondition(c));
}

/* ============================================================
   角色死亡导致的主线失效
   ------------------------------------------------------------
   唯一角色死亡时：
   · 找出该角色参与的、章节最早的未完成主线
   · 该主线及所有 chapter >= 该章节的主线标记为 invalid
   · 已完成主线不追溯；支线只单独失效，不级联
   · 失效主线里的 unlock_tile/env/npc 动作强制执行，避免地图锁死
   ============================================================ */

function isMainlineCutoff(line){
  if(!line || line.type === 'side') return false;
  const cutoff = currentGame && currentGame.mainlineInvalidFromChapter;
  return cutoff != null && (Number(line.chapter) || 0) >= cutoff;
}
function isLineInvalid(lineId){
  if(!currentGame) return true;
  const st = currentGame.lineState && currentGame.lineState[lineId];
  if(st && st.status === 'invalid') return true;
  const line = (typeof LINES !== 'undefined') ? LINES[lineId] : null;
  return isMainlineCutoff(line);
}
function conditionsReferenceNpc(list, npcId){
  if(!Array.isArray(list)) return false;
  return list.some(item => {
    if(Array.isArray(item)) return conditionsReferenceNpc(item, npcId);
    return !!(item && item.npcId === npcId);
  });
}
function lineNodeReferencesNpc(node, npcId){
  if(!node) return false;
  if(node.on && node.on.npcId === npcId) return true;
  if(conditionsReferenceNpc(node.requires || [], npcId)) return true;
  if(Array.isArray(node.do) && node.do.some(a => a && a.npcId === npcId)) return true;
  return false;
}
function lineReferencesNpc(line, npcId){
  if(!line) return false;
  if(line.giver === npcId) return true;
  return (line.nodes || []).some(node => lineNodeReferencesNpc(node, npcId));
}
function applyLineUnlockActions(line){
  if(!line || !currentGame) return;
  if(!currentGame.flags) currentGame.flags = {};
  if(!Array.isArray(currentGame.unlockedEnvs)) currentGame.unlockedEnvs = [];
  if(!Array.isArray(currentGame.unlockedNpcs)) currentGame.unlockedNpcs = [];
  (line.nodes || []).forEach(node => {
    (node.do || []).forEach(act => {
      if(!act) return;
      if(act.type === 'unlock_tile' && act.tileId){
        currentGame.flags['unlock_' + act.tileId] = true;
      }else if(act.type === 'unlock_env' && act.tileId && act.envName){
        const key = act.tileId + '::' + act.envName;
        if(!currentGame.unlockedEnvs.includes(key)) currentGame.unlockedEnvs.push(key);
      }else if(act.type === 'unlock_npc' && act.npcId){
        if(typeof isCharacterDeceased === 'function' && isCharacterDeceased(act.npcId)) return;
        if(!currentGame.unlockedNpcs.includes(act.npcId)) currentGame.unlockedNpcs.push(act.npcId);
      }
    });
  });
}
function invalidateStoriesForNpc(npcId){
  if(!currentGame || typeof LINES === 'undefined' || !npcId) return false;
  if(!currentGame.lineState) currentGame.lineState = {};
  let changed = false;

  /* 主线：找到最早参演的未完成章节，设置全局失效起点 */
  let minChapter = null;
  for(const lineId in LINES){
    const line = LINES[lineId];
    if(!line || line.type === 'side') continue;
    const st = currentGame.lineState[lineId];
    if(st && st.status === 'done') continue;
    if(!lineReferencesNpc(line, npcId)) continue;
    const ch = Number(line.chapter) || 0;
    if(minChapter === null || ch < minChapter) minChapter = ch;
  }
  if(minChapter !== null){
    const prev = currentGame.mainlineInvalidFromChapter;
    if(prev == null || minChapter < prev){
      currentGame.mainlineInvalidFromChapter = minChapter;
      changed = true;
    }
    const cutoff = currentGame.mainlineInvalidFromChapter;
    for(const lineId in LINES){
      const line = LINES[lineId];
      if(!line || line.type === 'side') continue;
      if((Number(line.chapter) || 0) < cutoff) continue;
      const st = currentGame.lineState[lineId];
      if(st && st.status === 'done') continue;
      if(st && st.status !== 'invalid'){ st.status = 'invalid'; changed = true; }
      applyLineUnlockActions(line);
    }
  }

  /* 支线：只让直接依赖该角色的支线单独失效，不级联 */
  for(const lineId in LINES){
    const line = LINES[lineId];
    if(!line || line.type !== 'side') continue;
    const st = currentGame.lineState[lineId];
    if(!st || st.status === 'done' || st.status === 'invalid') continue;
    if(!lineReferencesNpc(line, npcId)) continue;
    st.status = 'invalid';
    applyLineUnlockActions(line);
    changed = true;
  }

  /* 兜底：当前所在地图格如果仍是隐藏状态，强制解锁，避免把玩家关死 */
  if(typeof getCurrentTile === 'function' && typeof currentTileId !== 'undefined'){
    const tile = getCurrentTile();
    if(tile && tile.hidden && !(currentGame.flags && currentGame.flags['unlock_' + currentTileId])){
      currentGame.flags['unlock_' + currentTileId] = true;
      changed = true;
    }
  }

  if(changed){
    if(typeof updateQuestBadge === 'function') updateQuestBadge();
    if(typeof updateAllUI === 'function') updateAllUI();
    if(typeof renderCurrentMap === 'function') renderCurrentMap();
    if(typeof renderNpcRow === 'function') renderNpcRow();
  }
  return changed;
}

/* ============================================================
   互动次数累积
   ------------------------------------------------------------
   节点的 on.count 表示"需要触发几次才推进剧情"
   （默认 1 = 立即触发；count=3 则第 3 次互动时才触发）

   计数按 lineId-nodeId 分别存进 currentGame.interactCounts，
   会随存档保存，玩家退出重进也保留。

   返回 true  → 次数已达标，可以触发
   返回 false → 次数还没到，继续等下一次互动
   ============================================================ */
function checkInteractCount(lineId, node){
  if(!node || !node.on) return true;              /* 无 on 的节点不参与计数 */
  const need = Number(node.on.count) || 1;
  if(need <= 1) return true;                      /* 默认立即触发 */

  const key = lineId + '-' + node.id;
  if(!currentGame.interactCounts) currentGame.interactCounts = {};
  const cur = Number(currentGame.interactCounts[key]) || 0;
  const next = cur + 1;
  currentGame.interactCounts[key] = next;

  if(next < need) return false;                    /* 未达标 */
  delete currentGame.interactCounts[key];          /* 达标，清计数 */
  return true;
}

/* ============================================================
   五、触发检查（总入口）— 基于 LINES 新引擎
   ============================================================ */

/* 获取某条线的当前节点（纯读取，没触发过返回null，不自动创建） */
function getLineState(lineId){
  if(!currentGame.lineState) return null;
  return currentGame.lineState[lineId] || null;
}
/* 真正触发一条剧情线时，初始化它的记录 */
function ensureLineState(lineId){
  if(!currentGame.lineState) currentGame.lineState = {};
  if(!currentGame.lineState[lineId]){
    currentGame.lineState[lineId] = { nodeIdx: 0, status: 'active' };
  }
  return currentGame.lineState[lineId];
}
/* 游戏开局自动初始化第一条主线，让玩家一进游戏就知道第一步要做什么 */
function initOpeningStory(){
  /* 删掉示例剧情后 line-player-001 可能不存在，避免写入无效记录 */
  if(typeof LINES === 'undefined' || !LINES['line-player-001']) return;
  if(!currentGame.lineState) currentGame.lineState = {};
  if(!currentGame.lineState['line-player-001']){
    currentGame.lineState['line-player-001'] = { nodeIdx: 0, status: 'active' };
  }
}

/* 节点是否已完成 */
function isNodeDone(lineId, nodeId){
  return !!currentGame.flags[lineId + '-' + nodeId];
}

function checkStoryTriggers(trigger){
  if(!currentGame) return false;
  if(typeof isGameFailed === 'function' && isGameFailed()) return false;
  if(typeof isDeathNoticeOpen === 'function' && isDeathNoticeOpen()) return false;
  if(trigger && trigger.type === 'time'){ checkTimeEvents(); return false; }

  /* 遍历所有 LINES，找当前应触发的节点（主线优先） */
  const lineIds = Object.keys(LINES).sort(function(a,b){
    const la = LINES[a], lb = LINES[b];
    const sa = la.type === 'side' ? 1 : 0;
    const sb = lb.type === 'side' ? 1 : 0;
    return sa - sb;   // 主线排前面
  });
  for(const lineId of lineIds){
    const line = LINES[lineId];
    let st = getLineState(lineId);
    /* 没触发过的线：只检查第一个节点，满足条件就正式触发这条线 */
    if(!st){
      if(line.nodes.length === 0) continue;
      if(isLineInvalid(lineId)) continue;
      const firstNode = line.nodes[0];
      if(trigger){
        if(!firstNode.on || !triggerMatch(firstNode.on, trigger)) continue;
      }else{
        if(firstNode.on) continue;
      }
      const reqList = firstNode.requires || [];
      if(!checkConditionList(reqList)) continue;
      /* 正式触发这条线，创建记录 */
      st = ensureLineState(lineId);
      advanceLineNode(lineId, st, firstNode);
      return true;
    }
    if(st.status === 'done') continue;
    if(isLineInvalid(lineId)) continue;
    if(st.nodeIdx >= line.nodes.length) continue;

    const node = line.nodes[st.nodeIdx];
    if(!node) continue;

    /* 有 trigger 时：只检查 on 匹配的节点；没 trigger 时：只检查无 on 的轮询节点 */
    if(trigger){
      if(!node.on || !triggerMatch(node.on, trigger)) continue;
    }else{
      if(node.on) continue;
    }

    /* requires 条件检查 */
    const reqList = node.requires || [];
    if(!checkConditionList(reqList)) continue;

    /* 触发这个节点 */
    advanceLineNode(lineId, st, node);
    return true;   /* 一次只跑一个，避免连锁 */
  }

  return false;
}

/* 检查某个地图格上有没有主线剧情的下一个节点待触发 */
function hasPendingMainStoryTile(tileId){
  for(const lineId in LINES){
    const line = LINES[lineId];
    if(line.type === 'side') continue;   // 只主线
    if(isLineInvalid(lineId)) continue;
    const st = getLineState(lineId);
    if(!st || st.status === 'done') continue;
    if(st.nodeIdx >= line.nodes.length) continue;
    const node = line.nodes[st.nodeIdx];
    if(!node || !node.on) continue;
    if(node.on.type === 'tile_enter' && node.on.tileId === tileId) return true;
  }
  return false;
}

/* 检查某个NPC身上有没有主线剧情的下一个节点待触发 */
function hasPendingMainStoryNpc(npcId){
  for(const lineId in LINES){
    const line = LINES[lineId];
    if(line.type === 'side') continue;   // 只主线
    if(isLineInvalid(lineId)) continue;
    const st = getLineState(lineId);
    if(!st || st.status === 'done') continue;
    if(st.nodeIdx >= line.nodes.length) continue;
    const node = line.nodes[st.nodeIdx];
    if(!node || !node.on) continue;
    if(node.on.type === 'npc_talk' && node.on.npcId === npcId) return true;
  }
  return false;
}

/* 检查某个地图格的某张环境卡上，有没有主线剧情的下一个节点待触发 */
function hasPendingMainStoryEnv(tileId, envName){
  for(const lineId in LINES){
    const line = LINES[lineId];
    if(line.type === 'side') continue;
    if(isLineInvalid(lineId)) continue;
    const st = getLineState(lineId);
    if(!st || st.status === 'done') continue;
    if(st.nodeIdx >= line.nodes.length) continue;
    const node = line.nodes[st.nodeIdx];
    if(!node || !node.on) continue;
    if(node.on.type === 'env_interact'
       && node.on.tileId === tileId
       && node.on.envName === envName) return true;
  }
  return false;
}

/* 推进到下一个节点 */
function advanceLineNode(lineId, st, node){
  const line = LINES[lineId];

  /* 标记节点完成 */
  currentGame.flags[lineId + '-' + node.id] = true;

  /* 有台词或动作就走弹窗 */
  const hasContent = (node.lines && node.lines.length > 0)
                  || (node.do && node.do.length > 0);
  if(hasContent){
    queueStoryEvent({
      id: lineId + '_' + node.id,
      once: false,
      lines: node.lines || [],
      action: node.do || []
    });
  }

  st.nodeIdx++;
  /* 走完最后一个节点，整条剧情线标记为已完成 */
  if(st.nodeIdx >= line.nodes.length) st.status = 'done';
  if(typeof updateQuestBadge === 'function') updateQuestBadge();
  if(typeof updateAllUI === 'function') updateAllUI();
}

function triggerMatch(evtTrigger, realTrigger){
  if(!evtTrigger || !realTrigger) return false;
  if(evtTrigger.type !== realTrigger.type) return false;
  switch(evtTrigger.type){
       case 'tile_enter':
      return evtTrigger.tileId === realTrigger.tileId;
    case 'tile_leave':
      if(evtTrigger.mapId && evtTrigger.mapId !== realTrigger.mapId) return false;
      if(evtTrigger.tileId && evtTrigger.tileId !== realTrigger.tileId) return false;
      if(evtTrigger.toTileId && evtTrigger.toTileId !== realTrigger.toTileId) return false;
      return true;
    case 'npc_talk':
      return evtTrigger.npcId === realTrigger.npcId;
    case 'affinity':
      return evtTrigger.npcId === realTrigger.npcId;
    case 'battle_win':
    case 'battle_lose':
    case 'battle_flee':
      /* ✨ 按「地图格」匹配（剧情推进的主逻辑）
         兼容旧数据：节点里如果有 battleName 但没 tileId，走旧的遭遇战名匹配
         都没有 → 任意战斗结果都触发 */
      if(evtTrigger.tileId){
        return evtTrigger.tileId === realTrigger.tileId;
      }
      if(evtTrigger.battleName){
        return evtTrigger.battleName === realTrigger.battleName;
      }
      return true;
    case 'flag':
      return evtTrigger.key === realTrigger.key;
    case 'chapter_enter':
      return evtTrigger.chapter === realTrigger.chapter;
    case 'env_interact':
      /* ✨ 改为「地图格 + 环境卡名字」精确匹配
         - 旧格式（只有 envId）已由编辑器迁移为 tileId+envName
         - 未迁移的数据无法匹配，避免误触发 */
      if(!evtTrigger.tileId || !evtTrigger.envName) return false;
      return evtTrigger.tileId === realTrigger.tileId
          && evtTrigger.envName === realTrigger.envName;
    default:
      return true;
  }
}

/* ============================================================
   六、任务引擎
   ============================================================ */


/* ============================================================
   七、执行事件（弹窗版）
   ============================================================ */

let _storyModalState = null;

function runStoryEvent(evt, done){
  if(!evt){ if(done) done(); return; }
  const lines = evt.lines || [];
  /* 没台词，直接执行动作 */
  if(lines.length === 0){
    executeActions(evt.action || [])
      .then(() => {
        if(evt.once){ currentGame.flags['story_' + evt.id] = true; }
        try{ saveGame(currentSlot); }catch(e){}
      })
      .catch(err => {
        console.error('[story] 事件执行失败:', evt.id, err);
        toast('剧情执行出错，已跳过');
      })
      .finally(() => { if(done) done(); });
    return;
  }
  _storyModalState = {
    lines: lines,
    actions: evt.action || [],
    idx: 0,
    done: done,
    evtId: evt.id,
    once: !!evt.once
  };
  document.getElementById('storyModal').classList.add('show');
  renderStoryModalLine();
}

function escapeStoryHtml(s){
  return String(s==null?'':s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function renderStoryModalLine(){
  const st = _storyModalState;
  if(!st) return;
  const content = document.getElementById('storyModalContent');
  let html = '';
  for(let i = 0; i <= st.idx && i < st.lines.length; i++){
    const line = st.lines[i];
    const cls = 'story-modal-line ' + (line.type || 'npc');
    const txt = escapeStoryHtml(line.text).replace(/\n/g, '<br>');
    if(line.speaker){
      html += `<div class="${cls}"><span class="sml-speaker">【${escapeStoryHtml(line.speaker)}】</span>${txt}</div>`;
    }else{
      html += `<div class="${cls}">${txt}</div>`;
    }
  }
  content.innerHTML = html;
  content.scrollTop = content.scrollHeight;

  const nextBtn = document.getElementById('storyModalNext');
  nextBtn.textContent = (st.idx >= st.lines.length - 1) ? '结束' : '继续';
}

function storyModalNext(){
  const st = _storyModalState;
  if(!st) return;
  if(st.idx >= st.lines.length - 1){
    closeStoryModalAndRun();
  }else{
    st.idx++;
    renderStoryModalLine();
  }
}

function storyModalSkip(){
  closeStoryModalAndRun();
}

function closeStoryModalAndRun(){
  const st = _storyModalState;
  if(!st) return;
  _storyModalState = null;
  document.getElementById('storyModal').classList.remove('show');
  const actions = st.actions;
  const done = st.done;
  const evtId = st.evtId;
  const once = st.once;
  executeActions(actions)
    .then(() => {
      if(once && evtId){ currentGame.flags['story_' + evtId] = true; }
      try{ saveGame(currentSlot); }catch(e){}
    })
    .catch(err => {
      console.error('[story] 动作执行失败:', err);
      toast('剧情执行出错，已跳过');
    })
    .finally(() => { if(done) done(); });
}

/* ============================================================
   八、奖励弹窗 / 异步执行器
   ============================================================ */

let _rewardResolve = null;

function showRewardModal(title, body){
  return new Promise(resolve => {
    _rewardResolve = resolve;
    document.getElementById('rewardTitle').textContent = title;
    document.getElementById('rewardBody').textContent = body;
    document.getElementById('rewardModal').classList.add('show');
  });
}

function closeRewardModal(){
  document.getElementById('rewardModal').classList.remove('show');
  if(_rewardResolve){
    const r = _rewardResolve;
    _rewardResolve = null;
    r();
  }
}

function showConfirmAsync(title, msg){
  return new Promise(resolve => {
    document.getElementById('confirmActionTitle').textContent = title;
    document.getElementById('confirmActionMsg').textContent = msg;
    document.getElementById('confirmActionModal').classList.add('show');
    const btnConfirm = document.getElementById('confirmActionBtn');
    const btnCancel = document.querySelector('#confirmActionModal .btn-danger');
    btnConfirm.onclick = () => { closeConfirmAction(); resolve(true); };
    if(btnCancel) btnCancel.onclick = () => { closeConfirmAction(); resolve(false); };
  });
}

async function executeActions(actions){
  if(!actions || actions.length === 0) return;
  for(const act of actions){
    await doActionAsync(act);
    await new Promise(r => setTimeout(r, 80));
  }
}

async function doActionAsync(act){
  if(!act) return;
  switch(act.type){
        case 'give_item':{
      /* P2：未设计物品不发放，避免玩家拿到无词条装备 */
      const _tpl = (typeof EQUIPS !== 'undefined') ? EQUIPS[act.itemId] : null;
      if(!_tpl){
        await showRewardModal('物品不存在', `剧情引用了不存在的物品：${act.itemId}`);
        return;
      }
      if(typeof isItemAvailable === 'function' && !isItemAvailable(_tpl)){
        await showRewardModal('物品未设计', `${_tpl.name}（${act.itemId}）尚未设计，本次发放已跳过。`);
        return;
      }
      const cnt = Number(act.count || 1);
      let added = 0;
      for(let i = 0; i < cnt; i++){
        if(addItemToBag(act.itemId, act.wear, act.durability)) added++;
        else break;
      }
      const name = getItemName(act.itemId);
      if(added === 0){
        await showRewardModal('行囊已满', `${name} 未能放入行囊`);
      }else if(added < cnt){
        await showRewardModal('部分获得', `${name} ×${added}（行囊空间不足，剩余 ${cnt - added} 个未能放入）`);
      }else{
        await showRewardModal('获得物品', `${name}${cnt > 1 ? ' ×' + cnt : ''}`);
      }
      return;
    }
    case 'give_money':{
      const amt = Number(act.amount || 0);
      currentGame.money += amt;
      await showRewardModal('获得金钱', `￥${amt}`);
      updateAllUI();
      return;
    }
    case 'affinity':{
      const npc = getNpc(act.npcId);
      if(npc){
        const before = npc.affinity;
        npc.affinity = Math.max(0, Math.min(npc.affinityMax, npc.affinity + (act.delta || 0)));
        const diff = npc.affinity - before;
        if(diff !== 0){
          const sign = diff > 0 ? '+' : '';
          await showRewardModal('好感度变化', `${npc.name} 好感度 ${sign}${diff}\n（${npc.affinity}/${npc.affinityMax}）`);
        }
      }
      return;
    }
        case 'add_title':{
      /* 统一走 addTitle（内部 showChapterTitle 报幕 + 去重 + UI 刷新） */
      addTitle(act.titleId);
      return;
    }
    case 'ending':{
      /* 进入结局：节点台词播完后执行，弹出结局画面并结束游戏 */
      if(typeof showEnding === 'function'){
        showEnding({
          kind: act.kind || 'normal',
          title: act.title || '',
          text: act.text || ''
        });
      }
      return;
    }
    case 'battle':{
      /* doActionAsync 是 async 函数，await 可以正常使用。
         战斗结束（胜/败/逃）后由 battle.js 调用 _pendingBattleCallback 解锁。 */
      triggerBattleFromTile(act.encId);
      await new Promise(resolve => { _pendingBattleCallback = resolve; });
      return;
    }
    default:
      doAction(act);
      return;
  }
}

function doAction(act){
  if(!act) return;
  switch(act.type){
    case 'unlock_env':{
      if(!currentGame.unlockedEnvs) currentGame.unlockedEnvs = [];
      const envKey = act.tileId + '::' + act.envName;
      if(!currentGame.unlockedEnvs.includes(envKey)){
        currentGame.unlockedEnvs.push(envKey);
      }
      break;
    }
    case 'unlock_npc':{
      if(!currentGame.unlockedNpcs) currentGame.unlockedNpcs = [];
      if(!currentGame.unlockedNpcs.includes(act.npcId)){
        currentGame.unlockedNpcs.push(act.npcId);
      }
      break;
    }
    case 'teleport':{
      currentMapId = act.mapId;
      currentTileId = act.tileId;
      currentTalkNpc = null;
      renderCurrentMap();
      updateAllUI();
      renderNpcRow();
      break;
    }
    case 'battle':
      /* 本函数是同步函数，禁止写 await。
         真正的"等待战斗结束"逻辑在 doActionAsync 的 battle 分支处理。 */
      triggerBattleFromTile(act.encId);
      break;
    case 'remove_item':{
      const idx = currentGame.bag.findIndex(b => b.id === act.itemId);
      if(idx >= 0){
        currentGame.bag[idx].count -= (act.count || 1);
        if(currentGame.bag[idx].count <= 0) currentGame.bag.splice(idx, 1);
      }
      break;
    }
    case 'show_banner':
      if(typeof showChapterTitle === 'function') showChapterTitle(act.text || '');
      break;
    case 'unlock_tile':
      currentGame.flags['unlock_' + act.tileId] = true;
      if(typeof renderCurrentMap === 'function') renderCurrentMap();
      break;
    case 'heal_party':
      healPartyNow();
      break;
  }
  updateAllUI();
}
function healPartyNow(){
  if(!currentGame) return;
  currentGame.hp = getFinalMaxHp(currentGame);
  currentGame.mp = getFinalMaxMp(currentGame);
  const q = currentGame.queue;
  if(!q) return;
  ['front','back','rest'].forEach(r => {
    (q[r] || []).forEach(id => {
      if(id && id !== 'player'){
        const n = getNpc(id);
        if(n){
          /* 与面板上限一致：含装备 / 被动 / 百分比加成 */
          n.hp = getFinalMaxHp(n);
          n.mp = getFinalMaxMp(n);
        }
      }
    });
  });
}

/* ============================================================
   十、时间事件
   ============================================================ */

function checkTimeEvents(){
  if(!currentGame) return;
  if(typeof isGameFailed === 'function' && isGameFailed()) return;
  if(typeof isDeathNoticeOpen === 'function' && isDeathNoticeOpen()) return;
  const t = currentGame.time;
  const total = (t.year - 1) * 360 + (t.month - 1) * 30 + t.day;

  /* 遍历 LINES 里 on.type=time 的节点 */
  for(const lineId in LINES){
    const line = LINES[lineId];
    if(isLineInvalid(lineId)) continue;
    const st = getLineState(lineId);
    if(!st || st.status === 'done') continue;
    if(st.nodeIdx >= line.nodes.length) continue;
    const node = line.nodes[st.nodeIdx];
    if(!node || !node.on || node.on.type !== 'time') continue;
    if(total < node.on.day) continue;
    const reqList = node.requires || [];
    if(!checkConditionList(reqList)) continue;
    advanceLineNode(lineId, st, node);
    break;
  }

  /* 轮询无 on 的节点 */
  checkStoryTriggers(null);
}

/* ============================================================
   十二、节点剧情标记（地图节点绿边）
   ============================================================ */

