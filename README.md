# firehose-lambda-cleanser

### TL;DR:
a use-case for programmatic recursion: cleaning PII data when supplied with a JSON Object (dictionary) containing child Keys and child Lists/Arrays where certain Keys must be deleted completely, regardless of depth.

### Background:
Normally, when data is sent to Kinesis Data Firehose, there is some amount of cleanup or ETL required. This can be done `AFTER` the data is sent to a Destination (such as S3) via Glue or EMR or another Batch process, or `IN-LINE` based on the Firehose-Lambda integration. This example code explores this latter option, with a simple use-case of cleaning unwanted/unnecessary Keys given an input HashMap. As you may already know, Kinesis Firehose accepts incoming data as Base64 encoded; therefore, this example code converts it to UTF-8 first (feel free to convert to another encoding), then recursively does the cleanup as it looks for the specified Keys within the HashMap (JSON). The cleanup is based on a simple Array of Keys provided in a file so that it can be adjusted outside of the main ETL logic. An alternative approach would be to use this cleanup file as Lambda Layer or store it in EFS to make it available "locally" within the function. Another alternative would be to store this cleanup data structure in AWS AppConfig, which is then polled by the Lambda function upon initialization for changes; in order to further decouple ETL logic from its configuration and develop, deploy, and maintain both of these entities separately. 

### Info: 
a simple lambda based cleanser which can receive and cleanse Kinesis Firehose data:
- `input data`: base64 JSON data
- `main logic`: src/index.js converts base64 to utf-8, then recursively iterates over and deletes certain Keys from a JSON payload, regardless of nesting depth or data type, based on the control file
- `control file`: src/properties-to-delete.json file, specify which Keys need to be removed
- `output data`: base64 JSON data with Keys removed
- `use-cases`: cleanse unnecessary or unwanted Keys from original payload
- `adjustments`: if newline or return chars are in the dataset stream, then a simple regex can clean the data BEFORE it is sent in or WITHIN this Key cleanser function: after the String operation under base64 to utf8 translation, for example, in `src/index.js` just update the toUtf8 encoding operation:
```
const toUtf8 = async (record) => {
       // let utf8encoded = Buffer.from(record.data, 'base64').toString('utf8');  
       // chain a couple of regex operations as shown in the line below
        let utf8encoded = Buffer.from(record.data, 'base64').toString('utf8').replace(/[ \s]/g,'').replace(/[\r\n]/g,'')
        record.data = JSON.parse(utf8encoded);
        return record;
    };
``` 
- `test`: the test dir has a few files to demo the cleansing functionality, including a simple python based JSON -> Base64 String encoder in the test/utf8-to-base64-converter.py file. The plaintext JSON source of this dataset is in the test/utf8-example-payload.json, and the output of the base64 encoder has been copy/pasted in the test/base64-event-record.json which is structured to mimic a Kinesis Firehose payload. Since the main file is in Javascript, just invoke `npm install && npm test` from the root of this repo to install chai/mocha from package.json, and see the input/output logged to stdout.
