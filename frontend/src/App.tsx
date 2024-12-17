import { useEffect, useState } from "react";
import "./App.css";
import "./components/AlbumArt";
import AlbumArt from "./components/AlbumArt";
import TrackInfo from "./components/TrackInfo";
import cover from "./assets/album.jpg";

const AUTHORIZE_URL = "https://accounts.spotify.com/authorize?";
const CLIENT_ID = "b079ccc2ea2f46fdadf0af9a59940bda";
const REDIRECT_URI = "http://localhost:5173";
const SCOPES = "user-read-playback-state user-read-currently-playing";

function App() {
  const [accessToken, setAccessToken] = useState("");
  const [track, setTrack] = useState("song!");

  useEffect(() => {
    const token = window.location.hash.substring(1).split("&")[0].split("=")[1];

    if (token) {
      setAccessToken(token);
    }
  }, []);

  useEffect(() => {
    const fetchCurrentTrack = async () => {
      if (!accessToken) {
        return;
      }

      try {
        const promise = fetch(
          "https://api.spotify.com/v1/me/player/currently-playing",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        ).then((response) => {
          return response.json()
        })

        const printData = () => {
          promise.then((data) => {
            console.log(data.item.name);
            console.log(data.item.artists[0].name);
            console.log(data.item.album.name);
          })
        }

        printData()

      } catch (error) {
        console.log(error);
      }
    };

    fetchCurrentTrack()
    const intervalId = setInterval(fetchCurrentTrack, 10000)
  }, [accessToken]);

  

  return (
    <div>
      {!accessToken ? (
        <button onClick={loginWithSpotify}>Login</button>
      ) : (
        <div>
          <div className="grid grid-cols-2 grid-rows-1 h-screen bg-[#49423B]">
            <AlbumArt imageUrl={cover} />
            <TrackInfo
              title="You're Gonna Go Far"
              artist="Noah Kahan"
              album="Stick Season (We'll All Be Here Forever)"
            />
          </div>
        </div>
      )}
    </div>
  );

  function loginWithSpotify() {
    console.log("reached");
    const spotifyLink = buildURL(AUTHORIZE_URL, testParams);
    window.location.href = spotifyLink;
  }
}

type Parameter = Record<string, string>;

function buildURL(url: string, params: Parameter) {
  var queryString = "";
  for (var key in params) {
    queryString +=
      encodeURIComponent(key) + "=" + encodeURIComponent(params[key]) + "&";
  }

  queryString = queryString.substring(0, queryString.length - 1); // Remove the last '&'

  return url + queryString;
}

function getTokenFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("access_token");

  return token ?? "";
}

const testParams = {
  client_id: CLIENT_ID,
  response_type: "token",
  redirect_uri: REDIRECT_URI,
  scope: SCOPES,
};

export default App;
