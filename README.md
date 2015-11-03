# ios-video-test

Testing HTML5 video in iPhone5S, iOS9. Features:

- Inline Playback (i.e. no full screen w/ controls)
- Auto plays (if `muted` is passed)
- WebGL Processing (if available; falls back to Canvas2D)
- Going into landscape hides status bars
- Letterboxing

## How Does it Work?

This renders video frames to a `<canvas>` element. It uses WebGL if available, otherwise Canvas2D.

In most browsers, a `<video>` element is passed to a WebGL texture and rendered per frame.

In `iPhone/iPad` browsers (configurable), this uses a hack to avoid the full-screen controls (which destroys WebGL processing).

## Roadmap

The source will eventually be modularized, and more experimentation will be done with other video/audio formats.

## License

MIT, see [LICENSE.md](http://github.com/Jam3/ios-video-test/blob/master/LICENSE.md) for details.
