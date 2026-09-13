/* Real drawing APIs plus a small CPU projection renderer, labelled as such. */
(() => {
  'use strict';
  const G = GRAPHICS, TAU = Math.PI * 2;
  const bg = ctx => { ctx.clearRect(0, 0, 600, 360); ctx.fillStyle = '#102d29'; ctx.fillRect(0, 0, 600, 360); };
  const text = (ctx, value, x, y, color = '#c6e4ce') => { ctx.fillStyle = color; ctx.font = '14px sans-serif'; ctx.fillText(value, x, y); };
  const line = (ctx, points, color = '#7fd7b5', fill) => {
    ctx.beginPath(); points.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
    if (fill) { ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); }
    ctx.strokeStyle = color; ctx.stroke();
  };
  function basic(root, term) {
    const kind = term.id.slice(3), lab = G.create(root, term, kind === 'svg' ? '真实 SVG · 矢量元素' : '真实 Canvas 2D · JavaScript 绘图');
    let value = kind === 'coordinates' ? 300 : 80, grid = true, frames = 0;
    if (kind === 'svg') {
      const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('viewBox', '0 0 600 360'); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', '可缩放的 SVG 图形，调整半径可观察矢量轮廓');
      svg.classList.add('gfx-canvas'); svg.innerHTML = '<rect width="600" height="360" fill="#102d29"/><path d="M50 280 Q180 30 300 180 T550 80" stroke="#efc78b" stroke-width="4" fill="none"/><circle cx="300" cy="180" r="80" fill="#7fd7b533" stroke="#7fd7b5" stroke-width="3"/><text x="300" y="187" fill="#e8eed1" text-anchor="middle" font-size="20">SVG</text>';
      lab.stage.append(svg);
      lab.range('圆形半径', 20, 130, 80, v => { value = v; });
      lab.toggle('显示路径控制线', false, checked => { grid = checked; }); grid = false;
      const guides = document.createElementNS(ns, 'path'); guides.setAttribute('d', 'M50 280 L180 30 L300 180 L420 330 L550 80'); guides.setAttribute('fill', 'none'); guides.setAttribute('stroke', '#fff6'); guides.setAttribute('stroke-dasharray', '5 5'); svg.append(guides);
      lab.frame(() => { svg.querySelector('circle').setAttribute('r', value); guides.style.display = grid ? '' : 'none'; lab.status(`半径 ${value}，SVG 圆与路径是可独立操作的文档元素；虚线仅展示控制结构。`); });
      return lab.dispose;
    }
    const canvas = lab.canvas(), ctx = G.context(canvas);
    if (!ctx) { lab.status('无法建立 Canvas 2D 上下文，请阅读下方定义。'); return lab.dispose; }
    lab.range(kind === 'coordinates' ? '点的 X 坐标' : kind === 'render-loop' ? '运动速度' : '圆形半径', kind === 'coordinates' ? 0 : 10, kind === 'coordinates' ? 550 : 140, value, v => { value = v; });
    lab.toggle('显示辅助网格', true, v => { grid = v; });
    lab.frame((time, dt) => {
      bg(ctx); if (grid) for (let x = 0; x <= 600; x += 50) line(ctx, [[x, 0], [x, 360]], '#cde8d21a');
      if (grid) for (let y = 0; y <= 360; y += 50) line(ctx, [[0, y], [600, y]], '#cde8d21a');
      if (kind === 'coordinates') {
        line(ctx, [[25, 25], [570, 25]], '#efc78b'); line(ctx, [[25, 25], [25, 330]], '#efc78b');
        ctx.fillStyle = '#7fd7b5'; ctx.beginPath(); ctx.arc(value + 25, 190, 9, 0, TAU); ctx.fill();
        line(ctx, [[value + 25, 25], [value + 25, 190], [25, 190]], '#fff6'); text(ctx, 'X →', 525, 52); text(ctx, 'Y ↓', 35, 320);
        text(ctx, `(${value}, 165)`, Math.min(value + 38, 475), 180);
        lab.status(`原点位于图中 (25,25)；局部点为 (${value},165)。二维画布默认向右为 X 正向，向下为 Y 正向。`);
      } else {
        const x = kind === 'render-loop' ? 80 + (time * value) % 440 : 300;
        ctx.beginPath(); ctx.arc(x, 180, kind === 'canvas' ? value : 28, 0, TAU); ctx.fillStyle = '#7fd7b5'; ctx.fill();
        ctx.strokeStyle = '#efc78b'; ctx.lineWidth = 3; ctx.stroke(); ctx.lineWidth = 1;
        if (dt) frames++;
        text(ctx, kind === 'canvas' ? 'clear → path → fill → stroke' : `累计更新 ${frames} 次 · t = ${time.toFixed(2)} s`, 30, 325);
        lab.status(kind === 'canvas' ? `半径 ${value}，每次调整清空并重绘像素；圆不是独立 DOM 节点。` : '播放后由 requestAnimationFrame 驱动，位置按时间计算。前进一步使用固定 1/30 秒教学步长，不表示屏幕固定为 30 FPS。');
      }
    }, kind === 'render-loop');
    return lab.dispose;
  }
  ['canvas', 'svg', 'coordinates', 'render-loop'].forEach(id => DEMOS['gx-' + id] = basic);

  function gpu(root, term) {
    const kind = term.id.slice(3), isGPU = kind === 'webgpu';
    const lab = G.create(root, term, isGPU ? '原生 WebGPU · WGSL · 能力检测中' : '原生 WebGL · GLSL 着色器');
    const canvas = lab.canvas(); let amount = .5, failed = false, releaseGPU = () => {};
    lab.range(isGPU ? '三角形旋转' : '颜色频率', isGPU ? 0 : 1, isGPU ? 360 : 12, isGPU ? 30 : 5, v => { amount = isGPU ? v * Math.PI / 180 : v; });
    amount = isGPU ? Math.PI / 6 : 5;
    const unavailable = message => {
      failed = true; releaseGPU(); lab.pause(); root.querySelector('.gfx-badge').textContent = isGPU ? 'WebGPU · 当前环境不可用' : 'WebGL · 当前环境不可用'; lab.stage.querySelector('.gfx-unavailable')?.remove(); lab.status(message); lab.stage.append(G.node('div', 'gfx-unavailable', message));
      lab.controls.querySelectorAll('input,button,select').forEach(n => n.disabled = true);
    };
    if (isGPU) {
      let device, buffer, context;
      releaseGPU = () => {
        const oldContext = context, oldBuffer = buffer, oldDevice = device;
        context = buffer = device = null;
        try { oldContext?.unconfigure(); } catch { /* A lost context may already be unconfigured. */ }
        oldBuffer?.destroy(); oldDevice?.destroy();
      };
      lab.onDispose(releaseGPU);
      (async () => {
        try {
          if (!navigator.gpu || !isSecureContext) { unavailable('此环境未提供 WebGPU（通常需要 HTTPS、支持的浏览器与适配器）。这里没有用 Canvas 动画替代 GPU 结果。'); return; }
          const adapter = await navigator.gpu.requestAdapter();
          if (!lab.alive()) return;
          if (!adapter) { unavailable('没有可用 WebGPU 适配器；可以继续学习 WebGL 与下方概念。'); return; }
          device = await adapter.requestDevice();
          if (!lab.alive()) { releaseGPU(); return; }
          device.lost.then(() => { if (lab.alive() && !failed) unavailable('GPU 设备已丢失。请重置实验重新创建设备。'); });
          device.addEventListener('uncapturederror', () => { if (lab.alive() && !failed) unavailable('GPU 运行出错。请重置实验或切换到其他绘图基础词条。'); });
          context = canvas.getContext('webgpu'); if (!context) throw Error('context');
          const format = navigator.gpu.getPreferredCanvasFormat();
          context.configure({ device, format, alphaMode: 'opaque' });
          const module = device.createShaderModule({ code: `struct Params { angle: f32 }; @group(0) @binding(0) var<uniform> params: Params;
            @vertex fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
              var p = array<vec2f,3>(vec2f(0.,.75),vec2f(-.7,-.6),vec2f(.7,-.6));
              let a=params.angle; let v=p[i]; return vec4f((v.x*cos(a)-v.y*sin(a))*.6,v.x*sin(a)+v.y*cos(a),0.,1.);
            }
            @fragment fn fs(@builtin(position) p: vec4f) -> @location(0) vec4f { return vec4f(.45,.8,.62,1.); }` });
          const pipeline = device.createRenderPipeline({ layout: 'auto', vertex: { module, entryPoint: 'vs' }, fragment: { module, entryPoint: 'fs', targets: [{ format }] }, primitive: { topology: 'triangle-list' } });
          buffer = device.createBuffer({ size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
          const bind = device.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer } }] });
          root.querySelector('.gfx-badge').textContent = '原生 WebGPU · WGSL · 适配器已连接';
          lab.frame(() => {
            device.queue.writeBuffer(buffer, 0, new Float32Array([amount, 0, 0, 0]));
            const encoder = device.createCommandEncoder();
            const pass = encoder.beginRenderPass({ colorAttachments: [{ view: context.getCurrentTexture().createView(), clearValue: { r: .06, g: .17, b: .16, a: 1 }, loadOp: 'clear', storeOp: 'store' }] });
            pass.setPipeline(pipeline); pass.setBindGroup(0, bind); pass.draw(3); pass.end(); device.queue.submit([encoder.finish()]);
            lab.status(`实际 WebGPU 管线已提交三角形，旋转 ${Math.round(amount * 180 / Math.PI)}°。顶点位置由 WGSL 计算，非 CSS 旋转。`);
          });
        } catch { if (lab.alive()) unavailable('WebGPU 初始化失败，可能受驱动或浏览器设置限制；未绘制替代图像。'); }
      })();
    } else {
      const gl = canvas.getContext('webgl', { alpha: false, antialias: true });
      if (!gl) { unavailable('此环境无法建立 WebGL 上下文。请在支持 WebGL 的浏览器中重试；概念和代码仍可阅读。'); return lab.dispose; }
      const shaders = []; let program, buffer;
      const compile = (type, source) => { const shader = gl.createShader(type); shaders.push(shader); gl.shaderSource(shader, source); gl.compileShader(shader); if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw Error('shader'); return shader; };
      lab.onDispose(() => { if (buffer) gl.deleteBuffer(buffer); if (program) gl.deleteProgram(program); shaders.forEach(s => gl.deleteShader(s)); gl.getExtension('WEBGL_lose_context')?.loseContext(); });
      const lost = e => { e.preventDefault(); if (lab.alive()) unavailable('WebGL 上下文已丢失。请重置实验。'); }; canvas.addEventListener('webglcontextlost', lost); lab.onDispose(() => canvas.removeEventListener('webglcontextlost', lost));
      try {
        program = gl.createProgram();
        gl.attachShader(program, compile(gl.VERTEX_SHADER, 'attribute vec2 p; varying vec2 uv; void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}'));
        gl.attachShader(program, compile(gl.FRAGMENT_SHADER, 'precision mediump float; varying vec2 uv; uniform float frequency; uniform float time; void main(){float v=.5+.5*sin(uv.x*frequency*6.283+sin(uv.y*8.+time));gl_FragColor=vec4(mix(vec3(.07,.18,.16),vec3(.65,.88,.59),v),1.);}'));
        gl.linkProgram(program); if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error('link');
        gl.useProgram(program); buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
        const p = gl.getAttribLocation(program, 'p'); gl.enableVertexAttribArray(p); gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0);
        const frequency = gl.getUniformLocation(program, 'frequency'), timeUniform = gl.getUniformLocation(program, 'time');
        lab.frame(time => { gl.viewport(0, 0, canvas.width, canvas.height); gl.uniform1f(frequency, amount); gl.uniform1f(timeUniform, time); gl.drawArrays(gl.TRIANGLES, 0, 3); lab.status(`GLSL 片元着色器为每个片元计算色带。频率 ${amount}；${kind === 'shader' ? '拖动参数观察颜色公式变化。' : '顶点→光栅化→片元着色→画布，此图由 WebGL 绘制。'}`); }, true);
      } catch { unavailable('WebGL 着色器编译或链接失败，请重置实验。'); }
    }
    return lab.dispose;
  }
  ['webgl', 'webgpu', 'shader'].forEach(id => DEMOS['gx-' + id] = gpu);

  const cube = (x, y, z, sx, sy, sz, color) => ({ color, vertices: [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(p => [x+p[0]*sx,y+p[1]*sy,z+p[2]*sz]), faces: [[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[0,1,5,4],[3,7,6,2]] });
  const norm = v => { const d = Math.hypot(...v) || 1; return v.map(x => x/d); };
  const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  function three(root, term) {
    const kind = term.id.slice(3), lab = G.create(root, term, 'Canvas 2D · CPU 三维投影教学（非模型文件加载器）');
    const canvas = lab.canvas(), ctx = G.context(canvas);
    if (!ctx) { lab.status('Canvas 2D 不可用。'); return lab.dispose; }
    let angle = 30, distance = 5, light = 40, wire = false, orthographic = false, texture = false, color = '#83bba0', selected = 0, filter = '原图';
    const meshLesson = kind === 'mesh';
    const objects = ['model', 'product-viewer', 'scene', 'picking', 'orbit'].includes(kind)
      ? [cube(0,-.85,0,.9,.1,.55,'#9fbea1'),cube(0,-.15,0,.12,.65,.12,'#d9b879'),cube(0,.65,0,.65,.22,.45,'#83bba0')]
      : [cube(0,0,0,.8,.8,.8,color)];
    if (kind === 'scene' || kind === 'picking') { objects.push(cube(-1.45,-.5,0,.35,.45,.4,'#d0ad74')); objects.push(cube(1.5,-.6,.2,.3,.35,.3,'#7ba9ba')); }
    const buffer = document.createElement('canvas'); buffer.width = 600; buffer.height = 360; const paint = buffer.getContext('2d');
    if (!paint) { lab.status('离屏画布不可用。'); return lab.dispose; }
    lab.range('观察方位角', -180, 180, 30, v => { angle = v; });
    // Minimum distance 4 keeps the full +/-3 ground grid in front of the camera at every yaw.
    if (['camera','projection','product-viewer','orbit'].includes(kind)) lab.range('相机距离', 4, 9, 5, v => { distance = v; }, .1);
    if (['lighting','shadows','material'].includes(kind)) lab.range('光源方位', -150, 150, 40, v => { light = v; });
    lab.toggle('显示网格构成', false, v => { wire = v; });
    if (['projection','camera'].includes(kind)) lab.toggle('正交投影', false, v => { orthographic = v; });
    if (kind === 'texture') { texture = true; lab.toggle('显示棋盘纹理', true, v => { texture = v; }); }
    if (['material','product-viewer'].includes(kind)) lab.select('表面颜色', ['薄荷绿','暖沙金','雾蓝'], v => { color = ({'薄荷绿':'#83bba0','暖沙金':'#d9b879','雾蓝':'#7ba9ba'})[v]; });
    if (kind === 'postprocessing') lab.select('后处理', ['原图','灰度','模糊'], v => { filter = v; });
    let picker;
    if (kind === 'picking') picker = lab.select('键盘选择物体', objects.map((_,i) => '物体 '+(i+1)), v => { selected = +v.split(' ')[1]-1; });
    let targets = [];
    const rotate = p => { const a = angle * Math.PI / 180, x = p[0]*Math.cos(a)+p[2]*Math.sin(a), z = -p[0]*Math.sin(a)+p[2]*Math.cos(a); return [x,p[1]*.94-z*.342,p[1]*.342+z*.94]; };
    const project = p => { const q = rotate(p), s = orthographic ? 58 : 290/(distance-q[2]); return [300+q[0]*s,185-q[1]*s,q[2]]; };
    const pointInPoly = (p, vs) => { let hit=false; for(let i=0,j=vs.length-1;i<vs.length;j=i++){const a=vs[i],b=vs[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit; };
    if (kind === 'picking') {
      canvas.setAttribute('tabindex','0');
      const pick = event => { const rect = canvas.getBoundingClientRect(), p = [(event.clientX-rect.left)*600/rect.width,(event.clientY-rect.top)*360/rect.height]; const hit = [...targets].reverse().find(f=>pointInPoly(p,f.points)); if(hit){selected=hit.object;picker.selectedIndex=selected;lab.redraw();}else lab.status('没有命中物体，试试点击画面中的灯或左右方块。'); };
      canvas.addEventListener('pointerdown',pick);lab.onDispose(()=>canvas.removeEventListener('pointerdown',pick));
    }
    lab.frame(() => {
      bg(paint); targets=[]; const faces=[];
      for(let i=-3;i<=3;i++) { line(paint,[project([i,-1,-3]),project([i,-1,3])],'#a6d0b122');line(paint,[project([-3,-1,i]),project([3,-1,i])],'#a6d0b122'); }
      const lightVec = norm([Math.sin(light*Math.PI/180),1.1,Math.cos(light*Math.PI/180)]);
      objects.forEach((o,index)=>o.faces.forEach(face=> {
        const verts=face.map(i=>o.vertices[i]);
        if(kind==='shadows') { const shadow=verts.map(p=>project([p[0]-(p[1]+1)*lightVec[0]/lightVec[1],-1,p[2]-(p[1]+1)*lightVec[2]/lightVec[1]]));line(paint,shadow,'#061712','#061712'); }
        const n=norm(cross(verts[1].map((v,i)=>v-verts[0][i]),verts[2].map((v,i)=>v-verts[0][i])));
        const shade=.26+.74*Math.max(0,n.reduce((a,v,i)=>a+v*lightVec[i],0));
        const points=verts.map(project); faces.push({ points, verts, shade, object:index, color:['material','product-viewer'].includes(kind)?color:o.color, depth:points.reduce((a,p)=>a+p[2],0)/4 });
      }));
      faces.sort((a,b)=>a.depth-b.depth);
      for(const f of faces) {
        const rgb=f.color.match(/\w\w/g).map(v=>Math.round(parseInt(v,16)*f.shade));
        line(paint,f.points,wire?'#efc78b':'#17382a',`rgb(${rgb})`);
        if(texture) {
          for(let u=0;u<6;u++) for(let v=0;v<6;v++) if((u+v)%2===0) {
            const sample=(a,b)=>f.verts[0].map((x,i)=>x+(f.verts[1][i]-x)*a+(f.verts[3][i]-x)*b);
            line(paint,[[u/6,v/6],[(u+1)/6,v/6],[(u+1)/6,(v+1)/6],[u/6,(v+1)/6]].map(p=>project(sample(...p))),'#dce7c533','#e9e9c777');
          }
        }
        if(wire||meshLesson) line(paint,[f.points[0],f.points[2]],'#efc78b');
        targets.push(f);
      }
      if(kind==='picking') for(const f of faces.filter(f=>f.object===selected))line(paint,[...f.points,f.points[0]],'#ffe6a4');
      text(paint,`${objects.length} 个物体 · ${objects.length*8} 个顶点 · ${objects.length*12} 个三角形`,20,335);
      ctx.save();ctx.clearRect(0,0,600,360);ctx.filter=filter==='灰度'?'grayscale(1)':filter==='模糊'?'blur(4px)':'none';ctx.drawImage(buffer,0,0);ctx.restore();
      const explanations={
        camera:'移动相机方位与距离改变观察结果，模型数据保持不变。',projection:`当前${orthographic?'正交：平行线不因远近汇聚':'透视：近大远小'}。投影决定三维坐标如何变为屏幕点。`,
        model:'台灯由底座、灯杆与灯罩三个网格组合；此处为程序化盒体模型，不含外部 glTF 资源。',mesh:'八个角点、十二个三角形构成一个盒子；线框展示表面拓扑。',texture:'棋盘格按每个面的局部 UV 坐标映射；关闭纹理后几何轮廓不变。',material:'只调整基础颜色，使用简化漫反射；这里没有模拟金属度与粗糙度的 PBR 材质。',lighting:'面法线与光方向的点积决定漫反射亮度，附加少量环境光；不是路径追踪。',shadows:'定向光把顶点投影到地面形成平面阴影；不是阴影贴图，也不含自身遮挡求解。',postprocessing:`先渲染图像，再应用${filter}处理；后处理作用于图像，不改变顶点。`,scene:'模型、相机、地面和光源共同构成场景；Canvas 使用深度排序绘制，不是完整 GPU 场景引擎。','product-viewer':'调整视角、距离和颜色观察台灯产品；模型由程序生成，未加载外部商品文件。',picking:`已选物体 ${selected+1}。通过投影多边形测试选择可见物体；不是三维射线检测。`,orbit:'围绕同一目标改变方位与距离；滑块提供触屏和键盘入口。'};
      lab.status(explanations[kind] || '三维顶点经旋转和投影后绘制到二维画布。');
    });
    return lab.dispose;
  }
  ['camera','projection','model','mesh','texture','material','lighting','shadows','postprocessing','scene','product-viewer','picking','orbit'].forEach(id=>DEMOS['gx-'+id]=three);

  DEMOS['gx-globe'] = (root,term) => {
    const lab=G.create(root,term,'Canvas 2D · 经纬球投影（不含真实地理边界）'),canvas=lab.canvas(),ctx=G.context(canvas);
    if(!ctx){lab.status('Canvas 2D 不可用。');return lab.dispose;}
    let angle=0,grid=true,selected='北纬 30°';
    lab.range('地球经度旋转',-180,180,0,v=>angle=v);lab.toggle('显示经纬线',true,v=>grid=v);lab.select('定位标记',['北纬 30°','赤道','南纬 30°'],v=>selected=v);
    lab.frame(()=>{
      bg(ctx);ctx.beginPath();ctx.arc(300,180,130,0,TAU);ctx.fillStyle='#315f53';ctx.fill();
      const sphere=(lat,lon)=>{const a=lon+angle*Math.PI/180;return [300+130*Math.cos(lat)*Math.sin(a),180-130*Math.sin(lat),Math.cos(lat)*Math.cos(a)];};
      const path=points=>{let part=[];for(const p of points){if(p[2]>=0)part.push(p);else{if(part.length>1)line(ctx,part,'#9fd5ba88');part=[];}}if(part.length>1)line(ctx,part,'#9fd5ba88');};
      if(grid){for(let lat=-60;lat<=60;lat+=30)path(Array.from({length:181},(_,i)=>sphere(lat*Math.PI/180,i*TAU/180)));for(let lon=0;lon<360;lon+=30)path(Array.from({length:91},(_,i)=>sphere((i-45)*Math.PI/90,lon*Math.PI/180)));}
      const lat=selected==='赤道'?0:selected==='北纬 30°'?Math.PI/6:-Math.PI/6,p=sphere(lat,0);
      if(p[2]>=0){ctx.beginPath();ctx.arc(p[0],p[1],7,0,TAU);ctx.fillStyle='#efc78b';ctx.fill();}
      text(ctx,`${selected} · 经度 0°标记${p[2]>=0?'可见':'位于背面'}`,25,330);lab.status('经纬线来自球面参数方程。选中的标记随球体转动；此处不绘制国界或真实大陆。');
    });return lab.dispose;
  };
  window.TERM_PREVIEWS=window.TERM_PREVIEWS||{};
  TERM_PREVIEWS.graphics=term=>{
    const id=term.id.slice(3), label=String(term.en).replace(/[&<>"']/g,'');
    const wave='<path d="M0 70 Q25 10 50 60 T100 60 T150 60 T200 60 M0 90 Q30 20 60 80 T120 80 T180 80" fill="none" stroke="#7fd7b5" stroke-width="2"/>';
    const cube='<path d="M62 36 L104 18 L148 40 L108 61 Z M62 36 V80 L108 105 L148 82 V40 M108 61 V105" fill="#7fd7b522" stroke="#a6d7b7" stroke-width="1.5"/>';
    const dots=Array.from({length:24},(_,i)=>'<circle cx="'+(15+(i*47)%175)+'" cy="'+(15+(i*31)%85)+'" r="'+(1+i%3)+'" fill="'+(i%2?'#7fd7b5':'#efc78b')+'"/>').join('');
    const globe='<circle cx="100" cy="60" r="43" fill="#315f53" stroke="#a6d7b7"/><ellipse cx="100" cy="60" rx="22" ry="43" fill="none" stroke="#7fd7b5"/><path d="M58 60 H142 M65 37 Q100 50 135 37 M65 83 Q100 70 135 83" fill="none" stroke="#7fd7b5"/>';
    const art=id==='globe'?globe: ['particles','particle-background','starfield','flowfield','generative'].includes(id)?dots: ['wave','liquid','fluid','aurora','noise','metaball','shader','webgl'].includes(id)?wave: ['canvas','svg','coordinates','render-loop','webgpu'].includes(id)?'<path d="M100 18 L150 98 H50 Z" fill="#7fd7b544" stroke="#7fd7b5"/><circle cx="100" cy="65" r="28" fill="none" stroke="#efc78b"/>':cube;
    return '<div class="gfx-preview" aria-hidden="true"><svg viewBox="0 0 200 120">'+art+'</svg><small>'+label+'</small></div>';
  };
})();
