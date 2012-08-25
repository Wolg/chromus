_.extend @chromus.utils,
	urlType: (url) ->
		params = _.rest url.replace(/https?\:\/\//,'').split('/')

		switch params[0]
			when "music"
				if params.length is 2
					"band"
				else if params[2] is '_'
					"song"
				else if params[2][0] is '+'
					"music"
				else if params.length is 3
					"album"

			else params[0]

