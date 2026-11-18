/* ============================================================
   data-world.js — 城镇 / 地图节点 / 遭遇战
   ============================================================ */

/* ============================================================
   地图三级层级：
   一级 WORLD_REGIONS —— 世界大区（霜城 / 冒险之森），纯展示
   二级 TOWNS         —— 大区下的小区格（霜城4个：和谐镇/主城区/银月港/天冰镇）
                        冒险之森无小区格，不进二级，直接进三级
   三级 MAPS          —— 街道步行格，玩家实际操作层
   ============================================================ */

/* 一级：世界大区（col/row 由 computeMapLayout 自动推算，不手写） */
const WORLD_GRID = {cols:8, rows:4};
const WORLD_REGIONS = [
  {id:'region01', name:'霜城',     col:0, row:0, hasSubTown:true},
  {id:'region02', name:'冒险之森', col:0, row:0, directMap:'region02'},
  {id:'region03', name:'王都',     col:0, row:0, hasSubTown:true},
  {id:'region04', name:'漠西城',     col:0, row:0, hasSubTown:true},
  {id:'region05', name:'迷途岛',   col:0, row:0, directMap:'region05'},
  {id:'region06', name:'绝境沙漠', col:0, row:0, directMap:'region06'}
];

/* 二级：各区域下的"城镇级"节点（仓库 / 王府 / 地下城等内部场景不在此列） */
const TOWN_GRID = {cols:5, rows:5};
const TOWNS = [
  /* ---- 霜城 ---- */
  {id:'region01-town01', name:'和谐镇',   col:0, row:0, links:['region01-town02']},
  {id:'region01-town02', name:'主城区',   col:0, row:0, links:['region01-town01','region01-town03','region01-town04']},
  {id:'region01-town03', name:'银月港',   col:0, row:0, links:['region01-town02']},
  {id:'region01-town04', name:'天冰镇',   col:0, row:0, links:['region01-town02']},
  {id:'region01-town05', name:'晨曦岗', col:0, row:0, links:['region01-town01']},
  {id:'region01-town06', name:'冰裂谷', col:0, row:0, links:['region01-town04']},
  /* ---- 王都 ---- */
  {id:'region03-town01', name:'王都边陲', col:0, row:0, links:['region03-town02','region03-town08']},
  {id:'region03-town02', name:'王都',     col:0, row:0, links:['region03-town01']},
  {id:'region03-town08', name:'平安镇',   col:0, row:0, links:['region03-town01']},
  /* ---- 沙漠 ---- */
  {id:'region04-town01', name:'漠西主城', col:0, row:0, links:['region04-town02']},
  {id:'region04-town02', name:'和平镇',   col:0, row:0, links:['region04-town01']},
  {id:'region04-town03', name:'红岩峡谷', col:0, row:0, links:['region04-town02']},
  {id:'region04-town04', name:'风蚀高地', col:0, row:0, links:['region04-town01']}
];

/* ============================================================
   自动布局：根据各街道图 edge 的 direction（北/南/东/西），
   从主城区出发 BFS 推算 TOWNS / WORLD_REGIONS 的 col,row。
   新加地图时只要在 edge 里写好 direction，位置自动落位，不用手排。
   ============================================================ */
function computeMapLayout(){
  const DIR = {north:{dx:0,dy:-1}, south:{dx:0,dy:1}, east:{dx:1,dy:0}, west:{dx:-1,dy:0}};
  const adj = {};
  for(const id in MAPS){
    MAPS[id].tiles.forEach(t => {
      if(t.edge && t.edge.targetMap && DIR[t.edge.direction]){
        (adj[id] = adj[id] || []).push({to:t.edge.targetMap, dx:DIR[t.edge.direction].dx, dy:DIR[t.edge.direction].dy});
      }
    });
  }
  const pos = {};
  const q = ['region01-town02'];
  pos['region01-town02'] = {col:0, row:0};
  while(q.length){
    const cur = q.shift();
    (adj[cur] || []).forEach(e => {
      if(pos[e.to]) return;
      pos[e.to] = {col: pos[cur].col + e.dx, row: pos[cur].row + e.dy};
      q.push(e.to);
    });
  }

  /* TOWNS：先写 BFS 绝对坐标 */
  TOWNS.forEach(t => { if(pos[t.id]){ t.col = pos[t.id].col; t.row = pos[t.id].row; } });

  /* 按大区分组归一化 —— 每个大区自己的城镇从 (0,0) 起步 */
  const townGroups = {};
  TOWNS.forEach(t => {
    const rid = (t.id.match(/^region\d+/) || [])[0];
    if(!rid) return;
    (townGroups[rid] = townGroups[rid] || []).push(t);
  });
  Object.values(townGroups).forEach(group => {
    const minCol = Math.min(...group.map(x => x.col));
    const minRow = Math.min(...group.map(x => x.row));
    group.forEach(x => { x.col -= minCol; x.row -= minRow; });
  });

  /* WORLD_REGIONS：每个大区用它的"代表地图"位置（BFS 原坐标，保留真实方位） */
  WORLD_REGIONS.forEach(r => {
    let src = null;
    if(r.hasSubTown){
      const towns = TOWNS.filter(t => t.id.startsWith(r.id + '-town'));
      const rep = towns.find(t => t.id === r.id + '-town02') || towns[0];
      if(rep) src = rep.id;
    }else{
      src = r.directMap;
    }
    if(src && pos[src]){ r.col = pos[src].col; r.row = pos[src].row; }
  });

  /* 全局归一化（保证大区全在正坐标区域） */
  if(WORLD_REGIONS.length > 0){
    const minCol = Math.min(...WORLD_REGIONS.map(r => r.col));
    const minRow = Math.min(...WORLD_REGIONS.map(r => r.row));
    WORLD_REGIONS.forEach(r => { r.col -= minCol; r.row -= minRow; });
  }

  /* ---- 推导大区之间的连线 ----
     只要两个大区的街道图之间有 edge 连通，就在世界地图上连一条线。
     这样以后新加地图/大区，不用手写 links，会自动出现在世界地图上。 */
  const _mapToRegion = {};
  for(const _mid in MAPS){
    if(Object.prototype.hasOwnProperty.call(MAPS[_mid], 'region')){
      if(MAPS[_mid].region) _mapToRegion[_mid] = MAPS[_mid].region;
      continue;
    }
    const _m = _mid.match(/^(region\d+)/);
    if(_m) _mapToRegion[_mid] = _m[1];
  }
  const _regionLinkSet = {};
  for(const _mid in adj){
    const _r1 = _mapToRegion[_mid];
    if(!_r1) continue;
    adj[_mid].forEach(_e => {
      const _r2 = _mapToRegion[_e.to];
      if(_r2 && _r1 !== _r2){
        (_regionLinkSet[_r1] = _regionLinkSet[_r1] || new Set()).add(_r2);
        (_regionLinkSet[_r2] = _regionLinkSet[_r2] || new Set()).add(_r1);
      }
    });
  }
  WORLD_REGIONS.forEach(_r => {
    _r.links = _regionLinkSet[_r.id] ? Array.from(_regionLinkSet[_r.id]) : [];
  });

  /* ---- 紧凑化：压缩没有大区的空行/空列 ----
     让大区间距离更近，渲染时缩放更大、节点更清楚。 */
  {
    const _usedCols = Array.from(new Set(WORLD_REGIONS.map(r => r.col))).sort((a,b) => a-b);
    const _usedRows = Array.from(new Set(WORLD_REGIONS.map(r => r.row))).sort((a,b) => a-b);
    const _colMap = {};
    const _rowMap = {};
    _usedCols.forEach((c, i) => { _colMap[c] = i; });
    _usedRows.forEach((r, i) => { _rowMap[r] = i; });
    WORLD_REGIONS.forEach(r => {
      r.col = _colMap[r.col];
      r.row = _rowMap[r.row];
    });
  }
}

/* ============================================================
   街道地图
   ============================================================ */
