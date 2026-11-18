/* ============================================================
   data-effects.js — 统一词条库（v3 / 防御改版后）
   ------------------------------------------------------------
   规则：
     · 词条数严格等于品阶（1~5），由编辑器校验，不在这里管
     · 防御只由体力决定，只有 def_up 能改；没有百分比防御、没有减防
     · 护盾系统已删除：没有伤害吸收；所有防御类效果只改防御值（def_up / def_up_pct / def_up_once）
     · 真伤不走防御计算

   字段（编辑器与结算共用）：
     id / name / cat / domain / trigger / mode / unit / carriers
     stack        add 加算 / max 取最大
     status       是否进入 statuses（有持续时间）
     equipStat    装备汇总写入 calcEquipStats 的字段
     equipSign    符号（spd_up 用 -1）
     combatKey    写入 unit.tempMods 的字段
     implemented  结算是否已支持
     todo         尚未接入结算，编辑器显示"待接入"
     valueName / valueUnit / valueHint / durationMode / duration
     defaultTarget / stackText
   ============================================================ */

const EFFECT_CAT_LABEL = {
  damage:'伤害', heal:'治疗', status:'状态', stat:'属性',
  resource:'资源', mechanic:'机制'
};
const EFFECT_DOMAIN_LABEL = { panel:'常态', battle:'战斗', field:'场景' };
const EFFECT_TRIGGER_LABEL = {
  active:'主动使用', always:'常驻', battle_start:'进入战斗',
  on_hit:'命中时', on_kill:'击杀时', turn_start:'回合开始',
  turn_end:'回合结束', on_damaged:'受击时', on_settle:'战斗结算',
  on_use:'使用道具时'
};
const EFFECT_CARRIER_LABEL = {
  skill:'技能', equip:'装备', passive:'被动', item:'道具'
};

const EFFECT_ATOMS = {};

function defineEffectAtom(id, name, opts){
  const a = Object.assign({
    id: id,
    name: name,
    cat:'mechanic',
    domain:'battle',
    trigger:'active',
    mode:'flat',
    unit:'flat',
    carriers:['skill'],
    stack:'add',
    status:false,
    panel:false,
    implemented:true,
    cleanseable:true,
    todo:false,
    valueName:'数值',
    valueUnit:'',
    valueHint:'',
    durationMode:'none',
    duration:0,
    defaultTarget:'',
    stackText:''
  }, opts || {});
  a.id = id;
  EFFECT_ATOMS[id] = a;
  return a;
}

/* ============================================================
   一、通用 · 面板（任何载体都能挂，always）
   ============================================================ */

defineEffectAtom('phys_atk_up','物理攻击 +',{
  cat:'stat', domain:'panel', trigger:'always', carriers:['equip','skill','item','passive'],
  equipStat:'physAtk', valueName:'物理攻击加值', valueUnit:'点',
  valueHint:'填 10 = 物理攻击 +10。', stackText:'加算',
  desc:v=>`物理攻击 +${v}`
});
defineEffectAtom('magic_atk_up','魔法攻击 +',{
  cat:'stat', domain:'panel', trigger:'always', carriers:['equip','skill','item','passive'],
  equipStat:'magicAtk', valueName:'魔法攻击加值', valueUnit:'点',
  valueHint:'填 10 = 魔法攻击 +10。', stackText:'加算',
  desc:v=>`魔法攻击 +${v}`
});
defineEffectAtom('phys_atk_up_pct','物理攻击 %',{
  cat:'stat', domain:'panel', trigger:'always', carriers:['equip','skill','item','passive'],
  mode:'pct', unit:'percent', equipStat:'physAtkPct', status:true,
  valueName:'物理攻击百分比', valueUnit:'%',
  valueHint:'填 15 = 物理攻击 +15%。', durationMode:'editable', duration:3,
  stackText:'加算', desc:v=>`物理攻击 +${v}%`
});
defineEffectAtom('magic_atk_up_pct','魔法攻击 %',{
  cat:'stat', domain:'panel', trigger:'always', carriers:['equip','skill','item','passive'],
  mode:'pct', unit:'percent', equipStat:'magicAtkPct', status:true,
  valueName:'魔法攻击百分比', valueUnit:'%',
  valueHint:'填 15 = 魔法攻击 +15%。', durationMode:'editable', duration:3,
  stackText:'加算', desc:v=>`魔法攻击 +${v}%`
});
defineEffectAtom('def_up','防御 +',{
  cat:'stat', domain:'panel', trigger:'always', carriers:['equip','passive','skill'],
  equipStat:'defBonus',
  valueName:'防御加值', valueUnit:'点',
  valueHint:'填 5 = 防御 +5。装备/被动为常驻；技能/道具为本场持续。',
  stackText:'多件加算', desc:v=>`防御 +${v}`
});
defineEffectAtom('def_up_once','防御 +（单次）',{
  cat:'stat', domain:'battle', trigger:'active', carriers:['skill','item'],
  valueName:'下一次受击防御加值', valueUnit:'点',
  valueHint:'填 10 = 下一次受到的伤害计算前防御 +10，结算后移除；不吸收伤害。',
  stackText:'加算', defaultTarget:'self', desc:v=>`下一次受击防御 +${v}`
});
defineEffectAtom('maxhp_up','生命上限 +',{
  cat:'stat', domain:'panel', trigger:'always', carriers:['equip','skill','passive','item'],
  equipStat:'maxHpBonus', panel:true,
  valueName:'生命上限加值', valueUnit:'点', valueHint:'填 50 = 最大 HP +50。',
  stackText:'加算', desc:v=>`最大 HP +${v}`
});
defineEffectAtom('maxhp_up_pct','生命上限 %',{
  cat:'stat', domain:'panel', trigger:'always', carriers:['equip','passive'],
  mode:'pct', unit:'percent', panel:true, equipStat:'maxHpPct',
  valueName:'生命上限百分比', valueUnit:'%', valueHint:'填 15 = 最大 HP +15%。',
  stackText:'加算', desc:v=>`最大 HP +${v}%`
});
defineEffectAtom('maxmp_up','魔力上限 +',{
  cat:'stat', domain:'panel', trigger:'always', carriers:['equip','skill','passive','item'],
  equipStat:'maxMpBonus', panel:true,
  valueName:'魔力上限加值', valueUnit:'点', valueHint:'填 30 = 最大 MP +30。',
  stackText:'加算', desc:v=>`最大 MP +${v}`
});
defineEffectAtom('maxmp_up_pct','魔力上限 %',{
  cat:'stat', domain:'panel', trigger:'always', carriers:['equip','passive'],
  mode:'pct', unit:'percent', panel:true, equipStat:'maxMpPct',
  valueName:'魔力上限百分比', valueUnit:'%', valueHint:'填 15 = 最大 MP +15%。',
  stackText:'加算', desc:v=>`最大 MP +${v}%`
});
defineEffectAtom('spd_up','加速',{
  cat:'stat', domain:'panel', trigger:'always', carriers:['equip','skill','item','passive'],
  equipStat:'spdMod', equipSign:-1, status:true, panel:true,
  valueName:'速度修正值', valueUnit:'点',
  valueHint:'填 2 = 速度数值 -2（数值越小越先手）。', durationMode:'editable', duration:3,
  stackText:'加算', desc:v=>`加速 ${v}`
});
defineEffectAtom('spd_down','减速',{
  cat:'stat', domain:'panel', trigger:'always', carriers:['equip','skill','item','passive'],
  equipStat:'spdMod', equipSign:1, status:true, panel:true,
  valueName:'速度修正值', valueUnit:'点',
  valueHint:'填 2 = 速度数值 +2（数值越大越后手）。', durationMode:'editable', duration:3,
  stackText:'加算', desc:v=>`减速 ${v}`
});
defineEffectAtom('spd_flat','速度固定修正',{
  cat:'stat', domain:'battle', trigger:'always', carriers:['equip','passive'],
  equipStat:'spdMod', equipSign:1,
  valueName:'速度固定值', valueUnit:'点',
  valueHint:'填 -6 = 速度数值 -6（更快）；最低为 0。', stackText:'加算',
  desc:v=>`速度 ${v >= 0 ? '+' : ''}${v||0}（固定）`
});
defineEffectAtom('dodge','闪避率 +',{
  cat:'stat', domain:'battle', trigger:'always', carriers:['equip','skill','item','passive'],
  mode:'rate', unit:'rate', equipStat:'dodge',
  valueName:'闪避率增量', valueUnit:'小数（0~1）',
  valueHint:'填 0.05 = 闪避率 +5%；上限 75%。', stackText:'加算，上限 75%',
  desc:v=>`闪避率 +${Math.round((v||0)*100)}%`
});
defineEffectAtom('hit_up','命中率 +',{
  cat:'stat', domain:'battle', trigger:'always', carriers:['equip','skill','item','passive'],
  mode:'rate', unit:'rate', equipStat:'hitRate',
  valueName:'命中率增量', valueUnit:'小数（0~1）',
  valueHint:'填 0.10 = 抵消目标 10% 闪避。', stackText:'加算',
  desc:v=>`命中率 +${Math.round((v||0)*100)}%`
});
defineEffectAtom('crit_up','暴击率 +',{
  cat:'stat', domain:'battle', trigger:'always', carriers:['equip','skill','item','passive'],
  mode:'rate', unit:'rate', equipStat:'critRate',
  valueName:'暴击率增量', valueUnit:'小数（0~1）',
  valueHint:'填 0.05 = 暴击率 +5%（基础 5%）。', stackText:'加算',
  desc:v=>`暴击率 +${Math.round((v||0)*100)}%`
});
defineEffectAtom('learn_skill','学会技能',{
  cat:'mechanic', domain:'item', trigger:'always', carriers:['item'],
  mode:'special', unit:'',
  valueName:'技能', valueUnit:'',
  valueHint:'选一个技能：使用后该角色永久学会，不校验职业。',
  stackText:'不叠加',
  desc:()=>'学会技能'
});

