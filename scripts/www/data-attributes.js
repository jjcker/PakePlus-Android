/* ============================================================
   data-attributes.js — 全角色通用属性引擎
   ------------------------------------------------------------
   一级属性（变量）：
     体力 VIT / 精神力 SPI
   派生属性：
     体力  → 生命上限、物理攻击、防御
     精神力 → 魔力上限、魔法攻击、速度
   玩家 / NPC / 敌人共用本文件的同一套公式。

   ⚠ 速度沿用本项目既有规则：数值越小越先手（公式内下限为 1）。
   ⚠ 本文件不读取技能、装备、被动。它们属于后续“修正层”，
     不应参与基础属性公式，否则会与旧数值互相污染。
   ============================================================ */

/* ------------------------------------------------------------
   派生公式参数（唯一调参入口）
   ------------------------------------------------------------
   所有公式都同时包含“当前等级”和“当前一级属性”：
     HP   = 30 + VIT×10   + (Lv-1)×6
     MP   = 10 + SPI×5    + (Lv-1)×2
     PATK =  5 + VIT×1.4  + (Lv-1)×1.2
     MATK =  5 + SPI×1.4  + (Lv-1)×1.2
     DEF  =       VIT×0.7                 （只由体力决定）
     SPD  = 14 - √SPI×0.85 - (Lv-1)×0.08  （越小越快）
   ------------------------------------------------------------ */
const ATTR_FORMULA = {
  hp:       { flat: 30, perVit: 10.0, perLevel: 6.0 },
  mp:       { flat: 10, perSpi: 5.0,  perLevel: 2.0 },
  physAtk:  { flat: 5,  perVit: 1.4,  perLevel: 1.2 },
  magicAtk: { flat: 5,  perSpi: 1.4,  perLevel: 1.2 },
  /* 防御只由体力决定：等级不再直接加防御。
     0.7 的目标：无装备、同级对打时约 2/3 伤害奏效（防御 ≈ 物攻的 1/3）。
     装备上只有 def_up（防御 + 固定值）能再改这个值，没有百分比、没有减防。 */
  def:      { flat: 0,  perVit: 0.7, perLevel: 0 },
  spd:      { base: 14, perSqrtSpi: 0.85, perLevel: 0.08, min: 1 }
};

/* 一级属性兜底值
   职业不提供基础属性 / 成长值：每个角色卡（含玩家）自己持有 base / growth。
   只有在旧存档或旧角色卡完全缺失这两项时才用这里的通用值补齐。 */
const ATTR_FALLBACK = {
  base:   { vit:8,   spi:6   },
  growth: { vit:1.5, spi:1.2 }
};

/* ------------------------------------------------------------
   敌人一级属性模板
   normal  = 普通怪（1~2 只出场）
   strong  = 精英 / Boss
   minion  = 杂兵（3~4 只成群出场）—— 血量、攻击、防御都低于 normal，
             让"3 个一起上"的总量回到 5 回合可清场的区间。
   三者 base 仍然是 Lv.1 时的值，成长按等级线性累积。
   选用规则见 enemyTemplateKind()：角色卡写 rank:'minion' 或 minion:true。
   ------------------------------------------------------------ */
const ENEMY_ATTR_TEMPLATE = {
  minion: { base:{vit:6, spi:4}, growth:{vit:0.75, spi:0.6} },
  normal: { base:{vit:8, spi:5}, growth:{vit:1.6, spi:1.0} },
  strong: { base:{vit:11, spi:6}, growth:{vit:2.2, spi:1.3} }
};

/* 敌人模板判定（唯一入口）：strong > minion > normal */
function enemyTemplateKind(src){
  const e = (src && typeof src === 'object') ? src : {};
  if(e.strong === true || e.rank === 'strong' || e.isBoss === true) return 'strong';
  if(e.rank === 'minion' || e.minion === true) return 'minion';
  return 'normal';
}

