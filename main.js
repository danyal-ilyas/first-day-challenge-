// Function that generates spotify auth token 
async function get_token() {
    // The client_id and client_secret taken from my spotify app and used to retreive an auth token
    var client_id = '257f4d383a25443a8aa392ed9c24fc5d';
    var client_secret = '7fe4fe136fa74f5dacc898c8f57a2d00';

    // Create a post request to generate the token
    const token_result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(client_id + ':' + client_secret)
        },
        body: 'grant_type=client_credentials'
    });

    // Get json representation of the response sent back, wait for the promise to resolve then move on
    const data = await token_result.json();
    // Now just store the token
    return data.access_token;
}

// Function to download the playlist file
function download(filename, text) {
    // create an a tag that downloads, then set a manual click to download the csv, remove it from the html after
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

// Function that just inserts the html code to display the table using the country_name and the list of albums
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

// Function to get albums by a given country code
async function get_albums(country_code, token) {
    // Use the generated token to send a get request to spotify's new releases api
    const playlist_result = await fetch('https://api.spotify.com/v1/browse/new-releases?country=' + country_code + '&limit=10', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
    });

    // Get json representation of the response sent back, wait for the promise to resolve then move on
    const album_data = await playlist_result.json();

    // only take the artist, name and release date of each album
    var albums = album_data.albums.items;
    var trimmed_albums = [];
    for (var i = 0; i < 10; i++) {
        trimmed_albums.push({ "name": albums[i].name, "artist": albums[i].artists[0].name, "release date": albums[i].release_date });
    }
    return trimmed_albums;
}


window.onload = async function () {
    // Select the task_1 and task_2 button
    var task_1_button = document.getElementById("task_1");
    var task_2_button = document.getElementById("task_2");


    // Generate and store the token
    var token = await get_token();

    // If the task 1 button is clicked run the fun function!
    task_1_button.onclick = async function task_1_fun() {

        // Use the generated token to send a get request to spotify's playlist api
        const playlist_result = await fetch('https://api.spotify.com/v1/playlists/37i9dQZF1DWY6tYEFs22tT', {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        // Get json representation of the response sent back, wait for the promise to resolve then move on
        const playlist_data = await playlist_result.json();

        // Store the tracks which is an array of the songs in the playlist
        var tracks = playlist_data.tracks.items;

        // Order the tracks in descending order by popularity where the highest number is the most popular song
        tracks = tracks.sort(function (first, second) {
            return second.track.popularity - first.track.popularity;
        });

        // Take the first 10 most popular tracks
        var top_ten = tracks.slice(0, 10);

        // Store the relevent information only
        var top_ten_trimmed = [];
        for (var i = 0; i < 10; i++) {
            top_ten_trimmed.push({ 'name': top_ten[i].track.name, 'artist': top_ten[i].track.artists[0].name, 'date': top_ten[i].added_at });
        }

        // Set the headers for the csv file
        const dictionaryKeys = Object.keys(top_ten_trimmed[0]);

        // Source: https://stackoverflow.com/questions/63481185/javascript-list-of-dictionariesjson-to-csv
        const dictValuesAsCsv = top_ten_trimmed.map(dict => (
            dictionaryKeys.map(key => {
                if (dict[key].includes(',')) {
                    return '"${dict[key]}"';
                }

                return dict[key];
            }).join(',')
        ));

        const csv_data = [dictionaryKeys.join(','), ...dictValuesAsCsv].join('\n');

        // Start file download.
        download("playlist.csv", csv_data);
    }

    // If the task 2 button is clicked run this fun function
    task_2_button.onclick = async function task_2_fun() {
        // Get the list of albums in [{artist, date, name}] format
        var canada_albums = await get_albums("CA", token);
        var pakistan_albums = await get_albums("PK", token);
        var france_albums = await get_albums("FR", token);

        // Set the html to empty if the button is pressed twice not to pile tables on top of each other
        document.getElementById("countries").innerHTML = "";

        // Display the tables
        display_albums("Canada", canada_albums);
        display_albums("Pakistan", pakistan_albums);
        display_albums("France", france_albums);
    }

};
