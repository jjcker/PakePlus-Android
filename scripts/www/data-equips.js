/* ============================================================
   data-equips.js — 物品表（装备 / 材料 / 药品 / 即时道具 / 特殊道具）
   说明：文件名与全局名 EQUIPS 是历史遗留；语义上它已经是全部物品。
   ============================================================ */

/* ============================================================
   槽位常量（暗黑化 8 槽 · 新 UI）
   ------------------------------------------------------------
   右手/左手沿用旧 id（mainHand/offHand）以兼容旧存档；
   项链沿用 accessory（戒指/项链类），挂饰沿用 charm；
   足部为本版新增的第 8 槽（feet）。
   ============================================================ */
const EQUIP_SLOTS = ['mainHand','offHand','head','chest','legs','accessory','charm','feet'];
const EQUIP_SLOT_LABEL = {
  mainHand:'右手', offHand:'左手', head:'头部', chest:'胸部',
  legs:'腿部', accessory:'项链', charm:'挂饰', feet:'足部'
};
/* 槽位 → 部位标签 */
const SLOT_TAG = {
  mainHand:'tag073', offHand:'tag074', head:'tag075', chest:'tag076',
  legs:'tag077', accessory:'tag078', charm:'tag079', feet:'tag086'
};

/* 饰品槽位推断：挂饰（护符/腰带/徽章类） vs 配饰（戒指/项链类）
   先查名称，名称未命中再查描述；返回 'charm' | 'accessory' */
const _CHARM_WORDS = ['护符','腰带','徽章','别针','算珠','之泪','之心'];
const _ACCESSORY_WORDS = ['戒指','项链','耳环','手镯','镯','面具','头饰','之环','之链','之眼','之光'];
function _inferAccessorySlot(name, desc){
  const hit = (str, words) => str && words.some(k => str.indexOf(k) >= 0);
  /* 描述优先（含明确形态词），名称兜底（处理顶级"之X"装备） */
  if(desc){
    if(hit(desc, _CHARM_WORDS)) return 'charm';
    if(hit(desc, _ACCESSORY_WORDS)) return 'accessory';
  }
  if(hit(name, _CHARM_WORDS)) return 'charm';
  if(hit(name, _ACCESSORY_WORDS)) return 'accessory';
  return 'accessory';
}

/* 武器：twoHanded 追加末尾（默认 false）。单手武器左右手均可，默认 slot=mainHand */
function W(i,n,l,p,w,c,t,v,d,tg,extra,twoHanded){
  const words = [{type: t==='p'?'phys_atk_up':'magic_atk_up', value:v}];
  if(extra && extra.length) extra.forEach(e => words.push(e));
  const tags = ["tag001","tag073"].concat(tg||[]);
  if(twoHanded) tags.push('tag080');
  return {id:i, name:n, type:'weapon', level:l, price:p, maxWear:w, classLimit:c,
    slot:'mainHand', twoHanded: !!twoHanded,
    words:words, desc:d, tags: tags};
}
/* 防具：slot 追加末尾（默认 chest 胸甲） */
function A(i,n,l,p,dur,c,def,d,tg,extra,slot){
  const s = slot || 'chest';
  const words = [{type:'def_up', value:def}];
  if(extra && extra.length) extra.forEach(e => words.push(e));
  const formTag = s==='head' ? 'tag083' : s==='legs' ? 'tag085' : s==='feet' ? 'tag087' : 'tag084';
  return {id:i, name:n, type:'armor', level:l, price:p, durability:dur, classLimit:c,
    slot:s,
    words:words, desc:d, tags: ["tag002", SLOT_TAG[s], formTag].concat(tg||[])};
}
/* 饰品：按名称/描述自动判定 slot（配饰 accessory / 挂饰 charm） */
function S2(i,n,l,p,w,d){
  const s = _inferAccessorySlot(n, d);
  return {id:i, name:n, type:'accessory', level:l, price:p, classLimit:null,
    slot:s,
    words:w, desc:d, tags: ["tag003", SLOT_TAG[s]]};
}
/* 盾牌：左手，有耐久，主词条 def_up */
function Sh(i,n,l,p,dur,c,def,d,tg,extra){
  const words = [{type:'def_up', value:def}];
  if(extra && extra.length) extra.forEach(e => words.push(e));
  return {id:i, name:n, type:'shield', level:l, price:p, durability:dur, classLimit:c,
    slot:'offHand',
    words:words, desc:d, tags: ["tag002","tag074","tag081"].concat(tg||[])};
}
/* 法器：左手魔导器，无耐久，词条自定义 */
function Fc(i,n,l,p,c,w,d,tg){
  return {id:i, name:n, type:'focus', level:l, price:p, classLimit:c,
    slot:'offHand',
    words:w||[], desc:d, tags: ["tag003","tag074","tag082"].concat(tg||[])};
}
function P(i,n,l,p,hp,mp,d){
  const o = {id:i, name:n, type:'consumable', category:'medicine', level:l, price:p, desc:d, tags: ["tag038"]};
  if(hp) o.recoverHp = hp;
  if(mp) o.recoverMp = mp;
  return o;
}
/* 带 effects 的药品：状态解除 / 恢复+解除 */
function PE(i,n,l,p,effects,d){
  return {id:i, name:n, type:'consumable', category:'medicine', level:l, price:p, effects:effects, desc:d, tags: ["tag038"]};
}

/* ============================================================
   物品分类（五分法）
   ------------------------------------------------------------
   顶层只有五类：装备 / 材料 / 药品 / 即时道具 / 特殊道具
   装备再按八个槽位细分：右手 / 左手 / 头部 / 胸部 / 腿部 / 项链 / 挂饰 / 足部
   旧存档里的 type 字段保持兼容，category 缺省时由 type 推导。
   ============================================================ */
const ITEM_TYPE_LABEL = {
  weapon:'武器', armor:'防具', shield:'盾牌', focus:'法器', accessory:'饰品',
  consumable:'药品', instant:'即时道具', material:'材料',
  other:'特殊道具', special:'特殊道具'
};
const ITEM_CATEGORY_LABEL = {
  equip:'装备', material:'材料', medicine:'药品',
  instant:'即时道具', special:'特殊道具'
};
const ITEM_CATEGORY_ORDER = ['equip','material','medicine','instant','special'];
const EQUIP_SLOT_ORDER = ['mainHand','offHand','head','chest','legs','accessory','charm','feet'];

/* 物品属于哪一类 */
function getItemCategory(tpl){
  if(!tpl) return 'special';
  if(tpl.category && ITEM_CATEGORY_LABEL[tpl.category]) return tpl.category;
  if(tpl.type === 'consumable') return 'medicine';
  if(tpl.type === 'material') return 'material';
  if(tpl.type === 'instant') return 'instant';
  if(tpl.type === 'special' || tpl.type === 'other') return 'special';
  if(tpl.type === 'weapon' || tpl.type === 'armor' || tpl.type === 'shield' ||
     tpl.type === 'focus' || tpl.type === 'accessory') return 'equip';
  return 'special';
}

/* 装备允许占用哪些槽：标签是唯一依据，type 只决定物品分类 */
function getItemEquipSlots(tpl){
  if(!tpl || getItemCategory(tpl) !== 'equip') return [];
  const tags = Array.isArray(tpl.tags) ? tpl.tags : [];
  const out = [];
  Object.keys(SLOT_TAG).forEach(slot => {
    if(tags.indexOf(SLOT_TAG[slot]) >= 0 && out.indexOf(slot) < 0) out.push(slot);
  });
  if(tpl.twoHanded || tags.indexOf('tag080') >= 0) return ['mainHand','offHand'];
  if(out.length) return out;
  /* 旧数据兜底：没有槽位标签时仍按 type 推断 */
  if(tpl.type === 'weapon') return ['mainHand'];
  if(tpl.type === 'shield' || tpl.type === 'focus') return ['offHand'];
  if(tpl.type === 'armor') return [tpl.slot || 'chest'];
  if(tpl.type === 'accessory') return [tpl.slot || 'accessory'];
  return [];
}
/* 兼容旧调用：返回主槽位 */
function getItemEquipSlot(tpl){
  const slots = getItemEquipSlots(tpl);
  return slots.length ? slots[0] : null;
}

/* 物品的使用效果：新格式 effects[]，旧格式 recoverHp / recoverMp 自动兼容 */
function getItemEffects(tpl){
  if(!tpl) return [];
  if(Array.isArray(tpl.effects) && tpl.effects.length) return tpl.effects;
  const out = [];
  if(tpl.recoverHp) out.push({ type:'hp_heal', value:tpl.recoverHp });
  if(tpl.recoverMp) out.push({ type:'mp_heal', value:tpl.recoverMp });
  return out;
}

function isEquipItem(tpl){ return getItemCategory(tpl) === 'equip'; }
function isUsableItem(tpl){
  const c = getItemCategory(tpl);
  return (c === 'medicine' || c === 'instant') && getItemEffects(tpl).length > 0;
}
function getItemCategoryLabel(tpl){
  const c = getItemCategory(tpl);
  if(c === 'equip'){
    const slot = getItemEquipSlot(tpl);
    const slotName = EQUIP_SLOT_LABEL[slot] || '';
    const typeName = ITEM_TYPE_LABEL[tpl.type] || '装备';
    return slotName ? (slotName + ' · ' + typeName) : typeName;
  }
  return ITEM_CATEGORY_LABEL[c] || '特殊道具';
}

/* ============================================================
   品质（由品质标签推断，用于 UI 显色）
   等级：粗制 < 制式 < 精工 < 传说 < 神话 < 神赐
   ============================================================ */
const QUALITY_ORDER = ['rough','normal','fine','legend','myth','divine'];
const QUALITY_META = {
  rough: {label:'粗制', color:'#9d9d9d', tag:'tag016'},
  normal:{label:'制式', color:'#e8e8e8', tag:'tag015'},
  fine:  {label:'精工', color:'#66a3ff', tag:'tag017'},
  legend:{label:'传说', color:'#ffb066', tag:'tag018'},
  myth:  {label:'神话', color:'#c060ff', tag:'tag019'},
  divine:{label:'神赐', color:'#ff6b81', tag:'tag020'}
};
function getQuality(tpl){
  if(!tpl || !tpl.tags) return 'normal';
  for(let i = QUALITY_ORDER.length - 1; i >= 0; i--){
    const q = QUALITY_ORDER[i];
    if(tpl.tags.indexOf(QUALITY_META[q].tag) >= 0) return q;
  }
  return 'normal';
}
/* ============================================================
   品阶（五档）—— 与等级互相独立
   ------------------------------------------------------------
   品阶管：词条数量（严格相等）、词条值倍率 V、强化上限、附伤系数 K、价格倍率 P
   等级管：装备门槛、附伤主参数、价值等级段
   ============================================================ */
const ITEM_RARITY_ORDER = ['common','useful','epic','legend','doom'];
const ITEM_RARITY = {
  common:{ id:'common', label:'平凡', color:'#e8e8e8', words:1, upCap:3,  k:0.6, priceMult:1.0, tag:'tag015' },
  useful:{ id:'useful', label:'实用', color:'#66a3ff', words:2, upCap:6,  k:0.8, priceMult:1.8, tag:'tag017' },
  epic:  { id:'epic',   label:'史诗', color:'#c060ff', words:3, upCap:9,  k:1.0, priceMult:3.2, tag:'tag019' },
  legend:{ id:'legend', label:'传说', color:'#ffb066', words:4, upCap:12, k:1.2, priceMult:5.5, tag:'tag018' },
  doom:  { id:'doom',   label:'毁灭', color:'#ff6b81', words:5, upCap:15, k:1.4, priceMult:9.5, tag:'tag020' }
};
function getItemRarity(tpl){
  return (tpl && tpl.rarity && ITEM_RARITY[tpl.rarity]) ? tpl.rarity : null;
}
function itemRarityInfo(tpl){
  const r = getItemRarity(tpl);
  return r ? ITEM_RARITY[r] : null;
}
/* 品阶要求的词条数（未定品阶返回 0） */
function itemWordCount(tpl){
  const info = itemRarityInfo(tpl);
  return info ? info.words : 0;
}
/* 词条数是否严格等于品阶 */
function itemWordsValid(tpl){
  if(!tpl) return false;
  const n = itemWordCount(tpl);
  return n > 0 && Array.isArray(tpl.words) && tpl.words.length === n;
}
/* 是否已完成设计（可用于掉落/商店） */
function isItemDesigned(tpl){
  if(!(tpl && !tpl.draft && getItemRarity(tpl) && itemWordsValid(tpl))) return false;
  return (tpl.words || []).every(function(w){ return !!(w && w.type); });
}

/* 词条中文名统一由 data-effects.js 的 EFFECT_ATOMS 派生，不再手写第二份 */
const EQUIP_WORD_LABEL = effectLabelMap('equip');

const EQUIPS = {};
/* 统一叫法：代码里 EQUIPS 是历史名字，新代码请用 ITEMS；
   两者指向同一张表，旧调用不受影响。 */
const ITEMS = EQUIPS;

/* ============================================================
   武器（w001-w236）
   ------------------------------------------------------------
   分类（tags）：剑 / 棍 / 匕首 / 杖 / 锤 / 手套 / 晶石 / 药瓶 / 书本
   命名规则：
     Lv1-2   生锈的 / 残破的 / 木质的 + 短名
     Lv3-9   2-3 字短名（青锋、秘银、玄重）
     Lv10-24 魔兽器官/材料名（芬里尔的獠牙）
     Lv25-29 星座系列（双子座·双生）
     Lv30-39 两字名（苍穹、深渊、幽冥）
     Lv40+   神的祝福（华丽长名）
   武器类型在 desc 里说明，名字不带分类后缀。
   ============================================================ */

/* ==================== 剑（w001-w024） ==================== */
Object.assign(EQUIPS, {
  eq_w001:W('eq_w001','生锈的铁剑',1,20,100,['战士','巡警','杀手'],'p',3,'剑身布满暗红锈迹的旧剑，勉强还能劈砍',['tag008','tag006','tag021','tag016']),
  eq_w002:W('eq_w002','残破的短剑',1,15,80,['战士','巡警','杀手'],'p',3,'刃口卷曲、剑柄松动的短剑，随时可能断裂',['tag008','tag006','tag021','tag016']),
  eq_w003:W('eq_w003','木剑',2,30,90,['战士','巡警','铁匠'],'p',4,'战士学院用来练手的木质长剑，比真剑轻',['tag008','tag006','tag028','tag015']),
  eq_w004:W('eq_w004','竹剑',2,25,70,['战士','巡警','杀手'],'p',4,'竹片拼接成的练习用剑，弹性好',['tag008','tag006','tag028','tag016']),
  eq_w005:W('eq_w005','青锋',3,80,120,['战士','巡警'],'p',6,'铁匠铺里最常见的制式长剑',['tag008','tag006','tag021','tag015']),
  eq_w006:W('eq_w006','弯月',3,85,110,['战士','巡警','杀手'],'p',6,'刃身略带弧度的铁质弯剑，劈砍更顺手',['tag008','tag006','tag021','tag015']),
  eq_w007:W('eq_w007','铜锋',4,120,130,['战士','巡警'],'p',8,'铜制剑身的阔剑，比铁剑略软但不易生锈',['tag008','tag006','tag023','tag015']),
  eq_w008:W('eq_w008','骑士剑',4,150,140,['战士','巡警'],'p',8,'剑身笔直、护手宽大的精制长剑',['tag008','tag006','tag021','tag017']),
  eq_w009:W('eq_w009','精钢',5,250,160,['战士','巡警'],'p',12,'反复锻打、刃口锋锐的精钢长剑',['tag008','tag006','tag022','tag017']),
  eq_w010:W('eq_w010','双刃',5,280,150,['战士','巡警','杀手'],'p',12,'两侧开刃、适合快速连击的长剑',['tag008','tag006','tag022','tag017']),
  eq_w011:W('eq_w011','细雪',6,500,180,['战士','巡警','杀手'],'p',16,'秘银锻造、剑身轻如羽毛的细剑',['tag008','tag006','tag025','tag017'],[{type:'spd_up',value:2}]),
  eq_w012:W('eq_w012','刺星',6,550,170,['战士','巡警','杀手'],'p',16,'细长剑身、专为穿刺设计的刺剑',['tag008','tag006','tag013','tag017'],[]),
  eq_w013:W('eq_w013','玄重',7,1000,200,['战士','巡警','铁匠'],'p',22,'玄铁铸成、重逾百斤的重剑',['tag008','tag006','tag024','tag017'],[{type:'def_up_pct',value:10}]),
  eq_w014:W('eq_w014','寒锋',7,1100,190,['战士','巡警'],'p',22,'寒铁锻造、剑身终年冰冷的长剑',['tag008','tag006','tag026','tag017'],[{type:'hp_drain_pct',value:5}]),
  eq_w015:W('eq_w015','烈阳',8,2000,220,['战士','巡警'],'p',30,'剑身流转暖光、据说淬过太阳石的长剑',['tag008','tag006','tag057','tag017'],[{type:'low_hp_power',value:15},{type:'burn_on_hit',value:6}]),
  eq_w016:W('eq_w016','暗影',8,2200,210,['杀手','巡警'],'p',30,'剑身涂成深黑、夜里几乎不可见的长剑',['tag008','tag006','tag063','tag017'],[{type:'silence_on_hit',value:15},{type:'hp_drain_pct',value:5}]),
  eq_w017:W('eq_w017','霜华',9,5000,240,['战士','巡警','法师'],'p',42,'剑身覆盖着永不融化霜层的长剑',['tag008','tag006','tag058','tag017'],[{type:'first_strike',value:15},{type:'spd_up',value:2}]),
  eq_w018:W('eq_w018','龙牙',9,5500,250,['战士','巡警'],'p',42,'用幼龙牙齿打磨而成的长剑',['tag008','tag006','tag030','tag017'],[{type:'execute_below',value:8}]),
  eq_w019:W('eq_w019','芬里尔的獠牙',10,160000,280,['战士','巡警'],'p',58,'巨狼芬里尔脱落的獠牙磨成的短剑，锋利得可怕',['tag008','tag006','tag046','tag018'],[{type:'low_hp_power',value:20}]),
  eq_w020:W('eq_w020','巨狼之牙',10,170000,280,['战士'],'p',58,'草原巨狼的牙齿磨成的长剑，据说能嗅到血腥',['tag008','tag006','tag046','tag018'],[{type:'execute_below',value:12},{type:'hp_drain_pct',value:6}]),
  eq_w021:W('eq_w021','双头龙之牙',15,600000,350,['战士','巡警'],'p',85,'双头龙的牙齿打磨成的长剑，蕴含龙威',['tag008','tag006','tag050','tag018'],[{type:'burn_on_hit',value:12},{type:'execute_below',value:14}]),
  eq_w022:W('eq_w022','远古巨兽之牙',20,2000000,450,['战士','巡警'],'p',120,'远古巨兽的獠牙磨成的长剑，比人还高',['tag008','tag006','tag046','tag018'],[{type:'low_hp_power',value:28},{type:'execute_below',value:18}]),
  eq_w023:W('eq_w023','双子座·双生',25,6000000,550,['战士'],'p',160,'双子星辉凝成的双生之剑，成对挥舞时星芒四射',['tag008','tag006','tag070','tag018'],[{type:'first_strike',value:25},{type:'execute_below',value:20},{type:'hp_drain_pct',value:12}]),
  eq_w024:W('eq_w024','剑神的祝福',40,120000000,1000,['战士'],'p',350,'剑神赐福的圣剑，剑身流转神辉，据说能斩断因果',['tag008','tag006','tag019','tag020'],[{type:'low_hp_power',value:50},{type:'execute_below',value:38},{type:'hp_drain_pct',value:20},{type:'first_strike',value:40}])
});

/* ==================== 棍（w025-w046） ==================== */
Object.assign(EQUIPS, {
  eq_w025:W('eq_w025','生锈的铁棍',1,15,120,['战士','巡警','铁匠'],'p',3,'从废铁堆里捡来的铁质长棍',['tag011','tag006','tag021','tag016']),
  eq_w026:W('eq_w026','残破的木棍',1,10,80,['战士','巡警','商人'],'p',3,'随手折来的木棍，勉强能用',['tag011','tag006','tag028','tag016']),
  eq_w027:W('eq_w027','长棍',2,35,110,['战士','巡警','铁匠'],'p',4,'整根硬木削成的木棍，比普通木棍长出一截',['tag011','tag006','tag028','tag015']),
  eq_w028:W('eq_w028','警棍',2,30,100,['巡警','战士'],'p',4,'巡警的标准练习木棍，两头包着布',['tag011','tag006','tag028','tag015']),
  eq_w029:W('eq_w029','铁棍',3,90,140,['战士','巡警','铁匠'],'p',6,'铁质棍身、两端略粗的长棍',['tag011','tag006','tag021','tag015']),
  eq_w030:W('eq_w030','短棍',3,80,120,['巡警','战士'],'p',6,'比长棍短一截的铁棍，适合近身',['tag011','tag006','tag021','tag015']),
  eq_w031:W('eq_w031','铜棍',4,150,150,['战士','巡警','铁匠'],'p',8,'铜制棍身，比铁棍更亮',['tag011','tag006','tag023','tag015']),
  eq_w032:W('eq_w032','铁头',4,180,160,['战士','铁匠'],'p',8,'棍头包着精铁的长棍，砸下去势大力沉',['tag011','tag006','tag021','tag017']),
  eq_w033:W('eq_w033','精钢',5,300,170,['战士','巡警','铁匠'],'p',12,'精钢铸成、棍身笔直的长棍',['tag011','tag006','tag022','tag017']),
  eq_w034:W('eq_w034','双节',5,350,150,['战士','杀手'],'p',12,'两节精钢棍由铁链相连的双节棍，挥舞如风',['tag011','tag006','tag022','tag017'],[{type:'first_strike',value:10}]),
  eq_w035:W('eq_w035','秘银长棍',6,600,190,['战士','巡警','铁匠'],'p',16,'秘银打造、轻便且坚固的长棍',['tag011','tag006','tag025','tag017'],[{type:'spd_up',value:2}]),
  eq_w036:W('eq_w036','软银',6,650,180,['杀手','巡警'],'p',16,'秘银内芯、外裹软皮的软棍，挥舞无声',['tag011','tag006','tag025','tag017'],[{type:'silence_on_hit',value:12}]),
  eq_w037:W('eq_w037','玄重',7,1200,220,['战士','铁匠'],'p',22,'玄铁铸成、重逾百斤的长棍',['tag011','tag006','tag024','tag017'],[{type:'def_up_pct',value:12}]),
  eq_w038:W('eq_w038','寒铁长棍',7,1300,210,['战士','巡警'],'p',22,'寒铁锻造、握在手里冰凉刺骨的长棍',['tag011','tag006','tag026','tag017'],[{type:'hp_drain_pct',value:5}]),
  eq_w039:W('eq_w039','雷击',8,2200,230,['战士','巡警'],'p',30,'棍身缠绕着细微电弧的长棍',['tag011','tag006','tag059','tag017'],[{type:'first_strike',value:18},{type:'silence_on_hit',value:15}]),
  eq_w040:W('eq_w040','疾风',8,2400,220,['战士','杀手'],'p',30,'棍身刻着风纹、挥舞时疾风相随的长棍',['tag011','tag006','tag060','tag017'],[{type:'spd_up',value:3},{type:'first_strike',value:15}]),
  eq_w041:W('eq_w041','龙筋长棍',9,5500,260,['战士','巡警','铁匠'],'p',42,'用龙筋缠绕而成的长棍，弹性极佳',['tag011','tag006','tag054','tag018'],[{type:'counter_start',value:1},{type:'def_up_pct',value:15}]),
  eq_w042:W('eq_w042','星辰长棍',9,6000,250,['战士','巡警'],'p',42,'棍身嵌着星辰碎片、夜里会发光的长棍',['tag011','tag006','tag069','tag018'],[]),
  eq_w043:W('eq_w043','猛犸的骨棒',10,160000,300,['战士','铁匠'],'p',58,'远古猛犸的腿骨磨成的巨棒，沉重无比',['tag011','tag006','tag030','tag018'],[{type:'low_hp_power',value:20}]),
  eq_w044:W('eq_w044','巨人的腿骨',10,180000,320,['战士'],'p',58,'雪山巨人的腿骨磨成的长棍，据说有千斤重',['tag011','tag006','tag030','tag018'],[{type:'def_up_pct',value:18},{type:'execute_below',value:12}]),
  eq_w045:W('eq_w045','天秤座·裁决',25,5500000,580,['战士','巡警'],'p',160,'天秤星辉凝成的裁决之棍，两端平衡如秤',['tag011','tag006','tag070','tag018'],[{type:'execute_below',value:20},{type:'def_up_pct',value:22}]),
  eq_w046:W('eq_w046','雷神的祝福',40,120000000,1000,['战士'],'p',350,'雷神赐福的战棍，挥动时雷鸣电闪，诸邪退避',['tag011','tag006','tag019','tag020'],[{type:'low_hp_power',value:50},{type:'first_strike',value:45},{type:'def_up_pct',value:30}])
});

/* ==================== 匕首（w047-w068） ==================== */
Object.assign(EQUIPS, {
  eq_w047:W('eq_w047','生锈的匕首',1,15,80,['杀手','巡警','商人'],'p',4,'刃口早已卷曲的旧匕首，但捅人依然有效',['tag009','tag006','tag021','tag016']),
  eq_w048:W('eq_w048','残破的短刃',1,12,70,['杀手','巡警'],'p',4,'刀柄缠着破布、随时可能脱手的短刃',['tag009','tag006','tag021','tag016']),
  eq_w049:W('eq_w049','木匕',2,30,80,['杀手','巡警','商人'],'p',4,'木片刻成的短匕，练习用',['tag009','tag006','tag028','tag015']),
  eq_w050:W('eq_w050','木镖',2,35,60,['杀手','商人'],'p',4,'木质飞镖，掷出去比看起来疼',['tag009','tag007','tag028','tag015']),
  eq_w051:W('eq_w051','铁匕',3,80,100,['杀手','巡警','商人'],'p',6,'最常见的制式短刃',['tag009','tag006','tag021','tag015']),
  eq_w052:W('eq_w052','短刃',3,85,110,['杀手','巡警'],'p',6,'比匕首长、比长剑短的铁质短刃',['tag009','tag006','tag021','tag015']),
  eq_w053:W('eq_w053','铜匕',4,130,120,['杀手','商人'],'p',8,'铜制刃身，比铁匕略软',['tag009','tag006','tag023','tag015']),
  eq_w054:W('eq_w054','刺客',4,170,130,['杀手'],'p',8,'刃身呈流线型的精制匕首，入肉无声',['tag009','tag006','tag021','tag017'],[{type:'silence_on_hit',value:8}]),
  eq_w055:W('eq_w055','精钢',5,280,140,['杀手','巡警'],'p',12,'精钢锻造、刃口锋利的匕首',['tag009','tag006','tag022','tag017']),
  eq_w056:W('eq_w056','双匕',5,320,130,['杀手'],'p',12,'一对精钢短匕，双手齐出',['tag009','tag006','tag022','tag017'],[{type:'first_strike',value:12}]),
  eq_w057:W('eq_w057','秘银',6,550,150,['杀手','巡警'],'p',16,'秘银打造、轻便且不易被发现的匕首',['tag009','tag006','tag025','tag017'],[{type:'spd_up',value:2}]),
  eq_w058:W('eq_w058','袖剑',6,600,130,['杀手'],'p',16,'藏在袖子里的秘银细剑，出手极快',['tag009','tag006','tag025','tag017'],[{type:'first_strike',value:15},{type:'silence_on_hit',value:10}]),
  eq_w059:W('eq_w059','玄匕',7,1100,170,['杀手','巡警'],'p',22,'玄铁铸成、刃身发暗的匕首',['tag009','tag006','tag024','tag017'],[]),
  eq_w060:W('eq_w060','寒匕',7,1200,160,['杀手'],'p',22,'刃身覆盖寒霜、切割时伤口不易愈合的匕首',['tag009','tag006','tag026','tag017'],[{type:'hp_drain_pct',value:7}]),
  eq_w061:W('eq_w061','毒牙',8,2000,180,['杀手'],'p',30,'刃上淬着剧毒的匕首，见血封喉',['tag009','tag006','tag061','tag017'],[{type:'poison_on_hit',value:12},{type:'silence_on_hit',value:15}]),
  eq_w062:W('eq_w062','暗影',8,2200,170,['杀手'],'p',30,'刃身漆黑、挥动时连光影都没有的匕首',['tag009','tag006','tag063','tag017'],[{type:'silence_on_hit',value:18},{type:'hp_drain_pct',value:6}]),
  eq_w063:W('eq_w063','影杀',9,5000,190,['杀手'],'p',42,'刃身薄如蝉翼、出鞘无声的匕首',['tag009','tag006','tag064','tag018'],[{type:'first_strike',value:25},{type:'silence_on_hit',value:22},{type:'hp_drain_pct',value:8}]),
  eq_w064:W('eq_w064','血刃',9,5500,200,['杀手','巡警'],'p',42,'刃身泛着暗红、据说饮过千人血的匕首',['tag009','tag006','tag065','tag018'],[{type:'hp_drain_pct',value:12},{type:'execute_below',value:10}]),
  eq_w065:W('eq_w065','蛇王獠牙',10,160000,220,['杀手'],'p',58,'蛇王的獠牙磨成的短匕，毒液不绝',['tag009','tag006','tag072','tag018'],[{type:'poison_on_hit',value:18}]),
  eq_w066:W('eq_w066','蝎尾毒刺',10,170000,220,['杀手','巡警'],'p',58,'沙漠巨蝎的尾刺磨成的短匕，尖端有倒钩',['tag009','tag006','tag013','tag018'],[{type:'poison_on_hit',value:15},{type:'silence_on_hit',value:20}]),
  eq_w067:W('eq_w067','巨蟹座·暗杀',25,5800000,400,['杀手'],'p',160,'巨蟹星辉凝成的暗杀之匕，刃身能切割影子',['tag009','tag006','tag070','tag018'],[{type:'first_strike',value:32},{type:'silence_on_hit',value:35},{type:'execute_below',value:22},{type:'hp_drain_pct',value:15}]),
  eq_w068:W('eq_w068','刺客之神的祝福',40,120000000,800,['杀手'],'p',350,'刺客之神赐福的匕首，无影无形，出手便是终局',['tag009','tag006','tag019','tag020'],[{type:'first_strike',value:50},{type:'silence_on_hit',value:45},{type:'execute_below',value:42},{type:'hp_drain_pct',value:22}])
});

/* ==================== 杖（w069-w092） ==================== */
Object.assign(EQUIPS, {
  eq_w069:W('eq_w069','生锈的短杖',1,20,60,['法师','阵法师','炼金术师'],'m',4,'杖身锈迹斑斑的旧法杖，魔力传导一般',['tag010','tag007','tag021','tag016']),
  eq_w070:W('eq_w070','残破的法杖',1,25,50,['法师','阵法师','疗愈师'],'m',4,'杖头水晶早已碎裂、只剩空壳的旧法杖',['tag010','tag007','tag028','tag016']),
  eq_w071:W('eq_w071','学徒',2,40,70,['法师','阵法师','疗愈师','炼金术师'],'m',4,'学徒人手一根的入门木质法杖',['tag010','tag007','tag028','tag015']),
  eq_w072:W('eq_w072','教习',2,35,60,['法师','疗愈师'],'m',4,'魔能塔教学用的木质法杖，顶端嵌着普通水晶',['tag010','tag007','tag028','tag015']),
  eq_w073:W('eq_w073','铁杖',3,100,90,['法师','阵法师'],'m',6,'铁质杖身的法杖，比木杖更稳',['tag010','tag007','tag021','tag015']),
  eq_w074:W('eq_w074','灵光',3,110,80,['法师','疗愈师'],'m',6,'杖头嵌着一颗发光铁晶的铁质法杖',['tag010','tag007','tag021','tag015']),
  eq_w075:W('eq_w075','铜杖',4,180,100,['法师','阵法师','炼金术师'],'m',8,'铜质杖身的法杖，导热快、适合火系魔法',['tag010','tag007','tag023','tag015']),
  eq_w076:W('eq_w076','白杖',4,200,90,['疗愈师','法师'],'m',8,'杖身洁白、嵌着一颗水晶的精制法杖',['tag010','tag007','tag043','tag017']),
  eq_w077:W('eq_w077','精钢',5,350,110,['法师','阵法师'],'m',12,'精钢杖身、魔力流转顺畅的法杖',['tag010','tag007','tag022','tag017']),
  eq_w078:W('eq_w078','火杖',5,400,100,['法师','炼金术师'],'m',12,'杖头嵌着火红宝石、散发暖意的精钢法杖',['tag010','tag007','tag022','tag017'],[{type:'burn_on_hit',value:6}]),
  eq_w079:W('eq_w079','秘银法杖',6,700,120,['法师','阵法师','疗愈师'],'m',16,'秘银杖身、轻如鸿毛、魔力传导极佳的法杖',['tag010','tag007','tag025','tag017'],[{type:'maxmp_up',value:15}]),
  eq_w080:W('eq_w080','星杖',6,750,110,['法师','阵法师'],'m',16,'杖头嵌着一颗星辰碎片的秘银法杖',['tag010','tag007','tag025','tag017'],[{type:'magic_atk_up_pct',value:8}]),
  eq_w081:W('eq_w081','玄杖',7,1400,140,['法师','阵法师'],'m',22,'玄铁杖身沉重、魔力浑厚的法杖',['tag010','tag007','tag024','tag017'],[{type:'magic_atk_up_pct',value:10}]),
  eq_w082:W('eq_w082','寒杖',7,1500,130,['法师','阵法师'],'m',22,'寒铁杖身、散发的魔力带着凉意的法杖',['tag010','tag007','tag026','tag017'],[{type:'spd_up',value:2}]),
  eq_w083:W('eq_w083','烈焰',8,2500,150,['法师','炼金术师'],'m',30,'杖头火焰不灭、魔力如火的法杖',['tag010','tag007','tag057','tag017'],[{type:'burn_on_hit',value:10},{type:'magic_atk_up_pct',value:10}]),
  eq_w084:W('eq_w084','冰霜',8,2600,150,['法师','阵法师'],'m',30,'杖头凝结着永不融化冰晶的法杖',['tag010','tag007','tag058','tag017'],[{type:'spd_up',value:3},{type:'magic_atk_up_pct',value:10}]),
  eq_w085:W('eq_w085','星辰法杖',9,6000,170,['法师','阵法师','疗愈师'],'m',42,'杖头星光流转、据说能引动星辰之力的法杖',['tag010','tag007','tag069','tag018'],[{type:'magic_atk_up_pct',value:12},{type:'maxmp_up',value:25}]),
  eq_w086:W('eq_w086','龙语法杖',9,6500,180,['法师','阵法师'],'m',42,'杖身刻满龙语符文、魔力澎湃的法杖',['tag010','tag007','tag056','tag018'],[{type:'magic_atk_up_pct',value:14}]),
  eq_w087:W('eq_w087','独角兽的角',10,160000,200,['法师','疗愈师'],'m',58,'独角兽褪下的角做成的法杖，蕴含纯粹的治愈之力',['tag010','tag007','tag048','tag018'],[{type:'maxmp_up',value:35},{type:'magic_atk_up_pct',value:15},{type:'lifesteal_on_kill',value:4}]),
  eq_w088:W('eq_w088','凤羽',10,180000,200,['法师','炼金术师'],'m',58,'凤凰羽毛化成的法杖，杖身火焰不灭',['tag010','tag007','tag049','tag018'],[{type:'magic_atk_up_pct',value:16},{type:'burn_on_hit',value:15}]),
  eq_w089:W('eq_w089','巨巫',15,700000,250,['法师','阵法师'],'m',85,'远古巨人巫师的遗物，魔力深不可测',['tag010','tag007','tag030','tag018'],[{type:'magic_atk_up_pct',value:18},{type:'maxmp_up',value:45}]),
  eq_w090:W('eq_w090','古树',20,2200000,320,['法师','疗愈师','阵法师'],'m',120,'精灵古树的核心枝干制成，蕴含生命本源',['tag010','tag007','tag028','tag018'],[{type:'magic_atk_up_pct',value:22},{type:'maxmp_up',value:60},{type:'lifesteal_on_kill',value:6}]),
  eq_w091:W('eq_w091','处女座·星辉',25,6500000,450,['法师','疗愈师','阵法师'],'m',160,'处女星辉凝成的法杖，魔力洁净如初雪',['tag010','tag007','tag070','tag018'],[{type:'magic_atk_up_pct',value:28},{type:'maxmp_up',value:80},{type:'lifesteal_on_kill',value:10}]),
  eq_w092:W('eq_w092','法神的祝福',40,120000000,900,['法师','阵法师','疗愈师'],'m',350,'法神赐福的圣杖，掌握世间一切魔法本源',['tag010','tag007','tag019','tag020'],[{type:'magic_atk_up_pct',value:38},{type:'maxmp_up',value:150},{type:'lifesteal_on_kill',value:18},{type:'first_strike',value:40}])
});

