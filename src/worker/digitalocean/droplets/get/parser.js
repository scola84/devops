import { Worker } from '@scola/worker';
import { parse } from 'bytes';

export default class GetDigitaloceanDropletsParser extends Worker {
  act(response, data, callback) {
    const extra = response.request.extra;
    const box = extra.box;

    const remotes = data.droplets ? data.droplets : [data.droplet];
    const locals = this.filter(box, extra.data);

    locals.forEach((local) => {
      let found = null;

      remotes.forEach((remote) => {
        if (remote.name === local.name) {
          found = remote;
        }
      });

      if (found === null) {
        local.vps.actions.create = true;
      } else {
        this.merge(box, data, local);
      }
    });

    remotes.forEach((remote) => {
      let found = null;

      locals.forEach((local) => {
        if (remote.name === local.name) {
          found = local;
        }
      });

      if (found !== null) {
        try {
          this._check(found, remote);
        } catch (error) {
          found.vps.status = 'error';
          found.error = error;
        }
      } else {
        locals.push({
          vps: {
            actions: {
              remove: true
            },
            id: remote.id
          }
        });
      }
    });

    this.pass(box, locals, callback);
  }

  err(response, error, callback) {
    const extra = response.request.extra;
    const box = extra.box;

    error.data = extra.data;

    this.fail(box, error, callback);
  }

  _check(local, remote) {
    this._checkId(local, remote);
    this._checkStatus(local, remote);
    this._checkNetwork(local, remote);
    this._checkRegion(local, remote);
    this._checkSize(local, remote);
  }

  _checkId(local, remote) {
    local.vps.id = remote.id;
  }

  _checkNetwork(local, remote) {
    const v4 = remote.networks.v4 || [];
    const map = { public: 'eth0', private: 'eth1' };
    let ifc = null;

    v4.forEach((network) => {
      ifc = map[network.type];

      if (local.vps.networks.v4[ifc]) {
        if (local.vps.networks.v4[ifc] !== network.ip_address) {
          throw new Error('IP addresses do not match' +
            ` (local=${local.vps.networks.v4[ifc]}` +
            `, remote=${network.ip_address})`);
        }
      }

      local.vps.networks.v4[ifc] = network.ip_address;
    });

    if (local.vps.networks.v4.eth1 === '') {
      if (remote.region.features.indexOf('private_networking') === -1) {
        throw new Error('Private networking not available' +
          ` (remote=${remote.region.features})`);
      }

      local.vps.actions.enable_private_networking = true;
    }
  }

  _checkRegion(local, remote) {
    if (local.vps.region !== remote.region.slug) {
      throw new Error('Regiions do not match' +
        ` (local=${local.vps.region}, remote=${remote.region.slug})`);
    }
  }

  _checkSize(local, remote) {
    if (local.vps.size !== remote.size_slug) {
      if (remote.region.sizes.indexOf(local.vps.size) === -1) {
        throw new Error('Size not available' +
          ` (local=${local.vps.size}, remote=${remote.region.sizes})`);
      }

      const [, , localSize] = local.vps.size.split('-');
      const [, , remoteSize] = remote.size_slug.split('-');

      if (parse(localSize) < parse(remoteSize)) {
        throw new Error('Size cannot be decreased' +
          ` (local=${localSize}, remote=${remoteSize})`);
      }

      local.vps.actions.resize = true;
    }
  }

  _checkStatus(local, remote) {
    local.vps.status = remote.status;
  }
}
