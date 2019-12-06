const chai = require('chai');
const sinon = require('sinon');

chai.use(require('sinon-chai'));

const { expect } = chai;
const config = require('../lib/config');
const logginghelper = require('../lib/helper/logging.helper');
const errorMessages = require('../lib/errors/error.messages');

describe('Config', () => {
  let sandbox;
  beforeEach((done) => {
    sandbox = sinon.createSandbox();
    done();
  });
  afterEach(() => {
    sandbox.restore();
  });
  it('setConfig({}) shouldn`t be overridden', () => {
    expect(config.setConfig({ ok: 'ok' })).to.eql({ ok: 'ok', set: true });
    expect(config.setConfig({ ok: 'okk' })).to.eql({ ok: 'ok', set: true });
    expect(config.getConfig()).to.eql({ ok: 'ok', set: true });
  });
  it('setConfig({}, true) with force should override', () => {
    expect(config.setConfig({ ok: 'ok' })).to.eql({ ok: 'ok', set: true });
    expect(config.setConfig({ ok: 'okk' }, true)).to.eql({ ok: 'okk', set: true });
    expect(config.getConfig()).to.eql({ ok: 'okk', set: true });
  });
  it('Double setConfig({}) should log error in debugmodus', () => {
    const logging = sandbox.spy(logginghelper.logger, 'error');
    const oldconfig = config.getConfig();
    expect(config.setConfig(oldconfig)).to.eql(oldconfig);
    expect(config.setConfig({ ok: 'okk', debug: true })).to.eql(oldconfig);
    sinon.assert.calledWith(logging, errorMessages.DOUBLE_CONFIG);
  });
  it('Double setConfig({}, true) force should log warn in debugmodus', () => {
    const logging = sandbox.spy(logginghelper.logger, 'warn');
    expect(config.setConfig({ ok: 'okk', debug: true }, true)).to.eql({ ok: 'okk', set: true, debug: true });
    sinon.assert.calledWith(logging, errorMessages.FORCE_CONFIG);
  });
});
