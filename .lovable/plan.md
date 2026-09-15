# Reading Mode paragraph pictures

## Goal
Show a relevant picture after every article paragraph, including a specially ordered set for the Boeing 747 article:
1. The first Boeing 747 flight
2. The Boeing factory
3. A close-up photograph beside a 747
4. The January 1970 Pan Am 747 arrival with nearby crowds

## What will change
- Add picture loading to Reading Mode after the article text finishes loading.
- Match one picture to each paragraph and place it directly beneath that paragraph.
- Add a loading placeholder while pictures are being prepared and a quiet fallback when a picture cannot be found.
- Cache picture choices so replaying an article loads the same pictures quickly.
- Use authoritative, reusable historical photographs where available rather than generic illustrations.
- Give the Boeing 747 article its requested four-picture sequence; other articles will receive searches based on their title and each paragraph’s subject.

## Technical details
- Add a backend function that searches Wikimedia Commons, validates reusable image files, copies them into app storage, and returns local image URLs with attribution details.
- Add a database table for cached article-picture metadata, with read access for the app and server-only writes.
- Add a public storage bucket for cached article pictures.
- Extend the Reading Mode article view to render paragraphs and their pictures as a single ordered sequence, with stable image dimensions, descriptive alt text, captions, and source links.
- Keep the book-report scoring and article text unchanged.

## Validation
- Open the Boeing 747 article and confirm all four requested pictures appear in order after paragraphs one through four.
- Open another article and confirm each paragraph receives a relevant picture.
- Replay both articles and confirm cached pictures load without being searched again.
- Check desktop and mobile layouts, missing-image behavior, and browser errors.
