module.exports = {
  layout: "project.njk",
  tags: "project",
  eleventyComputed: {
    permalink: (data) => `/${data.slug}/`,
  },
};