/* ==================== 锤（w093-w114） ==================== */
Object.assign(EQUIPS, {
  eq_w093:W('eq_w093','生锈的铁锤',1,18,110,['铁匠','战士','巡警'],'p',3,'铁匠铺里最常见的敲打铁锤，锈迹斑斑',['tag012','tag006','tag021','tag016']),
  eq_w094:W('eq_w094','残破的锤子',1,12,90,['铁匠','战士'],'p',3,'锤头松动、用力过猛会脱落的大锤',['tag012','tag006','tag021','tag016']),
  eq_w095:W('eq_w095','木锤',2,30,100,['铁匠','战士'],'p',4,'整块硬木削成的木锤，敲打练习用',['tag012','tag006','tag028','tag015']),
  eq_w096:W('eq_w096','木战锤',2,35,90,['战士','铁匠'],'p',4,'木制战锤，比木锤重得多',['tag012','tag006','tag028','tag015']),
  eq_w097:W('eq_w097','铁锤',3,80,130,['铁匠','战士'],'p',6,'铁质锤头、能砸碎石头的战锤',['tag012','tag006','tag021','tag015']),
  eq_w098:W('eq_w098','铁战锤',3,90,140,['战士','铁匠'],'p',6,'双面开锤的铁质战锤，战场上让人胆寒',['tag012','tag006','tag021','tag015']),
  eq_w099:W('eq_w099','铜锤',4,140,150,['铁匠','战士'],'p',8,'铜质战锤，比铁锤软但不易崩口',['tag012','tag006','tag023','tag015']),
  eq_w100:W('eq_w100','铁匠锤',4,180,160,['铁匠'],'p',8,'专门为锻造设计的精制锤子，锤面平整',['tag012','tag006','tag021','tag017']),
  eq_w101:W('eq_w101','精钢',5,300,170,['铁匠','战士'],'p',12,'精钢锻造、锤头沉重的战锤',['tag012','tag006','tag022','tag017']),
  eq_w102:W('eq_w102','战锤',5,350,180,['战士','铁匠'],'p',12,'双手精钢战锤，锤头刻着兽纹',['tag012','tag006','tag022','tag017'],[]),
  eq_w103:W('eq_w103','秘银战锤',6,600,200,['铁匠','战士'],'p',16,'秘银锤身、比精钢更轻便的战锤',['tag012','tag006','tag025','tag017'],[{type:'spd_up',value:2}]),
  eq_w104:W('eq_w104','双锤',6,700,190,['战士'],'p',16,'一对秘银战锤，双手轮流挥击',['tag012','tag006','tag025','tag017'],[{type:'first_strike',value:12}]),
  eq_w105:W('eq_w105','玄重',7,1200,220,['铁匠','战士'],'p',22,'玄铁铸成、锤头如山的重锤',['tag012','tag006','tag024','tag017'],[]),
  eq_w106:W('eq_w106','寒铁战锤',7,1300,210,['铁匠','战士'],'p',22,'寒铁锤身、握在手里刺骨冰寒的战锤',['tag012','tag006','tag026','tag017'],[{type:'spd_up',value:2}]),
  eq_w107:W('eq_w107','雷锤',8,2200,240,['战士','铁匠'],'p',30,'锤头缠绕着细密电弧的战锤',['tag012','tag006','tag059','tag017'],[{type:'silence_on_hit',value:15}]),
  eq_w108:W('eq_w108','熔岩',8,2400,240,['铁匠','战士'],'p',30,'锤头如熔岩般赤红、可熔铁断金的战锤',['tag012','tag006','tag057','tag017'],[{type:'burn_on_hit',value:12}]),
  eq_w109:W('eq_w109','星辰',9,6000,260,['战士','铁匠'],'p',42,'锤头嵌着星辰碎片、星光四射的战锤',['tag012','tag006','tag069','tag018'],[{type:'execute_below',value:12}]),
  eq_w110:W('eq_w110','龙牙',9,6500,280,['战士'],'p',42,'用巨龙獠牙镶嵌的锤子，一击可碎骨',['tag012','tag006','tag052','tag018'],[{type:'execute_below',value:15}]),
  eq_w111:W('eq_w111','巨锤',10,170000,300,['战士','铁匠'],'p',58,'雪山巨人的战锤，重逾千斤',['tag012','tag006','tag029','tag018'],[{type:'execute_below',value:18}]),
  eq_w112:W('eq_w112','陨铁战锤',15,700000,380,['战士','铁匠'],'p',85,'天外陨铁锻造、锤头刻着星图的战锤',['tag012','tag006','tag027','tag018'],[{type:'execute_below',value:22},{type:'true_dmg_bonus',value:15}]),
  eq_w113:W('eq_w113','摩羯座·山岳',25,6500000,650,['战士','铁匠'],'p',160,'摩羯星辉凝成的山岳之锤，一锤可裂地',['tag012','tag006','tag070','tag018'],[{type:'execute_below',value:28},{type:'true_dmg_bonus',value:22},{type:'low_hp_power',value:35}]),
  eq_w114:W('eq_w114','雷神的裁决',40,120000000,1100,['战士','铁匠'],'p',350,'雷神之锤的仿制品，雷光缠绕，凡人持之如持天威',['tag012','tag006','tag019','tag020'],[{type:'execute_below',value:38},{type:'true_dmg_bonus',value:35},{type:'low_hp_power',value:50},{type:'first_strike',value:40}])
});

/* ==================== 手套（w115-w136） ==================== */
Object.assign(EQUIPS, {
  eq_w115:W('eq_w115','生锈的指虎',1,15,70,['战士','巡警','杀手'],'p',3,'铁片打成的指虎，勉强能砸人',['tag033','tag006','tag021','tag016']),
  eq_w116:W('eq_w116','残破的手套',1,10,60,['战士','巡警','铁匠'],'p',3,'兽皮缝制、掌心已破的拳套',['tag033','tag006','tag031','tag016']),
  eq_w117:W('eq_w117','木拳套',2,30,80,['战士','巡警','铁匠'],'p',4,'木片拼成的拳套，练习用',['tag033','tag006','tag028','tag015']),
  eq_w118:W('eq_w118','木护手',2,25,70,['战士','杀手'],'p',4,'木质护手，只能挡挡普通拳脚',['tag033','tag006','tag028','tag015']),
  eq_w119:W('eq_w119','铁指虎',3,80,100,['战士','巡警','杀手'],'p',6,'铁质指虎，拳拳到肉',['tag033','tag006','tag021','tag015']),
  eq_w120:W('eq_w120','铁护手',3,90,110,['战士','铁匠'],'p',6,'铁片打造、护住手背的护手',['tag033','tag006','tag021','tag015']),
  eq_w121:W('eq_w121','铜拳套',4,140,120,['战士','巡警'],'p',8,'铜质拳套，比铁质略软',['tag033','tag006','tag023','tag015']),
  eq_w122:W('eq_w122','武斗手套',4,180,130,['战士','杀手'],'p',8,'兽皮与铁片混合制成的精制手套，兼顾防护与灵活',['tag033','tag006','tag031','tag017']),
  eq_w123:W('eq_w123','精钢',5,300,140,['战士','巡警'],'p',12,'精钢铸成、拳如铁锤的拳套',['tag033','tag006','tag022','tag017']),
  eq_w124:W('eq_w124','精钢护手',5,320,150,['战士','铁匠'],'p',12,'精钢护手，能格挡刀剑',['tag033','tag006','tag022','tag017'],[{type:'def_up_pct',value:5}]),
  eq_w125:W('eq_w125','秘银拳套',6,600,160,['战士','杀手'],'p',16,'秘银打造、轻便且坚固的拳套',['tag033','tag006','tag025','tag017'],[{type:'spd_up',value:2}]),
  eq_w126:W('eq_w126','秘银护手',6,650,170,['战士','巡警'],'p',16,'秘银护手，格挡时几乎无震动',['tag033','tag006','tag025','tag017'],[{type:'def_up_pct',value:8}]),
  eq_w127:W('eq_w127','玄铁拳套',7,1200,180,['战士','铁匠'],'p',22,'玄铁铸成、一拳可碎骨的拳套',['tag033','tag006','tag024','tag017'],[]),
  eq_w128:W('eq_w128','寒铁拳套',7,1300,170,['战士','杀手'],'p',22,'寒铁拳套，击中后伤口不易愈合',['tag033','tag006','tag026','tag017'],[{type:'hp_drain_pct',value:6}]),
  eq_w129:W('eq_w129','烈焰',8,2200,190,['战士','铁匠'],'p',30,'拳套上烈焰缠绕、出拳带火的拳套',['tag033','tag006','tag057','tag017'],[{type:'burn_on_hit',value:12},{type:'low_hp_power',value:15}]),
  eq_w130:W('eq_w130','冰霜',8,2300,190,['战士','杀手'],'p',30,'拳套上凝结着冰霜、出拳带寒的拳套',['tag033','tag006','tag058','tag017'],[{type:'spd_up',value:3},{type:'silence_on_hit',value:12}]),
  eq_w131:W('eq_w131','龙爪拳套',9,6000,210,['战士','杀手'],'p',42,'套面嵌着龙爪、挥出时带起爪影的拳套',['tag033','tag006','tag053','tag018'],[{type:'execute_below',value:12}]),
  eq_w132:W('eq_w132','星辰拳套',9,6200,220,['战士'],'p',42,'拳套上星光流转、出拳如流星的拳套',['tag033','tag006','tag069','tag018'],[{type:'first_strike',value:22}]),
  eq_w133:W('eq_w133','巨爪',10,170000,250,['战士','铁匠'],'p',58,'远古巨兽的利爪打磨而成的拳套，锋利异常',['tag033','tag006','tag014','tag018'],[{type:'execute_below',value:15}]),
  eq_w134:W('eq_w134','龙鳞拳套',15,700000,320,['战士','杀手'],'p',85,'龙鳞打造的拳套，鳞片层叠如甲',['tag033','tag006','tag051','tag018'],[{type:'def_up_pct',value:20},{type:'counter_start',value:1}]),
  eq_w135:W('eq_w135','狮子座·王拳',25,6000000,500,['战士','巡警'],'p',160,'狮子星辉凝成的王者之拳，出拳如狮吼',['tag033','tag006','tag070','tag018'],[{type:'first_strike',value:30},{type:'low_hp_power',value:35},{type:'counter_start',value:2}]),
  eq_w136:W('eq_w136','武神的祝福',40,120000000,900,['战士'],'p',350,'武神赐福的拳套，拳出如龙，一击可碎山河',['tag033','tag006','tag019','tag020'],[{type:'first_strike',value:45},{type:'low_hp_power',value:50},{type:'execute_below',value:32},{type:'counter_start',value:4}])
});

/* ==================== 晶石（w137-w158） ==================== */
Object.assign(EQUIPS, {
  eq_w137:W('eq_w137','生锈的碎晶',1,20,50,['阵法师','法师','炼金术师'],'m',4,'从废墟里捡来的碎水晶，勉强能用的咒术媒介',['tag041','tag007','tag043','tag016']),
  eq_w138:W('eq_w138','残破的晶石',1,15,40,['阵法师','炼金术师'],'m',4,'表面布满裂纹、随时可能碎裂的咒术晶石',['tag041','tag007','tag043','tag016']),
  eq_w139:W('eq_w139','木盘',2,40,60,['阵法师','法师'],'m',4,'木质圆盘阵具，上面刻着简易纹路',['tag041','tag007','tag028','tag015']),
  eq_w140:W('eq_w140','木符',2,35,50,['阵法师','疗愈师'],'m',4,'刻着符文的木板阵具，用于摆放小型阵法',['tag041','tag007','tag028','tag015']),
  eq_w141:W('eq_w141','铁盘',3,100,80,['阵法师','法师'],'m',6,'铁质圆盘阵具，比木盘更稳固',['tag041','tag007','tag021','tag015']),
  eq_w142:W('eq_w142','铁符',3,110,70,['阵法师','疗愈师'],'m',6,'铁质符板阵具，纹路比木符板更深',['tag041','tag007','tag021','tag015']),
  eq_w143:W('eq_w143','铜盘',4,180,90,['阵法师','法师'],'m',8,'铜质圆盘阵具，纹路雕刻得更加精细',['tag041','tag007','tag023','tag015']),
  eq_w144:W('eq_w144','阵盘',4,220,100,['阵法师'],'m',8,'阵法师的入门道具，用于摆放小型阵法',['tag041','tag007','tag029','tag017']),
  eq_w145:W('eq_w145','精钢盘',5,350,110,['阵法师','法师'],'m',12,'精钢阵盘，纹路精细如发',['tag041','tag007','tag022','tag017']),
  eq_w146:W('eq_w146','精钢晶',5,400,100,['法师','炼金术师'],'m',12,'精钢包裹的晶石，魔力流转顺畅',['tag041','tag007','tag022','tag017']),
  eq_w147:W('eq_w147','秘银盘',6,700,130,['阵法师'],'m',16,'秘银阵盘，纹路精细、能布下中型阵法',['tag041','tag007','tag025','tag017'],[{type:'maxmp_up',value:15}]),
  eq_w148:W('eq_w148','秘银晶',6,750,120,['法师','炼金术师'],'m',16,'秘银包裹的晶石，魔力传导极佳',['tag041','tag007','tag025','tag017'],[{type:'magic_atk_up_pct',value:8}]),
  eq_w149:W('eq_w149','玄铁盘',7,1400,150,['阵法师'],'m',22,'玄铁阵盘，沉重而稳重',['tag041','tag007','tag024','tag017'],[{type:'magic_atk_up_pct',value:10}]),
  eq_w150:W('eq_w150','寒铁晶',7,1500,140,['法师','阵法师'],'m',22,'寒铁包裹的晶石，散发的魔力带着凉意',['tag041','tag007','tag026','tag017'],[{type:'spd_up',value:2}]),
  eq_w151:W('eq_w151','火晶',8,2500,160,['法师','炼金术师'],'m',30,'晶石内部火焰不灭、魔力如火的咒术晶石',['tag041','tag007','tag057','tag017'],[{type:'burn_on_hit',value:10},{type:'magic_atk_up_pct',value:10}]),
  eq_w152:W('eq_w152','冰晶',8,2600,160,['法师','阵法师'],'m',30,'晶石内部冰晶不化、魔力极寒的咒术晶石',['tag041','tag007','tag058','tag017'],[{type:'spd_up',value:3},{type:'magic_atk_up_pct',value:10}]),
  eq_w153:W('eq_w153','星核',9,6000,180,['法师','阵法师','疗愈师'],'m',42,'晶石内部星光流转、据说能引动星辰之力的咒术晶石',['tag041','tag007','tag069','tag018'],[{type:'magic_atk_up_pct',value:12},{type:'maxmp_up',value:25}]),
  eq_w154:W('eq_w154','龙晶晶石',9,6500,190,['法师','阵法师'],'m',42,'龙晶打磨而成、蕴含龙之力的咒术晶石',['tag041','tag007','tag055','tag018'],[{type:'magic_atk_up_pct',value:14}]),
  eq_w155:W('eq_w155','巨兽晶核',10,170000,220,['法师','阵法师'],'m',58,'远古巨兽体内的晶核，蕴含庞大魔力',['tag041','tag007','tag042','tag018'],[{type:'magic_atk_up_pct',value:16},{type:'maxmp_up',value:35}]),
  eq_w156:W('eq_w156','龙晶核',15,700000,270,['法师','阵法师'],'m',85,'龙体内的晶核，蕴含纯粹的龙力',['tag041','tag007','tag042','tag018'],[{type:'magic_atk_up_pct',value:20},{type:'maxmp_up',value:45}]),
  eq_w157:W('eq_w157','射手座·星辰',25,6500000,450,['法师','阵法师','炼金术师'],'m',160,'射手星辉凝成的星辰之晶，魔力如箭',['tag041','tag007','tag070','tag018'],[{type:'magic_atk_up_pct',value:28},{type:'maxmp_up',value:80},{type:'first_strike',value:32}]),
  eq_w158:W('eq_w158','阵神的祝福',40,120000000,900,['阵法师','法师','疗愈师'],'m',350,'阵神赐福的圣晶，能布下天地大阵',['tag041','tag007','tag019','tag020'],[{type:'magic_atk_up_pct',value:38},{type:'maxmp_up',value:150},{type:'first_strike',value:40}])
});

/* ==================== 药瓶（w159-w180） ==================== */
Object.assign(EQUIPS, {
  eq_w159:W('eq_w159','生锈的药剂瓶',1,15,30,['炼金术师','法师'],'m',3,'瓶身锈迹斑斑、装着不明液体的投掷药瓶',['tag039','tag007','tag021','tag016']),
  eq_w160:W('eq_w160','残破的药瓶',1,12,25,['炼金术师','疗愈师'],'m',3,'瓶口缺了一角、药剂随时可能洒出的投掷药瓶',['tag039','tag007','tag043','tag016']),
  eq_w161:W('eq_w161','木瓶',2,35,40,['炼金术师'],'m',4,'木质药瓶，装着简易的酸液',['tag039','tag007','tag028','tag015']),
  eq_w162:W('eq_w162','木试管',2,30,35,['炼金术师','疗愈师'],'m',4,'木质试管，教学实验用的投掷药瓶',['tag039','tag007','tag028','tag015']),
  eq_w163:W('eq_w163','铁瓶',3,90,50,['炼金术师','法师'],'m',6,'铁质瓶身的投掷药瓶，比木瓶更结实',['tag039','tag007','tag021','tag015']),
  eq_w164:W('eq_w164','铁烧瓶',3,100,45,['炼金术师'],'m',6,'铁质烧瓶，装着腐蚀性液体',['tag039','tag007','tag021','tag015']),
  eq_w165:W('eq_w165','铜瓶',4,150,60,['炼金术师','法师'],'m',8,'铜质瓶身、比铁质更易传热的投掷药瓶',['tag039','tag007','tag023','tag015']),
  eq_w166:W('eq_w166','炼金瓶',4,200,65,['炼金术师'],'m',8,'特制炼金瓶，能封存强效药剂',['tag039','tag007','tag043','tag017']),
  eq_w167:W('eq_w167','精钢瓶',5,320,70,['炼金术师','法师'],'m',12,'精钢瓶身、能承受强腐蚀药剂的投掷药瓶',['tag039','tag007','tag022','tag017']),
  eq_w168:W('eq_w168','精钢烧瓶',5,380,65,['炼金术师'],'m',12,'精钢烧瓶，装着强效酸液',['tag039','tag007','tag022','tag017'],[]),
  eq_w169:W('eq_w169','秘银瓶',6,650,80,['炼金术师','法师'],'m',16,'秘银瓶身、药剂不易挥发的投掷药瓶',['tag039','tag007','tag025','tag017'],[{type:'magic_atk_up_pct',value:8}]),
  eq_w170:W('eq_w170','秘银烧瓶',6,720,75,['炼金术师'],'m',16,'秘银烧瓶，能封存更危险的药剂',['tag039','tag007','tag025','tag017'],[]),
  eq_w171:W('eq_w171','玄铁瓶',7,1300,90,['炼金术师','法师'],'m',22,'玄铁瓶身、能承受绝大多数腐蚀的投掷药瓶',['tag039','tag007','tag024','tag017'],[{type:'magic_atk_up_pct',value:10}]),
  eq_w172:W('eq_w172','寒铁瓶',7,1400,85,['炼金术师'],'m',22,'寒铁瓶身、能保持药剂低温的投掷药瓶',['tag039','tag007','tag026','tag017'],[{type:'spd_up',value:2}]),
  eq_w173:W('eq_w173','烈焰瓶',8,2400,100,['炼金术师','法师'],'m',30,'瓶中装着不灭火焰的投掷药瓶，扔出去会炸开',['tag039','tag007','tag057','tag017'],[{type:'burn_on_hit',value:12}]),
  eq_w174:W('eq_w174','冰霜瓶',8,2500,100,['炼金术师','阵法师'],'m',30,'瓶中装着极寒液体的投掷药瓶，扔出去会瞬间冰封',['tag039','tag007','tag058','tag017'],[{type:'spd_up',value:3}]),
  eq_w175:W('eq_w175','毒瓶',9,6000,110,['炼金术师'],'m',42,'瓶中液体呈紫黑色、一滴就能毒死一头牛的投掷药瓶',['tag039','tag007','tag061','tag018'],[{type:'poison_on_hit',value:18}]),
  eq_w176:W('eq_w176','酸瓶',9,6500,110,['炼金术师','法师'],'m',42,'瓶中强酸能溶穿秘银的投掷药瓶',['tag039','tag007','tag062','tag018'],[]),
  eq_w177:W('eq_w177','巨兽毒囊',10,170000,130,['炼金术师'],'m',58,'远古巨兽的毒囊制成、毒液不绝的投掷药瓶',['tag039','tag007','tag061','tag018'],[{type:'poison_on_hit',value:22}]),
  eq_w178:W('eq_w178','龙毒',15,700000,160,['炼金术师'],'m',85,'龙毒提炼而成、见血封喉的投掷药瓶',['tag039','tag007','tag061','tag018'],[{type:'poison_on_hit',value:28},{type:'execute_below',value:18}]),
  eq_w179:W('eq_w179','水瓶座·万溶',25,6500000,280,['炼金术师','法师'],'m',160,'水瓶星辉凝成的万溶之瓶，能溶解万物',['tag039','tag007','tag070','tag018'],[{type:'poison_on_hit',value:35},{type:'execute_below',value:25}]),
  eq_w180:W('eq_w180','炼金之神的祝福',40,120000000,600,['炼金术师'],'m',350,'炼金之神赐福的圣瓶，瓶中液体能腐蚀一切存在',['tag039','tag007','tag019','tag020'],[{type:'poison_on_hit',value:45},{type:'execute_below',value:32},{type:'true_dmg_bonus',value:35}])
});

/* ==================== 书本（w181-w200） ==================== */
Object.assign(EQUIPS, {
  eq_w181:W('eq_w181','生锈的旧书',1,20,40,['法师','疗愈师','阵法师','商人'],'m',4,'封面锈迹斑斑、夹着几张散页的旧魔法书',['tag035','tag007','tag036','tag016']),
  eq_w182:W('eq_w182','残破的书',1,15,35,['法师','商人'],'m',4,'书页大半缺失、只剩只言片语的旧法典',['tag035','tag007','tag036','tag016']),
  eq_w183:W('eq_w183','木封书',2,40,50,['法师','阵法师','疗愈师'],'m',4,'木质封面的魔法书，里面是手抄的咒文',['tag035','tag007','tag028','tag015']),
  eq_w184:W('eq_w184','木封法典',2,45,45,['疗愈师','商人'],'m',4,'木质封面上刻着简易纹路的法典',['tag035','tag007','tag028','tag015']),
  eq_w185:W('eq_w185','铁封书',3,100,60,['法师','阵法师'],'m',6,'铁质封面的魔法书，沉重但结实',['tag035','tag007','tag021','tag015']),
  eq_w186:W('eq_w186','铁封法典',3,110,55,['疗愈师','商人'],'m',6,'铁皮包边、里面抄录着圣典的法典',['tag035','tag007','tag021','tag015']),
  eq_w187:W('eq_w187','铜封书',4,180,70,['法师','阵法师','炼金术师'],'m',8,'铜质封面、书页用蜡封保存的魔法书',['tag035','tag007','tag023','tag015']),
  eq_w188:W('eq_w188','魔法书',4,220,75,['法师','炼金术师'],'m',8,'装订考究、内含多道咒文的精制魔法书',['tag035','tag007','tag036','tag017'],[{type:'magic_atk_up_pct',value:5}]),
  eq_w189:W('eq_w189','精钢法典',5,350,85,['疗愈师','阵法师'],'m',12,'精钢封面、能挡刀剑的法典',['tag035','tag007','tag022','tag017'],[{type:'def_up_pct',value:6}]),
  eq_w190:W('eq_w190','精钢魔书',5,400,80,['法师'],'m',12,'精钢书脊、内含数十道咒文的魔法书',['tag035','tag007','tag022','tag017'],[{type:'magic_atk_up_pct',value:8}]),
  eq_w191:W('eq_w191','秘银魔书',6,700,95,['法师','阵法师'],'m',16,'秘银封面、魔力流转顺畅的魔法书',['tag035','tag007','tag025','tag017'],[{type:'magic_atk_up_pct',value:10},{type:'maxmp_up',value:15}]),
  eq_w192:W('eq_w192','秘银法典',6,760,100,['疗愈师','阵法师'],'m',16,'秘银封面、能抵御强力法术的法典',['tag035','tag007','tag025','tag017'],[{type:'def_up_pct',value:8}]),
  eq_w193:W('eq_w193','玄铁魔书',7,1400,110,['法师','阵法师'],'m',22,'玄铁封面、厚重而神秘的魔法书',['tag035','tag007','tag024','tag017'],[{type:'magic_atk_up_pct',value:12},{type:'maxmp_up',value:20}]),
  eq_w194:W('eq_w194','寒铁魔书',7,1500,105,['法师','炼金术师'],'m',22,'寒铁封面、书页带着凉意的魔法书',['tag035','tag007','tag026','tag017'],[{type:'spd_up',value:2},{type:'magic_atk_up_pct',value:10}]),
  eq_w195:W('eq_w195','火典',8,2500,120,['法师','炼金术师'],'m',30,'书页燃烧却不焚毁、火焰不灭的法典',['tag035','tag007','tag057','tag017'],[{type:'burn_on_hit',value:12},{type:'magic_atk_up_pct',value:12}]),
  eq_w196:W('eq_w196','冰典',8,2600,120,['法师','阵法师'],'m',30,'书页凝结着永不融化冰霜的法典',['tag035','tag007','tag058','tag017'],[{type:'spd_up',value:3},{type:'magic_atk_up_pct',value:12}]),
  eq_w197:W('eq_w197','星辰书',9,6000,135,['法师','阵法师','疗愈师'],'m',42,'书页上星图流转、据说能借星辰之力的魔法书',['tag035','tag007','tag069','tag018'],[{type:'magic_atk_up_pct',value:15},{type:'maxmp_up',value:25}]),
  eq_w198:W('eq_w198','龙语书',9,6500,140,['法师','阵法师'],'m',42,'书页上刻着龙语符文、魔力澎湃的魔法书',['tag035','tag007','tag056','tag018'],[{type:'magic_atk_up_pct',value:18}]),
  eq_w199:W('eq_w199','巨龙书',10,170000,170,['法师','疗愈师'],'m',58,'用巨龙皮装订的魔法书，蕴含龙之力',['tag035','tag007','tag050','tag018'],[{type:'magic_atk_up_pct',value:20},{type:'maxmp_up',value:35},{type:'lifesteal_on_kill',value:5}]),
  eq_w200:W('eq_w200','书神的祝福',40,120000000,700,['法师','阵法师','疗愈师','商人'],'m',350,'书神赐福的圣典，记载世间一切智慧与魔法',['tag035','tag007','tag019','tag020'],[{type:'magic_atk_up_pct',value:38},{type:'maxmp_up',value:150},{type:'lifesteal_on_kill',value:18},{type:'first_strike',value:40}])
});

/* ============================================================
   30-39 级追加（w201-w236）
   ------------------------------------------------------------
   命名规则：每类用 4 个不同的两字名，避免重名
     剑：苍穹 · 群星 · 深渊 · 幽冥
     棍：天穹 · 星陨 · 幽渊 · 冥河
     匕首：轻云 · 星芒 · 暗渊 · 幽刃
     杖：天启 · 星辉 · 沉渊 · 冥界
     锤：天罚 · 星裂 · 崩渊 · 冥冥
     手套：天武 · 星拳 · 渊拳 · 冥拳
     晶石：天晶 · 星核 · 渊晶 · 冥晶
     药瓶：天露 · 星液 · 渊毒 · 冥泉
     书本：天书 · 星典 · 渊典 · 冥书
   ============================================================ */

/* ---- 剑 w201-w204 ---- */
Object.assign(EQUIPS, {
  eq_w201:W('eq_w201','苍穹',30,20000000,680,['战士','巡警'],'p',220,'剑身映着天穹之色的长剑，挥动时仿佛牵动风云',['tag008','tag006','tag068','tag018'],[{type:'low_hp_power',value:32},{type:'first_strike',value:30}]),
  eq_w202:W('eq_w202','群星',33,40000000,760,['战士','巡警'],'p',260,'剑身星点密布、如夜空倒悬的长剑',['tag008','tag006','tag069','tag018'],[{type:'low_hp_power',value:36},{type:'first_strike',value:33},{type:'execute_below',value:30}]),
  eq_w203:W('eq_w203','深渊长剑',36,65000000,840,['战士','巡警','杀手'],'p',300,'剑身漆黑如深渊、吞吸一切光明的长剑',['tag008','tag006','tag067','tag018'],[{type:'low_hp_power',value:40},{type:'first_strike',value:36},{type:'execute_below',value:33},{type:'hp_drain_pct',value:18}]),
  eq_w204:W('eq_w204','幽冥',39,95000000,920,['战士','巡警'],'p',340,'剑身泛着幽绿磷光、据说能斩断生魂的长剑',['tag008','tag006','tag066','tag018'],[{type:'low_hp_power',value:44},{type:'first_strike',value:39},{type:'execute_below',value:37},{type:'hp_drain_pct',value:19},{type:'silence_on_hit',value:28}])
});

/* ---- 棍 w205-w208 ---- */
Object.assign(EQUIPS, {
  eq_w205:W('eq_w205','天穹',30,20000000,700,['战士','巡警','铁匠'],'p',220,'棍身如天穹般沉重、挥出时带起风雷的长棍',['tag011','tag006','tag068','tag018'],[{type:'def_up_pct',value:22},{type:'first_strike',value:28}]),
  eq_w206:W('eq_w206','星陨',33,40000000,780,['战士','巡警','铁匠'],'p',260,'棍身刻着流星轨迹、一端沉重如星陨的长棍',['tag011','tag006','tag069','tag018'],[{type:'def_up_pct',value:25},{type:'first_strike',value:30},{type:'counter_start',value:2}]),
  eq_w207:W('eq_w207','幽渊',36,65000000,860,['战士','铁匠'],'p',300,'棍身漆黑、接触空气时发出低沉嗡鸣的长棍',['tag011','tag006','tag067','tag018'],[{type:'def_up_pct',value:28},{type:'first_strike',value:33},{type:'counter_start',value:2},{type:'low_hp_power',value:35}]),
  eq_w208:W('eq_w208','冥河',39,95000000,940,['战士','巡警','铁匠'],'p',340,'据说用冥河石打磨而成、沉重得仿佛能压垮生死的长棍',['tag011','tag006','tag066','tag018'],[{type:'def_up_pct',value:32},{type:'first_strike',value:36},{type:'counter_start',value:3},{type:'low_hp_power',value:40},{type:'hp_drain_pct',value:15}])
});

/* ---- 匕首 w209-w212 ---- */
Object.assign(EQUIPS, {
  eq_w209:W('eq_w209','轻云',30,20000000,660,['杀手'],'p',220,'刃身轻薄如云、出手极快的匕首',['tag009','tag006','tag068','tag018'],[{type:'first_strike',value:30},{type:'silence_on_hit',value:25},{type:'execute_below',value:22}]),
  eq_w210:W('eq_w210','星芒',33,40000000,740,['杀手'],'p',260,'刃身星芒流转、每一次挥击都留下星痕的匕首',['tag009','tag006','tag069','tag018'],[{type:'first_strike',value:33},{type:'silence_on_hit',value:30},{type:'execute_below',value:25},{type:'hp_drain_pct',value:15}]),
  eq_w211:W('eq_w211','暗渊',36,65000000,820,['杀手'],'p',300,'刃身漆黑如渊、刺入后仿佛吞噬灵魂的匕首',['tag009','tag006','tag067','tag018'],[{type:'first_strike',value:36},{type:'silence_on_hit',value:35},{type:'execute_below',value:28},{type:'hp_drain_pct',value:18}]),
  eq_w212:W('eq_w212','幽刃',39,95000000,900,['杀手'],'p',340,'刃身泛着幽绿、据说被刺中的人连魂魄都会冻结的匕首',['tag009','tag006','tag066','tag018'],[{type:'first_strike',value:39},{type:'silence_on_hit',value:40},{type:'execute_below',value:32},{type:'hp_drain_pct',value:20}])
});

/* ---- 杖 w213-w216 ---- */
Object.assign(EQUIPS, {
  eq_w213:W('eq_w213','天启',30,20000000,660,['法师','阵法师','疗愈师'],'m',220,'杖身映着天穹之色、魔力流转如云的法杖',['tag010','tag007','tag068','tag018'],[{type:'magic_atk_up_pct',value:24},{type:'maxmp_up',value:60}]),
  eq_w214:W('eq_w214','星辉',33,40000000,740,['法师','阵法师','疗愈师'],'m',260,'杖身星图流转、据说能借星辰之力的法杖',['tag010','tag007','tag069','tag018'],[{type:'magic_atk_up_pct',value:27},{type:'maxmp_up',value:70}]),
  eq_w215:W('eq_w215','沉渊',36,65000000,820,['法师','阵法师'],'m',300,'杖身深黑、散发的魔力令人生畏的法杖',['tag010','tag007','tag067','tag018'],[{type:'magic_atk_up_pct',value:30},{type:'maxmp_up',value:85}]),
  eq_w216:W('eq_w216','冥界法杖',39,95000000,900,['法师','疗愈师','阵法师'],'m',340,'杖身刻着冥界符文、能引动生死之力的法杖',['tag010','tag007','tag066','tag018'],[{type:'magic_atk_up_pct',value:33},{type:'maxmp_up',value:100},{type:'lifesteal_on_kill',value:12}])
});

/* ---- 锤 w217-w220 ---- */
Object.assign(EQUIPS, {
  eq_w217:W('eq_w217','天罚',30,20000000,720,['战士','铁匠'],'p',220,'锤头如天穹般沉重、一锤可碎岩的战锤',['tag012','tag006','tag068','tag018'],[{type:'execute_below',value:24},{type:'true_dmg_bonus',value:20}]),
  eq_w218:W('eq_w218','星裂',33,40000000,800,['战士','铁匠'],'p',260,'锤头嵌着星陨石、砸下时星光四溅的战锤',['tag012','tag006','tag069','tag018'],[{type:'execute_below',value:28},{type:'true_dmg_bonus',value:24},{type:'low_hp_power',value:32}]),
  eq_w219:W('eq_w219','崩渊',36,65000000,880,['战士','铁匠'],'p',300,'锤身漆黑如渊、锤头刻着吞噬纹路的战锤',['tag012','tag006','tag067','tag018'],[{type:'execute_below',value:32},{type:'true_dmg_bonus',value:28},{type:'low_hp_power',value:38},{type:'hp_drain_pct',value:15}]),
  eq_w220:W('eq_w220','冥冥',39,95000000,960,['战士','铁匠'],'p',340,'锤身泛着幽幽冥光、砸下的地方仿佛能听见渡魂钟声的战锤',['tag012','tag006','tag066','tag018'],[{type:'execute_below',value:35},{type:'true_dmg_bonus',value:32},{type:'low_hp_power',value:42},{type:'hp_drain_pct',value:18}])
});

/* ---- 手套 w221-w224 ---- */
Object.assign(EQUIPS, {
  eq_w221:W('eq_w221','天武',30,20000000,680,['战士','巡警'],'p',220,'拳套轻若无物、出拳如风的拳套',['tag033','tag006','tag068','tag018'],[{type:'first_strike',value:30},{type:'counter_start',value:2}]),
  eq_w222:W('eq_w222','星拳',33,40000000,760,['战士','杀手'],'p',260,'拳套上星芒流转、每拳都像流星坠地的拳套',['tag033','tag006','tag069','tag018'],[{type:'first_strike',value:33},{type:'counter_start',value:3},{type:'low_hp_power',value:32}]),
  eq_w223:W('eq_w223','渊拳',36,65000000,840,['战士','杀手'],'p',300,'拳套漆黑、接触时仿佛被深渊凝视的拳套',['tag033','tag006','tag067','tag018'],[{type:'first_strike',value:36},{type:'counter_start',value:3},{type:'low_hp_power',value:38},{type:'execute_below',value:28}]),
  eq_w224:W('eq_w224','冥拳',39,95000000,920,['战士'],'p',340,'拳套泛着幽光、出拳时仿佛能听见亡魂低语的拳套',['tag033','tag006','tag066','tag018'],[{type:'first_strike',value:39},{type:'counter_start',value:4},{type:'low_hp_power',value:42},{type:'execute_below',value:32}])
});

/* ---- 晶石 w225-w228 ---- */
Object.assign(EQUIPS, {
  eq_w225:W('eq_w225','天晶',30,20000000,660,['法师','阵法师','炼金术师'],'m',220,'晶石内部映着天穹之色、魔力流转如云的咒术晶石',['tag041','tag007','tag068','tag018'],[{type:'magic_atk_up_pct',value:24},{type:'maxmp_up',value:60},{type:'first_strike',value:28}]),
  eq_w226:W('eq_w226','星核',33,40000000,740,['法师','阵法师'],'m',260,'晶石内部星图流转、魔力如星辰坠地的咒术晶石',['tag041','tag007','tag069','tag018'],[{type:'magic_atk_up_pct',value:27},{type:'maxmp_up',value:70},{type:'first_strike',value:30}]),
  eq_w227:W('eq_w227','渊晶',36,65000000,820,['法师','阵法师'],'m',300,'晶石漆黑如渊、蕴含深不可测魔力的咒术晶石',['tag041','tag007','tag067','tag018'],[{type:'magic_atk_up_pct',value:30},{type:'maxmp_up',value:85},{type:'first_strike',value:33}]),
  eq_w228:W('eq_w228','冥晶',39,95000000,900,['法师','阵法师','炼金术师'],'m',340,'晶石内部冥光幽转、据说能沟通生死两界的咒术晶石',['tag041','tag007','tag066','tag018'],[{type:'magic_atk_up_pct',value:33},{type:'maxmp_up',value:100},{type:'first_strike',value:36}])
});

/* ---- 药瓶 w229-w232 ---- */
Object.assign(EQUIPS, {
  eq_w229:W('eq_w229','天露',30,20000000,640,['炼金术师'],'m',220,'瓶中液体映着天穹之色、扔出去会化作一片云气的投掷药瓶',['tag039','tag007','tag068','tag018'],[{type:'poison_on_hit',value:25}]),
  eq_w230:W('eq_w230','星液',33,40000000,720,['炼金术师'],'m',260,'瓶中星光流动、爆炸时星屑四散的投掷药瓶',['tag039','tag007','tag069','tag018'],[{type:'poison_on_hit',value:30},{type:'execute_below',value:22}]),
  eq_w231:W('eq_w231','渊毒',36,65000000,800,['炼金术师'],'m',300,'瓶中液体漆黑、接触空气后开始沸腾的投掷药瓶',['tag039','tag007','tag067','tag018'],[{type:'poison_on_hit',value:35},{type:'execute_below',value:26},{type:'burn_on_hit',value:20}]),
  eq_w232:W('eq_w232','冥泉',39,95000000,880,['炼金术师','法师'],'m',340,'瓶中液体泛着冥河之色、沾者如坠黄泉的投掷药瓶',['tag039','tag007','tag066','tag018'],[{type:'poison_on_hit',value:40},{type:'execute_below',value:30},{type:'burn_on_hit',value:24}])
});

