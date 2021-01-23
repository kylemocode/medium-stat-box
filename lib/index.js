"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const gist_box_1 = require("gist-box");
const text_table_1 = tslib_1.__importDefault(require("text-table"));
const cheerio_1 = tslib_1.__importDefault(require("cheerio"));
require('dotenv').config();
const CLAPS_COUNT_REGEX = /\d+(\.\d{1,2})?K?\s?/;
const MAX_STR_LENGTH = 25;
const MEDIUM_API_BASE_URL = 'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@';
const MEDIUM_PROFILE_BASE_URL = 'https://medium.com/@';
(async () => {
    const { GIST_ID, GH_PAT, MEDIUM_USER_NAME } = process.env;
    let apiResponse;
    let followerCount;
    let slicedData;
    let articlesContent = [];
    if (!GIST_ID || !GH_PAT || !MEDIUM_USER_NAME)
        return;
    try {
        // Get user's medium data from rss API
        apiResponse = await axios_1.default.get(MEDIUM_API_BASE_URL + MEDIUM_USER_NAME);
        // Use cheerio to get articles' claps count
        slicedData = await Promise.all(apiResponse.data.items
            .filter(item => item.categories.length !== 0) // filter comment
            .slice(0, 3) // latest 3 articles
            .map(async (item) => {
            const res = await axios_1.default.get(item.guid);
            const $ = cheerio_1.default.load(res.data);
            const text = $('button').text();
            let matches = text.match(CLAPS_COUNT_REGEX);
            return { title: item.title, claps: matches ? matches[0] : '0' };
        }));
    }
    catch (err) {
        throw new Error('Get data failed');
    }
    // Get user's follower count
    const res = await axios_1.default.get(MEDIUM_PROFILE_BASE_URL + MEDIUM_USER_NAME);
    const $ = cheerio_1.default.load(res.data);
    followerCount = $('a')['3'].children[0].data;
    if (followerCount === 'About')
        followerCount = '0 follower';
    slicedData.forEach(item => {
        let trimTitle;
        if (item.title.length > MAX_STR_LENGTH)
            trimTitle = item.title.slice(0, MAX_STR_LENGTH) + '...';
        else
            trimTitle = item.title;
        articlesContent.push([trimTitle, `👏 ${item.claps}`]);
    });
    if (slicedData.length === 0) {
        articlesContent.push(['I have no posts in Medium currently...', '😢']);
    }
    const gistContent = text_table_1.default([
        [`@${MEDIUM_USER_NAME}`, followerCount],
        ['Latest Articles', '👇'],
        ...articlesContent,
    ], { align: ['l', 'r'], stringLength: () => 20 });
    const box = new gist_box_1.GistBox({ id: GIST_ID, token: GH_PAT });
    try {
        await box.update({ filename: 'medium-stat.md', content: gistContent });
    }
    catch (err) {
        throw new Error('Update gist failed');
    }
})();
