const flattenObj = (ob, prefix = "") => {
    let result = {};
    for (const i in ob) {
      if (typeof ob[i] === "object" && !Array.isArray(ob[i])) {
        const temp = flattenObj(ob[i]);
        for (const j in temp) {
          // Store temp in result
          result[i + "-" + j] = temp[j];
        }
      }
  
      // Else store ob[i] in result directly
      else {
        result[prefix + i] = ob[i];
      }
    }
    return result;
  };

module.exports = {flattenObj};