const MAPS = {

  'region01-town01': {
    name:'和谐镇',
    grid:{cols:6, rows:5},
    tiles:[
      {id:'region01-town01-01',   name:'魔能塔',     col:1, row:0, links:['region01-town01-04'],                                        npcs:['npc003','npc006']},
      {id:'region01-town01-02',  name:'警备室',     col:3, row:0, links:['region01-town01-03','region01-town01-06'],                            npcs:['npc021']},
      {id:'region01-town01-03',       name:'镇长办公室', col:4, row:0, links:['region01-town01-02'],                                  npcs:['npc019','npc020']},
      {id:'region01-town01-04',       name:'冒险者工会', col:0, row:1, links:['region01-town01-01','region01-town01-05','region01-town01-10'],           npcs:['npc008','npc004']},
      {id:'region01-town01-05',        name:'广场西',     col:1, row:1, links:['region01-town01-04','region01-town01-06'],                            npcs:[]},
      {id:'region01-town01-06',      name:'中央广场',   col:2, row:1, links:['region01-town01-05','region01-town01-07','region01-town01-02','region01-town01-12'],    npcs:[]},
      {id:'region01-town01-07',        name:'广场东',     col:3, row:1, links:['region01-town01-06','region01-town01-08','region01-town01-11'],                  npcs:[]},
      {id:'region01-town01-08',        name:'鱼塘',       col:4, row:1, links:['region01-town01-07','region01-town01-09'],                        npcs:[]},
      {id:'region01-town01-09', name:'破屋子',     col:5, row:1, links:['region01-town01-08'],                                        npcs:[], env:['破烂的酒缸'], edge:{label:'前往晨曦岗', targetMap:'region01-town05', targetTile:'region01-town05-01', direction:'east'}},
      {id:'region01-town01-10',  name:'战士学院',   col:0, row:2, links:['region01-town01-04'],                                      npcs:['npc007']},
      {id:'region01-town01-11',      name:'铁匠铺',     col:3, row:2, links:['region01-town01-07'],                                       npcs:['npc009']},
      {id:'region01-town01-12',     name:'雷克家',     col:2, row:2, links:['region01-town01-06','region01-town01-14'],                           npcs:['npc001','npc002']},
      {id:'region01-town01-13',  name:'洼地',       col:1, row:3, links:['region01-town01-14'],                                      npcs:['npc017']},
      {id:'region01-town01-14',       name:'农田1',      col:2, row:3, links:['region01-town01-12','region01-town01-13','region01-town01-15','region01-town01-16'], npcs:[]},
      {id:'region01-town01-15',       name:'农田2',      col:3, row:3, links:['region01-town01-14'],                                      npcs:[], env:['奇怪的箱子']},
      {id:'region01-town01-16',      name:'城郊',       col:2, row:4, links:['region01-town01-14'], npcs:[],
        edge:{label:'前往主城区·北郊', targetMap:'region01-town02', targetTile:'region01-town02-01', direction:'south'}}
    ]
  },

  'region01-town02': {
    name:'主城区',
    grid:{cols:9, rows:11},
    tiles:[
      {id:'region01-town02-01',      name:'北郊',     col:4, row:0,  links:['region01-town02-02'], env:['灌木丛'], battle:'enc_001', edge:{label:'前往和谐镇·城郊', targetMap:'region01-town01', targetTile:'region01-town01-16', direction:'north'}},
      {id:'region01-town02-02',     name:'北城门',   col:4, row:1,  links:['region01-town02-01','region01-town02-03']},
      {id:'region01-town02-03',   name:'北石桥',   col:4, row:2,  links:['region01-town02-02','region01-town02-06'], npcs:['npc041']},
      {id:'region01-town02-04',   name:'黑市',     col:2, row:3,  links:['region01-town02-05'], npcs:['npc010','npc031','npc032'], env:['破木箱'], battle:'enc_009'},
      {id:'region01-town02-05',    name:'魔药店',   col:3, row:3,  links:['region01-town02-04','region01-town02-06'], npcs:['npc011','npc005','npc016']},
      {id:'region01-town02-06',   name:'北广场',   col:4, row:3,  links:['region01-town02-03','region01-town02-05','region01-town02-07','region01-town02-14'], npcs:['npc039']},
      {id:'region01-town02-07',        name:'炼金工坊', col:5, row:3,  links:['region01-town02-06'], npcs:['npc012','npc013','npc040','npc038','npc037']},
      {id:'region01-town02-08',          name:'舍区',     col:3, row:4,  links:['region01-town02-13'], npcs:['npc024','npc042']},
      {id:'region01-town02-09',        name:'书馆',     col:5, row:4,  links:['region01-town02-15'], npcs:['npc035','npc028'], env:['落灰的箱子']},
     {id:'region01-town02-10', name:'西郊', col:0, row:5, links:['region01-town02-11'], npcs:['npc022'], env:['破木箱'], battle:'enc_003',
  edge:{label:'前往银月港', targetMap:'region01-town03', targetTile:'region01-town03-07', direction:'west'}},
      {id:'region01-town02-11',      name:'西城门',   col:1, row:5,  links:['region01-town02-10','region01-town02-12']},
      {id:'region01-town02-12',    name:'西石桥',   col:2, row:5,  links:['region01-town02-11','region01-town02-13']},
      {id:'region01-town02-13',    name:'西广场',   col:3, row:5,  links:['region01-town02-12','region01-town02-08','region01-town02-19','region01-town02-14'], npcs:['npc034']},
      {id:'region01-town02-14',  name:'中央广场', col:4, row:5,  links:['region01-town02-13','region01-town02-15','region01-town02-06','region01-town02-23'], npcs:['npc023']},
      {id:'region01-town02-15',    name:'东广场',   col:5, row:5,  links:['region01-town02-14','region01-town02-09','region01-town02-20','region01-town02-16'], npcs:['npc030']},
      {id:'region01-town02-16',    name:'东石桥',   col:6, row:5,  links:['region01-town02-15','region01-town02-17','region01-town02-21']},
      {id:'region01-town02-17',         name:'警备室',   col:7, row:5,  links:['region01-town02-16','region01-town02-18'], npcs:['npc029']},
      {id:'region01-town02-18',     name:'城主府',   col:8, row:5,  links:['region01-town02-17'], npcs:['npc015']},
      {id:'region01-town02-19',         name:'舍区2',    col:3, row:6,  links:['region01-town02-13'], npcs:['npc025']},
      {id:'region01-town02-20',          name:'高尖塔',   col:5, row:6,  links:['region01-town02-15','region01-town02-21'], npcs:['npc014','npc033']},
      {id:'region01-town02-21',  name:'仪仗广场', col:6, row:6,  links:['region01-town02-16','region01-town02-20'], npcs:['npc036']},
      {id:'region01-town02-22',    name:'战士学院', col:3, row:7,  links:['region01-town02-23'], npcs:['npc026']},
      {id:'region01-town02-23',   name:'南广场',   col:4, row:7,  links:['region01-town02-14','region01-town02-22','region01-town02-24','region01-town02-25']},
      {id:'region01-town02-24',     name:'魔能塔',   col:5, row:7,  links:['region01-town02-23'], npcs:['npc027']},
      {id:'region01-town02-25',   name:'南石桥',   col:4, row:8,  links:['region01-town02-23','region01-town02-26']},
      {id:'region01-town02-26',     name:'南城门',   col:4, row:9,  links:['region01-town02-25','region01-town02-27']},
       {id:'region01-town02-27', name:'南郊', col:4, row:10, links:['region01-town02-26','region01-town02-28'], env:['枯草丛'], battle:'enc_004', edge:{label:'前往天冰镇', targetMap:'region01-town04', targetTile:'region01-town04-01', direction:'south'}},
      {id:'region01-town02-28',name:'南郊坟地', col:5, row:10, links:['region01-town02-27'], npcs:['npc018'], env:['坑洞'], battle:['enc_008']}
    ]
  },

'region01-town03': {
    name:'银月港',
    grid:{cols:8, rows:7},
    tiles:[
      {id:'region01-town03-01', name:'灯塔', col:3, row:0, links:['region01-town03-02'], npcs:['npc047']},
      {id:'region01-town03-02', name:'灯塔小径', col:3, row:1, links:['region01-town03-01','region01-town03-06','region01-town03-09'], npcs:['npc046']},
      {id:'region01-town03-03', name:'海妖酒馆', col:5, row:2, links:['region01-town03-05','region01-town03-06'], npcs:['npc045']},
      {id:'region01-town03-04', name:'渔市', col:6, row:2, links:['region01-town03-10'], npcs:['npc044']},
      {id:'region01-town03-05', name:'中央广场', col:5, row:3, links:['region01-town03-10','region01-town03-08','region01-town03-06','region01-town03-03']},
      {id:'region01-town03-06', name:'主码头', col:3, row:2, links:['region01-town03-05','region01-town03-03','region01-town03-02','region01-town03-08'], npcs:['npc043']},
      {id:'region01-town03-07', name:'港口入口', col:7, row:3, links:['region01-town03-10'], edge:{label:'前往主城区·西郊', targetMap:'region01-town02', targetTile:'region01-town02-10', direction:'east'}},
      {id:'region01-town03-08', name:'船坞', col:3, row:4, links:['region01-town03-05','region01-town03-06','region01-town03-11'], npcs:['npc048']},
      {id:'region01-town03-09', name:'走私仓库', col:2, row:1, links:['region01-town03-02'], env:['破烂的酒缸']},
      {id:'region01-town03-10', name:'居民区', col:6, row:3, links:['region01-town03-04','region01-town03-05','region01-town03-07']},
      {id:'region01-town03-11', name:'迷途岛暗礁', col:1, row:4, links:['region01-town03-08'], env:['迷雾'], battle:'enc_034', edge:{label:'前往迷途岛', targetMap:'region05', targetTile:'region05-01', direction:'west'}}
    ]
  },

  'region01-town04': {
    name:'天冰镇',
    grid:{cols:8, rows:7},
    tiles:[
      {id:'region01-town04-01', name:'城郊', col:3, row:0, links:['region01-town04-02'], edge:{label:'返回主城区·南郊', targetMap:'region01-town02', targetTile:'region01-town02-27', direction:'north'}},
      {id:'region01-town04-02', name:'石桥', col:3, row:1, links:['region01-town04-01','region01-town04-03']},
      {id:'region01-town04-03', name:'石桥2', col:3, row:2, links:['region01-town04-02','region01-town04-04'], npcs:['npc063']},
      {id:'region01-town04-04', name:'农田2', col:3, row:3, links:['region01-town04-14','region01-town04-06','region01-town04-08','region01-town04-03'], npcs:['npc065']},
      {id:'region01-town04-05', name:'农田4', col:2, row:4, links:['region01-town04-14','region01-town04-06'], env:['枯草丛'], battle:'enc_006'},
      {id:'region01-town04-06', name:'农田1', col:2, row:3, links:['region01-town04-04','region01-town04-05','region01-town04-09']},
      {id:'region01-town04-07', name:'农田6', col:4, row:4, links:['region01-town04-14','region01-town04-08','region01-town04-12'], npcs:['npc056'], env:['枯草丛'], battle:'enc_006'},
      {id:'region01-town04-08', name:'农田3', col:4, row:3, links:['region01-town04-04','region01-town04-07'], npcs:['npc064']},
      {id:'region01-town04-09', name:'水塘', col:1, row:2, links:['region01-town04-06','region01-town04-10'], env:['迷雾'], battle:'enc_031'},
      {id:'region01-town04-10', name:'水塘2', col:0, row:1, links:['region01-town04-09'], env:['迷雾'], battle:'enc_032', edge:{label:'前往冰裂谷', targetMap:'region01-town06', targetTile:'region01-town06-01', direction:'west'}},
      {id:'region01-town04-11', name:'冒险者工会', col:4, row:6, links:['region01-town04-16'], npcs:['npc051','npc052','npc053','npc054','npc055']},
      {id:'region01-town04-12', name:'杂乱的土地', col:5, row:4, links:['region01-town04-07','region01-town04-13'], env:['灌木丛'], battle:'enc_048'},
      {id:'region01-town04-13', name:'王亚的帐篷', col:7, row:3, links:['region01-town04-12']},
      {id:'region01-town04-14', name:'农田5', col:3, row:4, links:['region01-town04-04','region01-town04-05','region01-town04-07','region01-town04-15'], env:['枯草丛'], battle:'enc_006'},
      {id:'region01-town04-15', name:'营地', col:3, row:5, links:['region01-town04-14','region01-town04-16'], npcs:['npc049']},
      {id:'region01-town04-16', name:'边境', col:3, row:6, links:['region01-town04-15','region01-town04-11'], npcs:['npc050'], env:['灌木丛'], battle:'enc_028', edge:{label:'前往野外', targetMap:'region02', targetTile:'region02-01', direction:'south'}}
    ]
  },

 'region02': {
    name:'野外',
    grid:{cols:10, rows:10},
    tiles:[
      {id:'region02-01', name:'森之入口', col:3, row:0, links:['region02-02'], edge:{label:'出口', targetMap:'region01-town04', targetTile:'region01-town04-16', direction:'north'}},
      {id:'region02-02', name:'树林1', col:3, row:1, links:['region02-01','region02-03'], env:['灌木丛'], battle:'enc_028'},
      {id:'region02-03', name:'树林2', col:3, row:2, links:['region02-02','region02-04'], env:['灌木丛'], battle:'enc_028'},
      {id:'region02-04', name:'树林3', col:3, row:3, links:['region02-03','region02-05'], env:['灌木丛'], battle:'enc_028'},
      {id:'region02-05', name:'树林4', col:3, row:4, links:['region02-04','region02-06'], env:['灌木丛'], battle:'enc_029'},
      {id:'region02-06', name:'新营地', col:3, row:5, links:['region02-05','region02-07','region02-11'], npcs:['npc057','npc058','npc059','npc060','npc061']},
      {id:'region02-07', name:'树林5', col:3, row:6, links:['region02-06','region02-08','region02-19'], env:['灌木丛'], battle:'enc_029'},
      {id:'region02-08', name:'树林6', col:3, row:7, links:['region02-07','region02-09','region02-18'], env:['灌木丛'], battle:'enc_029'},
      {id:'region02-09', name:'树林7', col:3, row:8, links:['region02-08','region02-10'], env:['灌木丛'], battle:'enc_030'},
      {id:'region02-10', name:'树林8', col:3, row:9, links:['region02-09'], env:['灌木丛'], battle:'enc_030', edge:{label:'前往幽暗密林', targetMap:'region02-field03', targetTile:'region02-field03-01', direction:'south'}},
      {id:'region02-11', name:'树林13', col:4, row:5, links:['region02-12','region02-06'], env:['灌木丛'], battle:'enc_029'},
      {id:'region02-12', name:'树林14', col:5, row:5, links:['region02-11','region02-13'], env:['灌木丛'], battle:'enc_029'},
      {id:'region02-13', name:'树林15', col:6, row:5, links:['region02-14','region02-12'], env:['灌木丛'], battle:'enc_030'},
      {id:'region02-14', name:'林间小屋', col:7, row:5, links:['region02-25','region02-13','region02-15'], npcs:['npc088']},
      {id:'region02-15', name:'矮树林', col:8, row:6, links:['region02-14','region02-16','region02-32'], env:['奇怪的箱子'], battle:'enc_030'},
      {id:'region02-16', name:'城郊', col:9, row:7, links:['region02-15'], env:['奇怪的箱子'], battle:'enc_048', edge:{label:'进入王都边陲', targetMap:'region03-town01', targetTile:'region03-town01-05', direction:'east'}},
      {id:'region02-17', name:'树屋', col:5, row:7, links:['region02-18'], npcs:['npc062']},
      {id:'region02-18', name:'森林9', col:4, row:7, links:['region02-08','region02-17'], env:['灌木丛'], battle:'enc_029'},
      {id:'region02-19', name:'树林10', col:2, row:6, links:['region02-07','region02-20','region02-24'], env:['灌木丛'], battle:'enc_030'},
      {id:'region02-20', name:'树林11', col:1, row:5, links:['region02-19','region02-21'], env:['灌木丛'], battle:'enc_030'},
      {id:'region02-21', name:'参天巨树', col:0, row:4, links:['region02-20','region02-22'], npcs:['npc071'], battle:'enc_030'},
      {id:'region02-22', name:'树林12', col:0, row:3, links:['region02-21','region02-23'], env:['灌木丛'], battle:'enc_030', edge:{label:'前往低语林地', targetMap:'region02-field01', targetTile:'region02-field01-01', direction:'west'}},
      {id:'region02-23', name:'不知名的遗址', col:1, row:2, links:['region02-22'], env:['坑洞'], battle:'enc_050'},
      {id:'region02-24', name:'冰霜湖', col:1, row:7, links:['region02-19','region02-30','region02-31'], env:['迷雾'], battle:'enc_032'},
      {id:'region02-25', name:'树林16', col:7, row:4, links:['region02-26','region02-14'], env:['灌木丛'], battle:'enc_030'},
      {id:'region02-26', name:'树林17', col:7, row:3, links:['region02-27','region02-25'], env:['灌木丛'], battle:'enc_030'},
      {id:'region02-27', name:'树林18', col:7, row:2, links:['region02-28','region02-26'], env:['灌木丛'], battle:'enc_030'},
      {id:'region02-28', name:'树林19', col:6, row:1, links:['region02-29','region02-27'], env:['灌木丛'], battle:'enc_030'},
      {id:'region02-29', name:'旧营地', col:5, row:2, links:['region02-28'], env:['坑洞'], battle:'enc_051'},
      {id:'region02-30', name:'冰霜湖2', col:0, row:6, links:['region02-24'], env:['迷雾'], battle:'enc_032'},
      {id:'region02-31', name:'冰霜湖3', col:0, row:8, links:['region02-24'], env:['迷雾'], battle:'enc_033'},
      {id:'region02-32', name:'营地', col:9, row:5, links:['region02-15'], env:['奇怪的箱子'], battle:'enc_051'}
    ]
  },

'region03-town01':{
    name:'王都边陲',
    grid:{cols:10, rows:8},
    tiles:[
      {id:'region03-town01-01', name:'荒地2', col:1, row:3, links:['region03-town01-02','region03-town01-04','region03-town01-22'], env:['风沙'], battle:'enc_007'},
      {id:'region03-town01-02', name:'荒地4', col:1, row:2, links:['region03-town01-01','region03-town01-05','region03-town01-06'], npcs:['npc072'], env:['风沙'], battle:'enc_007'},
      {id:'region03-town01-03', name:'冒险者工会', col:2, row:2, links:['region03-town01-04'], npcs:['npc066','npc067','npc068','npc069','npc070']},
      {id:'region03-town01-04', name:'荒地', col:2, row:3, links:['region03-town01-01','region03-town01-08','region03-town01-03'], npcs:['npc082']},
      {id:'region03-town01-05', name:'边陲', col:0, row:2, links:['region03-town01-02'], edge:{label:'进入野外', targetMap:'region02', targetTile:'region02-16', direction:'west'}},
      {id:'region03-town01-06', name:'荒地5', col:1, row:1, links:['region03-town01-02'], env:['风沙'], battle:'enc_007'},
      {id:'region03-town01-07', name:'荒地6', col:3, row:2, links:['region03-town01-08','region03-town01-12'], env:['枯草丛'], battle:'enc_048'},
      {id:'region03-town01-08', name:'荒地3', col:3, row:3, links:['region03-town01-04','region03-town01-07','region03-town01-09'], env:['枯草丛'], battle:'enc_048'},
      {id:'region03-town01-09', name:'荒地7', col:3, row:4, links:['region03-town01-08','region03-town01-10'], env:['枯草丛'], battle:'enc_048'},
      {id:'region03-town01-10', name:'荒地8', col:3, row:5, links:['region03-town01-09','region03-town01-11'], env:['枯草丛'], battle:'enc_048'},
      {id:'region03-town01-11', name:'石桥2', col:4, row:6, links:['region03-town01-10','region03-town01-17']},
      {id:'region03-town01-12', name:'石桥', col:4, row:1, links:['region03-town01-07','region03-town01-13']},
      {id:'region03-town01-13', name:'要塞', col:5, row:2, links:['region03-town01-20','region03-town01-12'], npcs:['npc078','npc079','npc080','npc081']},
      {id:'region03-town01-14', name:'田野4', col:6, row:3, links:['region03-town01-15','region03-town01-20']},
      {id:'region03-town01-15', name:'战士学院', col:6, row:4, links:['region03-town01-19','region03-town01-16','region03-town01-14','region03-town01-18'], npcs:['npc110','npc109','npc106']},
      {id:'region03-town01-16', name:'田野3', col:6, row:5, links:['region03-town01-15','region03-town01-21'], npcs:['npc085']},
      {id:'region03-town01-17', name:'要塞2', col:5, row:6, links:['region03-town01-11','region03-town01-21'], npcs:['npc075','npc076','npc077']},
      {id:'region03-town01-18', name:'坚固的城门', col:7, row:4, links:['region03-town01-15'], npcs:['npc095','npc096'], edge:{label:'出口', targetMap:'region03-town02', targetTile:'region03-town02-24', direction:'east'}},
      {id:'region03-town01-19', name:'瞭望台', col:5, row:4, links:['region03-town01-15','region03-town01-21','region03-town01-20'], npcs:['npc083','npc084']},
      {id:'region03-town01-20', name:'田野', col:5, row:3, links:['region03-town01-13','region03-town01-19','region03-town01-14'], env:['枯草丛'], battle:'enc_006'},
      {id:'region03-town01-21', name:'田野2', col:5, row:5, links:['region03-town01-17','region03-town01-16','region03-town01-19'], env:['枯草丛'], battle:'enc_006'},
      {id:'region03-town01-22', name:'边路', col:1, row:5, links:['region03-town01-01','region03-town01-23'], npcs:['npc073','npc074']},
      {id:'region03-town01-23', name:'边路2', col:1, row:7, links:['region03-town01-22'], env:['迷雾'], battle:'enc_038', edge:{label:'出口', targetMap:'region03-town08', targetTile:'region03-town08-13', direction:'south'}}
    ]
  },

  'region03-town02':{
    name:'王都',
    grid:{cols:10, rows:11},
    tiles:[
      {id:'region03-town02-01', name:'中央广场', col:7, row:4, links:['region03-town02-06','region03-town02-02','region03-town02-05','region03-town02-13'], npcs:['npc117','npc139','npc143','npc118','npc132']},
      {id:'region03-town02-02', name:'战士学院', col:7, row:3, links:['region03-town02-01','region03-town02-13'], npcs:['npc098','npc099','npc100','npc104']},
      {id:'region03-town02-03', name:'魔药店', col:6, row:2, links:['region03-town02-30','region03-town02-13'], npcs:['npc137','npc120','npc112','npc116','npc129']},
      {id:'region03-town02-04', name:'炼金工房', col:6, row:6, links:['region03-town02-13'], npcs:['npc141','npc142','npc136','npc121']},
      {id:'region03-town02-05', name:'魔能塔', col:7, row:5, links:['region03-town02-01','region03-town02-13'], npcs:['npc103','npc105','npc114','npc113']},
      {id:'region03-town02-06', name:'警备室', col:8, row:4, links:['region03-town02-29','region03-town02-01'], npcs:['npc135','npc144','npc145','npc146']},
      {id:'region03-town02-07', name:'王府侧门（左）', col:9, row:2, links:['region03-town02-29'], edge:{label:'进入王府左侧', targetMap:'region03-town05', targetTile:'region03-town05-01', direction:'east'}},
      {id:'region03-town02-08', name:'王府侧门（右）', col:9, row:6, links:['region03-town02-29'], edge:{label:'进入王府右侧', targetMap:'region03-town06', targetTile:'region03-town06-01', direction:'east'}},
      {id:'region03-town02-09', name:'民舍11', col:4, row:2, links:['region03-town02-26','region03-town02-11','region03-town02-15']},
      {id:'region03-town02-10', name:'民舍5', col:4, row:6, links:['region03-town02-12','region03-town02-21','region03-town02-16'], npcs:['npc138','npc134']},
      {id:'region03-town02-11', name:'民舍12', col:5, row:1, links:['region03-town02-09','region03-town02-17','region03-town02-30'], npcs:['npc152']},
      {id:'region03-town02-12', name:'民舍6', col:5, row:7, links:['region03-town02-10','region03-town02-18','region03-town02-20']},
      {id:'region03-town02-13', name:'高尖塔', col:5, row:4, links:['region03-town02-31','region03-town02-01','region03-town02-05','region03-town02-02','region03-town02-03','region03-town02-04'], npcs:['npc101','npc107','npc108','npc102']},
      {id:'region03-town02-14', name:'检查站', col:2, row:4, links:['region03-town02-24','region03-town02-31'], npcs:['npc090','npc091','npc093','npc094','npc097']},
      {id:'region03-town02-15', name:'民舍9', col:3, row:3, links:['region03-town02-31','region03-town02-09','region03-town02-25'], npcs:['npc122','npc123']},
      {id:'region03-town02-16', name:'民舍4', col:3, row:5, links:['region03-town02-31','region03-town02-10','region03-town02-22']},
      {id:'region03-town02-17', name:'警备室4', col:4, row:0, links:['region03-town02-27','region03-town02-11'], npcs:['npc125','npc126','npc119','npc115']},
      {id:'region03-town02-18', name:'民舍7', col:6, row:8, links:['region03-town02-12'], npcs:['npc148','npc140']},
      {id:'region03-town02-19', name:'仓库大门', col:5, row:10, links:['region03-town02-20'], edge:{label:'出口', targetMap:'region03-town03', targetTile:'region03-town03-01', direction:'south'}},
      {id:'region03-town02-20', name:'警备室2', col:4, row:9, links:['region03-town02-21','region03-town02-12','region03-town02-19'], npcs:['npc127','npc131','npc130']},
      {id:'region03-town02-21', name:'民舍3', col:3, row:8, links:['region03-town02-10','region03-town02-20','region03-town02-22'], npcs:['npc111']},
      {id:'region03-town02-22', name:'民舍2', col:2, row:7, links:['region03-town02-16','region03-town02-21','region03-town02-23']},
      {id:'region03-town02-23', name:'民舍', col:1, row:6, links:['region03-town02-22'], npcs:['npc133']},
      {id:'region03-town02-24', name:'城门内', col:0, row:4, links:['region03-town02-14'], npcs:['npc086','npc087','npc089','npc092'], edge:{label:'出口', targetMap:'region03-town01', targetTile:'region03-town01-18', direction:'west'}},
      {id:'region03-town02-25', name:'民舍8', col:1, row:2, links:['region03-town02-26','region03-town02-15']},
      {id:'region03-town02-26', name:'民舍10', col:2, row:1, links:['region03-town02-27','region03-town02-25','region03-town02-09'], npcs:['npc124']},
      {id:'region03-town02-27', name:'民舍13', col:3, row:0, links:['region03-town02-26','region03-town02-17'], npcs:['npc128']},
      {id:'region03-town02-28', name:'黑市', col:7, row:0, links:['region03-town02-30'], npcs:['npc153','npc154']},
      {id:'region03-town02-29', name:'王府大门', col:9, row:4, links:['region03-town02-06','region03-town02-07','region03-town02-08'], edge:{label:'进入王府', targetMap:'region03-town04', targetTile:'region03-town04-01', direction:'east'}},
      {id:'region03-town02-30', name:'民舍14', col:7, row:1, links:['region03-town02-11','region03-town02-28','region03-town02-03']},
      {id:'region03-town02-31', name:'广场前', col:4, row:4, links:['region03-town02-13','region03-town02-16','region03-town02-15','region03-town02-14'], npcs:['npc149']}
    ]
  },

  'region03-town03':{
    name:'仓库',
    grid:{cols:6, rows:5},
    tiles:[
      {id:'region03-town03-01', name:'货架', col:1, row:1, links:['region03-town03-02'], edge:{label:'出口', targetMap:'region03-town02', targetTile:'region03-town02-19', direction:'north'}},
      {id:'region03-town03-02', name:'货架2', col:1, row:2, links:['region03-town03-03','region03-town03-01'], battle:'enc_048'},
      {id:'region03-town03-03', name:'货架3', col:1, row:3, links:['region03-town03-02','region03-town03-04'], battle:'enc_048'},
      {id:'region03-town03-04', name:'货架4', col:2, row:3, links:['region03-town03-03','region03-town03-05'], battle:'enc_048'},
      {id:'region03-town03-05', name:'货架5', col:3, row:3, links:['region03-town03-06','region03-town03-04'], env:['奇怪的箱子'], battle:'enc_049'},
      {id:'region03-town03-06', name:'货架6', col:4, row:3, links:['region03-town03-05','region03-town03-09','region03-town03-07'], env:['奇怪的箱子'], battle:'enc_049'},
      {id:'region03-town03-07', name:'货架8', col:4, row:2, links:['region03-town03-06','region03-town03-08']},
      {id:'region03-town03-08', name:'货架9', col:4, row:1, links:['region03-town03-07'], npcs:['npc161']},
      {id:'region03-town03-09', name:'货架7', col:5, row:3, links:['region03-town03-06']}
    ]
  },

  'region03-town05':{
    name:'王府左',
    grid:{cols:6, rows:5},
    tiles:[
      {id:'region03-town05-01', name:'长廊', col:0, row:2, links:['region03-town05-02'], edge:{label:'离开王府', targetMap:'region03-town02', targetTile:'region03-town02-07', direction:'west'}},
      {id:'region03-town05-02', name:'长廊2', col:1, row:1, links:['region03-town05-03','region03-town05-01']},
      {id:'region03-town05-03', name:'阳台', col:2, row:0, links:['region03-town05-02','region03-town05-04']},
      {id:'region03-town05-04', name:'长廊3', col:3, row:1, links:['region03-town05-03','region03-town05-05'], npcs:['npc147']},
      {id:'region03-town05-05', name:'长廊4', col:4, row:2, links:['region03-town05-04','region03-town05-06']},
      {id:'region03-town05-06', name:'长廊5', col:4, row:3, links:['region03-town05-05','region03-town05-07']},
      {id:'region03-town05-07', name:'长廊6', col:3, row:3, links:['region03-town05-06'], npcs:['npc190']}
    ]
  },

  'region03-town06':{
    name:'王府右',
    grid:{cols:6, rows:5},
    tiles:[
      {id:'region03-town06-01', name:'空', col:1, row:2, links:['region03-town06-02'], edge:{label:'离开王府', targetMap:'region03-town02', targetTile:'region03-town02-08', direction:'west'}},
      {id:'region03-town06-02', name:'空2', col:2, row:2, links:['region03-town06-01','region03-town06-03']},
      {id:'region03-town06-03', name:'祭坛', col:3, row:2, links:['region03-town06-02','region03-town06-04'], npcs:['npc186']},
      {id:'region03-town06-04', name:'深渊', col:4, row:2, links:['region03-town06-03'], edge:{label:'坠入深渊', targetMap:'dungeon03', targetTile:'dungeon03-29', direction:'east'}}
    ]
  },

  'region03-town04':{
    name:'王府',
    grid:{cols:8, rows:7},
    tiles:[
      {id:'region03-town04-01', name:'大门', col:0, row:3, links:['region03-town04-20'], edge:{label:'离开王府', targetMap:'region03-town02', targetTile:'region03-town02-29', direction:'west'}},
      {id:'region03-town04-02', name:'舞台', col:3, row:3, links:['region03-town04-13','region03-town04-16']},
      {id:'region03-town04-03', name:'舞台2', col:5, row:3, links:['region03-town04-17','region03-town04-18','region03-town04-14','region03-town04-13'], npcs:['npc173','npc174']},
      {id:'region03-town04-04', name:'房间5', col:3, row:1, links:['region03-town04-10'], npcs:['npc165']},
      {id:'region03-town04-05', name:'房间6', col:3, row:5, links:['region03-town04-09'], npcs:['npc162']},
      {id:'region03-town04-06', name:'房间3', col:7, row:1, links:['region03-town04-08','region03-town04-11'], npcs:['npc164']},
      {id:'region03-town04-07', name:'房间2', col:7, row:5, links:['region03-town04-08','region03-town04-12'], npcs:['npc155']},
      {id:'region03-town04-08', name:'王座', col:7, row:3, links:['region03-town04-14','region03-town04-07','region03-town04-06'], npcs:['npc150','npc151']},
      {id:'region03-town04-09', name:'长廊2', col:2, row:6, links:['region03-town04-20','region03-town04-12','region03-town04-05']},
      {id:'region03-town04-10', name:'长廊', col:2, row:0, links:['region03-town04-20','region03-town04-11','region03-town04-04']},
      {id:'region03-town04-11', name:'房间4', col:6, row:0, links:['region03-town04-10','region03-town04-06'], npcs:['npc163']},
      {id:'region03-town04-12', name:'房间', col:6, row:6, links:['region03-town04-07','region03-town04-09'], npcs:['npc156']},
      {id:'region03-town04-13', name:'楼梯', col:4, row:3, links:['region03-town04-03','region03-town04-02']},
      {id:'region03-town04-14', name:'台阶', col:6, row:3, links:['region03-town04-03','region03-town04-08']},
      {id:'region03-town04-15', name:'座椅2', col:2, row:2, links:['region03-town04-16'], npcs:['npc160']},
      {id:'region03-town04-16', name:'座椅', col:2, row:3, links:['region03-town04-19','region03-town04-15','region03-town04-20','region03-town04-02'], npcs:['npc158']},
      {id:'region03-town04-17', name:'幕后', col:5, row:2, links:['region03-town04-03']},
      {id:'region03-town04-18', name:'幕后2', col:5, row:4, links:['region03-town04-03'], npcs:['npc159']},
      {id:'region03-town04-19', name:'座椅3', col:2, row:4, links:['region03-town04-16'], npcs:['npc157']},
      {id:'region03-town04-20', name:'过道', col:1, row:3, links:['region03-town04-10','region03-town04-09','region03-town04-16','region03-town04-01']}
    ]
  },

  'region03-town08':{
    name:'平安镇',
    grid:{cols:7, rows:7},
    tiles:[
      {id:'region03-town08-01', name:'石桥', col:2, row:1, links:['region03-town08-02','region03-town08-13','region03-town08-16']},
      {id:'region03-town08-02', name:'北广场', col:2, row:2, links:['region03-town08-03','region03-town08-01'], npcs:['npc184','npc188']},
      {id:'region03-town08-03', name:'广场', col:2, row:3, links:['region03-town08-04','region03-town08-02','region03-town08-08','region03-town08-14'], npcs:['npc176','npc170','npc171']},
      {id:'region03-town08-04', name:'南广场', col:2, row:4, links:['region03-town08-15','region03-town08-09','region03-town08-03']},
      {id:'region03-town08-05', name:'石板街', col:4, row:3, links:['region03-town08-11','region03-town08-07','region03-town08-06','region03-town08-08']},
      {id:'region03-town08-06', name:'矿洞2', col:5, row:5, links:['region03-town08-05'], npcs:['npc166'], env:['坑洞'], battle:'enc_040', edge:{label:'前往地下城', targetMap:'dungeon01', targetTile:'dungeon01-09', direction:'south'}},
      {id:'region03-town08-07', name:'铁匠铺', col:4, row:2, links:['region03-town08-05'], npcs:['npc175','npc167']},
      {id:'region03-town08-08', name:'地下通道', col:3, row:3, links:['region03-town08-05','region03-town08-03']},
      {id:'region03-town08-09', name:'农田', col:1, row:5, links:['region03-town08-04','region03-town08-12','region03-town08-10'], battle:'enc_050'},
      {id:'region03-town08-10', name:'农田2', col:2, row:6, links:['region03-town08-15','region03-town08-09'], battle:'enc_050'},
      {id:'region03-town08-11', name:'矿洞', col:6, row:3, links:['region03-town08-05'], npcs:['npc195'], env:['坑洞'], battle:'enc_040'},
      {id:'region03-town08-12', name:'水塘', col:0, row:4, links:['region03-town08-09'], battle:'enc_050'},
      {id:'region03-town08-13', name:'边郊', col:2, row:0, links:['region03-town08-01'], edge:{label:'进入王都边陲', targetMap:'region03-town01', targetTile:'region03-town01-23', direction:'north'}},
      {id:'region03-town08-14', name:'警备室', col:1, row:3, links:['region03-town08-03'], npcs:['npc168','npc169','npc172']},
      {id:'region03-town08-15', name:'冒险者工会', col:3, row:5, links:['region03-town08-10','region03-town08-04'], npcs:['npc177']},
      {id:'region03-town08-16', name:'魔药店', col:1, row:1, links:['region03-town08-01'], npcs:['npc178']}
    ]
  },

'dungeon01':{
    name:'地下城1',
    grid:{cols:9, rows:9},
    tiles:[
      {id:'dungeon01-01', name:'二层', col:2, row:1, links:['dungeon01-09','dungeon01-02'], env:['迷雾']},
      {id:'dungeon01-02', name:'三层', col:3, row:2, links:['dungeon01-01','dungeon01-03','dungeon01-10','dungeon01-11'], env:['迷雾']},
      {id:'dungeon01-03', name:'四层', col:4, row:3, links:['dungeon01-02','dungeon01-05'], env:['迷雾']},
      {id:'dungeon01-04', name:'五层密室', col:2, row:4, links:['dungeon01-05','dungeon01-15'], env:['奇怪的箱子']},
      {id:'dungeon01-05', name:'五层', col:5, row:4, links:['dungeon01-03','dungeon01-06','dungeon01-14','dungeon01-04'], env:['迷雾']},
      {id:'dungeon01-06', name:'六层', col:6, row:5, links:['dungeon01-05','dungeon01-07'], env:['迷雾']},
      {id:'dungeon01-07', name:'七层', col:7, row:6, links:['dungeon01-06','dungeon01-08','dungeon01-13'], env:['迷雾']},
      {id:'dungeon01-08', name:'八层', col:8, row:7, links:['dungeon01-07'], env:['迷雾'], edge:{label:'前往更深处', targetMap:'dungeon02', targetTile:'dungeon02-09', direction:'south'}},
      {id:'dungeon01-09', name:'一层', col:1, row:0, links:['dungeon01-01','dungeon01-12'], env:['迷雾'], edge:{label:'回到地面', targetMap:'region03-town08', targetTile:'region03-town08-06', direction:'north'}},
      {id:'dungeon01-10', name:'三层密室2', col:6, row:2, links:['dungeon01-02'], env:['奇怪的箱子']},
      {id:'dungeon01-11', name:'三层密室', col:0, row:2, links:['dungeon01-02'], env:['奇怪的箱子']},
      {id:'dungeon01-12', name:'密室', col:4, row:0, links:['dungeon01-09','dungeon01-16'], env:['奇怪的箱子']},
      {id:'dungeon01-13', name:'七层密室2', col:4, row:6, links:['dungeon01-07','dungeon01-15'], env:['奇怪的箱子']},
      {id:'dungeon01-14', name:'五层密室2', col:8, row:4, links:['dungeon01-05'], env:['奇怪的箱子']},
      {id:'dungeon01-15', name:'七层密室', col:2, row:6, links:['dungeon01-04','dungeon01-13'], env:['奇怪的箱子']},
      {id:'dungeon01-16', name:'密室2', col:7, row:0, links:['dungeon01-12'], env:['奇怪的箱子']}
    ]
  },

  'dungeon02':{
    name:'地下城2',
    grid:{cols:9, rows:9},
    tiles:[
      {id:'dungeon02-01', name:'二层', col:2, row:1, links:['dungeon02-09','dungeon02-02'], env:['迷雾']},
      {id:'dungeon02-02', name:'三层', col:3, row:2, links:['dungeon02-01','dungeon02-03','dungeon02-11','dungeon02-10'], env:['迷雾']},
      {id:'dungeon02-03', name:'四层', col:4, row:3, links:['dungeon02-02','dungeon02-05'], env:['迷雾']},
      {id:'dungeon02-04', name:'五层密室', col:2, row:4, links:['dungeon02-05'], env:['奇怪的箱子']},
      {id:'dungeon02-05', name:'五层', col:5, row:4, links:['dungeon02-14','dungeon02-04','dungeon02-06','dungeon02-03'], env:['迷雾']},
      {id:'dungeon02-06', name:'六层', col:6, row:5, links:['dungeon02-05','dungeon02-07'], env:['迷雾']},
      {id:'dungeon02-07', name:'七层', col:7, row:6, links:['dungeon02-13','dungeon02-06','dungeon02-08'], env:['迷雾']},
      {id:'dungeon02-08', name:'八层', col:7, row:7, links:['dungeon02-07'], env:['迷雾']},
      {id:'dungeon02-09', name:'一层', col:1, row:0, links:['dungeon02-01','dungeon02-12'], env:['迷雾'], edge:{label:'回去', targetMap:'dungeon01', targetTile:'dungeon01-08', direction:'north'}},
      {id:'dungeon02-10', name:'三层密室2', col:6, row:2, links:['dungeon02-02'], env:['奇怪的箱子']},
      {id:'dungeon02-11', name:'三层密室', col:0, row:2, links:['dungeon02-02'], env:['奇怪的箱子']},
      {id:'dungeon02-12', name:'密室', col:4, row:0, links:['dungeon02-09'], env:['奇怪的箱子']},
      {id:'dungeon02-13', name:'七层密室', col:4, row:6, links:['dungeon02-07','dungeon02-15'], env:['奇怪的箱子']},
      {id:'dungeon02-14', name:'五层密室2', col:8, row:4, links:['dungeon02-05'], env:['奇怪的箱子']},
      {id:'dungeon02-15', name:'七层密室2', col:2, row:6, links:['dungeon02-13','dungeon02-16'], env:['落灰的箱子']},
      {id:'dungeon02-16', name:'九层', col:2, row:8, links:['dungeon02-15'], env:['落灰的箱子']}
    ]
  },

  'region05':{
    name:'迷途岛',
    grid:{cols:8, rows:8},
    tiles:[
      {id:'region05-01', name:'海滩', col:7, row:4, links:['region05-02'], edge:{label:'出航银月港', targetMap:'region01-town03', targetTile:'', direction:'east'}},
      {id:'region05-02', name:'海滩2', col:7, row:3, links:['region05-01','region05-03']},
      {id:'region05-03', name:'海滩3', col:7, row:2, links:['region05-02','region05-04']},
      {id:'region05-04', name:'海滩4', col:6, row:1, links:['region05-03','region05-05']},
      {id:'region05-05', name:'海滩5', col:5, row:0, links:['region05-04','region05-06']},
      {id:'region05-06', name:'海滩6', col:4, row:0, links:['region05-05','region05-07']},
      {id:'region05-07', name:'海滩7', col:3, row:0, links:['region05-06','region05-08']},
      {id:'region05-08', name:'海滩8', col:2, row:1, links:['region05-07','region05-09']},
      {id:'region05-09', name:'海滩9', col:1, row:2, links:['region05-08','region05-10']},
      {id:'region05-10', name:'西地入口', col:0, row:3, links:['region05-09','region05-11'], edge:{label:'前往绝境沙漠', targetMap:'region06', targetTile:'region06-01', direction:'west'}},
      {id:'region05-11', name:'石柱', col:1, row:4, links:['region05-10','region05-12']},
      {id:'region05-12', name:'石柱2', col:1, row:5, links:['region05-11','region05-13']},
      {id:'region05-13', name:'石柱3', col:2, row:6, links:['region05-12','region05-14']},
      {id:'region05-14', name:'石柱4', col:3, row:7, links:['region05-13','region05-15']},
      {id:'region05-15', name:'石柱5', col:4, row:7, links:['region05-14','region05-16']},
      {id:'region05-16', name:'石柱6', col:5, row:6, links:['region05-15','region05-17']},
      {id:'region05-17', name:'石柱7', col:5, row:5, links:['region05-16','region05-18']},
      {id:'region05-18', name:'石柱8', col:5, row:4, links:['region05-17','region05-19']},
      {id:'region05-19', name:'石柱9', col:5, row:3, links:['region05-18','region05-20']},
      {id:'region05-20', name:'石柱10', col:4, row:2, links:['region05-19','region05-21']},
      {id:'region05-21', name:'祭坛', col:3, row:3, links:['region05-20','region05-22']},
      {id:'region05-22', name:'深渊', col:3, row:4, links:['region05-21'], edge:{label:'坠入深渊', targetMap:'dungeon03', targetTile:'dungeon03-29', direction:'east'}}
    ]
  },

  'region06':{
    name:'绝境沙漠',
    grid:{cols:10, rows:10},
    tiles:[
      {id:'region06-01', name:'商路', col:9, row:4, links:['region06-02','region06-31','region06-30'], edge:{label:'前往迷途岛', targetMap:'region05', targetTile:'region05-10', direction:'east'}},
      {id:'region06-02', name:'商路2', col:8, row:4, links:['region06-01','region06-33']},
      {id:'region06-03', name:'营地', col:5, row:5, links:['region06-43'], npcs:['npc194','npc181'], env:['破木箱']},
      {id:'region06-04', name:'商路20', col:4, row:4, links:['region06-05','region06-43']},
      {id:'region06-05', name:'商路19', col:3, row:3, links:['region06-06','region06-04','region06-53']},
      {id:'region06-06', name:'商路18', col:2, row:3, links:['region06-07','region06-05']},
      {id:'region06-07', name:'商路17', col:1, row:3, links:['region06-24','region06-06']},
      {id:'region06-08', name:'乱葬岗11', col:1, row:5, links:['region06-21','region06-41'], env:['风沙']},
      {id:'region06-09', name:'商路27', col:1, row:7, links:['region06-38','region06-23','region06-10','region06-40']},
      {id:'region06-10', name:'绿洲2', col:0, row:7, links:['region06-09'], npcs:['npc191'], env:['灌木丛']},
      {id:'region06-11', name:'乱葬岗3', col:8, row:2, links:['region06-32','region06-50'], env:['风沙']},
      {id:'region06-12', name:'乱葬岗4', col:7, row:1, links:['region06-50','region06-51'], env:['风沙']},
      {id:'region06-13', name:'商路7', col:6, row:0, links:['region06-54','region06-14','region06-51'], npcs:['npc193','npc189']},
      {id:'region06-14', name:'商路8', col:5, row:1, links:['region06-13','region06-37']},
      {id:'region06-15', name:'商路22', col:4, row:6, links:['region06-43','region06-16']},
      {id:'region06-16', name:'商路23', col:5, row:7, links:['region06-15','region06-18','region06-44','region06-19']},
      {id:'region06-17', name:'乱葬岗13', col:6, row:8, links:['region06-19','region06-45'], env:['风沙']},
      {id:'region06-18', name:'商路24', col:4, row:8, links:['region06-16','region06-39'], edge:{label:'前往流沙绿洲', targetMap:'region06-field01', targetTile:'region06-field01-01', direction:'south'}},
      {id:'region06-19', name:'乱葬岗12', col:5, row:8, links:['region06-17','region06-16'], env:['风沙']},
      {id:'region06-20', name:'营地2', col:0, row:3, links:['region06-24'], npcs:['npc185'], env:['破木箱']},
      {id:'region06-21', name:'商路29', col:0, row:5, links:['region06-23','region06-22','region06-08']},
      {id:'region06-22', name:'商路30', col:0, row:4, links:['region06-21'], edge:{label:'前往和平镇', targetMap:'region04-town02', targetTile:'region04-town02-01', direction:'west'}},
      {id:'region06-23', name:'商路28', col:0, row:6, links:['region06-09','region06-21']},
      {id:'region06-24', name:'商路16', col:0, row:2, links:['region06-49','region06-07','region06-20']},
      {id:'region06-25', name:'商路14', col:1, row:1, links:['region06-48','region06-49']},
      {id:'region06-26', name:'商路12', col:2, row:0, links:['region06-55','region06-48']},
      {id:'region06-27', name:'商路10', col:3, row:1, links:['region06-37','region06-55']},
      {id:'region06-28', name:'乱葬岗15', col:7, row:7, links:['region06-46','region06-45'], env:['风沙']},
      {id:'region06-29', name:'乱葬岗16', col:8, row:6, links:['region06-47','region06-46'], env:['风沙']},
      {id:'region06-30', name:'乱葬岗18', col:9, row:5, links:['region06-01','region06-47'], env:['风沙']},
      {id:'region06-31', name:'乱葬岗', col:9, row:3, links:['region06-32','region06-01'], env:['风沙']},
      {id:'region06-32', name:'乱葬岗2', col:9, row:2, links:['region06-31','region06-11'], env:['风沙']},
      {id:'region06-33', name:'商路3', col:7, row:4, links:['region06-02','region06-35']},
      {id:'region06-34', name:'乱葬岗7', col:5, row:4, links:['region06-53','region06-35'], env:['风沙']},
      {id:'region06-35', name:'商路4', col:6, row:3, links:['region06-33','region06-36','region06-34']},
      {id:'region06-36', name:'商路5', col:6, row:2, links:['region06-35','region06-54']},
      {id:'region06-37', name:'商路9', col:4, row:1, links:['region06-14','region06-27','region06-52']},
      {id:'region06-38', name:'商路26', col:2, row:8, links:['region06-39','region06-09']},
      {id:'region06-39', name:'商路25', col:3, row:8, links:['region06-18','region06-38']},
      {id:'region06-40', name:'旧营地', col:2, row:7, links:['region06-09'], env:['迷雾']},
      {id:'region06-41', name:'乱葬岗10', col:2, row:5, links:['region06-08'], env:['风沙']},
      {id:'region06-42', name:'乱葬岗9', col:3, row:5, links:['region06-43'], env:['风沙']},
      {id:'region06-43', name:'商路21', col:4, row:5, links:['region06-04','region06-15','region06-42','region06-03']},
      {id:'region06-44', name:'乱葬岗8', col:5, row:6, links:['region06-16'], env:['风沙']},
      {id:'region06-45', name:'乱葬岗14', col:7, row:8, links:['region06-17','region06-28'], env:['风沙']},
      {id:'region06-46', name:'旧营地2', col:8, row:7, links:['region06-29','region06-28'], npcs:['npc179'], env:['迷雾']},
      {id:'region06-47', name:'乱葬岗17', col:9, row:6, links:['region06-29','region06-30'], env:['风沙']},
      {id:'region06-48', name:'商路13', col:1, row:0, links:['region06-25','region06-26']},
      {id:'region06-49', name:'商路15', col:0, row:1, links:['region06-25','region06-24']},
      {id:'region06-50', name:'赌场', col:8, row:1, links:['region06-12','region06-11'], npcs:['npc180','npc182','npc183'], env:['破烂的酒缸']},
      {id:'region06-51', name:'乱葬岗5', col:7, row:0, links:['region06-12','region06-13'], env:['风沙']},
      {id:'region06-52', name:'绿洲', col:4, row:0, links:['region06-37'], env:['灌木丛']},
      {id:'region06-53', name:'乱葬岗6', col:4, row:3, links:['region06-05','region06-34'], env:['风沙']},
      {id:'region06-54', name:'商路6', col:6, row:1, links:['region06-36','region06-13']},
      {id:'region06-55', name:'商路11', col:3, row:0, links:['region06-27','region06-26']}
    ]
  },

  'region04-town02':{
    name:'和平镇',
    grid:{cols:8, rows:8},
    tiles:[
      {id:'region04-town02-01', name:'边郊', col:6, row:3, links:['region04-town02-14'], edge:{label:'进入沙漠', targetMap:'region06', targetTile:'region06-22', direction:'east'}},
      {id:'region04-town02-02', name:'高尖塔', col:4, row:3, links:['region04-town02-14','region04-town02-11','region04-town02-18']},
      {id:'region04-town02-03', name:'民舍2', col:2, row:3, links:['region04-town02-11','region04-town02-15']},
      {id:'region04-town02-04', name:'坑洞', col:0, row:3, links:['region04-town02-15'], npcs:['npc196','npc198'], edge:{label:'进入漠西主城', targetMap:'region04-town01', targetTile:'region04-town01-01', direction:'west'}},
      {id:'region04-town02-05', name:'民舍', col:2, row:5, links:['region04-town02-06','region04-town02-12']},
      {id:'region04-town02-06', name:'荒地4', col:3, row:6, links:['region04-town02-05','region04-town02-07'], edge:{label:'前往红岩峡谷', targetMap:'region04-town03', targetTile:'region04-town03-01', direction:'south'}},
      {id:'region04-town02-07', name:'荒地3', col:4, row:5, links:['region04-town02-06','region04-town02-12']},
      {id:'region04-town02-08', name:'民舍5', col:2, row:1, links:['region04-town02-10','region04-town02-13']},
      {id:'region04-town02-09', name:'民舍3', col:4, row:1, links:['region04-town02-10','region04-town02-13']},
      {id:'region04-town02-10', name:'民舍4', col:3, row:0, links:['region04-town02-09','region04-town02-08']},
      {id:'region04-town02-11', name:'破烂的广场', col:3, row:3, links:['region04-town02-02','region04-town02-03','region04-town02-13','region04-town02-12']},
      {id:'region04-town02-12', name:'破烂的魔能塔', col:3, row:4, links:['region04-town02-05','region04-town02-07','region04-town02-11'], npcs:['npc192']},
      {id:'region04-town02-13', name:'破烂的战士学院', col:3, row:2, links:['region04-town02-11','region04-town02-09','region04-town02-08'], npcs:['npc197']},
      {id:'region04-town02-14', name:'荒地', col:5, row:4, links:['region04-town02-01','region04-town02-02','region04-town02-16']},
      {id:'region04-town02-15', name:'警备室', col:1, row:3, links:['region04-town02-04','region04-town02-03','region04-town02-17']},
      {id:'region04-town02-16', name:'荒地2', col:5, row:6, links:['region04-town02-14']},
      {id:'region04-town02-17', name:'镇长办公室', col:1, row:2, links:['region04-town02-15'], npcs:['npc187']},
      {id:'region04-town02-18', name:'传送地', col:5, row:2, links:['region04-town02-02']}
    ]
  },

  'dungeon03':{
    name:'深渊',
    grid:{cols:10, rows:10},
    tiles:[
      {id:'dungeon03-01', name:'1', col:0, row:5, links:['dungeon03-02','dungeon03-29']},
      {id:'dungeon03-02', name:'2', col:0, row:7, links:['dungeon03-01','dungeon03-03']},
      {id:'dungeon03-03', name:'3', col:0, row:9, links:['dungeon03-02','dungeon03-04']},
      {id:'dungeon03-04', name:'4', col:2, row:9, links:['dungeon03-03','dungeon03-05']},
      {id:'dungeon03-05', name:'5', col:4, row:9, links:['dungeon03-04','dungeon03-06']},
      {id:'dungeon03-06', name:'6', col:6, row:9, links:['dungeon03-05','dungeon03-07']},
      {id:'dungeon03-07', name:'7', col:8, row:9, links:['dungeon03-06','dungeon03-08']},
      {id:'dungeon03-08', name:'8', col:9, row:8, links:['dungeon03-07','dungeon03-09']},
      {id:'dungeon03-09', name:'9', col:9, row:6, links:['dungeon03-08','dungeon03-10']},
      {id:'dungeon03-10', name:'10', col:9, row:4, links:['dungeon03-09','dungeon03-11']},
      {id:'dungeon03-11', name:'11', col:9, row:2, links:['dungeon03-10','dungeon03-12']},
      {id:'dungeon03-12', name:'12', col:9, row:0, links:['dungeon03-11','dungeon03-13']},
      {id:'dungeon03-13', name:'13', col:7, row:0, links:['dungeon03-12','dungeon03-14']},
      {id:'dungeon03-14', name:'14', col:5, row:0, links:['dungeon03-13','dungeon03-15']},
      {id:'dungeon03-15', name:'15', col:3, row:0, links:['dungeon03-14','dungeon03-16']},
      {id:'dungeon03-16', name:'16', col:2, row:1, links:['dungeon03-15','dungeon03-17']},
      {id:'dungeon03-17', name:'17', col:2, row:3, links:['dungeon03-18','dungeon03-16']},
      {id:'dungeon03-18', name:'18', col:2, row:5, links:['dungeon03-17','dungeon03-19']},
      {id:'dungeon03-19', name:'19', col:2, row:7, links:['dungeon03-18','dungeon03-20']},
      {id:'dungeon03-20', name:'20', col:4, row:7, links:['dungeon03-19','dungeon03-21']},
      {id:'dungeon03-21', name:'21', col:6, row:7, links:['dungeon03-20','dungeon03-22']},
      {id:'dungeon03-22', name:'22', col:7, row:6, links:['dungeon03-21','dungeon03-23']},
      {id:'dungeon03-23', name:'23', col:7, row:4, links:['dungeon03-22','dungeon03-24']},
      {id:'dungeon03-24', name:'24', col:7, row:2, links:['dungeon03-23','dungeon03-25']},
      {id:'dungeon03-25', name:'25', col:5, row:2, links:['dungeon03-24','dungeon03-26']},
      {id:'dungeon03-26', name:'26', col:4, row:3, links:['dungeon03-25','dungeon03-27']},
      {id:'dungeon03-27', name:'27', col:4, row:5, links:['dungeon03-26','dungeon03-28']},
      {id:'dungeon03-28', name:'黑棺', col:5, row:5, links:['dungeon03-27']},
      {id:'dungeon03-29', name:'深渊入口', col:0, row:3, links:['dungeon03-01'], edge:{label:'离开深渊·回到王府', targetMap:'region03-town06', targetTile:'region03-town06-04', direction:'west'}}
    ]
  },

  'region04-town01':{
    name:'漠西主城',
    grid:{cols:8, rows:9},
    tiles:[
      {id:'region04-town01-01', name:'半截城门', col:7, row:4, links:['region04-town01-02','region04-town01-14'], edge:{label:'回到坑洞', targetMap:'region04-town02', targetTile:'region04-town02-04', direction:'east'}},
      {id:'region04-town01-02', name:'石桥', col:6, row:3, links:['region04-town01-01','region04-town01-15','region04-town01-03']},
      {id:'region04-town01-03', name:'破败的战士学院', col:5, row:2, links:['region04-town01-20','region04-town01-04','region04-town01-02','region04-town01-16']},
      {id:'region04-town01-04', name:'破败的魔药店', col:4, row:2, links:['region04-town01-05','region04-town01-03','region04-town01-16']},
      {id:'region04-town01-05', name:'破败的铁匠铺', col:3, row:2, links:['region04-town01-22','region04-town01-04','region04-town01-06','region04-town01-16']},
      {id:'region04-town01-06', name:'警备室', col:2, row:3, links:['region04-town01-07','region04-town01-05']},
      {id:'region04-town01-07', name:'城主府', col:1, row:4, links:['region04-town01-09','region04-town01-08','region04-town01-06','region04-town01-10']},
      {id:'region04-town01-08', name:'内室2', col:0, row:3, links:['region04-town01-07']},
      {id:'region04-town01-09', name:'内室', col:0, row:5, links:['region04-town01-07']},
      {id:'region04-town01-10', name:'破败的书馆', col:2, row:5, links:['region04-town01-07','region04-town01-11']},
      {id:'region04-town01-11', name:'破败的民舍', col:3, row:6, links:['region04-town01-17','region04-town01-12','region04-town01-10','region04-town01-16']},
      {id:'region04-town01-12', name:'破败的冒险者工会', col:4, row:6, links:['region04-town01-11','region04-town01-13','region04-town01-16']},
      {id:'region04-town01-13', name:'破败的魔能塔', col:5, row:6, links:['region04-town01-19','region04-town01-12','region04-town01-16']},
      {id:'region04-town01-14', name:'断桥', col:6, row:5, links:['region04-town01-01','region04-town01-15']},
      {id:'region04-town01-15', name:'破碎的高尖塔', col:5, row:4, links:['region04-town01-16','region04-town01-14','region04-town01-02']},
      {id:'region04-town01-16', name:'广场', col:4, row:4, links:['region04-town01-15','region04-town01-11','region04-town01-04','region04-town01-05','region04-town01-12','region04-town01-03','region04-town01-13']},
      {id:'region04-town01-17', name:'破败的民舍2', col:3, row:7, links:['region04-town01-18','region04-town01-11']},
      {id:'region04-town01-18', name:'破败的民舍3', col:4, row:7, links:['region04-town01-19','region04-town01-17']},
      {id:'region04-town01-19', name:'破败的民舍4', col:5, row:7, links:['region04-town01-18','region04-town01-13']},
      {id:'region04-town01-20', name:'破败的民舍5', col:5, row:1, links:['region04-town01-21','region04-town01-03'], edge:{label:'前往风蚀高地', targetMap:'region04-town04', targetTile:'region04-town04-01', direction:'north'}},
      {id:'region04-town01-21', name:'破败的民舍6', col:4, row:1, links:['region04-town01-20','region04-town01-22']},
      {id:'region04-town01-22', name:'破败的民舍7', col:3, row:1, links:['region04-town01-21','region04-town01-05']}
    ]
  }

,
  'region01-town05':{
    name:'晨曦岗',
    grid:{cols:6, rows:5},
    tiles:[
      {id:'region01-town05-01', name:'西哨岗', col:0, row:2, links:['region01-town05-02'], npcs:['npc200','npc233'], edge:{label:'返回和谐镇', targetMap:'region01-town01', targetTile:'region01-town01-09', direction:'west'}},
      {id:'region01-town05-02', name:'主街1', col:1, row:2, links:['region01-town05-06','region01-town05-12','region01-town05-01','region01-town05-03'], npcs:['npc327'], env:['破木箱'], battle:'enc_005'},
      {id:'region01-town05-03', name:'晨曦广场', col:2, row:2, links:['region01-town05-04','region01-town05-07','region01-town05-02','region01-town05-09'], npcs:['npc250','npc281','npc202','npc282','npc287']},
      {id:'region01-town05-04', name:'钟楼', col:2, row:1, links:['region01-town05-03','region01-town05-06','region01-town05-05']},
      {id:'region01-town05-05', name:'旅店', col:3, row:1, links:['region01-town05-09','region01-town05-04','region01-town05-11'], npcs:['npc219','npc220']},
      {id:'region01-town05-06', name:'民居3', col:1, row:1, links:['region01-town05-02','region01-town05-04'], npcs:['npc399'], env:['枯草丛'], battle:'enc_017'},
      {id:'region01-town05-07', name:'杂货铺', col:2, row:3, links:['region01-town05-03','region01-town05-12','region01-town05-08'], npcs:['npc221','npc229']},
      {id:'region01-town05-08', name:'铁匠铺', col:3, row:3, links:['region01-town05-09','region01-town05-07','region01-town05-13']},
      {id:'region01-town05-09', name:'主街2', col:3, row:2, links:['region01-town05-05','region01-town05-08','region01-town05-03','region01-town05-10'], env:['枯草丛'], battle:'enc_005', npcs:['npc217','npc247','npc313','npc339']},
      {id:'region01-town05-10', name:'民居1', col:4, row:2, links:['region01-town05-11','region01-town05-13','region01-town05-09'], npcs:['npc319'], env:['落灰的箱子']},
      {id:'region01-town05-11', name:'民居2', col:4, row:1, links:['region01-town05-10','region01-town05-05','region01-town05-15'], npcs:['npc332'], env:['破木箱']},
      {id:'region01-town05-12', name:'民居4', col:1, row:3, links:['region01-town05-02','region01-town05-07'], npcs:['npc307','npc345'], env:['破烂的酒缸']},
      {id:'region01-town05-13', name:'农田1', col:4, row:3, links:['region01-town05-10','region01-town05-08','region01-town05-14'], npcs:['npc234','npc259','npc248','npc243','npc308']},
      {id:'region01-town05-14', name:'农田2', col:5, row:3, links:['region01-town05-13'], npcs:['npc382'], env:['破烂的酒缸']},
      {id:'region01-town05-15', name:'东望塔', col:5, row:1, links:['region01-town05-11']}
    ]
  },

  'region01-town06':{
    name:'冰裂谷',
    grid:{cols:8, rows:7},
    tiles:[
      {id:'region01-town06-01', name:'冰裂入口', col:7, row:3, links:['region01-town06-02'], npcs:['npc214','npc216','npc271','npc398'], edge:{label:'返回天冰镇', targetMap:'region01-town04', targetTile:'region01-town04-10', direction:'east'}},
      {id:'region01-town06-02', name:'冰谷1', col:6, row:3, links:['region01-town06-16','region01-town06-03','region01-town06-01']},
      {id:'region01-town06-03', name:'冰谷2', col:5, row:3, links:['region01-town06-04','region01-town06-07','region01-town06-02'], npcs:['npc361'], env:['雪堆'], battle:'enc_011'},
      {id:'region01-town06-04', name:'冰桥', col:5, row:2, links:['region01-town06-03','region01-town06-05','region01-town06-16']},
      {id:'region01-town06-05', name:'冰谷3', col:4, row:2, links:['region01-town06-06','region01-town06-04'], env:['冰晶堆'], npcs:['npc258','npc267','npc391']},
      {id:'region01-town06-06', name:'冰晶矿洞', col:3, row:2, links:['region01-town06-14','region01-town06-05']},
      {id:'region01-town06-07', name:'寒潭', col:5, row:4, links:['region01-town06-03','region01-town06-08']},
      {id:'region01-town06-08', name:'冰谷4', col:4, row:4, links:['region01-town06-09','region01-town06-07'], env:['冰晶堆'], npcs:['npc288','npc210','npc397']},
      {id:'region01-town06-09', name:'冰窟', col:3, row:4, links:['region01-town06-10','region01-town06-08']},
      {id:'region01-town06-10', name:'冰谷5', col:2, row:4, links:['region01-town06-11','region01-town06-13','region01-town06-09'], battle:'enc_013'},
      {id:'region01-town06-11', name:'霜骨台', col:2, row:3, links:['region01-town06-10','region01-town06-12'], npcs:['npc279','npc206']},
      {id:'region01-town06-12', name:'冰谷6', col:1, row:3, links:['region01-town06-13','region01-town06-11'], env:['冰封的宝箱']},
      {id:'region01-town06-13', name:'冰封营地', col:1, row:4, links:['region01-town06-12','region01-town06-10']},
      {id:'region01-town06-14', name:'冰谷7', col:3, row:1, links:['region01-town06-06','region01-town06-15'], battle:'enc_055', npcs:['npc222','npc209','npc350']},
      {id:'region01-town06-15', name:'冰谷8', col:2, row:1, links:['region01-town06-14']},
      {id:'region01-town06-16', name:'冰谷9', col:6, row:2, links:['region01-town06-02','region01-town06-04'], env:['冰封的宝箱']}
    ]
  },

  'region02-field01':{
    name:'低语林地',
    grid:{cols:8, rows:8},
    tiles:[
      {id:'region02-field01-01', name:'林地入口', col:7, row:3, links:['region02-field01-02'], edge:{label:'返回野外', targetMap:'region02', targetTile:'region02-22', direction:'east'}},
      {id:'region02-field01-02', name:'林地1', col:6, row:3, links:['region02-field01-13','region02-field01-14','region02-field01-03','region02-field01-01'], battle:'enc_033', npcs:['npc223','npc283','npc230','npc232','npc299','npc331']},
      {id:'region02-field01-03', name:'低语树', col:5, row:3, links:['region02-field01-04','region02-field01-07','region02-field01-02']},
      {id:'region02-field01-04', name:'林地2', col:5, row:2, links:['region02-field01-03','region02-field01-05','region02-field01-13'], npcs:['npc311'], battle:'enc_005'},
      {id:'region02-field01-05', name:'林地3', col:4, row:2, links:['region02-field01-06','region02-field01-04'], env:['蘑菇圈']},
      {id:'region02-field01-06', name:'古树', col:3, row:2, links:['region02-field01-05']},
      {id:'region02-field01-07', name:'林间空地', col:5, row:4, links:['region02-field01-03','region02-field01-08','region02-field01-14']},
      {id:'region02-field01-08', name:'林地4', col:4, row:4, links:['region02-field01-09','region02-field01-07'], npcs:['npc305'], env:['鸟巢']},
      {id:'region02-field01-09', name:'猎人小屋', col:3, row:4, links:['region02-field01-10','region02-field01-08']},
      {id:'region02-field01-10', name:'林地5', col:2, row:4, links:['region02-field01-11','region02-field01-09'], npcs:['npc403'], env:['藤蔓'], battle:'enc_005'},
      {id:'region02-field01-11', name:'苔藓岩', col:2, row:3, links:['region02-field01-10','region02-field01-12']},
      {id:'region02-field01-12', name:'林地6', col:1, row:3, links:['region02-field01-11'], npcs:['npc386']},
      {id:'region02-field01-13', name:'林地9', col:6, row:2, links:['region02-field01-02','region02-field01-04'], npcs:['npc251','npc273','npc301','npc377','npc387','npc326']},
      {id:'region02-field01-14', name:'林地10', col:6, row:4, links:['region02-field01-02','region02-field01-15','region02-field01-07'], npcs:['npc337'], env:['枯草丛']},
      {id:'region02-field01-15', name:'林地12', col:6, row:5, links:['region02-field01-14','region02-field01-16'], env:['腐木堆'], npcs:['npc207','npc269','npc309','npc378','npc388','npc336']},
      {id:'region02-field01-16', name:'林地11', col:7, row:5, links:['region02-field01-17','region02-field01-15'], npcs:['npc316']},
      {id:'region02-field01-17', name:'林地边缘', col:7, row:6, links:['region02-field01-16'], edge:{label:'前往荆棘荒野', targetMap:'region02-field02', targetTile:'region02-field02-01', direction:'south'}}
    ]
  },

  'region02-field02':{
    name:'荆棘荒野',
    grid:{cols:8, rows:8},
    tiles:[
      {id:'region02-field02-01', name:'荒野入口', col:7, row:0, links:['region02-field02-02'], npcs:['npc224','npc201','npc235','npc292'], edge:{label:'返回低语林地', targetMap:'region02-field01', targetTile:'region02-field01-17', direction:'north'}},
      {id:'region02-field02-02', name:'荒野1', col:6, row:0, links:['region02-field02-03','region02-field02-01'], env:['坑洞']},
      {id:'region02-field02-03', name:'荆棘丛', col:6, row:1, links:['region02-field02-02','region02-field02-04']},
      {id:'region02-field02-04', name:'荒野2', col:5, row:1, links:['region02-field02-05','region02-field02-03'], npcs:['npc255','npc211','npc241','npc290','npc303','npc320']},
      {id:'region02-field02-05', name:'乱石岗', col:5, row:2, links:['region02-field02-04','region02-field02-06'], npcs:['npc275','npc295','npc253','npc276','npc393']},
      {id:'region02-field02-06', name:'荒野3', col:4, row:2, links:['region02-field02-07','region02-field02-05'], npcs:['npc304'], env:['荆棘堆']},
      {id:'region02-field02-07', name:'枯树', col:4, row:3, links:['region02-field02-06','region02-field02-08']},
      {id:'region02-field02-08', name:'荒野4', col:3, row:3, links:['region02-field02-09','region02-field02-07'], env:['荆棘堆'], npcs:['npc289']},
      {id:'region02-field02-09', name:'废弃营地', col:3, row:4, links:['region02-field02-08','region02-field02-12','region02-field02-10']},
      {id:'region02-field02-10', name:'荒野5', col:2, row:4, links:['region02-field02-11','region02-field02-09'], npcs:['npc323'], env:['荆棘堆']},
      {id:'region02-field02-11', name:'兽骨堆', col:2, row:5, links:['region02-field02-10','region02-field02-12']},
      {id:'region02-field02-12', name:'荒野6', col:3, row:5, links:['region02-field02-09','region02-field02-11','region02-field02-13'], battle:'enc_035', npcs:['npc296','npc213','npc300','npc329']},
      {id:'region02-field02-13', name:'荒野7', col:4, row:5, links:['region02-field02-12','region02-field02-14'], env:['乱石堆'], npcs:['npc237','npc254']},
      {id:'region02-field02-14', name:'荒野8', col:5, row:5, links:['region02-field02-15','region02-field02-13'], npcs:['npc328'], env:['风化的骸骨']},
      {id:'region02-field02-15', name:'荒野9', col:5, row:6, links:['region02-field02-14','region02-field02-16'], npcs:['npc302'], env:['乱石堆'], battle:'enc_034'},
      {id:'region02-field02-16', name:'荒野10', col:6, row:6, links:['region02-field02-17','region02-field02-15'], env:['荆棘堆']},
      {id:'region02-field02-17', name:'荒野11', col:6, row:7, links:['region02-field02-16','region02-field02-18'], npcs:['npc340'], env:['风化的骸骨']},
      {id:'region02-field02-18', name:'荒野尽头', col:7, row:7, links:['region02-field02-17'], edge:{label:'返回幽暗密林', targetMap:'region02-field03', targetTile:'region02-field03-19', direction:'east'}}
    ]
  },

  'region02-field03':{
    name:'幽暗密林',
    grid:{cols:8, rows:8},
    tiles:[
      {id:'region02-field03-01', name:'密林入口', col:3, row:0, links:['region02-field03-02'], edge:{label:'返回野外', targetMap:'region02', targetTile:'region02-10', direction:'north'}},
      {id:'region02-field03-02', name:'密林1', col:3, row:1, links:['region02-field03-01','region02-field03-03'], npcs:['npc315'], env:['腐木堆'], battle:'enc_035'},
      {id:'region02-field03-03', name:'巨树', col:3, row:2, links:['region02-field03-02','region02-field03-04','region02-field03-05']},
      {id:'region02-field03-04', name:'密林2', col:2, row:2, links:['region02-field03-06','region02-field03-03'], npcs:['npc347']},
      {id:'region02-field03-05', name:'密林3', col:4, row:2, links:['region02-field03-07','region02-field03-03'], npcs:['npc244','npc263','npc231','npc226','npc310','npc363','npc379']},
      {id:'region02-field03-06', name:'暗影空地', col:2, row:3, links:['region02-field03-04','region02-field03-12','region02-field03-08']},
      {id:'region02-field03-07', name:'密林4', col:4, row:3, links:['region02-field03-05','region02-field03-13','region02-field03-09']},
      {id:'region02-field03-08', name:'密林5', col:1, row:3, links:['region02-field03-10','region02-field03-06'], npcs:['npc312']},
      {id:'region02-field03-09', name:'藤桥', col:5, row:3, links:['region02-field03-11','region02-field03-07'], npcs:['npc238','npc286','npc277','npc261','npc239']},
      {id:'region02-field03-10', name:'密林6', col:1, row:4, links:['region02-field03-08','region02-field03-16','region02-field03-12'], env:['水洼']},
      {id:'region02-field03-11', name:'密林7', col:5, row:4, links:['region02-field03-09','region02-field03-20','region02-field03-13'], npcs:['npc334'], env:['腐木堆'], battle:'enc_013'},
      {id:'region02-field03-12', name:'毒沼', col:2, row:4, links:['region02-field03-06','region02-field03-14','region02-field03-10']},
      {id:'region02-field03-13', name:'密林8', col:4, row:4, links:['region02-field03-07','region02-field03-15','region02-field03-11'], env:['腐木堆']},
      {id:'region02-field03-14', name:'密林9', col:2, row:5, links:['region02-field03-12','region02-field03-16'], env:['水洼'], npcs:['npc272','npc204','npc208','npc245','npc381','npc389','npc357']},
      {id:'region02-field03-15', name:'精灵遗迹', col:4, row:5, links:['region02-field03-13','region02-field03-20']},
      {id:'region02-field03-16', name:'密林10', col:1, row:5, links:['region02-field03-10','region02-field03-17','region02-field03-14']},
      {id:'region02-field03-17', name:'密林11', col:1, row:6, links:['region02-field03-16','region02-field03-18'], env:['腐木堆'], battle:'enc_013'},
      {id:'region02-field03-18', name:'密林12', col:0, row:6, links:['region02-field03-19','region02-field03-17'], npcs:['npc365'], env:['腐木堆']},
      {id:'region02-field03-19', name:'密林边缘', col:0, row:7, links:['region02-field03-18'], edge:{label:'前往荆棘荒野', targetMap:'region02-field02', targetTile:'region02-field02-18', direction:'west'}},
      {id:'region02-field03-20', name:'密林13', col:5, row:5, links:['region02-field03-11','region02-field03-15'], env:['蘑菇圈'], npcs:['npc256','npc203','npc306','npc380']}
    ]
  },

  'region06-field01':{
    name:'流沙绿洲',
    grid:{cols:10, rows:10},
    tiles:[
      {id:'region06-field01-01', name:'绿洲入口', col:4, row:0, links:['region06-field01-02'], edge:{label:'返回绝境沙漠', targetMap:'region06', targetTile:'region06-18', direction:'north'}},
      {id:'region06-field01-02', name:'沙地1', col:4, row:1, links:['region06-field01-01','region06-field01-03'], npcs:['npc317'], battle:'enc_040'},
      {id:'region06-field01-03', name:'月牙泉', col:4, row:2, links:['region06-field01-02','region06-field01-04','region06-field01-05']},
      {id:'region06-field01-04', name:'沙地2', col:3, row:2, links:['region06-field01-06','region06-field01-03'], npcs:['npc318']},
      {id:'region06-field01-05', name:'沙地3', col:5, row:2, links:['region06-field01-07','region06-field01-03'], env:['风沙'], npcs:['npc278','npc240','npc249','npc297','npc291','npc325','npc402','npc349']},
      {id:'region06-field01-06', name:'商队营地', col:3, row:3, links:['region06-field01-04','region06-field01-08']},
      {id:'region06-field01-07', name:'沙地4', col:5, row:3, links:['region06-field01-05','region06-field01-09'], env:['半埋的宝箱'], battle:'enc_041'},
      {id:'region06-field01-08', name:'沙地5', col:2, row:3, links:['region06-field01-10','region06-field01-06'], env:['风沙']},
      {id:'region06-field01-09', name:'风蚀柱', col:6, row:3, links:['region06-field01-11','region06-field01-07'], npcs:['npc264','npc285','npc284','npc257','npc314','npc324']},
      {id:'region06-field01-10', name:'沙地6', col:2, row:4, links:['region06-field01-08','region06-field01-16','region06-field01-12']},
      {id:'region06-field01-11', name:'沙地7', col:6, row:4, links:['region06-field01-09','region06-field01-17','region06-field01-13'], npcs:['npc338'], env:['沙堆']},
      {id:'region06-field01-12', name:'沙地8', col:1, row:4, links:['region06-field01-14','region06-field01-10'], env:['风沙']},
      {id:'region06-field01-13', name:'仙人掌群', col:7, row:4, links:['region06-field01-15','region06-field01-11']},
      {id:'region06-field01-14', name:'沙地9', col:1, row:5, links:['region06-field01-12','region06-field01-16'], npcs:['npc344'], env:['流沙坑']},
      {id:'region06-field01-15', name:'沙地10', col:7, row:5, links:['region06-field01-13','region06-field01-17'], npcs:['npc341'], env:['流沙坑']},
      {id:'region06-field01-16', name:'古井', col:2, row:5, links:['region06-field01-10','region06-field01-14','region06-field01-18']},
      {id:'region06-field01-17', name:'沙地11', col:6, row:5, links:['region06-field01-11','region06-field01-19','region06-field01-15'], env:['沙堆'], battle:'enc_041'},
      {id:'region06-field01-18', name:'沙地12', col:3, row:5, links:['region06-field01-22','region06-field01-16','region06-field01-20'], env:['半埋的宝箱'], battle:'enc_041'},
      {id:'region06-field01-19', name:'沙地13', col:5, row:5, links:['region06-field01-23','region06-field01-20','region06-field01-17'], npcs:['npc333'], env:['风沙']},
      {id:'region06-field01-20', name:'绿洲', col:4, row:5, links:['region06-field01-21','region06-field01-18','region06-field01-19']},
      {id:'region06-field01-21', name:'沙地14', col:4, row:6, links:['region06-field01-20','region06-field01-22','region06-field01-23'], env:['沙堆']},
      {id:'region06-field01-22', name:'沙地15', col:3, row:6, links:['region06-field01-18','region06-field01-21'], env:['风沙']},
      {id:'region06-field01-23', name:'沙地16', col:5, row:6, links:['region06-field01-19','region06-field01-21'], env:['沙堆']}
    ]
  },

  'region04-town03':{
    name:'红岩峡谷',
    grid:{cols:8, rows:7},
    tiles:[
      {id:'region04-town03-01', name:'峡谷入口', col:3, row:0, links:['region04-town03-02'], edge:{label:'返回和平镇', targetMap:'region04-town02', targetTile:'region04-town02-06', direction:'north'}},
      {id:'region04-town03-02', name:'峡谷1', col:3, row:1, links:['region04-town03-01','region04-town03-03']},
      {id:'region04-town03-03', name:'红岩壁', col:3, row:2, links:['region04-town03-02','region04-town03-04','region04-town03-05'], npcs:['npc265','npc215','npc218','npc270','npc246','npc330']},
      {id:'region04-town03-04', name:'峡谷2', col:2, row:2, links:['region04-town03-06','region04-town03-03'], env:['乱石堆']},
      {id:'region04-town03-05', name:'吊桥', col:4, row:2, links:['region04-town03-07','region04-town03-03']},
      {id:'region04-town03-06', name:'峡谷3', col:2, row:3, links:['region04-town03-04','region04-town03-12','region04-town03-08'], env:['碎石堆']},
      {id:'region04-town03-07', name:'峡谷营地', col:4, row:3, links:['region04-town03-05','region04-town03-13','region04-town03-09'], npcs:['npc228','npc274','npc293','npc262','npc236']},
      {id:'region04-town03-08', name:'峡谷4', col:1, row:3, links:['region04-town03-10','region04-town03-06'], npcs:['npc362'], battle:'enc_019'},
      {id:'region04-town03-09', name:'峡谷5', col:5, row:3, links:['region04-town03-11','region04-town03-07'], npcs:['npc401'], env:['乱石堆']},
      {id:'region04-town03-10', name:'矿道', col:1, row:4, links:['region04-town03-08','region04-town03-12']},
      {id:'region04-town03-11', name:'峡谷6', col:5, row:4, links:['region04-town03-09','region04-town03-13'], npcs:['npc212','npc268','npc392','npc396']},
      {id:'region04-town03-12', name:'峡谷7', col:2, row:4, links:['region04-town03-06','region04-town03-14','region04-town03-10'], npcs:['npc383'], env:['乱石堆']},
      {id:'region04-town03-13', name:'落石滩', col:4, row:4, links:['region04-town03-07','region04-town03-15','region04-town03-11']},
      {id:'region04-town03-14', name:'峡谷8', col:2, row:5, links:['region04-town03-12','region04-town03-16'], env:['落石'], battle:'enc_035'},
      {id:'region04-town03-15', name:'峡谷9', col:4, row:5, links:['region04-town03-13','region04-town03-16'], env:['乱石堆'], battle:'enc_035'},
      {id:'region04-town03-16', name:'峡谷10', col:3, row:5, links:['region04-town03-14','region04-town03-15'], env:['乱石堆']}
    ]
  },

  'region04-town04':{
    name:'风蚀高地',
    grid:{cols:8, rows:8},
    tiles:[
      {id:'region04-town04-01', name:'高地入口', col:5, row:7, links:['region04-town04-02'], edge:{label:'返回漠西主城', targetMap:'region04-town01', targetTile:'region04-town01-20', direction:'south'}},
      {id:'region04-town04-02', name:'高地1', col:5, row:6, links:['region04-town04-01','region04-town04-03','region04-town04-04'], env:['乱石堆']},
      {id:'region04-town04-03', name:'高地2', col:4, row:6, links:['region04-town04-05','region04-town04-02'], npcs:['npc199','npc252','npc298','npc227','npc260','npc343','npc367']},
      {id:'region04-town04-04', name:'高地3', col:6, row:6, links:['region04-town04-06','region04-town04-02'], npcs:['npc390'], env:['风蚀石柱']},
      {id:'region04-town04-05', name:'风蚀岩', col:4, row:5, links:['region04-town04-12','region04-town04-03','region04-town04-07']},
      {id:'region04-town04-06', name:'高地4', col:6, row:5, links:['region04-town04-13','region04-town04-04','region04-town04-08'], npcs:['npc359'], env:['碎石堆']},
      {id:'region04-town04-07', name:'高地5', col:3, row:5, links:['region04-town04-09','region04-town04-05'], env:['风蚀石柱']},
      {id:'region04-town04-08', name:'烽火台', col:7, row:5, links:['region04-town04-10','region04-town04-06']},
      {id:'region04-town04-09', name:'高地6', col:3, row:4, links:['region04-town04-15','region04-town04-07','region04-town04-11','region04-town04-12'], env:['碎石堆']},
      {id:'region04-town04-10', name:'高地7', col:7, row:4, links:['region04-town04-08','region04-town04-13'], npcs:['npc385'], env:['风蚀石柱'], battle:'enc_056'},
      {id:'region04-town04-11', name:'石阵', col:2, row:4, links:['region04-town04-14','region04-town04-09'], npcs:['npc225','npc280','npc205','npc242','npc394']},
      {id:'region04-town04-12', name:'高地8', col:4, row:4, links:['region04-town04-17','region04-town04-05','region04-town04-09'], env:['乱石堆'], battle:'enc_019'},
      {id:'region04-town04-13', name:'高地9', col:6, row:4, links:['region04-town04-06','region04-town04-10'], battle:'enc_019'},
      {id:'region04-town04-14', name:'高地10', col:2, row:3, links:['region04-town04-11','region04-town04-15'], env:['碎石堆']},
      {id:'region04-town04-15', name:'高地11', col:3, row:3, links:['region04-town04-09','region04-town04-14','region04-town04-17'], env:['乱石堆'], battle:'enc_016'},
      {id:'region04-town04-16', name:'鹰巢', col:5, row:3, links:['region04-town04-19','region04-town04-17']},
      {id:'region04-town04-17', name:'高地12', col:4, row:3, links:['region04-town04-18','region04-town04-12','region04-town04-15','region04-town04-16'], npcs:['npc266','npc294','npc354']},
      {id:'region04-town04-18', name:'古老祭坛', col:4, row:2, links:['region04-town04-17','region04-town04-19']},
      {id:'region04-town04-19', name:'高地13', col:5, row:2, links:['region04-town04-16','region04-town04-18'], npcs:['npc384'], env:['古老石碑']}
    ]
  }
};

