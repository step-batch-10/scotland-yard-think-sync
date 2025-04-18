export const combineObjects = (...objects) => {
  const result = [];

  for (const key in objects[0]) {
    const values = objects.map((obj) => obj[key]);
    result.push([key, ...values]);
  }

  return result;
};
