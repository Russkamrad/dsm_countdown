# DSM Russkamrad Countdown Site

Static website for GitHub Pages.

## Files
- `index.html` — page layout
- `style.css` — black/gold/patina/copper cracked-earth design
- `script.js` — countdown, progress, poll, video hub, music library, photo archive, comments, rating
- `translations.js` — DE / EN / RU texts
- `assets/music/` — put MP3 files here
- `assets/photos/` — put archive photos here

## GitHub Pages upload
1. Create a GitHub repository.
2. Upload all files from this folder.
3. Open repository settings.
4. Go to Pages.
5. Choose branch `main` and folder `/root`.
6. Save.

## Video Hub
In `script.js`, find:

```js
const russkamradVideos = [];
const communityVideos = [];
```

Put the YouTube video ID into `videoId`.
Example:

```js
{ title: "My DSM Video", channel: "DOBRAPOISK", videoId: "abc123XYZ" }
```

## Music library
Put MP3 files into `assets/music/`, then edit:

```js
const musicTracks = [
  { title: "Song title", file: "assets/music/song.mp3" }
];
```

## Photo archive
Put photos into `assets/photos/`, then edit:

```js
const photoArchive = [
  { title: "DSM 2024", image: "assets/photos/dsm-2024-1.jpg" }
];
```

Currently the page shows placeholders so the layout works even before real photos are added.

## Polls / comments / rating
Current version stores poll votes, comments and rating locally in the visitor's browser via `localStorage`.

For real shared data, use one of these:

### Simple version
Google Form + Google Sheet:
- best for poll voting
- easiest to moderate
- no payment method needed
- public results can be read as CSV

### Better version
Google Apps Script + Google Sheet:
- best for comments, ratings and polls
- still free for small community projects
- can return JSON
- can be connected directly from `script.js`

Recommended for this site: Google Apps Script + Google Sheet.
