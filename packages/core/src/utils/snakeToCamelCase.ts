export const snakeToCamelCase = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => snakeToCamelCase(item));
  }

  return Object.keys(obj).reduce((acc: any, key) => {
    const camelKey = key
      .replace(/(_\w)/g, (match) => match.charAt(1).toUpperCase())
      .replace(/^(.)/, (letter) => letter.toLowerCase());
    const value = obj[key];

    if (value !== null && typeof value === 'object') {
      acc[camelKey] = snakeToCamelCase(value);
    } else {
      acc[camelKey] = value;
    }

    return acc;
  }, {});
};
