(function() {
  var Source;

  Source = (function() {

    function Source() {}

    Source.prototype.baseURL = "http://search.4shared.com/q/CCQD/1/music";

    Source.prototype.processResults = function(response) {
      var results;
      results = $(response).find('table.listView tr');
      results = _.map(results, function(tr) {
        var result, _ref, _ref2, _ref3;
        tr = $(tr);
        return result = {
          title: tr.find('.fname a').html(),
          file_url: (_ref = tr.find('.playThumb img')) != null ? (_ref2 = _ref.attr('onclick')) != null ? (_ref3 = _ref2.match(/(http[^']*)/)) != null ? _ref3[1] : void 0 : void 0 : void 0
        };
      });
      results = _.reject(results, function(i) {
        return !i.title || !i.file_url;
      });
      return callb;
    };

    Source.prototype.search = function(args, callback) {
      var data, query, url,
        _this = this;
      if (callback == null) callback = function() {};
      query = "" + args.artist + "_" + args.song;
      query = query.replace(/\s+/, "_").replace(" ", "_");
      url = "" + this.baseURL + "/" + query;
      if (browser.isFrame) {
        data = {
          _url: url,
          _method: "GET"
        };
        return $.ajax({
          url: "" + chromus.baseURL + "/proxy",
          data: data,
          dataType: "jsonp",
          cache: true,
          success: function(resp) {
            var responseHtml;
            responseHtml = resp.response.replace(/\n/g, '\uffff').replace(/<script.*?>.*?<\/script>/gi, '').replace(/\n/g, '\uffff').replace(/<script.*?>.*?<\/script>/gi, '').replace(/\uffff/g, '\n').replace(/<(\/?)noscript/gi, '<$1div');
            return callback(_this.processResults(responseHtml));
          }
        });
      } else {
        return $.ajax({
          url: url,
          success: function(result) {
            return callback(_this.processResults());
          }
        });
      }
    };

    return Source;

  })();

  this.chromus.registerAudioSource("for_shared", new Source());

  this.chromus.registerPlugin("for_shared", new Source());

}).call(this);
