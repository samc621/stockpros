const chai = require("chai");
const expect = chai.expect;

const math = require("../helpers/math");

chai.should();

describe("Math", () => {
  const integers = [18, 6, 16, 12, 9, 20, 3, 2, 11, 4];

  describe("Average", () => {
    it("Should return the average for the integer set", () => {
      let result = math.average(integers, integers.length);

      expect(result).to.equal("10.10");
    });
  });

  describe("High", () => {
    it("Should return the high for the integer set", () => {
      let result = math.high(integers);

      expect(result).to.equal("20.00");
    });
  });

  describe("Low", () => {
    it("Should return the low for the integer set", () => {
      let result = math.low(integers);

      expect(result).to.equal("2.00");
    });
  });

  describe("CAGR", () => {
    it("Should return the compound annual growth rate between two values for n years", () => {
      let result = math.cagr(10, 100, 3);

      expect(result).to.equal("1.1544");
    });
  });

  describe("Percentage Difference", () => {
    it("Should return the percentage difference between two numbers", () => {
      let result = math.percentageDifference(100, 95);

      expect(result).to.equal(-0.05);
    });
  });
});
