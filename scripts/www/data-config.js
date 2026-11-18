/* ============================================================
   data-config.js — 全局常量 + 升级经验曲线
   ============================================================ */

/* 调试：商店是否展示所有物品（含尚未设计的 draft 装备）。
   方便测试全物品；正式发布可改为 false。 */
let DEBUG_SHOW_ALL_ITEMS_IN_SHOP = true;

const SAVE_KEY = 'luoshuigou_save_v2';
const SAVE_COUNT = 6;
const DEBUG_PWD = 'xixi';
const MAP_CELL_SIZE = 80;
const TOWN_CELL_SIZE = 150;
const SLOT_ORDER_5 = [2,1,3,0,4];
/* ============================================================
   战斗四率上限（硬顶，装备/技能/永久道具叠加超过也只按上限算）
   ------------------------------------------------------------
   面板显示与实际结算都用这里的封顶值，多出来的部分直接作废。
   ============================================================ */
/* 调试面板增强版会运行时改这些值，因此用 let（不要改回 const） */
let DODGE_CAP     = 0.75;   // 闪避率上限 75%
let HIT_CAP       = 1.50;   // 命中率上限 150%
let CRIT_RATE_CAP = 0.75;   // 暴击率上限 75%
let CRIT_MULT_CAP = 3.00;   // 暴击倍数上限 3.0
/* 技能熟练度门槛（职业技能 6 级，兜底用；玩家技能以 data-skills 每级自带 proficiency 为准） */
const PROF_CURVE = [0,50,180,400,750,1000];
let SPD_MIN = 0.1;
let STACK_MAX = 99;
let BATTLE_DROP_CAP = 5;   // 单场战斗，每种掉落物品的数量上限

/* ============================================================
   自动时间 / 年龄 / 寿命
   ------------------------------------------------------------
   · 30 秒现实时间 = 1 游戏小时（可改 msPerGameHour）
   · 20 游戏年触发结局（GAME_YEAR_LIMIT）
   · 全角色默认出场 20 岁、死亡 80 岁；编辑器可逐角色改
   · 唯一角色老死 = 永久死亡；非唯一角色 = 物种/刷新个体
   ============================================================ */
const AUTO_TIME_CONFIG = {
  msPerGameHour: 30000,
  pauseInBattle: true,
  pauseInStory: true,
  pauseInModal: true,
  pauseInQueue: true,
  pauseWhenHidden: true
};
let GAME_YEAR_LIMIT = 20;
const DEFAULT_APPEARANCE_AGE = 20;
const DEFAULT_DEATH_AGE = 80;
const AGE_YEAR_HOURS = 360 * 24;   // 1 游戏年 = 360 天 × 24 小时
/* 新游戏开局：1 年 1 月 1 日 8 时；按 timeToHours 的累计口径计算 */
const GAME_START_HOURS = (1 * 12 * 30) * 24 + 8;
const ACTOR_RESPAWN_HOURS = 48;    // 地图角色/宠物刷新周期

/* 升级经验曲线（改这里即可调整所有角色含 NPC） */
function calcExpMax(level){
  const lv = Math.max(1, level);
  if(lv <= 10){
    return Math.floor(50 + 30 * Math.pow(lv, 1.15));
  }
  /* 10 级处平滑接续，之后按等比增长。
     1.12：到 60 级约 871 场标准战斗（3 敌/场），对应 20 游戏年内的节奏。
     若改回 1.18，到 60 级需要约 7609 场，60 级内容实际不可达。 */
  const base10 = 50 + 30 * Math.pow(10, 1.15);
  return Math.floor(base10 * Math.pow(1.12, lv - 10));
}
