"""A09 v5 FL2VA 单条生成：只提交一次，按实际 prompt_id 等待和取回；不改全局设置。"""
from pathlib import Path
import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
URL = 'http://127.0.0.1:8188'
WORKFLOW = HERE / 'S17_qwen_v6_api.json'
FRAME = HERE / 'S17_qwen_v6_first_864x480.png'
LAST = HERE / 'S17_qwen_v6_last_864x480.png'
RECORD = HERE / 'S17_qwen_v6_run.json'
DEST = ROOT / '素材/AI镜头/S17_Qwen_v6_FL2VA.mp4'
HTTP = urllib.request.build_opener(urllib.request.ProxyHandler({}))


def request(path, value=None, timeout=20):
    data = None if value is None else json.dumps(value, ensure_ascii=False).encode('utf-8')
    headers = {} if data is None else {'Content-Type': 'application/json'}
    req = urllib.request.Request(URL + path, data=data, headers=headers)
    with HTTP.open(req, timeout=timeout) as response:
        return json.load(response)


def save_record(record):
    tmp = RECORD.with_name(RECORD.name + '.tmp')
    tmp.write_text(json.dumps(record, ensure_ascii=False, indent=2), encoding='utf-8')
    os.replace(tmp, RECORD)


def load_record():
    if not RECORD.exists():
        raise RuntimeError('本条任务尚无运行记录，不能猜测 prompt_id。')
    return json.loads(RECORD.read_text(encoding='utf-8'))


def upload_frame(FRAME=FRAME):
    boundary = '----a09' + uuid.uuid4().hex
    newline = chr(13) + chr(10)
    name = FRAME.name
    prefix = (f'--{boundary}{newline}Content-Disposition: form-data; name="image"; filename="{name}"{newline}Content-Type: image/png{newline}{newline}').encode()
    suffix = (f'{newline}--{boundary}{newline}Content-Disposition: form-data; name="overwrite"{newline}{newline}false{newline}--{boundary}--{newline}').encode()
    req = urllib.request.Request(URL + '/upload/image', data=prefix + FRAME.read_bytes() + suffix, headers={'Content-Type': 'multipart/form-data; boundary=' + boundary})
    with HTTP.open(req, timeout=30) as response:
        result = json.load(response)
    return '/'.join(filter(None, [result.get('subfolder', ''), result['name']]))


def submit():
    if RECORD.exists():
        old = load_record()
        raise RuntimeError('已有本条运行记录，拒绝重复提交。请先运行 status；prompt_id=' + str(old.get('prompt_id')) + '，state=' + str(old.get('state')))
    if not FRAME.is_file():
        raise RuntimeError('请先生成并检查首帧。')
    queue = request('/queue', timeout=10)
    workflow = json.loads(WORKFLOW.read_text(encoding='utf-8'))
    image_name = upload_frame()
    workflow['123']['inputs']['image'] = image_name
    workflow['124']['inputs']['image'] = upload_frame(LAST)
    for node in workflow.values():
        node.pop('_meta', None)
    client_id = 'arena-S17_qwen-v6-' + str(uuid.uuid4())
    record = {
        'shot': 'S17_qwen', 'revision': 'v6', 'endpoint': URL,
        'client_id': client_id, 'prompt_id': None, 'state': 'submitting',
        'submitted_at_local': time.strftime('%Y-%m-%dT%H:%M:%S%z'),
        'frame_name': image_name,
        'workflow_sha256': hashlib.sha256(WORKFLOW.read_bytes()).hexdigest(),
        'frame_sha256': hashlib.sha256(FRAME.read_bytes()).hexdigest(),
        'queue_before': {k: len(queue.get(k, [])) for k in ['queue_running', 'queue_pending']},
    }
    save_record(record)
    try:
        reply = request('/prompt', {'prompt': workflow, 'client_id': client_id, 'extra_data': {'client_id': client_id, 'project': '国模·江湖之间', 'shot': 'S17_qwen', 'revision': 'v6'}}, timeout=30)
    except urllib.error.HTTPError as exc:
        record.update(state='rejected', response=exc.read().decode('utf-8', errors='replace'))
        save_record(record)
        raise RuntimeError('服务拒绝工作流，未把接单当成成功：' + record['response']) from exc
    except Exception as exc:
        record.update(state='submission_uncertain', error=str(exc))
        save_record(record)
        raise RuntimeError('提交结果不确定；保留记录，禁止盲目重复提交，请用 status 恢复查询。') from exc
    if not reply.get('prompt_id'):
        record.update(state='rejected', response=reply)
        save_record(record)
        raise RuntimeError('返回结果没有 prompt_id：' + json.dumps(reply, ensure_ascii=False))
    record.update(state='queued', prompt_id=reply['prompt_id'], queue_number=reply.get('number'), node_errors=reply.get('node_errors', {}))
    save_record(record)
    print(json.dumps(record, ensure_ascii=False))


