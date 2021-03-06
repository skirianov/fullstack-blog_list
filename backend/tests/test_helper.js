const Blog = require('../models/blog');
const User = require('../models/user');

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

const usersFromDb = async () => {
  const users = await User.find({});
  return users.map((eachUser) => eachUser.toJSON());
};

module.exports = {
  initialBlogs,
  blogsFromDb,
  usersFromDb,
}