defineEffectAtom('change_class','转职',{
  cat:'mechanic', domain:'item', trigger:'always', carriers:['item'],
  mode:'special', unit:'',
  valueName:'职业', valueUnit:'',
  valueHint:'选一个职业（含隐藏职业）：使用后该角色转职，并自动学会该职业的第一个技能；已有两个职业时替换槽位 1。',
  stackText:'不叠加',
  desc:()=>'转职为指定职业'
});

defineEffectAtom('critdmg_up','暴击倍率 +',{
  cat:'stat', domain:'battle', trigger:'always', carriers:['equip','skill','item','passive'],
  mode:'flat', unit:'倍率', equipStat:'critMult',
  valueName:'暴击倍率增量', valueUnit:'倍',
  valueHint:'填 0.3 = 暴击倍率从 1.5 变成 1.8。', stackText:'加算',
  desc:v=>`暴击倍率 +${v}`
});
defineEffectAtom('vit_up','体力 +',{
  cat:'stat', domain:'panel', trigger:'always', carriers:['equip','item','passive'],
  equipStat:'vitBonus',
  valueName:'体力加值', valueUnit:'点',
  valueHint:'填 5 = 体力 +5，同时提升 HP、物攻和防御。', stackText:'加算',
  desc:v=>`体力 +${v}`
});
defineEffectAtom('spi_up','精神力 +',{
  cat:'stat', domain:'panel', trigger:'always', carriers:['equip','item','passive'],
  equipStat:'spiBonus',
  valueName:'精神力加值', valueUnit:'点',
  valueHint:'填 5 = 精神力 +5，同时提升 MP、魔攻和速度。', stackText:'加算',
  desc:v=>`精神力 +${v}`
});
defineEffectAtom('dmg_up_pct','造成伤害 +%',{
  cat:'mechanic', domain:'battle', trigger:'always', carriers:['equip','passive','skill'],
  mode:'pct', unit:'percent', equipStat:'dmgUp',
  valueName:'增伤百分比', valueUnit:'%',
  valueHint:'填 10 = 最终伤害 +10%（真实伤害除外）。', stackText:'加算',
  desc:v=>`造成伤害 +${v}%`
});
/* ============================================================
   二、通用 · 战斗管线（装备 / 被动 / 技能）
   ============================================================ */

