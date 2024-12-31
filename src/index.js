const cheerio = require("cheerio");
const unirest = require("unirest");

const sheet_url =
  "https://script.google.com/macros/s/AKfycbxiZW7Bn6gvL7jw_xF_GBXZMEtdXty_Ee3Md7yYhP9PkiYbwxAL347Fn_wyaFd6nuaRKw/exec?gid=0";

const selectRandom = () => {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64)  AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
  ];
  var randomNumber = Math.floor(Math.random() * userAgents.length);
  return userAgents[randomNumber];
};

let user_agent = selectRandom();

async function getValue(URL) {
  const values = [];
  const organizedValues = [];

  const response = await unirest
    .get(URL)
    .headers({ Accept: "application/json", "User-Agent": user_agent })
    .then((response) => {
      const $ = cheerio.load(response.body);

      $("div.MjjYud").each((i, el) => {
        values[i] = $(el).extract({
          snippet_type_1: ".VwiC3b.yXK7lf.p4wth.r025kc.hJNv6b.Hdw6tb",
          snippet_type_2: ".fzUZNc",
          title: "h3.LC20lb.MBeuO.DKV0Md",
          link: {
            selector: "a[jsname='UWckNb']",
            value: "href",
          },
        });
      });

      for (let i = 0; i < values.length; i++) {
        organizedValues[i] = {
          title: values[i].title,
          link: values[i].link,
          snippet: !values[i].snippet_type_1
            ? values[i].snippet_type_2
            : values[i].snippet_type_1,
        };
      }
    });

  return organizedValues.filter((item) => item.title !== undefined);
}

function formatValue(data) {
  console.log(data);
  const snippets = data.map((item) => item.snippet);
  const emails = [];
  const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/g;

  snippets.forEach((item) => emails.push(item.match(emailRegex)));

  const flattedArray = emails.flat().filter(Boolean);
  flattedArray.map((email) => email.replace(/[.,]$/, ""));

  return flattedArray;
}

(async () => {
  const datas = await Promise.all(
    Array.from({ length: 10 }, async (_, i) => {
      const res = await getValue(
        `https://www.google.com/search?q=site%3Ainstagram.com+%22email%22+%28gmail.com%29&start=${i}`
      );
      return res;
    })
  );

  console.log(datas.flat()); // Combine all arrays into one if needed
})();


// formatValue(data);
