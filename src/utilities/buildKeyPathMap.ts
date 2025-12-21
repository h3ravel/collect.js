import { isArray, isObject } from './is'

export default function buildKeyPathMap<X> (items: X[]) {
    const keyPaths: Record<string, any> = {}

    items.forEach((item, index) => {
        function buildKeyPath (val: any, keyPath: string) {
            if (isObject(val)) {
                Object.keys(val).forEach((prop) => {
                    buildKeyPath(val[prop], `${keyPath}.${prop}`)
                })
            } else if (isArray(val)) {
                val.forEach((v, i) => {
                    buildKeyPath(v, `${keyPath}.${i}`)
                })
            }

            keyPaths[keyPath] = val
        }

        buildKeyPath(item, String(index))
    })

    return keyPaths
}