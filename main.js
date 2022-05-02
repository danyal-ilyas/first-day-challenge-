window.onload = function () {

    // Select the button
    form = document.getElementById("title");


    // source: https://developer.spotify.com/documentation/general/guides/authorization/client-credentials/
    // alternate source: https://www.youtube.com/watch?v=SbelQW2JaDQ
    var client_id = '257f4d383a25443a8aa392ed9c24fc5d';
    var client_secret = '7fe4fe136fa74f5dacc898c8f57a2d00';
    // if the button is clicked run the fun function!
    form.onclick = async function fun() {
        // source: https://developer.spotify.com/documentation/general/guides/authorization/client-credentials/
        var client_id = '257f4d383a25443a8aa392ed9c24fc5d';
        var client_secret = '7fe4fe136fa74f5dacc898c8f57a2d00';

        // create a post request to generate the token
        const token_result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(client_id + ':' + client_secret)
            },
            body: 'grant_type=client_credentials'
        });

        const data = await token_result.json();

        var token = data.access_token;


        const playlist_result = await fetch('https://api.spotify.com/v1/playlists/37i9dQZF1DWY6tYEFs22tT', {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const playlist_data = await playlist_result.json();

        var tracks = playlist_data.tracks.items
        console.log(tracks)

        // Might be redundunt because api likely returns in already popular order will test later on to see if this is true
        tracks = tracks.sort(function (first, second) {
            return second.track.popularity - first.track.popularity;
        });

       

        var top_ten = tracks.slice(10)
        var top_ten_trimmed = []
        for (var i = 0; i < 10; i++) {
            top_ten_trimmed.push({ 'name': top_ten[i].track.name, 'artist': top_ten[i].track.artists[0].name, 'date': top_ten[i].added_at })
        }



        const listOfDicts = top_ten_trimmed;

        // gets the headers for the csv file
        const dictionaryKeys = Object.keys(listOfDicts[0]);

        // Source: https://stackoverflow.com/questions/63481185/javascript-list-of-dictionariesjson-to-csv
        const dictValuesAsCsv = listOfDicts.map(dict => (
            dictionaryKeys.map(key => {
                if (dict[key].includes(',')) {
                    return `"${dict[key]}"`;
                }

                return dict[key];
            }).join(',')
        ));

        const csv_data = [dictionaryKeys.join(','), ...dictValuesAsCsv].join('\n');

        function download(filename, text) {
            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text));
            element.setAttribute('download', filename);

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        }

        // Start file download.
        download("playlist.csv", csv_data);

    }

};
