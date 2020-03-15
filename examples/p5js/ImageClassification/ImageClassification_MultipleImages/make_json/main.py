# -*- coding: utf-8 -*-

import json
text = open('tree.txt', 'rb')
data = {"images": []}
for line in text:
    import re
    if re.match('├── ', line):
        data["images"].append(line.split('├── ')[1].strip())
    elif re.match('└── ', line):
        data["images"].append(line.split('└── ')[1].strip())
    else:
        print line

with open('data.json', 'w') as f:
    json.dump(data, f)