defineEffectAtom('ignore_def','无视防御',{
  cat:'mechanic', domain:'battle', trigger:'on_hit',
  carriers:['equip','skill','passive'], mode:'special', unit:'开关',
  equipStat:'ignoreDef', stack:'max', implemented:true,
  valueName:'开关', valueUnit:'1 = 开启',
  valueHint:'填 1 = 该次物理/魔法伤害不减防御，直接扣血（等同物法真伤）。',
  defaultTarget:'self', stackText:'有任意一条即生效',
  desc:()=>'无视防御'
});
defineEffectAtom('dmg_vs_demon_pct','对魔军伤害 +%',{
  cat:'mechanic', domain:'battle', trigger:'always', carriers:['equip','passive'],
  mode:'pct', unit:'percent', equipStat:'dmgVsDemon',
  valueName:'对魔军伤害加成', valueUnit:'%',
  valueHint:'填 30 = 对带“魔军”阵营标签的目标伤害 +30%，真实伤害也生效。',
  defaultTarget:'self', stackText:'加算',
  desc:v=>`对魔军伤害 +${v}%`
});
defineEffectAtom('def_vs_demon_pct','对魔军防御 +%',{
  cat:'mechanic', domain:'battle', trigger:'always', carriers:['equip','passive'],
  mode:'pct', unit:'percent', equipStat:'defVsDemon',
  valueName:'对魔军防御加成', valueUnit:'%',
  valueHint:'填 80 = 被带“魔军”阵营标签的单位攻击时，防御值 +80%。',
  defaultTarget:'self', stackText:'加算',
  desc:v=>`对魔军防御 +${v}%`
});
defineEffectAtom('execute_below','斩杀阈值',{
  cat:'mechanic', domain:'battle', trigger:'on_hit', carriers:['equip','skill'],
  mode:'threshold', unit:'percent', equipStat:'executeBelow', stack:'max',
  valueName:'斩杀阈值', valueUnit:'%',
  valueHint:'填 20 = 目标 HP 低于 20% 时直接斩杀；多件取最大值。',
  defaultTarget:'self', stackText:'取最大值',
  desc:v=>`目标 HP 低于 ${v}% 时斩杀`
});
defineEffectAtom('low_hp_power','低血增伤',{
  cat:'mechanic', domain:'battle', trigger:'on_hit', carriers:['equip','skill','passive'],
  mode:'pct', unit:'percent', equipStat:'lowHpPower',
  valueName:'最大增伤', valueUnit:'%',
  valueHint:'填 30 = 自身 HP 低于 30% 后开始增伤，越接近 0 越接近 +30%。',
  defaultTarget:'self', stackText:'加算',
  desc:v=>`自身低血时最高增伤 ${v}%`
});
defineEffectAtom('first_strike','首回合增伤',{
  cat:'mechanic', domain:'battle', trigger:'battle_start', carriers:['equip','skill'],
  mode:'pct', unit:'percent', equipStat:'firstStrike',
  valueName:'首回合增伤', valueUnit:'%',
  valueHint:'填 15 = 第 1 回合伤害 +15%。', defaultTarget:'self', stackText:'加算',
  desc:v=>`第 1 回合伤害 +${v}%`
});
defineEffectAtom('lifesteal_on_kill','击杀回血',{
  cat:'mechanic', domain:'battle', trigger:'on_kill', carriers:['equip','skill','passive'],
  mode:'pct', unit:'percent', equipStat:'lifestealOnKill',
  valueName:'击杀回复比例', valueUnit:'%',
  valueHint:'填 5 = 击杀后回复最大 HP 的 5%。', defaultTarget:'self', stackText:'加算',
  desc:v=>`击杀后回复 ${v}% 最大 HP`
});
defineEffectAtom('extra_phys_dmg','附加物理伤害',{
  cat:'mechanic', domain:'battle', trigger:'on_hit', carriers:['equip','skill','passive'],
  equipStat:'extraPhysDmg',
  valueName:'附加伤害', valueUnit:'点',
  valueHint:'填 15 = 减防后再额外扣 15 HP（物理）。', defaultTarget:'self', stackText:'加算',
  desc:v=>`命中后额外造成 ${v} 点物理伤害`
});
defineEffectAtom('extra_magic_dmg','附加魔法伤害',{
  cat:'mechanic', domain:'battle', trigger:'on_hit', carriers:['equip','skill','passive'],
  equipStat:'extraMagicDmg',
  valueName:'附加伤害', valueUnit:'点',
  valueHint:'填 15 = 减防后再额外扣 15 HP（魔法）。', defaultTarget:'self', stackText:'加算',
  desc:v=>`命中后额外造成 ${v} 点魔法伤害`
});
defineEffectAtom('true_dmg_bonus','附加真实伤害',{
  cat:'mechanic', domain:'battle', trigger:'on_hit', carriers:['equip','skill','passive'],
  equipStat:'trueDmgBonus',
  valueName:'额外真实伤害', valueUnit:'点',
  valueHint:'填 15 = 每次命中额外扣 15 HP，不减防御、不暴击。',
  defaultTarget:'self', stackText:'加算',
  desc:v=>`命中后额外造成 ${v} 点真实伤害`
});
defineEffectAtom('hp_drain_pct','吸血',{
  cat:'mechanic', domain:'battle', trigger:'on_hit', carriers:['equip','skill','passive'],
  mode:'pct', unit:'percent', equipStat:'hpDrainPct',
  valueName:'吸血比例', valueUnit:'%',
  valueHint:'填 10 = 按本次实际伤害的 10% 回血。', defaultTarget:'self', stackText:'加算',
  desc:v=>`按伤害的 ${v}% 回复自身 HP`
});
defineEffectAtom('mp_drain_pct','吸蓝',{
  cat:'mechanic', domain:'battle', trigger:'on_hit', carriers:['equip','skill','passive'],
  equipStat:'mpDrainPct',
  valueName:'吸取 MP', valueUnit:'点',
  valueHint:'填 5 = 命中时吸取 5 点 MP（固定点数，id 里的 pct 是历史遗留）。',
  defaultTarget:'self', stackText:'加算',
  desc:v=>`命中时吸取 ${v} 点 MP`
});
defineEffectAtom('poison_on_hit','攻击附加中毒',{
  cat:'mechanic', domain:'battle', trigger:'on_hit', carriers:['equip','passive'],
  equipStat:'poisonOnHit',
  valueName:'每回合毒伤', valueUnit:'点/回合',
  valueHint:'填 8 = 命中后目标每回合掉 8 HP，持续 3 回合，可叠层。',
  durationMode:'fixed', duration:3, defaultTarget:'self', stackText:'可叠层',
  desc:v=>`命中附加中毒 ${v}/回合（3 回合）`
});
defineEffectAtom('burn_on_hit','攻击附加灼烧',{
  cat:'mechanic', domain:'battle', trigger:'on_hit', carriers:['equip','passive'],
  equipStat:'burnOnHit',
  valueName:'每回合灼烧伤害', valueUnit:'点/回合',
  valueHint:'填 8 = 命中后目标每回合掉 8 HP，持续 3 回合，可叠层。',
  durationMode:'fixed', duration:3, defaultTarget:'self', stackText:'可叠层',
  desc:v=>`命中附加灼烧 ${v}/回合（3 回合）`
});
defineEffectAtom('bleed_on_hit','攻击附加流血',{
  cat:'mechanic', domain:'battle', trigger:'on_hit', carriers:['equip','passive'],
  equipStat:'bleedOnHit', valueName:'每回合流血伤害', valueUnit:'点/回合',
  valueHint:'填 8 = 命中后目标每回合掉 8 HP，持续 3 回合。',
  durationMode:'fixed', duration:3, defaultTarget:'self', stackText:'可叠层',
  desc:v=>`命中附加流血 ${v}/回合（3 回合）`
});
defineEffectAtom('silence_on_hit','攻击附加沉默',{
  cat:'mechanic', domain:'battle', trigger:'on_hit', carriers:['equip','passive'],
  mode:'rate', unit:'percent', equipStat:'silenceOnHit',
  valueName:'触发概率', valueUnit:'%',
  valueHint:'填 15 = 15% 概率让目标沉默 1 回合。',
  durationMode:'fixed', duration:1, defaultTarget:'self', stackText:'按概率触发',
  desc:v=>`命中时 ${v}% 概率附加沉默`
});
defineEffectAtom('freeze_on_hit','攻击附加冰冻',{
  cat:'mechanic', domain:'battle', trigger:'on_hit', carriers:['equip','passive'],
  mode:'rate', unit:'percent', equipStat:'freezeOnHit',
  valueName:'触发概率', valueUnit:'%',
  valueHint:'填 15 = 15% 概率让目标冰冻 1 回合。',
  durationMode:'fixed', duration:1, defaultTarget:'self', stackText:'按概率触发',
  desc:v=>`命中时 ${v}% 概率附加冰冻`
});
defineEffectAtom('petrify_on_hit','攻击附加石化',{
  cat:'mechanic', domain:'battle', trigger:'on_hit', carriers:['equip','passive'],
  mode:'rate', unit:'percent', equipStat:'petrifyOnHit', valueName:'触发概率', valueUnit:'%',
  valueHint:'填 10 = 10% 概率让目标石化 1 回合。',
  durationMode:'fixed', duration:1, defaultTarget:'self', stackText:'按概率触发',
  desc:v=>`命中时 ${v}% 概率附加石化`
});
defineEffectAtom('stun_on_hit','攻击附加眩晕',{
  cat:'mechanic', domain:'battle', trigger:'on_hit', carriers:['equip','passive'],
  mode:'rate', unit:'percent', equipStat:'stunOnHit', valueName:'触发概率', valueUnit:'%',
  valueHint:'填 10 = 10% 概率让目标眩晕 1 回合。',
  durationMode:'fixed', duration:1, defaultTarget:'self', stackText:'按概率触发',
  desc:v=>`命中时 ${v}% 概率附加眩晕`
});
defineEffectAtom('sure_hit','必中',{
  cat:'mechanic', domain:'battle', trigger:'always', carriers:['equip','passive','skill'],
  mode:'special', unit:'开关', equipStat:'sureHit', stack:'max',
  valueName:'开关', valueUnit:'1 = 开启',
  valueHint:'填 1 = 目标闪避无效。', defaultTarget:'self', stackText:'有任意一条即生效',
  desc:()=>'攻击必中'
});
defineEffectAtom('multi_hit','多发',{
  cat:'mechanic', domain:'battle', trigger:'active', carriers:['skill','equip'],
  unit:'段数', equipStat:'multiHit', stack:'max', valueName:'段数', valueUnit:'段',
  valueHint:'填 3 = 伤害均分 3 段，每段独立触发命中类词条。',
  defaultTarget:'enemy_front_single', stackText:'取最大值',
  desc:v=>`攻击分 ${v} 段`
});
defineEffectAtom('splash_pct','溅射',{
  cat:'mechanic', domain:'battle', trigger:'on_hit', carriers:['equip','passive'],
  mode:'pct', unit:'percent', equipStat:'splashPct', valueName:'溅射比例', valueUnit:'%',
  valueHint:'填 30 = 对目标同排其他人造成最终伤害的 30%。',
  defaultTarget:'self', stackText:'取最大值',
  desc:v=>`对同排溅射 ${v}% 伤害`
});
defineEffectAtom('counter_start','开局反击',{
  cat:'mechanic', domain:'battle', trigger:'battle_start', carriers:['equip','passive'],
  unit:'次', equipStat:'counterStart',
  valueName:'反击次数', valueUnit:'次',
  valueHint:'填 2 = 进入战斗获得 2 次反击，被打消耗 1 次。',
  defaultTarget:'self', stackText:'加算', desc:v=>`进入战斗获得 ${v} 次反击`
});
defineEffectAtom('reflect','反伤率',{
  cat:'mechanic', domain:'battle', trigger:'on_damaged', carriers:['equip','passive'],
  mode:'rate', unit:'rate', equipStat:'reflect',
  valueName:'反伤比例', valueUnit:'小数（0~1）',
  valueHint:'填 0.05 = 反弹原始伤害的 5%。', defaultTarget:'self', stackText:'加算',
  desc:v=>`受击时反弹 ${Math.round((v||0)*100)}% 伤害`
});