/* ---- 书本 w233-w236 ---- */
Object.assign(EQUIPS, {
  eq_w233:W('eq_w233','天书',30,20000000,660,['法师','阵法师','疗愈师'],'m',220,'书页上绘着天穹纹路、翻动时似有风声的魔法书',['tag035','tag007','tag068','tag018'],[{type:'magic_atk_up_pct',value:24},{type:'maxmp_up',value:65}]),
  eq_w234:W('eq_w234','星典',33,40000000,740,['法师','阵法师','疗愈师'],'m',260,'书页上星图流转、据说记载着星辰轨迹的法典',['tag035','tag007','tag069','tag018'],[{type:'magic_atk_up_pct',value:27},{type:'maxmp_up',value:75}]),
  eq_w235:W('eq_w235','渊典',36,65000000,820,['法师','阵法师'],'m',300,'书页漆黑、翻动时仿佛有深渊在低语的法典',['tag035','tag007','tag067','tag018'],[{type:'magic_atk_up_pct',value:30},{type:'maxmp_up',value:90},{type:'lifesteal_on_kill',value:10}]),
  eq_w236:W('eq_w236','冥书',39,95000000,900,['法师','疗愈师','阵法师'],'m',340,'书页泛着冥光、据说记载着生死界限秘密的魔法书',['tag035','tag007','tag066','tag018'],[{type:'magic_atk_up_pct',value:33},{type:'maxmp_up',value:105},{type:'lifesteal_on_kill',value:12},{type:'first_strike',value:36}])
});

/* ============================================================
   饰品（s001-s144）
   ------------------------------------------------------------
   Lv1-9   材质 + 类型（不冲突武器）
   Lv10-24 魔兽材料（戒指/项链/护符/耳环/手镯/徽章/腰带/面具/头饰/算珠）
   Lv25    星座（只用武器没用过的 6 个）
   Lv30    天象（星辉/月华/日冕/星河/云影/风铃）
   Lv35    幽界（幽影/冥光/暗河/黄沙/阴风/鬼火）
   Lv40    之环/之链/之泪/之眼/之光/之心
   ============================================================ */

/* ==================== 饰品 Lv1（s001-s010） ==================== */
Object.assign(EQUIPS, {
  eq_s001:S2('eq_s001','生锈的铜戒指',1,20,[{type:'phys_atk_up',value:1}],'铜片打成的简易戒指，锈迹斑斑'),
  eq_s002:S2('eq_s002','残破的木项链',1,15,[{type:'magic_atk_up',value:1}],'几颗木珠串成的项链，绳子已经磨断了几处'),
  eq_s003:S2('eq_s003','铁护符',1,25,[{type:'phys_atk_up',value:2}],'铁片打造的护身符'),
  eq_s004:S2('eq_s004','骨耳环',1,18,[{type:'magic_atk_up',value:2}],'兽骨磨成的耳环'),
  eq_s005:S2('eq_s005','皮手镯',1,12,[{type:'phys_atk_up',value:1}],'兽皮缝制的手镯'),
  eq_s006:S2('eq_s006','石徽章',1,22,[{type:'phys_atk_up',value:1},{type:'magic_atk_up',value:1}],'石片刻成的徽章，刻着模糊的纹路'),
  eq_s007:S2('eq_s007','草编腰带',1,10,[{type:'phys_atk_up',value:1}],'草绳编成的腰带，简陋但实用'),
  eq_s008:S2('eq_s008','铜面具',1,30,[{type:'magic_atk_up',value:2}],'铜片打成的半脸面具'),
  eq_s009:S2('eq_s009','布头饰',1,14,[{type:'magic_atk_up',value:1}],'布条缠成的头饰'),
  eq_s010:S2('eq_s010','铁别针',1,16,[{type:'phys_atk_up',value:2}],'铁制别针，能别在衣服上')
});

/* ==================== 饰品 Lv2（s011-s020） ==================== */
Object.assign(EQUIPS, {
  eq_s011:S2('eq_s011','银戒指',2,60,[{type:'phys_atk_up',value:3}],'银片打成的戒指，刻着简单纹路'),
  eq_s012:S2('eq_s012','水晶项链',2,80,[{type:'magic_atk_up',value:3}],'一颗小水晶吊在银链上'),
  eq_s013:S2('eq_s013','银护符',2,70,[{type:'phys_atk_up',value:4}],'银打造的护符，据说能挡灾'),
  eq_s014:S2('eq_s014','玉耳环',2,65,[{type:'magic_atk_up',value:4}],'玉磨成的耳环，触手生温'),
  eq_s015:S2('eq_s015','铜手镯',2,50,[{type:'phys_atk_up',value:3}],'铜制手镯，刻着花纹'),
  eq_s016:S2('eq_s016','银徽章',2,75,[{type:'phys_atk_up',value:3},{type:'magic_atk_up',value:2}],'银制徽章，刻着家族纹章'),
  eq_s017:S2('eq_s017','皮腰带',2,55,[{type:'phys_atk_up',value:3}],'厚皮制成的腰带，结实耐用'),
  eq_s018:S2('eq_s018','银面具',2,85,[{type:'magic_atk_up',value:4}],'银制面具，遮住半张脸'),
  eq_s019:S2('eq_s019','银头饰',2,70,[{type:'magic_atk_up',value:3}],'银丝编成的头饰，精巧细致'),
  eq_s020:S2('eq_s020','铜别针',2,45,[{type:'phys_atk_up',value:3}],'铜制别针，商人常用来别账本')
});

/* ==================== 饰品 Lv3（s021-s030） ==================== */
Object.assign(EQUIPS, {
  eq_s021:S2('eq_s021','金戒指',3,180,[{type:'phys_atk_up',value:6}],'金片打成的戒指，刻着精细纹路'),
  eq_s022:S2('eq_s022','秘银项链',3,220,[{type:'magic_atk_up',value:6}],'秘银链上吊着一颗水晶'),
  eq_s023:S2('eq_s023','钢护符',3,200,[{type:'phys_atk_up',value:7}],'精钢打造的护符，刻着符文'),
  eq_s024:S2('eq_s024','玛瑙耳环',3,190,[{type:'magic_atk_up',value:7}],'玛瑙磨成的耳环，红得发亮'),
  eq_s025:S2('eq_s025','银手镯',3,170,[{type:'phys_atk_up',value:6}],'银制手镯，内侧刻着铭文'),
  eq_s026:S2('eq_s026','金徽章',3,210,[{type:'phys_atk_up',value:6},{type:'magic_atk_up',value:5}],'金制徽章，刻着雄鹰图案'),
  eq_s027:S2('eq_s027','铁扣腰带',3,160,[{type:'phys_atk_up',value:6}],'铁扣皮腰带，扣上刻着兽头'),
  eq_s028:S2('eq_s028','黑铁面具',3,230,[{type:'magic_atk_up',value:7}],'黑铁打造的面具，不反光'),
  eq_s029:S2('eq_s029','金头饰',3,200,[{type:'magic_atk_up',value:6}],'金丝编成的头饰，镶着小宝石'),
  eq_s030:S2('eq_s030','银算珠',3,190,[{type:'phys_atk_up',value:5},{type:'magic_atk_up',value:4}],'银制算珠，串成手链')
});

/* ==================== 饰品 Lv4（s031-s040） ==================== */
Object.assign(EQUIPS, {
  eq_s031:S2('eq_s031','翡翠戒指',4,500,[{type:'phys_atk_up',value:10},{type:'hp_drain_pct',value:3}],'翡翠戒面，绿得滴翠'),
  eq_s032:S2('eq_s032','星辉项链',4,600,[{type:'magic_atk_up',value:12},{type:'maxmp_up',value:15}],'项链上吊着一颗星辉石'),
  eq_s033:S2('eq_s033','玄铁护符',4,550,[{type:'phys_atk_up',value:11}],'玄铁打造的护符，刻着玄天纹'),
  eq_s034:S2('eq_s034','琥珀耳环',4,520,[{type:'magic_atk_up',value:10},{type:'mp_drain_pct',value:3}],'琥珀磨成的耳环，阳光下半透明'),
  eq_s035:S2('eq_s035','玉手镯',4,480,[{type:'phys_atk_up',value:9},{type:'maxhp_up',value:15}],'整块玉雕成的手镯，温润光滑'),
  eq_s036:S2('eq_s036','翡翠徽章',4,570,[{type:'phys_atk_up',value:10},{type:'magic_atk_up',value:8},{type:'true_dmg_bonus',value:5}],'翡翠雕成的徽章，刻着龙纹'),
  eq_s037:S2('eq_s037','铜扣腰带',4,500,[{type:'phys_atk_up',value:10},{type:'counter_start',value:1}],'铜扣皮带，扣上刻着虎头'),
  eq_s038:S2('eq_s038','暗影面具',4,620,[{type:'magic_atk_up',value:12},{type:'silence_on_hit',value:15}],'暗影之力加持的面具'),
  eq_s039:S2('eq_s039','星辉头饰',4,580,[{type:'magic_atk_up',value:11},{type:'maxmp_up',value:12}],'星辉石镶嵌的头饰'),
  eq_s040:S2('eq_s040','金算珠',4,540,[{type:'phys_atk_up',value:9},{type:'magic_atk_up',value:7},{type:'def_up_pct',value:5}],'金制算珠，串成手链')
});

/* ==================== 饰品 Lv5（s041-s050） ==================== */
Object.assign(EQUIPS, {
  eq_s041:S2('eq_s041','精钢戒指',5,1300,[{type:'phys_atk_up',value:15},{type:'hp_drain_pct',value:4}],'精钢打造的戒指，刻着秘法纹'),
  eq_s042:S2('eq_s042','星辰项链',5,1500,[{type:'magic_atk_up',value:17},{type:'maxmp_up',value:20}],'项链上吊着一颗星辰碎片'),
  eq_s043:S2('eq_s043','龙鳞护符',5,1400,[{type:'phys_atk_up',value:16}],'龙鳞打造的护符，蕴含龙之力'),
  eq_s044:S2('eq_s044','翡翠耳环',5,1350,[{type:'magic_atk_up',value:16},{type:'mp_drain_pct',value:5}],'翡翠磨成的耳环，绿光流转'),
  eq_s045:S2('eq_s045','白玉手镯',5,1200,[{type:'phys_atk_up',value:14},{type:'maxhp_up',value:20}],'白玉雕成的手镯，触手生温'),
  eq_s046:S2('eq_s046','紫檀徽章',5,1300,[{type:'phys_atk_up',value:15},{type:'magic_atk_up',value:12},{type:'true_dmg_bonus',value:8}],'紫檀木雕成的徽章，散发檀香'),
  eq_s047:S2('eq_s047','银扣腰带',5,1250,[{type:'phys_atk_up',value:14},{type:'counter_start',value:1}],'银扣皮带，扣上刻着狮头'),
  eq_s048:S2('eq_s048','影杀面具',5,1500,[{type:'magic_atk_up',value:18},{type:'silence_on_hit',value:20}],'影杀之力加持的面具'),
  eq_s049:S2('eq_s049','星辰头饰',5,1450,[{type:'magic_atk_up',value:17},{type:'maxmp_up',value:18}],'星辰碎片镶嵌的头饰'),
  eq_s050:S2('eq_s050','玉算珠',5,1350,[{type:'phys_atk_up',value:13},{type:'magic_atk_up',value:11},{type:'def_up_pct',value:6}],'玉制算珠，串成手链')
});

/* ==================== 饰品 Lv6（s051-s060） ==================== */
Object.assign(EQUIPS, {
  eq_s051:S2('eq_s051','寒铁戒指',6,3200,[{type:'phys_atk_up',value:20},{type:'hp_drain_pct',value:5}],'寒铁打造的戒指，终年冰冷'),
  eq_s052:S2('eq_s052','星月项链',6,3800,[{type:'magic_atk_up',value:24},{type:'maxmp_up',value:25},{type:'magic_atk_up_pct',value:8}],'项链上吊着星月石'),
  eq_s053:S2('eq_s053','陨铁护符',6,3500,[{type:'phys_atk_up',value:22},{type:'execute_below',value:10}],'陨铁打造的护符，沉重无比'),
  eq_s054:S2('eq_s054','龙鳞耳环',6,3400,[{type:'magic_atk_up',value:23},{type:'mp_drain_pct',value:6},{type:'maxmp_up',value:20}],'龙鳞磨成的耳环，坚硬无比'),
  eq_s055:S2('eq_s055','星辰手镯',6,3000,[{type:'phys_atk_up',value:19},{type:'maxhp_up',value:25},{type:'def_up_pct',value:8}],'星辰碎片镶嵌的手镯'),
  eq_s056:S2('eq_s056','龙血徽章',6,3300,[{type:'phys_atk_up',value:20},{type:'magic_atk_up',value:18},{type:'true_dmg_bonus',value:10},{type:'lifesteal_on_kill',value:3}],'龙血浸泡的徽章，蕴含龙之力'),
  eq_s057:S2('eq_s057','金扣腰带',6,3100,[{type:'phys_atk_up',value:20},{type:'counter_start',value:1}],'金扣皮带，扣上刻着龙首'),
  eq_s058:S2('eq_s058','幽冥面具',6,3600,[{type:'magic_atk_up',value:24},{type:'silence_on_hit',value:22}],'幽冥之力加持的面具'),
  eq_s059:S2('eq_s059','星月头饰',6,3500,[{type:'magic_atk_up',value:23},{type:'maxmp_up',value:22},{type:'first_strike',value:15}],'星月石镶嵌的头饰'),
  eq_s060:S2('eq_s060','龙鳞算珠',6,3400,[{type:'phys_atk_up',value:19},{type:'magic_atk_up',value:16},{type:'def_up_pct',value:8},{type:'hp_drain_pct',value:5}],'龙鳞磨成的算珠，串成手链')
});

/* ==================== 饰品 Lv7（s061-s070） ==================== */
Object.assign(EQUIPS, {
  eq_s061:S2('eq_s061','玄铁戒指',7,8500,[{type:'phys_atk_up',value:28},{type:'hp_drain_pct',value:7},{type:'low_hp_power',value:15}],'玄铁打造的戒指'),
  eq_s062:S2('eq_s062','元素项链',7,9500,[{type:'magic_atk_up',value:32},{type:'magic_atk_up_pct',value:10},{type:'maxmp_up',value:30}],'项链上吊着四色元素石'),
  eq_s063:S2('eq_s063','泰坦护符',7,9000,[{type:'phys_atk_up',value:30},{type:'execute_below',value:12},{type:'maxhp_up',value:30}],'泰坦族留下的护符，重逾千斤'),
  eq_s064:S2('eq_s064','天使耳环',7,9200,[{type:'magic_atk_up',value:31},{type:'mp_drain_pct',value:8},{type:'maxmp_up',value:25},{type:'lifesteal_on_kill',value:4}],'天使祝福的耳环，声音清脆'),
  eq_s065:S2('eq_s065','九宫手镯',7,8800,[{type:'phys_atk_up',value:27},{type:'maxhp_up',value:35},{type:'def_up_pct',value:12},{type:'counter_start',value:2}],'九宫之力加持的手镯'),
  eq_s066:S2('eq_s066','星辰徽章',7,9000,[{type:'phys_atk_up',value:28},{type:'magic_atk_up',value:24},{type:'true_dmg_bonus',value:12},{type:'hp_drain_pct',value:6},{type:'first_strike',value:18}],'星辰之力凝聚的徽章'),
  eq_s067:S2('eq_s067','龙筋腰带',7,8500,[{type:'phys_atk_up',value:28},{type:'counter_start',value:2},{type:'def_up_pct',value:12}],'龙筋编成的腰带，弹性极佳'),
  eq_s068:S2('eq_s068','幻影面具',7,9500,[{type:'magic_atk_up',value:33},{type:'silence_on_hit',value:28},{type:'magic_atk_up_pct',value:12}],'幻影之力加持的面具，能分身'),
  eq_s069:S2('eq_s069','元素头饰',7,9300,[{type:'magic_atk_up',value:32},{type:'maxmp_up',value:35},{type:'magic_atk_up_pct',value:12},{type:'first_strike',value:20}],'元素石镶嵌的头饰'),
  eq_s070:S2('eq_s070','命运算珠',7,9000,[{type:'phys_atk_up',value:27},{type:'magic_atk_up',value:23},{type:'def_up_pct',value:12},{type:'hp_drain_pct',value:7},{type:'true_dmg_bonus',value:12}],'命运之力加持的算珠')
});

/* ==================== 饰品 Lv8（s071-s080） ==================== */
Object.assign(EQUIPS, {
  eq_s071:S2('eq_s071','火纹戒指',8,22000,[{type:'phys_atk_up',value:36},{type:'hp_drain_pct',value:9},{type:'low_hp_power',value:20}],'火纹之力凝聚的戒指'),
  eq_s072:S2('eq_s072','冰纹项链',8,26000,[{type:'magic_atk_up',value:42},{type:'magic_atk_up_pct',value:15},{type:'maxmp_up',value:40}],'冰纹之力加持的项链'),
  eq_s073:S2('eq_s073','雷纹护符',8,24000,[{type:'phys_atk_up',value:40},{type:'execute_below',value:15},{type:'maxhp_up',value:40}],'雷纹之力凝聚的护符'),
  eq_s074:S2('eq_s074','暗纹耳环',8,25000,[{type:'magic_atk_up',value:41},{type:'mp_drain_pct',value:10},{type:'maxmp_up',value:35},{type:'lifesteal_on_kill',value:5}],'暗纹之力加持的耳环'),
  eq_s075:S2('eq_s075','星纹手镯',8,23000,[{type:'phys_atk_up',value:35},{type:'maxhp_up',value:45},{type:'def_up_pct',value:15},{type:'counter_start',value:2}],'星纹之力加持的手镯'),
  eq_s076:S2('eq_s076','光纹徽章',8,24500,[{type:'phys_atk_up',value:36},{type:'magic_atk_up',value:31},{type:'true_dmg_bonus',value:15},{type:'hp_drain_pct',value:8},{type:'first_strike',value:25}],'光纹祝福的徽章'),
  eq_s077:S2('eq_s077','龙纹腰带',8,23500,[{type:'phys_atk_up',value:36},{type:'counter_start',value:3},{type:'def_up_pct',value:18}],'龙纹之力加持的腰带'),
  eq_s078:S2('eq_s078','暗影面具',8,26000,[{type:'magic_atk_up',value:43},{type:'silence_on_hit',value:32},{type:'magic_atk_up_pct',value:15}],'暗影之力凝聚的面具'),
  eq_s079:S2('eq_s079','星辉头饰',8,25500,[{type:'magic_atk_up',value:42},{type:'maxmp_up',value:45},{type:'magic_atk_up_pct',value:15},{type:'first_strike',value:28}],'星辉之力加持的头饰'),
  eq_s080:S2('eq_s080','天机算珠',8,24000,[{type:'phys_atk_up',value:35},{type:'magic_atk_up',value:30},{type:'def_up_pct',value:15},{type:'hp_drain_pct',value:9},{type:'true_dmg_bonus',value:15}],'天机之力加持的算珠')
});

/* ==================== 饰品 Lv9（s081-s090） ==================== */
Object.assign(EQUIPS, {
  eq_s081:S2('eq_s081','龙鳞戒指',9,60000,[{type:'phys_atk_up',value:48},{type:'hp_drain_pct',value:12},{type:'low_hp_power',value:25},{type:'execute_below',value:15}],'龙鳞打造的戒指'),
  eq_s082:S2('eq_s082','星辉项链',9,70000,[{type:'magic_atk_up',value:55},{type:'magic_atk_up_pct',value:18},{type:'maxmp_up',value:55},{type:'first_strike',value:25}],'星辉之力加持的项链'),
  eq_s083:S2('eq_s083','龙血护符',9,65000,[{type:'phys_atk_up',value:52},{type:'execute_below',value:20},{type:'maxhp_up',value:60},{type:'low_hp_power',value:25}],'龙血浸泡的护符'),
  eq_s084:S2('eq_s084','圣光耳环',9,68000,[{type:'magic_atk_up',value:54},{type:'mp_drain_pct',value:12},{type:'maxmp_up',value:50},{type:'lifesteal_on_kill',value:8},{type:'magic_atk_up_pct',value:15}],'圣光祝福的耳环'),
  eq_s085:S2('eq_s085','九宫手镯',9,62000,[{type:'phys_atk_up',value:46},{type:'maxhp_up',value:60},{type:'def_up_pct',value:20},{type:'counter_start',value:3}],'九宫之力加持的手镯'),
  eq_s086:S2('eq_s086','龙纹徽章',9,65000,[{type:'phys_atk_up',value:48},{type:'magic_atk_up',value:41},{type:'true_dmg_bonus',value:20},{type:'hp_drain_pct',value:12},{type:'first_strike',value:30}],'龙纹之力凝聚的徽章'),
  eq_s087:S2('eq_s087','龙筋腰带',9,63000,[{type:'phys_atk_up',value:48},{type:'counter_start',value:4},{type:'def_up_pct',value:22},{type:'maxhp_up',value:60}],'龙筋编成的腰带'),
  eq_s088:S2('eq_s088','暗影面具',9,70000,[{type:'magic_atk_up',value:56},{type:'silence_on_hit',value:38},{type:'magic_atk_up_pct',value:18},{type:'maxmp_up',value:45}],'暗影之力凝聚的面具'),
  eq_s089:S2('eq_s089','星辉头饰',9,69000,[{type:'magic_atk_up',value:55},{type:'maxmp_up',value:55},{type:'magic_atk_up_pct',value:18},{type:'first_strike',value:32}],'星辉之力加持的头饰'),
  eq_s090:S2('eq_s090','因果算珠',9,66000,[{type:'phys_atk_up',value:46},{type:'magic_atk_up',value:40},{type:'def_up_pct',value:20},{type:'hp_drain_pct',value:12},{type:'true_dmg_bonus',value:20},{type:'execute_below',value:15}],'因果之力加持的算珠')
});

/* ==================== 饰品 Lv10（s091-s100） ==================== */
Object.assign(EQUIPS, {
  eq_s091:S2('eq_s091','芬里尔之牙',10,160000,[{type:'phys_atk_up',value:62},{type:'hp_drain_pct',value:15},{type:'low_hp_power',value:30},{type:'execute_below',value:22}],'巨狼芬里尔的獠牙磨成的戒指，锋锐无匹'),
  eq_s092:S2('eq_s092','凤凰之羽',10,180000,[{type:'magic_atk_up',value:70},{type:'magic_atk_up_pct',value:22},{type:'maxmp_up',value:70},{type:'first_strike',value:35}],'凤凰羽毛化成的项链，蕴含不灭之火'),
  eq_s093:S2('eq_s093','独角兽之角',10,170000,[{type:'phys_atk_up',value:66},{type:'execute_below',value:25},{type:'maxhp_up',value:80},{type:'low_hp_power',value:30}],'独角兽的角磨成的护符，蕴含治愈之力'),
  eq_s094:S2('eq_s094','龙鳞',10,175000,[{type:'magic_atk_up',value:68},{type:'mp_drain_pct',value:15},{type:'maxmp_up',value:65},{type:'lifesteal_on_kill',value:10},{type:'magic_atk_up_pct',value:20}],'龙鳞磨成的耳环，坚硬异常'),
  eq_s095:S2('eq_s095','龙筋',10,155000,[{type:'phys_atk_up',value:60},{type:'maxhp_up',value:80},{type:'def_up_pct',value:25},{type:'counter_start',value:4}],'龙筋编成的手镯，弹性极佳'),
  eq_s096:S2('eq_s096','猛犸之牙',10,165000,[{type:'phys_atk_up',value:62},{type:'magic_atk_up',value:54},{type:'true_dmg_bonus',value:25},{type:'hp_drain_pct',value:15},{type:'first_strike',value:40}],'猛犸象牙磨成的徽章'),
  eq_s097:S2('eq_s097','麒麟之血',10,160000,[{type:'phys_atk_up',value:62},{type:'counter_start',value:5},{type:'def_up_pct',value:28},{type:'maxhp_up',value:80}],'麒麟血凝成的腰带，蕴含祥瑞之力'),
  eq_s098:S2('eq_s098','凤凰之泪',10,180000,[{type:'magic_atk_up',value:72},{type:'silence_on_hit',value:45},{type:'magic_atk_up_pct',value:22},{type:'maxmp_up',value:60}],'凤凰眼泪凝成的面具，蕴含不灭之焰'),
  eq_s099:S2('eq_s099','星辰之核',10,170000,[{type:'magic_atk_up',value:69},{type:'maxmp_up',value:70},{type:'magic_atk_up_pct',value:22},{type:'first_strike',value:42}],'星辰核心磨成的头饰'),
  eq_s100:S2('eq_s100','巨龙之眼',10,165000,[{type:'phys_atk_up',value:62},{type:'magic_atk_up',value:54},{type:'def_up_pct',value:25},{type:'hp_drain_pct',value:15},{type:'true_dmg_bonus',value:25},{type:'execute_below',value:20}],'巨龙的瞳孔磨成的算珠，蕴含龙威')
});

/* ==================== 饰品 Lv15（s101-s110） ==================== */
Object.assign(EQUIPS, {
  eq_s101:S2('eq_s101','双头龙牙',15,700000,[{type:'phys_atk_up',value:80},{type:'hp_drain_pct',value:20},{type:'low_hp_power',value:35},{type:'execute_below',value:28}],'双头龙的两颗獠牙镶嵌成的戒指'),
  eq_s102:S2('eq_s102','巨龙鳞链',15,780000,[{type:'magic_atk_up',value:90},{type:'magic_atk_up_pct',value:26},{type:'maxmp_up',value:90},{type:'first_strike',value:40}],'远古巨龙鳞片串成的项链'),
  eq_s103:S2('eq_s103','雷鸟羽符',15,750000,[{type:'phys_atk_up',value:85},{type:'execute_below',value:30},{type:'maxhp_up',value:100},{type:'low_hp_power',value:35}],'雷鸟羽毛编织的护符，蕴含雷力'),
  eq_s104:S2('eq_s104','麒麟角环',15,760000,[{type:'magic_atk_up',value:88},{type:'mp_drain_pct',value:18},{type:'maxmp_up',value:85},{type:'lifesteal_on_kill',value:12},{type:'magic_atk_up_pct',value:24}],'麒麟角磨成的耳环，蕴含祥瑞之力'),
  eq_s105:S2('eq_s105','凤凰心镯',15,730000,[{type:'phys_atk_up',value:80},{type:'maxhp_up',value:100},{type:'def_up_pct',value:30},{type:'counter_start',value:5}],'凤凰心脏化形的手镯，蕴含不灭之焰'),
  eq_s106:S2('eq_s106','远古兽牙徽',15,740000,[{type:'phys_atk_up',value:82},{type:'magic_atk_up',value:72},{type:'true_dmg_bonus',value:30},{type:'hp_drain_pct',value:18},{type:'first_strike',value:44}],'远古巨兽的牙齿磨成的徽章'),
  eq_s107:S2('eq_s107','龙心腰带',15,720000,[{type:'phys_atk_up',value:82},{type:'counter_start',value:6},{type:'def_up_pct',value:32},{type:'maxhp_up',value:100}],'巨龙心脏化成的腰带，蕴含龙威'),
  eq_s108:S2('eq_s108','独角兽之血',15,780000,[{type:'magic_atk_up',value:92},{type:'silence_on_hit',value:50},{type:'magic_atk_up_pct',value:26},{type:'maxmp_up',value:80}],'独角兽血凝成的面具，蕴含治愈之力'),
  eq_s109:S2('eq_s109','远古星核',15,760000,[{type:'magic_atk_up',value:90},{type:'maxmp_up',value:90},{type:'magic_atk_up_pct',value:26},{type:'first_strike',value:46}],'远古星辰核心磨成的头饰'),
  eq_s110:S2('eq_s110','远古龙眼',15,740000,[{type:'phys_atk_up',value:82},{type:'magic_atk_up',value:72},{type:'def_up_pct',value:30},{type:'hp_drain_pct',value:18},{type:'true_dmg_bonus',value:30},{type:'execute_below',value:26}],'远古巨龙的眼瞳磨成的算珠')
});

/* ==================== 饰品 Lv20（s111-s120） ==================== */
Object.assign(EQUIPS, {
  eq_s111:S2('eq_s111','青龙鳞戒',20,2200000,[{type:'phys_atk_up',value:105},{type:'hp_drain_pct',value:25},{type:'low_hp_power',value:40},{type:'execute_below',value:32}],'青龙鳞片打造的戒指，蕴含东方神力'),
  eq_s112:S2('eq_s112','白虎牙链',20,2400000,[{type:'magic_atk_up',value:120},{type:'magic_atk_up_pct',value:32},{type:'maxmp_up',value:120},{type:'first_strike',value:48}],'白虎牙串成的项链，蕴含西方神力'),
  eq_s113:S2('eq_s113','玄武甲符',20,2300000,[{type:'phys_atk_up',value:110},{type:'execute_below',value:36},{type:'maxhp_up',value:130},{type:'low_hp_power',value:42}],'玄武甲片打造的护符，蕴含北方神力'),
  eq_s114:S2('eq_s114','朱雀羽环',20,2350000,[{type:'magic_atk_up',value:118},{type:'mp_drain_pct',value:22},{type:'maxmp_up',value:115},{type:'lifesteal_on_kill',value:16},{type:'magic_atk_up_pct',value:30}],'朱雀羽毛编织的耳环，蕴含南方神力'),
  eq_s115:S2('eq_s115','麒麟角镯',20,2300000,[{type:'phys_atk_up',value:105},{type:'maxhp_up',value:130},{type:'def_up_pct',value:36},{type:'counter_start',value:6}],'麒麟角磨成的手镯，蕴含祥瑞之力'),
  eq_s116:S2('eq_s116','凤凰心徽',20,2400000,[{type:'phys_atk_up',value:108},{type:'magic_atk_up',value:96},{type:'true_dmg_bonus',value:38},{type:'hp_drain_pct',value:22},{type:'first_strike',value:52}],'凤凰心脏化形的徽章'),
  eq_s117:S2('eq_s117','远古龙牙带',20,2300000,[{type:'phys_atk_up',value:108},{type:'counter_start',value:7},{type:'def_up_pct',value:38},{type:'maxhp_up',value:130}],'远古巨龙獠牙镶嵌的腰带'),
  eq_s118:S2('eq_s118','远古龙血面',20,2400000,[{type:'magic_atk_up',value:122},{type:'silence_on_hit',value:56},{type:'magic_atk_up_pct',value:32},{type:'maxmp_up',value:105}],'远古巨龙血凝成的面具，蕴含龙威'),
  eq_s119:S2('eq_s119','远古星核饰',20,2350000,[{type:'magic_atk_up',value:120},{type:'maxmp_up',value:120},{type:'magic_atk_up_pct',value:32},{type:'first_strike',value:55}],'远古星辰核心磨成的头饰'),
  eq_s120:S2('eq_s120','远古兽心珠',20,2300000,[{type:'phys_atk_up',value:108},{type:'magic_atk_up',value:96},{type:'def_up_pct',value:38},{type:'hp_drain_pct',value:22},{type:'true_dmg_bonus',value:38},{type:'execute_below',value:32}],'远古巨兽心脏化形的算珠')
});

/* ==================== 饰品 Lv25（s121-s126） ====================
   只用武器和防具都没用过的 6 个星座
   ============================================================ */
Object.assign(EQUIPS, {
  eq_s121:S2('eq_s121','处女座·星玉',25,6000000,[{type:'phys_atk_up',value:130},{type:'hp_drain_pct',value:30},{type:'low_hp_power',value:45},{type:'execute_below',value:40}],'处女星辉凝成的星玉戒指，魔力洁净如初雪'),
  eq_s122:S2('eq_s122','狮子座·狮心',25,6500000,[{type:'magic_atk_up',value:150},{type:'magic_atk_up_pct',value:40},{type:'maxmp_up',value:150},{type:'first_strike',value:58}],'狮子星辉凝成的狮心项链，蕴含王者的威压'),
  eq_s123:S2('eq_s123','射手座·箭星',25,6200000,[{type:'phys_atk_up',value:138},{type:'execute_below',value:44},{type:'maxhp_up',value:160},{type:'low_hp_power',value:48}],'射手星辉凝成的箭星护符，每击必中'),
  eq_s124:S2('eq_s124','水瓶座·流晶',25,6300000,[{type:'magic_atk_up',value:148},{type:'mp_drain_pct',value:28},{type:'maxmp_up',value:145},{type:'lifesteal_on_kill',value:20},{type:'magic_atk_up_pct',value:38}],'水瓶星辉凝成的流晶耳环，蕴含流动的魔力'),
  eq_s125:S2('eq_s125','双子座·双环',25,6100000,[{type:'phys_atk_up',value:132},{type:'maxhp_up',value:160},{type:'def_up_pct',value:45},{type:'counter_start',value:7}],'双子星辉凝成的双环手镯，成对佩戴时效果加倍'),
  eq_s126:S2('eq_s126','巨蟹座·护壳',25,6400000,[{type:'phys_atk_up',value:136},{type:'magic_atk_up',value:120},{type:'true_dmg_bonus',value:48},{type:'hp_drain_pct',value:28},{type:'first_strike',value:60}],'巨蟹星辉凝成的护壳徽章，坚不可摧')
});

/* ==================== 饰品 Lv30（s127-s132） ====================
   天象词汇：星辉 / 月华 / 日冕 / 星河 / 云影 / 风铃
   ============================================================ */
Object.assign(EQUIPS, {
  eq_s127:S2('eq_s127','星辉',30,20000000,[{type:'phys_atk_up',value:160},{type:'hp_drain_pct',value:38},{type:'low_hp_power',value:55},{type:'execute_below',value:48}],'星辉凝成的戒指，蕴含星辰的轨迹'),
  eq_s128:S2('eq_s128','月华',30,22000000,[{type:'magic_atk_up',value:185},{type:'magic_atk_up_pct',value:50},{type:'maxmp_up',value:185},{type:'first_strike',value:68}],'月华凝成的项链，蕴含月神的清辉'),
  eq_s129:S2('eq_s129','日冕',30,21000000,[{type:'phys_atk_up',value:170},{type:'execute_below',value:54},{type:'maxhp_up',value:195},{type:'low_hp_power',value:58}],'日冕凝成的护符，蕴含太阳的威能'),
  eq_s130:S2('eq_s130','星河',30,21500000,[{type:'magic_atk_up',value:182},{type:'mp_drain_pct',value:36},{type:'maxmp_up',value:180},{type:'lifesteal_on_kill',value:26},{type:'magic_atk_up_pct',value:48}],'星河凝成的耳环，蕴含银河的脉动'),
  eq_s131:S2('eq_s131','云影',30,20500000,[{type:'phys_atk_up',value:162},{type:'maxhp_up',value:200},{type:'def_up_pct',value:56},{type:'counter_start',value:9}],'云影凝成的手镯，虚无缥缈却坚韧不摧'),
  eq_s132:S2('eq_s132','风铃',30,22000000,[{type:'phys_atk_up',value:166},{type:'magic_atk_up',value:146},{type:'true_dmg_bonus',value:60},{type:'hp_drain_pct',value:34},{type:'first_strike',value:72}],'风铃凝成的徽章，清响一动，千里传音')
});

/* ==================== 饰品 Lv35（s133-s138） ====================
   冥界词汇：幽影 / 冥光 / 暗河 / 黄沙 / 阴风 / 鬼火
   ============================================================ */
Object.assign(EQUIPS, {
  eq_s133:S2('eq_s133','幽影',35,65000000,[{type:'phys_atk_up',value:200},{type:'hp_drain_pct',value:48},{type:'low_hp_power',value:65},{type:'execute_below',value:58}],'幽影凝成的戒指，能穿行于冥界与人间的夹缝'),
  eq_s134:S2('eq_s134','冥光',35,70000000,[{type:'magic_atk_up',value:230},{type:'magic_atk_up_pct',value:62},{type:'maxmp_up',value:230},{type:'first_strike',value:80}],'冥光凝成的项链，蕴含冥界最纯粹的光'),
  eq_s135:S2('eq_s135','暗河',35,68000000,[{type:'phys_atk_up',value:212},{type:'execute_below',value:64},{type:'maxhp_up',value:245},{type:'low_hp_power',value:70}],'暗河凝成的护符，蕴含冥河的深邃'),
  eq_s136:S2('eq_s136','黄沙',35,69000000,[{type:'magic_atk_up',value:226},{type:'mp_drain_pct',value:45},{type:'maxmp_up',value:225},{type:'lifesteal_on_kill',value:32},{type:'magic_atk_up_pct',value:58}],'黄沙凝成的耳环，蕴含荒漠的孤寂'),
  eq_s137:S2('eq_s137','阴风',35,67000000,[{type:'phys_atk_up',value:204},{type:'maxhp_up',value:250},{type:'def_up_pct',value:70},{type:'counter_start',value:11}],'阴风凝成的手镯，风过之处，万籁俱寂'),
  eq_s138:S2('eq_s138','鬼火',35,70000000,[{type:'phys_atk_up',value:208},{type:'magic_atk_up',value:184},{type:'true_dmg_bonus',value:75},{type:'hp_drain_pct',value:44},{type:'first_strike',value:85}],'鬼火凝成的徽章，幽蓝的火焰照不亮生者的路')
});

/* ==================== 饰品 Lv40（s139-s144） ====================
   华丽命名：永恒之环 / 命运之链 / 星辰之泪 / 神话之眼 / 创世之光 / 不灭之心
   ============================================================ */
Object.assign(EQUIPS, {
  eq_s139:S2('eq_s139','永恒之环',40,120000000,[{type:'phys_atk_up',value:260},{type:'hp_drain_pct',value:60},{type:'low_hp_power',value:85},{type:'execute_below',value:75}],'永恒之环，环绕永恒，不随时间流逝而磨损'),
  eq_s140:S2('eq_s140','命运之链',40,130000000,[{type:'magic_atk_up',value:300},{type:'magic_atk_up_pct',value:82},{type:'maxmp_up',value:300},{type:'first_strike',value:105}],'命运之链，链住命运本身，无人能挣脱'),
  eq_s141:S2('eq_s141','星辰之泪',40,125000000,[{type:'phys_atk_up',value:275},{type:'execute_below',value:84},{type:'maxhp_up',value:320},{type:'low_hp_power',value:92}],'星辰之泪，星辰陨落时凝结的泪滴，蕴含宇宙的悲悯'),
  eq_s142:S2('eq_s142','神话之眼',40,128000000,[{type:'magic_atk_up',value:292},{type:'mp_drain_pct',value:58},{type:'maxmp_up',value:295},{type:'lifesteal_on_kill',value:42},{type:'magic_atk_up_pct',value:76}],'神话之眼，注视一切，却不被一切注视'),
  eq_s143:S2('eq_s143','创世之光',40,122000000,[{type:'phys_atk_up',value:265},{type:'maxhp_up',value:330},{type:'def_up_pct',value:92},{type:'counter_start',value:14}],'创世之光，宇宙初开时的第一缕光，永不熄灭'),
  eq_s144:S2('eq_s144','不灭之心',40,135000000,[{type:'phys_atk_up',value:270},{type:'magic_atk_up',value:240},{type:'true_dmg_bonus',value:98},{type:'hp_drain_pct',value:58},{type:'first_strike',value:110}],'不灭之心，永恒跳动，从时间的开始到结束')
});

