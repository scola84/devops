export default function createFilter(value = '.*') {
  // https://stackoverflow.com/a/406408
  value = value.replace(/\\(.)/g, '$1');

  value = value[0] === '?' ?
    new RegExp(`^((${value}).)*$`, 'i') :
    new RegExp(value, 'i');

  return value;
}