/* ============================================================
   三、主动技能 · 伤害
   ============================================================ */

defineEffectAtom('phys_dmg','物理伤害',{
  cat:'damage', mode:'special', carriers:['skill'],
  defaultTarget:'enemy_front_single',
  valueName:'基础物理伤害', valueUnit:'点',
  valueHint:'填 20 = 角色物攻 + 武器物攻 + 20，最后减防御。数值是相对普攻的额外加成，填 0 就等于普攻。',
  stackText:'按技能倍率结算', desc:v=>`物理伤害 ${v}`
});
defineEffectAtom('magic_dmg','魔法伤害',{
  cat:'damage', mode:'special', carriers:['skill'],
  defaultTarget:'enemy_front_single',
  valueName:'基础魔法伤害', valueUnit:'点',
  valueHint:'填 20 = 角色魔攻 + 武器魔攻 + 20，最后减防御。数值是相对普攻的额外加成，填 0 就等于普攻。',
  stackText:'按技能倍率结算', desc:v=>`魔法伤害 ${v}`
});
defineEffectAtom('true_dmg','真实伤害',{
  cat:'damage', mode:'special', carriers:['skill'],
  defaultTarget:'enemy_front_single',
  valueName:'真实伤害点数', valueUnit:'点',
  valueHint:'填 30 = 直接扣 30 HP，不减防御、不暴击、不被格挡。',
  stackText:'不叠加', desc:v=>`真实伤害 ${v}`
});
defineEffectAtom('hp_drain','生命吸取',{
  cat:'damage', mode:'special', carriers:['skill'],
  defaultTarget:'enemy_front_single',
  valueName:'固定伤害', valueUnit:'点',
  valueHint:'填 20 = 造成 20 点伤害并回复其中 50%。',
  desc:v=>`造成 ${v} 伤害并回复 50%`
});
defineEffectAtom('mp_drain','魔力吸取',{
  cat:'resource', carriers:['skill'], defaultTarget:'enemy_front_single',
  valueName:'吸取 MP', valueUnit:'点', valueHint:'填 10 = 目标扣 10 MP，自身加 10 MP。',
  desc:v=>`吸取 ${v} 点 MP`
});
defineEffectAtom('random_dmg','随机伤害',{
  cat:'damage', mode:'special', carriers:['skill'], defaultTarget:'enemy_front_single',
  valueName:'固定伤害', valueUnit:'点',
  valueHint:'命中固定分支时造成该值；另一分支按已损 HP 比例计算。',
  desc:()=>'随机造成固定伤害或已损 HP 比例伤害'
});
defineEffectAtom('random_choice','随机抽取',{
  cat:'mechanic', mode:'special', carriers:['skill'], defaultTarget:'self',
  valueName:'无实际数值', valueUnit:'',
  valueHint:'数值不参与结算，请在 options 里配置随机子效果。',
  desc:()=>'从若干子效果中随机执行一组'
});
defineEffectAtom('execute','斩杀',{
  cat:'mechanic', mode:'threshold', unit:'rate', carriers:['skill'],
  defaultTarget:'enemy_front_single',
  valueName:'斩杀阈值', valueUnit:'小数（0~1）',
  valueHint:'填 0.3 = 目标 HP 低于 30% 时直接击杀。',
  desc:v=>`目标 HP 低于 ${Math.round((v||0)*100)}% 时斩杀`
});
defineEffectAtom('betray','策反',{
  cat:'mechanic', mode:'rate', unit:'rate', carriers:['skill'],
  defaultTarget:'enemy_front_single',
  valueName:'策反概率', valueUnit:'小数（0~1）',
  valueHint:'填 0.2 = 20% 概率让目标退出战斗。',
  desc:v=>`${Math.round((v||0)*100)}% 概率使目标退出战斗`
});

