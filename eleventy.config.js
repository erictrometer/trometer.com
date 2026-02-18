const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");
const { execSync } = require("child_process");
const path = require("path");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/images": "images" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({
    "node_modules/@fontsource-variable/inter/files": "fonts",
  });
  eleventyConfig.addPassthroughCopy({
    "node_modules/alpinejs/dist/cdn.min.js": "js/alpine.js",
  });

  eleventyConfig.on("eleventy.after", () => {
    execSync(
      `tailwindcss -i ${path.join(__dirname, "src/css/main.css")} -o ${path.join(__dirname, "_site/css/main.css")} --minify`,
      { stdio: "inherit" }
    );
  });

  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    extensions: "html",
    formats: ["webp", "jpeg"],
    widths: [400, 800],
    urlPath: "/img/",
    outputDir: "_site/img/",
    defaultAttributes: {
      loading: "lazy",
      decoding: "async",
      sizes: "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
    },
  });

  eleventyConfig.addFilter("json", (val) => JSON.stringify(val));
  eleventyConfig.addFilter("isoDate", (val) => val ? new Date(val).toISOString().split("T")[0] : "");

  eleventyConfig.addCollection("nav", function (collectionApi) {
    return collectionApi
      .getAll()
      .filter((p) => p.url && p.url !== "/" && p.data && p.data.nav)
      .filter((p) => !p.data.draft)
      .sort((a, b) => (a.data.navOrder ?? 99) - (b.data.navOrder ?? 99));
  });

  eleventyConfig.addCollection("projects", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/projects/*.md")
      .filter((p) => !p.data.draft)
      .sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
