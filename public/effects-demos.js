/* Each scene isolates one visual idea. No remote assets or automatic looping. */
(() => {
  'use strict';
  let serial = 0;
  const controls = {
    glass: ['背景模糊', 0, 24, 12, 'px'], soft: ['阴影距离', 0, 18, 9, 'px'],
    glow: ['辉光半径', 0, 36, 18, 'px'], spotlight: ['光源横向位置', 0, 100, 50, '%'],
    gradient: ['渐变方向', 0, 360, 120, '°'], blend: ['色块交叠', 0, 100, 55, '%'],
    duotone: ['双色覆盖强度', 0, 100, 80, '%'], clip: ['切角深度', 0, 40, 20, '%'],
    mask: ['开始淡出的位置', 0, 90, 45, '%'], textfill: ['色彩位置', 0, 100, 35, '%'],
    perspective: ['观察距离', 200, 1200, 600, 'px'], tilt: ['左右倾斜', -30, 30, 15, '°'],
    flip: ['翻转进度', 0, 180, 0, '°'], parallax: ['模拟滚动进度', 0, 100, 50, '%'],
    layers: ['抬升高度', 0, 24, 12, 'px'], easing: ['动画时长', 400, 2000, 1000, 'ms'],
    stagger: ['相邻延迟', 0, 300, 120, 'ms'], reveal: ['显示进度', 0, 100, 55, '%'],
    ripple: ['扩散时长', 400, 1800, 1000, 'ms'], morph: ['形状进度', 0, 100, 50, '%']
  };
  const motionOff = () => document.documentElement.classList.contains('reduce-motion');
  const element = (tag, cls, text) => {
    const el = document.createElement(tag); el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  };
  function demo(root, term) {
    const kind = term.id.slice(3), spec = controls[kind], id = 'fx-control-' + ++serial;
    root.classList.add('fx-lab'); root.replaceChildren();
    const scene = element('div', 'fx-scene fx-' + kind);
    const art = element('div', 'fx-art'); art.setAttribute('aria-hidden', 'true');
    // Decorative scene contents are static and contain no user input.
    art.innerHTML = '<div class="fx-orb fx-orb-a"></div><div class="fx-orb fx-orb-b"></div><div class="fx-grid"></div>';
    const object = element('div', 'fx-object');
    object.innerHTML = '<span class="fx-overline">FIELD NOTES / 07</span><strong>光落在<br>界面上。</strong><span class="fx-small">观察形状 · 读懂层次</span>';
    art.append(object); scene.append(art);
    const caption = element('span', 'fx-scene-label', 'VISUAL STUDY / ' + kind.toUpperCase());
    scene.append(caption);
    const panel = element('div', 'fx-controls');
    const label = element('label', 'fx-range-label', spec[0]); label.htmlFor = id;
    const valueLabel = element('output', 'fx-value'); valueLabel.htmlFor = id; label.append(valueLabel);
    const slider = element('input', 'fx-range'); slider.id = id; slider.type = 'range';
    slider.min = spec[1]; slider.max = spec[2]; slider.value = spec[3];
    const actions = element('div', 'fx-actions');
    const toggle = element('button', 'ui-btn', '对照：关闭效果'); toggle.type = 'button'; toggle.setAttribute('aria-pressed', 'false');
    const replay = element('button', 'ui-btn primary', '播放一次'); replay.type = 'button';
    const note = element('p', 'fx-note'); note.setAttribute('role', 'status');
    panel.append(label, slider, actions); actions.append(toggle);
    root.append(scene, panel, note);
    let enabled = true, animations = [], select;
    const cancel = () => { animations.forEach(a => a.cancel()); animations = []; };
    const animate = (target, frames, options) => {
      if (!motionOff() && enabled) animations.push(target.animate(frames, options));
    };
    if (kind === 'flip') {
      object.innerHTML = '<div class="fx-face fx-front"><small>正面 / FRONT</small><strong>观察</strong></div><div class="fx-face fx-back"><small>背面 / BACK</small><strong>理解</strong></div>';
    }
    if (['blend', 'duotone'].includes(kind)) {
      object.innerHTML = '<div class="fx-color fx-color-a"></div><div class="fx-color fx-color-b"></div><span class="fx-blend-word">COLOR</span>';
    }
    if (kind === 'textfill') object.innerHTML = '<strong class="fx-filled-text">看见<br>色彩</strong>';
    if (kind === 'parallax') {
      object.innerHTML = '<span class="fx-depth far">远山</span><span class="fx-depth mid">树林</span><span class="fx-depth near">近叶</span>';
    }
    if (kind === 'stagger') object.innerHTML = '<span class="fx-item">01 · 观察</span><span class="fx-item">02 · 操作</span><span class="fx-item">03 · 理解</span>';
    if (kind === 'easing') object.innerHTML = '<div class="fx-lane"><small>匀速</small><i class="fx-runner linear"></i></div><div class="fx-lane"><small>所选曲线</small><i class="fx-runner curve"></i></div>';
    if (kind === 'ripple') {
      art.setAttribute('aria-hidden', 'false');
      object.replaceChildren();
      const target = element('button', 'fx-ripple-target', '点击这块表面'); target.type = 'button';
      object.append(target);
      target.onclick = e => {
        cancel(); object.querySelectorAll('.fx-wave').forEach(n => n.remove());
        if (motionOff() || !enabled) { note.textContent = '已响应点击。当前使用静态反馈，不播放扩散动画。'; return; }
        const rect = target.getBoundingClientRect(), wave = element('span', 'fx-wave');
        wave.setAttribute('aria-hidden', 'true');
        const x = e.detail ? e.clientX - rect.left : rect.width / 2;
        const y = e.detail ? e.clientY - rect.top : rect.height / 2;
        wave.style.left = x + 'px'; wave.style.top = y + 'px'; target.append(wave);
        const size = Math.max(rect.width, rect.height) * 2;
        animate(wave, [{ transform: 'translate(-50%,-50%) scale(0)', opacity: .65 }, { transform: `translate(-50%,-50%) scale(${size / 20})`, opacity: 0 }], { duration: +slider.value, easing: 'ease-out', fill: 'forwards' });
        note.textContent = '涟漪从点击位置扩散；键盘激活时从中心扩散。';
      };
    }
    if (['blend', 'easing'].includes(kind)) {
      const selectLabel = element('label', 'fx-select-label', kind === 'blend' ? '混合方式' : '曲线');
      select = element('select', 'fx-select');
      (kind === 'blend' ? ['multiply', 'screen', 'difference'] : ['ease-in', 'ease-out', 'ease-in-out', 'linear']).forEach(value => {
        const option = element('option', '', value); option.value = value; select.append(option);
      });
      selectLabel.append(select); panel.insertBefore(selectLabel, actions);
      select.onchange = () => { cancel(); draw(); };
    }
    function draw() {
      const v = +slider.value;
      valueLabel.value = v + spec[4]; slider.setAttribute('aria-valuetext', v + spec[4]);
      scene.classList.toggle('fx-disabled', !enabled);
      toggle.textContent = enabled ? '对照：关闭效果' : '对照：开启效果';
      toggle.setAttribute('aria-pressed', String(!enabled));
      // Baseline properties are explicit so comparisons never retain stale state.
      object.style.cssText = '';
      const effect = enabled;
      const text = {
        glass: '看背景经过卡片时的模糊程度：内容本身仍保持清晰。',
        soft: '同一底色上的明暗双阴影形成软凸起；关闭后边界变平。',
        glow: '发光边缘向外扩散；半径越大，光晕越宽，并非实体高度变高。',
        spotlight: '移动滑块控制光源位置；这是径向渐变营造的照明感。',
        gradient: '颜色沿设定方向连续过渡，角度改变过渡的走向。',
        blend: '只看两块颜色的交叠区，再切换混合公式比较结果。',
        duotone: '底图先去色，再以两种色彩覆盖，形成双色视觉近似。',
        clip: '切掉卡片四角；裁剪是硬边界，不改变原来的布局占位。',
        mask: '下方内容逐渐透明；遮罩与硬切边界有不同的观感。',
        textfill: '渐变只出现在字形内部，文字仍然是可理解的文字内容。',
        perspective: '距离越近，近大远小越强。旋转角度保持不变。',
        tilt: '滑块模拟指针的左右位置，手机和键盘也能观察倾斜。',
        flip: v < 90 ? '当前主要看到正面；拖过 90°，背面开始可见。' : '当前主要看到背面；背面文字没有镜像，因为两面各自朝外。',
        parallax: '模拟同一次滚动：近叶移动更远，远山移动更少。',
        layers: '接触阴影与宽软阴影共同暗示高度，卡片尺寸并未改变。',
        easing: '点击播放，比较同一距离、同一总时长下，两种速度分配。',
        stagger: '点击播放：每个条目时长相同，但启动时间逐个错开。',
        reveal: '只改变可见范围；被遮住的卡片仍有完整尺寸。',
        ripple: '点击表面，或用 Tab 聚焦后按 Enter，观察一次扩散。',
        morph: '拖动圆角比例，观察同一个形状连续变形，文字不拉伸。'
      };
      note.textContent = effect ? text[kind] : '已关闭效果，观察相同内容的基线外观。';
      if (motionOff() && ['easing', 'stagger', 'ripple'].includes(kind)) note.textContent += ' 已减少动画：保留静态结果与文字说明。';
      if (kind === 'glass') { object.style.backdropFilter = effect ? `blur(${v}px)` : 'none'; object.style.webkitBackdropFilter = effect ? `blur(${v}px)` : 'none'; }
      if (kind === 'glass' && !CSS.supports('backdrop-filter', 'blur(1px)') && !CSS.supports('-webkit-backdrop-filter', 'blur(1px)')) {
        object.style.background = '#315240';
        note.textContent = '此浏览器不支持背景模糊；当前以实色卡片回退，保证文字可读。';
      }
      if (kind === 'soft') object.style.boxShadow = effect ? `${v}px ${v}px ${v * 2}px #afbea6, ${-v}px ${-v}px ${v * 2}px #f6ffea` : 'none';
      if (kind === 'glow') object.style.boxShadow = effect ? `0 0 ${v}px #c7ef8b, inset 0 0 ${v / 2}px #b8d18f66` : 'none';
      if (kind === 'spotlight') object.style.background = effect ? `radial-gradient(circle at ${v}% 25%, #b8ce8799, transparent 65%), #233d32` : '#233d32';
      if (kind === 'gradient') object.style.background = effect ? `linear-gradient(${v}deg, #e9c079, #719c80, #253f3c)` : '#456b57';
      if (kind === 'blend') { object.querySelector('.fx-color-b').style.mixBlendMode = effect ? select.value : 'normal'; object.querySelector('.fx-color-b').style.left = (70 - v * .5) + '%'; }
      if (kind === 'duotone') { object.style.background = 'linear-gradient(145deg, #eee, #303030)'; object.querySelector('.fx-color-a').style.opacity = effect ? v / 100 : 0; object.querySelector('.fx-color-b').style.opacity = effect ? v / 100 : 0; }
      if (kind === 'clip') object.style.clipPath = effect ? `polygon(${v}% 0, ${100 - v}% 0, 100% ${v}%, 100% ${100 - v}%, ${100 - v}% 100%, ${v}% 100%, 0 ${100 - v}%, 0 ${v}%)` : 'none';
      if (kind === 'mask') { object.style.maskImage = effect ? `linear-gradient(#000 ${v}%, transparent)` : 'none'; object.style.webkitMaskImage = object.style.maskImage; }
      if (kind === 'textfill') { const title = object.querySelector('strong'); title.style.backgroundPosition = `${v}% 50%`; title.style.color = effect ? 'transparent' : '#e7edcb'; }
      if (kind === 'perspective') object.style.transform = effect ? `perspective(${v}px) rotateY(38deg)` : 'none';
      if (kind === 'tilt') object.style.transform = effect ? `perspective(650px) rotateY(${v}deg) rotateX(${-v / 3}deg)` : 'none';
      if (kind === 'flip') object.style.transform = `perspective(700px) rotateY(${effect ? v : 0}deg)`;
      if (kind === 'parallax') object.querySelectorAll('.fx-depth').forEach((n, i) => { n.style.transform = `translateY(${effect ? (v - 50) * (i + 1) * .55 : 0}px)`; });
      if (kind === 'layers') object.style.boxShadow = effect ? `0 ${v / 3}px ${v / 2}px #13281d44, 0 ${v}px ${v * 2}px #13281d44, 0 ${v * 2}px ${v * 3}px #13281d22` : 'none';
      if (kind === 'reveal') object.style.clipPath = effect ? `inset(0 ${100 - v}% 0 0)` : 'none';
      if (kind === 'morph') object.style.borderRadius = effect ? `${10 + v * .4}% ${50 - v * .3}% ${15 + v * .35}% ${45 - v * .3}%` : '0';
    }
    if (['easing', 'stagger'].includes(kind)) {
      actions.append(replay);
      replay.onclick = () => {
        cancel();
        if (motionOff() || !enabled) { note.textContent = '静态结果：所有元素均已到达终点，不播放位移动画。'; return; }
        if (kind === 'easing') {
          object.querySelectorAll('.fx-runner').forEach((n, i) => animate(n, [{ left: '0%' }, { left: 'calc(100% - 24px)' }], { duration: +slider.value, easing: i ? select.value : 'linear', fill: 'both' }));
          note.textContent = `相同距离、${slider.value} ms：上方匀速，下方 ${select.value}。可重复播放比较。`;
        } else {
          object.querySelectorAll('.fx-item').forEach((n, i) => animate(n, [{ opacity: 0, transform: 'translateY(22px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 500, delay: +slider.value * i, easing: 'ease-out', fill: 'both' }));
          note.textContent = `每项播放 500 ms，依次相隔 ${slider.value} ms 开始。`;
        }
      };
    }
    slider.oninput = () => { cancel(); draw(); };
    toggle.onclick = () => { cancel(); enabled = !enabled; draw(); };
    draw();
    return () => { cancel(); root.classList.remove('fx-lab'); };
  }
  Object.keys(controls).forEach(kind => { DEMOS['fx-' + kind] = demo; });
  window.TERM_PREVIEWS = window.TERM_PREVIEWS || {};
  const glyphs = { glass: '▧', soft: '◉', glow: '✧', spotlight: '◌', gradient: '◒', blend: '◐', duotone: '◑', clip: '⬡', mask: '▥', textfill: 'Aa', perspective: '▱', tilt: '◇', flip: '↶', parallax: '≋', layers: '▰', easing: '⌁', stagger: '⋰', reveal: '◧', ripple: '◎', morph: '✿' };
  TERM_PREVIEWS.effects = term => `<div class="fx-preview fx-preview-${term.id.slice(3)}" aria-hidden="true"><i></i><b>${glyphs[term.id.slice(3)] || '◈'}</b><small>VISUAL / LAB</small></div>`;
})();
