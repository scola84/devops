import { Worker } from '@scola/worker';
import { parse } from 'bytes';

export default class DigitaloceanDropletsGetter extends Worker {
  static merge(box, data, responseData) {
    const mode = responseData.droplets ? 'multi' : 'single';

    const remotes = mode === 'multi' ?
      responseData.droplets : [responseData.droplet];

    const locals = mode === 'multi' ?
      data : [data];

    mergeLocals(locals, remotes);
    mergeRemotes(locals, remotes);

    return mode === 'multi' ? locals : locals.shift();
  }

  act(box, data) {
    const options = this.filter(box, data);

    this.check(options, ['token']);

    const token = this.sprintf('Bearer %(token)s', options);
    const path = this.sprintf('/v2/droplets%(droplet_id)s', options);

    const request = {
      extra: {
        box,
        data
      },
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      method: 'GET',
      url: {
        hostname: 'api.digitalocean.com',
        path,
        query: options.query
      }
    };

    this.pass(request);
  }
}

function mergeLocals(locals, remotes) {
  locals.forEach((local) => {
    let found = null;

    remotes.forEach((remote) => {
      if (remote.name === local.name) {
        found = remote;
      }
    });

    if (found === null) {
      local.vps.actions.create = true;
    }
  });
}

function mergeRemotes(locals, remotes) {
  remotes.forEach((remote) => {
    let found = null;

    locals.forEach((local) => {
      if (remote.name === local.name) {
        found = local;
      }
    });

    if (found !== null) {
      try {
        checkId(found, remote);
        checkStatus(found, remote);
        checkNetwork(found, remote);
        checkRegion(found, remote);
        checkSize(found, remote);
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
}

function checkId(local, remote) {
  local.vps.id = remote.id;
}

function checkNetwork(local, remote) {
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

function checkRegion(local, remote) {
  if (local.vps.region !== remote.region.slug) {
    throw new Error('Regiions do not match' +
      ` (local=${local.vps.region}, remote=${remote.region.slug})`);
  }
}

function checkSize(local, remote) {
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

function checkStatus(local, remote) {
  local.vps.status = remote.status;
}
