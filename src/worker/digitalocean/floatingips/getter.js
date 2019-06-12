import { Worker } from '@scola/worker';

export default class DigitaloceanFloatingipsGetter extends Worker {
  static merge(box, data, responseData) {
    return merge(box, data, responseData);
  }

  act(box, data) {
    const { request } = this.filter(box, data);

    const path = this.stringify('/', [
      '/v2/floating_ips',
      request.ip
    ]);

    const token = this.stringify('Bearer %(token)s', request);

    this.pass({
      extra: {
        box,
        data
      },
      headers: {
        'Authorization': token,
        'Connection': 'close',
        'Content-Type': 'application/json'
      },
      method: 'GET',
      url: {
        hostname: 'api.digitalocean.com',
        path
      }
    });
  }
}

function merge(box, data, responseData) {
  const ip = responseData.floating_ip;

  if (ip.droplet === null || ip.droplet.id !== data.server.id) {
    data.server.actions.assign_floating_ip = true;
  }

  return data;
}
