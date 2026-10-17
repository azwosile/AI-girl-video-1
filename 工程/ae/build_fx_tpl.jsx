// 由 gen_fx.py 生成：在当前 AE 工程里搭「江湖之间」特效合成（底板 = MG 成片）
var D = __DATA__;
var LOG = [];
function log(s){ LOG.push(s); }
function done(){ var f=new File("E:/AI/ae_jsx/build_fx.out"); f.encoding="UTF-8"; f.open("w"); f.write(LOG.join("\n")); f.close(); }
try {
app.beginUndoGroup("build_fx");
var P = app.project, FPS = D.fps, DUR = D.dur;
// 清掉旧版本同名项目项（只删本脚本建的）
for (var i = P.numItems; i >= 1; i--) { var it = P.item(i); if (it.comment == "jhzj_fx") it.remove(); }
var foot = P.importFile(new ImportOptions(new File(D.plate))); foot.comment = "jhzj_fx"; foot.name = "PLATE_MG";
var MAIN = P.items.addComp("MAIN_江湖之间_FX", 1920, 1080, 1, DUR, FPS); MAIN.comment = "jhzj_fx";
MAIN.bgColor = [0,0,0];
// ---- CUES ----
var CUES = MAIN.layers.addNull(DUR); CUES.name = "CUES"; CUES.enabled = false;
var names = ["punch","rgb","flash","glow","shake"];
for (var n = 0; n < names.length; n++) {
  var sl = CUES.Effects.addProperty("ADBE Slider Control"); sl.name = names[n];
  var k = D.cues[names[n]]; sl.property(1).setValuesAtTimes(k[0], k[1]);
}
log("cues ok");
var C = 'thisComp.layer("CUES").effect';
// ---- PLATE_RGB 预合成：R/G/B 三层相加，按 rgb 线索左右错位 ----
var PC = P.items.addComp("PLATE_RGB", 1920, 1080, 1, DUR, FPS); PC.comment = "jhzj_fx";
var chans = [[2,10,10,-1],[10,3,10,0],[10,10,4,1]];
for (var c = 0; c < 3; c++) {
  var L = PC.layers.add(foot); L.audioEnabled = false; L.name = ["R","G","B"][c];
  var sc = L.Effects.addProperty("ADBE Shift Channels");
  sc.property(1).setValue(9); sc.property(2).setValue(chans[c][0]); sc.property(3).setValue(chans[c][1]); sc.property(4).setValue(chans[c][2]);
  if (c > 0) L.blendingMode = BlendingMode.ADD;
  if (chans[c][3] != 0) L.transform.position.expression = 'var r=comp("MAIN_江湖之间_FX").layer("CUES").effect("rgb")(1);value+[' + chans[c][3] + '*r,' + (chans[c][3]*0.25) + '*r]';
}
// 注意：最先加入的层在最下面；把 R 层放到最底（Normal），G/B 叠加
PC.layer("R").moveToEnd();
log("plate_rgb ok");
// ---- MAIN：自下而上 ----
var base = MAIN.layers.add(PC); base.name = "PLATE"; base.audioEnabled = false;
function copyRange(name, t0, t1) { var l = MAIN.layers.add(PC); l.name = name; l.audioEnabled = false; l.inPoint = t0; l.outPoint = t1; return l; }
// S08 昙花：残影 = 同一画面晚 2 帧 / 4 帧再画一遍（参考项目 after-image 做法），不用 Echo（会提亮）
var ghosts = [[4, 18], [2, 30]];
for (var gi = 0; gi < ghosts.length; gi++) { var gl = copyRange("S08_残影_" + ghosts[gi][0] + "f", D.echo[0], D.echo[1]); gl.startTime = ghosts[gi][0] / FPS; gl.inPoint = D.echo[0]; gl.outPoint = D.echo[1]; gl.transform.opacity.setValue(ghosts[gi][1]); }
var st = copyRange("S13_没了消息_掉帧", D.stutter[0], D.stutter[1]);
st.Effects.addProperty("ADBE Posterize Time").property(1).setValue(12);
function adj(name, t0, t1) { var l = MAIN.layers.addSolid([1,1,1], name, 1920, 1080, 1, DUR); l.adjustmentLayer = true; if (t0 != null) { l.inPoint = t0; l.outPoint = t1; } return l; }
// 推拉 + 震屏（带运动模糊）
var AT = adj("ADJ_推拉震屏");
var tf = AT.Effects.addProperty("ADBE Geometry2");
tf.property("ADBE Geometry2-0003").expression = '100+' + C + '("punch")(1)+' + C + '("shake")(1)*0.22';
tf.property("ADBE Geometry2-0002").expression = 'wiggle(16,' + C + '("shake")(1))';
tf.property("ADBE Geometry2-0009").setValue(0); tf.property("ADBE Geometry2-0010").setValue(180); tf.property("ADBE Geometry2-0012").setValue(2);
// 分段事件层
var nz = 0, ng = 0, nr = 0;
for (var i = 0; i < D.trim.length; i++) {
  var ev = D.trim[i];
  if (ev.kind == "zoom") {
    var l = adj("ZOOM_" + ev.t, ev.t - ev.lead, ev.t + ev.tail);
    var z = l.Effects.addProperty("CC Radial Fast Blur"); var am = z.property(2);
    am.setValuesAtTimes([ev.t - ev.lead, ev.t, ev.t + ev.tail], [0, ev.a, 0]); nz++;
  } else if (ev.kind == "glitch") {
    for (var b = 0; b < 7; b++) {
      var l = adj("GLITCH_" + ev.t + "_" + b, ev.t, ev.t + ev.dur);
      var h = 14 + ((b * 37) % 90);
      var m = l.Masks.addProperty("ADBE Mask Atom"); var sh = new Shape();
      sh.vertices = [[0, 540 - h/2], [1920, 540 - h/2], [1920, 540 + h/2], [0, 540 + h/2]]; sh.closed = true;
      m.property("ADBE Mask Shape").setValue(sh);
      l.transform.position.expression = 'posterizeTime(15);seedRandom(index*13+' + b + ',false);[960,random(60,1020)]';
      var of = l.Effects.addProperty("ADBE Offset");
      of.property(1).expression = 'posterizeTime(15);seedRandom(index*7+' + b + ',false);var a=' + Math.round(ev.a * 360) + ';[value[0]+random(-a,a),value[1]]';
      ng++;
    }
  } else if (ev.kind == "rays") {
    var l = adj("RAYS_" + ev.t, ev.t, ev.t1);
    var r = l.Effects.addProperty("CC Light Rays");
    r.property(2).setValue(ev.at); r.property(3).setValue(50); r.property(4).setValue(70);
    r.property(1).setValuesAtTimes([ev.t, ev.t + ev.peak, ev.t1], [0, ev.a, 0]); nr++;
  }
}
log("zoom " + nz + " glitch " + ng + " rays " + nr);
// 辉光
var AG = adj("ADJ_辉光");
var g = AG.Effects.addProperty("ADBE Glo2"); g.property(2).setValue(200); g.property(3).setValue(22);
g.property(4).expression = '0.15+' + C + '("glow")(1)';
// 白闪
var FL = MAIN.layers.addSolid([1,1,1], "FLASH", 1920, 1080, 1, DUR); FL.blendingMode = BlendingMode.SCREEN;
FL.transform.opacity.expression = C + '("flash")(1)*100';
// 扫描线（S12 终端段）
var SC = MAIN.layers.addSolid([0,0,0], "SCAN_S12", 1920, 1080, 1, DUR); SC.inPoint = D.scan[0]; SC.outPoint = D.scan[1];
var vb = SC.Effects.addProperty("ADBE Venetian Blinds"); vb.property(1).setValue(50); vb.property(2).setValue(0); vb.property(3).setValue(4);
SC.transform.opacity.setValue(14);
// 纸纹（参考项目的版画纸底：12 fps 跳动）
var PA = MAIN.layers.addSolid([0.5,0.5,0.5], "PAPER", 1920, 1080, 1, DUR); PA.blendingMode = BlendingMode.OVERLAY; PA.transform.opacity.setValue(7);
var fn = PA.Effects.addProperty("ADBE Fractal Noise"); fn.property(4).setValue(120); fn.property(10).setValue(35); fn.property(16).setValue(6);
fn.property(24).expression = 'Math.floor(time*12)*97';
// 颗粒 + 暗角
var AF = adj("ADJ_颗粒暗角");
var no = AF.Effects.addProperty("ADBE Noise2"); no.property(1).setValue(2.2); no.property(2).setValue(0);
var vg = AF.Effects.addProperty("CS Vignette"); vg.property(1).setValue(35);
CUES.moveToBeginning();
// 渲染队列：高品质（中间片给 PR）
while (P.renderQueue.numItems > 0) P.renderQueue.item(1).remove();
var rq = P.renderQueue.items.add(MAIN); rq.applyTemplate("最佳设置");
var om = rq.outputModule(1); om.applyTemplate("高品质");
var outDir = new Folder(D.aep.replace(/[^\/]+$/, "") + "render"); if (!outDir.exists) outDir.create();
om.file = new File(outDir.fsName + "/" + D.aep.replace(/^.*\//, "").replace(/\.aep$/, "") + ".mov");
log("om file " + om.file.fsName);
app.endUndoGroup();
var af = new File(D.aep); if (!af.parent.exists) af.parent.create();
P.save(af);
log("saved " + P.file.fsName + " layers " + MAIN.numLayers);
} catch (err) { log("ERR line " + err.line + ": " + err.toString()); }
done();
