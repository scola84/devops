import DeleteDigitaloceanDropletParser from './digitalocean/droplets/delete/parser';
import DeleteDigitaloceanDropletRequester from './digitalocean/droplets/delete/requester';
import GetDigitaloceanDropletsParser from './digitalocean/droplets/get/parser';
import GetDigitaloceanDropletsRequester from './digitalocean/droplets/get/requester';
import GetDigitaloceanFloatingipsParser from './digitalocean/floatingips/get/parser';
import GetDigitaloceanFloatingipsRequester from './digitalocean/floatingips/get/requester';
import PostDigitaloceanDropletsParser from './digitalocean/droplets/post/parser';
import PostDigitaloceanDropletsRequester from './digitalocean/droplets/post/requester';
import PostDigitaloceanFloatingipsParser from './digitalocean/floatingips/post/parser';
import PostDigitaloceanFloatingipsRequester from './digitalocean/floatingips/post/requester';

export {
  DeleteDigitaloceanDropletRequester,
  DeleteDigitaloceanDropletParser,
  GetDigitaloceanDropletsParser,
  GetDigitaloceanDropletsRequester,
  GetDigitaloceanFloatingipsParser,
  GetDigitaloceanFloatingipsRequester,
  PostDigitaloceanDropletsParser,
  PostDigitaloceanDropletsRequester,
  PostDigitaloceanFloatingipsParser,
  PostDigitaloceanFloatingipsRequester
};
