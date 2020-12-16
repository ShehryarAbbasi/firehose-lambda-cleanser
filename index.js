'use strict';

/**
 * @const {String[]} deleteTheseKeys - Delete these keys in the cleanser function
 */
const deleteTheseKeys = require('./properties-to-delete.js');

/**
 * @const {String[]} doNotDeleteTheseKeys - Ensure these keys are not deleted as they are needed by Kinesis Firehose
 */
const doNotDeleteTheseKeys = ['recordId', 'approximateArrivalTimestamp'];   


exports.handler = async (event) => {

/**
 * @param {Object} record - A JSON object from Kinesis Firehose with data: <val> in Base64
 * @return {Object} A JSON object with data: <val> in ASCII
 */
    const toUtf8 = async (record) => {
        let utf8encoded = Buffer.from(record.data, 'base64').toString('utf8');  
        record.data = JSON.parse(utf8encoded);
        return record;
    };

/**
 * @param {Object} obj - A JSON object with data: <val> in ASCII
 * @param {String[]} keys - Keys to remove from data: <val>
 * @return {Object} A cleansed JSON object with data: <val> in ASCII
 */
    const cleanser = async (obj,keys) => {
      // ensure we are not removing keys which are in the doNotDeleteTheseKeys Array
      keys = keys.filter((k) => !doNotDeleteTheseKeys.includes(k));

      // if array, then dive deeper by recursing
      if(obj instanceof Array) obj.forEach(item => cleanser(item,keys));

      // if object, then do the cleaning or recurse and try again
      else if(typeof obj === 'object') {
        Object.getOwnPropertyNames(obj).forEach(key => keys.indexOf(key) !== -1? delete obj[key] : cleanser(obj[key],keys));
      }
      
      return obj;
    };

/**
 * @param {Object} record - A JSON object with data: <val> in ASCII
 * @return {Object} A JSON object with data: <val> in Base64 to return back to Kinesis Firehose
 */
    const toB64 = async (record) => {
        let buff = Buffer.from(JSON.stringify(record.data));  
        let b64 = buff.toString('base64');
        record.data = b64;
        record.result = 'Ok'
        return record;
    };


/**
 * Orchestration using Promises, iterating over incoming data from a Kinesis Firehose payload, 
 * json = convert data: <val> from Base64 to ASCII,
 * cleansed = send JSON object for cleansing of data: <val>,
 * b64 = send JSON object to convert data: <val> back to Base64,
 * log how many records were processed in CloudWatch Logs,
 * @return {Object} JSON data to Kinesis Firehose
 */
  console.log("b64 records received: ", event.records.length);
  let json = await Promise.all(event.records.map(toUtf8));
  console.log("b64 toUtf8 conversions:", JSON.stringify(json,undefined,2));
  let cleansed = await Promise.all(json.map(n => cleanser(n, deleteTheseKeys)));
  console.log("cleansed json:", JSON.stringify(cleansed,undefined,2));
  console.log("records cleansed:", cleansed.length);
  let b64 = await Promise.all(cleansed.map(toB64));
  console.log(`Processing completed.  Successful records ${json.length}.`);
  return { records: b64};

};   
