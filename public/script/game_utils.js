export const combineObjects = (obj1, ...objs) => {
  const result = [];

  for (const key in obj1) {
    const value = obj1[key];
    const values = objs.map((obj) => obj[key]);
    result.push([key, value, ...values]);
  }

  return result;
};
