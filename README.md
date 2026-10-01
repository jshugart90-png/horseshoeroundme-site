# Horseshoe Round Me — marketing site

Static Netlify site for [horseshoeroundme.com](https://horseshoeroundme.com/). Irreverent military humor. No TYFYS fluff.

## Deploy

Point Netlify at this folder (or repo root if this *is* the repo). `publish = "."` in `netlify.toml`.

- Custom domain: apex `horseshoeroundme.com` (www → apex redirects in toml)
- Newsletter: Beehiiv subscribe embed on `#newsletter` (form id `03407fcf-b522-4ce4-8583-16a8f3747dad`; publication https://horseshoeroundme.beehiiv.com/) — not Netlify Forms
- Contact form: still Netlify Forms (`data-netlify="true"`) on `/contact`
- `/shop` redirects to `/#supply`

## Structure

```
index.html      page + Beehiiv newsletter embed
site.js         nav toggle, contact form AJAX, resources directory
styles.css      brand chrome
assets/logo.png compressed medallion
favicon.ico / favicon.png
robots.txt
netlify.toml
```

## Checkout links (do not invent new ones)

| Product | Link |
|---------|------|
| Roast Pack Vol. 1 ($7) | payhip.com/b/gXaYp |
| Lock Screen Drop ($5) | payhip.com/b/JlIWb |
| Sticker 5-Pack ($9) | buy.stripe.com/28EfZa9no0kv1oIddWffy08 |
| Tees & gear | Coming soon — newsletter CTA only |

## Local check

Open `index.html` in a browser, or `npx serve .` from this directory.
