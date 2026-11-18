/* ============================================================
   data-classes.js — 称号 / 职业建筑 / 被动技能（角色养成）
   ------------------------------------------------------------
   职业只提供被动效果、主动技能池和功能限制，不提供基础属性 / 成长值。
   每个角色（含玩家）的 base / growth 由角色卡自己保存。
   ============================================================ */

/* ============================================================
   TITLES —— 称号表
   ------------------------------------------------------------
   所有称号统一注册在这里。
   字段：
     id     内部 id（存档里存的就是它）
     name   中文名（报幕、称号栏显示用）
     desc   描述（称号栏展开时显示）

   新增称号流程：
     1. 这里加一条
     2. 触发点调用 addTitle('t_xxx') 或 action {type:'add_title', titleId:'t_xxx'}
     报幕 / 入库 / UI 刷新全自动。
   ============================================================ */
const TITLES = {
  t_ray_grandson: {
    id:'t_ray_grandson', name:'雷之孙',
    desc:'替雷克的孙子扛下了这个名号。'
  },
  t_class_rookie: {
    id:'t_class_rookie', name:'职业新星',
    desc:'获得了第一个职业。'
  },
  t_ray_heir: {
    id:'t_ray_heir', name:'雷之继承者',
    desc:'雷克把跟了他四十年的剑，交给了你。'
  },
  t_first_meet: {
    id:'t_first_meet', name:'初识者',
    desc:'走过了三个职业，见识了这个世界三种不同的活法。'
  },
  t_freedom: {
    id:'t_freedom', name:'自由斗士',
    desc:'路，是自己选的。'
  }
};

/* 职业标签：九大职业默认以自身为标签（不写也行）；
   隐藏职业可挂若干个基础职业标签，视为“进阶”，装备/技能按标签匹配。
   由职业编辑器导出：Object.assign(CLASS_TAGS, { '影武者':['战士','杀手'] }); */
const CLASS_TAGS = {};
Object.assign(CLASS_TAGS, {
  '圣骑士': ['战士'],
  '魔骑士': ['战士'],
  '近战法师': ['杀手','法师'],
  '狂人': ['炼金术师','阵法师'],
  '飞行家': ['商人'],
  '翼骑士': ['巡警','疗愈师'],
  '铁浮屠': ['铁匠'],
  '驯兽师': ['巡警']
});

/* 隐藏职业：不出现在公开的九大职业选择器，只用于转职/职业编辑 */
const HIDDEN_CLASSES = ['圣骑士','魔骑士','近战法师','狂人','飞行家','翼骑士','铁浮屠','驯兽师'];

/* 职业主动技能池：技能编辑器里 classLimit 指到该职业的技能。
   新职业可以在「职业 / 称号」编辑器里追加/覆盖这个列表。 */
const CLASS_ACTIVE_SKILLS = {};
Object.keys(SKILLS).forEach(function(id){
  const cls = SKILLS[id].classLimit;
  if(!cls) return;
  (CLASS_ACTIVE_SKILLS[cls] = CLASS_ACTIVE_SKILLS[cls] || []).push(id);
});

const PROFESSION_BUILDINGS = {
  '魔能塔':['法师','阵法师'],'战士学院':['战士'],'黑市':['杀手'],'魔药店':['炼金术师'],
  '炼金工坊':['炼金术师','铁匠'],'高尖塔':['疗愈师'],'冒险者工会':['商人'],
  '铁匠铺':['铁匠'],'城主府':['巡警']
};

/* 职业被动：每个职业一条，不设等级（不做升级，也没有 levels 字段）。
   角色个性化被动写在角色卡的 personalPassives 字段，与职业被动同时生效。 */
const PASSIVE_SKILLS = {
  '战士':{name:'战意',effects:[{type:'phys_atk_up_pct',value:15,scope:'battle'}]},
  '法师':{name:'奥术亲和',effects:[{type:'magic_atk_up_pct',value:15,scope:'battle'}]},
  '巡警':{name:'威慑',effects:[{type:'def_up',value:2}]},
  '杀手':{name:'猎杀',effects:[{type:'mp_heal',value:5,trigger:'turn_start'}]},
  '疗愈师':{name:'生命共鸣',effects:[{type:'hp_heal_pct',value:3,trigger:'turn_end'}]},
  '阵法师':{name:'阵眼',effects:[{type:'mp_heal_pct',value:3,trigger:'turn_end'}]},
  '铁匠':{name:'坚韧体魄',effects:[{type:'maxhp_up_pct',value:15}]},
  '商人':{name:'议价',effects:[{type:'shop_discount',value:20,scope:'field'},{type:'sell_bonus',value:10,scope:'field'}]},
  '炼金术师':{name:'催化',effects:[{type:'poison',value:8,duration:6,target:'enemy_all',scope:'battle',trigger:'battle_start',chance:0.1}]},

  /* ---- 隐藏职业 ---- */
  '圣骑士':{name:'圣光誓约',hidden:true,effects:[{type:'dmg_vs_demon_pct',value:30}]},
  '魔骑士':{name:'魔铠',hidden:true,effects:[{type:'def_vs_demon_pct',value:80}]},
  '近战法师':{name:'近身施法',hidden:true,effects:[{type:'spd_flat',value:-6}]},
  '狂人':{name:'疯狂',hidden:true,effects:[{type:'maxhp_up_pct',value:-20},{type:'maxmp_up_pct',value:100}]},
  '飞行家':{name:'轻身',hidden:true,effects:[{type:'dodge',value:0.35}]},
  '翼骑士':{name:'翼展',hidden:true,effects:[{type:'airborne',value:1,duration:20,target:'enemy_all',trigger:'battle_start'}]},
  '铁浮屠':{name:'铁壁',hidden:true,effects:[
    {type:'spd_down',value:2,duration:20,target:'ally_all',trigger:'battle_start'},
    {type:'def_up_pct',value:50,duration:20,target:'ally_all',trigger:'battle_start'}
  ]},
  '驯兽师':{name:'兽语',hidden:true,effects:[{type:'pet_stat_up_pct',value:100}]}
};