/* ============================================================
   四、主动技能 · 治疗 / 资源 / 状态 / 战术
   ============================================================ */

defineEffectAtom('hp_heal','治疗 HP',{
  cat:'heal', carriers:['skill','item'], defaultTarget:'ally_single',
  valueName:'基础治疗量', valueUnit:'点',
  valueHint:'填 20 = 基础 20 点 + 施法者精神力×0.5。',
  desc:v=>`回复 ${v} HP`
});
defineEffectAtom('hp_heal_pct','治疗 HP %',{
  cat:'heal', mode:'pct', unit:'percent', carriers:['skill','item','passive'],
  defaultTarget:'ally_single',
  valueName:'治疗百分比', valueUnit:'%', valueHint:'填 10 = 回复目标最大 HP 的 10%。',
  desc:v=>`回复 ${v}% 最大 HP`
});
defineEffectAtom('mp_heal','治疗 MP',{
  cat:'heal', carriers:['skill','item','passive'], defaultTarget:'ally_single',
  valueName:'MP 恢复量', valueUnit:'点', valueHint:'填 15 = 回复 15 点 MP。',
  desc:v=>`回复 ${v} MP`
});
defineEffectAtom('mp_heal_pct','治疗 MP %',{
  cat:'heal', mode:'pct', unit:'percent', carriers:['skill','item','passive'],
  defaultTarget:'ally_single',
  valueName:'MP 恢复百分比', valueUnit:'%', valueHint:'填 10 = 回复目标最大 MP 的 10%。',
  desc:v=>`回复 ${v}% 最大 MP`
});
defineEffectAtom('revive','复活',{
  cat:'heal', mode:'rate', unit:'rate', carriers:['skill','item'],
  defaultTarget:'ally_single',
  valueName:'复活 HP 比例', valueUnit:'小数（0~1）',
  valueHint:'填 0.5 = 以 50% 最大 HP 复活。',
  desc:v=>`以 ${Math.round((v||0)*100)}% HP 复活`
});
defineEffectAtom('cleanse','清除负面',{
  cat:'resource', unit:'count', carriers:['skill','item'], defaultTarget:'ally_single',
  valueName:'清除个数', valueUnit:'个',
  valueHint:'填 1 = 清除 1 个负面；填 99 = 全部清除。',
  desc:v=>v>=99?'清除全部负面状态':`清除 ${v} 个负面状态`
});
defineEffectAtom('dispel','驱散增益',{
  cat:'resource', unit:'count', carriers:['skill'], defaultTarget:'enemy_front_single', valueName:'驱散个数', valueUnit:'个',
  valueHint:'填 1 = 移除目标 1 个增益；填 99 = 全部。',
  desc:v=>v>=99?'驱散目标全部增益':`驱散目标 ${v} 个增益`
});
defineEffectAtom('gold_cost','花金',{
  cat:'resource', carriers:['skill'], defaultTarget:'self',
  valueName:'金币数量', valueUnit:'金币',
  valueHint:'填 100 = 消耗 100 金币。', desc:v=>`消耗 ${Math.abs(v||0)} 金币`
});
defineEffectAtom('gold_steal','偷金',{
  cat:'resource', carriers:['skill'], defaultTarget:'enemy_front_single',
  valueName:'偷取金币', valueUnit:'金币', valueHint:'填 50 = 从目标身上偷 50 金币。',
  desc:v=>`偷取 ${v} 金币`
});
defineEffectAtom('hp_cost','技能消耗 HP',{
  cat:'resource', carriers:['skill'], defaultTarget:'self', valueName:'消耗 HP', valueUnit:'点', valueHint:'填 20 = 释放时先扣自己 20 HP。',
  desc:v=>`消耗 ${Math.abs(v||0)} HP`
});
defineEffectAtom('poison','中毒',{
  cat:'status', status:true, duration:3, carriers:['skill','item','passive'],
  defaultTarget:'enemy_front_single',
  valueName:'每回合毒伤', valueUnit:'点/回合', valueHint:'填 8 = 每回合掉 8 HP。',
  durationMode:'editable', duration:3, stackText:'可叠层',
  desc:v=>`每回合受到 ${v} 点毒伤`
});
defineEffectAtom('burn','灼烧',{
  cat:'status', status:true, duration:3, carriers:['skill','item','passive'],
  defaultTarget:'enemy_front_single',
  valueName:'每回合灼烧伤害', valueUnit:'点/回合', valueHint:'填 8 = 每回合掉 8 HP。',
  durationMode:'editable', duration:3, stackText:'可叠层',
  desc:v=>`每回合受到 ${v} 点灼烧伤害`
});
defineEffectAtom('bleed','流血',{
  cat:'status', status:true, duration:3, carriers:['skill','item','passive'], defaultTarget:'enemy_front_single',
  valueName:'每回合流血伤害', valueUnit:'点/回合', valueHint:'填 8 = 每回合掉 8 HP。',
  durationMode:'editable', duration:3, stackText:'可叠层',
  desc:v=>`每回合受到 ${v} 点流血伤害`
});
defineEffectAtom('silence','沉默',{
  cat:'status', status:true, duration:1, carriers:['skill','item','passive'],
  defaultTarget:'enemy_front_single',
  valueName:'无实际数值', valueUnit:'', valueHint:'沉默不读取数值，保持 1 即可；只能普攻，不能放技能。',
  durationMode:'editable', duration:1, desc:()=>'无法使用技能'
});
defineEffectAtom('freeze','冰冻',{
  cat:'status', status:true, duration:2, carriers:['skill','item','passive'],
  defaultTarget:'enemy_front_single',
  valueName:'无实际数值', valueUnit:'', valueHint:'冰冻不读取数值，保持 1 即可；只能普攻，不能放技能，并带有「冰 / 冰冻」标记。',
  durationMode:'editable', duration:2, desc:()=>'冰冻，无法使用技能'
});
defineEffectAtom('airborne','腾空',{
  cat:'status', status:true, duration:20, carriers:['skill','passive'],
  defaultTarget:'enemy_front_single', cleanseable:false,
  valueName:'无实际数值', valueUnit:'', valueHint:'腾空不读取数值；闪避 -20%，每回合损失 5% 最大 HP，不可被净化。',
  durationMode:'editable', duration:20, desc:()=>'腾空：闪避 -20%，每回合损失 5% 最大 HP'
});
defineEffectAtom('confusion','混乱',{
  cat:'status', status:true, duration:3, mode:'rate', unit:'rate',
  carriers:['skill','item','passive'], defaultTarget:'enemy_front_single',
  valueName:'混乱触发概率', valueUnit:'小数（0~1）',
  valueHint:'填 0.3 = 30% 概率攻击自己人。', durationMode:'editable', duration:3,
  desc:v=>`${Math.round((v||0)*100)}% 概率攻击自己人`
});
defineEffectAtom('petrify','石化',{
  cat:'status', status:true, duration:1, carriers:['skill','item','passive'], defaultTarget:'enemy_front_single',
  valueName:'无实际数值', valueUnit:'', valueHint:'石化不读取数值，保持 1 即可；无法行动，防御 +20%。',
  durationMode:'editable', duration:1, desc:()=>'石化：无法行动，防御 +20%'
});
defineEffectAtom('stun','眩晕',{
  cat:'status', status:true, duration:1, carriers:['skill','item','passive'], defaultTarget:'enemy_front_single',
  valueName:'无实际数值', valueUnit:'', valueHint:'眩晕不读取数值，保持 1 即可。',
  durationMode:'editable', duration:1, desc:()=>'眩晕，无法行动'
});
defineEffectAtom('phys_atk_down_pct','物攻下降 %',{
  cat:'status', status:true, mode:'pct', unit:'percent', carriers:['skill','item'],
  defaultTarget:'enemy_front_single',
  valueName:'物攻下降百分比', valueUnit:'%', valueHint:'填 20 = 目标物理攻击 -20%。',
  durationMode:'editable', duration:3, stackText:'同名取最大值',
  desc:v=>`物理攻击 -${v}%`
});
defineEffectAtom('magic_atk_down_pct','魔攻下降 %',{
  cat:'status', status:true, mode:'pct', unit:'percent', carriers:['skill','item'],
  defaultTarget:'enemy_front_single',
  valueName:'魔攻下降百分比', valueUnit:'%', valueHint:'填 20 = 目标魔法攻击 -20%。',
  durationMode:'editable', duration:3, stackText:'同名取最大值',
  desc:v=>`魔法攻击 -${v}%`
});
defineEffectAtom('def_up_pct','防御 %',{
  cat:'stat', domain:'panel', trigger:'always', carriers:['equip','skill','passive'],
  mode:'pct', unit:'percent', equipStat:'defPct', status:true,
  valueName:'防御百分比', valueUnit:'%', valueHint:'填 20 = 防御 +20%。',
  durationMode:'editable', duration:3, stackText:'加算',
  desc:v=>`防御 +${v}%`
});
defineEffectAtom('def_down_pct','防御下降 %',{
  cat:'status', status:true, mode:'pct', unit:'percent', carriers:['skill','item'],
  defaultTarget:'enemy_front_single',
  valueName:'防御下降百分比', valueUnit:'%', valueHint:'填 20 = 目标防御 -20%。',
  durationMode:'editable', duration:3, stackText:'同名取最大值',
  desc:v=>`防御 -${v}%`
});
defineEffectAtom('taunt','嘲讽',{
  cat:'mechanic', carriers:['skill'], defaultTarget:'enemy_front_single', valueName:'持续回合', valueUnit:'回合', valueHint:'填 1 = 目标下回合只能攻击施法者。',
  desc:v=>`强制目标攻击自己 ${v} 回合`
});
defineEffectAtom('guard','守护',{
  cat:'mechanic', carriers:['skill'], defaultTarget:'ally_single', valueName:'无实际数值', valueUnit:'', valueHint:'填 1 即可；施法者替目标承受伤害。',
  desc:()=>'替目标承受伤害'
});
defineEffectAtom('mark','标记',{
  cat:'mechanic', carriers:['skill'], defaultTarget:'enemy_front_single', valueName:'无实际数值', valueUnit:'', valueHint:'填 1 即可；打上「印记」标签，供条件与后续技能查询。',
  desc:()=>'打上印记'
});
defineEffectAtom('counter','反击次数',{
  cat:'mechanic', unit:'count', carriers:['skill','item'], defaultTarget:'self',
  valueName:'反击次数', valueUnit:'次', valueHint:'填 1 = 获得 1 次反击。',
  desc:v=>`获得 ${v} 次反击`
});

