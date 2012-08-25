describe "LastFM content script", -> 
    
    lastfm = chromus.plugins.lastfm
    manager = chromus.plugins.lastfm.manager


    beforeEach ->
        plugin_path = chromus.plugins_info.lastfm.path
        plugin_path += "/spec/fixtures"

        jasmine.getFixtures().fixturesPath = plugin_path

    it "should get link type", ->        
        links = 
            "/user/buger_swamp": "user"
            "/music/Blur": "band"
            "/music/Graham+Coxon/_/What%27ll+It+Take": "song"
            "/music/Graham+Coxon/Happiness+In+Magazines": "album"
            "/music/Graham+Coxon/+albums": "music"

        for own link of links
            expect(chromus.utils.urlType("http://last.fm"+link)).toBe links[link]


    # class TrackList
    it "should identify profile recent tracks", ->
        loadFixtures("user_profile_recent.html")

        manager.init()
        manager.wrapMusicElements()

        expect($('tr[data-song]').length).toBe 15
        expect($('tr[data-song]').data('artist')).toBe 'Blur'
        expect($('tr[data-song]').data('song')).toBe 'Tender'


    # class ArtistsLargeThumbnails
    it "should identify profile library", ->
        loadFixtures("user_profile_library.html")

        manager.init()
        manager.wrapMusicElements()

        expect($('[data-song]').length).toBe 0
        expect($('[data-artist]').length).toBe 8
        expect($('[data-artist]').data('artist')).toBe 'ДДТ'  
   

    # class TrackList
    it "should identify profile track chart", ->
        loadFixtures("user_profile_track_chart.html")

        manager.init()
        manager.wrapMusicElements()

        expect($('[data-song]').length).toBe 15
        expect($('[data-artist]').length).toBe 15
        expect($('[data-artist]').data('artist')).toBe 'Nick Drake' 
        expect($('[data-artist]').data('song')).toBe 'Things Behind The Sun' 


    # class TrackList
    it "should identify profile artist chart", ->
        loadFixtures("user_profile_artist_chart.html")

        manager.init()
        manager.wrapMusicElements()

        expect($('[data-song]').length).toBe 0
        expect($('[data-artist]').length).toBe 15
        expect($('[data-artist]').data('artist')).toBe 'Damien Rice'


    # class TrackList
    it "should identify arthist top chart", ->
        loadFixtures("artist_main_top_chart.html")

        manager.init()
        manager.wrapMusicElements()

        expect($('[data-song]').length).toBe 15
        expect($('[data-artist]').length).toBe 15
        expect($('[data-artist]').data('artist')).toBe 'ДДТ'
        expect($('[data-artist]').data('song')).toBe 'Дождь'


    # class TrackList
    it "should identify artist charts", ->
        loadFixtures("artist_charts.html")

        manager.init()
        manager.wrapMusicElements()

        expect($('[data-song]').length).toBe 14
        expect($('[data-artist]').length).toBe 14
        expect($('[data-artist]').data('artist')).toBe 'ДДТ'
        expect($('[data-artist]').data('song')).toBe 'Дождь'


    # class ArtistsWithInfo
    it "should identify artist similar", ->
        loadFixtures("artist_similar.html")

        manager.init()
        manager.wrapMusicElements()

        expect($('[data-song]').length).toBe 0
        expect($('[data-artist]').length).toBe 10
        expect($('[data-artist]').data('artist')).toBe 'Graham Coxon'


    # class SingleTrack
    it "should identify track (header) ", ->
        loadFixtures("track_header.html")

        manager.init()
        manager.wrapMusicElements()

        expect($('[data-song]').length).toBe 1
        expect($('[data-artist]').length).toBe 1
        expect($('[data-artist]').data('artist')).toBe 'Ke$ha'
        expect($('[data-artist]').data('song')).toBe 'TiK ToK'


    # class SingleTrack
    it "should identify friends loved ", ->
        loadFixtures("friends_loved.html")

        manager.init()
        manager.wrapMusicElements()

        expect($('[data-song]').length).toBe 20
        expect($('[data-artist]').length).toBe 20
        expect($('[data-artist]').data('artist')).toBe 'Blink-182'
        expect($('[data-artist]').data('song')).toBe 'What`s My Age Again'


    # class Track 
    it "should identify similar tracks ", ->
        loadFixtures("track_similar.html")

        manager.init()
        manager.wrapMusicElements()

        console.warn $('[data-artist]')

        expect($('[data-song]').length).toBe 100
        expect($('[data-artist]').length).toBe 100
        expect($('[data-artist]').data('artist')).toBe 'Depeche Mode'
        expect($('[data-artist]').data('song')).toBe 'Personal Jesus'