// 用真实 Cubism Core（Web 版，在 Node 里运行）加载 MOC3 并做结构 / 参数检查
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
global.require=require;global.__dirname=__dirname;
vm.runInThisContext(fs.readFileSync(path.join(__dirname,'vendor/live2dcubismcore.min.js'),'utf8'));
setTimeout(()=>{
 const C=Live2DCubismCore,data=fs.readFileSync(path.join(__dirname,'runtime/DeepSeek.moc3'));
 const ab=data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength);
 const moc=C.Moc.fromArrayBuffer(ab);assert(moc,'moc load failed');
 console.log('core',C.Version.csmGetVersion().toString(16),'mocVersion',C.Version.csmGetMocVersion(moc,ab),'consistency',moc.hasMocConsistency(ab));
 const m=C.Model.fromMoc(moc);assert(m,'model failed');const d=m.drawables,p=m.parameters;
 const reset=()=>{p.values.set(p.defaultValues);m.update();};
 const set=(id,v)=>{const i=p.ids.indexOf(id);assert(i>=0,id);p.values[i]=v;m.update();};
 const pos=id=>Array.from(d.vertexPositions[d.ids.indexOf(id)]);
 const op=id=>d.opacities[d.ids.indexOf(id)];
 const diff=(a,b)=>Math.max(...a.map((v,i)=>Math.abs(v-b[i])));
 console.log('drawables',d.count,Array.from(d.ids),'params',Array.from(p.ids));
 reset();const b0=pos('Body');
 for(const e of ['EyeClosedLeft','EyeClosedRight','MouthClosed'])assert(op(e)<.01,e+' visible at default');
 set('ParamEyeLOpen',0);assert(op('EyeClosedLeft')>.99);assert(op('EyeClosedRight')<.01);reset();
 set('ParamMouthOpenY',0);assert(op('MouthClosed')>.99);reset();
 for(const [id,v] of [['ParamAngleZ',10],['ParamBreath',1],['ParamBodySway',1],['ParamHairSwing',1]]){set(id,v);const dd=diff(b0,pos('Body'));console.log(id,v,'max vertex move (px)',(dd*1000).toFixed(1));assert(dd>0,id+' no effect');reset();}
 set('ParamAngleZ',10);const e1=pos('EyeClosedLeft');reset();assert(diff(e1,pos('EyeClosedLeft'))>0,'eye patch does not follow head');
 console.log('ALL CHECKS PASSED');
},300);