/* ============================================================
   战斗四率（角色自带的那一份）
   ------------------------------------------------------------
   角色卡上可写 4 个字段，不写就用这里的默认值：
     hitRate   命中加成   默认 0      （抵消对方闪避；填 0.05 = 5%）
     dodge     闪避率     默认 0      （上限见 data-config.js 的 DODGE_CAP）
     critRate  暴击率     默认 0.05
     critMult  暴击倍率   默认 1.5
   装备 / 技能 / 被动提供的同类加成，是在这之上再叠加。
   ============================================================ */
const COMBAT_RATE_DEFAULTS = {
  hit: 1,          // 命中率，1 = 100%
  dodge: 0,
  critRate: 0.05,
  critMult: 1.5
};

/* 返回 { hit, hitRate, dodge, critRate, critMult }
   hit     = 角色卡的绝对命中率（100% = 1）
   hitRate = 相对 100% 的加成，内部判定用：负值表示更容易被闪避 */
function getCharCombatRates(charObj){
  const c = (charObj && typeof charObj === 'object') ? charObj : {};
  const d = COMBAT_RATE_DEFAULTS;
  const num = (v, fb) => {
    if(v === undefined || v === null || v === '') return fb;
    const n = Number(v);
    return isFinite(n) ? n : fb;
  };
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const hit = clamp(num(c.hit, d.hit), 0, 2);
  return {
    hit: hit,
    hitRate: clamp(hit - 1, -1, 1),
    dodge:    clamp(num(c.dodge, d.dodge), 0, 1),
    critRate: clamp(num(c.critRate, d.critRate), 0, 1),
    critMult: Math.max(1, num(c.critMult, d.critMult))
  };
}

/* ============================================================
   基础工具
   ============================================================ */

function attrRound(value, digits){
  const d = (digits === undefined) ? 2 : digits;
  const p = Math.pow(10, d);
  return Math.round((Number(value) || 0) * p) / p;
}

function attrLevel(level){
  const n = Number(level);
  return (isFinite(n) && n >= 1) ? Math.floor(n) : 1;
}

function attrNum(value, fallback){
  const n = Number(value);
  return isFinite(n) ? n : (Number(fallback) || 0);
}

/* ============================================================
   角色（玩家 / NPC）一级属性模型
   ------------------------------------------------------------
   每个角色都自带 base.vit / base.spi / growth.vit / growth.spi，
   职业不参与一级属性生成。
   缺失时按 fallback（默认 ATTR_FALLBACK）补齐，旧存档的 base.hp 不参与。
   ============================================================ */
function getCharAttributeModel(charObj, fallback){
  const obj = charObj || {};
  const b = obj.base || {};
  const g = obj.growth || {};
  const fb = fallback || ATTR_FALLBACK;
  const fbBase = fb.base || {};
  const fbGrowth = fb.growth || {};

  const hasVit = isFinite(Number(b.vit));
  const hasSpi = isFinite(Number(b.spi));
  const hasGVit = isFinite(Number(g.vit));
  const hasGSpi = isFinite(Number(g.spi));

  /* 完整模型：原样读取 */
  if(hasVit && hasSpi && hasGVit && hasGSpi){
    return {
      base: { vit: Number(b.vit), spi: Number(b.spi) },
      growth: { vit: Number(g.vit), spi: Number(g.spi) },
      migrated: false
    };
  }

  /* 部分模型：保留已有项，缺的按兜底值补 */
  return {
    base: {
      vit: hasVit ? Number(b.vit) : attrNum(fbBase.vit, ATTR_FALLBACK.base.vit),
      spi: hasSpi ? Number(b.spi) : attrNum(fbBase.spi, ATTR_FALLBACK.base.spi)
    },
    growth: {
      vit: hasGVit ? Number(g.vit) : attrNum(fbGrowth.vit, ATTR_FALLBACK.growth.vit),
      spi: hasGSpi ? Number(g.spi) : attrNum(fbGrowth.spi, ATTR_FALLBACK.growth.spi)
    },
    migrated: true
  };
}

