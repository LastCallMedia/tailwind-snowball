const plugin = require("tailwindcss/plugin");
const _ = require("lodash");
const {flattenObj} = require('./util');

const rulesets = {
  color: {
    accent: ["accentColor"],
    bg: ["backgroundColor"],
    border: ["borderColor"],
    "border-t": ["borderTopColor"],
    "border-l": ["borderLeftColor"],
    "border-r": ["borderRightColor"],
    "border-b": ["borderBottonColor"],
    caret: ["caretColor"],
    decoration: ["textDecorationColor"],
    divide: ["borderColor"],
    outline: ["outlineColor"],
    ring: ["--tw-ring-color"],
    // TODO: ring-offset
    shadow: ["--tw-shadow-color"],
    text: ["color"],
  },
  fontFamily: {
    font: ["fontFamily"]
  },
  borderRadius: {
    rounded: ["borderRadius"],
    "rounded-tl": ["borderTopLeftRadius"],
    "rounded-tr": ["borderRadiusTopRight"],
    "rounded-t": ["borderTopLeftRadius","borderTopRightRadius"],
    "rounded-bl": ["borderBottomLeftRadius"],
    "rounded-br": ["borderBottomRightRadius"],
    "rounded-b": ["borderBottomLeftRadius", "borderBottomRightRadius"],
    "rounded-l": ["borderTopLeftRadius", "borderBottomLeftRadius"],
    "rounded-r": ["borderTopRightRadius", "borderBottomRightRadius"]
  },
  shadow: {
    shadow: ["--tw-shadow-color"]
  },
  spacing: {
    gap: ["gap"],
    "gap-x": ["columnGap"],
    "gap-y": ["rowGap"],
    p: ["padding"],
    px: ["paddingLeft", "paddingRight"],
    py: ["paddingTop", "paddingBottom"],
    pl: ["paddingLeft"],
    pr: ["paddingRight"],
    m: ["margin"],
    mx: ["marginLeft", "marginRight"],
    my: ["marginTop", "marginBottom"],
    ml: ["marginLeft"],
    mr: ["marginRight"],
    w: ["width"],
    "max-w": ["maxWidth"],
    "min-w": ["minWidth"],
    h: ["height"],
    "max-h": ["maxHeight"],
    "min-h": ["minHeight"],
    // TODO: support nested css rules for space-x and space-y
    //"space-x": []
    //"space-y": []
  }
};

const snowball = plugin(function ({
  matchComponents,
  matchUtilities,
  addComponents,
  theme
}) {
  const snowballs = theme("snowball");
  const styleComponents = {};

  Object.keys(snowballs).forEach((currentSnowballName) => {
    const currentSnowball = snowballs[currentSnowballName];

    // Create color palettes.
    if (typeof currentSnowball.color !== "undefined") {
      // Get a set of sample pallette properties. Ex: "ink", "surface", "accent".
      const paletteSampleVariantName = Object.keys(currentSnowball.color)[0];
      const paletteProperties = Object.keys(
        currentSnowball.color[paletteSampleVariantName]
      );

      // Create a component matcher that defines a list of variables for
      // each color property in the color palette.
      // Supports subproperties in the form of nested objects.
      const paletteComponents = {};
      paletteComponents[`sb-${currentSnowballName}-palette`] = (value) => [
        ...paletteProperties.map((elem) => {
          if (typeof value[elem] === "string") {
            const variableKey = `--${currentSnowballName}--color--${elem}`;
            return { [variableKey]: value[elem] };
          } else {
            const flattened = flattenObj(value[elem]);
            const paletteComponent = Object.fromEntries(
              Object.entries(flattened).map(([key, value]) => {
                const cssVariableName =
                  key === "DEFAULT"
                    ? `--${currentSnowballName}--color--${elem}`
                    : `--${currentSnowballName}--color--${elem}-${key}`;
                return [cssVariableName, value];
              }));

            return paletteComponent;
          }
        }),
      ];
      matchComponents(paletteComponents, {
        values: snowballs[currentSnowballName].color,
      });

      // Create utility functions for each of the color palette properties and their
      // associated variables.
      const rulesetUtilities = Object.fromEntries(
        Object.entries(rulesets.color).map(([elem, cssProperties]) => {
          return [
            `sb-${currentSnowballName}_${elem}`,
            (value) => {
              return Object.fromEntries(
                cssProperties.map((property) => [property, `var(${value})`])
              );
            },
          ];
        })
      );

      const utilityValues = {};
      paletteProperties.forEach((e) => {
        if (
          typeof currentSnowball.color[paletteSampleVariantName][e] === "string"
        ) {
          utilityValues[e] = [`--${currentSnowballName}--color--${e}`];
        } else {
          const subProps = flattenObj(
            currentSnowball.color[paletteSampleVariantName][e]
          );
          Object.entries(subProps).forEach(([subProp, value]) => {
            const isDefault = subProp === "DEFAULT";
            const utilityName = isDefault ? e : `${e}-${subProp}`;
            utilityValues[utilityName] = [
              isDefault
                ? `--${currentSnowballName}--color--${e}`
                : `--${currentSnowballName}--color--${e}-${subProp}`,
            ];
          });
        }
      });
      matchUtilities(rulesetUtilities, { values: utilityValues });

    }

    // Create utility classes each snowball.
    const utilBase = currentSnowball.utility;
    if (typeof utilBase !== "undefined") {
      Object.entries(utilBase).forEach(([propertyType, propertyTypeVariants]) => {
        const utils = {}
        Object.keys(rulesets[propertyType]).forEach(propertySubType => {
          // TODO: Clean up this logic, use object.fromEntries
          const css = {}
          utils[`sb-${currentSnowballName}_${propertySubType}`] = (value) => {
            rulesets[propertyType][propertySubType].forEach(key => {
              css[key] = value
            })
            return css
          }
        })
        matchUtilities(utils, {
          values: Object.fromEntries(Object.keys(utilBase[propertyType]).map((item) => {
            return [item, currentSnowball.utility[propertyType][item]]
          }))
        })
      })
    }


    // Create components for each snowball with styles.
    if (typeof currentSnowball.styles !== "undefined") {
      const base = currentSnowball.styles._ || {};
      delete currentSnowball.styles._;
      const currentSnowballStyleComponents = Object.fromEntries(
        Object.entries(currentSnowball.styles).map(([variant, value]) => {
          const isDefault = variant === "DEFAULT";
          return [
            isDefault
              ? `.sb-${currentSnowballName}`
              : `.sb-${currentSnowballName}-${variant}`,
            _.merge(value, base),
          ];
        })
      );
      Object.assign(styleComponents, currentSnowballStyleComponents);
    }
  });
  addComponents(styleComponents);
});

module.exports = snowball;
