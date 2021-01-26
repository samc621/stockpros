exports.average = (values, numValues) => {
  const total = values.reduce((a, b) => a + b, 0);
  return (total / numValues).toFixed(2);
};

exports.high = (values) => Math.max(...values).toFixed(2);

exports.low = (values) => Math.min(...values).toFixed(2);

exports.cagr = (bv, ev, years) => Number(((ev / bv) ** (1 / years)) - 1).toFixed(4);

exports.percentageDifference = (a, b) => (b - a) / a;

exports.everyNth = (arr, nth) => arr.filter((e, i) => i % nth === nth - 1);
