# firehose-lambda-cleanser


a simple lambda based cleanser which can receive and cleanse Kinesis Firehose data:
- input data requirements: base64 JSON data
- index.js: converts base64 to utf-8, then recursively iterates over and deletes certain Keys from a JSON payload, regardless of nesting depth or array/obj type, based on the control file
- control file: properties-to-delete.json file, specify which Keys need to be removed
- output data: base64 JSON data with Keys removed
- use-cases: cleanse unnecessary or unwanted Keys from original payload
