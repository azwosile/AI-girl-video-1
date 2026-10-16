# 极简 ComfyUI MCP 服务器（stdio）。启动: uv run --with mcp comfy_mcp.py   环境变量 COMFY_URL（默认 http://127.0.0.1:8188）
import json, os, time, uuid, urllib.request, urllib.parse, mimetypes, shutil
from mcp.server.fastmcp import FastMCP
URL = os.environ.get('COMFY_URL', 'http://127.0.0.1:8188')
mcp = FastMCP('comfyui')
def _get(p): return json.load(urllib.request.urlopen(URL + p, timeout=30))
def _post(p, obj):
    r = urllib.request.Request(URL + p, data=json.dumps(obj).encode(), headers={'Content-Type': 'application/json'})
    return json.load(urllib.request.urlopen(r, timeout=60))
@mcp.tool()
def comfy_status() -> str:
    """ComfyUI 系统状态（版本、显存、内存）和当前队列。"""
    s = _get('/system_stats'); q = _get('/queue')
    return json.dumps({'system': {k: s['system'][k] for k in ('comfyui_version', 'ram_total', 'ram_free')}, 'devices': s['devices'], 'running': len(q['queue_running']), 'pending': len(q['queue_pending'])}, ensure_ascii=False)
@mcp.tool()
def comfy_list_models(folder: str) -> str:
    """列出某个模型目录下的文件，例如 diffusion_models / loras / vae / text_encoders。"""
    return json.dumps(_get('/models/' + folder), ensure_ascii=False)
@mcp.tool()
def comfy_upload_image(path: str, name: str = '') -> str:
    """把本机图片上传到 ComfyUI input 目录，返回可在 LoadImage 里使用的文件名。"""
    name = name or os.path.basename(path); b = '----arena' + uuid.uuid4().hex
    data = open(path, 'rb').read(); mt = mimetypes.guess_type(path)[0] or 'image/png'
    body = (f'--{b}\r\nContent-Disposition: form-data; name="image"; filename="{name}"\r\nContent-Type: {mt}\r\n\r\n').encode() + data + (f'\r\n--{b}\r\nContent-Disposition: form-data; name="overwrite"\r\n\r\ntrue\r\n--{b}--\r\n').encode()
    r = urllib.request.Request(URL + '/upload/image', data=body, headers={'Content-Type': f'multipart/form-data; boundary={b}'})
    return json.dumps(json.load(urllib.request.urlopen(r, timeout=60)), ensure_ascii=False)
@mcp.tool()
def comfy_run_workflow(api_json_path: str, overrides: dict = None) -> str:
    """提交 API 格式工作流。overrides 形如 {"113.prompt": "...", "123.image": "a.png"}，按 节点ID.输入名 覆盖。返回 prompt_id（异步，用 comfy_job 查询）。"""
    wf = json.load(open(api_json_path, encoding='utf-8'))
    for k, v in (overrides or {}).items():
        nid, inp = k.split('.', 1); wf[nid]['inputs'][inp] = v
    for n in wf.values(): n.pop('_meta', None)
    r = _post('/prompt', {'prompt': wf, 'client_id': 'arena-mcp'})
    return json.dumps(r, ensure_ascii=False)
@mcp.tool()
def comfy_job(prompt_id: str) -> str:
    """查询任务：排队位置 / 是否完成 / 输出文件列表 / 错误信息。"""
    h = _get('/history/' + prompt_id)
    if prompt_id in h:
        e = h[prompt_id]; outs = []
        for nid, o in e.get('outputs', {}).items():
            for key in ('gifs', 'videos', 'images', 'audio'):
                for f in o.get(key, []): outs.append({'node': nid, 'kind': key, **{k: f.get(k) for k in ('filename', 'subfolder', 'type', 'fullpath')}})
        st = e.get('status', {})
        msgs = [m for m in st.get('messages', []) if m[0] in ('execution_error', 'execution_interrupted')]
        return json.dumps({'done': True, 'status': st.get('status_str'), 'outputs': outs, 'errors': msgs}, ensure_ascii=False)[:6000]
    q = _get('/queue'); run = [x[1] for x in q['queue_running']]; pend = [x[1] for x in q['queue_pending']]
    return json.dumps({'done': False, 'running': prompt_id in run, 'pending_pos': pend.index(prompt_id) if prompt_id in pend else None}, ensure_ascii=False)
@mcp.tool()
def comfy_fetch_output(filename: str, subfolder: str, dest: str, type: str = 'output') -> str:
    """把输出文件下载到本机路径 dest。"""
    qs = urllib.parse.urlencode({'filename': filename, 'subfolder': subfolder, 'type': type})
    with urllib.request.urlopen(URL + '/view?' + qs, timeout=120) as r, open(dest, 'wb') as f: shutil.copyfileobj(r, f)
    return json.dumps({'saved': dest, 'bytes': os.path.getsize(dest)})
@mcp.tool()
def comfy_interrupt() -> str:
    """中断当前运行的任务。"""
    urllib.request.urlopen(urllib.request.Request(URL + '/interrupt', data=b'', method='POST'), timeout=30); return 'ok'
if __name__ == '__main__':
    mcp.run()
