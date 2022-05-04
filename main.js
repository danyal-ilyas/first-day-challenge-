window.onload = async function () {

    const task_1_button = document.getElementById("task_1");
    const task_2_button = document.getElementById("task_2");

    const token = await get_token();

    task_1_button.onclick = async function task_1_fun() {

        var tracks = await get_playlist(token);

        const top_ten_tracks = get_most_popular_tracks(10, tracks)

        download_csv("playlist.csv", top_ten_tracks);
    }

    task_2_button.onclick = async function task_2_fun() {

        const canada_albums = await get_albums("CA", token);
        const pakistan_albums = await get_albums("PK", token);
        const france_albums = await get_albums("FR", token);

        document.getElementById("countries").innerHTML = "";

        display_albums("Canada", canada_albums);
        display_albums("Pakistan", pakistan_albums);
        display_albums("France", france_albums);
    }

};
