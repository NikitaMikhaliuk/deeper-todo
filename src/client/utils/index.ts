export function urlToName(name: string) {
    return name.split('-').join(' ');
}

export function nameToUrl(name: string) {
    return '/' + name.split(' ').join('-');
}
