
export function falsyValue<X> (item: X) {
    if (Array.isArray(item)) {
        if (item.length) {
            return false
        }
    } else if (item !== undefined && item !== null
        && typeof item === 'object') {
        if (Object.keys(item).length) {
            return false
        }
    } else if (item) {
        return false
    }

    return true
}

export function filterObject (func?: (...args: any[]) => any, items: Record<string, any> = {}) {
    const result: Record<string, any> = {}
    Object.keys(items).forEach((key) => {
        if (func) {
            if (func(items[key], key)) {
                result[key] = items[key]
            }
        } else if (!falsyValue(items[key])) {
            result[key] = items[key]
        }
    })

    return result
}

export function filterArray (func?: (...args: any[]) => any, items: Record<string, any> = {}) {
    if (func) {
        return items.filter(func)
    }
    const result = []
    for (let i = 0; i < items.length; i += 1) {
        const item = items[i]
        if (!falsyValue(item)) {
            result.push(item)
        }
    }

    return result
}