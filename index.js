const puppeteer = require('puppeteer');
const writePostsToFile = require('./utils/index');

const posts = [];
let page;

async function scrapPost(url) {
  await page.goto(url);

  const data = await page.evaluate(() => {
    let post = document.querySelector('div.single_post') || document.querySelector('div.article');
    const title = post && post.querySelector('h2').innerText;
    const paragraphs = post && post.querySelectorAll('p');

    if (!post || !title || !paragraphs) {
      console.log('No post with defined title or paragraphs found');
      return;
    }
    const result = Array.from(paragraphs, (p) => p.innerText.replace(/&bnsp;/gi, '').trim());

    return { title, paragraphs: result };
  });

  console.log({ POST: data });

  return data;
}

async function scrapBlogPosts({ url, query, pageLimit }) {
  const browser = await puppeteer.launch();
  page = await browser.newPage();

  let postUrls = [];

  for (let pageNum = 1; pageNum <= pageLimit; pageNum++) {
    await page.goto(`${url}/page/${pageNum}/?s=${query}`);

    const urls = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a.readmore[href]'), (a) => a.getAttribute('href'))
    );

    postUrls = [...postUrls, ...urls];
  }

  writePostsToFile('output/links.json', postUrls);

  for (let i = 0; i < postUrls.length; i++) {
    posts.push(await scrapPost(postUrls[i]));
  }

  await browser.close();

  writePostsToFile('output/posts.json', posts);
}

scrapBlogPosts({ url: 'https://www.mountargusparish.ie', query: 'ignatius', pageLimit: 24 });
