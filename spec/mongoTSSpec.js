describe('timeseries suite', function () {

  // mongo connection string needs to be set on environment
  // MONGODB=mongodb://localhost:27017/test01
  if (!process.env.MONGODB) {
    console.log('Skipping tests. MONGODB not set.');
    return;
  }

  var ts;
  var moment = require('moment');

  beforeEach(function (done) {

   var options = {
     connectionString: process.env.MONGODB,
     collection: 'test'
   };

    var mongoTS = require('../lib/mongoTS.js');

    mongoTS(options).connect().then(function (result) {
      ts = result;
    }).then(function () {
      return ts.reset();
    }).then(function () {
      done();
    }).done();



  });

  afterEach(function (done) {
/*
    ts.reset().then(function () {
      return ts.close();
    }).then(function () {
      done();
    }).done();
*/

    return ts.close().then(function () {
      done();
    }).done();

  });

  describe('simple store and read', function () {

    it('stores a sample and checks the returned key', function (done) {
      var date = new Date('2015-12-05T15:24:00');
      ts.storeReading('test0001', 1, date).then(function (result) {
        expect(result).toBe('test0001:R:1512051624');
      }).then(function () {
        done();
      }).done();
    });

    it('stores 2 samples and checks if latest is returned', function (done) {
      var sensor = 'test0001';

      var date = new Date('2015-12-05T15:24:00');
      var value = 123456.78;

      var date2 = new Date('2015-12-05T15:25:00');
      var value2 = 9876.54;

      ts.storeReading(sensor, value, date).then(function () {
        return ts.storeReading(sensor, value2, date2);
      }).then(function () {
        return ts.selectLastSample(sensor);
      }).then(function (result) {
        expect(result.sensor).toBe(sensor);
        expect(result.data[0].value).toBe(value2);
      }).then(function () {
        done();
      }).done();
    });

  });


  describe('mongoTSAggregation tests', function () {

    var sensor = 'test00001';

    var storeUntil = function(sensor, date, until, done) {
      //console.log('#########: ' + date);
      ts.storeReading(sensor, 10, date).then(function() {
        return ts.storeReading(sensor, 15, date);
      }).then(function() {
        return ts.storeReading(sensor, 20, date);
      }).then(function() {
        var newDate = new Date(date.getTime() + (60 * 1000));
        if (until(newDate)) {
          done();
        } else {
          storeUntil(sensor, newDate, until, done);
        }
      }).done();
    };

    beforeEach(function (done) {


      var dateStart =  moment('2016-01-01 00:00:00+00:00').toDate();
      var dateStop = moment('2016-01-03 00:00:00+00:00').toDate();

      storeUntil(sensor, dateStart, function(date) {
        return date > dateStop;
      }, done);

    });

    it('checks the 10min mongoTSAggregation', function (done) {
      ts.aggregateSensor(sensor).then(function () {

        var fromDate =  moment('2016-01-01 22:32:00+00:00').toDate();
        var toDate = moment('2016-01-02 01:11:00+00:00').toDate();

        return ts.selectAggregationBy10Min(sensor, fromDate, toDate);
      }).then(function (result) {

        expect(result.sensor).toBe(sensor);

        expect(result.data.length).toBe(16);

        expect(result.data[0].min).toBe(10);
        expect(result.data[0].max).toBe(20);
        expect(result.data[0].value).toBe(15);

        done();
      }).done();
    });

    it('checks the hour mongoTSAggregation', function (done) {
      ts.aggregateSensor(sensor).then(function () {

        var fromDate =  moment('2016-01-01 22:32:00+00:00').toDate();
        var toDate = moment('2016-01-02 01:11:00+00:00').toDate();

        return ts.selectAggregationByHour(sensor, fromDate, toDate);
      }).then(function (result) {

        expect(result.sensor).toBe(sensor);

        expect(result.data.length).toBe(3);

        expect(result.data[0].min).toBe(10);
        expect(result.data[0].max).toBe(20);
        expect(result.data[0].value).toBe(15);

        done();
      }).done();
    });
  });

});

