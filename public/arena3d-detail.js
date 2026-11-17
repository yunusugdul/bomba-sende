// Visual-only modular detailing. Everything lives on the existing 2D footprint.
// No new colliders, network fields, gameplay rules or spawn positions.
export function createArenaDetailKit(THREE, tools) {
  const {stage, world, block, mesh, track, ring, geometries, lowPower} = tools;
  const SRGB=THREE.SRGBColorSpace;
  const material=(c,more={})=>new THREE.MeshPhysicalMaterial({
    color:c,roughness:.46,metalness:.37,clearcoat:.32,clearcoatRoughness:.33,...more
  });
  const unlit=(c,more={})=>new THREE.MeshBasicMaterial({color:c,toneMapped:false,...more});
  let seed=7421;
  function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
  function makeRadial() {
    const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;
    const c=canvas.getContext('2d'),g=c.createRadialGradient(64,64,2,64,64,63);
    g.addColorStop(0,'rgba(0,0,0,0.65)');g.addColorStop(.35,'rgba(0,0,0,0.42)');
    g.addColorStop(1,'rgba(0,0,0,0)');
    c.fillStyle=g;c.fillRect(0,0,128,128);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=SRGB;return texture;
  }
  const ambientOcclusion=makeRadial();
  let activeFloorTexture=null;
  function shadowAt(x,z,w,d,alpha=.7) {
    const o=mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({
      map:ambientOcclusion,color:'#000000',transparent:true,opacity:alpha,
      depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,side:THREE.DoubleSide
    }),stage,x,.025,z);
    o.rotation.x=-Math.PI/2;o.castShadow=false;o.receiveShadow=false;
  }
  function floorTexture(map) {
    seed=map.name.split('').reduce((n,c)=>n+c.charCodeAt(0)*41,7421);
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=576;
    const c=canvas.getContext('2d'),w=1024,h=576;
    c.fillStyle=map.floor;c.fillRect(0,0,w,h);
    const tint=new THREE.Color(map.glow);
    const rgb='#'+tint.getHexString();
    c.strokeStyle='rgba(255,255,255,.070)';c.lineWidth=2;
    // Industrial modular floor. Milled seams and alternating brushed metal panels.
    for(let y=0;y<h;y+=48)for(let x=0;x<w;x+=64){
      const light=random();
      c.fillStyle=light>.5?'rgba(220,230,255,.021)':'rgba(0,0,0,.077)';
      c.fillRect(x+2,y+2,60,44);
      c.strokeStyle='rgba(170,180,218,.09)';c.lineWidth=1;
      c.strokeRect(x+2,y+2,60,44);
      c.strokeStyle='rgba(0,0,0,.27)';
      c.beginPath();c.moveTo(x+2,y+44);c.lineTo(x+61,y+44);c.stroke();
      c.fillStyle='rgba(235,240,255,.22)';
      for(const dx of [7,56])for(const dy of [7,39])c.fillRect(x+dx,y+dy,1.5,1.5);
      if(random()>.86){
        c.fillStyle='rgba(180,210,255,.065)';
        c.fillRect(x+12,y+16,40,2);c.fillRect(x+12,y+21,20,1);
      }
    }
    // Seam grain and fine surface wear, generated once per map (not per frame).
    for(let i=0;i<2200;i++){
      const x=random()*w,y=random()*h;
      c.strokeStyle=random()>.48?'rgba(236,240,255,.060)':'rgba(0,0,0,.09)';
      c.lineWidth=.6+random()*.5;
      c.beginPath();c.moveTo(x,y);c.lineTo(x+random()*14+2,y);c.stroke();
    }
    c.strokeStyle=rgb;c.globalAlpha=.24;c.lineWidth=3;
    c.beginPath();c.ellipse(w/2,h/2,176,176,0,0,Math.PI*2);c.stroke();
    c.globalAlpha=.12;c.lineWidth=2;
    for(let r=125;r<190;r+=32){c.beginPath();c.ellipse(w/2,h/2,r,r,0,0,Math.PI*2);c.stroke();}
    c.globalAlpha=1;
    c.textAlign='center';c.textBaseline='middle';c.font='900 16px Arial,sans-serif';
    c.fillStyle='rgba(220,232,255,.16)';
    c.fillText('BOMBA SENDE  /  ARENA',w/2,h/2+2);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=SRGB;
    texture.anisotropy=4;texture.wrapS=THREE.ClampToEdgeWrapping;texture.wrapT=THREE.ClampToEdgeWrapping;
    return texture;
  }
  function boltsAlong(x,z,width,depth,atHeight,parent=stage) {
    const dark=material('#0b1023',{metalness:.76,roughness:.24});
    const silver=material('#b7b7ce',{metalness:.78,roughness:.27});
    for(const sx of [-1,1])for(const sz of [-1,1]){
      const px=x+sx*(width/2-.13),pz=z+sz*(depth/2-.13);
      mesh(geometries.cylinder,dark,parent,px,atHeight,pz,[.13,.055,.13]);
      mesh(geometries.cylinder,silver,parent,px,atHeight+.045,pz,[.062,.01,.062]);
    }
  }
  function hazardTrim(parent,x,z,w,d,top,col){
    // Thin inset decorative bars, contained entirely within obstacle footprint.
    const edge=material('#080d1c',{metalness:.70,roughness:.28});
    const bright=unlit(col);
    for(const sign of [-1,1]){
      block(parent,x+sign*(w/2-.105),top,z,.15,.09,d*.91,edge);
      block(parent,x+sign*(w/2-.105),top+.055,z,.045,.025,d*.77,bright);
      block(parent,x,top,z+sign*(d/2-.105),w*.9,.09,.15,edge);
      block(parent,x,top+.055,z+sign*(d/2-.105),w*.75,.026,.045,bright);
    }
  }
  function makeVent(x,z,w=.7,d=.5,angle=0){
    const group=new THREE.Group();stage.add(group);group.position.set(x,.011,z);group.rotation.y=angle;
    const grate=block(group,0,0,0,w,.035,d,material('#101424',{metalness:.75,roughness:.38}));
    grate.castShadow=false;
    for(let i=-2;i<=2;i++)block(group,0,.026,i*d/6,w*.82,.015,.027,material('#737791',{metalness:.73,roughness:.33})).castShadow=false;
  }
  function makeFloorDecal(x,z,w,d,hex,alpha=.34){
    const m=mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({
      color:hex,transparent:true,opacity:alpha,depthWrite:false,side:THREE.DoubleSide
    }),stage,x,.014,z);
    m.rotation.x=-Math.PI/2;m.castShadow=false;return m;
  }
  function build(map) {
    const visuals=[];
    activeFloorTexture?.dispose();
    const floorMap=floorTexture(map);
    activeFloorTexture=floorMap;
    const top=material('#ffffff',{map:floorMap,color:'#ffffff',metalness:.27,roughness:.75});
    const floor=mesh(new THREE.PlaneGeometry(39.9,22.3),top,stage,0,-.003,0);
    floor.rotation.x=-Math.PI/2;floor.castShadow=false;floor.receiveShadow=true;
    // Copper/brass inner boundary, glowing glass fibres and inset hazard markings.
    const border=material('#9f9290',{metalness:.77,roughness:.28});
    for(const [x,z,w,d] of [[0,-11.1,39.8,.10],[0,11.1,39.8,.10],[-19.91,0,.10,22.1],[19.91,0,.10,22.1]]){
      block(stage,x,.07,z,w,.07,d,border).castShadow=false;
    }
    for(let i=-18;i<=18;i+=2.4) {
      for(const z of [-10.84,10.84]){
        makeFloorDecal(i,z,1.0,.13,map.glow,.26);
        makeVent(i+1,z,1,.33);
      }
    }
    // Outside play bounds: raised side plates, service columns and neon accents.
    for(const s of [-1,1]) {
      block(stage,0,-.02,s*11.85,42.4,.20,.45,material('#1a2035',{metalness:.69,roughness:.33}));
      track(stage,0,s*11.88,40.3,.055,map.glow,.21,.94);
      block(stage,s*20.78,.25,0,.36,.59,24,material('#171b2f',{metalness:.7,roughness:.37}));
      track(stage,s*20.82,0,.065,23,map.glow,.61,.85);
      for(let z=-9;z<=9;z+=3){
        block(stage,s*20.70,.85,z,.17,1.03,.54,material('#3e4966',{metalness:.71,roughness:.31}));
        mesh(geometries.sphere,unlit(map.glow),stage,s*20.72,1.36,z,[.105,.1,.105]).castShadow=false;
      }
    }
    // Decorative under-surface drainage, kept away from collidable areas.
    for(let z=-7;z<=7;z+=4.5){
      makeVent(-18.65,z,1.15,.40,Math.PI/2);
      makeVent(18.65,z,1.15,.40,Math.PI/2);
    }
    for(const b of map.blocks){
      const x=(b.x+b.w/2-500)/25,z=(b.y+b.h/2-281)/25,w=b.w/25,d=b.h/25;
      shadowAt(x,z,w+2,d+2);
      const detail=new THREE.Group();stage.add(detail);
      // Body stays inside existing collider rectangle. Side louvres/metal corner trims.
      for(const sign of [-1,1]){
        block(detail,x+sign*(w*.5-.11),.75,z,.12,1.05,d*.76,material('#17182a',{metalness:.82,roughness:.25}));
        block(detail,x,.82,z+sign*(d*.5-.11),w*.79,.95,.12,material('#242a40',{metalness:.63,roughness:.34}));
        for(let k=-2;k<=2;k++){
          const zz=z+k*d/7;
          block(detail,x+sign*(w*.5-.073),.75,zz,.05,.09,d/17,material('#a8acc8',{metalness:.75,roughness:.27}));
        }
      }
      // Machined top, brushed centre insert and angular neon channels.
      block(detail,x,1.49,z,w*.90,.067,d*.88,material('#4d5570',{metalness:.72,roughness:.28,clearcoat:.6}));
      block(detail,x,1.535,z,w*.73,.021,d*.68,material('#141827',{metalness:.55,roughness:.35}));
      hazardTrim(detail,x,z,w,d,1.58,map.glow);
      boltsAlong(x,z,w*.8,d*.8,1.61,detail);
      const warning=makeFloorDecal(x,z,w+1.3,d+1.3,map.glow,.07);
      warning.position.y=.016; // ground-only halo, not collision
    }
    // Decorative corner columns live outside the effective 2D boundary.
    for(const xx of [-20.55,20.55])for(const zz of [-11.6,11.6]){
      const foundation=block(stage,xx,-.04,zz,.85,.2,.85,material('#111525',{metalness:.71}));
      foundation.castShadow=false;
      block(stage,xx,.64,zz,.37,1.15,.37,material('#555470',{metalness:.78,roughness:.2}));
      block(stage,xx,1.24,zz,.72,.15,.72,material('#141b31',{metalness:.62,roughness:.23}));
      mesh(geometries.sphere,unlit(map.glow),stage,xx,1.44,zz,[.18,.18,.18]).castShadow=false;
      if(!lowPower) {
        const light=new THREE.PointLight(map.glow,1.1,6.5,2);
        light.position.set(xx,1.8,zz);stage.add(light);
      }
    }
    // Map feature-specific eye candy; never change original feature geometry.
    for(const f of map.features){
      const pt=world(f.x,f.y,.015),rad=f.r/25;
      if(f.kind==='portal'){
        const g=new THREE.Group();stage.add(g);g.position.set(pt.x,0,pt.z);
        shadowAt(pt.x,pt.z,rad*2.1,rad*2.1,.5);
        const outer=ring(g,'#a68aff',rad*.92);outer.position.y=.15;
        const inner=ring(g,'#ff84db',rad*.62);inner.position.y=.18;
        for(let j=0;j<7;j++){
          const angle=j*Math.PI*2/7;
          const jewel=mesh(geometries.crystal,material('#b0aaff',{metalness:.49,roughness:.22,
            emissive:'#735bc2',emissiveIntensity:1}),g,
            Math.cos(angle)*rad*.8,.25,Math.sin(angle)*rad*.8,[.12,.22,.12]);
          jewel.castShadow=false;
        }
        visuals.push(t=>{inner.rotation.z=-t*.7;outer.rotation.z=t*.42;g.children.forEach((o,j)=>{if(j>1)o.rotation.y=t*.4+j;});});
      }else if(f.kind==='bumper'){
        const g=new THREE.Group();stage.add(g);g.position.set(pt.x,0,pt.z);
        for(let n=0;n<8;n++){
          const a=n*Math.PI/4;
          const x=Math.cos(a)*rad*.73,z=Math.sin(a)*rad*.73;
          block(g,x,.52,z,.13,.052,.29,material('#d4a75a',{metalness:.70,roughness:.2})).rotation.y=a;
        }
        const holo=ring(g,'#ffde83',rad*.78);holo.position.y=.58;
        visuals.push(t=>{holo.material.opacity=.42+.22*Math.sin(t*4);});
      }else if(f.kind==='ice'){
        const g=new THREE.Group();stage.add(g);g.position.copy(pt);
        for(let i=0;i<16;i++){
          const a=i*Math.PI*2/16,r=rad*(.55+random()*.34);
          const piece=mesh(geometries.crystal,material('#96edff',{
            transparent:true,opacity:.48,metalness:.07,roughness:.13,transmission:.10}),g,
            Math.cos(a)*r,.09,Math.sin(a)*r,[.13,.12,.30]);
          piece.castShadow=false;piece.rotation.y=a;
        }
      }
    }
    return {update(t){for(const fn of visuals)fn(t);}};
  }
  return {build,dispose(){activeFloorTexture?.dispose();ambientOcclusion.dispose();}};
}
