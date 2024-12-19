import { useEffect, useState } from "react";
import "./App.css";
import "./components/AlbumArt";
import AlbumArt from "./components/AlbumArt";
import TrackInfo from "./components/TrackInfo";
// import cover from "./assets/album.jpg";
import axios from "axios";
import { getColor } from "color-thief-react";
import NoTrackPlaying from "./components/NoTrackPlaying";
import Login from "./components/Login";

interface Track {
  title: string;
  artists: Artist[];
  album: string;
}

interface Artist {
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}

function App() {
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [bgColor, setBgColor] = useState("#000000");
  const [track, setTrack] = useState<Track>({
    title: "",
    artists: [],
    album: "",
  });
  const [isPlaying, setIsPlaying] = useState(false);

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

    const intervalId = setInterval(getCurrentTrack, 1000);
    return () => clearInterval(intervalId);
  }, [accessToken]);

  useEffect(() => {
    async function getDominantColor() {
      if (imageUrl) {
        try {
          const dominantColor = await getColor(imageUrl, "hex", "anonymous");
          setBgColor(dominantColor);
        } catch (error) {
          console.log(error);
        }
      }
    }

    getDominantColor();
  }, [imageUrl]);

  if (!accessToken) {
    return <Login />;
  } else {
    if (!isPlaying) {
      return <NoTrackPlaying />;
    } else {
      return (
        <div>
          <div
            className={`grid grid-cols-2 grid-rows-1 h-screen`}
            style={{ backgroundColor: bgColor, color: getTextColor(bgColor) }}
          >
            <AlbumArt imageUrl={imageUrl} />
            <TrackInfo
              title={track.title}
              artists={track.artists}
              album={track.album}
            />
          </div>
        </div>
      );
    }
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

      // Un-comment to see raw JSON response
      // console.log(response.data);

      setTrack({
        title: response.data.item.name,
        artists: response.data.item.artists,
        album: response.data.item.album.name,
      });
      setIsPlaying(true);
      setImageUrl(response.data.item.album.images[0].url);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status == 400) {
        const newToken = await refreshAccessToken();

        if (newToken) {
          getCurrentTrack()
        }
      }
    }

    async function refreshAccessToken() {
      try {
        const response = await axios.post("/refresh_token", {
          refreshToken: refreshToken,
        });

        if (response.data.access_token) {
          setAccessToken(response.data.access_token);

          if (response.data.refresh_token) {
            setRefreshToken(response.data.refresh_token);
          }

          return response.data.access_token;
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  function getTextColor(hex: string) {
    const r = Number("0x" + hex.substring(1, 3));
    const g = Number("0x" + hex.substring(3, 5));
    const b = Number("0x" + hex.substring(5, 7));

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? "black" : "white";
  }
}

export default App;
