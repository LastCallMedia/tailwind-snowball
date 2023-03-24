# @lastcall/tailwind-snowball

TailwindCSS plugin that provides the ability to create components with their own color palettes, and also define component styles within tailwind config files.

## Installation

Install the plugin from npm

```
# npm
npm install -D @lastcallmedia/tailwind-snowball

# yarn
yarn add @lastcallmedia/tailwind-snowball --dev
```

Then add the plugin to your tailwind.config.js file

```
// tailwind.config.js
module.exports = {
  theme: {
    // ...
  },
  plugins: [
    require('@lastcallmedia/tailwind-snowball)
  ]
}
```

## Usage

Add a `snowball` section to you tailwind config file. Each top level property name of `snowball` becomes a component (referred to as a "snowball").

### Color Palettes

Each snowball has a `color` property, where individual color palettes are defined. By passing the `theme` function into your `snowball` property, you can easily reference colors that are defined within your config's `color` section.

```
// tailwind.config.js
module.exports = {
  theme: {
    colors: {
      primary: "#f44",
      secondary: "#2d2d2d",
      white: "#fff"
    },
    snowball: ({ theme }) => ({
      // Name of component
      button: {
        // Start of individual color palettes
        color: {
          interface: {
            // Palette properties can be single value
            surface: theme("colors.primary"),
            // Or they can be objects themselves
            ink: {
              // The "DEFAULT" use the palette property only for variable
              // assignments. Ex: --button--color--ink
              DEFAULT: theme("colors.white"),
              // other properties will have variable assignments that include
              // the subproperty. Ex: --button--color--ink-interaction
              interaction: theme("colors.secondary")
            }
          },
        }
      }
    })
  }
}
```

This creates the following color palette component class:

```
.sb-button-palette-secondary {
  --button--color--surface: #f44;
  --button--color--ink: #fff;
  --button--color--ink-interaction: #2d2d2d;
}
```

Additional utility classes are created for each palette property that use the variable to assign color values, following Tailwind's color-based class conventions (prefixed by `sb-${componentName}`).

Some examples:

```
.sb-button_bg-surface {
  backgroundColor: var(--button--color--surface)
}
.sb-button_text-ink {
  color: var(--button--color--ink)
}
.hover\:sb-button_text-ink-interaction {
  color: var(--button--color--ink-interaction)
}
```

You can easily define multiple color palettes for components, and use the utility classes to automatically assign different colors based on the current palette.

Ex:

```
<!-- Create a button using the "interface" palette defined above -->
<button class="sb-button-palette-interface sb-button_bg-surface">
  <span class="sb-button_text-ink hover:sb-button_text-ink-hover">Button Text</span>
</button>

<!-- Create a button using a different "cta" palette (not defined above) -->
<button class="sb-button-palette-cta sb-button_bg-surface">
  <span class="sb-button_text-ink hover:sb-button_text-ink-hover">Button Text</span>
</button>
```

### Component Styles

In addition to the `color` property on each snowball, you can also define a `styles` property. Directly beneath the `styles` you can define variants of said style.

Ex:

```
// tailwind.config.js
module.exports = {
  theme: {
    snowball: ({ theme }) => ({
      button2: {
        // Start of individual color palettes
        color: {
          // ...
        },
        styles: {
          // Styles added under the "_" property are applied to all variants
          _: {
            borderRadius: theme("borderRadius.lg")
          },
          // Using the "DEFAULT" property will create a component class `
          // Ex: .sb-button
          DEFAULT: {
            padding: theme("spacing.4")
          },
          // Other variant names will be appended to the base component name
          expanded: {
            padding: theme("spacing.8"),
          }
        }
      }
    })
  }
}
```

Produces the following components classes:

```
.sb-button {
  padding: 1rem;
  border-radius: 0.5rem;
}
.sb-button-expanded {
  padding: 2rem;
  border-radius: 0.5rem;
}
```

In general, these component styles can easily be added to HTML markup itself, but at times it can be able to apply styles without having to edit the markup with classes, etc.
