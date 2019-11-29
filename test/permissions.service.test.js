const chai = require('chai');
const sinon = require('sinon');
const config = require('../lib/config');
const PermissionError = require('../lib/errors/permission.error');
const permissionService = require('../lib/services/permissions.service');
const um = require('../lib/services/datasources/authzv2.permissions');

chai.use(require('sinon-chai'));

const { expect } = chai;
const umConfig = {
  debug: true,
  applicationId: 'FAKEAPP',
  source: 'authzv2',
  sources: {
    um: {
      url: 'fakeurl',
      apikey: 'fakekey',
    },
  },
};

describe('permissions.service', () => {
  let sandbox;
  let umsstub;
  const fakeReq = {};
  beforeEach((done) => {
    sandbox = sinon.createSandbox();
    fakeReq.get = sandbox.stub().returns('faketoken');
    umsstub = sandbox.stub(um, 'getPermissions').resolves(['permission3', 'permission2', 'permission1']);
    done();
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('Configured', () => {
    sandbox.stub(config, 'getConfig').returns({ ...umConfig, debug: false });
    permissionService.getPermissions('faketoken');
    sinon.assert.called(umsstub);
  });
  it('Missing source', (done) => {
    sandbox.stub(config, 'getConfig').returns({ ...umConfig, source: false, debug: false });
    permissionService.getPermissions('faketoken').then((result) => {
      throw new Error("shouldn't resolve", result);
    }).catch((e) => {
      try {
        expect(e).to.be.instanceof(PermissionError);
        expect(e.message).to.eql('No source defined for permissions');
        done();
      } catch (err) {
        done(err);
      }
    });
  });
  it('invalid source', (done) => {
    sandbox.stub(config, 'getConfig').returns({ ...umConfig, source: 'invalid', debug: false });
    permissionService.getPermissions('faketoken').then((result) => {
      done(new Error("shouldn't resolve", result));
    }).catch((e) => {
      try {
        expect(e).to.be.instanceof(PermissionError);
        expect(e.message).to.eql('No valid datasource defined for permissions');
        done();
      } catch (err) {
        done(err);
      }
    });
  });
});
