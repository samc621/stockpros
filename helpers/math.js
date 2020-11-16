exports.average = (values, numValues) => {
  const total = values.reduce((a, b) => {
    return a + b;
  }, 0);
  return (total / numValues).toFixed(2);
};

exports.high = values => {
  return Math.max(...values).toFixed(2);
};

exports.low = values => {
  return Math.min(...values).toFixed(2);
};

exports.cagr = (bv, ev, years) => {
  return Number(Math.pow(ev / bv, 1 / years) - 1).toFixed(4);
};

exports.percentageDifference = (a, b) => {
  return (b - a) / a;
};

exports.everyNth = (arr, nth) => arr.filter((e, i) => i % nth === nth - 1);
