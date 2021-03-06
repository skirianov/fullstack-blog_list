const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
  const { body } = request;

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
    });

    console.log(blog_post);
    const result = await blog_post.save();
    response.json(result);
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
  await Blog.findByIdAndRemove(request.params.id);
  response.status(204).end();
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
