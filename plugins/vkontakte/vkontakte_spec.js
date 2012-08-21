(function() {

  describe("Vkontakte plugin", function() {
    var fixtures, vkontakte;
    fixtures = {
      "http://api.vk.com/api.php": {
        success: {
          "response": [
            {
              "count": 11117
            }, {
              "audio": {
                "artist": "The Beatles",
                "title": "Help!",
                "duration": "138",
                "url": "http://vk.com/1.mp3"
              }
            }, {
              "audio": {
                "artist": "Silverstein",
                "title": "Help (The Beatles cover)",
                "duration": "137",
                "url": "http://vk.com/2.mp3"
              }
            }
          ]
        }
      },
      'http://chromusapp-v2.appspot.com/sign_data': {
        success: {
          "api_key": 1985507,
          "signed_data": "e44c7595f7377fa9b74e197a5f3c2466"
        }
      },
      'http://chromusapp-v2.appspot.com/api/token/get': {
        success: {
          "token": "123456"
        }
      },
      'https://api.vk.com/method/audio.search': {
        success: {
          "response": [
            "2", {
              "artist": "The Beatles",
              "title": "Help!",
              "duration": "138",
              "url": "http://vk.com/1.mp3"
            }, {
              "artist": "Silverstein",
              "title": "Help (The Beatles cover)",
              "duration": "137",
              "url": "http://vk.com/2.mp3"
            }
          ]
        }
      }
    };
    vkontakte = chromus.audio_sources.vkontakte;
    return it("should load test mode", function() {
      var ajax_spy, callback_spy,
        _this = this;
      ajax_spy = spyOn($, "ajax").andCallFake(function(args) {
        var _ref;
        console.warn(args.url);
        return typeof args.success === "function" ? args.success((_ref = fixtures[args.url]) != null ? _ref.success : void 0) : void 0;
      });
      callback_spy = jasmine.createSpy();
      vkontakte.search({
        artist: 'Beatles',
        song: 'Help',
        callback: 'vkclb1320140115315'
      }, callback_spy);
      expect(callback_spy).toHaveBeenCalled();
      return expect(callback_spy.mostRecentCall.args[0][0]).toEqual({
        artist: "The Beatles",
        song: "Help!",
        duration: 138,
        file_url: "http://vk.com/1.mp3",
        source_title: 'Vkontakte',
        source_icon: 'http://vk.com/favicon.ico'
      });
    });
  });

}).call(this);
