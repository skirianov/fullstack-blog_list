const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const helper = require('./test_helper');

const api = supertest(app);

const Blog = require('../models/blog');

beforeEach(async () => {
  await Blog.deleteMany();

  const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
  const promiseArray = blogObjects.map((blog) => blog.save());
  await Promise.all(promiseArray);
});

test('getting all blog-posts', async () => {
  const response = await api.get('/api/blogs');

  expect(response.body).toHaveLength(helper.initialBlogs.length);
});

test('getting post by id', async () => {
  const blogs = await helper.blogsFromDb();
  const blogToFind = blogs[0];

  const resultBlog = await api
    .get(`/api/blogs/${blogToFind.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const processedBlogToView = JSON.parse(JSON.stringify(blogToFind));

  expect(resultBlog.body).toEqual(processedBlogToView);
});

test('posting a new blog', async () => {
  const newBlog = {
    title: 'This is test blog',
    author: 'test',
    url: 'test.com',
    likes: 3,
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const blogsAfter = await helper.blogsFromDb();
  expect(blogsAfter).toHaveLength(helper.initialBlogs.length + 1);

  const contents = blogsAfter.map((blog) => blog.title);
  expect(contents).toContain('This is test blog');
});

test('if submitted without likes, default likes to 0', async () => {
  const newBlog = {
    title: 'This is test blog',
    author: 'test',
    url: 'test.com',
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const blogsAfter = await helper.blogsFromDb();
  expect(blogsAfter).toHaveLength(helper.initialBlogs.length + 1);

  const likes = blogsAfter[blogsAfter.length-1].likes;
  expect(likes).toBe(0);
});

test('if submitted without title and url, status code 400', async () => {
  const newBlog = {
    author: 'test',
    likes: 4,
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const blogsAfter = await helper.blogsFromDb();
  expect(blogsAfter).toHaveLength(helper.initialBlogs.length);
});

afterAll(() => {
  mongoose.connection.close();
})