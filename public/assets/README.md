# Assets Folder

This folder contains all static assets for the Data Cleaner project.

## Folder Structure

```
assets/
├── images/          # Upload your images here (PNG, JPG, SVG, etc.)
├── fonts/           # Upload custom fonts here (TTF, WOFF, WOFF2, etc.)
└── icons/           # Upload icon files here (SVG, PNG, etc.)
```

## How to Use

### Images
- Place your images in the `images/` folder
- Reference them in your code like this:
  ```jsx
  <img src="/assets/images/your-image.png" alt="Description" />
  ```

### Fonts
- Place your font files in the `fonts/` folder
- Reference them in your CSS like this:
  ```css
  @font-face {
    font-family: 'YourFont';
    src: url('/assets/fonts/your-font.woff2') format('woff2');
  }
  ```

### Icons
- Place your icon files in the `icons/` folder
- Reference them in your code like this:
  ```jsx
  <img src="/assets/icons/your-icon.svg" alt="Icon" />
  ```

## Supported File Types

### Images
- PNG, JPG, JPEG, GIF, WebP, SVG

### Fonts
- TTF, WOFF, WOFF2, OTF

### Icons
- SVG, PNG, ICO

## Best Practices

1. **File Naming**: Use kebab-case for file names (e.g., `hero-image.png`)
2. **Optimization**: Compress images before uploading for better performance
3. **Alt Text**: Always provide meaningful alt text for images
4. **File Size**: Keep files reasonably sized for faster loading