/* ============================================================
   防具（a001-a025）
   ------------------------------------------------------------
   Lv1-2  布/皮（全职业可用）
   Lv3-4  法袍（法系）+ 铁甲/铜甲（战系）
   Lv5-8  精钢/秘银/玄铁/龙鳞（分职业线）
   Lv9-10 霜华/幽冥/龙鳞（传说级）
   ============================================================ */
Object.assign(EQUIPS, {
  /* ---- Lv1 ---- */
  eq_a001:A('eq_a001','粗布衣',1,15,60,null,1,'粗布缝制的衣物，轻便但防护有限',['tag032','tag016']),
  eq_a002:A('eq_a002','生锈皮甲',1,25,80,['战士','巡警','杀手','铁匠','商人'],2,'硬皮缝制的护甲，铁扣已经生锈',['tag031','tag016']),

  /* ---- Lv2 ---- */
  eq_a003:A('eq_a003','旅人布衣',2,50,90,null,3,'细布缝制的旅装，比粗布更耐用',['tag032','tag015']),
  eq_a004:A('eq_a004','皮甲',2,70,110,['战士','巡警','杀手','铁匠','商人'],5,'硝制皮甲，防护尚可',['tag031','tag015']),

  /* ---- Lv3 ---- */
  eq_a005:A('eq_a005','学徒法袍',3,130,100,['法师','阵法师','疗愈师','炼金术师'],4,'魔能塔学徒制式法袍，袖口绣着符文',['tag032','tag015'],[{type:'maxmp_up',value:20}]),
  eq_a006:A('eq_a006','铁甲',3,150,130,['战士','巡警','铁匠'],8,'铁片拼接的护甲，比皮甲更抗揍',['tag021','tag015']),

  /* ---- Lv4 ---- */
  eq_a007:A('eq_a007','术士法袍',4,280,120,['法师','阵法师','疗愈师','炼金术师'],6,'绣满符文的术士法袍，魔力流转顺畅',['tag032','tag017'],[{type:'maxmp_up',value:30},{type:'magic_atk_up_pct',value:3}]),
  eq_a008:A('eq_a008','铜甲',4,300,150,['战士','巡警','铁匠'],11,'铜片锻造的护甲，比铁甲更亮',['tag023','tag015']),

  /* ---- Lv5 ---- */
  eq_a009:A('eq_a009','精制法袍',5,500,140,['法师','阵法师','疗愈师','炼金术师'],8,'精工裁制的法师长袍',['tag032','tag017'],[{type:'maxmp_up',value:40},{type:'magic_atk_up_pct',value:5}]),
  eq_a010:A('eq_a010','精钢甲',5,550,170,['战士','巡警','铁匠'],15,'精钢锻造的护甲，能挡刀剑',['tag022','tag017']),

  /* ---- Lv6 ---- */
  eq_a011:A('eq_a011','秘银法袍',6,900,160,['法师','阵法师','疗愈师','炼金术师'],11,'秘银线织入布料的法袍，魔力传导极佳',['tag025','tag017'],[{type:'maxmp_up',value:55},{type:'magic_atk_up_pct',value:8}]),
    eq_a012:A('eq_a012','秘银甲',6,1000,190,['战士','巡警','铁匠'],19,'秘银锻造的护甲，轻便且坚固',['tag025','tag017'],[{type:'spd_up',value:1}]),
    eq_a013:A('eq_a013','影行皮甲',6,950,160,['杀手','商人'],12,'漆黑的轻皮甲，行动时几乎无声',['tag031','tag017'],[{type:'spd_up',value:2},{type:'dodge',value:0.05}]),

  /* ---- Lv7 ---- */
  eq_a014:A('eq_a014','玄铁法袍',7,1800,180,['法师','阵法师','疗愈师'],15,'玄铁线织成的法袍，魔力浑厚',['tag024','tag017'],[{type:'maxmp_up',value:70},{type:'magic_atk_up_pct',value:10}]),
  eq_a015:A('eq_a015','玄铁甲',7,1900,210,['战士','巡警','铁匠'],24,'玄铁锻造的重甲，能抗刀砍斧劈',['tag024','tag017']),
  eq_a016:A('eq_a016','寒铁甲',7,1900,200,['战士','巡警','杀手'],21,'寒铁锻造的护甲，触手生寒',['tag026','tag017'],[{type:'hp_drain_pct',value:5}]),

  /* ---- Lv8 ---- */
  eq_a017:A('eq_a017','星辰法袍',8,3500,200,['法师','阵法师','疗愈师'],19,'星辰碎片织入的袍子，星光流转',['tag069','tag018'],[{type:'maxmp_up',value:85},{type:'magic_atk_up_pct',value:12}]),
  eq_a018:A('eq_a018','龙鳞甲',8,3800,230,['战士','巡警'],29,'龙鳞拼制的护甲，坚硬无比',['tag051','tag018']),
   eq_a019:A('eq_a019','影杀甲',8,3600,210,['杀手'],22,'影杀之力加持的护甲，行动时融入暗影',['tag063','tag018'],[{type:'spd_up',value:3},{type:'silence_on_hit',value:8}]),
  /* ---- Lv9 ---- */
  eq_a020:A('eq_a020','霜华法袍',9,7500,220,['法师','阵法师','疗愈师'],24,'霜华之力凝成的法袍，冰冷刺骨',['tag058','tag018'],[{type:'maxmp_up',value:100},{type:'magic_atk_up_pct',value:15}]),
  eq_a021:A('eq_a021','霜华甲',9,8000,250,['战士','巡警'],35,'霜华之力凝成的护甲，坚冰不化',['tag058','tag018']),
    eq_a022:A('eq_a022','幽冥甲',9,7800,240,['杀手'],28,'幽冥之力加持的护甲，据说是用冥河石磨制',['tag066','tag018'],[{type:'spd_up',value:4},{type:'silence_on_hit',value:15},{type:'hp_drain_pct',value:8}]),

  /* ---- Lv10 ---- */
  eq_a023:A('eq_a023','龙鳞重甲',10,170000,300,['战士','巡警','铁匠'],45,'远古巨龙的龙鳞锻造的重甲，可挡万钧之力',['tag051','tag018'],[{type:'def_up_pct',value:15}]),
  eq_a024:A('eq_a024','凤凰羽衣',10,180000,270,['法师','阵法师','疗愈师','炼金术师'],32,'凤凰羽毛织成的长袍，蕴含不灭之炎',['tag072','tag018'],[{type:'maxhp_up',value:100},{type:'maxmp_up',value:120},{type:'magic_atk_up_pct',value:20}]),
    eq_a025:A('eq_a025','龙牙暗甲',10,175000,280,['杀手','商人'],38,'龙牙镶嵌的暗甲，兼具防护与杀伐',['tag052','tag018'],[{type:'spd_up',value:5},{type:'silence_on_hit',value:20},{type:'hp_drain_pct',value:12}]),
});

/* ============================================================
   新增部位装备：头盔（head）/ 腿甲（legs）/ 盾牌（shield）/ 法器（focus）
   数值按同档胸甲比例：头盔 def≈45%、腿甲 def≈60%，耐久同步缩减
   ============================================================ */
Object.assign(EQUIPS, {
  /* ---- 头盔（eq_h001-h010） ---- */
  eq_h001:A('eq_h001','布帽',1,10,40,null,1,'粗布缝制的便帽，聊胜于无',['tag032','tag016'],null,'head'),
  eq_h002:A('eq_h002','皮帽',2,30,55,null,2,'硬皮压成的帽子，能挡点风',['tag031','tag015'],null,'head'),
  eq_h003:A('eq_h003','铁盔',3,100,65,['战士','巡警','杀手','铁匠'],4,'铁片打制的简易头盔，护住头顶',['tag021','tag015'],null,'head'),
  eq_h004:A('eq_h004','铜盔',4,200,75,['战士','巡警','杀手','铁匠'],5,'铜制头盔，比铁盔轻便',['tag023','tag015'],null,'head'),
  eq_h005:A('eq_h005','钢盔',5,350,85,['战士','巡警','杀手','铁匠'],7,'精钢头盔，能挡下劈砍',['tag022','tag017'],null,'head'),
  eq_h006:A('eq_h006','秘银盔',6,600,95,['战士','巡警','杀手','铁匠'],9,'秘银头盔，轻而坚固',['tag025','tag017'],null,'head'),
  eq_h007:A('eq_h007','玄铁盔',7,1200,105,['战士','巡警','铁匠'],11,'玄铁重盔，分量十足',['tag024','tag017'],null,'head'),
  eq_h008:A('eq_h008','龙鳞盔',8,2400,115,['战士','巡警','铁匠'],13,'龙鳞覆面的头盔',['tag051','tag018'],null,'head'),
  eq_h009:A('eq_h009','霜华盔',9,5000,125,['战士','巡警','铁匠'],16,'霜华凝成的头盔，冰冷坚硬',['tag058','tag018'],null,'head'),
  eq_h010:A('eq_h010','龙鳞重盔',10,100000,150,['战士','巡警','铁匠'],20,'远古龙鳞锻造的重型头盔',['tag051','tag018'],null,'head'),

  /* ---- 腿甲（eq_l001-l010） ---- */
  eq_l001:A('eq_l001','布裤',1,12,48,null,1,'粗布长裤，行动方便',['tag032','tag016'],null,'legs'),
  eq_l002:A('eq_l002','皮裤',2,40,66,null,3,'硝制皮裤，耐磨',['tag031','tag015'],null,'legs'),
  eq_l003:A('eq_l003','铁护腿',3,120,78,['战士','巡警','杀手','铁匠'],5,'铁片护腿，护住膝盖',['tag021','tag015'],null,'legs'),
  eq_l004:A('eq_l004','铜护腿',4,220,90,['战士','巡警','杀手','铁匠'],7,'铜制护腿',['tag023','tag015'],null,'legs'),
  eq_l005:A('eq_l005','钢护腿',5,400,102,['战士','巡警','杀手','铁匠'],9,'精钢护腿，行走无声',['tag022','tag017'],null,'legs'),
  eq_l006:A('eq_l006','秘银护腿',6,700,114,['战士','巡警','杀手','铁匠'],11,'秘银护腿，轻便灵活',['tag025','tag017'],null,'legs'),
  eq_l007:A('eq_l007','玄铁护腿',7,1400,126,['战士','巡警','铁匠'],14,'玄铁重护腿',['tag024','tag017'],null,'legs'),
  eq_l008:A('eq_l008','龙鳞护腿',8,2600,138,['战士','巡警','铁匠'],17,'龙鳞拼制的护腿',['tag051','tag018'],null,'legs'),
  eq_l009:A('eq_l009','霜华护腿',9,5500,150,['战士','巡警','铁匠'],21,'霜华凝成的护腿',['tag058','tag018'],null,'legs'),
  eq_l010:A('eq_l010','龙鳞重护腿',10,110000,180,['战士','巡警','铁匠'],27,'远古龙鳞锻造的重型腿甲',['tag051','tag018'],null,'legs'),

  /* ---- 足部（eq_f001-f010，新 8 槽） ---- */
  eq_f001:A('eq_f001','布鞋',1,10,44,null,1,'粗布缝制的软鞋，走起路来轻飘飘',['tag032','tag016'],null,'feet'),
  eq_f002:A('eq_f002','皮靴',2,35,60,null,2,'硝制皮靴，鞋底厚实耐磨',['tag031','tag015'],null,'feet'),
  eq_f003:A('eq_f003','铁靴',3,110,72,['战士','巡警','杀手','铁匠'],4,'铁片包头的靴子，踢人很疼',['tag021','tag015'],null,'feet'),
  eq_f004:A('eq_f004','铜靴',4,200,84,['战士','巡警','杀手','铁匠'],5,'铜制靴壳，比铁靴轻便',['tag023','tag015'],null,'feet'),
  eq_f005:A('eq_f005','钢靴',5,360,96,['战士','巡警','杀手','铁匠'],7,'精钢锻造的护胫靴，踩着稳当',['tag022','tag017'],null,'feet'),
  eq_f006:A('eq_f006','秘银靴',6,640,108,['战士','巡警','杀手','铁匠'],9,'秘银靴，轻而坚固，落地无声',['tag025','tag017'],null,'feet'),
  eq_f007:A('eq_f007','玄铁靴',7,1300,120,['战士','巡警','铁匠'],11,'玄铁重靴，一步一个脚印',['tag024','tag017'],null,'feet'),
  eq_f008:A('eq_f008','龙鳞靴',8,2500,132,['战士','巡警','铁匠'],13,'龙鳞覆面的靴子，水火不侵',['tag051','tag018'],null,'feet'),
  eq_f009:A('eq_f009','霜华靴',9,5200,144,['战士','巡警','铁匠'],16,'霜华凝成的靴子，走过不留痕',['tag058','tag018'],null,'feet'),
  eq_f010:A('eq_f010','龙鳞重靴',10,105000,170,['战士','巡警','铁匠'],20,'远古龙鳞锻造的重靴，踏地如雷',['tag051','tag018'],null,'feet'),

  /* ---- 盾牌（eq_sh001-sh005，副手，有耐久） ---- */
  eq_sh001:Sh('eq_sh001','木盾',1,15,100,null,2,'整块硬木削成的圆盾，能挡普通攻击',['tag028']),
  eq_sh002:Sh('eq_sh002','铁盾',3,150,150,['战士','巡警','铁匠'],6,'铁皮包边的盾牌，坚固耐用',['tag021']),
  eq_sh003:Sh('eq_sh003','钢盾',5,500,200,['战士','巡警','铁匠'],12,'精钢盾牌，正面光滑能卸力',['tag022']),
  eq_sh004:Sh('eq_sh004','龙鳞盾',8,3000,260,['战士','巡警','铁匠'],22,'龙鳞覆面的盾牌，几乎刀枪不入',['tag051']),
  eq_sh005:Sh('eq_sh005','神殿骑士盾',10,120000,320,['战士','巡警'],35,'神殿骑士团制式大盾，盾心铸着圣徽',['tag051','tag018'],[{type:'def_up_pct',value:10},{type:'counter_start',value:1}]),

  /* ---- 法器（eq_fc001-fc005，副手魔导器，无耐久） ---- */
  eq_fc001:Fc('eq_fc001','学徒法球',1,20,['法师','阵法师','疗愈师','炼金术师'],[{type:'magic_atk_up',value:3}],'学徒练习用的小型法球，微微发光',['tag043']),
  eq_fc002:Fc('eq_fc002','铜制法印',3,150,['法师','阵法师','炼金术师'],[{type:'magic_atk_up',value:8},{type:'maxmp_up',value:10}],'刻着符文的铜制法印，佩戴在副手',['tag023']),
  eq_fc003:Fc('eq_fc003','秘银魔导书',5,600,['法师','阵法师','疗愈师'],[{type:'magic_atk_up',value:16},{type:'maxmp_up',value:25}],'悬浮于身侧的秘银魔导书，自动翻页',['tag025']),
  eq_fc004:Fc('eq_fc004','龙语法牌',8,3000,['法师','阵法师'],[{type:'magic_atk_up',value:30},{type:'maxmp_up',value:50}],'刻满龙语的法牌，魔力澎湃',['tag056']),
  eq_fc005:Fc('eq_fc005','星辰圣契',10,120000,['法师','阵法师','疗愈师'],[{type:'magic_atk_up',value:45},{type:'maxmp_up',value:80},{type:'magic_atk_up_pct',value:10}],'星辰之力凝成的圣契，环绕身侧流转',['tag069','tag018'])
});

/* ---- 药品：HP/MP 恢复（传统 / 奇幻两套 × 五档） ---- */
Object.assign(EQUIPS, {
  item_c001:P('item_c001','红药水（小）',1,10,30,0,'小型治疗药水，恢复 30 点生命。'),
  item_c002:P('item_c002','蓝药水（小）',1,10,0,18,'小型魔力药水，恢复 18 点魔力。'),
  item_c003:P('item_c003','红药水（中）',10,50,80,0,'中型治疗药水，恢复 80 点生命。'),
  item_c004:P('item_c004','蓝药水（中）',10,50,0,45,'中型魔力药水，恢复 45 点魔力。'),
  item_c005:P('item_c005','红药水（大）',20,180,150,0,'大型治疗药水，恢复 150 点生命。'),
  item_c006:P('item_c006','蓝药水（大）',20,180,0,85,'大型魔力药水，恢复 85 点魔力。'),
  item_c007:P('item_c007','红药水（特）',35,600,260,0,'特型治疗药水，恢复 260 点生命。'),
  item_c008:P('item_c008','蓝药水（特）',35,600,0,150,'特型魔力药水，恢复 150 点魔力。'),
  item_c009:P('item_c009','红药水（极）',50,1800,420,0,'极型治疗药水，恢复 420 点生命。'),
  item_c010:P('item_c010','蓝药水（极）',50,1800,0,240,'极型魔力药水，恢复 240 点魔力。'),

  item_c011:P('item_c011','赤露',1,15,36,0,'奇幻治疗药剂，恢复 36 点生命，比同档传统药略强。'),
  item_c012:P('item_c012','蓝露',1,15,0,22,'奇幻魔力药剂，恢复 22 点魔力，比同档传统药略强。'),
  item_c013:P('item_c013','血莓酿',10,75,96,0,'奇幻治疗药剂，恢复 96 点生命，比同档传统药略强。'),
  item_c014:P('item_c014','月泉',10,75,0,54,'奇幻魔力药剂，恢复 54 点魔力，比同档传统药略强。'),
  item_c015:P('item_c015','绯红药剂',20,270,180,0,'奇幻治疗药剂，恢复 180 点生命，比同档传统药略强。'),
  item_c016:P('item_c016','星辉药剂',20,270,0,102,'奇幻魔力药剂，恢复 102 点魔力，比同档传统药略强。'),
  item_c017:P('item_c017','龙血露',35,900,312,0,'奇幻治疗药剂，恢复 312 点生命，比同档传统药略强。'),
  item_c018:P('item_c018','秘银露',35,900,0,180,'奇幻魔力药剂，恢复 180 点魔力，比同档传统药略强。'),
  item_c019:P('item_c019','生命之露',50,2700,504,0,'奇幻治疗药剂，恢复 504 点生命，比同档传统药略强。'),
  item_c020:P('item_c020','灵海露',50,2700,0,288,'奇幻魔力药剂，恢复 288 点魔力，比同档传统药略强。'),

  /* 纯状态解除 */
  item_c021:PE('item_c021','解毒药',1,40,[{type:'cure_poison',value:1}],'解除中毒。'),
  item_c022:PE('item_c022','灭火药',1,40,[{type:'cure_burn',value:1}],'解除灼烧。'),
  item_c023:PE('item_c023','止血药',1,40,[{type:'cure_bleed',value:1}],'解除流血。'),
  item_c024:PE('item_c024','解默药',10,120,[{type:'cure_silence',value:1}],'解除沉默。'),
  item_c025:PE('item_c025','融冰药',10,120,[{type:'cure_freeze',value:1}],'解除冰冻。'),
  item_c026:PE('item_c026','清心药',20,300,[{type:'cure_confuse',value:1}],'解除混乱。'),
  item_c027:PE('item_c027','醒神药',20,300,[{type:'cure_stun',value:1}],'解除眩晕。'),
  item_c028:PE('item_c028','破石药',20,300,[{type:'cure_petrify',value:1}],'解除石化。'),
  item_c029:PE('item_c029','去印记药',20,200,[{type:'cure_mark',value:1}],'解除印记。'),

  /* 少量恢复 + 解除状态：·血 / ·灵 / ·双 */
  item_c030:PE('item_c030','解毒药·血',1,140,[{type:'hp_heal_pct',value:10},{type:'cure_poison',value:1}],'恢复 10% 生命，并解除中毒。'),
  item_c039:PE('item_c039','解毒药·灵',1,140,[{type:'mp_heal_pct',value:10},{type:'cure_poison',value:1}],'恢复 10% 魔力，并解除中毒。'),
  item_c048:PE('item_c048','解毒药·双',1,190,[{type:'hp_heal_pct',value:8},{type:'mp_heal_pct',value:8},{type:'cure_poison',value:1}],'恢复 8% 生命和 8% 魔力，并解除中毒。'),
  item_c031:PE('item_c031','灭火药·血',1,140,[{type:'hp_heal_pct',value:10},{type:'cure_burn',value:1}],'恢复 10% 生命，并解除灼烧。'),
  item_c040:PE('item_c040','灭火药·灵',1,140,[{type:'mp_heal_pct',value:10},{type:'cure_burn',value:1}],'恢复 10% 魔力，并解除灼烧。'),
  item_c049:PE('item_c049','灭火药·双',1,190,[{type:'hp_heal_pct',value:8},{type:'mp_heal_pct',value:8},{type:'cure_burn',value:1}],'恢复 8% 生命和 8% 魔力，并解除灼烧。'),
  item_c032:PE('item_c032','止血药·血',1,140,[{type:'hp_heal_pct',value:10},{type:'cure_bleed',value:1}],'恢复 10% 生命，并解除流血。'),
  item_c041:PE('item_c041','止血药·灵',1,140,[{type:'mp_heal_pct',value:10},{type:'cure_bleed',value:1}],'恢复 10% 魔力，并解除流血。'),
  item_c050:PE('item_c050','止血药·双',1,190,[{type:'hp_heal_pct',value:8},{type:'mp_heal_pct',value:8},{type:'cure_bleed',value:1}],'恢复 8% 生命和 8% 魔力，并解除流血。'),
  item_c033:PE('item_c033','解默药·血',10,220,[{type:'hp_heal_pct',value:10},{type:'cure_silence',value:1}],'恢复 10% 生命，并解除沉默。'),
  item_c042:PE('item_c042','解默药·灵',10,220,[{type:'mp_heal_pct',value:10},{type:'cure_silence',value:1}],'恢复 10% 魔力，并解除沉默。'),
  item_c051:PE('item_c051','解默药·双',10,270,[{type:'hp_heal_pct',value:8},{type:'mp_heal_pct',value:8},{type:'cure_silence',value:1}],'恢复 8% 生命和 8% 魔力，并解除沉默。'),
  item_c034:PE('item_c034','融冰药·血',10,220,[{type:'hp_heal_pct',value:10},{type:'cure_freeze',value:1}],'恢复 10% 生命，并解除冰冻。'),
  item_c043:PE('item_c043','融冰药·灵',10,220,[{type:'mp_heal_pct',value:10},{type:'cure_freeze',value:1}],'恢复 10% 魔力，并解除冰冻。'),
  item_c052:PE('item_c052','融冰药·双',10,270,[{type:'hp_heal_pct',value:8},{type:'mp_heal_pct',value:8},{type:'cure_freeze',value:1}],'恢复 8% 生命和 8% 魔力，并解除冰冻。'),
  item_c035:PE('item_c035','清心药·血',20,400,[{type:'hp_heal_pct',value:10},{type:'cure_confuse',value:1}],'恢复 10% 生命，并解除混乱。'),
  item_c044:PE('item_c044','清心药·灵',20,400,[{type:'mp_heal_pct',value:10},{type:'cure_confuse',value:1}],'恢复 10% 魔力，并解除混乱。'),
  item_c053:PE('item_c053','清心药·双',20,450,[{type:'hp_heal_pct',value:8},{type:'mp_heal_pct',value:8},{type:'cure_confuse',value:1}],'恢复 8% 生命和 8% 魔力，并解除混乱。'),
  item_c036:PE('item_c036','醒神药·血',20,400,[{type:'hp_heal_pct',value:10},{type:'cure_stun',value:1}],'恢复 10% 生命，并解除眩晕。'),
  item_c045:PE('item_c045','醒神药·灵',20,400,[{type:'mp_heal_pct',value:10},{type:'cure_stun',value:1}],'恢复 10% 魔力，并解除眩晕。'),
  item_c054:PE('item_c054','醒神药·双',20,450,[{type:'hp_heal_pct',value:8},{type:'mp_heal_pct',value:8},{type:'cure_stun',value:1}],'恢复 8% 生命和 8% 魔力，并解除眩晕。'),
  item_c037:PE('item_c037','破石药·血',20,400,[{type:'hp_heal_pct',value:10},{type:'cure_petrify',value:1}],'恢复 10% 生命，并解除石化。'),
  item_c046:PE('item_c046','破石药·灵',20,400,[{type:'mp_heal_pct',value:10},{type:'cure_petrify',value:1}],'恢复 10% 魔力，并解除石化。'),
  item_c055:PE('item_c055','破石药·双',20,450,[{type:'hp_heal_pct',value:8},{type:'mp_heal_pct',value:8},{type:'cure_petrify',value:1}],'恢复 8% 生命和 8% 魔力，并解除石化。'),
  item_c038:PE('item_c038','去印记药·血',20,300,[{type:'hp_heal_pct',value:10},{type:'cure_mark',value:1}],'恢复 10% 生命，并解除印记。'),
  item_c047:PE('item_c047','去印记药·灵',20,300,[{type:'mp_heal_pct',value:10},{type:'cure_mark',value:1}],'恢复 10% 魔力，并解除印记。'),
  item_c056:PE('item_c056','去印记药·双',20,350,[{type:'hp_heal_pct',value:8},{type:'mp_heal_pct',value:8},{type:'cure_mark',value:1}],'恢复 8% 生命和 8% 魔力，并解除印记。'),
});

/* ============================================================
   材料（m001-m045）—— P0-13
   ------------------------------------------------------------
   五种类型：兽皮 / 牙骨 / 晶核 / 矿石 / 草药
   五个档位：Lv1-9 / Lv10-19 / Lv20-29 / Lv30-39 / Lv40-50
   用途：卖给商人换钱（未来可作为合成材料）
   ============================================================ */
function M(i, n, l, p, d, tg){
  return {id:'item_'+i, name:n, type:'material', level:l, price:p, words:[], desc:d, tags: ["tag004"].concat(tg||[])};
}

/* 旧材料 m001–m045 已移除：掉落材料统一在 data-materials.js；矿石改用 item_o101–o150。 */


/* ---- 杂项（任务道具，不可卖） ---- */

Object.assign(EQUIPS, {
  item_q001:{id:'item_q001',name:'黑石',type:'other',level:1,price:0,words:[],desc:'一块拳头大的黑石，敲上去带着金属声。老约翰说这是好铁料。',tags: ["tag005"],noGift:true},
  item_q002:{id:'item_q002',name:'华丽的匕首',type:'other',level:1,price:0,words:[],desc:'一把镶着宝石的匕首，刃身锃亮，刀柄上缠着金丝，华而不实',tags: ["tag005"],noGift:true},
  item_q003:{id:'item_q003',name:'洗浴中心金卡',type:'other',level:1,price:0,words:[],desc:'镇长私藏的金卡，可以在洗浴中心免费消费。',tags: ["tag005"],noGift:true},
  item_q004:{id:'item_q004',name:'爱慕信',type:'other',level:1,price:0,words:[],desc:'刘易斯写给魔能塔阵法师转职官的信，封口处贴着心形贴纸。',tags: ["tag005"],noGift:true},
  item_q005:{id:'item_q005',name:'一壶浊酒',type:'other',level:1,price:0,words:[],desc:'从破屋子的酒缸里翻出来的酒，浑浊但酒香扑鼻。',tags: ["tag005"],noGift:true},
  item_q006:{id:'item_q006',name:'兰斯洛特的传家宝',type:'other',level:1,price:0,words:[],desc:'一把古朴的佩剑，剑柄上刻着模糊的狮鹫纹章。据说曾属于雷的徒弟莱昂纳多。',tags: ["tag005"],noGift:true},
    item_q_bottle:{id:'item_q_bottle',name:'空药瓶',type:'other',level:1,price:0,words:[{type:'phys_atk_up',value:3}],desc:'一个用过的空药瓶，瓶身还带着药水的气味。可以用来装药，也可以当小礼物。',tags: ["tag005", "tag037", "tag071"]},
  item_q007:{id:'item_q007',name:'黑狼利爪',type:'other',level:1,price:0,words:[],desc:'黑狼的爪子，坚硬锋利。布兰德需要这种材料。',tags: ["tag005"],noGift:true},
  item_q008:{id:'item_q008',name:'奶奶的手帕',type:'other',level:1,price:0,words:[],desc:'粗布缝的手帕，针脚很密。芙蕾雅奶奶托你带给孙女的。',tags: ["tag005"],noGift:true},
  item_q009:{id:'item_q009',name:'塞拉菲娜的文书',type:'other',level:1,price:0,words:[],desc:'一份密封的文书，封口印着高尖塔的徽记。',tags: ["tag005"],noGift:true},
  item_q010:{id:'item_q010',name:'硬质獠牙',type:'other',level:1,price:0,words:[],desc:'铁甲野猪的獠牙，坚硬如铁。老埃德加需要这种材料。',tags: ["tag005"],noGift:true},
  item_q011:{id:'item_q011',name:'阵法，从入门到精通',type:'other',level:1,price:0,words:[],desc:'一本硬皮厚书，封面上印着细密的阵纹。薇拉要找的就是它。',tags: ["tag005", "tag034"],noGift:true},
  item_q012:{id:'item_q012',name:'阿尔文的信',type:'other',level:1,price:0,words:[],desc:'一封没写寄信人姓名的信，封蜡上压着一个简单的印记。',tags: ["tag005"],noGift:true}
});



/* ---- 礼物道具（送礼专用，效果在 main.js 的 doGift 里结算） ---- */
Object.assign(EQUIPS, {
  item_gift_flower:{
    id:'item_gift_flower', name:'心意花束', type:'other', category:'special',
    level:1, price:0, words:[],
    effects:[{type:'affinity', value:20}],
    giftFixed:true,
    desc:'用丝带仔细扎好的时令花束，花瓣上还带着水珠。送给谁，谁都会开心。',
    tags:['tag005','tag071']
  },
  item_gift_prank:{
    id:'item_gift_prank', name:'整蛊礼盒', type:'other', category:'special',
    level:1, price:0, words:[],
    effects:[{type:'affinity', value:-20}],
    giftFixed:true,
    desc:'包装得像模像样的礼盒，打开会弹出一只假蜘蛛。收到的人大概不会高兴。',
    tags:['tag005','tag071']
  }
});

