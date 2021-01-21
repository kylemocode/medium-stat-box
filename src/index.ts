import axios, { AxiosResponse } from 'axios';
import { GistBox } from 'gist-box';
import table from 'text-table';
import cheerio from 'cheerio';

import { arrayFormater } from './utils';
require('dotenv').config();

const MEDIUM_API_BASE_URL =
  'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@';
const MEDIUM_PROFILE_BASE_URL = 'https://medium.com/@';

(async () => {
  const { GIST_ID, GH_PAT, MEDIUM_USER_NAME } = process.env;
  let apiResponse: AxiosResponse<any>;
  let followerCount;
  let slicedData;
  let articlesContent: unknown[][] = [];

  if (!GIST_ID || !GH_PAT || !MEDIUM_USER_NAME) return;

  // Get user's medium data
  try {
    apiResponse = await axios.get(MEDIUM_API_BASE_URL + MEDIUM_USER_NAME);
    slicedData = apiResponse.data.items.slice(0, 3);
    console.log(apiResponse);
  } catch (err) {
    console.error(err);
  }

  const res = await axios.get(MEDIUM_PROFILE_BASE_URL + MEDIUM_USER_NAME);
  const $ = cheerio.load(res.data);
  //@ts-ignore
  followerCount = $('a')['3'].children[0].data;

  slicedData.forEach(item => {
    articlesContent.push([item]);
  })

  const gistContent = table(
    arrayFormater([
      [`@${MEDIUM_USER_NAME}`, followerCount],
      [`${MEDIUM_PROFILE_BASE_URL}${MEDIUM_USER_NAME}`, ''],
      ...articlesContent as string[][],
    ]),
    { align: ['l', 'r'] }
  );

  const box = new GistBox({ id: GIST_ID, token: GH_PAT });

  try {
    await box.update({ filename: 'medium-stat.md', content: gistContent });
  } catch (err) {
    console.error(err);
  }
})();
