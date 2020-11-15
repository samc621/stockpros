const chai = require("chai");
const expect = chai.expect;

const holidays = require("../helpers/holidays");

chai.should();

describe("Holidays", () => {
  describe("2020", () => {
    it("Should return the stock market holidays for 2020", () => {
      let result = holidays.calculateHolidays(2020);

      expect(result).to.have.property("newYearsDay").to.equal("01-01-2020");
      expect(result).to.have.property("mlkDay").to.equal("01-20-2020");
      expect(result)
        .to.have.property("washingtonsBirthday")
        .to.equal("02-17-2020");
      expect(result).to.have.property("goodFriday").to.equal("04-10-2020");
      expect(result).to.have.property("memorialDay").to.equal("05-25-2020");
      expect(result).to.have.property("independenceDay").to.equal("07-03-2020");
      expect(result).to.have.property("laborDay").to.equal("09-07-2020");
      expect(result).to.have.property("thanksgivingDay").to.equal("11-26-2020");
      expect(result).to.have.property("christmasDay").to.equal("12-25-2020");
    });
  });

  describe("2021", () => {
    it("Should return the stock market holidays for 2021", () => {
      let result = holidays.calculateHolidays(2021);

      expect(result).to.have.property("newYearsDay").to.equal("01-01-2021");
      expect(result).to.have.property("mlkDay").to.equal("01-18-2021");
      expect(result)
        .to.have.property("washingtonsBirthday")
        .to.equal("02-15-2021");
      expect(result).to.have.property("goodFriday").to.equal("04-02-2021");
      expect(result).to.have.property("memorialDay").to.equal("05-31-2021");
      expect(result).to.have.property("independenceDay").to.equal("07-05-2021");
      expect(result).to.have.property("laborDay").to.equal("09-06-2021");
      expect(result).to.have.property("thanksgivingDay").to.equal("11-25-2021");
      expect(result).to.have.property("christmasDay").to.equal("12-24-2021");
    });
  });

  describe("2022", () => {
    it("Should return the stock market holidays for 2022", () => {
      let result = holidays.calculateHolidays(2022);

      expect(result).to.have.property("newYearsDay").to.equal(null);
      expect(result).to.have.property("mlkDay").to.equal("01-17-2022");
      expect(result)
        .to.have.property("washingtonsBirthday")
        .to.equal("02-21-2022");
      expect(result).to.have.property("goodFriday").to.equal("04-15-2022");
      expect(result).to.have.property("memorialDay").to.equal("05-30-2022");
      expect(result).to.have.property("independenceDay").to.equal("07-04-2022");
      expect(result).to.have.property("laborDay").to.equal("09-05-2022");
      expect(result).to.have.property("thanksgivingDay").to.equal("11-24-2022");
      expect(result).to.have.property("christmasDay").to.equal("12-26-2022");
    });
  });
});
