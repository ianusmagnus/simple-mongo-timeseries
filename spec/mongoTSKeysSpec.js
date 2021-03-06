describe('timeseries keys suite', function () {

    var mongoTSKeys = require('../lib/mongoTSKeys.js');
    var keyBuilderFactory;

    beforeEach(function () {
        keyBuilderFactory = mongoTSKeys.KeyBuilderFactory();
    });

    describe('Invalid sensor names', function () {

        var date = new Date('2015-11-25T18:32:21.196');

        it('should throw error', function () {
            var sensor = 'testXYZ:';
            expect(function () {
                keyBuilderFactory.fromNameAndDate(sensor, date);
            }).toThrow();
        });

        it('should throw error', function () {
            var sensor = 'test&123';
            expect(function () {
                keyBuilderFactory.fromNameAndDate(sensor, date);
            }).toThrow();
        });

        it('should throw error', function () {
            var sensor = 'test(123';
            expect(function () {
                keyBuilderFactory.fromNameAndDate(sensor, date);
            }).toThrow();
        });

        it('should throw error', function () {
            var sensor = '';
            expect(function () {
                keyBuilderFactory.fromNameAndDate(sensor, date);
            }).toThrow();
        });
    });

    describe('check output when constructed from sensor name and date ', function () {
        var sensor = 'testXYZ';
        var date = new Date('2015-11-25T18:32:21+01:00');
        var keyBuilder;

        beforeEach(function () {
            keyBuilder = keyBuilderFactory.fromNameAndDate(sensor, date);
        });

        it('generates correct sensor name', function () {
            expect(keyBuilder.getSensor()).toBe(sensor);
        });

        it('generates correct date', function () {
            expect(keyBuilder.getPeriod()).toEqual(date);
        });

        it('generates correct hour of day', function () {
            expect(keyBuilder.getHour()).toEqual(17);
        });

        it('generates correct timestamp of day', function () {
            expect(keyBuilder.getDayTimestamp()).toEqual(new Date('2015-11-25T00:00:00+00:00').getTime() / 1000);
        });

        it('generates correct decimal minute', function () {
            expect(keyBuilder.getDecimalMin()).toEqual(3);
        });

        it('generates correct key string for samples', function () {
            expect(keyBuilder.buildReadingString()).toEqual('testXYZ:R:1511251832');
        });

        it('generates correct key string for aggregated data', function () {
            expect(keyBuilder.buildAggregationString()).toEqual('testXYZ:A:151125');
        });

        it('generates correct regex search string', function () {
            expect(keyBuilder.buildRegex()).toEqual(/^testXYZ:R:15112518/);
        });

        it('generates correct regex search string', function () {
            expect(keyBuilder.buildRegexAllReadings()).toEqual(/^testXYZ:R:/);
        });

        it('generates correct regex search string', function () {
            expect(keyBuilder.buildRegexAllAggregations()).toEqual(/^testXYZ:A:/);
        });
    });

    describe('check output when constructed from key string', function () {
        var keyBuilder;

        beforeEach(function () {
            keyBuilder = keyBuilderFactory.fromKeyString('testABCD:R:1511241709');
        });

        it('generates correct sensor name', function () {
            expect(keyBuilder.getSensor()).toBe('testABCD');
        });

        it('generates correct date', function () {
            expect(keyBuilder.getPeriod()).toEqual(new Date('2015-11-24T17:09:00+00:00'));
        });

        it('generates correct hour of day', function () {
            expect(keyBuilder.getHour()).toEqual(17);
        });

        it('generates correct decimal minute', function () {
            expect(keyBuilder.getDecimalMin()).toEqual(0);
        });

        it('generates correct timestamp of day', function () {
            expect(keyBuilder.getDayTimestamp()).toEqual(new Date('2015-11-24T00:00:00+00:00').getTime() / 1000);
        });

        it('generates correct key string for samples', function () {
            expect(keyBuilder.buildReadingString()).toEqual('testABCD:R:1511241709');
        });

        it('generates correct key string for aggregated data', function () {
            expect(keyBuilder.buildAggregationString()).toEqual('testABCD:A:151124');
        });

        it('generates correct regex search string', function () {
            expect(keyBuilder.buildRegex()).toEqual(/^testABCD:R:15112417/);
        });

        it('generates correct regex search string', function () {
            expect(keyBuilder.buildRegexAllReadings()).toEqual(/^testABCD:R:/);
        });

        it('generates correct regex search string', function () {
            expect(keyBuilder.buildRegexAllAggregations()).toEqual(/^testABCD:A:/);
        });
    });

    describe('check output when constructed from other builder', function () {

        var otherKeyBuilder;
        var newKeyBuilder;

        beforeEach(function () {
            otherKeyBuilder = keyBuilderFactory.fromKeyString('testABCD:R:1511272145');
            newKeyBuilder = keyBuilderFactory.increaseHour(otherKeyBuilder);
        });

        it('other builder sensor name', function () {
            expect(otherKeyBuilder.getSensor()).toBe('testABCD');
        });

        it('other builder date', function () {
            expect(otherKeyBuilder.getPeriod()).toEqual(new Date('2015-11-27T21:45:00+00:00'));
        });

        it('other builder hour of day', function () {
            expect(otherKeyBuilder.getHour()).toEqual(21);
        });

        it('new builder timestamp of day', function () {
            expect(newKeyBuilder.getDayTimestamp()).toEqual(new Date('2015-11-27T00:00:00+00:00').getTime() / 1000);
        });

        it('new builder sensor', function () {
            expect(newKeyBuilder.getSensor()).toBe('testABCD');
        });

        it('new builder date', function () {
            expect(newKeyBuilder.getPeriod()).toEqual(new Date('2015-11-27T22:45:00+00:00'));
        });

        it('new builder hour', function () {
            expect(newKeyBuilder.getHour()).toEqual(22);
        });

        it('new builder timestamp of day', function () {
            expect(newKeyBuilder.getDayTimestamp()).toEqual(new Date('2015-11-27T00:00:00+00:00').getTime() / 1000);
        });
    });

});
