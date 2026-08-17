# Contributing to FindLeads

Thank you for wanting to contribute! FindLeads is intentionally simple — three files, no build tools, no dependencies. Contributions that keep it that way are most welcome.

---

## 🗂️ Adding New Business Categories

The easiest and most impactful contribution is adding new business categories to the mapping table in [`app.js`](app.js).

### How the Mapping Table Works

The `CATEGORY_MAP` object at the top of `app.js` maps user-typed search terms to OpenStreetMap tag combinations.

**Structure:**
```js
'<user search term>': [
  { k: '<osm_key>', v: '<osm_value>' },
  // add more to create an OR condition
],
```

**Example — adding "comic book store":**
```js
// In CATEGORY_MAP in app.js:
'comic book store':  [{ k:'shop', v:'books' }, { k:'shop', v:'comics' }],
'comic books':       [{ k:'shop', v:'books' }, { k:'shop', v:'comics' }],
'comic shop':        [{ k:'shop', v:'comics' }],
```

### Finding the Right OSM Tags

Use the [OSM Wiki — Map Features](https://wiki.openstreetmap.org/wiki/Map_features) page to look up how your category is tagged in OpenStreetMap.

Common key prefixes:
| Key       | Used for                                   |
|-----------|--------------------------------------------|
| `shop`    | Retail shops, service businesses           |
| `amenity` | Public amenities — cafes, clinics, banks   |
| `leisure` | Fitness, parks, entertainment              |
| `office`  | Professional services — lawyers, insurers  |
| `tourism` | Hotels, galleries, museums                 |
| `sport`   | Sports venues and fitness studios          |

### Multiple synonyms

Always add multiple synonym keys pointing to the same tag array so users can type naturally:

```js
'plumber':    [{ k:'shop', v:'plumber' }],
'plumbers':   [{ k:'shop', v:'plumber' }],
'plumbing':   [{ k:'shop', v:'plumber' }],
```

---

## 🐛 Bug Reports

Please open a GitHub Issue with:
- What you searched for (category + city)
- What you expected to happen
- What actually happened
- Your browser and OS

---

## 💡 Feature Requests

Open a GitHub Issue with the label **enhancement**. Please explain:
- The use case you're solving
- How it fits the zero-cost, zero-dependency philosophy of the project

Large features that require a backend server, a build tool, or a paid API are out of scope.

---

## 🔀 Pull Request Guidelines

1. Keep changes focused — one PR per feature or fix
2. Do not introduce any new dependencies, npm packages, or build steps
3. Follow the existing code style (vanilla JS, no frameworks)
4. Test your change by opening `index.html` locally in a browser
5. If you add a new category, add at least three synonym keys

---

## ⚖️ License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
