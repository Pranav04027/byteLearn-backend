// USAGE: npm install @faker-js/faker bcrypt && node src/faker.js
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';

import { User } from './models/user.models.js';
import { Video } from './models/video.models.js';
import { Quiz } from './models/quiz.models.js';
import { QuizAttempt } from './models/quizAttempt.models.js';
import { Like } from './models/like.models.js';
import { Post } from './models/post.models.js';
import { Bookmark } from './models/bookmark.models.js';
import { Comment } from './models/comment.models.js';
import { Playlist } from './models/playlist.models.js';
import { Subscription } from './models/subscription.models.js';
import { DB_NAME } from './constants.js';

const MONGODB_URI = `${process.env.MONGODB_URI}/${DB_NAME}`;

// Configurable data volume
const NUM_USERS = 20;
const NUM_VIDEOS = 30;
const NUM_POSTS = 15;
const NUM_COMMENTS = 40;
const NUM_PLAYLISTS = 10;
const NUM_BOOKMARKS = 30;
const NUM_LIKES = 60;
const NUM_SUBSCRIPTIONS = 20;
const NUM_QUIZZES = 15;
const NUM_QUIZ_ATTEMPTS = 25;

function getRandom(arr, n = 1) {
  if (n === 1) return arr[Math.floor(Math.random() * arr.length)];
  return faker.helpers.arrayElements(arr, n);
}

async function clearCollections() {
  await Promise.all([
    User.deleteMany({}),
    Video.deleteMany({}),
    Quiz.deleteMany({}),
    QuizAttempt.deleteMany({}),
    Like.deleteMany({}),
    Post.deleteMany({}),
    Bookmark.deleteMany({}),
    Comment.deleteMany({}),
    Playlist.deleteMany({}),
    Subscription.deleteMany({}),
  ]);
  console.log('All collections cleared.');
}

async function seedUsers() {
  const users = [];
  const roles = ['learner', 'instructor'];
  for (let i = 0; i < NUM_USERS; i++) {
    const role = roles[i % 2];
    const password = 12345678;
    users.push({
      username: faker.internet.username().toLowerCase() + faker.string.alphanumeric(4),
      email: faker.internet.email().toLowerCase(),
      fullname: faker.person.fullName(),
      avatar: `https://placehold.co/128x128?text=Avatar+${i+1}`,
      coverImage: `https://placehold.co/600x200?text=Cover+${i+1}`,
      role,
      password,
      progress: [],
      bookmarks: [],
      watchHistory: [],
    });
  }
  const created = await User.insertMany(users);
  console.log('Users seeded:', created.length);
  return created;
}

async function seedVideos(users) {
  const videos = [];
  for (let i = 0; i < NUM_VIDEOS; i++) {
    const owner = getRandom(users);
    videos.push({
      videofile: `https://placehold.co/640x360?text=Video+${i+1}`,
      thumbnail: `https://placehold.co/320x180?text=Thumb+${i+1}`,
      title: faker.lorem.words(4) + ' ' + faker.string.alphanumeric(4),
      description: faker.lorem.paragraph(),
      category: faker.music.genre(),
      difficulty: getRandom(['beginner', 'intermediate', 'advanced']),
      tags: faker.lorem.words(3).split(' '),
      duration: `${faker.number.int({ min: 60, max: 3600 })}s`,
      owner: owner._id,
      isPublished: true,
      views: faker.number.int({ min: 0, max: 10000 }),
    });
  }
  const created = await Video.insertMany(videos);
  console.log('Videos seeded:', created.length);
  return created;
}

async function seedQuizzes(videos) {
  const quizzes = [];
  const usedVideos = new Set();
  for (let i = 0; i < NUM_QUIZZES; i++) {
    let video;
    do {
      video = getRandom(videos);
    } while (usedVideos.has(video._id.toString()));
    usedVideos.add(video._id.toString());
    const questions = Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () => {
      const options = Array.from({ length: 4 }, () => ({
        text: faker.lorem.words(2),
        isCorrect: false,
      }));
      const correctIdx = faker.number.int({ min: 0, max: 3 });
      options[correctIdx].isCorrect = true;
      return {
        questionText: faker.lorem.sentence(),
        options,
      };
    });
    quizzes.push({
      video: video._id,
      questions,
    });
  }
  const created = await Quiz.insertMany(quizzes);
  console.log('Quizzes seeded:', created.length);
  return created;
}

async function seedPosts(users) {
  const posts = [];
  for (let i = 0; i < NUM_POSTS; i++) {
    posts.push({
      content: faker.lorem.sentences(2),
      owner: getRandom(users)._id,
    });
  }
  const created = await Post.insertMany(posts);
  console.log('Posts seeded:', created.length);
  return created;
}