/* ---- 即时道具：永久成长 / 金币 / 技能书 / 转职 / 窥探镜 ---- */
const INSTANT_ITEMS = {
  "item_i001": {
    "id": "item_i001",
    "name": "永久体力药（小）",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 3000,
    "effects": [
      {
        "type": "perm_vit_up",
        "value": 1
      }
    ],
    "desc": "永久体力 +1",
    "tags": [
      "tag005",
      "tag038"
    ],
    "noGift": true
  },
  "item_i002": {
    "id": "item_i002",
    "name": "永久体力药（中）",
    "type": "instant",
    "category": "instant",
    "level": 10,
    "price": 8000,
    "effects": [
      {
        "type": "perm_vit_up",
        "value": 2
      }
    ],
    "desc": "永久体力 +2",
    "tags": [
      "tag005",
      "tag038"
    ],
    "noGift": true
  },
  "item_i003": {
    "id": "item_i003",
    "name": "永久体力药（大）",
    "type": "instant",
    "category": "instant",
    "level": 20,
    "price": 20000,
    "effects": [
      {
        "type": "perm_vit_up",
        "value": 3
      }
    ],
    "desc": "永久体力 +3",
    "tags": [
      "tag005",
      "tag038"
    ],
    "noGift": true
  },
  "item_i004": {
    "id": "item_i004",
    "name": "永久精神药（小）",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 3000,
    "effects": [
      {
        "type": "perm_spi_up",
        "value": 1
      }
    ],
    "desc": "永久精神 +1",
    "tags": [
      "tag005",
      "tag038"
    ],
    "noGift": true
  },
  "item_i005": {
    "id": "item_i005",
    "name": "永久精神药（中）",
    "type": "instant",
    "category": "instant",
    "level": 10,
    "price": 8000,
    "effects": [
      {
        "type": "perm_spi_up",
        "value": 2
      }
    ],
    "desc": "永久精神 +2",
    "tags": [
      "tag005",
      "tag038"
    ],
    "noGift": true
  },
  "item_i006": {
    "id": "item_i006",
    "name": "永久精神药（大）",
    "type": "instant",
    "category": "instant",
    "level": 20,
    "price": 20000,
    "effects": [
      {
        "type": "perm_spi_up",
        "value": 3
      }
    ],
    "desc": "永久精神 +3",
    "tags": [
      "tag005",
      "tag038"
    ],
    "noGift": true
  },
  "item_i007": {
    "id": "item_i007",
    "name": "额外生命药（小）",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 2000,
    "effects": [
      {
        "type": "perm_hp_up",
        "value": 50
      }
    ],
    "desc": "额外生命上限 +50",
    "tags": [
      "tag005",
      "tag038"
    ],
    "noGift": true
  },
  "item_i008": {
    "id": "item_i008",
    "name": "额外生命药（中）",
    "type": "instant",
    "category": "instant",
    "level": 10,
    "price": 6000,
    "effects": [
      {
        "type": "perm_hp_up",
        "value": 150
      }
    ],
    "desc": "额外生命上限 +150",
    "tags": [
      "tag005",
      "tag038"
    ],
    "noGift": true
  },
  "item_i009": {
    "id": "item_i009",
    "name": "额外生命药（大）",
    "type": "instant",
    "category": "instant",
    "level": 20,
    "price": 15000,
    "effects": [
      {
        "type": "perm_hp_up",
        "value": 400
      }
    ],
    "desc": "额外生命上限 +400",
    "tags": [
      "tag005",
      "tag038"
    ],
    "noGift": true
  },
  "item_i010": {
    "id": "item_i010",
    "name": "额外魔力药（小）",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 2000,
    "effects": [
      {
        "type": "perm_mp_up",
        "value": 20
      }
    ],
    "desc": "额外魔力上限 +20",
    "tags": [
      "tag005",
      "tag038"
    ],
    "noGift": true
  },
  "item_i011": {
    "id": "item_i011",
    "name": "额外魔力药（中）",
    "type": "instant",
    "category": "instant",
    "level": 10,
    "price": 6000,
    "effects": [
      {
        "type": "perm_mp_up",
        "value": 60
      }
    ],
    "desc": "额外魔力上限 +60",
    "tags": [
      "tag005",
      "tag038"
    ],
    "noGift": true
  },
  "item_i012": {
    "id": "item_i012",
    "name": "额外魔力药（大）",
    "type": "instant",
    "category": "instant",
    "level": 20,
    "price": 15000,
    "effects": [
      {
        "type": "perm_mp_up",
        "value": 150
      }
    ],
    "desc": "额外魔力上限 +150",
    "tags": [
      "tag005",
      "tag038"
    ],
    "noGift": true
  },
  "item_i013": {
    "id": "item_i013",
    "name": "小金币袋",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 0,
    "effects": [
      {
        "type": "gain_gold",
        "value": 500
      }
    ],
    "desc": "获得 500 金币",
    "tags": [
      "tag005"
    ],
    "noGift": true
  },
  "item_i014": {
    "id": "item_i014",
    "name": "中金币袋",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 0,
    "effects": [
      {
        "type": "gain_gold",
        "value": 2000
      }
    ],
    "desc": "获得 2000 金币",
    "tags": [
      "tag005"
    ],
    "noGift": true
  },
  "item_i015": {
    "id": "item_i015",
    "name": "大金币袋",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 0,
    "effects": [
      {
        "type": "gain_gold",
        "value": 10000
      }
    ],
    "desc": "获得 10000 金币",
    "tags": [
      "tag005"
    ],
    "noGift": true
  },
  "item_i101": {
    "id": "item_i101",
    "name": "技能书·血怒",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_warrior08"
      }
    ],
    "desc": "学会技能：血怒（战士 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i102": {
    "id": "item_i102",
    "name": "技能书·战神降临",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_warrior09"
      }
    ],
    "desc": "学会技能：战神降临（战士 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i103": {
    "id": "item_i103",
    "name": "技能书·弑神之击",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_warrior10"
      }
    ],
    "desc": "学会技能：弑神之击（战士 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i104": {
    "id": "item_i104",
    "name": "技能书·奥术洪流",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_mage08"
      }
    ],
    "desc": "学会技能：奥术洪流（法师 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i105": {
    "id": "item_i105",
    "name": "技能书·禁咒·湮灭",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_mage09"
      }
    ],
    "desc": "学会技能：禁咒·湮灭（法师 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i106": {
    "id": "item_i106",
    "name": "技能书·禁咒·创世",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_mage10"
      }
    ],
    "desc": "学会技能：禁咒·创世（法师 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i107": {
    "id": "item_i107",
    "name": "技能书·迎击",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_patrol08"
      }
    ],
    "desc": "学会技能：迎击（巡警 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i108": {
    "id": "item_i108",
    "name": "技能书·肃清",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_patrol09"
      }
    ],
    "desc": "学会技能：肃清（巡警 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i109": {
    "id": "item_i109",
    "name": "技能书·王权裁决",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_patrol10"
      }
    ],
    "desc": "学会技能：王权裁决（巡警 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i110": {
    "id": "item_i110",
    "name": "技能书·毒爆",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_assassin08"
      }
    ],
    "desc": "学会技能：毒爆（杀手 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i111": {
    "id": "item_i111",
    "name": "技能书·致命一击",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_assassin09"
      }
    ],
    "desc": "学会技能：致命一击（杀手 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i112": {
    "id": "item_i112",
    "name": "技能书·死神裁决",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_assassin10"
      }
    ],
    "desc": "学会技能：死神裁决（杀手 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i113": {
    "id": "item_i113",
    "name": "技能书·忏悔",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_healer08"
      }
    ],
    "desc": "学会技能：忏悔（疗愈师 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i114": {
    "id": "item_i114",
    "name": "技能书·生命复苏",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_healer09"
      }
    ],
    "desc": "学会技能：生命复苏（疗愈师 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i115": {
    "id": "item_i115",
    "name": "技能书·生命赞歌",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_healer10"
      }
    ],
    "desc": "学会技能：生命赞歌（疗愈师 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i116": {
    "id": "item_i116",
    "name": "技能书·混乱阵",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_formation08"
      }
    ],
    "desc": "学会技能：混乱阵（阵法师 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i117": {
    "id": "item_i117",
    "name": "技能书·五行大阵",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_formation09"
      }
    ],
    "desc": "学会技能：五行大阵（阵法师 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i118": {
    "id": "item_i118",
    "name": "技能书·太极诛天阵",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_formation10"
      }
    ],
    "desc": "学会技能：太极诛天阵（阵法师 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i119": {
    "id": "item_i119",
    "name": "技能书·锻造之魂",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_blacksmith08"
      }
    ],
    "desc": "学会技能：锻造之魂（铁匠 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i120": {
    "id": "item_i120",
    "name": "技能书·火山喷发",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_blacksmith09"
      }
    ],
    "desc": "学会技能：火山喷发（铁匠 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i121": {
    "id": "item_i121",
    "name": "技能书·天工开物",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_blacksmith10"
      }
    ],
    "desc": "学会技能：天工开物（铁匠 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i122": {
    "id": "item_i122",
    "name": "技能书·赏金通缉",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_merchant08"
      }
    ],
    "desc": "学会技能：赏金通缉（商人 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i123": {
    "id": "item_i123",
    "name": "技能书·金钱壁垒",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_merchant09"
      }
    ],
    "desc": "学会技能：金钱壁垒（商人 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i124": {
    "id": "item_i124",
    "name": "技能书·富可敌国",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_merchant10"
      }
    ],
    "desc": "学会技能：富可敌国（商人 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i125": {
    "id": "item_i125",
    "name": "技能书·禁忌实验",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_alchemist08"
      }
    ],
    "desc": "学会技能：禁忌实验（炼金术师 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i126": {
    "id": "item_i126",
    "name": "技能书·大爆炸",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_alchemist09"
      }
    ],
    "desc": "学会技能：大爆炸（炼金术师 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i127": {
    "id": "item_i127",
    "name": "技能书·贤者之石",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_alchemist10"
      }
    ],
    "desc": "学会技能：贤者之石（炼金术师 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i128": {
    "id": "item_i128",
    "name": "技能书·神圣壁垒",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_paladin04"
      }
    ],
    "desc": "学会技能：神圣壁垒（圣骑士 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i129": {
    "id": "item_i129",
    "name": "技能书·魔军裁决",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_demonknight04"
      }
    ],
    "desc": "学会技能：魔军裁决（魔骑士 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i130": {
    "id": "item_i130",
    "name": "技能书·奥术爆发",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_meleemage04"
      }
    ],
    "desc": "学会技能：奥术爆发（近战法师 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i131": {
    "id": "item_i131",
    "name": "技能书·狂乱",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_maniac04"
      }
    ],
    "desc": "学会技能：狂乱（狂人 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i132": {
    "id": "item_i132",
    "name": "技能书·气流护体",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_aviator04"
      }
    ],
    "desc": "学会技能：气流护体（飞行家 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i133": {
    "id": "item_i133",
    "name": "技能书·坠落审判",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_wingknight04"
      }
    ],
    "desc": "学会技能：坠落审判（翼骑士 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i134": {
    "id": "item_i134",
    "name": "技能书·不坏之身",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_ironpagoda04"
      }
    ],
    "desc": "学会技能：不坏之身（铁浮屠 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i135": {
    "id": "item_i135",
    "name": "技能书·野兽狂暴",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 15000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_tamer04"
      }
    ],
    "desc": "学会技能：野兽狂暴（驯兽师 / ultimate）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i136": {
    "id": "item_i136",
    "name": "技能书·圣光斩",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 8000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_paladin01"
      }
    ],
    "desc": "学会技能：圣光斩（圣骑士 / basic）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i137": {
    "id": "item_i137",
    "name": "技能书·守护誓言",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 8000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_paladin02"
      }
    ],
    "desc": "学会技能：守护誓言（圣骑士 / advanced）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i138": {
    "id": "item_i138",
    "name": "技能书·制裁之锤",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 8000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_paladin03"
      }
    ],
    "desc": "学会技能：制裁之锤（圣骑士 / advanced）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i139": {
    "id": "item_i139",
    "name": "技能书·魔刃突刺",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 8000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_demonknight01"
      }
    ],
    "desc": "学会技能：魔刃突刺（魔骑士 / basic）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i140": {
    "id": "item_i140",
    "name": "技能书·暗黑护甲",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 8000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_demonknight02"
      }
    ],
    "desc": "学会技能：暗黑护甲（魔骑士 / advanced）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i141": {
    "id": "item_i141",
    "name": "技能书·恐惧冲锋",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 8000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_demonknight03"
      }
    ],
    "desc": "学会技能：恐惧冲锋（魔骑士 / advanced）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i142": {
    "id": "item_i142",
    "name": "技能书·法术斩",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 8000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_meleemage01"
      }
    ],
    "desc": "学会技能：法术斩（近战法师 / basic）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i143": {
    "id": "item_i143",
    "name": "技能书·瞬身咒",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 8000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_meleemage02"
      }
    ],
    "desc": "学会技能：瞬身咒（近战法师 / basic）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i144": {
    "id": "item_i144",
    "name": "技能书·冰刃",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 8000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_meleemage03"
      }
    ],
    "desc": "学会技能：冰刃（近战法师 / advanced）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i145": {
    "id": "item_i145",
    "name": "技能书·疯狂药剂",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 8000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_maniac01"
      }
    ],
    "desc": "学会技能：疯狂药剂（狂人 / basic）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i146": {
    "id": "item_i146",
    "name": "技能书·不稳定爆炸",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 8000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_maniac02"
      }
    ],
    "desc": "学会技能：不稳定爆炸（狂人 / advanced）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i147": {
    "id": "item_i147",
    "name": "技能书·痛苦转换",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 8000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_maniac03"
      }
    ],
    "desc": "学会技能：痛苦转换（狂人 / advanced）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i148": {
    "id": "item_i148",
    "name": "技能书·俯冲",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 8000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_aviator01"
      }
    ],
    "desc": "学会技能：俯冲（飞行家 / basic）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i149": {
    "id": "item_i149",
    "name": "技能书·风翼",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 8000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_aviator02"
      }
    ],
    "desc": "学会技能：风翼（飞行家 / basic）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i150": {
    "id": "item_i150",
    "name": "技能书·高空投掷",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 8000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_aviator03"
      }
    ],
    "desc": "学会技能：高空投掷（飞行家 / advanced）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i151": {
    "id": "item_i151",
    "name": "技能书·翼斩",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 8000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_wingknight01"
      }
    ],
    "desc": "学会技能：翼斩（翼骑士 / basic）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i152": {
    "id": "item_i152",
    "name": "技能书·天空守护",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 8000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_wingknight02"
      }
    ],
    "desc": "学会技能：天空守护（翼骑士 / advanced）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i153": {
    "id": "item_i153",
    "name": "技能书·风暴之翼",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 8000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_wingknight03"
      }
    ],
    "desc": "学会技能：风暴之翼（翼骑士 / advanced）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i154": {
    "id": "item_i154",
    "name": "技能书·铁壁冲撞",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 8000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_ironpagoda01"
      }
    ],
    "desc": "学会技能：铁壁冲撞（铁浮屠 / basic）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i155": {
    "id": "item_i155",
    "name": "技能书·重装守护",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 8000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_ironpagoda02"
      }
    ],
    "desc": "学会技能：重装守护（铁浮屠 / advanced）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i156": {
    "id": "item_i156",
    "name": "技能书·地动山摇",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 8000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_ironpagoda03"
      }
    ],
    "desc": "学会技能：地动山摇（铁浮屠 / advanced）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i157": {
    "id": "item_i157",
    "name": "技能书·兽群命令",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 8000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_tamer01"
      }
    ],
    "desc": "学会技能：兽群命令（驯兽师 / basic）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i158": {
    "id": "item_i158",
    "name": "技能书·狩猎标记",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 8000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_tamer02"
      }
    ],
    "desc": "学会技能：狩猎标记（驯兽师 / advanced）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i159": {
    "id": "item_i159",
    "name": "技能书·治疗宠物",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 8000,
    "effects": [
      {
        "type": "learn_skill",
        "skillId": "skill_tamer03"
      }
    ],
    "desc": "学会技能：治疗宠物（驯兽师 / advanced）",
    "tags": [
      "tag005",
      "tag034"
    ],
    "noGift": true
  },
  "item_i201": {
    "id": "item_i201",
    "name": "转职凭证·战士",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 50000,
    "effects": [
      {
        "type": "change_class",
        "classId": "战士"
      }
    ],
    "desc": "转职为 战士",
    "tags": [
      "tag005"
    ],
    "noGift": true
  },
  "item_i202": {
    "id": "item_i202",
    "name": "转职凭证·法师",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 50000,
    "effects": [
      {
        "type": "change_class",
        "classId": "法师"
      }
    ],
    "desc": "转职为 法师",
    "tags": [
      "tag005"
    ],
    "noGift": true
  },
  "item_i203": {
    "id": "item_i203",
    "name": "转职凭证·巡警",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 50000,
    "effects": [
      {
        "type": "change_class",
        "classId": "巡警"
      }
    ],
    "desc": "转职为 巡警",
    "tags": [
      "tag005"
    ],
    "noGift": true
  },
  "item_i204": {
    "id": "item_i204",
    "name": "转职凭证·杀手",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 50000,
    "effects": [
      {
        "type": "change_class",
        "classId": "杀手"
      }
    ],
    "desc": "转职为 杀手",
    "tags": [
      "tag005"
    ],
    "noGift": true
  },
  "item_i205": {
    "id": "item_i205",
    "name": "转职凭证·疗愈师",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 50000,
    "effects": [
      {
        "type": "change_class",
        "classId": "疗愈师"
      }
    ],
    "desc": "转职为 疗愈师",
    "tags": [
      "tag005"
    ],
    "noGift": true
  },
  "item_i206": {
    "id": "item_i206",
    "name": "转职凭证·阵法师",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 50000,
    "effects": [
      {
        "type": "change_class",
        "classId": "阵法师"
      }
    ],
    "desc": "转职为 阵法师",
    "tags": [
      "tag005"
    ],
    "noGift": true
  },
  "item_i207": {
    "id": "item_i207",
    "name": "转职凭证·铁匠",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 50000,
    "effects": [
      {
        "type": "change_class",
        "classId": "铁匠"
      }
    ],
    "desc": "转职为 铁匠",
    "tags": [
      "tag005"
    ],
    "noGift": true
  },
  "item_i208": {
    "id": "item_i208",
    "name": "转职凭证·商人",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 50000,
    "effects": [
      {
        "type": "change_class",
        "classId": "商人"
      }
    ],
    "desc": "转职为 商人",
    "tags": [
      "tag005"
    ],
    "noGift": true
  },
  "item_i209": {
    "id": "item_i209",
    "name": "转职凭证·炼金术师",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 50000,
    "effects": [
      {
        "type": "change_class",
        "classId": "炼金术师"
      }
    ],
    "desc": "转职为 炼金术师",
    "tags": [
      "tag005"
    ],
    "noGift": true
  },
  "item_i210": {
    "id": "item_i210",
    "name": "圣骑士信物",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 80000,
    "effects": [
      {
        "type": "change_class",
        "classId": "圣骑士"
      }
    ],
    "desc": "转职为隐藏职业 圣骑士",
    "tags": [
      "tag005"
    ],
    "noGift": true
  },
  "item_i211": {
    "id": "item_i211",
    "name": "魔骑士信物",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 80000,
    "effects": [
      {
        "type": "change_class",
        "classId": "魔骑士"
      }
    ],
    "desc": "转职为隐藏职业 魔骑士",
    "tags": [
      "tag005"
    ],
    "noGift": true
  },
  "item_i212": {
    "id": "item_i212",
    "name": "近战法师信物",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 80000,
    "effects": [
      {
        "type": "change_class",
        "classId": "近战法师"
      }
    ],
    "desc": "转职为隐藏职业 近战法师",
    "tags": [
      "tag005"
    ],
    "noGift": true
  },
  "item_i213": {
    "id": "item_i213",
    "name": "狂人信物",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 80000,
    "effects": [
      {
        "type": "change_class",
        "classId": "狂人"
      }
    ],
    "desc": "转职为隐藏职业 狂人",
    "tags": [
      "tag005"
    ],
    "noGift": true
  },
  "item_i214": {
    "id": "item_i214",
    "name": "飞行家信物",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 80000,
    "effects": [
      {
        "type": "change_class",
        "classId": "飞行家"
      }
    ],
    "desc": "转职为隐藏职业 飞行家",
    "tags": [
      "tag005"
    ],
    "noGift": true
  },
  "item_i215": {
    "id": "item_i215",
    "name": "翼骑士信物",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 80000,
    "effects": [
      {
        "type": "change_class",
        "classId": "翼骑士"
      }
    ],
    "desc": "转职为隐藏职业 翼骑士",
    "tags": [
      "tag005"
    ],
    "noGift": true
  },
  "item_i216": {
    "id": "item_i216",
    "name": "铁浮屠信物",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 80000,
    "effects": [
      {
        "type": "change_class",
        "classId": "铁浮屠"
      }
    ],
    "desc": "转职为隐藏职业 铁浮屠",
    "tags": [
      "tag005"
    ],
    "noGift": true
  },
  "item_i217": {
    "id": "item_i217",
    "name": "驯兽师信物",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 80000,
    "effects": [
      {
        "type": "change_class",
        "classId": "驯兽师"
      }
    ],
    "desc": "转职为隐藏职业 驯兽师",
    "tags": [
      "tag005"
    ],
    "noGift": true
  },
  "item_i301": {
    "id": "item_i301",
    "name": "窥探镜",
    "type": "instant",
    "category": "instant",
    "level": 1,
    "price": 300,
    "effects": [
      {
        "type": "inspect_tile_characters",
        "value": 1
      }
    ],
    "desc": "查看当前地图格角色的体力成长、精神成长、全部被动（职业被动标职业名，个性化被动标“个性化”）",
    "tags": [
      "tag005"
    ],
    "noGift": true
  }
};
Object.assign(EQUIPS, INSTANT_ITEMS);

/* ---- 商店默认出售列表 ---- */
const SHOP_ITEMS = ['item_c001','item_c002','item_c003','item_c004','item_c005','item_c006'];

/* ============================================================
   双手武器集合（依据装备描述：重逾百斤/千斤/比人还高/明确双手）
   统一标记 twoHanded 并补 tag080，穿戴时占用主手+副手双槽
   ============================================================ */
const TWO_HANDED_IDS = [
  'eq_w013','eq_w022','eq_w037','eq_w044',
  'eq_w102','eq_w111','eq_w113','eq_w114'
];
TWO_HANDED_IDS.forEach(id => {
  const tpl = EQUIPS[id];
  if(tpl){
    tpl.twoHanded = true;
    if(tpl.tags.indexOf('tag080') < 0) tpl.tags.push('tag080');
  }
});


/* ============================================================
   装备审计补丁（装备审计.xlsx）
   按审计表重排部位 / 名字 / 等级 / 品阶 / 职业 / 词条。
   本段放在白板模式之前，写入后这些装备即为已设计状态。
   ============================================================ */
