# ios-video-test

Testing HTML5 video in iPhone5S, iOS9. Features:

- Inline Playback (i.e. no full screen w/ controls)
- Auto plays (if `muted` is passed)
- WebGL Processing (if available; falls back to Canvas2D)
- Going into landscape hides status bars
- Letterboxing

## Demo

The demo, which should play inline and with WebGL effects in iPhone iOS9.

http://jam3.github.io/ios-video-test/

The following shows auto play in iOS9, which is only supported when muted.

http://jam3.github.io/ios-video-test/?muted=true

## Screenshots

Playback in portrait:

<img src="http://i.imgur.com/1u6N2kl.png" width="50%" />

After rotating into landscape:

<img src="http://i.imgur.com/jeApYBu.png" width="50%" />

After tapping on top of screen to show status bars:

<img src="http://i.imgur.com/IUCBbBu.png" width="50%" />

## How Does it Work?

This renders video frames to a `<canvas>` element. It uses WebGL if available, otherwise Canvas2D.

For iPhone browsers, this uses a hack to avoid the full-screen controls (which destroys WebGL processing).

When `muted` is true, it simply seeks forward to the next frame and renders the `<video>` to the canvas. This allows it to auto play.

When `muted` is false, and audio is desired, this creates two media elements: a muted `<video>` element, and a `<audio>` element, pointing to the same source. Once both are loaded and ready, it plays the Audio tag, and on update, seeks the video to the `audio.currentTime` to keep things in sync.

In other browsers and on desktop, the rendering is more standard for best performance and sync. It is simply a `<video>` element rendered every frame into a WebGL texture.

## Limitations

- This has only been tested on iPhone 5S iOS9.
- Sometimes the demo will time out; for some reason the `'canplaythrough'` event is not always fired 
- This has only been tested with a limited set of video/audio formats and a small & short video file
- This may cause audio sync problems with long videos

## Roadmap

The source will eventually be modularized, and more experimentation will be done with other video/audio formats.

## License

MIT, see [LICENSE.md](http://github.com/Jam3/ios-video-test/blob/master/LICENSE.md) for details.
