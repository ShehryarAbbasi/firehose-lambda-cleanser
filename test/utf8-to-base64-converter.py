import base64
import json

with open('utf8-example-payload.json') as json_file:    # open file as read-only and close after we are done
   data = json.load(json_file)                          # parses json and creates a dict
   cleaned = json.dumps(data).rstrip()                  # json to string and strip newlines and such
   encoded = base64.b64encode(cleaned)                  # encode to base64
   print(encoded)                                       # print to stdout