/* ============================================================
   遭遇战
   ------------------------------------------------------------
   命名约定（P0-14 统一）：
     north_sub / west_sub / south_sub      主城区外围（早期）
     mc_forest_*                            森林
     mc_water_*                             水域
     mc_desert_*                            沙漠
     mc_army_*                              魔军部队
     mc_infected_*                          感染者
     mc_mythic_*                            魔兽 / 传说生物
   后缀 _1 / _2 / _3 … 表示同一区域的难度递增
   特殊遭遇（保留原名）：north_bridge_duel / tower_guardian / graveyard_hole / bm_enc_thief
   ============================================================ */
const BATTLE_ENCOUNTERS = {
  /* 遭遇类型只有两种：
       special 特殊型：手工编成，enemies 固定前后排；
       random  随机型：pool 内每个角色只出现一次，poolWeights 控制刷新权重。
     不再使用 special:true 的 BOSS 标记。 */

  /* ---- 早期场景（主城区外围） ---- */
  enc_001:{
    name:'城郊遭遇战', type:'special',
    enemies:[
      {name:'npc299', row:'front'},
      {name:'npc299', row:'front'},
      {name:'npc300',   row:'front'}
    ]
  },
  enc_002:{name:'北石桥挑战', type:'special', enemies:[{name:'npc413', row:'front'}]},
  enc_003:{name:'西郊遭遇战', type:'random', pool:['npc319','npc343','npc336'], poolWeights:[5,1,1], min:3, max:4},
  enc_004:{name:'南郊遭遇战',type:'random',pool:['npc321','npc305','npc306'], poolWeights:[1,2,2],min:3, max:4},
  enc_005:{name:'城郊遭遇战兽', type:'random', pool:['npc299','npc300','npc301','npc302'], poolWeights:[1,1,1,1], min:3, max:4},
  enc_006:{name:'城郊遭遇战兽2', type:'random', pool:['npc303','npc304','npc309','npc326'], poolWeights:[1,1,1,1], min:3, max:4},
  enc_007:{name:'城郊遭遇战兽3', type:'random', pool:['npc326','npc305','npc342','npc319','npc321'], poolWeights:[2,2,1,1,2], min:3, max:4},
  enc_008:{name:'坟地·坑洞', type:'random', pool:['npc299','npc300','npc309','npc301'], poolWeights:[1,1,1,1], min:2, max:3},
  enc_009:{name:'黑市·巷子遭遇', type:'special', enemies:[{name:'npc411', row:'front'}]},

  enc_057:{
    name:'城郊遭遇战兽7to9',
    type:'random',
    pool:['npc327','npc324','npc333','npc341'], poolWeights:[1,1,1,1],
    min:3, max:4
  },

  enc_010:{
    name:'迷失者21to25',
    type:'random',
    pool:['npc464','npc429'], poolWeights:[3,2],
    min:3, max:4
  },

  enc_011:{
    name:'魔兽精20to25',
    type:'random',
    pool:['npc387','npc437','npc389','npc444'], poolWeights:[1,1,1,1],
    min:3, max:4
  },

  enc_012:{
    name:'魔兽法23to28',
    type:'random',
    pool:['npc431','npc442','npc444','npc433','npc395'], poolWeights:[1,1,1,1,1],
    min:3, max:4
  },

  enc_013:{
    name:'魔兽飞24to28',
    type:'random',
    pool:['npc442','npc444','npc361','npc369'], poolWeights:[1,1,1,1],
    min:3, max:4
  },

  enc_014:{
    name:'魔兽足24to29',
    type:'random',
    pool:['npc442','npc431','npc433','npc397'], poolWeights:[1,1,1,1],
    min:3, max:4
  },

  enc_015:{
    name:'魔兽龙30',
    type:'random',
    pool:['npc395'], poolWeights:[2],
    min:2, max:2
  },

  enc_016:{
    name:'魔兽巨人25to30',
    type:'random',
    pool:['npc384','npc366','npc413','npc416'], poolWeights:[2,2,2,1],
    min:3, max:4
  },

  enc_017:{
    name:'遭遇战人10to15',
    type:'random',
    pool:['npc409','npc416'], poolWeights:[1,1],
    min:2, max:2
  },

  enc_018:{
    name:'遭遇战人15to18',
    type:'random',
    pool:['npc416','npc418','npc419'], poolWeights:[2,1,1],
    min:3, max:4
  },

  enc_019:{
    name:'遭遇战人18to30',
    type:'random',
    pool:['npc419','npc421','npc465'], poolWeights:[1,3,1],
    min:3, max:4
  },

  enc_020:{
    name:'邪教遭遇战15to25',
    type:'random',
    pool:['npc416','npc429'], poolWeights:[4,1],
    min:3, max:3
  },

  enc_021:{
    name:'邪教遭遇战25to28',
    type:'random',
    pool:['npc429','npc430'], poolWeights:[3,2],
    min:3, max:3
  },

  enc_022:{
    name:'邪教遭遇战28to34',
    type:'random',
    pool:['npc430','npc431','npc432'], poolWeights:[3,1,1],
    min:2, max:4
  },

  enc_023:{
    name:'邪教遭遇战31to37',
    type:'random',
    pool:['npc431','npc432','npc433'], poolWeights:[2,2,1],
    min:2, max:4
  },

  enc_024:{
    name:'邪教遭遇战34to41',
    type:'random',
    pool:['npc432','npc433','npc434'], poolWeights:[3,2,1],
    min:4, max:4
  },

  enc_025:{
    name:'邪教遭遇战34to45',
    type:'random',
    pool:['npc432','npc434','npc435'], poolWeights:[3,2,1],
    min:2, max:4
  },

  enc_026:{
    name:'邪教遭遇战45',
    type:'random',
    pool:['npc435'], poolWeights:[1],
    min:1, max:1
  },

 enc_027:{
    name:'西郊遭遇战',
    type:'random',
    pool:['npc319','npc343','npc336'], poolWeights:[3,1,1],
    min:3, max:4
  },

  enc_028:{
    name:'南郊遭遇战',
    type:'random',
    pool:['npc321','npc304','npc312'], poolWeights:[1,2,1],
    min:3, max:4
  },

  enc_029:{
    name:'城郊遭遇战兽1to2',
    type:'random',
    pool:['npc299','npc300','npc301','npc302'], poolWeights:[1,1,1,1],
    min:3, max:4
  },

  enc_030:{
    name:'城郊遭遇战兽3to5',
    type:'random',
    pool:['npc303','npc304','npc309','npc310','npc305','npc312','npc320','npc343','npc336'], poolWeights:[2,2,1,1,1,1,1,1,1],
    min:3, max:4
  },

  enc_031:{
    name:'城郊遭遇战兽4to6',
    type:'random',
    pool:['npc306','npc312','npc336','npc319'], poolWeights:[2,1,1,1],
    min:3, max:4
  },

  enc_032:{
    name:'坟地·坑洞',
    type:'special',
    enemies:[
      {name:'npc303', row:'front'},
      {name:'npc303', row:'front'},
      {name:'npc301', row:'back'},
      {name:'npc301', row:'back'}
    ]
  },

  enc_033:{
    name:'森林遭遇战3to4',
    type:'random',
    pool:['npc304','npc309','npc310','npc305','npc311'], poolWeights:[1,1,1,1,1],
    min:3, max:4
  },

  enc_034:{
    name:'森林遭遇战4to6',
    type:'random',
    pool:['npc311','npc312','npc343','npc336','npc319','npc321'], poolWeights:[1,1,1,1,1,1],
    min:3, max:4
  },

  enc_035:{
    name:'森林遭遇战6to10',
    type:'random',
    pool:['npc319','npc327','npc342','npc324','npc341','npc344'], poolWeights:[3,3,2,2,1,1],
    min:3, max:4
  },

  enc_036:{
    name:'水域遭遇战3to5',
    type:'random',
    pool:['npc316','npc323','npc322','npc328'], poolWeights:[2,1,1,1],
    min:3, max:4
  },

  enc_037:{
    name:'水域遭遇战5to7',
    type:'random',
    pool:['npc328','npc334','npc340','npc313','npc335','npc345'], poolWeights:[1,1,1,1,1,1],
    min:3, max:4
  },

  enc_038:{
    name:'水域遭遇战7to8',
    type:'random',
    pool:['npc335','npc345','npc318'], poolWeights:[2,2,1],
    min:3, max:4
  },

  enc_039:{
    name:'水域遭遇战8to10',
    type:'random',
    pool:['npc318','npc331','npc338','npc348'], poolWeights:[3,3,2,1],
    min:3, max:4
  },

  enc_040:{
    name:'沙漠遭遇战兽5to7',
    type:'random',
    pool:['npc346','npc330','npc307','npc347','npc332'], poolWeights:[1,1,1,1,1],
    min:3, max:4
  },

  enc_041:{
    name:'沙漠遭遇战兽7to9',
    type:'random',
    pool:['npc332','npc317','npc325'], poolWeights:[2,2,1],
    min:3, max:4
  },

  enc_042:{
    name:'沙漠遭遇战兽9to10',
    type:'random',
    pool:['npc325','npc337'], poolWeights:[2,2],
    min:3, max:4
  },

  enc_043:{
    name:'魔军15to19',
    type:'random',
    pool:['npc437'], poolWeights:[2],
    min:2, max:2
  },

  enc_044:{
    name:'魔军17to25',
    type:'random',
    pool:['npc437','npc440','npc441'], poolWeights:[1,1,1],
    min:3, max:3
  },

  enc_045:{
    name:'魔军24to27',
    type:'random',
    pool:['npc441','npc442','npc396'], poolWeights:[2,1,1],
    min:3, max:4
  },

  enc_046:{
    name:'魔军26to28',
    type:'random',
    pool:['npc442','npc443'], poolWeights:[2,2],
    min:3, max:4
  },

  enc_047:{
    name:'魔军28to34',
    type:'random',
    pool:['npc443','npc444','npc451'], poolWeights:[2,2,1],
    min:3, max:4
  },

  enc_048:{
    name:'魔军28to35',
    type:'random',
    pool:['npc443','npc447','npc448'], poolWeights:[2,3,1],
    min:3, max:4
  },

  enc_049:{
    name:'魔军35to39',
    type:'random',
    pool:['npc448','npc449'], poolWeights:[1,1],
    min:2, max:2
  },

  enc_050:{
    name:'魔军37to41',
    type:'random',
    pool:['npc450'], poolWeights:[1],
    min:1, max:1
  },

  enc_051:{
    name:'魔军9',
    type:'random',
    pool:['npc443','npc444','npc447','npc451'], poolWeights:[1,1,1,1],
    min:3, max:4
  },

  enc_052:{
    name:'魔军10',
    type:'random',
    pool:['npc448','npc449','npc450'], poolWeights:[1,1,1],
    min:3, max:3
  },

  enc_053:{
    name:'感染者遭遇战15to21',
    type:'random',
    pool:['npc462','npc419','npc421'], poolWeights:[3,2,1],
    min:3, max:4
  },

  enc_054:{
    name:'感染者遭遇战12to18',
    type:'random',
    pool:['npc463','npc418','npc416'], poolWeights:[1,1,2],
    min:3, max:4
  },

  enc_055:{
    name:'魔兽水23to25',
    type:'random',
    pool:['npc431','npc384'], poolWeights:[3,2],
    min:3, max:4
  },

  enc_056:{
    name:'魔兽水25to28',
    type:'random',
    pool:['npc384','npc447'], poolWeights:[2,2],
    min:3, max:4
  }
};


/* ============================================================
   ENEMY_AI_EXT —— 角色 AI 行为
   ------------------------------------------------------------
   behavior 取值：
     ambush     伏击：优先攻击后排（脆皮）
     aggressive 进攻：优先攻击血量最低的目标（收人头）
     guard      防守：优先攻击前排（最近目标）
     coward     怯懦：血量 < 30% 时 30% 概率逃跑
   未指定 behavior 的角色 → 走默认逻辑（前排随机）

   掉落数据不再写在这里：统一由 data-npc-drops.js 的
   NPC_DROP_RULES + NPC_DROP_TABLE 生成到角色卡掉落池。
   ============================================================ */

/* 地图/遭遇数据定义完后，再跑自动布局 */
computeMapLayout();
