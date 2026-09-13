/* Shared lifecycle for on-demand graphics lessons. No animation runs on mount. */
window.GRAPHICS = (() => {
  let serial = 0;
  const node = (tag, cls, text) => { const n = document.createElement(tag); n.className = cls; if (text != null) n.textContent = text; return n; };
  function create(root, term, label) {
    root.replaceChildren(); root.classList.add('gfx-lab');
    const stage = node('div', 'gfx-stage'), badge = node('div', 'gfx-badge', label);
    const controls = node('div', 'gfx-controls'), note = node('p', 'gfx-note', '拖动参数观察变化；需要动画时，再点击播放。');
    note.setAttribute('role', 'status');
    root.append(badge, stage, controls, note);
    let live = true, renderer, frameId = 0, running = false, time = 0, previous = 0, play, step;
    const disposers = [];
    const reduced = () => document.documentElement.classList.contains('reduce-motion');
    const redraw = () => { if (live && renderer) renderer(time, 0); };
    const button = (label, fn) => { const b = node('button', 'ui-btn', label); b.type = 'button'; b.onclick = fn; controls.append(b); return b; };
    const stop = () => { running = false; cancelAnimationFrame(frameId); frameId = 0; previous = 0; if (play) { play.textContent = '播放'; play.setAttribute('aria-pressed', 'false'); } };
    const tick = now => {
      if (!live || !running) return;
      if (document.hidden || reduced()) { stop(); return; }
      const dt = previous ? Math.min((now - previous) / 1000, .04) : 1 / 60;
      previous = now; time += dt; renderer(time, dt); frameId = requestAnimationFrame(tick);
    };
    const visibility = () => { if (document.hidden) stop(); };
    document.addEventListener('visibilitychange', visibility);
    const api = {
      stage, controls, note, redraw, button, pause: stop,
      alive: () => live,
      status: text => { if (live) note.textContent = text; },
      onDispose: fn => disposers.push(fn),
      canvas() {
        const c = node('canvas', 'gfx-canvas'); const dpr = Math.min(devicePixelRatio || 1, 2);
        c.width = 600 * dpr; c.height = 360 * dpr; c.setAttribute('role', 'img'); c.setAttribute('aria-label', term.name + '的交互图形；参数和当前状态见下方文字');
        c.textContent = '浏览器不支持画布，请阅读下方概念和代码。';
        // Context is selected by the lesson: 2D, WebGL, and WebGPU cannot share one canvas.
        c.dataset.dpr = dpr; stage.append(c); return c;
      },
      range(label, min, max, initial, callback, stepValue = 1) {
        const wrap = node('label', 'gfx-range-label'), title = node('span', '', label), output = node('output', '', initial);
        const input = node('input', 'gfx-range'); input.type = 'range'; input.id = 'gfx-' + ++serial;
        input.min = min; input.max = max; input.step = stepValue; input.value = initial; wrap.htmlFor = input.id; output.htmlFor = input.id;
        title.append(output); wrap.append(title, input); controls.append(wrap);
        input.oninput = () => { output.value = input.value; callback(+input.value); redraw(); };
        return input;
      },
      select(label, options, callback) {
        const wrap = node('label', 'gfx-select-label', label), select = node('select', 'gfx-select');
        for (const v of options) { const option = node('option', '', v); option.value = v; select.append(option); }
        wrap.append(select); controls.append(wrap); select.onchange = () => { callback(select.value); redraw(); }; return select;
      },
      toggle(label, initial, callback) {
        let checked = initial; const b = button(label, () => { checked = !checked; b.setAttribute('aria-pressed', String(checked)); callback(checked); redraw(); });
        b.setAttribute('aria-pressed', String(checked)); return b;
      },
      frame(draw, animated = false) {
        stop(); renderer = draw;
        if (animated && !play) {
          const row = node('div', 'gfx-playback'); controls.append(row);
          play = button('播放', () => {
            if (running) stop();
            else if (!reduced()) { running = true; play.textContent = '暂停'; play.setAttribute('aria-pressed', 'true'); frameId = requestAnimationFrame(tick); }
          });
          play.setAttribute('aria-pressed', 'false'); play.disabled = reduced();
          step = button('前进一步', () => { stop(); time += 1 / 30; renderer(time, 1 / 30); });
          row.append(play, step, node('small', '', reduced() ? '已减少动画，可手动步进。' : '默认静止 · 离开页面自动停止'));
        }
        redraw();
      },
      dispose() { if (!live) return; live = false; stop(); document.removeEventListener('visibilitychange', visibility); disposers.forEach(fn => fn()); root.classList.remove('gfx-lab'); }
    };
    return api;
  }
  function context(canvas) { const ctx = canvas.getContext('2d'); if (ctx) ctx.setTransform(+canvas.dataset.dpr, 0, 0, +canvas.dataset.dpr, 0, 0); return ctx; }
  return { create, node, context, width: 600, height: 360 };
})();