/* ============================================================
   五、被动 · 场景 / 结算
   ============================================================ */

defineEffectAtom('pet_stat_up_pct','宠物属性 +%',{
  cat:'mechanic', domain:'battle', trigger:'always', carriers:['passive'],
  mode:'pct', unit:'percent',
  valueName:'宠物属性加成', valueUnit:'%',
  valueHint:'填 100 = 宠物的 HP、MP、物攻、魔攻各 +100%。',
  stackText:'加算', defaultTarget:'self',
  desc:v=>`宠物 HP/MP/物攻/魔攻 +${v}%`
});
defineEffectAtom('shop_discount','商店折扣',{
  cat:'stat', domain:'field', trigger:'always', carriers:['passive'],
  mode:'pct', unit:'percent',
  valueName:'折扣百分比', valueUnit:'%', valueHint:'填 20 = 购买价 -20%。',
  stackText:'取最大值', desc:v=>`商店购买价格 -${v}%`
});
defineEffectAtom('sell_bonus','出售加成',{
  cat:'stat', domain:'field', trigger:'always', carriers:['passive'],
  mode:'pct', unit:'percent',
  valueName:'出售加成', valueUnit:'%', valueHint:'填 10 = 售价 +10%。',
  stackText:'取最大值', desc:v=>`出售价格 +${v}%`
});
defineEffectAtom('gold_bonus','结算金币 +%',{
  cat:'stat', domain:'field', trigger:'on_settle', carriers:['passive','equip'],
  mode:'pct', unit:'percent',
  valueName:'金币加成', valueUnit:'%', valueHint:'填 10 = 战斗胜利金币 +10%。',
  stackText:'加算', desc:v=>`战斗金币 +${v}%`
});
defineEffectAtom('exp_bonus','结算经验 +%',{
  cat:'stat', domain:'field', trigger:'on_settle', carriers:['passive','equip'],
  mode:'pct', unit:'percent',
  valueName:'经验加成', valueUnit:'%', valueHint:'填 10 = 战斗经验 +10%。',
  stackText:'加算', desc:v=>`战斗经验 +${v}%`
});
defineEffectAtom('drop_bonus','掉落率 +%',{
  cat:'stat', domain:'field', trigger:'on_settle', carriers:['passive','equip'],
  mode:'pct', unit:'percent',
  valueName:'掉落率加成', valueUnit:'%', valueHint:'填 10 = 掉率 +10%。',
  stackText:'加算', desc:v=>`掉落率 +${v}%`
});
defineEffectAtom('mp_cost_down_pct','技能耗蓝 -%',{
  cat:'stat', domain:'battle', trigger:'always', carriers:['passive','equip'],
  mode:'pct', unit:'percent', equipStat:'mpCostDown',
  valueName:'耗蓝减免', valueUnit:'%', valueHint:'填 20 = 技能 MP 消耗 -20%。',
  stackText:'加算', desc:v=>`技能 MP 消耗 -${v}%`
});
defineEffectAtom('no_cost_chance','概率不消耗',{
  cat:'stat', domain:'battle', trigger:'active', carriers:['passive','equip'],
  mode:'rate', unit:'rate', equipStat:'noCostChance',
  valueName:'触发概率', valueUnit:'小数（0~1）',
  valueHint:'填 0.1 = 10% 概率本次技能不消耗 MP/HP/金币。',
  stackText:'加算', desc:v=>`${Math.round((v||0)*100)}% 概率不消耗资源`
});


