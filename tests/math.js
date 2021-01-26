const chai = require('chai');

const { expect } = chai;

const math = require('../helpers/math');

chai.should();

describe('Math', () => {
  const integers = [18, 6, 16, 12, 9, 20, 3, 2, 11, 4];

  describe('Average', () => {
    it('Should return the average for the integer set', () => {
      const result = math.average(integers, integers.length);

      expect(result).to.equal('10.10');
    });
  });

  describe('High', () => {
    it('Should return the high for the integer set', () => {
      const result = math.high(integers);

      expect(result).to.equal('20.00');
    });
  });

  describe('Low', () => {
    it('Should return the low for the integer set', () => {
      const result = math.low(integers);

      expect(result).to.equal('2.00');
    });
  });

  describe('CAGR', () => {
    it('Should return the compound annual growth rate between two values for n years', () => {
      const result = math.cagr(10, 100, 3);

      expect(result).to.equal('1.1544');
    });
  });

  describe('Percentage Difference', () => {
    it('Should return the percentage difference between two numbers', () => {
      const result = math.percentageDifference(100, 95);

      expect(result).to.equal(-0.05);
    });
  });

  describe('Every Nth', () => {
    it('Should return every nth value from the integer set', () => {
      const result = math.everyNth(integers, 2);

      expect(result[0]).to.equal(6);
      expect(result[1]).to.equal(12);
      expect(result[2]).to.equal(20);
      expect(result[3]).to.equal(2);
      expect(result[4]).to.equal(4);
    });
  });
});
