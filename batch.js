'use strict';

const NEHRPCalc2015 = require('./src/htdocs/js/NEHRPCalc2015'),
    response = require('./response.json'),
    ASCE7_16 = require('./asce7-16.expectation.json'),
    querystring = require('querystring'),
    fetch = require('node-fetch');

const DESIGN_CODE = {
  'NEHRP-2015': 1
};

const SITE_CLASS = {
  'A': 1,
  'B': 2,
  'B-estimated': 3,
  'C': 4,
  'D': 5,
  'D-default': 6,
  'E': 7
};

const RISK_CATEGORY = {
  'I': 1,
  'II': 1,
  'III': 1,
  'IV': 2
};

let mapInputValue = function (value, mapping) {
  return mapping[value];
};

let mapOutputValue = function (value, mapping) {
  for (let i in mapping){
    if (mapping[i] === value) {
      return i;
    }
  }
};

let formatResponse = function (response) {
  let output,
      calc;

  calc = NEHRPCalc2015();

  output = {
    'request': {
      'referenceDocument': 'NEHRP-2015',
      'status': 'success',
      'url': null,
      'parameters': {
        'latitude': response.input.latitude,
        'longitude': response.input.longitude,
        'riskCategory': mapOutputValue(response.input.risk_category, RISK_CATEGORY),
        'title': response.input.title,
        'siteClass': mapOutputValue(response.input.site_class, SITE_CLASS)
      }
    },
    'response': {
      'data': {
        'sms': Math.round(calc.getSms(response) * 100000) / 100000,
        'sm1': Math.round(calc.getSm1(response) * 100000) / 100000,
        'pgam':Math.round(calc.getPgam(response) * 100000) / 100000
      }
    }
  };

  return output;
};

let run = function () {
  let qcArray;

  qcArray = [];

  for (let i = 0, len = ASCE7_16.length; i < len; i++) {
    let calculation,
        params,
        request,
        url;

    params = ASCE7_16[i].request.parameters;
    request = {
      'latitude': params.latitude,
      'longitude': params.longitude,
      'risk_category': mapInputValue(params.riskCategory, RISK_CATEGORY),
      'title': params.title,
      'site_class': mapInputValue(params.siteClass, SITE_CLASS),
      'design_code': DESIGN_CODE['NEHRP-2015']
    };

    url = 'https://earthquake.usgs.gov/designmaps/beta/us/service/' +
        request.design_code + '/' +
        request.site_class + '/' +
        request.risk_category + '/' +
        request.longitude + '/' +
        request.latitude + '/' +
        querystring.escape(request.title);

    fetch(url).then(function (res) {
        return res.json();
      }).then(function (body) {
        qcArray.push(formatResponse(body));
        if (qcArray.length === ASCE7_16.length) {
          console.log(JSON.stringify(qcArray, null, 2));
        }
      }).catch(function(err) {
        console.log('Error ' + err);
    });
  }
}

run();
