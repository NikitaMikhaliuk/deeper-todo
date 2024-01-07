export function urlToName(name: string) {
    return name.split('-').join(' ');
}

export function nameToUrl(name: string) {
    return '/' + name.split(' ').join('-');
}

export function groupBy<T>(
    items: Array<T>,
    callbackFn: (value: T, index?: number) => string | symbol
) {
    return items.reduce((groupedItems, item, index) => {
        const groupKey = callbackFn(item, index);
        if (!groupedItems[groupKey]) {
            groupedItems[groupKey] = [];
        }
        groupedItems[groupKey].push(item);
        return groupedItems;
    }, {} as Record<string | symbol, T[]>);
}
