# &lt;video-stream&gt;

Web Component using Polymer that extends the &lt;video&gt; tag to automatically switch between media resolutions.

## Install

Using bower:
```
bower install video-stream
```

## Usage

1. Import Web Components' polyfill:

```html
<script src="//cdnjs.cloudflare.com/ajax/libs/polymer/0.2.3/platform.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/polymer/0.2.3/polymer.js"></script>
```

2. Import Custom Element:

```html
<link rel="import" href="./components/video-stream">
```

3. Start using it!

```html
<video is="video-stream"></video>
```

Use the [index.html](http://rawgit.com/makesites/video-stream/master/examples/index.html) as an example.


## Options

All regular video attributes are left unchanged.

The sources are listed as children tags and each source needs to have its dimensions defined as attributes:
```
<video is="video-stream">
...
<source type="video/mp4" src="/video/url.mp4" width="1024" height="576">
...
</video>
```


## Conventions

Switching between resolutions is bound to specific rules:

* The video size cannot be bigger than the video area on the page
* If the used memory reaches 90% it will downgrade the target resolution to half
* If the buffering download rate is very low it will switch to the smallest resolution


## Credits

Initiated by Makis Tracend ( [@tracend](http://github.com/tracend) )

Distributed through [Makesites.org](http://makesites.org)


## License

[MIT License](http://opensource.org/licenses/MIT)
