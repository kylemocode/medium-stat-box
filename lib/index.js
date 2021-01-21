"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const gist_box_1 = require("gist-box");
const text_table_1 = tslib_1.__importDefault(require("text-table"));
const cheerio_1 = tslib_1.__importDefault(require("cheerio"));
const utils_1 = require("./utils");
require('dotenv').config();
const MEDIUM_API_BASE_URL = 'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@';
const MEDIUM_PROFILE_BASE_URL = 'https://medium.com/@';
(async () => {
    const { GIST_ID, GH_PAT, MEDIUM_USER_NAME } = process.env;
    let apiResponse;
    let followerCount;
    if (!GIST_ID || !GH_PAT || !MEDIUM_USER_NAME)
        return;
    // Get user's medium data
    try {
        apiResponse = await axios_1.default.get(MEDIUM_API_BASE_URL + MEDIUM_USER_NAME);
        console.log(apiResponse);
    }
    catch (err) {
        console.error(err);
    }
    const res = await axios_1.default.get(MEDIUM_PROFILE_BASE_URL + MEDIUM_USER_NAME);
    const $ = cheerio_1.default.load(res.data);
    //@ts-ignore
    followerCount = $('a')['3'].children[0].data;
    console.log(followerCount);
    const gistContent = text_table_1.default(utils_1.arrayFormater([
        [`@${MEDIUM_USER_NAME}`, followerCount],
        ['post1', '2020-01-17'],
        ['post2', '2020-05-27'],
    ]), { align: ['l', 'r'] });
    const box = new gist_box_1.GistBox({ id: GIST_ID, token: GH_PAT });
    try {
        await box.update({ filename: 'latest-posts.md', content: gistContent });
    }
    catch (err) {
        console.error(err);
    }
})();
