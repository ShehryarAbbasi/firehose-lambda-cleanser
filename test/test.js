'use strict';

const chai = require('chai');
const mocha = require('mocha');
const expect = chai.expect;


const lambda = require('../src/index.js');
const event = require('./base64_event_record.json')

// Test the end-to-end flow of cleanser function
describe('entire flow', () => {
    it('should return successful response', async () => {
        let handler = await lambda.handler(event)
        return expect(handler.records[0].result).to.be.an('string').that.includes('Ok')
    })
})