const EQUIP_AUDIT_PATCH = {
  "eq_w001": {
    "name": "生锈的铁剑",
    "type": "weapon",
    "slot": "mainHand",
    "level": 1,
    "rarity": "useful",
    "classLimit": [
      "战士",
      "巡警",
      "杀手"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 8
      },
      {
        "type": "crit_up",
        "value": 0.01
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag021",
      "tag017"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w002": {
    "name": "残破的短剑",
    "type": "weapon",
    "slot": "mainHand",
    "level": 1,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警",
      "杀手"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 6
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag021",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w003": {
    "name": "木剑",
    "type": "weapon",
    "slot": "mainHand",
    "level": 2,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 8
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag028",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w004": {
    "name": "竹剑",
    "type": "weapon",
    "slot": "mainHand",
    "level": 2,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警",
      "杀手"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 8
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag028",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w005": {
    "name": "青锋",
    "type": "weapon",
    "slot": "mainHand",
    "level": 3,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 9
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag021",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w006": {
    "name": "弯月",
    "type": "weapon",
    "slot": "mainHand",
    "level": 3,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警",
      "杀手"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 9
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag021",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w007": {
    "name": "铜锋",
    "type": "weapon",
    "slot": "mainHand",
    "level": 4,
    "rarity": "useful",
    "classLimit": [
      "战士",
      "巡警"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 14
      },
      {
        "type": "crit_up",
        "value": 0.011
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag023",
      "tag017"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w008": {
    "name": "骑士锋盔",
    "type": "armor",
    "slot": "head",
    "level": 20,
    "rarity": "epic",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 26
      },
      {
        "type": "maxhp_up",
        "value": 115
      },
      {
        "type": "dodge",
        "value": 0.026
      }
    ],
    "tags": [
      "tag002",
      "tag075",
      "tag083",
      "tag021",
      "tag019"
    ],
    "draft": false,
    "desc": "由「骑士剑」改造而成的防具，保留原有材质与工艺。",
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_w009": {
    "name": "精钢锋盔",
    "type": "armor",
    "slot": "head",
    "level": 20,
    "rarity": "epic",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 26
      },
      {
        "type": "maxhp_up",
        "value": 115
      },
      {
        "type": "dodge",
        "value": 0.026
      }
    ],
    "tags": [
      "tag002",
      "tag075",
      "tag083",
      "tag022",
      "tag019"
    ],
    "draft": false,
    "desc": "由「精钢」改造而成的防具，保留原有材质与工艺。",
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_w010": {
    "name": "双刃锋盔",
    "type": "armor",
    "slot": "head",
    "level": 5,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 5
      }
    ],
    "tags": [
      "tag002",
      "tag075",
      "tag083",
      "tag022",
      "tag015"
    ],
    "draft": false,
    "desc": "由「双刃」改造而成的防具，保留原有材质与工艺。",
    "durability": 60,
    "removeMaxWear": true
  },
  "eq_w011": {
    "name": "细雪锋盔",
    "type": "armor",
    "slot": "head",
    "level": 6,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 6
      }
    ],
    "tags": [
      "tag002",
      "tag075",
      "tag083",
      "tag025",
      "tag015"
    ],
    "draft": false,
    "desc": "由「细雪」改造而成的防具，保留原有材质与工艺。",
    "durability": 72,
    "removeMaxWear": true
  },
  "eq_w012": {
    "name": "刺星锋盔",
    "type": "armor",
    "slot": "head",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 32
      },
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "dodge",
        "value": 0.031
      },
      {
        "type": "crit_up",
        "value": 0.031
      }
    ],
    "tags": [
      "tag002",
      "tag075",
      "tag083",
      "tag018"
    ],
    "draft": false,
    "desc": "由「刺星」改造而成的防具，保留原有材质与工艺。",
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_w013": {
    "name": "玄重锋盔",
    "type": "armor",
    "slot": "head",
    "level": 7,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 7
      }
    ],
    "tags": [
      "tag002",
      "tag075",
      "tag083",
      "tag024",
      "tag015"
    ],
    "draft": false,
    "desc": "由「玄重」改造而成的防具，保留原有材质与工艺。",
    "durability": 84,
    "removeMaxWear": true
  },
  "eq_w014": {
    "name": "寒锋盔",
    "type": "armor",
    "slot": "head",
    "level": 7,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 7
      }
    ],
    "tags": [
      "tag002",
      "tag075",
      "tag083",
      "tag026",
      "tag015"
    ],
    "draft": false,
    "desc": "由「寒锋」改造而成的防具，保留原有材质与工艺。",
    "durability": 84,
    "removeMaxWear": true
  },
  "eq_w015": {
    "name": "烈阳锋盔",
    "type": "armor",
    "slot": "head",
    "level": 8,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 7
      }
    ],
    "tags": [
      "tag002",
      "tag075",
      "tag083",
      "tag057",
      "tag015"
    ],
    "draft": false,
    "desc": "由「烈阳」改造而成的防具，保留原有材质与工艺。",
    "durability": 96,
    "removeMaxWear": true
  },
  "eq_w016": {
    "name": "暗影锋盔",
    "type": "armor",
    "slot": "head",
    "level": 8,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 7
      }
    ],
    "tags": [
      "tag002",
      "tag075",
      "tag083",
      "tag063",
      "tag015"
    ],
    "draft": false,
    "desc": "由「暗影」改造而成的防具，保留原有材质与工艺。",
    "durability": 96,
    "removeMaxWear": true
  },
  "eq_w017": {
    "name": "霜华·锋盔",
    "type": "armor",
    "slot": "head",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 32
      },
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "dodge",
        "value": 0.031
      },
      {
        "type": "crit_up",
        "value": 0.031
      }
    ],
    "tags": [
      "tag002",
      "tag075",
      "tag083",
      "tag058",
      "tag018"
    ],
    "draft": false,
    "desc": "由「霜华」改造而成的防具，保留原有材质与工艺。",
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_w018": {
    "name": "龙牙锋盔",
    "type": "armor",
    "slot": "head",
    "level": 40,
    "rarity": "legend",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 61
      },
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "dodge",
        "value": 0.05
      },
      {
        "type": "crit_up",
        "value": 0.05
      }
    ],
    "tags": [
      "tag002",
      "tag075",
      "tag083",
      "tag030",
      "tag018"
    ],
    "draft": false,
    "desc": "由「龙牙」改造而成的防具，保留原有材质与工艺。",
    "durability": 480,
    "removeMaxWear": true
  },
  "eq_w019": {
    "name": "芬里尔的·锋盔",
    "type": "armor",
    "slot": "head",
    "level": 40,
    "rarity": "legend",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 61
      },
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "dodge",
        "value": 0.05
      },
      {
        "type": "crit_up",
        "value": 0.05
      }
    ],
    "tags": [
      "tag002",
      "tag075",
      "tag083",
      "tag046",
      "tag018"
    ],
    "draft": false,
    "desc": "由「芬里尔的獠牙」改造而成的防具，保留原有材质与工艺。",
    "durability": 480,
    "removeMaxWear": true
  },
  "eq_w020": {
    "name": "巨狼之·锋盔",
    "type": "armor",
    "slot": "head",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 9
      }
    ],
    "tags": [
      "tag002",
      "tag075",
      "tag083",
      "tag046",
      "tag015"
    ],
    "draft": false,
    "desc": "由「巨狼之牙」改造而成的防具，保留原有材质与工艺。",
    "durability": 120,
    "removeMaxWear": true
  },
  "eq_w021": {
    "name": "双头龙之·锋盔",
    "type": "armor",
    "slot": "head",
    "level": 40,
    "rarity": "legend",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 61
      },
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "dodge",
        "value": 0.05
      },
      {
        "type": "crit_up",
        "value": 0.05
      }
    ],
    "tags": [
      "tag002",
      "tag075",
      "tag083",
      "tag050",
      "tag018"
    ],
    "draft": false,
    "desc": "由「双头龙之牙」改造而成的防具，保留原有材质与工艺。",
    "durability": 480,
    "removeMaxWear": true
  },
  "eq_w022": {
    "name": "远古巨兽之牙",
    "type": "weapon",
    "slot": "mainHand",
    "level": 40,
    "rarity": "legend",
    "classLimit": [
      "战士",
      "巡警"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 130
      },
      {
        "type": "crit_up",
        "value": 0.05
      },
      {
        "type": "spd_up",
        "value": 3
      },
      {
        "type": "execute_below",
        "value": 16
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag046",
      "tag018"
    ],
    "draft": false,
    "maxWear": 400,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w023": {
    "name": "双子座·双生",
    "type": "weapon",
    "slot": "mainHand",
    "level": 25,
    "rarity": "legend",
    "classLimit": [
      "战士"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 85
      },
      {
        "type": "crit_up",
        "value": 0.036
      },
      {
        "type": "spd_up",
        "value": 2
      },
      {
        "type": "execute_below",
        "value": 12
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag070",
      "tag018"
    ],
    "draft": false,
    "maxWear": 250,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w024": {
    "name": "剑神的祝福",
    "type": "weapon",
    "slot": "mainHand",
    "level": 40,
    "rarity": "doom",
    "classLimit": [
      "战士"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 151
      },
      {
        "type": "crit_up",
        "value": 0.059
      },
      {
        "type": "spd_up",
        "value": 4
      },
      {
        "type": "execute_below",
        "value": 18
      },
      {
        "type": "hp_drain_pct",
        "value": 7
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag020"
    ],
    "draft": false,
    "maxWear": 400,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w025": {
    "name": "生锈的铁棍",
    "type": "weapon",
    "slot": "mainHand",
    "level": 1,
    "rarity": "useful",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 8
      },
      {
        "type": "crit_up",
        "value": 0.01
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag021",
      "tag017"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w026": {
    "name": "残破的木棍",
    "type": "weapon",
    "slot": "mainHand",
    "level": 1,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警",
      "商人"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 6
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag028",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w027": {
    "name": "长棍",
    "type": "weapon",
    "slot": "mainHand",
    "level": 2,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 8
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag028",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w028": {
    "name": "警棍",
    "type": "weapon",
    "slot": "mainHand",
    "level": 2,
    "rarity": "common",
    "classLimit": [
      "巡警",
      "战士"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 8
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag028",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w029": {
    "name": "铁棍",
    "type": "weapon",
    "slot": "mainHand",
    "level": 3,
    "rarity": "useful",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 12
      },
      {
        "type": "crit_up",
        "value": 0.01
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag021",
      "tag017"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w030": {
    "name": "短棍",
    "type": "weapon",
    "slot": "mainHand",
    "level": 3,
    "rarity": "common",
    "classLimit": [
      "巡警",
      "战士"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 9
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag021",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w031": {
    "name": "铜棍",
    "type": "weapon",
    "slot": "mainHand",
    "level": 4,
    "rarity": "useful",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 14
      },
      {
        "type": "crit_up",
        "value": 0.011
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag023",
      "tag017"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w032": {
    "name": "铁头",
    "type": "weapon",
    "slot": "mainHand",
    "level": 4,
    "rarity": "useful",
    "classLimit": [
      "战士",
      "铁匠"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 14
      },
      {
        "type": "crit_up",
        "value": 0.011
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag021",
      "tag017"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w033": {
    "name": "精钢棍盔",
    "type": "armor",
    "slot": "head",
    "level": 20,
    "rarity": "epic",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 26
      },
      {
        "type": "maxhp_up",
        "value": 115
      },
      {
        "type": "dodge",
        "value": 0.026
      }
    ],
    "tags": [
      "tag002",
      "tag075",
      "tag083",
      "tag022",
      "tag019"
    ],
    "draft": false,
    "desc": "由「精钢」改造而成的防具，保留原有材质与工艺。",
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_w034": {
    "name": "双节棍胸甲",
    "type": "armor",
    "slot": "chest",
    "level": 5,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 5
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag022",
      "tag015"
    ],
    "draft": false,
    "desc": "由「双节」改造而成的防具，保留原有材质与工艺。",
    "durability": 60,
    "removeMaxWear": true
  },
  "eq_w035": {
    "name": "秘银棍胸甲",
    "type": "armor",
    "slot": "chest",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 32
      },
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "def_up_pct",
        "value": 7
      },
      {
        "type": "counter_start",
        "value": 2
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag025",
      "tag018"
    ],
    "draft": false,
    "desc": "由「秘银长棍」改造而成的防具，保留原有材质与工艺。",
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_w036": {
    "name": "软银棍胸甲",
    "type": "armor",
    "slot": "chest",
    "level": 20,
    "rarity": "epic",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 26
      },
      {
        "type": "maxhp_up",
        "value": 115
      },
      {
        "type": "def_up_pct",
        "value": 6
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag025",
      "tag019"
    ],
    "draft": false,
    "desc": "由「软银」改造而成的防具，保留原有材质与工艺。",
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_w037": {
    "name": "玄重棍胸甲",
    "type": "armor",
    "slot": "chest",
    "level": 7,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 7
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag024",
      "tag015"
    ],
    "draft": false,
    "desc": "由「玄重」改造而成的防具，保留原有材质与工艺。",
    "durability": 84,
    "removeMaxWear": true
  },
  "eq_w038": {
    "name": "寒铁棍胸甲",
    "type": "armor",
    "slot": "chest",
    "level": 20,
    "rarity": "epic",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 26
      },
      {
        "type": "maxhp_up",
        "value": 115
      },
      {
        "type": "def_up_pct",
        "value": 6
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag026",
      "tag019"
    ],
    "draft": false,
    "desc": "由「寒铁长棍」改造而成的防具，保留原有材质与工艺。",
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_w039": {
    "name": "雷击棍胸甲",
    "type": "armor",
    "slot": "chest",
    "level": 8,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 7
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag059",
      "tag015"
    ],
    "draft": false,
    "desc": "由「雷击」改造而成的防具，保留原有材质与工艺。",
    "durability": 96,
    "removeMaxWear": true
  },
  "eq_w040": {
    "name": "疾风棍胸甲",
    "type": "armor",
    "slot": "chest",
    "level": 8,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 7
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag060",
      "tag015"
    ],
    "draft": false,
    "desc": "由「疾风」改造而成的防具，保留原有材质与工艺。",
    "durability": 96,
    "removeMaxWear": true
  },
  "eq_w041": {
    "name": "龙筋棍胸甲",
    "type": "armor",
    "slot": "chest",
    "level": 40,
    "rarity": "legend",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 61
      },
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "def_up_pct",
        "value": 11
      },
      {
        "type": "counter_start",
        "value": 3
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag054",
      "tag018"
    ],
    "draft": false,
    "desc": "由「龙筋长棍」改造而成的防具，保留原有材质与工艺。",
    "durability": 480,
    "removeMaxWear": true
  },
  "eq_w042": {
    "name": "星辰棍胸甲",
    "type": "armor",
    "slot": "chest",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 32
      },
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "def_up_pct",
        "value": 7
      },
      {
        "type": "counter_start",
        "value": 2
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag069",
      "tag018"
    ],
    "draft": false,
    "desc": "由「星辰长棍」改造而成的防具，保留原有材质与工艺。",
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_w043": {
    "name": "猛犸的·棍胸甲",
    "type": "armor",
    "slot": "chest",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 9
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag030",
      "tag015"
    ],
    "draft": false,
    "desc": "由「猛犸的骨棒」改造而成的防具，保留原有材质与工艺。",
    "durability": 120,
    "removeMaxWear": true
  },
  "eq_w044": {
    "name": "巨人的·棍护腿",
    "type": "armor",
    "slot": "legs",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 9
      }
    ],
    "tags": [
      "tag002",
      "tag077",
      "tag085",
      "tag030",
      "tag015"
    ],
    "draft": false,
    "desc": "由「巨人的腿骨」改造而成的防具，保留原有材质与工艺。",
    "durability": 120,
    "removeMaxWear": true
  },
  "eq_w045": {
    "name": "天秤座·裁决",
    "type": "weapon",
    "slot": "mainHand",
    "level": 25,
    "rarity": "legend",
    "classLimit": [
      "战士",
      "巡警"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 85
      },
      {
        "type": "crit_up",
        "value": 0.036
      },
      {
        "type": "spd_up",
        "value": 2
      },
      {
        "type": "execute_below",
        "value": 12
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag070",
      "tag018"
    ],
    "draft": false,
    "maxWear": 250,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w046": {
    "name": "雷神的祝福",
    "type": "weapon",
    "slot": "mainHand",
    "level": 40,
    "rarity": "doom",
    "classLimit": [
      "战士"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 151
      },
      {
        "type": "crit_up",
        "value": 0.059
      },
      {
        "type": "spd_up",
        "value": 4
      },
      {
        "type": "execute_below",
        "value": 18
      },
      {
        "type": "hp_drain_pct",
        "value": 7
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag020"
    ],
    "draft": false,
    "maxWear": 400,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w047": {
    "name": "生锈的匕首",
    "type": "weapon",
    "slot": "mainHand",
    "level": 1,
    "rarity": "common",
    "classLimit": [
      "杀手",
      "巡警",
      "商人"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 6
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag021",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w048": {
    "name": "残破的短刃",
    "type": "weapon",
    "slot": "mainHand",
    "level": 1,
    "rarity": "common",
    "classLimit": [
      "杀手",
      "巡警"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 6
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag021",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w049": {
    "name": "木匕",
    "type": "weapon",
    "slot": "mainHand",
    "level": 2,
    "rarity": "common",
    "classLimit": [
      "杀手",
      "巡警",
      "商人"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 8
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag028",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w050": {
    "name": "木镖",
    "type": "weapon",
    "slot": "mainHand",
    "level": 2,
    "rarity": "common",
    "classLimit": [
      "杀手",
      "商人"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 8
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag028",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w051": {
    "name": "铁匕",
    "type": "weapon",
    "slot": "mainHand",
    "level": 3,
    "rarity": "useful",
    "classLimit": [
      "杀手",
      "巡警",
      "商人"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 12
      },
      {
        "type": "crit_up",
        "value": 0.01
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag021",
      "tag017"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w052": {
    "name": "短刃",
    "type": "weapon",
    "slot": "mainHand",
    "level": 3,
    "rarity": "common",
    "classLimit": [
      "杀手",
      "巡警"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 9
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag021",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w053": {
    "name": "铜匕",
    "type": "weapon",
    "slot": "mainHand",
    "level": 4,
    "rarity": "useful",
    "classLimit": [
      "杀手",
      "商人"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 14
      },
      {
        "type": "crit_up",
        "value": 0.011
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag023",
      "tag017"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w054": {
    "name": "刺客",
    "type": "weapon",
    "slot": "mainHand",
    "level": 4,
    "rarity": "common",
    "classLimit": [
      "杀手"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 11
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag021",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w055": {
    "name": "精钢影护腿",
    "type": "armor",
    "slot": "legs",
    "level": 20,
    "rarity": "epic",
    "classLimit": [
      "杀手",
      "巡警",
      "商人"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 26
      },
      {
        "type": "maxhp_up",
        "value": 115
      },
      {
        "type": "spd_up",
        "value": 2
      }
    ],
    "tags": [
      "tag002",
      "tag077",
      "tag085",
      "tag022",
      "tag019"
    ],
    "draft": false,
    "desc": "由「精钢」改造而成的防具，保留原有材质与工艺。",
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_w056": {
    "name": "双匕影护腿",
    "type": "armor",
    "slot": "legs",
    "level": 5,
    "rarity": "common",
    "classLimit": [
      "杀手",
      "巡警",
      "商人"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 5
      }
    ],
    "tags": [
      "tag002",
      "tag077",
      "tag085",
      "tag022",
      "tag015"
    ],
    "draft": false,
    "desc": "由「双匕」改造而成的防具，保留原有材质与工艺。",
    "durability": 60,
    "removeMaxWear": true
  },
  "eq_w057": {
    "name": "秘银影护腿",
    "type": "armor",
    "slot": "legs",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "杀手",
      "巡警",
      "商人"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 32
      },
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "spd_up",
        "value": 2
      },
      {
        "type": "dodge",
        "value": 0.031
      }
    ],
    "tags": [
      "tag002",
      "tag077",
      "tag085",
      "tag025",
      "tag018"
    ],
    "draft": false,
    "desc": "由「秘银」改造而成的防具，保留原有材质与工艺。",
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_w058": {
    "name": "袖剑影护腿",
    "type": "armor",
    "slot": "legs",
    "level": 6,
    "rarity": "common",
    "classLimit": [
      "杀手",
      "巡警",
      "商人"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 6
      }
    ],
    "tags": [
      "tag002",
      "tag077",
      "tag085",
      "tag025",
      "tag015"
    ],
    "draft": false,
    "desc": "由「袖剑」改造而成的防具，保留原有材质与工艺。",
    "durability": 72,
    "removeMaxWear": true
  },
  "eq_w059": {
    "name": "玄匕影护腿",
    "type": "armor",
    "slot": "legs",
    "level": 7,
    "rarity": "common",
    "classLimit": [
      "杀手",
      "巡警",
      "商人"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 7
      }
    ],
    "tags": [
      "tag002",
      "tag077",
      "tag085",
      "tag024",
      "tag015"
    ],
    "draft": false,
    "desc": "由「玄匕」改造而成的防具，保留原有材质与工艺。",
    "durability": 84,
    "removeMaxWear": true
  },
  "eq_w060": {
    "name": "寒匕影护腿",
    "type": "armor",
    "slot": "legs",
    "level": 7,
    "rarity": "common",
    "classLimit": [
      "杀手",
      "巡警",
      "商人"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 7
      }
    ],
    "tags": [
      "tag002",
      "tag077",
      "tag085",
      "tag026",
      "tag015"
    ],
    "draft": false,
    "desc": "由「寒匕」改造而成的防具，保留原有材质与工艺。",
    "durability": 84,
    "removeMaxWear": true
  },
  "eq_w061": {
    "name": "毒牙影护腿",
    "type": "armor",
    "slot": "legs",
    "level": 8,
    "rarity": "common",
    "classLimit": [
      "杀手",
      "巡警",
      "商人"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 7
      }
    ],
    "tags": [
      "tag002",
      "tag077",
      "tag085",
      "tag061",
      "tag015"
    ],
    "draft": false,
    "desc": "由「毒牙」改造而成的防具，保留原有材质与工艺。",
    "durability": 96,
    "removeMaxWear": true
  },
  "eq_w062": {
    "name": "暗影护腿",
    "type": "armor",
    "slot": "legs",
    "level": 8,
    "rarity": "common",
    "classLimit": [
      "杀手",
      "巡警",
      "商人"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 7
      }
    ],
    "tags": [
      "tag002",
      "tag077",
      "tag085",
      "tag063",
      "tag015"
    ],
    "draft": false,
    "desc": "由「暗影」改造而成的防具，保留原有材质与工艺。",
    "durability": 96,
    "removeMaxWear": true
  },
  "eq_w063": {
    "name": "影杀影护腿",
    "type": "armor",
    "slot": "legs",
    "level": 9,
    "rarity": "common",
    "classLimit": [
      "杀手",
      "巡警",
      "商人"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 8
      }
    ],
    "tags": [
      "tag002",
      "tag077",
      "tag085",
      "tag064",
      "tag015"
    ],
    "draft": false,
    "desc": "由「影杀」改造而成的防具，保留原有材质与工艺。",
    "durability": 108,
    "removeMaxWear": true
  },
  "eq_w064": {
    "name": "血刃影护腿",
    "type": "armor",
    "slot": "legs",
    "level": 9,
    "rarity": "common",
    "classLimit": [
      "杀手",
      "巡警",
      "商人"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 8
      }
    ],
    "tags": [
      "tag002",
      "tag077",
      "tag085",
      "tag065",
      "tag015"
    ],
    "draft": false,
    "desc": "由「血刃」改造而成的防具，保留原有材质与工艺。",
    "durability": 108,
    "removeMaxWear": true
  },
  "eq_w065": {
    "name": "蛇王影护腿",
    "type": "armor",
    "slot": "legs",
    "level": 40,
    "rarity": "common",
    "classLimit": [
      "杀手",
      "巡警",
      "商人"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 30
      }
    ],
    "tags": [
      "tag002",
      "tag077",
      "tag085",
      "tag072",
      "tag015"
    ],
    "draft": false,
    "desc": "由「蛇王獠牙」改造而成的防具，保留原有材质与工艺。",
    "durability": 480,
    "removeMaxWear": true
  },
  "eq_w066": {
    "name": "蝎尾毒刺影护腿",
    "type": "armor",
    "slot": "legs",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "杀手",
      "巡警",
      "商人"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 9
      }
    ],
    "tags": [
      "tag002",
      "tag077",
      "tag085",
      "tag015"
    ],
    "draft": false,
    "desc": "由「蝎尾毒刺」改造而成的防具，保留原有材质与工艺。",
    "durability": 120,
    "removeMaxWear": true
  },
  "eq_w067": {
    "name": "巨蟹座·暗杀",
    "type": "weapon",
    "slot": "mainHand",
    "level": 25,
    "rarity": "legend",
    "classLimit": [
      "杀手"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 85
      },
      {
        "type": "crit_up",
        "value": 0.036
      },
      {
        "type": "spd_up",
        "value": 2
      },
      {
        "type": "execute_below",
        "value": 12
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag070",
      "tag018"
    ],
    "draft": false,
    "maxWear": 250,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w068": {
    "name": "刺客之神的祝福",
    "type": "weapon",
    "slot": "mainHand",
    "level": 40,
    "rarity": "doom",
    "classLimit": [
      "杀手"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 151
      },
      {
        "type": "crit_up",
        "value": 0.059
      },
      {
        "type": "spd_up",
        "value": 4
      },
      {
        "type": "execute_below",
        "value": 18
      },
      {
        "type": "hp_drain_pct",
        "value": 7
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag020"
    ],
    "draft": false,
    "maxWear": 400,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w069": {
    "name": "生锈的短杖",
    "type": "weapon",
    "slot": "mainHand",
    "level": 1,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 6
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag021",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w070": {
    "name": "残破的法杖",
    "type": "weapon",
    "slot": "mainHand",
    "level": 1,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 6
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag028",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w071": {
    "name": "学徒",
    "type": "weapon",
    "slot": "mainHand",
    "level": 2,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 8
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag028",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w072": {
    "name": "教习",
    "type": "weapon",
    "slot": "mainHand",
    "level": 2,
    "rarity": "common",
    "classLimit": [
      "法师",
      "疗愈师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 8
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag028",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w073": {
    "name": "铁杖",
    "type": "weapon",
    "slot": "mainHand",
    "level": 3,
    "rarity": "useful",
    "classLimit": [
      "法师",
      "阵法师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 12
      },
      {
        "type": "crit_up",
        "value": 0.01
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag021",
      "tag017"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w074": {
    "name": "灵光",
    "type": "weapon",
    "slot": "mainHand",
    "level": 3,
    "rarity": "common",
    "classLimit": [
      "法师",
      "疗愈师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 9
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag021",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w075": {
    "name": "铜杖",
    "type": "weapon",
    "slot": "mainHand",
    "level": 4,
    "rarity": "useful",
    "classLimit": [
      "法师",
      "阵法师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 14
      },
      {
        "type": "crit_up",
        "value": 0.011
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag023",
      "tag017"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w076": {
    "name": "白杖法印",
    "type": "focus",
    "slot": "offHand",
    "level": 4,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 11
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag043",
      "tag015"
    ],
    "draft": false,
    "desc": "由「白杖」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w077": {
    "name": "精钢法印",
    "type": "focus",
    "slot": "offHand",
    "level": 20,
    "rarity": "epic",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 58
      },
      {
        "type": "maxmp_up",
        "value": 70
      },
      {
        "type": "magic_atk_up_pct",
        "value": 1
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag022",
      "tag019"
    ],
    "draft": false,
    "desc": "由「精钢」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w078": {
    "name": "火杖法印",
    "type": "focus",
    "slot": "offHand",
    "level": 5,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 12
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag022",
      "tag015"
    ],
    "draft": false,
    "desc": "由「火杖」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w079": {
    "name": "秘银法印",
    "type": "focus",
    "slot": "offHand",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 70
      },
      {
        "type": "maxmp_up",
        "value": 84
      },
      {
        "type": "magic_atk_up_pct",
        "value": 1
      },
      {
        "type": "hp_drain_pct",
        "value": 4
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag025",
      "tag018"
    ],
    "draft": false,
    "desc": "由「秘银法杖」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w080": {
    "name": "星杖法印",
    "type": "focus",
    "slot": "offHand",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 70
      },
      {
        "type": "maxmp_up",
        "value": 84
      },
      {
        "type": "magic_atk_up_pct",
        "value": 1
      },
      {
        "type": "hp_drain_pct",
        "value": 4
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag025",
      "tag018"
    ],
    "draft": false,
    "desc": "由「星杖」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w081": {
    "name": "玄杖法印",
    "type": "focus",
    "slot": "offHand",
    "level": 7,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 15
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag024",
      "tag015"
    ],
    "draft": false,
    "desc": "由「玄杖」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w082": {
    "name": "寒杖法印",
    "type": "focus",
    "slot": "offHand",
    "level": 7,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 15
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag026",
      "tag015"
    ],
    "draft": false,
    "desc": "由「寒杖」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w083": {
    "name": "烈焰法印",
    "type": "focus",
    "slot": "offHand",
    "level": 8,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 17
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag057",
      "tag015"
    ],
    "draft": false,
    "desc": "由「烈焰」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w084": {
    "name": "冰霜法印",
    "type": "focus",
    "slot": "offHand",
    "level": 8,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 17
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag058",
      "tag015"
    ],
    "draft": false,
    "desc": "由「冰霜」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w085": {
    "name": "星辰法印",
    "type": "focus",
    "slot": "offHand",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 70
      },
      {
        "type": "maxmp_up",
        "value": 84
      },
      {
        "type": "magic_atk_up_pct",
        "value": 1
      },
      {
        "type": "hp_drain_pct",
        "value": 4
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag069",
      "tag018"
    ],
    "draft": false,
    "desc": "由「星辰法杖」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w086": {
    "name": "龙语法印",
    "type": "focus",
    "slot": "offHand",
    "level": 40,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 130
      },
      {
        "type": "maxmp_up",
        "value": 156
      },
      {
        "type": "magic_atk_up_pct",
        "value": 1
      },
      {
        "type": "hp_drain_pct",
        "value": 6
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag056",
      "tag018"
    ],
    "draft": false,
    "desc": "由「龙语法杖」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w087": {
    "name": "独角兽的角·法印",
    "type": "focus",
    "slot": "offHand",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 20
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag048",
      "tag015"
    ],
    "draft": false,
    "desc": "由「独角兽的角」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w088": {
    "name": "凤羽法印",
    "type": "focus",
    "slot": "offHand",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 20
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag049",
      "tag015"
    ],
    "draft": false,
    "desc": "由「凤羽」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w089": {
    "name": "巨巫法印",
    "type": "focus",
    "slot": "offHand",
    "level": 15,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 27
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag030",
      "tag015"
    ],
    "draft": false,
    "desc": "由「巨巫」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w090": {
    "name": "古树",
    "type": "weapon",
    "slot": "mainHand",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "法师",
      "疗愈师",
      "阵法师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 20
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag028",
      "tag015"
    ],
    "draft": false,
    "maxWear": 100,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w091": {
    "name": "处女座·星辉",
    "type": "weapon",
    "slot": "mainHand",
    "level": 25,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "疗愈师",
      "阵法师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 85
      },
      {
        "type": "crit_up",
        "value": 0.036
      },
      {
        "type": "maxmp_up",
        "value": 102
      },
      {
        "type": "magic_atk_up_pct",
        "value": 1
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag070",
      "tag018"
    ],
    "draft": false,
    "maxWear": 250,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w092": {
    "name": "法神的祝福",
    "type": "weapon",
    "slot": "mainHand",
    "level": 40,
    "rarity": "doom",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 151
      },
      {
        "type": "crit_up",
        "value": 0.059
      },
      {
        "type": "maxmp_up",
        "value": 182
      },
      {
        "type": "magic_atk_up_pct",
        "value": 1
      },
      {
        "type": "first_strike",
        "value": 35
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag020"
    ],
    "draft": false,
    "maxWear": 400,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w093": {
    "name": "生锈的铁锤",
    "type": "weapon",
    "slot": "mainHand",
    "level": 1,
    "rarity": "useful",
    "classLimit": [
      "铁匠",
      "战士",
      "巡警"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 8
      },
      {
        "type": "crit_up",
        "value": 0.01
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag021",
      "tag017"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w094": {
    "name": "残破的锤子",
    "type": "weapon",
    "slot": "mainHand",
    "level": 1,
    "rarity": "common",
    "classLimit": [
      "铁匠",
      "战士"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 6
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag021",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w095": {
    "name": "木锤",
    "type": "weapon",
    "slot": "mainHand",
    "level": 2,
    "rarity": "common",
    "classLimit": [
      "铁匠",
      "战士"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 8
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag028",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w096": {
    "name": "木战锤",
    "type": "weapon",
    "slot": "mainHand",
    "level": 2,
    "rarity": "common",
    "classLimit": [
      "战士",
      "铁匠"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 8
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag028",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w097": {
    "name": "铁锤",
    "type": "weapon",
    "slot": "mainHand",
    "level": 3,
    "rarity": "useful",
    "classLimit": [
      "铁匠",
      "战士"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 12
      },
      {
        "type": "crit_up",
        "value": 0.01
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag021",
      "tag017"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w098": {
    "name": "铁战锤",
    "type": "weapon",
    "slot": "mainHand",
    "level": 3,
    "rarity": "useful",
    "classLimit": [
      "战士",
      "铁匠"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 12
      },
      {
        "type": "crit_up",
        "value": 0.01
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag021",
      "tag017"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w099": {
    "name": "铜锤",
    "type": "weapon",
    "slot": "mainHand",
    "level": 4,
    "rarity": "useful",
    "classLimit": [
      "铁匠",
      "战士"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 14
      },
      {
        "type": "crit_up",
        "value": 0.011
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag023",
      "tag017"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w100": {
    "name": "铁匠锤",
    "type": "weapon",
    "slot": "mainHand",
    "level": 4,
    "rarity": "useful",
    "classLimit": [
      "铁匠"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 14
      },
      {
        "type": "crit_up",
        "value": 0.011
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag021",
      "tag017"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w101": {
    "name": "精钢重护腿",
    "type": "armor",
    "slot": "legs",
    "level": 20,
    "rarity": "epic",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 26
      },
      {
        "type": "maxhp_up",
        "value": 115
      },
      {
        "type": "spd_up",
        "value": 2
      }
    ],
    "tags": [
      "tag002",
      "tag077",
      "tag085",
      "tag022",
      "tag019"
    ],
    "draft": false,
    "desc": "由「精钢」改造而成的防具，保留原有材质与工艺。",
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_w102": {
    "name": "战锤重护腿",
    "type": "armor",
    "slot": "legs",
    "level": 5,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 5
      }
    ],
    "tags": [
      "tag002",
      "tag077",
      "tag085",
      "tag022",
      "tag015"
    ],
    "draft": false,
    "desc": "由「战锤」改造而成的防具，保留原有材质与工艺。",
    "durability": 60,
    "removeMaxWear": true
  },
  "eq_w103": {
    "name": "秘银重护腿",
    "type": "armor",
    "slot": "legs",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 32
      },
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "spd_up",
        "value": 2
      },
      {
        "type": "dodge",
        "value": 0.031
      }
    ],
    "tags": [
      "tag002",
      "tag077",
      "tag085",
      "tag025",
      "tag018"
    ],
    "draft": false,
    "desc": "由「秘银战锤」改造而成的防具，保留原有材质与工艺。",
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_w104": {
    "name": "双锤重护腿",
    "type": "armor",
    "slot": "legs",
    "level": 6,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 6
      }
    ],
    "tags": [
      "tag002",
      "tag077",
      "tag085",
      "tag025",
      "tag015"
    ],
    "draft": false,
    "desc": "由「双锤」改造而成的防具，保留原有材质与工艺。",
    "durability": 72,
    "removeMaxWear": true
  },
  "eq_w105": {
    "name": "玄重护腿",
    "type": "armor",
    "slot": "legs",
    "level": 7,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 7
      }
    ],
    "tags": [
      "tag002",
      "tag077",
      "tag085",
      "tag024",
      "tag015"
    ],
    "draft": false,
    "desc": "由「玄重」改造而成的防具，保留原有材质与工艺。",
    "durability": 84,
    "removeMaxWear": true
  },
  "eq_w106": {
    "name": "寒铁重护腿",
    "type": "armor",
    "slot": "legs",
    "level": 20,
    "rarity": "epic",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 26
      },
      {
        "type": "maxhp_up",
        "value": 115
      },
      {
        "type": "spd_up",
        "value": 2
      }
    ],
    "tags": [
      "tag002",
      "tag077",
      "tag085",
      "tag026",
      "tag019"
    ],
    "draft": false,
    "desc": "由「寒铁战锤」改造而成的防具，保留原有材质与工艺。",
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_w107": {
    "name": "雷锤重护腿",
    "type": "armor",
    "slot": "legs",
    "level": 8,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 7
      }
    ],
    "tags": [
      "tag002",
      "tag077",
      "tag085",
      "tag059",
      "tag015"
    ],
    "draft": false,
    "desc": "由「雷锤」改造而成的防具，保留原有材质与工艺。",
    "durability": 96,
    "removeMaxWear": true
  },
  "eq_w108": {
    "name": "熔岩重靴",
    "type": "armor",
    "slot": "feet",
    "level": 8,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "spd_up",
        "value": 1
      }
    ],
    "tags": [
      "tag002",
      "tag086",
      "tag087",
      "tag057",
      "tag015"
    ],
    "draft": false,
    "desc": "由「熔岩」改造而成的防具，保留原有材质与工艺。",
    "durability": 96,
    "removeMaxWear": true
  },
  "eq_w109": {
    "name": "星辰·重靴",
    "type": "armor",
    "slot": "feet",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "spd_up",
        "value": 2
      },
      {
        "type": "dodge",
        "value": 0.031
      },
      {
        "type": "hit_up",
        "value": 0.031
      },
      {
        "type": "crit_up",
        "value": 0.031
      }
    ],
    "tags": [
      "tag002",
      "tag086",
      "tag087",
      "tag069",
      "tag018"
    ],
    "draft": false,
    "desc": "由「星辰」改造而成的防具，保留原有材质与工艺。",
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_w110": {
    "name": "龙牙重靴",
    "type": "armor",
    "slot": "feet",
    "level": 40,
    "rarity": "legend",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "spd_up",
        "value": 3
      },
      {
        "type": "dodge",
        "value": 0.05
      },
      {
        "type": "hit_up",
        "value": 0.05
      },
      {
        "type": "crit_up",
        "value": 0.05
      }
    ],
    "tags": [
      "tag002",
      "tag086",
      "tag087",
      "tag052",
      "tag018"
    ],
    "draft": false,
    "desc": "由「龙牙」改造而成的防具，保留原有材质与工艺。",
    "durability": 480,
    "removeMaxWear": true
  },
  "eq_w111": {
    "name": "巨锤重靴",
    "type": "armor",
    "slot": "feet",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "spd_up",
        "value": 1
      }
    ],
    "tags": [
      "tag002",
      "tag086",
      "tag087",
      "tag029",
      "tag015"
    ],
    "draft": false,
    "desc": "由「巨锤」改造而成的防具，保留原有材质与工艺。",
    "durability": 120,
    "removeMaxWear": true
  },
  "eq_w112": {
    "name": "陨铁重靴",
    "type": "armor",
    "slot": "feet",
    "level": 15,
    "rarity": "useful",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "spd_up",
        "value": 1
      },
      {
        "type": "dodge",
        "value": 0.018
      }
    ],
    "tags": [
      "tag002",
      "tag086",
      "tag087",
      "tag027",
      "tag017"
    ],
    "draft": false,
    "desc": "由「陨铁战锤」改造而成的防具，保留原有材质与工艺。",
    "durability": 180,
    "removeMaxWear": true
  },
  "eq_w113": {
    "name": "摩羯座·山岳",
    "type": "weapon",
    "slot": "mainHand",
    "level": 25,
    "rarity": "legend",
    "classLimit": [
      "战士",
      "铁匠"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 85
      },
      {
        "type": "crit_up",
        "value": 0.036
      },
      {
        "type": "spd_up",
        "value": 2
      },
      {
        "type": "execute_below",
        "value": 12
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag070",
      "tag018"
    ],
    "draft": false,
    "maxWear": 250,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w114": {
    "name": "雷神的裁决",
    "type": "weapon",
    "slot": "mainHand",
    "level": 40,
    "rarity": "doom",
    "classLimit": [
      "战士",
      "铁匠"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 151
      },
      {
        "type": "crit_up",
        "value": 0.059
      },
      {
        "type": "spd_up",
        "value": 4
      },
      {
        "type": "execute_below",
        "value": 18
      },
      {
        "type": "hp_drain_pct",
        "value": 7
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag020"
    ],
    "draft": false,
    "maxWear": 400,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w115": {
    "name": "生锈的指虎",
    "type": "weapon",
    "slot": "mainHand",
    "level": 1,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警",
      "杀手"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 6
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag021",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w116": {
    "name": "残破的手套",
    "type": "weapon",
    "slot": "mainHand",
    "level": 1,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 6
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag031",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w117": {
    "name": "木拳套",
    "type": "weapon",
    "slot": "mainHand",
    "level": 2,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 8
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag028",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w118": {
    "name": "木护手",
    "type": "weapon",
    "slot": "mainHand",
    "level": 2,
    "rarity": "common",
    "classLimit": [
      "战士",
      "杀手"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 8
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag028",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w119": {
    "name": "铁指虎",
    "type": "weapon",
    "slot": "mainHand",
    "level": 3,
    "rarity": "useful",
    "classLimit": [
      "战士",
      "巡警",
      "杀手"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 12
      },
      {
        "type": "crit_up",
        "value": 0.01
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag021",
      "tag017"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w120": {
    "name": "铁护手",
    "type": "weapon",
    "slot": "mainHand",
    "level": 3,
    "rarity": "useful",
    "classLimit": [
      "战士",
      "铁匠"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 12
      },
      {
        "type": "crit_up",
        "value": 0.01
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag021",
      "tag017"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w121": {
    "name": "铜拳套",
    "type": "weapon",
    "slot": "mainHand",
    "level": 4,
    "rarity": "useful",
    "classLimit": [
      "战士",
      "巡警"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 14
      },
      {
        "type": "crit_up",
        "value": 0.011
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag023",
      "tag017"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w122": {
    "name": "武斗手套",
    "type": "weapon",
    "slot": "mainHand",
    "level": 4,
    "rarity": "common",
    "classLimit": [
      "战士",
      "杀手"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 11
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag031",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w123": {
    "name": "精钢爪靴",
    "type": "armor",
    "slot": "feet",
    "level": 20,
    "rarity": "epic",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "spd_up",
        "value": 2
      },
      {
        "type": "dodge",
        "value": 0.026
      },
      {
        "type": "hit_up",
        "value": 0.026
      }
    ],
    "tags": [
      "tag002",
      "tag086",
      "tag087",
      "tag022",
      "tag019"
    ],
    "draft": false,
    "desc": "由「精钢」改造而成的防具，保留原有材质与工艺。",
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_w124": {
    "name": "精钢护手爪靴",
    "type": "armor",
    "slot": "feet",
    "level": 20,
    "rarity": "epic",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "spd_up",
        "value": 2
      },
      {
        "type": "dodge",
        "value": 0.026
      },
      {
        "type": "hit_up",
        "value": 0.026
      }
    ],
    "tags": [
      "tag002",
      "tag086",
      "tag087",
      "tag022",
      "tag019"
    ],
    "draft": false,
    "desc": "由「精钢护手」改造而成的防具，保留原有材质与工艺。",
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_w125": {
    "name": "秘银爪靴",
    "type": "armor",
    "slot": "feet",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "spd_up",
        "value": 2
      },
      {
        "type": "dodge",
        "value": 0.031
      },
      {
        "type": "hit_up",
        "value": 0.031
      },
      {
        "type": "crit_up",
        "value": 0.031
      }
    ],
    "tags": [
      "tag002",
      "tag086",
      "tag087",
      "tag025",
      "tag018"
    ],
    "draft": false,
    "desc": "由「秘银拳套」改造而成的防具，保留原有材质与工艺。",
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_w126": {
    "name": "秘银护手爪靴",
    "type": "armor",
    "slot": "feet",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "spd_up",
        "value": 2
      },
      {
        "type": "dodge",
        "value": 0.031
      },
      {
        "type": "hit_up",
        "value": 0.031
      },
      {
        "type": "crit_up",
        "value": 0.031
      }
    ],
    "tags": [
      "tag002",
      "tag086",
      "tag087",
      "tag025",
      "tag018"
    ],
    "draft": false,
    "desc": "由「秘银护手」改造而成的防具，保留原有材质与工艺。",
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_w127": {
    "name": "玄铁爪靴",
    "type": "armor",
    "slot": "feet",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "spd_up",
        "value": 2
      },
      {
        "type": "dodge",
        "value": 0.031
      },
      {
        "type": "hit_up",
        "value": 0.031
      },
      {
        "type": "crit_up",
        "value": 0.031
      }
    ],
    "tags": [
      "tag002",
      "tag086",
      "tag087",
      "tag024",
      "tag018"
    ],
    "draft": false,
    "desc": "由「玄铁拳套」改造而成的防具，保留原有材质与工艺。",
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_w128": {
    "name": "寒铁爪靴",
    "type": "armor",
    "slot": "feet",
    "level": 20,
    "rarity": "epic",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "spd_up",
        "value": 2
      },
      {
        "type": "dodge",
        "value": 0.026
      },
      {
        "type": "hit_up",
        "value": 0.026
      }
    ],
    "tags": [
      "tag002",
      "tag086",
      "tag087",
      "tag026",
      "tag019"
    ],
    "draft": false,
    "desc": "由「寒铁拳套」改造而成的防具，保留原有材质与工艺。",
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_w129": {
    "name": "烈焰爪靴",
    "type": "armor",
    "slot": "feet",
    "level": 8,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "spd_up",
        "value": 1
      }
    ],
    "tags": [
      "tag002",
      "tag086",
      "tag087",
      "tag057",
      "tag015"
    ],
    "draft": false,
    "desc": "由「烈焰」改造而成的防具，保留原有材质与工艺。",
    "durability": 96,
    "removeMaxWear": true
  },
  "eq_w130": {
    "name": "冰霜爪靴",
    "type": "armor",
    "slot": "feet",
    "level": 8,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "spd_up",
        "value": 1
      }
    ],
    "tags": [
      "tag002",
      "tag086",
      "tag087",
      "tag058",
      "tag015"
    ],
    "draft": false,
    "desc": "由「冰霜」改造而成的防具，保留原有材质与工艺。",
    "durability": 96,
    "removeMaxWear": true
  },
  "eq_w131": {
    "name": "龙爪靴",
    "type": "armor",
    "slot": "feet",
    "level": 40,
    "rarity": "legend",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "spd_up",
        "value": 3
      },
      {
        "type": "dodge",
        "value": 0.05
      },
      {
        "type": "hit_up",
        "value": 0.05
      },
      {
        "type": "crit_up",
        "value": 0.05
      }
    ],
    "tags": [
      "tag002",
      "tag086",
      "tag087",
      "tag053",
      "tag018"
    ],
    "draft": false,
    "desc": "由「龙爪拳套」改造而成的防具，保留原有材质与工艺。",
    "durability": 480,
    "removeMaxWear": true
  },
  "eq_w132": {
    "name": "星辰爪靴",
    "type": "armor",
    "slot": "feet",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "spd_up",
        "value": 2
      },
      {
        "type": "dodge",
        "value": 0.031
      },
      {
        "type": "hit_up",
        "value": 0.031
      },
      {
        "type": "crit_up",
        "value": 0.031
      }
    ],
    "tags": [
      "tag002",
      "tag086",
      "tag087",
      "tag069",
      "tag018"
    ],
    "draft": false,
    "desc": "由「星辰拳套」改造而成的防具，保留原有材质与工艺。",
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_w133": {
    "name": "巨爪戒指",
    "type": "accessory",
    "slot": "accessory",
    "level": 10,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 39
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "desc": "由「巨爪」改造而成的饰品，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w134": {
    "name": "龙鳞戒指",
    "type": "accessory",
    "slot": "accessory",
    "level": 40,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "maxmp_up",
        "value": 156
      },
      {
        "type": "hit_up",
        "value": 0.05
      },
      {
        "type": "dodge",
        "value": 0.05
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag051",
      "tag018"
    ],
    "draft": false,
    "desc": "由「龙鳞拳套」改造而成的饰品，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w135": {
    "name": "狮子座·王拳",
    "type": "weapon",
    "slot": "mainHand",
    "level": 25,
    "rarity": "legend",
    "classLimit": [
      "战士",
      "巡警"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 85
      },
      {
        "type": "crit_up",
        "value": 0.036
      },
      {
        "type": "spd_up",
        "value": 2
      },
      {
        "type": "execute_below",
        "value": 12
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag070",
      "tag018"
    ],
    "draft": false,
    "maxWear": 250,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w136": {
    "name": "武神的祝福",
    "type": "weapon",
    "slot": "mainHand",
    "level": 40,
    "rarity": "doom",
    "classLimit": [
      "战士"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 151
      },
      {
        "type": "crit_up",
        "value": 0.059
      },
      {
        "type": "spd_up",
        "value": 4
      },
      {
        "type": "execute_below",
        "value": 18
      },
      {
        "type": "hp_drain_pct",
        "value": 7
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag020"
    ],
    "draft": false,
    "maxWear": 400,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w137": {
    "name": "生锈的碎晶",
    "type": "weapon",
    "slot": "mainHand",
    "level": 1,
    "rarity": "common",
    "classLimit": [
      "阵法师",
      "法师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 6
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag043",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w138": {
    "name": "残破的晶石",
    "type": "weapon",
    "slot": "mainHand",
    "level": 1,
    "rarity": "common",
    "classLimit": [
      "阵法师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 6
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag043",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w139": {
    "name": "木盘",
    "type": "weapon",
    "slot": "mainHand",
    "level": 2,
    "rarity": "common",
    "classLimit": [
      "阵法师",
      "法师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 8
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag028",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w140": {
    "name": "木符",
    "type": "weapon",
    "slot": "mainHand",
    "level": 2,
    "rarity": "common",
    "classLimit": [
      "阵法师",
      "疗愈师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 8
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag028",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w141": {
    "name": "铁盘",
    "type": "weapon",
    "slot": "mainHand",
    "level": 3,
    "rarity": "useful",
    "classLimit": [
      "阵法师",
      "法师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 12
      },
      {
        "type": "crit_up",
        "value": 0.01
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag021",
      "tag017"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w142": {
    "name": "铁符",
    "type": "weapon",
    "slot": "mainHand",
    "level": 3,
    "rarity": "useful",
    "classLimit": [
      "阵法师",
      "疗愈师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 12
      },
      {
        "type": "crit_up",
        "value": 0.01
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag021",
      "tag017"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w143": {
    "name": "铜盘",
    "type": "weapon",
    "slot": "mainHand",
    "level": 4,
    "rarity": "useful",
    "classLimit": [
      "阵法师",
      "法师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 14
      },
      {
        "type": "crit_up",
        "value": 0.011
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag023",
      "tag017"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w144": {
    "name": "阵盘",
    "type": "weapon",
    "slot": "mainHand",
    "level": 4,
    "rarity": "common",
    "classLimit": [
      "阵法师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 11
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag029",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w145": {
    "name": "精钢盘印",
    "type": "focus",
    "slot": "offHand",
    "level": 20,
    "rarity": "epic",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 58
      },
      {
        "type": "maxmp_up",
        "value": 70
      },
      {
        "type": "magic_atk_up_pct",
        "value": 1
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag022",
      "tag019"
    ],
    "draft": false,
    "desc": "由「精钢盘」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w146": {
    "name": "精钢晶印",
    "type": "focus",
    "slot": "offHand",
    "level": 20,
    "rarity": "epic",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 58
      },
      {
        "type": "maxmp_up",
        "value": 70
      },
      {
        "type": "magic_atk_up_pct",
        "value": 1
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag022",
      "tag019"
    ],
    "draft": false,
    "desc": "由「精钢晶」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w147": {
    "name": "秘银盘印",
    "type": "focus",
    "slot": "offHand",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 70
      },
      {
        "type": "maxmp_up",
        "value": 84
      },
      {
        "type": "magic_atk_up_pct",
        "value": 1
      },
      {
        "type": "hp_drain_pct",
        "value": 4
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag025",
      "tag018"
    ],
    "draft": false,
    "desc": "由「秘银盘」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w148": {
    "name": "秘银晶印",
    "type": "focus",
    "slot": "offHand",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 70
      },
      {
        "type": "maxmp_up",
        "value": 84
      },
      {
        "type": "magic_atk_up_pct",
        "value": 1
      },
      {
        "type": "hp_drain_pct",
        "value": 4
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag025",
      "tag018"
    ],
    "draft": false,
    "desc": "由「秘银晶」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w149": {
    "name": "玄铁盘印",
    "type": "focus",
    "slot": "offHand",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 70
      },
      {
        "type": "maxmp_up",
        "value": 84
      },
      {
        "type": "magic_atk_up_pct",
        "value": 1
      },
      {
        "type": "hp_drain_pct",
        "value": 4
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag024",
      "tag018"
    ],
    "draft": false,
    "desc": "由「玄铁盘」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w150": {
    "name": "寒铁晶印",
    "type": "focus",
    "slot": "offHand",
    "level": 20,
    "rarity": "epic",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 58
      },
      {
        "type": "maxmp_up",
        "value": 70
      },
      {
        "type": "magic_atk_up_pct",
        "value": 1
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag026",
      "tag019"
    ],
    "draft": false,
    "desc": "由「寒铁晶」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w151": {
    "name": "火晶法印",
    "type": "focus",
    "slot": "offHand",
    "level": 8,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 17
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag057",
      "tag015"
    ],
    "draft": false,
    "desc": "由「火晶」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w152": {
    "name": "冰晶法印",
    "type": "focus",
    "slot": "offHand",
    "level": 8,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 17
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag058",
      "tag015"
    ],
    "draft": false,
    "desc": "由「冰晶」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w153": {
    "name": "星核晶印",
    "type": "focus",
    "slot": "offHand",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 70
      },
      {
        "type": "maxmp_up",
        "value": 84
      },
      {
        "type": "magic_atk_up_pct",
        "value": 1
      },
      {
        "type": "hp_drain_pct",
        "value": 4
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag069",
      "tag018"
    ],
    "draft": false,
    "desc": "由「星核」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w154": {
    "name": "龙晶法印",
    "type": "focus",
    "slot": "offHand",
    "level": 40,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 130
      },
      {
        "type": "maxmp_up",
        "value": 156
      },
      {
        "type": "magic_atk_up_pct",
        "value": 1
      },
      {
        "type": "hp_drain_pct",
        "value": 6
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag055",
      "tag018"
    ],
    "draft": false,
    "desc": "由「龙晶晶石」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w155": {
    "name": "巨兽晶印",
    "type": "focus",
    "slot": "offHand",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 20
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag042",
      "tag015"
    ],
    "draft": false,
    "desc": "由「巨兽晶核」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w156": {
    "name": "龙晶核晶印",
    "type": "focus",
    "slot": "offHand",
    "level": 40,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 130
      },
      {
        "type": "maxmp_up",
        "value": 156
      },
      {
        "type": "magic_atk_up_pct",
        "value": 1
      },
      {
        "type": "hp_drain_pct",
        "value": 6
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag042",
      "tag018"
    ],
    "draft": false,
    "desc": "由「龙晶核」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w157": {
    "name": "射手座·星辰",
    "type": "weapon",
    "slot": "mainHand",
    "level": 25,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 85
      },
      {
        "type": "crit_up",
        "value": 0.036
      },
      {
        "type": "maxmp_up",
        "value": 102
      },
      {
        "type": "magic_atk_up_pct",
        "value": 1
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag070",
      "tag018"
    ],
    "draft": false,
    "maxWear": 250,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w158": {
    "name": "阵神的祝福",
    "type": "weapon",
    "slot": "mainHand",
    "level": 40,
    "rarity": "doom",
    "classLimit": [
      "阵法师",
      "法师",
      "疗愈师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 151
      },
      {
        "type": "crit_up",
        "value": 0.059
      },
      {
        "type": "maxmp_up",
        "value": 182
      },
      {
        "type": "magic_atk_up_pct",
        "value": 1
      },
      {
        "type": "first_strike",
        "value": 35
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag020"
    ],
    "draft": false,
    "maxWear": 400,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w159": {
    "name": "生锈的药剂瓶",
    "type": "weapon",
    "slot": "mainHand",
    "level": 1,
    "rarity": "common",
    "classLimit": [
      "炼金术师",
      "法师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 6
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag021",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w160": {
    "name": "残破的药瓶",
    "type": "weapon",
    "slot": "mainHand",
    "level": 1,
    "rarity": "common",
    "classLimit": [
      "炼金术师",
      "疗愈师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 6
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag043",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w161": {
    "name": "木瓶",
    "type": "weapon",
    "slot": "mainHand",
    "level": 2,
    "rarity": "common",
    "classLimit": [
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 8
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag028",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w162": {
    "name": "木试管",
    "type": "weapon",
    "slot": "mainHand",
    "level": 2,
    "rarity": "common",
    "classLimit": [
      "炼金术师",
      "疗愈师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 8
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag028",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w163": {
    "name": "铁瓶",
    "type": "weapon",
    "slot": "mainHand",
    "level": 3,
    "rarity": "useful",
    "classLimit": [
      "炼金术师",
      "法师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 12
      },
      {
        "type": "crit_up",
        "value": 0.01
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag021",
      "tag017"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w164": {
    "name": "铁烧瓶",
    "type": "weapon",
    "slot": "mainHand",
    "level": 3,
    "rarity": "useful",
    "classLimit": [
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 12
      },
      {
        "type": "crit_up",
        "value": 0.01
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag021",
      "tag017"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w165": {
    "name": "铜瓶",
    "type": "weapon",
    "slot": "mainHand",
    "level": 4,
    "rarity": "useful",
    "classLimit": [
      "炼金术师",
      "法师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 14
      },
      {
        "type": "crit_up",
        "value": 0.011
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag023",
      "tag017"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w166": {
    "name": "炼金瓶",
    "type": "weapon",
    "slot": "mainHand",
    "level": 4,
    "rarity": "common",
    "classLimit": [
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 11
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag043",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w167": {
    "name": "精钢瓶印",
    "type": "focus",
    "slot": "offHand",
    "level": 20,
    "rarity": "epic",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 58
      },
      {
        "type": "maxmp_up",
        "value": 70
      },
      {
        "type": "magic_atk_up_pct",
        "value": 1
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag022",
      "tag019"
    ],
    "draft": false,
    "desc": "由「精钢瓶」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w168": {
    "name": "精钢烧瓶印",
    "type": "focus",
    "slot": "offHand",
    "level": 20,
    "rarity": "epic",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 58
      },
      {
        "type": "maxmp_up",
        "value": 70
      },
      {
        "type": "magic_atk_up_pct",
        "value": 1
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag022",
      "tag019"
    ],
    "draft": false,
    "desc": "由「精钢烧瓶」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w169": {
    "name": "秘银瓶印",
    "type": "focus",
    "slot": "offHand",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 70
      },
      {
        "type": "maxmp_up",
        "value": 84
      },
      {
        "type": "magic_atk_up_pct",
        "value": 1
      },
      {
        "type": "hp_drain_pct",
        "value": 4
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag025",
      "tag018"
    ],
    "draft": false,
    "desc": "由「秘银瓶」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w170": {
    "name": "秘银烧瓶印",
    "type": "focus",
    "slot": "offHand",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 70
      },
      {
        "type": "maxmp_up",
        "value": 84
      },
      {
        "type": "magic_atk_up_pct",
        "value": 1
      },
      {
        "type": "hp_drain_pct",
        "value": 4
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag025",
      "tag018"
    ],
    "draft": false,
    "desc": "由「秘银烧瓶」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w171": {
    "name": "玄铁瓶印",
    "type": "focus",
    "slot": "offHand",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 70
      },
      {
        "type": "maxmp_up",
        "value": 84
      },
      {
        "type": "magic_atk_up_pct",
        "value": 1
      },
      {
        "type": "hp_drain_pct",
        "value": 4
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag024",
      "tag018"
    ],
    "draft": false,
    "desc": "由「玄铁瓶」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w172": {
    "name": "寒铁瓶印",
    "type": "focus",
    "slot": "offHand",
    "level": 20,
    "rarity": "epic",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 58
      },
      {
        "type": "maxmp_up",
        "value": 70
      },
      {
        "type": "magic_atk_up_pct",
        "value": 1
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag026",
      "tag019"
    ],
    "draft": false,
    "desc": "由「寒铁瓶」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w173": {
    "name": "烈焰瓶印",
    "type": "focus",
    "slot": "offHand",
    "level": 8,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 17
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag057",
      "tag015"
    ],
    "draft": false,
    "desc": "由「烈焰瓶」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w174": {
    "name": "冰霜瓶印",
    "type": "focus",
    "slot": "offHand",
    "level": 8,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 17
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag058",
      "tag015"
    ],
    "draft": false,
    "desc": "由「冰霜瓶」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w175": {
    "name": "毒瓶法印",
    "type": "focus",
    "slot": "offHand",
    "level": 9,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 18
      }
    ],
    "tags": [
      "tag003",
      "tag074",
      "tag082",
      "tag061",
      "tag015"
    ],
    "draft": false,
    "desc": "由「毒瓶」改造而成的法器，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w176": {
    "name": "酸瓶法坠",
    "type": "accessory",
    "slot": "accessory",
    "level": 9,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 36
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag062",
      "tag015"
    ],
    "draft": false,
    "desc": "由「酸瓶」改造而成的饰品，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w177": {
    "name": "巨兽毒囊瓶坠",
    "type": "accessory",
    "slot": "accessory",
    "level": 10,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 39
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag061",
      "tag015"
    ],
    "draft": false,
    "desc": "由「巨兽毒囊」改造而成的饰品，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w178": {
    "name": "龙毒瓶坠",
    "type": "accessory",
    "slot": "accessory",
    "level": 40,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "maxmp_up",
        "value": 156
      },
      {
        "type": "hit_up",
        "value": 0.05
      },
      {
        "type": "dodge",
        "value": 0.05
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag061",
      "tag018"
    ],
    "draft": false,
    "desc": "由「龙毒」改造而成的饰品，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w179": {
    "name": "水瓶座·万溶",
    "type": "weapon",
    "slot": "mainHand",
    "level": 25,
    "rarity": "legend",
    "classLimit": [
      "炼金术师",
      "法师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 85
      },
      {
        "type": "crit_up",
        "value": 0.036
      },
      {
        "type": "maxmp_up",
        "value": 102
      },
      {
        "type": "magic_atk_up_pct",
        "value": 1
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag070",
      "tag018"
    ],
    "draft": false,
    "maxWear": 250,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w180": {
    "name": "炼金之神的祝福",
    "type": "weapon",
    "slot": "mainHand",
    "level": 40,
    "rarity": "doom",
    "classLimit": [
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 151
      },
      {
        "type": "crit_up",
        "value": 0.059
      },
      {
        "type": "maxmp_up",
        "value": 182
      },
      {
        "type": "magic_atk_up_pct",
        "value": 1
      },
      {
        "type": "first_strike",
        "value": 35
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag020"
    ],
    "draft": false,
    "maxWear": 400,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w181": {
    "name": "生锈的旧书",
    "type": "weapon",
    "slot": "mainHand",
    "level": 1,
    "rarity": "common",
    "classLimit": [
      "法师",
      "疗愈师",
      "阵法师",
      "商人"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 6
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag036",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w182": {
    "name": "残破的书",
    "type": "weapon",
    "slot": "mainHand",
    "level": 1,
    "rarity": "common",
    "classLimit": [
      "法师",
      "商人"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 6
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag036",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w183": {
    "name": "木封书",
    "type": "weapon",
    "slot": "mainHand",
    "level": 2,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 8
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag028",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w184": {
    "name": "木封法典",
    "type": "weapon",
    "slot": "mainHand",
    "level": 2,
    "rarity": "common",
    "classLimit": [
      "疗愈师",
      "商人"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 8
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag028",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w185": {
    "name": "铁封书",
    "type": "weapon",
    "slot": "mainHand",
    "level": 3,
    "rarity": "useful",
    "classLimit": [
      "法师",
      "阵法师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 12
      },
      {
        "type": "crit_up",
        "value": 0.01
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag021",
      "tag017"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w186": {
    "name": "铁封法典",
    "type": "weapon",
    "slot": "mainHand",
    "level": 3,
    "rarity": "useful",
    "classLimit": [
      "疗愈师",
      "商人"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 12
      },
      {
        "type": "crit_up",
        "value": 0.01
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag021",
      "tag017"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w187": {
    "name": "铜封书",
    "type": "weapon",
    "slot": "mainHand",
    "level": 4,
    "rarity": "useful",
    "classLimit": [
      "法师",
      "阵法师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 14
      },
      {
        "type": "crit_up",
        "value": 0.011
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag023",
      "tag017"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w188": {
    "name": "魔法书",
    "type": "weapon",
    "slot": "mainHand",
    "level": 4,
    "rarity": "common",
    "classLimit": [
      "法师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 11
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag036",
      "tag015"
    ],
    "draft": false,
    "maxWear": 50,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w189": {
    "name": "精钢法典",
    "type": "weapon",
    "slot": "mainHand",
    "level": 20,
    "rarity": "epic",
    "classLimit": [
      "疗愈师",
      "阵法师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 58
      },
      {
        "type": "crit_up",
        "value": 0.026
      },
      {
        "type": "maxmp_up",
        "value": 70
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag022",
      "tag019"
    ],
    "draft": false,
    "maxWear": 200,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w190": {
    "name": "精钢魔典坠",
    "type": "accessory",
    "slot": "accessory",
    "level": 20,
    "rarity": "epic",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 115
      },
      {
        "type": "maxmp_up",
        "value": 70
      },
      {
        "type": "hit_up",
        "value": 0.026
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag022",
      "tag019"
    ],
    "draft": false,
    "desc": "由「精钢魔书」改造而成的饰品，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w191": {
    "name": "秘银魔典坠",
    "type": "accessory",
    "slot": "accessory",
    "level": 20,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "maxmp_up",
        "value": 84
      },
      {
        "type": "hit_up",
        "value": 0.031
      },
      {
        "type": "dodge",
        "value": 0.031
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag025",
      "tag018"
    ],
    "draft": false,
    "desc": "由「秘银魔书」改造而成的饰品，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w192": {
    "name": "秘银魔典坠·2",
    "type": "accessory",
    "slot": "accessory",
    "level": 20,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "maxmp_up",
        "value": 84
      },
      {
        "type": "hit_up",
        "value": 0.031
      },
      {
        "type": "dodge",
        "value": 0.031
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag025",
      "tag018"
    ],
    "draft": false,
    "desc": "由「秘银法典」改造而成的饰品，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w193": {
    "name": "玄铁魔典坠",
    "type": "accessory",
    "slot": "accessory",
    "level": 20,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "maxmp_up",
        "value": 84
      },
      {
        "type": "hit_up",
        "value": 0.031
      },
      {
        "type": "dodge",
        "value": 0.031
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag024",
      "tag018"
    ],
    "draft": false,
    "desc": "由「玄铁魔书」改造而成的饰品，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w194": {
    "name": "寒铁魔典坠",
    "type": "accessory",
    "slot": "accessory",
    "level": 20,
    "rarity": "epic",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 115
      },
      {
        "type": "maxmp_up",
        "value": 70
      },
      {
        "type": "hit_up",
        "value": 0.026
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag026",
      "tag019"
    ],
    "draft": false,
    "desc": "由「寒铁魔书」改造而成的饰品，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w195": {
    "name": "火典魔典坠",
    "type": "accessory",
    "slot": "accessory",
    "level": 8,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 33
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag057",
      "tag015"
    ],
    "draft": false,
    "desc": "由「火典」改造而成的饰品，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w196": {
    "name": "冰典魔典坠",
    "type": "accessory",
    "slot": "accessory",
    "level": 8,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 33
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag058",
      "tag015"
    ],
    "draft": false,
    "desc": "由「冰典」改造而成的饰品，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w197": {
    "name": "星辰护符",
    "type": "accessory",
    "slot": "charm",
    "level": 20,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "hp_drain_pct",
        "value": 4
      },
      {
        "type": "counter_start",
        "value": 2
      },
      {
        "type": "execute_below",
        "value": 11
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag069",
      "tag018"
    ],
    "draft": false,
    "desc": "由「星辰书」改造而成的饰品，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w198": {
    "name": "龙语护符",
    "type": "accessory",
    "slot": "charm",
    "level": 40,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "hp_drain_pct",
        "value": 6
      },
      {
        "type": "counter_start",
        "value": 3
      },
      {
        "type": "execute_below",
        "value": 16
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag056",
      "tag018"
    ],
    "draft": false,
    "desc": "由「龙语书」改造而成的饰品，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w199": {
    "name": "巨龙护符",
    "type": "accessory",
    "slot": "charm",
    "level": 40,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "hp_drain_pct",
        "value": 6
      },
      {
        "type": "counter_start",
        "value": 3
      },
      {
        "type": "execute_below",
        "value": 16
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag050",
      "tag018"
    ],
    "draft": false,
    "desc": "由「巨龙书」改造而成的饰品，保留原有材质与工艺。",
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_w200": {
    "name": "书神的祝福",
    "type": "weapon",
    "slot": "mainHand",
    "level": 40,
    "rarity": "doom",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "商人"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 151
      },
      {
        "type": "crit_up",
        "value": 0.059
      },
      {
        "type": "maxmp_up",
        "value": 182
      },
      {
        "type": "magic_atk_up_pct",
        "value": 1
      },
      {
        "type": "first_strike",
        "value": 35
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag020"
    ],
    "draft": false,
    "maxWear": 400,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w201": {
    "name": "苍穹",
    "type": "weapon",
    "slot": "mainHand",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 20
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag068",
      "tag015"
    ],
    "draft": false,
    "maxWear": 100,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w202": {
    "name": "群星",
    "type": "weapon",
    "slot": "mainHand",
    "level": 33,
    "rarity": "legend",
    "classLimit": [
      "战士",
      "巡警"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 109
      },
      {
        "type": "crit_up",
        "value": 0.044
      },
      {
        "type": "spd_up",
        "value": 3
      },
      {
        "type": "execute_below",
        "value": 14
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag069",
      "tag018"
    ],
    "draft": false,
    "maxWear": 330,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w203": {
    "name": "深渊长剑",
    "type": "weapon",
    "slot": "mainHand",
    "level": 36,
    "rarity": "doom",
    "classLimit": [
      "战士",
      "巡警",
      "杀手"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 137
      },
      {
        "type": "crit_up",
        "value": 0.054
      },
      {
        "type": "spd_up",
        "value": 4
      },
      {
        "type": "execute_below",
        "value": 17
      },
      {
        "type": "hp_drain_pct",
        "value": 7
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag067",
      "tag020"
    ],
    "draft": false,
    "maxWear": 360,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w204": {
    "name": "幽冥",
    "type": "weapon",
    "slot": "mainHand",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 20
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag066",
      "tag015"
    ],
    "draft": false,
    "maxWear": 100,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w205": {
    "name": "天穹",
    "type": "weapon",
    "slot": "mainHand",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 20
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag068",
      "tag015"
    ],
    "draft": false,
    "maxWear": 100,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w206": {
    "name": "星陨",
    "type": "weapon",
    "slot": "mainHand",
    "level": 33,
    "rarity": "legend",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 109
      },
      {
        "type": "crit_up",
        "value": 0.044
      },
      {
        "type": "spd_up",
        "value": 3
      },
      {
        "type": "execute_below",
        "value": 14
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag069",
      "tag018"
    ],
    "draft": false,
    "maxWear": 330,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w207": {
    "name": "幽渊",
    "type": "weapon",
    "slot": "mainHand",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "战士",
      "铁匠"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 20
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag067",
      "tag015"
    ],
    "draft": false,
    "maxWear": 100,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w208": {
    "name": "冥河",
    "type": "weapon",
    "slot": "mainHand",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警",
      "铁匠"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 20
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag066",
      "tag015"
    ],
    "draft": false,
    "maxWear": 100,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w209": {
    "name": "轻云",
    "type": "weapon",
    "slot": "mainHand",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "杀手"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 20
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag068",
      "tag015"
    ],
    "draft": false,
    "maxWear": 100,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w210": {
    "name": "星芒",
    "type": "weapon",
    "slot": "mainHand",
    "level": 33,
    "rarity": "legend",
    "classLimit": [
      "杀手"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 109
      },
      {
        "type": "crit_up",
        "value": 0.044
      },
      {
        "type": "spd_up",
        "value": 3
      },
      {
        "type": "execute_below",
        "value": 14
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag069",
      "tag018"
    ],
    "draft": false,
    "maxWear": 330,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w211": {
    "name": "暗渊",
    "type": "weapon",
    "slot": "mainHand",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "杀手"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 20
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag067",
      "tag015"
    ],
    "draft": false,
    "maxWear": 100,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w212": {
    "name": "幽刃",
    "type": "weapon",
    "slot": "mainHand",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "杀手"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 20
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag066",
      "tag015"
    ],
    "draft": false,
    "maxWear": 100,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w213": {
    "name": "天启",
    "type": "weapon",
    "slot": "mainHand",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 20
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag068",
      "tag015"
    ],
    "draft": false,
    "maxWear": 100,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w214": {
    "name": "星辉",
    "type": "weapon",
    "slot": "mainHand",
    "level": 33,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 109
      },
      {
        "type": "crit_up",
        "value": 0.044
      },
      {
        "type": "maxmp_up",
        "value": 131
      },
      {
        "type": "magic_atk_up_pct",
        "value": 1
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag069",
      "tag018"
    ],
    "draft": false,
    "maxWear": 330,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w215": {
    "name": "沉渊",
    "type": "weapon",
    "slot": "mainHand",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 20
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag067",
      "tag015"
    ],
    "draft": false,
    "maxWear": 100,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w216": {
    "name": "冥界法杖",
    "type": "weapon",
    "slot": "mainHand",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "法师",
      "疗愈师",
      "阵法师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 20
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag066",
      "tag015"
    ],
    "draft": false,
    "maxWear": 100,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w217": {
    "name": "天罚",
    "type": "weapon",
    "slot": "mainHand",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "战士",
      "铁匠"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 20
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag068",
      "tag015"
    ],
    "draft": false,
    "maxWear": 100,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w218": {
    "name": "星裂",
    "type": "weapon",
    "slot": "mainHand",
    "level": 33,
    "rarity": "legend",
    "classLimit": [
      "战士",
      "铁匠"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 109
      },
      {
        "type": "crit_up",
        "value": 0.044
      },
      {
        "type": "spd_up",
        "value": 3
      },
      {
        "type": "execute_below",
        "value": 14
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag069",
      "tag018"
    ],
    "draft": false,
    "maxWear": 330,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w219": {
    "name": "崩渊",
    "type": "weapon",
    "slot": "mainHand",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "战士",
      "铁匠"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 20
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag067",
      "tag015"
    ],
    "draft": false,
    "maxWear": 100,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w220": {
    "name": "冥冥",
    "type": "weapon",
    "slot": "mainHand",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "战士",
      "铁匠"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 20
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag066",
      "tag015"
    ],
    "draft": false,
    "maxWear": 100,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w221": {
    "name": "天武",
    "type": "weapon",
    "slot": "mainHand",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "战士",
      "巡警"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 20
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag068",
      "tag015"
    ],
    "draft": false,
    "maxWear": 100,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w222": {
    "name": "星拳",
    "type": "weapon",
    "slot": "mainHand",
    "level": 33,
    "rarity": "legend",
    "classLimit": [
      "战士",
      "杀手"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 109
      },
      {
        "type": "crit_up",
        "value": 0.044
      },
      {
        "type": "spd_up",
        "value": 3
      },
      {
        "type": "execute_below",
        "value": 14
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag069",
      "tag018"
    ],
    "draft": false,
    "maxWear": 330,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w223": {
    "name": "渊拳",
    "type": "weapon",
    "slot": "mainHand",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "战士",
      "杀手"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 20
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag067",
      "tag015"
    ],
    "draft": false,
    "maxWear": 100,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w224": {
    "name": "冥拳",
    "type": "weapon",
    "slot": "mainHand",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "战士"
    ],
    "words": [
      {
        "type": "phys_atk_up",
        "value": 20
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag066",
      "tag015"
    ],
    "draft": false,
    "maxWear": 100,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w225": {
    "name": "天晶",
    "type": "weapon",
    "slot": "mainHand",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 20
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag068",
      "tag015"
    ],
    "draft": false,
    "maxWear": 100,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w226": {
    "name": "星核",
    "type": "weapon",
    "slot": "mainHand",
    "level": 33,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 109
      },
      {
        "type": "crit_up",
        "value": 0.044
      },
      {
        "type": "maxmp_up",
        "value": 131
      },
      {
        "type": "magic_atk_up_pct",
        "value": 1
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag069",
      "tag018"
    ],
    "draft": false,
    "maxWear": 330,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w227": {
    "name": "渊晶",
    "type": "weapon",
    "slot": "mainHand",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 20
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag067",
      "tag015"
    ],
    "draft": false,
    "maxWear": 100,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w228": {
    "name": "冥晶",
    "type": "weapon",
    "slot": "mainHand",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 20
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag066",
      "tag015"
    ],
    "draft": false,
    "maxWear": 100,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w229": {
    "name": "天露",
    "type": "weapon",
    "slot": "mainHand",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 20
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag068",
      "tag015"
    ],
    "draft": false,
    "maxWear": 100,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w230": {
    "name": "星液",
    "type": "weapon",
    "slot": "mainHand",
    "level": 33,
    "rarity": "legend",
    "classLimit": [
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 109
      },
      {
        "type": "crit_up",
        "value": 0.044
      },
      {
        "type": "maxmp_up",
        "value": 131
      },
      {
        "type": "magic_atk_up_pct",
        "value": 1
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag069",
      "tag018"
    ],
    "draft": false,
    "maxWear": 330,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w231": {
    "name": "渊毒",
    "type": "weapon",
    "slot": "mainHand",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "炼金术师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 20
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag067",
      "tag015"
    ],
    "draft": false,
    "maxWear": 100,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w232": {
    "name": "冥泉",
    "type": "weapon",
    "slot": "mainHand",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "炼金术师",
      "法师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 20
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag066",
      "tag015"
    ],
    "draft": false,
    "maxWear": 100,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w233": {
    "name": "天书",
    "type": "weapon",
    "slot": "mainHand",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 20
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag068",
      "tag015"
    ],
    "draft": false,
    "maxWear": 100,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w234": {
    "name": "星典",
    "type": "weapon",
    "slot": "mainHand",
    "level": 33,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 109
      },
      {
        "type": "crit_up",
        "value": 0.044
      },
      {
        "type": "maxmp_up",
        "value": 131
      },
      {
        "type": "magic_atk_up_pct",
        "value": 1
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag069",
      "tag018"
    ],
    "draft": false,
    "maxWear": 330,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w235": {
    "name": "渊典",
    "type": "weapon",
    "slot": "mainHand",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 20
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag067",
      "tag015"
    ],
    "draft": false,
    "maxWear": 100,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_w236": {
    "name": "冥书",
    "type": "weapon",
    "slot": "mainHand",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "法师",
      "疗愈师",
      "阵法师"
    ],
    "words": [
      {
        "type": "magic_atk_up",
        "value": 20
      }
    ],
    "tags": [
      "tag001",
      "tag073",
      "tag066",
      "tag015"
    ],
    "draft": false,
    "maxWear": 100,
    "twoHanded": false,
    "removeDurability": true
  },
  "eq_s001": {
    "name": "生锈的铜戒指",
    "type": "accessory",
    "slot": "accessory",
    "level": 1,
    "rarity": "useful",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 16
      },
      {
        "type": "maxmp_up",
        "value": 10
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag017"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s002": {
    "name": "残破的木项链",
    "type": "accessory",
    "slot": "accessory",
    "level": 1,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 12
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s003": {
    "name": "铁护符",
    "type": "accessory",
    "slot": "charm",
    "level": 1,
    "rarity": "useful",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 16
      },
      {
        "type": "hp_drain_pct",
        "value": 2
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag017"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s004": {
    "name": "骨耳环",
    "type": "accessory",
    "slot": "accessory",
    "level": 1,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 12
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s005": {
    "name": "皮手镯",
    "type": "accessory",
    "slot": "accessory",
    "level": 1,
    "rarity": "useful",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 16
      },
      {
        "type": "maxmp_up",
        "value": 10
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag017"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s006": {
    "name": "石徽章",
    "type": "accessory",
    "slot": "charm",
    "level": 1,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 12
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s007": {
    "name": "草编腰带",
    "type": "accessory",
    "slot": "charm",
    "level": 1,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 12
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s008": {
    "name": "铜面具",
    "type": "accessory",
    "slot": "accessory",
    "level": 1,
    "rarity": "useful",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 16
      },
      {
        "type": "maxmp_up",
        "value": 10
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag017"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s009": {
    "name": "布头饰",
    "type": "accessory",
    "slot": "accessory",
    "level": 1,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 12
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s010": {
    "name": "铁别针",
    "type": "accessory",
    "slot": "charm",
    "level": 1,
    "rarity": "useful",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 16
      },
      {
        "type": "hp_drain_pct",
        "value": 2
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag017"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s011": {
    "name": "银戒指",
    "type": "accessory",
    "slot": "accessory",
    "level": 20,
    "rarity": "epic",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 115
      },
      {
        "type": "maxmp_up",
        "value": 70
      },
      {
        "type": "hit_up",
        "value": 0.026
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag019"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s012": {
    "name": "水晶项链",
    "type": "accessory",
    "slot": "accessory",
    "level": 2,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 15
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s013": {
    "name": "银护符",
    "type": "accessory",
    "slot": "charm",
    "level": 20,
    "rarity": "epic",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 115
      },
      {
        "type": "hp_drain_pct",
        "value": 4
      },
      {
        "type": "counter_start",
        "value": 1
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag019"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s014": {
    "name": "玉耳环",
    "type": "accessory",
    "slot": "accessory",
    "level": 2,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 15
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s015": {
    "name": "铜手镯",
    "type": "accessory",
    "slot": "accessory",
    "level": 2,
    "rarity": "useful",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 20
      },
      {
        "type": "maxmp_up",
        "value": 13
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag017"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s016": {
    "name": "银徽章",
    "type": "accessory",
    "slot": "charm",
    "level": 20,
    "rarity": "epic",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 115
      },
      {
        "type": "hp_drain_pct",
        "value": 4
      },
      {
        "type": "counter_start",
        "value": 1
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag019"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s017": {
    "name": "皮腰带",
    "type": "accessory",
    "slot": "charm",
    "level": 2,
    "rarity": "useful",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 20
      },
      {
        "type": "hp_drain_pct",
        "value": 2
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag017"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s018": {
    "name": "银面具",
    "type": "accessory",
    "slot": "accessory",
    "level": 20,
    "rarity": "epic",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 115
      },
      {
        "type": "maxmp_up",
        "value": 70
      },
      {
        "type": "hit_up",
        "value": 0.026
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag019"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s019": {
    "name": "银头饰",
    "type": "accessory",
    "slot": "accessory",
    "level": 20,
    "rarity": "epic",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 115
      },
      {
        "type": "maxmp_up",
        "value": 70
      },
      {
        "type": "hit_up",
        "value": 0.026
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag019"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s020": {
    "name": "铜别针",
    "type": "accessory",
    "slot": "charm",
    "level": 2,
    "rarity": "useful",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 20
      },
      {
        "type": "hp_drain_pct",
        "value": 2
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag017"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s021": {
    "name": "金戒指",
    "type": "accessory",
    "slot": "accessory",
    "level": 3,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 18
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s022": {
    "name": "秘银项链",
    "type": "accessory",
    "slot": "accessory",
    "level": 20,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "maxmp_up",
        "value": 84
      },
      {
        "type": "hit_up",
        "value": 0.031
      },
      {
        "type": "dodge",
        "value": 0.031
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s023": {
    "name": "钢护符",
    "type": "accessory",
    "slot": "charm",
    "level": 20,
    "rarity": "epic",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 115
      },
      {
        "type": "hp_drain_pct",
        "value": 4
      },
      {
        "type": "counter_start",
        "value": 1
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag019"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s024": {
    "name": "玛瑙耳环",
    "type": "accessory",
    "slot": "accessory",
    "level": 3,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 18
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s025": {
    "name": "银手镯",
    "type": "accessory",
    "slot": "accessory",
    "level": 20,
    "rarity": "epic",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 115
      },
      {
        "type": "maxmp_up",
        "value": 70
      },
      {
        "type": "hit_up",
        "value": 0.026
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag019"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s026": {
    "name": "金徽章",
    "type": "accessory",
    "slot": "charm",
    "level": 3,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 18
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s027": {
    "name": "铁扣腰带",
    "type": "accessory",
    "slot": "charm",
    "level": 3,
    "rarity": "useful",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 24
      },
      {
        "type": "hp_drain_pct",
        "value": 2
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag017"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s028": {
    "name": "黑铁面具",
    "type": "accessory",
    "slot": "accessory",
    "level": 3,
    "rarity": "useful",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 24
      },
      {
        "type": "maxmp_up",
        "value": 15
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag017"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s029": {
    "name": "金头饰",
    "type": "accessory",
    "slot": "accessory",
    "level": 3,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 18
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s030": {
    "name": "银算珠",
    "type": "accessory",
    "slot": "charm",
    "level": 20,
    "rarity": "epic",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 115
      },
      {
        "type": "hp_drain_pct",
        "value": 4
      },
      {
        "type": "counter_start",
        "value": 1
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag019"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s031": {
    "name": "翡翠戒指",
    "type": "accessory",
    "slot": "accessory",
    "level": 4,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 21
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s032": {
    "name": "星辉项链",
    "type": "accessory",
    "slot": "accessory",
    "level": 20,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "maxmp_up",
        "value": 84
      },
      {
        "type": "hit_up",
        "value": 0.031
      },
      {
        "type": "dodge",
        "value": 0.031
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s033": {
    "name": "玄铁护符",
    "type": "accessory",
    "slot": "charm",
    "level": 20,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "hp_drain_pct",
        "value": 4
      },
      {
        "type": "counter_start",
        "value": 2
      },
      {
        "type": "execute_below",
        "value": 11
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s034": {
    "name": "琥珀耳环",
    "type": "accessory",
    "slot": "accessory",
    "level": 4,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 21
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s035": {
    "name": "玉手镯",
    "type": "accessory",
    "slot": "accessory",
    "level": 4,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 21
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s036": {
    "name": "翡翠徽章",
    "type": "accessory",
    "slot": "charm",
    "level": 4,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 21
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s037": {
    "name": "铜扣腰带",
    "type": "accessory",
    "slot": "charm",
    "level": 4,
    "rarity": "useful",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 28
      },
      {
        "type": "hp_drain_pct",
        "value": 2
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag017"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s038": {
    "name": "暗影面具",
    "type": "accessory",
    "slot": "accessory",
    "level": 4,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 21
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s039": {
    "name": "星辉头饰",
    "type": "accessory",
    "slot": "accessory",
    "level": 20,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "maxmp_up",
        "value": 84
      },
      {
        "type": "hit_up",
        "value": 0.031
      },
      {
        "type": "dodge",
        "value": 0.031
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s040": {
    "name": "金算珠",
    "type": "accessory",
    "slot": "charm",
    "level": 4,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 21
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s041": {
    "name": "精钢戒指",
    "type": "accessory",
    "slot": "accessory",
    "level": 20,
    "rarity": "epic",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 115
      },
      {
        "type": "maxmp_up",
        "value": 70
      },
      {
        "type": "hit_up",
        "value": 0.026
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag019"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s042": {
    "name": "星辰项链",
    "type": "accessory",
    "slot": "accessory",
    "level": 20,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "maxmp_up",
        "value": 84
      },
      {
        "type": "hit_up",
        "value": 0.031
      },
      {
        "type": "dodge",
        "value": 0.031
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s043": {
    "name": "龙鳞护符",
    "type": "accessory",
    "slot": "charm",
    "level": 40,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "hp_drain_pct",
        "value": 6
      },
      {
        "type": "counter_start",
        "value": 3
      },
      {
        "type": "execute_below",
        "value": 16
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s044": {
    "name": "翡翠耳环",
    "type": "accessory",
    "slot": "accessory",
    "level": 5,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 24
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s045": {
    "name": "白玉手镯",
    "type": "accessory",
    "slot": "accessory",
    "level": 5,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 24
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s046": {
    "name": "紫檀徽章",
    "type": "accessory",
    "slot": "charm",
    "level": 5,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 24
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s047": {
    "name": "银扣腰带",
    "type": "accessory",
    "slot": "charm",
    "level": 20,
    "rarity": "epic",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 115
      },
      {
        "type": "hp_drain_pct",
        "value": 4
      },
      {
        "type": "counter_start",
        "value": 1
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag019"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s048": {
    "name": "影杀面具",
    "type": "accessory",
    "slot": "accessory",
    "level": 5,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 24
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s049": {
    "name": "星辰头饰",
    "type": "accessory",
    "slot": "accessory",
    "level": 20,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "maxmp_up",
        "value": 84
      },
      {
        "type": "hit_up",
        "value": 0.031
      },
      {
        "type": "dodge",
        "value": 0.031
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s050": {
    "name": "玉算珠",
    "type": "accessory",
    "slot": "charm",
    "level": 5,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 24
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s051": {
    "name": "寒铁戒指",
    "type": "accessory",
    "slot": "accessory",
    "level": 20,
    "rarity": "epic",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 115
      },
      {
        "type": "maxmp_up",
        "value": 70
      },
      {
        "type": "hit_up",
        "value": 0.026
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag019"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s052": {
    "name": "星月项链",
    "type": "accessory",
    "slot": "accessory",
    "level": 20,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "maxmp_up",
        "value": 84
      },
      {
        "type": "hit_up",
        "value": 0.031
      },
      {
        "type": "dodge",
        "value": 0.031
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s053": {
    "name": "陨铁护符",
    "type": "accessory",
    "slot": "charm",
    "level": 6,
    "rarity": "useful",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 36
      },
      {
        "type": "hp_drain_pct",
        "value": 2
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag017"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s054": {
    "name": "龙鳞耳环",
    "type": "accessory",
    "slot": "accessory",
    "level": 40,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "maxmp_up",
        "value": 156
      },
      {
        "type": "hit_up",
        "value": 0.05
      },
      {
        "type": "dodge",
        "value": 0.05
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s055": {
    "name": "星辰手镯",
    "type": "accessory",
    "slot": "accessory",
    "level": 20,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "maxmp_up",
        "value": 84
      },
      {
        "type": "hit_up",
        "value": 0.031
      },
      {
        "type": "dodge",
        "value": 0.031
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s056": {
    "name": "龙血徽章",
    "type": "accessory",
    "slot": "charm",
    "level": 40,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "hp_drain_pct",
        "value": 6
      },
      {
        "type": "counter_start",
        "value": 3
      },
      {
        "type": "execute_below",
        "value": 16
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s057": {
    "name": "金扣腰带",
    "type": "accessory",
    "slot": "charm",
    "level": 6,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 27
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s058": {
    "name": "幽冥面具",
    "type": "accessory",
    "slot": "accessory",
    "level": 6,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 27
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s059": {
    "name": "星月头饰",
    "type": "accessory",
    "slot": "accessory",
    "level": 20,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "maxmp_up",
        "value": 84
      },
      {
        "type": "hit_up",
        "value": 0.031
      },
      {
        "type": "dodge",
        "value": 0.031
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s060": {
    "name": "龙鳞算珠",
    "type": "accessory",
    "slot": "charm",
    "level": 40,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "hp_drain_pct",
        "value": 6
      },
      {
        "type": "counter_start",
        "value": 3
      },
      {
        "type": "execute_below",
        "value": 16
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s061": {
    "name": "玄铁戒指",
    "type": "accessory",
    "slot": "accessory",
    "level": 20,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "maxmp_up",
        "value": 84
      },
      {
        "type": "hit_up",
        "value": 0.031
      },
      {
        "type": "dodge",
        "value": 0.031
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s062": {
    "name": "元素项链",
    "type": "accessory",
    "slot": "accessory",
    "level": 7,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 30
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s063": {
    "name": "泰坦护符",
    "type": "accessory",
    "slot": "charm",
    "level": 7,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 30
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s064": {
    "name": "天使耳环",
    "type": "accessory",
    "slot": "accessory",
    "level": 7,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 30
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s065": {
    "name": "九宫手镯",
    "type": "accessory",
    "slot": "accessory",
    "level": 7,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 30
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s066": {
    "name": "星辰徽章",
    "type": "accessory",
    "slot": "charm",
    "level": 20,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "hp_drain_pct",
        "value": 4
      },
      {
        "type": "counter_start",
        "value": 2
      },
      {
        "type": "execute_below",
        "value": 11
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s067": {
    "name": "龙筋腰带",
    "type": "accessory",
    "slot": "charm",
    "level": 40,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "hp_drain_pct",
        "value": 6
      },
      {
        "type": "counter_start",
        "value": 3
      },
      {
        "type": "execute_below",
        "value": 16
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s068": {
    "name": "幻影面具",
    "type": "accessory",
    "slot": "accessory",
    "level": 7,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 30
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s069": {
    "name": "元素头饰",
    "type": "accessory",
    "slot": "accessory",
    "level": 7,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 30
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s070": {
    "name": "命运算珠",
    "type": "accessory",
    "slot": "charm",
    "level": 7,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 30
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s071": {
    "name": "火纹戒指",
    "type": "accessory",
    "slot": "accessory",
    "level": 8,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 33
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s072": {
    "name": "冰纹项链",
    "type": "accessory",
    "slot": "accessory",
    "level": 8,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 33
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s073": {
    "name": "雷纹护符",
    "type": "accessory",
    "slot": "charm",
    "level": 8,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 33
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s074": {
    "name": "暗纹耳环",
    "type": "accessory",
    "slot": "accessory",
    "level": 8,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 33
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s075": {
    "name": "星纹手镯",
    "type": "accessory",
    "slot": "accessory",
    "level": 20,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "maxmp_up",
        "value": 84
      },
      {
        "type": "hit_up",
        "value": 0.031
      },
      {
        "type": "dodge",
        "value": 0.031
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s076": {
    "name": "光纹徽章",
    "type": "accessory",
    "slot": "charm",
    "level": 8,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 33
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s077": {
    "name": "龙纹腰带",
    "type": "accessory",
    "slot": "charm",
    "level": 40,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "hp_drain_pct",
        "value": 6
      },
      {
        "type": "counter_start",
        "value": 3
      },
      {
        "type": "execute_below",
        "value": 16
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s078": {
    "name": "暗影面具",
    "type": "accessory",
    "slot": "accessory",
    "level": 8,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 33
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s079": {
    "name": "星辉头饰",
    "type": "accessory",
    "slot": "accessory",
    "level": 20,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "maxmp_up",
        "value": 84
      },
      {
        "type": "hit_up",
        "value": 0.031
      },
      {
        "type": "dodge",
        "value": 0.031
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s080": {
    "name": "天机算珠",
    "type": "accessory",
    "slot": "charm",
    "level": 8,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 33
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s081": {
    "name": "龙鳞戒指",
    "type": "accessory",
    "slot": "accessory",
    "level": 40,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "maxmp_up",
        "value": 156
      },
      {
        "type": "hit_up",
        "value": 0.05
      },
      {
        "type": "dodge",
        "value": 0.05
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s082": {
    "name": "星辉项链",
    "type": "accessory",
    "slot": "accessory",
    "level": 20,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "maxmp_up",
        "value": 84
      },
      {
        "type": "hit_up",
        "value": 0.031
      },
      {
        "type": "dodge",
        "value": 0.031
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s083": {
    "name": "龙血护符",
    "type": "accessory",
    "slot": "charm",
    "level": 40,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "hp_drain_pct",
        "value": 6
      },
      {
        "type": "counter_start",
        "value": 3
      },
      {
        "type": "execute_below",
        "value": 16
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s084": {
    "name": "圣光耳环",
    "type": "accessory",
    "slot": "accessory",
    "level": 9,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 36
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s085": {
    "name": "九宫手镯",
    "type": "accessory",
    "slot": "accessory",
    "level": 9,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 36
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s086": {
    "name": "龙纹徽章",
    "type": "accessory",
    "slot": "charm",
    "level": 40,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "hp_drain_pct",
        "value": 6
      },
      {
        "type": "counter_start",
        "value": 3
      },
      {
        "type": "execute_below",
        "value": 16
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s087": {
    "name": "龙筋腰带",
    "type": "accessory",
    "slot": "charm",
    "level": 40,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "hp_drain_pct",
        "value": 6
      },
      {
        "type": "counter_start",
        "value": 3
      },
      {
        "type": "execute_below",
        "value": 16
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s088": {
    "name": "暗影面具",
    "type": "accessory",
    "slot": "accessory",
    "level": 9,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 36
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s089": {
    "name": "星辉头饰",
    "type": "accessory",
    "slot": "accessory",
    "level": 20,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "maxmp_up",
        "value": 84
      },
      {
        "type": "hit_up",
        "value": 0.031
      },
      {
        "type": "dodge",
        "value": 0.031
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s090": {
    "name": "因果算珠",
    "type": "accessory",
    "slot": "charm",
    "level": 9,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 36
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s091": {
    "name": "芬里尔之牙",
    "type": "accessory",
    "slot": "accessory",
    "level": 40,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "maxmp_up",
        "value": 156
      },
      {
        "type": "hit_up",
        "value": 0.05
      },
      {
        "type": "dodge",
        "value": 0.05
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s092": {
    "name": "凤凰之羽",
    "type": "accessory",
    "slot": "accessory",
    "level": 10,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 39
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s093": {
    "name": "独角兽之角",
    "type": "accessory",
    "slot": "charm",
    "level": 10,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 39
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s094": {
    "name": "龙鳞",
    "type": "accessory",
    "slot": "accessory",
    "level": 40,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "maxmp_up",
        "value": 156
      },
      {
        "type": "hit_up",
        "value": 0.05
      },
      {
        "type": "dodge",
        "value": 0.05
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s095": {
    "name": "龙筋",
    "type": "accessory",
    "slot": "accessory",
    "level": 40,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "maxmp_up",
        "value": 156
      },
      {
        "type": "hit_up",
        "value": 0.05
      },
      {
        "type": "dodge",
        "value": 0.05
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s096": {
    "name": "猛犸之牙",
    "type": "accessory",
    "slot": "charm",
    "level": 10,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 39
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s097": {
    "name": "麒麟之血",
    "type": "accessory",
    "slot": "charm",
    "level": 10,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 39
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s098": {
    "name": "凤凰之泪",
    "type": "accessory",
    "slot": "accessory",
    "level": 10,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 39
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s099": {
    "name": "星辰之核",
    "type": "accessory",
    "slot": "accessory",
    "level": 20,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "maxmp_up",
        "value": 84
      },
      {
        "type": "hit_up",
        "value": 0.031
      },
      {
        "type": "dodge",
        "value": 0.031
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s100": {
    "name": "巨龙之眼",
    "type": "accessory",
    "slot": "charm",
    "level": 40,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "hp_drain_pct",
        "value": 6
      },
      {
        "type": "counter_start",
        "value": 3
      },
      {
        "type": "execute_below",
        "value": 16
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s101": {
    "name": "双头龙牙",
    "type": "accessory",
    "slot": "accessory",
    "level": 40,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "maxmp_up",
        "value": 156
      },
      {
        "type": "hit_up",
        "value": 0.05
      },
      {
        "type": "dodge",
        "value": 0.05
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s102": {
    "name": "巨龙鳞链",
    "type": "accessory",
    "slot": "accessory",
    "level": 40,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "maxmp_up",
        "value": 156
      },
      {
        "type": "hit_up",
        "value": 0.05
      },
      {
        "type": "dodge",
        "value": 0.05
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s103": {
    "name": "雷鸟羽符",
    "type": "accessory",
    "slot": "charm",
    "level": 15,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 54
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s104": {
    "name": "麒麟角环",
    "type": "accessory",
    "slot": "accessory",
    "level": 15,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 54
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s105": {
    "name": "凤凰心镯",
    "type": "accessory",
    "slot": "accessory",
    "level": 15,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 54
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s106": {
    "name": "远古兽牙徽",
    "type": "accessory",
    "slot": "charm",
    "level": 40,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "hp_drain_pct",
        "value": 6
      },
      {
        "type": "counter_start",
        "value": 3
      },
      {
        "type": "execute_below",
        "value": 16
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s107": {
    "name": "龙心腰带",
    "type": "accessory",
    "slot": "charm",
    "level": 40,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "hp_drain_pct",
        "value": 6
      },
      {
        "type": "counter_start",
        "value": 3
      },
      {
        "type": "execute_below",
        "value": 16
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s108": {
    "name": "独角兽之血",
    "type": "accessory",
    "slot": "accessory",
    "level": 15,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 54
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s109": {
    "name": "远古星核",
    "type": "accessory",
    "slot": "accessory",
    "level": 40,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "maxmp_up",
        "value": 156
      },
      {
        "type": "hit_up",
        "value": 0.05
      },
      {
        "type": "dodge",
        "value": 0.05
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s110": {
    "name": "远古龙眼",
    "type": "accessory",
    "slot": "charm",
    "level": 40,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "hp_drain_pct",
        "value": 6
      },
      {
        "type": "counter_start",
        "value": 3
      },
      {
        "type": "execute_below",
        "value": 16
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s111": {
    "name": "青龙鳞戒",
    "type": "accessory",
    "slot": "accessory",
    "level": 40,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "maxmp_up",
        "value": 156
      },
      {
        "type": "hit_up",
        "value": 0.05
      },
      {
        "type": "dodge",
        "value": 0.05
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s112": {
    "name": "白虎牙链",
    "type": "accessory",
    "slot": "accessory",
    "level": 10,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 39
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s113": {
    "name": "玄武甲符",
    "type": "accessory",
    "slot": "charm",
    "level": 10,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 39
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s114": {
    "name": "朱雀羽环",
    "type": "accessory",
    "slot": "accessory",
    "level": 10,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 39
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s115": {
    "name": "麒麟角镯",
    "type": "accessory",
    "slot": "accessory",
    "level": 10,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 39
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s116": {
    "name": "凤凰心徽",
    "type": "accessory",
    "slot": "charm",
    "level": 10,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 39
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s117": {
    "name": "远古龙牙带",
    "type": "accessory",
    "slot": "charm",
    "level": 40,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "hp_drain_pct",
        "value": 6
      },
      {
        "type": "counter_start",
        "value": 3
      },
      {
        "type": "execute_below",
        "value": 16
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s118": {
    "name": "远古龙血面",
    "type": "accessory",
    "slot": "accessory",
    "level": 40,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "maxmp_up",
        "value": 156
      },
      {
        "type": "hit_up",
        "value": 0.05
      },
      {
        "type": "dodge",
        "value": 0.05
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s119": {
    "name": "远古星核饰",
    "type": "accessory",
    "slot": "accessory",
    "level": 40,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "maxmp_up",
        "value": 156
      },
      {
        "type": "hit_up",
        "value": 0.05
      },
      {
        "type": "dodge",
        "value": 0.05
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s120": {
    "name": "远古兽心珠",
    "type": "accessory",
    "slot": "charm",
    "level": 40,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "hp_drain_pct",
        "value": 6
      },
      {
        "type": "counter_start",
        "value": 3
      },
      {
        "type": "execute_below",
        "value": 16
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s121": {
    "name": "处女座·星玉",
    "type": "accessory",
    "slot": "accessory",
    "level": 25,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 168
      },
      {
        "type": "maxmp_up",
        "value": 102
      },
      {
        "type": "hit_up",
        "value": 0.036
      },
      {
        "type": "dodge",
        "value": 0.036
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s122": {
    "name": "狮子座·狮心",
    "type": "accessory",
    "slot": "accessory",
    "level": 25,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 168
      },
      {
        "type": "maxmp_up",
        "value": 102
      },
      {
        "type": "hit_up",
        "value": 0.036
      },
      {
        "type": "dodge",
        "value": 0.036
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s123": {
    "name": "射手座·箭星",
    "type": "accessory",
    "slot": "charm",
    "level": 25,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 168
      },
      {
        "type": "hp_drain_pct",
        "value": 5
      },
      {
        "type": "counter_start",
        "value": 2
      },
      {
        "type": "execute_below",
        "value": 12
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s124": {
    "name": "水瓶座·流晶",
    "type": "accessory",
    "slot": "accessory",
    "level": 25,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 168
      },
      {
        "type": "maxmp_up",
        "value": 102
      },
      {
        "type": "hit_up",
        "value": 0.036
      },
      {
        "type": "dodge",
        "value": 0.036
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s125": {
    "name": "双子座·双环",
    "type": "accessory",
    "slot": "accessory",
    "level": 25,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 168
      },
      {
        "type": "maxmp_up",
        "value": 102
      },
      {
        "type": "hit_up",
        "value": 0.036
      },
      {
        "type": "dodge",
        "value": 0.036
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s126": {
    "name": "巨蟹座·护壳",
    "type": "accessory",
    "slot": "charm",
    "level": 25,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 168
      },
      {
        "type": "hp_drain_pct",
        "value": 5
      },
      {
        "type": "counter_start",
        "value": 2
      },
      {
        "type": "execute_below",
        "value": 12
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s127": {
    "name": "星辉",
    "type": "accessory",
    "slot": "accessory",
    "level": 30,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 198
      },
      {
        "type": "maxmp_up",
        "value": 120
      },
      {
        "type": "hit_up",
        "value": 0.041
      },
      {
        "type": "dodge",
        "value": 0.041
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s128": {
    "name": "月华",
    "type": "accessory",
    "slot": "accessory",
    "level": 10,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 39
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s129": {
    "name": "日冕",
    "type": "accessory",
    "slot": "charm",
    "level": 10,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 39
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s130": {
    "name": "星河",
    "type": "accessory",
    "slot": "accessory",
    "level": 30,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 198
      },
      {
        "type": "maxmp_up",
        "value": 120
      },
      {
        "type": "hit_up",
        "value": 0.041
      },
      {
        "type": "dodge",
        "value": 0.041
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s131": {
    "name": "云影",
    "type": "accessory",
    "slot": "accessory",
    "level": 10,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 39
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s132": {
    "name": "风铃",
    "type": "accessory",
    "slot": "charm",
    "level": 10,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 39
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s133": {
    "name": "幽影",
    "type": "accessory",
    "slot": "accessory",
    "level": 10,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 39
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s134": {
    "name": "冥光",
    "type": "accessory",
    "slot": "accessory",
    "level": 10,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 39
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s135": {
    "name": "暗河",
    "type": "accessory",
    "slot": "charm",
    "level": 10,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 39
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s136": {
    "name": "黄沙",
    "type": "accessory",
    "slot": "accessory",
    "level": 10,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 39
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s137": {
    "name": "阴风",
    "type": "accessory",
    "slot": "accessory",
    "level": 10,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 39
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s138": {
    "name": "鬼火",
    "type": "accessory",
    "slot": "charm",
    "level": 10,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 39
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s139": {
    "name": "永恒之环",
    "type": "accessory",
    "slot": "accessory",
    "level": 10,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 39
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s140": {
    "name": "命运之链",
    "type": "accessory",
    "slot": "accessory",
    "level": 10,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 39
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s141": {
    "name": "星辰之泪",
    "type": "accessory",
    "slot": "charm",
    "level": 30,
    "rarity": "legend",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 198
      },
      {
        "type": "hp_drain_pct",
        "value": 5
      },
      {
        "type": "counter_start",
        "value": 2
      },
      {
        "type": "execute_below",
        "value": 13
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag018"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s142": {
    "name": "神话之眼",
    "type": "accessory",
    "slot": "accessory",
    "level": 40,
    "rarity": "doom",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 301
      },
      {
        "type": "maxmp_up",
        "value": 182
      },
      {
        "type": "hit_up",
        "value": 0.059
      },
      {
        "type": "dodge",
        "value": 0.059
      },
      {
        "type": "crit_up",
        "value": 0.059
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag020"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s143": {
    "name": "创世之光",
    "type": "accessory",
    "slot": "accessory",
    "level": 10,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 39
      }
    ],
    "tags": [
      "tag003",
      "tag078",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_s144": {
    "name": "不灭之心",
    "type": "accessory",
    "slot": "charm",
    "level": 10,
    "rarity": "common",
    "classLimit": null,
    "words": [
      {
        "type": "maxhp_up",
        "value": 39
      }
    ],
    "tags": [
      "tag003",
      "tag079",
      "tag015"
    ],
    "draft": false,
    "removeMaxWear": true,
    "removeDurability": true
  },
  "eq_a001": {
    "name": "粗布衣",
    "type": "armor",
    "slot": "chest",
    "level": 1,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 2
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag032",
      "tag015"
    ],
    "draft": false,
    "durability": 60,
    "removeMaxWear": true
  },
  "eq_a002": {
    "name": "生锈皮甲",
    "type": "armor",
    "slot": "chest",
    "level": 1,
    "rarity": "useful",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 3
      },
      {
        "type": "maxhp_up",
        "value": 16
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag031",
      "tag017"
    ],
    "draft": false,
    "durability": 60,
    "removeMaxWear": true
  },
  "eq_a003": {
    "name": "旅人布衣",
    "type": "armor",
    "slot": "chest",
    "level": 2,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 3
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag032",
      "tag015"
    ],
    "draft": false,
    "durability": 60,
    "removeMaxWear": true
  },
  "eq_a004": {
    "name": "皮甲",
    "type": "armor",
    "slot": "chest",
    "level": 2,
    "rarity": "useful",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 4
      },
      {
        "type": "maxhp_up",
        "value": 20
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag031",
      "tag017"
    ],
    "draft": false,
    "durability": 60,
    "removeMaxWear": true
  },
  "eq_a005": {
    "name": "学徒法袍",
    "type": "armor",
    "slot": "chest",
    "level": 3,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 4
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag032",
      "tag015"
    ],
    "draft": false,
    "durability": 60,
    "removeMaxWear": true
  },
  "eq_a006": {
    "name": "铁甲",
    "type": "armor",
    "slot": "chest",
    "level": 3,
    "rarity": "useful",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 5
      },
      {
        "type": "maxhp_up",
        "value": 24
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag021",
      "tag017"
    ],
    "draft": false,
    "durability": 60,
    "removeMaxWear": true
  },
  "eq_a007": {
    "name": "术士法袍",
    "type": "armor",
    "slot": "chest",
    "level": 4,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 4
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag032",
      "tag015"
    ],
    "draft": false,
    "durability": 60,
    "removeMaxWear": true
  },
  "eq_a008": {
    "name": "铜甲",
    "type": "armor",
    "slot": "chest",
    "level": 4,
    "rarity": "useful",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 6
      },
      {
        "type": "maxhp_up",
        "value": 28
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag023",
      "tag017"
    ],
    "draft": false,
    "durability": 60,
    "removeMaxWear": true
  },
  "eq_a009": {
    "name": "精制法袍",
    "type": "armor",
    "slot": "chest",
    "level": 5,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 5
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag032",
      "tag015"
    ],
    "draft": false,
    "durability": 60,
    "removeMaxWear": true
  },
  "eq_a010": {
    "name": "精钢甲",
    "type": "armor",
    "slot": "chest",
    "level": 20,
    "rarity": "epic",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 26
      },
      {
        "type": "maxhp_up",
        "value": 115
      },
      {
        "type": "def_up_pct",
        "value": 6
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag022",
      "tag019"
    ],
    "draft": false,
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_a011": {
    "name": "秘银法袍",
    "type": "armor",
    "slot": "chest",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 32
      },
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "def_up_pct",
        "value": 7
      },
      {
        "type": "counter_start",
        "value": 2
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag025",
      "tag018"
    ],
    "draft": false,
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_a012": {
    "name": "秘银甲",
    "type": "armor",
    "slot": "chest",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 32
      },
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "def_up_pct",
        "value": 7
      },
      {
        "type": "counter_start",
        "value": 2
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag025",
      "tag018"
    ],
    "draft": false,
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_a013": {
    "name": "影行皮甲",
    "type": "armor",
    "slot": "chest",
    "level": 6,
    "rarity": "useful",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 8
      },
      {
        "type": "maxhp_up",
        "value": 36
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag031",
      "tag017"
    ],
    "draft": false,
    "durability": 72,
    "removeMaxWear": true
  },
  "eq_a014": {
    "name": "玄铁法袍",
    "type": "armor",
    "slot": "chest",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 32
      },
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "def_up_pct",
        "value": 7
      },
      {
        "type": "counter_start",
        "value": 2
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag024",
      "tag018"
    ],
    "draft": false,
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_a015": {
    "name": "玄铁甲",
    "type": "armor",
    "slot": "chest",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 32
      },
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "def_up_pct",
        "value": 7
      },
      {
        "type": "counter_start",
        "value": 2
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag024",
      "tag018"
    ],
    "draft": false,
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_a016": {
    "name": "寒铁甲",
    "type": "armor",
    "slot": "chest",
    "level": 20,
    "rarity": "epic",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 26
      },
      {
        "type": "maxhp_up",
        "value": 115
      },
      {
        "type": "def_up_pct",
        "value": 6
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag026",
      "tag019"
    ],
    "draft": false,
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_a017": {
    "name": "星辰法袍",
    "type": "armor",
    "slot": "chest",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 32
      },
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "def_up_pct",
        "value": 7
      },
      {
        "type": "counter_start",
        "value": 2
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag069",
      "tag018"
    ],
    "draft": false,
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_a018": {
    "name": "龙鳞甲",
    "type": "armor",
    "slot": "chest",
    "level": 40,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 61
      },
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "def_up_pct",
        "value": 11
      },
      {
        "type": "counter_start",
        "value": 3
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag051",
      "tag018"
    ],
    "draft": false,
    "durability": 480,
    "removeMaxWear": true
  },
  "eq_a019": {
    "name": "影杀甲",
    "type": "armor",
    "slot": "chest",
    "level": 8,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 7
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag063",
      "tag015"
    ],
    "draft": false,
    "durability": 96,
    "removeMaxWear": true
  },
  "eq_a020": {
    "name": "霜华法袍",
    "type": "armor",
    "slot": "chest",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 32
      },
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "def_up_pct",
        "value": 7
      },
      {
        "type": "counter_start",
        "value": 2
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag058",
      "tag018"
    ],
    "draft": false,
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_a021": {
    "name": "霜华甲",
    "type": "armor",
    "slot": "chest",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 32
      },
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "def_up_pct",
        "value": 7
      },
      {
        "type": "counter_start",
        "value": 2
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag058",
      "tag018"
    ],
    "draft": false,
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_a022": {
    "name": "幽冥甲",
    "type": "armor",
    "slot": "chest",
    "level": 9,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 8
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag066",
      "tag015"
    ],
    "draft": false,
    "durability": 108,
    "removeMaxWear": true
  },
  "eq_a023": {
    "name": "龙鳞重甲",
    "type": "armor",
    "slot": "chest",
    "level": 40,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 61
      },
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "def_up_pct",
        "value": 11
      },
      {
        "type": "counter_start",
        "value": 3
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag051",
      "tag018"
    ],
    "draft": false,
    "durability": 480,
    "removeMaxWear": true
  },
  "eq_a024": {
    "name": "凤凰羽衣",
    "type": "armor",
    "slot": "chest",
    "level": 10,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 9
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag072",
      "tag015"
    ],
    "draft": false,
    "durability": 120,
    "removeMaxWear": true
  },
  "eq_a025": {
    "name": "龙牙暗甲",
    "type": "armor",
    "slot": "chest",
    "level": 40,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 61
      },
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "def_up_pct",
        "value": 11
      },
      {
        "type": "counter_start",
        "value": 3
      }
    ],
    "tags": [
      "tag002",
      "tag076",
      "tag084",
      "tag052",
      "tag018"
    ],
    "draft": false,
    "durability": 480,
    "removeMaxWear": true
  },
  "eq_h001": {
    "name": "布帽",
    "type": "armor",
    "slot": "head",
    "level": 1,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 2
      }
    ],
    "tags": [
      "tag002",
      "tag075",
      "tag083",
      "tag032",
      "tag015"
    ],
    "draft": false,
    "durability": 60,
    "removeMaxWear": true
  },
  "eq_h002": {
    "name": "皮帽",
    "type": "armor",
    "slot": "head",
    "level": 2,
    "rarity": "useful",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 4
      },
      {
        "type": "maxhp_up",
        "value": 20
      }
    ],
    "tags": [
      "tag002",
      "tag075",
      "tag083",
      "tag031",
      "tag017"
    ],
    "draft": false,
    "durability": 60,
    "removeMaxWear": true
  },
  "eq_h003": {
    "name": "铁盔",
    "type": "armor",
    "slot": "head",
    "level": 3,
    "rarity": "useful",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 5
      },
      {
        "type": "maxhp_up",
        "value": 24
      }
    ],
    "tags": [
      "tag002",
      "tag075",
      "tag083",
      "tag021",
      "tag017"
    ],
    "draft": false,
    "durability": 60,
    "removeMaxWear": true
  },
  "eq_h004": {
    "name": "铜盔",
    "type": "armor",
    "slot": "head",
    "level": 4,
    "rarity": "useful",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 6
      },
      {
        "type": "maxhp_up",
        "value": 28
      }
    ],
    "tags": [
      "tag002",
      "tag075",
      "tag083",
      "tag023",
      "tag017"
    ],
    "draft": false,
    "durability": 60,
    "removeMaxWear": true
  },
  "eq_h005": {
    "name": "钢盔",
    "type": "armor",
    "slot": "head",
    "level": 20,
    "rarity": "epic",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 26
      },
      {
        "type": "maxhp_up",
        "value": 115
      },
      {
        "type": "dodge",
        "value": 0.026
      }
    ],
    "tags": [
      "tag002",
      "tag075",
      "tag083",
      "tag022",
      "tag019"
    ],
    "draft": false,
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_h006": {
    "name": "秘银盔",
    "type": "armor",
    "slot": "head",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 32
      },
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "dodge",
        "value": 0.031
      },
      {
        "type": "crit_up",
        "value": 0.031
      }
    ],
    "tags": [
      "tag002",
      "tag075",
      "tag083",
      "tag025",
      "tag018"
    ],
    "draft": false,
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_h007": {
    "name": "玄铁盔",
    "type": "armor",
    "slot": "head",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 32
      },
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "dodge",
        "value": 0.031
      },
      {
        "type": "crit_up",
        "value": 0.031
      }
    ],
    "tags": [
      "tag002",
      "tag075",
      "tag083",
      "tag024",
      "tag018"
    ],
    "draft": false,
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_h008": {
    "name": "龙鳞盔",
    "type": "armor",
    "slot": "head",
    "level": 40,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 61
      },
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "dodge",
        "value": 0.05
      },
      {
        "type": "crit_up",
        "value": 0.05
      }
    ],
    "tags": [
      "tag002",
      "tag075",
      "tag083",
      "tag051",
      "tag018"
    ],
    "draft": false,
    "durability": 480,
    "removeMaxWear": true
  },
  "eq_h009": {
    "name": "霜华盔",
    "type": "armor",
    "slot": "head",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 32
      },
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "dodge",
        "value": 0.031
      },
      {
        "type": "crit_up",
        "value": 0.031
      }
    ],
    "tags": [
      "tag002",
      "tag075",
      "tag083",
      "tag058",
      "tag018"
    ],
    "draft": false,
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_h010": {
    "name": "龙鳞重盔",
    "type": "armor",
    "slot": "head",
    "level": 40,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 61
      },
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "dodge",
        "value": 0.05
      },
      {
        "type": "crit_up",
        "value": 0.05
      }
    ],
    "tags": [
      "tag002",
      "tag075",
      "tag083",
      "tag051",
      "tag018"
    ],
    "draft": false,
    "durability": 480,
    "removeMaxWear": true
  },
  "eq_l001": {
    "name": "布裤",
    "type": "armor",
    "slot": "legs",
    "level": 1,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 2
      }
    ],
    "tags": [
      "tag002",
      "tag077",
      "tag085",
      "tag032",
      "tag015"
    ],
    "draft": false,
    "durability": 60,
    "removeMaxWear": true
  },
  "eq_l002": {
    "name": "皮裤",
    "type": "armor",
    "slot": "legs",
    "level": 2,
    "rarity": "useful",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 4
      },
      {
        "type": "maxhp_up",
        "value": 20
      }
    ],
    "tags": [
      "tag002",
      "tag077",
      "tag085",
      "tag031",
      "tag017"
    ],
    "draft": false,
    "durability": 60,
    "removeMaxWear": true
  },
  "eq_l003": {
    "name": "铁护腿",
    "type": "armor",
    "slot": "legs",
    "level": 3,
    "rarity": "useful",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 5
      },
      {
        "type": "maxhp_up",
        "value": 24
      }
    ],
    "tags": [
      "tag002",
      "tag077",
      "tag085",
      "tag021",
      "tag017"
    ],
    "draft": false,
    "durability": 60,
    "removeMaxWear": true
  },
  "eq_l004": {
    "name": "铜护腿",
    "type": "armor",
    "slot": "legs",
    "level": 4,
    "rarity": "useful",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 6
      },
      {
        "type": "maxhp_up",
        "value": 28
      }
    ],
    "tags": [
      "tag002",
      "tag077",
      "tag085",
      "tag023",
      "tag017"
    ],
    "draft": false,
    "durability": 60,
    "removeMaxWear": true
  },
  "eq_l005": {
    "name": "钢护腿",
    "type": "armor",
    "slot": "legs",
    "level": 20,
    "rarity": "epic",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 26
      },
      {
        "type": "maxhp_up",
        "value": 115
      },
      {
        "type": "spd_up",
        "value": 2
      }
    ],
    "tags": [
      "tag002",
      "tag077",
      "tag085",
      "tag022",
      "tag019"
    ],
    "draft": false,
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_l006": {
    "name": "秘银护腿",
    "type": "armor",
    "slot": "legs",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 32
      },
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "spd_up",
        "value": 2
      },
      {
        "type": "dodge",
        "value": 0.031
      }
    ],
    "tags": [
      "tag002",
      "tag077",
      "tag085",
      "tag025",
      "tag018"
    ],
    "draft": false,
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_l007": {
    "name": "玄铁护腿",
    "type": "armor",
    "slot": "legs",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 32
      },
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "spd_up",
        "value": 2
      },
      {
        "type": "dodge",
        "value": 0.031
      }
    ],
    "tags": [
      "tag002",
      "tag077",
      "tag085",
      "tag024",
      "tag018"
    ],
    "draft": false,
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_l008": {
    "name": "龙鳞护腿",
    "type": "armor",
    "slot": "legs",
    "level": 40,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 61
      },
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "spd_up",
        "value": 3
      },
      {
        "type": "dodge",
        "value": 0.05
      }
    ],
    "tags": [
      "tag002",
      "tag077",
      "tag085",
      "tag051",
      "tag018"
    ],
    "draft": false,
    "durability": 480,
    "removeMaxWear": true
  },
  "eq_l009": {
    "name": "霜华护腿",
    "type": "armor",
    "slot": "legs",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 32
      },
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "spd_up",
        "value": 2
      },
      {
        "type": "dodge",
        "value": 0.031
      }
    ],
    "tags": [
      "tag002",
      "tag077",
      "tag085",
      "tag058",
      "tag018"
    ],
    "draft": false,
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_l010": {
    "name": "龙鳞重护腿",
    "type": "armor",
    "slot": "legs",
    "level": 40,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 61
      },
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "spd_up",
        "value": 3
      },
      {
        "type": "dodge",
        "value": 0.05
      }
    ],
    "tags": [
      "tag002",
      "tag077",
      "tag085",
      "tag051",
      "tag018"
    ],
    "draft": false,
    "durability": 480,
    "removeMaxWear": true
  },
  "eq_f001": {
    "name": "布鞋",
    "type": "armor",
    "slot": "feet",
    "level": 1,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "spd_up",
        "value": 1
      }
    ],
    "tags": [
      "tag002",
      "tag086",
      "tag087",
      "tag032",
      "tag015"
    ],
    "draft": false,
    "durability": 60,
    "removeMaxWear": true
  },
  "eq_f002": {
    "name": "皮靴",
    "type": "armor",
    "slot": "feet",
    "level": 2,
    "rarity": "useful",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "spd_up",
        "value": 1
      },
      {
        "type": "dodge",
        "value": 0.01
      }
    ],
    "tags": [
      "tag002",
      "tag086",
      "tag087",
      "tag031",
      "tag017"
    ],
    "draft": false,
    "durability": 60,
    "removeMaxWear": true
  },
  "eq_f003": {
    "name": "铁靴",
    "type": "armor",
    "slot": "feet",
    "level": 3,
    "rarity": "useful",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "spd_up",
        "value": 1
      },
      {
        "type": "dodge",
        "value": 0.01
      }
    ],
    "tags": [
      "tag002",
      "tag086",
      "tag087",
      "tag021",
      "tag017"
    ],
    "draft": false,
    "durability": 60,
    "removeMaxWear": true
  },
  "eq_f004": {
    "name": "铜靴",
    "type": "armor",
    "slot": "feet",
    "level": 4,
    "rarity": "useful",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "spd_up",
        "value": 1
      },
      {
        "type": "dodge",
        "value": 0.011
      }
    ],
    "tags": [
      "tag002",
      "tag086",
      "tag087",
      "tag023",
      "tag017"
    ],
    "draft": false,
    "durability": 60,
    "removeMaxWear": true
  },
  "eq_f005": {
    "name": "钢靴",
    "type": "armor",
    "slot": "feet",
    "level": 20,
    "rarity": "epic",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "spd_up",
        "value": 2
      },
      {
        "type": "dodge",
        "value": 0.026
      },
      {
        "type": "hit_up",
        "value": 0.026
      }
    ],
    "tags": [
      "tag002",
      "tag086",
      "tag087",
      "tag022",
      "tag019"
    ],
    "draft": false,
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_f006": {
    "name": "秘银靴",
    "type": "armor",
    "slot": "feet",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "spd_up",
        "value": 2
      },
      {
        "type": "dodge",
        "value": 0.031
      },
      {
        "type": "hit_up",
        "value": 0.031
      },
      {
        "type": "crit_up",
        "value": 0.031
      }
    ],
    "tags": [
      "tag002",
      "tag086",
      "tag087",
      "tag025",
      "tag018"
    ],
    "draft": false,
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_f007": {
    "name": "玄铁靴",
    "type": "armor",
    "slot": "feet",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "spd_up",
        "value": 2
      },
      {
        "type": "dodge",
        "value": 0.031
      },
      {
        "type": "hit_up",
        "value": 0.031
      },
      {
        "type": "crit_up",
        "value": 0.031
      }
    ],
    "tags": [
      "tag002",
      "tag086",
      "tag087",
      "tag024",
      "tag018"
    ],
    "draft": false,
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_f008": {
    "name": "龙鳞靴",
    "type": "armor",
    "slot": "feet",
    "level": 40,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "spd_up",
        "value": 3
      },
      {
        "type": "dodge",
        "value": 0.05
      },
      {
        "type": "hit_up",
        "value": 0.05
      },
      {
        "type": "crit_up",
        "value": 0.05
      }
    ],
    "tags": [
      "tag002",
      "tag086",
      "tag087",
      "tag051",
      "tag018"
    ],
    "draft": false,
    "durability": 480,
    "removeMaxWear": true
  },
  "eq_f009": {
    "name": "霜华靴",
    "type": "armor",
    "slot": "feet",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "spd_up",
        "value": 2
      },
      {
        "type": "dodge",
        "value": 0.031
      },
      {
        "type": "hit_up",
        "value": 0.031
      },
      {
        "type": "crit_up",
        "value": 0.031
      }
    ],
    "tags": [
      "tag002",
      "tag086",
      "tag087",
      "tag058",
      "tag018"
    ],
    "draft": false,
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_f010": {
    "name": "龙鳞重靴",
    "type": "armor",
    "slot": "feet",
    "level": 40,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "spd_up",
        "value": 3
      },
      {
        "type": "dodge",
        "value": 0.05
      },
      {
        "type": "hit_up",
        "value": 0.05
      },
      {
        "type": "crit_up",
        "value": 0.05
      }
    ],
    "tags": [
      "tag002",
      "tag086",
      "tag087",
      "tag051",
      "tag018"
    ],
    "draft": false,
    "durability": 480,
    "removeMaxWear": true
  },
  "eq_sh001": {
    "name": "木盾",
    "type": "shield",
    "slot": "offHand",
    "level": 1,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 2
      }
    ],
    "tags": [
      "tag002",
      "tag074",
      "tag081",
      "tag028",
      "tag015"
    ],
    "draft": false,
    "durability": 60,
    "removeMaxWear": true
  },
  "eq_sh002": {
    "name": "铁盾",
    "type": "shield",
    "slot": "offHand",
    "level": 3,
    "rarity": "useful",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 5
      },
      {
        "type": "maxhp_up",
        "value": 24
      }
    ],
    "tags": [
      "tag002",
      "tag074",
      "tag081",
      "tag021",
      "tag017"
    ],
    "draft": false,
    "durability": 60,
    "removeMaxWear": true
  },
  "eq_sh003": {
    "name": "钢盾",
    "type": "shield",
    "slot": "offHand",
    "level": 20,
    "rarity": "epic",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 26
      },
      {
        "type": "maxhp_up",
        "value": 115
      },
      {
        "type": "counter_start",
        "value": 1
      }
    ],
    "tags": [
      "tag002",
      "tag074",
      "tag081",
      "tag022",
      "tag019"
    ],
    "draft": false,
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_sh004": {
    "name": "龙鳞盾",
    "type": "shield",
    "slot": "offHand",
    "level": 40,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 61
      },
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "counter_start",
        "value": 3
      },
      {
        "type": "def_up_pct",
        "value": 11
      }
    ],
    "tags": [
      "tag002",
      "tag074",
      "tag081",
      "tag051",
      "tag018"
    ],
    "draft": false,
    "durability": 480,
    "removeMaxWear": true
  },
  "eq_sh005": {
    "name": "神殿骑士盾",
    "type": "shield",
    "slot": "offHand",
    "level": 40,
    "rarity": "doom",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 71
      },
      {
        "type": "maxhp_up",
        "value": 301
      },
      {
        "type": "counter_start",
        "value": 4
      },
      {
        "type": "def_up_pct",
        "value": 13
      },
      {
        "type": "reflect",
        "value": 6
      }
    ],
    "tags": [
      "tag002",
      "tag074",
      "tag081",
      "tag051",
      "tag020"
    ],
    "draft": false,
    "durability": 480,
    "removeMaxWear": true
  },
  "eq_fc001": {
    "name": "学徒法球",
    "type": "shield",
    "slot": "offHand",
    "level": 1,
    "rarity": "common",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 2
      }
    ],
    "tags": [
      "tag002",
      "tag074",
      "tag081",
      "tag043",
      "tag015"
    ],
    "draft": false,
    "durability": 60,
    "removeMaxWear": true
  },
  "eq_fc002": {
    "name": "铜制法印",
    "type": "shield",
    "slot": "offHand",
    "level": 3,
    "rarity": "useful",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 5
      },
      {
        "type": "maxhp_up",
        "value": 24
      }
    ],
    "tags": [
      "tag002",
      "tag074",
      "tag081",
      "tag023",
      "tag017"
    ],
    "draft": false,
    "durability": 60,
    "removeMaxWear": true
  },
  "eq_fc003": {
    "name": "秘银魔导书",
    "type": "shield",
    "slot": "offHand",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 32
      },
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "counter_start",
        "value": 2
      },
      {
        "type": "def_up_pct",
        "value": 7
      }
    ],
    "tags": [
      "tag002",
      "tag074",
      "tag081",
      "tag025",
      "tag018"
    ],
    "draft": false,
    "durability": 240,
    "removeMaxWear": true
  },
  "eq_fc004": {
    "name": "龙语法牌",
    "type": "shield",
    "slot": "offHand",
    "level": 40,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 61
      },
      {
        "type": "maxhp_up",
        "value": 258
      },
      {
        "type": "counter_start",
        "value": 3
      },
      {
        "type": "def_up_pct",
        "value": 11
      }
    ],
    "tags": [
      "tag002",
      "tag074",
      "tag081",
      "tag056",
      "tag018"
    ],
    "draft": false,
    "durability": 480,
    "removeMaxWear": true
  },
  "eq_fc005": {
    "name": "星辰圣契",
    "type": "shield",
    "slot": "offHand",
    "level": 20,
    "rarity": "legend",
    "classLimit": [
      "法师",
      "阵法师",
      "疗愈师",
      "炼金术师"
    ],
    "words": [
      {
        "type": "def_up",
        "value": 32
      },
      {
        "type": "maxhp_up",
        "value": 138
      },
      {
        "type": "counter_start",
        "value": 2
      },
      {
        "type": "def_up_pct",
        "value": 7
      }
    ],
    "tags": [
      "tag002",
      "tag074",
      "tag081",
      "tag069",
      "tag018"
    ],
    "draft": false,
    "durability": 240,
    "removeMaxWear": true
  }
};
Object.keys(EQUIP_AUDIT_PATCH).forEach(function(id){
  const p = EQUIP_AUDIT_PATCH[id];
  const t = EQUIPS[id];
  if(!t) return;
  t.name=p.name; t.type=p.type; t.slot=p.slot; t.level=p.level; t.rarity=p.rarity;
  t.classLimit=p.classLimit; t.words=p.words; t.tags=p.tags; t.draft=false;
  if(p.desc) t.desc=p.desc;
  if(p.maxWear!=null) t.maxWear=p.maxWear; else if(p.removeMaxWear) delete t.maxWear;
  if(p.durability!=null) t.durability=p.durability; else if(p.removeDurability) delete t.durability;
  if(p.twoHanded!=null) t.twoHanded=p.twoHanded; else if(p.type!=='weapon') delete t.twoHanded;
});

