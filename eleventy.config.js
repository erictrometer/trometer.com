const Image = require("@11ty/eleventy-img");
const { execSync } = require("child_process");
const path = require("path");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/images": "images" });
  eleventyConfig.addPassthroughCopy({
    "node_modules/@fontsource-variable/inter/files": "fonts",
  });

  eleventyConfig.on("eleventy.after", () => {
    execSync(
      `npx tailwindcss -i ${path.join(__dirname, "src/css/main.css")} -o ${path.join(__dirname, "_site/css/main.css")}`,
      { stdio: "inherit" }
    );
  });

  eleventyConfig.addFilter("json", (val) => JSON.stringify(val));
  eleventyConfig.addFilter("isoDate", (val) => val ? new Date(val).toISOString().split("T")[0] : "");

  // Normalizes project video data for the template. Supports:
  // - embedUrl (single string) — legacy, one video
  // - embedUrls (array of strings) — multiple videos, no labels
  // - videos (array) — multiple videos; each item can be a URL string or { url, label? }
  eleventyConfig.addFilter("normalizeVideos", (data) => {
    const { videos, embedUrls, embedUrl } = data || {};
    if (videos && videos.length) {
      return videos.map((v) =>
        typeof v === "string" ? { url: v, label: null } : { url: v.url, label: v.label || null }
      );
    }
    if (embedUrls && embedUrls.length) {
      return embedUrls.map((url) => ({ url, label: null }));
    }
    if (embedUrl) {
      return [{ url: embedUrl, label: null }];
    }
    return [];
  });

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

  eleventyConfig.addShortcode("image", async function (src, alt, widths = [400, 800, 1200]) {
    if (!src || src.startsWith("http")) {
      return `<img src="${src || 'https://placehold.co/800x450?text=Project'}" alt="${alt || ''}" loading="lazy" />`;
    }
    const metadata = await Image(src, {
      widths,
      formats: ["webp", "jpeg"],
      outputDir: "_site/img/",
      urlPath: "/img/",
    });
    const imageAttributes = { alt, loading: "lazy", decoding: "async" };
    return Image.generateHTML(metadata, imageAttributes);
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