async function seedComments(users, videos) {
  const comments = [];
  const seen = new Set();
  for (let i = 0; i < NUM_COMMENTS; i++) {
    let user, video, key;
    do {
      user = getRandom(users);
      video = getRandom(videos);
      key = user._id.toString() + '-' + video._id.toString();
    } while (seen.has(key));
    seen.add(key);
    comments.push({
      content: faker.lorem.sentence(),
      video: video._id,
      owner: user._id,
    });
  }
  const created = await Comment.insertMany(comments);
  console.log('Comments seeded:', created.length);
  return created;
}

async function seedPlaylists(users, videos) {
  const playlists = [];
  for (let i = 0; i < NUM_PLAYLISTS; i++) {
    const owner = getRandom(users);
    const vids = getRandom(videos, faker.number.int({ min: 2, max: 5 }));
    playlists.push({
      name: faker.lorem.words(3),
      description: faker.lorem.sentence(),
      owner: owner._id,
      videos: vids.map(v => v._id),
    });
  }
  const created = await Playlist.insertMany(playlists);
  console.log('Playlists seeded:', created.length);
  return created;
}

async function seedBookmarks(users, videos) {
  const bookmarks = [];
  const seen = new Set();
  for (let i = 0; i < NUM_BOOKMARKS; i++) {
    let user, video, key;
    do {
      user = getRandom(users);
      video = getRandom(videos);
      key = user._id.toString() + '-' + video._id.toString();
    } while (seen.has(key));
    seen.add(key);
    bookmarks.push({
      user: user._id,
      video: video._id,
    });
  }
  const created = await Bookmark.insertMany(bookmarks);
  console.log('Bookmarks seeded:', created.length);
  return created;
}

async function seedLikes(users, videos, comments, posts) {
  const likes = [];
  for (let i = 0; i < NUM_LIKES; i++) {
    const likedBy = getRandom(users)._id;
    const type = getRandom(['video', 'comment', 'post']);
    let like = { likedBy };
    if (type === 'video') like.video = getRandom(videos)._id;
    if (type === 'comment') like.comment = getRandom(comments)._id;
    if (type === 'post') like.post = getRandom(posts)._id;
    likes.push(like);
  }
  const created = await Like.insertMany(likes);
  console.log('Likes seeded:', created.length);
  return created;
}

async function seedSubscriptions(users) {
  const subscriptions = [];
  const seen = new Set();
  for (let i = 0; i < NUM_SUBSCRIPTIONS; i++) {
    let subscriber, channel, key;
    do {
      subscriber = getRandom(users);
      channel = getRandom(users);
      key = subscriber._id.toString() + '-' + channel._id.toString();
    } while (subscriber._id.equals(channel._id) || seen.has(key));
    seen.add(key);
    subscriptions.push({
      subscriber: subscriber._id,
      channel: channel._id,
    });
  }
  const created = await Subscription.insertMany(subscriptions);
  console.log('Subscriptions seeded:', created.length);
  return created;
}

async function seedQuizAttempts(users, quizzes) {
  const attempts = [];
  for (let i = 0; i < NUM_QUIZ_ATTEMPTS; i++) {
    const user = getRandom(users);
    const quiz = getRandom(quizzes);
    const video = quiz.video;
    const submittedAnswers = quiz.questions.map(q => {
      const selected = getRandom(q.options);
      return {
        question: q.questionText,
        selectedOption: selected.text,
        isCorrect: selected.isCorrect,
      };
    });
    const score = submittedAnswers.filter(a => a.isCorrect).length;
    attempts.push({
      user: user._id,
      video,
      score,
      total: quiz.questions.length,
      submittedAnswers,
    });
  }
  const created = await QuizAttempt.insertMany(attempts);
  console.log('QuizAttempts seeded:', created.length);
  return created;
}

async function main() {
  const connectDB = async () => {
    try {
      const connectionInstance = await mongoose.connect(
        `${process.env.MONGODB_URI}/${DB_NAME}`
      );
  
      console.log(
        ` \n MongoDB connected! DB host: ${connectionInstance.connection.host}`
      );
    } catch (error) {
      console.log("MongoDB connection error", error);
      process.exit(1);
    }
  };
  connectDB();
  await clearCollections();
  const users = await seedUsers();
  const videos = await seedVideos(users);
  const quizzes = await seedQuizzes(videos);
  const posts = await seedPosts(users);
  const comments = await seedComments(users, videos);
  const playlists = await seedPlaylists(users, videos);
  await seedBookmarks(users, videos);
  await seedLikes(users, videos, comments, posts);
  await seedSubscriptions(users);
  await seedQuizAttempts(users, quizzes);
  await mongoose.disconnect();
  console.log('Seeding complete!');
}

main().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
}); 