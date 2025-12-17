require("dotenv").config();
const fs = require("fs");
const { getJson } = require("serpapi");
const { parse } = require("json2csv");

// SERPAPI FETCH
async function fetchNews(keyword, year) {
  return new Promise((resolve) => {
    getJson({
      engine: "google_news",
      q: keyword,
      hl: "id",
      gl: "id",
      api_key: process.env.SERPAPI_KEY,
      tbs: `cdr:1,cd_min:01/01/${year},cd_max:12/31/${year}`
    }, (json) => {
      resolve(json.news_results || []);
    });
  });
}

// MAIN
(async () => {
  const keywords = [
// Isi Keywords
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
