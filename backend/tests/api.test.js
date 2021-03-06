const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const helper = require('./test_helper');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const api = supertest(app);

const Blog = require('../models/blog');
const User = require('../models/user');

let token;

describe('when already one entry in DB', () => {
  beforeEach(async () => {
    await User.deleteMany();

    const passwordHash = await bcrypt.hash('test', 10);
    const user = new User({
      username: 'test',
      passwordHash,
    });

    await user.save();
  });

  test('post a new user', async () => {
    const usersBefore = await helper.usersFromDb();

    const newUser = {
      username: 'test-test',
      name: 'testing user',
      password: 'testtest',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const usersAfter = await helper.usersFromDb();
    expect(usersAfter).toHaveLength(usersBefore.length + 1);

    const usernames = usersAfter.map((user) => user.username);
    expect(usernames).toContain(newUser.username);
  });

  test('user is not added if username is missing', async () => {
    const usersBefore = await helper.usersFromDb();

    const newUser = {
      name: 'test',
      password: 'test',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    const usersAfter = await helper.usersFromDb();
    expect(usersAfter).toHaveLength(usersBefore.length);
  });

  test('user is not added if password is missing', async () => {
    const usersBefore = await helper.usersFromDb();

    const newUser = {
      username: 'test',
      name: 'test',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    const usersAfter = await helper.usersFromDb();
    expect(usersAfter).toHaveLength(usersBefore.length);
  });

  test('user is not added if password or username is less than 3 characters long', async () => {
    const usersBefore = await helper.usersFromDb();

    const newUser = {
      username: 'test12',
      name: 'test',
      password: 'qq',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    const usersAfter = await helper.usersFromDb();
    expect(usersAfter).toHaveLength(usersBefore.length);
  });

});

describe('blog tests', () => {
  beforeEach(async () => {
    await Blog.deleteMany();

    const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
    const promiseArray = blogObjects.map((blog) => blog.save());
    await Promise.all(promiseArray);
  });

  beforeAll(async (done) => {
    const user = await User.findOne({ username: 'test' });
    if (await bcrypt.compare('test', user.passwordHash)) {
      await api
        .post('/api/login')
        .send({
          username: 'test',
          password: 'test',
        })
        .end((err, response) => {
          token = response.body.token;
          console.log(token);
          done();
        });
    }
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
    console.log(token);
    const user = await User.findOne({ username: 'test' });

    const newBlog = {
      title: 'This is test blog',
      author: 'test',
      url: 'test.com',
      likes: 3,
      user: user.id,
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
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
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const blogsAfter = await helper.blogsFromDb();
    expect(blogsAfter).toHaveLength(helper.initialBlogs.length + 1);

    const likes = blogsAfter[blogsAfter.length - 1].likes;
    expect(likes).toBe(0);
  });

  test('if submitted without title and url, status code 400', async () => {
    const newBlog = {
      author: 'test',
      likes: 4,
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(400);

    const blogsAfter = await helper.blogsFromDb();
    expect(blogsAfter).toHaveLength(helper.initialBlogs.length);
  });

  test('the specific blog can be deleted', async () => {
    const decodedToken = jwt.verify(token, process.env.TOKEN);
    const user = await User.findById(decodedToken.id);
    const blogsBefore = await helper.blogsFromDb();
    const blogToDelete = blogsBefore[0];

    if (user._id.toString() ===  blogToDelete.user.toString()) {
      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);
    }
    const blogsAfter = await helper.blogsFromDb();

    expect(blogToDelete).not.toContain(blogsAfter);
    expect(blogsAfter).toHaveLength(blogsBefore.length - 1);
  });

  test('update specific blog', async () => {
    const blogsBefore = await helper.blogsFromDb();
    const updatingBlog = blogsBefore[0];

    const newBlog = {
      title: updatingBlog.title,
      author: updatingBlog.author,
      url: updatingBlog.url,
      likes: updatingBlog.likes + 1,
    };

    await api
      .put(`/api/blogs/${updatingBlog.id}`)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const blogsAfter = await helper.blogsFromDb();
    const updatedBlog = blogsAfter[0];

    expect(updatedBlog.likes).toBe(updatingBlog.likes + 1);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
