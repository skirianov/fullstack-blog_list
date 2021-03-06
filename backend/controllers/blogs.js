const blogsRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Blog = require('../models/blog');
const User = require('../models/user');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
  const { body } = request;
  const decodeToken = jwt.verify(request.token, process.env.TOKEN);
  console.log(decodeToken);

  if (!request.token || !decodeToken.id) {
    response.status(401).json({ error: 'unauthorized access, token is missing' });
  }

  const user = await User.findById(decodeToken.id);
  if (!body.likes) {
    body.likes = 0;
  }

  if (!body.title || !body.url) {
    response.status(400).end();
  } else {
    const blog_post = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: user._id,
    });

    const savedBlog = await blog_post.save();
    user.blogs = user.blogs.concat(savedBlog._id);
    await user.save();

    response.json(savedBlog);
  }
});

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id);

  if (blog) {
    response.json(blog);
  } else {
    response.status(404).end();
  }
});

blogsRouter.delete('/:id', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.TOKEN);

  const user = await User.findById(decodedToken.id);

  if (!request.token || !decodedToken.id) {
    response.status(401).json({ error: 'unauthorized access' });
  }

  const blog = await Blog.findById(request.params.id);
  if (blog.user.toString() === user._id.toString()) {
    await Blog.findByIdAndRemove(request.params.id);
    response.status(204).end();
  } else {
    response.status(401).json({ error: 'unauthorized token' });
  }
});

blogsRouter.put('/:id', async (request, response) => {
  const { body } = request;
  const blog_post = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  };

  const updated = await Blog.findByIdAndUpdate(request.params.id, blog_post, { new: true });
  response.json(updated);
})

module.exports = blogsRouter;
