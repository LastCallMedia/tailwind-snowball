const plugin = require("tailwindcss/plugin");
const _ = require("lodash");
const {flattenObj} = require('./util')

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
};

const snowball = plugin(function ({
  matchComponents,
  matchUtilities,
  addComponents,
  theme,
  e,
}) {
  const snowballs = theme("snowball");
  const styleComponents = {};

  Object.keys(snowballs).forEach((currentSnowballName) => {
    const currentSnowball = snowballs[currentSnowballName];

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

    // Create components for each snowball with styles.
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
  });
  addComponents(styleComponents);
});

module.exports = snowball;
