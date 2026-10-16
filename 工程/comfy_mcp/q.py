import json, subprocess, sys
P = sys.executable
def call(t, a): return subprocess.run([P, 'cmcp.py', t, json.dumps(a, ensure_ascii=False)], capture_output=True).stdout.decode()
print(call('comfy_upload_image', {'path': 'D:/DeepSeek Harness WorkSpace/_arena_tmp/comfy/seed_ff.png', 'name': 'seed_ff.png'}))
pr = open('prompt_a14.txt', encoding='utf-8').read().strip()
r = call('comfy_run_workflow', {'api_json_path': 'D:/DeepSeek Harness WorkSpace/_arena_tmp/comfy/h3_i2v_5s_api.json', 'overrides': {'118.value': pr}})
print(r); open('last_pid.txt', 'w').write(r)
