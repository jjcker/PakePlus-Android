/* ============================================================
   data-crafting.js — 合成表
   ------------------------------------------------------------
   一条配方 = 材料(1~5 种) → 产出(1 种)
   字段：
     id         唯一编号（英文，导出代码时用）
     name       配方名字（玩家在合成面板看到）
     desc       描述（可选）
     kind       'craft'（默认，装备/物品合成）
                'advance'（品阶提升：原地升级一件装备）
     materials  材料数组，最多 5 项：{id:'eq_w001', count:3}
     result     产出：{id:'eq_w011', count:1}（仅 craft）

   进阶配方（kind:'advance'）额外字段：
     from / to  起始品阶 / 目标品阶（common/useful/epic/legend/doom）
     gold       花费金币
     · 进阶时玩家还要在"词条材料槽"里放一件带 func.kind='word' 的材料，
       该材料决定装备新获得的词条。
   ============================================================ */

const CRAFTING_RECIPES = [

  /* 示例 1：三把生锈铁剑 + 两块铁矿石 = 一把青锋 */
  {
    id:'craft001',
    name:'重铸铁剑',
    desc:'三把生锈的铁剑加上两块铁矿石，重新锻造成一把制式长剑。',
    materials:[
      {id:'eq_w001', count:3},
      {id:'item_o101', count:2}
    ],
    result:{id:'eq_w005', count:1}
  },

  /* 示例 2：两瓶红药水 + 一瓶蓝药水 = 一瓶红药水（中） */
  {
    id:'craft002',
    name:'药水浓缩',
    desc:'把两瓶红药水和一瓶蓝药水合并，浓缩成中阶药水。',
    materials:[
      {id:'item_c001', count:2},
      {id:'item_c002', count:1}
    ],
    result:{id:'item_c003', count:1}
  },

  /* 示例 3：三块精铁矿 = 一块玄铁矿 */
  {
    id:'craft003',
    name:'矿石提炼',
    desc:'三块精铁矿可以熔炼出一块玄铁矿。',
    materials:[
      {id:'item_o102', count:3}
    ],
    result:{id:'item_o103', count:1}
  },

  /* 示例 4：品阶提升（平凡 → 实用）
     玩家还要额外选一件带词条功能的材料放进"词条材料槽"。 */
  {
    id:'adv001',
    kind:'advance',
    name:'平凡装备进阶为实用',
    desc:'把一件平凡装备提升为实用品阶，并追加材料提供的词条。',
    from:'common',
    to:'useful',
    gold:500,
    materials:[
      {id:'item_o101', count:3}
    ]
  },

  /* 实用 → 史诗：银精提供词条 */
  {
    id:'adv002',
    kind:'advance',
    name:'实用装备进阶为史诗',
    desc:'把一件实用装备提升为史诗品阶，并追加银精提供的词条。',
    from:'useful',
    to:'epic',
    gold:2500,
    materials:[
      {id:'item_o102', count:3}
    ]
  },

  /* 史诗 → 传说：秘银提供词条 */
  {
    id:'adv003',
    kind:'advance',
    name:'史诗装备进阶为传说',
    desc:'把一件史诗装备提升为传说品阶，并追加秘银提供的词条。',
    from:'epic',
    to:'legend',
    gold:12000,
    materials:[
      {id:'item_o103', count:3}
    ]
  },

  /* 传说 → 毁灭：星辉矿提供词条 */
  {
    id:'adv004',
    kind:'advance',
    name:'传说装备进阶为毁灭',
    desc:'把一件传说装备提升为毁灭品阶，并追加星辉矿提供的词条。',
    from:'legend',
    to:'doom',
    gold:40000,
    materials:[
      {id:'item_o104', count:3}
    ]
  }

];