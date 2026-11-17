'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const game=fs.readFileSync(path.join(root,'public/game.js'),'utf8');
const html=fs.readFileSync(path.join(root,'public/index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'public/style.css'),'utf8');
const three=fs.readFileSync(path.join(root,'public/arena3d.js'),'utf8');
const maps=Function('return '+game.match(/const MAPS=(\[[\s\S]*?\]);/)[1])();
const original=[
 [[350,95,70,128],[581,337,70,128],[450,233,100,96]],
 [[318,153,64,246],[616,153,64,246],[451,75,98,68],[451,422,98,65]],
 [[383,112,65,145],[552,306,65,145],[451,242,98,78]],
 [[260,200,110,65],[630,300,110,65],[465,60,70,95],[465,407,70,95]],
 [[325,92,75,121],[600,350,75,121],[468,213,64,137]]
];
test('five classic maps use original 2D block layout and simple rendering',()=>{
 for(let i=0;i<5;i++){
  assert.deepEqual(maps[i].blocks.map(x=>[x.x,x.y,x.w,x.h]),original[i]);
 }
 assert.match(three,/function buildClassicMap\(map\)/);
 assert.match(three,/if\(simple\)\{stageDetail=buildClassicMap\(map\);return;\}/);
 assert.match(three,/resetMap\(g\.map,!!g\.shooter\)/);
 assert.match(three,/new THREE\.CanvasTexture\(canvas\)/);
});
test('room settings expose and preserve original arena and 3, 5 or 7 rounds',()=>{
 assert.match(html,/id="rulesArena"/);
 assert.match(html,/id="rulesRounds"/);
 assert.match(html,/3 TUR/);assert.match(html,/5 TUR/);assert.match(html,/7 TUR/);
 assert.doesNotMatch(css,/body\.shooter-mode \.rules-columns > label:nth-child\(2\)/);
 assert.match(game,/g\.rules\.rounds/);
 assert.match(game,/g\.round>=g\.rules\.rounds/);
});
test('cycling and fixed arena selection advance once per elimination, without resetting match score',()=>{
 const source=game.slice(game.indexOf('function startShooterRound(){'),game.indexOf('function shooterBotInput('));
 const g={rules:{arena:'cycle',rounds:5},players:[{},{}],score:[0,0],stats:{}};
 const vars=Function('game','MAPS','rand','SHOOTER_HP','SHOOTER_CLIP','
 vars.startShooterRound();
 assert.equal(g.round,1);assert.equal(g.map.name,'NEON PARK');
 assert.equal(g.players[0].hp,100);assert.equal(g.players[1].ammo,16);
 g.score[0]=1;vars.beginShooterRound();
 assert.equal(g.round,2);assert.equal(g.map.name,'BUZ LABİRENTİ');
 assert.equal(g.score[0],1,'round victories persist');
 g.rules.arena='4';vars.beginShooterRound();
 assert.equal(g.round,3);assert.equal(g.map.name,'SON ŞANS');
 assert.equal(g.score[0],1);
});
test('real gunshot is packaged locally with proper WAV headers and correct MIME route',async()=>{
 const file=fs.readFileSync(path.join(root,'public/audio/pistol-fire.wav'));
 assert.equal(file.toString('ascii',0,4),'RIFF');
 assert.equal(file.toString('ascii',8,12),'WAVE');
 assert.ok(file.length>12000&&file.length<100000);
 const srv=fs.readFileSync(path.join(root,'server.js'),'utf8');
 assert.match(srv,/'\.wav':'audio\/wav'/);
 assert.match(srv,/'\/audio\/pistol-fire\.wav'/);
 assert.match(game,/audio\.decodeAudioData\(bytes\.slice\(0\)\)/);
 assert.match(game,/if\(gunshotBuffer\)/);
});
test('player armor colors are more saturated but weapons and hitpoints are preserved',()=>{
 assert.match(three,/#c9ff1f/);
 assert.match(three,/#ff43ac/);
 assert.match(three,/const hpRoot=new THREE\.Group\(\)/);
 assert.match(three,/const gun=new THREE\.Group\(\)/);
 assert.match(three,/const shooterShots=Array\.from/);
});
,'hideOverlay','options','playerWeapon',
  source+'\nreturn {startShooterRound,beginShooterRound};')(
  g,maps,(lo,hi)=>lo,100,16,()=>({textContent:''}),()=>{}, {mode:'bot',weapon:'pistol'},()=>({clip:16}));
 vars.startShooterRound();
 assert.equal(g.round,1);assert.equal(g.map.name,'NEON PARK');
 assert.equal(g.players[0].hp,100);assert.equal(g.players[1].ammo,16);
 g.score[0]=1;vars.beginShooterRound();
 assert.equal(g.round,2);assert.equal(g.map.name,'BUZ LABİRENTİ');
 assert.equal(g.score[0],1,'round victories persist');
 g.rules.arena='4';vars.beginShooterRound();
 assert.equal(g.round,3);assert.equal(g.map.name,'SON ŞANS');
 assert.equal(g.score[0],1);
});
test('real gunshot is packaged locally with proper WAV headers and correct MIME route',async()=>{
 const file=fs.readFileSync(path.join(root,'public/audio/pistol-fire.wav'));
 assert.equal(file.toString('ascii',0,4),'RIFF');
 assert.equal(file.toString('ascii',8,12),'WAVE');
 assert.ok(file.length>12000&&file.length<100000);
 const srv=fs.readFileSync(path.join(root,'server.js'),'utf8');
 assert.match(srv,/'\.wav':'audio\/wav'/);
 assert.match(srv,/'\/audio\/pistol-fire\.wav'/);
 assert.match(game,/audio\.decodeAudioData\(bytes\.slice\(0\)\)/);
 assert.match(game,/if\(gunshotBuffer\)/);
});
test('player armor colors are more saturated but weapons and hitpoints are preserved',()=>{
 assert.match(three,/#c9ff1f/);
 assert.match(three,/#ff43ac/);
 assert.match(three,/const hpRoot=new THREE\.Group\(\)/);
 assert.match(three,/const gun=new THREE\.Group\(\)/);
 assert.match(three,/const shooterShots=Array\.from/);
});
