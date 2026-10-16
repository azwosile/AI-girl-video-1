import json
a = json.load(open('h3_i2v_api.json', encoding='utf-8'))
for k in ('101', '103', '107', '117', '158'): a.pop(k, None)
a['113']['inputs'].update({'width': 864, 'height': 480, 'length': 124})
a['102']['inputs']['reserved'] = 3          # 8GB 显存按工作流备注用 3
a['123']['inputs']['image'] = 'seed_ff.png'
a['122']['inputs']['filename_prefix'] = 'MiniMaxH3/arena_A14_seed'
json.dump(a, open('h3_i2v_5s_api.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(sorted(a, key=int))