defineEffectAtom('repair_discount','修理费 -%',{
  cat:'stat', domain:'field', trigger:'always', carriers:['passive'], mode:'pct', unit:'percent',
  valueName:'修理折扣', valueUnit:'%', valueHint:'填 20 = 修理费 -20%。',
  desc:v=>`修理费用 -${v}%`
});


/* ============================================================
   六、道具 · 使用一次就结算
   ============================================================ */

defineEffectAtom('buff_temp','临时属性',{
  cat:'stat', status:true, carriers:['item'], todo:true,
  defaultTarget:'ally_single',
  valueName:'属性增量', valueUnit:'点 / %',
  valueHint:'需配合 buffStat 字段：buffStat=phys_atk_up_pct 时填 20 表示物攻 +20%。',
  durationMode:'editable', duration:3,
  desc:v=>`临时属性 +${v}`
});
defineEffectAtom('cure_status','解除指定状态',{
  cat:'heal', carriers:['item'], defaultTarget:'ally_single', todo:true,
  valueName:'无实际数值', valueUnit:'',
  valueHint:'数值不参与结算，请勾选要解除的状态。',
  desc:()=>'解除指定负面状态'
});


defineEffectAtom('exp_potion','直接给经验',{
  cat:'resource', carriers:['item'], defaultTarget:'ally_single', valueName:'经验值', valueUnit:'点', valueHint:'填 100 = 使用者获得 100 经验。',
  desc:v=>`获得 ${v} 经验`
});
/* 送礼专用：好感度变化（可正可负）。
   由 main.js 的 doGift 结算，不会在战斗/行囊使用里生效。 */
defineEffectAtom('affinity','好感度变化',{
  cat:'resource', domain:'field', trigger:'on_use', carriers:['item'],
  unit:'点',
  valueName:'好感度增减', valueUnit:'点',
  valueHint:'填 20 = 送礼后好感 +20；填 -20 = 好感 -20。默认与 NPC 偏好叠加；道具勾选「固定礼物数值」后以该值为准（不叠加偏好）。最终结果限制在 0 ~ 对方好感上限。',
  desc:v=>{
    const n = Number(v) || 0;
    return n > 0 ? ('好感度 +' + n) : (n < 0 ? ('好感度 ' + n) : '好感度不变');
  }
});

/* ============================================================
   状态标签（tag）
   ------------------------------------------------------------
   中毒/灼烧/流血底层完全一样，靠 tags 区分：判断、解除、免疫都查 tag。
   mechanic 只用于批次结算（如 dot 每回合掉血）。
   ============================================================ */
const STATUS_META = {
  poison:    { mechanic:'dot',         tags:['dot','负面','毒'] },
  burn:      { mechanic:'dot',         tags:['dot','负面','火'] },
  bleed:     { mechanic:'dot',         tags:['dot','负面','血流'] },
  silence:   { mechanic:'skill_lock',  tags:['控制','负面','沉默'] },
  freeze:    { mechanic:'skill_lock',  tags:['控制','负面','冰','冰冻'] },
  airborne:  { mechanic:'airborne',    tags:['控制','负面','腾空'] },
  confusion: { mechanic:'confuse',     tags:['控制','负面','混乱'] },
  stun:      { mechanic:'skip_action', tags:['控制','负面','眩晕'] },
  petrify:   { mechanic:'skip_action', tags:['控制','负面','石化'] },
  taunt:     { mechanic:'redirect',    tags:['行为','负面','嘲讽'] },
  guard:     { mechanic:'redirect',    tags:['行为','正面','守护'] },
  mark:      { mechanic:'mark',        tags:['行为','中性','印记'] },
  phys_atk_up_pct:   { tags:['正面','增攻'] },
  magic_atk_up_pct:  { tags:['正面','增攻'] },
  def_up_pct:        { tags:['正面','增防'] },
  spd_up:            { tags:['正面','加速'] },
  phys_atk_down_pct: { tags:['负面','降攻'] },
  magic_atk_down_pct:{ tags:['负面','降攻'] },
  def_down_pct:      { tags:['负面','破甲'] },
  spd_down:          { tags:['负面','减速'] },
  buff_temp:         { tags:['正面','临时属性'] }
};
Object.keys(STATUS_META).forEach(id => {
  if(EFFECT_ATOMS[id]) Object.assign(EFFECT_ATOMS[id], STATUS_META[id]);
});

/* 对应解除：每个施加状态一条，curesTag 指向要移除的标签。 */
const CURE_DEFS = [
  ['cure_poison', '解毒',   '毒',   '解除中毒'],
  ['cure_burn',   '灭火',   '火',   '解除灼烧'],
  ['cure_bleed',  '止血',   '血流', '解除流血'],
  ['cure_silence','解默',   '沉默', '解除沉默'],
  ['cure_freeze', '融冰',   '冰冻', '解除冰冻'],
  ['cure_confuse','清心',   '混乱', '解除混乱'],
  ['cure_stun',   '醒神',   '眩晕', '解除眩晕'],
  ['cure_petrify','破石',   '石化', '解除石化'],
  ['cure_mark',   '去印记', '印记', '解除印记']
];
CURE_DEFS.forEach(def => {
  defineEffectAtom(def[0], def[1], {
    cat:'heal', carriers:['skill','item'], trigger:'active',
    defaultTarget:'ally_single', curesTag:def[2],
    valueName:'无实际数值', valueUnit:'', valueHint:'填 1 即可，只解除对应状态。',
    desc:()=>def[3]
  });
});

/* ============================================================
   判断（条件）
   ------------------------------------------------------------
   不产生数值，只决定本次施放是否成立。
   编辑器里作为效果行添加，执行时全部判断通过才继续。
   ============================================================ */
const COND_DEFS = [
  ['cond_target_has_tag',   '判断：目标带有状态',     'target_has_tag'],
  ['cond_target_no_tag',    '判断：目标没有状态',     'target_no_tag'],
  ['cond_target_full_hp',   '判断：目标满血',         'target_full_hp'],
  ['cond_target_hp_below',  '判断：目标血量低于 %',   'target_hp_below'],
  ['cond_target_acted',     '判断：目标本回合已行动', 'target_acted'],
  ['cond_target_not_acted', '判断：目标本回合未行动', 'target_not_acted'],
  ['cond_target_row',       '判断：目标在某排',       'target_row'],
  ['cond_self_hp_below',    '判断：自身血量低于 %',   'self_hp_below'],
  ['cond_enemy_count',      '判断：场上敌人数量',     'enemy_count']
];
COND_DEFS.forEach(def => {
  defineEffectAtom(def[0], def[1], {
    cat:'mechanic', carriers:['skill'], trigger:'active', cond:true, condType:def[2],
    defaultTarget:'enemy_front_single',
    valueName:'参数', valueUnit:'',
    valueHint:'带 % 的填百分比（20 = 20%）；数量填 N；其它保持 1。',
    desc:()=>def[1]
  });
});