/* ------------------------------------------------------------
   同名装备去重：保留一个原名，其余按材质/形态改名
   ------------------------------------------------------------ */
const EQUIP_DUPLICATE_NAME_FIX = {
  eq_w134:'龙鳞扳指',
  eq_w214:'星辉法杖',
  eq_s082:'星辉颈链',
  eq_s038:'暗影布面',
  eq_s078:'暗影皮面',
  eq_s088:'暗影铁面',
  eq_s079:'星辉发冠',
  eq_s089:'星辉额饰',
  eq_s085:'九宫玉镯',
  eq_s087:'龙筋束带',
  eq_w192:'秘银法典坠'
};
Object.keys(EQUIP_DUPLICATE_NAME_FIX).forEach(function(id){
  if(EQUIPS[id]) EQUIPS[id].name = EQUIP_DUPLICATE_NAME_FIX[id];
});

/* ============================================================
   白板模式开关（物品重设计）
   ------------------------------------------------------------
   true  = 所有装备视为"未设计"：游戏内不提供任何词条，
           掉落/商店/锻造会跳过；原始 words 仍保留在文件里，
           仅作为物品定义的一部分，编辑器不再提供旧词条回填。
   false = 正常使用当前数据。
   ============================================================ */
const ITEM_DRAFT_MODE = true;

