# LinkDM Extension

Tampermonkey userscript. Parses Apollo's combined LinkedIn message blob into
selectable variants — no more manual text deletion.

## What it does

Apollo's copy button dumps Message 1, Message 2, and InMail into one block.
LinkDM adds a button to every LinkedIn and Sales Nav profile page. Click it after
copying from Apollo and each variant appears separately with a one-click copy button.

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) in Chrome
2. Click to install: [linkdm-extension.user.js](../../raw/main/linkdm-extension.user.js)
3. Click Install in the Tampermonkey prompt

## Usage

1. In Apollo, click the copy button on a LinkedIn task
2. Click through to the person's LinkedIn or Sales Nav profile
3. Click the blue **LinkDM** button (bottom right corner)
4. Click **Copy** next to the variant you need
5. Paste into the LinkedIn message field

## Updating

Push changes to `main` on GitHub. In Tampermonkey, click check for updates — or
reinstall from the raw URL.

## Dev

```bash
npm install
npm test
```