/* 把角色对象写回标准一级属性结构（供读档 / 编辑器迁移用） */
function normalizeCharAttributeModel(charObj, fallback){
  if(!charObj || charObj.isEnv) return null;
  const model = getCharAttributeModel(charObj, fallback);
  charObj.base = { vit: model.base.vit, spi: model.base.spi };
  charObj.growth = { vit: model.growth.vit, spi: model.growth.spi };
  return model;
}

/* 当前体力 */
function getCharVitality(charObj, levelOverride){
  const lv = attrLevel(levelOverride !== undefined ? levelOverride : (charObj && charObj.level));
  const model = getCharAttributeModel(charObj);
  const flat = attrNum(charObj && charObj.vitFlat, 0);
  return attrRound(model.base.vit + model.growth.vit * (lv - 1) + flat, 2);
}

/* 当前精神力 */
function getCharSpirit(charObj, levelOverride){
  const lv = attrLevel(levelOverride !== undefined ? levelOverride : (charObj && charObj.level));
  const model = getCharAttributeModel(charObj);
  const flat = attrNum(charObj && charObj.spiFlat, 0);
  return attrRound(model.base.spi + model.growth.spi * (lv - 1) + flat, 2);
}

/* ============================================================
   核心派生公式（全角色唯一入口）
   ============================================================ */
function deriveAttrStats(level, vit, spi){
  const lv = attrLevel(level);
  const lv1 = lv - 1;
  const v = Math.max(0, attrNum(vit, 0));
  const s = Math.max(0, attrNum(spi, 0));

  const hpF = ATTR_FORMULA.hp;
  const mpF = ATTR_FORMULA.mp;
  const paF = ATTR_FORMULA.physAtk;
  const maF = ATTR_FORMULA.magicAtk;
  const dfF = ATTR_FORMULA.def;
  const spF = ATTR_FORMULA.spd;

  return {
    level: lv,
    vit: attrRound(v, 2),
    spi: attrRound(s, 2),
    maxHp: Math.floor(hpF.flat + v * hpF.perVit + lv1 * hpF.perLevel),
    maxMp: Math.floor(mpF.flat + s * mpF.perSpi + lv1 * mpF.perLevel),
    physAtk: Math.floor(paF.flat + v * paF.perVit + lv1 * paF.perLevel),
    magicAtk: Math.floor(maF.flat + s * maF.perSpi + lv1 * maF.perLevel),
    def: attrRound(dfF.flat + v * dfF.perVit + lv1 * dfF.perLevel, 2),
    /* 速度：数值越小越先手；√SPI 使高精神力收益递减 */
    spd: attrRound(Math.max(spF.min, spF.base - Math.sqrt(s) * spF.perSqrtSpi - lv1 * spF.perLevel), 2)
  };
}

/* 读取角色完整派生属性 */
function getCharAttrStats(charObj, levelOverride){
  const lv = attrLevel(levelOverride !== undefined ? levelOverride : (charObj && charObj.level));
  return deriveAttrStats(lv, getCharVitality(charObj, lv), getCharSpirit(charObj, lv));
}

/* 把派生结果写回角色对象（maxHp / maxMp / physAtk / magicAtk / def / spd / vit / spi） */
function applyDerivedAttrStats(charObj, opts){
  if(!charObj) return null;
  const level = (opts && opts.level !== undefined) ? opts.level : charObj.level;
  const stats = getCharAttrStats(charObj, level);
  charObj.vit = stats.vit;
  charObj.spi = stats.spi;
  charObj.maxHp = stats.maxHp;
  charObj.maxMp = stats.maxMp;
  charObj.physAtk = stats.physAtk;
  charObj.magicAtk = stats.magicAtk;
  charObj.def = stats.def;
  charObj.spd = stats.spd;
  /* 兼容旧字段名 */
  charObj.derivedPhysAtk = stats.physAtk;
  charObj.derivedMagicAtk = stats.magicAtk;
  return stats;
}

/* ============================================================
   敌人一级属性模型
   ============================================================ */
