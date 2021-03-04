/* eslint-disable arrow-body-style */
const _ = require('lodash');

const dummy = (blogs) => 1;

const totalLikes = (blogs) => (
  blogs.length === 0 ? 0 : blogs.reduce((sum, curr) => curr.likes + sum, 0)
);

const favoriteBlog = (blogs) => {
  // eslint-disable-next-line no-unused-expressions
  return blogs.length === 0 ? 0 : Math.max.apply(null, blogs.map((each) => each.likes));
};

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return 0;
  }
  const authors = _.uniq(blogs.map((blog) => blog.author));
  const count = _.countBy(blogs, (o) => {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < authors.length; i++) {
      if (o.author === authors[i]) {
        return o.author;
      }
    }
  });
  const max = Math.max.apply(null, Object.values(count));
  const author = Object.entries(count).filter(each => each[1] === max)[0];
  const result = { author: author[0], blogs: author[1] };
  return result;
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
};
