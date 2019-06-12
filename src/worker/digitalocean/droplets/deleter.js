import { Worker } from '@scola/worker';

export default class DigitaloceanDropletDeleter extends Worker {
  act(box, data) {
    const { request } = this.filter(box, data);

    const path = this.stringify('/', [
      '/v2/droplets',
      request.droplet_id
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
      method: 'DELETE',
      url: {
        hostname: 'api.digitalocean.com',
        path
      }
    });
  }
}
