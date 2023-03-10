import SpotifyWebApi from "spotify-web-api-node";
import { prominent } from "color.js";
import axios from "axios";
const spotifyApi = new SpotifyWebApi();
const END_POINT = "https://api.spotify.com/v1";
import { runInAction } from "mobx";
let spotify;

export default spotify = {
  token: window.localStorage.getItem("token"),
  metadata: {},
  Tab: "library",
  Search: "",
  Playlist: "",
  PlaylistColor: "",
  Query: {},
  Next: {},
  previousMeta: {},

  set code(token) {
    window.localStorage.setItem("token", token);
    window.location.hash = "";
    this.token = token;
  },

  get code() {
    return this.token
      ? this.token
      : window.localStorage.getItem("token")
      ? window.localStorage.getItem("token")
      : null;
  },

  get nextSong() {
    return Object.keys(this.Next).length
      ? this.Next
      : window.localStorage.getItem("Next")
      ? JSON.parse(window.localStorage.getItem("Next"))
      : null;
  },

  set nextSong(data) {
    runInAction(() => {
      this.Next = data;
    });
    if (Object.keys(data).length) {
      window.localStorage.setItem("Next", data);
    } else {
      window.localStorage.removeItem("Next", data);
    }
  },

  set removeQueue(index) {
    let data;
    if (Object.keys(this.Query).length) {
      data = this.Query;
    } else {
      data = JSON.parse(window.localStorage.getItem("Queries"));
    }
    if (index === 0) {
      this.Next = {};
      window.localStorage.removeItem("Next");
    }
    data.splice(index, 1);
    this.Query = data;
    window.localStorage.setItem("Queries", JSON.stringify(data));
  },

  removeQueries() {
    this.Query = {};
    window.localStorage.removeItem("Queries");
    window.localStorage.removeItem("Next");
    this.Next = {};
  },

  signOut() {
    window.localStorage.removeItem("token");
    this.token = "";
    window.location = "/";
  },

  set addQuery(item) {
    let data;
    if (Object.keys(this.Query).length) {
      this.Query.push(item);
      data = this.Query;
    } else if (window.localStorage.getItem("Queries")) {
      data = JSON.parse(window.localStorage.getItem("Queries"));
      data.push(item);
    }
    window.localStorage.setItem("Queries", JSON.stringify(data));
    this.Query = data;
  },

  set queue(que) {
    //console.log(que);
    //que.splice(0, 1);
    if (que.length === 0) {
      window.localStorage.removeItem("Queries");
      return;
    }
    window.localStorage.setItem("Queries", JSON.stringify(que));
    this.Query = que;
    request(
      que[0].track.name,
      que[0].track.artists[0].name,
      que[0].track.duration_ms,
      que[0].track.album.images[1].url
    ).then((res) => {
      runInAction(() => {
        this.Next = {
          id: que[0].track.id,
          name: que[0].track.name,
          artists: que[0].track.artists.map((v) => v.name).join(", "),
          image: que[0].track.album.images[1].url,
          duration: que[0].track.duration_ms,
          url: que[0].track.external_urls.spotify,
          audio: res[0],
          color: res[1],
        };
      });
      window.localStorage.setItem("Next", JSON.stringify(this.Next));
    });
  },

  get queue() {
    return Object.keys(this.Query).length
      ? this.Query
      : window.localStorage.getItem("Queries")
      ? JSON.parse(window.localStorage.getItem("Queries"))
      : null;
  },

  set tab(tab) {
    this.Tab = tab;
  },

  get tab() {
    return this.Tab;
  },

  get user() {
    return (async () => {
      await spotifyApi.setAccessToken(this.token);
      return await spotifyApi.getMe();
    })();
  },

  get savedTracks() {
    return (async () => {
      const tracks = await spotifyApi.getMySavedTracks();
      return { ...tracks.body, name: "Liked Songs" };
    })();
  },

  get playlistColor() {
    return this.PlaylistColor;
  },

  set playlist(value) {
    this.Playlist = "";
    this.PlaylistColor = "";
  },

  get playlist() {
    return this.Playlist;
  },

  get userPlaylists() {
    return (async () => {
      return await playlists(this.token);
    })();
  },

  get init() {
    try {
      spotifyApi.setAccessToken(this.token);
    } catch {
      window.localStorage.removeItem("token");
      window.location = "/";
    }
  },

  get prevMeta() {
    return Object.keys(this.previousMeta).length
      ? this.previousMeta
      : window.localStorage.getItem("metadata")
      ? JSON.parse(window.localStorage.getItem("metadata"))
      : null;
  },

  set prevMeta(data) {
    if (!data) return;
    this.previousMeta = data;
    window.localStorage.setItem("metadata", JSON.stringify(this.previousMeta));
  },

  set song(data) {
    this.metadata = data;
    window.localStorage.setItem("Playing", JSON.stringify(this.metadata));
  },

  get track() {
    return Object.keys(this.metadata).length
      ? this.metadata
      : window.localStorage.getItem("Playing")
      ? JSON.parse(window.localStorage.getItem("Playing"))
      : null;
  },

  tracksInPlaylist(id, playlistName, url) {
    spotifyApi.getPlaylistTracks(id, { field: "items" }).then((data) => {
      runInAction(() => {
        this.Playlist = {
          ...data.body,
          name: playlistName,
          image: url,
        };
      });
    if (url) {
      prominent(url, { format: "hex", amount: 1 }).then((color) => {
        this.PlaylistColor = color;
      });
    }
    });
  },

  search(q) {
    if (q !== "") {
      return (async () => {
        return await spotifyApi.searchTracks(q);
      })();
    }
  },

  set track(e) {
  	if(!e){
  		this.metadata = {}
  		window.localStorage.removeItem("playing")
  	}
    request(
      e.name,
      e.artists[0].name,
      e.duration_ms,
      e.album.images[1].url
    ).then((res) => {
      runInAction(() => {
        this.metadata = {
          id: e.id,
          name: e.name,
          artists: e.artists.map((v) => v.name).join(", "),
          image: e.album.images[1].url,
          duration: e.duration_ms,
          url: e.external_urls.spotify,
          audio: res[0],
          color: res[1],
        };
      });
      window.localStorage.setItem("Playing", JSON.stringify(this.metadata));
    });
  },
};

async function request(title, artist, duration, image) {
  const link = await axios.post("/api", { title, artist, duration });
  const color = await prominent(image, { format: "hex", amount: 1 });
  return [link.data, color];
}

async function playlists(token) {
  const { data } = await axios.get(`${END_POINT}/me/playlists`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}

export function formatTime(ms) {
  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;
  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  return `${minutes}:${seconds}`;
}

export async function isSaved(trackId) {
  try {
    const data = await spotifyApi.containsMySavedTracks([trackId]);
    const trackIsSaved = await data.body[0];
    return trackIsSaved ? true : false;
  } catch {
    return false;
  }
}

export async function removeSavedTrack(trackId) {
  const data = await spotifyApi.removeFromMySavedTracks([trackId]);
  if (data.statusCode === 200) {
    return true;
  } else {
    return false;
  }
}

export async function addSavedTrack(trackId) {
  const data = await spotifyApi.addToMySavedTracks([trackId]);
  if (data.statusCode === 200) {
    return true;
  } else {
    return false;
  }
}

export async function downloadTrack(trackUrl) {
  const data = await axios.post("/api/dl", { trackUrl });
  return true;
}

export async function refreshToken(code) {
  const data = await axios.post("/api/refresh", { code });
  console.log(data);
}
