export function urlToName(name) {
  return name.split('-').join(' ');
}

export function nameToUrl(name) {
  return '/' + name.split(' ').join('-');
}