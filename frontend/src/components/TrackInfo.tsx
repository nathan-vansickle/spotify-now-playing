interface TrackInfoPropTypes {
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

export default function AlbumArt({
  title,
  artists,
  album,
}: TrackInfoPropTypes) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center mr-14">
      <p className="text-center text-3xl font-bold mb-6">{title}</p>
      <div className="flex flex-col mb-12">
        {artists.map((artist) => {
          return <p key={artist.name} className="text-center text-xl font-semibold">{artist.name}</p>;
        })}
      </div>
      <p className="text-center text-md">{album}</p>
    </div>
  );
}
