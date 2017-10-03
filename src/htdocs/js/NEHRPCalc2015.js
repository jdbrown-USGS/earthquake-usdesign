'use strict';

var
// var Model = require('../../../node_modules/hazdev-webutils/src/mvc/Model'),
//     Util = require('../../../node_modules/hazdev-webutils/src/util/Util'),
//
//     LookupDataFactory = require('./util/LookupDataFactory'),
    extend = require('extend'),
    SiteAmplification = require('./util/SiteAmplification');


const Util = {extend: extend};
var _DEFAULTS = {

};


var NEHRPCalc2015 = function (params) {
  var _this,
      _initialize,

      _lookupDataFactory,
      _siteAmplification;

  _this = {};

  _initialize = function (params) {
    _siteAmplification = SiteAmplification();
    params = Util.extend({}, _DEFAULTS, params);

    // _lookupDataFactory = params.lookupDataFactory;

    if (!_lookupDataFactory) {
      // _lookupDataFactory = LookupDataFactory();
    }
  };

  /**
   * Interpolates results
   * @param variable {int, int, int, int, int}
   */
  _this.interpolateResults = function (d0, d1, x, x0, x1, log) {
    var key,
        result;

    result = {};

    for (key in d0) {
      if (d0.hasOwnProperty(key) && d1.hasOwnProperty(key)) {
        result[key] =
            _this.interpolateValue(d0[key], d1[key], x, x0, x1, log);
      }
    }
    return result;
  };

  /**
   * Interpolates a single value logs y values before interpolation
   * if linerlog is passed in.
   * @param variable {int, int, int, int, int, string}
   *                 interpolation values
   */
  _this.interpolateValue = function (y0, y1, x, x0, x1, log) {
    var value;

    if (log === 'linearlog') {
      if (y0 === 0 || y1 === 0) {
        throw new Error('Can not get the log of 0 Y values.');
      } else {
        y0 = Math.log(y0);
        y1 = Math.log(y1);
        value = Math.exp(y0 + (((y1-y0)/(x1-x0))*(x-x0)));
      }
    } else {
      value = y0 + (((y1-y0)/(x1-x0))*(x-x0));
    }
    return value;
  };

  /**
   * Factor hazard value for max direction. Period 0.2
   *
   * @param Object {calculation}
   *                    takes a calculation
   */
  _this.getSsuh = function (calculation) {
    var metadata,
        result,
        ssuh;

    result = _this.getResult(calculation);
    ssuh = result.ssuh || null; //.get('ssuh');
    if (ssuh === null) {
      metadata = calculation.output.metadata; // calculation.get('output').get('metadata');
      // ssuh = metadata.get('max_direction_ss') * result.get('mapped_ss');
      ssuh = metadata.max_direction_ss * result.mapped_ss;

      // result.set({
      //   'ssuh': ssuh
      // });
      result.ssuh = ssuh;
    }
    return ssuh;
  };

  /**
   * Factor hazard value for max direction. Period 1.0
   *
   * @param Object {calculation}
   *                    takes a calculation
   */
  _this.getS1uh = function (calculation) {
    var metadata,
        result,
        s1uh;

    result = _this.getResult(calculation);
    s1uh = result.s1uh || null; // .get('s1uh');

    if (s1uh === null) {
      metadata = calculation.output.metadata; // calculation.get('output').get('metadata');
      s1uh = metadata.max_direction_s1 * result.mapped_s1; // metadata.get('max_direction_s1') * result.get('mapped_s1');

      // result.set({
      //   's1uh': s1uh
      // });
      result.s1uh = s1uh;
    }
    return s1uh;
  };

  /**
   * Convert uniform hazard to uniform risk. Period 0.2
   *
   * @param Object {calculation}
   *                    takes a calculation
   */
  _this.getSsur = function (calculation) {
    var result;

    result = _this.getResult(calculation);

    return _this.getSsuh(calculation) * result.crs; // result.get('crs');
  };

  /**
   * Convert uniform hazard to uniform risk. Period 1.0
   *
   * @param Object {calculation}
   *                    takes a calculation
   */
  _this.getS1ur = function (calculation) {
    var result;

    result = _this.getResult(calculation);

    return _this.getS1uh(calculation) * result.cr1; // result.get('cr1');
  };

  /**
   * Factor deterministic acceleration values Ssd.
   *  pgdv84 = 84th-Percentile Geomean Deterministic value
   *  maxD84 = Maximum Direction 84th-Percentile Deterministic value
   *
   * @param Object {calculation}
   *                    takes a calculation
   */
  _this.getSsd = function (calculation) {
    var geomeanSsd,
        maxD84,
        metadata,
        pgdv84,
        result,
        ssd;

    result = _this.getResult(calculation);
    ssd = result.ssd || null; // get('ssd');
    if (ssd === null) {
      metadata = calculation.output.metadata; // calculation.get('output').get('metadata');
      geomeanSsd = result.geomean_ssd; // get('geomean_ssd');
      pgdv84 = metadata.percentile_ss * geomeanSsd; // metadata.get('percentile_ss') * geomeanSsd;
      maxD84 = metadata.max_direction_ss * pgdv84; // get('max_direction_ss') * pgdv84;

      // ssd = Math.max(maxD84, metadata.get('deterministic_floor_ss'));
      ssd = Math.max(maxD84, metadata.deterministic_floor_ss);
      // result.set({
      //   'ssd': ssd
      // });
      result.ssd = ssd;
    }
    return ssd;
  };

  /**
   * Factor deterministic acceleration values Ssd.
   *  pgdv841 = 84th-Percentile Geomean Deterministic value
   *  maxD841 = Maximum Direction 84th-Percentile Deterministic value
   *
   * @param Object {calculation}
   *                    takes a calculation
   */
  _this.getS1d = function (calculation) {
    var geomeanS1d,
        maxD841,
        metadata,
        pgdv841,
        result,
        s1d;

    result = _this.getResult(calculation);
    // s1d = result.get('s1d');
    s1d = result.s1d || null;

    if (s1d === null) {
      // metadata = calculation.get('output').get('metadata');
      metadata = calculation.output.metadata;
      // geomeanS1d = result.get('geomean_s1d');
      geomeanS1d = result.geomean_s1d;
      // pgdv841 = metadata.get('percentile_s1') * geomeanS1d;
      pgdv841 = metadata.percentile_s1 * geomeanS1d;
      // maxD841 = metadata.get('max_direction_s1') * pgdv841;
      maxD841 = metadata.max_direction_s1 * pgdv841;

      // s1d = Math.max(maxD841, metadata.get('deterministic_floor_s1'));
      s1d = Math.max(maxD841, metadata.deterministic_floor_s1);
      // result.set({
      //   's1d': s1d
      // });
      result.s1d = s1d;
    }
    return s1d;
  };

  /**
   * Compare 0.2 risk-targeted probabilisic spectral acceleration
   * values with Ssd. Use minimuim value from each pair.
   *
   * @param Object {calculation}
   *                    takes a calculation
   */
  _this.getSs = function (calculation, silent) {
    var result,
        ss;

    result = _this.getResult(calculation);
    // ss = result.get('ss');
    ss = result.ss || null;

    if (ss === null) {
      ss = Math.min(_this.getSsur(calculation),
          _this.getSsd(calculation));
      // result.set({
      //   'ss': ss
      // }, {silent: silent});
      result.ss = ss;
    }
    return ss;
  };

  /**
   * Compare 1.0 risk-targeted probabilisic spectral acceleration
   * values with S1d. Use minimuim value from each pair.
   *
   * @param Object {calculation}
   *                    takes a calculation
   */
  _this.getS1 = function (calculation) {
    var result,
        s1;

    result = _this.getResult(calculation);
    // s1 = result.get('s1');
    s1 = result.s1 || null;

    if (s1 === null) {
      s1 = Math.min(_this.getS1ur(calculation),
          _this.getS1d(calculation));
      // result.set({
      //   's1': s1
      // });
      result.s1 = s1;
    }
    return s1;
  };

  /**
   * Uses SiteAmplification tables to get fa values.
   *
   * @param Object {calculation}
   *                    takes a calculation
   */
  _this.getFa = function (calculation) {
    var fa,
        result,
        siteClass;

    result = _this.getResult(calculation);
    // fa = result.get('fa');
    fa = result.fa || null;


    if (fa === null) {
      siteClass = _this.getSiteClass(calculation);
      fa = _siteAmplification.getFa(_this.getSs(calculation),
          // siteClass.get('value'));
          siteClass.value);
      // result.set({
      //   'fa': fa
      // });
      result.fa = fa;
    }
    return fa;
  };

  /**
   * Uses SiteAmplification tables to get fv values.
   *
   * @param Object {calculation}
   *                    takes a calculation
   */
  _this.getFv = function (calculation) {
    var fv,
        result,
        siteClass;

    result = _this.getResult(calculation);
    // fv = result.get('fv');
    fv = result.fv || null;

    if (fv === null) {
      siteClass = _this.getSiteClass(calculation);
      fv = _siteAmplification.getFv(_this.getS1(calculation),
          // siteClass.get('value'));
          siteClass.value);
      // result.set({
      //   'fv': fv
      // });
      result.fv = fv;
    }
    return fv;
  };

  /**
   * Site-adjusted MCEr spectral acceleration values Sms.
   *
   * @param Object {calculation}
   *                    takes a calculation
   */
  _this.getSms = function (calculation) {
    var result,
        sms;

    result = _this.getResult(calculation);
    // sms = result.get('sms');
    sms = result.sms || null;

    if (sms === null) {
      sms = _this.getFa(calculation) * _this.getSs(calculation);
      // result.set({
      //   'sms': sms
      // });
      result.sms = sms;
    }
    return sms;
  };

  /**
  * Site-adjusted MCEr spectral acceleration values Sm1.
  *
  * @param Object {calculation}
  *                    takes a calculation
  */
  _this.getSm1 = function (calculation) {
    var result,
        sm1;

    result = _this.getResult(calculation);
    // sm1 = result.get('sm1');
    sm1 = result.sm1 || null;

    if (sm1 === null) {
      sm1 = _this.getFv(calculation) * _this.getS1(calculation);
      // result.set({
      //   'sm1': sm1
      // });
      result.sm1 = sm1;
    }
    return sm1;
  };

  /**
  * Multiply Sms by 2/3 to get the design value Sds.
  *
  * @param Object {calculation}
  *                    takes a calculation
  */
  _this.getSds = function (calculation) {
    var result,
        sds;

    result = _this.getResult(calculation);
    // sds = result.get('sds');
    sds = result.sds;

    if (sds === null) {
      sds = (2/3) * _this.getSms(calculation);
      // result.set({
      //   'sds': sds
      // });
      result.sds = sds;
    }
    return sds;
  };

  /**
  * Multiply Sm1 by 2/3 to get the design value Sda
  *
  * @param Object {calculation}
  *                    takes a calculation
  */
  _this.getSd1 = function (calculation) {
    var result,
        sd1;

    result = _this.getResult(calculation);
    // sd1 = result.get('sd1');
    sd1 = result.sd1;

    if (sd1 === null) {
      sd1 = (2/3) * _this.getSm1(calculation);
      // result.set({
      //   'sd1': sd1
      // });
      result.sd1 = sd1;
    }
    return sd1;
  };

  /**
   * Calculates the Probabilistic PGA and Deterministic PGA values to
   * get the PGA value.
   *
   * @param Object {calculation}
   *                    takes a calculation
   */
  _this.getPga = function (calculation) {
    var deterministicPga,
        metadata,
        pga,
        probabilisticPga,
        result;

    result = _this.getResult(calculation);
    // pga = result.get('pga');
    pga = result.pga || null;

    if (pga === null) {
      // metadata = calculation.get('output').get('metadata');
      metadata = calculation.output.metadata;

      // probabilisticPga = result.get('mapped_pga');
      probabilisticPga = result.mapped_pga;

      // deterministicPga = result.get('geomean_pgad')  *
      //     metadata.get('percentile_pga');
      deterministicPga = result.geomean_pgad * metadata.percentile_pga;
      // deterministicPga = Math.max(deterministicPga,
      //     metadata.get('deterministic_floor_pga'));
      deterministicPga = Math.max(deterministicPga, metadata.deterministic_floor_pga);

      pga = Math.min(probabilisticPga, deterministicPga);
      // result.set({
      //   'pga': pga
      // });
      result.pga = pga;
    }
    return pga;
  };

  /**
   * Fpga is pulled from a table in SiteAmplification and used to get
   * the PGAm value.
   *
   * @param Object {calculation}
   *                    takes a calculation
   */
  _this.getFpga = function (calculation) {
    var fpga,
        result,
        siteClass;

    result = _this.getResult(calculation);
    // fpga = result.get('fpga');
    fpga = result.fpga || null;

    if (fpga === null) {
      siteClass = _this.getSiteClass(calculation);
      fpga = _siteAmplification.getFpga(_this.getPga(calculation),
          // siteClass.get('value'));
          siteClass.value);
      // result.set({
      //   'fpga': fpga
      // });
      result.fpga = fpga;
    }
    return fpga;
  };

  /**
   * Fpga is used to get the Pgam value.
   *
   * @param Object {calculation}
   *                    takes a calculation
   */
  _this.getPgam = function (calculation) {
    var pgam,
        result;

    result = _this.getResult(calculation);
    // pgam = result.get('pgam');
    pgam = result.pgam || null;

    if (pgam === null) {
      pgam = _this.getFpga(calculation) * _this.getPga(calculation);
      // result.set({
      //   'pgam': pgam
      // });
      result.pgam = pgam;
    }
    return pgam;
  };

  /**
   * Calculats the Sd Spectra and returns the resulting array.
   *
   * @param Object {calculation}
   *                    takes a calculation
   */
  _this.getSdSpectra = function (calculation) {
    var i,
        result,
        sd1,
        sds,
        sdSpectra,
        t1,
        tHat,
        tl,
        tn;

    result = _this.getResult(calculation);
    sds =_this.getSds(calculation);
    sd1 = _this.getSd1(calculation);

    if (sd1 > sds) {
      sds = sd1;
    }

    tl = result.get('tl');
    sdSpectra = [];
    i = 1;
    t1 = sd1 / sds;

    sdSpectra.push([0, 0.4 * sds]);
    sdSpectra.push([0.2 * t1, sds]);
    sdSpectra.push([t1, sds]);

    tHat = +(t1.toFixed(1));
    tn = 0.05 + tHat;

    while (tn < 2.0) {
      tn = (0.05 * i) + tHat;
      sdSpectra.push([tn, sd1/tn]);
      i += 1;
    }
    // result.set({
    //   'sdSpectrum': sdSpectra
    // });
    result.sdSpectrum = sdSPectra;
    return sdSpectra;
  };

  /**
   * Calculats the Sm Spectra and returns ths resulting array.
   *
   * @param Object {calculation}
   *                    takes a calculation
   */
  _this.getSmSpectra = function (calculation) {
    var i,
        result,
        sm1,
        sms,
        smSpectra,
        t1,
        tHat,
        tl,
        tn;

    result = _this.getResult(calculation);
    sms = _this.getSms(calculation);
    sm1 = _this.getSm1(calculation);

    if (sm1 > sms) {
      sms = sm1;
    }

    tl = result.get('tl');
    smSpectra = [];
    i = 1;
    t1 = sm1 / sms;

    smSpectra.push([0, 0.4 * sms]);
    smSpectra.push([0.2 * t1, sms]);
    smSpectra.push([t1, sms]);

    tHat = +(t1.toFixed(1));
    tn = 0.05 + tHat;

    while (tn < 2.0) {
      tn = (0.05 * i) + tHat;
      smSpectra.push([tn, sm1/tn]);
      i +=  1;
    }
    // result.set({
    //   'smSpectrum': smSpectra
    // });
    result.smSpectrum = smSpectra;
    return smSpectra;
  };

  /**
   * Puts the result on the calculation.
   *
   * @param Object {calculation}
   *                    takes a calculation
   */
  _this.getResult = function (calculation, silent) {
    var result,
        resultJSON;

    // result = calculation.get('result');
    // resultJSON = result ? result.toJSON() : null;
    result = calculation.result;
    resultJSON = result;

    if (!result || !(
      resultJSON.hasOwnProperty('latitude') &&
      resultJSON.latitude !== null &&
      resultJSON.hasOwnProperty('longitude') &&
      resultJSON.longitude !== null &&
      resultJSON.hasOwnProperty('mapped_ss') &&
      resultJSON.mapped_ss !== null &&
      resultJSON.hasOwnProperty('mapped_s1') &&
      resultJSON.mapped_s1 !== null &&
      resultJSON.hasOwnProperty('mapped_pga') &&
      resultJSON.mapped_pga !== null &&

      resultJSON.hasOwnProperty('crs') &&
      resultJSON.crs !== null &&
      resultJSON.hasOwnProperty('cr1') &&
      resultJSON.cr1 !== null &&

      resultJSON.hasOwnProperty('geomean_ssd') &&
      resultJSON.geomean_ssd !== null &&
      resultJSON.hasOwnProperty('geomean_s1d') &&
      resultJSON.geomean_s1d !== null &&
      resultJSON.hasOwnProperty('geomean_pgad') &&
      resultJSON.geomean_pgad !== null
    )) {
      result = _this.interpolate(calculation);
      // calculation.set({
      //   'result': result
      // }, {silent: silent});
      calculation.result = result;
    }
    return result;
  };

  /**
   * Gets the site class and adds it to result.
   *
   * @param Object {calculation}
   *                    takes a calculation
   */
  _this.getSiteClass = function (calculation) {
    var input,
        result,
        siteClass;

    result = _this.getResult(calculation);
    // siteClass = result.get('site_class');
    siteClass = result.site_class || null;
    let SITE_CLASSES = {
      1: {value: 'A'},
      2: {value: 'B (measured)'},
      3: {value: 'B (unmeasured)'},
      4: {value: 'C'},
      5: {value: 'D (determined)'},
      6: {value: 'D (default)'},
      7: {value: 'E'},
    }

    if (siteClass === null) {
      // input = calculation.get('input');
      input = calculation.input;
      // siteClass = input.get('site_class');
      siteClass = input.site_class;
      siteClass = SITE_CLASSES[siteClass]; //_lookupDataFactory.getSiteClass(siteClass);
      // result.set({
      //   'site_class': siteClass
      // });
      result.site_class = siteClass;
    }
    return siteClass;
  };

  /**
   * Calls all of the calculation methods.
   *
   * @param Object {calculation}
   *                    takes a calculation
   */
  _this.calculate = function (calculation) {
    var result;

    result = _this.getResult(calculation, true);

    _this.getSsuh(calculation, true);
    _this.getS1uh(calculation, true);

    _this.getSsd(calculation, true);
    _this.getS1d(calculation, true);

    _this.getSs(calculation, true);
    _this.getS1(calculation, true);

    _this.getSiteClass(calculation, true);

    _this.getSms(calculation, true);
    _this.getSm1(calculation, true);

    _this.getSds(calculation, true);
    _this.getSd1(calculation, true);

    _this.getPga(calculation, true);
    _this.getPgam(calculation, true);

    _this.getSmSpectra(calculation, true);
    _this.getSdSpectra(calculation, true);

    return result;
  };

  _this.destroy = function () {
    _lookupDataFactory = null;
    _siteAmplification = null;
    _initialize = null;
    _this = null;
  };

  /**
   * Checks for 1, 2, or 4 data points to interpolate any other number of points
   * will throw an error.
   *
   * @param Object {calculation}
   *                    takes a calculation
   *
   * returns Model results
   */
  _this.interpolate = function (calculation) {
    var data,
        input,
        lat1,
        lat2,
        lat3,
        lng1,
        lng2,
        lng3,
        lng4,
        latInput,
        lngInput,
        log,
        metadata,
        output,
        result,
        resultLat1,
        resultLat3;

    input = calculation.input; // calculation.get('input');
    output = calculation.output; // calculation.get('output');
    data = output.data; // output.get('data').data();
    latInput = input.latitude; // input.get('latitude');
    lngInput = input.longitude; // input.get('longitude');
    metadata = output.metadata; // output.get('metadata');
    log = metadata.interpolation_method; // metadata.get('interpolation_method');

    if (data.length === 1) {
      // result = Util.extend({}, data[0].get());
      result = extend(true, {}, data[0]);

    } else if (data.length === 2) {
      lat1 = data[0].latitude; // .get('latitude');
      lat2 = data[1].latitude; // .get('latitude');
      lng1 = data[0].longitude; // .get('longitude');
      lng2 = data[1].longitude; // .get('longitude');

      if (lat1 === lat2) {
        result = _this.interpolateResults(
            data[0], //.get(),
            data[1], //.get(),
            lngInput,
            lng1,
            lng2,
            log);

      } else if (lng1 === lng2) {
        result = _this.interpolateResults(
            data[0], //.get(),
            data[1], //.get(),
            latInput,
            lat1,
            lat2,
            log);

      } else {
        throw new Error('Lat or Lng don\'t match and only 2 data points');
      }
    } else if (data.length === 4) {
      lat1 = data[0].latitude; // .get('latitude');
      lat3 = data[2].latitude; // .get('latitude');

      lng1 = data[0].longitude; // .get('longitude');
      lng2 = data[1].longitude; // .get('longitude');
      lng3 = data[2].longitude; // .get('longitude');
      lng4 = data[3].longitude; // .get('longitude');

      resultLat1 = _this.interpolateResults(
          data[0], //.get(),
          data[1], //.get(),
          lngInput,
          lng1,
          lng2,
          log);

      resultLat3 = _this.interpolateResults(
          data[2], //.get(),
          data[3], //.get(),
          lngInput,
          lng3,
          lng4,
          log);

      result = _this.interpolateResults(
          resultLat1,
          resultLat3,
          latInput,
          lat1,
          lat3,
          log);

    } else {
      throw new Error('Does not have 1, 2, or 4 points.');
    }

    // return Model(result);
    return result;
  };

  _initialize(params);
  params = null;
  return _this;
};

module.exports = NEHRPCalc2015;
