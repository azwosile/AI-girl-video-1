(async () => {
  const $ = id => document.getElementById(id), IDS = ['ParamAngleZ','ParamEyeLOpen','ParamEyeROpen','ParamMouthOpenY','ParamBreath','ParamBodySway','ParamHairSwing'];
  try {
    const stage = $('stage');
    const app = new PIXI.Application({view: stage.querySelector('canvas'), resizeTo: stage, backgroundAlpha: 0, antialias: true, preserveDrawingBuffer: true});
    const model = await PIXI.live2d.Live2DModel.from('runtime/DeepSeek.model3.json', {autoInteract: false, autoUpdate: true});
    app.stage.addChild(model);
    model.internalModel.updateNaturalMovements = () => {}; model.internalModel.updateFocus = () => {};
    model.internalModel.motionManager.update = () => false;   // 动作由本页控制
    const fit = () => { model.scale.set(1); const s = Math.min(app.screen.width / 867, app.screen.height / 1569); model.scale.set(s); model.position.set((app.screen.width - model.width) / 2, (app.screen.height - model.height) / 2); };
    fit(); new ResizeObserver(fit).observe(stage);
    const core = model.internalModel.coreModel;
    let idle = false, talk = false, t0 = performance.now();
    window.setParams = o => { for (const k in o) { $(k).value = o[k]; } };
    $('idle').onclick = () => { idle = !idle; t0 = performance.now(); $('idle').textContent = idle ? '暂停待机' : '播放待机'; };
    $('talk').onclick = () => { talk = !talk; $('talk').textContent = talk ? '停止说话' : '模拟说话'; if (!talk) $('ParamMouthOpenY').value = 1; };
    $('reset').onclick = () => { idle = talk = false; IDS.forEach(k => $(k).value = $(k).defaultValue); $('idle').textContent = '播放待机'; $('talk').textContent = '模拟说话'; };
    app.ticker.add(() => {
      const t = (performance.now() - t0) / 1000;
      if (idle) {
        $('ParamAngleZ').value = 2.5 * Math.sin(t * 0.8); $('ParamBreath').value = 0.5 + 0.5 * Math.sin(t * 1.6);
        $('ParamBodySway').value = 0.18 * Math.sin(t * 0.8 + 0.6); $('ParamHairSwing').value = 0.45 * Math.sin(t * 0.8 - 0.9);
        const b = t % 4.2, e = b < 0.08 ? 1 - b / 0.08 : b < 0.2 ? (b - 0.08) / 0.12 : 1;
        $('ParamEyeLOpen').value = $('ParamEyeROpen').value = e;
      }
      if (talk) $('ParamMouthOpenY').value = Math.max(0, Math.min(1, 0.5 + 0.5 * Math.sin(t * 17) * Math.sin(t * 5.3)));
      IDS.forEach(k => core.setParameterValueById(k, parseFloat($(k).value)));
    });
    $('status').textContent = '已加载：' + core.getDrawableCount() + ' 个网格，' + core.getParameterCount() + ' 个参数（Cubism Core ' + Live2DCubismCore.Version.csmGetVersion().toString(16) + '）';
    window.L2D_READY = true;
  } catch (e) { $('status').textContent = '加载失败：' + e.message; window.L2D_ERR = String(e); }
})();
