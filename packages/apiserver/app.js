const path = require('path');
const express = require('express')
const fs = require('fs');
const i18n = require('i18n');
const cors = require('cors');
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')

i18n.configure({
  locales: ['en', 'ja', 'ko'],
  // eslint-disable-next-line prefer-template,no-path-concat
  directory: __dirname + '/locales',
});

function initApp(app) {
  app.use(cors());
  app.use(i18n.init);
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(awsServerlessExpressMiddleware.eventContext())

  const CARRIERS = {};

  fs.readdirSync(path.join(__dirname, 'carriers')).forEach(name => {
    // eslint-disable-next-line no-console
    console.log(`load carrier ${name}`);
    // eslint-disable-next-line global-require, import/no-dynamic-require
    CARRIERS[name] = require(`./carriers/${name}`);
  });

  const CARRIERS_INFOS = Object.keys(CARRIERS).map(id => ({
    id,
    ...CARRIERS[id].info,
  }));

  app.get('/carriers', (req, res) => {
    if(req.timedout) {
      return;
    }
    res.json(CARRIERS_INFOS);
  });

  app.get('/carriers/:carrierId', (req, res) => {
    if (!(req.params.carrierId in CARRIERS)) {
      const error = new Error('not supported carrier');
      error.code = 404;
      throw error;
    }

    if(req.timedout) {
      return;
    }

    res.json({
      id: req.params.carrierId,
      ...CARRIERS[req.params.carrierId].info,
    });
  });

  app.get('/carriers/:carrierId/tracks/:trackId', (req, res, next) => {
    const { carrierId, trackId } = req.params;

    if (!(carrierId in CARRIERS)) {
      const error = new Error('not supported carrier');
      error.code = 404;
      throw error;
    }

    CARRIERS[carrierId]
      .getTrack(trackId)
      .then(info => {
        if (req.timedout) {
          return;
        }
        res.status(200).json({
          ...info,
          carrier: {
            id: carrierId,
            ...CARRIERS[carrierId].info,
          },
        })
      })
      .catch(err => next(err));
  });

  // eslint-disable-next-line no-unused-vars
  app.use(function(err, req, res, next) {
    const status = Number(err.code);
    res.status(status || 500).json({
      // eslint-disable-next-line no-underscore-dangle
      message: err.message ? err.message : res.__('error message'),
    });
    next(err);
  });

  return app;
}

module.exports = initApp(express());
