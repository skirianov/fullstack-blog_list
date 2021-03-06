const Blog = require('../models/blog');
const User = require('../models/user');

const initialBlogs = [
  {
    title: 'This is first blog post',
    author: 'Sergii Kirianov',
    url: 'lalalala.com',
    likes: 14,
    user: '60441416aba8fc620198f053',
  },
  {
    title: 'Second blog post',
    author: 'sosro',
    url: 'bridged.com',
    likes: 3,
    user: '60441416aba8fc620198f053',
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