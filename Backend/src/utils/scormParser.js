const fs = require("fs");
const xml2js = require("xml2js");

exports.parseManifest = async (manifestPath) => {
  const xml = fs.readFileSync(manifestPath, "utf-8");
  const data = await xml2js.parseStringPromise(xml);

  const resource =
    data.manifest.resources[0].resource[0].$;

  return {
    entryPoint: resource.href
  };
};
