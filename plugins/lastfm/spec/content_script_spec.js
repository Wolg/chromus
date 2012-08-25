(function() {
  var __hasProp = Object.prototype.hasOwnProperty;

  describe("LastFM content script", function() {
    var lastfm, manager;
    lastfm = chromus.plugins.lastfm;
    manager = chromus.plugins.lastfm.manager;
    beforeEach(function() {
      var plugin_path;
      plugin_path = chromus.plugins_info.lastfm.path;
      plugin_path += "/spec/fixtures";
      return jasmine.getFixtures().fixturesPath = plugin_path;
    });
    it("should get link type", function() {
      var link, links, _results;
      links = {
        "/user/buger_swamp": "user",
        "/music/Blur": "band",
        "/music/Graham+Coxon/_/What%27ll+It+Take": "song",
        "/music/Graham+Coxon/Happiness+In+Magazines": "album",
        "/music/Graham+Coxon/+albums": "music"
      };
      _results = [];
      for (link in links) {
        if (!__hasProp.call(links, link)) continue;
        _results.push(expect(chromus.utils.urlType("http://last.fm" + link)).toBe(links[link]));
      }
      return _results;
    });
    it("should identify profile recent tracks", function() {
      loadFixtures("user_profile_recent.html");
      manager.init();
      manager.wrapMusicElements();
      expect($('tr[data-song]').length).toBe(15);
      expect($('tr[data-song]').data('artist')).toBe('Blur');
      return expect($('tr[data-song]').data('song')).toBe('Tender');
    });
    it("should identify profile library", function() {
      loadFixtures("user_profile_library.html");
      manager.init();
      manager.wrapMusicElements();
      expect($('[data-song]').length).toBe(0);
      expect($('[data-artist]').length).toBe(8);
      return expect($('[data-artist]').data('artist')).toBe('ДДТ');
    });
    it("should identify profile track chart", function() {
      loadFixtures("user_profile_track_chart.html");
      manager.init();
      manager.wrapMusicElements();
      expect($('[data-song]').length).toBe(15);
      expect($('[data-artist]').length).toBe(15);
      expect($('[data-artist]').data('artist')).toBe('Nick Drake');
      return expect($('[data-artist]').data('song')).toBe('Things Behind The Sun');
    });
    it("should identify profile artist chart", function() {
      loadFixtures("user_profile_artist_chart.html");
      manager.init();
      manager.wrapMusicElements();
      expect($('[data-song]').length).toBe(0);
      expect($('[data-artist]').length).toBe(15);
      return expect($('[data-artist]').data('artist')).toBe('Damien Rice');
    });
    it("should identify arthist top chart", function() {
      loadFixtures("artist_main_top_chart.html");
      manager.init();
      manager.wrapMusicElements();
      expect($('[data-song]').length).toBe(15);
      expect($('[data-artist]').length).toBe(15);
      expect($('[data-artist]').data('artist')).toBe('ДДТ');
      return expect($('[data-artist]').data('song')).toBe('Дождь');
    });
    it("should identify artist charts", function() {
      loadFixtures("artist_charts.html");
      manager.init();
      manager.wrapMusicElements();
      expect($('[data-song]').length).toBe(14);
      expect($('[data-artist]').length).toBe(14);
      expect($('[data-artist]').data('artist')).toBe('ДДТ');
      return expect($('[data-artist]').data('song')).toBe('Дождь');
    });
    it("should identify artist similar", function() {
      loadFixtures("artist_similar.html");
      manager.init();
      manager.wrapMusicElements();
      expect($('[data-song]').length).toBe(0);
      expect($('[data-artist]').length).toBe(10);
      return expect($('[data-artist]').data('artist')).toBe('Graham Coxon');
    });
    it("should identify track (header) ", function() {
      loadFixtures("track_header.html");
      manager.init();
      manager.wrapMusicElements();
      expect($('[data-song]').length).toBe(1);
      expect($('[data-artist]').length).toBe(1);
      expect($('[data-artist]').data('artist')).toBe('Ke$ha');
      return expect($('[data-artist]').data('song')).toBe('TiK ToK');
    });
    it("should identify friends loved ", function() {
      loadFixtures("friends_loved.html");
      manager.init();
      manager.wrapMusicElements();
      expect($('[data-song]').length).toBe(20);
      expect($('[data-artist]').length).toBe(20);
      expect($('[data-artist]').data('artist')).toBe('Blink-182');
      return expect($('[data-artist]').data('song')).toBe('What`s My Age Again');
    });
    return it("should identify similar tracks ", function() {
      loadFixtures("track_similar.html");
      manager.init();
      manager.wrapMusicElements();
      console.warn($('[data-artist]'));
      expect($('[data-song]').length).toBe(100);
      expect($('[data-artist]').length).toBe(100);
      expect($('[data-artist]').data('artist')).toBe('Depeche Mode');
      return expect($('[data-artist]').data('song')).toBe('Personal Jesus');
    });
  });

}).call(this);