function isCondAtom(type){
  const a = getEffectAtom(type);
  return !!(a && a.cond);
}

/* 免疫：带该标签的状态无法施加到持有者身上 */
defineEffectAtom('immune_tag','免疫标签',{
  cat:'mechanic', carriers:['equip','passive'], trigger:'always', immune:true,
  valueName:'无实际数值', valueUnit:'',
  valueHint:'数值保持 1；右边填要免疫的标签（毒/火/血流/沉默/冰冻/混乱/眩晕/石化/冰）。',
  desc:()=>'免疫指定标签'
});

/* 道具：直接获得金币 / 永久属性 */
defineEffectAtom('gain_gold','获得金币',{
  cat:'resource', domain:'field', trigger:'on_use', carriers:['item'], valueName:'金币数量', valueUnit:'金币', valueHint:'填 100 = 使用后获得 100 金币。',
  desc:v=>`获得 ${v} 金币`
});
defineEffectAtom('perm_vit_up','永久体力 +',{
  cat:'stat', domain:'field', trigger:'on_use', carriers:['item'], valueName:'体力加值', valueUnit:'点', valueHint:'填 1 = 永久体力 +1（写进角色存档）。',
  desc:v=>`永久体力 +${v}`
});
defineEffectAtom('perm_spi_up','永久精神 +',{
  cat:'stat', domain:'field', trigger:'on_use', carriers:['item'], valueName:'精神力加值', valueUnit:'点', valueHint:'填 1 = 永久精神力 +1。',
  desc:v=>`永久精神力 +${v}`
});
defineEffectAtom('perm_hp_up','额外生命上限 +',{
  cat:'stat', domain:'field', trigger:'on_use', carriers:['item'], valueName:'额外生命上限', valueUnit:'点',
  valueHint:'填 50 = 永久额外生命上限 +50；只加上限，不补当前 HP。',
  desc:v=>`额外生命上限 +${v}`
});
defineEffectAtom('perm_mp_up','额外魔力上限 +',{
  cat:'stat', domain:'field', trigger:'on_use', carriers:['item'], valueName:'额外魔力上限', valueUnit:'点',
  valueHint:'填 20 = 永久额外魔力上限 +20；只加上限，不补当前 MP。',
  desc:v=>`额外魔力上限 +${v}`
});
defineEffectAtom('inspect_tile_characters','窥探当前地图格',{
  cat:'mechanic', domain:'field', trigger:'on_use', carriers:['item'],
  valueName:'无实际数值', valueUnit:'',
  valueHint:'填 1；使用后打开独立弹窗，查看当前地图格内非隐藏角色的成长值与全部被动。',
  desc:()=>'查看当前地图格角色的成长与被动'
});

/* 装备耐久（预留，结算尚未接入） */
defineEffectAtom('durability_up','耐久上限 +',{
  cat:'stat', domain:'battle', trigger:'always', carriers:['equip'], valueName:'耐久上限', valueUnit:'点', valueHint:'提高装备耐久上限。',
  desc:v=>`耐久上限 +${v}`
});
defineEffectAtom('wear_down','磨损速度 -',{
  cat:'stat', domain:'battle', trigger:'always', carriers:['equip'],
  mode:'pct', unit:'percent', valueName:'磨损降低', valueUnit:'%', valueHint:'填 20 = 磨损速度 -20%。',
  desc:v=>`磨损速度 -${v}%`
});
defineEffectAtom('durability_guard','破损保护',{
  cat:'mechanic', domain:'battle', trigger:'always', carriers:['equip'], valueName:'无实际数值', valueUnit:'', valueHint:'填 1 = 耐久归零时不销毁。',
  desc:()=>'耐久归零不销毁'
});

/* ============================================================
   查询工具
   ============================================================ */

/* ---- 四本独立词条库 ----
   编辑层分开：每个载体只读自己那本（编辑器不再按 carriers 过滤）。
   运行层合并：getEffectAtom 仍按 id 全局查找，战斗与存档不受影响。
   以后要让某条词条只属于一个载体，直接写进对应的库即可。 */
const EFFECT_LIBS = { skill:{}, passive:{}, equip:{}, item:{} };
Object.keys(EFFECT_ATOMS).forEach(id => {
  const a = EFFECT_ATOMS[id];
  (a.carriers || []).forEach(c => {
    if(EFFECT_LIBS[c]) EFFECT_LIBS[c][id] = a;
  });
});

function effectLib(carrier){ return EFFECT_LIBS[carrier] || {}; }

function getEffectAtom(id){ return EFFECT_ATOMS[id] || null; }

/* 状态的标签与机制 */
function statusTagsOf(type){
  const a = getEffectAtom(type);
  return (a && Array.isArray(a.tags)) ? a.tags : [];
}
function statusHasTag(type, tag){
  return statusTagsOf(type).indexOf(tag) >= 0;
}
function statusMechanicOf(type){
  const a = getEffectAtom(type);
  return (a && a.mechanic) || '';
}

function effectLabelMap(carrier){
  const out = {};
  if(carrier){
    const lib = effectLib(carrier);
    for(const id in lib) out[id] = lib[id].name;
    return out;
  }
  for(const id in EFFECT_ATOMS) out[id] = EFFECT_ATOMS[id].name;
  return out;
}

/* 编辑器用：按载体取词条，按 cat 排序；todo 的排在最后并带标记 */
function effectAtomsFor(carrier){
  const order = ['damage','heal','status','stat','resource','mechanic'];
  const lib = effectLib(carrier);
  return Object.keys(lib)
    .map(id => lib[id])
    .sort((a, b) => {
      if(!!a.todo !== !!b.todo) return a.todo ? 1 : -1;
      const ca = order.indexOf(a.cat), cb = order.indexOf(b.cat);
      if(ca !== cb) return ca - cb;
      return a.id.localeCompare(b.id);
    });
}

function effectAtomsByCat(carrier){
  const groups = {};
  effectAtomsFor(carrier).forEach(a => {
    if(!groups[a.cat]) groups[a.cat] = [];
    groups[a.cat].push(a);
  });
  return Object.keys(groups).map(cat => ({
    cat: cat,
    label: EFFECT_CAT_LABEL[cat] || cat,
    atoms: groups[cat]
  }));
}

function buildEffectDescMap(){
  const m = {};
  for(const id in EFFECT_ATOMS){
    const a = EFFECT_ATOMS[id];
    if(a.cat === 'damage') continue;   /* 伤害由技能面板单独计算显示 */
    m[id] = (typeof a.desc === 'function')
      ? a.desc
      : function(){ return a.desc || a.name; };
  }
  return m;
}
const EFFECT_DESC = buildEffectDescMap();

function effectHasDuration(id){
  const a = getEffectAtom(id);
  return !!(a && a.status);
}
function effectAllowedFor(id, carrier){
  const a = getEffectAtom(id);
  return !!(a && a.carriers && a.carriers.indexOf(carrier) >= 0);
}
function effectValueMeta(id){
  return EFFECT_ATOMS[id] || null;
}
