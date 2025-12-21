'use strict'

/**
 * Get value of a nested property
 *
 * @param mainObject
 * @param key
 */
export default function nestedValue (mainObject: any, key: any) {
  try {
    return key.split('.').reduce((obj: any, property: any) => obj[property], mainObject)
  } catch {
    // If we end up here, we're not working with an object, and @var mainObject is the value itself
    return mainObject
  }
}