function getEnemyAttributeModel(enemy){
  const e = enemy || {};
  const b = e.base || {};
  const g = e.growth || {};
  const kind = enemyTemplateKind(e);
  const tpl = ENEMY_ATTR_TEMPLATE[kind];

  const hasVit = isFinite(Number(b.vit));
  const hasSpi = isFinite(Number(b.spi));
  const hasGVit = isFinite(Number(g.vit));
  const hasGSpi = isFinite(Number(g.spi));

  if(hasVit && hasSpi && hasGVit && hasGSpi){
    return {
      base: { vit: Number(b.vit), spi: Number(b.spi) },
      growth: { vit: Number(g.vit), spi: Number(g.spi) },
      migrated: false
    };
  }

  return {
    base: {
      vit: hasVit ? Number(b.vit) : tpl.base.vit,
      spi: hasSpi ? Number(b.spi) : tpl.base.spi
    },
    growth: {
      vit: hasGVit ? Number(g.vit) : tpl.growth.vit,
      spi: hasGSpi ? Number(g.spi) : tpl.growth.spi
    },
    migrated: true
  };
}

function normalizeEnemyAttributeModel(enemy){
  if(!enemy) return null;
  const model = getEnemyAttributeModel(enemy);
  enemy.base = { vit: model.base.vit, spi: model.base.spi };
  enemy.growth = { vit: model.growth.vit, spi: model.growth.spi };
  return model;
}

function getEnemyAttrStats(enemy, levelOverride){
  const lv = attrLevel(levelOverride !== undefined ? levelOverride : (enemy && enemy.level));
  const model = getEnemyAttributeModel(enemy);
  const vit = attrRound(model.base.vit + model.growth.vit * (lv - 1), 2);
  const spi = attrRound(model.base.spi + model.growth.spi * (lv - 1), 2);
  return deriveAttrStats(lv, vit, spi);
}

function applyEnemyAttrStats(enemy, opts){
  if(!enemy) return null;
  const level = (opts && opts.level !== undefined) ? opts.level : enemy.level;
  const stats = getEnemyAttrStats(enemy, level);
  enemy.vit = stats.vit;
  enemy.spi = stats.spi;
  enemy.maxHp = stats.maxHp;
  enemy.maxMp = stats.maxMp;
  enemy.physAtk = stats.physAtk;
  enemy.magicAtk = stats.magicAtk;
  enemy.def = stats.def;
  enemy.spd = stats.spd;
  enemy.derivedPhysAtk = stats.physAtk;
  enemy.derivedMagicAtk = stats.magicAtk;
  return stats;
}

/* 解析模板名：兼容旧的布尔参数（true=精英/false=普通）与新字符串（'minion'/'normal'/'strong'） */
function resolveEnemyKind(kind){
  if(kind === true) return 'strong';
  if(typeof kind === 'string' && ENEMY_ATTR_TEMPLATE[kind]) return kind;
  return 'normal';
}

/* 按等级直接生成敌人属性（编辑器“按等级算”按钮 / 无模板兜底） */
function getEnemyDerivedStats(level, kindArg){
  const kind = resolveEnemyKind(kindArg);
  const tpl = ENEMY_ATTR_TEMPLATE[kind];
  const lv = attrLevel(level);
  const vit = attrRound(tpl.base.vit + tpl.growth.vit * (lv - 1), 2);
  const spi = attrRound(tpl.base.spi + tpl.growth.spi * (lv - 1), 2);
  const stats = deriveAttrStats(lv, vit, spi);
  /* hp / mp 别名：兼容旧编辑器调用 */
  stats.hp = stats.maxHp;
  stats.mp = stats.maxMp;
  return stats;
}

/* 取敌人模板（供编辑器“按等级算”写回 base / growth） */
function getEnemyAttrTemplate(kindArg){
  const tpl = ENEMY_ATTR_TEMPLATE[resolveEnemyKind(kindArg)];
  return {
    base: { vit: tpl.base.vit, spi: tpl.base.spi },
    growth: { vit: tpl.growth.vit, spi: tpl.growth.spi }
  };
}
