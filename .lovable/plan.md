# Reading Mode picture coverage and business expansion

## Goal
Make every Reading Mode paragraph display at least one relevant picture, fix Deep Indian Kitchen’s incomplete and unrelated pictures, and add 200 new business stories with all three difficulty levels.

## What will change
- Improve picture searches so they focus on the paragraph’s actual subject, named places, people, products, events, and dates rather than broad or random words.
- Add stronger fallback searches for niche subjects, including food, restaurants, local businesses, and other topics with limited historical photographs.
- Reject clearly unrelated search results before saving them.
- Guarantee one picture slot per paragraph and allow a second picture where the paragraph covers two distinct visual subjects.
- Replace Deep Indian Kitchen’s existing cached picture choices so its paragraphs receive fresh, relevant pictures.
- Keep pictures unique across Reading Mode and preserve captions, credits, licenses, and source links.
- Add exactly 200 distinct real businesses to History → Businesses; each source story will automatically appear as Easy, Hard, and Extra Hard, creating 600 selectable versions.

## Technical details
- Extend the article-picture request with article topic and subtopic context.
- Score Wikimedia Commons candidates against the article subject and paragraph keywords, and use ordered fallback queries when exact matches are scarce.
- Add a controlled relevant-image fallback for paragraphs where Commons cannot supply an acceptable result, while retaining stable cached pictures.
- Invalidate only the incorrect Deep Indian Kitchen picture cache; existing good picture assignments remain unchanged.
- Add the 200 business records in a separate article data file and include it in the Reading Mode catalogue.

## Validation
- Open Deep Indian Kitchen at Easy, Hard, and Extra Hard and confirm every paragraph has at least one relevant picture.
- Test several unrelated articles across History, Science, Geography, Sports, Animals, and Other for complete paragraph picture coverage.
- Confirm no picture source is reused and that captions and credits remain visible.
- Confirm History → Businesses has 200 additional titles and every new title appears at all three difficulty levels.
- Check Reading Mode on desktop and mobile, including loading and missing-picture behavior.
