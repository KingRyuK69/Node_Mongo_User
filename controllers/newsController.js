const axios = require("axios");
const News = require("../models/newsModel");

exports.getNews = async (req, res) => {
  try {
    const { q, from, sortBy, apiKey } = req.query;
    const response = await axios.get(
      `https://newsapi.org/v2/everything?q=${q}&from=${from}&sortBy=${sortBy}&apiKey=${apiKey}`
    );
    const news = response.data.articles.map((article) => ({
      source: article.source,
      author: article.author,
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: new Date(article.publishedAt),
      content: article.content,
    }));
    await News.insertMany(news);
    res.status(200).json({
      status: "success",
      totalResults: response.data.totalResults,
      articles: news,
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};
