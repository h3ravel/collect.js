'use strict'

type X = any

export const isArray = <K> (item: X): item is K[] => Array.isArray(item)

export const isObject = <K> (item: X): item is Record<string, K> => typeof item === 'object' && Array.isArray(item) === false && item !== null

export const isFunction = (item: X): item is ((...args: any[]) => any) => typeof item === 'function'
