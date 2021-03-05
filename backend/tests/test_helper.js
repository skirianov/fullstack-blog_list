const Blog = require('../models/blog');

const initialBlogs = [
  {
    title: 'This is first blog post',
    author: 'Sergii Kirianov',
    url: 'lalalala.com',
    likes: 14,
  },
  {
    title: 'Second blog post',
    author: 'Sergii Kirianov',
    url: 'bridged.com',
    likes: 3,
  },
];

const blogsFromDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

module.exports = {
  initialBlogs,
  blogsFromDb,
}