def recover_id(record):
    """仅匹配本次实际 client_id，不读取或控制其他生成任务。"""
    queue = request('/queue')
    for key in ['queue_running', 'queue_pending']:
        for item in queue.get(key, []):
            if len(item) > 3 and isinstance(item[3], dict) and item[3].get('client_id') == record['client_id']:
                record['prompt_id'] = item[1]
                save_record(record)
                return
    history = request('/history?max_items=20')
    for prompt_id, entry in history.items():
        prompt = entry.get('prompt', [])
        if len(prompt) > 3 and isinstance(prompt[3], dict) and prompt[3].get('client_id') == record['client_id']:
            record['prompt_id'] = prompt_id
            save_record(record)
            return
    raise RuntimeError('未找到本次 client_id 对应任务；未自动重新提交。')


def snapshot(record):
    if not record.get('prompt_id'):
        recover_id(record)
    prompt_id = record['prompt_id']
    history = request('/history/' + urllib.parse.quote(prompt_id, safe=''))
    if prompt_id in history:
        entry = history[prompt_id]
        state = entry.get('status', {})
        errors = [message for message in state.get('messages', []) if message[0] in ['execution_error', 'execution_interrupted']]
        done = bool(state.get('completed')) or state.get('status_str') in ['success', 'error']
        if errors:
            record.update(state='failed', errors=errors, history_status=state)
        elif state.get('status_str') == 'success':
            record.update(state='generated', history_status=state)
        save_record(record)
        return {'prompt_id': prompt_id, 'done': done, 'state': record['state'], 'history_status': state, 'outputs': entry.get('outputs', {}), 'errors': errors}
    queue = request('/queue')
    running = [item[1] for item in queue.get('queue_running', [])]
    pending = [item[1] for item in queue.get('queue_pending', [])]
    state = 'running' if prompt_id in running else 'queued' if prompt_id in pending else 'not_in_queue_or_history'
    record['state'] = state
    save_record(record)
    return {'prompt_id': prompt_id, 'done': False, 'state': state, 'pending_position': pending.index(prompt_id) if prompt_id in pending else None}


def status(wait):
    record = load_record()
    deadline = time.monotonic() + max(0, wait)
    while True:
        result = snapshot(record)
        if result['done'] or time.monotonic() >= deadline or result['state'] == 'not_in_queue_or_history':
            print(json.dumps(result, ensure_ascii=False))
            return
        time.sleep(min(4, max(0, deadline - time.monotonic())))


def probe(path):
    proc = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration,size:stream=codec_type,codec_name,width,height,r_frame_rate', '-of', 'json', str(path)], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding='utf-8', errors='replace')
    if proc.returncode:
        raise RuntimeError('ffprobe 未通过：' + proc.stderr)
    metadata = json.loads(proc.stdout)
    videos = [s for s in metadata.get('streams', []) if s.get('codec_type') == 'video']
    if not videos or float(metadata.get('format', {}).get('duration', 0)) <= 0:
        raise RuntimeError('输出没有有效的视频流或时长。')
    return metadata


def fetch():
    record = load_record()
    if record.get('saved_path') and Path(record['saved_path']).is_file():
        print(json.dumps({'status': 'already_saved', 'path': record['saved_path'], 'metadata': probe(Path(record['saved_path']))}, ensure_ascii=False))
        return
    result = snapshot(record)
    if result['state'] != 'generated' or result['errors']:
        raise RuntimeError('该任务尚未成功，不能声称已生成。状态：' + result['state'])
    candidates = []
    for node, output in result.get('outputs', {}).items():
        for kind in ['gifs', 'videos']:
            for item in output.get(kind, []):
                if item.get('filename', '').lower().endswith('.mp4'):
                    candidates.append({'node': node, **item})
    if not candidates:
        raise RuntimeError('成功记录里没有 MP4 输出。')
    item = candidates[0]
    if DEST.exists():
        raise FileExistsError('目标素材已存在，不覆盖：' + str(DEST))
    DEST.parent.mkdir(parents=True, exist_ok=True)
    temp = DEST.with_name(DEST.name + '.part')
    qs = urllib.parse.urlencode({k: item.get(k, 'output' if k == 'type' else '') for k in ['filename', 'subfolder', 'type']})
    with HTTP.open(URL + '/view?' + qs, timeout=60) as response, temp.open('xb') as output:
        shutil.copyfileobj(response, output)
    metadata = probe(temp)
    if temp.stat().st_size == 0:
        raise RuntimeError('输出为空文件。')
    with temp.open('rb') as source, DEST.open('xb') as target:
        shutil.copyfileobj(source, target)
    temp.unlink()
    record.update(state='verified_file', saved_path=str(DEST), source_output=item, bytes=DEST.stat().st_size, sha256=hashlib.sha256(DEST.read_bytes()).hexdigest(), metadata=metadata)
    save_record(record)
    print(json.dumps(record, ensure_ascii=False))


def main():
    parser = argparse.ArgumentParser(description='A09 单条 H3 试生成；不重复提交、不覆盖已有素材。')
    parser.add_argument('operation', choices=['submit', 'status', 'fetch'])
    parser.add_argument('--wait', type=int, default=0)
    args = parser.parse_args()
    try:
        if args.operation == 'submit': submit()
        elif args.operation == 'status': status(min(90, max(0, args.wait)))
        else: fetch()
    except Exception as exc:
        print(json.dumps({'ok': False, 'error': str(exc), 'operation': args.operation}, ensure_ascii=False), file=sys.stderr)
        raise SystemExit(1)


if __name__ == '__main__':
    main()
