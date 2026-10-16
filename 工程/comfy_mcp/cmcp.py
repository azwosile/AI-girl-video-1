# 通用 stdio MCP 客户端：python cmcp.py <tool|__list> '<json>'
import json, subprocess, sys, threading, queue, os
p = subprocess.Popen([os.environ.get('UV', 'D:/Python/Scripts/uv.exe'), 'run', '--quiet', '--with', 'mcp<2', 'comfy_mcp.py'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=open('cmcp_err.log', 'ab'))
q = queue.Queue()
threading.Thread(target=lambda: [q.put(l) for l in p.stdout], daemon=True).start()
def send(o): p.stdin.write((json.dumps(o, ensure_ascii=False) + '\n').encode()); p.stdin.flush()
def wait(i, t=110):
    while True:
        m = json.loads(q.get(timeout=t))
        if m.get('id') == i: return m
send({'jsonrpc': '2.0', 'id': 1, 'method': 'initialize', 'params': {'protocolVersion': '2025-03-26', 'capabilities': {}, 'clientInfo': {'name': 'arena', 'version': '1'}}}); wait(1, 100)
send({'jsonrpc': '2.0', 'method': 'notifications/initialized'})
if sys.argv[1] == '__list':
    send({'jsonrpc': '2.0', 'id': 2, 'method': 'tools/list'}); print('\n'.join(t['name'] for t in wait(2)['result']['tools']))
else:
    send({'jsonrpc': '2.0', 'id': 2, 'method': 'tools/call', 'params': {'name': sys.argv[1], 'arguments': json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}}})
    r = wait(2).get('result', {}); sys.stdout.buffer.write(('\n'.join(c.get('text', '') for c in r.get('content', [])) + ('\n!!isError' if r.get('isError') else '') + '\n').encode())
p.kill()
