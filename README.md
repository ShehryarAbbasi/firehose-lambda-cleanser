# firehose-lambda-cleanser


a simple lambda based cleanser which can receive and cleanse Kinesis Firehose data:
- input data requirements: base64 JSON data
- index.js: converts base64 to utf-8, then recursively iterates over and deletes certain Keys from a JSON payload, regardless of nesting depth or array/obj type, based on the control file
- control file: properties-to-delete.json file, specify which Keys need to be removed
- output data: base64 JSON data with Keys removed
- use-cases: cleanse unnecessary or unwanted Keys from original payload
- adjustments: if newline or return chars are in the dataset stream, then a simple regex can clean the data BEFORE it is sent in or WITHIN this Key cleanser function: after the String operation under base64 to utf8 translation, for example, in `src/index.js` just update the toUtf8 encoding operation:
```
const toUtf8 = async (record) => {
       // let utf8encoded = Buffer.from(record.data, 'base64').toString('utf8');  // chain a couple of regex operations as shown in the line below
        let utf8encoded = Buffer.from(record.data, 'base64').toString('utf8').replace(/[ \s]/g,'').replace(/[\r\n]/g,'')
        record.data = JSON.parse(utf8encoded);
        return record;
    };
``` 
