var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");
var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));
// Handlebars
app.engine(
    "handlebars",
    exphbs({
        defaultLayout: "main"
    })
);
app.set("view engine", "handlebars");

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

//mongoose.connect("mongodb://localhost/mongoHeadlines", { useNewUrlParser: true });

// Routes
app.get("/", function (req, res) {
    // Pull the article details along with the comments on article
    db.Article.find({})
        .populate("comment")
        .then(function (results) {
            res.render("index", { articles: results })
        })
        .catch(function (err) {
            // If an error occurred, log it
            console.log(err);
        });
})
// A GET route for scraping the USA today website
app.get("/scrape", function (req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://www.usatoday.com/news/").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        // Now, we grab every gnt_m_flm_a class, and do the following:
        $(".gnt_m_flm_a").each(function (i, element) {
            // Save an empty result object
            var result = {};

            // Add the headline, summary and href of every link, and save them as properties of the result object
            result.headline = $(this)
                .text();
            result.summary = $(this)
                .attr("data-c-br");
            result.url = "https://www.usatoday.com" + $(this)
                .attr("href")

            console.log(result);

            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
                .then(function (dbArticle) {
                    // View the added result in the console
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    // If an error occurred, log it
                    console.log(err);
                });
        });
        // Send a message to the client
        res.send("completed");
        
    });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
    // This grabs all of the articles
    db.Article.find({})
        .then(function (data) {
            res.json(data)
        })
        .catch(function (err) {
            res.json(err)
        })
});

// Route for grabbing a specific Article by id, populate it with it's comment
app.get("/articles/:id", function (req, res) {
    db.Article.findOne({ _id: req.params.id })
        .populate("comment")
        .then(function (data) {
            res.json(data)
        })
        .catch(function (err) {
            res.json(err)
        })
});

// Route for saving/updating an Article's associated Comment
app.post("/articles/:id", function (req, res) {

    db.Comment.create(
        req.body
    ).then(function (data) {
        console.log(data)
        return db.Article.findOneAndUpdate({ _id: req.params.id },
            { $push: { comment: data._id } }, { new: true })
    })
        .then(function (data) {
            res.json(data)
        })
        .catch(function (err) {
            res.json(err)
        })
});

//Route for Deleting comment and update Article's associated Comment
app.delete("/articles/:id", function (req, res) {
    db.Comment.deleteOne({ _id: req.params.id })

        .then(function () {
          return  db.Article.findOneAndUpdate({ comment: req.params.id },
                { $pull: { comment: req.params.id } })
        })
        .then(function (data) {
            res.json(data)
        })
        .catch(function (err) {
            res.json(err)
        })
})

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});
