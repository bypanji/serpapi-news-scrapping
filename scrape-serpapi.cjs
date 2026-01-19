require("dotenv").config();
const fs = require("fs");
const { getJson } = require("serpapi");
const { parse } = require("json2csv");

// SERPAPI FETCH
async function fetchNews(keyword, year) {
  const allNews = [];
  const maxPages = 5;

  for (let page = 0; page < maxPages; page++) {
    await new Promise((resolve) => {
      getJson({
        engine: "google",
        q: `${keyword} after:${year}-01-01 before:${year}-12-31`,
        tbm: "nws",
        hl: "id",
        gl: "id",
        api_key: process.env.SERPAPI_KEY,
        start: page * 10
      }, (json) => {
        const news = json.news_results || [];
        allNews.push(...news);
        resolve();
      });
    });
  }

  return allNews;
}


// MAIN
(async () => {
  const keywords = [
// Isi Keywords
    "food estate"
  ];

  const years = Array.from({ length: 2025 - 2017 + 1 }, (_, i) => 2017 + i);
  const results = [];

  for (const year of years) {
    for (const keyword of keywords) {
      console.log(`Scraping: "${keyword}" (${year})`);

      const news = await fetchNews(keyword, year);

      for (const n of news) {
        const text = `${n.title || ""} ${n.snippet || ""}`;

        results.push({
          year,
          keyword,
          title: n.title,
          snippet: n.snippet,
          source: n.source,
          link: n.link,
          published: n.date,
        });
      }
    }
  }

  const csv = parse(results);
  fs.writeFileSync("serpapi_news.csv", csv);

  console.log("\nSELESAI → serpapi_news.csv");
})();
