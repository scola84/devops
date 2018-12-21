import { Worker } from '@scola/worker';

export default class DigitaloceanDropletsPoster extends Worker {
  act(box, data) {
    const {
      request,
      requestData
    } = this.filter(box, data);

    const path = this.stringify('/', [
      '/v2/droplets',
      request.droplet_id,
      request.droplet_id ? 'actions' : null
    ]);

    const token = this.stringify('Bearer %(token)s', request);

    this.pass({
      extra: {
        box,
        data
      },
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      url: {
        hostname: 'api.digitalocean.com',
        path
      }
    }, requestData);
  }
}
