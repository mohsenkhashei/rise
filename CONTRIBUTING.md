# Contributing to Rise Data

Thank you for your interest in contributing to **Rise**! This repository hosts the wallpapers and daily quotes displayed to users on their new tab pages. By contributing, you help make Rise more inspiring and beautiful for everyone.

---

## 🚀 How to Contribute

To suggest new quotes or wallpapers:
1. **Fork** this repository.
2. Create a new branch for your changes (e.g. `feat/add-new-quotes`).
3. Add your entries to `data/quotes.json` or `data/wallpapers.json` following the formats described below.
4. **Run the validation script** locally to ensure there are no formatting or connection errors (see [Validation](#-validation) below).
5. Open a **Pull Request** (PR) back to the main repository.
6. The automated check will run, and a maintainer will review your submission.

---

## 📝 Contribution Guidelines

### 💬 Quotes (`data/quotes.json`)
Each quote must be added as a JSON object at the end of the array in `data/quotes.json`:
```json
{
  "text": "Your quote text goes here.",
  "author": "Author Name"
}
```

#### ✅ What gets accepted:
*   **Theme**: Focus, discipline, productivity, deep work, philosophy, learning, and self-improvement.
*   **Conciseness**: Short, impactful sentences (ideally under 150 characters) that are easy to read in a single glance.
*   **Attribution**: Accurately credited authors (historical figures, writers, technologists, philosophers, etc.). Use "Unknown" if the author is truly anonymous.

#### ❌ What gets rejected:
*   **Duplicates**: Check if the quote is already present in the file (our CI script checks this automatically).
*   **Long-winded quotes**: Passages, paragraphs, or poetry that clutter the clean new tab layout.
*   **Negative or Demotivating themes**: Quotes focusing on despair, anger, or cynicism.
*   **Political or highly controversial topics**.

---

### 🖼️ Wallpapers (`data/wallpapers.json`)
Each wallpaper must be added as a JSON object in `data/wallpapers.json`:
```json
{
  "url": "https://images.unsplash.com/photo-...&w=1920&q=80",
  "photographer": "Photographer Name",
  "location": "City, Country or Landmark Name"
}
```

#### ✅ What gets accepted:
*   **Quality**: High-resolution landscape photography.
*   **Source**: We heavily prefer public domain or royalty-free images (like **Unsplash**).
*   **Resolution parameters**: For Unsplash URLs, ensure they contain `&w=1920&q=80` (or similar high-definition crop parameters) so they look crisp on modern displays.
*   **Composition**: Minimalist, clean landscapes, nature, architecture, and abstract background patterns. Ensure they have appropriate contrast to allow text overlays (the flip clock and quotes) to remain legible.

#### ❌ What gets rejected:
*   **Busy or noisy images**: Compositions with too many subjects or high-contrast patterns that make text illegible.
*   **Low resolution**: Images under 1920px wide or low-quality compression.
*   **Inappropriate content**: Images containing text, watermark labels, logos, people's faces (clearly visible), or sensitive subjects.
*   **Broken links**: URLs must return a direct image link with an `image/*` Content-Type and HTTP 200 (our CI checks this automatically).

---

## 🛠️ Validation

Before submitting a pull request, please run the validation script locally to ensure everything works:

```bash
python3 validate_data.py
```

Our automated CI workflow will run this check on every Pull Request. If any of the JSON structures are invalid, duplicates are found, or wallpaper URLs are broken, the check will fail.