if(ITEM_DRAFT_MODE){
  for(const _id in EQUIPS){
    const _t = EQUIPS[_id];
    if(!_t || getItemCategory(_t) !== 'equip') continue;
    /* 已经设计完整的物品（有品阶且词条数对得上）不受开关影响，
       这样编辑器导出的一件件成品可以逐步生效 */
    if(_t.draft === false) continue;
    if(_t.rarity && itemWordsValid(_t)) continue;
    _t.draft = true;
  }
}

/* 物品是否处于"未设计"状态 */
function isItemDraft(tpl){
  return !!(tpl && tpl.draft);
}

/* ============================================================
   未设计物品隔离（P2）
   ------------------------------------------------------------
   统一出口：商店 / 合成 / 掉落 / 剧情发放 / 编辑器引用检查。
   口径：
     · 非装备（材料 / 药品 / 即时道具 / 特殊道具）不参与白板隔离，一律放行
     · 装备：白板模式开启时严格按 isItemDesigned 判断；
             白板模式关闭时按单件 draft 标记判断（旧数据可整体恢复）
   ============================================================ */
function isItemAvailable(tpl){
  if(!tpl) return false;
  if(getItemCategory(tpl) !== 'equip') return true;
  if(ITEM_DRAFT_MODE) return isItemDesigned(tpl);
  return !tpl.draft;
}

/* 配方是否可用：产出与全部材料都必须可用；
   进阶配方（kind:'advance'）没有产出物品，只检查材料。 */
function isRecipeAvailable(recipe){
  if(!recipe) return false;
  if(recipe.kind !== 'advance'){
    const r = recipe.result;
    if(!r || !isItemAvailable(EQUIPS[r.id])) return false;
  }
  const mats = Array.isArray(recipe.materials) ? recipe.materials : [];
  return mats.every(function(m){ return !!(m && isItemAvailable(EQUIPS[m.id])); });
}
