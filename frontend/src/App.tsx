import { useEffect, useState } from "react";
import "./App.css";
import AlbumArt from "./components/AlbumArt";
import TrackInfo from "./components/TrackInfo";
import NoTrackPlaying from "./components/NoTrackPlaying";
import Login from "./components/Login";
import axios from "axios";

// CLEANUP TASKS:
// 1. Remove color thief call and replace with local calculation
// 3. Add comments

// ADDTL FEATURES:
// 1. Clock when no track playing
// 2. Remember me?

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
        const albumArt = new Image()
        albumArt.crossOrigin = "anonymous"
        albumArt.src = imageUrl

        albumArt.onload = () => {
          const canvas = document.createElement("canvas")
          const context = canvas.getContext("2d")
          canvas.width = albumArt.width
          canvas.height = albumArt.height
          context?.drawImage(albumArt, 0, 0, albumArt.width, albumArt.height)

          const imageData = context?.getImageData(0, 0, albumArt.width, albumArt.height).data

          if (imageData) {
            let r = 0, g = 0, b = 0, count = 0
            for (let i = 0; i <imageData.length; i+= 4) {
              r += imageData[i]
              g += imageData[i + 1]
              b += imageData[i + 2]
              count++
            }
            const hex = rgbToHex(Math.round(r / count), Math.round(g / count), Math.round(b / count))
            setBgColor(hex)
          }
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
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/spotify/refresh_token`, {
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

  function rgbToHex(r: number, g: number, b: number) {
    const redDiv16: number = r / 16
    const redWhole: number = Math.floor(redDiv16)
    const redDecimal: number = (redDiv16 - redWhole) * 16
    const redHex: string = redWhole.toString(16) + redDecimal.toString(16)


    const greenDiv16 = g / 16
    const greenWhole = Math.floor(greenDiv16)
    const greenDecimal = (greenDiv16 - greenWhole) * 16
    const greenHex: string = greenWhole.toString(16) + greenDecimal.toString(16)

    const blueDiv16 = b / 16
    const blueWhole = Math.floor(blueDiv16)
    const blueDecimal = (blueDiv16 - blueWhole) * 16
    const blueHex: string = blueWhole.toString(16) + blueDecimal.toString(16)

    return `#${redHex}${greenHex}${blueHex}`
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
