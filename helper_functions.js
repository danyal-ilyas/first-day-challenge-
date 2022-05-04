// Function to download the playlist file
function download_csv(filename, playlist) {

    const dictionaryKeys = Object.keys(playlist[0]);

    const dictValuesAsCsv = playlist.map(dict => (
        dictionaryKeys.map(key => {
            if (dict[key].includes(',')) {
                return '"${dict[key]}"';
            }

            return dict[key];
        }).join(',')
    ));

    const csv_data = [dictionaryKeys.join(','), ...dictValuesAsCsv].join('\n');

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv_data));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

// Function that displays the albums
function display_albums(country_name, albums) {
    var table = '<div><h3>' + country_name + '</h3><table border="2">';
    table += '<tr><th>Name</th><th>Artist</th><th>Release Date</th></tr>';
    albums.forEach((albums, index) => {
        table = table + '<tr>';
        table = table + '<td>' + albums.name + '</td>';
        table = table + '<td>' + albums.artist + '</td>';
        table = table + '<td>' + albums["release date"] + '</td>';
        table += '</tr>';
    });
    table += "</table></div>";
    document.getElementById("countries").innerHTML += table;
}

// Get the most popular number_of_tracks from the playlist tracks
function get_most_popular_tracks(number_of_tracks, tracks) {
    // Order the tracks in descending order by popularity where the highest number is the most popular song
    tracks.sort(function (first, second) {
        return second.track.popularity - first.track.popularity;
    });

    const top_ten = tracks.slice(0, number_of_tracks);

    var top_ten_trimmed = [];
    for (var i = 0; i < number_of_tracks; i++) {
        top_ten_trimmed.push({ 'name': top_ten[i].track.name, 'artist': top_ten[i].track.artists[0].name, 'date': top_ten[i].added_at, 'explicit': top_ten[i].track.explicit.toString(), 'duration(ms)': top_ten[i].track.duration_ms.toString(), 'popularity': top_ten[i].track.popularity.toString() });
    }
    return top_ten_trimmed;

}

// Function that generates spotify auth token(API)
async function get_token() {
    const client_id = '257f4d383a25443a8aa392ed9c24fc5d';
    const client_secret = '7fe4fe136fa74f5dacc898c8f57a2d00';

    const token_result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(client_id + ':' + client_secret)
        },
        body: 'grant_type=client_credentials'
    });

    const data = await token_result.json();

    return data.access_token;
}

// Function to get albums by a given country code(API)
async function get_albums(country_code, token) {
    const playlist_result = await fetch('https://api.spotify.com/v1/browse/new-releases?country=' + country_code + '&limit=10', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
    });

    const album_data = await playlist_result.json();

    var albums = album_data.albums.items;
    var trimmed_albums = [];
    for (var i = 0; i < 10; i++) {
        trimmed_albums.push({ "name": albums[i].name, "artist": albums[i].artists[0].name, "release date": albums[i].release_date });
    }
    return trimmed_albums;
}

// Function to get the playlist(API)
async function get_playlist(token) {
    const playlist_result = await fetch('https://api.spotify.com/v1/playlists/37i9dQZF1DWY6tYEFs22tT', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
    });

    const playlist_data = await playlist_result.json();
    return playlist_data.tracks.items;

}