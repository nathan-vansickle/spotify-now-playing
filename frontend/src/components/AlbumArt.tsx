interface AlbumArtPropTypes {
    imageUrl: string
}

export default function AlbumArt({imageUrl}:AlbumArtPropTypes) {
    return (
        <div className="flex flex-1 justify-center items-center mx-10">
            <img src={imageUrl} className="border-2 border-white"/>
        </div>
    )
}