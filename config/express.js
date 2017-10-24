var express = require('express'),
    glob = require('glob'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    compress = require('compression'),
    methodOverride = require('method-override'),
    crypto = require('crypto'), 
    config = require("./config");

module.exports = function(app, config) {
  var env = config.env || 'development';
  app.locals.ENV = env;
  app.locals.ENV_DEVELOPMENT = env == 'development';

  app.use(favicon(config.root + '/public/img/favicon.ico'));

  app.use(logger('dev'));
  
  app.use(bodyParser.json({ verify: verifyRequest }));
  app.use(bodyParser.urlencoded({
    extended: true
  }));

  app.use(compress());
  app.use(express.static(config.root + '/public'));
  app.use(methodOverride());

  var controllers = glob.sync(config.root + '/app/controllers/*.js');
  controllers.forEach(function (controller) {
    require(controller)(app);
  });
};

function getSignature(buf) {
  var hmac = crypto.createHmac("sha1", config.app_secret);
  hmac.update(buf, "utf-8");
  return "sha1=" + hmac.digest("hex");
}

function verifyRequest(req, res, buf, encoding) {
  var expected = req.headers['x-hub-signature'];
  var calculated = getSignature(buf);
  if (expected !== calculated) {
    throw new Error("Invalid signature.");
  }
}
