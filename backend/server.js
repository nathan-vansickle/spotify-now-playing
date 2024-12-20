const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

if (process.env.NODE_ENV === "development") {
  dotenv.config({path: ".env"})
}

const app = express();
const port = process.env.PORT || 5000;

const SCOPES = "user-read-playback-state user-read-currently-playing";
const AUTHORIZE_URL = "https://accounts.spotify.com/authorize";

app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
  })
);
app.use(express.json());

app.get("/spotify/login", (req, res) => {
  const authUrl = new URL(AUTHORIZE_URL);

  authUrl.searchParams.set("client_id", process.env.SPOTIFY_CLIENT_ID);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", process.env.SPOTIFY_REDIRECT_URI);
  authUrl.searchParams.set("scope", SCOPES);

  res.redirect(authUrl.toString());
});

app.get("/spotify/callback", async (req, res) => {
  const { code } = req.query;

  try {
    const tokenResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            new Buffer.from(
              process.env.SPOTIFY_CLIENT_ID +
                ":" +
                process.env.SPOTIFY_CLIENT_SECRET
            ).toString("base64"),
        },
      }
    );

    const frontendRedirectUrl = new URL(process.env.FRONTEND_URL);
    frontendRedirectUrl.searchParams.set(
      "access_token",
      tokenResponse.data.access_token
    );
    frontendRedirectUrl.searchParams.set(
      "refresh_token",
      tokenResponse.data.refresh_token
    );

    res.redirect(frontendRedirectUrl.toString());
  } catch (error) {
    console.error(error);
  }
});

app.post("/spotify/refresh_token", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status.json({ Error: "Refresh token is expired" });
    }

    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            new Buffer.from(
              process.env.SPOTIFY_CLIENT_ID +
                ":" +
                process.env.SPOTIFY_CLIENT_SECRET
            ).toString("base64"),
        },
      }
    );

    res.json({
      access_token: response.data.access_token,
      refresh_token: response.data.access_token,
      token_type: response.data.token_type,
    });
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
