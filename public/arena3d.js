// Bomba Sende 3D presentation only. All collision, timing and networking stay in game.js.
// THREE is installed locally and served by the existing Node web server.
import * as THREE from '/vendor/three.module.js';
import {createArenaDetailKit} from '/arena3d-detail.js';

const S = 25, WIDTH = 1000, HEIGHT = 562;
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const world = (x, y, h = 0) => new THREE.Vector3((x - WIDTH / 2) / S, h, (y - HEIGHT / 2) / S);
const color = hex => new THREE.Color(hex);
const mat = (hex, opts = {}) => new THREE.MeshStandardMaterial({color: hex, roughness: .48, metalness: .14, ...opts});
const basic = (hex, opts = {}) => new THREE.MeshBasicMaterial({color: hex, ...opts});

export function createArena3D(inputCanvas) {
  const shell = inputCanvas.parentElement;
  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:false, powerPreference:'high-performance'});
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.32;
  const lowPower = matchMedia('(pointer:coarse)').matches || (navigator.hardwareConcurrency || 8) <= 4;
  const pixelRatio=Math.min(window.devicePixelRatio||1,lowPower?1.15:1.55);
  renderer.setPixelRatio(pixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.className = 'arena-webgl';
  renderer.domElement.setAttribute('aria-hidden','true');
  shell.insertBefore(renderer.domElement, inputCanvas);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0b0d20');
  scene.fog = new THREE.FogExp2('#0b0d20', .011);
  const camera = new THREE.OrthographicCamera(-22,22,12.4,-12.4,.1,170);
  camera.position.set(0,33,25);
  camera.lookAt(0,0,0);
  const hemi = new THREE.HemisphereLight('#d8eaff', '#241337', 2.3);
  scene.add(hemi);
  const key = new THREE.DirectionalLight('#fff3df', 2.8);
  key.position.set(-18,30,11);
  key.castShadow = true;
  key.shadow.mapSize.set(lowPower ? 1024 : 2048, lowPower ? 1024 : 2048);
  key.shadow.camera.left = -27; key.shadow.camera.right = 27;
  key.shadow.camera.top = 19; key.shadow.camera.bottom = -19;
  key.shadow.camera.near = 1; key.shadow.camera.far = 80;
  key.shadow.bias = -.0003;
  key.shadow.normalBias = .018;
  scene.add(key);
  const rim = new THREE.DirectionalLight('#9e81ff', 1.8);
  rim.position.set(18,15,-12); scene.add(rim);
  const fill = new THREE.DirectionalLight('#73b8ff',.85);
  fill.position.set(10,8,17);scene.add(fill);

  const stage = new THREE.Group(); scene.add(stage);
  const effects = new THREE.Group(); scene.add(effects);
  let lastMap = null;
  let accent = '#a591ff';
  const arenaFloor = mat('#18172c',{roughness:.82,metalness:.08});
  const linesMat = basic('#a997ff',{transparent:true,opacity:.12,depthWrite:false});
  const wallBody = mat('#37314e',{metalness:.48,roughness:.32});
  const platformMaterial = mat('#24243c',{metalness:.43,roughness:.61});
  const geometries = {
    sphere:new THREE.SphereGeometry(1,16,12),
    sphereFine:new THREE.SphereGeometry(1,24,16),
    box:new THREE.BoxGeometry(1,1,1),
    cylinder:new THREE.CylinderGeometry(1,1,1,16),
    torus:new THREE.TorusGeometry(1,.04,8,64),
    torusWide:new THREE.TorusGeometry(1,.09,8,64),
    crystal:new THREE.OctahedronGeometry(1,0),
    capsule:new THREE.CapsuleGeometry(.45,.6,5,10)
  };
  function mesh(geo, material, parent, x=0, y=0, z=0, scale) {
    const m = new THREE.Mesh(geo,material);
    m.position.set(x,y,z);
    if (scale) m.scale.set(...scale);
    m.castShadow = !!(geo !== geometries.torus && geo !== geometries.torusWide);
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function block(parent,x,y,z,w,h,d,material) {
    return mesh(geometries.box,material,parent,x,y,z,[w,h,d]);
  }
  function track(parent,x,z,w,d,hex,height=.055,opacity=1) {
    const segment=block(parent,x,height,z,w,.055,d,basic(hex,{toneMapped:false,transparent:opacity<1,opacity,depthWrite:opacity===1}));
    segment.castShadow=false;segment.receiveShadow=false;return segment;
  }
  function ring(parent,hex,radius=1) {
    const m=mesh(geometries.torus,basic(hex,{transparent:true,opacity:.85,depthWrite:false,toneMapped:false}),parent);
    m.rotation.x=-Math.PI/2; m.scale.setScalar(radius); m.castShadow=false;
    return m;
  }
  function disposeGroup(group) {
    group.traverse(o => { if(o.isMesh && !Object.values(geometries).includes(o.geometry)) o.geometry?.dispose();
      if(o.isMesh) {const mm = Array.isArray(o.material)?o.material:[o.material]; for(const m of mm) if(m && ![arenaFloor,linesMat,wallBody,platformMaterial].includes(m)) m.dispose();}});
    group.clear();
  }
  const detailKit=createArenaDetailKit(THREE,{stage,world,block,mesh,track,ring,geometries,lowPower});
  let stageDetail=null;
  function resetMap(map) {
    disposeGroup(stage);
    accent=map.glow; lastMap=map.name;
    scene.background.set(map.floor).lerp(color('#050714'),.42);
    scene.fog.color.copy(scene.background);
    arenaFloor.color.set(map.floor);
    const deck=block(stage,0,-.46,0,42.4,.72,24.9,platformMaterial);
    deck.castShadow=false;
    block(stage,0,-.075,0,40.2,.12,22.6,arenaFloor).castShadow=false;
    // The render has depth, but every obstacle footprint is identical to the 2D collider.
    for(let x=-19.6;x<=19.7;x+=1.6)track(stage,x,0,.022,22.48,'#ffffff',-.008,.065);
    for(let z=-10.9;z<=11;z+=1.6)track(stage,0,z,40,.022,'#ffffff',-.008,.065);
    const edge=basic(map.glow,{toneMapped:false});
    for(const [x,z,w,d] of [[0,-11.25,40.4,.1],[0,11.25,40.4,.1],[-20.05,0,.1,22.55],[20.05,0,.1,22.55]])
      track(stage,x,z,w,d,map.glow,.13);
    // Visible 3D guard rails sit outside the actual playable collision boundary.
    for(const [x,z,w,d] of [[0,-11.47,40.9,.28],[0,11.47,40.9,.28],[-20.35,0,.3,23.1],[20.35,0,.3,23.1]]) {
      block(stage,x,.48,z,w,.68,d,wallBody);
      track(stage,x,z,w,d,map.glow,.84);
    }
    // Rounded pads and light columns are decoration outside the playable bounds.
    for(const x of [-20.35,20.35]) for(const z of [-11.47,11.47]) {
      block(stage,x,1.03,z,.72,1.1,.72,wallBody);
      mesh(geometries.sphere,basic(map.glow,{toneMapped:false}),stage,x,1.62,z,[.25,.25,.25]);
    }
    for (const b of map.blocks) {
      const cx=(b.x+b.w/2-500)/S, cz=(b.y+b.h/2-281)/S;
      const w=b.w/S,d=b.h/S;
      block(stage,cx,.66,cz,w,1.38,d,wallBody);
      block(stage,cx,1.38,cz,w*.87,.085,d*.87,mat('#8576ac',{metalness:.52,roughness:.31}));
      block(stage,cx,1.44,cz,w*.76,.07,d*.76,mat(map.floor,{metalness:.5,roughness:.3}));
      // Raised trims have the same footprint, no extra physical collision.
      track(stage,cx,cz-d*.45,w*.75,.055,map.glow,1.48);
    }
    for(const f of map.features) {
      const q=world(f.x,f.y,.065),radius=f.r/S;
      if(f.kind==='portal') {
        const pad=mesh(geometries.cylinder,mat('#302348',{metalness:.55,roughness:.29}),stage,q.x,.07,q.z,[radius,.07,radius]);
        pad.castShadow=false;
        const a=ring(stage,'#b69bff',radius);a.position.set(q.x,.15,q.z);
        const b=ring(stage,'#ff7dc6',radius*.73);b.position.set(q.x,.18,q.z);
        // Keep Three.js mesh references out of the game's JSON-serialized map.
      } else if(f.kind==='bumper') {
        mesh(geometries.cylinder,mat('#ba7d48',{metalness:.55}),stage,q.x,.22,q.z,[radius,.43,radius]);
        const rim=ring(stage,'#ffdd87',radius*1.06);rim.position.set(q.x,.48,q.z);
        mesh(geometries.sphere,basic('#ffe4a3',{toneMapped:false}),stage,q.x,.54,q.z,[.25,.25,.25]);
      } else if(f.kind==='ice') {
        const ice=mesh(geometries.cylinder,basic('#80dfff',{transparent:true,opacity:.16,depthWrite:false}),stage,q.x,.024,q.z,[radius,.013,radius]);
        ice.castShadow=false;
        const rr=ring(stage,'#80eeff',radius);rr.position.set(q.x,.075,q.z);rr.material.opacity=.65;
      }
    }
    // Subtle arena landmark at the centre, stays below the playing surface.
    const center=ring(stage,map.glow,6.9);center.position.y=.03;center.material.opacity=.16;
    stageDetail=detailKit.build(map);
  }

  function makeHuman(hex,name,id) {
    const root = new THREE.Group(); scene.add(root);
    const model=new THREE.Group();root.add(model);
    const suit=mat(id===0?'#d7ff58':'#ff81bc',{metalness:.18,roughness:.44});
    const suitDark=mat(id===0?'#4c6531':'#71294b',{metalness:.38,roughness:.48});
    const skin=mat(id===0?'#f4bf96':'#a97760',{roughness:.76,metalness:0});
    const hair=mat(id===0?'#242136':'#30253a',{roughness:.87,metalness:0});
    const bright=basic(hex,{toneMapped:false});
    // Humanoid: head, torso, both arms and legs - all narrower than the original collision diameter.
    mesh(geometries.capsule,suit,model,0,1.34,0,[.96,1.08,.66]);
    block(model,0,1.17,.35,.72,.23,.12,suitDark);
    mesh(geometries.sphere,skin,model,0,2.2,.03,[.35,.37,.35]);
    mesh(geometries.sphere,hair,model,0,2.45,-.05,[.37,.18,.36]);
    for(const side of [-1,1]) {
      mesh(geometries.sphere,hair,model,side*.15,2.23,.334,[.038,.043,.025]);
    }
    const arms=[],legs=[];
    for(const side of [-1,1]) {
      const arm=new THREE.Group(); arm.position.set(side*.53,1.73,0);model.add(arm);
      mesh(geometries.capsule,suitDark,arm,side*.13,-.3,0,[.4,.7,.42]);
      mesh(geometries.sphere,skin,arm,side*.24,-.68,.07,[.17,.17,.17]);
      arms.push(arm);
      const leg=new THREE.Group();leg.position.set(side*.24,.95,0);model.add(leg);
      mesh(geometries.capsule,suitDark,leg,0,-.37,0,[.55,.79,.54]);
      mesh(geometries.box,hair,leg,0,-.77,.14,[.4,.22,.66]);
      legs.push(leg);
    }
    const emblem=mesh(geometries.sphere,bright,model,0,1.42,.46,[.15,.15,.045]);
    emblem.castShadow=false;
    const shadow=mesh(new THREE.CircleGeometry(.95,24),basic('#000000',{transparent:true,opacity:.26,depthWrite:false}),root,0,.01,0);
    shadow.rotation.x=-Math.PI/2; shadow.castShadow=false;
    const a=ring(root,hex,1.12);a.position.y=.07;a.material.opacity=.34;
    const carry=ring(root,'#ffbd64',1.31);carry.position.y=.09;
    const defense=ring(root,'#72efff',1.55);defense.position.y=.17;
    const charge=ring(root,'#e3ff65',1.46);charge.position.y=.13;
    // High detail combat suit without changing the old 21px physical collision radius.
    const alloy=mat(id===0?'#293d3b':'#433048',{metalness:.68,roughness:.28});
    const trim=mat(id===0?'#c7ec52':'#ff87cc',{metalness:.48,roughness:.3,
      emissive:id===0?'#344011':'#462039',emissiveIntensity:.5});
    block(model,0,1.47,.44,.78,.47,.17,alloy);
    block(model,0,1.50,.54,.43,.09,.057,trim);
    for(const side of [-1,1]) {
      mesh(geometries.sphere,alloy,model,side*.58,1.75,0,[.30,.25,.31]);
      block(model,side*.28,.92,.36,.14,.20,.08,trim);
      block(model,side*.25,.50,.23,.32,.28,.48,alloy);
      mesh(geometries.sphere,trim,model,side*.53,1.06,.12,[.14,.15,.20]);
    }
    mesh(geometries.sphere,alloy,model,0,2.48,-.02,[.39,.23,.39]);
    const visor=mesh(geometries.sphere,mat('#78dbff',{metalness:.75,roughness:.12,
      emissive:id===0?'#266777':'#74418a',emissiveIntensity:.58}),model,0,2.24,.26,[.29,.12,.15]);
    visor.castShadow=false;
    block(model,0,1.05,-.36,.62,.43,.21,alloy);
    block(model,0,1.13,-.49,.34,.075,.08,trim);
    return {root,model,arms,legs,a,carry,defense,charge,prevX:null,prevZ:null};
  }
  const humans=[makeHuman('#d8ff52','SEN',0),makeHuman('#ff81c4','RAKİP',1)];
  function updateHuman(o,p,g,t,dt) {
    const target=world(p.x,p.y);
    if (o.prevX===null || Math.hypot(target.x-o.root.position.x,target.z-o.root.position.z)>5) o.root.position.copy(target);
    else o.root.position.lerp(target,clamp(dt*22,.1,1));
    o.prevX=target.x;o.prevZ=target.z;
    o.root.rotation.y=Math.atan2((p.face?.x||0),(p.face?.y||1));
    const moving=Math.hypot(p.vx||0,p.vy||0)>24;
    const run=moving?Math.min(1,Math.hypot(p.vx,p.vy)/260):0;
    const phase=t*12+(p.id*2);
    o.model.position.y=(moving?Math.abs(Math.sin(phase))*.10:.035*Math.sin(t*3+p.id));
    o.model.rotation.z=p.dashTime>0?-.28*Math.sin(phase):.025*Math.sin(t*2+p.id);
    for(let i=0;i<2;i++) {
      const side=i===0?-1:1;
      o.legs[i].rotation.x=Math.sin(phase+i*Math.PI)*.68*run;
      o.arms[i].rotation.x=-Math.sin(phase+i*Math.PI)*.62*run;
      o.arms[i].rotation.z=side*.13;
    }
    const holding=g.holder===p.id;
    o.carry.visible=holding;
    o.carry.material.opacity=.58+Math.sin(t*10)*.23;
    o.carry.scale.setScalar(1+.04*Math.sin(t*9));
    o.defense.visible=p.shieldTime>0||p.parryTime>0;
    o.defense.material.color.set(p.parryTime>0?'#78eeff':'#efffa7');
    o.defense.rotation.z=t*1.5;
    o.charge.visible=!!(p.charging&&holding&&g.bomb.mode==='held');
    if(o.charge.visible){o.charge.material.opacity=.25+clamp(p.charge/.85,0,1)*.7;o.charge.rotation.z=t*2;}
    o.a.material.opacity=p.dashTime>0?.95:.30;
    o.a.scale.setScalar(p.dashTime>0?1.4:1);
    o.model.children[0].material.emissive?.set(p.stun>0?'#285775':'#000000');
    // Character names remain exclusively in the existing scoreboard.
  }
  let bomb= new THREE.Group();scene.add(bomb);
  mesh(geometries.sphereFine,mat('#171b2b',{metalness:.76,roughness:.23}),bomb,0,0,0,[.57,.57,.57]);
  mesh(geometries.torusWide,basic('#ffb453',{toneMapped:false}),bomb,0,.1,0,[.57,.57,.57]);
  mesh(geometries.cylinder,mat('#e0d9ad'),bomb,.19,.60,0,[.12,.19,.12]);
  const spark=mesh(geometries.sphere,basic('#fff4a4',{toneMapped:false}),bomb,.19,.77,0,[.18,.18,.18]);
  const blastLight=new THREE.PointLight('#ffbb69',2.7,7,2);bomb.add(blastLight);
  const trail=Array.from({length:20},()=> {
    const v=mesh(geometries.sphere,basic('#ffbc5c',{transparent:true,opacity:.6,depthWrite:false,toneMapped:false}),effects,0,0,0,[.3,.3,.3]);
    v.visible=false;v.castShadow=false;return v;
  });
  const ripple=Array.from({length:36},()=>{const m=ring(effects,'#fff0ac');m.visible=false;return m;});
  const debris=Array.from({length:160},()=>{const m=mesh(geometries.box,basic('#ffffff',{transparent:true,opacity:1,depthWrite:false,toneMapped:false}),effects);m.visible=false;m.castShadow=false;return m;});
  const snow=Array.from({length:18},()=> {
    const o=mesh(geometries.cylinder,basic('#a7edff',{transparent:true,opacity:.16,depthWrite:false}),effects);
    o.visible=false;o.castShadow=false;return o;
  });
  const snowRings=Array.from({length:18},()=>{const o=ring(effects,'#b4f4ff');o.visible=false;return o;});
  const bonus=new THREE.Group();scene.add(bonus);
  const bonusCrystal=mesh(geometries.crystal,mat('#91e9ff',{emissive:'#176cc5',emissiveIntensity:.5}),bonus,0,1.3,0,[.51,.69,.51]);
  const bonusHalo=ring(bonus,'#b2eaff',.98);bonusHalo.position.y=.2;
  const guide = new THREE.ArrowHelper(new THREE.Vector3(1,0,0),new THREE.Vector3(),5,'#d8ff52',.6,.28);
  scene.add(guide); guide.visible=false;
  const raycaster=new THREE.Raycaster();
  const pointerPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
  let lastFrame=performance.now();
  let cachedW=0,cachedH=0;
  function resize(){
    const w=Math.max(1,inputCanvas.clientWidth),h=Math.max(1,inputCanvas.clientHeight);
    if(w===cachedW&&h===cachedH)return;
    cachedW=w;cachedH=h;
    renderer.setSize(w,h,false);
    // Fit the same logical arena regardless of actual screen shape.
    const aspect=w/h;
    const visibleW=Math.max(44,24.75*aspect);
    const visibleH=visibleW/aspect;
    camera.left=-visibleW/2;camera.right=visibleW/2;
    camera.top=visibleH/2;camera.bottom=-visibleH/2;
    camera.updateProjectionMatrix();
  }
  function pointer(e) {
    resize();
    const box=inputCanvas.getBoundingClientRect();
    const nx=((e.clientX-box.left)/box.width)*2-1;
    const ny=-((e.clientY-box.top)/box.height)*2+1;
    raycaster.setFromCamera(new THREE.Vector2(nx,ny),camera);
    const hit=new THREE.Vector3();
    if(raycaster.ray.intersectPlane(pointerPlane,hit))
      return {x:clamp(hit.x*S+WIDTH/2,0,WIDTH),y:clamp(hit.z*S+HEIGHT/2,0,HEIGHT)};
    return null;
  }
  function draw(g,t,particles,rings,shake=0) {
    resize();
    // Guest snapshots contain a fresh JSON map object every 33 ms: compare the map name.
    if(g.map.name!==lastMap)resetMap(g.map);
    stageDetail?.update(t);
    const now=performance.now(),dt=Math.min(.07,(now-lastFrame)/1000);lastFrame=now;
    // Camera shake only changes presentation, never the targeting plane or simulation.
    const cameraJitter=shake>0?.055*Math.min(6,shake):0;
    camera.position.set(Math.sin(t*41)*cameraJitter,33,25+Math.cos(t*35)*cameraJitter);
    camera.lookAt(0,0,0);
    for(let i=0;i<2;i++)updateHuman(humans[i],g.players[i],g,t,dt);
    const bp=world(g.bomb.x,g.bomb.y,1.0+(g.bomb.mode==='flying'?.38:0));
    bomb.position.copy(bp);bomb.rotation.y=t*2;
    bomb.scale.setScalar(g.bomb.mode==='held'?.82:1.05);
    spark.scale.setScalar(1+.18*Math.sin(t*23));
    blastLight.intensity=2+Math.sin(t*19)*.7;
    for(let i=0;i<trail.length;i++){
      const p=g.bomb.trail?.[i],o=trail[i];o.visible=!!p&&g.bomb.mode==='flying';
      if(o.visible){o.position.copy(world(p.x,p.y,.58));o.scale.setScalar(clamp(p.t/.32,.03,1)*.25);o.material.opacity=clamp(p.t/.32,0,.75);}
    }
    for(let i=0;i<ripple.length;i++){
      const r=rings[i],o=ripple[i];o.visible=!!r;
      if(o.visible){o.position.copy(world(r.x,r.y,.18));o.scale.setScalar(r.r/S);o.material.color.set(r.color);o.material.opacity=clamp(r.t/r.life,0,1);}
    }
    for(let i=0;i<debris.length;i++){
      const p=particles[i],o=debris[i];o.visible=!!p;
      if(o.visible){o.position.copy(world(p.x,p.y,.25+Math.abs(p.vy)*.001));const sc=clamp(p.size/S,.055,.24);o.scale.set(sc,sc,sc);o.rotation.set(t*4+i,t*3,t*2);o.material.color.set(p.col);o.material.opacity=clamp(p.t/p.max,0,1);}
    }
    for(let i=0;i<snow.length;i++){
      const p=g.snowPatches?.[i],o=snow[i],r=snowRings[i];o.visible=r.visible=!!p;
      if(o.visible){o.position.copy(world(p.x,p.y,.035));o.scale.set(p.r/S,.015,p.r/S);o.material.opacity=clamp(p.t/.8,0,.22);
        r.position.copy(world(p.x,p.y,.08));r.scale.setScalar(p.r/S*.85);r.material.opacity=clamp(p.t/.8,0,.8);}
    }
    bonus.visible=!!g.card;
    if(bonus.visible){bonus.position.copy(world(g.card.x,g.card.y));bonusCrystal.rotation.y=t*1.8;bonusCrystal.position.y=1.22+Math.sin(t*4)*.18;
      const hex={blink:'#ab92ff',frost:'#75e8ff',shield:'#e0f27e'}[g.card.type]||'#ffffff';bonusCrystal.material.color.set(hex);bonusHalo.material.color.set(hex);}
    guide.visible=false;
    if(g.phase==='active'&&g.bomb.mode==='held'){
      const p=g.players[g.holder];
      if(p.charging&&p.aim) {
        const aim=new THREE.Vector3(p.aim.x,0,p.aim.y).normalize(),len=(80+180*clamp(p.charge/.85,0,1))/S;
        guide.position.copy(world(p.x,p.y,.18));guide.setDirection(aim);guide.setLength(len,.55,.26);
        guide.setColor(p.charge>.8?'#ff83c9':'#d8ff52');guide.visible=true;
      }
    }
    renderer.render(scene,camera);
  }
  function dispose(){
    composer?.dispose();detailKit.dispose();renderer.dispose();renderer.domElement.remove();
    disposeGroup(stage);scene.clear();
  }
  return {draw,pointer,dispose};
}
