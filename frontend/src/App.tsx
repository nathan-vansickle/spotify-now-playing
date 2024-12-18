import { useEffect, useState } from "react";
import "./App.css";
import "./components/AlbumArt";
import AlbumArt from "./components/AlbumArt";
import TrackInfo from "./components/TrackInfo";
// import cover from "./assets/album.jpg";
import axios from "axios";
import { getColor } from "color-thief-react";

const BACKEND_URL = "http://localhost:5000";

interface Track {
  title: string;
  artist: string;
  album: string;
}
function App() {
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [bgColor, setBgColor] = useState("#000000");
  const [track, setTrack] = useState<Track>({
    title: "",
    artist: "",
    album: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const newAccessToken = params.get("access_token");
    const newRefreshToken = params.get("refresh_token");

    if (newAccessToken && newRefreshToken) {
      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
    }

    window.history.replaceState({}, document.title, window.location.pathname);

    getCurrentTrack();
    console.log(bgColor);

    const intervalId = setInterval(getCurrentTrack, 1000);
    return () => clearInterval(intervalId);
  }, [accessToken]);

  useEffect(() => {
    async function getDominantColor() {
      if (imageUrl) {
        try {
          const dominantColor = await getColor(imageUrl, "hex", "anonymous")
          setBgColor(dominantColor)
        } catch (error) {
          console.log(error);
        }
      }
    }

    getDominantColor()
  }, [imageUrl])

  return (
    <div>
      {!accessToken ? (
        <button onClick={handleSpotifyLogin}>Login</button>
      ) : (
        <div>
          <div
            className={`grid grid-cols-2 grid-rows-1 h-screen`}
            style={{backgroundColor: bgColor, color: getTextColor(bgColor)}}
          >
            <AlbumArt imageUrl={imageUrl} />
            <TrackInfo
              title={track.title}
              artist={track.artist}
              album={track.album}
            />
          </div>
        </div>
      )}
    </div>
  );

  function handleSpotifyLogin() {
    window.location.href = `${BACKEND_URL}/spotify/login`;
  }

  async function getCurrentTrack() {
    if (!accessToken) {
      return;
    }

    try {
      const response = await axios.get(
        "https://api.spotify.com/v1/me/player/currently-playing",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status == 204) {
        return;
      }

      setTrack({
        title: response.data.item.name,
        artist: response.data.item.artists[0].name,
        album: response.data.item.album.name,
      });
      setImageUrl(response.data.item.album.images[0].url);
    } catch (error) {
      console.log(error);
    }
  }

  function getTextColor(hex: string) {
    const r = Number("0x" + hex.substring(1, 3))
    const g = Number("0x" + hex.substring(3, 5))
    const b = Number("0x" + hex.substring(5, 7))

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? "black" : "white"
  }
}

export default App;
