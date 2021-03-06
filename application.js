var http = require('http');
var fs = require('fs');
var express = require('express');
var request = require('http-get');
var im = require('imagemagick');
var mime = require('mime-magic');

var app = module.exports = express.createServer();

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(app.router);
app.use(express.errorHandler({showStack: true, dumpExceptions: true}));

app.get('/', function(req, res, next) {
  var basePath = __dirname + '/cache/';
  var w = parseInt(req.query.w);
  var h = parseInt(req.query.h);

  var path = basePath + Math.floor((Math.random()*100000000)+1);

  request.get({url: req.query.u}, path, function(err, result) {
    if (!result) {
      res.send('It was not possible to get image: ' + path);
      return;
    }
    var mimetype = mime(result.file, function(err, type) {

      var dstpath = path + '-' + w + 'x' + h + '.' + type.split('/')[1];
      var options = {
        srcPath: result.file,
        dstPath: dstpath
      };

      im.identify(result.file, function(err, features) {
        if (err) {
          throw err;
        }

        //console.log(features);

        if (w) {
          options.width = w > features.width ? features.width : w;
        }

        if (h) {
          options.height = h > features.height ? features.height : h;
        }

        im.resize(options, function(err, stdout, stderr) {
          if (err)  {
            throw err;
          }
          res.sendfile(dstpath);
        });
      });
    });
  });
});

if (!module.parent) {
  var port = process.env.PORT || 3000;
  app.listen(port);
  console.log('Stingy API server listening on port %d', port);
}
