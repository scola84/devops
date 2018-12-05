import { Worker } from '@scola/worker';

export default class PostDigitaloceanActionsRequester extends Worker {
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
      method: 'POST',
      url: {
        hostname: 'api.digitalocean.com',
        path: `/v2/droplets/${options.id}/actions`
      }
    };

    this.pass(request, options.data);
  }
}
