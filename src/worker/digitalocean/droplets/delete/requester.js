import { Worker } from '@scola/worker';

export default class DeleteDigitaloceanDropletRequester extends Worker {
  act(box, data) {
    const options = this.filter(box, data);

    const request = {
      extra: {
        box,
        data
      },
      headers: {
        'Authorization': `Bearer ${options.token}`,
        'Content-Type': 'application/json'
      },
      method: 'DELETE',
      url: {
        hostname: 'api.digitalocean.com',
        path: `/v2/droplets/${options.id}`
      }
    };

    this.pass(request);
  }
}
