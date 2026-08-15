# mote-site

Old-school landing page for **mote** / **mote-x**.

Downloads come from GitHub **Releases** of the main `mote` repo.
Screenshots live only here under `gallery/` (real window captures — not in the editor repo).

## Setup

1. Edit [`config.js`](config.js) if needed (`owner`, `repo`, `siteRepo`).
2. Push and enable Pages yourself.
3. Put binaries only in **Releases** of `mote`.

## Regenerate screenshots

Needs a running X display, built Linux binaries, ImageMagick `import`/`convert`, and `python3-xlib`:

```sh
cd ~/Projects/mote-site
python3 _tools/capture_shots.py
```

Local preview:

```sh
cd ~/Projects/mote-site
python3 -m http.server 8080
```
