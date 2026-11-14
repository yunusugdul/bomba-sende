'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {once}=require('node:events');
const {server,rooms}=require('../server.js');
let url;
const sleep=t=>new Promise(r=>setTimeout(r,t));
const sockets=[];
function openClient(){return new Promise((resolve,reject)=>{const ws=new WebSocket(url);ws.addEventListener('open',()=>{sockets.push(ws);resolve(ws)},{once:true});ws.addEventListener('error',reject,{once:true});});}
function waitMessage(ws,predicate=()=>true,timeout=3000){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{ws.removeEventListener('message',handler);reject(new Error('No matching message'))},timeout);function handler(e){let d;try{d=JSON.parse(e.data);}catch{return;}if(predicate(d)){clearTimeout(timer);ws.removeEventListener('message',handler);resolve(d)}}ws.addEventListener('message',handler);});}
function send(ws,d){ws.send(JSON.stringify(d));}
test.before(async()=>{await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));url='ws://127.0.0.1:'+server.address().port+'/ws';});
test.after(async()=>{for(const ws of sockets)try{ws.close()}catch{};await sleep(100);await new Promise(resolve=>server.close(resolve));});
test('create > join > start > state/input/actions > reconnect > leave', async()=>{
 const host=await openClient();const made=waitMessage(host,d=>d.type==='joined');send(host,{type:'create',name:'KURUCU'});const created=await made;
 assert.equal(created.slot,0);assert.match(created.code,/^[A-Z2-9]{6}$/);
 const guest=await openClient();const joined=waitMessage(guest,d=>d.type==='joined');send(guest,{type:'join',code:created.code,name:'MİSAFİR'});const j=await joined;assert.equal(j.slot,1);
 const startHost=waitMessage(host,d=>d.type==='start'),startGuest=waitMessage(guest,d=>d.type==='start');send(host,{type:'start'});await Promise.all([startHost,startGuest]);
 const snap=waitMessage(guest,d=>d.type==='state');send(host,{type:'state',state:{players:[{name:'a'},{name:'b'}],score:[0,0],round:1}});assert.equal((await snap).state.round,1);
 const incoming=waitMessage(host,d=>d.type==='input');send(guest,{type:'input',x:999,y:-999,aimX:3,aimY:4,aimActive:true});const r=await incoming;assert.equal(r.x,1);assert.equal(r.y,-1);
 const act=waitMessage(host,d=>d.type==='act');send(guest,{type:'act',action:'dash'});assert.equal((await act).action,'dash');
 const dup=await openClient();const rejoin=waitMessage(dup,d=>d.type==='joined');send(dup,{type:'join',code:created.code,token:j.token});assert.equal((await rejoin).reconnected,true);
 const gone=waitMessage(dup,d=>d.type==='closed');send(host,{type:'leave'});assert.match((await gone).message,/ayrıldı/);
 assert.equal(rooms.has(created.code),false);
});
test('room code cannot be reused to hijack slot', async()=>{
 const a=await openClient();const made=waitMessage(a,d=>d.type==='joined');send(a,{type:'create',name:'A'});const c=await made;
 const b=await openClient();const j=waitMessage(b,d=>d.type==='joined');send(b,{type:'join',code:c.code,name:'B'});await j;
 const attacker=await openClient();const rej=waitMessage(attacker,d=>d.type==='error');send(attacker,{type:'join',code:c.code,name:'B'});assert.match((await rej).message,/dolu/);
 send(a,{type:'leave'});
});